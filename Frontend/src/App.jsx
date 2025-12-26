import React, { useCallback, useEffect } from "react";
import Sidebar from "./components/sidebar";
import Player from "./components/player";
import Display from "./components/display";
import { PlayerContext } from "./contexts/PlayerContext.jsx";

export default function App() {

  const {audioRef, track, playerState} = React.useContext(PlayerContext);

  useEffect(() => {
    if (audioRef.current && track.file) {
      audioRef.current.src = track.file;
      audioRef.current.load();
      if (playerState) {
        audioRef.current.play().catch(err => console.error("Play failed:", err));
      }
    }
  // only run when the track changes — don't run on play/pause to avoid resetting currentTime
  }, [track.file, track]);
  return (
      <div className="h-screen bg-neutral-900 flex flex-col">
        <div className="h-[90%] flex">
          <Sidebar />
          <Display />
        </div>
        <Player />
        <audio ref={audioRef} src={track.file} preload='auto'></audio>
      </div>
  ); 
}