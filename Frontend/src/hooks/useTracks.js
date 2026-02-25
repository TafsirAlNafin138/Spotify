import { useState, useEffect } from 'react';
import { axiosInstance } from '@/services/axios';
import toast from 'react-hot-toast';

/**
 * Custom hook to fetch all tracks
 * Note: This endpoint requires admin access
 * @returns {Object} { tracks, loading, error, refetch }
 */
export const useAllTracks = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTracks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/tracks');
            
            setTracks(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching tracks:', err);
            setError(err.response?.data?.message || err.message);
            
            // Only show toast if it's not an auth error
            if (err.response?.status !== 401 && err.response?.status !== 403) {
                toast.error('Failed to load tracks');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTracks();
    }, []);

    return {
        tracks,
        loading,
        error,
        refetch: fetchTracks
    };
};

/**
 * Custom hook to fetch trending songs
 * @returns {Object} { tracks, loading, error, refetch }
 */
export const useTrendingSongs = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTrending = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/tracks/trending');
            
            setTracks(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching trending songs:', err);
            setError(err.response?.data?.message || err.message);
            toast.error('Failed to load trending songs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrending();
    }, []);

    return {
        tracks,
        loading,
        error,
        refetch: fetchTrending
    };
};

/**
 * Custom hook to fetch "Made For You" personalized tracks
 * @returns {Object} { tracks, loading, error, refetch }
 */
export const useMadeForYou = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMadeForYou = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/tracks/made-for-you');
            
            setTracks(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching made for you tracks:', err);
            setError(err.response?.data?.message || err.message);
            
            if (err.response?.status !== 401) {
                toast.error('Failed to load recommendations');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMadeForYou();
    }, []);

    return {
        tracks,
        loading,
        error,
        refetch: fetchMadeForYou
    };
};

/**
 * Custom hook to fetch new releases
 * @returns {Object} { tracks, loading, error, refetch }
 */
export const useNewReleases = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNewReleases = async () => {
        try {
            setLoading(true);
            setError(null);
            // Add cache buster to prevent 304 Not Modified responses
            const response = await axiosInstance.get(`/tracks/new-releases?t=${Date.now()}`);
            
            setTracks(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching new releases:', err);
            setError(err.response?.data?.message || err.message);
            toast.error('Failed to load new releases');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNewReleases();
    }, []);

    return {
        tracks,
        loading,
        error,
        refetch: fetchNewReleases
    };
};
