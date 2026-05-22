import { Rocket, Zap, Cpu, Terminal, Layers, Settings, Globe } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "../../components/ui/Button"

export default function HowItWorks() {
    return (
        <div className="py-32 px-6 max-w-7xl mx-auto text-white font-sans space-y-60 relative overflow-hidden">

            {/* --- TOP HUD --- */}
            <div className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-5xl flex justify-between px-10 text-[8px] font-black uppercase tracking-[0.6em] text-gray-800 pointer-events-none z-0">
                <div>PROTOCOL: PIPELINE_DEPLOYMENT</div>
                <div>LATENCY: 12ms</div>
                <div>NODES: SYNCED</div>
            </div>

            {/* --- SECTION 1: THE PIPELINE HEADER --- */}
            <section className="text-center max-w-4xl mx-auto space-y-16 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[150px] -z-10 animate-pulse" />
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">
                            <Settings size={14} className="animate-spin-slow" /> SYSTEM_ORCHESTRATION_LOADED
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black leading-[0.8] tracking-tighter uppercase italic drop-shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                            THE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-cyan-400 animate-gradient-x">
                                PROTOCOL.
                            </span>
                        </h1>
                    </div>
                </motion.div>

                <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto border-y border-white/5 py-10 italic">
                    "From raw ambition to operational reality. We take your intent and process it through a deterministic 4-stage deployment pipeline."
                </p>
            </section>

            {/* --- SECTION 2: THE 4-STAGE PIPELINE (Vertical High-Dam) --- */}
            <section className="relative max-w-5xl mx-auto">
                {/* Connection Spine */}
                <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent opacity-20 hidden md:block" />

                <div className="space-y-40 relative z-10">
                    <PipelineStep
                        num="01"
                        title="INPUT_CAPTURE"
                        label="PROTOCOL_A"
                        desc="You provide your target career objective. The engine parses your intent, emotional state, and current tech stack to establish the baseline."
                        icon={<Terminal />}
                        align="left"
                    />
                    <PipelineStep
                        num="02"
                        title="NEURAL_AUDIT"
                        label="PROTOCOL_B"
                        desc="Our engine performs a global deep-level scan across 1M+ live industry data points to identify the exact skill gaps missing in your arc."
                        icon={<Cpu />}
                        align="right"
                    />
                    <PipelineStep
                        num="03"
                        title="PATH_SYNTHESIS"
                        label="PROTOCOL_C"
                        desc="A multimodal roadmap is logically constructed. Every milestone is assigned a specific cognitive load and prerequisite score for maximum efficiency."
                        icon={<Layers />}
                        align="left"
                    />
                    <PipelineStep
                        num="04"
                        title="ACTIVE_DEPLOYMENT"
                        label="PROTOCOL_D"
                        desc="Your mission goes live. Daily tasks (TodayTasks) are pushed to your workspace, and the system monitors your progress in real-time."
                        icon={<Rocket />}
                        align="right"
                    />
                </div>
            </section>

            {/* --- SECTION 3: THE FEEDBACK LOOP (3D Card) --- */}
            <section className="bg-white/[0.01] border border-white/5 rounded-[4rem] p-12 md:p-32 grid lg:grid-cols-2 gap-32 items-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] -z-10 group-hover:opacity-100 opacity-50 transition-opacity" />

                <div className="space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-none">LOOP_SYNC.</h2>
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-indigo-500">Autonomous Recalibration Cycle</p>
                    </div>
                    <p className="text-xl text-gray-400 font-medium leading-relaxed">
                        The system never stops planning. It monitors your velocity and the market's evolution 24/7. If a skill becomes obsolete or you move faster than expected, the roadmap <span className="text-white font-black italic">self-heals.</span>
                    </p>
                    <div className="grid gap-6 border-l-2 border-indigo-500/20 pl-8">
                        <LoopFeature title="Real-time Industry Ingest" />
                        <LoopFeature title="Performance Metric Tracking" />
                        <LoopFeature title="Logic-Based Priority Shift" />
                    </div>
                </div>

                <div className="relative aspect-square max-w-md mx-auto perspective-[1000px]">
                    <motion.div
                        whileHover={{ rotateY: 20, rotateX: 10 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="w-full h-full rounded-[3rem] bg-white/[0.02] border border-white/10 shadow-[0_50px_80px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-16 space-y-10 border-indigo-500/20"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="w-48 h-48 rounded-full border border-dashed border-indigo-500/40 flex items-center justify-center"
                        >
                            <Zap size={60} className="text-white animate-pulse" />
                        </motion.div>
                        <div className="space-y-2 text-center">
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">AUTONOMOUS_READY</h3>
                            <p className="text-[10px] font-black uppercase text-gray-700 tracking-[0.3em]">System Health: Optimal</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- SECTION 4: CALL TO ACTION --- */}
            <section className="text-center py-40 space-y-16">
                <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-gray-800">READY TO DEPLOY UNIT?</h3>
                <div className="flex flex-col md:flex-row justify-center gap-6">
                    <Button className="px-16 py-10 bg-indigo-600 text-white font-black uppercase tracking-[0.4em] text-xs rounded-2xl hover:bg-white hover:text-black transition-all hover:scale-110 shadow-[0_0_50px_rgba(79,70,229,0.5)] border-none">
                        INIT_PIPELINE_HANDSHAKE
                    </Button>
                    <Button className="px-16 py-10 bg-transparent text-white border border-white/10 font-black uppercase tracking-[0.4em] text-xs rounded-2xl hover:bg-white/5 transition-all">
                        VIEW_DOCS
                    </Button>
                </div>
            </section>

            {/* --- SECTION 5: TECHNICAL DEPTH (The Spec) --- */}
            <section className="py-40 px-6 max-w-7xl mx-auto space-y-32">
                <div className="text-center space-y-4">
                    <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">under_the_hood</span>
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                        TECHNICAL <span className="text-gray-700">SPEC.</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-16">
                    <TechSpec
                        title="Multimodal Parsing"
                        desc="We don't just read text. Our engine analyzes PDFs, images, and code repositories to build a 360-degree view of your current expertise."
                        icon={<Layers size={24} />}
                    />
                    <TechSpec
                        title="Adaptive Velocity"
                        desc="Using time-series analysis, we track your completion speed and adjust future milestones to maintain a flow state without burnout."
                        icon={<Zap size={24} />}
                    />
                    <TechSpec
                        title="Live Scraping Layer"
                        desc="Connected to live job boards, news feeds, and repo updates. If a technology peaks or dies, your roadmap knows before you do."
                        icon={<Globe size={24} />}
                    />
                    <TechSpec
                        title="Neural Humanizer"
                        desc="Proprietary personality layer that blends technical rigor with empathetic mentorship, as designed by our Chief Architect."
                        icon={<Cpu size={24} />}
                    />
                </div>
            </section>

            {/* --- SECTION 6: RECALIBRATION DEMO (Visual) --- */}
            <section className="py-40 relative group bg-indigo-600/5 rounded-[5rem] border border-white/5 mx-6">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-20 p-12 md:p-24">
                    <div className="md:w-1/2 space-y-8">
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight text-white">RE-ROUTING <br /> <span className="text-indigo-400">ACTIVE.</span></h2>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed italic">
                            "In a global industry, stability is a myth. Our engine is built to embrace volatility. When the market shifts, we re-architect your future in milliseconds."
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Dynamic Milestone Shifting</li>
                            <li className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Automated Skill Gap Patching</li>
                            <li className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Predictive Trend Alignment</li>
                        </ul>
                    </div>
                    <div className="md:w-1/2 relative">
                        <div className="w-full aspect-square bg-[#050505] rounded-[3rem] border border-white/10 p-8 flex flex-col gap-4 overflow-hidden relative shadow-3xl">
                            {/* Mock Task Recalibration UI */}
                            <div className="h-20 w-full bg-white/5 rounded-2xl border-l-4 border-indigo-500 p-4 opacity-50">
                                <div className="h-2 w-24 bg-indigo-500/50 rounded mb-2" />
                                <div className="h-4 w-40 bg-white/10 rounded" />
                            </div>
                            <div className="h-20 w-full bg-indigo-500/20 rounded-2xl border-l-4 border-white p-4 animate-pulse">
                                <div className="h-2 w-32 bg-white/50 rounded mb-2" />
                                <div className="h-4 w-48 bg-white/20 rounded" />
                                <div className="absolute top-4 right-4 text-[8px] font-black uppercase text-indigo-400">CALIBRATING...</div>
                            </div>
                            <div className="h-20 w-full bg-white/5 rounded-2xl border-l-4 border-gray-800 p-4 opacity-30 mt-10">
                                <div className="h-2 w-20 bg-gray-500/30 rounded" />
                            </div>
                            {/* Decorative Lines */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none opacity-20" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function TechSpec({ title, desc, icon }: any) {
    return (
        <div className="p-10 rounded-[3rem] bg-white/[0.01] border border-white/5 hover:border-indigo-500/20 transition-all group">
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all w-fit mb-8">
                {icon}
            </div>
            <h3 className="text-xl font-black italic uppercase italic tracking-tighter mb-4">{title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed group-hover:text-gray-300 transition-colors">{desc}</p>
        </div>
    )
}

function PipelineStep({ num, title, label, desc, icon, align }: any) {
    const isLeft = align === 'left';
    return (
        <div className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 relative ${isLeft ? '' : 'md:flex-row-reverse'}`}>
            {/* Center Connection Point */}
            <div className="absolute left-10 md:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#050505] border-4 border-indigo-600 z-20 hidden md:block" />

            <div className={`md:w-1/2 space-y-8 ${isLeft ? 'md:text-right' : 'md:text-left'} pl-20 md:pl-0`}>
                <motion.div
                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                >
                    <div className={`flex items-center gap-4 ${isLeft ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{label}</span>
                        <div className="w-12 h-px bg-indigo-500/20" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white leading-none">
                        <span className="text-white/20 mr-4 font-mono not-italic">{num}.</span>
                        {title}
                    </h3>
                    <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
                        {desc}
                    </p>
                </motion.div>
            </div>

            <div className="md:w-1/2 flex justify-center md:justify-start">
                <div className={`w-32 h-32 md:w-56 md:h-56 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center text-indigo-500 drop-shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:bg-indigo-600 hover:text-white transition-all duration-700 hover:scale-105 group ${isLeft ? 'md:mr-56' : 'md:ml-56'}`}>
                    <div className="group-hover:rotate-12 transition-transform duration-500">{icon}</div>
                </div>
            </div>
        </div>
    )
}

function LoopFeature({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-4 group cursor-default">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform" />
            <span className="text-base font-black text-gray-600 group-hover:text-white transition-colors uppercase italic tracking-tight">{title}</span>
        </div>
    )
}
