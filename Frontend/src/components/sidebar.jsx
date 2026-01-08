import React from 'react'
import { useNavigate } from 'react-router-dom';
import {assets} from '../assets/assets'

const Sidebar = () => {
    const navigate  = useNavigate();
    return (
        <div className="w-[20%] h-full flex-col gap-4 text-white hidden lg:flex">
            <div className="bg-slate-950 h-[15%] rounded flex flex-col justify-around">
                <div onClick={() => navigate('/')} className='flex items-center gap-3 pl-8 cursor-pointer'>
                    <img className='w-6'  src={assets.home_icon} alt=""/>
                    <p className='font-bold'>Home</p>
                </div>
                <div className='flex items-center gap-3 pl-8 cursor-pointer'>
                    <img className='w-6' src={assets.search_icon} alt=""/>
                    <p className='font-bold h-auto'>Search</p>
                </div>
            </div>
            <div className='bg-black h-auto rounded'>     
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <img className='w-6' src={assets.stack_icon} alt=""/>
                        <p className='font-bold text-white p-4'>Your Library</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <img className='w-4' src={assets.arrow_icon} alt=""/>
                        <img className='w-4' src={assets.plus_icon} alt=""/>
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