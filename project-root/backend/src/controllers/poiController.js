import { getCategoriesTree } from "../services/poiDataService.js";
import { getFilteredPois } from "../services/recommendationService.js";

export async function getPois(req, res) {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const pois = await getFilteredPois({
    category: req.query.category,
    subcategory: req.query.subcategory,
    q: req.query.q,
    minRating: req.query.minRating,
    neighborhoodZone: req.query.neighborhoodZone,
    limit,
  });

  res.json({
    items: pois,
    total: pois.length,
  });
}

export async function getCategories(_req, res) {
  const categories = await getCategoriesTree();

  res.json({
    items: categories,
    total: categories.length,
  });
}
