import db from '../config/database.js';

class Artist {
  // Create a new artist
  static async create({ name, bio, image }) {
    const result = await db.query(
      `INSERT INTO artists (name, bio, image) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, bio, image]
    );
    return result.rows[0];
  }

  // Find artist by ID
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM artists WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Find artist by name
  static async findByName(name) {
    const result = await db.query(
      'SELECT * FROM artists WHERE name = $1',
      [name]
    );
    return result.rows[0];
  }

  // Get all artists
  static async findAll(limit = 50, offset = 0) {
    const result = await db.query(
      'SELECT * FROM artists ORDER BY name ASC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  // Update artist
  static async update(id, { name, bio, image }) {
    const result = await db.query(
      `UPDATE artists 
       SET name = COALESCE($1, name), 
           bio = COALESCE($2, bio), 
           image = COALESCE($3, image),
           updated_at = NOW()
       WHERE id = $4 
       RETURNING *`,
      [name, bio, image, id]
    );
    return result.rows[0];
  }

  // Delete artist
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM artists WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  // Get artist's albums
  static async getAlbums(artistId) {
    const result = await db.query(
      `SELECT a.*, aa.is_primary
       FROM albums a
       INNER JOIN album_author aa ON a.id = aa.album_id
       WHERE aa.artist_id = $1
       ORDER BY a.created_at DESC`,
      [artistId]
    );
    return result.rows;
  }

  // Get artist's tracks
  static async getTracks(artistId) {
    const result = await db.query(
      `SELECT t.*, ta.artist_role
       FROM tracks t
       INNER JOIN track_artists ta ON t.id = ta.track_id
       WHERE ta.artist_id = $1
       ORDER BY t.created_at DESC`,
      [artistId]
    );
    return result.rows;
  }

  // Get artist's followers count
  static async getFollowersCount(artistId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM followers WHERE artist_id = $1',
      [artistId]
    );
    return parseInt(result.rows[0].count);
  }

  // Check if user follows artist
  static async isFollowedBy(artistId, userId) {
    const result = await db.query(
      'SELECT EXISTS(SELECT 1 FROM followers WHERE artist_id = $1 AND user_id = $2)',
      [artistId, userId]
    );
    return result.rows[0].exists;
  }

  // Search artists by name
  static async search(query, limit = 20) {
    const result = await db.query(
      `SELECT * FROM artists 
       WHERE name ILIKE $1 
       ORDER BY name ASC 
       LIMIT $2`,
      [`%${query}%`, limit]
    );
    return result.rows;
  }

  // Get artist stats
  static async getStats(artistId) {
    const result = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM album_author WHERE artist_id = $1) as album_count,
        (SELECT COUNT(*) FROM track_artists WHERE artist_id = $1) as track_count,
        (SELECT COUNT(*) FROM followers WHERE artist_id = $1) as followers_count,
        (SELECT COALESCE(SUM(t.play_count), 0) FROM tracks t 
         INNER JOIN track_artists ta ON t.id = ta.track_id 
         WHERE ta.artist_id = $1) as total_plays`,
      [artistId]
    );
    return result.rows[0];
  }

  // Get total count of artists
  static async count() {
    const result = await db.query('SELECT COUNT(*) as count FROM artists');
    return parseInt(result.rows[0].count);
  }
}

export default Artist;