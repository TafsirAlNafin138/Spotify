import pool from '../config/database.js'

async function setupDatabase() {
  const sql = `
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "albums" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL,
	"image" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "artists" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL,
	"bio" text,
	"image" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "genres" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL CONSTRAINT "genres_name_key" UNIQUE,
	"created_at" timestamp DEFAULT now(),
	"theme_color" varchar(7)
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL,
	"email" varchar(50) NOT NULL CONSTRAINT "users_email_key" UNIQUE,
	"password_hash" varchar(255),
	"image" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"refresh_token_hash" varchar(255),
	"last_login_at" timestamp,
	"is_active" boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS "podcasts" (
	"id" serial PRIMARY KEY,
	"title" varchar(100) NOT NULL,
	"host_name" varchar(100),
	"description" text,
	"cover_image" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "super_admins" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL CONSTRAINT "super_admins_email_key" UNIQUE,
	"password_hash" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tracks" (
	"id" serial PRIMARY KEY,
	"album_id" integer REFERENCES "albums"("id") ON DELETE SET NULL,
	"name" varchar(50) NOT NULL,
	"duration" integer NOT NULL,
	"path" varchar(255),
	"image" varchar(255),
	"track_number" integer,
	"is_explicit" boolean DEFAULT false,
	"play_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "album_authors" (
	"album_id" integer REFERENCES "albums"("id") ON DELETE CASCADE,
	"artist_id" integer REFERENCES "artists"("id") ON DELETE CASCADE,
	"is_primary" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "album_artists_pkey" PRIMARY KEY("album_id","artist_id")
);

CREATE TABLE IF NOT EXISTS "album_genres" (
	"album_id" integer REFERENCES "albums"("id") ON DELETE CASCADE,
	"genre_id" integer REFERENCES "genres"("id") ON DELETE CASCADE,
	CONSTRAINT "album_genres_pkey" PRIMARY KEY("album_id","genre_id")
);

CREATE TABLE IF NOT EXISTS "episodes" (
	"id" serial PRIMARY KEY,
	"podcast_id" integer NOT NULL REFERENCES "podcasts"("id") ON DELETE CASCADE,
	"title" varchar(100) NOT NULL,
	"description" text,
	"duration" integer,
	"audio_path" varchar(255),
	"release_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "followers" (
	"user_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
	"artist_id" integer REFERENCES "artists"("id") ON DELETE CASCADE,
	"followed_at" timestamp DEFAULT now(),
	CONSTRAINT "followers_pkey" PRIMARY KEY("user_id","artist_id")
);

CREATE TABLE IF NOT EXISTS "likes" (
	"user_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
	"track_id" integer REFERENCES "tracks"("id") ON DELETE CASCADE,
	"like_date_time" timestamp DEFAULT now(),
	CONSTRAINT "likes_pkey" PRIMARY KEY("user_id","track_id")
);

CREATE TABLE IF NOT EXISTS "listening_history_episodes" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"episode_id" integer NOT NULL REFERENCES "episodes"("id") ON DELETE CASCADE,
	"progress_seconds" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false,
	"last_played_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "listening_history_episodes_user_id_episode_id_key" UNIQUE("user_id","episode_id")
);

CREATE TABLE IF NOT EXISTS "listening_history_tracks" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"track_id" integer NOT NULL REFERENCES "tracks"("id") ON DELETE CASCADE,
	"progress_seconds" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false,
	"last_played_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "listening_history_tracks_user_id_track_id_key" UNIQUE("user_id","track_id")
);

CREATE TABLE IF NOT EXISTS "playlists" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "playlist_tracks" (
	"playlist_id" integer REFERENCES "playlists"("id") ON DELETE CASCADE,
	"track_id" integer REFERENCES "tracks"("id") ON DELETE CASCADE,
	"track_order" integer,
	"added_at" timestamp DEFAULT now(),
	CONSTRAINT "playlist_tracks_pkey" PRIMARY KEY("playlist_id","track_id")
);

CREATE TABLE IF NOT EXISTS "podcast_followers" (
	"user_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
	"podcast_id" integer REFERENCES "podcasts"("id") ON DELETE CASCADE,
	"followed_at" timestamp DEFAULT now(),
	CONSTRAINT "podcast_followers_pkey" PRIMARY KEY("user_id","podcast_id")
);

CREATE TABLE IF NOT EXISTS "track_artists" (
	"track_id" integer REFERENCES "tracks"("id") ON DELETE CASCADE,
	"artist_id" integer REFERENCES "artists"("id") ON DELETE CASCADE,
	"artist_role" varchar(50),
	CONSTRAINT "track_artists_pkey" PRIMARY KEY("track_id","artist_id")
);

CREATE TABLE IF NOT EXISTS "track_genres" (
	"track_id" integer REFERENCES "tracks"("id") ON DELETE CASCADE,
	"genre_id" integer REFERENCES "genres"("id") ON DELETE CASCADE,
	CONSTRAINT "track_genres_pkey" PRIMARY KEY("track_id","genre_id")
);
  `;

  try {
    await pool.query(sql);
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

setupDatabase();