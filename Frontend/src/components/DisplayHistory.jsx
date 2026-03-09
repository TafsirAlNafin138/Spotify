import React, { useState, useEffect, useContext } from "react";
import NavigationBar from "./NavigationBar";
import { useAuth } from "../providers/AuthProvider";
import useHistory from "../hooks/useHistory";
import { PlayerContext } from "../contexts/PlayerContext";
import { useNavigate } from "react-router-dom";

const DisplayHistory = () => {
    const { user } = useAuth();
    const { playWithId, playEpisodeWithId } = useContext(PlayerContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tracks');

    const {
        trackHistory,
        podcastHistory,
        tracksLoading,
        podcastsLoading,
        prefetchTracks,
        prefetchPodcasts,
    } = useHistory(user?.id);

    useEffect(() => {
        if (user) {
            if (activeTab === 'tracks') {
                prefetchTracks();
            } else if (activeTab === 'podcasts') {
                prefetchPodcasts();
            }
        }
    }, [user, activeTab, prefetchTracks, prefetchPodcasts]);

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const formatDuration = (sec) => {
        if (!sec) return '';
        return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
    };

    if (!user) {
        return (
            <div className="flex flex-col h-full">
                <NavigationBar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-zinc-400">Please log in to view your history.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <NavigationBar />

            <div className="mt-8 px-2 flex-1 overflow-y-auto pb-24">
                <h1 className="text-3xl font-bold mb-6">Your History</h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-zinc-800 pb-2">
                    <button
                        onClick={() => setActiveTab('tracks')}
                        className={`text-sm font-semibold pb-2 px-1 relative ${activeTab === 'tracks' ? 'text-white' : 'text-zinc-400 hover:text-white transition'}`}
                    >
                        Tracks History
                        {activeTab === 'tracks' && (
                            <div className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-green-500 rounded-full"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('podcasts')}
                        onMouseEnter={prefetchPodcasts}
                        className={`text-sm font-semibold pb-2 px-1 relative ${activeTab === 'podcasts' ? 'text-white' : 'text-zinc-400 hover:text-white transition'}`}
                    >
                        Podcast History
                        {activeTab === 'podcasts' && (
                            <div className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-green-500 rounded-full"></div>
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'tracks' && (
                    <div className="flex flex-col gap-2">
                        {tracksLoading ? (
                            <div className="text-center py-10 text-zinc-500 text-sm animate-pulse">Loading tracks history...</div>
                        ) : trackHistory.length === 0 ? (
                            <div className="text-center py-10 text-zinc-500 text-sm">No track history found.</div>
                        ) : (
                            trackHistory.map((item, index) => (
                                <div
                                    key={`${item.track_id || item.id}-${index}`}
                                    className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 rounded-md hover:bg-[#ffffff26] transition group cursor-pointer"
                                    onClick={() => {
                                        playWithId(item.track_id || item.id, { startTime: item.progress_seconds || 0 });
                                        navigate('/');
                                    }}
                                >
                                    <div className="w-12 h-12 relative flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full rounded object-cover" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-white text-base font-medium truncate">{item.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-zinc-400 text-xs w-8 text-right">{formatDuration(item.progress_seconds || 0)}</p>
                                            <div className="w-full max-w-[200px] bg-zinc-700 h-1 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-green-500 h-full transition-all"
                                                    style={{ width: `${item.duration ? Math.min(100, Math.max(0, ((item.progress_seconds || 0) / item.duration) * 100)) : 0}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-zinc-400 text-xs w-8 text-left">{formatDuration(item.duration)}</p>
                                        </div>
                                    </div>
                                    <span className="text-zinc-400 text-sm whitespace-nowrap">{formatTime(item.last_played_at)}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'podcasts' && (
                    <div className="flex flex-col gap-2">
                        {podcastsLoading ? (
                            <div className="text-center py-10 text-zinc-500 text-sm animate-pulse">Loading podcast history...</div>
                        ) : podcastHistory.length === 0 ? (
                            <div className="text-center py-10 text-zinc-500 text-sm">No podcast history found.</div>
                        ) : (
                            podcastHistory.map((item, index) => (
                                <div
                                    key={`${item.episode_id || item.id}-${index}`}
                                    className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 rounded-md hover:bg-[#ffffff26] cursor-pointer transition group"
                                    onClick={() => {
                                        navigate(`/podcast/${item.podcast_id || item.podcast_id_field || item.id}`);
                                        // Wait a tiny bit for the route to load before trying to play it
                                        setTimeout(() => {
                                            const formattedEpisode = {
                                                id: item.episode_id || item.id,
                                                title: item.title,
                                                cover_image: item.cover_image,
                                                audio_path: item.audio_path,
                                                duration: item.duration,
                                            };
                                            playEpisodeWithId(item.episode_id || item.id, [formattedEpisode], item.cover_image, { startTime: item.progress_seconds || 0 });
                                        }, 100);
                                    }}
                                >
                                    <div className="w-12 h-12 relative flex-shrink-0">
                                        <img src={item.cover_image} alt={item.title} className="w-full h-full rounded object-cover" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-white text-base font-medium truncate">{item.title}</p>
                                        <p className="text-zinc-400 text-sm truncate">{item.podcast_title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-zinc-400 text-xs w-8 text-right">{formatDuration(item.progress_seconds || 0)}</p>
                                            <div className="w-full max-w-[200px] bg-zinc-700 h-1 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-green-500 h-full transition-all"
                                                    style={{ width: `${item.duration ? Math.min(100, Math.max(0, ((item.progress_seconds || 0) / item.duration) * 100)) : 0}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-zinc-400 text-xs w-8 text-left">{formatDuration(item.duration)}</p>
                                        </div>
                                    </div>
                                    <span className="text-zinc-400 text-sm whitespace-nowrap">{formatTime(item.last_played_at)}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplayHistory;
