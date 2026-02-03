import db from '../config/database.js';

class AlbumAuthor {
    // Add artist to album
    static async create(albumId, artistId, isPrimary = true) {
        const result = await db.query(
            `INSERT INTO album_authors (album_id, artist_id, is_primary) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
            [albumId, artistId, isPrimary]
        );
        return result.rows[0];
    }

    // Update primary status
    static async updatePrimary(albumId, artistId, isPrimary) {
        const result = await db.query(
            `UPDATE album_authors 
       SET is_primary = $1 
       WHERE album_id = $2 AND artist_id = $3 
       RETURNING *`,
            [isPrimary, albumId, artistId]
        );
        return result.rows[0];
    }

    // Remove artist from album
    static async delete(albumId, artistId) {
        const result = await db.query(
            'DELETE FROM album_authors WHERE album_id = $1 AND artist_id = $2 RETURNING *',
            [albumId, artistId]
        );
        return result.rows[0];
    }

    // Get all artists for an album
    static async getByAlbum(albumId) {
        const result = await db.query(
            `SELECT a.*, aa.is_primary, aa.created_at as added_at
       FROM artists a
       INNER JOIN album_authors aa ON a.id = aa.artist_id
       WHERE aa.album_id = $1
       ORDER BY aa.is_primary DESC, a.name ASC`,
            [albumId]
        );
        return result.rows;
    }

    // Get all albums for an artist
    static async getByArtist(artistId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT alb.*, aa.is_primary, aa.created_at as added_at
       FROM albums alb
       INNER JOIN album_authors aa ON alb.id = aa.album_id
       WHERE aa.artist_id = $1
       ORDER BY alb.created_at DESC
       LIMIT $2 OFFSET $3`,
            [artistId, limit, offset]
        );
        return result.rows;
    }

    // Get primary albums for an artist
    static async getPrimaryByArtist(artistId, limit = 50) {
        const result = await db.query(
            `SELECT alb.*, aa.is_primary, aa.created_at as added_at
       FROM albums alb
       INNER JOIN album_authors aa ON alb.id = aa.album_id
       WHERE aa.artist_id = $1 AND aa.is_primary = true
       ORDER BY alb.created_at DESC
       LIMIT $2`,
            [artistId, limit]
        );
        return result.rows;
    }

    // Get featured albums for an artist (non-primary)
    static async getFeaturedByArtist(artistId, limit = 50) {
        const result = await db.query(
            `SELECT alb.*, aa.is_primary, aa.created_at as added_at
       FROM albums alb
       INNER JOIN album_authors aa ON alb.id = aa.album_id
       WHERE aa.artist_id = $1 AND aa.is_primary = false
       ORDER BY alb.created_at DESC
       LIMIT $2`,
            [artistId, limit]
        );
        return result.rows;
    }

    // Get primary artist for an album
    static async getPrimaryByAlbum(albumId) {
        const result = await db.query(
            `SELECT a.*, aa.is_primary, aa.created_at as added_at
       FROM artists a
       INNER JOIN album_authors aa ON a.id = aa.artist_id
       WHERE aa.album_id = $1 AND aa.is_primary = true
       LIMIT 1`,
            [albumId]
        );
        return result.rows[0];
    }

    // Check if association exists
    static async exists(albumId, artistId) {
        const result = await db.query(
            'SELECT EXISTS(SELECT 1 FROM album_authors WHERE album_id = $1 AND artist_id = $2)',
            [albumId, artistId]
        );
        return result.rows[0].exists;
    }

    // Get count of albums for an artist
    static async countByArtist(artistId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM album_authors WHERE artist_id = $1',
            [artistId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get count of artists for an album
    static async countByAlbum(albumId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM album_authors WHERE album_id = $1',
            [albumId]
        );
        return parseInt(result.rows[0].count);
    }

    // Bulk add artists to album
    static async bulkCreate(albumId, artists) {
        const values = artists.map((artist, index) =>
            `($1, $${index * 2 + 2}, $${index * 2 + 3})`
        ).join(', ');

        const params = [albumId];
        artists.forEach(artist => {
            params.push(artist.artistId, artist.isPrimary !== undefined ? artist.isPrimary : true);
        });

        const result = await db.query(
            `INSERT INTO album_authors (album_id, artist_id, is_primary) 
       VALUES ${values}
       ON CONFLICT (album_id, artist_id) DO UPDATE 
       SET is_primary = EXCLUDED.is_primary
       RETURNING *`,
            params
        );
        return result.rows;
    }

    // Remove all artists from album
    static async deleteAllByAlbum(albumId) {
        const result = await db.query(
            'DELETE FROM album_authors WHERE album_id = $1 RETURNING *',
            [albumId]
        );
        return result.rows;
    }

    // Remove all albums from artist
    static async deleteAllByArtist(artistId) {
        const result = await db.query(
            'DELETE FROM album_authors WHERE artist_id = $1 RETURNING *',
            [artistId]
        );
        return result.rows;
    }

    // Set an artist as the sole primary artist
    static async setSolePrimary(albumId, artistId) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Set all artists to non-primary
            await client.query(
                'UPDATE album_authors SET is_primary = false WHERE album_id = $1',
                [albumId]
            );

            // Set specified artist as primary
            const result = await client.query(
                `UPDATE album_authors 
         SET is_primary = true 
         WHERE album_id = $1 AND artist_id = $2 
         RETURNING *`,
                [albumId, artistId]
            );

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

export default AlbumAuthor;