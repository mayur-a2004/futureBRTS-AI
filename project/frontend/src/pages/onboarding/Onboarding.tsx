import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChevronRight, ChevronLeft, Check, Rocket } from "lucide-react";
import { onboardingApi } from "@/api/onboarding.api";

// --- CONFIGURATION ---

type Question = {
    id: string;
    text: string;
    type: 'single' | 'multi' | 'text';
    options?: string[];
    subtext?: string;
};

// 🟢 Q1: Universal Entry
const Q1_LIFE_STAGE: Question = {
    id: "life_stage",
    text: "Which life stage are you currently at?",
    type: "single",
    options: [
        "School (8-10)", "High School (11-12)", "Graduation",
        "Post Graduation", "PhD", "Job / Working Professional",
        "Job Switch / Career Change", "Business / Startup",
        "Government Exam Aspirant", "Abroad Planning", "Other"
    ]
};

// 🟢 Q7: Universal Final
const Q7_FINAL_GOAL: Question = {
    id: "final_goal",
    text: "Where do you want to see yourself in 6-12 months?",
    subtext: "e.g. Job ready, Exam cleared, Business started...",
    type: "text"
};

// 🔀 BRANCH CONFIGS
const BRANCHES: Record<string, Question[]> = {
    // 🧩 A. School (8-10)
    "School (8-10)": [
        { id: "class_level", text: "Which class are you in?", type: "single", options: ["8th", "9th", "10th"] },
        { id: "confusion", text: "What is your biggest confusion?", type: "single", options: ["Stream selection (11th)", "Marks / Subjects", "No career idea", "Pressure (Parents/School)"] },
        { id: "interest", text: "What do you enjoy the most?", type: "single", options: ["Maths / Logic", "Science / Experiments", "Business / Money", "Arts / Creativity", "Not sure"] },
        { id: "expectation", text: "What do you want from Future BRTS?", type: "single", options: ["Options after 10th", "Choose right stream", "Slow & safe guidance"] },
        { id: "tuition", text: "Do you take coaching / tuition?", type: "single", options: ["Yes", "No"] }
    ],
    // 🧩 B. High School (11-12)
    "High School (11-12)": [
        { id: "stream", text: "What is your stream?", type: "single", options: ["Science", "Commerce", "Arts", "Diploma", "Not decided"] },
        { id: "problem", text: "Biggest problem right now?", type: "single", options: ["Graduation confusion", "Marks pressure", "Competitive exams", "Parent expectations"] },
        { id: "grad_thought", text: "Thoughts on Graduation?", type: "single", options: ["Clear idea", "2-3 options in mind", "Completely confused"] },
        { id: "guidance_type", text: "What kind of guidance do you need?", type: "single", options: ["Degree selection", "Career roadmap", "Exam vs Degree clarity"] },
        { id: "timeline", text: "Your Timeline?", type: "single", options: ["Next 6 months", "1 year", "Flexible"] }
    ],
    // 🧩 C. Grad / PG / PhD (Merged Logic)
    "Graduation": [
        { id: "field", text: "What is your field?", type: "text", subtext: "e.g. B.Tech CS, BBA, MBBS..." },
        { id: "phase", text: "Which year / phase are you in?", type: "single", options: ["First year", "Mid-course", "Final year / Thesis"] },
        { id: "problem", text: "Biggest problem?", type: "single", options: ["Project / Thesis", "Skills gap", "Job clarity", "Higher studies dilemma"] },
        { id: "project_level", text: "Desired Project Level?", type: "single", options: ["College pass level", "Strong practical", "Industry-ready"] },
        { id: "future_interest", text: "What looks attractive next?", type: "single", options: ["Job", "Higher Studies", "Business", "Not sure"] }
    ],
    // 🧩 D. Job / Switch
    "Job / Working Professional": [
        { id: "role", text: "Current Role / Background?", type: "text", subtext: "e.g. Software Engineer, Sales, Marketing..." },
        { id: "reason", text: "Why do you want a change?", type: "single", options: ["No Growth", "Salary issues", "Interest change", "Burnout"] },
        { id: "experience", text: "Years of Experience?", type: "single", options: ["< 1 year", "1-3 years", "3-5 years", "5+ years"] },
        { id: "risk", text: "Risk Tolerance?", type: "single", options: ["Low", "Medium", "High"] },
        { id: "direction", text: "Preferred Direction?", type: "single", options: ["New Job", "New Field", "Freelance", "Business"] }
    ],
    // 🧩 E. Business
    "Business / Startup": [
        { id: "stage", text: "Business Stage?", type: "single", options: ["Just an Idea", "Running", "Scaling", "Family Business"] },
        { id: "challenge", text: "Biggest Challenge?", type: "single", options: ["Idea Validation", "Sales / Marketing", "Team Building", "Funding"] },
        { id: "type", text: "Business Type?", type: "single", options: ["Online", "Offline", "Hybrid"] },
        { id: "need", text: "Guidance Needed?", type: "single", options: ["Step-by-step Roadmap", "Execution Tasks", "Market Understanding"] },
        { id: "risk", text: "Risk Tolerance?", type: "single", options: ["Low", "Medium", "High"] }
    ]
};

