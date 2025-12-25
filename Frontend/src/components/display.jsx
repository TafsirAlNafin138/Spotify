import React, { useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import DisplayHome from "./displayhome";
import DisplayAlbum from "./DisplayAlbum";
import { albumsData } from "../assets/assets";

const Display = () => {
    const displayRef = useRef();
    const location = useLocation();
    let albumId = (location.pathname.includes("/album/"))? location.pathname.slice(-1) : null;
    albumId = albumId && isNaN(albumId) ? null : albumId;
    const bgColor = albumsData[albumId]?.bgColor || "#121212";
    useEffect(() => {
    displayRef.current.style.background = `linear-gradient(180deg, ${bgColor} 0%, #121212 100%)`;
    }, [location, bgColor]);
    return (
        <div ref={displayRef} className="w-[100%] m-2 px-6 pt-4 rounded bg-[#121212] text-white overflow-auto lg:w-[75%] lg:ml-0">
            <Routes>
                <Route path="/" element={<DisplayHome />} />
                <Route path="/album/:id" element={<DisplayAlbum />} />
            </Routes>
        </div>
    )
}

export default Display;