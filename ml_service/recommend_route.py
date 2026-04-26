import json
import math
import sys
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = PROJECT_ROOT / "data" / "pois_barcelona_hibrido.parquet"

DEFAULT_CANDIDATE_WEIGHTS = {
    "quality": 0.45,
    "similarity": 0.35,
    "proximity": 0.20,
}

DEFAULT_ROUTE_WEIGHTS = {
    "candidate_score": 0.55,
    "proximity": 0.30,
    "cluster": 0.10,
    "duration_penalty": 0.05,
}


def haversine_km(lat1, lon1, lat2, lon2):
    radius_km = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )

    return 2 * radius_km * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def min_max_normalize(series, fill_value=0.0):
    data = pd.Series(series, copy=True)

    if data.notna().sum() == 0:
        return pd.Series(fill_value, index=data.index, dtype=float)

    min_value = data.min(skipna=True)
    max_value = data.max(skipna=True)

    if pd.isna(min_value) or pd.isna(max_value) or min_value == max_value:
        return pd.Series(fill_value, index=data.index, dtype=float)

    return ((data - min_value) / (max_value - min_value)).fillna(fill_value)


def clean_list(values):
    if not isinstance(values, list):
        return []

    return [str(value).strip() for value in values if str(value).strip()]


def to_float(value, fallback):
    try:
        parsed = float(value)
        if math.isfinite(parsed):
            return parsed
    except (TypeError, ValueError):
        pass

    return fallback


def to_int(value, fallback):
    try:
        parsed = int(value)
        return parsed
    except (TypeError, ValueError):
        return fallback


def normalize_preferences(payload):
    start_location = payload.get("startLocation") or {}
    max_distance_km = max(1.0, min(to_float(payload.get("maxDistanceKm"), 6.0), 30.0))

    return {
        "start_lat": to_float(start_location.get("lat"), None),
        "start_lon": to_float(start_location.get("lng"), None),
        "categories": clean_list(payload.get("categories")),
        "subcategories": clean_list(payload.get("subcategories")),
        "query_text": str(payload.get("queryText") or "").strip(),
        "reference_poi_name": str(payload.get("referencePoiName") or "").strip() or None,
        "min_rating": max(0.0, min(to_float(payload.get("minRating"), 0.0), 5.0)),
        "max_distance_km": max_distance_km,
        "max_pois": max(1, min(to_int(payload.get("maxPois"), 6), 12)),
        "max_time_minutes": max(30.0, min(to_float(payload.get("availableTimeMinutes"), 240.0), 720.0)),
        "max_leg_distance_km": max(0.5, min(to_float(payload.get("maxLegDistanceKm"), 2.5), max_distance_km)),
        "top_k_candidates": max(10, min(to_int(payload.get("topKCandidates"), 30), 100)),
        "use_cluster_coherence": bool(payload.get("useClusterCoherence", True)),
        "candidate_weights": payload.get("candidateWeights") or DEFAULT_CANDIDATE_WEIGHTS,
        "route_weights": payload.get("routeWeights") or DEFAULT_ROUTE_WEIGHTS,
    }


def build_query_text(preferences):
    parts = []

    if preferences.get("query_text"):
        parts.append(preferences["query_text"])

    parts.extend(preferences.get("categories") or [])
    parts.extend(preferences.get("subcategories") or [])

    return " ".join(str(part).strip() for part in parts if str(part).strip())


def calculate_similarity(preferences, df, tfidf_matrix, vectorizer, indices):
    similarity_score = pd.Series(0.0, index=df.index, dtype=float)
    reference_poi_name = preferences.get("reference_poi_name")

    if reference_poi_name:
        if reference_poi_name not in indices:
            raise ValueError(f"El POI de referencia '{reference_poi_name}' no existe en el dataset.")

        idx = indices[reference_poi_name]
        values = cosine_similarity(tfidf_matrix[idx], tfidf_matrix).flatten()
        similarity_score = pd.Series(values, index=df.index)
        similarity_score.loc[idx] = 0.0
        return similarity_score

    query_text = build_query_text(preferences)
    if query_text:
        query_vector = vectorizer.transform([query_text])
        similarity_score = pd.Series(
            cosine_similarity(query_vector, tfidf_matrix).flatten(),
            index=df.index,
        )

    return similarity_score


