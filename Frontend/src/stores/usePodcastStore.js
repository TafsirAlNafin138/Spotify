import { create } from "zustand";
import { axiosInstance } from "@/services/axios";
import toast from "react-hot-toast";

export const usePodcastStore = create((set) => ({
    podcasts: [],
    episodes: [],
    isLoading: false,
    error: null,

    fetchPodcasts: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/admin/podcastscount");
            set({ podcasts: response.data.data }); // Updated to access data property
        } catch (error) {
            set({ error: error.response?.data?.message || error.message });
            toast.error("Error fetching podcasts: " + (error.response?.data?.message || error.message));
        } finally {
            set({ isLoading: false });
        }
    },

    deletePodcast: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/podcasts/${id}`);
            set((state) => ({
                podcasts: state.podcasts.filter((podcast) => podcast.id !== id),
                episodes: state.episodes.filter((episode) => episode.podcastId !== id),
            }));
            toast.success("Podcast deleted successfully");
        } catch (error) {
            set({ error: error.response?.data?.message || error.message });
            toast.error("Error deleting podcast: " + (error.response?.data?.message || error.message));
        } finally {
            set({ isLoading: false });
        }
    },

    fetchEpisodes: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/admin/episodescount");
            set({ episodes: response.data.data }); // Updated to access data property
        } catch (error) {
            set({ error: error.response?.data?.message || error.message });
            toast.error("Error fetching episodes: " + (error.response?.data?.message || error.message));
        } finally {
            set({ isLoading: false });
        }
    },

    deleteEpisode: async (podcastId, id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/podcasts/${podcastId}/episodes/${id}`);
            set((state) => ({
                episodes: state.episodes.filter((episode) => episode.id !== id),
            }));
            toast.success("Episode deleted successfully");
        } catch (error) {
            set({ error: error.response?.data?.message || error.message });
            toast.error("Error deleting episode: " + (error.response?.data?.message || error.message));
        } finally {
            set({ isLoading: false });
        }
    },
}));
