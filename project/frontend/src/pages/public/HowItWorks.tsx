import { Rocket, Zap, Cpu, Terminal, Layers, Settings, Globe, Activity } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "../../components/ui/Button"

export default function HowItWorks() {
    return (
        <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto text-white font-sans space-y-16 md:space-y-20 relative overflow-hidden">

            {/* --- SECTION 1: THE PIPELINE HEADER --- */}
            <section className="text-center max-w-4xl mx-auto space-y-8 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[150px] -z-10 animate-pulse" />
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">
                            <Settings size={12} className="animate-spin-slow text-indigo-500" /> SYSTEM_ORCHESTRATION_LOADED
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black leading-none tracking-tighter uppercase italic">
                            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-500 drop-shadow-[0_0_20px_rgba(79,70,229,0.4)] animate-gradient-x">PROTOCOL.</span>
                        </h1>
                    </div>
                </motion.div>

                <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto border-y border-white/5 py-8 italic px-6">
                    "From raw ambition to operational reality. We take your intent and process it through a deterministic 4-stage deployment pipeline."
                </p>
            </section>

            {/* --- SECTION 2: THE 4-STAGE PIPELINE (Vertical Connection Spine) --- */}
            <section className="relative max-w-5xl mx-auto px-4">
                {/* Connection Spine */}
                <div className="absolute left-10 md:left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent opacity-25 hidden md:block" />

                <div className="space-y-12 md:space-y-16 relative z-10">
                    <PipelineStep
                        num="01"
                        title="INPUT_CAPTURE"
                        label="PROTOCOL_A"
                        desc="You provide your target career objective. The engine parses your intent, emotional state, and current tech stack to establish the baseline."
                        align="left"
                        widget={
                            <div className="w-full h-full p-5 flex flex-col justify-between font-mono text-[9px] text-gray-500">
                                <div className="flex justify-between border-b border-white/5 pb-1.5 text-indigo-400">
                                    <span>SYS_INGEST // CAPTURE</span>
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center relative my-3 gap-2">
                                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent rounded-2xl" />
                                    <Terminal size={28} className="text-indigo-400 group-hover:scale-105 transition-transform" />
                                    <div className="text-[7px] text-gray-600">INGEST_STREAM: ACTIVE</div>
                                    {/* Wave lines parsing */}
                                    <div className="flex items-end gap-[1.5px] h-3 w-16 justify-center">
                                        <motion.div animate={{ height: [2, 10, 2] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 bg-indigo-500/20" />
                                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ duration: 0.9, repeat: Infinity }} className="w-1.5 bg-cyan-500/30" />
                                        <motion.div animate={{ height: [1, 8, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 bg-indigo-500/20" />
                                    </div>
                                </div>
                                <div className="flex justify-between text-[8px] border-t border-white/5 pt-1.5">
                                    <span>BITRATE: 4.8MB/S</span>
                                    <span>STATE: SUCCESS</span>
                                </div>
                            </div>
                        }
                    />
                    <PipelineStep
                        num="02"
                        title="NEURAL_AUDIT"
                        label="PROTOCOL_B"
                        desc="Our engine performs a global deep-level scan across 1M+ live industry data points to identify the exact skill gaps missing in your arc."
                        align="right"
                        widget={
                            <div className="w-full h-full p-5 flex flex-col justify-between font-mono text-[9px] text-gray-500">
                                <div className="flex justify-between border-b border-white/5 pb-1.5 text-purple-400">
                                    <span>NEURAL_SCAN // AUDIT</span>
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                </div>
                                <div className="flex-1 flex items-center justify-center relative my-3">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                        className="absolute w-20 h-20 rounded-full border border-dashed border-purple-500/20 flex items-center justify-center"
                                    />
                                    <Cpu size={28} className="text-purple-400 group-hover:scale-105 transition-transform" />
                                </div>
                                <div className="flex justify-between text-[8px] border-t border-white/5 pt-1.5">
                                    <span>SENSORS: 124/124</span>
                                    <span>STATUS: ANALYZED</span>
                                </div>
                            </div>
                        }
                    />
                    <PipelineStep
                        num="03"
                        title="PATH_SYNTHESIS"
                        label="PROTOCOL_C"
                        desc="A multimodal roadmap is logically constructed. Every milestone is assigned a specific cognitive load and prerequisite score for maximum efficiency."
                        align="left"
                        widget={
                            <div className="w-full h-full p-5 flex flex-col justify-between font-mono text-[9px] text-gray-500">
                                <div className="flex justify-between border-b border-white/5 pb-1.5 text-cyan-400">
                                    <span>SYS_SYNTH // PATH</span>
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center relative my-3 gap-2">
                                    <Layers size={28} className="text-cyan-400 group-hover:scale-105 transition-transform" />
                                    <div className="flex flex-col gap-1 w-20">
                                        <motion.div animate={{ width: ["20%", "80%", "20%"] }} transition={{ duration: 3, repeat: Infinity }} className="h-1 bg-indigo-500/40 rounded-full" />
                                        <motion.div animate={{ width: ["40%", "90%", "40%"] }} transition={{ duration: 2.5, repeat: Infinity }} className="h-1 bg-cyan-500/40 rounded-full" />
                                    </div>
                                </div>
                                <div className="flex justify-between text-[8px] border-t border-white/5 pt-1.5">
                                    <span>WEIGHTS: CALC</span>
                                    <span>NODES: 1.4M</span>
                                </div>
                            </div>
                        }
                    />
                    <PipelineStep
                        num="04"
                        title="ACTIVE_DEPLOYMENT"
                        label="PROTOCOL_D"
                        desc="Your mission goes live. Daily tasks (TodayTasks) are pushed to your workspace, and the system monitors your progress in real-time."
                        align="right"
                        widget={
                            <div className="w-full h-full p-5 flex flex-col justify-between font-mono text-[9px] text-gray-500">
                                <div className="flex justify-between border-b border-white/5 pb-1.5 text-emerald-400">
                                    <span>LIVE_DEPLOY // LAUNCH</span>
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                </div>
                                <div className="flex-1 flex items-center justify-center relative my-3">
                                    <Rocket size={28} className="text-emerald-400 group-hover:scale-105 transition-transform" />
                                    <motion.div
                                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="absolute inset-0 border border-emerald-500/10 rounded-2xl"
                                    />
                                </div>
                                <div className="flex justify-between text-[8px] border-t border-white/5 pt-1.5">
                                    <span>PORT: 8000</span>
                                    <span>STATE: DEPLOYED</span>
                                </div>
                            </div>
                        }
                    />
                </div>
            </section>

            {/* --- SECTION 3: THE FEEDBACK LOOP (3D Card) --- */}
            <section className="bg-[#020204]/90 border border-white/5 rounded-[3rem] p-8 md:p-12 grid lg:grid-cols-2 gap-12 items-center relative overflow-hidden group shadow-[inset_0_0_30px_rgba(79,70,229,0.02)]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] -z-10 group-hover:opacity-100 opacity-50 transition-opacity" />

                <div className="space-y-8 text-left">
                    <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Autonomous Recalibration Cycle</span>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase text-white leading-none">LOOP_SYNC.</h2>
                    </div>
                    <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed">
                        The system never stops planning. It monitors your velocity and the market's evolution 24/7. If a skill becomes obsolete or you move faster than expected, the roadmap <span className="text-white font-black italic">self-heals.</span>
                    </p>
                    <div className="grid gap-3 border-l-2 border-indigo-500/20 pl-6">
                        <LoopFeature title="Real-time Industry Ingest" />
                        <LoopFeature title="Performance Metric Tracking" />
                        <LoopFeature title="Logic-Based Priority Shift" />
                    </div>
                </div>

                <div className="relative aspect-square max-w-sm mx-auto perspective-[1000px] w-full">
                    <motion.div
                        whileHover={{ rotateY: 15, rotateX: 8 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="w-full h-full rounded-[2.5rem] bg-white/[0.01] border border-white/10 shadow-[0_40px_60px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-8 space-y-6 border-indigo-500/20 relative"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="w-28 h-28 rounded-full border border-dashed border-indigo-500/30 flex items-center justify-center"
                        >
                            <Zap size={32} className="text-indigo-400 animate-pulse" />
                        </motion.div>
                        <div className="space-y-1 text-center">
                            <h3 className="text-lg font-black italic tracking-tighter uppercase text-white">AUTONOMOUS_READY</h3>
                            <p className="text-[9px] font-black uppercase text-gray-600 tracking-[0.3em] font-mono">System Health: Optimal</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- SECTION 4: CALL TO ACTION --- */}
            <section className="text-center py-10 space-y-8">
                <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-gray-500">READY TO DEPLOY UNIT?</h3>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Button className="px-10 py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-white hover:text-black transition-all hover:scale-105 shadow-[0_0_30px_rgba(79,70,229,0.3)] border-none relative overflow-hidden group">
                        <motion.span 
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent skew-x-12 pointer-events-none"
                        />
                        <span>INIT_PIPELINE_HANDSHAKE</span>
                    </Button>
                    <Button className="px-10 py-5 bg-transparent text-white border border-white/10 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-white/5 transition-all">
                        VIEW_DOCS
                    </Button>
                </div>
            </section>

            {/* --- SECTION 5: TECHNICAL DEPTH (The Spec) --- */}
            <section className="py-12 px-6 max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                    <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">under_the_hood</span>
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                        TECHNICAL <span className="text-gray-700">SPEC.</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <TechSpec
                        title="Multimodal Parsing"
                        desc="We don't just read text. Our engine analyzes PDFs, images, and code repositories to build a 360-degree view of your current expertise."
                        icon={<Layers size={20} />}
                    />
                    <TechSpec
                        title="Adaptive Velocity"
                        desc="Using time-series analysis, we track your completion speed and adjust future milestones to maintain a flow state without burnout."
                        icon={<Zap size={20} />}
                    />
                    <TechSpec
                        title="Live Scraping Layer"
                        desc="Connected to live job boards, news feeds, and repo updates. If a technology peaks or dies, your roadmap knows before you do."
                        icon={<Globe size={20} />}
                    />
                    <TechSpec
                        title="Neural Humanizer"
                        desc="Proprietary personality layer that blends technical rigor with empathetic mentorship, as designed by our Chief Architect."
                        icon={<Cpu size={20} />}
                    />
                </div>
            </section>

            {/* --- SECTION 6: RECALIBRATION DEMO (Visual) --- */}
            <section className="py-12 relative group bg-indigo-600/5 rounded-[3rem] border border-white/5 mx-4 overflow-hidden">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 p-8 md:p-12 relative z-10">
                    <div className="w-full md:w-1/2 space-y-6 text-left">
                        <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none text-white">RE-ROUTING <span className="text-indigo-400">ACTIVE.</span></h2>
                        <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed italic border-l-2 border-indigo-500/20 pl-6">
                            "In a global industry, stability is a myth. Our engine is built to embrace volatility. When the market shifts, we re-architect your future in milliseconds."
                        </p>
                        <ul className="space-y-3 font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                            <li className="flex items-center gap-2.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Dynamic Milestone Shifting</li>
                            <li className="flex items-center gap-2.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Automated Skill Gap Patching</li>
                            <li className="flex items-center gap-2.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Predictive Trend Alignment</li>
                        </ul>
                    </div>
                    <div className="w-full md:w-1/2 relative">
                        <div className="w-full aspect-[4/3] bg-[#050508] rounded-[2rem] border border-white/10 p-6 flex flex-col gap-3 overflow-hidden relative shadow-3xl select-none">
                            {/* Mock Task Recalibration UI */}
                            <div className="h-16 w-full bg-white/[0.02] rounded-xl border-l-4 border-indigo-500/40 p-3 opacity-50 flex flex-col justify-center">
                                <div className="h-1.5 w-20 bg-indigo-500/40 rounded mb-1.5" />
                                <div className="h-3 w-36 bg-white/10 rounded" />
                             </div>
                             <div className="h-16 w-full bg-indigo-500/10 rounded-xl border-l-4 border-cyan-400 p-3 flex flex-col justify-center relative overflow-hidden">
                                 <motion.div
                                     animate={{ x: ["-100%", "200%"] }}
                                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                     className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent skew-x-12 pointer-events-none"
                                 />
                                 <div className="h-1.5 w-28 bg-cyan-400/50 rounded mb-1.5" />
                                 <div className="h-3 w-44 bg-white/20 rounded" />
                                 <div className="absolute top-3 right-3 text-[7px] font-black uppercase text-cyan-400 font-mono flex items-center gap-1">
                                     <Activity size={8} className="animate-pulse" />
                                     CALIBRATING
                                 </div>
                             </div>
                             <div className="h-16 w-full bg-white/[0.02] rounded-xl border-l-4 border-gray-800 p-3 opacity-20 flex flex-col justify-center">
                                 <div className="h-1.5 w-16 bg-gray-500/20 rounded" />
                             </div>
                             {/* Scanlines */}
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
        <motion.div 
            whileHover={{ y: -6 }}
            className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.02] transition-all group flex flex-col items-start text-left"
        >
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all w-fit mb-6">
                {icon}
            </div>
            <h3 className="text-lg font-black italic uppercase tracking-tighter mb-3">{title}</h3>
            <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed group-hover:text-gray-300 transition-colors">{desc}</p>
        </motion.div>
    )
}

function PipelineStep({ num, title, label, desc, align, widget }: any) {
    const isLeft = align === 'left';
    return (
        <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 relative ${isLeft ? '' : 'md:flex-row-reverse'}`}>
            {/* Center Connection Point */}
            <div className="absolute left-10 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#050508] border-2 border-indigo-500 z-20 hidden md:block" />

            {/* Text Column */}
            <div className={`w-full md:w-1/2 space-y-6 ${isLeft ? 'md:text-right' : 'md:text-left'} pl-16 md:pl-0 flex flex-col ${isLeft ? 'md:items-end' : 'md:items-start'}`}>
                <motion.div
                    initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-3 max-w-md"
                >
                    <div className={`flex items-center gap-3 ${isLeft ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{label}</span>
                        <div className="w-10 h-px bg-indigo-500/20" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white leading-none">
                        <span className="text-white/20 mr-3 font-mono not-italic">{num}.</span>
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        {desc}
                    </p>
                </motion.div>
            </div>

            {/* Visualizer Column */}
            <div className="w-full md:w-1/2 flex justify-center pl-16 md:pl-0">
                <div className="w-48 h-48 rounded-[2rem] bg-white/[0.01] border border-white/5 flex items-center justify-center text-indigo-500 hover:border-indigo-500/25 transition-all duration-700 hover:scale-[1.02] shadow-[inset_0_0_20px_rgba(79,70,229,0.02)] relative overflow-hidden group">
                    {widget}
                </div>
            </div>
        </div>
    )
}

function LoopFeature({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-3 group cursor-default">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform" />
            <span className="text-xs md:text-sm font-black text-gray-500 group-hover:text-white transition-colors uppercase italic tracking-tight">{title}</span>
        </div>
    )
}