// Aliases for Shared Logic
BRANCHES["Post Graduation"] = BRANCHES["Graduation"];
BRANCHES["PhD"] = BRANCHES["Graduation"];
BRANCHES["Job Switch / Career Change"] = BRANCHES["Job / Working Professional"];

// 🧩 F. Catch-all for Govt/Abroad/Other
const GENERIC_FLOW: Question[] = [
    { id: "status", text: "Current Status?", type: "text", subtext: "Briefly describe where you are." },
    { id: "confusion", text: "Biggest Confusion?", type: "single", options: ["Path Selection", "Preparation Strategy", "Financials", "Motivation"] },
    { id: "timeline", text: "Timeline?", type: "single", options: ["Urgent (3 months)", "6 months", "1 year+"] },
    { id: "support", text: "Support Needed?", type: "single", options: ["Roadmap", "Resources", "Mentorship"] },
    { id: "risk", text: "Risk Level?", type: "single", options: ["Safe play", "Balanced", "All in"] }
];

["Government Exam Aspirant", "Abroad Planning", "Other"].forEach(key => {
    BRANCHES[key] = GENERIC_FLOW;
});


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
            <div className="min-h-screen flex items-center justify-center p-4 bg-black/50">
                <OnboardingWizard />
            </div>
        </ErrorBoundary>
    );
}

