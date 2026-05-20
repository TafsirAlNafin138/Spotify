CREATE SCHEMA "public";

CREATE TABLE "album_authors" (
	"album_id" integer,
	"artist_id" integer,
	"is_primary" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "album_artists_pkey" PRIMARY KEY("album_id","artist_id")
);
CREATE TABLE "album_genres" (
	"album_id" integer,
	"genre_id" integer,
	CONSTRAINT "album_genres_pkey" PRIMARY KEY("album_id","genre_id")
);
CREATE TABLE "albums" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL,
	"image" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
CREATE TABLE "artists" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL,
	"bio" text,
	"image" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
CREATE TABLE "episodes" (
	"id" serial PRIMARY KEY,
	"podcast_id" integer NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"duration" integer,
	"audio_path" varchar(255),
	"release_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
CREATE TABLE "followers" (
	"user_id" integer,
	"artist_id" integer,
	"followed_at" timestamp DEFAULT now(),
	CONSTRAINT "followers_pkey" PRIMARY KEY("user_id","artist_id")
);
CREATE TABLE "genres" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL CONSTRAINT "genres_name_key" UNIQUE,
	"created_at" timestamp DEFAULT now(),
	"theme_color" varchar(7)
);
CREATE TABLE "likes" (
	"user_id" integer,
	"track_id" integer,
	"like_date_time" timestamp DEFAULT now(),
	CONSTRAINT "likes_pkey" PRIMARY KEY("user_id","track_id")
);
CREATE TABLE "listening_history_episodes" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL UNIQUE,
	"episode_id" integer NOT NULL UNIQUE,
	"progress_seconds" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false,
	"last_played_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "listening_history_episodes_user_id_episode_id_key" UNIQUE("user_id","episode_id")
);
CREATE TABLE "listening_history_tracks" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL UNIQUE,
	"track_id" integer NOT NULL UNIQUE,
	"progress_seconds" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false,
	"last_played_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "listening_history_tracks_user_id_track_id_key" UNIQUE("user_id","track_id")
);
CREATE TABLE "playlist_tracks" (
	"playlist_id" integer,
	"track_id" integer,
	"track_order" integer,
	"added_at" timestamp DEFAULT now(),
	CONSTRAINT "playlist_tracks_pkey" PRIMARY KEY("playlist_id","track_id")
);
CREATE TABLE "playlists" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
CREATE TABLE "podcast_followers" (
	"user_id" integer,
	"podcast_id" integer,
	"followed_at" timestamp DEFAULT now(),
	CONSTRAINT "podcast_followers_pkey" PRIMARY KEY("user_id","podcast_id")
);
CREATE TABLE "podcasts" (
	"id" serial PRIMARY KEY,
	"title" varchar(100) NOT NULL,
	"host_name" varchar(100),
	"description" text,
	"cover_image" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
CREATE TABLE "super_admins" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL CONSTRAINT "super_admins_email_key" UNIQUE,
	"password_hash" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
CREATE TABLE "track_artists" (
	"track_id" integer,
	"artist_id" integer,
	"artist_role" varchar(50),
	CONSTRAINT "track_artists_pkey" PRIMARY KEY("track_id","artist_id")
);
CREATE TABLE "track_genres" (
	"track_id" integer,
	"genre_id" integer,
	CONSTRAINT "track_genres_pkey" PRIMARY KEY("track_id","genre_id")
);
CREATE TABLE "tracks" (
	"id" serial PRIMARY KEY,
	"album_id" integer,
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
CREATE TABLE "users" (
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

CREATE UNIQUE INDEX "album_artists_pkey" ON "album_authors" ("album_id","artist_id");
CREATE UNIQUE INDEX "album_genres_pkey" ON "album_genres" ("album_id","genre_id");
CREATE UNIQUE INDEX "albums_pkey" ON "albums" ("id");
CREATE UNIQUE INDEX "artists_pkey" ON "artists" ("id");
CREATE UNIQUE INDEX "episodes_pkey" ON "episodes" ("id");
CREATE UNIQUE INDEX "followers_pkey" ON "followers" ("user_id","artist_id");
CREATE UNIQUE INDEX "genres_name_key" ON "genres" ("name");
CREATE UNIQUE INDEX "genres_pkey" ON "genres" ("id");
CREATE UNIQUE INDEX "likes_pkey" ON "likes" ("user_id","track_id");
CREATE UNIQUE INDEX "listening_history_episodes_pkey" ON "listening_history_episodes" ("id");
CREATE UNIQUE INDEX "listening_history_episodes_user_id_episode_id_key" ON "listening_history_episodes" ("user_id","episode_id");
CREATE UNIQUE INDEX "listening_history_tracks_pkey" ON "listening_history_tracks" ("id");
CREATE UNIQUE INDEX "listening_history_tracks_user_id_track_id_key" ON "listening_history_tracks" ("user_id","track_id");
CREATE UNIQUE INDEX "playlist_tracks_pkey" ON "playlist_tracks" ("playlist_id","track_id");
CREATE UNIQUE INDEX "playlists_pkey" ON "playlists" ("id");
CREATE UNIQUE INDEX "podcast_followers_pkey" ON "podcast_followers" ("user_id","podcast_id");
CREATE UNIQUE INDEX "podcasts_pkey" ON "podcasts" ("id");
CREATE UNIQUE INDEX "super_admins_email_key" ON "super_admins" ("email");
CREATE UNIQUE INDEX "super_admins_pkey" ON "super_admins" ("id");
CREATE UNIQUE INDEX "track_artists_pkey" ON "track_artists" ("track_id","artist_id");
CREATE UNIQUE INDEX "track_genres_pkey" ON "track_genres" ("track_id","genre_id");
CREATE UNIQUE INDEX "tracks_pkey" ON "tracks" ("id");
CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");
CREATE UNIQUE INDEX "users_pkey" ON "users" ("id");

ALTER TABLE "album_authors" ADD CONSTRAINT "album_artists_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE;
ALTER TABLE "album_authors" ADD CONSTRAINT "album_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE;
ALTER TABLE "album_genres" ADD CONSTRAINT "album_genres_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE;
ALTER TABLE "album_genres" ADD CONSTRAINT "album_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE CASCADE;
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE CASCADE;
ALTER TABLE "followers" ADD CONSTRAINT "followers_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE;
ALTER TABLE "followers" ADD CONSTRAINT "followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "likes" ADD CONSTRAINT "likes_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE;
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "listening_history_episodes" ADD CONSTRAINT "listening_history_episodes_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE;
ALTER TABLE "listening_history_episodes" ADD CONSTRAINT "listening_history_episodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "listening_history_tracks" ADD CONSTRAINT "listening_history_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE;
ALTER TABLE "listening_history_tracks" ADD CONSTRAINT "listening_history_tracks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE;
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE;
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "podcast_followers" ADD CONSTRAINT "podcast_followers_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "podcasts"("id") ON DELETE CASCADE;
ALTER TABLE "podcast_followers" ADD CONSTRAINT "podcast_followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "track_artists" ADD CONSTRAINT "track_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE;
ALTER TABLE "track_artists" ADD CONSTRAINT "track_artists_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE;
ALTER TABLE "track_genres" ADD CONSTRAINT "track_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE CASCADE;
ALTER TABLE "track_genres" ADD CONSTRAINT "track_genres_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE;
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE SET NULL;