import React from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../contexts/PlayerContext.jsx";

const Player = () => {
    const { seekBg, seekBar, playerState, play, pause, track, trackProgress, prevTrack, nextTrack, seekSong, volumeSeek, speakerseek, volumeBg, volumeBar, loopSeek, toggleLike, isLiked, getLikeCount } = React.useContext(PlayerContext);

    const [showLikeCount, setShowLikeCount] = React.useState(false);

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
        <div className="h-[12%] bg-black flex justify-between items-center text-white px-6 py-2 overflow-auto">
            <div className="flex items-center gap-4 w-[25%]">
                <img className="w-12 h-12 rounded" src={track.image} alt="" />
                <div className="flex flex-col overflow-auto">
                    <p className="text-sm font-semibold overflow-auto">{track.name}</p>
                    <p className="text-xs text-gray-400 overflow-auto">{track.desc}</p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-2 w-[40%]">
                <div className="flex items-center gap-4">
                    <img className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.shuffle_icon} alt="" />
                    <img onClick={prevTrack} className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.prev_icon} alt="" />
                    {playerState ?
                        <img onClick={pause} className="w-5 cursor-pointer hover:scale-110 transition-transform" src={assets.pause_icon} alt="Pause" />
                        :
                        <img onClick={play} className="w-5 cursor-pointer hover:scale-110 transition-transform" src={assets.play_icon} alt="Play" />
                    }
                    <img onClick={() => nextTrack(false)} className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.next_icon} alt="" />
                    <img onClick={loopSeek} className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.loop_icon} alt="" />
                </div>

                <div className="flex items-center gap-3 w-full">
                    <p className="text-xs text-gray-400">{`${trackProgress.currentTime.minutes}:${trackProgress.currentTime.seconds}`}</p>
                    <div ref={seekBg} onClick={seekSong} className="flex-1 bg-gray-700 h-1 rounded-full cursor-pointer group relative">
                        <hr ref={seekBar} className="h-1 border-none bg-green-500 rounded-full group-hover:bg-green-400 transition-all absolute top-0 left-0" style={{ width: `${(trackProgress.currentTime.minutes * 60 + trackProgress.currentTime.seconds) / (trackProgress.duration.minutes * 60 + trackProgress.duration.seconds) * 100}%` }} />
                    </div>
                    <p className="text-xs text-gray-400">{`${trackProgress.duration.minutes}:${trackProgress.duration.seconds}`}</p>
                </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 w-[25%] justify-end">
                {/* <img className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.plays_icon} alt="" /> */}
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
                <img className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.queue_icon} alt="" />
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 cursor-pointer hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                    <div ref={volumeBg} onClick={speakerseek} className="w-24 bg-gray-700 h-1 rounded-full cursor-pointer group relative">
                        <hr ref={volumeBar} onClick={volumeSeek} className="h-1 border-none bg-white rounded-full group-hover:bg-green-500 transition-all absolute top-0 left-0" />
                    </div>
                </div>
                <img onClick={toggleMiniPlayer} className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.mini_player_icon} alt="" />
                <img onClick={toggleFullscreen} className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.zoom_icon} alt="" />
            </div>
        </div>
    )
}

export default Player;