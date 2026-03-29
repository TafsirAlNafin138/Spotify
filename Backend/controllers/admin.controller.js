import ApiError from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import Track from "../models/Track.model.js";
import Album from "../models/Album.model.js";
import TrackArtist from "../models/TrackArtists.model.js";
import Artist from "../models/Artist.model.js";
import Genre from "../models/Genres.model.js";
import AlbumAuthor from "../models/AlbumAuthors.model.js";
import Podcast from "../models/Podcasts.model.js";
import Episode from "../models/Episodes.model.js";
import db from "../config/database.js";

export const getAllArtists = async (req, res) => {
    try {
        const artists = await Artist.findAll();
        return res.status(200).json(new ApiResponse(200, artists, "All Artists fetched successfully"));
    } catch (error) {
        console.error("Error in getAllArtists:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const getAllGenres = async (req, res) => {
    try {
        const genres = await Genre.findAll();
        return res.status(200).json(new ApiResponse(200, genres, "All Genres fetched successfully"));
    } catch (error) {
        console.error("Error in getAllGenres:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const getAllTracks = async (req, res) => {
    try {
        const tracks = await Track.findAll();

        const tracksArtists = await Promise.all(
            tracks.map(async (track) => {
                const artists = await TrackArtist.getByTrack(track.id);
                return artists.map(artist => artist.name).join(", ");
            })
        );

        tracks.forEach((track, index) => {
            track.artists = tracksArtists[index].split(", ");
        });
        return res.status(200).json(new ApiResponse(200, tracks, "All Tracks fetched successfully"));
    } catch (error) {
        console.error("Error in getAllTracks:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const getAllAlbums = async (req, res) => {
    try {
        const albums = await Album.findAll();

        // Get artists for each album
        const albumsArtists = await Promise.all(
            albums.map(async (album) => {
                const authors = await AlbumAuthor.getByAlbum(album.id);
                return authors.map(author => author.name).join(", ");
            })
        );

        albums.forEach((album, index) => {
            album.artists = albumsArtists[index].split(", ");
        });

        // Get total tracks for each album
        const albumsTotalTracks = await Promise.all(
            albums.map(async (album) => {
                const albumTotalTracks = await Album.getTracks(album.id);
                return albumTotalTracks.length;
            })
        );

        // Attach artists and totalTracks to each album
        albums.forEach((album, index) => {
            album.artists = albumsArtists[index];
            album.totalTracks = albumsTotalTracks[index];
        });

        return res.status(200).json(new ApiResponse(200, albums, "All Albums fetched successfully"));
    } catch (error) {
        console.error("Error in getAllAlbums:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const getAllPodcasts = async (req, res) => {
    try {
        const podcasts = await Podcast.findAll();
        return res.status(200).json(new ApiResponse(200, podcasts, "All Podcasts fetched successfully"));
    } catch (error) {
        console.error("Error in getAllPodcasts:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const getAllEpisodes = async (req, res) => {
    try {
        const episodes = await Episode.findAll();

        const episodesPodcasts = await Promise.all(
            episodes.map(async (episode) => {
                const podcast = await Podcast.findById(episode.podcast_id);
                return podcast.title;
            })
        );

        episodes.forEach((episode, index) => {
            episode.podcastName = episodesPodcasts[index];
        });
        return res.status(200).json(new ApiResponse(200, episodes, "All Episodes fetched successfully"));
    } catch (error) {
        console.error("Error in getAllEpisodes:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

import User from "../models/User.model.js";

export const getAdminStats = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM get_admin_stats()');
        const stats = result.rows[0];

        return res.status(200).json(new ApiResponse(200, {
            totalSongs: parseInt(stats.total_songs),
            totalAlbums: parseInt(stats.total_albums),
            totalUsers: parseInt(stats.total_users),
            totalArtists: parseInt(stats.total_artists),
            totalGenres: parseInt(stats.total_genres),
            totalPodcasts: parseInt(stats.total_podcasts),
            totalEpisodes: parseInt(stats.total_episodes)
        }, "Stats fetched successfully"));
    } catch (error) {
        console.error("Error in getAdminStats:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}


export const checkAdmin = async (req, res) => {
    try {
        return res.status(200).json(new ApiResponse(200, { admin: true }, "Admin"));
    } catch (error) {
        console.error("Error in checkAdmin:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}


export const createSong = async (req, res) => {
    try {
        if (!req.files || !req.files.audio || !req.files.imageFile) {
            return res.status(400).json(new ApiError(400, "Audio and Image files are required"));
        }

        const audioFile = Array.isArray(req.files.audio) ? req.files.audio[0] : req.files.audio;
        const imageFile = Array.isArray(req.files.imageFile) ? req.files.imageFile[0] : req.files.imageFile;

        const audioUrl = await uploadOnCloudinary(audioFile.tempFilePath);
        const imageUrl = await uploadOnCloudinary(imageFile.tempFilePath);

        if (!audioUrl) {
            return res.status(400).json(new ApiError(400, "Audio file upload failed"));
        }

        // Validate required fields
        if (!req.body.name || !req.body.duration) {
            return res.status(400).json(new ApiError(400, "Name and Duration are required"));
        }

        // Handle album_id - frontend sends it directly as a string or doesn't send it at all for singles
        const albumId = (req.body.album_id && req.body.album_id !== "none") ? req.body.album_id : null;

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Parse artists and genres
            let artistData = null;
            if (req.body.artists) {
                const artists = typeof req.body.artists === 'string' ? JSON.parse(req.body.artists) : req.body.artists;
                if (Array.isArray(artists)) {
                    artistData = JSON.stringify(artists.map(a => ({ id: a.id, role: a.role || "Primary" })));
                }
            }

            let genreIds = null;
            if (req.body.genres) {
                const genres = typeof req.body.genres === 'string' ? JSON.parse(req.body.genres) : req.body.genres;
                if (Array.isArray(genres)) {
                    genreIds = genres.map(g => g.id);
                }
            }

            // Call the procedure
            const result = await client.query(
                `CALL create_track_with_relations($1, $2, $3, $4, $5, $6, $7, $8, $9, null)`,
                [
                    albumId,
                    req.body.name,
                    req.body.duration,
                    audioUrl?.url,
                    imageUrl?.url || null,
                    req.body.track_number || null,
                    req.body.is_explicit || false,
                    artistData,
                    genreIds
                ]
            );

            // Fetch the newly created track
            const out_track_id = result.rows[0]?.out_track_id;

            // Note: Procedures returning INOUT params might return the variables directly
            let songId = out_track_id;
            if (!songId && result.rows.length > 0) {
                songId = Object.values(result.rows[0])[0];
            }

            let song = null;
            if (songId) {
                song = await Track.findById(songId);
            }

            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, song || { id: songId }, "Song created successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error executing create_track_with_relations:", error);
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in createSong:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const deleteSong = async (req, res) => {
    try {
        const songId = req.params.id;
        if (!songId) {
            return res.status(400).json(new ApiError(400, "Song ID is required"));
        }
        const findsong = await Track.findById(songId);
        if (!findsong) {
            return res.status(404).json(new ApiError(404, "Song not found"));
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const song = await Track.delete(songId, client);
            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, song, "Song deleted successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in deleteSong:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}





// Albums related methods

export const createAlbum = async (req, res) => {
    try {
        if (!req.files || !req.files.imageFile) {
            return res.status(400).json(new ApiError(400, "Image file is required"));
        }

        // 1. Validate inputs first
        let parsedArtists = [];
        if (req.body.artists) {
            parsedArtists = typeof req.body.artists === 'string' ? JSON.parse(req.body.artists) : req.body.artists;
            if (Array.isArray(parsedArtists)) {
                for (const artist of parsedArtists) {
                    if (!artist.id) {
                        return res.status(400).json(new ApiError(400, "Invalid artist ID"));
                    }
                    const artistExists = await Artist.findById(artist.id);
                    if (!artistExists) {
                        return res.status(404).json(new ApiError(404, "Artist not found"));
                    }
                }
            }
        }

        let parsedGenres = [];
        if (req.body.genres) {
            parsedGenres = typeof req.body.genres === 'string' ? JSON.parse(req.body.genres) : req.body.genres;
            if (Array.isArray(parsedGenres)) {
                for (const genre of parsedGenres) {
                    if (!genre.id) {
                        return res.status(400).json(new ApiError(400, "Invalid genre ID"));
                    }
                    const genreExists = await Genre.findById(genre.id);
                    if (!genreExists) {
                        return res.status(404).json(new ApiError(404, "Genre not found"));
                    }
                }
            }
        }

        const imageFile = Array.isArray(req.files.imageFile) ? req.files.imageFile[0] : req.files.imageFile;

        const imageUrl = await uploadOnCloudinary(imageFile.tempFilePath);
        if (!imageUrl) {
            return res.status(400).json(new ApiError(400, "Image upload failed"));
        }
        if (!req.body?.name) {
            return res.status(400).json(new ApiError(400, "Name is required"));
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const artistIds = parsedArtists.length > 0 ? parsedArtists.map(a => a.id) : null;
            const genreIds = parsedGenres.length > 0 ? parsedGenres.map(g => g.id) : null;

            const result = await client.query(
                `CALL create_album_with_relations($1, $2, $3, $4, null)`,
                [
                    req.body.name,
                    imageUrl?.url,
                    artistIds,
                    genreIds
                ]
            );

            // Fetch the newly created album
            let albumId = result.rows[0]?.out_album_id || result.rows[0]?.id || result.rows[0]?.[result.fields?.find(f => f.name.includes("id"))?.name];
            if (!albumId && result.rows.length > 0) {
                albumId = Object.values(result.rows[0])[0];
            }

            let album = null;
            if (albumId) {
                album = await Album.findById(albumId);
            }

            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, album || { id: albumId }, "Album created successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error executing create_album_with_relations:", error);
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in createAlbum:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const deleteAlbum = async (req, res) => {
    try {
        const albumId = req.params.id;
        if (!albumId) {
            return res.status(400).json(new ApiError(400, "Album ID is required"));
        }
        const findAlbum = await Album.findById(albumId);
        if (!findAlbum) {
            return res.status(404).json(new ApiError(404, "Album not found"));
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const album = await Album.delete(albumId, client);
            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, album, "Album deleted successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in deleteAlbum:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}









// Artists related methods

export const createArtist = async (req, res) => {
    try {
        if (!req.files || !req.files.imageFile) {
            return res.status(400).json(new ApiError(400, "Image file is required"));
        }
        const imageFile = Array.isArray(req.files.imageFile) ? req.files.imageFile[0] : req.files.imageFile;

        const imageUrl = await uploadOnCloudinary(imageFile.tempFilePath);
        if (!imageUrl) {
            return res.status(400).json(new ApiError(400, "Image upload failed"));
        }
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const artist = await Artist.create({
                name: req.body.name || null,
                image: imageUrl?.url || null,
                bio: req.body.bio || null
            }, client);
            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, artist, "Artist created successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in createArtist:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const deleteArtist = async (req, res) => {
    try {
        const artistId = req.params.id;
        if (!artistId) {
            return res.status(400).json(new ApiError(400, "Artist ID is required"));
        }
        const findArtist = await Artist.findById(artistId);
        if (!findArtist) {
            return res.status(404).json(new ApiError(404, "Artist not found"));
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const artist = await Artist.delete(artistId, client);
            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, artist, "Artist deleted successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in deleteArtist:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}





// Genre related methods

export const createGenre = async (req, res) => {
    try {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const genre = await Genre.create({
                name: req.body.name || null,
                theme_color: req.body.theme_color || null
            }, client);
            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, genre, "Genre created successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in createGenre:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const deleteGenre = async (req, res) => {
    try {
        const genreId = req.params.id;
        if (!genreId) {
            return res.status(400).json(new ApiError(400, "Genre ID is required"));
        }
        const findGenre = await Genre.findById(genreId);
        if (!findGenre) {
            return res.status(404).json(new ApiError(404, "Genre not found"));
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const genre = await Genre.delete(genreId, client);
            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, genre, "Genre deleted successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in deleteGenre:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}



// Podcast related methods

export const createPodcast = async (req, res) => {
    try {
        if (!req.files || !req.files.imageFile) {
            return res.status(400).json(new ApiError(400, "Image file is required"));
        }
        const imageFile = Array.isArray(req.files.imageFile) ? req.files.imageFile[0] : req.files.imageFile;

        const imageUrl = await uploadOnCloudinary(imageFile.tempFilePath);
        if (!req.body?.title) {
            return res.status(400).json(new ApiError(400, "Title is required"));
        }
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const podcast = await Podcast.create({
                title: req.body.title,
                description: req.body.description || null,
                cover_image: imageUrl?.url || null,
                host_name: req.body.host || null
            }, client);

            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, podcast, "Podcast created successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in createPodcast:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const deletePodcast = async (req, res) => {
    try {
        const podcastId = req.params.id;
        if (!podcastId) {
            return res.status(400).json(new ApiError(400, "Podcast ID is required"));
        }
        const findPodcast = await Podcast.findById(podcastId);
        if (!findPodcast) {
            return res.status(404).json(new ApiError(404, "Podcast not found"));
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const podcast = await Podcast.delete(podcastId, client);
            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, podcast, "Podcast deleted successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in deletePodcast:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const UploadEpisodeToPodcasts = async (req, res) => {
    try {
        if (!req.files || !req.files.audioFile) {
            return res.status(400).json(new ApiError(400, "Audio file is required"));
        }
        const audioFile = Array.isArray(req.files.audioFile) ? req.files.audioFile[0] : req.files.audioFile;

        const audioUrl = await uploadOnCloudinary(audioFile.tempFilePath);
        if (!req.body?.title) {
            return res.status(400).json(new ApiError(400, "Title is required"));
        }

        // Parse podcast if it's a JSON string (from FormData)
        let podcastData = req.body.podcast;
        if (typeof podcastData === 'string') {
            podcastData = JSON.parse(podcastData);
        }

        const podcastId = podcastData?.id || req.params?.id;

        if (!podcastId) {
            return res.status(400).json(new ApiError(400, "Podcast ID is required"));
        }
        const podcast = await Podcast.findById(podcastId);
        if (!podcast) {
            return res.status(404).json(new ApiError(404, "Podcast not found"));
        }
        if (!audioUrl?.url) {
            return res.status(400).json(new ApiError(400, "Audio URL is required"));
        }
        if (!req.body?.duration) {
            return res.status(400).json(new ApiError(400, "Duration is required"));
        }
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const episode = await Episode.create({
                podcast_id: podcastId,
                title: req.body.title,
                description: req.body.description || null,
                duration: req.body.duration,
                audio_path: audioUrl?.url,
                release_date: req.body.createdAt || new Date()
            }, client);
            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, episode, "Episode created successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in UploadEpisodeToPodcasts:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const deleteEpisode = async (req, res) => {
    try {
        const episodeId = req.params.episode_id;
        const podcastId = req.params.id;
        // console.log("Deleting episode with ID:", episodeId);
        // console.log("All params:", req.params);

        if (!episodeId) {
            return res.status(400).json(new ApiError(400, "Episode ID is required"));
        }
        const findEpisode = await Episode.findById(episodeId);
        console.log("findEpisode:", findEpisode);
        if (!findEpisode) {
            return res.status(404).json(new ApiError(404, "Episode not found"));
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const episode = await Episode.delete(episodeId, client);
            await client.query('COMMIT');
            return res.status(200).json(new ApiResponse(200, episode, "Episode deleted successfully"));
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in deleteEpisode:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}




