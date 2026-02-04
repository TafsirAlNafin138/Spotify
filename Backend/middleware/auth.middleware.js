import { clerkClient } from "@clerk/express";
import ApiError from "../utils/ApiError.js";

export const protectRoute = async (req, res, next) => {
    try {
        const auth = req.auth();

        if (!auth?.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.userId = auth.userId;
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const requireAdmin = async (req, res, next) => {
    try {
        const auth = req.auth();

        if (!auth?.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const current_user = await clerkClient.users.getUser(auth.userId);
        if (!current_user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userEmails = current_user.emailAddresses.map(e => e.emailAddress);
        const adminEmails = [
            process.env.ADMIN_EMAIL1?.trim(),
            process.env.ADMIN_EMAIL2?.trim()
        ].filter(Boolean);

        const isAdmin =
            userEmails.some(email => adminEmails.includes(email)) ||
            current_user.publicMetadata?.role === "admin";

        if (!isAdmin) {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        req.userId = auth.userId;
        next();
    } catch (error) {
        console.error("Error in admin middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
