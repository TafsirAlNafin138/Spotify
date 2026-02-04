import db from '../config/database.js';

class ListeningHistoryEpisode {
    // Create or update listening history for an episode
    static async upsert({ user_id, episode_id, progress_seconds, is_completed }) {
        const result = await db.query(
            `INSERT INTO listening_history_episodes (user_id, episode_id, progress_seconds, is_completed, last_played_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       ON CONFLICT (user_id, episode_id) DO UPDATE 
       SET progress_seconds = EXCLUDED.progress_seconds,
           is_completed = EXCLUDED.is_completed,
           last_played_at = NOW()
       RETURNING *`,
            [user_id, episode_id, progress_seconds, is_completed]
        );
        return result.rows[0];
    }

    // Get listening history for a user
    static async getByUser(userId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT lhe.*, e.title, e.duration, e.audio_path, p.title as podcast_title, p.cover_image
       FROM listening_history_episodes lhe
       INNER JOIN episodes e ON lhe.episode_id = e.id
       INNER JOIN podcasts p ON e.podcast_id = p.id
       WHERE lhe.user_id = $1
       ORDER BY lhe.last_played_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    }

    // Get listening history for a specific episode
    static async getByEpisode(episodeId, userId) {
        const result = await db.query(
            `SELECT * FROM listening_history_episodes 
       WHERE episode_id = $1 AND user_id = $2`,
            [episodeId, userId]
        );
        return result.rows[0];
    }

    // Get recently played episodes
    static async getRecentlyPlayed(userId, limit = 6) {
        const result = await db.query(
            `SELECT lhe.*, e.title, e.duration, e.audio_path, p.title as podcast_title, p.cover_image
       FROM listening_history_episodes lhe
       INNER JOIN episodes e ON lhe.episode_id = e.id
       INNER JOIN podcasts p ON e.podcast_id = p.id
       WHERE lhe.user_id = $1
       ORDER BY lhe.last_played_at DESC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    // Get completed episodes
    static async getCompleted(userId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT lhe.*, e.title, e.duration, e.audio_path, p.title as podcast_title, p.cover_image
       FROM listening_history_episodes lhe
       INNER JOIN episodes e ON lhe.episode_id = e.id
       INNER JOIN podcasts p ON e.podcast_id = p.id
       WHERE lhe.user_id = $1 AND lhe.is_completed = true
       ORDER BY lhe.last_played_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    }

    // Get in-progress episodes
    static async getInProgress(userId, limit = 50) {
        const result = await db.query(
            `SELECT lhe.*, e.title, e.duration, e.audio_path, p.title as podcast_title, p.cover_image
       FROM listening_history_episodes lhe
       INNER JOIN episodes e ON lhe.episode_id = e.id
       INNER JOIN podcasts p ON e.podcast_id = p.id
       WHERE lhe.user_id = $1 AND lhe.is_completed = false AND lhe.progress_seconds > 0
       ORDER BY lhe.last_played_at DESC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    // Update progress for an episode
    static async updateProgress(userId, episodeId, progressSeconds) {
        const result = await db.query(
            `UPDATE listening_history_episodes 
       SET progress_seconds = $1, last_played_at = NOW()
       WHERE user_id = $2 AND episode_id = $3
       RETURNING *`,
            [progressSeconds, userId, episodeId]
        );
        return result.rows[0];
    }

    // Mark episode as completed
    static async markAsCompleted(userId, episodeId) {
        const result = await db.query(
            `UPDATE listening_history_episodes 
       SET is_completed = true, last_played_at = NOW()
       WHERE user_id = $1 AND episode_id = $2
       RETURNING *`,
            [userId, episodeId]
        );
        return result.rows[0];
    }

    // Delete listening history entry
    static async delete(userId, episodeId) {
        const result = await db.query(
            'DELETE FROM listening_history_episodes WHERE user_id = $1 AND episode_id = $2 RETURNING *',
            [userId, episodeId]
        );
        return result.rows[0];
    }

    // Clear all listening history for a user
    static async clearHistory(userId) {
        const result = await db.query(
            'DELETE FROM listening_history_episodes WHERE user_id = $1',
            [userId]
        );
        return result.rowCount;
    }

    // Get listening stats for a user
    static async getStats(userId) {
        const result = await db.query(
            `SELECT 
        COUNT(*) as total_episodes,
        COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_episodes,
        COUNT(CASE WHEN is_completed = false AND progress_seconds > 0 THEN 1 END) as in_progress_episodes,
        COALESCE(SUM(progress_seconds), 0) as total_listening_time
       FROM listening_history_episodes
       WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0];
    }

    // Get most listened podcasts by user
    static async getMostListenedPodcasts(userId, limit = 10) {
        const result = await db.query(
            `SELECT p.*, COUNT(*) as episode_count
       FROM podcasts p
       INNER JOIN episodes e ON p.id = e.podcast_id
       INNER JOIN listening_history_episodes lhe ON e.id = lhe.episode_id
       WHERE lhe.user_id = $1
       GROUP BY p.id
       ORDER BY episode_count DESC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    // Get listening history by podcast
    static async getByPodcast(userId, podcastId, limit = 50) {
        const result = await db.query(
            `SELECT lhe.*, e.title, e.duration, e.audio_path
       FROM listening_history_episodes lhe
       INNER JOIN episodes e ON lhe.episode_id = e.id
       WHERE lhe.user_id = $1 AND e.podcast_id = $2
       ORDER BY lhe.last_played_at DESC
       LIMIT $3`,
            [userId, podcastId, limit]
        );
        return result.rows;
    }

    static async getByUserWithPagination(userId, limit = 10, offset = 0) {
        const result = await db.query(
            `SELECT lhe.*, e.title, e.duration, e.audio_path, p.title as podcast_title, p.cover_image
       FROM listening_history_episodes lhe
       INNER JOIN episodes e ON lhe.episode_id = e.id
       INNER JOIN podcasts p ON e.podcast_id = p.id
       WHERE lhe.user_id = $1
       ORDER BY lhe.last_played_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    }
}

export default ListeningHistoryEpisode;