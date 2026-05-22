import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { TrendingUp, AlertCircle, Brain, ShieldCheck, Target, ArrowRight, Sparkles, Activity, Search, Zap, Cpu } from "lucide-react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from "@/components/ui/Button";
import axios from "axios";

export default function SkillGap() {
    const [loading, setLoading] = useState(true);
    const [auditRunning, setAuditRunning] = useState(false);
    const [data, setData] = useState<any>(null);
    const { scrollYProgress } = useScroll();
    const rotateValue = useTransform(scrollYProgress, [0, 1], [0, 90]);

    const fetchAnalysis = async () => {
        try {
            setAuditRunning(true);
            const token = localStorage.getItem('fbrts_token');
            const res = await axios.get('/api/growth/skill-gap', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                // Simulate neural processing time for cool effect
                setTimeout(() => {
                    setData(res.data.data);
                    setLoading(false);
                    setAuditRunning(false);
                }, 2000);
            }
        } catch (err) {
            console.error("Audit failed", err);
            setLoading(false);
            setAuditRunning(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, []);

    if (loading || auditRunning) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-12">
                <div className="relative">
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, 180, 360],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-40 h-40 rounded-full border-2 border-dashed border-indigo-500/30"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Brain size={64} className="text-indigo-500 animate-pulse shadow-[0_0_30px_rgba(99,102,241,0.5)]" />
                    </div>
                </div>
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-[1000] italic tracking-tighter uppercase text-white">Neural Audit Sequence</h2>
                    <p className="text-gray-500 font-mono text-[10px] tracking-[0.4em] uppercase animate-pulse">Scanning Profile • Comparing Market Data • Identifying Gaps</p>
                </div>
            </div>
        );
    }

    const chartData = data?.competencyMap?.map((c: any) => ({
        subject: c.subject,
        A: c.current,
        B: c.target,
        fullMark: c.fullMark
    })) || [];

    return (
        <div className="text-white space-y-60 animate-in fade-in zoom-in duration-700 max-w-7xl mx-auto pb-40 px-4 relative overflow-hidden">
            
            {/* --- SECTION 1: NEURAL HERO --- */}
            <header className="relative py-24 px-10 rounded-[3rem] bg-[#0A0A0B] border border-white/5 overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 duration-700">
                    <Brain size={250} className="text-indigo-500" />
                </div>
                
                <motion.div 
                    style={{ rotate: rotateValue }}
                    className="absolute -top-40 -left-40 w-96 h-96 border border-indigo-500/10 rounded-full pointer-events-none"
                />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 relative z-10">
                    <div className="space-y-8">
                        <div className="flex gap-4 items-center">
                            <div className="inline-flex px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 italic">
                                <Activity size={14} className="mr-2 animate-pulse" /> Neural Intelligence Report v4.0
                            </div>
                            <div className="inline-flex px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 italic">
                                READINESS: {data.readinessScore}%
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-[1000] italic tracking-tighter uppercase leading-none bg-gradient-to-r from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent pb-4">
                            CORE SKILL <br />
                            GAP ANALYSIS.
                        </h1>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                            <Target size={16} /> Target Role: <span className="text-indigo-400">{data.targetRole}</span>
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] flex items-center gap-10 shadow-2xl">
                        <div className="text-center">
                            <div className="text-4xl font-black text-white italic tracking-tighter">{data.readinessScore}%</div>
                            <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Global Sync</div>
                        </div>
                        <div className="w-px h-12 bg-white/10" />
                        <Button
                            onClick={fetchAnalysis}
                            className="bg-indigo-600 hover:bg-white hover:text-black text-[11px] font-[1000] tracking-widest px-10 h-16 rounded-2xl transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] border-none"
                        >
                            RE-SCAN CORE
                        </Button>
                    </div>
                </div>
            </header>

            {/* --- SECTION 2: COMPETENCY LANDSCAPE --- */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-10 rounded-[3rem] border border-white/5 bg-[#0a0a0c] relative group overflow-hidden shadow-2xl"
                >
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full" />
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 relative z-10">
                            <TrendingUp size={16} className="text-indigo-400" /> Neural Landscape
                        </h3>
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Current</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border border-dashed border-white/40 rounded-full" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Market</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[450px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid stroke="#ffffff10" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 900 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Current"
                                    dataKey="A"
                                    stroke="#818cf8"
                                    strokeWidth={3}
                                    fill="url(#radarGradient)"
                                    fillOpacity={0.6}
                                />
                                <Radar
                                    name="Target"
                                    dataKey="B"
                                    stroke="#ffffff15"
                                    strokeWidth={2}
                                    fill="#ffffff05"
                                    fillOpacity={0.1}
                                    strokeDasharray="4 4"
                                />
                                <defs>
                                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#050505', borderColor: '#333', borderRadius: '16px', border: '1px solid #ffffff10', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* --- SECTION 3: PRIORITY INTELLIGENCE --- */}
                <div className="space-y-10">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                            <AlertCircle size={24} className="text-pink-500 animate-pulse" /> PRIORITY_GAPS.
                        </h3>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.3em] pb-6 border-b border-white/5">Actionable Intel for Immediate Deployment</p>
                    </div>

                    <div className="grid gap-6">
                        {data.priorityActions.map((skill: any, idx: number) => (
                            <motion.div
                                key={skill.name}
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex flex-col gap-6 hover:border-indigo-500/30 transition-all hover:bg-indigo-500/5 shadow-2xl"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${skill.status === 'critical' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xl italic uppercase tracking-tighter text-white">{skill.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1 italic">{skill.remediation}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-indigo-400 italic">{skill.current}% / <span className="text-gray-700">{skill.required}%</span></div>
                                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter mt-2 inline-block ${skill.status === 'critical' ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-amber-500 text-black'
                                            }`}>
                                            {skill.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${skill.current}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`h-full rounded-full ${skill.status === 'critical' ? 'bg-pink-500' : 'bg-indigo-500'}`}
                                    />
                                    <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white] z-10" style={{ left: `${skill.required}%` }} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- SECTION 4: REMEDIATION DEPLOYMENT --- */}
            <section className="space-y-24">
                <div className="flex items-center gap-8">
                    <h3 className="text-3xl font-[1000] italic tracking-tighter uppercase text-white flex items-center gap-5 whitespace-nowrap">
                        <Sparkles className="text-indigo-400" /> BRIDGE LOGIC.
                    </h3>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {data.recommendations.map((course: any, idx: number) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            className="bg-[#0d0d0e] border border-white/5 p-10 rounded-[3rem] hover:border-indigo-500/40 transition-all group overflow-hidden relative shadow-2xl flex flex-col justify-between h-full"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity transform group-hover:rotate-45 duration-700">
                                <Cpu size={120} />
                            </div>

                            <div className="space-y-10 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
                                        {course.icon}
                                    </div>
                                    <span className="text-[9px] font-black font-mono text-indigo-500 bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/10 uppercase tracking-widest">{course.duration} SESSION</span>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-2xl font-black italic leading-none uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">
                                        {course.title}
                                    </h4>
                                    <p className="text-[10px] font-black tracking-[0.3em] text-[#00ff88] uppercase italic">{course.platform}</p>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
                                <Button className="w-full h-20 bg-white text-black hover:bg-indigo-600 hover:text-white font-[1000] uppercase italic tracking-[0.2em] text-[10px] rounded-2xl transition-all border-none group/btn">
                                    INITIATE_SYNC <ArrowRight size={18} className="ml-4 group-hover/btn:translate-x-3 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- SECTION 5: FINAL SYSTEM STATUS --- */}
            <section className="text-center py-20 border-t border-white/5">
                <div className="flex flex-wrap justify-center gap-16 font-black text-[10px] uppercase tracking-[0.6em] text-gray-800">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" /> NEURAL_SYNC: OK</div>
                    <div>GATEWAY_STABLE</div>
                    <div>INTEL_SECURE</div>
                    <div>AUDIT_V4.0_SIGNED</div>
                </div>
            </section>
        </div>
    )
}
