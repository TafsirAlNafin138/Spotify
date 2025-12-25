import React from "react";
import { assets } from "../assets/assets";

const NavigationBar = () => {
    return (
        <>
            <div className="flex justify-between items-center font-semibold">
                <div className="flex items-center gap-2">
                    <img className="w-8 bg-black p-2 rounded-2xl cursor-pointer hover:bg-gray-800 transition" src={assets.arrow_left} alt="" />
                    <img className="w-8 bg-black p-2 rounded-2xl cursor-pointer hover:bg-gray-800 transition" src={assets.arrow_right} alt="" />
                </div>
                <div className="flex items-center gap-4">
                    <p className="bg-white text-black px-4 py-1 rounded-2xl hidden md:block cursor-pointer hover:bg-gray-200 transition">
                        Upgrade to Premium
                    </p>
                    <p className="bg-black border-2 border-white text-white px-4 py-1 rounded-2xl cursor-pointer hover:bg-gray-800 transition">
                        Install app
                    </p>
                    <p className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-700 transition cursor-pointer">
                        N
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
                <p className="bg-white text-black px-4 py-1 rounded-2xl cursor-pointer hover:bg-gray-200 transition">All</p>
                <p className="bg-black text-white px-4 py-1 rounded-2xl cursor-pointer hover:bg-gray-800 transition">Music</p>
                <p className="bg-black text-white px-4 py-1 rounded-2xl cursor-pointer hover:bg-gray-800 transition">Podcasts</p>
            </div>
        </>
    )
}

export default NavigationBar;