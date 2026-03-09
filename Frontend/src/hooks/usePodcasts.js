import { useState, useEffect } from 'react';
import { axiosInstance } from '@/services/axios';
import toast from 'react-hot-toast';

export const usePodcasts = () => {
    const [podcasts, setPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPodcasts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/podcasts');
            setPodcasts(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching podcasts:', err);
            setError(err.response?.data?.message || err.message);
            // Ignore auth error toasts here if not active, or just generic error
            if (err.response?.status !== 401 && err.response?.status !== 403) {
                toast.error('Failed to load podcasts');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPodcasts();
    }, []);

    return {
        podcasts,
        loading,
        error,
        refetch: fetchPodcasts
    };
};

export const usePodcast = (podcastId) => {
    const [podcast, setPodcast] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPodcast = async () => {
        if (!podcastId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(`/podcasts/${podcastId}`);

            const data = response.data.data || response.data;
            setPodcast(data);
            setEpisodes(data.episodes || []);
        } catch (err) {
            console.error('Error fetching podcast:', err);
            setError(err.response?.data?.message || err.message);
            toast.error('Failed to load podcast details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPodcast();
    }, [podcastId]);

    return {
        podcast,
        episodes,
        loading,
        error,
        refetch: fetchPodcast
    };
};
