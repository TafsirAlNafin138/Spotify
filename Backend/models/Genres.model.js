import db from '../config/database.js';

class Genre {
    // Create a new genre
    static async create({ name, theme_color }) {
        const result = await db.query(
            `INSERT INTO genres (name, theme_color) 
       VALUES ($1, $2) 
       RETURNING *`,
            [name, theme_color]
        );
        return result.rows[0];
    }

    // Find genre by ID
    static async findById(id) {
        const result = await db.query(
            'SELECT * FROM genres WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Find genre by name
    static async findByName(name) {
        const result = await db.query(
            'SELECT * FROM genres WHERE name = $1',
            [name]
        );
        return result.rows[0];
    }

    // Get all genres
    static async findAll() {
        const result = await db.query(
            'SELECT * FROM genres ORDER BY name ASC'
        );
        return result.rows;
    }

    // Update genre
    static async update(id, { name }) {
        const result = await db.query(
            `UPDATE genres 
       SET name = $1 
       WHERE id = $2 
       RETURNING *`,
            [name, id]
        );
        return result.rows[0];
    }

    // Delete genre
    static async delete(id) {
        const result = await db.query(
            'DELETE FROM genres WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }

    // Get tracks by genre
    static async getTracks(genreId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT t.*
       FROM tracks t
       INNER JOIN track_genres tg ON t.id = tg.track_id
       WHERE tg.genre_id = $1
       ORDER BY t.play_count DESC
       LIMIT $2 OFFSET $3`,
            [genreId, limit, offset]
        );
        return result.rows;
    }

    // Get albums by genre
    static async getAlbums(genreId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT a.*
       FROM albums a
       INNER JOIN album_genres ag ON a.id = ag.album_id
       WHERE ag.genre_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
            [genreId, limit, offset]
        );
        return result.rows;
    }

    // Get genre stats
    static async getStats(genreId) {
        const result = await db.query(
            `SELECT 
        (SELECT COUNT(*) FROM track_genres WHERE genre_id = $1) as track_count,
        (SELECT COUNT(*) FROM album_genres WHERE genre_id = $1) as album_count`,
            [genreId]
        );
        return result.rows[0];
    }

    // Search genres by name
    static async search(query, limit = 20) {
        const result = await db.query(
            `SELECT * FROM genres 
       WHERE name ILIKE $1 
       ORDER BY name ASC 
       LIMIT $2`,
            [`%${query}%`, limit]
        );
        return result.rows;
    }

    // Check if genre name exists
    static async nameExists(name) {
        const result = await db.query(
            'SELECT EXISTS(SELECT 1 FROM genres WHERE name = $1)',
            [name]
        );
        return result.rows[0].exists;
    }

    // Get total count of genres
    static async count() {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM genres'
        );
        return parseInt(result.rows[0].count, 10);
    }
}

export default Genre;