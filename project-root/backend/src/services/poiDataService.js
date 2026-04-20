import fs from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { env } from "../config/env.js";
import { sanitizeText, toSlug } from "../utils/text.js";

let cachedPois = null;

function toNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value) {
  if (value === undefined || value === null || value === "") {
    return false;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value).toLowerCase() === "true";
}

function normalizePoi(row, index) {
  const category = sanitizeText(row.category);
  const subcategory = sanitizeText(row.subcategory);
  const latitude = toNumber(row.latitude ?? row.poi_latitude);
  const longitude = toNumber(row.longitude ?? row.poi_longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    id: sanitizeText(row.id) || `poi-${index + 1}`,
    name: sanitizeText(row.name || row.poi || `POI ${index + 1}`),
    category,
    categorySlug: toSlug(category),
    subcategory,
    subcategorySlug: toSlug(subcategory),
    description: sanitizeText(row.description || row.value_en || "No description available."),
    city: sanitizeText(row.city || "Barcelona"),
    latitude,
    longitude,
    rating: toNumber(row.rating),
    score: toNumber(row.score),
    visitDuration: toNumber(row.visit_duration),
    matchConfidence: toNumber(row.match_confidence),
    clusterGeo: toNumber(row.cluster_geo),
    tags: sanitizeText(row.tags_str || row.tags),
    openingHours: sanitizeText(row.opening_hours),
    openingHoursSource: sanitizeText(row.opening_hours_source),
    hasOpeningHours: toBoolean(row.has_opening_hours),
    is24_7: toBoolean(row.is_24_7),
    isLikelyOpen: toBoolean(row.is_likely_open),
    hasValidSource: toBoolean(row.has_valid_source),
  };
}

async function loadPoisFromCsv() {
  const fileContent = await fs.readFile(env.datasetPath, "utf8");
  const rows = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  return rows
    .map((row, index) => normalizePoi(row, index))
    .filter(Boolean);
}

export async function getAllPois() {
  if (!cachedPois) {
    cachedPois = await loadPoisFromCsv();
  }

  return cachedPois;
}

export async function getCategoriesTree() {
  const pois = await getAllPois();
  const categoriesMap = new Map();

  for (const poi of pois) {
    if (!poi.category) {
      continue;
    }

    if (!categoriesMap.has(poi.category)) {
      categoriesMap.set(poi.category, new Set());
    }

    if (poi.subcategory) {
      categoriesMap.get(poi.category).add(poi.subcategory);
    }
  }

  return [...categoriesMap.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, subcategories]) => ({
      category,
      subcategories: [...subcategories].sort((left, right) =>
        left.localeCompare(right),
      ),
    }));
}
