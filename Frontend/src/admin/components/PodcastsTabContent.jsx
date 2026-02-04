import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic } from "lucide-react";
import PodcastsTable from "./PodcastsTable";
import AddPodcastDialog from "./AddPodcastDialog";
import { usePodcastStore } from "@/stores/usePodcastStore";
import { useEffect } from "react";

const PodcastsTabContent = () => {
    const { fetchPodcasts } = usePodcastStore();

    useEffect(() => {
        fetchPodcasts();
    }, [fetchPodcasts]);

    return (
        <Card className='bg-zinc-800/50 border-zinc-700/50'>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2'>
                            <Mic className='size-5 text-emerald-500' />
                            Podcasts Library
                        </CardTitle>
                        <CardDescription>Manage your podcasts</CardDescription>
                    </div>
                    <AddPodcastDialog />
                </div>
            </CardHeader>
            <CardContent>
                <PodcastsTable />
            </CardContent>
        </Card>
    );
};
export default PodcastsTabContent;
