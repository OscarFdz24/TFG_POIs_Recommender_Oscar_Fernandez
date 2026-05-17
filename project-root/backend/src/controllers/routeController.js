import {
  getAssignedRoutesForUser,
  getSavedRoute,
  saveGeneratedRoute,
} from "../services/routePersistenceService.js";

export async function postSavedRoute(req, res) {
  const savedRoute = await saveGeneratedRoute(req.body || {}, req.user || null);
  res.status(201).json(savedRoute);
}

export async function getRouteByPublicId(req, res) {
  const savedRoute = await getSavedRoute(req.params.publicId);
  res.json(savedRoute);
}

export async function getMyRoutes(req, res) {
  const routes = await getAssignedRoutesForUser(req.user.id);
  res.json({ items: routes });
}
