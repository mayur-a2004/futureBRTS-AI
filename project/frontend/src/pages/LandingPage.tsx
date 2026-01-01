import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import SEO from "@/components/SEO"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Search, ArrowRight, Layers, Sparkles, ChevronDown, CheckCircle, Target, Briefcase, User, Edit3 } from "lucide-react"

// --- STABLE STATIC LANDING PAGE ---

export default function LandingPage() {
    return (
        <ErrorBoundary>
            <LandingPageContent />
        </ErrorBoundary>
    );
}

function LandingPageContent() {
    const navigate = useNavigate();
    const { isAuthenticated, setIntent } = useAuth();
    const [prompt, setPrompt] = useState("");

    const handleStart = () => {
        if (prompt.trim()) {
            setIntent(prompt);
            localStorage.setItem('fb_intent', prompt);
        }

        if (isAuthenticated) {
            navigate('/onboarding');
        } else {
            navigate('/auth/register');
        }
    };

    return (
        <div className="text-white font-sans pb-20">
            <SEO
                title="FutureBuilder | Architect Your Tomorrow"
                description="The world's first predictive intelligence engine for personal and professional roadmaps."
                keywords="career planning, roadmap, future builder, ai career coach"
            />

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-32 px-6 min-h-[90vh] flex flex-col items-center justify-center text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-black uppercase tracking-[0.3em] text-indigo-400">
                        <Sparkles size={12} /> AI POWERED STRATEGY
                    </div>

                    <h1 className="leading-[0.9] text-5xl md:text-[80px] font-black tracking-tighter">
                        Architect Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-white italic">Tomorrow</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
                        The world's first predictive intelligence engine for personal and professional roadmaps.
                    </p>

                    <div className="relative max-w-2xl mx-auto mt-12 group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-all duration-500" />
                        <div className="relative bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-3 flex flex-col shadow-2xl">
                            <div className="flex-1 relative min-h-[120px] flex items-start">
                                <div className="pl-4 pt-5 text-gray-600"><Search size={24} /></div>
                                <div className="flex-1 relative">
                                    <textarea
                                        rows={2}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe your goal (e.g., 'Become a Senior Product Designer')..."
                                        className="w-full bg-transparent border-none p-5 text-lg md:text-xl text-white focus:ring-0 outline-none font-medium resize-none min-h-[100px] leading-relaxed placeholder:text-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end p-2 border-t border-white/5 mt-2">
                                <Button onClick={handleStart} className="px-8 py-6 bg-white text-black font-black uppercase tracking-widest text-xs rounded-[1.5rem] hover:bg-gray-200 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 shadow-lg">
                                    Start Building <ArrowRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
                    <ChevronDown size={32} />
                </div>
            </section>

            {/* --- 2. WHAT IS FUTUREBUILDER --- */}
            <section className="py-24 px-6 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-4xl font-black tracking-tight">What is FutureBuilder?</h2>
                    <p className="text-xl text-gray-400 leading-relaxed font-medium">
                        FutureBuilder is an intelligent roadmap engine helping students, professionals, and creators plan their learning, career, and growth step-by-step.
                        Instead of guessing your next move, get a structured, data-backed path to your goals.
                    </p>
                </div>
            </section>

            {/* --- 3. WHO IS IT FOR --- */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-black tracking-tight">Who Is It For?</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Empowering Every Ambition</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <PersonaCard icon={<Briefcase />} title="University Students" desc="Navigate the transition from campus to corporate with clear skill requirements." />
                        <PersonaCard icon={<Target />} title="Exam Aspirants" desc="Structure your syllabus and preparation timeline for competitive exams." />
                        <PersonaCard icon={<Layers />} title="Career Switchers" desc="Pivot to a new industry with a gap-analysis driven plan." />
                        <PersonaCard icon={<User />} title="Professionals" desc="Plan your promotion path or skill upgrades for the next level." />
                        <PersonaCard icon={<Edit3 />} title="Entrepreneurs" desc="Roadmap your startup launch, validation, and growth milestones." />
                        <PersonaCard icon={<CheckCircle />} title="Creators" desc="Organize your content strategy and audience growth goals." />
                    </div>
                </div>
            </section>

            {/* --- 4. HOW IT WORKS --- */}
            <section className="py-24 px-6 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-black tracking-tight">How It Works</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Intelligence in Motion</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <StepCard num="01" title="Define Goal" desc="Tell us where you want to go using natural language." />
                        <StepCard num="02" title="Analyze" desc="Our engine breaks down the requirements and gaps." />
                        <StepCard num="03" title="Map Path" desc="Receive a detailed, step-by-step execution roadmap." />
                        <StepCard num="04" title="Execute" desc="Track your progress and adjust vertically as you grow." />
                    </div>
                </div>
            </section>

            {/* --- 5. WHY FUTUREBUILDER --- */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
                    <div className="flex-1 space-y-8">
                        <h2 className="text-4xl font-black tracking-tight">Why FutureBuilder?</h2>
                        <div className="space-y-6">
                            <WhyItem title="Clarity Over Confusion" desc="Stop browsing 50 tabs. Get one single source of truth for your journey." />
                            <WhyItem title="Actionable Steps" desc="We don't just give advice; we give you a checklist of things to do." />
                            <WhyItem title="Dynamic Adaptation" desc="Your roadmap evolves as you complete tasks and learn new skills." />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 6. WHAT YOU CAN BUILD --- */}
            <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-br from-indigo-900/10 to-purple-900/10">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-black tracking-tight mb-12">What Can You Build?</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['Study Plans', 'Career Roadmaps', 'Startup Launch Plans', 'Skill Upscaling', 'Project Timelines', 'Freelance Strategy'].map((tag) => (
                            <span key={tag} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-lg font-bold text-gray-300 hover:bg-white/10 hover:border-indigo-500/50 transition-all cursor-default">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 7. CTA --- */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-5xl font-black tracking-tight">Start Building Your Future</h2>
                    <p className="text-gray-400 text-xl">The best time to plant a tree was 20 years ago. The second best time is now.</p>
                    <div className="pt-4">
                        <Button onClick={handleStart} className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-gray-200 transition-all shadow-xl hover:scale-105">
                            Create Free Roadmap
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

// Sub-components for Home Page
function PersonaCard({ icon, title, desc }: any) {
    return (
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all">
            <div className="text-indigo-400 mb-4 scale-110 opacity-80">{icon}</div>
            <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">{desc}</p>
        </div>
    )
}

function StepCard({ num, title, desc }: any) {
    return (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center hover:bg-white/[0.04] transition-all group">
            <div className="text-3xl font-black text-white/10 mb-4 group-hover:text-indigo-500/20 transition-colors">{num}</div>
            <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
            <p className="text-sm text-gray-400 font-medium">{desc}</p>
        </div>
    )
}

function WhyItem({ title, desc }: any) {
    return (
        <div className="flex gap-4">
            <div className="w-1 h-full bg-indigo-500 rounded-full shrink-0" />
            <div>
                <h4 className="text-lg font-bold text-white">{title}</h4>
                <p className="text-gray-400 font-medium">{desc}</p>
            </div>
        </div>
    )
}
