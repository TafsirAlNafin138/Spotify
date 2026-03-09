import Artist from "../models/Artist.model.js";
import Track from "../models/Track.model.js";
import Podcast from "../models/Podcasts.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const validateQuery = (q) => {
    if (!q || q.trim().length < 1) return null;
    return q.trim();
};

export const search = async (req, res) => {
    try {
        const query = validateQuery(req.query.q);
        const type = (req.query.type || 'all').toLowerCase();

        if (!query) {
            return res.status(400).json(new ApiError(400, "Search query is required"));
        }

        if (type === 'songs') {
            const songs = await Track.search(query, 30);
            return res.status(200).json(new ApiResponse(200, { songs }, "Songs search results"));
        }

        if (type === 'artists') {
            const artists = await Artist.search(query, 20);
            return res.status(200).json(new ApiResponse(200, { artists }, "Artists search results"));
        }

        if (type === 'podcasts') {
            const podcasts = await Podcast.search(query, 20);
            return res.status(200).json(new ApiResponse(200, { podcasts }, "Podcasts search results"));
        }

        // type === 'all' — run all in parallel
        // Promise.all is used to execute multiple independent search queries in parallel,
        // 'new Promise((resolve, reject) => ...)' syntax because the search methods 
        // already return Promises that can be passed directly to Promise.all.
        const [songs, artists, podcasts] = await Promise.all([
            Track.search(query, 10),
            Artist.search(query, 6),
            Podcast.search(query, 6),
        ]);

        return res.status(200).json(new ApiResponse(200, { songs, artists, podcasts }, "Search results"));
    } catch (error) {
        console.error("Error in search:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
};
