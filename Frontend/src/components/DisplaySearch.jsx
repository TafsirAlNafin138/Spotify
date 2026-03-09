import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../contexts/PlayerContext";
import NavigationBar from "./NavigationBar";
import useSearch from "../hooks/useSearch";

const CATEGORIES = ['All', 'Songs', 'Artists', 'Podcasts'];

const DisplaySearch = () => {
    const navigate = useNavigate();
    const { playWithId, setActivePlaylist, setActiveAlbum } = useContext(PlayerContext);
    const { query, setQuery, category, setCategory, results, loading } = useSearch();
    const [inputFocused, setInputFocused] = useState(false);

    const { songs = [], artists = [], podcasts = [] } = results;
    const hasResults = songs.length > 0 || artists.length > 0 || podcasts.length > 0;

    const handleSongClick = (song) => {
        setActiveAlbum(null);
        setActivePlaylist({ tracks: songs });
        playWithId(song.id);
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '';
        return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <NavigationBar />

            {/* Search input */}
            <div className="mt-6 mb-2">
                <div className={`flex items-center gap-3 bg-zinc-800 rounded-full px-5 py-3 max-w-lg transition-all duration-200 ${inputFocused ? 'ring-2 ring-white' : ''}`}>
                    <svg className="w-5 h-5 text-zinc-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        id="search-input"
                        autoFocus
                        className="bg-transparent text-white placeholder-zinc-400 outline-none w-full text-[15px]"
                        placeholder="What do you want to play?"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-white transition ml-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Category pills — always visible on /search */}
                <div className="flex items-center gap-2 mt-4">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat.toLowerCase())}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150
                                ${category === cat.toLowerCase()
                                    ? 'bg-white text-black'
                                    : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results area */}
            <div className="flex-1 overflow-y-auto mt-4 pb-24">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-zinc-400 text-sm animate-pulse">Searching...</div>
                    </div>
                )}

                {!loading && query && !hasResults && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <svg className="w-12 h-12 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <p className="text-zinc-400 text-sm">No results found for <span className="text-white font-semibold">"{query}"</span></p>
                    </div>
                )}

                {!loading && !query && (
                    <p className="text-zinc-500 text-sm mt-4">Start typing to search for songs, artists and podcasts.</p>
                )}

                {/* Songs */}
                {songs.length > 0 && (
                    <div className="mb-8">
                        {(category === 'all') && <h2 className="text-lg font-bold mb-3 text-white">Songs</h2>}
                        <div className="flex flex-col gap-1">
                            {songs.map((song, i) => (
                                <div
                                    key={song.id}
                                    onClick={() => handleSongClick(song)}
                                    className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-3 py-2 rounded-md hover:bg-zinc-800 cursor-pointer group transition"
                                >
                                    <img src={song.image} alt={song.name} className="w-10 h-10 rounded object-cover" />
                                    <div className="overflow-hidden">
                                        <p className="text-white font-medium text-[14px] truncate">{song.name}</p>
                                        {song.is_explicit && (
                                            <span className="text-[10px] bg-zinc-600 text-white px-1 rounded-sm mr-1">E</span>
                                        )}
                                    </div>
                                    <span className="text-zinc-400 text-[13px] tabular-nums">{formatDuration(song.duration)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Artists */}
                {artists.length > 0 && (
                    <div className="mb-8">
                        {(category === 'all') && <h2 className="text-lg font-bold mb-3 text-white">Artists</h2>}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {artists.map(artist => (
                                <div
                                    key={artist.id}
                                    onClick={() => navigate(`/artist/${artist.id}`)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-zinc-800 cursor-pointer transition group"
                                >
                                    <img
                                        src={artist.image}
                                        alt={artist.name}
                                        className="w-16 h-16 rounded-full object-cover shadow-lg group-hover:shadow-xl transition"
                                    />
                                    <p className="text-white text-[13px] font-medium text-center truncate w-full">{artist.name}</p>
                                    <p className="text-zinc-500 text-[11px]">Artist</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Podcasts */}
                {podcasts.length > 0 && (
                    <div className="mb-8">
                        {(category === 'all') && <h2 className="text-lg font-bold mb-3 text-white">Podcasts</h2>}
                        <div className="flex flex-col gap-1">
                            {podcasts.map(podcast => (
                                <div
                                    key={podcast.id}
                                    onClick={() => navigate(`/podcast/${podcast.id}`)}
                                    className="flex items-center gap-4 px-3 py-2 rounded-md hover:bg-zinc-800 cursor-pointer transition"
                                >
                                    <img
                                        src={podcast.cover_image}
                                        alt={podcast.title}
                                        className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                                    />
                                    <div className="overflow-hidden">
                                        <p className="text-white font-medium text-[14px] truncate">{podcast.title}</p>
                                        <p className="text-zinc-400 text-[12px] truncate">{podcast.host_name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplaySearch;
