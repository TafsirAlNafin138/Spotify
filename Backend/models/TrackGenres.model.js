import db from '../config/database.js';

class TrackGenre {
    static async create(trackId, genreId, client = db) {
        const result = await client.query(
            `INSERT INTO track_genres (track_id, genre_id) 
       VALUES ($1, $2) 
       ON CONFLICT (track_id, genre_id) DO NOTHING
       RETURNING *`,
            [trackId, genreId]
        );
        return result.rows[0];
    }

    static async delete(trackId, genreId, client = db) {
        const result = await client.query(
            'DELETE FROM track_genres WHERE track_id = $1 AND genre_id = $2 RETURNING *',
            [trackId, genreId]
        );
        return result.rows[0];
    }

    // Get all genres for a track
    static async getByTrack(trackId) {
        const result = await db.query(
            `SELECT g.*
       FROM genres g
       INNER JOIN track_genres tg ON g.id = tg.genre_id
       WHERE tg.track_id = $1
       ORDER BY g.name ASC`,
            [trackId]
        );
        return result.rows;
    }

    // Get all tracks for a genre
    static async getByGenre(genreId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT t.*
       FROM tracks t
       INNER JOIN track_genres tg ON t.id = tg.track_id
       WHERE tg.genre_id = $1
       ORDER BY t.play_count DESC, t.created_at DESC
       LIMIT $2 OFFSET $3`,
            [genreId, limit, offset]
        );
        return result.rows;
    }

    // Get popular tracks for a genre
    static async getPopularByGenre(genreId, limit = 50) {
        const result = await db.query(
            `SELECT t.*
       FROM tracks t
       INNER JOIN track_genres tg ON t.id = tg.track_id
       WHERE tg.genre_id = $1
       ORDER BY t.play_count DESC
       LIMIT $2`,
            [genreId, limit]
        );
        return result.rows;
    }

    // Get recent tracks for a genre
    static async getRecentByGenre(genreId, limit = 50) {
        const result = await db.query(
            `SELECT t.*
       FROM tracks t
       INNER JOIN track_genres tg ON t.id = tg.track_id
       WHERE tg.genre_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2`,
            [genreId, limit]
        );
        return result.rows;
    }

    // Check if association exists
    static async exists(trackId, genreId) {
        const result = await db.query(
            'SELECT EXISTS(SELECT 1 FROM track_genres WHERE track_id = $1 AND genre_id = $2)',
            [trackId, genreId]
        );
        return result.rows[0].exists;
    }

    // Get count of tracks for a genre
    static async countByGenre(genreId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM track_genres WHERE genre_id = $1',
            [genreId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get count of genres for a track
    static async countByTrack(trackId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM track_genres WHERE track_id = $1',
            [trackId]
        );
        return parseInt(result.rows[0].count);
    }

    // Bulk add genres to track
    static async bulkCreate(trackId, genreIds) {
        const values = genreIds.map((_, index) =>
            `($1, $${index + 2})`
        ).join(', ');

        const params = [trackId, ...genreIds];

        const result = await db.query(
            `INSERT INTO track_genres (track_id, genre_id) 
       VALUES ${values}
       ON CONFLICT (track_id, genre_id) DO NOTHING
       RETURNING *`,
            params
        );
        return result.rows;
    }

    // Remove all genres from track
    static async deleteAllByTrack(trackId) {
        const result = await db.query(
            'DELETE FROM track_genres WHERE track_id = $1 RETURNING *',
            [trackId]
        );
        return result.rows;
    }

    // Remove all tracks from genre
    static async deleteAllByGenre(genreId) {
        const result = await db.query(
            'DELETE FROM track_genres WHERE genre_id = $1 RETURNING *',
            [genreId]
        );
        return result.rows;
    }

    // Replace all genres for a track
    // static async replaceGenres(trackId, genreIds) {
    //     const client = await db.connect();
    //     try {
    //         await client.query('BEGIN');

    //         // Remove existing genres
    //         await client.query(
    //             'DELETE FROM track_genres WHERE track_id = $1',
    //             [trackId]
    //         );

    //         // Add new genres
    //         if (genreIds.length > 0) {
    //             const values = genreIds.map((_, index) =>
    //                 `($1, $${index + 2})`
    //             ).join(', ');

    //             const params = [trackId, ...genreIds];

    //             await client.query(
    //                 `INSERT INTO track_genres (track_id, genre_id) 
    //        VALUES ${values}`,
    //                 params
    //             );
    //         }

    //         await client.query('COMMIT');
    //         return await this.getByTrack(trackId);
    //     } catch (error) {
    //         await client.query('ROLLBACK');
    //         throw error;
    //     } finally {
    //         client.release();
    //     }
    // }

    // Get genre statistics
    static async getGenreStats(genreId) {
        const result = await db.query(
            `SELECT 
        COUNT(DISTINCT tg.track_id) as track_count,
        COALESCE(SUM(t.play_count), 0) as total_plays,
        COALESCE(AVG(t.play_count), 0) as avg_plays
       FROM track_genres tg
       LEFT JOIN tracks t ON tg.track_id = t.id
       WHERE tg.genre_id = $1`,
            [genreId]
        );
        return result.rows[0];
    }
}

export default TrackGenre;