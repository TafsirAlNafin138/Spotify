import React, { useEffect, useState } from "react";
import { axiosInstance } from "../services/axios";
import { Music, Album, Users, Mic, Layers, Disc, UserCheck, Search, Filter, TrendingUp, Heart, Clock, Award } from "lucide-react";

const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-800/50 transition-all group">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-zinc-400 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform">{value}</h3>
            </div>
        </div>
    </div>
);

const LeaderboardItem = ({ rank, title, subtitle, image, value, valueLabel, icon: Icon }) => (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors group cursor-pointer border border-transparent hover:border-zinc-700">
        <div className="w-8 text-zinc-500 font-bold text-lg text-center">{rank}</div>
        <div className="relative w-12 h-12 flex-shrink-0">
            <img src={image} alt={title} className="w-full h-full object-cover rounded shadow-md" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate group-hover:text-green-500 transition-colors">{title}</p>
            <p className="text-zinc-400 text-sm truncate">{subtitle}</p>
        </div>
        <div className="text-right flex items-center gap-2">
            <div className="flex flex-col items-end">
                <span className="text-white font-bold">{value}</span>
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{valueLabel}</span>
            </div>
            {Icon && <Icon className="w-4 h-4 text-green-500 opacity-50" />}
        </div>
    </div>
);

const DisplayStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeCategory, setActiveCategory] = useState("Songs");
    const [activeMetric, setActiveMetric] = useState("Most Liked");
    const [genreFilter, setGenreFilter] = useState("All Genres");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get("/stats/leaderboard", {
                    params: {
                        category: activeCategory,
                        metric: activeMetric,
                        genre: genreFilter,
                        search: searchQuery
                    }
                });
                setLeaderboard(response.data.data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
                // Don't show full error UI for every filter change to avoid flicker
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchLeaderboard, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [activeCategory, activeMetric, genreFilter, searchQuery]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get("/stats");
                setStats(response.data.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
                setError("Failed to load statistics. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const categories = ["Songs", "Artists", "Podcasts"];
    const metrics = ["Most Liked", "Top Played", "Trending", "Least Listening Time"];
    const genres = ["All Genres", "Pop", "Rock", "Hip Hop", "Jazz", "Classical", "Lo-fi"];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <Layers className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                <p className="text-zinc-400 max-w-md">{error}</p>
            </div>
        );
    }

    const statItems = [
        { icon: Music, label: "Total Tracks", value: stats?.tracks || 0, color: "text-emerald-500 bg-emerald-500" },
        { icon: Album, label: "Total Albums", value: stats?.albums || 0, color: "text-blue-500 bg-blue-500" },
        { icon: Users, label: "Total Artists", value: stats?.artists || 0, color: "text-purple-500 bg-purple-500" },
        { icon: Mic, label: "Total Podcasts", value: stats?.podcasts || 0, color: "text-pink-500 bg-pink-500" },
        { icon: Disc, label: "Total Episodes", value: stats?.episodes || 0, color: "text-yellow-500 bg-yellow-500" },
    ];

    return (
        <div className="p-6 pb-32">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                        <Award className="text-green-500 w-10 h-10" />
                        Platform Insights
                    </h1>
                    <p className="text-zinc-400">Discover deep analytics and community trends across the platform.</p>
                </div>
                
                <div className="flex bg-zinc-900 rounded-full p-1 border border-zinc-800">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setGenreFilter('All Genres'); }}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat ? 'bg-green-500 text-black' : 'text-zinc-400 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statItems.map((item, index) => (
                    <StatsCard key={index} {...item} />
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search and Filters Column */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Filter className="w-5 h-5 text-green-500" />
                            Refine Analysis
                        </h3>
                        
                        <div className="space-y-6">
                            {/* Metric Selector */}
                            <div>
                                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider mb-2 block">Analytical Metric</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {metrics.map(metric => (
                                        <button
                                            key={metric}
                                            onClick={() => setActiveMetric(metric)}
                                            className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between border ${activeMetric === metric ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                                        >
                                            {metric}
                                            {activeMetric === metric && <TrendingUp className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Genre Filter - hidden for Artists and Podcasts*/}
                            {activeCategory !== 'Artists' && activeCategory !== 'Podcasts' && (
                            <div>
                                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-wider mb-2 block">Genre Segment</label>
                                <select 
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 transition-all cursor-pointer"
                                    value={genreFilter}
                                    onChange={(e) => setGenreFilter(e.target.value)}
                                >
                                    {genres.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            )}
                        </div>
                    </div>

                </aside>

                {/* Leaderboard/Results Column */}
                <main className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">
                                {activeMetric} {activeCategory}
                            </h2>
                            {activeCategory !== 'Artists' && (
                            <p className="text-sm text-zinc-500">
                                Segmented by <span className="text-zinc-300 font-semibold">{genreFilter}</span>
                            </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] uppercase font-black text-zinc-500 tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Live Feed
                        </div>
                    </div>

                    <div className="p-4 space-y-1">
                        {leaderboard.length > 0 ? (
                            leaderboard.map((item) => (
                                <LeaderboardItem 
                                    key={item.rank} 
                                    {...item} 
                                    valueLabel={item.value_label}
                                    icon={
                                        item.value_label === 'Likes' ? Heart :
                                            item.value_label === 'Plays' ? Music :
                                                TrendingUp
                                    } 
                                />
                            ))
                        ) : (
                            <div className="py-20 text-center text-zinc-500">
                                No insights found for the current selection.
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
};

export default DisplayStats;
