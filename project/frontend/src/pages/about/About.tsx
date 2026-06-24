import { ShieldCheck, Zap, Cpu, ChevronRight, Fingerprint, Box } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "../../components/ui/Button"

export default function About() {
    const { scrollYProgress } = useScroll();
    const rotateValue = useTransform(scrollYProgress, [0, 1], [0, 360]);

    return (
        <div className="pt-16 pb-12 px-6 max-w-7xl mx-auto space-y-12 md:space-y-16 text-white font-sans overflow-x-hidden relative">

            {/* --- SECTION 1: THE ORIGIN ENGINE --- */}
            <section className="relative flex flex-col items-center text-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    {/* Rotating Circular HUD Background */}
                    <motion.div
                        style={{ rotate: rotateValue }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-indigo-500/10 rounded-full -z-10"
                    />
                    <motion.div
                        style={{ rotate: rotateValue }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-purple-500/10 rounded-full -z-10"
                    />

                    <div className="space-y-6 relative z-10">
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">
                            <Fingerprint size={14} className="animate-pulse" /> NEURAL_IDENTITY_VALIDATED
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-8 uppercase italic">
                            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-cyan-400 animate-gradient-x drop-shadow-[0_0_20px_rgba(79,70,229,0.5)]">ARCHITECTS.</span>
                        </h1>
                    </div>
                </motion.div>

                <p className="text-base md:text-lg text-gray-400 font-medium leading-relaxed max-w-5xl mx-auto border-y border-white/5 py-10 px-10 italic">
                    "We didn't build just another website. We engineered a <span className="text-white font-black underline decoration-indigo-500 decoration-4 underline-offset-8">Robotic Prediction Engine</span> that solves the most complex variable in the universe: Human Potential."
                </p>
            </section>

            {/* --- SECTION 2: THE 3-PILLAR PROTOCOL --- */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_right,rgba(79,70,229,0.05)_0%,transparent_70%)] -z-10" />
                <RoboDetailCard
                    icon={<Cpu />}
                    title="DETERMINISTIC_LOGIC"
                    desc="While others guess, we calculate. Every roadmap node is backed by trillions of data points across global job markets, academic shifts, and tech evolution."
                    id="01"
                />
                <RoboDetailCard
                    icon={<Zap />}
                    title="INSTANT_SYNTHESIS"
                    desc="The time between your ambition and your execution is virtually zero. Our engine generates complete paths in sub-60 seconds."
                    id="02"
                    active
                />
                <RoboDetailCard
                    icon={<ShieldCheck />}
                    title="FAILURE_RECOVERY"
                    desc="Falling behind? The engine automatically re-architects your tomorrow tasks to recover lost velocity without overwhelming your neural capacity."
                    id="03"
                />
            </section>

            {/* --- SECTION 3: THE LABORATORY (History & Specs) --- */}
            <section className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 md:p-16 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 blur-[150px] group-hover:bg-indigo-600/20 transition-all duration-1000" />

                <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-10">
                        <div className="space-y-6">
                            <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-none">SYSTEM_ORIGIN.</h2>
                            <div className="h-1 w-32 bg-indigo-500" />
                            <p className="text-lg text-gray-500 font-medium leading-relaxed">
                                Born in 2025, developed by a guild of rogue architects who believed the traditional career path was fundamentally broken. We built the robot to mend the gap.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <SpecRow label="CORES_ACTIVE" value="4,096" />
                            <SpecRow label="THOUGHT_LATENCY" value="12ms" />
                            <SpecRow label="ETHICS_LAYER" value="v1.0_SIGNED" />
                            <SpecRow label="FOUNDER_TOKEN" value="MAYUR_S" />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="p-1 rounded-[3.5rem] bg-gradient-to-br from-indigo-500/10 via-white/5 to-purple-500/10">
                            <div className="bg-white/[0.02] rounded-[3.4rem] p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6 border border-white/5">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 6, repeat: Infinity }}
                                >
                                    <Box size={80} className="text-indigo-500/40" />
                                </motion.div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase">98% TRUST_RATING</h3>
                                    <p className="text-[10px] text-indigo-400 font-black tracking-[0.4em] uppercase">Based on 50,000+ Deployments</p>
                                </div>
                                <Button className="w-full bg-white text-black font-black uppercase tracking-widest text-[10px] py-8 rounded-2xl hover:bg-gray-200 transition-all shadow-2xl border-none">
                                    VERIFY_SYSTEM_DATA
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 4: GLOBAL SYNC --- */}
            <section className="max-w-4xl mx-auto text-center space-y-12">
                <div className="space-y-4">
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-[0.5em]">OPERATIONAL_FUTURE</span>
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase leading-none">AUTONOMOUS GROWTH.</h2>
                </div>
                <p className="text-lg text-gray-500 font-medium leading-relaxed italic border-l-4 border-indigo-500 pl-10 text-left">
                    "We are not here to teach. We are here to architect. We provide the map, you provide the momentum. Together, we are building a world where potential is never wasted due to poor navigation."
                </p>
                <div className="flex justify-center gap-12 text-gray-700 font-black text-[10px] uppercase tracking-[0.6em]">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" /> SYNCING...</div>
                    <div>MEM_OK</div>
                    <div>NET_STABLE</div>
                </div>
            </section>
        </div>
    )
}

function RoboDetailCard({ icon, title, desc, id, active }: any) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className={`p-10 rounded-[3rem] border transition-all duration-700 group relative overflow-hidden h-full ${active ? 'bg-indigo-600 border-indigo-500 shadow-[0_50px_100px_rgba(79,70,229,0.2)]' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10'}`}
        >
            <span className={`absolute top-10 right-10 text-[10px] font-black uppercase tracking-widest ${active ? 'text-white/40' : 'text-gray-800'}`}>ID_{id}</span>
            <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-10 transition-all duration-500 ${active ? 'bg-white text-indigo-600' : 'bg-white/[0.03] border border-white/5 text-gray-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'}`}>
                {icon}
            </div>
            <div className="space-y-6">
                <h3 className={`text-2xl font-black italic tracking-tighter uppercase ${active ? 'text-white' : 'text-white group-hover:text-indigo-400'}`}>{title}</h3>
                <p className={`text-sm font-medium leading-relaxed text-left ${active ? 'text-indigo-100' : 'text-gray-600 group-hover:text-gray-400'}`}>
                    {desc}
                </p>
            </div>
        </motion.div>
    )
}

function SpecRow({ label, value }: any) {
    return (
        <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-indigo-500/5 transition-all">
            <div className="flex items-center gap-4">
                <ChevronRight size={14} className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest group-hover:text-gray-400">{label}</span>
            </div>
            <span className="text-sm font-black text-white italic tracking-widest font-mono">{value}</span>
        </div>
    )
}
