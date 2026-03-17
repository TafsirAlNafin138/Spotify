import db from '../config/database.js';

class Album {
  static async create({ name, image }, client = db) {
    const result = await client.query(
      `INSERT INTO albums (name, image) 
       VALUES ($1, $2) 
       RETURNING *`,
      [name, image]
    );
    return result.rows[0];
  }

  // Find album by ID
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM albums WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Find album by name
  static async findByName(name) {
    const result = await db.query(
      'SELECT * FROM albums WHERE name = $1',
      [name]
    );
    return result.rows[0];
  }

  // Get all albums
  static async findAll(limit = 50, offset = 0) {
    const result = await db.query(
      'SELECT * FROM albums ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  static async update(id, { name, image }, client = db) {
    const result = await client.query(
      `UPDATE albums 
       SET name = COALESCE($1, name), 
           image = COALESCE($2, image)
       WHERE id = $3 
       RETURNING *`,
      [name, image, id]
    );
    return result.rows[0];
  }

  static async delete(id, client = db) {
    const result = await client.query(
      'DELETE FROM albums WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async addArtist(albumId, artistId, isPrimary = true, client = db) {
    const result = await client.query(
      `INSERT INTO album_authors (album_id, artist_id, is_primary) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (album_id, artist_id) DO UPDATE 
       SET is_primary = EXCLUDED.is_primary
       RETURNING *`,
      [albumId, artistId, isPrimary]
    );
    return result.rows[0];
  }

  static async removeArtist(albumId, artistId, client = db) {
    const result = await client.query(
      'DELETE FROM album_authors WHERE album_id = $1 AND artist_id = $2 RETURNING *',
      [albumId, artistId]
    );
    return result.rows[0];
  }

  // Get album artists
  static async getArtists(albumId) {
    const result = await db.query(
      `SELECT a.*, aa.is_primary
       FROM artists a
       INNER JOIN album_authors aa ON a.id = aa.artist_id
       WHERE aa.album_id = $1
       ORDER BY aa.is_primary DESC, a.name ASC`,
      [albumId]
    );
    return result.rows;
  }

  // Get album tracks
  static async getTracks(albumId) {
    const result = await db.query(
      `SELECT * FROM tracks 
       WHERE album_id = $1 
       ORDER BY track_number ASC`,
      [albumId]
    );
    return result.rows;
  }

  static async addGenre(albumId, genreId, client = db) {
    const result = await client.query(
      `INSERT INTO album_genres (album_id, genre_id) 
       VALUES ($1, $2) 
       ON CONFLICT (album_id, genre_id) DO NOTHING
       RETURNING *`,
      [albumId, genreId]
    );
    return result.rows[0];
  }

  static async removeGenre(albumId, genreId, client = db) {
    const result = await client.query(
      'DELETE FROM album_genres WHERE album_id = $1 AND genre_id = $2 RETURNING *',
      [albumId, genreId]
    );
    return result.rows[0];
  }

  // Get album genres
  static async getGenres(albumId) {
    const result = await db.query(
      `SELECT g.*
       FROM genres g
       INNER JOIN album_genres ag ON g.id = ag.genre_id
       WHERE ag.album_id = $1`,
      [albumId]
    );
    return result.rows;
  }

  // Search albums by name
  static async search(query, limit = 20) {
    const result = await db.query(
      `SELECT * FROM albums 
       WHERE name ILIKE $1 
       ORDER BY name ASC 
       LIMIT $2`,
      [`%${query}%`, limit]
    );
    return result.rows;
  }

  // Get album with full details (artists, tracks, genres)
  static async getFullDetails(albumId) {
    const album = await this.findById(albumId);
    if (!album) return null;

    const [artists, tracks, genres] = await Promise.all([
      this.getArtists(albumId),
      this.getTracks(albumId),
      this.getGenres(albumId)
    ]);

    return {
      ...album,
      artists,
      tracks,
      genres
    };
  }

  // Get album stats
  static async getStats(albumId) {
    const result = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM tracks WHERE album_id = $1) as track_count,
        (SELECT COALESCE(SUM(duration), 0) FROM tracks WHERE album_id = $1) as total_duration,
        (SELECT COALESCE(SUM(play_count), 0) FROM tracks WHERE album_id = $1) as total_plays`,
      [albumId]
    );
    return result.rows[0];
  }

  // Get total count of albums
  static async count() {
    const result = await db.query('SELECT COUNT(*) as count FROM albums');
    return parseInt(result.rows[0].count);
  }
}

export default Album;