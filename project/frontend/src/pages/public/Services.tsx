import { Target, Cpu, BarChart, GraduationCap, ShieldCheck, Activity, Terminal, Layers, Globe, BookOpen, Check, X } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"

export default function Services() {
    return (
        <div className="pt-16 pb-12 px-6 max-w-7xl mx-auto space-y-12 md:space-y-16 text-white font-sans overflow-x-hidden relative">

            {/* --- GLOBAL SCANOVERLAY --- */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.02]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            </div>

            {/* --- SECTION 1: MODULE SELECTION --- */}
            <section className="text-center max-w-5xl mx-auto space-y-12 relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/10 text-[10px] font-black uppercase tracking-[0.6em] text-cyan-400 backdrop-blur-md">
                        <Activity size={14} className="animate-pulse" /> SYSTEM_MODULES_ONLINE
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black leading-none tracking-tighter uppercase italic drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        CORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 animate-gradient-x">ENGINES.</span>
                    </h1>
                </motion.div>

                <p className="text-lg text-gray-500 font-medium max-w-3xl mx-auto leading-relaxed border-l-4 border-cyan-500/30 pl-10 italic">
                    "Every professional mission requires a specific set of operational parameters. We've synthesized specialized engines for your unique trajectory."
                </p>
            </section>

            {/* --- SECTION 2: THE TECH STACK GRID --- */}
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                <RoboModule
                    icon={<GraduationCap />}
                    title="ACADEMIC_OS"
                    category="Education Sync"
                    desc="For students navigating the jump from degree to industry. Calculates the shortest path to high-tier employment."
                    specs={["Intern_Sync", "Core_Gaps", "Uni_Bridge"]}
                    id="MOD_01"
                    color="cyan"
                />
                <RoboModule
                    icon={<Target />}
                    title="PIVOT_X"
                    category="Career Transition"
                    desc="The ultimate bridge for industry switchers. Maps transferable neural patterns and bridges data gaps."
                    specs={["Skill_Mapping", "Zero_Loss", "Bridge_V1"]}
                    id="MOD_02"
                    color="indigo"
                />
                <RoboModule
                    icon={<Cpu />}
                    title="ELITE_SYST"
                    category="Exec_Growth"
                    desc="Advanced upskilling for top-tier professionals. Focuses on leadership logic and niche technical dominance."
                    specs={["Lead_Logic", "Niche_Deep", "Exec_Sync"]}
                    id="MOD_03"
                    color="purple"
                />
                <RoboModule
                    icon={<BookOpen />}
                    title="EXAM_PULSE"
                    category="Testing Logic"
                    desc="Industrial-grade preparation engine for competitive exams. Optimizes memory retention cycles."
                    specs={["Memo_Sync", "Revision_Loop", "Prob_Log"]}
                    id="MOD_04"
                    color="emerald"
                />
                <RoboModule
                    icon={<BarChart />}
                    title="QUANT_PORT"
                    category="Portfolio Base"
                    desc="Build proof-of-work that satisfies current algorithmic recruiter screening. Quality over quantity."
                    specs={["POW_Verify", "Alg_Check", "Rec_Sync"]}
                    id="MOD_05"
                    color="amber"
                />
                <RoboModule
                    icon={<Globe />}
                    title="VENTURE_OS"
                    category="Founder Mode"
                    desc="Operational strategies for building products from zero. Roadmap from MVP to market dominance."
                    specs={["MVP_Logic", "Mkt_Sync", "Scale_Path"]}
                    id="MOD_06"
                    color="rose"
                />
            </section>

            {/* --- SECTION 3: DEEP TECH HUD --- */}
            <section className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 md:p-16 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] -z-10" />

                <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-10 text-left">
                        <div className="space-y-4">
                            <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-none">TECH_SPECS.</h2>
                            <p className="text-xs font-black uppercase tracking-[0.4em] text-cyan-500">Universal Engine Features</p>
                        </div>

                        <div className="grid gap-8">
                            <DeepFeature
                                icon={<Terminal />}
                                title="Deterministic Scheduling"
                                desc="The system calculates the cognitive load of every task to prevent neural burnout."
                            />
                            <DeepFeature
                                icon={<ShieldCheck />}
                                title="Fault-Tolerant Re-Paths"
                                desc="Failed a milestone? The engine re-routes your future tasks instantaneously."
                            />
                            <DeepFeature
                                icon={<Layers />}
                                title="Multimodal Intel"
                                desc="We aggregate data from 200+ industry APIs to keep your path verified."
                            />
                        </div>
                    </div>

                    <div className="relative aspect-square max-w-md mx-auto">
                        <div className="absolute inset-0 bg-white shadow-[0_0_100px_rgba(255,255,255,0.05)] rounded-[3rem] p-8 flex flex-col items-center justify-center text-center space-y-6 group-hover:rotate-3 transition-transform duration-700 bg-white/[0.01] border border-white/5">
                            <div className="w-24 h-1 bg-cyan-500/50" />
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-tight">READY TO <br /> INITIALIZE <br /> <span className="text-cyan-400">MODULE?</span></h3>
                            <Button className="w-full h-24 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-cyan-50 transition-all shadow-2xl border-none">
                                ACTIVATE_MODULES
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 4: SYSTEM STATS --- */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto pt-16 border-t border-white/5">
                <MiniStat label="THROUGHPUT" value="4.2 GB/S" />
                <MiniStat label="AVAILABILITY" value="99.99%" />
                <MiniStat label="NODES_LINKED" value="12,042" />
                <MiniStat label="SEC_PRT" value="AES-256" />
            </section>

            {/* --- SECTION 5: THE COMPARISON MATRIX (Differentiator) --- */}
            <section className="py-16 md:py-24 space-y-16">
                <div className="text-center space-y-4">
                    <span className="text-cyan-500 font-black uppercase tracking-[0.4em] text-[10px]">competitive_advantage</span>
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                        THE <span className="text-gray-700">GAP.</span>
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <th className="py-6 text-left">Industrial Feature</th>
                                <th className="py-6 text-center text-gray-700">Traditional Mentor</th>
                                <th className="py-6 text-center text-cyan-400 bg-cyan-500/5">Future BRTS (AI)</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium italic">
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

            {/* --- SECTION 6: REGIONAL DOMINANCE (The Map) --- */}
            <section className="py-16 md:py-24 relative group">
                <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight">GLOBAL <span className="text-gray-700">PRESENCE.</span></h2>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.3em]">Our neural nodes are distributed globally for zero latency.</p>
                    </div>

                    <div className="relative w-full aspect-video bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 overflow-hidden flex items-center justify-center">
                        <Globe size={300} className="text-white/5 animate-pulse-slow" />
                        <MapNode x="30%" y="40%" city="San Francisco" />
                        <MapNode x="70%" y="45%" city="London" />
                        <MapNode x="75%" y="60%" city="Surat" active={true} />
                        <MapNode x="85%" y="55%" city="Tokyo" />
                        <MapNode x="45%" y="70%" city="São Paulo" />
                    </div>
                </div>
            </section>

            {/* --- SECTION 7: SUCCESS LIFECYCLE --- */}
            <section className="py-16 md:py-24 space-y-16">
                <div className="text-center space-y-4">
                    <span className="text-cyan-500 font-black uppercase tracking-[0.4em] text-[10px]">operational_arc</span>
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
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
            <td className="py-8 text-gray-400 group-hover:text-white transition-colors">{feature}</td>
            <td className="py-8 text-center">{traditional ? <Check className="mx-auto text-gray-700" size={18} /> : <X className="mx-auto text-gray-900" size={18} />}</td>
            <td className="py-8 text-center bg-cyan-500/5">{future ? <Check className="mx-auto text-cyan-500" size={18} /> : <X className="mx-auto text-gray-900" size={18} />}</td>
        </tr>
    )
}

