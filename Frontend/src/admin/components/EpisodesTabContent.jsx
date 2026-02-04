import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic2 } from "lucide-react";
import EpisodesTable from "./EpisodesTable";
import AddEpisodeDialog from "./AddEpisodeDialog";
import { usePodcastStore } from "@/stores/usePodcastStore";
import { useEffect } from "react";

const EpisodesTabContent = () => {
    const { fetchEpisodes, fetchPodcasts } = usePodcastStore();

    useEffect(() => {
        fetchEpisodes();
        fetchPodcasts(); // Fetch podcasts to populate the select dropdown in AddEpisodeDialog even if focused on Episodes tab
    }, [fetchEpisodes, fetchPodcasts]);

    return (
        <Card className='bg-zinc-800/50 border-zinc-700/50'>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2'>
                            <Mic2 className='size-5 text-emerald-500' />
                            Episodes Library
                        </CardTitle>
                        <CardDescription>Manage your podcast episodes</CardDescription>
                    </div>
                    <AddEpisodeDialog />
                </div>
            </CardHeader>
            <CardContent>
                <EpisodesTable />
            </CardContent>
        </Card>
    );
};
export default EpisodesTabContent;
