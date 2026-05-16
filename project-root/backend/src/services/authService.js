import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { getDbPool } from "./db.js";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function sanitizeUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    isActive: Boolean(row.isActive),
    role: {
      id: row.roleId,
      code: row.roleCode,
      name: row.roleName,
    },
    client: row.clientId
      ? {
          id: row.clientId,
          name: row.clientName,
          type: row.clientType,
        }
      : null,
  };
}

async function findUserByEmail(email) {
  const pool = getDbPool();
  const [rows] = await pool.execute(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.password_hash AS passwordHash,
        u.is_active AS isActive,
        r.id AS roleId,
        r.code AS roleCode,
        r.name AS roleName,
        c.id AS clientId,
        c.name AS clientName,
        c.client_type AS clientType
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN clients c ON c.id = u.client_id
      WHERE u.email = :email
      LIMIT 1
    `,
    { email },
  );

  return rows[0] || null;
}

export async function getUserById(userId) {
  const pool = getDbPool();
  const [rows] = await pool.execute(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.is_active AS isActive,
        r.id AS roleId,
        r.code AS roleCode,
        r.name AS roleName,
        c.id AS clientId,
        c.name AS clientName,
        c.client_type AS clientType
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN clients c ON c.id = u.client_id
      WHERE u.id = :userId
      LIMIT 1
    `,
    { userId },
  );

  return sanitizeUser(rows[0]);
}

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role.code,
      clientId: user.client?.id || null,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn },
  );
}

export async function loginWithPassword(payload) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");

  if (!email || !password) {
    const error = new Error("Email y password son obligatorios.");
    error.statusCode = 400;
    throw error;
  }

  const row = await findUserByEmail(email);

  if (!row || !row.passwordHash) {
    const error = new Error("Credenciales no validas.");
    error.statusCode = 401;
    throw error;
  }

  if (!row.isActive) {
    const error = new Error("Este usuario esta desactivado.");
    error.statusCode = 403;
    throw error;
  }

  const passwordOk = await bcrypt.compare(password, row.passwordHash);

  if (!passwordOk) {
    const error = new Error("Credenciales no validas.");
    error.statusCode = 401;
    throw error;
  }

  const user = sanitizeUser(row);

  return {
    token: signToken(user),
    user,
  };
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwt.secret);
}
