import React, { useCallback, useEffect } from "react";
import Sidebar from "./components/sidebar";
import Player from "./components/player";
import Display from "./components/display";
import { PlayerContext } from "./contexts/PlayerContext.jsx";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/clerk-react";
import { axiosInstance } from "./services/axios";
import SlideHandler from "./components/SlideHandler.jsx";
import { useLocation } from "react-router-dom";
import { runAllTests } from './utils/testConnection';


export default function App() {
  const { audioRef, track, playerState } = React.useContext(PlayerContext) || {};
  const [sidebarWidth, setSidebarWidth] = React.useState(20); // Default 20%
  const [isDragging, setIsDragging] = React.useState(false);
  const { isSignedIn } = useAuth();
  const [connectionTested, setConnectionTested] = React.useState(false);

  // Test backend connection when user signs in
  useEffect(() => {
    if (isSignedIn && !connectionTested) {
      console.log('🔗 Testing backend connection...');
      runAllTests().then(() => {
        setConnectionTested(true);
      });
    }
  }, [isSignedIn, connectionTested]);

  useEffect(() => {
    if (audioRef?.current && track?.file) {
      audioRef.current.src = track.file;
      audioRef.current.load();
      if (playerState) {
        audioRef.current
          .play()
          .catch((err) => console.error("Play failed:", err));
      }
    }
    // only run when the track changes — don't run on play/pause to avoid resetting currentTime
  }, [track.file, track]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        // Clamp between 15% and 40%
        const clampedWidth = Math.min(Math.max(newWidth, 15), 40);
        setSidebarWidth(clampedWidth);
      }
    },
    [isDragging],
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  const isAdminRoute = useLocation().pathname.startsWith("/admin");

  return (
    <>
      <SignedOut>
        <div className="h-screen bg-neutral-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-white text-4xl font-bold mb-8">
              Welcome to Spotify Clone
            </h1>
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
          {!isAdminRoute && (
            <div className="absolute top-4 right-4 z-50">
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
          <div className="h-[90%] flex">
            <div style={{ width: `${sidebarWidth}%` }} className="h-full">
              <Sidebar />
            </div>
            <SlideHandler onDrag={handleMouseDown} />
            <div
              style={{ width: `${100 - sidebarWidth - 4}%` }}
              className="h-full"
            >
              <Display />
            </div>
          </div>
          {!isAdminRoute && <Player />}
          <audio ref={audioRef} src={track.file} preload="auto"></audio>
        </div>
      </SignedIn>
    </>
  );
}
