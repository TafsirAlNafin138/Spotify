import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    createPlaylist, 
    getUserPlaylists, 
    getPlaylistDetails, 
    addTrackToPlaylist, 
    removeTrackFromPlaylist, 
    deletePlaylist 
} from "../controllers/playlist.controller.js";

const router = Router();

// Protected routes
router.use(protectRoute);

router.post("/", createPlaylist);
router.get("/user", getUserPlaylists);
router.get("/:id", getPlaylistDetails);
router.post("/:id/add-track/:trackId", addTrackToPlaylist);
router.delete("/:id/remove-track/:trackId", removeTrackFromPlaylist);
router.delete("/:id", deletePlaylist);

export default router;
