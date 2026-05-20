import express from "express";
import { getAllPodcasts, getPodcastById, getTrendingPodcasts } from "../controllers/podcast.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/trending", protectRoute, getTrendingPodcasts);
router.get("/", protectRoute, getAllPodcasts);
router.get("/:id", protectRoute, getPodcastById);

export default router;
