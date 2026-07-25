import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChevronRight, Check, Rocket } from "lucide-react";
import { onboardingApi } from "@/api/onboarding.api";

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
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-black via-zinc-950 to-indigo-950/40">
                <OnboardingWizard />
            </div>
        </ErrorBoundary>
    );
}

function OnboardingWizard() {
    const { completeOnboardingState } = useAuth();
    const navigate = useNavigate();

    // 3 Questions State
    const [lifeStage, setLifeStage] = useState<string>('');
    const [q2Detail, setQ2Detail] = useState<string>('');
    const [finalGoal, setFinalGoal] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Q1 Options
    const LIFE_STAGES = [
        "School (8-10)",
        "High School (11-12)",
        "Graduation",
        "Post Graduation / PhD",
        "Job / Working Professional",
        "Business / Startup",
        "Government Exam Aspirant / Other"
    ];

    // Q3 Goal Options
    const GOAL_OPTIONS = [
        "Job Ready & Placement",
        "Exam Clearance & Top Marks",
        "Skill Building & Coding Mastery",
        "Business Growth & Startup Execution",
        "Higher Studies / Abroad Planning"
    ];

    const handleFinalSubmit = async () => {
        if (!lifeStage) {
            alert("Please select your Current Level / Life Stage.");
            return;
        }

        setLoading(true);

        // Standardized summary object compatible with all modules
        const summary = {
            life_stage: lifeStage,
            stream: q2Detail || 'General Science & Tech',
            field: q2Detail || 'Computer Science & Tech',
            class_level: q2Detail || '10th',
            role: q2Detail || 'Engineer / Learner',
            final_goal: finalGoal || 'Skill Mastery & Career Growth',
            target_outcome: finalGoal || 'Skill Mastery & Career Growth',
            onboardingCompleted: true
        };

        const token = localStorage.getItem('fbrts_token') || localStorage.getItem('token') || localStorage.getItem('minerva_token');
        
        try {
            if (token) {
                // Save and complete onboarding
                await onboardingApi.saveStep(summary as any, token).catch(() => {});
                await onboardingApi.complete(summary, token).catch(() => {});
            }

            // Mark local state as COMPLETE
            completeOnboardingState();
            localStorage.setItem('fbrts_onboarding_backup', JSON.stringify(summary));

            // Fast redirect based on target level
            if (lifeStage === "School (8-10)" || lifeStage === "High School (11-12)") {
                navigate('/future-education', { replace: true });
            } else {
                navigate('/builder', { replace: true });
            }
        } catch (e) {
            console.error("Fast Onboarding Error", e);
            completeOnboardingState();
            localStorage.setItem('fbrts_onboarding_backup', JSON.stringify(summary));
            navigate('/builder', { replace: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl bg-[#09090b] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between animate-in fade-in zoom-in-95 duration-300 mx-2 space-y-6">

            {/* Header */}
            <div className="border-b border-white/10 pb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase flex items-center gap-1.5">
                        <Rocket size={14} /> Ultra Fast Setup (15 Seconds)
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-black tracking-widest uppercase">
                        Instant Unlocked
                    </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
                    Configure Your AI Learning Profile
                </h1>
                <p className="text-xs text-gray-400 font-medium">Answer 3 quick questions to unlock all Future BRTS modules immediately.</p>
            </div>

            {/* Q1: Current Level / Life Stage */}
            <div className="space-y-3">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                    Which life stage / level are you currently at?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LIFE_STAGES.map((ls) => (
                        <button
                            key={ls}
                            type="button"
                            onClick={() => {
                                setLifeStage(ls);
                                setQ2Detail('');
                            }}
                            className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border ${lifeStage === ls ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30' : 'bg-white/[0.02] text-gray-300 border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.05]'}`}
                        >
                            {ls}
                        </button>
                    ))}
                </div>
            </div>

            {/* Q2: Dynamic Detail (Auto-revealed based on Q1) */}
            {lifeStage && (
                <div className="space-y-3 pt-2 border-t border-white/5 animate-in fade-in duration-300">
                    <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                        {lifeStage === "School (8-10)" && "Which class are you studying in?"}
                        {lifeStage === "High School (11-12)" && "What is your stream?"}
                        {(lifeStage.includes("Graduation") || lifeStage.includes("PhD")) && "What is your Degree / Field?"}
                        {lifeStage.includes("Job") && "What is your Current Role / Background?"}
                        {lifeStage.includes("Business") && "What is your Business Stage?"}
                        {lifeStage.includes("Govt") && "What is your Target Exam / Preparation Path?"}
                    </label>

                    {/* Q2 Options for School */}
                    {lifeStage === "School (8-10)" && (
                        <div className="grid grid-cols-3 gap-2">
                            {["8th Class", "9th Class", "10th Class"].map((cls) => (
                                <button
                                    key={cls}
                                    type="button"
                                    onClick={() => setQ2Detail(cls)}
                                    className={`p-3 rounded-2xl text-xs font-bold text-center transition-all border ${q2Detail === cls ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/[0.02] text-gray-300 border-white/10 hover:border-indigo-500/40'}`}
                                >
                                    {cls}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Q2 Options for High School */}
                    {lifeStage === "High School (11-12)" && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {["Science (PCM/PCB)", "Commerce", "Arts / Humanities", "Diploma"].map((st) => (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => setQ2Detail(st)}
                                    className={`p-3 rounded-2xl text-xs font-bold text-center transition-all border ${q2Detail === st ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/[0.02] text-gray-300 border-white/10 hover:border-indigo-500/40'}`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Q2 Options for Business */}
                    {lifeStage.includes("Business") && (
                        <div className="grid grid-cols-3 gap-2">
                            {["Idea Phase", "Running Business", "Scaling & Funding"].map((stg) => (
                                <button
                                    key={stg}
                                    type="button"
                                    onClick={() => setQ2Detail(stg)}
                                    className={`p-3 rounded-2xl text-xs font-bold text-center transition-all border ${q2Detail === stg ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/[0.02] text-gray-300 border-white/10 hover:border-indigo-500/40'}`}
                                >
                                    {stg}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Q2 Text Input for Grad / Job / Govt / Other */}
                    {!["School (8-10)", "High School (11-12)", "Business / Startup"].includes(lifeStage) && (
                        <input
                            type="text"
                            placeholder={
                                lifeStage.includes("Graduation") ? "e.g. B.Tech Computer Science, B.Com, BBA, MBBS..." :
                                lifeStage.includes("Job") ? "e.g. Software Developer, Sales & Marketing, Accountant..." :
                                "e.g. UPSC, SSC, Banking, Abroad Masters..."
                            }
                            value={q2Detail}
                            onChange={(e) => setQ2Detail(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white outline-none focus:border-indigo-500/60 font-medium"
                        />
                    )}
                </div>
            )}

            {/* Q3: Main Goal */}
            {lifeStage && (
                <div className="space-y-3 pt-2 border-t border-white/5 animate-in fade-in duration-300">
                    <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                        Where do you want to see yourself in 6-12 months? (Goal)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {GOAL_OPTIONS.map((goal) => (
                            <button
                                key={goal}
                                type="button"
                                onClick={() => setFinalGoal(goal)}
                                className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border ${finalGoal === goal ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30' : 'bg-white/[0.02] text-gray-300 border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.05]'}`}
                            >
                                {goal}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Submit Action */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check size={12} className="text-emerald-400" /> Unlocks All 8 Modules Instantly
                </p>
                <button
                    onClick={handleFinalSubmit}
                    disabled={loading || !lifeStage}
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-40 active:scale-95"
                >
                    {loading ? (
                        <>Launching Platform...</>
                    ) : (
                        <>
                            Launch My AI Platform <ChevronRight size={16} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
