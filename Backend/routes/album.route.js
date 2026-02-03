import express from "express";
import { getAllAlbums, getAlbumById } from "../controllers/album.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// router.use(protectRoute);

router.get("/", getAllAlbums);
router.get("/:id", getAlbumById);

export default router;