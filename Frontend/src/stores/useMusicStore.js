import { create } from "zustand";
import { axiosInstance } from "@/services/axios";
import toast from "react-hot-toast";

export const useMusicStore = create((set) => ({
    albums: [],
    songs: [],
    stats: {
        totalSongs: 0,
        totalAlbums: 0,
        totalUsers: 0,
        totalArtists: 0,
    },
    isLoading: false,
    error: null,

    fetchAlbums: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/admin/albumscount");
            set({ albums: response.data.data }); // Updated to access data property
        } catch (error) {
            set({ error: error.response?.data?.message || error.message });
            toast.error("Error fetching albums: " + (error.response?.data?.message || error.message));
        } finally {
            set({ isLoading: false });
        }
    },

    fetchSongs: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/admin/trackscount"); // Changed to trackscount
            set({ songs: response.data.data }); // Updated to access data property
        } catch (error) {
            set({ error: error.message });
            toast.error("Error fetching songs: " + error.message);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/admin/stats");
            set({ stats: response.data.data }); // Updated to access data property
        } catch (error) {
            set({ error: error.message });
            toast.error("Error fetching stats: " + error.message);
        } finally {
            set({ isLoading: false });
        }
    },

    deleteSong: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/tracks/${id}`);

            set((state) => ({
                songs: state.songs.filter((song) => song.id !== id),
            }));
            toast.success("Song deleted successfully");
        } catch (error) {
            console.log("Error in deleteSong", error);
            toast.error("Error deleting song");
        } finally {
            set({ isLoading: false });
        }
    },

    deleteAlbum: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/albums/${id}`);
            set((state) => ({
                albums: state.albums.filter((album) => album.id !== id),
                songs: state.songs.map((song) =>
                    song.albumId === state.albums.find((a) => a.id === id)?.title ? { ...song, album: null } : song
                ),
            }));
            toast.success("Album deleted successfully");
        } catch (error) {
            toast.error("Error deleting album: " + error.message);
        } finally {
            set({ isLoading: false });
        }
    },
}));
