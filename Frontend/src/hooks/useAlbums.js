import { useState, useEffect } from 'react';
import { axiosInstance } from '@/services/axios';
import toast from 'react-hot-toast';

/**
 * Custom hook to fetch all albums from the backend
 * @returns {Object} { albums, loading, error, refetch }
 */
export const useAlbums = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAlbums = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/albums');

            // The backend returns { statusCode, data, message }
            setAlbums(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching albums:', err);
            setError(err.response?.data?.message || err.message);
            toast.error('Failed to load albums');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    return {
        albums,
        loading,
        error,
        refetch: fetchAlbums
    };
};

/**
 * Custom hook to fetch a single album by ID with its tracks
 * @param {string} albumId - The album ID
 * @returns {Object} { album, tracks, loading, error, refetch }
 */
export const useAlbum = (albumId) => {
    const [album, setAlbum] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAlbum = async () => {
        if (!albumId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(`/albums/${albumId}`);

            const data = response.data.data || response.data;
            setAlbum(data);
            setTracks(data.tracks || []);
        } catch (err) {
            console.error('Error fetching album:', err);
            setError(err.response?.data?.message || err.message);
            toast.error('Failed to load album details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlbum();
    }, [albumId]);

    return {
        album,
        tracks,
        loading,
        error,
        refetch: fetchAlbum
    };
};
