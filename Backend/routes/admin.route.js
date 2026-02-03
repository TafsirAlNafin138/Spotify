import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { createSong, deleteSong, createAlbum, deleteAlbum, createArtist, deleteArtist, createGenre, deleteGenre, updateAlbum, updateArtist, updateGenre, addArtistToAlbum, removeArtistFromAlbum, addGenreToAlbum, removeGenreFromAlbum, addGenreToSong, removeGenreFromSong, checkAdmin, createPodcast, deletePodcast, UploadEpisodeToPodcasts, deleteEpisode } from "../controllers/admin.controller.js";

const router = Router();


// router.get("/check", protectRoute, requireAdmin, checkAdmin);

// router.use(protectRoute, requireAdmin); // Middleware to protect all routes below this

router.post("/tracks", createSong);
router.delete("/tracks/:id", deleteSong);
router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);
router.post("/artists", createArtist);
router.delete("/artists/:id", deleteArtist);
router.post("/genres", createGenre);
router.delete("/genres/:id", deleteGenre);
router.post("/albums/:id/artists", addArtistToAlbum);
router.delete("/albums/:id/artists/:artist_id", removeArtistFromAlbum);
router.post("/albums/:id/update", updateAlbum);
router.post("/artists/:id/update", updateArtist);
router.post("/genres/:id/update", updateGenre);
router.post("/albums/:id/genres", addGenreToAlbum);
router.delete("/albums/:id/genres/:genre_id", removeGenreFromAlbum);
router.post("/tracks/:id/genres", addGenreToSong);
router.delete("/tracks/:id/genres/:genre_id", removeGenreFromSong);
router.post("/podcasts", createPodcast);
router.delete("/podcasts/:id", deletePodcast);
router.post("/podcasts/:id/episodes", UploadEpisodeToPodcasts);
router.delete("/podcasts/:id/episodes/:episode_id", deleteEpisode);
export default router;