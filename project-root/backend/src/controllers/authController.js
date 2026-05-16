import { loginWithPassword } from "../services/authService.js";

export async function postLogin(req, res) {
  const result = await loginWithPassword(req.body || {});
  res.json(result);
}

export async function getMe(req, res) {
  res.json({ user: req.user });
}
