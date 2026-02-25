import React from "react";
import NavigationBar from "./NavigationBar";
import AlbumItem from "./AlbumItem";
import SongItem from "./SongItem";
import { useAlbums } from "../hooks/useAlbums";
import { useTrendingSongs, useNewReleases } from "../hooks/useTracks";

const DisplayHome = () => {
  // Fetch data from backend
  const { albums, loading: albumsLoading, error: albumsError } = useAlbums();
  const { tracks: trendingSongs, loading: trendingLoading } = useTrendingSongs();
  const { tracks: newReleases, loading: newReleasesLoading } = useNewReleases();

  return (
    <div>
      <>
        <NavigationBar />

        {/* Featured Albums Section */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mt-6 mb-4">Featured Charts</h2>
          
          {albumsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading albums...</div>
            </div>
          ) : albumsError ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-400">Failed to load albums</div>
            </div>
          ) : albums.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">No albums available</div>
            </div>
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
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading trending songs...</div>
            </div>
          ) : trendingSongs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">No trending songs</div>
            </div>
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
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading new releases...</div>
            </div>
          ) : newReleases.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">No new releases</div>
            </div>
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
      </>
    </div>
  );
};

export default DisplayHome;

