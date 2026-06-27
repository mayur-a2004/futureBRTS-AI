import { Button } from "@/components/ui/Button"
import { Hammer, Heart, Zap, Globe, ShieldCheck, Cpu, Terminal, Fingerprint, ChevronDown, Send, Sparkles, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useState } from "react"

export default function Careers() {
    const { scrollYProgress } = useScroll();
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const jobsData = [
        {
            id: "SYS_A",
            role: "CORE_SYSTEM_ARCHITECT (PYTHON)",
            dept: "Intelligence Foundation",
            salary: "$140k - $200k",
            type: "Remote_Async",
            overview: "Responsible for engineering the backend brain of FutureBRTS. You will lead the development of our high-velocity telemetry processing pipelines, AI routing engines, and deep integrations with LLMs (Groq, OpenAI, and Claude). You will build secure, low-latency API gateways that handle millions of requests while maintaining strict system integrity.",
            responsibilities: [
                "Design, implement, and maintain high-performance microservices in Python (FastAPI/Uvicorn).",
                "Architect real-time data flow pipelines for parsing multi-modal user resumes and portfolio assets.",
                "Optimize vector DB query times and implement state-of-the-art caching layers.",
                "Maintain strict security shields against API injections, rate-limits, and session telemetry hijack."
            ],
            requirements: [
                "5+ years of deep systems programming experience in Python.",
                "Strong foundation in concurrent/async programming and event-driven architectures.",
                "Expert knowledge of MongoDB, Redis, and Vector DBs (Chroma/Pinecone).",
                "Prior experience designing production-grade API gateways and socket integrations."
            ],
            careerGrowth: "FutureBRTS puts you on an exponential learning arc. You will gain deep hands-on expertise with cutting-edge LLMs, multi-agent frameworks, and high-frequency real-time event systems."
        },
        {
            id: "UI_X",
            role: "NEURAL_INTERFACE_DESIGNER",
            dept: "Visual Experience Layer",
            salary: "$120k - $180k",
            type: "Remote_Async",
            overview: "As a Neural Interface Designer, you will shape the future of human-machine interaction. You will craft futuristic, high-fidelity, and glassmorphic user interfaces that respond fluidly to user interactions. You will use TailwindCSS, Framer Motion, and Three.js to construct responsive visual telemetry dashboards, interactive roadmaps, and spatial experiences.",
            responsibilities: [
                "Design and build premium web applications using React, TypeScript, and Vite.",
                "Build buttery-smooth page transition layouts, physics-based micro-animations, and particle effects.",
                "Translate design systems and mockups into pixel-perfect modular React components.",
                "Collaborate with backend engineers to integrate real-time WebSockets, stats charts, and interactive AI chat panels."
            ],
            requirements: [
                "4+ years of expert frontend development and interactive motion design.",
                "Mastery of Framer Motion, CSS shaders, Canvas/WebGL, and SVG animations.",
                "Strong visual design instincts: typography, spacing, glassmorphism, and dark mode layouts.",
                "Deep familiarity with state management (Zustand/Redux) and React 19 paradigms."
            ],
            careerGrowth: "Your visual creations will be showcased directly to thousands of users. You'll master modern motion choreography, spatial UI designs, and state-of-the-art WebGL environments."
        },
        {
            id: "AI_M",
            role: "DEEP_LEARNING_ENGINEER",
            dept: "Logic Synthesis",
            salary: "$150k - $220k",
            type: "Remote_Async",
            overview: "You will build and fine-tune the core cognitive logic models that generate personalized developer roadmaps and predict industry trends. You will design neural architectures that ingest raw job market data, parse skill dependency networks, and generate optimal learning load schedules.",
            responsibilities: [
                "Develop and optimize deep learning algorithms for resume matching and skill gap identification.",
                "Fine-tune large language models (LLMs) on domain-specific training data.",
                "Implement high-speed parallel workers using PyTorch, TensorFlow, or CUDA.",
                "Build predictive models for forecasting technology adoption trends and obsolescence curves."
            ],
            requirements: [
                "Master's or Ph.D. in Computer Science, Machine Learning, or related field.",
                "3+ years of experience training and deploying neural networks in production.",
                "Expert level knowledge of NLP frameworks, transformer architectures, and embedding generation.",
                "Strong profiling skills for optimizing ML model inference speeds."
            ],
            careerGrowth: "Work at the bleeding-edge of logic synthesis. You will lead the creation of adaptive neural curriculum generators, pushing the absolute boundaries of customized education."
        },
        {
            id: "GRW_P",
            role: "STRATEGIC_GROWTH_LEAD",
            dept: "Operational Expansion",
            salary: "$100k - $160k",
            type: "Remote_Async",
            overview: "Lead the expansion of FutureBRTS globally. You will design product-led growth loops, recruit institutional partners, and orchestrate distribution funnels. Your objective is to scale user acquisition from 50k to 1M monthly active users while building community engagement hubs.",
            responsibilities: [
                "Design and execute data-driven marketing campaigns, viral referral programs, and product integrations.",
                "Establish strategic alliances with top coding bootcamps, universities, and enterprise HR panels.",
                "Run A/B testing on pricing models, landing pages, and user onboarding flows.",
                "Manage and nurture our global developer community across Discord, GitHub, and Twitter."
            ],
            requirements: [
                "4+ years of proven growth hacking or product marketing experience in SaaS/developer tool verticals.",
                "Analytical mindset: expert with cohort metrics, conversion funnels, and SQL database querying.",
                "Excellent copy-writing skills and ability to communicate technical products to a global audience.",
                "High familiarity with modern web tools, SEO optimization, and social media loops."
            ],
            careerGrowth: "You will take ownership of our growth trajectory, scaling a next-generation AI ecosystem. You'll build an elite marketing stack and run high-budget, high-impact campaigns."
        }
    ]

    return (
        <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto text-center text-white space-y-16 md:space-y-20 font-sans overflow-x-hidden relative">

            {/* --- SECTION 1: THE MISSION CALL --- */}
            <section className="relative space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ opacity: opacityHero }}
                    className="relative"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] -z-10" />
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-[10px] font-black uppercase tracking-[0.6em] text-indigo-400 backdrop-blur-md">
                            <Fingerprint size={12} className="animate-pulse text-indigo-500" /> BIOMETRIC_RECRUIT_ACTIVE
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black leading-none tracking-tighter uppercase italic">
                            JOIN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 animate-gradient-x drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">ARCHITECTS.</span>
                        </h1>
                    </div>
                </motion.div>

                <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed max-w-5xl mx-auto border-y border-white/5 py-8 italic px-6">
                    "We are not looking for passive employees. We are recruiting rogue engineers and elite minds to build the core infrastructure of human advancement. Are you ready for <span className="text-white font-black italic">operational excellence?</span>"
                </p>
            </section>

            {/* --- SECTION 2: THE 3-PROTOCOL VALUES --- */}
            <section className="grid md:grid-cols-3 gap-6 text-left">
                <RoboCultureCard
                    icon={<Hammer />}
                    title="SYSTEM_INTEGRITY"
                    label="VAL_01"
                    desc="We respect the code. We build deterministic, high-uptime architectures that don't fail under load. Quality is a prerequisite."
                    color="indigo"
                />
                <RoboCultureCard
                    icon={<Zap />}
                    title="ABSOLUTE_VELOCITY"
                    label="VAL_02"
                    desc="We iterate in hours, not weeks. Our cycle-time is a competitive weapon. We move as fast as the intelligence we're building."
                    color="purple"
                    active
                />
                <RoboCultureCard
                    icon={<Heart />}
                    title="RADICAL_HONESTY"
                    label="VAL_03"
                    desc="Direct feedback loops are essential for survival. We skip the office politics and focus on solving the objective."
                    color="pink"
                />
            </section>

            {/* --- SECTION 3: THE ENVIRONMENT HUD (Stats & Culture) --- */}
            <section className="bg-[#020204]/90 border border-white/5 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group shadow-[inset_0_0_30px_rgba(168,85,247,0.02)]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] -z-10 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="text-left space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase text-white leading-none">WORK_SPECS.</h2>
                            <div className="h-1 w-20 bg-purple-500" />
                            <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed">
                                Our operational environment is optimized for high-performance output. We provide the tools; you provide the brilliance.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <EnvSpec title="GLOBAL_REMOTE_SYNC" desc="Work from any sector on the planet. Fully asynchronous protocols enabled." />
                            <EnvSpec title="EQUITY_GENESIS" desc="Ownership stake for every core builder. We win as one collective unit." />
                            <EnvSpec title="NEURAL_UPGRADE_FIX" desc="Unlimited learning budget. We fund your specialized certifications." />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 relative">
                        <RoboFeature icon={<Globe />} label="Global_Sync" active />
                        <RoboFeature icon={<Terminal />} label="Async_Ops" />
                        <RoboFeature icon={<Cpu />} label="AI_First" />
                        <RoboFeature icon={<ShieldCheck />} label="Secured" active />
                    </div>
                </div>
            </section>

            {/* --- SECTION 4: THE OPEN PORTS (Job Board) --- */}
            <div className="text-left space-y-12 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-3">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white leading-none">OPEN_PORTS.</h2>
                        <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-[9px] pl-2 border-l border-purple-500 font-mono">Available units for neural integration</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-5 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-purple-400 font-mono">ACTIVE_SLOTS: 04</div>
                    </div>
                </div>

                <div className="grid gap-6">
                    {jobsData.map(job => (
                        <RoboJob key={job.id} job={job} />
                    ))}
                </div>
            </div>

            {/* --- SECTION 5: THE UNKNOWN ENTITY --- */}
            <div className="bg-[#020204]/90 border border-white/5 rounded-[3rem] p-8 md:p-12 text-center space-y-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent -z-10" />
                <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none text-white">PORTAL_NOT_ACTIVE?</h3>
                <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed italic border-x border-white/5 px-6">
                    "Extraordinary talent is hard to categorize. If you are the outlier we need, transmit your raw data to our core directly."
                </p>
                <div className="pt-4">
                    <Button className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-purple-600 hover:text-white transition-all shadow-xl border-none">
                        TRANSMIT_DATA_SET
                    </Button>
                </div>
                <div className="flex justify-center gap-8 text-[9px] font-black uppercase tracking-[0.5em] text-gray-800 pt-4 font-mono">
                    <div>REPLY_LATENCY: {'<'} 24H</div>
                    <div>PRIORITY: CRITICAL</div>
                </div>
            </div>
        </div>
    )
}

