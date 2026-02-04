import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";
import GenresTable from "./GenresTable";
import AddGenreDialog from "./AddGenreDialog";
import { useGenreStore } from "@/stores/useGenreStore";
import { useEffect } from "react";

const GenresTabContent = () => {
    const { fetchGenres } = useGenreStore();

    useEffect(() => {
        fetchGenres();
    }, [fetchGenres]);

    return (
        <Card className='bg-zinc-800/50 border-zinc-700/50'>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2'>
                            <Layers className='size-5 text-emerald-500' />
                            Genres Library
                        </CardTitle>
                        <CardDescription>Manage your music genres</CardDescription>
                    </div>
                    <AddGenreDialog />
                </div>
            </CardHeader>
            <CardContent>
                <GenresTable />
            </CardContent>
        </Card>
    );
};
export default GenresTabContent;
