import React, { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar";
import { axiosInstance } from "../services/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { PlayerContext } from "../contexts/PlayerContext.jsx";

const FollowedPodcasts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { togglePodcastFollow } = React.useContext(PlayerContext);
    const [podcasts, setPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowedPodcasts = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axiosInstance.get(`/podcast-followers/my-podcasts`);
                const data = response.data.data || response.data;
                setPodcasts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching followed podcasts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFollowedPodcasts();
    }, [user]);

    const handlePodcastClick = (id) => {
        navigate(`/podcast/${id}`);
    };

    const handleUnfollow = async (podcastId) => {
        await togglePodcastFollow(podcastId);
        // Remove from local list immediately
        setPodcasts(prev => prev.filter(p => p.id !== podcastId));
    };

    return (
        <>
            <NavigationBar />
            <div className="mt-2 mb-2">
                {/* Header */}
                <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end mb-8">
                    {/* Gradient icon for followed podcasts */}
                    <div className="w-48 h-48 rounded flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 shadow-xl flex-shrink-0">
                        <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold mb-2 uppercase tracking-wider">Library</p>
                        <h2 className="text-5xl font-bold mb-4">Followed Podcasts</h2>
                        <p className="text-sm text-gray-400">{podcasts.length} {podcasts.length === 1 ? 'podcast' : 'podcasts'}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-gray-400 text-lg">Loading followed podcasts...</div>
                    </div>
                ) : podcasts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <p className="text-gray-400 text-lg">Podcasts you follow will appear here</p>
                        <p className="text-gray-500 text-sm">Find and follow your favorite podcasts to stay updated</p>
                    </div>
                ) : (
                    <>
                        {/* Table header */}
                        <div className="grid grid-cols-[16px_1.5fr_minmax(0,1fr)_150px_120px] gap-4 items-center px-2 py-2 text-[#a7a7a7] text-sm border-b border-gray-700 mb-2">
                            <p>#</p>
                            <p>Title</p>
                            <p>Host</p>
                            <p></p>
                            <p className="text-center font-bold text-white">Episodes</p>
                        </div>

                        {podcasts.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="grid grid-cols-[16px_1.5fr_minmax(0,1fr)_150px_120px] gap-4 items-center px-2 py-2 rounded hover:bg-[#ffffff26] cursor-pointer group transition-colors"
                            >
                                <p className="text-[#a7a7a7] text-sm">{index + 1}</p>
                                <div
                                    className="flex items-center gap-3 overflow-hidden"
                                    onClick={() => handlePodcastClick(item.id)}
                                >
                                    <img
                                        className="w-10 h-10 object-cover rounded flex-shrink-0"
                                        src={item.cover_image || item.image || item.image_url}
                                        alt={item.name || item.title}
                                    />
                                    <span className="text-white truncate hover:underline">{item.name || item.title}</span>
                                </div>

                                {/* Host name in its own column — truncated */}
                                <p className="text-[15px] text-[#a7a7a7] truncate">{item.host_name || item.artist || item.desc || "Podcast"}</p>

                                {/* Unfollow button sits directly next to the host */}
                                <div className="flex items-center justify-start">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnfollow(item.id);
                                        }}
                                        className="text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200 bg-gradient-to-r from-green-500 to-teal-500 text-black hover:from-green-400 hover:to-teal-400 hover:scale-105 hover:shadow-[0_0_12px_rgba(34,197,94,0.6)] active:scale-95 whitespace-nowrap"
                                        title="Unfollow"
                                    >
                                        Unfollow
                                    </button>
                                </div>

                                <p className="text-[15px] text-white font-bold text-center">{item.episode_count || 0}</p>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </>
    );
};

export default FollowedPodcasts;
