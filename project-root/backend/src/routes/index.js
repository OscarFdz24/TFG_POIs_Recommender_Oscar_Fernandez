import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import { getCategories, getPois } from "../controllers/poiController.js";
import { postRecommendRoute } from "../controllers/recommendationController.js";
import { getMyRoutes, getRouteByPublicId, postSavedRoute } from "../controllers/routeController.js";
import { getCompanyUserList, postCompanyUser } from "../controllers/companyController.js";
import {
  getAdminPanelData,
  patchAdminUserStatus,
  postAdminClient,
  postAdminUser,
} from "../controllers/adminController.js";
import { getMe, postLogin } from "../controllers/authController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/health", getHealth);
router.post("/auth/login", asyncHandler(postLogin));
router.get("/auth/me", asyncHandler(requireAuth), asyncHandler(getMe));
router.get("/pois", asyncHandler(getPois));
router.get("/categories", asyncHandler(getCategories));
router.post("/recommend-route", asyncHandler(postRecommendRoute));
router.post(
  "/routes",
  asyncHandler(requireAuth),
  requireRole("admin", "client"),
  asyncHandler(postSavedRoute),
);
router.get("/routes/my", asyncHandler(requireAuth), requireRole("user"), asyncHandler(getMyRoutes));
router.get("/routes/:publicId", asyncHandler(getRouteByPublicId));
router.get(
  "/company/users",
  asyncHandler(requireAuth),
  requireRole("admin", "client"),
  asyncHandler(getCompanyUserList),
);
router.post(
  "/company/users",
  asyncHandler(requireAuth),
  requireRole("admin", "client"),
  asyncHandler(postCompanyUser),
);
router.get("/admin", asyncHandler(requireAuth), requireRole("admin"), asyncHandler(getAdminPanelData));
router.post("/admin/clients", asyncHandler(requireAuth), requireRole("admin"), asyncHandler(postAdminClient));
router.post("/admin/users", asyncHandler(requireAuth), requireRole("admin"), asyncHandler(postAdminUser));
router.patch(
  "/admin/users/:userId/status",
  asyncHandler(requireAuth),
  requireRole("admin"),
  asyncHandler(patchAdminUserStatus),
);

export default router;
