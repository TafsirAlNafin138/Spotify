import { createContext, useEffect, useRef, useState } from "react"
import { songsData } from "../assets/assets";
const PlayerContext = createContext();

const PlayerContextProvider = (props) => {

    const [track, setTrack] = useState(songsData[1]);
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
    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();


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
        seekSong
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
}

export { PlayerContext, PlayerContextProvider };