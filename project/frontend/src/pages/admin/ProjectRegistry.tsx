import { useState, useEffect } from 'react';
import {
    Briefcase,
    Search,
    ExternalLink,
    Clock,
    User,
    Loader2,
    CheckCircle2,
    Zap,
    Activity,
    Shield,
    Terminal,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { toast } from 'react-toastify';

export default function ProjectRegistry() {
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { scrollYProgress } = useScroll();
    const rotateValue = useTransform(scrollYProgress, [0, 1], [0, 90]);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setProjects(data.projects || []);
            }
        } catch (err) {
            toast.error("Project Registry synchronization failure.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProjects = projects.filter(p =>
        (p.title || p.blueprint?.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((p.userId as any)?.firstName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-40 animate-in fade-in duration-500 pb-40">
            
            {/* --- SECTION 1: REGISTRY HERO --- */}
            <section className="relative py-20 px-10 rounded-[40px] bg-[#0A0A0A] border border-white/5 overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 duration-700">
                    <Briefcase size={200} className="text-indigo-500" />
                </div>
                
                <motion.div 
                    style={{ rotate: rotateValue }}
                    className="absolute -top-40 -left-40 w-80 h-80 border border-indigo-500/10 rounded-full pointer-events-none"
                />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 relative z-10">
                    <div className="space-y-6">
                        <div className="flex gap-3 items-center">
                            <div className="inline-flex px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 italic">
                                Neural Registry v4.2
                            </div>
                            <div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 italic animate-pulse">
                                SYSTEM_LIVE
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none drop-shadow-2xl">
                            PROJECT <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-400 animate-gradient-x">REGISTRY.</span>
                        </h1>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] ml-1">Cataloguing {projects.length} Autonomous Architectures</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <RegistryStat label="AVG_TOKENS" value="48.2k" icon={<Zap size={14} />} />
                        <RegistryStat label="SUCCESS_RATE" value="98.4%" icon={<TrendingUp size={14} />} />
                    </div>
                </div>
            </section>

            {/* --- SECTION 2: COMMAND CONTROLS --- */}
            <section className="space-y-12">
                <div className="flex flex-col lg:flex-row gap-6 items-center px-4">
                    <div className="relative w-full lg:flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Scan for assembly name, tech stack, or user handle..."
                            className="w-full bg-black/40 border border-white/5 rounded-[22px] h-16 pl-14 pr-6 text-sm font-medium focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all outline-none italic"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex bg-white/5 p-1.5 rounded-[22px] border border-white/5 backdrop-blur-xl overflow-x-auto no-scrollbar w-full md:w-auto">
                        {["ALL_TIME", "ACTIVE", "READY", "FAILED"].map(tab => (
                            <button
                                key={tab}
                                className={`px-6 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${tab === 'ALL_TIME' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-gray-500 hover:text-white"}`}
                            >
                                {tab.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- SECTION 3: PROJECT GRID --- */}
                {isLoading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-6 border border-white/5 rounded-[48px] bg-white/[0.01]">
                        <div className="relative">
                            <Loader2 className="animate-spin text-indigo-500" size={48} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>
                        <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Registry Nodes...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                        {filteredProjects.map((p) => (
                            <ProjectArtifactCard key={p._id} project={p} />
                        ))}
                        {filteredProjects.length === 0 && (
                            <div className="col-span-full py-40 text-center space-y-6">
                                <div className="p-8 bg-white/5 rounded-full inline-block text-gray-700 shadow-inner">
                                    <Terminal size={40} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-gray-500 font-black italic uppercase tracking-[0.5em] text-sm">No Architecture Signals Identified</p>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Shift your neural focus or refine the parameters.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* --- SECTION 4: SYSTEM METRICS HUD --- */}
            <section className="bg-white/[0.01] border border-white/5 rounded-[4rem] p-12 md:p-32 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent -z-10" />
                <div className="grid lg:grid-cols-2 gap-32 items-center relative z-10">
                    <div className="space-y-12 text-left">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-white">UPTIME_STATS.</h2>
                            <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-[10px] pl-2 border-l border-indigo-500">Registry integrity monitor</p>
                        </div>
                        <div className="grid gap-8">
                            <MetricRow label="NODE_STABILITY" value="99.98%" color="emerald" />
                            <MetricRow label="SYNTHESIS_LATENCY" value="12.4ms" color="indigo" />
                            <MetricRow label="STORAGE_CAPACITY" value="84%" color="amber" />
                        </div>
                    </div>
                    <div className="relative aspect-square max-w-sm mx-auto flex items-center justify-center">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-2 border-dashed border-indigo-500/10 rounded-full"
                        />
                        <div className="p-12 bg-[#050505] rounded-[3rem] border border-white/10 shadow-2xl text-center space-y-6">
                            <Shield size={60} className="text-indigo-500 mx-auto" />
                            <h4 className="text-xl font-black italic uppercase tracking-tighter">DATA_SHIELD_V4</h4>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">All registered architectures are encrypted and vault-protected.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ProjectArtifactCard({ project: p }: { project: any }) {
    return (
        <div className="p-8 rounded-[40px] bg-[#0A0A0A] border border-white/5 hover:border-indigo-500/30 transition-all duration-700 group relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity">
                <Briefcase size={80} />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Terminal size={24} className="text-indigo-400" />
                    </div>
                    <div className="flex gap-2">
                        {p.status === 'COMPLETED' ? (
                            <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] uppercase font-black tracking-widest rounded-xl flex items-center gap-2">
                                <CheckCircle2 size={12} /> SYNCED
                            </span>
                        ) : p.status === 'FAILED' ? (
                            <span className="px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] uppercase font-black tracking-widest rounded-xl">
                                ABORTED
                            </span>
                        ) : (
                            <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] uppercase font-black tracking-widest rounded-xl animate-pulse">
                                ASSEMBLING
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-tight group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {p.title || p.blueprint?.subject || 'Generation Delta'}
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest italic">{p.category}</span>
                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{p.tier} TIER</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 py-3 border-y border-white/5 group-hover:border-indigo-500/10 transition-colors">
                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                            <User size={12} className="text-gray-500" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
                            {(p.userId as any)?.firstName} {(p.userId as any)?.lastName}
                        </p>
                    </div>
                </div>

                {p.billingAndUsage?.totalTokens > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-white/5 group-hover:border-indigo-500/10 transition-colors">
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono shadow-inner group-hover:bg-indigo-500/5 transition-all">
                            <p className="text-[8px] text-gray-600 font-black uppercase">Tokens</p>
                            <p className="text-sm font-black text-indigo-400">{(p.billingAndUsage.totalTokens / 1000).toFixed(1)}K</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono shadow-inner group-hover:bg-indigo-500/5 transition-all">
                            <p className="text-[8px] text-gray-600 font-black uppercase">Cost</p>
                            <p className="text-sm font-black text-emerald-400">${p.billingAndUsage.estimatedCostUSD?.toFixed(3)}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-700 italic">
                    <Clock size={12} className="text-indigo-900" /> {new Date(p.createdAt).toLocaleDateString()}
                </span>
                {p.status === 'COMPLETED' && p.artifacts?.zipUrl && (
                    <a href={p.artifacts.zipUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-all bg-indigo-500/10 hover:bg-indigo-600 px-5 py-2 rounded-xl group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                        DEPLOY <ArrowUpRight size={14} />
                    </a>
                )}
            </div>
        </div>
    );
}

function RegistryStat({ label, value, icon }: any) {
    return (
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl group-hover:bg-white/[0.03] transition-all">
            <div className="flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 italic">
                {icon} {label}
            </div>
            <div className="text-xl font-black text-white italic tracking-tighter">{value}</div>
        </div>
    );
}

function MetricRow({ label, value, color }: any) {
    const colorMap: any = {
        emerald: "bg-emerald-500",
        indigo: "bg-indigo-500",
        amber: "bg-amber-500",
    }
    return (
        <div className="space-y-2 group cursor-default">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
                <span className="text-sm font-black text-white italic">{value}</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: value }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full ${colorMap[color]}`}
                />
            </div>
        </div>
    );
}
