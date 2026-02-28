import React from "react";
import { useParams } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import { assets } from "../assets/assets";
import { PlayerContext } from "../contexts/PlayerContext.jsx";
import { useAlbum } from "../hooks/useAlbums";

const DisplayAlbum = () => {
  const { id } = useParams();
  const { album, tracks, loading, error } = useAlbum(id);
  const { playWithId, setActiveAlbum, setActivePlaylist, toggleLike, isLiked, setAutoAdvance } = React.useContext(PlayerContext);

  const convertDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <>
        <NavigationBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400 text-lg">Loading album...</div>
        </div>
      </>
    );
  }

  if (error || !album) {
    return (
      <>
        <NavigationBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-red-400 text-lg">
            {error || "Album not found"}
          </div>
        </div>
      </>
    );
  }

  const handlePlayAllInAlbum = () => {
    if (tracks && tracks.length > 0) {
      setActiveAlbum({ tracks });
      setActivePlaylist(null);
      playWithId(tracks[0].id);
      // Enable auto-advance AFTER playWithId (which resets it to false)
      setAutoAdvance(true);
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="mt-2 mb-2">
        <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end mb-8">
          <img
            src={album.image_url || album.image}
            alt={album.title || album.name}
            className="w-48 h-48 object-cover rounded"
          />
          <div>
            <p className="text-sm font-semibold mb-2">Album</p>
            <h2 className="text-4xl font-bold mb-4">{album.title || album.name}</h2>
            <h4 className="text-sm text-gray-400">{album.description || album.desc}</h4>
            <p className="mt-2">
              <img
                src={assets.spotify_logo}
                alt="Spotify Logo"
                className="w-6 inline-block mr-2"
              />
              <b>{album.artists?.map(a => a.name).join(', ') || 'Various Artists'} </b>
              &#8226; <b>{tracks?.length || 0} songs </b>
            </p>
          </div>
        </div>

        {/* Play all button */}
        {tracks && tracks.length > 0 && (
          <div className="flex items-center gap-4 mb-6 pl-2">
            <button
              onClick={handlePlayAllInAlbum}
              className="bg-green-500 hover:bg-green-400 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 transition-all"
            >
              <svg className="w-7 h-7 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}

        {/* Tracks Header */}
        <div className="grid grid-cols-[16px_1fr_1fr_40px_80px] sm:grid-cols-[16px_1fr_1fr_40px_80px] mt-4 mb-4 pl-2 text-[#a7a7a7] gap-4 items-center">
          <p>#</p>
          <p><b>Title</b></p>
          <p>Album</p>
          <p></p>
          <p className="text-right"><img className="w-4 inline" src={assets.clock_icon} alt="Time Icon" /></p>
        </div>
        <hr className="border-t border-gray-700 mb-4" />

        {/* Tracks List */}
        <div>
          {tracks && tracks.length > 0 ? (
            tracks.map((track, index) => (
              <div
                key={track.id}
                className="grid grid-cols-[16px_1fr_1fr_40px_80px] items-center gap-4 py-2 px-2 rounded hover:bg-[#ffffff26] cursor-pointer group"
              >
                <p className="text-[#a7a7a7] text-sm">{index + 1}</p>
                <div
                  className="flex items-center gap-3"
                  onClick={() => {
                    setActiveAlbum({ tracks });
                    setActivePlaylist(null);
                    playWithId(track.id);
                  }}
                >
                  <img
                    className="w-10 h-10 object-cover rounded"
                    src={track.image_url || track.image || album.image_url}
                    alt={track.title || track.name}
                  />
                  <span className="text-white">{track.title || track.name}</span>
                </div>
                <p className="text-[15px] text-[#a7a7a7]">{album.title || album.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(track.id);
                  }}
                  className={`transition-all ${isLiked(track.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  title={isLiked(track.id) ? 'Unlike' : 'Like'}
                >
                  <svg
                    className={`w-4 h-4 transition-all ${isLiked(track.id)
                      ? 'fill-green-500 text-green-500'
                      : 'fill-none text-white hover:text-green-400'
                      }`}
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <p className="text-[15px] text-[#a7a7a7] text-right">{convertDuration(track.duration)}</p>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">No tracks in this album</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DisplayAlbum;

