import React from "react";
import { useNavigate } from "react-router-dom";

const AlbumItem = ({ image, name, desc, id }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/album/${id}`)} key={id} className="min-w-[180px] max-w-[180px] w-[180px] flex-shrink-0 h-auto p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] transition">
            <img className="rounded mb-4 w-full aspect-square object-cover" src={image} alt="" />
            <p className="font-bold mt-2 mb-2 truncate">{name}</p>
            <p className="text-sm text-slate-400 truncate">{desc}</p>
        </div>
    )
}

export default AlbumItem;