import { Outlet, Link, Navigate } from "react-router-dom"
import { ArrowLeft, Brain, Cpu, Database, Sparkles, Activity } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"

export default function AuthLayout() {
    const { isAuthenticated, onboardingCompleted, initialIntent } = useAuth();
    const [intentText, setIntentText] = useState<string | null>(null);

    useEffect(() => {
        if (initialIntent) {
            setIntentText(initialIntent);
        } else {
            const storedIntent = localStorage.getItem("fbrts_initial_prompt");
            if (storedIntent) {
                setIntentText(storedIntent);
            }
        }
    }, [initialIntent]);

    if (isAuthenticated) {
        return onboardingCompleted ? <Navigate to="/builder" replace /> : <Navigate to="/onboarding" replace />;
    }

    return (
        <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-transparent text-white relative font-sans">
            {/* Left Side - Visual Continuity */}
            <div className="hidden lg:flex flex-col justify-between p-8 h-full max-h-screen overflow-hidden bg-[#020108]/95 relative border-r border-white/5">
                {/* Ambient Background Glows */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-transparent to-transparent"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Top Section: Header & Back Button */}
                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition text-[10px] font-black uppercase tracking-widest mb-4 group">
                        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.35)] shrink-0">
                            <Brain size={14} className="animate-pulse" />
                        </div>
                        <span className="font-display font-black text-xs tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-indigo-300">
                            FutureBRTS
                        </span>
                    </div>
                </div>

                {/* Middle Section: Main Text & Holographic Panel */}
                <div className="relative z-10 max-w-lg my-auto space-y-6">
                    {/* Marketing Text */}
                    <div className="space-y-3">
                        {intentText ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-left-5 duration-700">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[9px] font-black uppercase tracking-wider">
                                    <Sparkles size={10} className="animate-spin-slow" />
                                    Captured Intent
                                </div>
                                <h2 className="text-2xl font-black font-display leading-tight tracking-tight text-white">
                                    We’ve understood your goal: <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">"{intentText}"</span>
                                </h2>
                                <p className="text-gray-400 text-[11px] leading-relaxed max-w-md font-medium">
                                    Join our intelligence ecosystem to build your custom roadmap, target weak areas, and unlock complete exams.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h2 className="text-2xl font-black font-display leading-tight tracking-tight text-white">
                                    Your journey to a <br />
                                    better future <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">starts here.</span>
                                </h2>
                                <p className="text-gray-400 text-[11px] leading-relaxed max-w-md font-medium">
                                    Stop guessing. Start building with advanced AI-guided roadmaps, smart homework tasks, and dynamic profile analytics.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Interactive Holographic HUD Panel */}
                    <div className="bg-[#0b0916]/80 border border-indigo-500/20 rounded-[1.5rem] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden group">
                        {/* Scan Line effect */}
                        <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent top-0 animate-[bounce_4s_infinite]" />
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                        
                        <div className="text-[10px] font-black text-indigo-400/80 uppercase tracking-widest mb-2 flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <Activity size={12} className="animate-pulse" />
                            Minerva Engine Status
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-0.5">
                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">AI Model Mode</div>
                                <div className="text-xs font-bold text-white flex items-center gap-1">
                                    <Cpu size={12} className="text-indigo-400 animate-spin-slow" /> Groq Llama-3
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Storage Protocol</div>
                                <div className="text-xs font-bold text-white flex items-center gap-1">
                                    <Database size={12} className="text-emerald-400" /> Local AES-256
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Language Medium</div>
                                <div className="text-xs font-bold text-white">English / Hinglish / Auto</div>
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Sync State</div>
                                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                    Core Online
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Footer / Trust info */}
                <div className="relative z-10 flex items-center gap-2 select-none text-[9px] font-black text-gray-500 tracking-wider uppercase border-t border-white/5 pt-4">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                    </span>
                    <span>TRUSTED BY 5,000+ STUDENTS AND PROFESSIONALS</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col items-center justify-center p-6 md:p-12 bg-black/10 backdrop-blur-[2px] relative">
                {/* Mobile Back Button */}
                <div className="lg:hidden absolute top-6 left-6">
                    <Link to="/" className="text-gray-500 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-8 flex-1 flex flex-col justify-center">
                    <Outlet />
                </div>
                <footer className="mt-8 py-4 text-center text-[8px] md:text-[10px] text-gray-700 uppercase tracking-widest font-black">
                    <p>© FUTURE_BRTS // MAYUR_SAVALIYA</p>
                </footer>
            </div>
        </div>
    )
}