function RoboCultureCard({ icon, title, desc, label, color, active }: any) {
    const colorMap: any = {
        indigo: "text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-600",
        purple: "text-purple-400 border-purple-500/20 group-hover:bg-purple-600",
        pink: "text-pink-400 border-pink-500/20 group-hover:bg-pink-600",
    }
    return (
        <div className={`p-8 rounded-[2.5rem] bg-[#050508] border border-white/5 transition-all duration-700 group h-full relative overflow-hidden flex flex-col items-start ${active ? 'shadow-[0_30px_60px_rgba(168,85,247,0.06)] border-purple-500/30' : 'hover:bg-white/[0.02]'}`}>
            <span className="absolute top-8 right-8 text-[9px] font-black font-mono text-gray-800">{label}</span>
            <div className={`w-14 h-14 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 transition-all duration-500 group-hover:text-white group-hover:scale-105 ${colorMap[color]}`}>
                {icon}
            </div>
            <div className="space-y-4 flex-1">
                <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase group-hover:text-white transition-colors">{title}</h3>
                <p className="text-xs md:text-sm font-medium leading-relaxed text-gray-500 group-hover:text-gray-400 transition-colors">
                    {desc}
                </p>
            </div>
            <div className="pt-8 w-full opacity-10 group-hover:opacity-100 transition-opacity">
                <div className="h-px w-full bg-white/5 relative overflow-hidden">
                    <div className={`h-full bg-current w-0 group-hover:w-full transition-all duration-[1200ms] ${colorMap[color] && colorMap[color].replace('text-', 'bg-')}`} />
                </div>
            </div>
        </div>
    )
}

