import React from "react";
import { useParams } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import { assets } from "../assets/assets";
import { usePodcast } from "../hooks/usePodcasts";
import { PlayerContext } from "../contexts/PlayerContext.jsx";
import { axiosInstance } from "../services/axios";

const DisplayPodcast = () => {
    const { id } = useParams();
    const { podcast, episodes, loading, error } = usePodcast(id);
    const {
        playEpisodeWithId,
        setActiveEpisodeList,
        setActiveAlbum,
        setActivePlaylist,
        setAutoAdvance,
        track,
        playerState,
        isPodcastFollowed,
        togglePodcastFollow,
        getPodcastFollowerCount,
        setPodcastFollowers
    } = React.useContext(PlayerContext);

    React.useEffect(() => {
        if (podcast?.id) {
            axiosInstance.get(`/podcast-followers/count/${podcast.id}`)
                .then(res => {
                    const count = res.data.data?.count || 0;
                    setPodcastFollowers(prev => ({ ...prev, [podcast.id]: count }));
                })
                .catch(err => console.error('Error fetching podcast follower count:', err));
        }
    }, [podcast?.id, setPodcastFollowers]);

    const convertDuration = (duration) => {
        if (!duration) return "0:00";
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const podcastImage = podcast?.cover_image || podcast?.image || "";

    const handlePlayEpisode = (episode) => {
        playEpisodeWithId(episode.id, episodes, podcastImage);
    };

    const handlePlayAll = () => {
        if (episodes && episodes.length > 0) {
            setActiveEpisodeList({ episodes, podcastImage });
            setActiveAlbum(null);
            setActivePlaylist(null);
            playEpisodeWithId(episodes[0].id, episodes, podcastImage);
            // Enable auto-advance after playEpisodeWithId resets it
            setTimeout(() => setAutoAdvance(true), 150);
        }
    };

    if (loading) {
        return (
            <>
                <NavigationBar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-400 text-lg">Loading podcast...</div>
                </div>
            </>
        );
    }

    if (error || !podcast) {
        return (
            <>
                <NavigationBar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-red-400 text-lg">
                        {error || "Podcast not found"}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <NavigationBar />
            <div className="mt-2 mb-2">
                <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end mb-8">
                    <img
                        src={podcastImage}
                        alt={podcast.title || podcast.name}
                        className="w-48 h-48 object-cover rounded"
                    />
                    <div>
                        <p className="text-sm font-semibold mb-2">Podcast</p>
                        <h2 className="text-4xl font-bold mb-4">{podcast.title || podcast.name}</h2>
                        <h4 className="text-sm text-gray-400">{podcast.description || podcast.desc}</h4>
                        <p className="mt-2">
                            <img
                                src={assets.spotify_logo}
                                alt="Spotify Logo"
                                className="w-6 inline-block mr-2"
                            />
                            <b>{podcast.host_name} </b>
                            &#8226; <span>{getPodcastFollowerCount(podcast.id)} {getPodcastFollowerCount(podcast.id) === 1 ? 'follower' : 'followers'} </span>
                            &#8226; <b>{episodes?.length || 0} episodes </b>
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 mb-6 pl-2">
                    {episodes && episodes.length > 0 && (
                        <button
                            onClick={handlePlayAll}
                            className="bg-green-500 hover:bg-green-400 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 transition-all"
                        >
                            <svg className="w-7 h-7 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </button>
                    )}

                    <button
                        onClick={() => togglePodcastFollow(podcast.id)}
                        className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow border rounded-full ${isPodcastFollowed(podcast.id)
                            ? 'bg-transparent border-white text-white hover:border-gray-400 hover:text-gray-300'
                            : 'bg-transparent border-gray-400 text-white hover:border-white hover:scale-105'}`}
                    >
                        {isPodcastFollowed(podcast.id) ? 'Following' : 'Follow'}
                    </button>
                </div>

                {/* Episodes Header */}
                <div className="grid grid-cols-[16px_1fr_80px] mt-4 mb-4 pl-2 text-[#a7a7a7] gap-4 items-center">
                    <p>#</p>
                    <p><b>Title</b></p>
                    <p className="text-right"><img className="w-4 inline" src={assets.clock_icon} alt="Time Icon" /></p>
                </div>
                <hr className="border-t border-gray-700 mb-4" />

                {/* Episodes List */}
                <div>
                    {episodes && episodes.length > 0 ? (
                        episodes.map((episode, index) => {
                            const isCurrentEpisode = track?.id === episode.id;
                            return (
                                <div
                                    key={episode.id}
                                    onClick={() => handlePlayEpisode(episode)}
                                    className={`grid grid-cols-[16px_1fr_80px] items-center gap-4 py-2 px-2 rounded cursor-pointer group transition-colors
                                        ${isCurrentEpisode ? "bg-[#ffffff1a]" : "hover:bg-[#ffffff26]"}`}
                                >
                                    <div className="flex items-center justify-center">
                                        {isCurrentEpisode && playerState ? (
                                            /* Animated bars when playing */
                                            <div className="flex items-end gap-[2px] h-4">
                                                <span className="w-[3px] bg-green-500 animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: "60%" }} />
                                                <span className="w-[3px] bg-green-500 animate-[bounce_0.6s_ease-in-out_0.1s_infinite]" style={{ height: "100%" }} />
                                                <span className="w-[3px] bg-green-500 animate-[bounce_0.6s_ease-in-out_0.2s_infinite]" style={{ height: "40%" }} />
                                            </div>
                                        ) : (
                                            <p className={`text-sm ${isCurrentEpisode ? "text-green-500" : "text-[#a7a7a7]"}`}>
                                                {index + 1}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={podcastImage}
                                            alt={episode.title}
                                            className="w-10 h-10 object-cover rounded flex-shrink-0"
                                        />
                                        <span className={`truncate ${isCurrentEpisode ? "text-green-400 font-semibold" : "text-white"}`}>
                                            {episode.title || episode.name}
                                        </span>
                                    </div>
                                    <p className="text-[15px] text-[#a7a7a7] text-right">{convertDuration(episode.duration)}</p>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-gray-400">No episodes in this podcast</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DisplayPodcast;
