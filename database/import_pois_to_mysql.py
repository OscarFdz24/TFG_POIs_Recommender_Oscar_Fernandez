"""
Importa los POIs del dataset hibrido a MySQL.

Uso recomendado desde la raiz del proyecto:

    python database/import_pois_to_mysql.py

Configuracion recomendada:

    database/db_config.local.json

Variables de entorno opcionales. Si se definen, tienen prioridad sobre el JSON.

Si falta mysql-connector-python, el script intenta instalarlo automaticamente
en el entorno Python desde el que se ejecute.
"""

from __future__ import annotations

import argparse
import getpass
import json
import math
import os
import subprocess
import sys
from pathlib import Path


def ensure_mysql_connector():
    try:
        import mysql.connector  # noqa: F401
        return
    except ImportError:
        print("No se encontro mysql-connector-python. Instalando...")

    subprocess.check_call([
        sys.executable,
        "-m",
        "pip",
        "install",
        "mysql-connector-python",
    ])


import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATABASE_DIR = Path(__file__).resolve().parent
DEFAULT_DATASET_PATH = PROJECT_ROOT / "data" / "pois_barcelona_hibrido.parquet"
DEFAULT_CSV_DATASET_PATH = PROJECT_ROOT / "data" / "pois_barcelona_hibrido.csv"
LOCAL_CONFIG_PATH = DATABASE_DIR / "db_config.local.json"

PASSWORD_PLACEHOLDERS = {
    "",
    "TU_PASSWORD_LOCAL",
    "CAMBIA_ESTA_PASSWORD",
}

CLUSTER_ZONE_LABELS = {
    0: "Norte verde y miradores",
    1: "Centro historico",
    2: "Oeste y zona alta",
    3: "Eixample y Gracia",
    4: "Norte urbano",
    5: "Montjuic y sur",
    6: "Este litoral y Poblenou",
}


def clean_value(value):
    if value is None:
        return None

    if isinstance(value, dict):
        return {key: clean_value(item) for key, item in value.items()}

    if isinstance(value, (list, tuple, set)):
        return [clean_value(item) for item in value]

    # Algunas columnas del parquet pueden venir como arrays de numpy/listas.
    # Para guardarlas en raw_data JSON las convertimos a estructuras Python.
    if hasattr(value, "tolist") and not isinstance(value, (str, bytes)):
        value = value.tolist()
        if isinstance(value, (list, tuple, set)):
            return [clean_value(item) for item in value]
        if isinstance(value, dict):
            return {key: clean_value(item) for key, item in value.items()}

    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass

    if hasattr(value, "item"):
        try:
            value = value.item()
        except ValueError:
            return value

    if isinstance(value, float) and not math.isfinite(value):
        return None

    return value


def to_int(value):
    value = clean_value(value)
    if value is None:
        return None
    return int(value)


def to_float(value):
    value = clean_value(value)
    if value is None:
        return None
    return float(value)


def to_text(value):
    value = clean_value(value)
    if value is None:
        return None
    return str(value)


def row_to_json(row):
    data = {}
    for key, value in row.items():
        value = clean_value(value)
        if hasattr(value, "isoformat"):
            value = value.isoformat()
        data[key] = value
    return json.dumps(data, ensure_ascii=False)


def load_local_config():
    if not LOCAL_CONFIG_PATH.exists():
        return {}

    with LOCAL_CONFIG_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def get_mysql_config():
    config = {
        "host": "localhost",
        "port": 3306,
        "database": "pois_recommender_bcn",
        "user": "root",
        "password": "",
    }

    # Primero se carga la configuracion local del proyecto. Es la forma mas
    # sencilla para trabajar con MySQL Workbench durante el TFM.
    config.update(load_local_config())

    # Las variables de entorno quedan como alternativa si algun dia se quiere
    # ejecutar el script en otro equipo, servidor o entorno mas automatizado.
    config["host"] = os.getenv("MYSQL_HOST", str(config["host"]))
    config["port"] = int(os.getenv("MYSQL_PORT", str(config["port"])))
    config["database"] = os.getenv("MYSQL_DATABASE", str(config["database"]))
    config["user"] = os.getenv("MYSQL_USER", str(config["user"]))
    config["password"] = os.getenv("MYSQL_PASSWORD", str(config["password"]))

    if config["password"] in PASSWORD_PLACEHOLDERS:
        config["password"] = getpass.getpass(
            "Password MySQL no configurado en database/db_config.local.json. "
            "Introduce password MySQL: "
        )

    return {
        "host": config["host"],
        "port": config["port"],
        "database": config["database"],
        "user": config["user"],
        "password": config["password"],
        "charset": "utf8mb4",
        "use_unicode": True,
    }


