import { useMusicStore } from "@/stores/useMusicStore";
import { Library, ListMusic, Users2, Layers, Mic } from "lucide-react";
import StatsCard from "./StatsCard";

const DashboardStats = () => {
    const { stats } = useMusicStore();

    const statsData = [
        {
            icon: ListMusic,
            label: "Total Songs",
            value: String(stats.totalSongs),
            bgColor: "bg-emerald-500/10",
            iconColor: "text-emerald-500",
        },
        {
            icon: Library,
            label: "Total Albums",
            value: String(stats.totalAlbums),
            bgColor: "bg-violet-500/10",
            iconColor: "text-violet-500",
        },
        {
            icon: Users2,
            label: "Total Artists",
            value: String(stats.totalArtists),
            bgColor: "bg-orange-500/10",
            iconColor: "text-orange-500",
        },
        {
            icon: Users2,
            label: "Total Users",
            value: String(stats.totalUsers),
            bgColor: "bg-sky-500/10",
            iconColor: "text-sky-500",
        },
        {
            icon: Layers,
            label: "Total Genres",
            value: String(stats.totalGenres),
            bgColor: "bg-sky-500/10",
            iconColor: "text-sky-500",
        },
        {
            icon: Mic,
            label: "Total Podcasts",
            value: String(stats.totalPodcasts),
            bgColor: "bg-sky-500/10",
            iconColor: "text-sky-500",
        },
        {
            icon: Mic,
            label: "Total Podcast Episodes",
            value: String(stats.totalEpisodes),
            bgColor: "bg-sky-500/10",
            iconColor: "text-sky-500",
        }
    ];

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 '>
            {statsData.map((stat) => (
                <StatsCard
                    key={stat.label}
                    icon={stat.icon}
                    label={stat.label}
                    value={stat.value}
                    bgColor={stat.bgColor}
                    iconColor={stat.iconColor}
                />
            ))}
        </div>
    );
};
export default DashboardStats;
