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
        
        if (category === 'Songs') {
            if (metric === 'Most Liked') {
                query = `
                    SELECT t.id, t.name as title, t.image, 
                           (SELECT string_agg(a.name, ', ') FROM artists a 
                            JOIN track_artists ta ON a.id = ta.artist_id 
                            WHERE ta.track_id = t.id) as subtitle,
                           COUNT(l.user_id) as value, 'Likes' as value_label
                    FROM tracks t
                    LEFT JOIN likes l ON t.id = l.track_id
                    ${genre !== 'All Genres' ? 'JOIN track_genres tg ON t.id = tg.track_id JOIN genres g ON tg.genre_id = g.id' : ''}
                    WHERE t.name ILIKE $1
                    ${genre !== 'All Genres' ? 'AND g.name = $2' : ''}
                    GROUP BY t.id
                    ORDER BY value DESC
                    LIMIT 10
                `;
                if (genre !== 'All Genres') params.push(genre);
            } 
            else if (metric === 'Top Played') {
                // Using global play_count column for "Top Played"
                query = `
                    SELECT t.id, t.name as title, t.image,
                           (SELECT string_agg(a.name, ', ') FROM artists a
                            JOIN track_artists ta ON a.id = ta.artist_id
                            WHERE ta.track_id = t.id) as subtitle,
                           t.play_count as value, 'Plays' as value_label
                    FROM tracks t
                    ${genre !== 'All Genres' ? 'JOIN track_genres tg ON t.id = tg.track_id JOIN genres g ON tg.genre_id = g.id' : ''}
                    WHERE t.name ILIKE $1
                    ${genre !== 'All Genres' ? 'AND g.name = $2' : ''}
                    ORDER BY t.play_count DESC
                    LIMIT 10
                `;
                if (genre !== 'All Genres') params.push(genre);
            }
            else if (metric === 'Least Listening Time') {
                query = `
                    SELECT t.id, t.name as title, t.image,
                           (SELECT string_agg(a.name, ', ') FROM artists a
                            JOIN track_artists ta ON a.id = ta.artist_id
                            WHERE ta.track_id = t.id) as subtitle,
                           COALESCE(SUM(lht.progress_seconds), 0) as value, 'Listening Time (s)' as value_label
                    FROM tracks t
                    LEFT JOIN listening_history_tracks lht ON t.id = lht.track_id
                    ${genre !== 'All Genres' ? 'JOIN track_genres tg ON t.id = tg.track_id JOIN genres g ON tg.genre_id = g.id' : ''}
                    WHERE t.name ILIKE $1
                    ${genre !== 'All Genres' ? 'AND g.name = $2' : ''}
                    GROUP BY t.id
                    ORDER BY value ASC
                    LIMIT 10
                `;
                if (genre !== 'All Genres') params.push(genre);
            }
            else if (metric === 'Trending') {
                // Trending: 2pts per new like, 1pt per old like, 0.5pts per play
                query = `
                    SELECT t.id, t.name as title, t.image,
                           (SELECT string_agg(a.name, ', ') FROM artists a
                            JOIN track_artists ta ON a.id = ta.artist_id
                            WHERE ta.track_id = t.id) as subtitle,
                           (COALESCE(SUM(CASE WHEN t.created_at >= NOW() - INTERVAL '7 days' THEN 2 ELSE 1 END), 0) + (t.play_count * 0.5)) as value, 
                           'Trending Points' as value_label
                    FROM tracks t
                    LEFT JOIN likes l ON t.id = l.track_id
                    ${genre !== 'All Genres' ? 'JOIN track_genres tg ON t.id = tg.track_id JOIN genres g ON tg.genre_id = g.id' : ''}
                    WHERE t.name ILIKE $1
                    ${genre !== 'All Genres' ? 'AND g.name = $2' : ''}
                    GROUP BY t.id
                    ORDER BY value DESC
                    LIMIT 10
                `;
                if (genre !== 'All Genres') params.push(genre);
            }
        }

        if (!query) {
             return res.status(400).json(new ApiError(400, "Invalid category or metric"));
        }

        const dbResult = await db.query(query, params);
        const results = dbResult.rows.map((row, index) => ({
            rank: index + 1,
            ...row
        }));

        return res.status(200).json(new ApiResponse(200, results, "Leaderboard fetched successfully"));
    } catch (error) {
        console.error("Error in getLeaderboard:", error);
        return res.status(500).json(new ApiError(500, "Internal server error", error));
    }
}