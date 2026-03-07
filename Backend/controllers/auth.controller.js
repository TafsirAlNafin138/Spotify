import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import { uploadOnCloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import db from '../config/database.js';

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'refreshSecret123', {
        expiresIn: '1d',
    });

    return { accessToken, refreshToken };
};

export const register = async (req, res) => {
    let localFilePath = null;
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const emailExists = await User.emailExists(email);
        if (emailExists) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }

        let imageUrl = null;
        if (req.files && req.files.image) {
            localFilePath = req.files.image.tempFilePath;
            const uploadResult = await uploadOnCloudinary(localFilePath);
            if (uploadResult) {
                imageUrl = uploadResult.secure_url;
            }
        }

        let user;
        let tokens;
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            user = await User.createUser({ name, email, password, image: imageUrl }, client);
            tokens = generateTokens(user.id);
            // Save hashed refresh token to database
            await User.saveRefreshToken(user.id, tokens.refreshToken, client);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        const { accessToken, refreshToken } = tokens;

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development',
            sameSite: 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ success: true, user, token: accessToken });
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    } finally {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        let user;
        let tokens;
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            user = await User.verifyPassword(email, password, client);
            if (!user) {
                await client.query('ROLLBACK');
                return res.status(401).json({ success: false, message: "Invalid credentials" });
            }

            tokens = generateTokens(user.id);
            // Save hashed refresh token to database
            await User.saveRefreshToken(user.id, tokens.refreshToken, client);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        const { accessToken, refreshToken } = tokens;

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development',
            sameSite: 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ success: true, user, token: accessToken });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error in getMe:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "Refresh token not found" });
        }

        // Verify the refresh token's signature
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshSecret123');
        const userId = decoded.userId;

        // Verify the token against the hash in the database
        const isValid = await User.verifyRefreshToken(userId, refreshToken);

        if (!isValid) {
            return res.status(403).json({ success: false, message: "Invalid refresh token" });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(userId);

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            // Save new hashed refresh token to database
            await User.saveRefreshToken(userId, newRefreshToken, client);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        // Update cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development',
            sameSite: 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ success: true, token: accessToken });
    } catch (error) {
        console.error("Error in refreshToken:", error);
        return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
    }
};

export const logout = async (req, res) => {
    try {
        // Clear the refresh token cookie
        res.clearCookie('refreshToken');

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
