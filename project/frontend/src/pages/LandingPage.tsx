import { useState, useRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import SEO from "@/components/SEO"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import {
    ArrowRight, CheckCircle, Globe, Zap,
    Cpu, Rocket, Terminal, Activity,
    Shield, Star, ChevronDown,
    Instagram, Twitter, Linkedin, Github,
    Database, Brain, Workflow, Code,
    MessageSquare, Lock, Sparkles, TrendingUp,
    Quote, Cog
} from "lucide-react"

export default function LandingPage() {
    return (
        <ErrorBoundary>
            <LandingPageContent />
        </ErrorBoundary>
    );
}

function LandingPageContent() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [prompt, setPrompt] = useState("");
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 500]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const scaleHero = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

    const handleStart = () => {
        if (prompt.trim()) {
            navigate('/guest-chat', { state: { initialPrompt: prompt } });
        } else {
            if (isAuthenticated) {
                navigate('/onboarding');
            } else {
                navigate('/auth/register');
            }
        }
    };

    return (
        <div ref={containerRef} className="text-white font-sans pb-20 selection:bg-indigo-500/30 overflow-x-hidden">
            <SEO
                title="Future BRTS | Robotic Intelligence Command"
                description="The ultimate robotic career architecture platform. Architect your future with precision AI."
            />

            {/* --- CYBER SCANLINE OVERLAY --- */}
            <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            <motion.div
                animate={{ top: ["-100%", "100%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="fixed left-0 right-0 h-[30vh] bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent pointer-events-none z-[101]"
            />

            {/* --- HERO SECTION: THE MOTHERBOARD --- */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
                {/* Parallax Background Robotic Elements */}
                <motion.div style={{ y: yHero, opacity: opacityHero, scale: scaleHero }} className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15)_0%,transparent_70%)] blur-[100px]" />

                    {/* SVG Circuit Lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1000 1000">
                        <motion.path
                            d="M 100,100 L 900,100 L 900,900 L 100,900 Z"
                            fill="none"
                            stroke="rgba(79,70,229,0.2)"
                            strokeWidth="0.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />
                        <CircuitGroup x={200} y={200} delay={0} />
                        <CircuitGroup x={800} y={300} delay={1} />
                        <CircuitGroup x={300} y={700} delay={2} />
                        <CircuitGroup x={700} y={800} delay={3} />
                    </svg>
                </motion.div>

                <div className="max-w-7xl w-full flex flex-col items-center relative z-10 space-y-16">
                    {/* MAIN TITLE WITH GLITCH EFFECT */}
                    <div className="relative space-y-4 px-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center"
                        >
                            <h1 className="text-4xl md:text-7xl font-black leading-[0.9] md:leading-none tracking-tighter uppercase italic select-none">
                                <span className="relative block text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                    FUTURE
                                    <span className="absolute -top-1 -right-3 text-[10px] font-mono not-italic text-indigo-500 opacity-50 tracking-normal">TM</span>
                                </span>
                                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-cyan-400 animate-gradient-x drop-shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                                    BRTS
                                </span>
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex justify-center items-center gap-2 md:gap-4 py-4"
                        >
                            <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-indigo-500/50" />
                            <span className="text-indigo-400 font-black uppercase tracking-[0.4em] md:tracking-[0.8em] text-[10px] md:text-md animate-pulse whitespace-nowrap">ARCHITECT YOUR FUTURE</span>
                            <div className="h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-indigo-500/50" />
                        </motion.div>
                    </div>

                    {/* THE COMMAND DECK (Input Area) */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="w-full max-w-5xl relative group"
                    >
                        {/* Robotic Frame Surround */}
                        <div className="absolute -inset-8 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-3xl" />
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-3xl" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-3xl" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-3xl" />

                            {/* Measured Tech Lines */}
                            <div className="absolute top-1/2 left-0 w-4 h-px bg-indigo-500" />
                            <div className="absolute top-1/2 right-0 w-4 h-px bg-indigo-500" />
                            <div className="absolute left-1/2 top-0 w-px h-4 bg-indigo-500" />
                            <div className="absolute left-1/2 bottom-0 w-px h-4 bg-indigo-500" />
                        </div>

                        {/* Input Core */}
                        <div className="relative bg-[#050505] p-1 rounded-3xl md:rounded-[2.5rem] shadow-[0_0_100px_rgba(79,70,229,0.1)] group-hover:shadow-[0_0_150px_rgba(79,70,229,0.2)] transition-all duration-1000 border border-white/5 mx-2">
                            <div className="bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 rounded-[1.3rem] md:rounded-[2.3rem] p-4 md:p-10 space-y-6 md:space-y-8">
                                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                                    <div className="flex-1 w-full space-y-2 md:space-y-4">
                                        <div className="flex items-center gap-3 text-indigo-500/50 font-black text-[8px] md:text-[10px] uppercase tracking-widest pl-2">
                                            <Terminal size={12} /> NEURAL_INPUT_ACTIVE
                                        </div>
                                        <textarea
                                            rows={2}
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="What is your ultimate career milestone?"
                                            className="w-full bg-transparent border-none p-0 text-base md:text-xl text-white focus:ring-0 outline-none font-bold tracking-tight placeholder:text-gray-800 resize-none min-h-[60px] md:min-h-[80px] scrollbar-hide italic leading-snug"
                                        />
                                    </div>
                                    <div className="w-full md:w-auto">
                                        <Button
                                            onClick={handleStart}
                                            className="w-full md:w-auto group/btn h-20 md:h-32 px-12 bg-white text-black hover:bg-indigo-50 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-1 md:gap-2 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 border-none"
                                        >
                                            <Zap size={24} className="text-indigo-600 md:size-[32px] transition-transform group-hover/btn:scale-125" />
                                            <span className="font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px]">START CHAT</span>
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* SCROLL INDICATOR TECH */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-10 flex flex-col items-center gap-4 cursor-pointer group"
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                >
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700 group-hover:text-indigo-400 transition-colors">PROCEED_TO_SPECS</div>
                    <div className="w-px h-16 bg-gradient-to-b from-indigo-500 to-transparent relative overflow-hidden">
                        <motion.div
                            animate={{ top: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-4 bg-white shadow-[0_0_10px_white]"
                        />
                    </div>
                </motion.div>
            </section>

            {/* --- SECTION 2: THE 3D BLUEPRINT --- */}
            <section className="py-40 px-6 relative">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
                    <div className="lg:w-1/2 space-y-12">
                        <div className="space-y-4">
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="block text-indigo-500 font-black uppercase tracking-[0.4em] text-xs"
                            >
                                SYSTEM_CORE_PILLARS
                            </motion.span>
                            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-[0.85] uppercase">
                                THE BRTS <br /> <span className="text-gray-700">BLUEPRINT.</span>
                            </h2>
                        </div>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-xl">
                            Our proprietary 4-layer intelligence architecture ensures that your every move is backed by deterministic logic and real-time market sync.
                        </p>
                        <div className="grid gap-4">
                            <BlueprintItem letter="B" name="BUILDER" desc="The Logical Foundation." />
                            <BlueprintItem letter="R" name="ROADMAP" desc="The Trajectory Vector." />
                            <BlueprintItem letter="T" name="TODAYTASK" desc="Operational Execution." />
                            <BlueprintItem letter="S" name="STRATEGIES" desc="Competitive Shielding." />
                        </div>
                    </div>

                    {/* 3D-ISH VISUAL CONTAINER */}
                    <div className="lg:w-1/2 perspective-[2000px] relative">
                        <motion.div
                            whileHover={{ rotateY: 15, rotateX: -10, scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 100, damping: 30 }}
                            className="relative aspect-square max-w-lg mx-auto bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[4rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] transform-style-3d p-12 overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />

                            {/* Central Core Circle */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                    className="w-80 h-80 rounded-full border border-dashed border-indigo-500/30 flex items-center justify-center"
                                >
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="w-60 h-60 rounded-full border border-double border-purple-500/30 flex items-center justify-center"
                                    >
                                        <div className="w-20 h-20 rounded-2xl bg-indigo-600 shadow-[0_0_60px_rgba(79,70,229,1)] flex items-center justify-center">
                                            <Cpu size={40} className="text-white animate-pulse" />
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Floating HUD Elements */}
                            <motion.div className="absolute top-10 left-10 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest space-y-2">
                                <div>INTEGRITY: 99.4%</div>
                                <div className="flex gap-1 h-1 w-20 bg-white/10">
                                    <div className="bg-indigo-500 w-[90%]" />
                                </div>
                            </motion.div>
                            <motion.div className="absolute bottom-10 right-10 flex gap-4">
                                <Zap size={24} className="text-amber-500 animate-bounce" />
                                <Activity size={24} className="text-indigo-400" />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 2.5: LIVE OPERATIONAL FEED (New) --- */}
            <section className="py-20 bg-indigo-500/5 border-y border-white/5 relative overflow-hidden hidden md:block">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.2)_0%,transparent_100%)]" />
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-12">
                    <div className="flex items-center gap-6 whitespace-nowrap overflow-hidden">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            LIVE_INTEL_STREAM:
                        </span>
                        <motion.div
                            animate={{ x: [0, -1000] }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className="flex gap-20 text-[10px] font-bold text-gray-500 uppercase tracking-widest italic"
                        >
                            <span>Deployment: Python Worker 8000 initialized in Gujarat</span>
                            <span>Roadmap: Fullstack Architect arc generated for user_492</span>
                            <span>System: 99.4% Integrity maintained across 12k nodes</span>
                            <span>Intel: New API documentation ingested for React 19</span>
                            <span>Security: AES-256 handshake completed for private vault</span>
                            <span>Yield: User_102 achieved mission milestone 04/06</span>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 3: THE DATA PULSE (Statistics) --- */}
            <section className="py-40 bg-white/[0.01] border-y border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-center">
                    <StatBox label="ACTIVE_MISSIONS" value="12,402" icon={<Rocket size={20} />} />
                    <StatBox label="NEURAL_PATH_GEN" value="4.2M" icon={<Zap size={20} />} />
                    <StatBox label="GLOBAL_NODES" value="128" icon={<Globe size={20} />} />
                    <StatBox label="SUCC_PROTOCOL" value="98.2%" icon={<CheckCircle size={20} />} />
                </div>
            </section>

            {/* --- SECTION 3.5: MISSION PIPELINE (Detailed Steps) --- */}
            <section id="how-it-works" className="py-40 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-24">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                        <div className="space-y-4">
                            <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">OPERATIONAL_WORKFLOW</span>
                            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                                MISSION <span className="text-gray-700">PIPELINE.</span>
                            </h2>
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs max-w-sm text-right">A deterministic 4-stage process to transform ambition into industrial reality.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -z-10 hidden md:block" />

                        <PipelineStep
                            num="01"
                            title="NEURAL_SYNC"
                            desc="Establish a secure handshake. Our AI parses your current state and target mission parameters."
                            icon={<Brain size={20} />}
                        />
                        <PipelineStep
                            num="02"
                            title="ARC_SYNTHESIS"
                            desc="The engine calculates thousands of possible trajectories and selects the one with maximum market yield."
                            icon={<Workflow size={20} />}
                        />
                        <PipelineStep
                            num="03"
                            title="ACTIVE_DEPLOY"
                            desc="Daily TodayTasks are pushed to your command deck. Real-time verification ensures no stagnation."
                            icon={<Rocket size={20} />}
                        />
                        <PipelineStep
                            num="04"
                            title="LEGEND_LOG"
                            desc="Continuous evolution. The system optimizes your resume and portfolio for global capture."
                            icon={<Star size={20} />}
                        />
                    </div>
                </div>
            </section>


            {/* --- CTA: FINAL HANDSHAKE --- */}
            <section className="py-32 md:py-60 px-6 text-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1)_0%,transparent_100%)]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto space-y-8 md:space-y-12 relative z-10"
                >
                    <h2 className="text-4xl md:text-7xl font-black leading-[0.8] tracking-tighter uppercase italic text-white px-4">
                        INITIALIZE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse">PROTOCOL.</span>
                    </h2>
                    <p className="text-base md:text-xl text-gray-500 font-medium tracking-[0.2em] md:tracking-[0.4em] uppercase">
                        The future doesn't wait for permission.
                    </p>
                    <div className="pt-6 md:pt-10">
                        <Button onClick={handleStart} className="w-full sm:w-auto px-10 md:px-20 py-8 md:py-10 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-xs md:text-sm rounded-2xl md:rounded-3xl hover:bg-white hover:text-black transition-all hover:scale-110 shadow-[0_0_50px_rgba(79,70,229,0.5)] border-none">
                            INIT_ENGINE_HANDSHAKE
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* --- SECTION 4: THE FEATURE MATRIX (EXPANDED) --- */}
            <section className="py-40 px-6 relative bg-white/[0.01]">
                <div className="max-w-7xl mx-auto space-y-24">
                    <div className="text-center space-y-4">
                        <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">CORE_CAPABILITIES</span>
                        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                            HYPER <span className="text-gray-700">INTELLIGENCE.</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain size={32} />}
                            title="Neural Architect"
                            desc="Not just a chatbot. Our engine builds full-scale technical architectures and deployment roadmaps based on industrial Big Data."
                        />
                        <FeatureCard
                            icon={<Workflow size={32} />}
                            title="Deterministic Logic"
                            desc="Every path is calculated using Big O efficiency and cognitive load monitoring. We optimize for your personal learning velocity."
                        />
                        <FeatureCard
                            icon={<Database size={32} />}
                            title="Global Knowledge Sync"
                            desc="Connected to 200+ industry APIs. Your roadmap evolves in real-time as technologies change and old frameworks become obsolete."
                        />
                        <FeatureCard
                            icon={<Lock size={32} />}
                            title="Industrial Security"
                            desc="Military-grade encryption for your intellectual property. Your blueprints are shielded by our proprietary security protocols."
                        />
                        <FeatureCard
                            icon={<MessageSquare size={32} />}
                            title="Humanized Guidance"
                            desc="A blend of a Genius Architect and a Supportive Mentor. Emotional Intelligence is baked into every neural response."
                        />
                        <FeatureCard
                            icon={<TrendingUp size={32} />}
                            title="Yield Optimization"
                            desc="Maximize your career ROI. We track your milestones and suggest the exact moments to pivot for maximum market capture."
                        />
                    </div>
                </div>
            </section>

            {/* --- SECTION 5: THE VISIONARY (Founder/Brand Story) --- */}
            <section className="py-40 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
                    <div className="md:w-1/2 relative group">
                        <div className="absolute -inset-4 bg-indigo-500/20 rounded-[4rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative aspect-[4/5] rounded-[4rem] border border-white/5 bg-gradient-to-br from-gray-900 to-indigo-900 overflow-hidden shadow-3xl">
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
                                alt="Founder"
                                className="w-full h-full object-cover grayscale mix-blend-overlay"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                            <div className="absolute bottom-12 left-12 space-y-2">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter">MAYUR SAVALIYA</h3>
                                <p className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">CHIEF ARCHITECT / FOUNDER</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2 space-y-10">
                        <div className="space-y-4">
                            <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">THE_HUMAN_ELEMENT</span>
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-[0.85]">
                                MORE THAN <br /> <span className="text-gray-700">AN AI ENGINE.</span>
                            </h2>
                        </div>
                        <p className="text-xl text-gray-400 font-medium leading-relaxed italic">
                            "Future BRTS was born out of a single obsession: to bridge the gap between human ambition and technical complexity. We don't just give you answers; we give you the trajectory to become an industry legend."
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-8">
                            <div className="space-y-2">
                                <h4 className="text-3xl font-black italic tracking-tighter text-white">0%</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Generic Content</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-3xl font-black italic tracking-tighter text-white">100%</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Industrial Depth</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 6: TECHNOLOGY STACK (Branding) --- */}
            <section className="py-40 px-6 bg-[#050505]/50 border-y border-white/5">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">POWERED_BY_ELITE_TECH</span>
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">THE NEURAL <span className="text-gray-700">STACK.</span></h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 opacity-30 group-hover:opacity-100 transition-opacity">
                        <TechIcon name="GROQ" icon={<Zap size={24} />} />
                        <TechIcon name="GEMINI" icon={<Sparkles size={24} />} />
                        <TechIcon name="PYWKR" icon={<Cpu size={24} />} />
                        <TechIcon name="REACT" icon={<Code size={24} />} />
                        <TechIcon name="MONGO" icon={<Database size={24} />} />
                        <TechIcon name="NODE" icon={<Terminal size={24} />} />
                    </div>
                </div>
            </section>

            {/* --- SECTION 7: ACCESS TIERS (Pricing Mockup) --- */}
            <section id="pricing" className="py-40 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-24">
                    <div className="text-center space-y-4">
                        <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">SCALABLE_INITIATION</span>
                        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                            ACCESS <span className="text-gray-700">TIERS.</span>
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-10">
                        <TierCard
                            name="NODE"
                            price="0"
                            desc="Ideal for explorers and curious architects."
                            features={["Basic Neural Chat", "Public Roadmap Generation", "Standard Intelligence", "Community Support"]}
                            buttonText="START_FREE"
                            onClick={handleStart}
                        />
                        <TierCard
                            name="PRIME"
                            price="29"
                            desc="Engineered for high-velocity professionals."
                            features={["Deterministic Roadmap v2", "Private Blueprint Vault", "Industrial SEO Analysis", "Priority Neural Sync"]}
                            isFeatured={true}
                            buttonText="ACTIVATE_PRIME"
                            onClick={handleStart}
                        />
                        <TierCard
                            name="LEGEND"
                            price="99"
                            desc="The ultimate command for industry dominance."
                            features={["Multimodal Intelligence", "Real-time Live Scraping", "Unlimited Execution Tasks", "Direct Mentor Link"]}
                            buttonText="GO_LEGEND"
                            onClick={handleStart}
                        />
                    </div>
                </div>
            </section>

            {/* --- SECTION 7.5: SUCCESS PROTOCOLS (New) --- */}
            <section className="py-40 px-6 relative bg-white/[0.01]">
                <div className="max-w-7xl mx-auto space-y-24">
                    <div className="text-center space-y-4">
                        <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">MISSION_ACCOMPLISHED</span>
                        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                            SUCCESS <span className="text-gray-700">PROTOCOLS.</span>
                        </h2>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] max-w-2xl mx-auto text-center">Verified logs of architects who reached their ultimate milestones using the BRTS engine.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        <TestimonialCard
                            name="Rohit Sharma"
                            role="Senior Cloud Architect"
                            content="The BRTS engine didn't just give me resources; it gave me a deterministic path. I transitioned from a legacy DBA to a Cloud Architect in 8 months with zero waste."
                            stat="140% Salary Yield"
                        />
                        <TestimonialCard
                            name="Ananya Iyer"
                            role="Lead Product Designer"
                            content="The Emotional Intelligence in the GPT responses combined with the hard-logic TodayTasks is a lethal combo. It felt like a mentor who actually understood my burnout."
                            stat="Pivot Success: 100%"
                        />
                        <TestimonialCard
                            name="Kevin Peterson"
                            role="Fullstack Developer"
                            content="I was stuck in tutorial hell for years. The 'Self-Healing' roadmap detected my stagnation and pushed me into Project Tier missions that forces real growth."
                            stat="3x Proj. Velocity"
                        />
                        <TestimonialCard
                            name="Vikram Singh"
                            role="Founder @ TechGenesis"
                            content="Used the Legend tier to architect my MVP. The Multimodal Research worker found me API docs that I didn't even know existed. Pure industrial grade power."
                            stat="MVP Build: 22 Days"
                        />
                    </div>
                </div>
            </section>

            {/* --- SECTION 7.6: INDUSTRIAL SPECIFICATIONS (New) --- */}
            <section className="py-40 px-6 border-y border-white/5 bg-[#050505] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">TECHNICAL_HARDENING</span>
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-[0.85]">
                                THE INDUSTRIAL <br /> <span className="text-gray-700">SPECIFICATION.</span>
                            </h2>
                        </div>
                        <div className="space-y-10">
                            <SpecItem title="Latency Management" desc="Average response time of 400ms across 20+ LLM providers using our Groq/Gemini hybrid layer." icon={<Zap size={20} />} />
                            <SpecItem title="Data Integrity" desc="Deterministic roadmap validation ensures 0% hallucination in project dependency chains." icon={<ShieldIcon size={20} />} />
                            <SpecItem title="Market Sync" desc="Real-time ingestion of 10k+ daily industry updates to recalibrate skill priorities." icon={<ActivityIcon size={20} />} />
                        </div>
                    </div>
                    <div className="relative p-10 rounded-[4rem] bg-indigo-500/5 border border-indigo-500/20 shadow-3xl overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Cog size={200} className="animate-spin-slow rotate-12 text-indigo-500/20" />
                        </div>
                        <div className="relative space-y-8">
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter">CAPABILITY_INDEX</h4>
                            <div className="space-y-6">
                                <CapabilityBar label="Neural Parsing" value="98%" />
                                <CapabilityBar label="Trajectory Accuracy" value="94%" />
                                <CapabilityBar label="Resource Linking" value="89%" />
                                <CapabilityBar label="Emotion Sync" value="92%" />
                            </div>
                            <div className="pt-6">
                                <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                                    System Status: <span className="text-emerald-500">OPTIMIZED_FOR_SCALE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* --- SECTION 8: FAQ PROTOCOL --- */}
            <section className="py-40 px-6 max-w-5xl mx-auto space-y-24">
                <div className="text-center space-y-4">
                    <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">KNOWLEDGE_BASE</span>
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                        FAQ <span className="text-gray-700">UNIT.</span>
                    </h2>
                </div>

                <div className="space-y-6">
                    <FAQItem
                        q="Is Future BRTS just a GPT wrapper?"
                        a="No. While we use high-tier LLMs for language, our core 'Neural Builder' is a proprietary orchestration engine that combines live market data, deterministic logic, and industrial Big Data to architect your path."
                    />
                    <FAQItem
                        q="How does the 'Self-Healing' Roadmap work?"
                        a="Our engine monitors your velocity. If you miss a task or a new technology emerges, it instantaneously recalibrates every future milestone to ensure your goal remains reachable."
                    />
                    <FAQItem
                        q="Can I use this for non-technical careers?"
                        a="Absolutely. The 'Universal Genesis Architect' supports fields from Law and Medicine to Business and Arts, providing domain-specific high-fidelity strategies."
                    />
                    <FAQItem
                        q="Who is Mayur Savaliya?"
                        a="Mayur is the Chief Architect and visionary who combined human mentorship with robotic precision to create Future BRTS as an 'Ultra Legend' tool for the next generation."
                    />
                </div>
            </section>

            {/* --- FOOTER: SYSTEM TERMINUS --- */}
            <footer className="py-20 px-6 border-t border-white/5 bg-[#050505] relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 relative z-10">
                    <div className="space-y-8 col-span-1 md:col-span-2">
                        <h3 className="text-3xl font-black italic uppercase italic tracking-tighter">FUTURE <span className="text-indigo-500">BRTS</span></h3>
                        <p className="text-sm text-gray-500 font-medium max-w-sm leading-relaxed">
                            Architecting the future using humanized intelligence and robotic precision. Designed by Mayur Savaliya for industry legends.
                        </p>
                        <div className="flex gap-6">
                            <SocialIcon icon={<Twitter size={18} />} />
                            <SocialIcon icon={<Linkedin size={18} />} />
                            <SocialIcon icon={<Github size={18} />} />
                            <SocialIcon icon={<Instagram size={18} />} />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">NAVIGATION</h4>
                        <ul className="space-y-4">
                            <FooterLink label="Explore Modules" onClick={() => window.scrollTo({ top: 1500, behavior: 'smooth' })} />
                            <FooterLink label="How It Works" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} />
                            <FooterLink label="Pricing Tiers" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} />
                            <FooterLink label="Neural Support" onClick={() => navigate('/contact')} />
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">LEGAL_CORE</h4>
                        <ul className="space-y-4">
                            <FooterLink label="Privacy Protocol" />
                            <FooterLink label="Terms of Access" />
                            <FooterLink label="Cookie Data" />
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-20 border-t border-white/5 mt-20 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-700">
                    <div>FUTURE BRTS © 2026. ALL RIGHTS RESERVED.</div>
                    <div className="flex gap-4">
                        <span>VERSION: 4.2.0-ULTRA</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>
            </footer>
        </div>
    )
}

