import mysql from "mysql2/promise";
import { env } from "../config/env.js";

let pool;

export function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...env.db,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: true,
    });
  }

  return pool;
}

export async function withTransaction(callback) {
  const connection = await getDbPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
