import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import { useArtist } from "../hooks/useArtists";
import { PlayerContext } from "../contexts/PlayerContext";

const DisplayArtist = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { artist, tracks, loading, error, toggleFollow } = useArtist(id);
    const { playWithId, setActiveAlbum, setActivePlaylist } = useContext(PlayerContext);

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-[#121212] overflow-hidden">
                <NavigationBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-gray-400">Loading artist...</div>
                </div>
            </div>
        );
    }

    if (error || !artist) {
        return (
            <div className="flex flex-col h-full bg-[#121212] overflow-hidden">
                <NavigationBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-red-400">Error loading artist</div>
                </div>
            </div>
        );
    }

    const handleFollowToggle = async () => {
        await toggleFollow();
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <NavigationBar />

            <div className="flex-1 overflow-y-auto pb-24">
                {/* Artist Header */}
                <div className="mt-6 flex gap-8 flex-col md:flex-row md:items-end pb-8">
                    <img
                        src={artist.image}
                        alt={artist.name}
                        className="w-48 h-48 rounded-full object-cover shadow-2xl"
                    />
                    <div className="flex flex-col">
                        <p className="hidden md:block 2xl:text-5xl font-bold mb-4 md:text-7xl">
                            {artist.name}
                        </p>
                        <h2 className="text-5xl font-bold mb-4 md:hidden">
                            {artist.name}
                        </h2>
                        <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
                            <p>{artist.stats?.followers_count || 0} Followers</p>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <p>{tracks.length} Songs</p>
                        </div>
                    </div>
                </div>

                {/* Follow Button & Controls */}
                <div className="flex items-center gap-6 mb-8 mt-2">
                    <button
                        onClick={handleFollowToggle}
                        className={`px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase transition border border-gray-500
                            ${artist.isFollowing
                                ? 'bg-transparent text-white hover:border-white'
                                : 'bg-white text-black hover:scale-105'
                            }`}
                    >
                        {artist.isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>

                {/* Popular Tracks */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Popular Tracks</h2>
                    {tracks.length === 0 ? (
                        <p className="text-gray-400">No tracks available for this artist yet.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {tracks.map((item, index) => (
                                <div
                                    onClick={() => {
                                        setActiveAlbum(null);
                                        setActivePlaylist({ tracks });
                                        playWithId(item.id);
                                    }}
                                    key={index}
                                    className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer rounded"
                                >
                                    <div className="text-white flex items-center col-span-2 sm:col-span-3">
                                        <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
                                        <img className="inline w-10 h-10 mr-5 object-cover" src={item.image} alt="" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-white">{item.name}</span>
                                            {item.is_explicit && (
                                                <span className="text-[10px] bg-gray-400 text-black px-1 rounded-sm w-fit mt-1">E</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-[15px] flex items-center justify-end pr-4">
                                        {/* Format duration assuming seconds */}
                                        {Math.floor(item.duration / 60)}:{Math.floor(item.duration % 60).toString().padStart(2, '0')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bio Section */}
                {artist.bio && (
                    <div className="mt-12 mb-8">
                        <h2 className="text-xl font-bold mb-4">About</h2>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
                            {artist.bio}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplayArtist;
