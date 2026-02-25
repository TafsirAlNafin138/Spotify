import Album from "../models/Album.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";


export const getAllAlbums = async (req, res) => {
    try {
        const albums = await Album.findAll();
        return res.status(200).json(new ApiResponse(200, albums, "Albums fetched successfully"));
    } catch (error) {
        console.error("Error in getAllAlbums:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}


export const getAlbumById = async (req, res) => {
    try {
        const isexist = await Album.findById(req.params.id);
        if (!isexist) {
            return res.status(404).json(new ApiError(404, "Album not found"));
        }
        // const album = await Album.getTracks(req.params.id);
        // // console.log(album);
        // return res.status(200).json(new ApiResponse(200, album, "Album song fetched successfully"));
        const album = await Album.getFullDetails(req.params.id);
        return res.status(200).json(new ApiResponse(200, album, "Album fetched successfully"));
    } catch (error) {
        console.error("Error in getAlbumById:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}
