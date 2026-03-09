import { Router } from "express";
import {
    getTracksLintenHistory,
    getEpisodesLintenHistory,
    getInitialHistory,
    saveTrackHistory,
    saveEpisodeHistory,
    getFollowedArtists
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

router.get("/:userId", getInitialHistory);
router.get("/:userId/tracks-linten-history", getTracksLintenHistory);
router.get("/:userId/episodes-linten-history", getEpisodesLintenHistory);
router.get("/:userId/my-followed-artists", getFollowedArtists);
router.post("/:userId/tracks", saveTrackHistory);
router.post("/:userId/episodes", saveEpisodeHistory);

export default router;