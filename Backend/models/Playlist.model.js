import db from '../config/database.js';

class Playlist {
  // Create a new playlist
  static async create({ user_id, name, image }) {
    const result = await db.query(
      `INSERT INTO playlists (user_id, name, image) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [user_id, name, image]
    );
    return result.rows[0];
  }

  // Find playlist by ID
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM playlists WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Get all playlists for a user
  static async findByUserId(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT p.*, COUNT(pt.track_id) as track_count
       FROM playlists p
       LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  // Update playlist
  static async update(id, { name, image }) {
    const result = await db.query(
      `UPDATE playlists 
       SET name = COALESCE($1, name), 
           image = COALESCE($2, image),
           updated_at = NOW()
       WHERE id = $3 
       RETURNING *`,
      [name, image, id]
    );
    return result.rows[0];
  }

  // Delete playlist
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM playlists WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  // Add track to playlist
  static async addTrack(playlistId, trackId, trackOrder = null) {
    // If no track order specified, get the next order number
    if (trackOrder === null) {
      const orderResult = await db.query(
        'SELECT COALESCE(MAX(track_order), 0) + 1 as next_order FROM playlist_tracks WHERE playlist_id = $1',
        [playlistId]
      );
      trackOrder = orderResult.rows[0].next_order;
    }

    const result = await db.query(
      `INSERT INTO playlist_tracks (playlist_id, track_id, track_order) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (playlist_id, track_id) DO UPDATE 
       SET track_order = EXCLUDED.track_order
       RETURNING *`,
      [playlistId, trackId, trackOrder]
    );
    return result.rows[0];
  }

  // Remove track from playlist
  static async removeTrack(playlistId, trackId) {
    const result = await db.query(
      'DELETE FROM playlist_tracks WHERE playlist_id = $1 AND track_id = $2 RETURNING *',
      [playlistId, trackId]
    );
    return result.rows[0];
  }

  // Get all tracks in a playlist
  static async getTracks(playlistId) {
    const result = await db.query(
      `SELECT t.*, pt.track_order, pt.added_at
       FROM tracks t
       INNER JOIN playlist_tracks pt ON t.id = pt.track_id
       WHERE pt.playlist_id = $1
       ORDER BY pt.track_order ASC`,
      [playlistId]
    );
    return result.rows;
  }

  // Reorder track in playlist
  static async reorderTrack(playlistId, trackId, newOrder) {
    const result = await db.query(
      `UPDATE playlist_tracks 
       SET track_order = $1 
       WHERE playlist_id = $2 AND track_id = $3
       RETURNING *`,
      [newOrder, playlistId, trackId]
    );
    return result.rows[0];
  }

  // Check if track is in playlist
  static async hasTrack(playlistId, trackId) {
    const result = await db.query(
      'SELECT EXISTS(SELECT 1 FROM playlist_tracks WHERE playlist_id = $1 AND track_id = $2)',
      [playlistId, trackId]
    );
    return result.rows[0].exists;
  }

  // Get playlist stats
  static async getStats(playlistId) {
    const result = await db.query(
      `SELECT 
        COUNT(pt.track_id) as track_count,
        COALESCE(SUM(t.duration), 0) as total_duration
       FROM playlist_tracks pt
       LEFT JOIN tracks t ON pt.track_id = t.id
       WHERE pt.playlist_id = $1`,
      [playlistId]
    );
    return result.rows[0];
  }

  // Verify playlist ownership
  static async isOwnedBy(playlistId, userId) {
    const result = await db.query(
      'SELECT EXISTS(SELECT 1 FROM playlists WHERE id = $1 AND user_id = $2)',
      [playlistId, userId]
    );
    return result.rows[0].exists;
  }

  // Search playlists by name (for a specific user)
  static async search(userId, query, limit = 20) {
    const result = await db.query(
      `SELECT p.*, COUNT(pt.track_id) as track_count
       FROM playlists p
       LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
       WHERE p.user_id = $1 AND p.name ILIKE $2
       GROUP BY p.id
       ORDER BY p.name ASC 
       LIMIT $3`,
      [userId, `%${query}%`, limit]
    );
    return result.rows;
  }

  // Get playlist with full details
  static async getFullDetails(playlistId) {
    const playlist = await this.findById(playlistId);
    if (!playlist) return null;

    const [tracks, stats] = await Promise.all([
      this.getTracks(playlistId),
      this.getStats(playlistId)
    ]);

    return {
      ...playlist,
      tracks,
      ...stats
    };
  }
}

export default Playlist;