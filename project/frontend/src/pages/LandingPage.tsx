import { useState, useRef, useEffect } from "react"
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
    Database, Brain, Workflow, Code,
    MessageSquare, Lock, Sparkles, TrendingUp,
    Quote, Cog, GraduationCap, BookOpen
} from "lucide-react"

export default function LandingPage() {
    return (
        <ErrorBoundary>
            <LandingPageContent />
        </ErrorBoundary>
    );
}

const blueprintSlides = [
    {
        letter: "B",
        name: "BUILDER",
        title: "Advanced Syllabus Decomposition & Semantic Knowledge Mapping",
        desc: "The Builder serves as the foundational ingestion engine of the BRTS platform. It processes unstructured academic syllabi, textbooks, research publications, and PDFs using OCR and natural language processing. It decomposes files into discrete, granular concepts (micro-chunks) and maps out the implicit topological dependency graph. This creates a logical prerequisite chain where advanced topics are gated behind prerequisite nodes. It calculates dynamic weightage vectors based on historical board exam trends, question frequency, and core curriculum standards.",
        details: [
            "AI-Powered PDF & Document Parse Engine with optical structural recognition",
            "Dynamic Dependency Graph mapping logical prerequisite hierarchies between micro-concepts",
            "High-Yield Priority Indexing that auto-calculates topic weights based on exam recurrence and weightage",
            "Automated Syllabus Gap Analysis highlighting unaddressed curriculum areas in ingested docs"
        ],
        icon: <Brain className="text-indigo-400" size={24} />
    },
    {
        letter: "R",
        name: "ROADMAP",
        title: "Dynamic Multi-Dimensional Traversal Path Generator",
        desc: "The Roadmap engine compiles your student cognitive model to generate a non-linear study graph. Rather than forcing a rigid chronological progression, it constructs spiral learning trajectories that integrate lateral connections between intersecting disciplines. The traversal path dynamically adapts using deep reinforcement learning based on your response latencies, active performance metrics, and measured memory decay. If the system detects cognitive overload, it automatically inserts explanatory bridge concepts or switches to a more compatible cognitive format.",
        details: [
            "Student Cognitive Fingerprinting adapting to Visual, Logical, and Socratic styles",
            "Non-Linear Traversal Algorithm generating personalized spiral review structures",
            "Self-Healing Route Optimization that auto-recalibrates path direction upon conceptual struggle",
            "Cross-Disciplinary Bridge Injection linking distinct subjects to reinforce lateral thinking"
        ],
        icon: <Workflow className="text-cyan-400" size={24} />
    },
    {
        letter: "T",
        name: "TODAYTASK",
        title: "Algorithmic Daily Study Quests & Active-Recall Sandbox",
        desc: "TodayTask transforms passive studying into structured, high-intensity daily quests designed to trigger active recall. Every morning, it compiles a set of tasks that align with your roadmap's priority nodes. These include socratic interrogation decks, flashcards optimized via a custom SuperMemo spacing algorithm, and coding/analytical playgrounds executing in a secure sandbox environment. The scheduler tracks your recall threshold, presenting reviews right before the curve of forgetting drops to ensure long-term retention.",
        details: [
            "Personalized Daily Quest Compilation targeting high-priority nodes on your path",
            "Custom Spaced-Repetition Scheduler pacing reviews based on real-time memory decay curves",
            "Interactive Sandboxed Execution environment for coding, math, and logical simulations",
            "Smart Pause & Recovery Prompts dynamically triggered to minimize cognitive fatigue"
        ],
        icon: <Rocket className="text-amber-400" size={24} />
    },
    {
        letter: "S",
        name: "STRATEGIES",
        title: "Socratic Interrogation & Interactive Mastery Verification",
        desc: "Strategies acts as the gatekeeper of the learning ecosystem, ensuring no student advances without true comprehension. Instead of generic multiple-choice questions, it uses Socratic dialogue and active teaching simulations where you must explain the concept to the AI. The system runs diagnostic semantic checks on your explanations to evaluate depth, accuracy, and logic. Progress gates remain locked until the Mastery Verification System registers a 100% transfer index, preventing conceptual gaps from accumulating.",
        details: [
            "Active Teaching Simulation (Feynman Technique) evaluating explanation semantic clarity",
            "Multi-Layered Diagnostic Assays measuring surface, deep, and synthesis comprehension",
            "Mastery Verification Gates blocking progress to advanced nodes until 100% retention is verified",
            "Remedial Loop Activation injecting specialized micro-lessons for failed verification points"
        ],
        icon: <CheckCircle className="text-emerald-400" size={24} />
    }
];