def build_poi_record(row):
    cluster_geo = to_int(row.get("cluster_geo"))

    return {
        "poi_source_id": to_text(row.get("id")),
        "name": to_text(row.get("name")) or "POI sin nombre",
        "category": to_text(row.get("category")),
        "subcategory": to_text(row.get("subcategory")),
        "city": to_text(row.get("city")) or "Barcelona",
        "description": to_text(row.get("description")),
        "latitude": to_float(row.get("latitude")),
        "longitude": to_float(row.get("longitude")),
        "rating": to_float(row.get("rating_filled", row.get("rating"))),
        "score": to_float(row.get("score")),
        "visit_duration_minutes": to_int(row.get("visit_duration_filled", row.get("visit_duration"))),
        "match_confidence": to_float(row.get("match_confidence_filled", row.get("match_confidence"))),
        "cluster_geo": cluster_geo,
        "city_area": CLUSTER_ZONE_LABELS.get(cluster_geo),
        "tags": to_text(row.get("tags_str")),
        "quality_signal": to_float(row.get("quality_signal")),
        "content_base": to_text(row.get("content_base")),
        "raw_data": row_to_json(row),
    }


def read_hybrid_dataset(dataset_path: Path):
    if dataset_path.suffix.lower() == ".parquet":
        try:
            return pd.read_parquet(dataset_path)
        except ImportError:
            if DEFAULT_CSV_DATASET_PATH.exists():
                print(
                    "No se puede leer parquet en este entorno Python. "
                    f"Usando CSV alternativo: {DEFAULT_CSV_DATASET_PATH}"
                )
                return pd.read_csv(DEFAULT_CSV_DATASET_PATH)
            raise

    return pd.read_csv(dataset_path)


def import_pois(dataset_path: Path, limit: int | None = None, dry_run: bool = False):
    if not dataset_path.exists():
        raise FileNotFoundError(f"No se encontro el dataset: {dataset_path}")

    df = read_hybrid_dataset(dataset_path)

    if limit:
        df = df.head(limit)

    records = []
    skipped = 0

    for _, row in df.iterrows():
        record = build_poi_record(row)
        if not record["poi_source_id"] or record["latitude"] is None or record["longitude"] is None:
            skipped += 1
            continue
        records.append(record)

    print(f"POIs leidos: {len(df)}")
    print(f"POIs preparados para importar: {len(records)}")
    print(f"POIs omitidos por falta de id/coordenadas: {skipped}")

    if dry_run:
        print("Modo dry-run activo. No se insertan datos.")
        if records:
            print("Ejemplo de registro:")
            print(json.dumps(records[0], ensure_ascii=False, indent=2))
        return

    sql = """
        INSERT INTO pois (
          poi_source_id,
          name,
          category,
          subcategory,
          city,
          description,
          latitude,
          longitude,
          rating,
          score,
          visit_duration_minutes,
          match_confidence,
          cluster_geo,
          city_area,
          tags,
          quality_signal,
          content_base,
          raw_data
        )
        VALUES (
          %(poi_source_id)s,
          %(name)s,
          %(category)s,
          %(subcategory)s,
          %(city)s,
          %(description)s,
          %(latitude)s,
          %(longitude)s,
          %(rating)s,
          %(score)s,
          %(visit_duration_minutes)s,
          %(match_confidence)s,
          %(cluster_geo)s,
          %(city_area)s,
          %(tags)s,
          %(quality_signal)s,
          %(content_base)s,
          CAST(%(raw_data)s AS JSON)
        )
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          category = VALUES(category),
          subcategory = VALUES(subcategory),
          city = VALUES(city),
          description = VALUES(description),
          latitude = VALUES(latitude),
          longitude = VALUES(longitude),
          rating = VALUES(rating),
          score = VALUES(score),
          visit_duration_minutes = VALUES(visit_duration_minutes),
          match_confidence = VALUES(match_confidence),
          cluster_geo = VALUES(cluster_geo),
          city_area = VALUES(city_area),
          tags = VALUES(tags),
          quality_signal = VALUES(quality_signal),
          content_base = VALUES(content_base),
          raw_data = VALUES(raw_data),
          updated_at = CURRENT_TIMESTAMP
    """

    ensure_mysql_connector()
    import mysql.connector

    connection = mysql.connector.connect(**get_mysql_config())
    try:
        cursor = connection.cursor()
        cursor.executemany(sql, records)
        connection.commit()
        print(f"Importacion completada. Filas afectadas: {cursor.rowcount}")
    finally:
        try:
            cursor.close()
        except UnboundLocalError:
            pass
        connection.close()


def parse_args():
    parser = argparse.ArgumentParser(description="Importar POIs hibridos a MySQL.")
    parser.add_argument(
        "--dataset",
        default=str(DEFAULT_DATASET_PATH),
        help="Ruta al dataset parquet hibrido.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Importa solo los N primeros POIs. Util para pruebas.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Lee y prepara datos, pero no inserta en MySQL.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    import_pois(
        dataset_path=Path(args.dataset),
        limit=args.limit,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
