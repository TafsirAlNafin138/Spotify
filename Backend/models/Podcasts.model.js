import db from '../config/database.js';

class Podcast {
    // Create a new podcast
    static async create({ title, host_name, description, cover_image }) {
        const result = await db.query(
            `INSERT INTO podcasts (title, host_name, description, cover_image) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
            [title, host_name, description, cover_image]
        );
        return result.rows[0];
    }

    // Find podcast by ID
    static async findById(id) {
        const result = await db.query(
            'SELECT * FROM podcasts WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Get all podcasts
    static async findAll(limit = 50, offset = 0) {
        const result = await db.query(
            'SELECT * FROM podcasts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        return result.rows;
    }

    // Update podcast
    static async update(id, { title, host_name, description, cover_image }) {
        const result = await db.query(
            `UPDATE podcasts 
       SET title = COALESCE($1, title), 
           host_name = COALESCE($2, host_name),
           description = COALESCE($3, description),
           cover_image = COALESCE($4, cover_image),
           updated_at = NOW()
       WHERE id = $5 
       RETURNING *`,
            [title, host_name, description, cover_image, id]
        );
        return result.rows[0];
    }

    // Delete podcast
    static async delete(id) {
        const result = await db.query(
            'DELETE FROM podcasts WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }

    // Get all episodes for a podcast
    static async getEpisodes(podcastId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT * FROM episodes 
       WHERE podcast_id = $1 
       ORDER BY release_date DESC
       LIMIT $2 OFFSET $3`,
            [podcastId, limit, offset]
        );
        return result.rows;
    }

    // Get followers count
    static async getFollowersCount(podcastId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM podcast_followers WHERE podcast_id = $1',
            [podcastId]
        );
        return parseInt(result.rows[0].count);
    }

    // Check if user follows podcast
    static async isFollowedBy(podcastId, userId) {
        const result = await db.query(
            'SELECT EXISTS(SELECT 1 FROM podcast_followers WHERE podcast_id = $1 AND user_id = $2)',
            [podcastId, userId]
        );
        return result.rows[0].exists;
    }

    // Search podcasts
    static async search(query, limit = 20) {
        const result = await db.query(
            `SELECT * FROM podcasts 
       WHERE title ILIKE $1 OR host_name ILIKE $1 OR description ILIKE $1
       ORDER BY title ASC 
       LIMIT $2`,
            [`%${query}%`, limit]
        );
        return result.rows;
    }

    // Get podcast stats
    static async getStats(podcastId) {
        const result = await db.query(
            `SELECT 
        (SELECT COUNT(*) FROM episodes WHERE podcast_id = $1) as episode_count,
        (SELECT COUNT(*) FROM podcast_followers WHERE podcast_id = $1) as followers_count,
        (SELECT COALESCE(SUM(duration), 0) FROM episodes WHERE podcast_id = $1) as total_duration`,
            [podcastId]
        );
        return result.rows[0];
    }

    // Get popular podcasts
    static async getPopular(limit = 20) {
        const result = await db.query(
            `SELECT p.*, COUNT(pf.user_id) as follower_count
       FROM podcasts p
       LEFT JOIN podcast_followers pf ON p.id = pf.podcast_id
       GROUP BY p.id
       ORDER BY follower_count DESC
       LIMIT $1`,
            [limit]
        );
        return result.rows;
    }

    // Get podcast with full details
    static async getFullDetails(podcastId) {
        const podcast = await this.findById(podcastId);
        if (!podcast) return null;

        const [episodes, stats] = await Promise.all([
            this.getEpisodes(podcastId, 10),
            this.getStats(podcastId)
        ]);

        return {
            ...podcast,
            episodes,
            ...stats
        };
    }

    // Get total count of podcasts
    static async count() {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM podcasts'
        );
        return parseInt(result.rows[0].count);
    }
}

export default Podcast;