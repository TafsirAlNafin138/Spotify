import React from 'react'
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets'

const Sidebar = () => {
    const navigate = useNavigate();
    return (
        <div className="w-full h-full flex flex-col gap-4 text-white">
            <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-4 mt-2">
                <div
                    onClick={() => navigate('/')}
                    className='flex items-center gap-4 px-4 py-2 cursor-pointer rounded-md transition-all duration-200 hover:bg-zinc-800/50 group'
                >
                    <img className='w-6 h-6 transition-transform group-hover:scale-110' src={assets.home_icon} alt="" />
                    <p className='font-semibold text-zinc-300 group-hover:text-white transition-colors'>Home</p>
                </div>
                <div className='flex items-center gap-4 px-4 py-2 cursor-pointer rounded-md transition-all duration-200 hover:bg-zinc-800/50 group'>
                    <img className='w-6 h-6 transition-transform group-hover:scale-110' src={assets.search_icon} alt="" />
                    <p className='font-semibold text-zinc-300 group-hover:text-white transition-colors'>Search</p>
                </div>
            </div>
            <div className='bg-[#121212] rounded-lg flex-1 flex flex-col overflow-hidden'>
                <div className='flex items-center justify-between px-6 py-4 border-b border-zinc-800/50'>
                    <div className='flex items-center gap-3'>
                        <img className='w-6 h-6 opacity-70' src={assets.stack_icon} alt="" />
                        <p className='font-semibold text-zinc-300'>Your Library</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <img className='w-4' src={assets.arrow_icon} alt="" />
                        <img className='w-4' src={assets.plus_icon} alt="" />
                    </div>
                </div>
                <div className='p-4 bg-gray-800 m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4'>
                    <h1>
                        Create Your Playlist
                    </h1>
                    <p className='text-sm text-gray-500'>
                        Get started by creating a new playlist
                    </p>
                    <button className='bg-white text-black px-4 py-1 mt-2 rounded-full font-bold'>
                        Create Playlist
                    </button>
                </div>
                {/* <div className='p-4 bg-zinc-800 m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4'>
                    <h1>
                        Find Podcasts You Love
                    </h1>
                    <p className='text-sm text-gray-500'>
                        Explore our podcast library and find your next favorite show
                    </p>
                    <button className='bg-white text-black px-4 py-1 mt-2 rounded-full font-bold'>
                        Browse Podcasts
                    </button>
                </div> */}
            </div>
        </div>
    )
}

export default Sidebar