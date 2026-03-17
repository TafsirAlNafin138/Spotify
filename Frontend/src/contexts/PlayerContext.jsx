import { createContext, useEffect, useRef, useState, useCallback } from "react"
import { axiosInstance } from "../services/axios";
import { useAuth } from "../providers/AuthProvider.jsx";

const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
    const { user, loading } = useAuth();
    const isSignedIn = !!user;

    const [songsData, setSongsData] = useState([]);
    const [songsLoading, setSongsLoading] = useState(true);
    const lastHistoryUpdate = useRef(0);
    const [track, setTrack] = useState({
        id: null,
        name: "",
        image: "",
        file: "",
        desc: "",
        duration: "0:00"
    });
    const [playerState, setPlayerState] = useState(false); // false - paused, true - playing
    const [trackProgress, setTrackProgress] = useState({  // song player progress in seconds and minutes
        currentTime: {
            seconds: 0,
            minutes: 0
        },
        duration: {
            seconds: 0,
            minutes: 0
        }
    });
    const [volume, setVolume] = useState(0.75);
    const prevVolumeRef = useRef(volume);

    const [queue, setQueue] = useState([]);
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [activePlaylist, setActivePlaylist] = useState(null); // { tracks: [], name: '' }
    const [activeAlbum, setActiveAlbum] = useState(null); // { tracks: [], name: '' }
    const [activeEpisodeList, setActiveEpisodeList] = useState(null); // { episodes: [], podcastImage: '' }
    const [autoAdvance, setAutoAdvance] = useState(false); // only auto-advance when Play All is used
    const [likedSongs, setLikedSongs] = useState({});
    const [songLikes, setSongLikes] = useState({});
    const [followedArtists, setFollowedArtists] = useState(() => {
        const saved = localStorage.getItem('spotifyFollowedArtists');
        return saved ? JSON.parse(saved) : {};
    });
    const [artistFollowers, setArtistFollowers] = useState(() => {
        const saved = localStorage.getItem('spotifyArtistFollowers');
        return saved ? JSON.parse(saved) : {};
    });

    // NEW: Followed Podcasts State
    const [followedPodcasts, setFollowedPodcasts] = useState({});
    const [podcastFollowers, setPodcastFollowers] = useState({});

    // NEW: User Playlists State
    const [userPlaylists, setUserPlaylists] = useState([]);

    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();
    const volumeBg = useRef();
    const volumeBar = useRef();
    const nextTrackRef = useRef();
    const autoAdvanceRef = useRef(false);

    // Fetch songs from backend on mount
    useEffect(() => {
        const fetchSongs = async () => {
            try {
                setSongsLoading(true);
                const response = await axiosInstance.get('/tracks/trending');
                const tracks = response.data.data || response.data;
                setSongsData(tracks);

                // Set initial track if available
                if (tracks.length > 0) {
                    const firstTrack = tracks[0];
                    setTrack({
                        id: firstTrack.id,
                        name: firstTrack.name || firstTrack.title,
                        image: firstTrack.image || firstTrack.image_url,
                        file: firstTrack.path,
                        desc: firstTrack.artist || firstTrack.desc || "",
                        duration: formatDuration(firstTrack.duration)
                    });
                }
            } catch (err) {
                console.error('Error fetching songs for player:', err);
            } finally {
                setSongsLoading(false);
            }
        };
        fetchSongs();
    }, []);

    // Helper to format duration from seconds to "m:ss"
    const formatDuration = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Helper to normalize a backend track object into the shape the player expects
    const normalizeTrack = (t) => ({
        id: t.id,
        name: t.name || t.title,
        image: t.image || t.image_url,
        file: t.path,
        desc: t.artist || t.desc || "",
        duration: formatDuration(t.duration)
    });

    // Helper to normalize a backend episode object into the shape the player expects
    const normalizeEpisode = (e, podcastImage = "") => ({
        id: e.id,
        name: e.title || e.name,
        image: e.cover_image || e.image || podcastImage,
        file: e.audio_path,
        desc: e.description || "",
        duration: formatDuration(e.duration),
        _isEpisode: true // flag so history saving uses the right endpoint
    });

    const playWithId = async (id, options = { preserveAutoAdvance: false, startTime: 0 }) => {
        // Single-track play: don't auto-advance when song ends, unless told to preserve it
        if (!options.preserveAutoAdvance) {
            setAutoAdvance(false);
            autoAdvanceRef.current = false;
        }

        // First check if the track is already in our loaded songsData
        const found = songsData.find(s => s.id === id);
        if (found) {
            setTrack(normalizeTrack(found));
        } else {
            // Fetch from backend
            try {
                const response = await axiosInstance.get(`/tracks/${id}`);
                const trackData = response.data.data || response.data;
                setTrack(normalizeTrack(trackData));

                // Also add to songsData so prev/next works
                setSongsData(prev => {
                    if (prev.find(s => s.id === id)) return prev;
                    return [...prev, trackData];
                });
            } catch (err) {
                console.error('Error fetching track:', err);
                return;
            }
        }


        // Wait for audio to be ready, then play
        if (audioRef.current) {
            // The src will be updated by the useEffect in App.jsx that watches track.file
            // We need a small delay for the src to update
            setTimeout(async () => {
                try {
                    if (options.startTime) {
                        audioRef.current.currentTime = options.startTime;
                    }
                    await audioRef.current.play();
                    setPlayerState(true);
                } catch (err) {
                    console.error('Play failed:', err);
                }
            }, 100);
        }

        const startSec = options.startTime || 0;
        setTrackProgress({
            currentTime: { seconds: Math.floor(startSec % 60), minutes: Math.floor(startSec / 60) },
            duration: { seconds: 0, minutes: 0 }
        });

        // Save track to listening history
        lastHistoryUpdate.current = startSec;
        try {
            await axiosInstance.post(`/users/history/${user.id}/tracks`, { trackId: id, progressSeconds: Math.floor(startSec), isCompleted: false });
        } catch (err) {
            console.error('Failed to save track history:', err);
        }
    }

    const prevTrack = () => {
        // Episode list takes priority
        if (activeEpisodeList?.episodes?.length > 0) {
            const epList = activeEpisodeList.episodes;
            const currentIndex = epList.findIndex(e => e.id === track.id);
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) prevIndex = epList.length - 1;
            playEpisodeWithId(epList[prevIndex].id, epList, activeEpisodeList.podcastImage, { preserveAutoAdvance: true });
            return;
        }
        // Use activePlaylist (e.g. album tracks) if available, otherwise fall back to global songsData
        const playlist = activePlaylist?.tracks?.length > 0 ? activePlaylist.tracks : activeAlbum?.tracks?.length > 0 ? activeAlbum.tracks : songsData;
        if (playlist.length === 0) return;
        const currentIndex = playlist.findIndex(s => s.id === track.id);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = playlist.length - 1;
        playWithId(playlist[prevIndex].id, { preserveAutoAdvance: true });
    }

    const nextTrack = (isAutoAdvance = false) => {
        // Episode list takes priority
        if (activeEpisodeList?.episodes?.length > 0) {
            const epList = activeEpisodeList.episodes;
            const currentIndex = epList.findIndex(e => e.id === track.id);
            let nextIndex = currentIndex + 1;
            if (nextIndex >= epList.length) {
                if (isAutoAdvance) {
                    setAutoAdvance(false);
                    autoAdvanceRef.current = false;
                    setPlayerState(false);
                    return;
                }
                nextIndex = 0;
            }
            playEpisodeWithId(epList[nextIndex].id, epList, activeEpisodeList.podcastImage, { preserveAutoAdvance: true });
            return;
        }
        // Use activePlaylist (e.g. album tracks) if available, otherwise fall back to global songsData
        const playlist = activePlaylist?.tracks?.length > 0 ? activePlaylist.tracks : activeAlbum?.tracks?.length > 0 ? activeAlbum.tracks : songsData;
        if (playlist.length === 0) return;

        const currentIndex = playlist.findIndex(s => s.id === track.id);
        let nextIndex = currentIndex + 1;

        if (nextIndex >= playlist.length) {
            // If this was an automatic advance at the end of the playlist, stop playing
            if (isAutoAdvance) {
                setAutoAdvance(false);
                autoAdvanceRef.current = false;
                setPlayerState(false);
                return;
            }
            // Otherwise (manual button click), loop back to the start
            nextIndex = 0;
        }

        playWithId(playlist[nextIndex].id, { preserveAutoAdvance: true });
    }

    // Play an episode by ID, with an optional episode list for auto-advance
    const playEpisodeWithId = async (id, episodeList = [], podcastImage = "", options = { preserveAutoAdvance: false }) => {
        if (!options.preserveAutoAdvance) {
            setAutoAdvance(false);
            autoAdvanceRef.current = false;
        }

        // Find episode in provided list first
        let episodeData = episodeList.find(e => e.id === id);
        if (!episodeData) {
            try {
                const response = await axiosInstance.get(`/podcasts`);
                // Fallback: episode data not found, just play the id from list if available
            } catch (err) {
                console.error('Error fetching episode:', err);
                return;
            }
        }

        if (episodeData) {
            setTrack(normalizeEpisode(episodeData, podcastImage));
        }

        // Store the active episode list for prev/next
        if (episodeList.length > 0) {
            setActiveEpisodeList({ episodes: episodeList, podcastImage });
            setActiveAlbum(null);
            setActivePlaylist(null);
        }

        if (audioRef.current) {
            setTimeout(async () => {
                try {
                    if (options.startTime) {
                        audioRef.current.currentTime = options.startTime;
                    }
                    await audioRef.current.play();
                    setPlayerState(true);
                } catch (err) {
                    console.error('Play failed:', err);
                }
            }, 100);
        }

        const startSec = options.startTime || 0;
        setTrackProgress({
            currentTime: { seconds: Math.floor(startSec % 60), minutes: Math.floor(startSec / 60) },
            duration: { seconds: 0, minutes: 0 }
        });

        // Save episode to listening history
        lastHistoryUpdate.current = 0;
        try {
            await axiosInstance.post(`/users/history/${user.id}/episodes`, { episodeId: id, progressSeconds: 0, isCompleted: false });
        } catch (err) {
            console.error('Failed to save episode history:', err);
        }
    };

    // Keep refs in sync so onended always reads the latest values
    useEffect(() => {
        nextTrackRef.current = nextTrack;
        autoAdvanceRef.current = autoAdvance;
    });


    const seekSong = async (e) => {
        if (!seekBg.current || !audioRef.current) return;

        const seekBarWidth = seekBg.current.clientWidth;
        const clickX = e.nativeEvent.offsetX;
        const duration = audioRef.current.duration;

        if (isNaN(duration) || duration <= 0) return;

        audioRef.current.currentTime = (clickX / seekBarWidth) * duration;
    }

    const loopSeek = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setPlayerState(true);
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
        if (volumeBar.current) {
            volumeBar.current.style.width = `${Math.round(volume * 100)}%`;
        }
    }, [audioRef, volume]);

    const speakerseek = (e) => {
        if (!volumeBg.current || !audioRef.current) return;
        const seekBarWidth = volumeBg.current.clientWidth;
        const clickX = e.nativeEvent ? e.nativeEvent.offsetX : 0;
        const newVol = Math.min(1, Math.max(0, clickX / seekBarWidth));
        setVolume(newVol);
        audioRef.current.volume = newVol;
    }

    const volumeSeek = () => {
        if (!audioRef.current) return;
        if (audioRef.current.volume > 0) {
            prevVolumeRef.current = volume;
            audioRef.current.volume = 0;
            if (volumeBar.current) volumeBar.current.style.width = `0%`;
        } else {
            const restore = prevVolumeRef.current || 0.5;
            setVolume(restore);
            audioRef.current.muted = false;
            audioRef.current.volume = restore;
            if (volumeBar.current) volumeBar.current.style.width = `${Math.round(restore * 100)}%`;
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.ontimeupdate = () => {
                    const currentTime = audioRef.current.currentTime;
                    const duration = audioRef.current.duration;

                    if (!isNaN(duration) && duration > 0) {
                        setTrackProgress({
                            currentTime: {
                                seconds: Math.floor(currentTime % 60),
                                minutes: Math.floor(currentTime / 60)
                            },
                            duration: {
                                seconds: Math.floor(duration % 60),
                                minutes: Math.floor(duration / 60)
                            }
                        });

                        // Update seek bar
                        if (seekBar.current && seekBg.current) {
                            seekBar.current.style.width = `${(currentTime / duration) * 100}%`;
                        }

                        // Background history progress update every 10 seconds
                        if (isSignedIn && currentTime - lastHistoryUpdate.current >= 10) {
                            lastHistoryUpdate.current = currentTime;
                            const isCompleted = (currentTime / duration) > 0.9;
                            if (track && track.id) {
                                if (track._isEpisode) {
                                    axiosInstance.post(`/users/history/${user.id}/episodes`, {
                                        episodeId: track.id,
                                        progressSeconds: Math.floor(currentTime),
                                        isCompleted
                                    }).catch(() => { });
                                } else {
                                    axiosInstance.post(`/users/history/${user.id}/tracks`, {
                                        trackId: track.id,
                                        progressSeconds: Math.floor(currentTime),
                                        isCompleted
                                    }).catch(() => { });
                                }
                            }
                        }
                    }
                };

                // Auto-advance to next track only when Play All is active
                audioRef.current.onended = () => {
                    if (autoAdvanceRef.current && nextTrackRef.current) {
                        nextTrackRef.current(true); // pass true to indicate this is an auto-advance
                    } else {
                        setPlayerState(false);
                    }
                };
            }
        }
            , 1000);

        // return () => clearTimeout(timer);
    }, [audioRef, track, setTrack, playerState, playWithId, setPlayerState]);


    const play = () => {
        audioRef.current.play();
        setPlayerState(true);
    }

    const pause = () => {
        audioRef.current.pause();
        setPlayerState(false);
    }

    // Fetch liked tracks from backend on mount or sign in state change
    const fetchLikedTracks = useCallback(async () => {
        if (!isSignedIn) {
            setLikedSongs({});
            setFollowedPodcasts({});
            return;
        }

        try {
            const response = await axiosInstance.get('/likes/my-likes');
            const tracks = response.data.data || response.data;
            const likedMap = {};
            if (Array.isArray(tracks)) {
                tracks.forEach(t => { likedMap[t.id] = true; });
            }
            setLikedSongs(likedMap);
        } catch (err) {
            console.error('Error fetching liked tracks:', err);
        }

        // Also fetch followed podcasts
        try {
            const response = await axiosInstance.get(`/podcast-followers/my-podcasts`);
            const podcasts = response.data.data || response.data;
            const podcastMap = {};
            if (Array.isArray(podcasts)) {
                podcasts.forEach(p => { podcastMap[p.id] = true; });
            }
            setFollowedPodcasts(podcastMap);
        } catch (err) {
            console.error('Error fetching followed podcasts:', err);
        }
    }, [isSignedIn, user?.id]);

    const fetchUserPlaylists = useCallback(async () => {
        if (!isSignedIn) {
            setUserPlaylists([]);
            return;
        }
        try {
            const response = await axiosInstance.get('/playlists/user');
            setUserPlaylists(response.data.data || response.data || []);
        } catch (err) {
            console.error('Error fetching user playlists:', err);
        }
    }, [isSignedIn]);

    const createPlaylist = async (name) => {
        try {
             await axiosInstance.post('/playlists', { name });
             fetchUserPlaylists();
             return true;
        } catch (err) {
             console.error("Error creating playlist:", err);
             return false;
        }
    };

    const addTrackToPlaylist = async (playlistId, trackId) => {
        try {
             await axiosInstance.post(`/playlists/${playlistId}/add-track/${trackId}`);
             fetchUserPlaylists(); 
             return true;
        } catch (err) {
             console.error("Error adding track to playlist:", err);
             return false;
        }
    };

    useEffect(() => {
        fetchLikedTracks();
        fetchUserPlaylists();
    }, [fetchLikedTracks, fetchUserPlaylists]);

    useEffect(() => {
        if (track.id) {
            axiosInstance.get(`/likes/count/${track.id}`)
                .then(res => {
                    const count = res.data.data?.count || 0;
                    setSongLikes(prev => ({ ...prev, [track.id]: count }));
                })
                .catch(err => console.error('Error fetching like count:', err));
        }
    }, [track.id]);

    const toggleLike = async (songId) => {
        // Optimistic update
        const wasLiked = likedSongs[songId] || false;
        setLikedSongs(prev => ({ ...prev, [songId]: !wasLiked }));
        setSongLikes(prev => ({
            ...prev,
            [songId]: Math.max(0, (prev[songId] || 0) + (wasLiked ? -1 : 1))
        }));

        try {
            await axiosInstance.post(`/likes/toggle/${songId}`);
        } catch (err) {
            // Revert on failure
            console.error('Error toggling like:', err);
            setLikedSongs(prev => ({ ...prev, [songId]: wasLiked }));
            setSongLikes(prev => ({
                ...prev,
                [songId]: Math.max(0, (prev[songId] || 0) + (wasLiked ? 1 : -1))
            }));
        }
    }

    const isLiked = (songId) => {
        return likedSongs[songId] || false;
    }

    const getLikeCount = (songId) => {
        return songLikes[songId] || 0;
    }

    // ==================== FOLLOW FUNCTIONALITY ====================

    const toggleFollow = (artistId) => {
        setFollowedArtists(prev => {
            const isCurrentlyFollowing = !prev[artistId];

            // Update follower count based on current state
            setArtistFollowers(prevFollowers => ({
                ...prevFollowers,
                [artistId]: (artistFollowers[artistId] || 0) + (isCurrentlyFollowing ? 1 : -1)
            }));

            return {
                ...prev,
                [artistId]: isCurrentlyFollowing
            };
        });
    }

    const isFollowing = (artistId) => {
        return followedArtists[artistId] || false;
    }

    const getFollowerCount = (artistId) => {
        return artistFollowers[artistId] || 0;
    }

    // Save followed artists to localStorage
    useEffect(() => {
        localStorage.setItem('spotifyFollowedArtists', JSON.stringify(followedArtists));
    }, [followedArtists]);

    // Save artist followers count to localStorage
    useEffect(() => {
        localStorage.setItem('spotifyArtistFollowers', JSON.stringify(artistFollowers));
    }, [artistFollowers]);

    // ==================== PODCAST FOLLOW FUNCTIONALITY ====================

    const togglePodcastFollow = async (podcastId) => {
        if (!isSignedIn) return;

        const isCurrentlyFollowing = followedPodcasts[podcastId] || false;

        // Optimistic update
        setFollowedPodcasts(prev => ({
            ...prev,
            [podcastId]: !isCurrentlyFollowing
        }));
        setPodcastFollowers(prev => ({
            ...prev,
            [podcastId]: Math.max(0, (prev[podcastId] || 0) + (isCurrentlyFollowing ? -1 : 1))
        }));

        try {
            // Note: togglePodcastFollow backend endpoint is a POST that automatically toggles
            await axiosInstance.post(`/podcast-followers/toggle/${podcastId}`);
        } catch (err) {
            // Revert on failure
            console.error('Error toggling podcast follow:', err);
            setFollowedPodcasts(prev => ({
                ...prev,
                [podcastId]: isCurrentlyFollowing
            }));
            setPodcastFollowers(prev => ({
                ...prev,
                [podcastId]: Math.max(0, (prev[podcastId] || 0) + (isCurrentlyFollowing ? 1 : -1))
            }));
        }
    }

    const isPodcastFollowed = (podcastId) => {
        return followedPodcasts[podcastId] || false;
    }

    const getPodcastFollowerCount = (podcastId) => {
        return podcastFollowers[podcastId] || 0;
    }

    const contextValue = {
        // Add state and functions related to the player here
        audioRef,
        seekBg,
        seekBar,
        track,
        setTrack,
        playerState,
        setPlayerState,
        trackProgress,
        setTrackProgress,
        play,
        pause,
        playWithId,
        prevTrack,
        nextTrack,
        seekSong,
        volumeSeek,
        speakerseek,
        volumeBg,
        volumeBar,
        loopSeek,
        toggleLike,
        isLiked,
        getLikeCount,
        fetchLikedTracks,
        toggleFollow,
        isFollowing,
        getFollowerCount,
        activePlaylist,
        activeAlbum,
        activeEpisodeList,
        setActivePlaylist,
        setActiveAlbum,
        setActiveEpisodeList,
        autoAdvance,
        setAutoAdvance,
        playEpisodeWithId,
        followedPodcasts,
        togglePodcastFollow,
        isPodcastFollowed,
        podcastFollowers,
        setPodcastFollowers,
        getPodcastFollowerCount,
        userPlaylists,
        fetchUserPlaylists,
        createPlaylist,
        addTrackToPlaylist
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
}

export { PlayerContext, PlayerContextProvider };