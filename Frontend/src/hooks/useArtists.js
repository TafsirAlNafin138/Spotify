import { useState, useEffect } from 'react';
import { axiosInstance } from '@/services/axios';
import toast from 'react-hot-toast';

export const useTrendingArtists = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTrendingArtists = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/artists/trending');
            setArtists(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching trending artists:', err);
            setError(err.response?.data?.message || err.message);
            if (err.response?.status !== 401 && err.response?.status !== 403) {
                toast.error('Failed to load trending artists');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrendingArtists();
    }, []);

    return { artists, loading, error, refetch: fetchTrendingArtists };
};

export const useArtist = (artistId) => {
    const [artist, setArtist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArtistData = async () => {
        if (!artistId) return;

        try {
            setLoading(true);
            setError(null);

            // Promise.all to fetch artist details and their tracks
            const [artistRes, tracksRes] = await Promise.all([
                axiosInstance.get(`/artists/${artistId}`),
                axiosInstance.get(`/artists/${artistId}/tracks`)
            ]);

            setArtist(artistRes.data.data || artistRes.data);
            setTracks(tracksRes.data.data || tracksRes.data);
        } catch (err) {
            console.error('Error fetching artist:', err);
            setError(err.response?.data?.message || err.message);
            toast.error('Failed to load artist details');
        } finally {
            setLoading(false);
        }
    };

    const toggleFollow = async () => {
        if (!artistId) return null;
        try {
            const response = await axiosInstance.post(`/artists/${artistId}/follow`);
            const { isFollowing } = response.data.data;

            // Optimistic update
            setArtist(prev => ({
                ...prev,
                isFollowing,
                stats: {
                    ...prev.stats,
                    followers_count: parseInt(prev.stats?.followers_count || 0) + (isFollowing ? 1 : -1)
                }
            }));

            toast.success(response.data.message);
            return isFollowing;
        } catch (err) {
            console.error('Error toggling follow:', err);
            toast.error(err.response?.data?.message || 'Failed to update follow status');
            return null;
        }
    };

    useEffect(() => {
        fetchArtistData();
    }, [artistId]);

    return { artist, tracks, loading, error, refetch: fetchArtistData, toggleFollow };
};
