import re
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
INPUT_PATH = DATA_DIR / "pois_barcelona_procesados.parquet"
OUTPUT_PARQUET = DATA_DIR / "pois_barcelona_hibrido.parquet"
OUTPUT_CSV = DATA_DIR / "pois_barcelona_hibrido.csv"


def normalize_text(value):
    # Limpieza ligera para construir textos consistentes.
    if pd.isna(value):
        return ""

    text = str(value).strip().lower()
    text = re.sub(r"\s+", " ", text)
    return text


def min_max_scale(series, fill_value=0.0):
    # Normalizacion robusta para columnas numericas.
    data = pd.Series(series, copy=True)

    if data.notna().sum() == 0:
        return pd.Series(fill_value, index=data.index, dtype=float)

    min_value = data.min(skipna=True)
    max_value = data.max(skipna=True)

    if pd.isna(min_value) or pd.isna(max_value) or min_value == max_value:
        return pd.Series(fill_value, index=data.index, dtype=float)

    return ((data - min_value) / (max_value - min_value)).fillna(fill_value)


def build_content_text(row):
    # Texto base reutilizable para el recomendador hibrido.
    parts = [
        normalize_text(row.get("name")),
        normalize_text(row.get("category")),
        normalize_text(row.get("subcategory")),
        normalize_text(row.get("description")),
        normalize_text(row.get("tags_str")),
    ]

    return " ".join(part for part in parts if part).strip()


def main():
    # Cargamos el dataset procesado actual del proyecto.
    df = pd.read_parquet(INPUT_PATH)

    # Copiamos para mantener el original intacto.
    df_hybrid = df.copy()

    # Completamos variables utiles para el sistema hibrido final.
    df_hybrid["visit_duration_filled"] = df_hybrid["visit_duration"].fillna(45)
    df_hybrid["rating_filled"] = df_hybrid["rating"].fillna(df_hybrid["rating"].median())
    df_hybrid["match_confidence_filled"] = df_hybrid["match_confidence"].fillna(0)

    # Generamos un texto base estandarizado para el modulo de contenido.
    df_hybrid["content_base"] = df_hybrid.apply(build_content_text, axis=1)

    # Indicador explicito por si el texto fuera debil o incompleto.
    df_hybrid["content_length"] = df_hybrid["content_base"].str.len()
    df_hybrid["has_content_text"] = df_hybrid["content_length"] > 0

    # Reconstruimos cluster_geo siguiendo la decision del notebook de clustering.
    geo_mask = df_hybrid["latitude"].notna() & df_hybrid["longitude"].notna()
    geo_data = df_hybrid.loc[geo_mask, ["latitude", "longitude"]].copy()

    kmeans = KMeans(
        n_clusters=7,
        random_state=42,
        n_init=10,
    )
    cluster_labels = kmeans.fit_predict(geo_data)

    df_hybrid["cluster_geo"] = np.nan
    df_hybrid.loc[geo_mask, "cluster_geo"] = cluster_labels
    df_hybrid["cluster_geo"] = df_hybrid["cluster_geo"].astype("Int64")
    df_hybrid["has_cluster_geo"] = df_hybrid["cluster_geo"].notna()

    # Normalizamos senales utiles para combinacion posterior.
    df_hybrid["score_norm"] = min_max_scale(df_hybrid["score"].fillna(0))
    df_hybrid["rating_norm"] = min_max_scale(df_hybrid["rating_filled"])
    df_hybrid["match_confidence_norm"] = min_max_scale(df_hybrid["match_confidence_filled"])
    df_hybrid["visit_duration_norm"] = min_max_scale(df_hybrid["visit_duration_filled"])

    # Senal de calidad estatica para el sistema hibrido.
    df_hybrid["quality_signal"] = (
        0.60 * df_hybrid["score_norm"]
        + 0.25 * df_hybrid["rating_norm"]
        + 0.15 * df_hybrid["match_confidence_norm"]
    ).round(6)

    # Dejamos una columna reservada para la similitud dinamica que se calculara
    # cuando el usuario consulte un POI o exprese preferencias semanticas concretas.
    df_hybrid["similarity_score"] = np.nan

    # Reordenamos para dejar las columnas hibridas juntas y faciles de leer.
    hybrid_columns = [
        "content_base",
        "content_length",
        "has_content_text",
        "cluster_geo",
        "has_cluster_geo",
        "visit_duration_filled",
        "rating_filled",
        "match_confidence_filled",
        "score_norm",
        "rating_norm",
        "match_confidence_norm",
        "visit_duration_norm",
        "quality_signal",
        "similarity_score",
    ]

    base_columns = [col for col in df_hybrid.columns if col not in hybrid_columns]
    ordered_columns = base_columns + hybrid_columns
    df_hybrid = df_hybrid[ordered_columns]

    # Persistimos la base enriquecida para notebooks y backend futuro.
    df_hybrid.to_parquet(OUTPUT_PARQUET, index=False)
    df_hybrid.to_csv(OUTPUT_CSV, index=False, encoding="utf-8")

    print("Dataset hibrido creado correctamente.")
    print("Ruta parquet:", OUTPUT_PARQUET)
    print("Ruta csv:", OUTPUT_CSV)
    print("Shape:", df_hybrid.shape)
    print("Columnas nuevas:", hybrid_columns)


if __name__ == "__main__":
    main()
