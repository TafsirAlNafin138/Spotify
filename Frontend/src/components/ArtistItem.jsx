import React from "react";
import { useNavigate } from "react-router-dom";

const ArtistItem = ({ image, name, desc, id }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/artist/${id}`)} className="min-w-[150px] max-w-[150px] w-[150px] flex-shrink-0 h-auto p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] transition flex flex-col items-center text-center">
            <img className="rounded-full mb-4 w-[120px] h-[120px] aspect-square object-cover" src={image} alt={name} />
            <p className="font-bold mt-2 mb-1 truncate w-full">{name}</p>
            <p className="text-xs text-slate-400 truncate w-full">{desc || 'Artist'}</p>
        </div>
    )
}

export default ArtistItem;
