CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -- ========================================
-- -- FUNCTIONS & TRIGGERS
-- -- ========================================

-- -- Automatically update the updated_at timestamp
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';





-- Get user with their stats
SELECT 
    u.id,
    u.name,
    u.email,
    (SELECT COUNT(*) FROM playlists WHERE user_id = u.id) as playlist_count,
    (SELECT COUNT(*) FROM likes WHERE user_id = u.id) as liked_tracks,
    (SELECT COUNT(*) FROM followers WHERE user_id = u.id) as following_count
FROM users u
WHERE u.id = 1;

-- Get artist with their stats
SELECT 
    ar.id,
    ar.name,
    ar.genre,
    (SELECT COUNT(*) FROM albums WHERE artist_id = ar.id) as album_count,
    (SELECT COUNT(*) FROM tracks t JOIN albums a ON t.album_id = a.id WHERE a.artist_id = ar.id) as track_count,
    (SELECT COUNT(*) FROM followers WHERE artist_id = ar.id) as follower_count
FROM artists ar
WHERE ar.id = 1;

-- Get most liked tracks
SELECT 
    t.id,
    t.name as track_name,
    a.name as album_name,
    ar.name as artist_name,
    COUNT(l.user_id) as like_count
FROM tracks t
LEFT JOIN albums a ON t.album_id = a.id
LEFT JOIN artists ar ON a.artist_id = ar.id
LEFT JOIN likes l ON t.id = l.track_id
GROUP BY t.id, t.name, a.name, ar.name
ORDER BY like_count DESC 
FETCH FIRST 10 ROWS ONLY;

-- Get user's personalized feed (tracks from followed artists)
SELECT DISTINCT
    t.id,
    t.name as track_name,
    t.duration,
    a.name as album_name,
    ar.name as artist_name,
    ar.image as artist_image
FROM tracks t
JOIN albums a ON t.album_id = a.id
JOIN artists ar ON a.artist_id = ar.id
WHERE ar.id IN (
    SELECT artist_id FROM followers WHERE user_id = 1
)
ORDER BY t.created_at DESC
FETCH FIRST 20 ROWS ONLY;

-- Get playlist with full track details
SELECT 
    p.id as playlist_id,
    p.name as playlist_name,
    p.image as playlist_image,
    u.name as owner_name,
    t.id as track_id,
    t.name as track_name,
    t.duration,
    t.path,
    a.name as album_name,
    ar.name as artist_name,
    pt.track_order
FROM playlists p
JOIN users u ON p.user_id = u.id
LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
LEFT JOIN tracks t ON pt.track_id = t.id
LEFT JOIN albums a ON t.album_id = a.id
LEFT JOIN artists ar ON a.artist_id = ar.id
WHERE p.id = 1
ORDER BY pt.track_order;

-- Search across all entities
-- Artists
SELECT 'artist' as type, id, name, image, NULL as extra FROM artists WHERE name LIKE '%beatles%'
UNION ALL
-- Albums
SELECT 'album' as type, id, name, image, (SELECT name FROM artists WHERE id = artist_id) as extra FROM albums WHERE name LIKE '%beatles%'
UNION ALL
-- Tracks
SELECT 'track' as type, t.id, t.name, NULL as image, ar.name as extra 
FROM tracks t 
JOIN albums a ON t.album_id = a.id 
JOIN artists ar ON a.artist_id = ar.id 
WHERE t.name LIKE '%beatles%';

-- Get trending tracks (most liked in last 7 days)
SELECT 
    t.id,
    t.name as track_name,
    ar.name as artist_name,
    COUNT(l.user_id) as recent_likes
FROM tracks t
LEFT JOIN albums a ON t.album_id = a.id
LEFT JOIN artists ar ON a.artist_id = ar.id
LEFT JOIN likes l ON t.id = l.track_id AND l.like_date_time > SYSDATE - INTERVAL '7' DAY
GROUP BY t.id, t.name, ar.name
ORDER BY recent_likes DESC
FETCH FIRST 20 ROWS ONLY;