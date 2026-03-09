import express from "express";
import { search } from "../controllers/search.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, search);

export default router;
