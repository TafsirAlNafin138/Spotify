import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/services/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { useArtistStore } from "@/stores/useArtistStore";
import { useGenreStore } from "@/stores/useGenreStore";
import { Plus, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const AddSongDialog = () => {
    const { albums, fetchSongs, fetchAlbums } = useMusicStore();
    const { artists } = useArtistStore();
    const { genres } = useGenreStore();
    const [songDialogOpen, setSongDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchAlbums();
    }, [fetchAlbums]);

    const [newSong, setNewSong] = useState({
        title: "",
        artistId: [],
        genreId: [],
        album: "",
        duration: "0",
    });

    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);

    const audioInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleAudioSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            if (!audioFile || !imageFile) {
                return toast.error("Please upload both audio and image files");
            }
            if (!newSong.artistId || newSong.artistId.length === 0) {
                return toast.error("Please select at least one artist");
            }
            if (!newSong.genreId || newSong.genreId.length === 0) {
                return toast.error("Please select at least one genre");
            }

            const formData = new FormData();
            formData.append("name", newSong.title);
            formData.append("duration", newSong.duration);
            if (newSong.album && newSong.album !== "none") {
                formData.append("album_id", newSong.album);
            }

            // Handle Artist and Genre as JSON strings for backend array processing
            const artistsData = newSong.artistId.map((id, index) => ({
                id: parseInt(id),
                is_primary: index === 0 // First artist is primary
            }));
            formData.append("artists", JSON.stringify(artistsData));

            const genresData = newSong.genreId.map(id => ({ id: parseInt(id) }));
            formData.append("genres", JSON.stringify(genresData));

            formData.append("audio", audioFile);
            formData.append("imageFile", imageFile);

            await axiosInstance.post("/admin/tracks", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setNewSong({
                title: "",
                artistId: [],
                genreId: [],
                album: "",
                duration: "0",
            });
            setImageFile(null);
            setAudioFile(null);
            setSongDialogOpen(false);
            toast.success("Song added successfully");

            // Refresh the songs list
            fetchSongs();
        } catch (error) {
            toast.error("Failed to add song: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
            <DialogTrigger asChild>
                <Button className='bg-emerald-500 hover:bg-emerald-600 text-black'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Song
                </Button>
            </DialogTrigger>
            <DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Add New Song</DialogTitle>
                    <DialogDescription>Add a new song to your library</DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <input
                        type='file'
                        accept='audio/*'
                        ref={audioInputRef}
                        hidden
                        onChange={handleAudioSelect}
                    />
                    <input
                        type='file'
                        accept='image/*'
                        ref={imageInputRef}
                        hidden
                        onChange={handleImageSelect}
                    />

                    {/* Image Upload Area */}
                    <div
                        className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
                        onClick={() => imageInputRef.current?.click()}
                    >
                        <div className='text-center'>
                            <div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
                                <Upload className='h-6 w-6 text-zinc-400' />
                            </div>
                            <div className='text-sm text-zinc-400 mb-2'>
                                {imageFile ? imageFile.name : "Upload artwork"}
                            </div>
                            <Button variant='outline' size='sm' className='text-xs'>
                                Choose File
                            </Button>
                        </div>
                    </div>

                    {/* Audio Upload Area */}
                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Audio File</label>
                        <div className='flex items-center gap-2'>
                            <Button variant='outline' onClick={() => audioInputRef.current?.click()} className='w-full'>
                                {audioFile ? audioFile.name : "Select Audio File"}
                            </Button>
                        </div>
                    </div>

                    {/* Other Fields */}
                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Title</label>
                        <Input
                            value={newSong.title}
                            onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Enter song title'
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Artists (Click to select multiple)</label>
                        <div className='grid grid-cols-2 gap-2 p-3 bg-zinc-800 border border-zinc-700 rounded-md max-h-40 overflow-y-auto'>
                            {artists.map((artist) => (
                                <label key={artist.id} className='flex items-center space-x-2 cursor-pointer hover:bg-zinc-700 p-2 rounded'>
                                    <input
                                        type='checkbox'
                                        checked={Array.isArray(newSong.artistId) && newSong.artistId.includes(artist.id.toString())}
                                        onChange={(e) => {
                                            const artistIds = newSong.artistId || [];
                                            if (e.target.checked) {
                                                setNewSong({ ...newSong, artistId: [...artistIds, artist.id.toString()] });
                                            } else {
                                                setNewSong({ ...newSong, artistId: artistIds.filter(id => id !== artist.id.toString()) });
                                            }
                                        }}
                                        className='w-4 h-4'
                                    />
                                    <span className='text-sm'>{artist.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Genres (Click to select multiple)</label>
                        <div className='grid grid-cols-2 gap-2 p-3 bg-zinc-800 border border-zinc-700 rounded-md max-h-40 overflow-y-auto'>
                            {genres.map((genre) => (
                                <label key={genre.id} className='flex items-center space-x-2 cursor-pointer hover:bg-zinc-700 p-2 rounded'>
                                    <input
                                        type='checkbox'
                                        checked={Array.isArray(newSong.genreId) && newSong.genreId.includes(genre.id.toString())}
                                        onChange={(e) => {
                                            const genreIds = newSong.genreId || [];
                                            if (e.target.checked) {
                                                setNewSong({ ...newSong, genreId: [...genreIds, genre.id.toString()] });
                                            } else {
                                                setNewSong({ ...newSong, genreId: genreIds.filter(id => id !== genre.id.toString()) });
                                            }
                                        }}
                                        className='w-4 h-4'
                                    />
                                    <span className='text-sm'>{genre.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Album (Optional)</label>
                        <Select
                            value={newSong.album}
                            onValueChange={(value) => setNewSong({ ...newSong, album: value })}
                        >
                            <SelectTrigger className='bg-zinc-800 border-zinc-700'>
                                <SelectValue placeholder='Select album' />
                            </SelectTrigger>
                            <SelectContent className='bg-zinc-800 border-zinc-700'>
                                <SelectItem value='none'>No Album (Single)</SelectItem>
                                {albums && albums.length > 0 && albums.map((album) => (
                                    <SelectItem key={album.id} value={album.id}>
                                        {album.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Duration (Seconds)</label>
                        <Input
                            type="number"
                            min="0"
                            value={newSong.duration}
                            onChange={(e) => setNewSong({ ...newSong, duration: e.target.value })}
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Enter duration in seconds'
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant={'outline'} onClick={() => setSongDialogOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Uploading..." : "Add Song"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
export default AddSongDialog;
