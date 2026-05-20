import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../providers/AuthProvider';
import useHistory from '../hooks/useHistory';

const NavigationBar = ({ activeTab = 'All', setActiveTab }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const adminEmails = [
        import.meta.env.VITE_ADMIN_EMAIL1?.toLowerCase().trim(),
        import.meta.env.VITE_ADMIN_EMAIL2?.toLowerCase().trim()
    ].filter(Boolean);

    const isAdmin = adminEmails.includes(user?.email?.toLowerCase().trim());

    const { prefetchTracks } = useHistory(user?.id);

    const handleHistoryHover = () => {
        prefetchTracks();
    };

    return (
        <>
            <div className="flex justify-between items-center font-semibold">
                <div className="hidden sm:flex items-center gap-2">
                    <img onClick={() => navigate(-1)} className="w-8 bg-black p-2 rounded-2xl cursor-pointer hover:bg-gray-800 transition" src={assets.arrow_left} alt="" />
                    <img onClick={() => navigate(1)} className="w-8 bg-black p-2 rounded-2xl cursor-pointer hover:bg-gray-800 transition" src={assets.arrow_right} alt="" />
                </div>

                <div className="flex items-center gap-2 sm:gap-4 relative ml-auto">
                    {/* History button */}
                    {user && (
                        <button
                            onMouseEnter={handleHistoryHover}
                            onClick={() => navigate('/history')}
                            className="bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white px-3 py-1 sm:px-4 rounded-2xl text-xs sm:text-sm font-semibold transition"
                        >
                            History
                        </button>
                    )}

                    {/*Statistics button */}
                    {user && (
                        <button
                            onClick={() => navigate('/statistics')}
                            className="bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white px-3 py-1 sm:px-4 rounded-2xl text-xs sm:text-sm font-semibold transition"
                        >
                            Statistics
                        </button>
                    )}

                    <div>
                        {isAdmin && (
                            <button onClick={() => navigate('/admin')} className="bg-white text-black px-3 py-1 sm:px-4 rounded-2xl cursor-pointer hover:bg-gray-200 transition text-xs sm:text-sm">
                                Admin Dashboard
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <div
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition"
                        >
                            {user?.image ? (
                                <img src={user.image} alt="User" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-sm sm:text-xl text-white font-bold">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
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
                    <p
                        onClick={() => setActiveTab && setActiveTab('All')}
                        className={`px-4 py-1 rounded-2xl cursor-pointer transition ${activeTab === 'All' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                        All
                    </p>
                    <p
                        onClick={() => setActiveTab && setActiveTab('Music')}
                        className={`px-4 py-1 rounded-2xl cursor-pointer transition ${activeTab === 'Music' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                        Music
                    </p>
                    <p
                        onClick={() => setActiveTab && setActiveTab('Podcasts')}
                        className={`px-4 py-1 rounded-2xl cursor-pointer transition ${activeTab === 'Podcasts' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                        Podcasts
                    </p>
                </div>
            ) : null}
        </>
    )
}

export default NavigationBar;