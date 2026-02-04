import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePodcastStore } from "@/stores/usePodcastStore";
import { Trash2 } from "lucide-react";

const PodcastsTable = () => {
    const { podcasts, isLoading, error, deletePodcast } = usePodcastStore();

    if (isLoading) {
        return (
            <div className='flex items-center justify-center py-12'>
                <div className='size-8 border-2 border-t-transparent border-emerald-500 rounded-full animate-spin' />
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex items-center justify-center py-12'>
                <div className='text-red-400 bg-red-400/10 px-4 py-2 rounded-md border border-red-400/20'>{error}</div>
            </div>
        );
    }

    return (
        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden'>
            <Table>
                <TableHeader className='bg-zinc-800/30'>
                    <TableRow className='hover:bg-transparent border-zinc-800/50'>
                        <TableHead className='w-[60px]'></TableHead>
                        <TableHead className='font-medium text-zinc-400'>Title</TableHead>
                        <TableHead className='font-medium text-zinc-400'>Host</TableHead>
                        <TableHead className='font-medium text-zinc-400'>Description</TableHead>
                        <TableHead className='text-right font-medium text-zinc-400'>Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {podcasts.map((podcast) => (
                        <TableRow key={podcast.id} className='hover:bg-zinc-800/50 border-zinc-800/50'>
                            <TableCell>
                                <img src={podcast.cover_image} alt={podcast.title} className='size-10 rounded object-cover' />
                            </TableCell>
                            <TableCell className='font-medium text-zinc-100'>{podcast.title}</TableCell>
                            <TableCell className='text-zinc-200'>{podcast.host_name}</TableCell>
                            <TableCell className='max-w-xs truncate text-zinc-300'>{podcast.description}</TableCell>

                            <TableCell className='text-right'>
                                <div className='flex gap-2 justify-end'>
                                    <Button
                                        variant={"ghost"}
                                        size={"sm"}
                                        className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
                                        onClick={() => deletePodcast(podcast.id)}
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
export default PodcastsTable;
