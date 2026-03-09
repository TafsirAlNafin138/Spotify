import { useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '@/services/axios';

const useSearch = () => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [results, setResults] = useState({ songs: [], artists: [], podcasts: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchResults = useCallback(async (q, type) => {
        if (!q.trim()) {
            setResults({ songs: [], artists: [], podcasts: [] });
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const res = await axiosInstance.get(`/search?q=${encodeURIComponent(q)}&type=${type}`);
            const data = res.data.data || {};
            setResults({
                songs: data.songs || [],
                artists: data.artists || [],
                podcasts: data.podcasts || [],
            });
        } catch (err) {
            console.error('Search error:', err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce: fire 350ms after the user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchResults(query, category);
        }, 350);
        return () => clearTimeout(timer);
    }, [query, category, fetchResults]);

    return { query, setQuery, category, setCategory, results, loading, error };
};

export default useSearch;
