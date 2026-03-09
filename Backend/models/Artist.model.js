import db from '../config/database.js';

class Artist {
  static async create({ name, bio, image }, client = db) {
    const result = await client.query(
      `INSERT INTO artists (name, bio, image) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name.charAt(0).toUpperCase() + name.slice(1), bio, image]
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
      [name.charAt(0).toUpperCase() + name.slice(1)]
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

  static async update(id, { name, bio, image }, client = db) {
    const result = await client.query(
      `UPDATE artists 
       SET name = COALESCE($1, name), 
           bio = COALESCE($2, bio), 
           image = COALESCE($3, image),
           updated_at = NOW()
       WHERE id = $4 
       RETURNING *`,
      [name.charAt(0).toUpperCase() + name.slice(1), bio, image, id]
    );
    return result.rows[0];
  }

  static async delete(id, client = db) {
    const result = await client.query(
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
       INNER JOIN album_authors aa ON a.id = aa.album_id
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
      [`%${query.charAt(0).toUpperCase() + query.slice(1)}%`, limit]
    );
    return result.rows;
  }

  // Get artist stats
  static async getStats(artistId) {
    const result = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM album_authors WHERE artist_id = $1) as album_count,
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

  // Get trending artists based on followers
  static async getTrending(limit = 10) {
    const result = await db.query(
      `SELECT a.*, COUNT(f.user_id) as follower_count
       FROM artists a
       LEFT JOIN followers f ON a.id = f.artist_id
       GROUP BY a.id
       ORDER BY follower_count DESC, a.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  // Search artists by name or bio
  static async search(query, limit = 20) {
    const result = await db.query(
      `SELECT * FROM artists
       WHERE name ILIKE $1 OR bio ILIKE $1
       ORDER BY name ASC
       LIMIT $2`,
      [`%${query}%`, limit]
    );
    return result.rows;
  }
}

export default Artist;