function OnboardingWizard() {
    const { completeOnboardingState } = useAuth();
    const navigate = useNavigate();

    // State
    const [stepIndex, setStepIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    // Logic
    const currentQ1 = answers["life_stage"];

    // Dynamic Question List Construction
    const getQuestions = () => {
        const base = [Q1_LIFE_STAGE];
        if (!currentQ1) return base; // Only show Q1 until selected

        const branchQs = BRANCHES[currentQ1] || GENERIC_FLOW;
        return [...base, ...branchQs, Q7_FINAL_GOAL];
    };

    const questions = getQuestions();
    const currentQ = questions[stepIndex];
    const progress = Math.round(((stepIndex + 1) / questions.length) * 100);

    const handleAnswer = (val: any) => {
        const newAnswers = { ...answers, [currentQ.id]: val };
        setAnswers(newAnswers);

        // Auto-advance for single select
        if (currentQ.type === 'single') {
            setTimeout(() => {
                if (stepIndex < questions.length - 1) setStepIndex(prev => prev + 1);
            }, 100); // Tiny delay for visual feedback
        }
    };

    const handleNext = () => {
        if (stepIndex < questions.length - 1) setStepIndex(prev => prev + 1);
    };

    const handleBack = () => {
        if (stepIndex > 0) setStepIndex(prev => prev - 1);
    };

    const handleFinalSubmit = async () => {
        setLoading(true);

        const summary = {
            ...answers,
            life_stage: answers['life_stage'],
            target_outcome: answers['final_goal']
        };

        const token = localStorage.getItem('fbrts_token');
        if (token) {
            try {
                // 1. Save Onboarding Step
                await onboardingApi.saveStep(summary as any, token);

                // 2. Complete Onboarding
                await onboardingApi.complete(token);

                // 3. Create FIRST Session (With Context)
                // This violates the "Empty Start" rule BUT fulfills the "Onboarding Handoff" rule which takes precedence for the very first interaction.
                const intentContext = `User is a ${summary.life_stage}. Goal: ${summary.target_outcome}. Context: ${JSON.stringify(summary)}`;

                const sessionRes = await fetch('/api/builder/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        initialPrompt: intentContext,
                        title: summary.target_outcome?.substring(0, 30) || "My First Plan"
                    })
                });

                const sessionData = await sessionRes.json();

                completeOnboardingState();
                localStorage.setItem('fbrts_onboarding_backup', JSON.stringify(summary));

                if (sessionData.success && sessionData.session?._id) {
                    localStorage.setItem('fbrts_active_session', sessionData.session._id);
                    navigate(`/builder`, { replace: true });
                } else {
                    navigate('/builder');
                }

            } catch (e) {
                console.error("Onboarding Handoff Error", e);
                navigate('/builder');
            }
        }
        setLoading(false);
    };

    const isCurrentValid = () => {
        const ans = answers[currentQ.id];
        if (currentQ.type === 'text') return ans && ans.trim().length > 2;
        return !!ans;
    };

    return (
        <div className="w-full max-w-3xl bg-[#09090b] border border-white/10 rounded-3xl p-5 md:p-12 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px] md:min-h-[600px] animate-in fade-in zoom-in-95 duration-300 mx-2">

            {/* Header */}
            <div className="mb-6 md:mb-10">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] md:text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase">
                        Question {stepIndex + 1} of {questions.length}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-gray-500">{progress}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 flex flex-col justify-center animate-in slide-in-from-right-8 duration-300 key={stepIndex}">
                <h2 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight tracking-tight">
                    {currentQ.text}
                </h2>
                {currentQ.subtext && (
                    <p className="text-gray-400 mb-6 md:mb-8 text-base md:text-lg italic font-medium">{currentQ.subtext}</p>
                )}

                <div className="mt-4 md:mt-6">
                    {currentQ.type === 'single' && currentQ.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3">
                            {currentQ.options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleAnswer(opt)}
                                    className={`p-4 md:p-5 rounded-xl border text-left font-bold text-sm md:text-base transition-all flex justify-between items-center group
                                        ${answers[currentQ.id] === opt
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white'
                                        }`}
                                >
                                    <span className="truncate pr-4">{opt}</span>
                                    {answers[currentQ.id] === opt && <Check size={16} className="shrink-0 animate-in zoom-in spin-in-90 duration-200" />}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQ.type === 'text' && (
                        <div className="space-y-4">
                            <input
                                autoFocus
                                value={answers[currentQ.id] || ''}
                                onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && isCurrentValid()) {
                                        if (stepIndex === questions.length - 1) handleFinalSubmit();
                                        else handleNext();
                                    }
                                }}
                                placeholder="State your objective..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 md:p-5 text-lg md:text-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-gray-700"
                            />
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest ml-1">PRESS_ENTER_TO_CONTINUE</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 md:mt-12 flex justify-between items-center border-t border-white/5 pt-6">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={stepIndex === 0}
                    className={`text-gray-500 hover:text-white uppercase tracking-wider font-black text-[10px] gap-2 ${stepIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <ChevronLeft size={14} /> Back
                </Button>

                {stepIndex < questions.length - 1 ? (
                    <Button
                        onClick={handleNext}
                        disabled={!isCurrentValid()}
                        className="bg-white text-black hover:bg-gray-200 px-6 md:px-10 py-5 md:py-6 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.15em] transition-all disabled:opacity-50"
                    >
                        Next <ChevronRight size={16} className="ml-1 md:ml-2" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleFinalSubmit}
                        disabled={!isCurrentValid() || loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 md:px-12 py-5 md:py-6 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.15em] transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70"
                    >
                        {loading ? 'Initializing...' : 'Construct Plan'} <Rocket size={16} className="ml-1 md:ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
}
