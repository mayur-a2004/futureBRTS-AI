import { useState, useEffect } from 'react';
import {
    Activity,
    Globe,
    Target,
    TrendingUp,
    MapPin,
    ArrowUpRight,
    Brain,
    MousePointer2,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';

const AnalysisCard = ({ title, children, icon: Icon, color }: any) => (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative group hover:bg-white/[0.04] transition-all">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                    <Icon size={18} className={`text-${color}-400`} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
            </div>
            <button className="text-gray-500 hover:text-white transition-colors">
                <ArrowUpRight size={16} />
            </button>
        </div>
        {children}
    </div>
);

export default function IntelligenceDashboard() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchIntel = async () => {
            try {
                const token = localStorage.getItem('fbrts_token');
                const res = await fetch('/api/admin/intelligence', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await res.json();
                if (result.success) {
                    setData(result);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchIntel();
    }, []);

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 animate-pulse">Syncing Neural Insights</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Live Intelligence Feed Active</span>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter">Strategic Intelligence</h1>
                <p className="text-gray-400 mt-2 font-medium">Deep SEO analysis, user intent tracking, and geospatial behavior.</p>
            </div>

            {/* Sentiment Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <ThumbsUp size={18} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">Neural Approval</p>
                        <h4 className="text-xl font-black text-white">{data?.sentiment?.likes || 0}</h4>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                        <ThumbsDown size={18} className="text-rose-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-rose-500/50 uppercase tracking-widest">Refinement Signals</p>
                        <h4 className="text-xl font-black text-white">{data?.sentiment?.dislikes || 0}</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 🏷️ SEO Keyword Extraction */}
                <AnalysisCard title="Trending SEO Keywords" icon={Target} color="indigo">
                    <div className="space-y-4">
                        {data?.keywords?.map((kw: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-gray-600 w-4">{idx + 1}</span>
                                    <span className="text-sm font-bold text-white capitalize">{kw._id}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                                        <div
                                            className="h-full bg-indigo-500"
                                            style={{ width: `${(kw.count / data.keywords[0].count) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-black text-indigo-400">{kw.count} hits</span>
                                </div>
                            </div>
                        ))}
                        {(!data?.keywords || data.keywords.length === 0) && (
                            <p className="text-center py-10 text-gray-600 text-xs italic">Gathering intelligence...</p>
                        )}
                    </div>
                </AnalysisCard>

                {/* 📍 Geospatial Traffic */}
                <AnalysisCard title="Global Pulse (Locations)" icon={Globe} color="emerald">
                    <div className="space-y-4">
                        {data?.locations?.map((loc: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10">
                                        <MapPin size={14} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{loc._id || 'Unknown Location'}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-black">{loc.country || 'Region Secured'}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-emerald-400">{loc.count} sessions</span>
                            </div>
                        ))}
                    </div>
                </AnalysisCard>
            </div>

            {/* 💡 User Intent Feed */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                        <Brain size={24} className="text-purple-400" />
                        Extracted Intent Streams
                    </h2>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Real-time Analysis</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.intents?.map((intent: any, idx: number) => (
                        <div key={idx} className="p-5 rounded-3xl bg-[#111113] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                <MousePointer2 size={24} className="text-white transform -rotate-12" />
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    {new Date(intent.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed font-medium">
                                "{intent.intent}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🛡️ War Room Oversight */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                        <Activity size={24} className="text-indigo-400" />
                        Industrial War Room Audits
                    </h2>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Admin Oversight Mode</span>
                </div>
                <div className="overflow-x-auto rounded-3xl border border-white/5 bg-white/[0.01]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Target URL</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Requested By</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Score</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data?.warRoomAudits?.map((audit: any) => (
                                <tr key={audit._id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Globe size={12} className="text-gray-500" />
                                            <span className="text-xs font-bold text-indigo-400 max-w-[200px] truncate">{audit.url}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-white">{audit.userId?.firstName} {audit.userId?.lastName}</span>
                                            <span className="text-[10px] text-gray-600 truncate max-w-[150px]">{audit.userId?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-black italic text-white">{audit.score || '--'}%</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border ${audit.status === 'COMPLETED' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                                            audit.status === 'FAILED' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' :
                                                'text-amber-400 border-amber-500/20 bg-amber-500/5 pulse'
                                            }`}>
                                            {audit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-[10px] font-bold text-gray-600">{new Date(audit.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {(!data?.warRoomAudits || data.warRoomAudits.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-600 text-xs italic">No audits reported to base.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Strategy Highlights */}
            <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-2xl shadow-indigo-500/40">
                    <TrendingUp size={32} className="text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">Growth Forecast</h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                        Based on the latest **{data?.keywords?.[0]?._id || 'emerging'}** trends, users are heavily pivotting towards deep technical analysis. Strategically updating the Landing Page meta-tags with these keywords could potentially increase organic reach by **15-20%** in the next cycle.
                    </p>
                </div>
                <button className="px-6 py-3 bg-white text-black rounded-2xl font-black text-sm hover:scale-105 transition-transform whitespace-nowrap">
                    Apply Strategic Update
                </button>
            </div>
        </div>
    );
}
