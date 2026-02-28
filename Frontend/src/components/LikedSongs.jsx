import React, { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar";
import { PlayerContext } from "../contexts/PlayerContext.jsx";
import { axiosInstance } from "../services/axios";

const LikedSongs = () => {
    const { playWithId, setActivePlaylist, setActiveAlbum, toggleLike, isLiked, setAutoAdvance } = React.useContext(PlayerContext);
    const [likedTracks, setLikedTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLiked = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/likes/my-likes');
                const tracks = response.data.data || response.data;
                setLikedTracks(Array.isArray(tracks) ? tracks : []);
            } catch (err) {
                console.error('Error fetching liked tracks:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLiked();
    }, []);

    const convertDuration = (duration) => {
        if (!duration) return "0:00";
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleUnlike = async (trackId) => {
        await toggleLike(trackId);
        // Remove from local list immediately
        setLikedTracks(prev => prev.filter(t => t.id !== trackId));
    };

    const handlePlayAll = () => {
        if (likedTracks.length > 0) {
            setActivePlaylist({ tracks: likedTracks, name: 'Liked Songs' });
            setActiveAlbum(null);
            playWithId(likedTracks[0].id);
            // Enable auto-advance AFTER playWithId (which resets it to false)
            setAutoAdvance(true);
        }
    };

    return (
        <>
            <NavigationBar />
            <div className="mt-2 mb-2">
                {/* Header */}
                <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end mb-8">
                    {/* Gradient icon for liked songs */}
                    <div className="w-48 h-48 rounded flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-600 to-fuchsia-500 shadow-xl flex-shrink-0">
                        <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold mb-2 uppercase tracking-wider">Playlist</p>
                        <h2 className="text-5xl font-bold mb-4">Liked Songs</h2>
                        <p className="text-sm text-gray-400">{likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}</p>
                    </div>
                </div>

                {/* Play all button */}
                {likedTracks.length > 0 && (
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={handlePlayAll}
                            className="bg-green-500 hover:bg-green-400 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 transition-all"
                        >
                            <svg className="w-7 h-7 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Track list */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-gray-400 text-lg">Loading liked songs...</div>
                    </div>
                ) : likedTracks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <p className="text-gray-400 text-lg">Songs you like will appear here</p>
                        <p className="text-gray-500 text-sm">Save songs by tapping the heart icon</p>
                    </div>
                ) : (
                    <>
                        {/* Table header */}
                        <div className="grid grid-cols-[16px_1fr_1fr_40px_80px] gap-4 items-center px-2 py-2 text-[#a7a7a7] text-sm border-b border-gray-700 mb-2">
                            <p>#</p>
                            <p>Title</p>
                            <p>Artist</p>
                            <p></p>
                            <p className="text-right">Duration</p>
                        </div>

                        {likedTracks.map((track, index) => (
                            <div
                                key={track.id}
                                className="grid grid-cols-[16px_1fr_1fr_40px_80px] gap-4 items-center px-2 py-2 rounded hover:bg-[#ffffff26] cursor-pointer group"
                            >
                                <p className="text-[#a7a7a7] text-sm">{index + 1}</p>
                                <div
                                    className="flex items-center gap-3 overflow-hidden"
                                    onClick={() => {
                                        setActivePlaylist({ tracks: likedTracks, name: 'Liked Songs' });
                                        setActiveAlbum(null);
                                        playWithId(track.id);
                                    }}
                                >
                                    <img
                                        className="w-10 h-10 object-cover rounded flex-shrink-0"
                                        src={track.image_url || track.image}
                                        alt={track.title || track.name}
                                    />
                                    <span className="text-white truncate">{track.title || track.name}</span>
                                </div>
                                <p className="text-[15px] text-[#a7a7a7] truncate">{track.artists?.map(artist => artist.name).join(', ') || ''}</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUnlike(track.id);
                                    }}
                                    className="opacity-100 hover:scale-110 transition-all"
                                    title="Unlike"
                                >
                                    <svg
                                        className="w-4 h-4 fill-green-500 text-green-500"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                                <p className="text-[15px] text-[#a7a7a7] text-right">{convertDuration(track.duration)}</p>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </>
    );
};

export default LikedSongs;
