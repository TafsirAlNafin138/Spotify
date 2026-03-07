import Like from "../models/Likes.model.js";
import User from "../models/User.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import TrackArtist from "../models/TrackArtists.model.js";
import db from "../config/database.js";

const resolveUser = async (req) => {
    if (!req.userId) return null;
    return User.findById(req.userId);
};

// POST /api/likes/toggle/:trackId
export const toggleLike = async (req, res) => {
    try {
        const user = await resolveUser(req);
        if (!user) {
            return res.status(401).json(new ApiError(401, "Unauthorized"));
        }

        const trackId = parseInt(req.params.trackId);
        if (isNaN(trackId)) {
            return res.status(400).json(new ApiError(400, "Invalid track ID"));
        }

        const alreadyLiked = await Like.isLiked(user.id, trackId);

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            if (alreadyLiked) {
                await Like.unlikeTrack(user.id, trackId, client);
                await client.query('COMMIT');
                return res.status(200).json(new ApiResponse(200, { liked: false, trackId }, "Track unliked"));
            } else {
                await Like.likeTrack(user.id, trackId, client);
                await client.query('COMMIT');
                return res.status(200).json(new ApiResponse(200, { liked: true, trackId }, "Track liked"));
            }
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in toggleLike:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

// GET /api/likes/my-likes
export const getLikedTracks = async (req, res) => {
    try {
        const user = await resolveUser(req);
        if (!user) {
            return res.status(401).json(new ApiError(401, "Unauthorized"));
        }

        const tracks = await Like.getLikedTracks(user.id);
        // getByTrack only accepts a single ID — fetch artists for each track in parallel
        await Promise.all(
            tracks.map(async (track) => {
                track.artists = await TrackArtist.getByTrack(track.id);
            })
        );
        return res.status(200).json(new ApiResponse(200, tracks, "Liked tracks fetched successfully"));
    } catch (error) {
        console.error("Error in getLikedTracks:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

// GET /api/likes/check/:trackId
export const checkLiked = async (req, res) => {
    try {
        const user = await resolveUser(req);
        if (!user) {
            return res.status(401).json(new ApiError(401, "Unauthorized"));
        }

        const trackId = parseInt(req.params.trackId);
        if (isNaN(trackId)) {
            return res.status(400).json(new ApiError(400, "Invalid track ID"));
        }

        const liked = await Like.isLiked(user.id, trackId);
        return res.status(200).json(new ApiResponse(200, { liked, trackId }, "Like status checked"));
    } catch (error) {
        console.error("Error in checkLiked:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

// POST /api/likes/check-multiple  body: { trackIds: [1, 2, 3] }
export const checkMultipleLikes = async (req, res) => {
    try {
        const user = await resolveUser(req);
        if (!user) {
            return res.status(401).json(new ApiError(401, "Unauthorized"));
        }

        const { trackIds } = req.body;
        if (!Array.isArray(trackIds) || trackIds.length === 0) {
            return res.status(400).json(new ApiError(400, "trackIds must be a non-empty array"));
        }

        const likedRows = await Like.checkMultipleLikes(user.id, trackIds);
        // Convert to a map: { trackId: true }
        const likedMap = {};
        likedRows.forEach(row => {
            likedMap[row.track_id] = true;
        });

        return res.status(200).json(new ApiResponse(200, likedMap, "Multiple like statuses checked"));
    } catch (error) {
        console.error("Error in checkMultipleLikes:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

// GET /api/likes/count/:trackId
export const getLikeCount = async (req, res) => {
    try {
        const trackId = parseInt(req.params.trackId);
        if (isNaN(trackId)) {
            return res.status(400).json(new ApiError(400, "Invalid track ID"));
        }

        const count = await Like.getLikeCount(trackId);
        return res.status(200).json(new ApiResponse(200, { count, trackId }, "Like count fetched"));
    } catch (error) {
        console.error("Error in getLikeCount:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

