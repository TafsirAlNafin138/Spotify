import { Webhook } from "svix";
import User from "../models/User.model.js";

export const clerkWebhook = async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error("Missing CLERK_WEBHOOK_SECRET");
        return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    // Get Svix headers
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ success: false, message: "Missing svix headers" });
    }

    // Capture the raw body from the Buffer
    const payload = req.body.toString();
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    try {
        evt = wh.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        console.error("Webhook verification failed:", err.message);
        return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    if (eventType === "user.deleted") {
        try {
            await User.deleteByClerkId(id);
            console.log(`User ${id} deleted successfully from database.`);
        } catch (error) {
            console.error("Database user deletion error:", error);
            return res.status(500).json({ success: false, message: "Failed to delete user" });
        }
    }

    return res.status(200).json({ success: true });
};
