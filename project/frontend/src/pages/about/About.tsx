import { ShieldCheck, Zap, Cpu, ChevronRight, Fingerprint, Box, Activity } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "../../components/ui/Button"

export default function About() {
    const { scrollYProgress } = useScroll();
    const rotateValue = useTransform(scrollYProgress, [0, 1], [0, 360]);

    return (
        <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-16 md:space-y-24 text-white font-sans overflow-x-hidden relative">

            {/* --- SECTION 1: THE ORIGIN ENGINE --- */}
            <section className="relative flex flex-col items-center text-center space-y-8 md:space-y-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    {/* Rotating Circular HUD Background */}
                    <motion.div
                        style={{ rotate: rotateValue }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-dashed border-indigo-500/10 rounded-full -z-10"
                    />
                    <motion.div
                        style={{ rotate: rotateValue }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-purple-500/10 rounded-full -z-10"
                    />

                    <div className="space-y-6 relative z-10">
                        <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">
                            <Fingerprint size={12} className="animate-pulse text-indigo-500" />
                            <span>NEURAL_IDENTITY_VALIDATED</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase italic">
                            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-pulse">ARCHITECTS.</span>
                        </h1>
                    </div>
                </motion.div>

                <p className="text-base md:text-lg text-gray-400 font-medium leading-relaxed max-w-4xl mx-auto border-y border-white/5 py-10 px-6 md:px-12 italic relative">
                    "We didn't build just another website. We engineered a <span className="text-white font-black underline decoration-indigo-500 decoration-4 underline-offset-8">Robotic Prediction Engine</span> that solves the most complex variable in the universe: Human Potential."
                </p>
            </section>

            {/* --- SECTION 2: THE 3-PILLAR PROTOCOL --- */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_right,rgba(79,70,229,0.05)_0%,transparent_70%)] -z-10" />
                <RoboDetailCard
                    icon={<Cpu size={28} />}
                    title="DETERMINISTIC_LOGIC"
                    desc="While others guess, we calculate. Every roadmap node is backed by trillions of data points across global job markets, academic shifts, and tech evolution."
                    id="01"
                />
                <RoboDetailCard
                    icon={<Zap size={28} />}
                    title="INSTANT_SYNTHESIS"
                    desc="The time between your ambition and your execution is virtually zero. Our engine generates complete paths in sub-60 seconds."
                    id="02"
                    active
                />
                <RoboDetailCard
                    icon={<ShieldCheck size={28} />}
                    title="FAILURE_RECOVERY"
                    desc="Falling behind? The engine automatically re-architects your tomorrow tasks to recover lost velocity without overwhelming your neural capacity."
                    id="03"
                />
            </section>

            {/* --- SECTION 3: THE LABORATORY (History & Specs) --- */}
            <section className="bg-[#020204]/90 border border-white/5 rounded-[3rem] p-8 md:p-16 relative overflow-hidden group shadow-[inset_0_0_30px_rgba(79,70,229,0.02)]">
                {/* Background Scan lines */}
                <div className="absolute inset-0 bg-cyber-dots opacity-[0.05] pointer-events-none" />
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 blur-[150px] group-hover:bg-indigo-600/20 transition-all duration-1000" />

                <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                                SYSTEM_ORIGIN_SPECIFICATION
                            </span>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-none">SYSTEM_ORIGIN.</h2>
                            <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed">
                                Born in 2025, developed by a guild of rogue architects who believed the traditional career path was fundamentally broken. We built the robot to mend the gap.
                            </p>
                        </div>

                        {/* Animated Spec rows */}
                        <div className="grid gap-3">
                            <SpecRow label="CORES_ACTIVE" value="16,384 // HYPER_THREADED" />
                            <SpecRow label="THOUGHT_LATENCY" value="12ms // REAL_TIME" />
                            <SpecRow label="ETHICS_LAYER" value="v1.0_SIGNED" />
                            <SpecRow label="FOUNDER_TOKEN" value="SAVALIYA_MAYUR" />
                        </div>
                    </div>

                    {/* Trust Rating Engine (Scanner/Hologram style) */}
                    <div className="relative">
                        <div className="p-1 rounded-[3.5rem] bg-gradient-to-br from-indigo-500/10 via-white/5 to-purple-500/10 shadow-2xl">
                            <div className="bg-[#050508]/80 rounded-[3.4rem] p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6 border border-white/5 relative overflow-hidden group/box">
                                {/* Sweep scanner laser */}
                                <motion.div
                                    animate={{ y: ["-100%", "200%"] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-x-0 h-px bg-cyan-400 opacity-60 shadow-[0_0_8px_rgba(34,211,238,0.8)] pointer-events-none"
                                />

                                {/* Floating Concentric rings behind Box */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="w-40 h-40 rounded-full border border-dashed border-indigo-400"
                                    />
                                </div>

                                <motion.div
                                    animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative z-10"
                                >
                                    <Box size={72} className="text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                                </motion.div>
                                <div className="space-y-2 relative z-10">
                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">98% TRUST_RATING</h3>
                                    <p className="text-[9px] text-cyan-400 font-black tracking-[0.4em] uppercase">Based on 50,000+ Deployments</p>
                                </div>
                                <Button className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] py-6 rounded-2xl hover:bg-white hover:text-black transition-all hover:scale-105 shadow-[0_0_30px_rgba(79,70,229,0.3)] border-none relative overflow-hidden group/btn">
                                    <motion.span 
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent skew-x-12 pointer-events-none"
                                    />
                                    <div className="flex items-center justify-center gap-2 relative z-10">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span>VERIFY_SYSTEM_DATA</span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 4: GLOBAL SYNC --- */}
            <section className="max-w-4xl mx-auto text-center space-y-12">
                <div className="space-y-4">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                        OPERATIONAL_FUTURE
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase leading-none">AUTONOMOUS GROWTH.</h2>
                </div>
                
                {/* Glassmorphic quote card */}
                <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden text-left border-l-4 border-l-indigo-500 shadow-xl group">
                    <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity size={80} className="text-indigo-400" />
                    </div>
                    
                    <p className="text-base md:text-lg text-gray-400 font-medium leading-relaxed italic relative z-10">
                        "We are not here to teach. We are here to architect. We provide the map, you provide the momentum. Together, we are building a world where potential is never wasted due to poor navigation."
                    </p>
                </div>

                <div className="flex justify-center flex-wrap gap-8 text-gray-700 font-black text-[9px] uppercase tracking-[0.5em] select-none">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                        SYNCING_COGNITIVE_NODE...
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        MEM_INTEGRITY_OK
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        NET_PIPELINE_STABLE
                    </div>
                </div>
            </section>
        </div>
    )
}

function RoboDetailCard({ icon, title, desc, id, active }: any) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`p-10 rounded-[3rem] border transition-all duration-700 group relative overflow-hidden h-full ${active ? 'bg-indigo-600 border-indigo-500 shadow-[0_50px_100px_rgba(79,70,229,0.25)]' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-indigo-500/20 hover:shadow-[0_15px_40px_rgba(99,102,241,0.05)]'}`}
        >
            <span className={`absolute top-10 right-10 text-[9px] font-mono tracking-widest ${active ? 'text-white/40' : 'text-gray-800'}`}>ID_{id}</span>
            <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center mb-8 transition-all duration-500 ${active ? 'bg-white text-indigo-600' : 'bg-white/[0.03] border border-white/5 text-gray-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'}`}>
                {icon}
            </div>
            <div className="space-y-4">
                <h3 className={`text-xl font-black italic tracking-tighter uppercase ${active ? 'text-white' : 'text-white group-hover:text-indigo-400'}`}>{title}</h3>
                <p className={`text-xs md:text-sm font-medium leading-relaxed text-left ${active ? 'text-indigo-100' : 'text-gray-400 group-hover:text-gray-300'}`}>
                    {desc}
                </p>
            </div>
        </motion.div>
    )
}

function SpecRow({ label, value }: any) {
    return (
        <motion.div 
            whileHover={{ x: 6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-indigo-500/5 hover:border-indigo-500/10 transition-all cursor-default select-none"
        >
            <div className="flex items-center gap-3">
                <ChevronRight size={12} className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest group-hover:text-gray-400 font-mono">{label}</span>
            </div>
            <span className="text-xs font-black text-white italic tracking-wider font-mono">{value}</span>
        </motion.div>
    )
}
