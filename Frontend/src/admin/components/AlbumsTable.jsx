import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Calendar, Music, Trash2 } from "lucide-react";
import { useEffect } from "react";

const AlbumsTable = () => {
    const { albums, deleteAlbum, fetchAlbums } = useMusicStore();

    useEffect(() => {
        fetchAlbums();
    }, [fetchAlbums]);

    return (
        <Table>
            <TableHeader>
                <TableRow className='hover:bg-zinc-800/50 border-zinc-800'>
                    <TableHead className='w-[50px] text-zinc-400'></TableHead>
                    <TableHead className='text-zinc-300'>Title</TableHead>
                    <TableHead className='text-zinc-300'>Artist</TableHead>
                    <TableHead className='text-zinc-300'>Release Year</TableHead>
                    <TableHead className='text-zinc-300'>Songs</TableHead>
                    <TableHead className='text-right text-zinc-300'>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {albums.map((album) => (
                    <TableRow key={album.id} className='hover:bg-zinc-800/50 border-zinc-800/50'>
                        <TableCell>
                            <img src={album.image} alt={album.name} className='w-10 h-10 rounded object-cover' />
                        </TableCell>
                        <TableCell className='font-medium text-zinc-100'>{album.name}</TableCell>
                        <TableCell className='text-zinc-200'><b>{album.artists} </b></TableCell>
                        <TableCell>
                            <span className='inline-flex items-center gap-1 text-zinc-400'>
                                <Calendar className='h-4 w-4' />
                                {album.created_at?.split("T")[0].split("-")[0]}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className='inline-flex items-center gap-1 text-zinc-400'>
                                <Music className='h-4 w-4' />
                                {album.totalTracks || 0} songs
                            </span>
                        </TableCell>
                        <TableCell className='text-right'>
                            <div className='flex gap-2 justify-end'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => deleteAlbum(album.id)}
                                    className='text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors'
                                >
                                    <Trash2 className='h-4 w-4' />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
export default AlbumsTable;