function EnvSpec({ title, desc }: any) {
    return (
        <div className="space-y-1.5 group cursor-default">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(168,85,247,1)]" />
                <h4 className="text-lg font-black italic uppercase text-white tracking-tighter">{title}</h4>
            </div>
            <p className="text-gray-600 font-medium text-xs md:text-sm pl-4 text-left group-hover:text-gray-400 transition-colors">{desc}</p>
        </div>
    )
}

function RoboFeature({ icon, label, active }: any) {
    return (
        <div className={`p-8 aspect-square rounded-[2rem] border flex flex-col items-center justify-center text-center space-y-3 transition-all duration-700 hover:scale-[1.03] group ${active ? 'bg-purple-600 border-purple-500 text-white shadow-xl' : 'bg-[#050508] border-white/5 text-gray-700 hover:border-white/10'}`}>
            <div className="group-hover:rotate-6 transition-transform">{icon}</div>
            <span className="text-[9px] font-black uppercase tracking-widest font-mono">{label}</span>
        </div>
    )
}

function RoboJob({ job }: { job: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", portfolio: "", comments: "" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock submission
        setIsApplied(true);
    };

    return (
        <div className="p-8 md:p-10 rounded-[2.5rem] bg-[#050508] border border-white/5 hover:border-purple-500/25 hover:bg-white/[0.01] transition-all duration-700 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-y-0 left-0 w-1 bg-purple-600 opacity-0 group-hover:opacity-100 transition-all" />
            
            <div 
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black px-3 py-1 bg-white/5 rounded-lg text-gray-500 font-mono">{job.id}</span>
                        <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white hover:text-purple-400 transition-colors leading-none">{job.role}</h3>
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-3 text-[9px] font-bold text-gray-600 uppercase tracking-[0.25em] pl-1.5 border-l-2 border-white/5 font-mono">
                        <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,1)]" /> {job.dept}</span>
                        <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,1)]" /> Remote_Async</span>
                        <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,1)]" /> {job.salary}</span>
                    </div>
                </div>
                <button className={`w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all duration-500 shrink-0 ${isOpen ? 'rotate-180 text-purple-400 bg-purple-500/10 border-purple-500/20' : ''}`}>
                    <ChevronDown size={20} />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-white/5 mt-6 pt-6 text-left space-y-6"
                    >
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 font-mono">// MISSION_OVERVIEW</h4>
                                    <p className="text-xs md:text-sm text-gray-400 font-medium leading-relaxed">{job.overview}</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 font-mono">// CORE_RESPONSIBILITIES</h4>
                                    <ul className="space-y-2 pl-4 border-l-2 border-indigo-500/25">
                                        {job.responsibilities.map((resp: string, idx: number) => (
                                            <li key={idx} className="text-xs text-gray-400 flex gap-2">
                                                <span className="text-indigo-400 font-mono">[{idx + 1}]</span>
                                                <span>{resp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 font-mono">// NEURAL_REQUIREMENTS</h4>
                                    <ul className="space-y-2 pl-4 border-l-2 border-cyan-400/25">
                                        {job.requirements.map((req: string, idx: number) => (
                                            <li key={idx} className="text-xs text-gray-400 flex gap-2">
                                                <span className="text-cyan-400 font-mono">&gt;_</span>
                                                <span>{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 space-y-1">
                                    <h5 className="text-[9px] font-black uppercase tracking-widest text-purple-400 font-mono flex items-center gap-1.5">
                                        <Sparkles size={10} /> DASU_CAREER_ACCELERATION
                                    </h5>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{job.careerGrowth}</p>
                                </div>
                            </div>

                            <div className="bg-[#020204] border border-white/5 p-6 rounded-2xl h-fit space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white font-mono flex items-center gap-1.5">
                                    <Send size={12} className="text-purple-400" /> APPLY_PROTOCOL
                                </h4>

                                <AnimatePresence mode="wait">
                                    {!isApplied ? (
                                        <motion.form 
                                            onSubmit={handleSubmit} 
                                            className="space-y-4"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-gray-500 tracking-wider font-mono">Full Name</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    value={formData.name}
                                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                                    placeholder="e.g. John Doe" 
                                                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:border-purple-500/50 outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-gray-500 tracking-wider font-mono">Neural ID (Email)</label>
                                                <input 
                                                    type="email" 
                                                    required 
                                                    value={formData.email}
                                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                                    placeholder="e.g. john@matrix.net" 
                                                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:border-purple-500/50 outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-gray-500 tracking-wider font-mono">Portfolio / Github Link</label>
                                                <input 
                                                    type="url" 
                                                    required 
                                                    value={formData.portfolio}
                                                    onChange={e => setFormData({...formData, portfolio: e.target.value})}
                                                    placeholder="e.g. https://github.com/..." 
                                                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:border-purple-500/50 outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-gray-500 tracking-wider font-mono">Comments / Signal</label>
                                                <textarea 
                                                    rows={3}
                                                    value={formData.comments}
                                                    onChange={e => setFormData({...formData, comments: e.target.value})}
                                                    placeholder="Pledge your intent..." 
                                                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs text-white focus:border-purple-500/50 outline-none transition-colors resize-none"
                                                />
                                            </div>
                                            <Button type="submit" className="w-full h-11 bg-purple-600 text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-xl hover:bg-purple-500 shadow-lg shadow-purple-600/20 active:scale-98 transition-all border-none">
                                                TRANSMIT_DOSSIER
                                            </Button>
                                        </motion.form>
                                    ) : (
                                        <motion.div 
                                            className="py-6 text-center space-y-3"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <div className="inline-block p-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400">
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <div className="space-y-1">
                                                <h5 className="text-[10px] font-black text-white uppercase tracking-wider font-mono">TRANSMITTED</h5>
                                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Dossier sync pending verification</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
