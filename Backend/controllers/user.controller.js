import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js";
import PodcastFollower from "../models/PodcastsFollower.model.js";
import ListeningHistoryTrack from "../models/ListeningHistoryTracks.model.js";
import ListeningHistoryEpisode from "../models/ListeningHistoryEpisodes.model.js";
import PlaylistTrack from "../models/PlaylistTracks.model.js";
import db from "../config/database.js";


export const getInitialHistory = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found"));
        }

        const tracks = await ListeningHistoryTrack.getRecentlyPlayed(user.id);
        const episodes = await ListeningHistoryEpisode.getRecentlyPlayed(user.id);
        const playlists = await PodcastFollower.getRecentlyFollowed(user.id);
        return res.status(200).json(new ApiResponse(200, { tracks, episodes, playlists }, "Initial History fetched successfully"));
    } catch (error) {
        console.error("Error fetching initial history:", error);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
}

export const getFollowedPodcasts = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found"));
        }

        const podcasts = await PodcastFollower.getFollowedPodcasts(user.id);
        return res.status(200).json(new ApiResponse(200, podcasts, "Followed Podcasts fetched successfully"));
    } catch (error) {
        console.error("Error fetching followed podcasts:", error);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
}

export const getTracksLintenHistory = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found"));
        }

        const tracks = await ListeningHistoryTrack.getByUser(user.id);
        return res.status(200).json(new ApiResponse(200, tracks, "Tracks Linten History fetched successfully"));
    } catch (error) {
        console.error("Error fetching tracks linten history:", error);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
}

export const getEpisodesLintenHistory = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found"));
        }

        const episodes = await ListeningHistoryEpisode.getByUser(user.id);
        return res.status(200).json(new ApiResponse(200, episodes, "Episodes Linten History fetched successfully"));
    } catch (error) {
        console.error("Error fetching episodes linten history:", error);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
}

export const getUserPlaylists = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found"));
        }

        const playlists = await PlaylistTrack.getByUser(user.id);
        return res.status(200).json(new ApiResponse(200, playlists, "User Playlists fetched successfully"));
    } catch (error) {
        console.error("Error fetching user playlists:", error);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
}

export const saveTrackHistory = async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const userId = req.userId;
        const { trackId, progressSeconds = 0, isCompleted = false } = req.body;

        if (!userId) {
            await client.query('ROLLBACK');
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!trackId) {
            await client.query('ROLLBACK');
            return res.status(400).json(new ApiError(400, "trackId is required"));
        }

        const historyRecord = await ListeningHistoryTrack.upsert({
            user_id: userId,
            track_id: trackId,
            progress_seconds: progressSeconds,
            is_completed: isCompleted
        }, client);

        await client.query('COMMIT');
        return res.status(200).json(new ApiResponse(200, historyRecord, "Track history saved successfully"));
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error saving track history:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    } finally {
        client.release();
    }
}

export const saveEpisodeHistory = async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const userId = req.userId;
        const { episodeId, progressSeconds = 0, isCompleted = false } = req.body;

        if (!userId) {
            await client.query('ROLLBACK');
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!episodeId) {
            await client.query('ROLLBACK');
            return res.status(400).json(new ApiError(400, "episodeId is required"));
        }

        const historyRecord = await ListeningHistoryEpisode.upsert({
            user_id: userId,
            episode_id: episodeId,
            progress_seconds: progressSeconds,
            is_completed: isCompleted
        }, client);

        await client.query('COMMIT');
        return res.status(200).json(new ApiResponse(200, historyRecord, "Episode history saved successfully"));
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error saving episode history:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    } finally {
        client.release();
    }
}