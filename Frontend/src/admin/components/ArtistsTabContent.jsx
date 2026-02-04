import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import ArtistsTable from "./ArtistsTable";
import AddArtistDialog from "./AddArtistDialog";
import { useArtistStore } from "@/stores/useArtistStore";
import { useEffect } from "react";

const ArtistsTabContent = () => {
    const { fetchArtists } = useArtistStore();

    useEffect(() => {
        fetchArtists();
    }, [fetchArtists]);

    return (
        <Card className='bg-zinc-800/50 border-zinc-700/50'>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2'>
                            <Users className='size-5 text-violet-500' />
                            Artists Library
                        </CardTitle>
                        <CardDescription>Manage your artists</CardDescription>
                    </div>
                    <AddArtistDialog />
                </div>
            </CardHeader>
            <CardContent>
                <ArtistsTable />
            </CardContent>
        </Card>
    );
};
export default ArtistsTabContent;
