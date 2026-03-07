import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js";
import PodcastFollower from "../models/PodcastsFollower.model.js";
import ListeningHistoryTrack from "../models/ListeningHistoryTracks.model.js";
import ListeningHistoryEpisode from "../models/ListeningHistoryEpisodes.model.js";
import PlaylistTrack from "../models/PlaylistTracks.model.js";


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
        const auth = req.auth();

        if (!auth?.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = auth.userId;

        const user = await User.findByClerkId(userId);

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
        const auth = req.auth();

        if (!auth?.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = auth.userId;
        const user = await User.findByClerkId(userId);

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
        const auth = req.auth();

        if (!auth?.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = auth.userId;
        const user = await User.findByClerkId(userId);

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
        const auth = req.auth();

        if (!auth?.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = auth.userId;
        const user = await User.findByClerkId(userId);

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