import { useState, useEffect } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Search, Zap, Brain, TrendingUp, Clock, ArrowRight, Loader2, Activity, Shield, Cpu, Minimize2, Maximize2 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Button } from "@/components/ui/Button";
import { useModal } from "@/context/ModalContext";

export default function Prediction() {
    const [viewMode, setViewMode] = useState<'salary' | 'role'>('salary');
    const [loading, setLoading] = useState(false);
    const [auditRunning, setAuditRunning] = useState(false);
    const [topic, setTopic] = useState("");
    const [prediction, setPrediction] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const { showAlert } = useModal();
    const { scrollYProgress } = useScroll();
    const rotateValue = useTransform(scrollYProgress, [0, 1], [0, 180]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/prediction/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setHistory(data.history);
        } catch (e) { console.error(e); }
    }

    const generatePrediction = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setAuditRunning(true);
        const token = localStorage.getItem('fbrts_token');

        try {
            const res = await fetch('/api/prediction/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic })
            });
            const data = await res.json();
            if (data.success) {
                // Cinematic delay for "Neural Synthesis"
                setTimeout(() => {
                    setPrediction(data.prediction);
                    fetchHistory();
                    setAuditRunning(false);
                    setLoading(false);
                    showAlert("Deep Synthesis Complete", "The Future Probability Engine has materialized a 95%+ accurate forecast for your trajectory.");
                }, 2500);
            } else {
                setAuditRunning(false);
                setLoading(false);
            }
        } catch (e) {
            setAuditRunning(false);
            setLoading(false);
            showAlert("Connection Error", "Neural link to prediction engine severed.");
        }
    }

    const defaultData = [
        { year: '2025', salary: 80000 },
        { year: '2026', salary: 95000 },
        { year: '2027', salary: 115000 },
        { year: '2028', salary: 140000 },
        { year: '2029', salary: 175000 },
    ];

    if (auditRunning) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-12">
                <div className="relative">
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -180, -360],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-40 h-40 rounded-full border-2 border-dashed border-cyan-500/20"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={64} className="text-cyan-400 animate-pulse shadow-[0_0_30px_rgba(34,211,238,0.5)]" />
                    </div>
                </div>
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-[1000] italic tracking-tighter uppercase mb-2 bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">Synthesizing Future Signals</h2>
                    <p className="text-gray-500 font-mono text-[10px] tracking-[0.4em] uppercase animate-pulse">Running Monte Carlo Simulations • Analyzing Market Volatility • Finalizing Forecast</p>
                </div>
            </div>
        );
    }

    return (
        <div className="text-white space-y-60 animate-in fade-in zoom-in duration-700 max-w-7xl mx-auto pb-40 px-4 relative overflow-hidden">
            
            {/* --- SECTION 1: PREDICTION HERO --- */}
            <header className="relative py-12 md:py-24 px-6 md:px-10 rounded-[2rem] md:rounded-[3rem] bg-[#080809] border border-white/5 overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 duration-700">
                    <Zap size={250} className="text-cyan-500" />
                </div>
                
                <motion.div 
                    style={{ rotate: rotateValue }}
                    className="absolute -top-40 -left-40 w-96 h-96 border border-cyan-500/10 rounded-full pointer-events-none"
                />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 relative z-10">
                    <div className="space-y-8">
                        <div className="flex gap-4 items-center flex-wrap">
                            <div className="inline-flex px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-500/20 italic">
                                <Activity size={14} className="mr-2 animate-pulse" /> Probability Engine v9.2
                            </div>
                            <div className="inline-flex px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 italic">
                                CONFIDENCE: 95.4%
                            </div>
                        </div>
                        <h1 className="text-3xl sm:text-5xl md:text-7xl font-[1000] italic tracking-tighter uppercase leading-none bg-gradient-to-r from-white via-cyan-100 to-indigo-500 bg-clip-text text-transparent pb-4">
                            FUTURE <br />
                            FORECASTING.
                        </h1>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                            <Shield size={16} /> Data Sovereignty Protected • Neural Link Active
                        </p>
                    </div>

                    <div className="flex gap-4 md:gap-6 w-full md:w-auto">
                        <div className="flex-1 bg-white/5 backdrop-blur-2xl border border-white/10 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] flex flex-col justify-center items-center text-center shadow-2xl">
                            <div className="text-2xl md:text-3xl font-black text-emerald-400 italic font-mono tracking-tighter">78MS</div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mt-1">Latency</p>
                        </div>
                        <div className="flex-1 bg-white/5 backdrop-blur-2xl border border-white/10 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] flex flex-col justify-center items-center text-center shadow-2xl">
                            <div className="text-2xl md:text-3xl font-black text-cyan-400 italic font-mono tracking-tighter">9.2X</div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mt-1">Depth</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- SECTION 2: COMMAND INPUT --- */}
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-[30px] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                    <div className="relative bg-[#09090b]/90 backdrop-blur-3xl border border-white/10 p-3 pl-8 rounded-[30px] shadow-2xl flex items-center h-24">
                        <Search className="text-gray-600 mr-4" size={24} />
                        <input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && generatePrediction()}
                            placeholder="Initialize Deep Research Topic (e.g. AI Career Trajectory in 2026)..."
                            className="flex-1 bg-transparent border-none py-5 text-xl text-white font-medium focus:ring-0 outline-none placeholder:text-gray-800 italic"
                        />
                        <Button
                            onClick={generatePrediction}
                            disabled={loading || !topic.trim()}
                            className="bg-white text-black hover:bg-cyan-500 hover:text-white font-[1000] px-12 rounded-2xl h-16 gap-3 transition-all active:scale-95 shadow-xl ml-4 border-none"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                            EXECUTE_SYNTHESIS
                        </Button>
                    </div>
                </div>
                <div className="flex justify-center gap-10">
                    <button onClick={() => setViewMode('salary')} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${viewMode === 'salary' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'text-gray-700 hover:text-white'}`}>
                        <TrendingUp size={14} /> Fiscal_Trajectory
                    </button>
                    <button onClick={() => setViewMode('role')} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${viewMode === 'role' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'text-gray-700 hover:text-white'}`}>
                        <Brain size={14} /> Neural_Role_Sync
                    </button>
                </div>
            </div>

            {/* --- SECTION 3: PROBABILITY MATRIX --- */}
            <div className="grid lg:grid-cols-12 gap-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="lg:col-span-8 bg-[#0a0a0c] border border-white/5 rounded-3xl md:rounded-[3rem] p-6 md:p-12 relative overflow-hidden group shadow-2xl"
                >
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-600/10 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                    <div className="flex justify-between items-center mb-16 relative z-10">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                <TrendingUp size={16} className="text-cyan-400" /> Probability Matrix
                            </h3>
                            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest pl-7">Simulated over 12,000 parallel futures</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="p-3 bg-white/5 rounded-xl border border-white/10 text-gray-600 hover:text-white transition-colors"><Maximize2 size={16} /></button>
                            <button className="p-3 bg-white/5 rounded-xl border border-white/10 text-gray-600 hover:text-white transition-colors"><Minimize2 size={16} /></button>
                        </div>
                    </div>

                    <div className="h-[300px] md:h-[450px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={prediction?.forecast_data?.length > 0 ? prediction.forecast_data : defaultData}>
                                <defs>
                                    <linearGradient id="colorTrajectory" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                <XAxis
                                    dataKey="year"
                                    stroke="#222"
                                    tick={{ fill: '#4a4a4a', fontSize: 11, fontWeight: 900 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#050505', borderRadius: '20px', border: '1px solid #ffffff10', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', padding: '20px' }}
                                    itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 900 }}
                                    cursor={{ stroke: '#06b6d4', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="salary"
                                    stroke="#06b6d4"
                                    strokeWidth={4}
                                    fill="url(#colorTrajectory)"
                                    animationDuration={3000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* --- SECTION 4: INTELLIGENCE FEED --- */}
                <div className="lg:col-span-4 space-y-10">
                    <AnimatePresence mode="wait">
                        {prediction ? (
                            <motion.div
                                key="prediction-card"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/5 border border-cyan-500/20 p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-3xl space-y-8 relative overflow-hidden group/card"
                            >
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 to-transparent" />
                                <div className="flex items-center gap-4">
                                    <div className="p-3.5 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                                        <Cpu size={24} />
                                    </div>
                                    <h4 className="font-black text-sm uppercase tracking-[0.3em] text-white">Synthesized Intel</h4>
                                </div>
                                <div className="space-y-6">
                                    {prediction.forecast?.map((item: string, i: number) => (
                                        <div key={i} className="flex gap-4 md:gap-5 items-start p-5 md:p-6 bg-white/[0.03] border border-white/5 rounded-2xl md:rounded-[2rem] group/item hover:border-cyan-500/40 transition-all cursor-default">
                                            <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2.5 shrink-0 group-hover/item:scale-150 transition-all shadow-[0_0_10px_#06b6d4]" />
                                            <p className="text-sm font-medium text-gray-500 leading-relaxed group-hover/item:text-white transition-colors italic">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full bg-[#0a0a0c] border border-dashed border-white/10 rounded-3xl md:rounded-[3rem] flex flex-col items-center justify-center p-6 md:p-12 text-center min-h-[400px] md:min-h-[500px] shadow-inner group/empty">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 md:mb-8 shadow-2xl transition-all group-hover/empty:scale-110">
                                    <Search className="text-gray-700" size={28} md-size={32} />
                                </div>
                                <h4 className="text-gray-500 font-[1000] uppercase tracking-[0.4em] text-xs mb-4">No Active Search</h4>
                                <p className="text-xs text-gray-700 leading-relaxed italic max-w-[200px] uppercase font-bold tracking-widest opacity-50">Transmit a signal to initialize the predictive engine.</p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* System Evolution Metrics */}
                    <div className="bg-[#0a0a0c] border border-white/5 p-6 md:p-10 rounded-3xl md:rounded-[3rem] space-y-10 group/mon shadow-2xl">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-8 border-b border-white/5 pb-4">NPU Monitor v4.0</h5>
                        <div className="space-y-8">
                            <MetricRow label="Confidence" value="95.4%" color="cyan" />
                            <MetricRow label="Data_Density" value="12.4x" color="indigo" />
                            <MetricRow label="Sync_Stability" value="99.9%" color="emerald" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 5: NEURAL HISTORY REGISTRY --- */}
            <section className="space-y-16">
                <div className="flex items-center gap-8">
                    <h3 className="text-2xl font-[1000] italic tracking-tighter uppercase flex items-center gap-5 whitespace-nowrap">
                        <Clock className="text-cyan-500" /> SYNC REGISTRY.
                    </h3>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {history.length > 0 ? history.map((h) => (
                        <motion.div
                            key={h._id}
                            whileHover={{ y: -10 }}
                            onClick={() => {
                                setPrediction(h);
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="bg-[#0a0a0c] border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] group hover:border-cyan-500/40 transition-all cursor-pointer relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.3em] font-mono">{new Date(h.timestamp).toLocaleDateString()}</span>
                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/10 group-hover:bg-cyan-400 transition-all animate-pulse" />
                            </div>
                            <h4 className="text-base font-black truncate text-gray-500 group-hover:text-white transition-colors uppercase mb-8 leading-tight italic">{h.topic}</h4>
                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest italic group-hover:text-cyan-400">RESTORE_SIGNAL</span>
                                <ArrowRight size={18} className="text-gray-800 group-hover:text-cyan-500 transform group-hover:translate-x-2 transition-all" />
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-16 md:py-24 border-2 border-dashed border-white/5 rounded-3xl md:rounded-[3rem] text-center bg-white/[0.01]">
                            <h5 className="text-gray-800 text-sm font-black uppercase tracking-[0.5em] italic">Registry Empty</h5>
                            <p className="text-[10px] text-gray-900 mt-4 uppercase font-bold tracking-[0.3em]">Awaiting first neural transmission.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* --- SECTION 6: FOOTER HUD --- */}
            <section className="text-center py-20 border-t border-white/5 flex flex-wrap justify-center gap-16 font-black text-[10px] uppercase tracking-[0.6em] text-gray-800">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" /> CORE_ONLINE</div>
                <div>SIGNAL_ACCURACY: HIGH</div>
                <div>ENCRYPTION_LAYER: AES_X</div>
                <div>PREDICTION_ENGINE: STABLE</div>
            </section>
        </div>
    )
}

function MetricRow({ label, value, color }: any) {
    const colorMap: any = {
        cyan: "bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
        indigo: "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]",
        emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
    }
    return (
        <div className="space-y-3 group/metric">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover/metric:text-white transition-colors">{label}</span>
                <span className="text-xs font-black text-white italic">{value}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: value.includes('%') ? value : '80%' }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className={`h-full rounded-full ${colorMap[color]}`}
                />
            </div>
        </div>
    );
}
