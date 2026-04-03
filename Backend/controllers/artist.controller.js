import Artist from "../models/Artist.model.js";
import Follower from "../models/Followers.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import db from "../config/database.js";

// Get Trending Artists
export const getTrendingArtists = async (req, res) => {
    try {
        const artists = await Artist.getTrending(10);
        return res.status(200).json(new ApiResponse(200, artists, "Trending Artists fetched successfully"));
    } catch (error) {
        console.error("Error in getTrendingArtists:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

// Get Artist by ID
export const getArtistById = async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) {
            return res.status(404).json(new ApiError(404, "Artist not found"));
        }

        const stats = await Artist.getStats(req.params.id);

        // If user is authenticated, check follow status
        let isFollowing = false;

        if (req.userId) {
            isFollowing = await Follower.isFollowing(req.userId, req.params.id);
        }

        const data = {
            ...artist,
            stats,
            isFollowing
        };

        return res.status(200).json(new ApiResponse(200, data, "Artist fetched successfully"));
    } catch (error) {
        console.error("Error in getArtistById:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

// Get Artist Tracks
export const getArtistTracks = async (req, res) => {
    try {
        const tracks = await Artist.getTracks(req.params.id);
        return res.status(200).json(new ApiResponse(200, tracks, "Artist tracks fetched successfully"));
    } catch (error) {
        console.error("Error in getArtistTracks:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

// Toggle Follow Artist
export const toggleFollowArtist = async (req, res) => {
     const client = await db.connect();
          
    try {
        const userId = req.userId || (req.user && req.user.id);
        const artistId = req.params.id;
        await client.query('BEGIN');

        if (!userId) {
            client.query('ROLLBACK');
            return res.status(401).json(new ApiError(401, "Unauthorized"));
        }

        const artist = await Artist.findById(artistId);
        if (!artist) {
            client.query('ROLLBACK');
            return res.status(404).json(new ApiError(404, "Artist not found"));
        }

        const following = await Follower.toggleFollow(userId, artistId, client);
        await client.query('COMMIT');
        
        if (following) {
            return res.status(200).json(new ApiResponse(200, { isFollowing: true }, "Followed artist successfully"));
        } else {
            return res.status(200).json(new ApiResponse(200, { isFollowing: false }, "Unfollowed artist successfully"));
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error in toggleFollowArtist:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }finally {
        client.release();
    }
}

