import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../providers/AuthProvider';

const NavigationBar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const adminEmails = [
        import.meta.env.VITE_ADMIN_EMAIL1?.toLowerCase().trim(),
        import.meta.env.VITE_ADMIN_EMAIL2?.toLowerCase().trim()
    ].filter(Boolean);

    const isAdmin = adminEmails.includes(user?.email?.toLowerCase().trim());

    return (
        <>
            <div className="flex justify-between items-center font-semibold">
                <div className="flex items-center gap-2">
                    <img onClick={() => navigate(-1)} className="w-8 bg-black p-2 rounded-2xl cursor-pointer hover:bg-gray-800 transition" src={assets.arrow_left} alt="" />
                    <img onClick={() => navigate(1)} className="w-8 bg-black p-2 rounded-2xl cursor-pointer hover:bg-gray-800 transition" src={assets.arrow_right} alt="" />
                </div>

                <div className="flex items-center gap-4 relative">
                    <div>
                        {isAdmin && (
                            <button onClick={() => navigate('/admin')} className="bg-white text-black px-4 py-1 rounded-2xl cursor-pointer hover:bg-gray-200 transition">
                                Admin Dashboard
                            </button>
                        )}
                    </div>
                    
                    <div className="relative">
                        <div 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition"
                        >
                            {user?.image ? (
                                <img src={user.image} alt="User" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-xl text-white font-bold">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
                            )}
                        </div>
                        
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                                <div className="px-4 py-3 border-b border-zinc-800">
                                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                    <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        logout();
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition"
                                >
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
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