
-- 1. Auto Play Count Trigger

CREATE OR REPLACE FUNCTION trg_increment_play_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tracks SET play_count = play_count + 1 WHERE id = NEW.track_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_listening_history_insert ON listening_history_tracks;
CREATE TRIGGER after_listening_history_insert
AFTER INSERT ON listening_history_tracks
FOR EACH ROW EXECUTE FUNCTION trg_increment_play_count();



-- 2. Auto Playlist Track Order Trigger

CREATE OR REPLACE FUNCTION trg_auto_playlist_track_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.track_order IS NULL THEN
    SELECT COALESCE(MAX(track_order), 0) + 1 INTO NEW.track_order
    FROM playlist_tracks WHERE playlist_id = NEW.playlist_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_playlist_track_insert ON playlist_tracks;
CREATE TRIGGER before_playlist_track_insert
BEFORE INSERT ON playlist_tracks
FOR EACH ROW EXECUTE FUNCTION trg_auto_playlist_track_order();


-- 3. Auto updated_at Timestamp Triggers

CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- DROP TRIGGER IF EXISTS set_updated_at ON tracks;
-- CREATE TRIGGER set_updated_at BEFORE UPDATE ON tracks
-- FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at ON artists;
-- CREATE TRIGGER set_updated_at BEFORE UPDATE ON artists
-- FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON playlists;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON playlists
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- DROP TRIGGER IF EXISTS set_updated_at ON albums;
-- CREATE TRIGGER set_updated_at BEFORE UPDATE ON albums
-- FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();


-- 4. Auto-capitalize Artist Name Trigger

