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
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/services/axios";
import { usePodcastStore } from "@/stores/usePodcastStore";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const AddEpisodeDialog = () => {
    const { podcasts, fetchEpisodes } = usePodcastStore();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [newEpisode, setNewEpisode] = useState({
        title: "",
        description: "",
        podcastId: "",
        duration: "",
    });

    const [audioFile, setAudioFile] = useState(null);
    const audioInputRef = useRef(null);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (!audioFile) {
                return toast.error("Please upload an audio file");
            }
            if (!newEpisode.podcastId) {
                return toast.error("Please select a podcast");
            }

            const formData = new FormData();
            formData.append("title", newEpisode.title);
            formData.append("description", newEpisode.description);
            // Backend expects podcast as an object with id property
            formData.append("podcast", JSON.stringify({ id: newEpisode.podcastId }));
            formData.append("duration", newEpisode.duration);
            formData.append("audioFile", audioFile);

            await axiosInstance.post("/admin/episodes", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setNewEpisode({
                title: "",
                description: "",
                podcastId: "",
                duration: "",
            });
            setAudioFile(null);
            setOpen(false);
            toast.success("Episode added successfully");
            fetchEpisodes();
        } catch (error) {
            toast.error("Failed to add episode: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='bg-emerald-500 hover:bg-emerald-600 text-black'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Episode
                </Button>
            </DialogTrigger>
            <DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Add New Episode</DialogTitle>
                    <DialogDescription>Add a new episode to a podcast</DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <input
                        type='file'
                        accept='audio/*'
                        ref={audioInputRef}
                        hidden
                        onChange={(e) => setAudioFile(e.target.files[0])}
                    />

                    {/* Audio Upload Area */}
                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Audio File</label>
                        <div className='flex items-center gap-2'>
                            <Button variant='outline' onClick={() => audioInputRef.current?.click()} className='w-full'>
                                {audioFile ? audioFile.name : "Select Audio File"}
                            </Button>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Podcast Series</label>
                        <Select
                            value={newEpisode.podcastId}
                            onValueChange={(value) => setNewEpisode({ ...newEpisode, podcastId: value })}
                        >
                            <SelectTrigger className='bg-zinc-800 border-zinc-700'>
                                <SelectValue placeholder='Select podcast' />
                            </SelectTrigger>
                            <SelectContent className='bg-zinc-800 border-zinc-700'>
                                {podcasts.map((podcast) => (
                                    <SelectItem key={podcast.id} value={podcast.id}>
                                        {podcast.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Title</label>
                        <Input
                            value={newEpisode.title}
                            onChange={(e) => setNewEpisode({ ...newEpisode, title: e.target.value })}
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Episode Title'
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Duration (seconds)</label>
                        <Input
                            type="number"
                            value={newEpisode.duration}
                            onChange={(e) => setNewEpisode({ ...newEpisode, duration: e.target.value })}
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Duration in seconds'
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Description</label>
                        <Textarea
                            value={newEpisode.description}
                            onChange={(e) => setNewEpisode({ ...newEpisode, description: e.target.value })}
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='Episode Description'
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant='outline' onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Uploading..." : "Add Episode"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
export default AddEpisodeDialog;
