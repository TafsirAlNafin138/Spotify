import db from '../config/database.js';

class TrackArtist {
    // Add artist to track
    static async create(trackId, artistId, artistRole = 'Primary') {
        const result = await db.query(
            `INSERT INTO track_artists (track_id, artist_id, artist_role) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
            [trackId, artistId, artistRole]
        );
        return result.rows[0];
    }

    // Update artist role
    static async updateRole(trackId, artistId, artistRole) {
        const result = await db.query(
            `UPDATE track_artists 
       SET artist_role = $1 
       WHERE track_id = $2 AND artist_id = $3 
       RETURNING *`,
            [artistRole, trackId, artistId]
        );
        return result.rows[0];
    }

    // Remove artist from track
    static async delete(trackId, artistId) {
        const result = await db.query(
            'DELETE FROM track_artists WHERE track_id = $1 AND artist_id = $2 RETURNING *',
            [trackId, artistId]
        );
        return result.rows[0];
    }

    // Get all artists for a track
    static async getByTrack(trackId) {
        const result = await db.query(
            `SELECT a.*, ta.artist_role
       FROM artists a
       INNER JOIN track_artists ta ON a.id = ta.artist_id
       WHERE ta.track_id = $1
       ORDER BY 
         CASE ta.artist_role 
           WHEN 'Primary' THEN 1 
           WHEN 'Featured' THEN 2 
           ELSE 3 
         END, a.name ASC`,
            [trackId]
        );
        return result.rows;
    }

    // Get all tracks for an artist
    static async getByArtist(artistId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT t.*, ta.artist_role
       FROM tracks t
       INNER JOIN track_artists ta ON t.id = ta.track_id
       WHERE ta.artist_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`,
            [artistId, limit, offset]
        );
        return result.rows;
    }

    // Get tracks by artist and role
    static async getByArtistAndRole(artistId, artistRole, limit = 50) {
        const result = await db.query(
            `SELECT t.*, ta.artist_role
       FROM tracks t
       INNER JOIN track_artists ta ON t.id = ta.track_id
       WHERE ta.artist_id = $1 AND ta.artist_role = $2
       ORDER BY t.play_count DESC
       LIMIT $3`,
            [artistId, artistRole, limit]
        );
        return result.rows;
    }

    // Check if association exists
    static async exists(trackId, artistId) {
        const result = await db.query(
            'SELECT EXISTS(SELECT 1 FROM track_artists WHERE track_id = $1 AND artist_id = $2)',
            [trackId, artistId]
        );
        return result.rows[0].exists;
    }

    // Get count of tracks for an artist
    static async countByArtist(artistId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM track_artists WHERE artist_id = $1',
            [artistId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get count of artists for a track
    static async countByTrack(trackId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM track_artists WHERE track_id = $1',
            [trackId]
        );
        return parseInt(result.rows[0].count);
    }

    // Bulk add artists to track
    static async bulkCreate(trackId, artists) {
        const values = artists.map((artist, index) =>
            `($1, $${index * 2 + 2}, $${index * 2 + 3})`
        ).join(', ');

        const params = [trackId];
        artists.forEach(artist => {
            params.push(artist.artistId, artist.artistRole || 'Primary');
        });

        const result = await db.query(
            `INSERT INTO track_artists (track_id, artist_id, artist_role) 
       VALUES ${values}
       ON CONFLICT (track_id, artist_id) DO UPDATE 
       SET artist_role = EXCLUDED.artist_role
       RETURNING *`,
            params
        );
        return result.rows;
    }

    // Remove all artists from track
    static async deleteAllByTrack(trackId) {
        const result = await db.query(
            'DELETE FROM track_artists WHERE track_id = $1 RETURNING *',
            [trackId]
        );
        return result.rows;
    }

    // Remove all tracks from artist
    static async deleteAllByArtist(artistId) {
        const result = await db.query(
            'DELETE FROM track_artists WHERE artist_id = $1 RETURNING *',
            [artistId]
        );
        return result.rows;
    }
}

export default TrackArtist;