const techStack = [
    { name: "TYPESCRIPT", icon: <Code size={18} /> },
    { name: "PYTHON", icon: <Terminal size={18} /> },
    { name: "RUST", icon: <Cpu size={18} /> },
    { name: "GO_LANG", icon: <Globe size={18} /> },
    { name: "C++", icon: <Code size={18} /> },
    { name: "JAVA", icon: <Code size={18} /> },
    { name: "JAVASCRIPT", icon: <Code size={18} /> },
    { name: "NEXT.JS", icon: <Activity size={18} /> },
    { name: "REACT", icon: <Zap size={18} /> },
    { name: "NODE.JS", icon: <Terminal size={18} /> },
    { name: "TAILWIND_CSS", icon: <Sparkles size={18} /> },
    { name: "FASTAPI", icon: <Zap size={18} /> },
    { name: "DOCKER", icon: <Shield size={18} /> },
    { name: "KUBERNETES", icon: <Workflow size={18} /> },
    { name: "PYTORCH", icon: <Brain size={18} /> },
    { name: "MONGODB", icon: <Database size={18} /> },
    { name: "POSTGRESQL", icon: <Database size={18} /> },
    { name: "AWS_CLOUD", icon: <Globe size={18} /> },
    { name: "GEMINI_AI", icon: <Sparkles size={18} /> },
    { name: "GROQ_LLM", icon: <Zap size={18} /> }
];