def build_hybrid_candidates(df, preferences, tfidf_matrix, vectorizer, indices):
    candidates = df.copy()
    candidates["similarity_score"] = calculate_similarity(
        preferences,
        candidates,
        tfidf_matrix,
        vectorizer,
        indices,
    )

    categories = preferences.get("categories") or []
    subcategories = preferences.get("subcategories") or []

    if categories:
        candidates = candidates[candidates["category"].isin(categories)]

    if subcategories:
        candidates = candidates[candidates["subcategory"].isin(subcategories)]

    candidates = candidates[candidates["rating"].fillna(0) >= preferences["min_rating"]].copy()

    start_lat = preferences["start_lat"]
    start_lon = preferences["start_lon"]
    candidates["distance_from_start_km"] = candidates.apply(
        lambda row: haversine_km(start_lat, start_lon, row["latitude"], row["longitude"]),
        axis=1,
    )

    candidates = candidates[
        candidates["distance_from_start_km"] <= preferences["max_distance_km"]
    ].copy()

    candidates["similarity_norm"] = min_max_normalize(candidates["similarity_score"])
    candidates["quality_norm"] = min_max_normalize(candidates["quality_signal"])
    candidates["start_proximity_norm"] = 1 - min_max_normalize(candidates["distance_from_start_km"])

    weights = {**DEFAULT_CANDIDATE_WEIGHTS, **(preferences.get("candidate_weights") or {})}
    candidates["hybrid_candidate_score"] = (
        weights["quality"] * candidates["quality_norm"]
        + weights["similarity"] * candidates["similarity_norm"]
        + weights["proximity"] * candidates["start_proximity_norm"]
    )

    return (
        candidates.sort_values("hybrid_candidate_score", ascending=False)
        .head(preferences["top_k_candidates"])
        .reset_index(drop=True)
    )


def score_next_pois(candidates, current_point, start_point, current_cluster, preferences):
    scored = candidates.copy()
    scored["distance_from_current_km"] = scored.apply(
        lambda row: haversine_km(
            current_point["lat"],
            current_point["lon"],
            row["latitude"],
            row["longitude"],
        ),
        axis=1,
    )
    scored["return_to_start_km"] = scored.apply(
        lambda row: haversine_km(
            row["latitude"],
            row["longitude"],
            start_point["lat"],
            start_point["lon"],
        ),
        axis=1,
    )

    scored["candidate_norm"] = min_max_normalize(scored["hybrid_candidate_score"])
    scored["proximity_norm"] = 1 - min_max_normalize(scored["distance_from_current_km"])
    scored["duration_penalty"] = min_max_normalize(scored["visit_duration_filled"])

    if preferences.get("use_cluster_coherence", True) and current_cluster is not None:
        scored["cluster_bonus"] = (scored["cluster_geo"] == current_cluster).astype(float)
    else:
        scored["cluster_bonus"] = 0.0

    weights = {**DEFAULT_ROUTE_WEIGHTS, **(preferences.get("route_weights") or {})}
    scored["route_utility"] = (
        weights["candidate_score"] * scored["candidate_norm"]
        + weights["proximity"] * scored["proximity_norm"]
        + weights["cluster"] * scored["cluster_bonus"]
        - weights["duration_penalty"] * scored["duration_penalty"]
    )

    return scored.sort_values("route_utility", ascending=False)


