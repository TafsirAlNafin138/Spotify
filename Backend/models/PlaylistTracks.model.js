import db from '../config/database.js';

class PlaylistTrack {
    // Add track to playlist
    static async create(playlistId, trackId, trackOrder = null) {
        // If no order specified, append to end
        if (trackOrder === null) {
            const maxOrderResult = await db.query(
                'SELECT COALESCE(MAX(track_order), 0) as max_order FROM playlist_tracks WHERE playlist_id = $1',
                [playlistId]
            );
            trackOrder = maxOrderResult.rows[0].max_order + 1;
        }

        const result = await db.query(
            `INSERT INTO playlist_tracks (playlist_id, track_id, track_order) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
            [playlistId, trackId, trackOrder]
        );
        return result.rows[0];
    }

    // Remove track from playlist
    static async delete(playlistId, trackId) {
        const result = await db.query(
            'DELETE FROM playlist_tracks WHERE playlist_id = $1 AND track_id = $2 RETURNING *',
            [playlistId, trackId]
        );
        return result.rows[0];
    }

    // Update track order
    static async updateOrder(playlistId, trackId, newOrder) {
        const result = await db.query(
            `UPDATE playlist_tracks 
       SET track_order = $1 
       WHERE playlist_id = $2 AND track_id = $3 
       RETURNING *`,
            [newOrder, playlistId, trackId]
        );
        return result.rows[0];
    }

    // Get all tracks for a playlist (ordered)
    static async getByPlaylist(playlistId) {
        const result = await db.query(
            `SELECT t.*, pt.track_order, pt.added_at
       FROM tracks t
       INNER JOIN playlist_tracks pt ON t.id = pt.track_id
       WHERE pt.playlist_id = $1
       ORDER BY pt.track_order ASC NULLS LAST, pt.added_at ASC`,
            [playlistId]
        );
        return result.rows;
    }

    // Get tracks with full details for a playlist
    static async getTracksWithDetailsByPlaylist(playlistId) {
        const result = await db.query(
            `SELECT 
        t.*,
        pt.track_order,
        pt.added_at,
        json_agg(DISTINCT jsonb_build_object(
          'id', a.id,
          'name', a.name,
          'image', a.image,
          'artist_role', ta.artist_role
        )) FILTER (WHERE a.id IS NOT NULL) as artists,
        alb.id as album_id,
        alb.name as album_name,
        alb.image as album_image
       FROM tracks t
       INNER JOIN playlist_tracks pt ON t.id = pt.track_id
       LEFT JOIN track_artists ta ON t.id = ta.track_id
       LEFT JOIN artists a ON ta.artist_id = a.id
       LEFT JOIN albums alb ON t.album_id = alb.id
       WHERE pt.playlist_id = $1
       GROUP BY t.id, pt.track_order, pt.added_at, alb.id
       ORDER BY pt.track_order ASC NULLS LAST, pt.added_at ASC`,
            [playlistId]
        );
        return result.rows;
    }

    // Get all playlists containing a track
    static async getByTrack(trackId) {
        const result = await db.query(
            `SELECT p.*, pt.track_order, pt.added_at
       FROM playlists p
       INNER JOIN playlist_tracks pt ON p.id = pt.playlist_id
       WHERE pt.track_id = $1
       ORDER BY pt.added_at DESC`,
            [trackId]
        );
        return result.rows;
    }

    // Check if track is in playlist
    static async exists(playlistId, trackId) {
        const result = await db.query(
            'SELECT EXISTS(SELECT 1 FROM playlist_tracks WHERE playlist_id = $1 AND track_id = $2)',
            [playlistId, trackId]
        );
        return result.rows[0].exists;
    }

    // Get count of tracks in a playlist
    static async countByPlaylist(playlistId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM playlist_tracks WHERE playlist_id = $1',
            [playlistId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get count of playlists containing a track
    static async countByTrack(trackId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM playlist_tracks WHERE track_id = $1',
            [trackId]
        );
        return parseInt(result.rows[0].count);
    }

    // Bulk add tracks to playlist
    static async bulkCreate(playlistId, trackIds) {
        // Get current max order
        const maxOrderResult = await db.query(
            'SELECT COALESCE(MAX(track_order), 0) as max_order FROM playlist_tracks WHERE playlist_id = $1',
            [playlistId]
        );
        let order = maxOrderResult.rows[0].max_order + 1;

        const values = trackIds.map((_, index) =>
            `($1, $${index + 2}, $${trackIds.length + index + 2})`
        ).join(', ');

        const params = [playlistId];
        trackIds.forEach(trackId => params.push(trackId));
        trackIds.forEach(() => params.push(order++));

        const result = await db.query(
            `INSERT INTO playlist_tracks (playlist_id, track_id, track_order) 
       VALUES ${values}
       ON CONFLICT (playlist_id, track_id) DO NOTHING
       RETURNING *`,
            params
        );
        return result.rows;
    }

    // Remove all tracks from playlist
    static async deleteAllByPlaylist(playlistId) {
        const result = await db.query(
            'DELETE FROM playlist_tracks WHERE playlist_id = $1 RETURNING *',
            [playlistId]
        );
        return result.rows;
    }

    // Remove track from all playlists
    static async deleteAllByTrack(trackId) {
        const result = await db.query(
            'DELETE FROM playlist_tracks WHERE track_id = $1 RETURNING *',
            [trackId]
        );
        return result.rows;
    }

    // Reorder playlist tracks
    static async reorder(playlistId, trackOrderMap) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Update each track's order
            for (const [trackId, order] of Object.entries(trackOrderMap)) {
                await client.query(
                    `UPDATE playlist_tracks 
           SET track_order = $1 
           WHERE playlist_id = $2 AND track_id = $3`,
                    [order, playlistId, trackId]
                );
            }

            await client.query('COMMIT');
            return await this.getByPlaylist(playlistId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Move track to new position
    static async moveTrack(playlistId, trackId, newOrder) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Get current order
            const currentResult = await client.query(
                'SELECT track_order FROM playlist_tracks WHERE playlist_id = $1 AND track_id = $2',
                [playlistId, trackId]
            );
            const currentOrder = currentResult.rows[0]?.track_order;

            if (currentOrder === undefined) {
                throw new Error('Track not found in playlist');
            }

            // Shift other tracks
            if (newOrder < currentOrder) {
                // Moving up - shift tracks down
                await client.query(
                    `UPDATE playlist_tracks 
           SET track_order = track_order + 1 
           WHERE playlist_id = $1 AND track_order >= $2 AND track_order < $3`,
                    [playlistId, newOrder, currentOrder]
                );
            } else if (newOrder > currentOrder) {
                // Moving down - shift tracks up
                await client.query(
                    `UPDATE playlist_tracks 
           SET track_order = track_order - 1 
           WHERE playlist_id = $1 AND track_order > $2 AND track_order <= $3`,
                    [playlistId, currentOrder, newOrder]
                );
            }

            // Update the moved track
            const result = await client.query(
                `UPDATE playlist_tracks 
         SET track_order = $1 
         WHERE playlist_id = $2 AND track_id = $3 
         RETURNING *`,
                [newOrder, playlistId, trackId]
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

    // Get playlist statistics
    static async getPlaylistStats(playlistId) {
        const result = await db.query(
            `SELECT 
        COUNT(pt.track_id) as track_count,
        COALESCE(SUM(t.duration), 0) as total_duration,
        COALESCE(SUM(t.play_count), 0) as total_plays
       FROM playlist_tracks pt
       LEFT JOIN tracks t ON pt.track_id = t.id
       WHERE pt.playlist_id = $1`,
            [playlistId]
        );
        return result.rows[0];
    }

    // Get recently added tracks to playlist
    static async getRecentlyAdded(playlistId, limit = 20) {
        const result = await db.query(
            `SELECT t.*, pt.track_order, pt.added_at
       FROM tracks t
       INNER JOIN playlist_tracks pt ON t.id = pt.track_id
       WHERE pt.playlist_id = $1
       ORDER BY pt.added_at DESC
       LIMIT $2`,
            [playlistId, limit]
        );
        return result.rows;
    }

    // Duplicate playlist tracks to another playlist
    static async duplicateToPlaylist(sourcePlaylistId, targetPlaylistId) {
        const result = await db.query(
            `INSERT INTO playlist_tracks (playlist_id, track_id, track_order)
       SELECT $2, track_id, track_order
       FROM playlist_tracks
       WHERE playlist_id = $1
       ON CONFLICT (playlist_id, track_id) DO NOTHING
       RETURNING *`,
            [sourcePlaylistId, targetPlaylistId]
        );
        return result.rows;
    }
}

export default PlaylistTrack;