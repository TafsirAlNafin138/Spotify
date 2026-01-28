import pool from '../config/database.js';

async function testInsert() {
    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password, clerk_id) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (email) DO NOTHING
           RETURNING *`,
            ['User 1', 'afif1234@example.com', 'testing...123', 'afif_12345']
        );

        const result2 = await pool.query(
            `INSERT INTO artists (name, bio, image) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
            ['Artist 1', 'Bio for Artist 1', 'artist1.jpg']
        );

        const result3 = await pool.query(
            `INSERT INTO albums (name, image) 
           VALUES ($1, $2) 
           RETURNING *`,
            ['Album 1', 'album1.jpg']
        );

        const result4 = await pool.query(
            `INSERT INTO tracks (album_id, name, duration, path, image, track_number, is_explicit, play_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING *`,
            [1, 'Track 1', 180, '/tracks/track1.mp3', 'track1.jpg', 1, false, 0]
        );

        const result5 = await pool.query(
            `INSERT INTO track_artists (track_id, artist_id, artist_role) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (track_id, artist_id) DO NOTHING
           RETURNING *`,
            [1, 1, 'Primary']
        );

        const result20 = await pool.query(
            `INSERT INTO playlists (user_id, name, image) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
            [1, 'Playlist 1', 'playlist1.jpg']
        );

        const result6 = await pool.query(
            `INSERT INTO playlist_tracks (playlist_id, track_id, track_order) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (playlist_id, track_id) DO NOTHING
           RETURNING *`,
            [1, 1, 1]
        );

        const result7 = await pool.query(
            `INSERT INTO followers (user_id, artist_id) 
           VALUES ($1, $2) 
           ON CONFLICT (user_id, artist_id) DO NOTHING
           RETURNING *`,
            [1, 1]
        );

        const result8 = await pool.query(
            `INSERT INTO likes (user_id, track_id) 
           VALUES ($1, $2) 
           ON CONFLICT (user_id, track_id) DO NOTHING
           RETURNING *`,
            [1, 1]
        );

        const result9 = await pool.query(
            `INSERT INTO genres (name) 
           VALUES ($1) 
           ON CONFLICT (name) DO NOTHING
           RETURNING *`,
            ['Pop']
        );

        const result10 = await pool.query(
            `INSERT INTO track_genres (track_id, genre_id) 
           VALUES ($1, $2) 
           ON CONFLICT (track_id, genre_id) DO NOTHING
           RETURNING *`,
            [1, 1]
        );

        const result11 = await pool.query(
            `INSERT INTO album_genres (album_id, genre_id) 
           VALUES ($1, $2) 
           ON CONFLICT (album_id, genre_id) DO NOTHING
           RETURNING *`,
            [1, 1]
        );

        const result12 = await pool.query(
            `INSERT INTO podcasts (title, host_name, description, cover_image) 
           VALUES ($1, $2, $3, $4) 
           RETURNING *`,
            ['Podcast 1', 'Host Name', 'Description of podcast', 'podcast1.jpg']
        );

        const result13 = await pool.query(
            `INSERT INTO episodes (podcast_id, title, description, duration, audio_path, release_date) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
            [1, 'Episode 1', 'Episode description', 3600, '/episodes/ep1.mp3', new Date()]
        );

        const result14 = await pool.query(
            `INSERT INTO podcast_followers (user_id, podcast_id) 
           VALUES ($1, $2) 
           ON CONFLICT (user_id, podcast_id) DO NOTHING
           RETURNING *`,
            [1, 1]
        );

        const result15 = await pool.query(
            `INSERT INTO listening_history_tracks (user_id, track_id, progress_seconds, is_completed, last_played_at) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (user_id, track_id) DO UPDATE 
           SET progress_seconds = $3, is_completed = $4, last_played_at = $5
           RETURNING *`,
            [1, 1, 90, false, new Date()]
        );

        const result16 = await pool.query(
            `INSERT INTO listening_history_episodes (user_id, episode_id, progress_seconds, is_completed, last_played_at) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (user_id, episode_id) DO UPDATE 
           SET progress_seconds = $3, is_completed = $4, last_played_at = $5
           RETURNING *`,
            [1, 1, 1800, false, new Date()]
        );

        const result17 = await pool.query(
            `INSERT INTO super_admins (name, email, password_hash, is_active, last_login) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (email) DO NOTHING
           RETURNING *`,
            ['Admin User', 'admin@example.com', 'hashed_password_here', true, new Date()]
        );

        const result18 = await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, action, target_table, target_id, changes, ip_address) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
            [1, 'CREATE', 'users', 1, JSON.stringify({ field: 'value' }), '192.168.1.1']
        );

        const result19 = await pool.query(
            `INSERT INTO album_artists (album_id, artist_id, is_primary) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (album_id, artist_id) DO NOTHING
           RETURNING *`,
            [1, 1, true]
        );

        console.log("Successful");

        console.log("1. User:");
        console.table(result.rows);

        console.log("2. Artist:");
        console.table(result2.rows);

        console.log("3. Album:");
        console.table(result3.rows);

        console.log("4. Track:");
        console.table(result4.rows);

        console.log("5. Track Artist:");
        console.table(result5.rows);

        console.log("6. Playlist:");
        console.table(result20.rows);

        console.log("7. Playlist Track:");
        console.table(result6.rows);

        console.log("8. Follower:");
        console.table(result7.rows);

        console.log("9. Like:");
        console.table(result8.rows);

        console.log("10. Genre:");
        console.table(result9.rows);

        console.log("11. Track Genre:");
        console.table(result10.rows);

        console.log("12. Album Genre:");
        console.table(result11.rows);

        console.log("13. Podcast:");
        console.table(result12.rows);

        console.log("14. Episode:");
        console.table(result13.rows);

        console.log("15. Podcast Follower:");
        console.table(result14.rows);

        console.log("16. Listening History Track:");
        console.table(result15.rows);

        console.log("17. Listening History Episode:");
        console.table(result16.rows);

        console.log("18. Super Admin:");
        console.table(result17.rows);

        console.log("19. Admin Audit Log:");
        console.table(result18.rows);

        console.log("20. Album Artist:");
        console.table(result19.rows);

    } catch (err) {
        console.error(err.message);
    } finally {
        await pool.end();
    }
}

testInsert();