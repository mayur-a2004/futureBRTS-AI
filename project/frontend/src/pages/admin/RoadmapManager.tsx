import { useState, useEffect } from 'react';
import {
    Search,
    Map,
    Clock,
    Layers,
    ExternalLink,
    Trash2,
    Eye,
    TrendingUp,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function RoadmapManager() {
    const [roadmaps, setRoadmaps] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    const fetchRoadmaps = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/roadmaps', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setRoadmaps(data.roadmaps);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch roadmap repository.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRoadmaps = roadmaps.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Strategic Roadmap Grid</h1>
                    <p className="text-gray-400 mt-1 font-medium">Monitor and manage all synthesized development paths.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by goal, title, or architect name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        High Fidelity Only
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 rounded-[32px] bg-white/[0.02] border border-white/5 animate-pulse" />
                    ))
                ) : filteredRoadmaps.length > 0 ? (
                    filteredRoadmaps.map((roadmap) => (
                        <div key={roadmap._id} className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                    <Map size={24} className="text-indigo-400" />
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-500 hover:text-white transition-colors"><Eye size={18} /></button>
                                    <button className="p-2 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div>
                                    <h3 className="text-lg font-black text-white leading-tight group-hover:text-indigo-400 transition-colors">{roadmap.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <TrendingUp size={12} className="text-indigo-500" /> {roadmap.userName || "Unknown Architect"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nodes</p>
                                        <p className="text-sm font-black text-white flex items-center gap-1.5">
                                            <Layers size={14} className="text-purple-400" /> {roadmap.steps?.length || 0} Phases
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Completion</p>
                                        <p className="text-sm font-black text-white flex items-center gap-1.5">
                                            <CheckCircle2 size={14} className="text-emerald-400" /> {roadmap.progress || 0}%
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        <Clock size={12} /> {new Date(roadmap.createdAt).toLocaleDateString()}
                                    </div>
                                    <button className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] group/btn">
                                        Inspect <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-gray-600 italic font-medium">No strategic roadmaps detected in the grid.</div>
                )}
            </div>
        </div>
    );
}
