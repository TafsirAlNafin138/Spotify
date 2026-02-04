import { create } from "zustand";
import { axiosInstance } from "@/services/axios";
import toast from "react-hot-toast";

export const useArtistStore = create((set) => ({
    artists: [],
    isLoading: false,
    error: null,

    fetchArtists: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/admin/artistscount");
            set({ artists: response.data.data });
        } catch (error) {
            set({ error: error.response?.data?.message || error.message });
            toast.error("Error fetching artists: " + (error.response?.data?.message || error.message));
        } finally {
            set({ isLoading: false });
        }
    },

    deleteArtist: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/artists/${id}`);
            set((state) => ({
                artists: state.artists.filter((artist) => artist.id !== id),
            }));
            toast.success("Artist deleted successfully");
        } catch (error) {
            set({ error: error.response?.data?.message || error.message });
            toast.error("Error deleting artist");
        } finally {
            set({ isLoading: false });
        }
    },
}));