CREATE OR REPLACE FUNCTION trg_capitalize_artist_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.name = INITCAP(NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_artist_name ON artists;
CREATE TRIGGER before_artist_name
BEFORE INSERT OR UPDATE ON artists
FOR EACH ROW EXECUTE FUNCTION trg_capitalize_artist_name();


-- 5. Toggle Track Like Function

CREATE OR REPLACE FUNCTION toggle_track_like(p_user_id INT, p_track_id INT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM likes WHERE user_id = p_user_id AND track_id = p_track_id;
  IF FOUND THEN
    RETURN FALSE;  -- unliked
  ELSE
    INSERT INTO likes (user_id, track_id) VALUES (p_user_id, p_track_id);
    RETURN TRUE;   -- liked
  END IF;
END;
$$ LANGUAGE plpgsql;


-- 6. Toggle Artist Follow Function

CREATE OR REPLACE FUNCTION toggle_artist_follow(p_user_id INT, p_artist_id INT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM followers WHERE user_id = p_user_id AND artist_id = p_artist_id;
  IF FOUND THEN
    RETURN FALSE;  -- unfollowed
  ELSE
    INSERT INTO followers (user_id, artist_id) VALUES (p_user_id, p_artist_id);
    RETURN TRUE;   -- followed
  END IF;
END;
$$ LANGUAGE plpgsql;


-- 7. Toggle Podcast Follow Function

CREATE OR REPLACE FUNCTION toggle_podcast_follow(p_user_id INT, p_podcast_id INT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM podcast_followers WHERE user_id = p_user_id AND podcast_id = p_podcast_id;
  IF FOUND THEN
    RETURN FALSE;
  ELSE
    INSERT INTO podcast_followers (user_id, podcast_id) VALUES (p_user_id, p_podcast_id);
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;


-- 8. Create Album with Relations PROCEDURE

CREATE OR REPLACE PROCEDURE create_album_with_relations(
  p_name TEXT, p_image TEXT, p_artist_ids INT[], p_genre_ids INT[],
  INOUT out_album_id INT DEFAULT NULL
) 
LANGUAGE plpgsql
AS $$
DECLARE
  aid INT;
  gid INT;
BEGIN
  INSERT INTO albums (name, image) VALUES (p_name, p_image) RETURNING id INTO out_album_id;

  IF p_artist_ids IS NOT NULL THEN
    FOREACH aid IN ARRAY p_artist_ids LOOP
      INSERT INTO album_authors (album_id, artist_id) VALUES (out_album_id, aid) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  IF p_genre_ids IS NOT NULL THEN
    FOREACH gid IN ARRAY p_genre_ids LOOP
      INSERT INTO album_genres (album_id, genre_id) VALUES (out_album_id, gid) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END;
$$;


-- 9. Create Track with Relations PROCEDURE

CREATE OR REPLACE PROCEDURE create_track_with_relations(
  p_album_id INT, p_name TEXT, p_duration INT, p_path TEXT, p_image TEXT,
  p_track_number INT, p_is_explicit BOOLEAN,
  p_artist_data JSONB,  -- [{"id": 1, "role": "Primary"}, ...]
  p_genre_ids INT[],
  INOUT out_track_id INT DEFAULT NULL
) 
LANGUAGE plpgsql
AS $$
DECLARE
  artist JSONB;
  gid INT;
BEGIN
  INSERT INTO tracks (album_id, name, duration, path, image, track_number, is_explicit)
  VALUES (p_album_id, p_name, p_duration, p_path, p_image, p_track_number, p_is_explicit)
  RETURNING id INTO out_track_id;

  IF p_artist_data IS NOT NULL THEN
    FOR artist IN SELECT * FROM jsonb_array_elements(p_artist_data) LOOP
      INSERT INTO track_artists (track_id, artist_id, artist_role)
      VALUES (out_track_id, (artist->>'id')::INT, COALESCE(artist->>'role', 'Primary'))
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  IF p_genre_ids IS NOT NULL THEN
    FOREACH gid IN ARRAY p_genre_ids LOOP
      INSERT INTO track_genres (track_id, genre_id) VALUES (out_track_id, gid) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END;
$$;



-- 10. Get Admin Stats Function

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE(
  total_songs BIGINT, total_albums BIGINT, total_users BIGINT,
  total_artists BIGINT, total_genres BIGINT, total_podcasts BIGINT, total_episodes BIGINT
) AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT COUNT(*) FROM tracks),
    (SELECT COUNT(*) FROM albums),
    (SELECT COUNT(*) FROM users),
    (SELECT COUNT(*) FROM artists),
    (SELECT COUNT(*) FROM genres),
    (SELECT COUNT(*) FROM podcasts),
    (SELECT COUNT(*) FROM episodes);
END;
$$ LANGUAGE plpgsql;


-- 11. Get Artist Stats Function

CREATE OR REPLACE FUNCTION get_artist_stats(p_artist_id INT)
RETURNS TABLE(album_count BIGINT, track_count BIGINT, followers_count BIGINT, total_plays BIGINT) AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT COUNT(*) FROM album_authors WHERE artist_id = p_artist_id),
    (SELECT COUNT(*) FROM track_artists WHERE artist_id = p_artist_id),
    (SELECT COUNT(*) FROM followers WHERE artist_id = p_artist_id),
    (SELECT COALESCE(SUM(t.play_count), 0) FROM tracks t
     JOIN track_artists ta ON t.id = ta.track_id WHERE ta.artist_id = p_artist_id);
END;
$$ LANGUAGE plpgsql;



-- 12. Made For You Recommendation Function

CREATE OR REPLACE FUNCTION get_made_for_you(p_user_id INT, p_limit INT DEFAULT 50)
RETURNS SETOF tracks AS $$
BEGIN
  RETURN QUERY
  WITH UserTopGenres AS (
    SELECT tg.genre_id FROM likes l
    JOIN track_genres tg ON l.track_id = tg.track_id
    WHERE l.user_id = p_user_id
    GROUP BY tg.genre_id ORDER BY COUNT(*) DESC LIMIT 3
  ),
  UserFollowedArtists AS (
    SELECT artist_id FROM followers WHERE user_id = p_user_id
  ),
  UserListeningGenres AS (
    SELECT DISTINCT tg.genre_id FROM listening_history_tracks lht
    JOIN track_genres tg ON lht.track_id = tg.track_id WHERE lht.user_id = p_user_id
  )
  SELECT t.*
  FROM tracks t
  WHERE t.id NOT IN (
    SELECT track_id FROM listening_history_tracks
    WHERE user_id = p_user_id AND is_completed = true
  )
  ORDER BY 
    (CASE WHEN EXISTS (SELECT 1 FROM track_artists ta WHERE ta.track_id = t.id
       AND ta.artist_id IN (SELECT artist_id FROM UserFollowedArtists)) THEN 10 ELSE 0 END
    + CASE WHEN EXISTS (SELECT 1 FROM track_genres tg2 WHERE tg2.track_id = t.id
       AND tg2.genre_id IN (SELECT genre_id FROM UserTopGenres)) THEN 5 ELSE 0 END
    + CASE WHEN EXISTS (SELECT 1 FROM track_genres tg3 WHERE tg3.track_id = t.id
       AND tg3.genre_id IN (SELECT genre_id FROM UserListeningGenres)) THEN 20 ELSE 0 END
    + LOG(t.play_count + 1) * 2) DESC,
    t.created_at DESC
  LIMIT p_limit;

  IF NOT FOUND THEN
    RETURN QUERY SELECT * FROM tracks ORDER BY created_at DESC, play_count DESC LIMIT p_limit;
  END IF;
END;
$$ LANGUAGE plpgsql;
