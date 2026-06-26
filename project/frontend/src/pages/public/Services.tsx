import { Target, Cpu, BarChart, GraduationCap, ShieldCheck, Activity, Terminal, Layers, Globe, BookOpen, Check, X, Brain } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"

export default function Services() {
    return (
        <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-16 md:space-y-20 text-white font-sans overflow-x-hidden relative">

            {/* --- GLOBAL SCAN OVERLAY --- */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.02]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            </div>

            {/* --- SECTION 1: HEADER --- */}
            <section className="text-center max-w-5xl mx-auto space-y-6 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-cyan-500/5 border border-cyan-500/10 text-[9px] font-black uppercase tracking-[0.5em] text-cyan-400 backdrop-blur-md">
                        <Activity size={12} className="animate-pulse text-cyan-400" /> SYSTEM_MODULES_ONLINE
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter uppercase italic">
                        CORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 animate-gradient-x drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">ENGINES.</span>
                    </h1>
                </motion.div>

                <p className="text-sm md:text-base text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed border-l-2 border-cyan-500/30 pl-6 text-left italic">
                    "Every professional mission requires a specific set of operational parameters. We've synthesized specialized engines for your unique trajectory."
                </p>
            </section>

            {/* --- SECTION 2: THE TECH STACK GRID --- */}
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <RoboModule
                    icon={<GraduationCap size={24} />}
                    title="ACADEMIC_OS"
                    category="Education Sync"
                    desc="Engineered for students bridging the chasm between academic theory and corporate execution. Ingests university syllabi and exam history to map the absolute shortest prerequisite path to high-tier engineering roles."
                    specs={["Intern_Sync", "Core_Gaps", "Uni_Bridge"]}
                    id="MOD_01"
                    color="cyan"
                />
                <RoboModule
                    icon={<Target size={24} />}
                    title="PIVOT_X"
                    category="Career Transition"
                    desc="The ultimate non-linear bridge for career pivoters switching into high-tech fields. Extracts existing cognitive talent vectors, matches transferable technical patterns, and targets specific skill deficiencies."
                    specs={["Skill_Mapping", "Zero_Loss", "Bridge_V1"]}
                    id="MOD_02"
                    color="indigo"
                />
                <RoboModule
                    icon={<Cpu size={24} />}
                    title="ELITE_SYST"
                    category="Exec_Growth"
                    desc="Advanced strategic upskilling for senior technologists and directors. Focuses on system architecture patterns, engineering leadership models, Big Data orchestration pipelines, and niche high-yield technological dominance."
                    specs={["Lead_Logic", "Niche_Deep", "Exec_Sync"]}
                    id="MOD_03"
                    color="purple"
                />
                <RoboModule
                    icon={<BookOpen size={24} />}
                    title="EXAM_PULSE"
                    category="Testing Logic"
                    desc="An industrial-grade preparation engine designed for competitive testing and certifications. Employs a custom neural spaced-repetition loop, active Feynman teaching interfaces, and adaptive difficulty balancing."
                    specs={["Memo_Sync", "Revision_Loop", "Prob_Log"]}
                    id="MOD_04"
                    color="emerald"
                />
                <RoboModule
                    icon={<BarChart size={24} />}
                    title="QUANT_PORT"
                    category="Portfolio Base"
                    desc="Transforms passive projects into verified, recruiter-proof proof-of-work portfolios. Validates repository code logic, audits Big-O complexity, and generates interactive sandboxed demonstrations."
                    specs={["POW_Verify", "Alg_Check", "Rec_Sync"]}
                    id="MOD_05"
                    color="amber"
                />
                <RoboModule
                    icon={<Globe size={24} />}
                    title="VENTURE_OS"
                    category="Founder Mode"
                    desc="Operational blueprint strategies for scaling startups from zero to market dominance. Orchestrates development pipelines, generates modular MVPs, verifies market integration loops, and defines technical growth blueprints."
                    specs={["MVP_Logic", "Mkt_Sync", "Scale_Path"]}
                    id="MOD_06"
                    color="rose"
                />
            </section>

            {/* --- SECTION 3: DEEP TECH HUD --- */}
            <section className="bg-[#020204]/90 border border-white/5 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group shadow-[inset_0_0_30px_rgba(6,182,212,0.02)]">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] -z-10" />

                <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8 text-left">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-500">Universal Engine Features</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase text-white leading-none">TECH_SPECS.</h2>
                        </div>

                        <div className="grid gap-6">
                            <DeepFeature
                                icon={<Terminal size={20} />}
                                title="Deterministic Scheduling"
                                desc="The system calculates the cognitive load of every task to prevent neural burnout."
                            />
                            <DeepFeature
                                icon={<ShieldCheck size={20} />}
                                title="Fault-Tolerant Re-Paths"
                                desc="Failed a milestone? The engine re-routes your future tasks instantaneously."
                            />
                            <DeepFeature
                                icon={<Layers size={20} />}
                                title="Multimodal Intel"
                                desc="We aggregate data from 200+ industry APIs to keep your path verified."
                            />
                        </div>
                    </div>

                    <div className="w-full max-w-sm mx-auto relative">
                        <div className="p-1 rounded-[3rem] bg-gradient-to-br from-cyan-500/10 via-white/5 to-indigo-500/10">
                            <div className="bg-[#050508]/80 rounded-[2.9rem] p-8 flex flex-col items-center justify-center text-center space-y-6 border border-white/5 relative overflow-hidden">
                                {/* Sweep scanner laser */}
                                <motion.div
                                    animate={{ y: ["-100%", "200%"] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-x-0 h-px bg-cyan-400 opacity-60 shadow-[0_0_8px_rgba(34,211,238,0.8)] pointer-events-none"
                                />
                                
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="w-40 h-40 rounded-full border border-dashed border-cyan-400"
                                    />
                                </div>

                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative z-10"
                                >
                                    <Brain size={60} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
                                </motion.div>

                                <div className="space-y-2 relative z-10">
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase leading-tight text-white">READY TO INITIALIZE MODULES?</h3>
                                    <p className="text-[8px] text-gray-500 font-mono tracking-widest uppercase">SECURE_LINK // SYNC_OK</p>
                                </div>

                                <Button className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl hover:bg-white hover:text-black transition-all hover:scale-105 shadow-[0_0_30px_rgba(79,70,229,0.3)] border-none relative overflow-hidden">
                                    <motion.span 
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent skew-x-12 pointer-events-none"
                                    />
                                    <span>ACTIVATE_MODULES</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 4: SYSTEM STATS --- */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto pt-10 border-t border-white/5">
                <MiniStat label="THROUGHPUT" value="4.2 GB/S" />
                <MiniStat label="AVAILABILITY" value="99.99%" />
                <MiniStat label="NODES_LINKED" value="12,042" />
                <MiniStat label="SEC_PRT" value="AES-256" />
            </section>

            {/* --- SECTION 5: THE COMPARISON MATRIX (Differentiator) --- */}
            <section className="py-12 md:py-16 space-y-10">
                <div className="text-center space-y-3">
                    <span className="text-cyan-500 font-black uppercase tracking-[0.4em] text-[10px]">competitive_advantage</span>
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                        THE <span className="text-gray-700">GAP.</span>
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                <th className="py-4 text-left">Industrial Feature</th>
                                <th className="py-4 text-center text-gray-700">Traditional Mentor</th>
                                <th className="py-4 text-center text-cyan-400 bg-cyan-500/5">Future BRTS (AI)</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs font-medium italic">
                            <ComparisonRow feature="24/7 Neural Availability" traditional={false} future={true} />
                            <ComparisonRow feature="Real-time Industry Ingest" traditional={false} future={true} />
                            <ComparisonRow feature="Personalized Velocity Logic" traditional={true} future={true} />
                            <ComparisonRow feature="Deterministic Roadmap v2" traditional={false} future={true} />
                            <ComparisonRow feature="Multimodal Research Worker" traditional={false} future={true} />
                            <ComparisonRow feature="Global Resource Indexing" traditional={false} future={true} />
                        </tbody>
                    </table>
                </div>
            </section>

            {/* --- SECTION 7: SUCCESS LIFECYCLE --- */}
            <section className="py-12 md:py-16 space-y-10">
                <div className="text-center space-y-3">
                    <span className="text-cyan-500 font-black uppercase tracking-[0.4em] text-[10px]">operational_arc</span>
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                        SUCCESS <span className="text-gray-700">LIFECYCLE.</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                    <LifecycleStep
                        num="01"
                        title="INITIATE"
                        desc="Neural handshake and goal extraction."
                    />
                    <LifecycleStep
                        num="02"
                        title="ARCHITECT"
                        desc="Deployment of multi-stage roadmap."
                    />
                    <LifecycleStep
                        num="03"
                        title="EXECUTE"
                        desc="Daily task completion and verification."
                    />
                    <LifecycleStep
                        num="04"
                        title="DOMINATE"
                        desc="Market entry and career scaling."
                    />
                </div>
            </section>
        </div>
    )
}

function ComparisonRow({ feature, traditional, future }: any) {
    return (
        <tr className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
            <td className="py-5 text-gray-400 group-hover:text-white transition-colors">{feature}</td>
            <td className="py-5 text-center">{traditional ? <Check className="mx-auto text-gray-500" size={16} /> : <X className="mx-auto text-gray-900" size={16} />}</td>
            <td className="py-5 text-center bg-cyan-500/5">{future ? <Check className="mx-auto text-cyan-400" size={16} /> : <X className="mx-auto text-gray-900" size={16} />}</td>
        </tr>
    )
}

function LifecycleStep({ num, title, desc }: any) {
    return (
        <div className="p-8 rounded-[2rem] bg-[#020204]/90 border border-white/5 hover:border-cyan-500/20 transition-all group relative overflow-hidden">
            <span className="absolute top-6 right-6 text-3xl font-black italic text-white/5 group-hover:text-cyan-500/10 transition-colors font-mono">{num}</span>
            <h3 className="text-lg font-black italic uppercase tracking-tighter mb-3">{title}</h3>
            <p className="text-[10px] text-gray-500 font-medium group-hover:text-gray-400 transition-colors uppercase italic leading-relaxed tracking-wider">{desc}</p>
        </div>
    )
}

function RoboModule({ icon, title, category, desc, specs, id, color }: any) {
    const colorMap: any = {
        cyan: "text-cyan-400 border-cyan-400/20 group-hover:border-cyan-400 group-hover:bg-cyan-500",
        indigo: "text-indigo-400 border-indigo-400/20 group-hover:border-indigo-400 group-hover:bg-indigo-500",
        purple: "text-purple-400 border-purple-400/20 group-hover:border-purple-400 group-hover:bg-purple-500",
        emerald: "text-emerald-400 border-emerald-400/20 group-hover:border-emerald-400 group-hover:bg-emerald-500",
        amber: "text-amber-400 border-amber-400/20 group-hover:border-amber-400 group-hover:bg-amber-500",
        rose: "text-rose-400 border-rose-400/20 group-hover:border-rose-400 group-hover:bg-rose-500",
    }

    return (
        <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-8 rounded-[2.5rem] bg-[#020204]/90 border border-white/5 hover:bg-white/[0.02] hover:border-white/10 transition-all group flex flex-col h-full relative overflow-hidden shadow-2xl"
        >
            <div className="absolute top-6 right-6 text-[9px] font-black font-mono text-gray-800 opacity-50 group-hover:opacity-100 group-hover:text-white transition-all">{id}</div>

            <div className={`w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 transition-all duration-500 ${colorMap[color] && colorMap[color].split(' ')[0]} group-hover:text-white group-hover:rotate-12`}>
                {icon}
            </div>

            <div className="space-y-4 flex-1">
                <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 italic">{category}</span>
                    <h3 className="text-xl font-black italic tracking-tighter uppercase group-hover:text-white transition-colors">{title}</h3>
                </div>
                <p className="text-xs md:text-sm font-medium leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors text-left border-l border-white/5 pl-4">
                    {desc}
                </p>
            </div>

            <div className="pt-8 space-y-4">
                <div className="flex flex-wrap gap-2">
                    {specs.map((s: any) => (
                        <span key={s} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-400 group-hover:border-white/20 transition-all">{s}</span>
                    ))}
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-0 group-hover:w-full transition-all duration-1000" />
                </div>
            </div>
        </motion.div>
    )
}

function DeepFeature({ icon, title, desc }: any) {
    return (
        <motion.div 
            whileHover={{ x: 4 }}
            className="flex gap-6 group/df items-start"
        >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-600 group-hover/df:bg-cyan-600 group-hover/df:text-white transition-all duration-500">{icon}</div>
            <div className="space-y-1">
                <h4 className="text-lg font-black italic uppercase tracking-tighter">{title}</h4>
                <p className="text-xs md:text-sm text-gray-500 group-hover:text-gray-400 transition-colors text-left font-medium">{desc}</p>
            </div>
        </motion.div>
    )
}

function MiniStat({ label, value }: any) {
    return (
        <div className="flex flex-col gap-1 items-center md:items-start select-none">
            <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest italic">{label}</span>
            <span className="text-lg font-black text-white italic tracking-tighter">{value}</span>
        </div>
    )
}
