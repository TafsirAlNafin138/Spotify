import { Link } from "react-router-dom";
import spotifyLogo from "@/assets/spotify.png";
import { useAuth } from "../../providers/AuthProvider";

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3 mb-8'>
                <Link to='/' className='rounded-lg'>
                    <img src={spotifyLogo} className='size-10 text-black' alt="Spotify Logo" />
                </Link>
                <div>
                    <h1 className='text-3xl font-bold'>Music Manager</h1>
                    <p className='text-zinc-400 mt-1'>Manage your music catalog</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-400">Admin: {user?.name}</span>
                <button 
                    onClick={logout}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-3xl transition-colors text-sm font-medium"
                >
                    Log out
                </button>
            </div>
        </div>
    );
};
export default Header;