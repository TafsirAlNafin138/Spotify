import db from '../config/database.js';

class Like {
    // Like a track
    static async likeTrack(userId, trackId) {
        const result = await db.query(
            `INSERT INTO likes (user_id, track_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, track_id) DO NOTHING
       RETURNING *`,
            [userId, trackId]
        );
        return result.rows[0];
    }

    // Unlike a track
    static async unlikeTrack(userId, trackId) {
        const result = await db.query(
            'DELETE FROM likes WHERE user_id = $1 AND track_id = $2 RETURNING *',
            [userId, trackId]
        );
        return result.rows[0];
    }

    // Check if user liked a track
    static async isLiked(userId, trackId) {
        const result = await db.query(
            'SELECT EXISTS(SELECT 1 FROM likes WHERE user_id = $1 AND track_id = $2)',
            [userId, trackId]
        );
        return result.rows[0].exists;
    }

    // Get all liked tracks by a user
    static async getLikedTracks(userId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT t.*, l.like_date_time
       FROM tracks t
       INNER JOIN likes l ON t.id = l.track_id
       WHERE l.user_id = $1
       ORDER BY l.like_date_time DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    }

    // Get all users who liked a track
    static async getTrackLikes(trackId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT u.*, l.like_date_time
       FROM users u
       INNER JOIN likes l ON u.id = l.user_id
       WHERE l.track_id = $1
       ORDER BY l.like_date_time DESC
       LIMIT $2 OFFSET $3`,
            [trackId, limit, offset]
        );
        return result.rows;
    }

    // Get like count for a track
    static async getLikeCount(trackId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM likes WHERE track_id = $1',
            [trackId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get total likes for a user
    static async getUserLikeCount(userId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM likes WHERE user_id = $1',
            [userId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get recently liked tracks by user
    static async getRecentlyLiked(userId, limit = 10) {
        const result = await db.query(
            `SELECT t.*, l.like_date_time
       FROM tracks t
       INNER JOIN likes l ON t.id = l.track_id
       WHERE l.user_id = $1
       ORDER BY l.like_date_time DESC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    // Bulk check if user liked multiple tracks
    static async checkMultipleLikes(userId, trackIds) {
        const result = await db.query(
            `SELECT track_id, true as is_liked
       FROM likes
       WHERE user_id = $1 AND track_id = ANY($2)`,
            [userId, trackIds]
        );
        return result.rows;
    }

    // Get liked tracks by genre for a user
    static async getLikedTracksByGenre(userId, genreId, limit = 50) {
        const result = await db.query(
            `SELECT t.*, l.like_date_time
       FROM tracks t
       INNER JOIN likes l ON t.id = l.track_id
       INNER JOIN track_genres tg ON t.id = tg.track_id
       WHERE l.user_id = $1 AND tg.genre_id = $2
       ORDER BY l.like_date_time DESC
       LIMIT $3`,
            [userId, genreId, limit]
        );
        return result.rows;
    }

    // Get liked tracks by artist for a user
    static async getLikedTracksByArtist(userId, artistId, limit = 50) {
        const result = await db.query(
            `SELECT t.*, l.like_date_time
       FROM tracks t
       INNER JOIN likes l ON t.id = l.track_id
       INNER JOIN track_artists ta ON t.id = ta.track_id
       WHERE l.user_id = $1 AND ta.artist_id = $2
       ORDER BY l.like_date_time DESC
       LIMIT $3`,
            [userId, artistId, limit]
        );
        return result.rows;
    }
}

export default Like;