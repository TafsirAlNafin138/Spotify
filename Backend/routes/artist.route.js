import express from "express";
import { getTrendingArtists, getArtistById, getArtistTracks, toggleFollowArtist } from "../controllers/artist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protectRoute);
router.get("/trending", getTrendingArtists);
router.get("/:id", getArtistById);
router.get("/:id/tracks", getArtistTracks);

// Protected routes
router.post("/:id/follow", toggleFollowArtist);

export default router;
