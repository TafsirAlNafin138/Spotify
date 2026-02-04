import { create } from "zustand";
import { axiosInstance } from "@/services/axios";
import toast from "react-hot-toast";

export const useGenreStore = create((set) => ({
    genres: [],
    isLoading: false,
    error: null,

    fetchGenres: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/admin/genrescount");
            set({ genres: response.data.data }); // Updated to access data property
        } catch (error) {
            set({ error: error.response?.data?.message || error.message });
            toast.error("Error fetching genres: " + (error.response?.data?.message || error.message));
        } finally {
            set({ isLoading: false });
        }
    },

    deleteGenre: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/genres/${id}`);
            set((state) => ({
                genres: state.genres.filter((genre) => genre.id !== id),
            }));
            toast.success("Genre deleted successfully");
        } catch (error) {
            set({ error: error.response?.data?.message || error.message });
            toast.error("Error deleting genre: " + (error.response?.data?.message || error.message));
        } finally {
            set({ isLoading: false });
        }
    },
}));
