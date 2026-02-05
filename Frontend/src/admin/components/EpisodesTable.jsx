import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePodcastStore } from "@/stores/usePodcastStore";
import { Trash2, PlayCircle } from "lucide-react";

const EpisodesTable = () => {
    const { episodes, isLoading, error, deleteEpisode, podcasts } = usePodcastStore();

    if (isLoading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='text-zinc-400'>Loading episodes...</div>
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
                    <TableHead>Podcast</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {episodes.map((episode) => (
                    <TableRow key={episode.id} className='hover:bg-zinc-800/50'>
                        <TableCell>
                            <div className='flex items-center justify-center bg-zinc-800 rounded p-2'>
                                <PlayCircle className='size-5 text-emerald-500' />
                            </div>
                        </TableCell>
                        <TableCell className='font-medium text-zinc-100'>{episode.title}</TableCell>
                        <TableCell className='text-zinc-200'><b>{episode.podcastName}</b></TableCell>
                        <TableCell className='text-zinc-400'>
                            {(episode.release_date || "").toString().split("T")[0]}
                        </TableCell>

                        <TableCell className='text-right'>
                            <div className='flex gap-2 justify-end'>
                                <Button
                                    variant={"ghost"}
                                    size={"sm"}
                                    className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
                                    onClick={() => deleteEpisode(episode.podcast_id, episode.id)}
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
export default EpisodesTable;
