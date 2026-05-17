import bcrypt from "bcryptjs";
import { getDbPool } from "./db.js";

const DEFAULT_PASSWORD = "demo1234";
const BCRYPT_ROUNDS = 10;

function requiredText(value, fieldName) {
  const text = String(value || "").trim();

  if (!text) {
    const error = new Error(`${fieldName} es obligatorio.`);
    error.statusCode = 400;
    throw error;
  }

  return text;
}

function normalizeEmail(value) {
  return requiredText(value, "El email").toLowerCase();
}

function assertValidEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error("El email no tiene un formato valido.");
    error.statusCode = 400;
    throw error;
  }
}

export async function getCompanyUsers(currentUser) {
  const pool = getDbPool();
  const params = {};
  let clientFilter = "";

  if (currentUser.role.code === "client") {
    clientFilter = "AND u.client_id = :clientId";
    params.clientId = currentUser.client?.id || null;
  }

  const [rows] = await pool.execute(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.is_active AS isActive,
        u.created_at AS createdAt,
        c.id AS clientId,
        c.name AS clientName
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN clients c ON c.id = u.client_id
      WHERE r.code = 'user'
        AND u.is_active = TRUE
        ${clientFilter}
      ORDER BY u.created_at DESC, u.id DESC
    `,
    params,
  );

  return rows;
}

export async function createCompanyUser(currentUser, payload) {
  if (currentUser.role.code === "client" && !currentUser.client?.id) {
    const error = new Error("La cuenta de empresa no esta asociada a ningun cliente.");
    error.statusCode = 400;
    throw error;
  }

  const name = requiredText(payload.name, "El nombre del usuario");
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || DEFAULT_PASSWORD);
  const clientId =
    currentUser.role.code === "client"
      ? currentUser.client.id
      : Number.parseInt(payload.clientId, 10);

  assertValidEmail(email);

  if (!Number.isFinite(clientId)) {
    const error = new Error("No se ha podido determinar la empresa del usuario.");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("La password debe tener al menos 6 caracteres.");
    error.statusCode = 400;
    throw error;
  }

  const pool = getDbPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = :email LIMIT 1",
      { email },
    );

    if (existingUsers.length) {
      const error = new Error("Ya existe un usuario con ese email.");
      error.statusCode = 409;
      throw error;
    }

    const [roles] = await connection.execute(
      "SELECT id, name FROM roles WHERE code = 'user' LIMIT 1",
    );

    if (!roles.length) {
      const error = new Error("No existe el rol de usuario final.");
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const [result] = await connection.execute(
      `
        INSERT INTO users (role_id, client_id, name, email, password_hash, is_active)
        VALUES (:roleId, :clientId, :name, :email, :passwordHash, TRUE)
      `,
      {
        roleId: roles[0].id,
        clientId,
        name,
        email,
        passwordHash,
      },
    );

    await connection.commit();

    return {
      id: result.insertId,
      name,
      email,
      clientId,
      roleCode: "user",
      roleName: roles[0].name,
      isActive: true,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
