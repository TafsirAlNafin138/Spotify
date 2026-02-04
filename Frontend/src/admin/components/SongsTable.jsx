import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Calendar, Trash2 } from "lucide-react";
import { useEffect } from "react";

const SongsTable = () => {
    const { songs, isLoading, error, deleteSong, fetchSongs } = useMusicStore();

    useEffect(() => {
        fetchSongs();
    }, [fetchSongs]);

    if (isLoading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='text-zinc-400'>Loading songs...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='text-red-400'>{error}</div>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className='hover:bg-zinc-800/50'>
                    <TableHead className='w-[50px]'></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {songs.map((song) => (
                    <TableRow key={song.id} className='hover:bg-zinc-800/50'>
                        <TableCell>
                            <img src={song.image || song.imageUrl} alt={song.name || song.title} className='size-10 rounded object-cover' />
                        </TableCell>
                        <TableCell className='font-medium text-zinc-200'>{song.name || song.title}</TableCell>
                        <TableCell className='text-zinc-200'><b>{song.artists.join(", ")}</b></TableCell>
                        <TableCell>
                            <span className='inline-flex items-center gap-1 text-zinc-400'>
                                <Calendar className='h-4 w-4' />
                                {(song.createdAt || song.created_at || "").toString().split("T")[0]}
                            </span>
                        </TableCell>

                        <TableCell className='text-right'>
                            <div className='flex gap-2 justify-end'>
                                <Button
                                    variant={"ghost"}
                                    size={"sm"}
                                    className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
                                    onClick={() => deleteSong(song.id)}
                                >
                                    <Trash2 className='size-4' />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
export default SongsTable;
