import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import { PlayerContext } from "../contexts/PlayerContext.jsx";
import { axiosInstance } from "../services/axios";
import { useAuth } from "../providers/AuthProvider.jsx";

const DisplayPlaylist = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { playWithId, setActivePlaylist, setActiveAlbum, setAutoAdvance, fetchUserPlaylists } = useContext(PlayerContext);
    
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/playlists/${id}`);
                setPlaylist(response.data.data || response.data);
            } catch (err) {
                console.error('Error fetching playlist details:', err);
                // navigate safely if not found
                if (err.response?.status === 404) navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylist();
    }, [id, navigate]);

    const convertDuration = (duration) => {
        if (!duration) return "0:00";
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleRemoveTrack = async (trackId) => {
        try {
            await axiosInstance.delete(`/playlists/${id}/remove-track/${trackId}`);
            setPlaylist(prev => ({
                ...prev,
                tracks: prev.tracks.filter(t => t.id !== trackId),
                track_count: parseInt(prev.track_count) - 1
            }));
            fetchUserPlaylists(); // update sidebar count
        } catch (err) {
            console.error("Error removing track:", err);
        }
    };

    const handleDeletePlaylist = async () => {
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;
        try {
            await axiosInstance.delete(`/playlists/${id}`);
            fetchUserPlaylists();
            navigate('/');
        } catch (err) {
            console.error("Error deleting playlist:", err);
        }
    };

    const handlePlayAll = () => {
        if (playlist?.tracks?.length > 0) {
            setActivePlaylist({ tracks: playlist.tracks, name: playlist.name });
            setActiveAlbum(null);
            playWithId(playlist.tracks[0].id);
            setAutoAdvance(true);
        }
    };

    const isOwner = playlist?.user_id === user?.id;

    if (loading) {
        return (
            <>
                <NavigationBar />
                <div className="flex items-center justify-center py-16">
                    <div className="text-gray-400 text-lg">Loading playlist...</div>
                </div>
            </>
        );
    }

    if (!playlist) return null;

    return (
        <>
            <NavigationBar />
            <div className="mt-2 mb-2 pb-24">
                {/* Header */}
                <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end mb-8 relative group">
                    <div className="w-48 h-48 rounded flex items-center justify-center bg-[#282828] shadow-xl flex-shrink-0 overflow-hidden">
                        {playlist.image ? (
                            <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover" />
                        ) : (
                            <svg className="w-20 h-20 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold mb-2 uppercase tracking-wider">Playlist</p>
                        <h2 className="text-5xl font-bold mb-4">{playlist.name}</h2>
                        <p className="text-sm text-gray-400">{playlist.track_count || playlist.tracks?.length || 0} songs</p>
                    </div>
                    {isOwner && (
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={handleDeletePlaylist}
                                className="text-zinc-400 hover:text-red-500 font-bold text-sm bg-[#1a1a1a] px-4 py-2 rounded-full cursor-pointer hover:bg-[#2a2a2a] transition-colors duration-200"
                            >
                                Delete Playlist
                            </button>
                        </div>
                    )}
                </div>

                {/* Play all button */}
                {playlist.tracks && playlist.tracks.length > 0 && (
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
                {!playlist.tracks || playlist.tracks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                        <p className="text-gray-400 text-lg">This playlist is currently empty</p>
                        <p className="text-gray-500 text-sm">Find more songs to add to your collection</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-[16px_1fr_1fr_40px_80px] gap-4 items-center px-2 py-2 text-[#a7a7a7] text-sm border-b border-gray-700 mb-2">
                            <p>#</p>
                            <p>Title</p>
                            <p>Artist</p>
                            <p></p>
                            <p className="text-right">Duration</p>
                        </div>

                        {playlist.tracks.map((track, index) => (
                            <div
                                key={track.id}
                                className="grid grid-cols-[16px_1fr_1fr_40px_80px] gap-4 items-center px-2 py-2 rounded hover:bg-[#ffffff26] cursor-pointer group"
                            >
                                <p className="text-[#a7a7a7] text-sm">{index + 1}</p>
                                <div
                                    className="flex items-center gap-3 overflow-hidden"
                                    onClick={() => {
                                        setActivePlaylist({ tracks: playlist.tracks, name: playlist.name });
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
                                <p className="text-[15px] text-[#a7a7a7] truncate">{track.artists?.map(artist => artist.name).join(', ') || track.artist || ''}</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveTrack(track.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 hover:scale-110 transition-all text-zinc-400 hover:text-white"
                                    title="Remove from Playlist"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

export default DisplayPlaylist;
