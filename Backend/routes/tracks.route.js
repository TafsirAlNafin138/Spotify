import { Router } from "express";
import { getAllTracks, getTrackById, disableCache, getMadeForYou, getNewReleases, getTrandingSongs } from "../controllers/Tracks.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
const router = Router();

// Apply no-cache middleware to all routes
router.use(disableCache);

router.get("/", protectRoute, requireAdmin, getAllTracks);
router.get("/trending", protectRoute, getTrandingSongs);
router.get("/made-for-you", protectRoute, getMadeForYou);
router.get("/new-releases", protectRoute, getNewReleases);

router.get("/:id", protectRoute, getTrackById);

export default router;
