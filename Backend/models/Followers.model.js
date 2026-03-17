import db from '../config/database.js';

class Follower {
    // Toggle artist follow
    static async toggleFollow(userId, artistId, client = db) {
        const result = await client.query(
            'SELECT toggle_artist_follow($1, $2) as following',
            [userId, artistId]
        );
        return result.rows[0].following;
    }

    // Check if user follows artist
    static async isFollowing(userId, artistId) {
        const result = await db.query(
            'SELECT EXISTS(SELECT 1 FROM followers WHERE user_id = $1 AND artist_id = $2)',
            [userId, artistId]
        );
        return result.rows[0].exists;
    }

    // Get all artists followed by a user
    static async getFollowedArtists(userId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT a.*, f.followed_at
       FROM artists a
       INNER JOIN followers f ON a.id = f.artist_id
       WHERE f.user_id = $1
       ORDER BY f.followed_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    }

    // Get all followers of an artist
    static async getArtistFollowers(artistId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT u.*, f.followed_at
       FROM users u
       INNER JOIN followers f ON u.id = f.user_id
       WHERE f.artist_id = $1
       ORDER BY f.followed_at DESC
       LIMIT $2 OFFSET $3`,
            [artistId, limit, offset]
        );
        return result.rows;
    }

    // Get follower count for an artist
    static async getFollowerCount(artistId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM followers WHERE artist_id = $1',
            [artistId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get following count for a user
    static async getFollowingCount(userId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM followers WHERE user_id = $1',
            [userId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get recently followed artists by user
    static async getRecentlyFollowed(userId, limit = 10) {
        const result = await db.query(
            `SELECT a.*, f.followed_at
       FROM artists a
       INNER JOIN followers f ON a.id = f.artist_id
       WHERE f.user_id = $1
       ORDER BY f.followed_at DESC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    // Bulk check if user follows multiple artists
    static async checkMultipleFollows(userId, artistIds) {
        const result = await db.query(
            `SELECT artist_id, true as is_following
       FROM followers
       WHERE user_id = $1 AND artist_id = ANY($2)`,
            [userId, artistIds]
        );
        return result.rows;
    }
}

export default Follower;