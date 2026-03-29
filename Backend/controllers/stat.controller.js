import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Track from "../models/Track.model.js";
import Album from "../models/Album.model.js";
import Artist from "../models/Artist.model.js";
import Genre from "../models/Genres.model.js";
import Podcast from "../models/Podcasts.model.js";
import Episode from "../models/Episodes.model.js";
import User from "../models/User.model.js";
import db from "../config/database.js";

export const getStats = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM get_admin_stats()');
        const stats = result.rows[0];

        return res.status(200).json(new ApiResponse(200, {
            tracks: parseInt(stats.total_songs),
            albums: parseInt(stats.total_albums),
            artists: parseInt(stats.total_artists),
            genres: parseInt(stats.total_genres),
            podcasts: parseInt(stats.total_podcasts),
            episodes: parseInt(stats.total_episodes),
            users: parseInt(stats.total_users)
        }, "Stats"));
    } catch (error) {
        console.error("Error in getStats:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}

export const getLeaderboard = async (req, res) => {
    try {
        const {
            category = 'Songs',
            metric = 'Most Liked',
            genre = 'All Genres',
            search = ''
        } = req.query;

        let query = "";
        let params = [`%${search}%`];

        const artistSubquery = `(SELECT string_agg(a.name, ', ') FROM artists a
      JOIN track_artists ta ON a.id = ta.artist_id
      WHERE ta.track_id = t.id) as subtitle`;

        const genreJoin = genre !== 'All Genres'
            ? 'JOIN track_genres tg ON t.id = tg.track_id JOIN genres g ON tg.genre_id = g.id'
            : '';
        const genreWhere = genre !== 'All Genres' ? 'AND g.name = $2' : '';
        if (genre !== 'All Genres') params.push(genre);

        if (category === 'Songs') {
            if (metric === 'Most Liked') {
                query = `
          SELECT t.id, t.name as title, t.image, ${artistSubquery},
            COUNT(l.user_id) as value, 'Likes' as value_label
          FROM tracks t
          LEFT JOIN likes l ON t.id = l.track_id ${genreJoin}
          WHERE t.name ILIKE $1 ${genreWhere}
          GROUP BY t.id ORDER BY value DESC LIMIT 10`;
            }
            else if (metric === 'Top Played') {
                query = `
          SELECT t.id, t.name as title, t.image, ${artistSubquery},
            t.play_count as value, 'Plays' as value_label
          FROM tracks t ${genreJoin}
          WHERE t.name ILIKE $1 ${genreWhere}
          ORDER BY t.play_count DESC LIMIT 10`;
            }
            else if (metric === 'Least Listening Time') {
                query = `
          SELECT t.id, t.name as title, t.image, ${artistSubquery},
            COALESCE(SUM(lht.progress_seconds), 0) as value, 'Listening Time (s)' as value_label
          FROM tracks t
          LEFT JOIN listening_history_tracks lht ON t.id = lht.track_id ${genreJoin}
          WHERE t.name ILIKE $1 ${genreWhere}
          GROUP BY t.id ORDER BY value ASC LIMIT 10`;
            }
            else if (metric === 'Trending') {
                query = `
          SELECT t.id, t.name as title, t.image, ${artistSubquery},
            (COALESCE(SUM(CASE WHEN t.created_at >= NOW() - INTERVAL '7 days' THEN 2 ELSE 1 END), 0) + (t.play_count * 0.5) + (COALESCE(SUM(CASE WHEN l.like_date_time >= NOW() - INTERVAL '7 days' THEN 3 ELSE 1 END), 0))) as value,
            'Trending Points' as value_label
          FROM tracks t
          LEFT JOIN likes l ON t.id = l.track_id ${genreJoin}
          WHERE t.name ILIKE $1 ${genreWhere}
          GROUP BY t.id ORDER BY value DESC LIMIT 10`;
            }
        }

        if (category === 'Artists') {
            if (metric === 'Most Liked') {
                query = `
          SELECT a.id, a.name as title, a.image, 'Artist' as subtitle,
            COUNT(DISTINCT f.user_id) as value, 'Followers' as value_label
          FROM artists a
          LEFT JOIN followers f ON a.id = f.artist_id
          WHERE a.name ILIKE $1
          GROUP BY a.id ORDER BY value DESC LIMIT 10`;
            }
            else if (metric === 'Top Played') {
                query = `
          SELECT a.id, a.name as title, a.image, 'Artist' as subtitle,
            COALESCE(SUM(t.play_count), 0) as value, 'Plays' as value_label
          FROM artists a
          LEFT JOIN track_artists ta ON a.id = ta.artist_id
          LEFT JOIN tracks t ON ta.track_id = t.id
          WHERE a.name ILIKE $1
          GROUP BY a.id ORDER BY value DESC LIMIT 10`;
            }
            else if (metric === 'Least Listening Time') {
                query = `
          SELECT a.id, a.name as title, a.image, 'Artist' as subtitle,
            COALESCE(SUM(lht.progress_seconds), 0) as value, 'Listening Time (s)' as value_label
          FROM artists a
          LEFT JOIN track_artists ta ON a.id = ta.artist_id
          LEFT JOIN listening_history_tracks lht ON ta.track_id = lht.track_id
          WHERE a.name ILIKE $1
          GROUP BY a.id ORDER BY value ASC LIMIT 10`;
            }
            else if (metric === 'Trending') {
                query = `
          SELECT a.id, a.name as title, a.image, 'Artist' as subtitle,
            (COUNT(DISTINCT f.user_id) * 50 + COALESCE(SUM(lht.progress_seconds), 0) * 0.05) as value,
            'Trending Points' as value_label
          FROM artists a
          LEFT JOIN followers f ON a.id = f.artist_id
          LEFT JOIN track_artists ta ON a.id = ta.artist_id
          LEFT JOIN listening_history_tracks lht ON ta.track_id = lht.track_id
          WHERE a.name ILIKE $1
          GROUP BY a.id ORDER BY value DESC LIMIT 10`;
            }
        }

        if (category === 'Podcasts') {
            if (metric === 'Most Liked') {
                query = `
          SELECT p.id, p.title as title, p.cover_image as image, 'Podcast' as subtitle,
            COUNT(DISTINCT fp.user_id) as value, 'Followers' as value_label
          FROM podcasts p
          LEFT JOIN podcast_followers fp ON p.id = fp.podcast_id
          WHERE p.title ILIKE $1
          GROUP BY p.id ORDER BY value DESC LIMIT 10`;
            }
            else if (metric === 'Top Played') {
                query = `
          SELECT p.id, p.title as title, p.cover_image as image, 'Podcast' as subtitle,
            COUNT(lhe.id) as value, 'Plays' as value_label
          FROM podcasts p
          LEFT JOIN episodes e ON p.id = e.podcast_id
          LEFT JOIN listening_history_episodes lhe ON e.id = lhe.episode_id
          WHERE p.title ILIKE $1
          GROUP BY p.id ORDER BY value DESC LIMIT 10`;
            }
            else if (metric === 'Least Listening Time') {
                query = `
          SELECT p.id, p.title as title, p.cover_image as image, 'Podcast' as subtitle,
            COALESCE(SUM(lhe.progress_seconds), 0) as value, 'Listening Time (s)' as value_label
          FROM podcasts p
          LEFT JOIN episodes e ON p.id = e.podcast_id
          LEFT JOIN listening_history_episodes lhe ON e.id = lhe.episode_id
          WHERE p.title ILIKE $1
          GROUP BY p.id ORDER BY value ASC LIMIT 10`;
            }
            else if (metric === 'Trending') {
                query = `
          SELECT p.id, p.title as title, p.cover_image as image, 'Podcast' as subtitle,
            (COUNT(DISTINCT fp.user_id) * 50 + COALESCE(SUM(lhe.progress_seconds), 0) * 0.05) as value,
            'Trending Points' as value_label
          FROM podcasts p
          LEFT JOIN podcast_followers fp ON p.id = fp.podcast_id
          LEFT JOIN episodes e ON p.id = e.podcast_id
          LEFT JOIN listening_history_episodes lhe ON e.id = lhe.episode_id
          WHERE p.title ILIKE $1
          GROUP BY p.id ORDER BY value DESC LIMIT 10`;
            }
        }

        if (!query) return res.status(400).json(new ApiError(400, "Invalid category or metric"));

        const dbResult = await db.query(query, params);
        const results = dbResult.rows.map((row, index) => ({ rank: index + 1, ...row }));

        return res.status(200).json(new ApiResponse(200, results, "Leaderboard fetched successfully"));
    } catch (error) {
        console.error("Error in getLeaderboard:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}