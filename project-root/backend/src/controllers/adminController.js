import {
  createClient,
  createUser,
  getAdminOverview,
  setUserActiveStatus,
} from "../services/adminService.js";

export async function getAdminPanelData(req, res) {
  const data = await getAdminOverview();
  res.json(data);
}

export async function postAdminClient(req, res) {
  const client = await createClient(req.body || {});
  res.status(201).json(client);
}

export async function postAdminUser(req, res) {
  const user = await createUser(req.body || {});
  res.status(201).json(user);
}

export async function patchAdminUserStatus(req, res) {
  const user = await setUserActiveStatus(req.params.userId, req.body?.isActive);
  res.json(user);
}
