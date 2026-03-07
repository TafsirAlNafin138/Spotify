import React from "react";
import { PlayerContext } from "../contexts/PlayerContext.jsx";

const SongItem = ({ image, name, desc, id }) => {
    const { playWithId, setActiveAlbum, setActivePlaylist, toggleLike, isLiked } = React.useContext(PlayerContext);
    const liked = isLiked(id);

    return (
        <div className="min-w-[180px] max-w-[180px] w-[180px] flex-shrink-0 h-auto p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] transition group relative">
            <div onClick={() => {
                setActiveAlbum(null);
                setActivePlaylist(null);
                playWithId(id);
            }}>
                <div className="relative">
                    <img className="rounded mb-4 w-full aspect-square object-cover" src={image} alt="" />
                    {/* Play button overlay on hover */}
                    <div className="absolute bottom-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <p className="font-bold mt-2 mb-2 truncate">{name}</p>
                <p className="text-sm text-slate-400 truncate">{desc}</p>
            </div>
            {/* Heart icon — visible on hover or if liked */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(id);
                }}
                className={`absolute top-4 right-4 transition-all ${liked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                title={liked ? 'Unlike' : 'Like'}
            >
                <svg
                    className={`w-5 h-5 transition-all ${liked ? 'fill-green-500 text-green-500 scale-110' : 'fill-none text-white hover:text-green-400'}`}
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            </button>
        </div>
    )
}

export default SongItem;