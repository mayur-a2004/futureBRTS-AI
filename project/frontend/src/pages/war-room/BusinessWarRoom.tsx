import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Globe,
    Target,
    TrendingUp,
    Brain,
    Search,
    ShieldCheck,
    X,
    ChevronRight,
    Zap,
    Sparkles,
    LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import UniverseBackground from '@/components/ui/UniverseBackground';

export default function BusinessWarRoom() {
    const [url, setUrl] = useState('');
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditData, setAuditData] = useState<any>(null);
    const [activePillar, setActivePillar] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/war-room/audits', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setHistory(data.audits);
                if (data.audits.length > 0 && !auditData) {
                    setAuditData(data.audits[0]);
                }
            }
        } catch (err) {
            console.error("History Fetch failed");
        }
    };

    const handleAudit = async () => {
        if (!url) return;
        setIsAuditing(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/war-room/audit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url })
            });
            const data = await res.json();
            if (data.success) {
                setAuditData(data.audit);
                const pollInterval = setInterval(async () => {
                    const checkRes = await fetch(`/api/war-room/audits`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const checkData = await checkRes.json();
                    const updatedAudit = checkData.audits.find((a: any) => a._id === data.audit._id);
                    if (updatedAudit && updatedAudit.status !== 'PENDING') {
                        setAuditData(updatedAudit);
                        setHistory(checkData.audits);
                        clearInterval(pollInterval);
                    }
                }, 3000);
            }
        } catch (err) {
            console.error("Audit Failed:", err);
        } finally {
            setIsAuditing(false);
        }
    };

    const renderStrategySteps = (strategyText: string) => {
        if (!strategyText) return null;
        const lines = strategyText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const steps: { number?: string; text: string }[] = [];
        let bulletCount = 1;
        lines.forEach(line => {
            const numberedMatch = line.match(/^(\d+)[\.\)]\s*(.*)/);
            const bulletMatch = line.match(/^[\-\*\+]\s*(.*)/);
            if (numberedMatch) {
                steps.push({
                    number: numberedMatch[1],
                    text: numberedMatch[2]
                });
            } else if (bulletMatch) {
                steps.push({
                    number: String(bulletCount++),
                    text: bulletMatch[1]
                });
            } else {
                steps.push({
                    text: line
                });
            }
        });
        if (steps.length === 0) return null;
        return (
            <div className="space-y-4">
                {steps.map((step, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className="flex gap-4 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
                    >
                        {step.number ? (
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                {step.number}
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-110 transition-transform">
                                <Sparkles size={14} />
                            </div>
                        )}
                        <p className="text-gray-800 text-base md:text-lg font-semibold leading-relaxed tracking-tight group-hover:text-black transition-colors self-center">
                            {step.text}
                        </p>
                    </motion.div>
                ))}
            </div>
        );
    };

    const renderPillarDetails = () => {
        if (!activePillar || !auditData?.pillars?.[activePillar]) return null;
        const data = auditData.pillars[activePillar];
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-2xl bg-black/80"
            >
                <UniverseBackground intensity={0.3} morph={true} />
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-[#0c0c0e]/90 border border-white/10 rounded-3xl md:rounded-[48px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(79,70,229,0.3)] relative z-10"
                >
                    <button
                        onClick={() => setActivePillar(null)}
                        className="absolute top-4 right-4 md:top-8 md:right-8 text-gray-500 hover:text-white transition-colors bg-white/5 p-2.5 md:p-3 rounded-full hover:bg-white/10 z-20"
                    >
                        <X size={18} />
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                        <div className="p-6 sm:p-8 md:p-12 space-y-6 md:space-y-8 bg-gradient-to-br from-indigo-600/20 to-transparent">
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600 rounded-2xl md:rounded-[32px] flex items-center justify-center shadow-2xl shadow-indigo-600/30 shrink-0">
                                    <Brain className="text-white" size={28} md-size={36} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Intelligence Node</h3>
                                    <p className="text-indigo-400 font-bold uppercase text-[10px] md:text-xs tracking-[0.3em]">{activePillar.replace('_', ' ')}</p>
                                </div>
                            </div>

                            <div className="space-y-4 md:space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-[32px] p-5 md:p-8 backdrop-blur-md">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Forensic Summary</h4>
                                    <p className="text-gray-200 text-sm md:text-lg leading-relaxed font-semibold">{data.details}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl">
                                        <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pillar Integrity</p>
                                        <p className="text-2xl md:text-3xl font-black text-emerald-400">{data.score || 0}%</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl">
                                        <p className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Market Leverage</p>
                                        <p className="text-2xl md:text-3xl font-black text-white italic">HIGH</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 md:p-12 space-y-6 md:space-y-8 bg-white/[0.02] backdrop-blur-md">
                            <div className="space-y-4 md:space-y-6">
                                <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                                    <Target size={16} className="text-indigo-500" />
                                    Strategic Keywords Detected
                                </h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {data.keywords?.map((kw: string) => (
                                        <span key={kw} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 font-black text-[10px] tracking-widest uppercase hover:bg-indigo-500/20 transition-colors cursor-default">
                                            {kw}
                                        </span>
                                    )) || (
                                            <p className="text-gray-600 italic font-bold text-xs uppercase tracking-widest opacity-50">No neural signals extracted for this node.</p>
                                        )}
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 md:pt-8 border-t border-white/5">
                                <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tactical Recommendations</p>
                                <div className="space-y-2.5">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3.5 p-3.5 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 flex items-center justify-center text-xs font-black text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">0{i}</div>
                                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-white transition-colors">Execute Phase Strategy Node {i}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={() => setActivePillar(null)}
                                className="w-full h-14 bg-white text-black hover:bg-neutral-200 font-black uppercase tracking-widest rounded-xl mt-6 md:mt-8 shadow-xl shadow-white/5"
                            >
                                Deactivate Neural Link
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12 selection:bg-indigo-500/30 relative overflow-hidden">
            <UniverseBackground intensity={0.5} />

            <AnimatePresence>
                {activePillar && renderPillarDetails()}
            </AnimatePresence>

            {/* Premium Header */}
            <div className="max-w-[1700px] mx-auto flex flex-col xl:flex-row xl:items-end justify-between gap-6 md:gap-10 relative z-10">
                <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3 px-4 py-1.5 md:px-5 md:py-2 bg-indigo-600/10 border border-indigo-600/20 rounded-full w-fit backdrop-blur-md">
                        <Activity className="text-indigo-400 animate-pulse" size={12} md-size={14} />
                        <span className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Titan Neural Network :: ACTIVE_OVERSIGHT</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[0.9] flex flex-col">
                            <span>Command</span>
                            <span className="text-indigo-400 font-outline-2 drop-shadow-[0_0_30px_rgba(79,70,229,0.4)]">Room</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-1 md:pt-2">
                            <p className="text-gray-500 font-black text-sm md:text-lg uppercase tracking-[0.2em] flex items-center gap-3 md:gap-4">
                                Industrial Espionage <span className="w-10 md:w-16 h-px bg-white/10" /> V3.0
                            </p>
                            <div className="flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-white/5 border border-white/10 rounded-xl">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Protocol Secured</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 md:gap-6 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-initial px-6 py-6 md:px-10 md:py-8 bg-white/[0.02] border border-white/5 rounded-3xl md:rounded-[40px] flex flex-col items-center justify-center text-center backdrop-blur-xl min-w-[140px] md:min-w-[220px] hover:border-emerald-500/30 transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mb-3 group-hover:text-emerald-400 transition-colors relative z-10">Neural Sentiment</p>
                        <p className="text-xl md:text-2xl font-black text-emerald-400 italic uppercase tracking-tighter relative z-10">Bullish++</p>
                    </div>
                    <div className="flex-1 sm:flex-initial px-6 py-6 md:px-10 md:py-8 bg-white/[0.02] border border-white/5 rounded-3xl md:rounded-[40px] flex flex-col items-center justify-center text-center backdrop-blur-xl min-w-[140px] md:min-w-[220px] hover:border-indigo-500/30 transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mb-3 group-hover:text-indigo-400 transition-colors relative z-10">Target Domain</p>
                        <p className="text-xl md:text-2xl font-black text-white italic uppercase truncate max-w-[110px] md:max-w-[160px] tracking-tighter relative z-10">{auditData?.url || 'AWAIT_DATA'}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto space-y-12 md:space-y-20 relative z-10">
                {/* Input Engine */}
                <div className="bg-[#0f0f11]/80 border border-white/10 rounded-3xl md:rounded-[48px] p-6 md:p-12 relative overflow-hidden group backdrop-blur-2xl shadow-2xl">
                    <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000 grayscale text-indigo-500">
                        <Target size={400} />
                    </div>
                    <div className="relative space-y-6 md:space-y-10">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_15px_40px_-10px_rgba(79,70,229,0.8)] border border-white/10 shrink-0">
                                <Search className="text-white" size={20} md-size={24} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">Forensic Entry</h2>
                                <p className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">SYNC NEURAL MATRIX :: STANDBY</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Target Brand Name or URL"
                                    className="w-full h-12 md:h-14 bg-white/[0.03] border-2 border-white/5 rounded-xl md:rounded-2xl px-4 md:px-6 text-white focus:border-indigo-600 focus:bg-white/[0.05] outline-none transition-all font-bold text-sm md:text-base placeholder:text-gray-700"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isAuditing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">{isAuditing ? 'SCAN_ACTIVE' : 'READY_ACQ'}</span>
                                </div>
                            </div>
                            <Button
                                onClick={handleAudit}
                                disabled={isAuditing}
                                className="h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] shadow-[0_15px_40px_-5px_rgba(79,70,229,0.4)] flex items-center justify-center gap-3.5 transition-all border-none"
                            >
                                {isAuditing ? <Activity className="animate-spin text-white" size={18} md-size={20} /> : <Zap size={18} md-size={20} className="fill-current" />}
                                <span>{isAuditing ? 'ENGAGING...' : 'INITIALIZE'}</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Industrial Pillars grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4 md:px-6">
                        <div className="flex items-center gap-3">
                            <LayoutDashboard className="text-indigo-500" size={14} />
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Forensic Pillars</h3>
                        </div>
                        <div className="h-px bg-white/5 flex-1 mx-4 md:mx-6" />
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">Protocol: All Nodes</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { id: 'seo', title: "Search Dominance", icon: <Search size={20} />, color: "from-emerald-600/20" },
                            { id: 'scaling', title: "Trajectory Map", icon: <TrendingUp size={20} />, color: "from-blue-600/20" },
                            { id: 'kpi', title: "Metric Engine", icon: <Activity size={20} />, color: "from-amber-600/20" },
                            { id: 'niche', title: "Sector Command", icon: <Target size={20} />, color: "from-rose-600/20" },
                            { id: 'ai_pulse', title: "AI Neural Core", icon: <Brain size={20} />, color: "from-indigo-600/20" },
                            { id: 'tech', title: "Stack Forensics", icon: <ShieldCheck size={20} />, color: "from-purple-600/20" }
                        ].map((pillar) => {
                            const data = auditData?.pillars?.[pillar.id] || {};
                            return (
                                <motion.div
                                    key={pillar.id}
                                    whileHover={{ y: -5, scale: 1.01 }}
                                    onClick={() => setActivePillar(pillar.id)}
                                    className={`bg-[#111114]/60 border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-[36px] space-y-6 md:space-y-8 cursor-pointer group hover:bg-gradient-to-br ${pillar.color} to-transparent transition-all backdrop-blur-xl shadow-xl`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all shrink-0">
                                            {pillar.icon}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1 group-hover:text-gray-400">Node Sync</p>
                                            <p className="text-xl md:text-2xl font-black text-white italic tracking-tighter">{data.score || 0}%</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-base md:text-lg font-bold text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{pillar.title}</h4>
                                        <p className="text-[10px] md:text-[11px] text-gray-500 font-bold leading-relaxed line-clamp-2 uppercase tracking-tight">
                                            {data.details || "Awaiting target acquisition..."}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 text-[9px] font-black text-indigo-400/50 uppercase tracking-[0.3em] group-hover:text-indigo-400 transition-all">
                                        <div className="w-6 h-px bg-indigo-500/20 group-hover:w-10 transition-all" />
                                        LINK_NODE
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Table Override */}
                <div className="bg-[#111114]/60 border border-white/5 rounded-3xl md:rounded-[48px] overflow-hidden backdrop-blur-2xl shadow-2xl">
                    <div className="p-6 md:p-12 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                        <div className="space-y-2">
                            <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3 md:gap-4">
                                <ShieldCheck className="text-indigo-500" size={24} />
                                Override Protocols
                            </h3>
                            <p className="text-[9px] md:text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">MARKET_GAP_ANALYSIS :: VECTORS</p>
                        </div>
                        <Button variant="outline" className="h-10 md:h-12 rounded-xl border-white/10 px-4 md:px-6 font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-white hover:text-black">
                            EXPORT_BATTLE_PLAN
                        </Button>
                    </div>
                    <div className="flex flex-col">
                        <div className="hidden md:flex items-center justify-between px-12 py-6 bg-white/[0.01] border-b border-white/5">
                            <div className="flex-1 text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">Strategic Rival</div>
                            <div className="flex-1 text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">Forensic Gap</div>
                            <div className="w-40 text-right text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">Penetration Alpha</div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {(auditData?.competitors || []).map((comp: any, idx: number) => (
                                <div key={idx} className="flex flex-col md:flex-row md:items-center p-6 md:px-12 md:py-8 hover:bg-white/[0.02] transition-colors group gap-4 md:gap-0">
                                    <div className="flex-1 flex items-center gap-3 md:gap-4">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:text-white transition-colors shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p className="font-black text-white italic uppercase tracking-tighter text-sm md:text-base">{comp.name}</p>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight line-clamp-1">{comp.gap}</p>
                                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500/40 rounded-full" style={{ width: '65%' }} />
                                        </div>
                                    </div>
                                    <div className="md:w-40 md:text-right self-start md:self-auto">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                            +{comp.opportunity || '0.0'}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Intelligence Stats */}
                {auditData && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Estimated Spend", val: auditData.marketing_insights?.spend_est || "$--/mo", icon: <TrendingUp size={22} />, color: "text-emerald-500", sub: "Ad Capital" },
                            { label: "Neural Sync", val: auditData.marketing_insights?.peak_times || "ACTIVE", icon: <Activity size={22} />, color: "text-amber-500", sub: "Engagement" },
                            { label: "Footprint", val: (auditData.marketing_insights?.platforms?.length || 0) + " CH", icon: <Globe size={22} />, color: "text-purple-500", sub: "Global Reach" },
                            { label: "Dominance", val: (auditData.score || 0) + "%", icon: <Target size={22} />, color: "text-indigo-500", sub: "Market Power" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-[#111114]/60 border border-white/5 rounded-2xl md:rounded-[32px] p-6 md:p-8 relative overflow-hidden group hover:bg-white/[0.05] transition-all backdrop-blur-2xl shadow-xl">
                                <div className={`absolute top-6 right-6 md:top-8 md:right-8 ${stat.color} opacity-20 group-hover:opacity-100 transition-all`}>{stat.icon}</div>
                                <p className="text-[8px] md:text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-3 md:mb-4">{stat.label}</p>
                                <p className="text-2xl md:text-3xl font-black text-white italic tracking-tighter mb-1.5">{stat.val}</p>
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em]">{stat.sub}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Master Briefing & Global Pulse */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 bg-[#4f46e5] rounded-3xl md:rounded-[48px] p-6 sm:p-8 md:p-12 space-y-10 shadow-[0_40px_80px_-20px_rgba(79,70,229,0.5)] relative overflow-hidden group border border-white/20">
                        <div className="absolute -top-20 -right-20 p-24 opacity-20 blur-3xl pointer-events-none group-hover:scale-110 transition-transform">
                            <Sparkles size={500} />
                        </div>
                        <div className="relative space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl">
                                    <Sparkles className="text-white" size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none">Master Briefing</h3>
                                    <p className="text-indigo-100/60 font-black uppercase text-[9px] tracking-[0.4em]">TITAN_PROTOCOL_ALPHA</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[40px] shadow-2xl space-y-6">
                                <div className="flex items-center justify-between border-b border-indigo-50 pb-6">
                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <ChevronRight size={14} /> ACTIONABLE_DIRECTIVE
                                    </p>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white text-[8px] font-black rounded-lg tracking-widest uppercase">Protocol Alpha</div>
                                </div>
                                {auditData ? (
                                    renderStrategySteps(auditData.strategy)
                                ) : (
                                    <p className="text-black text-xl font-bold leading-relaxed italic tracking-tight">
                                        TITAN core online. Awaiting target parameters for 5-step strategic roadmap...
                                    </p>
                                )}
                            </div>

                            {auditData && (
                                <div className="flex items-center gap-4">
                                    <Button className="flex-1 h-16 bg-white text-indigo-600 hover:bg-neutral-100 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl">
                                        DEPLOY_TAKEOVER
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-[#111114]/60 border border-white/5 rounded-[40px] p-10 space-y-8 backdrop-blur-2xl shadow-xl">
                            <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em] flex items-center justify-between">
                                GLOBAL_PULSE <span>V3</span>
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: "Viral", icon: <Sparkles size={20} />, color: "text-pink-500" },
                                    { label: "X Pulse", icon: <Globe size={20} />, color: "text-blue-400" },
                                    { label: "Maps", icon: <Globe size={20} />, color: "text-blue-700" },
                                    { label: "Meta", icon: <Globe size={20} />, color: "text-blue-600" }
                                ].map((soc, i) => (
                                    <div key={i} className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] flex flex-col items-center gap-3 hover:bg-white/5 transition-all cursor-pointer group">
                                        <div className={`${soc.color} group-hover:scale-110 transition-transform`}>{soc.icon}</div>
                                        <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">{soc.label}</span>
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full h-12 bg-white/[0.03] border border-white/10 text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-widest rounded-xl">
                                ESTABLISH_GMB_LINK
                            </Button>
                        </div>

                        {auditData?.marketing_insights?.hashtags && (
                            <div className="bg-[#111114]/60 border border-white/5 rounded-[40px] p-8 space-y-4 backdrop-blur-2xl">
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em]">Viral Signal Matrix</p>
                                <div className="flex flex-wrap gap-2">
                                    {auditData.marketing_insights.hashtags.map((h: string) => (
                                        <span key={h} className="text-[9px] text-white/60 font-black italic px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 hover:text-white transition-colors">#{h}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Command History / Neural Archives */}
                {history.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] px-6">Neural Archives</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {history.slice(0, 3).map((h) => (
                                <div
                                    key={h._id}
                                    onClick={() => setAuditData(h)}
                                    className="p-6 bg-[#111114]/40 border border-white/5 rounded-[32px] flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-all group shadow-xl"
                                >
                                    <div className="flex items-center gap-4 truncate">
                                        <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xs font-black text-indigo-400 italic border border-indigo-500/20">
                                            {h.url?.substring(0, 2).toUpperCase() || 'NA'}
                                        </div>
                                        <div className="space-y-1 truncate">
                                            <p className="text-xs font-black text-white italic truncate max-w-[120px] uppercase tracking-tighter">{h.url}</p>
                                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{new Date(h.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .font-outline-2 {
                    -webkit-text-stroke: 1px rgba(79, 70, 229, 0.5);
                    color: transparent;
                }
                .animate-spin-slow {
                    animation: spin 15s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .scanline {
                    width:100%;
                    height:100px;
                    z-index:99;
                    background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(0, 0, 0, 0) 100%);
                    opacity: 0.1;
                    position: absolute;
                    bottom: 100%;
                    animation: scanline 8s linear infinite;
                }
                @keyframes scanline {
                    0% { bottom: 100%; }
                    100% { bottom: -100px; }
                }
            `}</style>
            <div className="scanline pointer-events-none" />
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
    );
}
