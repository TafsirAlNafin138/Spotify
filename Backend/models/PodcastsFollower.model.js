import db from '../config/database.js';

class PodcastFollower {
    // Toggle podcast follow
    static async toggleFollow(userId, podcastId, client = db) {
        const result = await client.query(
            'SELECT toggle_podcast_follow($1, $2) as following',
            [userId, podcastId]
        );
        return result.rows[0].following;
    }

    // Check if user follows podcast
    static async isFollowing(userId, podcastId) {
        const result = await db.query(
            'SELECT EXISTS(SELECT 1 FROM podcast_followers WHERE user_id = $1 AND podcast_id = $2)',
            [userId, podcastId]
        );
        return result.rows[0].exists;
    }

    // Get all podcasts followed by a user
    static async getFollowedPodcasts(userId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT p.*, pf.followed_at,
        (SELECT COUNT(*) FROM episodes WHERE podcast_id = p.id) as episode_count
       FROM podcasts p
       INNER JOIN podcast_followers pf ON p.id = pf.podcast_id
       WHERE pf.user_id = $1
       ORDER BY pf.followed_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    }

    // Get all followers of a podcast
    static async getPodcastFollowers(podcastId, limit = 50, offset = 0) {
        const result = await db.query(
            `SELECT u.*, pf.followed_at
       FROM users u
       INNER JOIN podcast_followers pf ON u.id = pf.user_id
       WHERE pf.podcast_id = $1
       ORDER BY pf.followed_at DESC
       LIMIT $2 OFFSET $3`,
            [podcastId, limit, offset]
        );
        return result.rows;
    }

    // Get follower count for a podcast
    static async getFollowerCount(podcastId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM podcast_followers WHERE podcast_id = $1',
            [podcastId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get following count for a user (how many podcasts they follow)
    static async getFollowingCount(userId) {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM podcast_followers WHERE user_id = $1',
            [userId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get recently followed podcasts by user
    static async getRecentlyFollowed(userId, limit = 6) {
        const result = await db.query(
            `SELECT p.*, pf.followed_at
       FROM podcasts p
       INNER JOIN podcast_followers pf ON p.id = pf.podcast_id
       WHERE pf.user_id = $1
       ORDER BY pf.followed_at DESC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    // Bulk check if user follows multiple podcasts
    static async checkMultipleFollows(userId, podcastIds) {
        const result = await db.query(
            `SELECT podcast_id, true as is_following
       FROM podcast_followers
       WHERE user_id = $1 AND podcast_id = ANY($2)`,
            [userId, podcastIds]
        );
        return result.rows;
    }
}

export default PodcastFollower;