def build_hybrid_route(candidates, preferences):
    start_point = {"lat": preferences["start_lat"], "lon": preferences["start_lon"]}
    current_point = start_point.copy()
    current_cluster = None

    remaining = candidates.copy()
    route_rows = []
    total_distance_km = 0.0
    total_visit_minutes = 0.0

    while len(route_rows) < preferences["max_pois"] and not remaining.empty:
        ranked = score_next_pois(
            remaining,
            current_point,
            start_point,
            current_cluster,
            preferences,
        )

        next_poi = None
        for _, candidate in ranked.iterrows():
            leg_distance_km = candidate["distance_from_current_km"]
            projected_total_distance = (
                total_distance_km + leg_distance_km + candidate["return_to_start_km"]
            )
            projected_total_time = total_visit_minutes + candidate["visit_duration_filled"]

            if leg_distance_km > preferences["max_leg_distance_km"]:
                continue

            if projected_total_distance > preferences["max_distance_km"]:
                continue

            if projected_total_time > preferences["max_time_minutes"]:
                continue

            next_poi = candidate.copy()
            break

        if next_poi is None:
            break

        total_distance_km += next_poi["distance_from_current_km"]
        total_visit_minutes += next_poi["visit_duration_filled"]

        next_poi["route_position"] = len(route_rows) + 1
        next_poi["distance_from_previous_km"] = next_poi["distance_from_current_km"]
        next_poi["distance_accumulated_km"] = total_distance_km
        next_poi["time_accumulated_min"] = total_visit_minutes

        route_rows.append(next_poi)
        current_point = {"lat": next_poi["latitude"], "lon": next_poi["longitude"]}
        current_cluster = next_poi["cluster_geo"]
        remaining = remaining[remaining["id"] != next_poi["id"]].copy()

    route_df = pd.DataFrame(route_rows)

    if route_df.empty:
        return route_df, {
            "total_pois": 0,
            "distance_without_return_km": 0.0,
            "return_to_start_km": 0.0,
            "distance_with_return_km": 0.0,
            "total_visit_minutes": 0.0,
            "avg_candidate_score": 0.0,
            "avg_similarity_score": 0.0,
        }

    return_to_start_km = haversine_km(
        current_point["lat"],
        current_point["lon"],
        start_point["lat"],
        start_point["lon"],
    )

    return route_df, {
        "total_pois": int(len(route_df)),
        "distance_without_return_km": round(float(route_df["distance_from_previous_km"].sum()), 2),
        "return_to_start_km": round(float(return_to_start_km), 2),
        "distance_with_return_km": round(
            float(route_df["distance_from_previous_km"].sum() + return_to_start_km),
            2,
        ),
        "total_visit_minutes": round(float(route_df["visit_duration_filled"].sum()), 1),
        "avg_candidate_score": round(float(route_df["hybrid_candidate_score"].mean()), 4),
        "avg_similarity_score": round(float(route_df["similarity_score"].mean()), 4),
    }


def finite_or_none(value):
    if value is None or pd.isna(value):
        return None

    if isinstance(value, float) and not math.isfinite(value):
        return None

    return value


def row_to_poi(row, route_position=None):
    poi = {
        "id": str(row.get("id", "")),
        "name": finite_or_none(row.get("name")),
        "category": finite_or_none(row.get("category")),
        "subcategory": finite_or_none(row.get("subcategory")),
        "description": finite_or_none(row.get("description")) or "No description available.",
        "city": finite_or_none(row.get("city")) or "Barcelona",
        "latitude": finite_or_none(row.get("latitude")),
        "longitude": finite_or_none(row.get("longitude")),
        "rating": finite_or_none(row.get("rating_filled", row.get("rating"))),
        "score": finite_or_none(row.get("score")),
        "visitDuration": finite_or_none(row.get("visit_duration_filled", row.get("visit_duration"))),
        "matchConfidence": finite_or_none(row.get("match_confidence_filled", row.get("match_confidence"))),
        "clusterGeo": finite_or_none(row.get("cluster_geo")),
        "tags": finite_or_none(row.get("tags_str")),
        "distanceFromStartKm": round(float(row.get("distance_from_start_km", 0.0)), 3),
        "similarityScore": round(float(row.get("similarity_score", 0.0)), 6),
        "qualitySignal": round(float(row.get("quality_signal", 0.0)), 6),
        "hybridCandidateScore": round(float(row.get("hybrid_candidate_score", 0.0)), 6),
    }

    if route_position is not None:
        poi.update(
            {
                "routePosition": int(route_position),
                "routeUtility": round(float(row.get("route_utility", 0.0)), 6),
                "distanceFromPreviousKm": round(float(row.get("distance_from_previous_km", 0.0)), 3),
                "distanceAccumulatedKm": round(float(row.get("distance_accumulated_km", 0.0)), 3),
                "timeAccumulatedMin": round(float(row.get("time_accumulated_min", 0.0)), 1),
            }
        )

    return poi