function LandingPageContent() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [prompt, setPrompt] = useState("");
    const [activeSlide, setActiveSlide] = useState(0);
    const [direction, setDirection] = useState(1);
    const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
    const containerRef = useRef(null);

    useEffect(() => {
        const logs = [
            "SYS: INITIALIZING COGNITIVE_SYNC_PROTOCOL...",
            "DB: ESTABLISHING SECURE HANDSHAKE PROTOCOL WITH COGNITIVE NODE...",
            "BUILDER: PARSING INGESTED SYLLABUS DOCUMENT STRUCTURE...",
            "BUILDER: LOGICAL CONCEPT MICRO-CHUNKS SUCCESSFULLY CREATED [OK]",
            "ROADMAP: PLOTTING NON-LINEAR TRAVERSAL GRAPH (42 NODES FOUND)...",
            "TODAYTASK: COMPILED 3 HIGH-PRIORITY ACTIVE STUDY QUESTS...",
            "STRATEGIES: INSTANTIATING SOCRATIC DIALOGUE VERIFIER...",
            "SYS: RETENTION METRICS ONLINE - OPTIMIZED AT 100% YIELD...",
            "SYS: ENGINE HANDSHAKE READY FOR SYNCHRONIZATION."
        ];
        
        setConsoleLogs([logs[0]]);
        let count = 1;
        
        const interval = setInterval(() => {
            setConsoleLogs((prev) => {
                const nextLog = logs[count % logs.length];
                if (count % logs.length === 0) {
                    return [nextLog];
                }
                return [...prev.slice(-4), nextLog];
            });
            count++;
        }, 1800);
        
        return () => clearInterval(interval);
    }, []);

    const changeSlide = (newIndex: number) => {
        setDirection(newIndex > activeSlide ? 1 : -1);
        setActiveSlide(newIndex);
    };

    const handleNext = () => {
        setDirection(1);
        setActiveSlide((prev) => (prev + 1) % blueprintSlides.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setActiveSlide((prev) => (prev - 1 + blueprintSlides.length) % blueprintSlides.length);
    };

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

                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
                    {/* Left Column: Title + Command Deck */}
                    <div className="lg:col-span-7 flex flex-col space-y-10 text-left items-start w-full">
                        {/* Title & Badge */}
                        <div className="relative space-y-4 w-full">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2">
                                    <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300">Neural Hyper-Learning Platform</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tighter uppercase italic select-none flex flex-wrap gap-x-4">
                                    <span className="relative text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                        FUTURE
                                        <span className="absolute -top-1 -right-3 text-[10px] font-mono not-italic text-indigo-500 opacity-50 tracking-normal">TM</span>
                                    </span>
                                    <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-cyan-400 animate-gradient-x drop-shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                                        BRTS
                                    </span>
                                </h1>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex justify-start items-center gap-4 py-2"
                            >
                                <span className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs animate-pulse whitespace-nowrap">AI-NATIVE COGNITIVE EDUCATION PROTOCOL</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent" />
                            </motion.div>
                        </div>

                        {/* Command Deck (Input Box) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="w-full relative group"
                        >
                            {/* Robotic Frame Surround */}
                            <div className="absolute -inset-4 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-500 rounded-tl-2xl" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-500 rounded-tr-2xl" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-500 rounded-bl-2xl" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-500 rounded-br-2xl" />
                            </div>

                            {/* Input Core */}
                            <div className="relative bg-[#050505] p-1 rounded-2xl shadow-[0_0_50px_rgba(79,70,229,0.1)] group-hover:shadow-[0_0_80px_rgba(79,70,229,0.15)] transition-all duration-1000 border border-white/5">
                                <div className="bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 rounded-2xl p-4 md:p-6 space-y-4">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex-1 w-full space-y-2">
                                            <div className="flex items-center gap-2 text-indigo-500/50 font-black text-[9px] uppercase tracking-widest pl-1">
                                                <Terminal size={10} /> SYLLABUS_COGNITIVE_INPUT_ACTIVE
                                            </div>
                                            <textarea
                                                rows={2}
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                placeholder="Enter a subject topic or paste syllabus details to Traversal..."
                                                className="w-full bg-transparent border-none p-0 text-sm md:text-base text-white focus:ring-0 outline-none font-bold tracking-tight placeholder:text-gray-800 resize-none min-h-[50px] scrollbar-hide italic leading-snug"
                                            />
                                        </div>
                                        <div className="w-full flex justify-end">
                                            <Button
                                                onClick={handleStart}
                                                className="w-full md:w-auto group/btn h-12 px-6 bg-white text-black hover:bg-indigo-50 rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-95 border-none"
                                            >
                                                <Zap size={14} className="text-indigo-600 transition-transform group-hover/btn:scale-125" />
                                                <span className="font-black uppercase tracking-[0.2em] text-[9px]">INITIALIZE LEARNING</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: BRTS Education Visual Animation */}
                    <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
                        <BRTSEducationVisual />
                    </div>
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
            <section className="py-8 md:py-12 px-6 relative">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
                    <div className="lg:w-1/2 space-y-12">
                        <div className="space-y-4">
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="block text-indigo-500 font-black uppercase tracking-[0.4em] text-xs"
                            >
                                COGNITIVE_CORE_PILLARS
                            </motion.span>
                            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none uppercase">
                                THE BRTS <span className="text-gray-700">BLUEPRINT.</span>
                            </h2>
                        </div>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-xl">
                            Our proprietary 4-layer cognitive architecture shifts the learning paradigm from passive reading to active traversal and verified mastery.
                        </p>
                        {/* Tab Buttons (Header) */}
                        <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl mb-6">
                            {blueprintSlides.map((slide, idx) => {
                                const isActive = activeSlide === idx;
                                return (
                                    <button
                                        key={slide.letter}
                                        onClick={() => changeSlide(idx)}
                                        className={`relative flex-1 min-w-[70px] py-3 px-4 rounded-xl text-xs md:text-sm font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 group/tab ${
                                            isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabIndicator"
                                                className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                        <span className={`text-sm italic font-mono transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-600 group-hover/tab:text-gray-400'}`}>
                                            {slide.letter}
                                        </span>
                                        <span className="hidden sm:inline">{slide.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Slide Body */}
                        <div className="relative overflow-hidden min-h-[380px] flex flex-col justify-between p-6 bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-sm">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={activeSlide}
                                    custom={direction}
                                    variants={{
                                        enter: (dir: number) => ({
                                            x: dir > 0 ? 50 : -50,
                                            opacity: 0
                                        }),
                                        center: {
                                            x: 0,
                                            opacity: 1
                                        },
                                        exit: (dir: number) => ({
                                            x: dir > 0 ? -50 : 50,
                                            opacity: 0
                                        })
                                    }}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                    className="space-y-6 text-left"
                                >
                                    {/* Slide Header */}
                                    <div className="flex items-start gap-4">
                                        <div className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] shrink-0">
                                            {blueprintSlides[activeSlide].icon}
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase font-mono mb-1">
                                                PILLAR 0{activeSlide + 1} // {blueprintSlides[activeSlide].name}
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white leading-tight">
                                                {blueprintSlides[activeSlide].title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm md:text-base text-gray-400 leading-relaxed font-medium">
                                        {blueprintSlides[activeSlide].desc}
                                    </p>

                                    {/* Core Specs / Feature list */}
                                    <div className="space-y-3 pt-2">
                                        {blueprintSlides[activeSlide].details.map((detail, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-start gap-3 text-xs md:text-sm font-black uppercase tracking-widest text-gray-300 italic"
                                            >
                                                <CheckCircle size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                                                <span>{detail}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Slider Controls / Navigation bar */}
                            <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-8">
                                {/* Indicators */}
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono font-black text-indigo-400">
                                        0{activeSlide + 1} <span className="text-gray-700">/</span> 0{blueprintSlides.length}
                                    </span>
                                    <div className="flex gap-1.5">
                                        {blueprintSlides.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => changeSlide(idx)}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                                    activeSlide === idx ? 'w-6 bg-indigo-500' : 'w-1.5 bg-white/10 hover:bg-white/30'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Prev/Next arrows */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrev}
                                        className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all active:scale-95"
                                    >
                                        <ArrowRight size={16} className="rotate-180" />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all active:scale-95"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3D-ISH VISUAL CONTAINER */}
                    <div className="lg:w-1/2 perspective-[2000px] relative">
                        <motion.div
                            whileHover={{ rotateY: 15, rotateX: -10, scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 100, damping: 30 }}
                            className="relative aspect-square max-w-lg mx-auto bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[4rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] transform-style-3d overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-[#020203]/90" />
                            
                            {/* Scanning Laser Line */}
                            <motion.div
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20 pointer-events-none"
                            />

                            {/* Cyber Mesh Grid Overlay */}
                            <div className="absolute inset-0 bg-cyber-dots opacity-20 pointer-events-none" />

                            {/* Rotating Aperture Rings */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                {/* Outer Technical Measurement Circle */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-96 h-96 rounded-full border border-indigo-500/10 flex items-center justify-center relative"
                                >
                                    {/* Compass-style tick marks on outer ring */}
                                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[2px] h-3 bg-indigo-500/30" />
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[2px] h-3 bg-indigo-500/30" />
                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-[2px] bg-indigo-500/30" />
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-[2px] bg-indigo-500/30" />
                                </motion.div>
                                
                                {/* Secondary Mechanical Gear Ring */}
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="w-80 h-80 rounded-full border border-dashed border-cyan-500/20 flex items-center justify-center"
                                />

                                {/* Interactive Hexagonal Core Orbit */}
                                <motion.div
                                    animate={{ rotate: 180 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-64 h-64 rounded-[2rem] border border-double border-purple-500/20 flex items-center justify-center"
                                />
                            </div>

                            {/* Main Robotic Core (Aperture + Glowing Core) */}
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="w-48 h-48 rounded-[3rem] bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-center relative shadow-[0_0_60px_rgba(99,102,241,0.25)] backdrop-blur-md"
                                >
                                    {/* Glowing Inner Reactor Aura */}
                                    <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 opacity-20 blur-xl animate-pulse" />
                                    
                                    {/* Robotic Gear Ring rotating inside */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className="absolute w-[80%] h-[80%] rounded-full border-4 border-dashed border-indigo-400/30 flex items-center justify-center"
                                    />
                                    
                                    {/* Core Reactor Icon */}
                                    <Cpu size={56} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] z-10 animate-pulse" />
                                    
                                    {/* Concentric Scanner Dots */}
                                    <div className="absolute inset-0 border border-white/5 rounded-[3rem] pointer-events-none" />
                                    
                                    {/* Mini blinking status lights around the core */}
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                </motion.div>
                            </div>

                            {/* Floating Tech HUD Telemetry 1 (Top Left) */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="absolute top-10 left-10 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md text-[9px] font-mono text-gray-400 space-y-2.5 shadow-xl z-20"
                            >
                                <div className="flex items-center gap-2 border-b border-white/5 pb-1.5 font-bold uppercase tracking-wider text-indigo-400">
                                    <Cpu size={12} /> MECH_DIAGNOSTICS
                                </div>
                                <div className="space-y-1">
                                    <div>SYS_TEMP: <span className="text-white">36.5 °C</span></div>
                                    <div>LOAD_INDEX: <span className="text-white">42.8%</span></div>
                                    <div>CORE_FREQ: <span className="text-cyan-400">4.8 GHz</span></div>
                                </div>
                                <div className="flex gap-1 h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        animate={{ width: ["40%", "85%", "40%"] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="bg-indigo-500 h-full"
                                    />
                                </div>
                            </motion.div>

                            {/* Floating Tech HUD Telemetry 2 (Top Right) */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="absolute top-10 right-10 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md text-[9px] font-mono text-gray-400 space-y-2 z-20 shadow-xl"
                            >
                                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-cyan-400">
                                    <Activity size={12} /> NEURAL_WAVEFORM
                                </div>
                                {/* Animated Sine Wave Path */}
                                <svg className="w-28 h-8 text-cyan-400" viewBox="0 0 100 30" fill="none">
                                    <motion.path
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        animate={{
                                            d: [
                                                "M0 15 Q25 0 50 15 T100 15",
                                                "M0 15 Q25 30 50 15 T100 15",
                                                "M0 15 Q25 0 50 15 T100 15"
                                            ]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                </svg>
                                <div className="text-[8px] text-gray-500 uppercase tracking-widest text-right">SYNC_INTEGRITY: 99.4%</div>
                            </motion.div>

                            {/* Floating Tech HUD Telemetry 3 (Bottom Left) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="absolute bottom-10 left-10 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md text-[9px] font-mono text-gray-400 flex items-center gap-3 z-20 shadow-xl"
                            >
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping shrink-0" />
                                <div>
                                    <div className="font-bold text-white uppercase tracking-wider">ROBOTIC_FLOW_ACTIVE</div>
                                    <div className="text-[8px] text-gray-600">PORT: 8000 // CHANNEL_01</div>
                                </div>
                            </motion.div>

                            {/* Floating Tech HUD Telemetry 4 (Bottom Right) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="absolute bottom-10 right-10 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md text-[9px] font-mono text-gray-400 flex items-center gap-3 z-20 shadow-xl"
                            >
                                <div className="text-right">
                                    <div className="font-bold text-white uppercase tracking-wider">SECURE_HANDSHAKE</div>
                                    <div className="text-[8px] text-gray-600">MD5_TOKEN: verified</div>
                                </div>
                                <Shield size={16} className="text-indigo-400 animate-pulse" />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 2.5: LIVE OPERATIONAL FEED (New) --- */}
            <section className="py-12 bg-indigo-500/5 border-y border-white/5 relative overflow-hidden hidden md:block">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.2)_0%,transparent_100%)]" />
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-12">
                    <div className="flex items-center gap-6 w-full overflow-hidden">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-2 shrink-0 select-none">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            LIVE_INTEL_STREAM:
                        </span>
                        <div className="flex-1 overflow-hidden">
                            <motion.div
                                animate={{ x: [0, -1000] }}
                                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                className="flex gap-20 text-[10px] font-bold text-gray-500 uppercase tracking-widest italic whitespace-nowrap"
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
                </div>
            </section>

            {/* --- SECTION 3: THE DATA PULSE (Statistics) --- */}
            <section className="py-8 md:py-12 bg-white/[0.01] border-y border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-center">
                    <StatBox label="ACTIVE_MISSIONS" value="12,402" icon={<Rocket size={20} />} />
                    <StatBox label="NEURAL_PATH_GEN" value="4.2M" icon={<Zap size={20} />} />
                    <StatBox label="GLOBAL_NODES" value="128" icon={<Globe size={20} />} />
                    <StatBox label="SUCC_PROTOCOL" value="98.2%" icon={<CheckCircle size={20} />} />
                </div>
            </section>

            {/* --- SECTION 3.5: MISSION PIPELINE (Detailed Steps) --- */}
            <section id="how-it-works" className="py-8 md:py-12 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-16">
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
            <section className="py-12 md:py-24 px-6 relative overflow-hidden">
                {/* Robotic Background Grid Lines */}
                <div className="absolute inset-0 bg-cyber-dots opacity-[0.15] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1)_0%,transparent_100%)]" />
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16 relative z-10 text-left"
                >
                    {/* Left Column: Heading, description, and action button */}
                    <div className="w-full md:w-1/2 space-y-6">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                                FINAL_HANDSHAKE_STAGE
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tighter uppercase italic text-white select-none">
                                INITIALIZE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-pulse">PROTOCOL.</span>
                            </h2>
                            <p className="text-xs md:text-sm text-gray-400 font-medium leading-relaxed max-w-md">
                                Sync with the BRTS cognitive architecture. Establish a secure handshake to generate your dynamic learning roadmap, load today's quests, and verify your master strategy.
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Button 
                                onClick={handleStart} 
                                className="w-full sm:w-auto px-8 md:px-12 py-6 bg-indigo-600 text-white font-black uppercase tracking-[0.3em] text-[10px] md:text-xs rounded-2xl hover:bg-white hover:text-black transition-all hover:scale-105 shadow-[0_0_40px_rgba(79,70,229,0.4)] border-none relative group overflow-hidden"
                            >
                                {/* Scanning Laser line */}
                                <motion.span 
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent skew-x-12 pointer-events-none"
                                />
                                <div className="flex items-center justify-center gap-2.5 relative z-10">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span>INIT_ENGINE_HANDSHAKE</span>
                                </div>
                            </Button>
                            <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest sm:pt-0 pt-1">
                                HANDSHAKE_READY // SPEED: 400ms
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Handshake Typewriter Terminal Console */}
                    <div className="w-full md:w-1/2">
                        <div className="bg-[#020204]/90 border border-white/5 rounded-3xl p-6 font-mono text-left space-y-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(79,70,229,0.05)] backdrop-blur-md relative group">
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-3xl bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500" />
                            
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-3 text-[9px] font-black uppercase tracking-widest text-indigo-400 relative z-10">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                    <span>COGNITIVE_TERMINAL_LOG v1.0.4</span>
                                </div>
                                <span className="text-gray-600 bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">SECURE_LINK</span>
                            </div>
                            
                            {/* Logs */}
                            <div className="space-y-2 h-[120px] overflow-hidden text-[10px] md:text-xs relative z-10">
                                {consoleLogs.map((log, i) => {
                                    if (!log) return null;
                                    return (
                                        <div key={i} className="flex gap-2 items-start leading-relaxed">
                                            <span className="text-indigo-500 font-bold shrink-0">&gt;</span>
                                            <span className={log.includes("[OK]") ? "text-emerald-400 font-medium" : log.includes("READY") ? "text-cyan-400 font-bold" : "text-gray-400"}>
                                                {log}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Mini telemetry stats on bottom of terminal */}
                            <div className="flex justify-between items-center text-[8px] text-gray-600 border-t border-white/5 pt-3 relative z-10">
                                <span>PING: 14ms // PKT_LOSS: 0.0%</span>
                                <span>ENCRYPTION: AES_256_GCM</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* --- SECTION 4: THE FEATURE MATRIX (EXPANDED) --- */}
            <section className="py-8 md:py-12 px-6 relative bg-white/[0.01]">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">CORE_CAPABILITIES</span>
                        <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none text-white">
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



            {/* --- SECTION 6: TECHNOLOGY STACK (Branding) --- */}
            <section className="py-12 md:py-16 px-6 bg-black/40 border-y border-white/5 overflow-hidden relative">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">POWERED_BY_ELITE_TECH</span>
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">THE NEURAL <span className="text-gray-700">STACK.</span></h2>
                    </div>

                    {/* Infinite Scrolling Marquee Container */}
                    <div 
                        className="relative flex overflow-hidden w-full py-4 select-none pointer-events-none"
                        style={{
                            maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                            WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)"
                        }}
                    >
                        <motion.div 
                            animate={{ x: [0, "-50%"] }}
                            transition={{
                                ease: "linear",
                                duration: 35,
                                repeat: Infinity,
                            }}
                            className="flex gap-8 whitespace-nowrap shrink-0 pr-8"
                        >
                            {/* Render original list */}
                            {techStack.map((tech, i) => (
                                <div key={`orig-${i}`} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-6 py-3.5 rounded-2xl">
                                    <span className="text-indigo-400 shrink-0">{tech.icon}</span>
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white font-mono">{tech.name}</span>
                                </div>
                            ))}
                            {/* Render duplicate list for infinite loop */}
                            {techStack.map((tech, i) => (
                                <div key={`dup-${i}`} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-6 py-3.5 rounded-2xl">
                                    <span className="text-indigo-400 shrink-0">{tech.icon}</span>
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white font-mono">{tech.name}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 7: ACCESS TIERS (Pricing Mockup) --- */}
            <section id="pricing" className="py-8 md:py-12 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-16">
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
            <section className="py-8 md:py-12 px-6 relative bg-white/[0.01]">
                <div className="max-w-7xl mx-auto space-y-16">
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
            <section className="py-8 md:py-12 px-6 border-y border-white/5 bg-[#050505] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-10 text-left">
                        <div className="space-y-4">
                            <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px]">TECHNICAL_HARDENING</span>
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                                THE INDUSTRIAL <span className="text-gray-700">SPECIFICATION.</span>
                            </h2>
                        </div>
                        <div className="space-y-8">
                            <SpecItem title="Latency Management" desc="Average response time of 400ms across 20+ LLM providers using our Groq/Gemini hybrid layer." icon={<Zap size={20} />} />
                            <SpecItem title="Data Integrity" desc="Deterministic roadmap validation ensures 0% hallucination in project dependency chains." icon={<ShieldIcon size={20} />} />
                            <SpecItem title="Market Sync" desc="Real-time ingestion of 10k+ daily industry updates to recalibrate skill priorities." icon={<ActivityIcon size={20} />} />
                        </div>
                    </div>
                    <div className="relative p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/20 shadow-3xl overflow-hidden group text-left">
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
            <section className="py-8 md:py-12 px-6 max-w-5xl mx-auto space-y-16">
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

function BRTSEducationVisual() {
    return (
        <div className="w-full max-w-lg aspect-square relative flex items-center justify-center overflow-hidden">
            {/* Ambient Background Radial Glows */}
            <div className="absolute w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-cyan-500/20 blur-[80px] pointer-events-none" />
            
            {/* Blueprint Grid Mesh */}
            <div className="absolute inset-0 bg-cyber-dots opacity-20 pointer-events-none rounded-[3rem]" />

            {/* Glowing Tech Frame */}
            <div className="absolute -inset-2 pointer-events-none opacity-40">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-500/40 rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-500/40 rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-500/40 rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-500/40 rounded-br-2xl" />
            </div>

            {/* Rotating Orbits (SVG) */}
            <svg className="w-[90%] h-[90%] absolute pointer-events-none" viewBox="0 0 400 400">
                {/* Outer Dashed Orbit */}
                <motion.circle
                    cx="200"
                    cy="200"
                    r="155"
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="8 12"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: '200px 200px' }}
                />
                
                {/* Inner Hexagon Path */}
                <motion.polygon
                    points="200,80 304,140 304,260 200,320 96,260 96,140"
                    fill="none"
                    stroke="rgba(6, 182, 212, 0.2)"
                    strokeWidth="1.5"
                    strokeDasharray="5 5"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: '200px 200px' }}
                />

                {/* Circuit Connections */}
                <g opacity="0.3">
                    <path d="M 200,80 L 200,40 M 304,140 L 340,120 M 304,260 L 340,280 M 200,320 L 200,360 M 96,260 L 60,280 M 96,140 L 60,120" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <circle cx="200" cy="40" r="4" fill="#6366f1" />
                    <circle cx="340" cy="120" r="4" fill="#06b6d4" />
                    <circle cx="340" cy="280" r="4" fill="#6366f1" />
                    <circle cx="200" cy="360" r="4" fill="#06b6d4" />
                    <circle cx="60" cy="280" r="4" fill="#6366f1" />
                    <circle cx="60" cy="120" r="4" fill="#06b6d4" />
                </g>
            </svg>

            {/* Central Floating Graduation Cap & Book Hologram (HTML) */}
            <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 flex flex-col items-center gap-4 animate-pulse-slow"
            >
                {/* Graduation Cap Container */}
                <div className="relative w-32 h-32 bg-indigo-500/10 border border-indigo-500/30 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)] backdrop-blur-md hover:border-indigo-400 transition-colors">
                    {/* Glowing pulse aura */}
                    <div className="absolute -inset-1 rounded-[2.5rem] bg-indigo-500/20 blur-lg animate-pulse" />
                    
                    {/* Cap Icon */}
                    <GraduationCap size={64} className="text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
                </div>

                {/* Subtitle / Hologram Label */}
                <div className="text-center space-y-1">
                    <div className="text-[10px] font-black text-indigo-400 tracking-[0.4em] uppercase">BRTS_COGNITIVE_CORE</div>
                    <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Mastery Status: active</div>
                </div>
            </motion.div>

            {/* Floating Satellite Nodes (Book, Brain, Award, Sparkles) */}
            
            {/* 1. Open Book Node (Top Left) */}
            <motion.div
                animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-[15%] left-[15%] z-20 flex flex-col items-center gap-1.5"
            >
                <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md">
                    <BookOpen size={20} className="text-cyan-400" />
                </div>
                <span className="text-[8px] font-black tracking-widest text-cyan-400/80 uppercase">Active Recall</span>
            </motion.div>

            {/* 2. Brain Node (Top Right) */}
            <motion.div
                animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[15%] right-[15%] z-20 flex flex-col items-center gap-1.5"
            >
                <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.15)] backdrop-blur-md">
                    <Brain size={20} className="text-indigo-400" />
                </div>
                <span className="text-[8px] font-black tracking-widest text-indigo-400/80 uppercase">Socratic AI</span>
            </motion.div>

            {/* 3. Award/Mastery Node (Bottom Left) */}
            <motion.div
                animate={{ y: [0, -6, 0], x: [0, -4, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-[18%] left-[15%] z-20 flex flex-col items-center gap-1.5"
            >
                <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-md">
                    <CheckCircle size={20} className="text-purple-400" />
                </div>
                <span className="text-[8px] font-black tracking-widest text-purple-400/80 uppercase">Mastery Gate</span>
            </motion.div>

            {/* 4. Telemetry Node (Bottom Right) */}
            <motion.div
                animate={{ y: [0, 6, 0], x: [0, 4, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[18%] right-[15%] z-20 flex flex-col items-center gap-1.5"
            >
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md">
                    <Activity size={20} className="text-emerald-400" />
                </div>
                <span className="text-[8px] font-black tracking-widest text-emerald-400/80 uppercase">Adaptive Feed</span>
            </motion.div>

            {/* Rising Digital Sparkles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: "100%", x: `${20 + i * 15}%`, opacity: 0 }}
                        animate={{
                            y: ["100%", "20%"],
                            opacity: [0, 0.4, 0],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            delay: i * 0.8,
                            ease: "linear"
                        }}
                        className="absolute w-1 h-1 bg-indigo-400 rounded-full"
                    />
                ))}
            </div>
        </div>
    );
}

