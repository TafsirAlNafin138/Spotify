import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getStats, getLeaderboard } from "../controllers/stat.controller.js";

const router = Router();

router.use(protectRoute);

router.get("/", getStats);
router.get("/leaderboard", getLeaderboard);

export default router;