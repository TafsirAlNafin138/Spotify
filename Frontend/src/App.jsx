import React, { useCallback, useEffect } from "react";
import Sidebar from "./components/sidebar";
import Player from "./components/player";
import Display from "./components/display";
import { PlayerContext } from "./contexts/PlayerContext.jsx";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

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
    <>
      <SignedOut>
        <div className="h-screen bg-neutral-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-white text-4xl font-bold mb-8">Welcome to Spotify Clone</h1>
            <SignInButton mode="modal">
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full transition duration-300">
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="h-screen bg-neutral-900 flex flex-col">
          <div className="absolute top-4 right-4 z-50">
            <UserButton afterSignOutUrl="/" />
          </div>
          <div className="h-[90%] flex">
            <Sidebar />
            <Display />
          </div>
          <Player />
          <audio ref={audioRef} src={track.file} preload='auto'></audio>
        </div>
      </SignedIn>
    </>
  ); 
}