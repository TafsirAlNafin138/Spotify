import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGenreStore } from "@/stores/useGenreStore";
import { Trash2, Loader2 } from "lucide-react";

const GenresTable = () => {
    const { genres, isLoading, error, deleteGenre } = useGenreStore();

    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center py-16 gap-3'>
                <Loader2 className='size-8 text-emerald-500 animate-spin' />
                <div className='text-zinc-500 text-sm font-medium'>Loading genres...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex items-center justify-center py-12'>
                <div className='text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20 text-sm'>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className='rounded-xl border border-zinc-800/50 bg-zinc-900/20 overflow-hidden'>
            <Table>
                <TableHeader className='bg-zinc-800/30'>
                    <TableRow className='hover:bg-transparent border-zinc-800/50'>
                        <TableHead className='w-[60%] font-semibold text-zinc-400 py-4'>Title</TableHead>
                        <TableHead className='font-semibold text-zinc-400 py-4'>Color</TableHead>
                        <TableHead className='text-right font-semibold text-zinc-400 py-4'>Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {genres.map((genre) => (
                        <TableRow key={genre.id} className='hover:bg-zinc-800/50 border-zinc-800/50'>
                            <TableCell className='font-medium text-zinc-100'>{genre.name || genre.title}</TableCell>
                            <TableCell>
                                <div
                                    className='w-6 h-6 rounded-full'
                                    style={{ backgroundColor: `${genre.theme_color}` || "#10b981" }}
                                />
                            </TableCell>

                            <TableCell className='text-right'>
                                <div className='flex gap-2 justify-end'>
                                    <Button
                                        variant={"ghost"}
                                        size={"sm"}
                                        className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
                                        onClick={() => deleteGenre(genre.id)}
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
export default GenresTable;