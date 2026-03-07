import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

export const requireAdmin = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const result = await db.query('SELECT email FROM users WHERE id = $1', [req.userId]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const adminEmails = [
            process.env.ADMIN_EMAIL1?.trim(),
            process.env.ADMIN_EMAIL2?.trim()
        ].filter(Boolean);

        const isAdmin = adminEmails.includes(user.email);

        if (!isAdmin) {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        next();
    } catch (error) {
        console.error("Error in admin middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
