-- PostgreSQL Schema for Music Streaming Platform
-- Generated from DBML schema

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS listening_history CASCADE;
DROP TABLE IF EXISTS podcast_followers CASCADE;
DROP TABLE IF EXISTS episodes CASCADE;
DROP TABLE IF EXISTS podcasts CASCADE;
DROP TABLE IF EXISTS album_genres CASCADE;
DROP TABLE IF EXISTS track_genres CASCADE;
DROP TABLE IF EXISTS genres CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS followers CASCADE;
DROP TABLE IF EXISTS playlist_tracks CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS track_artists CASCADE;
DROP TABLE IF EXISTS tracks CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS artists CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  track_clerk_id VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Artists Table
CREATE TABLE artists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  bio TEXT,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Albums Table
CREATE TABLE albums (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER,
  name VARCHAR(50) NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL
);

-- 4. Tracks Table
CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  album_id INTEGER,
  artist_id INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  duration INTEGER NOT NULL,
  path VARCHAR(255),
  image VARCHAR(255),
  is_explicit BOOLEAN DEFAULT FALSE,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

COMMENT ON COLUMN tracks.artist_id IS 'Primary artist';

-- 5. Track Artists (Many-to-Many)
CREATE TABLE track_artists (
  track_id INTEGER,
  artist_id INTEGER,
  artist_role VARCHAR(50),
  PRIMARY KEY (track_id, artist_id, artist_role), 
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

COMMENT ON COLUMN track_artists.artist_role IS 'e.g., featured, producer, composer';

-- 6. Playlists Table
CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  name VARCHAR(50) NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Playlist Tracks (Many-to-Many)
CREATE TABLE playlist_tracks (
  playlist_id INTEGER,
  track_id INTEGER,
  track_order INTEGER,
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (playlist_id, track_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);

-- 8. Followers (Many-to-Many)
CREATE TABLE followers (
  user_id INTEGER,
  artist_id INTEGER,
  PRIMARY KEY (user_id, artist_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

-- 9. Likes (Many-to-Many)
CREATE TABLE likes (
  user_id INTEGER,
  track_id INTEGER,
  like_date_time TIMESTAMP,
  PRIMARY KEY (user_id, track_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);

-- 10. Genres (Lookup Table)
CREATE TABLE genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Track Genres (Many-to-Many)
CREATE TABLE track_genres (
  track_id INTEGER,
  genre_id INTEGER,
  PRIMARY KEY (track_id, genre_id),
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

-- 12. Album Genres (Many-to-Many)
CREATE TABLE album_genres (
  album_id INTEGER,
  genre_id INTEGER,
  PRIMARY KEY (album_id, genre_id),
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

-- 13. Podcasts Table
CREATE TABLE podcasts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  host_name VARCHAR(100),
  description TEXT,
  cover_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 14. Episodes Table
CREATE TABLE episodes (
  id SERIAL PRIMARY KEY,
  podcast_id INTEGER,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  duration INTEGER,
  audio_path VARCHAR(255),
  release_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
);

-- 15. Podcast Followers (Many-to-Many)
CREATE TABLE podcast_followers (
  user_id INTEGER,
  podcast_id INTEGER,
  followed_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, podcast_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
);

-- 16. Listening History
CREATE TABLE listening_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  track_id INTEGER,
  episode_id INTEGER,
  progress_seconds INTEGER,
  is_completed BOOLEAN DEFAULT FALSE,
  last_played_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
  CHECK (
    (track_id IS NOT NULL AND episode_id IS NULL) OR 
    (track_id IS NULL AND episode_id IS NOT NULL)
  )
);

COMMENT ON COLUMN listening_history.track_id IS 'Nullable: Filled if listening to a song';
COMMENT ON COLUMN listening_history.episode_id IS 'Nullable: Filled if listening to a podcast';
COMMENT ON COLUMN listening_history.progress_seconds IS 'Where the user left off';

-- Create indexes for better query performance
CREATE INDEX idx_albums_artist_id ON albums(artist_id);
CREATE INDEX idx_tracks_album_id ON tracks(album_id);
CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_episodes_podcast_id ON episodes(podcast_id);
CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_listening_history_track_id ON listening_history(track_id);
CREATE INDEX idx_listening_history_episode_id ON listening_history(episode_id);
CREATE INDEX idx_genres_name ON genres(name);