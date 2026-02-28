import React from "react";
import { assets } from "../assets/assets";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from '@clerk/clerk-react';

const NavigationBar = ({ userName }) => {
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    const { pathname } = useLocation();

    const isAdmin =
        user?.publicMetadata?.role === "admin" ||
        user?.emailAddresses.some(e =>
            e.emailAddress.toLowerCase().trim() === import.meta.env.VITE_ADMIN_EMAIL1?.toLowerCase().trim() ||
            e.emailAddress.toLowerCase().trim() === import.meta.env.VITE_ADMIN_EMAIL2?.toLowerCase().trim()
        );
    if (!isLoaded) return null;

    return (
        <>
            <div className="flex justify-between items-center font-semibold">
                <div className="flex items-center gap-2">
                    <img onClick={() => navigate(-1)} className="w-8 bg-black p-2 rounded-2xl cursor-pointer hover:bg-gray-800 transition" src={assets.arrow_left} alt="" />
                    <img onClick={() => navigate(1)} className="w-8 bg-black p-2 rounded-2xl cursor-pointer hover:bg-gray-800 transition" src={assets.arrow_right} alt="" />
                </div>


                <div className="flex items-center gap-4">
                    <div>
                        {isAdmin && (
                            <button onClick={() => navigate('/admin')} className="bg-white text-black px-4 py-1 rounded-2xl cursor-pointer hover:bg-gray-200 transition">
                                Admin Dashboard
                            </button>
                        )}
                    </div>
                    {/* <p onClick={() => navigate('/users/history')} className="bg-black py-1 px-4 rounded-2xl text-[15px] cursor-pointer hover:bg-zinc-800 transition border border-zinc-700">
                        History
                    </p> */}
                </div>
            </div>
            {pathname === "/" ? (
                <div className="flex items-center gap-2 mt-4">
                    <p className="bg-white text-black px-4 py-1 rounded-2xl cursor-pointer hover:bg-gray-200 transition">All</p>
                    <p className="bg-black text-white px-4 py-1 rounded-2xl cursor-pointer hover:bg-gray-800 transition">Music</p>
                    <p className="bg-black text-white px-4 py-1 rounded-2xl cursor-pointer hover:bg-gray-800 transition">Podcasts</p>
                </div>
            ) : null}
        </>
    )
}

export default NavigationBar;