import express from "express";
import { getAllPodcasts, getPodcastById } from "../controllers/podcast.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getAllPodcasts);
router.get("/:id", protectRoute, getPodcastById);

export default router;
