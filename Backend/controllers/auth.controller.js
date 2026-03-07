import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import { uploadOnCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '1d',
    });
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

        const user = await User.createUser({ name, email, password, image: imageUrl });

        const token = generateToken(user.id);

        res.status(200).json({ success: true, user, token });
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

        const user = await User.verifyPassword(email, password);
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(user.id);

        res.status(200).json({ success: true, user, token });
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
