CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  clerk_id VARCHAR(255) NOT NULL UNIQUE,
  date_of_birth DATE,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE artists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  bio TEXT,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE albums (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE album_artists (
  album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
  artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (album_id, artist_id)
);

CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
  name VARCHAR(50) NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  path VARCHAR(255),
  image VARCHAR(255),
  track_number INTEGER,
  is_explicit BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE track_artists (
  track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
  artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  artist_role VARCHAR(50), -- e.g., 'Primary', 'Featured', 'Producer'
  PRIMARY KEY (track_id, artist_id)
);


-- User Interaction Tables

CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playlist_tracks (
  playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
  track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
  track_order INTEGER,
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (playlist_id, track_id)
);

CREATE TABLE followers (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  followed_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, artist_id)
);

CREATE TABLE likes (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
  like_date_time TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, track_id)
);


-- Categorization

CREATE TABLE genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE track_genres (
  track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
  genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (track_id, genre_id)
);

CREATE TABLE album_genres (
  album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
  genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (album_id, genre_id)
);


-- Podcasts

CREATE TABLE podcasts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  host_name VARCHAR(100),
  description TEXT,
  cover_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE episodes (
  id SERIAL PRIMARY KEY,
  podcast_id INTEGER NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  duration INTEGER,
  audio_path VARCHAR(255),
  release_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE podcast_followers (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  podcast_id INTEGER REFERENCES podcasts(id) ON DELETE CASCADE,
  followed_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, podcast_id)
);

-- Listening History

CREATE TABLE listening_history_tracks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  last_played_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, track_id)
);

CREATE TABLE listening_history_episodes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  last_played_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, episode_id)
);

-- Admin Tables

CREATE TABLE super_admins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin_audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES super_admins(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, 
  target_table VARCHAR(50) NOT NULL,
  target_id INTEGER,
  changes JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);