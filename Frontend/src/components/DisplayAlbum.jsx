import React from "react";
import { useParams } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import { assets } from "../assets/assets";
import { PlayerContext } from "../contexts/PlayerContext.jsx";
import { useAlbum } from "../hooks/useAlbums";

const DisplayAlbum = () => {
  const { id } = useParams();
  const { album, tracks, loading, error } = useAlbum(id);
  const { playWithId, setActiveAlbum, setActivePlaylist } = React.useContext(PlayerContext);

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

  return (
    <>
      <NavigationBar />
      <div className="mt-2 mb-2">
        <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
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

            {/* {album.artistId && (
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => toggleFollow(album.artistId)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${isFollowing(album.artistId)
                    ? 'bg-transparent border-2 border-white text-white hover:border-gray-300 hover:scale-105'
                    : 'bg-white text-black hover:bg-gray-200 hover:scale-105'
                    }`}
                >
                  {isFollowing(album.artistId) ? 'Following' : 'Follow'}
                </button>
                <p className="text-sm text-gray-400">
                  <span className="text-white font-semibold">
                    {getFollowerCount(album.artistId).toLocaleString()}
                  </span> followers
                </p>
              </div>
            )} */}
          </div>
        </div>

        {/* Tracks Header */}
        <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
          <p className="mr-4"># <b>Title </b></p>
          <p>Album</p>
          <p className="hidden sm:block">Duration</p>
          <img className="m-auto w-4" src={assets.clock_icon} alt="Time Icon" />
        </div>
        <hr className="border-t border-gray-700 mb-4" />

        {/* Tracks List */}
        <div>
          {tracks && tracks.length > 0 ? (
            tracks.map((track, index) => (
              <div
                key={track.id}
                onClick={() => {
                  setActiveAlbum({ tracks });
                  setActivePlaylist(null);
                  playWithId(track.id);
                }}
                className="grid grid-cols-3 sm:grid-cols-4 items-center gap-4 py-2 px-2 rounded hover:bg-[#ffffff26] cursor-pointer"
              >
                <p className="text-white">
                  <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
                  <img
                    className="w-10 h-10 inline-block mr-4"
                    src={track.image_url || track.image || album.image_url}
                    alt={track.title || track.name}
                  />
                  <span>{track.title || track.name}</span>
                </p>
                <p className="text-[15px]">{album.title || album.name}</p>
                <p className="hidden sm:block text-[15px]">
                  {convertDuration(track.duration)}
                </p>
                <p className="text-[15px] text-center">{convertDuration(track.duration)}</p>
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

