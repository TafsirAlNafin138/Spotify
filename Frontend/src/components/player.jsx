import React from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../contexts/PlayerContext.jsx";

const Player = () => {
    const { 
        seekBg, 
        seekBar, 
        playerState, 
        play, 
        pause, 
        track, 
        trackProgress, 
        setTrackProgress,
        audioRef,
        prevTrack, 
        nextTrack, 
        seekSong, 
        volumeSeek, 
        speakerseek, 
        volumeBg, 
        volumeBar, 
        loopSeek, 
        toggleLike, 
        isLiked, 
        getLikeCount, 
        userPlaylists, 
        addTrackToPlaylist 
    } = React.useContext(PlayerContext);

    const [showLikeCount, setShowLikeCount] = React.useState(false);
    const [showPlaylistDropdown, setShowPlaylistDropdown] = React.useState(false);
    
    // Mobile player states
    const [isMobileFullscreen, setIsMobileFullscreen] = React.useState(false);
    const [isShuffleActive, setIsShuffleActive] = React.useState(false);
    
    // Mobile seek bar drag state to prevent jump back conflicts with ontimeupdate
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragValue, setDragValue] = React.useState(0);

    const toggleMiniPlayer = () => {
        const player = document.querySelector('.player-container');
        if (player) {
            player.classList.toggle('fixed');
            player.classList.toggle('bottom-4');
            player.classList.toggle('right-4');
            player.classList.toggle('w-80');
            player.classList.toggle('h-auto');
            player.classList.toggle('rounded-lg');
            player.classList.toggle('shadow-2xl');
            player.classList.toggle('z-50');
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    if (!track || !track.id) {
        return null;
    }

    const currentTimeInSeconds = trackProgress.currentTime.minutes * 60 + trackProgress.currentTime.seconds;
    const durationInSeconds = trackProgress.duration.minutes * 60 + trackProgress.duration.seconds;

    const handleMobileSeekStart = () => {
        setIsDragging(true);
        setDragValue(currentTimeInSeconds);
    };

    const handleMobileSeekChange = (e) => {
        setDragValue(Number(e.target.value));
    };

    const handleMobileSeekEnd = () => {
        if (audioRef?.current) {
            const newTime = dragValue;
            audioRef.current.currentTime = newTime;
            setTrackProgress(prev => ({
                ...prev,
                currentTime: {
                    seconds: Math.floor(newTime % 60),
                    minutes: Math.floor(newTime / 60)
                }
            }));
        }
        setIsDragging(false);
    };

    return (
        <>
            {/* Desktop Horizontal Player (Hidden on mobile) */}
            <div className="player-container hidden md:flex h-[12%] bg-[#181818] border-t border-[#282828] justify-between items-center text-white px-6 py-2 z-40 relative">
                <div className="player-info flex items-center gap-4 w-[25%]">
                    <img className="w-14 h-14 rounded-md shadow-lg object-cover" src={track.image} alt="" />
                    <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate hover:underline cursor-pointer">{track.name}</p>
                        <p className="text-xs text-gray-400 truncate hover:underline cursor-pointer">{track.desc}</p>
                    </div>
                </div>

                <div className="player-controls flex flex-col items-center gap-2 w-[40%]">
                    <div className="flex items-center gap-6">
                        <img 
                            onClick={() => setIsShuffleActive(!isShuffleActive)} 
                            className={`w-4 cursor-pointer hover:opacity-100 transition-all hidden sm:block ${isShuffleActive ? 'opacity-100 brightness-125' : 'opacity-70'}`} 
                            src={assets.shuffle_icon} 
                            alt="Shuffle" 
                        />
                        <img onClick={prevTrack} className="w-4 cursor-pointer hover:opacity-100 opacity-70 transition-all" src={assets.prev_icon} alt="Prev" />
                        {playerState ?
                            <div onClick={pause} className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-md">
                                <img className="w-3 object-contain ml-0.5" src={assets.pause_icon} alt="Pause" style={{ filter: 'invert(1)' }} />
                            </div>
                            :
                            <div onClick={play} className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-md">
                                <img className="w-3 object-contain ml-1" src={assets.play_icon} alt="Play" style={{ filter: 'invert(1)' }} />
                            </div>
                        }
                        <img onClick={() => nextTrack(false)} className="w-4 cursor-pointer hover:opacity-100 opacity-70 transition-all" src={assets.next_icon} alt="Next" />
                        <img onClick={loopSeek} className="w-4 cursor-pointer hover:opacity-100 opacity-70 transition-all hidden sm:block" src={assets.loop_icon} alt="Loop" />
                    </div>

                    <div className="player-progress-bar flex items-center gap-3 w-full">
                        <p className="text-[11px] text-gray-400 font-medium min-w-[35px] text-right">
                            {`${trackProgress.currentTime.minutes}:${String(trackProgress.currentTime.seconds).padStart(2, '0')}`}
                        </p>
                        <div ref={seekBg} onClick={seekSong} className="flex-1 bg-[#4d4d4d] h-1.5 rounded-full cursor-pointer group relative overflow-hidden">
                            <hr ref={seekBar} className="h-full border-none bg-white rounded-full group-hover:bg-green-500 transition-colors" style={{ width: `${durationInSeconds > 0 ? (currentTimeInSeconds / durationInSeconds * 100) : 0}%` }} />
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium min-w-[35px]">
                            {`${trackProgress.duration.minutes}:${String(trackProgress.duration.seconds).padStart(2, '0')}`}
                        </p>
                    </div>
                </div>

                <div className="player-extra flex items-center gap-3 w-[25%] justify-end">
                    {!track._isEpisode && (
                        <>
                            <div className="relative">
                                <svg
                                    onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
                                    className="w-5 h-5 cursor-pointer text-gray-400 hover:text-white transition-all hover:scale-110"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    title="Add to Playlist"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>

                                {showPlaylistDropdown && (
                                    <div className="absolute bottom-10 -translate-x-1/2 left-1/2 w-48 bg-[#282828] border border-gray-700 rounded-md shadow-2xl z-50 py-1 max-h-60 overflow-y-auto custom-scrollbar">
                                        <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-700 mb-1">Add to Playlist</div>
                                        {userPlaylists && userPlaylists.length > 0 ? (
                                            (() => {
                                                const availablePlaylists = userPlaylists.filter(playlist => {
                                                    if (playlist.track_ids) {
                                                        return !playlist.track_ids.includes(track.id);
                                                    }
                                                    if (playlist.tracks && Array.isArray(playlist.tracks)) {
                                                        return !playlist.tracks.some(t => t.id === track.id);
                                                    }
                                                    return true;
                                                });

                                                if (availablePlaylists.length === 0) {
                                                    return <div className="px-4 py-2 text-sm text-gray-400 italic">Already in all playlists</div>;
                                                }

                                                return availablePlaylists.map(playlist => (
                                                    <div
                                                        key={playlist.id}
                                                        onClick={() => {
                                                            addTrackToPlaylist(playlist.id, track.id);
                                                            setShowPlaylistDropdown(false);
                                                        }}
                                                        className="px-4 py-2 text-sm text-gray-300 hover:bg-[#3e3e3e] hover:text-white cursor-pointer truncate"
                                                    >
                                                        {playlist.name}
                                                    </div>
                                                ));
                                            })()
                                        ) : (
                                            <div className="px-4 py-2 text-sm text-gray-400 italic">No playlists</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="relative flex items-center gap-1">
                                <svg
                                    onClick={() => toggleLike(track.id)}
                                    onMouseEnter={() => setShowLikeCount(true)}
                                    onMouseLeave={() => setShowLikeCount(false)}
                                    className={`w-5 h-5 cursor-pointer hover:scale-110 transition-all ${isLiked(track.id) ? 'fill-green-500 text-green-500' : 'fill-none text-white hover:text-green-400'
                                        }`}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                {showLikeCount && (
                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                        {getLikeCount(track.id)} {getLikeCount(track.id) === 1 ? 'like' : 'likes'}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                    <img className="w-4 cursor-pointer hover:opacity-100 opacity-70 transition-all ml-1" src={assets.queue_icon} alt="Queue" />
                    <div className="flex items-center gap-2 group">
                        <svg className="w-4 h-4 cursor-pointer text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                        <div ref={volumeBg} onClick={speakerseek} className="w-24 bg-[#4d4d4d] h-1.5 rounded-full cursor-pointer group-hover text-white relative overflow-hidden">
                            <hr ref={volumeBar} onClick={volumeSeek} className="h-full border-none bg-white rounded-full hover:bg-green-500 transition-colors" />
                        </div>
                    </div>
                    <img onClick={toggleMiniPlayer} className="w-4 cursor-pointer hover:opacity-100 opacity-70 transition-all ml-2" src={assets.mini_player_icon} alt="Mini Player" />
                    <img onClick={toggleFullscreen} className="w-4 cursor-pointer hover:opacity-100 opacity-70 transition-all" src={assets.zoom_icon} alt="Fullscreen" />
                </div>
            </div>

            {/* Mobile Floating Mini-Player (Visible on mobile screens) */}
            <div 
                onClick={() => setIsMobileFullscreen(true)}
                className="fixed bottom-[68px] left-2 right-2 h-14 bg-zinc-900/95 backdrop-blur-md border border-zinc-800/80 rounded-lg flex items-center justify-between p-2 shadow-xl z-40 select-none cursor-pointer active:scale-[0.99] transition-all md:hidden"
            >
                <div className="flex items-center gap-3 overflow-hidden flex-1 mr-4">
                    <img 
                        className="w-10 h-10 rounded object-cover flex-shrink-0 shadow-md" 
                        src={track.image} 
                        alt={track.name} 
                    />
                    <div className="flex flex-col overflow-hidden min-w-0">
                        <p className="text-[13px] font-semibold text-white truncate">{track.name}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{track.desc || 'Unknown Artist'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 pr-1" onClick={(e) => e.stopPropagation()}>
                    {!track._isEpisode && (
                        <button onClick={() => toggleLike(track.id)} className="transition-transform active:scale-90 duration-100 text-zinc-400 hover:text-white">
                            <svg
                                className={`w-5 h-5 transition-colors ${isLiked(track.id) ? 'fill-green-500 text-green-500' : 'text-zinc-400'}`}
                                fill={isLiked(track.id) ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </button>
                    )}
                    {playerState ? (
                        <button onClick={pause} className="w-8 h-8 rounded-full bg-white flex items-center justify-center transition-transform active:scale-90 duration-100">
                            <img className="w-3.5 object-contain ml-0.5" src={assets.pause_icon} alt="Pause" style={{ filter: 'invert(1)' }} />
                        </button>
                    ) : (
                        <button onClick={play} className="w-8 h-8 rounded-full bg-white flex items-center justify-center transition-transform active:scale-90 duration-100">
                            <img className="w-3 object-contain ml-0.5" src={assets.play_icon} alt="Play" style={{ filter: 'invert(1)' }} />
                        </button>
                    )}
                </div>

                {/* Progress bar line at the bottom of the floating mini card */}
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#4d4d4d]/30 rounded-b-lg overflow-hidden">
                    <div 
                        className="h-full bg-green-500 rounded-b-lg transition-all duration-300"
                        style={{ 
                            width: `${durationInSeconds > 0 ? (currentTimeInSeconds / durationInSeconds * 100) : 0}%` 
                        }}
                    />
                </div>
            </div>

            {/* Fullscreen Mobile Player Drawer overlay */}
            {isMobileFullscreen && (
                <div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col px-6 pt-12 pb-8 overflow-hidden select-none animate-slide-up md:hidden">
                    {/* Blurred Cover Art Background Glow */}
                    <div className="absolute inset-0 z-0 opacity-20 blur-[90px] scale-150 pointer-events-none transition-all duration-1000 select-none">
                        <img src={track.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/30 via-neutral-950/70 to-neutral-950 z-0 pointer-events-none" />

                    <div className="z-10 flex flex-col justify-between h-full w-full">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={() => setIsMobileFullscreen(false)} 
                                className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors active:scale-95 duration-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                            <div className="flex flex-col items-center flex-1 mx-4 min-w-0 text-center">
                                <p className="text-[10px] tracking-widest font-bold uppercase text-zinc-500">PLAYING FROM TRACK</p>
                                <p className="text-xs font-bold text-zinc-200 truncate w-full mt-0.5">{track.name}</p>
                            </div>
                            <button className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                            </button>
                        </div>

                        {/* Large Album Art Centered */}
                        <div className="flex-1 flex items-center justify-center my-6 max-h-[40vh]">
                            <img 
                                className="w-full max-w-[280px] sm:max-w-[320px] aspect-square object-cover rounded-lg shadow-2xl shadow-black/80 animate-fade-in" 
                                src={track.image} 
                                alt="" 
                            />
                        </div>

                        {/* Info & Like row */}
                        <div className="flex items-center justify-between w-full mt-2">
                            <div className="flex flex-col overflow-hidden min-w-0 flex-1 mr-4">
                                <h1 className="text-xl font-bold text-white tracking-tight truncate">{track.name}</h1>
                                <p className="text-sm text-zinc-400 font-medium truncate mt-0.5">{track.desc || 'Unknown Artist'}</p>
                            </div>
                            {!track._isEpisode && (
                                <button 
                                    onClick={() => toggleLike(track.id)}
                                    className="p-2 -mr-2 transition-transform active:scale-75 duration-100"
                                >
                                    <svg
                                        className={`w-6 h-6 transition-colors ${isLiked(track.id) ? 'fill-green-500 text-green-500' : 'text-zinc-400'}`}
                                        fill={isLiked(track.id) ? "currentColor" : "none"}
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Progress Seeker */}
                        <div className="w-full flex flex-col gap-1 mt-4">
                            <input
                                type="range"
                                min={0}
                                max={durationInSeconds || 100}
                                value={isDragging ? dragValue : currentTimeInSeconds}
                                onTouchStart={handleMobileSeekStart}
                                onChange={handleMobileSeekChange}
                                onTouchEnd={handleMobileSeekEnd}
                                onMouseDown={handleMobileSeekStart}
                                onMouseUp={handleMobileSeekEnd}
                                className="spotify-slider w-full mt-2 select-auto pointer-events-auto"
                            />
                            <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold mt-1.5">
                                <span>{(() => {
                                    const displayTime = isDragging ? dragValue : currentTimeInSeconds;
                                    const mins = Math.floor(displayTime / 60);
                                    const secs = Math.floor(displayTime % 60);
                                    return `${mins}:${String(secs).padStart(2, '0')}`;
                                })()}</span>
                                <span>{`${trackProgress.duration.minutes}:${String(trackProgress.duration.seconds).padStart(2, '0')}`}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-between items-center px-2 py-4 mt-2 w-full">
                            <button 
                                onClick={() => setIsShuffleActive(!isShuffleActive)} 
                                className="relative p-2 active:scale-95 duration-100 transition-all"
                            >
                                <img 
                                    className={`w-5 object-contain transition-all ${isShuffleActive ? 'brightness-125 opacity-100' : 'brightness-75 opacity-60'}`} 
                                    src={assets.shuffle_icon} 
                                    alt="Shuffle" 
                                />
                                {isShuffleActive && <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></span>}
                            </button>
                            
                            <button onClick={prevTrack} className="p-2 active:scale-90 transition-transform">
                                <img className="w-6 cursor-pointer opacity-80 hover:opacity-100" src={assets.prev_icon} alt="Prev" />
                            </button>

                            {playerState ? (
                                <button 
                                    onClick={pause} 
                                    className="w-14 h-14 rounded-full bg-white flex items-center justify-center cursor-pointer active:scale-95 hover:scale-105 transition-all shadow-lg"
                                >
                                    <img className="w-5 object-contain ml-0.5" src={assets.pause_icon} alt="Pause" style={{ filter: 'invert(1)' }} />
                                </button>
                            ) : (
                                <button 
                                    onClick={play} 
                                    className="w-14 h-14 rounded-full bg-white flex items-center justify-center cursor-pointer active:scale-95 hover:scale-105 transition-all shadow-lg"
                                >
                                    <img className="w-5 object-contain ml-0.5" src={assets.play_icon} alt="Play" style={{ filter: 'invert(1)' }} />
                                </button>
                            )}

                            <button onClick={() => nextTrack(false)} className="p-2 active:scale-90 transition-transform">
                                <img className="w-6 cursor-pointer opacity-80 hover:opacity-100" src={assets.next_icon} alt="Next" />
                            </button>

                            <button onClick={loopSeek} className="p-2 active:scale-90 transition-transform">
                                <img className="w-5 cursor-pointer opacity-85 hover:opacity-100" src={assets.loop_icon} alt="Loop" />
                            </button>
                        </div>

                        {/* Footer details */}
                        <div className="flex justify-between items-center text-zinc-400 text-sm mt-4 px-1">
                            <button className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            </button>
                            <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.018-2.009a3 3 0 11.83 1.66l-4.018 2.008a3 3 0 11-.83-1.66z" />
                                </svg>
                            </button>
                            <button className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors">
                                <img className="w-5 cursor-pointer opacity-70 hover:opacity-100" src={assets.queue_icon} alt="Queue" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Player;