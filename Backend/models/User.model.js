
import db from '../config/database.js';

class User {
  // Create or Update user from Clerk
  static async createOrUpdate({ name, email, clerk_id, image }) {
    const result = await db.query(
      `INSERT INTO users (name, email, clerk_id, image, password) 
       VALUES ($1, $2, $3, $4, 'CLERK_AUTH') 
       ON CONFLICT (clerk_id) DO UPDATE 
       SET name = EXCLUDED.name, 
           email = EXCLUDED.email, 
           image = EXCLUDED.image, 
           updated_at = NOW()
       RETURNING *`,
      [name, email, clerk_id, image]
    );
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  // Find user by Clerk ID
  static async findByClerkId(clerkId) {
    const result = await db.query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [clerkId]
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

  // Delete user by Clerk ID
  static async deleteByClerkId(clerkId) {
    const result = await db.query(
      'DELETE FROM users WHERE clerk_id = $1 RETURNING *',
      [clerkId]
    );
    return result.rows[0];
  }
}

export default User;