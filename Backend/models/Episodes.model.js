import db from '../config/database.js';

class Episode {
    // Create a new episode
    static async create({ podcast_id, title, description, duration, audio_path, release_date }) {
        const result = await db.query(
            `INSERT INTO episodes (podcast_id, title, description, duration, audio_path, release_date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
            [podcast_id, title, description, duration, audio_path, release_date]
        );
        return result.rows[0];
    }

    // Find episode by ID
    static async findById(id) {
        const result = await db.query(
            'SELECT * FROM episodes WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Get all episodes
    static async findAll(limit = 50, offset = 0) {
        const result = await db.query(
            'SELECT * FROM episodes ORDER BY release_date DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        return result.rows;
    }

    // Update episode
    static async update(id, { title, description, duration, audio_path, release_date }) {
        const result = await db.query(
            `UPDATE episodes 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description),
           duration = COALESCE($3, duration),
           audio_path = COALESCE($4, audio_path),
           release_date = COALESCE($5, release_date),
           updated_at = NOW()
       WHERE id = $6 
       RETURNING *`,
            [title, description, duration, audio_path, release_date, id]
        );
        return result.rows[0];
    }

    // Delete episode
    static async delete(id) {
        const result = await db.query(
            'DELETE FROM episodes WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }

    // Get episodes by podcast
    static async getByPodcast(podcastId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT * FROM episodes 
       WHERE podcast_id = $1 
       ORDER BY release_date DESC
       LIMIT $2 OFFSET $3`,
            [podcastId, limit, offset]
        );
        return result.rows;
    }

    // Get episode with podcast details
    static async getWithPodcast(episodeId) {
        const result = await db.query(
            `SELECT e.*, p.title as podcast_title, p.host_name, p.cover_image as podcast_cover
       FROM episodes e
       INNER JOIN podcasts p ON e.podcast_id = p.id
       WHERE e.id = $1`,
            [episodeId]
        );
        return result.rows[0];
    }

    // Search episodes
    static async search(query, limit = 20) {
        const result = await db.query(
            `SELECT e.*, p.title as podcast_title
       FROM episodes e
       INNER JOIN podcasts p ON e.podcast_id = p.id
       WHERE e.title ILIKE $1 OR e.description ILIKE $1
       ORDER BY e.release_date DESC 
       LIMIT $2`,
            [`%${query}%`, limit]
        );
        return result.rows;
    }

    // Get recent episodes across all podcasts
    static async getRecent(limit = 20) {
        const result = await db.query(
            `SELECT e.*, p.title as podcast_title, p.cover_image as podcast_cover
       FROM episodes e
       INNER JOIN podcasts p ON e.podcast_id = p.id
       ORDER BY e.release_date DESC
       LIMIT $1`,
            [limit]
        );
        return result.rows;
    }

    // Get recent episodes from followed podcasts
    static async getRecentFromFollowedPodcasts(userId, limit = 20) {
        const result = await db.query(
            `SELECT e.*, p.title as podcast_title, p.cover_image as podcast_cover
       FROM episodes e
       INNER JOIN podcasts p ON e.podcast_id = p.id
       INNER JOIN podcast_followers pf ON p.id = pf.podcast_id
       WHERE pf.user_id = $1
       ORDER BY e.release_date DESC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    // Get episode count for a podcast
    static async getCountByPodcast(podcastId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM episodes WHERE podcast_id = $1',
            [podcastId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get total count of episodes
    static async count() {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM episodes'
        );
        return parseInt(result.rows[0].count);
    }
}

export default Episode;