def build_notes(preferences, candidates, route_df):
    notes = [
        "Sistema hibrido: TF-IDF, calidad del POI, proximidad y coherencia geografica.",
        "Candidatos filtrados por preferencias y ordenados por hybrid_candidate_score.",
        "Ruta construida con heuristica greedy y restricciones de distancia, tiempo y tramo maximo.",
    ]

    if len(route_df) < preferences["max_pois"]:
        notes.append(
            f"Se solicitaron {preferences['max_pois']} POIs, pero {len(route_df)} cumplen las restricciones actuales."
        )

    if candidates.empty:
        notes.append("No quedaron candidatos tras aplicar filtros de categoria, rating y distancia.")

    return notes


def run_recommendation(payload):
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            "No se encontro data/pois_barcelona_hibrido.parquet. Ejecuta src/build_hybrid_dataset.py."
        )

    preferences = normalize_preferences(payload)
    if preferences["start_lat"] is None or preferences["start_lon"] is None:
        raise ValueError("Invalid start location.")

    df = pd.read_parquet(DATASET_PATH)
    df["content_base"] = df["content_base"].fillna("").astype(str)

    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(df["content_base"])
    indices = pd.Series(df.index, index=df["name"]).drop_duplicates()

    candidates = build_hybrid_candidates(df, preferences, tfidf_matrix, vectorizer, indices)
    route_df, route_summary = build_hybrid_route(candidates, preferences)

    route = [
        row_to_poi(row, route_position=row.get("route_position"))
        for _, row in route_df.iterrows()
    ]
    candidate_items = [row_to_poi(row) for _, row in candidates.head(20).iterrows()]

    return {
        "preferences": {
            "startLocation": {
                "lat": preferences["start_lat"],
                "lng": preferences["start_lon"],
            },
            "categories": preferences["categories"],
            "subcategories": preferences["subcategories"],
            "queryText": preferences["query_text"],
            "minRating": preferences["min_rating"],
            "maxPois": preferences["max_pois"],
            "maxDistanceKm": preferences["max_distance_km"],
            "availableTimeMinutes": preferences["max_time_minutes"],
            "maxLegDistanceKm": preferences["max_leg_distance_km"],
        },
        "candidates": candidate_items,
        "route": route,
        "summary": {
            "totalPois": route_summary["total_pois"],
            "totalDistanceKm": route_summary["distance_with_return_km"],
            "distanceWithoutReturnKm": route_summary["distance_without_return_km"],
            "totalVisitMinutes": route_summary["total_visit_minutes"],
            "returnToStartKm": route_summary["return_to_start_km"],
            "avgCandidateScore": route_summary["avg_candidate_score"],
            "avgSimilarityScore": route_summary["avg_similarity_score"],
            "candidatePool": int(len(candidates)),
            "requestedPois": preferences["max_pois"],
        },
        "meta": {
            "mode": "python-hybrid-recommender",
            "dataset": "pois_barcelona_hibrido.parquet",
            "methodology": "tfidf_quality_proximity_cluster_greedy",
            "notes": build_notes(preferences, candidates, route_df),
        },
    }


def main():
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        result = run_recommendation(payload)
        print(json.dumps(result, ensure_ascii=False, allow_nan=False))
    except Exception as exc:
        error_payload = {
            "error": {
                "message": str(exc),
                "type": exc.__class__.__name__,
            }
        }
        print(json.dumps(error_payload, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()
