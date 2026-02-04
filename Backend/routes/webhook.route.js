import express from "express";
import { clerkWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

// Clerk webhooks require the raw body for signature verification
router.post("/", express.raw({ type: 'application/json' }), clerkWebhook);

export default router;
