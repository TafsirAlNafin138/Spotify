import Playlist from "../models/Playlist.model.js";
import User from "../models/User.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import db from "../config/database.js";

const resolveUser = async (req) => {
    if (!req.userId) return null;
    return User.findById(req.userId);
};

// POST /api/playlists
export const createPlaylist = async (req, res) => {
    try {
        const user = await resolveUser(req);
        if (!user) return res.status(401).json(new ApiError(401, "Unauthorized"));

        const { name } = req.body;
        if (!name) return res.status(400).json(new ApiError(400, "Playlist name is required"));

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const playlist = await Playlist.create({ user_id: user.id, name }, client);
            await client.query('COMMIT');
            return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error creating playlist:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

// GET /api/playlists/user
export const getUserPlaylists = async (req, res) => {
    try {
        const user = await resolveUser(req);
        if (!user) return res.status(401).json(new ApiError(401, "Unauthorized"));

        const playlists = await Playlist.findByUserId(user.id);
        return res.status(200).json(new ApiResponse(200, playlists, "User playlists fetched automatically"));
    } catch (error) {
        console.error("Error fetching playlists:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

// GET /api/playlists/:id
export const getPlaylistDetails = async (req, res) => {
    try {
        const playlistId = parseInt(req.params.id);
        if (isNaN(playlistId)) return res.status(400).json(new ApiError(400, "Invalid playlist ID"));

        const playlist = await Playlist.getFullDetails(playlistId);
        if (!playlist) return res.status(404).json(new ApiError(404, "Playlist not found"));

        return res.status(200).json(new ApiResponse(200, playlist, "Playlist details fetched"));
    } catch (error) {
        console.error("Error fetching playlist details:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

// POST /api/playlists/:id/add-track/:trackId
export const addTrackToPlaylist = async (req, res) => {
    try {
        const user = await resolveUser(req);
        if (!user) return res.status(401).json(new ApiError(401, "Unauthorized"));

        const playlistId = parseInt(req.params.id);
        const trackId = parseInt(req.params.trackId);

        if (isNaN(playlistId) || isNaN(trackId)) return res.status(400).json(new ApiError(400, "Invalid IDs"));

        // Check ownership
        const isOwner = await Playlist.isOwnedBy(playlistId, user.id);
        if (!isOwner) return res.status(403).json(new ApiError(403, "Not authorized to modify this playlist"));

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const result = await Playlist.addTrack(playlistId, trackId, null, client);
            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, result, "Track added to playlist"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error adding track to playlist:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

// DELETE /api/playlists/:id/remove-track/:trackId
export const removeTrackFromPlaylist = async (req, res) => {
    try {
        const user = await resolveUser(req);
        if (!user) return res.status(401).json(new ApiError(401, "Unauthorized"));

        const playlistId = parseInt(req.params.id);
        const trackId = parseInt(req.params.trackId);

        if (isNaN(playlistId) || isNaN(trackId)) return res.status(400).json(new ApiError(400, "Invalid IDs"));

        const isOwner = await Playlist.isOwnedBy(playlistId, user.id);
        if (!isOwner) return res.status(403).json(new ApiError(403, "Not authorized to modify this playlist"));

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const result = await Playlist.removeTrack(playlistId, trackId, client);
            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, result, "Track removed from playlist"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error removing track from playlist:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};

// DELETE /api/playlists/:id
export const deletePlaylist = async (req, res) => {
    try {
        const user = await resolveUser(req);
        if (!user) return res.status(401).json(new ApiError(401, "Unauthorized"));

        const playlistId = parseInt(req.params.id);
        if (isNaN(playlistId)) return res.status(400).json(new ApiError(400, "Invalid playlist ID"));

        const isOwner = await Playlist.isOwnedBy(playlistId, user.id);
        if (!isOwner) return res.status(403).json(new ApiError(403, "Not authorized to delete this playlist"));

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            await Playlist.delete(playlistId, client);
            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error deleting playlist:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};
