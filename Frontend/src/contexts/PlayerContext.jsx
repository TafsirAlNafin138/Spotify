import { createContext, useEffect, useRef, useState, useCallback } from "react"
import { axiosInstance } from "../services/axios";
import { useAuth } from "../providers/AuthProvider.jsx";

const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
    const { user, loading } = useAuth();
    const isSignedIn = !!user;

    const [songsData, setSongsData] = useState([]);
    const [songsLoading, setSongsLoading] = useState(true);
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

    const playWithId = async (id, options = { preserveAutoAdvance: false }) => {
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

        // Increment play count (fire-and-forget)
        axiosInstance.post(`/tracks/${id}/play`).catch(err =>
            console.error('Failed to increment play count:', err)
        );

        // Wait for audio to be ready, then play
        if (audioRef.current) {
            // The src will be updated by the useEffect in App.jsx that watches track.file
            // We need a small delay for the src to update
            setTimeout(async () => {
                try {
                    await audioRef.current.play();
                    setPlayerState(true);
                } catch (err) {
                    console.error('Play failed:', err);
                }
            }, 100);
        }

        setTrackProgress({
            currentTime: { seconds: 0, minutes: 0 },
            duration: { seconds: 0, minutes: 0 }
        });
        if (seekBar.current) seekBar.current.style.width = `0%`;
        if (seekBg.current) seekBg.current.style.width = `0%`;
    }

    const prevTrack = () => {
        // Use activePlaylist (e.g. album tracks) if available, otherwise fall back to global songsData
        const playlist = activePlaylist?.tracks?.length > 0 ? activePlaylist.tracks : activeAlbum?.tracks?.length > 0 ? activeAlbum.tracks : songsData;
        if (playlist.length === 0) return;
        const currentIndex = playlist.findIndex(s => s.id === track.id);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = playlist.length - 1;
        playWithId(playlist[prevIndex].id, { preserveAutoAdvance: true });
    }

    const nextTrack = (isAutoAdvance = false) => {
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
    }, [isSignedIn]);

    useEffect(() => {
        fetchLikedTracks();
    }, [fetchLikedTracks]);

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
        setActivePlaylist,
        setActiveAlbum,
        autoAdvance,
        setAutoAdvance
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
}

export { PlayerContext, PlayerContextProvider };