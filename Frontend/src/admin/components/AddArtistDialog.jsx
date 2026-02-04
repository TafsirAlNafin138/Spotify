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
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/services/axios";
import { useArtistStore } from "@/stores/useArtistStore";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const AddArtistDialog = () => {
    const { fetchArtists } = useArtistStore();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [newArtist, setNewArtist] = useState({
        ImageFile: null,
        name: "",
        bio: "",
    });

    const [imageFile, setImageFile] = useState(null);
    const imageInputRef = useRef(null);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (!imageFile) {
                return toast.error("Please upload an artist image");
            }
            if (!newArtist.name) {
                return toast.error("Please enter artist name");
            }

            const formData = new FormData();
            formData.append("name", newArtist.name);
            formData.append("bio", newArtist.bio);
            formData.append("imageFile", imageFile);

            await axiosInstance.post("/admin/artists", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setNewArtist({
                ...newArtist,
                ImageFile: imageFile
            });
            setImageFile(null);
            setOpen(false);
            toast.success("Artist added successfully");
            fetchArtists();
        } catch (error) {
            toast.error("Failed to add artist: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='bg-violet-500 hover:bg-violet-600 text-white'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Artist
                </Button>
            </DialogTrigger>
            <DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Add New Artist</DialogTitle>
                    <DialogDescription>Add a new artist to your db</DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <input
                        type='file'
                        accept='image/*'
                        ref={imageInputRef}
                        hidden
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setImageFile(file);
                                setNewArtist({ ...newArtist, ImageFile: file });
                            }
                        }}
                    />

                    {/* Image Upload Area */}
                    <div
                        className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-violet-500 transition-colors'
                        onClick={() => imageInputRef.current?.click()}
                    >
                        <div className='text-center'>
                            {imageFile ? (
                                <div className='text-sm text-green-500'>Image selected: {imageFile.name}</div>
                            ) : (
                                <>
                                    <div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
                                        <Upload className='h-6 w-6 text-zinc-400' />
                                    </div>
                                    <div className='text-sm text-zinc-400 mb-2'>Upload Artist Image</div>
                                    <Button variant='outline' size='sm' className='text-xs'>
                                        Choose File
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Name</label>
                        <Input
                            value={newArtist.name}
                            onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Artist Name'
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Bio</label>
                        <Textarea
                            value={newArtist.bio}
                            onChange={(e) => setNewArtist({ ...newArtist, bio: e.target.value })}
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Artist Biography'
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant='outline' onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-violet-500 hover:bg-violet-600">
                        {isLoading ? "Uploading..." : "Add Artist"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
export default AddArtistDialog;
