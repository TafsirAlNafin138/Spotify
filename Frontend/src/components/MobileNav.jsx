import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';

const MobileNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: assets.home_icon, label: 'Home', path: '/' },
        { icon: assets.search_icon, label: 'Search', path: '/search' },
        { icon: assets.stack_icon, label: 'Library', path: '/liked-songs' },
    ];

    return (
        <div className="mobile-nav fixed bottom-0 left-0 right-0 h-14 bg-black/95 backdrop-blur-md border-t border-[#282828] hidden justify-around items-center z-50">
            {navItems.map((item) => (
                <div
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        location.pathname === item.path ? 'text-white' : 'text-zinc-400'
                    }`}
                >
                    <img
                        className={`w-6 h-6 ${location.pathname === item.path ? 'brightness-125' : 'brightness-75'}`}
                        src={item.icon}
                        alt={item.label}
                    />
                    <p className="text-[10px] font-medium">{item.label}</p>
                </div>
            ))}
        </div>
    );
};

export default MobileNav;
