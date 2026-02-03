import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Track from "../models/Track.model.js";
import Album from "../models/Album.model.js";
import Artist from "../models/Artist.model.js";
import Genre from "../models/Genres.model.js";
import Podcast from "../models/Podcasts.model.js";
import Episode from "../models/Episodes.model.js";
import User from "../models/User.model.js";

export const getStats = async (req, res) => {
    try {
        const tracks = await Track.count();
        const albums = await Album.count();
        const artists = await Artist.count();
        const genres = await Genre.count();
        const podcasts = await Podcast.count();
        const episodes = await Episode.count();
        const users = await User.count();
        return res.status(200).json(new ApiResponse(200, {
            tracks,
            albums,
            artists,
            genres,
            podcasts,
            episodes,
            users
        }, "Stats"));
    } catch (error) {
        console.error("Error in getStats:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}