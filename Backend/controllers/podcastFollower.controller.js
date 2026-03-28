import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js";
import PodcastFollower from "../models/PodcastsFollower.model.js";
import db from "../config/database.js";

const resolveUser = async (req) => {
    if (!req.userId) return null;
    return User.findById(req.userId);
};

// POST /api/podcast-followers/toggle/:podcastId
export const togglePodcastFollow = async (req, res) => {
    try {
        const user = await resolveUser(req);
        if (!user) {
            return res.status(401).json(new ApiError(401, "Unauthorized"));
        }

        const podcastId = req.params.podcastId;
        if (!podcastId) {
            return res.status(400).json(new ApiError(400, "podcastId is required"));
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const following = await PodcastFollower.toggleFollow(user.id, podcastId, client);
            await client.query('COMMIT');

            if (following) {
                return res.status(200).json(new ApiResponse(200, { following: true, podcastId }, "Podcast followed successfully"));
            } else {
                return res.status(200).json(new ApiResponse(200, { following: false, podcastId }, "Podcast unfollowed successfully"));
            }
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in togglePodcastFollow:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

export const getFollowedPodcasts = async (req, res) => {
    try {
        const user = await resolveUser(req);
        if (!user) {
            return res.status(401).json(new ApiError(401, "Unauthorized"));
        }

        const podcasts = await PodcastFollower.getFollowedPodcasts(user.id);
        return res.status(200).json(new ApiResponse(200, podcasts, "Followed Podcasts fetched successfully"));
    } catch (error) {
        console.error("Error fetching followed podcasts:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

export const checkFollowingPodcast = async (req, res) => {
    try {
        const user = await resolveUser(req);
        if (!user) {
            return res.status(401).json(new ApiError(401, "Unauthorized"));
        }

        const podcastId = req.params.podcastId;
        if (!podcastId) {
            return res.status(400).json(new ApiError(400, "podcastId is required"));
        }

        const isFollowing = await PodcastFollower.isFollowing(user.id, podcastId);
        return res.status(200).json(new ApiResponse(200, { isFollowing }, "Podcast following status checked successfully"));
    } catch (error) {
        console.error("Error checking podcast following status:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

export const getPodcastFollowerCount = async (req, res) => {
    try {
        const { podcastId } = req.params;

        if (!podcastId) {
            return res.status(400).json(new ApiError(400, "podcastId is required"));
        }

        const count = await PodcastFollower.getFollowerCount(podcastId);
        return res.status(200).json(new ApiResponse(200, { count }, "Podcast follower count fetched successfully"));
    } catch (error) {
        console.error("Error fetching podcast follower count:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};
