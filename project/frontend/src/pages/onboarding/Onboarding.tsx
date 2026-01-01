import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
    Check, ChevronRight, Map, Zap,
    School, GraduationCap, Briefcase, Building2, Rocket, BookOpen,
    Compass, Wrench, MapPin, DollarSign, Clock, RefreshCw
} from "lucide-react";
import { onboardingApi } from "@/api/onboarding.api";

// --- TYPES ---
interface UserContext {
    stage: string;
    main_problems: string[];
    original_goal_text: string;
    selected_mode: 'ROADMAP' | 'BUILDER';
}

// --- CONFIG ---
// --- CONFIG ---
const STAGE_OPTIONS = [
    {
        id: "Freelancer / Solopreneur",
        icon: Briefcase,
        label: "Freelancer",
        desc: "Working independently or building a client base."
    },
    {
        id: "Post-Secondary Exploration (High School)",
        icon: School,
        label: "School Student",
        desc: "Exploring career paths after 10th/12th."
    },
    {
        id: "Undergraduate Student",
        icon: GraduationCap,
        label: "College Student",
        desc: "Pursuing a degree and looking for skills."
    },
    {
        id: "Recent Graduate",
        icon: BookOpen, // Changed to avoid duplicate Briefcase if needed, but Briefcase fits freelancers better. 
        // Recent grad could be GraduationCap again or BookOpen (learning). 
        // Let's use BookOpen for recent grad or just keep Briefcase for both? 
        // User asked for Freelancer specifically. I will give Freelancer 'Briefcase' and change Recent Graduate to 'Award' or 'Scroll'?
        // Actually, let's keep it simple. Freelancer -> Briefcase.
        label: "Recent Graduate",
        desc: "Job hunting or planning next steps."
    },
    {
        id: "Working Professional",
        icon: Building2,
        label: "Working Professional",
        desc: "Looking to switch or upskill."
    },
    {
        id: "Founder / Entrepreneur",
        icon: Rocket,
        label: "Founder / Entrepreneur",
        desc: "Building a startup or business."
    },
    {
        id: "Competitive Exam Aspirant",
        icon: BookOpen,
        label: "Exam Aspirant",
        desc: "Preparing for GATE, CAT, UPSC, etc."
    }
];

const PROBLEM_OPTIONS = [
    {
        id: "Lack of Clarity on Next Steps",
        icon: Compass,
        label: "Lack of Clarity",
        desc: "Don't know what to do next."
    },
    {
        id: "Difficulty with Practical Implementation",
        icon: Wrench,
        label: "Practical Issues",
        desc: "Stuck on projects or real-work."
    },
    {
        id: "Have Skills, Missing Direction",
        icon: MapPin,
        label: "Missing Direction",
        desc: "Know the tech, but not the path."
    },
    {
        id: "Financial or Revenue Pressure",
        icon: DollarSign,
        label: "Financial Pressure",
        desc: "Need to earn money soon."
    },
    {
        id: "Time Management & Discipline",
        icon: Clock,
        label: "Time Management",
        desc: "Struggling to stay consistent."
    },
    {
        id: "Career Switch Confusion",
        icon: RefreshCw,
        label: "Career Switch",
        desc: "Want to change fields safely."
    }
];

export default function Onboarding() {
    const { onboardingCompleted } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (onboardingCompleted) {
            navigate('/builder', { replace: true });
        }
    }, [onboardingCompleted, navigate]);

    return (
        <ErrorBoundary>
            {/* Transparent to show global UniverseBackground */}
            <div className="min-h-screen flex items-center justify-center p-4">
                <OnboardingWizard />
            </div>
        </ErrorBoundary>
    );
}

