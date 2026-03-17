import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets'
import { PlayerContext } from '../contexts/PlayerContext';
import { axiosInstance } from '../services/axios';

const Sidebar = () => {
    const navigate = useNavigate();
    const { userPlaylists, createPlaylist, fetchUserPlaylists } = useContext(PlayerContext);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [contextMenu, setContextMenu] = useState(null);

    const handleCreatePlaylistSubmit = async (e) => {
        e.preventDefault();
        if (newPlaylistName.trim()) {
            await createPlaylist(newPlaylistName.trim());
            setNewPlaylistName('');
            setIsCreateModalOpen(false);
        }
    };

    const handleContextMenu = (e, playlist) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            playlist
        });
    };

    const handleDeletePlaylist = async () => {
        if (!contextMenu?.playlist) return;
        if (window.confirm(`Are you sure you want to delete "${contextMenu.playlist.name}"?`)) {
            try {
                await axiosInstance.delete(`/playlists/${contextMenu.playlist.id}`);
                fetchUserPlaylists();
                if (window.location.pathname === `/playlist/${contextMenu.playlist.id}`) {
                    navigate('/');
                }
            } catch (error) {
                console.error("Error deleting playlist:", error);
            }
        }
        setContextMenu(null);
    };

    // Close context menu on window click
    React.useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

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
                        <div onClick={() => setIsCreateModalOpen(true)} className='p-2 hover:bg-[#1a1a1a] rounded-full cursor-pointer transition-colors duration-200'>
                            <img className='w-4 opacity-70 hover:opacity-100' src={assets.plus_icon} alt="Create Playlist" title="Create Playlist" />
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

                    {userPlaylists && userPlaylists.length > 0 && userPlaylists.map(playlist => (
                        <div
                            key={playlist.id}
                            onClick={() => navigate(`/playlist/${playlist.id}`)}
                            onContextMenu={(e) => handleContextMenu(e, playlist)}
                            className='flex items-center gap-4 px-3 py-2 cursor-pointer rounded-md transition-all duration-300 hover:bg-[#1a1a1a] group relative'
                        >
                            <div className="w-12 h-12 rounded flex items-center justify-center bg-[#282828] shadow-lg group-hover:bg-[#383838] transition-all duration-300 overflow-hidden">
                                {playlist.image ? (
                                    <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-6 h-6 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex flex-col flex-1 truncate">
                                <p className='font-bold text-white text-[15px] truncate'>{playlist.name}</p>
                                <p className='text-[13px] text-zinc-400 font-medium flex gap-1 items-center mt-0.5'>
                                    Playlist
                                </p>
                            </div>
                        </div>
                    ))}

                    {(!userPlaylists || userPlaylists.length === 0) && (
                        <div className='p-4 bg-[#242424] hover:bg-[#2a2a2a] transition-colors duration-300 rounded-xl flex flex-col items-start justify-start gap-5 mt-2'>
                            <div className="flex flex-col gap-1.5">
                                <h1 className='text-white font-bold text-[15px]'>Create your first playlist</h1>
                                <p className='text-[13px] text-zinc-300 font-medium'>It's easy, we'll help you</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(true)} className='bg-white text-black px-5 py-1.5 rounded-full font-bold text-sm hover:scale-105 transition-transform duration-200'>
                                Create playlist
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Playlist Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#282828] rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Create Details</h2>

                            <form onSubmit={handleCreatePlaylistSubmit} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="playlistName" className="text-sm font-bold text-white">Name</label>
                                    <input
                                        type="text"
                                        id="playlistName"
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                        placeholder="My Awesome Playlist"
                                        className="bg-[#3e3e3e] text-white px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-zinc-400 transition-all placeholder-zinc-400 font-medium w-full"
                                        autoFocus
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!newPlaylistName.trim()}
                                    className="bg-white text-black font-bold py-3.5 px-8 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 mt-2 self-end"
                                >
                                    Save
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-[110] bg-[#282828] shadow-2xl rounded-md border border-[#3e3e3e] py-1 min-w-[160px] animate-in fade-in duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        onClick={handleDeletePlaylist}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-[#3e3e3e] transition-colors font-medium flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                    </button>
                </div>
            )}
        </div>
    )
}

export default Sidebar