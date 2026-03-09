import React, { useState } from "react";
import NavigationBar from "./NavigationBar";
import AlbumItem from "./AlbumItem";
import SongItem from "./SongItem";
import PodcastItem from "./PodcastItem";
import ArtistItem from "./ArtistItem";
import { useAlbums } from "../hooks/useAlbums";
import { useTrendingSongs, useNewReleases, useMadeForYou } from "../hooks/useTracks";
import { usePodcasts } from "../hooks/usePodcasts";
import { useTrendingArtists } from "../hooks/useArtists";

const MusicSection = () => {
  const { albums, loading: albumsLoading, error: albumsError } = useAlbums();
  const { tracks: trendingSongs, loading: trendingLoading } = useTrendingSongs();
  const { tracks: newReleases, loading: newReleasesLoading } = useNewReleases();
  const { tracks: madeForYou, loading: madeForYouLoading } = useMadeForYou();
  const { artists: trendingArtists, loading: trendingArtistsLoading, error: trendingArtistsError } = useTrendingArtists();

  return (
    <>
      {/* Trending Artists Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mt-6 mb-4">Top Artists</h2>
        {trendingArtistsLoading ? (
          <div className="flex items-center justify-center py-6"><div className="text-gray-400">Loading artists...</div></div>
        ) : trendingArtistsError ? (
          <div className="flex items-center justify-center py-6"><div className="text-red-400">Failed to load artists</div></div>
        ) : trendingArtists.length === 0 ? (
          <div className="flex items-center justify-center py-6"><div className="text-gray-400">No popular artists right now</div></div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {trendingArtists.map((artist) => (
              <ArtistItem
                key={artist.id}
                image={artist.image}
                name={artist.name}
                desc="Artist"
                id={artist.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Featured Albums Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mt-6 mb-4">Featured Charts</h2>
        {albumsLoading ? (
          <div className="flex items-center justify-center py-12"><div className="text-gray-400">Loading albums...</div></div>
        ) : albumsError ? (
          <div className="flex items-center justify-center py-12"><div className="text-red-400">Failed to load albums</div></div>
        ) : albums.length === 0 ? (
          <div className="flex items-center justify-center py-12"><div className="text-gray-400">No albums available</div></div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {albums.map((album) => (
              <AlbumItem
                key={album.id}
                image={album.image_url || album.image}
                name={album.title || album.name}
                desc={album.description || album.desc || 'Album'}
                id={album.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trending Songs Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mt-6 mb-4">Trending Now</h2>
        {trendingLoading ? (
          <div className="flex items-center justify-center py-12"><div className="text-gray-400">Loading trending songs...</div></div>
        ) : trendingSongs.length === 0 ? (
          <div className="flex items-center justify-center py-12"><div className="text-gray-400">No trending songs</div></div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {trendingSongs.map((song) => (
              <SongItem
                key={song.id}
                image={song.image_url || song.image}
                name={song.title || song.name}
                desc={song.artist || song.desc}
                id={song.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Releases Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mt-6 mb-4">New Releases</h2>
        {newReleasesLoading ? (
          <div className="flex items-center justify-center py-12"><div className="text-gray-400">Loading new releases...</div></div>
        ) : newReleases.length === 0 ? (
          <div className="flex items-center justify-center py-12"><div className="text-gray-400">No new releases</div></div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {newReleases.map((song) => (
              <SongItem
                key={song.id}
                image={song.image_url || song.image}
                name={song.title || song.name}
                desc={song.artist || song.desc}
                id={song.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Made For You Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mt-6 mb-4">Made For You</h2>
        {madeForYouLoading ? (
          <div className="flex items-center justify-center py-12"><div className="text-gray-400">Loading made for you...</div></div>
        ) : madeForYou.length === 0 ? (
          <div className="flex items-center justify-center py-12"><div className="text-gray-400">No made for you</div></div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {madeForYou.map((song) => (
              <SongItem
                key={song.id}
                image={song.image_url || song.image}
                name={song.title || song.name}
                desc={song.artist || song.desc}
                id={song.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const PodcastSection = () => {
  const { podcasts, loading: podcastsLoading, error: podcastsError } = usePodcasts();

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold mt-6 mb-4">Top Podcasts</h2>
      {podcastsLoading ? (
        <div className="flex items-center justify-center py-12"><div className="text-gray-400">Loading podcasts...</div></div>
      ) : podcastsError ? (
        <div className="flex items-center justify-center py-12"><div className="text-red-400">Failed to load podcasts</div></div>
      ) : podcasts.length === 0 ? (
        <div className="flex items-center justify-center py-12"><div className="text-gray-400">No podcasts available</div></div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {podcasts.map((podcast) => (
            <PodcastItem
              key={podcast.id}
              image={podcast.cover_image || podcast.image}
              name={podcast.title || podcast.name}
              desc={podcast.host_name || podcast.desc || 'Podcast'}
              id={podcast.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const DisplayHome = () => {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div>
      <>
        <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'All' && (
          <>
            <MusicSection />
            <PodcastSection />
          </>
        )}
        {activeTab === 'Music' && <MusicSection />}
        {activeTab === 'Podcasts' && <PodcastSection />}
      </>
    </div>
  );
};

export default DisplayHome;
