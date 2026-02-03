import db from '../config/database.js';

class ListeningHistoryTrack {
    // Create or update listening history for a track
    static async upsert({ user_id, track_id, progress_seconds, is_completed }) {
        const result = await db.query(
            `INSERT INTO listening_history_tracks (user_id, track_id, progress_seconds, is_completed, last_played_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       ON CONFLICT (user_id, track_id) DO UPDATE 
       SET progress_seconds = EXCLUDED.progress_seconds,
           is_completed = EXCLUDED.is_completed,
           last_played_at = NOW()
       RETURNING *`,
            [user_id, track_id, progress_seconds, is_completed]
        );
        return result.rows[0];
    }

    // Get listening history for a user
    static async getByUser(userId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT lht.*, t.name, t.duration, t.image, t.path
       FROM listening_history_tracks lht
       INNER JOIN tracks t ON lht.track_id = t.id
       WHERE lht.user_id = $1
       ORDER BY lht.last_played_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    }

    // Get listening history for a specific track
    static async getByTrack(trackId, userId) {
        const result = await db.query(
            `SELECT * FROM listening_history_tracks 
       WHERE track_id = $1 AND user_id = $2`,
            [trackId, userId]
        );
        return result.rows[0];
    }

    // Get recently played tracks
    static async getRecentlyPlayed(userId, limit = 20) {
        const result = await db.query(
            `SELECT lht.*, t.name, t.duration, t.image, t.path
       FROM listening_history_tracks lht
       INNER JOIN tracks t ON lht.track_id = t.id
       WHERE lht.user_id = $1
       ORDER BY lht.last_played_at DESC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    // Get completed tracks
    static async getCompleted(userId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT lht.*, t.name, t.duration, t.image, t.path
       FROM listening_history_tracks lht
       INNER JOIN tracks t ON lht.track_id = t.id
       WHERE lht.user_id = $1 AND lht.is_completed = true
       ORDER BY lht.last_played_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    }

    // Get in-progress tracks
    static async getInProgress(userId, limit = 50) {
        const result = await db.query(
            `SELECT lht.*, t.name, t.duration, t.image, t.path
       FROM listening_history_tracks lht
       INNER JOIN tracks t ON lht.track_id = t.id
       WHERE lht.user_id = $1 AND lht.is_completed = false AND lht.progress_seconds > 0
       ORDER BY lht.last_played_at DESC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    // Update progress for a track
    static async updateProgress(userId, trackId, progressSeconds) {
        const result = await db.query(
            `UPDATE listening_history_tracks 
       SET progress_seconds = $1, last_played_at = NOW()
       WHERE user_id = $2 AND track_id = $3
       RETURNING *`,
            [progressSeconds, userId, trackId]
        );
        return result.rows[0];
    }

    // Mark track as completed
    static async markAsCompleted(userId, trackId) {
        const result = await db.query(
            `UPDATE listening_history_tracks 
       SET is_completed = true, last_played_at = NOW()
       WHERE user_id = $1 AND track_id = $2
       RETURNING *`,
            [userId, trackId]
        );
        return result.rows[0];
    }

    // Delete listening history entry
    static async delete(userId, trackId) {
        const result = await db.query(
            'DELETE FROM listening_history_tracks WHERE user_id = $1 AND track_id = $2 RETURNING *',
            [userId, trackId]
        );
        return result.rows[0];
    }

    // Clear all listening history for a user
    static async clearHistory(userId) {
        const result = await db.query(
            'DELETE FROM listening_history_tracks WHERE user_id = $1',
            [userId]
        );
        return result.rowCount;
    }

    // Get listening stats for a user
    static async getStats(userId) {
        const result = await db.query(
            `SELECT 
        COUNT(*) as total_tracks,
        COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_tracks,
        COUNT(CASE WHEN is_completed = false AND progress_seconds > 0 THEN 1 END) as in_progress_tracks,
        COALESCE(SUM(progress_seconds), 0) as total_listening_time
       FROM listening_history_tracks
       WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0];
    }

    // Get most played tracks by user
    static async getMostPlayed(userId, limit = 10) {
        const result = await db.query(
            `SELECT t.*, COUNT(*) as play_count
       FROM tracks t
       INNER JOIN listening_history_tracks lht ON t.id = lht.track_id
       WHERE lht.user_id = $1
       GROUP BY t.id
       ORDER BY play_count DESC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }
}

export default ListeningHistoryTrack;