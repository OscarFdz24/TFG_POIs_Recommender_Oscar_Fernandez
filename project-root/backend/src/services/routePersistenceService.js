import { randomUUID } from "node:crypto";
import { getDbPool, withTransaction } from "./db.js";

function toJson(value) {
  return JSON.stringify(value ?? null);
}

function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function intOrNull(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function getRecommendationFromBody(body) {
  return body.recommendation || body.result || body;
}

function getStartLocation(recommendation) {
  const startLocation = recommendation.preferences?.startLocation;
  const lat = numberOrNull(startLocation?.lat);
  const lng = numberOrNull(startLocation?.lng);

  if (lat === null || lng === null) {
    const error = new Error("No se puede guardar la ruta porque falta la ubicacion inicial.");
    error.statusCode = 400;
    throw error;
  }

  return { lat, lng };
}

function validateRecommendation(recommendation) {
  if (!recommendation || typeof recommendation !== "object") {
    const error = new Error("No se ha recibido una ruta valida para guardar.");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(recommendation.route) || recommendation.route.length === 0) {
    const error = new Error("No se puede guardar una ruta sin POIs.");
    error.statusCode = 400;
    throw error;
  }
}

function buildRouteName(body, recommendation) {
  if (body.name && String(body.name).trim()) {
    return String(body.name).trim();
  }

  const totalPois = recommendation.summary?.totalPois || recommendation.route?.length || 0;
  return `Ruta Barcelona - ${totalPois} POIs`;
}

async function insertRoutePois(connection, routeId, route) {
  const sql = `
    INSERT INTO route_pois (
      route_id,
      poi_id,
      poi_source_id,
      route_position,
      name_snapshot,
      category_snapshot,
      subcategory_snapshot,
      latitude_snapshot,
      longitude_snapshot,
      visit_duration_minutes,
      distance_from_start_km,
      distance_from_previous_km,
      hybrid_candidate_score,
      similarity_score,
      quality_signal,
      route_utility,
      poi_data_json
    )
    VALUES (
      :routeId,
      (SELECT id FROM pois WHERE poi_source_id = :poiSourceId LIMIT 1),
      :poiSourceId,
      :routePosition,
      :name,
      :category,
      :subcategory,
      :latitude,
      :longitude,
      :visitDurationMinutes,
      :distanceFromStartKm,
      :distanceFromPreviousKm,
      :hybridCandidateScore,
      :similarityScore,
      :qualitySignal,
      :routeUtility,
      CAST(:poiDataJson AS JSON)
    )
  `;

  for (const [index, poi] of route.entries()) {
    const poiSourceId = String(poi.id ?? poi.poiSourceId ?? "");

    if (!poiSourceId) {
      continue;
    }

    await connection.execute(sql, {
      routeId,
      poiSourceId,
      routePosition: intOrNull(poi.routePosition) || index + 1,
      name: poi.name || "POI sin nombre",
      category: poi.category || null,
      subcategory: poi.subcategory || null,
      latitude: numberOrNull(poi.latitude),
      longitude: numberOrNull(poi.longitude),
      visitDurationMinutes: numberOrNull(poi.visitDuration),
      distanceFromStartKm: numberOrNull(poi.distanceFromStartKm),
      distanceFromPreviousKm: numberOrNull(poi.distanceFromPreviousKm),
      hybridCandidateScore: numberOrNull(poi.hybridCandidateScore),
      similarityScore: numberOrNull(poi.similarityScore),
      qualitySignal: numberOrNull(poi.qualitySignal),
      routeUtility: numberOrNull(poi.routeUtility),
      poiDataJson: toJson(poi),
    });
  }
}

export async function saveGeneratedRoute(body) {
  const recommendation = getRecommendationFromBody(body || {});
  validateRecommendation(recommendation);

  const publicId = randomUUID();
  const startLocation = getStartLocation(recommendation);
  const summary = recommendation.summary || {};
  const meta = recommendation.meta || {};
  const navigation = body.navigation || recommendation.navigation || null;
  const totalTravelMinutes = numberOrNull(
    navigation?.durationMinutes || summary.totalTravelMinutes,
  );
  const totalVisitMinutes = numberOrNull(summary.totalVisitMinutes);
  const totalExperienceMinutes =
    totalVisitMinutes !== null && totalTravelMinutes !== null
      ? totalVisitMinutes + totalTravelMinutes
      : null;

  return withTransaction(async (connection) => {
    const [routeResult] = await connection.execute(
      `
        INSERT INTO routes (
          public_id,
          name,
          status,
          generation_mode,
          created_by_user_id,
          assigned_to_user_id,
          client_id,
          start_latitude,
          start_longitude,
          total_pois,
          requested_pois,
          total_distance_km,
          total_visit_minutes,
          total_travel_minutes,
          total_experience_minutes,
          avg_candidate_score,
          avg_similarity_score,
          preferences_json,
          summary_json,
          route_json,
          navigation_json,
          model_meta_json
        )
        VALUES (
          :publicId,
          :name,
          'generated',
          :generationMode,
          :createdByUserId,
          :assignedToUserId,
          :clientId,
          :startLatitude,
          :startLongitude,
          :totalPois,
          :requestedPois,
          :totalDistanceKm,
          :totalVisitMinutes,
          :totalTravelMinutes,
          :totalExperienceMinutes,
          :avgCandidateScore,
          :avgSimilarityScore,
          CAST(:preferencesJson AS JSON),
          CAST(:summaryJson AS JSON),
          CAST(:routeJson AS JSON),
          CAST(:navigationJson AS JSON),
          CAST(:modelMetaJson AS JSON)
        )
      `,
      {
        publicId,
        name: buildRouteName(body, recommendation),
        generationMode: meta.mode || "python-hybrid-recommender",
        createdByUserId: intOrNull(body.createdByUserId),
        assignedToUserId: intOrNull(body.assignedToUserId),
        clientId: intOrNull(body.clientId),
        startLatitude: startLocation.lat,
        startLongitude: startLocation.lng,
        totalPois: intOrNull(summary.totalPois) || recommendation.route.length,
        requestedPois: intOrNull(summary.requestedPois || recommendation.preferences?.maxPois),
        totalDistanceKm: numberOrNull(summary.totalDistanceKm),
        totalVisitMinutes,
        totalTravelMinutes,
        totalExperienceMinutes,
        avgCandidateScore: numberOrNull(summary.avgCandidateScore),
        avgSimilarityScore: numberOrNull(summary.avgSimilarityScore),
        preferencesJson: toJson(recommendation.preferences || {}),
        summaryJson: toJson(summary),
        routeJson: toJson(recommendation),
        navigationJson: toJson(navigation),
        modelMetaJson: toJson(meta),
      },
    );

    const routeId = routeResult.insertId;
    await insertRoutePois(connection, routeId, recommendation.route);

    return {
      publicId,
      routeId,
      totalPois: recommendation.route.length,
      message: "Ruta guardada correctamente.",
    };
  });
}

export async function getSavedRoute(publicId) {
  const pool = getDbPool();

  const [routes] = await pool.execute(
    `
      SELECT
        id,
        public_id AS publicId,
        name,
        status,
        generation_mode AS generationMode,
        start_latitude AS startLatitude,
        start_longitude AS startLongitude,
        total_pois AS totalPois,
        requested_pois AS requestedPois,
        total_distance_km AS totalDistanceKm,
        total_visit_minutes AS totalVisitMinutes,
        total_travel_minutes AS totalTravelMinutes,
        total_experience_minutes AS totalExperienceMinutes,
        avg_candidate_score AS avgCandidateScore,
        avg_similarity_score AS avgSimilarityScore,
        preferences_json AS preferences,
        summary_json AS summary,
        route_json AS recommendation,
        navigation_json AS navigation,
        model_meta_json AS meta,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM routes
      WHERE public_id = :publicId
      LIMIT 1
    `,
    { publicId },
  );

  if (!routes.length) {
    const error = new Error("Ruta guardada no encontrada.");
    error.statusCode = 404;
    throw error;
  }

  const savedRoute = routes[0];
  const [pois] = await pool.execute(
    `
      SELECT
        poi_source_id AS poiSourceId,
        route_position AS routePosition,
        name_snapshot AS name,
        category_snapshot AS category,
        subcategory_snapshot AS subcategory,
        latitude_snapshot AS latitude,
        longitude_snapshot AS longitude,
        visit_duration_minutes AS visitDurationMinutes,
        distance_from_start_km AS distanceFromStartKm,
        distance_from_previous_km AS distanceFromPreviousKm,
        hybrid_candidate_score AS hybridCandidateScore,
        similarity_score AS similarityScore,
        quality_signal AS qualitySignal,
        route_utility AS routeUtility,
        poi_data_json AS poiData
      FROM route_pois
      WHERE route_id = :routeId
      ORDER BY route_position ASC
    `,
    { routeId: savedRoute.id },
  );

  return {
    ...savedRoute,
    pois,
  };
}
