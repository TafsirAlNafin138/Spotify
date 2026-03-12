import db from '../config/database.js';

class Track {
  static async create({ album_id, name, duration, path, image, track_number, is_explicit = false }, client = db) {
    const result = await client.query(
      `INSERT INTO tracks (album_id, name, duration, path, image, track_number, is_explicit) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [album_id, name, duration, path, image, track_number, is_explicit]
    );
    return result.rows[0];
  }

  // Find track by ID
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM tracks WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Get all tracks
  static async findAll(limit = 50, offset = 0) {
    const result = await db.query(
      'SELECT * FROM tracks ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  static async update(id, { album_id, name, duration, path, image, track_number, is_explicit }, client = db) {
    const result = await client.query(
      `UPDATE tracks 
       SET album_id = COALESCE($1, album_id),
           name = COALESCE($2, name), 
           duration = COALESCE($3, duration),
           path = COALESCE($4, path),
           image = COALESCE($5, image),
           track_number = COALESCE($6, track_number),
           is_explicit = COALESCE($7, is_explicit),
           updated_at = NOW()
       WHERE id = $8 
       RETURNING *`,
      [album_id, name, duration, path, image, track_number, is_explicit, id]
    );
    return result.rows[0];
  }

  static async delete(id, client = db) {
    const result = await client.query(
      'DELETE FROM tracks WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async addArtist(trackId, artistId, artistRole = 'Primary', client = db) {
    const result = await client.query(
      `INSERT INTO track_artists (track_id, artist_id, artist_role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (track_id, artist_id) DO UPDATE 
       SET artist_role = EXCLUDED.artist_role
       RETURNING *`,
      [trackId, artistId, artistRole]
    );
    return result.rows[0];
  }

  static async removeArtist(trackId, artistId, client = db) {
    const result = await client.query(
      'DELETE FROM track_artists WHERE track_id = $1 AND artist_id = $2 RETURNING *',
      [trackId, artistId]
    );
    return result.rows[0];
  }

  // Get track artists
  static async getArtists(trackId) {
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

  static async addGenre(trackId, genreId, client = db) {
    const result = await client.query(
      `INSERT INTO track_genres (track_id, genre_id) 
       VALUES ($1, $2) 
       ON CONFLICT (track_id, genre_id) DO NOTHING
       RETURNING *`,
      [trackId, genreId]
    );
    return result.rows[0];
  }

  static async removeGenre(trackId, genreId, client = db) {
    const result = await client.query(
      'DELETE FROM track_genres WHERE track_id = $1 AND genre_id = $2 RETURNING *',
      [trackId, genreId]
    );
    return result.rows[0];
  }

  // Get track genres
  static async getGenres(trackId) {
    const result = await db.query(
      `SELECT g.*
       FROM genres g
       INNER JOIN track_genres tg ON g.id = tg.genre_id
       WHERE tg.track_id = $1`,
      [trackId]
    );
    return result.rows;
  }

  // Increment play count
  static async incrementPlayCount(id) {
    const result = await db.query(
      `UPDATE tracks 
       SET play_count = play_count + 1 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Check if track is liked by user
  static async isLikedBy(trackId, userId) {
    const result = await db.query(
      'SELECT EXISTS(SELECT 1 FROM likes WHERE track_id = $1 AND user_id = $2)',
      [trackId, userId]
    );
    return result.rows[0].exists;
  }

  // Get track likes count
  static async getLikesCount(trackId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM likes WHERE track_id = $1',
      [trackId]
    );
    return parseInt(result.rows[0].count);
  }

  // Search tracks by name
  static async search(query, limit = 20) {
    const result = await db.query(
      `SELECT * FROM tracks 
       WHERE name ILIKE $1 
       ORDER BY play_count DESC, name ASC 
       LIMIT $2`,
      [`%${query}%`, limit]
    );
    return result.rows;
  }

  // Get popular tracks
  static async getPopular(limit = 50) {
    const result = await db.query(
      'SELECT * FROM tracks ORDER BY play_count DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  // Get tracks by genre
  static async getByGenre(genreId, limit = 50, offset = 0) {
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

  static async getTrending(limit = 50) {
    const result = await db.query(
      'SELECT * FROM tracks ORDER BY play_count DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  static async getMadeForYou(userId, limit = 50) {
  const query = `
  WITH UserTopGenres AS (
    SELECT tg.genre_id 
    FROM likes l
    JOIN track_genres tg ON l.track_id = tg.track_id
    WHERE l.user_id = $1
    GROUP BY tg.genre_id
    ORDER BY COUNT(*) DESC
    LIMIT 3
  ),
  UserFollowedArtists AS (
    SELECT artist_id FROM followers WHERE user_id = $1
  ),
  UserListeningGenres AS (
    SELECT DISTINCT tg.genre_id
    FROM listening_history_tracks lht
    JOIN track_genres tg ON lht.track_id = tg.track_id
    WHERE lht.user_id = $1
  )
  SELECT DISTINCT ON (t.id)
    t.*,
    (
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM track_artists ta 
          WHERE ta.track_id = t.id 
          AND ta.artist_id IN (SELECT artist_id FROM UserFollowedArtists)
        ) THEN 10 ELSE 0 END
      +
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM track_genres tg 
          WHERE tg.track_id = t.id 
          AND tg.genre_id IN (SELECT genre_id FROM UserTopGenres)
        ) THEN 5 ELSE 0 END
      +
      CASE
        WHEN EXISTS (
          SELECT 1 FROM track_genres tg
          WHERE tg.track_id = t.id
          AND tg.genre_id IN (SELECT genre_id FROM UserListeningGenres)
        ) THEN 20 ELSE 0 END
      +
      (LOG(t.play_count + 1) * 2)
    ) as relevance_score
  FROM tracks t
  LEFT JOIN listening_history_tracks lht ON t.id = lht.track_id AND lht.user_id = $1
  LEFT JOIN track_genres tg ON t.id = tg.track_id
  LEFT JOIN genres g ON tg.genre_id = g.id
  WHERE t.id NOT IN (
    SELECT track_id FROM listening_history_tracks 
    WHERE user_id = $1 AND is_completed = true
  )
  ORDER BY t.id, relevance_score DESC, t.created_at DESC
  LIMIT $2;
`;
  try {
    const result = await db.query(query, [userId, limit]);
    if (result.rows.length === 0) {
      const fallback = await db.query(
        `SELECT * FROM tracks 
         ORDER BY created_at DESC, play_count DESC 
         LIMIT $1`,
        [limit]
      );
      return fallback.rows;
    }
    return result.rows;
  } catch (error) {
    console.error("Error in getMadeForYou:", error);
    const emergencyFallback = await db.query('SELECT * FROM tracks LIMIT $1', [limit]);
    return emergencyFallback.rows;
  }
}
  static async getNewReleases(limit = 50) {
    const result = await db.query(
      'SELECT * FROM tracks ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  // Get tracks by album
  static async getByAlbum(albumId) {
    const result = await db.query(
      `SELECT * FROM tracks 
       WHERE album_id = $1 
       ORDER BY track_number ASC`,
      [albumId]
    );
    return result.rows;
  }

  // Get track with full details (artists, genres, album)
  static async getFullDetails(trackId) {
    const track = await this.findById(trackId);
    if (!track) return null;

    const [artists, genres] = await Promise.all([
      this.getArtists(trackId),
      this.getGenres(trackId)
    ]);

    let album = null;
    if (track.album_id) {
      const albumResult = await db.query('SELECT * FROM albums WHERE id = $1', [track.album_id]);
      album = albumResult.rows[0];
    }

    return {
      ...track,
      artists,
      genres,
      album
    };
  }

  // Count all tracks
  static async count() {
    const result = await db.query(
      'SELECT COUNT(*) FROM tracks'
    );
    return result.rows[0].count;
  }
}

export default Track;