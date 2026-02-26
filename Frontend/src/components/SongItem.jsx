import React from "react";
import { PlayerContext } from "../contexts/PlayerContext.jsx";

const SongItem = ({ image, name, desc, id }) => {
    const { playWithId, setActiveAlbum, setActivePlaylist } = React.useContext(PlayerContext);
    return (
        <div onClick={() => {
            setActiveAlbum(null);
            setActivePlaylist(null);
            playWithId(id);
        }} className="min-w-[180px] h-auto p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] transition">
            <img className="rounded mb-4" src={image} alt="" />
            <p className="font-bold mt-2 mb-2">{name}</p>
            <p className="text-sm text-slate-400">{desc}</p>
        </div>
    )
}

export default SongItem;