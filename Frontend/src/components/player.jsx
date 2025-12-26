import React from "react";
import { assets, songsData } from "../assets/assets";
import { PlayerContext } from "../contexts/PlayerContext.jsx";

const Player = () => {
    const {seekBg, seekBar, playerState, play, pause, track, trackProgress, prevTrack, nextTrack} = React.useContext(PlayerContext);
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
                    <img onClick={nextTrack} className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.next_icon} alt="" />
                    <img className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.loop_icon} alt="" />
                </div>

                <div className="flex items-center gap-3 w-full">
                    <p className="text-xs text-gray-400">{`${trackProgress.currentTime.minutes}:${trackProgress.currentTime.seconds}`}</p>
                    <div ref={seekBg} className="flex-1 bg-gray-700 h-1 rounded-full cursor-pointer group">
                        <hr ref={seekBar} className="h-1 border-none w-1/4 bg-green-500 rounded-full group-hover:bg-green-400 transition-colors" />
                    </div>
                    <p className="text-xs text-gray-400">{`${trackProgress.duration.minutes}:${trackProgress.duration.seconds}`}</p>
                </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 w-[25%] justify-end">
                <img className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.plays_icon} alt="" />
                <img className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.mic_icon} alt="" />
                <img className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.queue_icon} alt="" />
                <img className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.speaker_icon} alt="" />
                <img className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.volume_icon} alt="" />
                <div className="w-24 bg-gray-700 h-1 rounded-full cursor-pointer group">
                    <hr className="h-1 border-none w-3/4 bg-white rounded-full group-hover:bg-green-500 transition-colors" />
                </div>
                <img className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.mini_player_icon} alt="" />
                <img className="w-4 cursor-pointer hover:scale-110 transition-transform" src={assets.zoom_icon} alt="" />
            </div>
        </div>
    )
}

export default Player;