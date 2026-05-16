import { getUserById, verifyToken } from "../services/authService.js";

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      const error = new Error("No autenticado.");
      error.statusCode = 401;
      throw error;
    }

    const decoded = verifyToken(token);
    const user = await getUserById(decoded.sub);

    if (!user || !user.isActive) {
      const error = new Error("Sesion no valida.");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
}

export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role.code)) {
      const error = new Error("No tienes permisos para realizar esta accion.");
      error.statusCode = 403;
      next(error);
      return;
    }

    next();
  };
}
