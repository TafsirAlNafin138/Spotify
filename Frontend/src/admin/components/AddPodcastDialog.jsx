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
import { usePodcastStore } from "@/stores/usePodcastStore";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const AddPodcastDialog = () => {
    const { fetchPodcasts } = usePodcastStore();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [newPodcast, setNewPodcast] = useState({
        title: "",
        description: "",
        host: "",
    });

    const [imageFile, setImageFile] = useState(null);
    const imageInputRef = useRef(null);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (!imageFile) {
                return toast.error("Please upload a cover image");
            }

            const formData = new FormData();
            formData.append("title", newPodcast.title);
            formData.append("description", newPodcast.description);
            formData.append("host", newPodcast.host);
            formData.append("imageFile", imageFile);

            await axiosInstance.post("/admin/podcasts", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setNewPodcast({
                title: "",
                description: "",
                host: "",
            });
            setImageFile(null);
            setOpen(false);
            toast.success("Podcast created successfully");
            fetchPodcasts();
        } catch (error) {
            toast.error("Failed to create podcast: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='bg-emerald-500 hover:bg-emerald-600 text-black'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Podcast
                </Button>
            </DialogTrigger>
            <DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Add New Podcast</DialogTitle>
                    <DialogDescription>Create a new podcast series</DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <input
                        type='file'
                        accept='image/*'
                        ref={imageInputRef}
                        hidden
                        onChange={(e) => setImageFile(e.target.files[0])}
                    />

                    {/* Image Upload Area */}
                    <div
                        className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors'
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
                                    <div className='text-sm text-zinc-400 mb-2'>Upload Cover Art</div>
                                    <Button variant='outline' size='sm' className='text-xs'>
                                        Choose File
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Title</label>
                        <Input
                            value={newPodcast.title}
                            onChange={(e) => setNewPodcast({ ...newPodcast, title: e.target.value })}
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Podcast Title'
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Host</label>
                        <Input
                            value={newPodcast.host}
                            onChange={(e) => setNewPodcast({ ...newPodcast, host: e.target.value })}
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Host Name'
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Description</label>
                        <Textarea
                            value={newPodcast.description}
                            onChange={(e) => setNewPodcast({ ...newPodcast, description: e.target.value })}
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Podcast Description'
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant='outline' onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Podcast"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
export default AddPodcastDialog;
