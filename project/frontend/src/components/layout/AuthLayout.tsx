import { Outlet, Link, Navigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"

export default function AuthLayout() {
    const { isAuthenticated, onboardingCompleted, initialIntent } = useAuth();
    const [intentText, setIntentText] = useState<string | null>(null);

    useEffect(() => {
        if (initialIntent) {
            setIntentText(initialIntent);
        } else {
            const storedIntent = localStorage.getItem("fb_initial_prompt");
            if (storedIntent) {
                setIntentText(storedIntent);
            }
        }
    }, [initialIntent]);

    if (isAuthenticated) {
        return onboardingCompleted ? <Navigate to="/builder" replace /> : <Navigate to="/onboarding" replace />;
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-transparent text-white relative font-sans">
            {/* Left Side - Visual Continuity */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-black/10 backdrop-blur-sm relative overflow-hidden border-r border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-transparent to-transparent"></div>

                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-[10px] font-black uppercase tracking-widest mb-12 group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)]">F</div>
                        <h1 className="text-xl font-bold text-white tracking-tight">FutureBuilder</h1>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    {intentText ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-5 duration-700">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                Captured Intent
                            </div>
                            <h2 className="text-3xl font-bold leading-tight">
                                "We’ve understood your goal: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{intentText}</span>"
                            </h2>
                            <p className="text-gray-400 text-lg font-medium leading-relaxed">
                                Join our intelligence ecosystem to build your roadmap and track your career milestones.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold leading-tight">
                                Your journey to a better future <span className="text-indigo-400 underline decoration-indigo-500/30 underline-offset-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">starts here.</span>
                            </h2>
                            <p className="text-gray-400 text-lg font-medium leading-relaxed">
                                Stop guessing. Start building with AI-guided paths tailored to your unique interests.
                            </p>
                        </div>
                    )}
                </div>

                <div className="relative z-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>Trusted by 5,000+ students and professionals</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-md">
                <div className="w-full max-w-sm space-y-8 flex-1 flex flex-col justify-center">
                    <Outlet />
                </div>
                <footer className="mt-8 py-4 text-center text-[10px] text-gray-700 uppercase tracking-widest font-bold">
                    <p>Conceptualized by Mayur Savaliya</p>
                </footer>
            </div>
        </div>
    )
}
