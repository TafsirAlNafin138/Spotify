import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getStats } from "../controllers/stat.controller.js";

const router = Router();

// router.use(protectRoute, requireAdmin);

router.get("/", getStats);

export default router;