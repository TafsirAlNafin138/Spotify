import { createContext, useEffect, useRef, useState } from "react"
import { songsData } from "../assets/assets";
const PlayerContext = createContext();

const PlayerContextProvider = (props) => {

    const [track, setTrack] = useState(songsData[0]);
    const [playerState, setPlayerState] = useState(false); // false - paused, true - playing
    const[trackProgress, setTrackProgress] = useState({  // song player progress in seconds and minutes
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


    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();
    const volumeBg = useRef();
    const volumeBar = useRef();


//     const fetchSong = async (id) => {
//   const res = await fetch(`/api/songs/${id}`);
//   return await res.json();
// };

// const playWithId = async (id) => {
//   const song = await fetchSong(id);
//   setTrack(song);
//   audioRef.current.src = song.url; // set new source
//   await new Promise((resolve) => {
//     audioRef.current.onloadedmetadata = resolve;
//   });
//   await audioRef.current.play();
//   setPlayerState(true);
// };
   
//    const parsetimeStringToSeconds = (str) => {
//      const parts = str.split(":").map(Number);
//      if (parts.length === 1) return parts[0] || 0;
//      if (parts.length === 2) return parts[0] * 60 + (parts[1] || 0);
//      const [h, m, s] = parts.slice(-3);
//      return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
//    };

    const playWithId = async (id) => {
            setTrack(songsData[id]);
            await audioRef.current.play();
            setTrackProgress({
                currentTime: {
                    seconds: 0,
                    minutes: 0
                },
                duration: {
                    seconds: 0,
                    minutes: 0
                }
            });
            seekBar.current.style.width = `0%`;
            seekBg.current.style.width = `0%`;
            setPlayerState(true);
        }
    const prevTrack = () => {
        let prevId = track.id - 1;
        if (prevId < 0) prevId = songsData.length - 1;
        playWithId(prevId);
    }  
    const nextTrack = () => {
        let nextId = track.id + 1;
        if (nextId >= songsData.length) nextId = 0;
        playWithId(nextId);
    }  


    const seekSong = async (e) => {
        if (!seekBg.current || !audioRef.current) return;

//         if (isNaN(audioRef.current.duration)) {
//     await new Promise((res) => {
//       audioRef.current.onloadedmetadata = res;
//     });
//   }
        
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
        loopSeek
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
}

export { PlayerContext, PlayerContextProvider };