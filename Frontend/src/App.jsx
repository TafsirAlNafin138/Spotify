import React from "react";
import Sidebar from "./components/sidebar";
import Player from "./components/player";
import Display from "./components/display";

export default function App() {
  return (
      <div className="h-screen bg-neutral-900 flex flex-col">
        <div className="h-[90%] flex">
          <Sidebar />
          <Display />
        </div>
        <Player />
      </div>
  ); 
}