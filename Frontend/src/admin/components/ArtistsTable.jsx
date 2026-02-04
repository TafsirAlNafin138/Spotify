import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useArtistStore } from "@/stores/useArtistStore";
import { Trash2 } from "lucide-react";

const ArtistsTable = () => {
    const { artists, isLoading, error, deleteArtist } = useArtistStore();

    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center py-12 gap-3'>
                <div className='size-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
                <div className='text-zinc-400 text-sm font-medium'>Loading artists...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex items-center justify-center py-12'>
                <div className='bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium'>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 overflow-hidden backdrop-blur-sm">
            <Table>
                <TableHeader className="bg-zinc-800/40">
                    <TableRow className='hover:bg-transparent border-zinc-800/50'>
                        <TableHead className='w-[70px] py-4'></TableHead>
                        <TableHead className="text-zinc-400 font-semibold uppercase text-[11px] tracking-wider">Name</TableHead>
                        <TableHead className="text-zinc-400 font-semibold uppercase text-[11px] tracking-wider">Bio</TableHead>
                        <TableHead className='text-right text-zinc-400 font-semibold uppercase text-[11px] tracking-wider pr-6'>Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {artists.map((artist) => (
                        <TableRow key={artist.id} className='hover:bg-zinc-800/30 transition-colors border-zinc-800/50'>
                            <TableCell>
                                <img
                                    src={artist.image || artist.imageUrl}
                                    alt={artist.name}
                                    className='size-12 rounded-full object-cover border border-zinc-700/50'
                                />
                            </TableCell>
                            <TableCell className='font-medium text-zinc-200'><b>{artist.name}</b></TableCell>
                            <TableCell className='max-w-xs truncate text-zinc-400'>{artist.bio}</TableCell>

                            <TableCell className='text-right'>
                                <div className='flex gap-2 justify-end'>
                                    <Button
                                        variant={"ghost"}
                                        size={"sm"}
                                        className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
                                        onClick={() => deleteArtist(artist.id)}
                                    >
                                        <Trash2 className='size-4' />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
export default ArtistsTable;