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
import { axiosInstance } from "@/services/axios";
import { useArtistStore } from "@/stores/useArtistStore";
import { useGenreStore } from "@/stores/useGenreStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const AddAlbumDialog = () => {
    const { artists } = useArtistStore();
    const { genres } = useGenreStore();
    const { fetchAlbums } = useMusicStore();
    const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [newAlbum, setNewAlbum] = useState({
        title: "",
        artistId: [],
        genreId: [],
    });

    const [imageFile, setImageFile] = useState(null);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setNewAlbum({ ...newAlbum, imageFile: file });
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            if (!imageFile) {
                return toast.error("Please upload an image");
            }
            if (!newAlbum.artistId || newAlbum.artistId.length === 0) {
                return toast.error("Please select at least one artist");
            }

            const formData = new FormData();
            formData.append("name", newAlbum.title); // Backend expects 'name'
            formData.append("imageFile", imageFile);

            // Handle Artist and Genre as JSON strings - map array of IDs to objects
            const artistsData = newAlbum.artistId.map((id, index) => ({
                id: parseInt(id),
                is_primary: index === 0 // First artist is primary
            }));
            formData.append("artists", JSON.stringify(artistsData));

            if (newAlbum.genreId && newAlbum.genreId.length > 0) {
                const genresData = newAlbum.genreId.map(id => ({ id: parseInt(id) }));
                formData.append("genres", JSON.stringify(genresData));
            }

            await axiosInstance.post("/admin/albums", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setNewAlbum({
                title: "",
                artistId: [],
                genreId: []
            });
            setImageFile(null);
            setAlbumDialogOpen(false);
            fetchAlbums();
            toast.success("Album created successfully");
        } catch (error) {
            toast.error("Failed to create album: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
            <DialogTrigger asChild>
                <Button className='bg-violet-500 hover:bg-violet-600 text-white'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Album
                </Button>
            </DialogTrigger>
            <DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Add New Album</DialogTitle>
                    <DialogDescription>Add a new album to your collection</DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                    <input
                        type='file'
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept='image/*'
                        className='hidden'
                    />
                    <div
                        className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className='text-center'>
                            <div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
                                <Upload className='h-6 w-6 text-zinc-400' />
                            </div>
                            <div className='text-sm text-zinc-400 mb-2'>
                                {imageFile ? imageFile.name : "Upload album artwork"}
                            </div>
                            <Button variant='outline' size='sm' className='text-xs'>
                                Choose File
                            </Button>
                        </div>
                    </div>
                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Album Title</label>
                        <Input
                            value={newAlbum.title}
                            onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Enter album title'
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Artists (Click to select multiple)</label>
                        <div className='grid grid-cols-2 gap-2 p-3 bg-zinc-800 border border-zinc-700 rounded-md max-h-40 overflow-y-auto'>
                            {artists.map((artist) => (
                                <label key={artist.id} className='flex items-center space-x-2 cursor-pointer hover:bg-zinc-700 p-2 rounded'>
                                    <input
                                        type='checkbox'
                                        checked={Array.isArray(newAlbum.artistId) && newAlbum.artistId.includes(artist.id.toString())}
                                        onChange={(e) => {
                                            const artistIds = newAlbum.artistId || [];
                                            if (e.target.checked) {
                                                setNewAlbum({ ...newAlbum, artistId: [...artistIds, artist.id.toString()] });
                                            } else {
                                                setNewAlbum({ ...newAlbum, artistId: artistIds.filter(id => id !== artist.id.toString()) });
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
                                        checked={Array.isArray(newAlbum.genreId) && newAlbum.genreId.includes(genre.id.toString())}
                                        onChange={(e) => {
                                            const genreIds = newAlbum.genreId || [];
                                            if (e.target.checked) {
                                                setNewAlbum({ ...newAlbum, genreId: [...genreIds, genre.id.toString()] });
                                            } else {
                                                setNewAlbum({ ...newAlbum, genreId: genreIds.filter(id => id !== genre.id.toString()) });
                                            }
                                        }}
                                        className='w-4 h-4'
                                    />
                                    <span className='text-sm'>{genre.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant='outline' onClick={() => setAlbumDialogOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className='bg-violet-500 hover:bg-violet-600'
                        disabled={isLoading || !newAlbum.imageFile || !newAlbum.title || !newAlbum.artistId || newAlbum.artistId.length === 0}
                    >
                        {isLoading ? "Creating..." : "Add Album"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
export default AddAlbumDialog;
