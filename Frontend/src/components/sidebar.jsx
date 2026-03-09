import React from 'react'
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets'

const Sidebar = () => {
    const navigate = useNavigate();
    return (
        <div className="w-full h-full flex flex-col gap-2 text-white bg-black">
            <div className="bg-[#121212] rounded-lg p-3 flex flex-col gap-2 mx-2 mt-2">
                <div
                    onClick={() => navigate('/')}
                    className='flex items-center gap-4 px-4 py-3 cursor-pointer rounded-md transition-all duration-300 hover:text-white text-zinc-400 group'
                >
                    <img className='w-6 h-6 transition-transform group-hover:scale-105 filter group-hover:brightness-125' src={assets.home_icon} alt="" />
                    <p className='font-bold text-sm tracking-wide'>Home</p>
                </div>
                <div
                    onClick={() => navigate('/search')}
                    className='flex items-center gap-4 px-4 py-3 cursor-pointer rounded-md transition-all duration-300 hover:text-white text-zinc-400 group'
                >
                    <img className='w-6 h-6 transition-transform group-hover:scale-105 filter group-hover:brightness-125' src={assets.search_icon} alt="" />
                    <p className='font-bold text-sm tracking-wide'>Search</p>
                </div>
            </div>
            <div className='bg-[#121212] rounded-lg flex-1 flex flex-col overflow-hidden mx-2 mb-2'>
                <div className='flex items-center justify-between px-6 py-4 shadow-sm z-10'>
                    <div className='flex items-center gap-3 cursor-pointer hover:text-white text-zinc-400 transition-colors duration-300 group'>
                        <img className='w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity duration-300' src={assets.stack_icon} alt="" />
                        <p className='font-bold text-sm tracking-wide'>Your Library</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <div className='p-2 hover:bg-[#1a1a1a] rounded-full cursor-pointer transition-colors duration-200'>
                            <img className='w-4 opacity-70 hover:opacity-100' src={assets.plus_icon} alt="" />
                        </div>
                        <div className='p-2 hover:bg-[#1a1a1a] rounded-full cursor-pointer transition-colors duration-200'>
                            <img className='w-4 opacity-70 hover:opacity-100' src={assets.arrow_icon} alt="" />
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto flex flex-col px-2 pt-2 pb-6 space-y-4 custom-scrollbar">
                    <div
                        onClick={() => navigate('/liked-songs')}
                        className='flex items-center gap-4 px-3 py-2 cursor-pointer rounded-md transition-all duration-300 hover:bg-[#1a1a1a] group'
                    >
                        <div className="w-12 h-12 rounded flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <p className='font-bold text-white text-[15px]'>Liked Songs</p>
                            <p className='text-[13px] text-zinc-400 font-medium flex gap-1 items-center mt-0.5'>
                                <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                                Playlist
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/followed-podcasts')}
                        className='flex items-center gap-4 px-3 py-2 cursor-pointer rounded-md transition-all duration-300 hover:bg-[#1a1a1a] group'
                    >
                        <div className="w-12 h-12 rounded flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 shadow-lg group-hover:shadow-teal-500/20 transition-all duration-300">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <p className='font-bold text-white text-[15px]'>Followed Podcasts</p>
                            <p className='text-[13px] text-zinc-400 font-medium flex gap-1 items-center mt-0.5'>
                                <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                                Podcasts
                            </p>
                        </div>
                    </div>

                    <div className='p-4 bg-[#242424] hover:bg-[#2a2a2a] transition-colors duration-300 rounded-xl flex flex-col items-start justify-start gap-5 mt-2'>
                        <div className="flex flex-col gap-1.5">
                            <h1 className='text-white font-bold text-[15px]'>Create your first playlist</h1>
                            <p className='text-[13px] text-zinc-300 font-medium'>It's easy, we'll help you</p>
                        </div>
                        <button className='bg-white text-black px-5 py-1.5 rounded-full font-bold text-sm hover:scale-105 transition-transform duration-200'>
                            Create playlist
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar