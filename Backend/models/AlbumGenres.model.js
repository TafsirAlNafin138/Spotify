import db from '../config/database.js';

class AlbumGenre {
    static async create(albumId, genreId, client = db) {
        const result = await client.query(
            `INSERT INTO album_genres (album_id, genre_id) 
       VALUES ($1, $2) 
       ON CONFLICT (album_id, genre_id) DO NOTHING
       RETURNING *`,
            [albumId, genreId]
        );
        return result.rows[0];
    }

    static async delete(albumId, genreId, client = db) {
        const result = await client.query(
            'DELETE FROM album_genres WHERE album_id = $1 AND genre_id = $2 RETURNING *',
            [albumId, genreId]
        );
        return result.rows[0];
    }

    // Get all genres for an album
    static async getByAlbum(albumId) {
        const result = await db.query(
            `SELECT g.*
       FROM genres g
       INNER JOIN album_genres ag ON g.id = ag.genre_id
       WHERE ag.album_id = $1
       ORDER BY g.name ASC`,
            [albumId]
        );
        return result.rows;
    }

    // Get all albums for a genre
    static async getByGenre(genreId, limit = 50, offset = 0) {
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

    // Get recent albums for a genre
    static async getRecentByGenre(genreId, limit = 50) {
        const result = await db.query(
            `SELECT a.*
       FROM albums a
       INNER JOIN album_genres ag ON a.id = ag.album_id
       WHERE ag.genre_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2`,
            [genreId, limit]
        );
        return result.rows;
    }

    // Get popular albums for a genre (by total track plays)
    static async getPopularByGenre(genreId, limit = 50) {
        const result = await db.query(
            `SELECT a.*, COALESCE(SUM(t.play_count), 0) as total_plays
       FROM albums a
       INNER JOIN album_genres ag ON a.id = ag.album_id
       LEFT JOIN tracks t ON a.id = t.album_id
       WHERE ag.genre_id = $1
       GROUP BY a.id
       ORDER BY total_plays DESC
       LIMIT $2`,
            [genreId, limit]
        );
        return result.rows;
    }

    // Check if association exists
    static async exists(albumId, genreId) {
        const result = await db.query(
            'SELECT EXISTS(SELECT 1 FROM album_genres WHERE album_id = $1 AND genre_id = $2)',
            [albumId, genreId]
        );
        return result.rows[0].exists;
    }

    // Get count of albums for a genre
    static async countByGenre(genreId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM album_genres WHERE genre_id = $1',
            [genreId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get count of genres for an album
    static async countByAlbum(albumId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM album_genres WHERE album_id = $1',
            [albumId]
        );
        return parseInt(result.rows[0].count);
    }

    // Bulk add genres to album
    // static async bulkCreate(albumId, genreIds) {
    //     const values = genreIds.map((_, index) =>
    //         `($1, $${index + 2})`
    //     ).join(', ');

    //     const params = [albumId, ...genreIds];

    //     const result = await db.query(
    //         `INSERT INTO album_genres (album_id, genre_id) 
    //    VALUES ${values}
    //    ON CONFLICT (album_id, genre_id) DO NOTHING
    //    RETURNING *`,
    //         params
    //     );
    //     return result.rows;
    // }

    // Remove all genres from album
    static async deleteAllByAlbum(albumId) {
        const result = await db.query(
            'DELETE FROM album_genres WHERE album_id = $1 RETURNING *',
            [albumId]
        );
        return result.rows;
    }

    // Remove all albums from genre
    static async deleteAllByGenre(genreId) {
        const result = await db.query(
            'DELETE FROM album_genres WHERE genre_id = $1 RETURNING *',
            [genreId]
        );
        return result.rows;
    }

    // Replace all genres for an album
    // static async replaceGenres(albumId, genreIds) {
    //     const client = await db.connect();
    //     try {
    //         await client.query('BEGIN');

    //         // Remove existing genres
    //         await client.query(
    //             'DELETE FROM album_genres WHERE album_id = $1',
    //             [albumId]
    //         );

    //         // Add new genres
    //         if (genreIds.length > 0) {
    //             const values = genreIds.map((_, index) =>
    //                 `($1, $${index + 2})`
    //             ).join(', ');

    //             const params = [albumId, ...genreIds];

    //             await client.query(
    //                 `INSERT INTO album_genres (album_id, genre_id) 
    //        VALUES ${values}`,
    //                 params
    //             );
    //         }

    //         await client.query('COMMIT');
    //         return await this.getByAlbum(albumId);
    //     } catch (error) {
    //         await client.query('ROLLBACK');
    //         throw error;
    //     } finally {
    //         client.release();
    //     }
    // }

    // Get albums with full details for a genre
    static async getAlbumsWithDetailsByGenre(genreId, limit = 50) {
        const result = await db.query(
            `SELECT 
        a.*,
        json_agg(DISTINCT jsonb_build_object(
          'id', ar.id,
          'name', ar.name,
          'image', ar.image,
          'is_primary', aa.is_primary
        )) FILTER (WHERE ar.id IS NOT NULL) as artists,
        COUNT(DISTINCT t.id) as track_count,
        COALESCE(SUM(t.play_count), 0) as total_plays
       FROM albums a
       INNER JOIN album_genres ag ON a.id = ag.album_id
       LEFT JOIN album_authors aa ON a.id = aa.album_id
       LEFT JOIN artists ar ON aa.artist_id = ar.id
       LEFT JOIN tracks t ON a.id = t.album_id
       WHERE ag.genre_id = $1
       GROUP BY a.id
       ORDER BY a.created_at DESC
       LIMIT $2`,
            [genreId, limit]
        );
        return result.rows;
    }

    // Get genre statistics
    static async getGenreStats(genreId) {
        const result = await db.query(
            `SELECT 
        COUNT(DISTINCT ag.album_id) as album_count,
        COUNT(DISTINCT t.id) as track_count,
        COALESCE(SUM(t.play_count), 0) as total_plays
       FROM album_genres ag
       LEFT JOIN tracks t ON ag.album_id = t.album_id
       WHERE ag.genre_id = $1`,
            [genreId]
        );
        return result.rows[0];
    }

    // Get shared genres between two albums
    // static async getSharedGenres(albumId1, albumId2) {
    //     const result = await db.query(
    //         `SELECT g.*
    //    FROM genres g
    //    WHERE g.id IN (
    //      SELECT genre_id FROM album_genres WHERE album_id = $1
    //    ) AND g.id IN (
    //      SELECT genre_id FROM album_genres WHERE album_id = $2
    //    )
    //    ORDER BY g.name ASC`,
    //         [albumId1, albumId2]
    //     );
    //     return result.rows;
    // }
}

export default AlbumGenre;