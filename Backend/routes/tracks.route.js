import { Router } from "express";
import { getAllTracks } from "../controllers/Tracks.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getMadeForYou, getNewReleases, getTrandingSongs } from "../controllers/Tracks.controller.js";
const router = Router();

router.get("/", protectRoute, requireAdmin, getAllTracks);
router.get("/trending", protectRoute, getTrandingSongs);
router.get("/made-for-you", protectRoute, getMadeForYou);
router.get("/new-releases", protectRoute, getNewReleases);

export default router;