// --- SUB-COMPONENTS with EXTRA DETAIL ---

function FeatureCard({ icon, title, desc }: any) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group overflow-hidden relative shadow-2xl"
        >
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all w-fit mb-8">
                {icon}
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-4">{title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed group-hover:text-gray-300 transition-colors">{desc}</p>
            <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-0 group-hover:w-full transition-all duration-700" />
        </motion.div>
    )
}

function TechIcon({ name, icon }: any) {
    return (
        <div className="flex flex-col items-center gap-4 group cursor-default">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-600 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                {icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-800 group-hover:text-gray-400">{name}</span>
        </div>
    )
}

function TierCard({ name, price, desc, features, isFeatured, buttonText, onClick }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-12 rounded-[4rem] border relative overflow-hidden transition-all shadow-3xl flex flex-col ${isFeatured ? 'bg-indigo-600/10 border-indigo-500/30 ring-4 ring-indigo-500/5' : 'bg-white/[0.02] border-white/5'}`}
        >
            {isFeatured && (
                <div className="absolute top-10 right-[-35px] rotate-45 bg-indigo-500 text-white text-[8px] font-black px-12 py-1 uppercase tracking-widest shadow-xl">MOST_STABLE</div>
            )}
            <div className="space-y-2 mb-10">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-indigo-500 italic">{name}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black italic tracking-tighter">$</span>
                    <span className="text-7xl font-black italic tracking-tighter tabular-nums">{price}</span>
                    <span className="text-gray-600 font-black uppercase text-xs tracking-widest">/MO</span>
                </div>
            </div>
            <p className="text-gray-400 font-medium leading-relaxed mb-12 italic">{desc}</p>
            <ul className="space-y-6 flex-1 mb-16">
                {features.map((f: any) => (
                    <li key={f} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-100 italic">
                        <CheckCircle size={16} className="text-indigo-500" /> {f}
                    </li>
                ))}
            </ul>
            <Button onClick={onClick} className={`w-full py-10 rounded-3xl font-black uppercase tracking-[0.4em] text-xs transition-all border-none ${isFeatured ? 'bg-indigo-600 text-white hover:bg-white hover:text-black shadow-[0_0_50px_rgba(79,70,229,0.3)]' : 'bg-white/5 text-white hover:bg-white hover:text-black'}`}>
                {buttonText}
            </Button>
        </motion.div>
    )
}

function FAQItem({ q, a }: any) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-white/5 rounded-[2.5rem] bg-white/[0.01] overflow-hidden transition-all hover:border-white/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-8 flex justify-between items-center text-left"
            >
                <span className="text-lg md:text-xl font-black italic uppercase tracking-tighter">{q}</span>
                <ChevronDown size={20} className={`text-indigo-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-8"
                    >
                        <p className="text-gray-500 font-medium leading-relaxed italic border-t border-white/5 pt-8">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function SocialIcon({ icon }: any) {
    return (
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-indigo-400 hover:border-indigo-400/30 transition-all cursor-pointer">
            {icon}
        </div>
    )
}

function FooterLink({ label, onClick }: any) {
    return (
        <li onClick={onClick} className="text-sm font-bold text-gray-700 hover:text-indigo-400 transition-colors uppercase italic tracking-widest cursor-pointer group flex items-center gap-2">
            <div className="w-1 h-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            {label}
        </li>
    )
}

function TestimonialCard({ name, role, content, stat }: any) {
    return (
        <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all group relative">
            <Quote className="absolute top-8 right-8 text-white/5 group-hover:text-indigo-500/10 transition-colors" size={60} />
            <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-black italic text-indigo-400">
                        {name[0]}
                    </div>
                    <div>
                        <h4 className="font-black italic uppercase tracking-tight text-white">{name}</h4>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{role}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-400 font-medium italic leading-relaxed">"{content}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{stat}</span>
                    <Star className="text-amber-500 fill-amber-500" size={14} />
                </div>
            </div>
        </div>
    )
}

function SpecItem({ title, desc, icon }: any) {
    return (
        <div className="flex gap-6 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0">
                {icon}
            </div>
            <div className="space-y-1">
                <h4 className="text-lg font-black italic uppercase tracking-tighter text-white">{title}</h4>
                <p className="text-sm text-gray-500 font-medium group-hover:text-gray-300 transition-colors">{desc}</p>
            </div>
        </div>
    )
}

function CapabilityBar({ label, value }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-400">{label}</span>
                <span className="text-indigo-400">{value}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: value }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                />
            </div>
        </div>
    )
}

