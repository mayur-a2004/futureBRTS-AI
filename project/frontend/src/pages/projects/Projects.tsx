import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Layout, Database, Clock, CheckCircle, AlertCircle, Sparkles, Search, Zap, Box, Rocket, Terminal, Download } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useMemo } from "react"
import LoadingScreen from "@/components/ui/LoadingScreen"
import UniverseBackground from "@/components/ui/UniverseBackground"

export default function Projects() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [activeCategory, setActiveCategory] = useState("ALL");
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    // Auto-refresh logic for generating projects
    useEffect(() => {
        const hasGenerating = projects.some(p => p.status === 'GENERATING' || p.status === 'MANIFESTING');
        if (!hasGenerating) return;

        const interval = setInterval(() => {
            fetchProjects(false);
        }, 5000);

        return () => clearInterval(interval);
    }, [projects]);

    const fetchProjects = async (showLoading = true) => {
        if (showLoading && projects.length === 0) setLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/collage-project/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setProjects(data.projects);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="text-[#10b981]" size={14} strokeWidth={2.5} />;
            case 'FAILED': return <AlertCircle className="text-[#f43f5e]" size={14} strokeWidth={2.5} />;
            case 'GENERATING': return <Clock className="text-[#f59e0b] animate-spin" size={14} strokeWidth={2.5} />;
            default: return <Clock className="text-[#ffffff]/40" size={14} strokeWidth={2.5} />;
        }
    };

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.requirements || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.field || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.subCategory || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = activeFilter === "ALL" || p.status === activeFilter;
            const matchesCategory = activeCategory === "ALL" || p.category === activeCategory;
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [projects, searchQuery, activeFilter, activeCategory]);

    if (loading) return <LoadingScreen />;

    return (
        <div className="relative min-h-screen font-sans text-[#ffffff] bg-[#030304] selection:bg-[#6366f1]/30">
            {/* 🌌 UNIVERSAL BACKGROUND SYNC */}
            <UniverseBackground intensity={1} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/[0.02] to-[#030304] pointer-events-none" />

            {/* 📟 HUD DECORATIONS */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 mix-blend-screen hidden lg:block z-0">
                <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-[#ffffff]/10" />
                <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-[#ffffff]/10" />
                <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-[#ffffff]/10" />
                <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-[#ffffff]/10" />

                <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col items-center gap-2">
                    <div className="w-[1px] h-32 bg-[#ffffff]/10" />
                    <div className="text-[#ffffff]/30 font-mono text-[8px] transform -rotate-90 tracking-widest my-4">SYS.LIVE.9</div>
                    <div className="w-[1px] h-32 bg-[#ffffff]/10" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10 animate-in fade-in duration-700">

                {/* 🏗️ STUDIO HEADER */}
                <header className="mb-14 overflow-hidden relative">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-8">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-[#6366f1]/10 rounded-full border border-[#6366f1]/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
                                <span className="text-[9px] md:text-[10px] font-[900] uppercase tracking-[0.3em] text-[#818cf8]">ANTIGRAVITY // NEURAL REGISTRY</span>
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-[1000] italic tracking-tighter uppercase leading-none text-[#ffffff] drop-shadow-2xl">
                                    PROJECT_ARCHIVE
                                </h1>
                                <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-[#ffffff]/40 mt-2 md:ml-1 flex items-center gap-2">
                                    <Database size={12} className="text-[#6366f1]" /> Synchronizing {projects.length} Field-Specific Artifacts
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => navigate('/builder')}
                            className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-[#ffffff] font-[1000] px-6 md:px-8 rounded-2xl h-12 md:h-14 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] gap-3 text-[10px] md:text-[11px] uppercase tracking-widest transition-all group shrink-0"
                        >
                            <Rocket size={16} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-500" />
                            DEPLOY_NEW_HQ
                        </Button>
                    </div>
                </header>

                {/* 🔍 SEARCH & FILTERS HUB */}
                <div className="flex flex-col xl:flex-row gap-4 mb-10">
                    {/* Search Field */}
                    <div className="relative w-full xl:min-w-[360px] xl:w-auto group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#ffffff]/30 group-focus-within:text-[#6366f1] transition-colors" size={18} />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-transparent rounded-2xl opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-700 pointer-events-none" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0d0d14]/80 backdrop-blur-xl border border-[#ffffff]/10 rounded-2xl h-12 md:h-14 pl-12 pr-5 text-xs font-bold text-[#ffffff] focus:border-[#6366f1]/50 focus:bg-[#111118]/90 transition-all outline-none placeholder:text-[#ffffff]/20 shadow-inner block"
                            placeholder="SEARCH ARTIFACT NAME OR DNA..."
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex bg-[#0d0d14]/80 p-1.5 rounded-2xl border border-[#ffffff]/10 backdrop-blur-xl overflow-x-auto scrollbar-hide w-full xl:w-auto items-center">
                        {["ALL", "GRADUATION", "POST_GRAD_PHD", "STUDENT_8_12", "BUSINESS_FREELANCE"].map(cat => {
                            const isActive = activeCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 
                                    ${isActive ? "bg-[#6366f1] text-[#ffffff] shadow-[0_4px_15px_rgba(99,102,241,0.3)]" : "text-[#ffffff]/40 hover:text-[#ffffff] hover:bg-[#ffffff]/5"}`}
                                >
                                    {cat.replace(/_/g, ' ')}
                                </button>
                            );
                        })}
                    </div>

                    {/* Status Filter */}
                    <div className="flex bg-[#0d0d14]/80 p-1.5 rounded-2xl border border-[#ffffff]/10 backdrop-blur-xl shrink-0 w-full xl:w-auto overflow-x-auto scrollbar-hide items-center">
                        {["ALL", "COMPLETED", "GENERATING", "FAILED"].map(status => {
                            const isActive = activeFilter === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setActiveFilter(status)}
                                    className={`px-4 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 shrink-0
                                    ${isActive ? "bg-[#ffffff] text-[#030304] shadow-md" : "text-[#ffffff]/40 hover:text-[#ffffff] hover:bg-[#ffffff]/5"}`}
                                >
                                    {status !== "ALL" && (
                                        <div className={`w-1 h-1 rounded-full ${status === 'COMPLETED' ? 'bg-[#10b981]' :
                                            status === 'FAILED' ? 'bg-[#f43f5e]' :
                                                status === 'GENERATING' ? 'bg-[#f59e0b] animate-pulse' : 'bg-gray-500'
                                            }`} />
                                    )}
                                    {status}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 📦 PROJECT GRID */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 min-h-[400px] content-start">
                    <AnimatePresence mode="popLayout">
                        {/* ⚡ Genesis Trigger Card (Always first) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => navigate('/builder')}
                            className="relative group bg-[#0d0d14]/40 hover:bg-[#16161e]/80 border-2 border-dashed border-[#ffffff]/10 hover:border-[#6366f1]/40 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 text-[#ffffff]/30 hover:text-[#ffffff] transition-all duration-500 cursor-pointer min-h-[280px] backdrop-blur-sm overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/0 to-[#6366f1]/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-[0.05] transition-opacity transform group-hover:scale-125 duration-700 blur-[1px] text-[#6366f1]">
                                <Terminal size={80} />
                            </div>

                            <div className="w-16 h-16 rounded-2xl bg-[#030304] border border-[#ffffff]/10 group-hover:bg-[#6366f1]/10 group-hover:border-[#6366f1]/30 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-inner group-hover:text-[#818cf8] z-10 relative">
                                <Sparkles size={28} className="strokeWidth={1.5}" />
                                <div className="absolute inset-0 bg-[#6366f1] blur-xl opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-500" />
                            </div>

                            <div className="text-center space-y-2 z-10">
                                <h3 className="text-xl font-[1000] uppercase italic tracking-tighter">DEPLOY ARTIFACT</h3>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#6366f1]/60">SYNTHESIZE_v9_HQ</p>
                            </div>
                        </motion.div>

                        {/* 🔥 Actual Projects */}
                        {filteredProjects.map((project, idx) => (
                            <motion.div
                                key={project._id}
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-[#111118]/80 backdrop-blur-xl border border-[#ffffff]/10 rounded-3xl p-6 hover:border-[#6366f1]/40 transition-all duration-500 flex flex-col group relative overflow-hidden shadow-xl min-h-[300px] hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
                            >
                                {/* Background Accent glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="absolute -top-8 -right-8 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-all transform group-hover:rotate-12 duration-700 pointer-events-none">
                                    <Box size={140} />
                                </div>

                                {/* Header Elements */}
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="w-12 h-12 bg-[#030304] border border-[#ffffff]/10 rounded-xl flex items-center justify-center group-hover:bg-[#6366f1] group-hover:border-[#6366f1] group-hover:text-white transition-all duration-500 shadow-inner text-[#ffffff]/40">
                                        {project.subCategory === 'IT' ? <Layout size={20} strokeWidth={2} /> : <Database size={20} strokeWidth={2} />}
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${project.status === 'COMPLETED' ? 'bg-[#10b981]/10 border-[#10b981]/20' : project.status === 'GENERATING' ? 'bg-[#f59e0b]/10 border-[#f59e0b]/20' : project.status === 'FAILED' ? 'bg-[#f43f5e]/10 border-[#f43f5e]/30' : 'bg-[#ffffff]/5 border-[#ffffff]/10'}`}>
                                        {getStatusIcon(project.status)}
                                        <span className={`text-[8px] md:text-[9px] font-[900] uppercase tracking-[0.2em] ${project.status === 'COMPLETED' ? 'text-[#10b981]' : project.status === 'GENERATING' ? 'text-[#f59e0b]' : project.status === 'FAILED' ? 'text-[#f43f5e]' : 'text-[#ffffff]/40'}`}>
                                            {project.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* Text Info */}
                                <div className="space-y-2 mb-5 relative z-10 flex-1">
                                    <h3 className="font-[1000] text-xl md:text-2xl text-[#ffffff] uppercase italic truncate tracking-tighter" title={project.title || project.blueprint?.subject}>
                                        {project.title || project.blueprint?.subject || "EXPERIMENTAL_NODE"}
                                    </h3>
                                    <p className="text-[10px] md:text-[11px] text-[#ffffff]/40 font-bold line-clamp-2 md:line-clamp-3 leading-relaxed tracking-wide">
                                        {project.blueprint?.executiveSummary || project.requirements || "No architectural description detected."}
                                    </p>
                                </div>

                                {/* Tags Block */}
                                <div className="space-y-5 relative z-10 mt-auto pt-5 border-t border-[#ffffff]/5">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[8px] md:text-[9px] bg-[#16161e] text-[#818cf8] px-2.5 py-1 rounded-md border border-[#ffffff]/10 font-black uppercase tracking-widest truncate max-w-[120px]">{project.category.replace(/_/g, ' ')}</span>
                                        <span className="text-[8px] md:text-[9px] bg-[#16161e] text-[#ffffff]/60 px-2.5 py-1 rounded-md border border-[#ffffff]/10 font-black uppercase tracking-widest truncate max-w-[120px]">{project.field}</span>
                                        {project.billingAndUsage?.totalTokens > 0 && (
                                            <span className="text-[9px] bg-[#10b981]/10 text-[#10b981] px-3 py-1.5 rounded-lg border border-[#10b981]/20 font-black uppercase tracking-widest flex items-center gap-1.5 ml-auto">
                                                <Zap size={10} /> {project.billingAndUsage.totalTokens.toLocaleString()} TKN
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2.5">
                                        {project.status === 'COMPLETED' && project.artifacts?.zipUrl ? (
                                            <a href={project.artifacts.zipUrl} target="_blank" rel="noreferrer" className="flex-1 w-full text-center">
                                                <Button className="w-full bg-[#ffffff] text-[#030304] hover:bg-[#6366f1] hover:text-[#ffffff] font-[1000] rounded-xl h-12 shadow-md transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] text-[10px] md:text-[11px] tracking-widest uppercase items-center justify-center gap-2 flex">
                                                    <Download size={14} /> REPO_ZIP
                                                </Button>
                                            </a>
                                        ) : project.status === 'GENERATING' ? (
                                            <Button onClick={() => navigate(`/projects/live/${project._id}`)} className="flex-1 w-full bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 rounded-xl h-12 font-[1000] text-[9px] md:text-[10px] uppercase tracking-widest animate-pulse transition-colors items-center justify-center gap-2 flex shadow-inner">
                                                <Clock size={14} /> MONITOR_NEXUS
                                            </Button>
                                        ) : (
                                            <Button disabled className="flex-1 w-full bg-[#16161e]/50 text-[#ffffff]/20 border border-[#ffffff]/5 rounded-xl h-12 font-black text-[9px] md:text-[10px] uppercase tracking-widest cursor-not-allowed">
                                                RESTRICTED_SYNC
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => navigate(`/projects/live/${project._id}`)}
                                            variant="ghost"
                                            className="w-12 h-12 shrink-0 bg-[#0d0d14] hover:bg-[#6366f1] rounded-xl border border-[#ffffff]/10 hover:border-[#6366f1] transition-all text-[#ffffff]/40 hover:text-white flex items-center justify-center p-0"
                                            title="Enter Project Studio v9"
                                        >
                                            <ExternalLink size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Empty State / Not Found */}
                {filteredProjects.length === 0 && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 py-24 border border-dashed border-[#ffffff]/10 rounded-3xl text-center bg-[#0d0d14]/40 shadow-inner backdrop-blur-md">
                        <div className="flex flex-col items-center gap-5">
                            <div className="w-16 h-16 bg-[#16161e] border border-[#ffffff]/5 rounded-2xl text-[#ffffff]/20 flex items-center justify-center shadow-inner">
                                <Search size={28} />
                            </div>
                            <div className="space-y-2 px-4">
                                <p className="text-[#ffffff]/60 font-[1000] italic uppercase tracking-[0.3em] text-lg md:text-xl pt-2">NO_ARTIFACTS_DETECTED</p>
                                <p className="text-[10px] md:text-[11px] text-[#ffffff]/30 font-bold uppercase tracking-widest max-w-sm mx-auto">Neural sensors found no projects matching your query pattern.</p>
                            </div>
                            <Button onClick={() => { setActiveFilter("ALL"); setActiveCategory("ALL"); setSearchQuery(""); }} variant="ghost" className="text-[#818cf8] font-[1000] uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-[#6366f1]/20 hover:text-[#ffffff] h-10 md:h-12 px-6 mt-3 rounded-full border border-[#6366f1]/30 transition-all">
                                RESET_TRACKING_FILTERS
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
