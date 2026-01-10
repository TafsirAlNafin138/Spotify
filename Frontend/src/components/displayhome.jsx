import React from "react";
import NavigationBar from "./NavigationBar";
import { albumsData } from "../assets/assets";
import AlbumItem from "./AlbumItem";
import { songsData } from "../assets/assets";
import SongItem from "./SongItem";

const DisplayHome = () => {
  return (
    <div>
      <>
        <NavigationBar />

        {/* <div className="mb-4">
          <h2 className="text-2xl font-bold mt-6 mb-4">Featured Charts</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {albumsData.map((item, index) => (
              <DisplayArtistProfile
                key={index}
                image={item.image}
              />
            ))}
          </div>
        </div> */}

        <div className="mb-4">
          <h2 className="text-2xl font-bold mt-6 mb-4">Featured Charts</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {albumsData.map((item, index) => (
              <AlbumItem
                key={index}
                image={item.image}
                name={item.name}
                desc={item.desc}
                id={item.id}
              />
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold mt-6 mb-4">Today's Biggest Hits</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {songsData.map((item, index) => (
              <SongItem
                key={index}
                image={item.image}
                name={item.name}
                desc={item.desc}
                id={item.id}
              />
            ))}
          </div>
        </div>


        {/* <div className="mb-4">
          <h2 className="text-2xl font-bold mt-6 mb-4">Featured Charts</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {albumsData.map((item, index) => (
              <DisplaymadeforYou
                key={index}
                image={item.image}
              />
            ))}
          </div>
        </div> */}
      </>
    </div>
  );
};

export default DisplayHome;
