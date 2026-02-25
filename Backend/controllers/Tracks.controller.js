import Track from "../models/Track.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";

// Middleware to disable all caching for track endpoints
export const disableCache = (req, res, next) => {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
    });
    next();
};

export const getAllTracks = async (req, res) => {
    try {
        const tracks = await Track.findAll();
        return res.status(200).json(new ApiResponse(200, tracks, "All Tracks fetched successfully"));
    } catch (error) {
        console.error("Error in getAllTracks:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}


export const getTrandingSongs = async (req, res) => {
    try {
        const tracks = await Track.getTrending();
        return res.status(200).json(new ApiResponse(200, tracks, "Trending Tracks fetched successfully"));
    } catch (error) {
        console.error("Error in getTrandingSongs:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const getMadeForYou = async (req, res) => {
    try {
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json(new ApiError(401, "Unauthorized access"));
        }

        const user = await User.findByClerkId(userId);

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found"));
        }

        const tracks = await Track.getMadeForYou(user.id);
        return res.status(200).json(new ApiResponse(200, tracks, "Made For You Tracks fetched successfully"));
    } catch (error) {
        console.error("Error in getMadeForYou:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const getNewReleases = async (req, res) => {
    try {
        const tracks = await Track.getNewReleases();
        return res.status(200).json(new ApiResponse(200, tracks, "New Releases Tracks fetched successfully"));
    } catch (error) {
        console.error("Error in getNewReleases:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}
