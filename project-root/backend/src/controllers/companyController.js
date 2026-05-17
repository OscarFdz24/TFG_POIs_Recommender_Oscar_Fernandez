import { createCompanyUser, getCompanyUsers } from "../services/companyService.js";

export async function getCompanyUserList(req, res) {
  const users = await getCompanyUsers(req.user);
  res.json({ items: users });
}

export async function postCompanyUser(req, res) {
  const user = await createCompanyUser(req.user, req.body || {});
  res.status(201).json(user);
}