function MapNode({ x, y, city, active }: any) {
    return (
        <div
            className="absolute flex flex-col items-center gap-2 group/node cursor-default"
            style={{ left: x, top: y }}
        >
            <div className={`w-3 h-3 rounded-full border-2 border-white/20 transition-all group-hover/node:scale-150 ${active ? 'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,1)] animate-ping' : 'bg-gray-800'}`} />
            <span className={`text-[8px] font-black uppercase tracking-widest opacity-0 group-hover/node:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded backdrop-blur-md border border-white/10 ${active ? 'text-cyan-400' : 'text-gray-500'}`}>{city}</span>
        </div>
    )
}

function LifecycleStep({ num, title, desc }: any) {
    return (
        <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
            <span className="absolute top-8 right-8 text-4xl font-black italic text-white/5 group-hover:text-cyan-500/10 transition-colors">{num}</span>
            <h3 className="text-xl font-black italic uppercase italic tracking-tighter mb-4">{title}</h3>
            <p className="text-xs text-gray-600 font-medium group-hover:text-gray-400 transition-colors uppercase italic leading-loose tracking-widest">{desc}</p>
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
        <div className="p-10 rounded-[3rem] bg-[#050505]/50 border border-white/5 hover:bg-white/[0.03] transition-all duration-700 group flex flex-col h-full relative overflow-hidden shadow-2xl">
            <div className="absolute top-8 right-8 text-[9px] font-black font-mono text-gray-800 opacity-50 group-hover:opacity-100 group-hover:text-white transition-all">{id}</div>

            <div className={`w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-10 transition-all duration-500 ${colorMap[color] && colorMap[color].split(' ')[0]} group-hover:text-white group-hover:rotate-12`}>
                {icon}
            </div>

            <div className="space-y-6 flex-1">
                <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 italic">{category}</span>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase group-hover:text-white transition-colors">{title}</h3>
                </div>
                <p className="text-sm font-medium leading-relaxed text-gray-500 group-hover:text-gray-300 transition-colors text-left border-l border-white/5 pl-6">
                    {desc}
                </p>
            </div>

            <div className="pt-10 space-y-4">
                <div className="flex flex-wrap gap-2">
                    {specs.map((s: any) => (
                        <span key={s} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-gray-700 group-hover:text-gray-400 group-hover:border-white/20 transition-all">{s}</span>
                    ))}
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-0 group-hover:w-full transition-all duration-1000" />
                </div>
            </div>
        </div>
    )
}

function DeepFeature({ icon, title, desc }: any) {
    return (
        <div className="flex gap-8 group/df items-start">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-600 group-hover/df:bg-cyan-600 group-hover/df:text-white transition-all duration-500">{icon}</div>
            <div className="space-y-2">
                <h4 className="text-xl font-black italic uppercase tracking-tighter">{title}</h4>
                <p className="text-sm text-gray-600 group-hover:text-gray-400 transition-colors text-left font-medium">{desc}</p>
            </div>
        </div>
    )
}

function MiniStat({ label, value }: any) {
    return (
        <div className="flex flex-col gap-1 items-center md:items-start">
            <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest italic">{label}</span>
            <span className="text-xl font-black text-white italic tracking-tighter">{value}</span>
        </div>
    )
}