function ShieldIcon({ size }: any) { return <Shield size={size} /> }
function ActivityIcon({ size }: any) { return <Activity size={size} /> }

function CircuitGroup({ x, y, delay }: any) {
    return (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay, duration: 2 }}
        >
            <circle cx={x} cy={y} r="3" fill="#4f46e5" />
            <motion.path
                d={`M ${x},${y} L ${x + 40},${y} L ${x + 60},${y + 20}`}
                stroke="#4f46e5"
                strokeWidth="1"
                strokeDasharray="4 2"
                fill="none"
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
        </motion.g>
    )
}

function BlueprintItem({ letter, name, desc }: any) {
    return (
        <motion.div
            whileHover={{ x: 10 }}
            className="flex items-center gap-6 p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all cursor-default group"
        >
            <div className="text-3xl font-black italic text-white/10 group-hover:text-indigo-500 transition-colors">{letter}</div>
            <div>
                <h4 className="font-black text-white text-lg tracking-tight uppercase italic">{name}</h4>
                <p className="text-xs text-gray-600 font-medium group-hover:text-gray-400">{desc}</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-white/5 group-hover:text-indigo-500 transition-all" />
        </motion.div>
    )
}

function StatBox({ label, value, icon }: any) {
    return (
        <div className="p-6 md:p-10 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                {icon}
            </div>
            <div className="text-3xl md:text-4xl font-black italic text-white tracking-tighter mb-3 transition-transform group-hover:scale-110">{value}</div>
            <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-700 group-hover:text-indigo-400">{label}</div>
            <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-0 group-hover:w-full transition-all duration-700" />
        </div>
    )
}
function PipelineStep({ num, title, desc, icon }: any) {
    return (
        <div className="p-10 rounded-[2.5rem] bg-[#050505] border border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-6xl font-black italic text-white/[0.02] group-hover:text-indigo-500/5 transition-colors">{num}</div>
            <div className="space-y-8 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {icon}
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{title}</h3>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-loose group-hover:text-gray-400 transition-colors">{desc}</p>
                </div>
            </div>
        </div>
    )
}
