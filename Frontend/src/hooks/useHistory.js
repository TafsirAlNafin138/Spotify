import { useState, useCallback } from 'react';
import { axiosInstance } from '@/services/axios';

const useHistory = (userId) => {
    const [trackHistory, setTrackHistory] = useState([]);
    const [podcastHistory, setPodcastHistory] = useState([]);
    const [tracksLoading, setTracksLoading] = useState(false);
    const [podcastsLoading, setPodcastsLoading] = useState(false);
    const [tracksFetched, setTracksFetched] = useState(false);
    const [podcastsFetched, setPodcastsFetched] = useState(false);

    // Prefetch tracks history (deduped — won't re-fetch if already loaded)
    const prefetchTracks = useCallback(async () => {
        if (!userId || tracksFetched || tracksLoading) return;
        try {
            setTracksLoading(true);
            const res = await axiosInstance.get(`/users/history/${userId}/tracks-linten-history`);
            setTrackHistory(res.data.data || res.data || []);
            setTracksFetched(true);
        } catch (err) {
            console.error('Error prefetching track history:', err);
        } finally {
            setTracksLoading(false);
        }
    }, [userId, tracksFetched, tracksLoading]);

    // Prefetch podcast (episode) history
    const prefetchPodcasts = useCallback(async () => {
        if (!userId || podcastsFetched || podcastsLoading) return;
        try {
            setPodcastsLoading(true);
            const res = await axiosInstance.get(`/users/history/${userId}/episodes-linten-history`);
            setPodcastHistory(res.data.data || res.data || []);
            setPodcastsFetched(true);
        } catch (err) {
            console.error('Error prefetching podcast history:', err);
        } finally {
            setPodcastsLoading(false);
        }
    }, [userId, podcastsFetched, podcastsLoading]);

    return {
        trackHistory,
        podcastHistory,
        tracksLoading,
        podcastsLoading,
        prefetchTracks,
        prefetchPodcasts,
    };
};

export default useHistory;
