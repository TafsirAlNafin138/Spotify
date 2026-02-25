import { Router } from "express";
import { getAllTracks, getTrackById, incrementPlayCount, disableCache } from "../controllers/Tracks.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getMadeForYou, getNewReleases, getTrandingSongs } from "../controllers/Tracks.controller.js";
const router = Router();

// Apply no-cache middleware to all routes
router.use(disableCache);

router.get("/", protectRoute, requireAdmin, getAllTracks);
router.get("/trending", protectRoute, getTrandingSongs);
router.get("/made-for-you", protectRoute, getMadeForYou);
router.get("/new-releases", protectRoute, getNewReleases);
router.post("/:id/play", protectRoute, incrementPlayCount);
router.get("/:id", protectRoute, getTrackById);

export default router;
