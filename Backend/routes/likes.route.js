import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { toggleLike, getLikedTracks, checkLiked, checkMultipleLikes, getLikeCount } from "../controllers/likes.controller.js";

const router = Router();

router.post("/toggle/:trackId", protectRoute, toggleLike);
router.get("/my-likes", protectRoute, getLikedTracks);
router.get("/check/:trackId", protectRoute, checkLiked);
router.post("/check-multiple", protectRoute, checkMultipleLikes);
router.get("/count/:trackId", protectRoute, getLikeCount);

export default router;
