import Podcast from "../models/Podcasts.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const getAllPodcasts = async (req, res) => {
    try {
        const podcasts = await Podcast.findAll();
        return res.status(200).json(new ApiResponse(200, podcasts, "All Podcasts fetched successfully"));
    } catch (error) {
        console.error("Error in getAllPodcasts:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const getPodcastById = async (req, res) => {
    try {
        const podcast = await Podcast.findById(req.params.id);
        if (!podcast) {
            return res.status(404).json(new ApiError(404, "Podcast not found"));
        }

        const fullDetails = await Podcast.getFullDetails(req.params.id);
        return res.status(200).json(new ApiResponse(200, fullDetails, "Podcast fetched successfully"));
    } catch (error) {
        console.error("Error in getPodcastById:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}
