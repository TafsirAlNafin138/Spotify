import { useAuthStore } from "@/stores/useAuthStore";
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import { Album, Music, Mic, Layers, Play, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SongsTabContent from "./components/SongsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";
import PodcastsTabContent from "./components/PodcastsTabContent";
import EpisodesTabContent from "./components/EpisodesTabContent";
import GenresTabContent from "./components/GenresTabContent";
import ArtistsTabContent from "./components/ArtistsTabContent";
import { useEffect } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePodcastStore } from "@/stores/usePodcastStore";
import { useGenreStore } from "@/stores/useGenreStore";
import { useArtistStore } from "@/stores/useArtistStore";

const AdminPage = () => {
    const { isAdmin, isLoading, checkAdminStatus } = useAuthStore();

    const { fetchAlbums, fetchSongs, fetchStats } = useMusicStore();
    const { fetchPodcasts, fetchEpisodes } = usePodcastStore();
    const { fetchGenres } = useGenreStore();
    const { fetchArtists } = useArtistStore();

    useEffect(() => {
        checkAdminStatus();
        fetchAlbums();
        fetchSongs();
        fetchStats();
        fetchPodcasts();
        fetchEpisodes();
        fetchGenres();
        fetchArtists();
    }, [fetchAlbums, fetchSongs, fetchStats, checkAdminStatus, fetchPodcasts, fetchEpisodes, fetchGenres, fetchArtists]);

    if (isLoading) return <div className="text-white">Loading...</div>;
    if (!isAdmin) return <div className="text-white">Unauthorized</div>;

    return (
        <div
            className='min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900
   to-black text-zinc-100 p-8'
        >
            <Header />

            <DashboardStats />

            <Tabs defaultValue='songs' className='space-y-6'>
                <TabsList className='p-1 bg-zinc-800/50'>
                    <TabsTrigger value='songs' className='data-[state=active]:bg-zinc-700'>
                        <Music className='mr-2 size-4' />
                        Songs
                    </TabsTrigger>
                    <TabsTrigger value='albums' className='data-[state=active]:bg-zinc-700'>
                        <Album className='mr-2 size-4' />
                        Albums
                    </TabsTrigger>
                    <TabsTrigger value='podcasts' className='data-[state=active]:bg-zinc-700'>
                        <Mic className='mr-2 size-4' />
                        Podcasts
                    </TabsTrigger>
                    <TabsTrigger value='episodes' className='data-[state=active]:bg-zinc-700'>
                        <Play className='mr-2 size-4' />
                        Episodes
                    </TabsTrigger>
                    <TabsTrigger value='genres' className='data-[state=active]:bg-zinc-700'>
                        <Layers className='mr-2 size-4' />
                        Genres
                    </TabsTrigger>
                    <TabsTrigger value='artists' className='data-[state=active]:bg-zinc-700'>
                        <Users className='mr-2 size-4' />
                        Artists
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='songs'>
                    <SongsTabContent />
                </TabsContent>
                <TabsContent value='albums'>
                    <AlbumsTabContent />
                </TabsContent>
                <TabsContent value='podcasts'>
                    <PodcastsTabContent />
                </TabsContent>
                <TabsContent value='episodes'>
                    <EpisodesTabContent />
                </TabsContent>
                <TabsContent value='genres'>
                    <GenresTabContent />
                </TabsContent>
                <TabsContent value='artists'>
                    <ArtistsTabContent />
                </TabsContent>
            </Tabs>
        </div>
    );
};
export default AdminPage;