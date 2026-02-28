import React, { useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import DisplayHome from "./displayhome";
import DisplayAlbum from "./DisplayAlbum";
import LikedSongs from "./LikedSongs";

import AdminPage from "../admin/AdminPage";

const Display = () => {
    const displayRef = useRef();
    const location = useLocation();
    const bgColor = "#121212";
    useEffect(() => {
        if (location.pathname.includes("admin")) {
            displayRef.current.style.background = "#121212";
        } else {
            displayRef.current.style.background = `linear-gradient(180deg, ${bgColor} 0%, #121212 100%)`;
        }
    }, [location, bgColor]);
    return (
        <div ref={displayRef} className="w-full h-full m-2 px-6 pt-4 rounded bg-[#121212] text-white overflow-auto">
            <Routes>
                <Route path="/" element={<DisplayHome />} />
                <Route path="/album/:id" element={<DisplayAlbum />} />
                <Route path="/liked-songs" element={<LikedSongs />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </div>
    )
}

export default Display;