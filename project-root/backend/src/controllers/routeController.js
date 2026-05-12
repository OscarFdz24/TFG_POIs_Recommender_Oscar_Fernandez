import { getSavedRoute, saveGeneratedRoute } from "../services/routePersistenceService.js";

export async function postSavedRoute(req, res) {
  const savedRoute = await saveGeneratedRoute(req.body || {});
  res.status(201).json(savedRoute);
}

export async function getRouteByPublicId(req, res) {
  const savedRoute = await getSavedRoute(req.params.publicId);
  res.json(savedRoute);
}
