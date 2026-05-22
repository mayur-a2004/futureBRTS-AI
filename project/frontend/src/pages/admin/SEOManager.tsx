import { useState, useEffect } from 'react';
import {
    Search,
    Save,
    RefreshCcw,
    CheckCircle2,
    BarChart3,
    TrendingUp,
    ChevronUp,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function SEOManager() {
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [seoData, setSeoData] = useState({
        site_title: "Future BRTS | The Ultimate Career Architect",
        meta_description: "Transform your human intent into technical roadmaps with the world's most advanced neural career engine.",
        meta_keywords: "career, roadmap, ai, learning, builder, tech, developer, strategic planning",
        og_title: "Build Your Future with Future BRTS",
        og_image_url: "https://futurebrts.com/og-image.jpg",
        google_site_verification: "",
        bing_site_verification: ""
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/seo-analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAnalytics(data.analytics);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAnalyticsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/settings/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    settings: Object.entries(seoData).map(([key, value]) => ({
                        key: `SEO_${key.toUpperCase()}`,
                        value,
                        description: `SEO Configuration: ${key}`
                    }))
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("SEO Integrity Synced Successfully.");
            }
        } catch (err) {
            toast.error("Failed to sync SEO node.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">SEO & Metadata Scaper</h1>
                    <p className="text-gray-400 mt-1 font-medium">Calibrate how the digital world perceives the Future BRTS ecosystem.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                    >
                        {isLoading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
                        Sync Protocols
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-8">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                <Search size={20} className="text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-black text-white">Global Meta Configuration</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Site Title Protocol</label>
                                <input
                                    type="text"
                                    value={seoData.site_title}
                                    onChange={e => setSeoData({ ...seoData, site_title: e.target.value })}
                                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                    placeholder="Enter Global Title..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Meta Description Unit</label>
                                <textarea
                                    rows={4}
                                    value={seoData.meta_description}
                                    onChange={e => setSeoData({ ...seoData, meta_description: e.target.value })}
                                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white resize-none"
                                    placeholder="Describe the neural value proposition..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Social Title (OG)</label>
                                    <input
                                        type="text"
                                        value={seoData.og_title}
                                        onChange={e => setSeoData({ ...seoData, og_title: e.target.value })}
                                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Indexing Verification</label>
                                    <input
                                        type="text"
                                        value={seoData.google_site_verification}
                                        onChange={e => setSeoData({ ...seoData, google_site_verification: e.target.value })}
                                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                        placeholder="Google Trace Code..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/5 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="text-indigo-400" size={18} /> Strategic Directive
                        </h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            Your SEO configuration is the blueprint for organic user acquisition. Maintain high density of neural-related keywords while ensuring content readability for human subjects.
                        </p>
                    </div>
                </div>

                {/* Intelligence Sidepanel */}
                <div className="space-y-8">
                    <div className="p-8 rounded-[40px] bg-[#0a0a0b] border border-white/10 space-y-8 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-white flex items-center gap-3">
                                <BarChart3 className="text-purple-400" size={20} /> Keyword Intelligence
                            </h2>
                            <button onClick={fetchAnalytics} className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
                                <RefreshCcw size={14} className={isAnalyticsLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {isAnalyticsLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="animate-spin text-gray-600" size={24} />
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Scanning SERPs...</p>
                                </div>
                            ) : analytics.map((item, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-black text-white">{item.keyword}</span>
                                        <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-gray-500">
                                            Pos: <span className={item.rank <= 3 ? 'text-emerald-400' : 'text-amber-400'}>{item.rank}</span>
                                            {item.trend === 'up' ? <ChevronUp size={10} className="text-emerald-500" /> : <ChevronDown size={10} className="text-rose-500" />}
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                            style={{ width: `${(item.volume / 5000) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Vol: {item.volume.toLocaleString()}</span>
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">CPC: ${item.cpc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                            Full Intelligence Report
                        </button>
                    </div>

                    <div className="p-8 rounded-[40px] bg-white/[0.01] border border-white/5 space-y-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-500" size={18} />
                            <span className="text-xs font-black text-white uppercase tracking-widest">System Health</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                                <span>INDEX RATIO</span>
                                <span className="text-white">98.4%</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                                <span>CORE WEB VITALS</span>
                                <span className="text-emerald-400">OPTIMAL</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                                <span>SITEMAP.XML</span>
                                <span className="text-white">SYNCED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
