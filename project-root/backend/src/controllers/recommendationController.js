import { recommendRoute } from "../services/recommendationService.js";

export async function postRecommendRoute(req, res) {
  const result = await recommendRoute(req.body || {});
  res.json(result);
}