function OnboardingWizard() {
    const { completeOnboardingState, setIntent } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [context, setContext] = useState<UserContext>({
        stage: '',
        main_problems: [],
        original_goal_text: '',
        selected_mode: 'BUILDER' // Default as per prompt
    });

    // Check for saved intent
    useEffect(() => {
        const intent = localStorage.getItem('fb_intent');
        if (intent && !context.original_goal_text) {
            setContext(c => ({ ...c, original_goal_text: intent }));
        }
    }, []);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const toggleProblem = (p: string) => {
        setContext(prev => {
            const exists = prev.main_problems.includes(p);
            if (exists) return { ...prev, main_problems: prev.main_problems.filter(x => x !== p) };
            if (prev.main_problems.length >= 3) return prev; // Max 3
            return { ...prev, main_problems: [...prev.main_problems, p] };
        });
    };

    const handleFinalSubmit = async (mode: 'ROADMAP' | 'BUILDER') => {
        setLoading(true);
        const finalContext = { ...context, selected_mode: mode };

        // Save to Backend
        const token = localStorage.getItem('fb_token');
        if (token) {
            if (token) {
                await onboardingApi.saveStep(finalContext as any, token);
                await onboardingApi.complete(token);
            }
        }

        // Complete & Navigate
        completeOnboardingState();
        localStorage.setItem('fb_onboarding_backup', JSON.stringify(finalContext));

        // Ensure intent is active in context
        if (context.original_goal_text) {
            setIntent(context.original_goal_text);
        }

        if (mode === 'ROADMAP') {
            navigate('/roadmap', { state: { context: finalContext } });
        } else {
            navigate('/builder');
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-5xl bg-[#09090b]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Step Progress */}
            <div className="flex gap-2 mb-8 max-w-xs mx-auto md:mx-0">
                {[1, 2, 3].map(s => (
                    <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-indigo-500' : 'bg-white/10'}`} />
                ))}
            </div>

            <div className="min-h-[400px]">
                {/* STEP 1: STAGE */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Who are you?</h2>
                            <p className="text-gray-400">Select the profile that best describes you.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {STAGE_OPTIONS.map(opt => (
                                <div key={opt.id}
                                    onClick={() => setContext({ ...context, stage: opt.id })}
                                    className={`p-5 rounded-2xl border cursor-pointer flex flex-col gap-3 transition-all active:scale-[0.98] relative overflow-hidden group ${context.stage === opt.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'}`}>

                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${context.stage === opt.id ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                        <opt.icon size={20} />
                                    </div>

                                    <div>
                                        <h3 className={`font-bold text-lg ${context.stage === opt.id ? 'text-white' : 'text-gray-200'}`}>{opt.label}</h3>
                                        <p className={`text-xs mt-1 leading-relaxed ${context.stage === opt.id ? 'text-indigo-100' : 'text-gray-500'}`}>{opt.desc}</p>
                                    </div>

                                    {context.stage === opt.id && <div className="absolute top-4 right-4"><Check size={20} className="text-white" /></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: PROBLEMS */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">What's holding you back?</h2>
                            <p className="text-gray-400">Select top 3 challenges you are facing.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {PROBLEM_OPTIONS.map(opt => (
                                <div key={opt.id}
                                    onClick={() => toggleProblem(opt.id)}
                                    className={`p-5 rounded-2xl border cursor-pointer flex flex-col gap-3 transition-all active:scale-[0.98] relative overflow-hidden group ${context.main_problems.includes(opt.id) ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'}`}>

                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${context.main_problems.includes(opt.id) ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                        <opt.icon size={20} />
                                    </div>

                                    <div>
                                        <h3 className={`font-bold text-lg ${context.main_problems.includes(opt.id) ? 'text-white' : 'text-gray-200'}`}>{opt.label}</h3>
                                        <p className={`text-xs mt-1 leading-relaxed ${context.main_problems.includes(opt.id) ? 'text-indigo-100' : 'text-gray-500'}`}>{opt.desc}</p>
                                    </div>

                                    {context.main_problems.includes(opt.id) && <div className="absolute top-4 right-4"><Check size={20} className="text-white" /></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 3: MODE */}
                {step === 3 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">How would you like to proceed?</h2>
                            <p className="text-gray-400">Choose your preferred execution style.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Roadmap Card */}
                            <div
                                onClick={() => handleFinalSubmit('ROADMAP')}
                                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.08] cursor-pointer transition-all overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-50"><Map size={40} className="text-gray-600 group-hover:text-indigo-500 transition-colors" /></div>
                                <div className="mt-8 space-y-4">
                                    <h3 className="text-2xl font-black group-hover:text-indigo-400 transition-colors">Visualize Strategic Roadmap</h3>
                                    <p className="text-gray-400 font-medium leading-relaxed">Understand the full path in 5-6 clear, high-level milestones.</p>
                                </div>
                            </div>

                            {/* Builder Card (Highlighed) */}
                            <div
                                onClick={() => handleFinalSubmit('BUILDER')}
                                className="group relative p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/50 hover:bg-indigo-600/20 hover:border-indigo-400 cursor-pointer transition-all overflow-hidden ring-1 ring-indigo-500/20"
                            >
                                <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Recommended</div>
                                <div className="absolute top-0 right-0 p-4 mt-6 opacity-50"><Zap size={40} className="text-indigo-400 group-hover:text-white transition-colors" /></div>
                                <div className="mt-8 space-y-4">
                                    <h3 className="text-2xl font-black text-indigo-100 group-hover:text-white transition-colors">Start Execution & Building</h3>
                                    <p className="text-indigo-200/70 font-medium leading-relaxed">Jump straight into action with guided tasks and immediate support.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons (Hidden on Step 3) */}
            {step < 3 && (
                <div className="mt-10 flex justify-between items-center border-t border-white/5 pt-6">
                    {step > 1 ? (
                        <Button variant="ghost" onClick={handleBack} className="text-gray-400 hover:text-white px-0 hover:bg-transparent uppercase tracking-wider font-bold text-xs">Back</Button>
                    ) : <div />}

                    <Button
                        onClick={handleNext}
                        disabled={loading || (step === 1 && !context.stage) || (step === 2 && context.main_problems.length === 0)}
                        className="bg-white text-black hover:bg-gray-200 px-8 py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105"
                    >
                        Next <ChevronRight size={16} className="ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
}
