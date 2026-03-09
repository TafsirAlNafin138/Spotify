import React, { useCallback, useEffect } from "react";
import Sidebar from "./components/sidebar";
import Player from "./components/player";
import Display from "./components/display";
import { PlayerContext } from "./contexts/PlayerContext.jsx";
import { useAuth } from "./providers/AuthProvider.jsx";
import { axiosInstance } from "./services/axios";
import SlideHandler from "./components/SlideHandler.jsx";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { runAllTests } from './utils/testConnection';
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

const MainApp = () => {
  const { audioRef, track, playerState } = React.useContext(PlayerContext) || {};
  const [sidebarWidth, setSidebarWidth] = React.useState(20);
  const [isDragging, setIsDragging] = React.useState(false);
  const { user } = useAuth();
  const [connectionTested, setConnectionTested] = React.useState(false);

  useEffect(() => {
    if (user && !connectionTested) {
      console.log('🔗 Testing backend connection...');
      runAllTests().then(() => {
        setConnectionTested(true);
      });
    }
  }, [user, connectionTested]);

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
  }, [track?.file, track]);

  const handleMouseDown = () => setIsDragging(true);

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        const clampedWidth = Math.min(Math.max(newWidth, 15), 40);
        setSidebarWidth(clampedWidth);
      }
    },
    [isDragging],
  );

  const handleMouseUp = () => setIsDragging(false);

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

  const location = useLocation();
  const isPlayerHiddenRoute = location.pathname.startsWith("/admin") || location.pathname === "/history";

  return (
    <div className="h-screen bg-neutral-900 flex flex-col">
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
      {!isPlayerHiddenRoute && <Player />}
      <audio ref={audioRef} src={track?.file} preload="auto"></audio>
    </div>
  );
};

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen bg-neutral-900 flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/*" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
    </Routes>
  );
}
