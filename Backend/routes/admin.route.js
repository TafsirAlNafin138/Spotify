import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { createSong, deleteSong, createAlbum, deleteAlbum, createArtist, deleteArtist, createGenre, deleteGenre, checkAdmin, createPodcast, deletePodcast, UploadEpisodeToPodcasts, deleteEpisode, getAllArtists, getAllGenres, getAllTracks, getAllAlbums, getAllPodcasts, getAllEpisodes, getAdminStats } from "../controllers/admin.controller.js";

const router = Router();


router.get("/check", protectRoute, requireAdmin, checkAdmin);

router.use(protectRoute, requireAdmin); // Middleware to protect all routes below this

router.post("/tracks", createSong);
router.get("/trackscount", getAllTracks);
router.delete("/tracks/:id", deleteSong);
router.post("/albums", createAlbum);
router.get("/albumscount", getAllAlbums);
router.delete("/albums/:id", deleteAlbum);
router.post("/artists", createArtist);
router.get("/artistscount", getAllArtists);
router.delete("/artists/:id", deleteArtist);
router.post("/genres", createGenre);
router.get("/genrescount", getAllGenres);
router.delete("/genres/:id", deleteGenre);
// Stats route alias for admin
router.get("/stats", getAdminStats);
// Podcasts and Episodes
router.get("/podcastscount", getAllPodcasts);
router.get("/episodescount", getAllEpisodes);

router.post("/podcasts", createPodcast);
router.delete("/podcasts/:id", deletePodcast);
router.post("/episodes", UploadEpisodeToPodcasts); // Create episode with podcast ID in body
router.post("/podcasts/:id/episodes", UploadEpisodeToPodcasts);
router.delete("/podcasts/:id/episodes/:episode_id", deleteEpisode);
export default router;