import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import { getCategories, getPois } from "../controllers/poiController.js";
import { postRecommendRoute } from "../controllers/recommendationController.js";
import { getRouteByPublicId, postSavedRoute } from "../controllers/routeController.js";
import {
  getAdminPanelData,
  patchAdminUserStatus,
  postAdminClient,
  postAdminUser,
} from "../controllers/adminController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/health", getHealth);
router.get("/pois", asyncHandler(getPois));
router.get("/categories", asyncHandler(getCategories));
router.post("/recommend-route", asyncHandler(postRecommendRoute));
router.post("/routes", asyncHandler(postSavedRoute));
router.get("/routes/:publicId", asyncHandler(getRouteByPublicId));
router.get("/admin", asyncHandler(getAdminPanelData));
router.post("/admin/clients", asyncHandler(postAdminClient));
router.post("/admin/users", asyncHandler(postAdminUser));
router.patch("/admin/users/:userId/status", asyncHandler(patchAdminUserStatus));

export default router;
