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
import { useGenreStore } from "@/stores/useGenreStore";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const AddGenreDialog = () => {
    const { fetchGenres } = useGenreStore();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [newGenre, setNewGenre] = useState({
        name: "",
        theme_color: "#10b981", // Default emerald green
    });

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", newGenre.name);
            formData.append("theme_color", newGenre.theme_color);

            await axiosInstance.post("/admin/genres", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setNewGenre({
                name: "",
                theme_color: "#10b981",
            });
            setOpen(false);
            toast.success("Genre added successfully");
            fetchGenres();
        } catch (error) {
            toast.error("Failed to add genre: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='bg-emerald-500 hover:bg-emerald-600 text-black'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Genre
                </Button>
            </DialogTrigger>
            <DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Add New Genre</DialogTitle>
                    <DialogDescription>Add a new genre category</DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Genre Title</label>
                        <Input
                            value={newGenre.name}
                            onChange={(e) => setNewGenre({ ...newGenre, name: e.target.value })}
                            className='bg-zinc-800 border-zinc-700'
                            placeholder='e.g., Rock, Pop, Jazz'
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium'>Theme Color</label>
                        <div className='flex items-center gap-2'>
                            <input
                                type='color'
                                value={newGenre.theme_color}
                                onChange={(e) => setNewGenre({ ...newGenre, theme_color: e.target.value })}
                                className='bg-transparent border-none w-10 h-10 cursor-pointer'
                            />
                            <span className='text-sm text-zinc-400'>{newGenre.theme_color}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant='outline' onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Uploading..." : "Add Genre"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
export default AddGenreDialog;
