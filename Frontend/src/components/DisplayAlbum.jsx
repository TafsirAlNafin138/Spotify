import React, { useState } from "react";
import { useParams } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import { albumsData, assets, songsData } from "../assets/assets";

const DisplayAlbum = () => {
  const { id } = useParams();
  const albumdata = albumsData.find((album) => album.id === parseInt(id));
  // const [hoveredSong, setHoveredSong] = useState(null);
  // const [likedSongs, setLikedSongs] = useState(new Set());

  // const toggleLike = (songId) => {
  //     setLikedSongs(prevLiked => {
  //         const newLiked = new Set(prevLiked);
  //         if (newLiked.has(songId)) {
  //             newLiked.delete(songId);
  //         } else {
  //             newLiked.add(songId);
  //         }
  //         return newLiked;
  //     });
  // };

  return (
    <>
      <NavigationBar />
      {albumdata ? (
        <div className="mt-2 mb - 2">  
        <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
          <img
            src={albumdata.image}
            alt={albumdata.name}
            className="w-48 h-48 object-cover rounded"
          />
          <div>
            <p className="text-sm font-semibold mb-2">Playlist</p>
            <h2 className="text-4xl font-bold mb-4">{albumdata.name}</h2>
            <h4 className="text-sm text-gray-400">{albumdata.desc}</h4>
            <p className="mt-2">
              <img
                src={assets.spotify_logo}
                alt="Spotify Logo"
                className="w-6 inline-block mr-2"
              />
              <b>Spotify </b>
              {/* &#8226; {likesData.length} likes */}
              &#8226; <b> 50 songs </b>
              {/* {albumdata.totalDuration} mins */}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
            <p className="mr-4"># <b>Title </b></p>
            <p>Album</p>
            <p className="hidden sm:block">Date Added</p>
            <img className="m-auto w-4" src={assets.clock_icon} alt="Time Icon" />
        </div>
        <hr className="border-t border-gray-700 mb-4" />
        <div>
          {songsData.map((item, index) => (   
            <div
                key={index}
                className="grid grid-cols-3 sm:grid-cols-4 items-center gap-4 py-2 px-2 rounded hover:bg-[#ffffff26] cursor-pointer"
            >
                
                <p className="text-white">
                    <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
                    <img
                        className="w-10 h-10 inline-block mr-4"
                        src={item.image}
                        alt={item.name}
                    />
                    <span>{item.name}</span>
                </p>
                <p className="text-[15px]">{albumdata.name}</p>
                <p className="hidden sm:block text-[15px]">Aug 20, 2023</p>
                <p className="text-[15px] text-center">{item.duration}</p>
                </div>
          ))}
        </div>
         </div>
      ) : (
        <p className="text-center text-red-500 mt-10">Album not found.</p>
      )}
    </>
  );
};

export default DisplayAlbum;
