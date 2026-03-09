import { Router } from "express";
import {
    togglePodcastFollow,
    getFollowedPodcasts,
    checkFollowingPodcast,
    getPodcastFollowerCount
} from "../controllers/podcastFollower.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

router.post("/toggle/:podcastId", togglePodcastFollow);
router.get("/my-podcasts", getFollowedPodcasts);
router.get("/check/:podcastId", checkFollowingPodcast);
router.get("/count/:podcastId", getPodcastFollowerCount);

export default router;
