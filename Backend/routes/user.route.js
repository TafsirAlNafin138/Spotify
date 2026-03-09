import { Router } from "express";
import {
    getTracksLintenHistory,
    getEpisodesLintenHistory,
    getInitialHistory,
    saveTrackHistory,
    saveEpisodeHistory
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

router.get("/:userId", getInitialHistory);
router.get("/:userId/tracks-linten-history", getTracksLintenHistory);
router.get("/:userId/episodes-linten-history", getEpisodesLintenHistory);

router.post("/tracks", saveTrackHistory);
router.post("/episodes", saveEpisodeHistory);

export default router;