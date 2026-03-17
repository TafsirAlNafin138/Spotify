import React from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../contexts/PlayerContext.jsx";

const Player = () => {
    const { seekBg, seekBar, playerState, play, pause, track, trackProgress, prevTrack, nextTrack, seekSong, volumeSeek, speakerseek, volumeBg, volumeBar, loopSeek, toggleLike, isLiked, getLikeCount, userPlaylists, addTrackToPlaylist } = React.useContext(PlayerContext);

    const [showLikeCount, setShowLikeCount] = React.useState(false);
    const [showPlaylistDropdown, setShowPlaylistDropdown] = React.useState(false);

    const toggleMiniPlayer = () => {
        const player = document.querySelector('.h-\\[12\\%\\]');
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

    return (
        <div className="h-[12%] bg-[#181818] border-t border-[#282828] flex justify-between items-center text-white px-6 py-2">
            <div className="flex items-center gap-4 w-[25%] hidden md:flex">
                <img className="w-14 h-14 rounded-md shadow-lg object-cover" src={track.image} alt="" />
                <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate hover:underline cursor-pointer">{track.name}</p>
                    <p className="text-xs text-gray-400 truncate hover:underline cursor-pointer">{track.desc}</p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-2 w-full md:w-[40%]">
                <div className="flex items-center gap-6">
                    <img className="w-4 cursor-pointer hover:opacity-100 opacity-70 transition-all" src={assets.shuffle_icon} alt="Shuffle" />
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
                    <img onClick={loopSeek} className="w-4 cursor-pointer hover:opacity-100 opacity-70 transition-all" src={assets.loop_icon} alt="Loop" />
                </div>

                <div className="flex items-center gap-3 w-full">
                    <p className="text-[11px] text-gray-400 font-medium min-w-[35px] text-right">
                        {`${trackProgress.currentTime.minutes}:${String(trackProgress.currentTime.seconds).padStart(2, '0')}`}
                    </p>
                    <div ref={seekBg} onClick={seekSong} className="flex-1 bg-[#4d4d4d] h-1.5 rounded-full cursor-pointer group relative overflow-hidden">
                        <hr ref={seekBar} className="h-full border-none bg-white rounded-full group-hover:bg-green-500 transition-colors" style={{ width: `${(trackProgress.currentTime.minutes * 60 + trackProgress.currentTime.seconds) / (trackProgress.duration.minutes * 60 + trackProgress.duration.seconds) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium min-w-[35px]">
                        {`${trackProgress.duration.minutes}:${String(trackProgress.duration.seconds).padStart(2, '0')}`}
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 w-[25%] justify-end">
                {/* <img className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.plays_icon} alt="" /> */}
                {/* Like and Add to Playlist buttons – hidden when an episode is playing */}
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

                            {/* Dropdown Menu */}
                            {showPlaylistDropdown && (
                                <div className="absolute bottom-10 -translate-x-1/2 left-1/2 w-48 bg-[#282828] border border-gray-700 rounded-md shadow-2xl z-50 py-1 max-h-60 overflow-y-auto custom-scrollbar">
                                    <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-700 mb-1">Add to Playlist</div>
                                    {userPlaylists && userPlaylists.length > 0 ? (
                                        (() => {
                                            // Optional: if userPlaylists don't have track arrays deep populated, 
                                            // we do a best-effort check or just allow them all to render. 
                                            // Since the backend returns `tracks` for user playlists only if queried specifically, 
                                            // we might rely on the backend to throw an error, but let's filter if playlist.tracks exists
                                            const availablePlaylists = userPlaylists.filter(playlist => {
                                                // Assuming playlist.track_ids (from new backend update)
                                                if (playlist.track_ids) {
                                                    return !playlist.track_ids.includes(track.id);
                                                }
                                                // Fallback if tracks array is populated
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
    )
}

export default Player;