
import db from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // new user with hashed password
  static async registerUser({ name, email, password, image }, client = db) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, image) VALUES ($1, $2, $3, $4) RETURNING id`,
      [name, email, hashedPassword, image || null]
    );

    const out_user_id = result.rows[0].id;

    const userResult = await client.query(
      'SELECT id, name, email, image, created_at FROM users WHERE id = $1',
      [out_user_id]
    );
    return userResult.rows[0];
  }

  // Verify user password
  static async verifyPassword(email, candidatePassword, client = db) {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    const user = result.rows[0];
    if (!user) return null;

    const isMatch = await bcrypt.compare(candidatePassword, user.password_hash);
    if (!isMatch) return null;

    // Update last login
    await client.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const { password_hash, refresh_token_hash, ...userWithoutPassword } = user;
    // Return user without sensitive data
    return userWithoutPassword;
  }

  // Find user by Email
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT id, name, email, image, is_active, last_login_at, created_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  // Save refresh token
  static async saveRefreshToken(id, refreshToken, client = db) {
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(refreshToken, salt);
    await client.query(
      'UPDATE users SET refresh_token_hash = $1 WHERE id = $2',
      [hashedToken, id]
    );
  }

  // Verify refresh token
  static async verifyRefreshToken(id, candidateToken) {
    const result = await db.query(
      'SELECT refresh_token_hash FROM users WHERE id = $1 AND is_active = true',
      [id]
    );
    const user = result.rows[0];
    if (!user || !user.refresh_token_hash) return false;

    return await bcrypt.compare(candidateToken, user.refresh_token_hash);
  }

  // Find user by ID
  static async findById(id) {
    const result = await db.query(
      'SELECT id, name, email, image, is_active, last_login_at, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Get user's playlists
  static async getPlaylists(userId) {
    const result = await db.query(
      `SELECT p.*, COUNT(pt.track_id) as track_count
       FROM playlists p
       LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  // Check if email exists
  static async emailExists(email) {
    const result = await db.query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
      [email]
    );
    return result.rows[0].exists;
  }

  // Get user stats
  static async getStats(userId) {
    const result = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM playlists WHERE user_id = $1) as playlist_count,
        (SELECT COUNT(*) FROM likes WHERE user_id = $1) as liked_tracks_count,
        (SELECT COUNT(*) FROM followers WHERE user_id = $1) as following_count`,
      [userId]
    );
    return result.rows[0];
  }

  // Get total count of users
  static async count() {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM users'
    );
    return parseInt(result.rows[0].count);
  }
}

export default User;