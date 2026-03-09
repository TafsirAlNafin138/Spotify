import React, { useState, useEffect, useContext } from "react";
import NavigationBar from "./NavigationBar";
import { useAuth } from "../providers/AuthProvider";
import useHistory from "../hooks/useHistory";
import { PlayerContext } from "../contexts/PlayerContext";
import { axiosInstance } from "../services/axios";
import { useNavigate } from "react-router-dom";

const DisplayHistory = () => {
    const { user } = useAuth();
    const { playWithId, playEpisodeWithId } = useContext(PlayerContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tracks');

    // Followed artists state
    const [followedArtists, setFollowedArtists] = useState([]);
    const [artistsLoading, setArtistsLoading] = useState(false);
    const [unfollowingId, setUnfollowingId] = useState(null);

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
            } else if (activeTab === 'artists') {
                fetchFollowedArtists();
            }
        }
    }, [user, activeTab]);

    const fetchFollowedArtists = async () => {
        try {
            setArtistsLoading(true);
            const res = await axiosInstance.get(`/users/history/${user.id}/my-followed-artists`);
            const data = res.data.data || res.data;
            setFollowedArtists(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching followed artists:', err);
        } finally {
            setArtistsLoading(false);
        }
    };

    const handleUnfollowArtist = async (artistId) => {
        setUnfollowingId(artistId);
        try {
            await axiosInstance.post(`/artists/${artistId}/follow`); // toggles
            setFollowedArtists(prev => prev.filter(a => a.id !== artistId));
        } catch (err) {
            console.error('Error unfollowing artist:', err);
        } finally {
            setUnfollowingId(null);
        }
    };

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

    const tabs = [
        { id: 'tracks', label: 'Tracks History' },
        { id: 'podcasts', label: 'Podcast History' },
        { id: 'artists', label: 'Followed Artists' },
    ];

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
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`text-sm font-semibold pb-2 px-1 relative ${activeTab === tab.id ? 'text-white' : 'text-zinc-400 hover:text-white transition'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-green-500 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tracks Tab */}
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

                {/* Podcasts Tab */}
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

                {/* Followed Artists Tab */}
                {activeTab === 'artists' && (
                    <div>
                        {artistsLoading ? (
                            <div className="text-center py-10 text-zinc-500 text-sm animate-pulse">Loading followed artists...</div>
                        ) : followedArtists.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <svg className="w-14 h-14 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                                </svg>
                                <p className="text-zinc-400 text-lg">You haven't followed any artists yet</p>
                                <p className="text-zinc-600 text-sm">Follow artists to see them here</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 pt-2">
                                {followedArtists.map(artist => (
                                    <div
                                        key={artist.id}
                                        className="group bg-[#181818] hover:bg-[#282828] rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 hover:shadow-xl"
                                        onClick={() => navigate(`/artist/${artist.id}`)}
                                    >
                                        {/* Artist Avatar */}
                                        <div className="relative w-full aspect-square">
                                            {artist.image_url || artist.image ? (
                                                <img
                                                    src={artist.image_url || artist.image}
                                                    alt={artist.name}
                                                    className="w-full h-full object-cover rounded-full shadow-lg"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center">
                                                    <svg className="w-1/2 h-1/2 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Artist info */}
                                        <div className="w-full text-center">
                                            <p className="text-white font-semibold text-sm truncate">{artist.name}</p>
                                            <p className="text-zinc-500 text-xs mt-0.5">Artist</p>
                                        </div>

                                        {/* Unfollow button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnfollowArtist(artist.id);
                                            }}
                                            disabled={unfollowingId === artist.id}
                                            className="text-xs font-bold px-4 py-1.5 rounded-full transition-all duration-200 bg-gradient-to-r from-green-500 to-teal-500 text-black hover:from-green-400 hover:to-teal-400 hover:scale-105 hover:shadow-[0_0_12px_rgba(34,197,94,0.5)] active:scale-95 disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {unfollowingId === artist.id ? 'Unfollowing...' : 'Unfollow'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplayHistory;
