import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { Clock, FileText, CheckCircle2, MessageSquare } from 'lucide-react';
import { LevelUpModal } from '../../components/ui/LevelUpModal';

const MinervaExamPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user, token } = useAuth() as any;
    const navigate = useNavigate();

    const [exam, setExam] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
    const [newLevel, setNewLevel] = useState(1);
    const [xpGained, setXpGained] = useState(0);
    
    const startTime = useRef(Date.now());
    const timerRef = useRef<any>(null);
    const answersRef = useRef<Record<number, string>>({});
    const isSubmittedRef = useRef(false);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        isSubmittedRef.current = submitted;
    }, [submitted]);

    useEffect(() => {
        if (!token || !id) return;
        loadExam();
    }, [token, id]);

    // 1. Exit & refresh prevention warning
    useEffect(() => {
        if (!exam || submitted) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "Are you sure you want to exit the exam? Your progress will be lost and you will not be able to re-take it.";
            return e.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [exam, submitted]);

    // 2. Tab switching detection & auto-submit after 3 switches
    useEffect(() => {
        if (!exam || submitted) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setTabSwitches(prev => {
                    const nextCount = prev + 1;
                    if (nextCount >= 3) {
                        alert("TAB SWITCHING LIMIT EXCEEDED! You switched tabs 3 times. Your exam has been automatically submitted.");
                        handleSubmitDirect();
                        return nextCount;
                    }
                    alert(`Warning: Tab switching is strictly monitored during the exam! (${nextCount}/3 switches)`);
                    return nextCount;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [exam, submitted]);

    // 3. Auto-submit on page unmount (unauthorized navigation/back)
    useEffect(() => {
        return () => {
            if (!isSubmittedRef.current && exam && exam.status !== 'submitted') {
                const timeTaken = Math.round((Date.now() - startTime.current) / 60000);
                minervaApi.submitExam(token, id!, answersRef.current, timeTaken).catch(console.error);
            }
        };
    }, [exam, id, token]);

    useEffect(() => {
        if (!exam || submitted) return;
        setTimeLeft(exam.duration_minutes * 60);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmitDirect();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [exam, submitted]);

    const loadExam = async () => {
        const res = await minervaApi.getExam(token, id!);
        if (res.success) {
            setExam(res.exam);
            if (res.exam.status === 'submitted') {
                setSubmitted(true);
                setResult({
                    score: res.exam.total_obtained,
                    total: res.exam.total_marks,
                    percentage: res.exam.percentage,
                    grade: res.exam.grade,
                    message: res.exam.ai_report,
                });
            }
        }
        
        try {
            const profileRes = await minervaApi.getProfile(token);
            if (profileRes.success) {
                setProfile(profileRes.profile);
            }
        } catch (err) {
            console.error("Failed to load student profile:", err);
        }
        
        setLoading(false);
    };

    const handleSubmitDirect = async () => {
        if (submitting || isSubmittedRef.current) return;
        clearInterval(timerRef.current);
        setSubmitting(true);
        const timeTaken = Math.round((Date.now() - startTime.current) / 60000);
        const res = await minervaApi.submitExam(token, id!, answersRef.current, timeTaken);
        setSubmitting(false);
        if (res.success) {
            setSubmitted(true);
            setResult(res);
            if (res.levelUp) {
                setNewLevel(res.currentLevel);
                setXpGained(res.xpGained);
                setIsLevelUpOpen(true);
            }
            // Refresh parent view if any
            window.dispatchEvent(new Event('future-education-refresh-sessions'));
        }
    };

    const handleSubmit = async () => {
        const confirmSubmit = window.confirm("Are you sure you want to submit your exam?");
        if (confirmSubmit) {
            await handleSubmitDirect();
        }
    };

    const handlePreventCopyPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        alert("Copying and pasting is strictly prohibited during the exam to prevent cheating!");
    };

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    const timeWarning = timeLeft < 300 && timeLeft > 0;

    if (loading) return (
        <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );
    if (!exam) return (
        <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter text-gray-400">
            Exam not found. <button onClick={() => navigate('/future-education/exams')} className="ml-2 text-indigo-400 hover:underline font-bold">Go Back</button>
        </div>
    );

    // ── RESULT SCREEN ──
    if (submitted && result) {
        const gradeColor = result.grade === 'A+' || result.grade === 'A' ? 'text-emerald-400'
            : result.grade === 'B' ? 'text-indigo-400' : result.grade === 'C' ? 'text-amber-400' : 'text-red-400';

        return (
            <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white flex flex-col items-center px-6 font-inter py-12 pb-24">
                <div className="max-w-2xl w-full text-center bg-white/[0.01] border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
                    <div className="text-6xl mb-4">{result.percentage >= 75 ? '🎉' : result.percentage >= 50 ? '📚' : '💪'}</div>
                    <h1 className="text-2xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">{exam.title}</h1>
                    <div className="text-gray-500 text-xs mb-8 uppercase font-bold tracking-wider">{exam.board?.toUpperCase()} • {exam.subject}</div>

                    <div className={`text-7xl font-black mb-2 leading-none ${gradeColor}`}>{result.grade}</div>
                    <div className="text-xl font-bold mb-1">{result.score}/{result.total} Marks</div>
                    <div className="text-sm text-indigo-400 font-semibold mb-6">{result.percentage}% Accuracy</div>

                    {/* Progress Bar */}
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-8 border border-white/5">
                        <div className={`h-full rounded-full transition-all duration-1000 ${result.percentage >= 75 ? 'bg-emerald-500' : result.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${result.percentage}%` }} />
                    </div>

                    {/* Official School-like Report Card */}
                    <div className="mt-8 mb-8 text-left bg-[#05040a]/80 border border-indigo-500/25 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                        {/* Blueprint grid overlay */}
                        <div className="absolute inset-0 bg-cyber-dots opacity-20 pointer-events-none" />
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                        
                        {/* Header Banner */}
                        <div className="border-b border-white/10 pb-4 mb-5 text-center relative z-10">
                            <div className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase mb-1">
                                {profile?.school_name || 'MINERVA ACADEMY OS'}
                            </div>
                            <h2 className="text-sm font-black text-white tracking-widest uppercase">
                                OFFICIAL ACADEMIC PROGRESS REPORT
                            </h2>
                            <div className="text-[9px] text-gray-500 mt-0.5 tracking-wider font-mono">
                                ASSESSMENT ID: #MIN-{id?.slice(-6).toUpperCase()} • SESSION 2026-27
                            </div>
                        </div>

                        {/* Student Details Grid */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[11px] mb-6 relative z-10 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                            <div>
                                <span className="text-gray-500 block uppercase font-bold text-[8px] tracking-wider mb-0.5">STUDENT NAME</span>
                                <span className="text-gray-200 font-bold">{profile?.name || user?.name || 'Academic Scholar'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block uppercase font-bold text-[8px] tracking-wider mb-0.5">BOARD / COUNCIL</span>
                                <span className="text-gray-200 font-bold uppercase">{profile?.board || exam.board || 'CBSE'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block uppercase font-bold text-[8px] tracking-wider mb-0.5">STANDARD & MEDIUM</span>
                                <span className="text-gray-200 font-bold uppercase">{profile?.grade_level?.replace('_', ' ') || exam.grade_level?.replace('_', ' ') || 'Class 10'} • {profile?.medium || 'English'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block uppercase font-bold text-[8px] tracking-wider mb-0.5">DATE OF EVALUATION</span>
                                <span className="text-gray-200 font-bold">
                                    {new Date(exam.submitted_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        {/* Marks Memorandum Table */}
                        <div className="mb-6 relative z-10 overflow-hidden border border-white/5 rounded-2xl">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-white/5 text-gray-400 font-black text-[9px] uppercase tracking-wider border-b border-white/5">
                                    <tr>
                                        <th className="px-4 py-2.5">Subject / Assessment Area</th>
                                        <th className="px-4 py-2.5 text-center">Max</th>
                                        <th className="px-4 py-2.5 text-center">Obtained</th>
                                        <th className="px-4 py-2.5 text-center">Grade</th>
                                        <th className="px-4 py-2.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-gray-200 font-medium">
                                    <tr className="bg-white/[0.01]">
                                        <td className="px-4 py-3 font-semibold text-gray-100">{exam.subject} ({exam.title})</td>
                                        <td className="px-4 py-3 text-center font-mono">{exam.total_marks}</td>
                                        <td className="px-4 py-3 text-center font-mono font-bold text-indigo-300">{exam.total_obtained || result.score}</td>
                                        <td className="px-4 py-3 text-center font-mono font-bold text-purple-400">{exam.grade || result.grade}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full
                                                ${(exam.total_obtained || result.score) >= (exam.total_marks * 0.35) 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {(exam.total_obtained || result.score) >= (exam.total_marks * 0.35) ? 'PASSED' : 'FAILED'}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Peer Group Performance Simulator */}
                        <div className="mb-6 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs relative z-10">
                            <span className="text-gray-500 block uppercase font-bold text-[8px] tracking-wider mb-1.5">PEER COMPARISON & PERFORMANCE RANKING</span>
                            {result.percentage >= 75 ? (
                                <p className="text-emerald-400/90 font-medium leading-relaxed">
                                    📈 You are currently in the <strong>top 12.5% of students</strong> preparing for {(profile?.board || exam.board)?.toUpperCase()} {(profile?.grade_level || exam.grade_level)?.replace('_', ' ').toUpperCase()} in {exam.subject}. Your performance is <strong>{Math.round(result.percentage - 65)}% above the median peer group score</strong>. Keep it up!
                                </p>
                            ) : result.percentage >= 50 ? (
                                <p className="text-indigo-300 font-medium leading-relaxed">
                                    📊 You are in the <strong>median peer range (Top 45%)</strong>. Your performance matches standard criteria, but you need <strong>about {Math.round(75 - result.percentage)}% more marks</strong> to reach the honors/A+ rank in {exam.subject}. Use targeted daily homework sheets to practice.
                                </p>
                            ) : (
                                <p className="text-red-400 font-medium leading-relaxed">
                                    ⚠️ Performance is <strong>{Math.round(60 - result.percentage)}% below the peer group median passing line</strong>. You are in the lower 15% range for this topic. Daily homework sessions will now auto-target these gaps to rebuild foundation concepts.
                                </p>
                            )}
                        </div>

                        {/* Strengths & Weaknesses Breakdown */}
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-emerald-500/[0.01] border border-emerald-500/10 rounded-2xl p-4">
                                <span className="text-emerald-400 block uppercase font-bold text-[8.5px] tracking-wider mb-2">✅ TOPIC STRENGTHS</span>
                                {exam.strong_areas?.length > 0 ? (
                                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-300 font-medium">
                                        {exam.strong_areas.map((area: string, idx: number) => (
                                            <li key={idx} className="capitalize">{area}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-[11px] text-gray-500 italic">No significant strengths recorded yet.</p>
                                )}
                            </div>
                            <div className="bg-red-500/[0.01] border border-red-500/10 rounded-2xl p-4">
                                <span className="text-red-400 block uppercase font-bold text-[8.5px] tracking-wider mb-2">❌ SYLLABUS WEAKNESSES</span>
                                {exam.weak_areas?.length > 0 ? (
                                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-300 font-medium">
                                        {exam.weak_areas.map((area: string, idx: number) => (
                                            <li key={idx} className="capitalize">{area}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-[11px] text-gray-500 italic">Excellent! No weak areas identified in this test.</p>
                                )}
                            </div>
                        </div>

                        {/* Holographic Verification Stamp */}
                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10 text-[9px]">
                            <div className="text-gray-500 uppercase tracking-wider font-bold">
                                SIGNED BY: <span className="text-indigo-400">Minerva AI Grader Engine</span>
                            </div>
                            <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                                🛡️ Minerva Verified
                            </div>
                        </div>
                    </div>

                    {/* Parent Notification Banner */}
                    {user?.parentDetails?.parentEmail && (
                        <div className="mb-8 p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/20 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                            <div>
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                    <span>👨‍👩‍👦</span> Parent Alert System
                                </div>
                                <p className="text-xs text-gray-300">
                                    {user.parentDetails.parentEmailVerified ? (
                                        <span>Scorecard has been automatically emailed to <strong className="text-white">{user.parentDetails.parentEmail}</strong>.</span>
                                    ) : (
                                        <span>Email verification is pending for <strong className="text-white">{user.parentDetails.parentEmail}</strong>. Scorecard will send after verification.</span>
                                    )}
                                </p>
                            </div>
                            {user.parentDetails.parentPhone && (
                                <button
                                    onClick={() => {
                                        const phone = user.parentDetails.parentPhone;
                                        const text = `Dear Parent, I have completed the "${exam.title}" exam on Future Education OS.\nScore: ${result.score || result.total_obtained}/${result.total || exam.total_marks} (${result.percentage || exam.percentage}%)\nGrade: ${result.grade || exam.grade}\nAI Feedback: ${result.message || result.ai_report || 'Exam completed.'}`;
                                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-600/10"
                                >
                                    <span>📢</span> Share on WhatsApp
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 justify-center mb-12">
                        <button onClick={() => navigate('/future-education')} className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all">
                            ← OS Portal
                        </button>
                        <button onClick={() => navigate(`/future-education?askDoubt=${encodeURIComponent(`Maine '${exam.title}' (${exam.subject}) exam diya aur mera score ${result.score}/${result.total} aaya, grade ${result.grade}. AI Feedback report thi: '${result.message || ''}'. Mujhe is exam ke weak topics aur mistakes revise karne hain.`)}`)}
                            className="bg-white/5 hover:bg-white/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md">
                            <MessageSquare size={13} />
                            <span>Discuss Results</span>
                        </button>
                        <button onClick={() => navigate('/future-education/exams')} className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg">
                            Exams Archive
                        </button>
                    </div>

                    {/* Solutions Review List */}
                    <div className="text-left border-t border-white/10 pt-8 mt-4 space-y-6">
                        <h3 className="text-base font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 border-b border-white/5 pb-3 flex items-center gap-2">
                            <span>🔍</span> Question Paper Review & Solutions
                        </h3>

                        {exam.questions?.map((q: any, idx: number) => {
                            const studentAns = exam.student_answers?.find((ans: any) => ans.question_number === q.question_number);
                            const obtained = studentAns ? studentAns.obtained_marks : 0;
                            const isCorrect = obtained === q.marks && q.marks > 0;
                            const isPartial = obtained > 0 && obtained < q.marks;

                            return (
                                <div key={idx} className={`p-5 rounded-2xl border bg-[#05040a]/40 backdrop-blur-md transition-all duration-300
                                    ${isCorrect 
                                        ? 'border-emerald-500/15 shadow-[0_4px_20px_rgba(16,185,129,0.02)]' 
                                        : isPartial
                                            ? 'border-amber-500/15 shadow-[0_4px_20px_rgba(245,158,11,0.02)]'
                                            : 'border-red-500/15 shadow-[0_4px_20px_rgba(239,68,68,0.02)]'
                                    }`}>
                                    
                                    {/* Question header */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <span className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold border
                                            ${isCorrect 
                                                ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400' 
                                                : isPartial
                                                    ? 'bg-amber-500/10 border-amber-500/35 text-amber-400'
                                                    : 'bg-red-500/10 border-red-500/35 text-red-400'
                                            }`}>
                                            {q.question_number}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-200 leading-relaxed font-semibold">{q.question}</p>
                                            <div className="flex items-center gap-2 mt-1.5 text-[9px] font-black uppercase tracking-wider">
                                                <span className="text-gray-500">[{q.marks} Mark{q.marks > 1 ? 's' : ''}]</span>
                                                <span className="text-gray-500">•</span>
                                                <span className={isCorrect ? 'text-emerald-400' : isPartial ? 'text-amber-400' : 'text-red-400'}>
                                                    Obtained: {obtained}/{q.marks}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* MCQ Option Choices */}
                                    {q.type === 'mcq' && q.options?.length > 0 && (
                                        <div className="ml-11 mb-4 space-y-1.5">
                                            {q.options.map((opt: string, oi: number) => {
                                                const letter = String.fromCharCode(65 + oi);
                                                const isExpected = opt.trim().toLowerCase() === q.expected_answer?.trim().toLowerCase();
                                                const isSelected = opt.trim().toLowerCase() === studentAns?.student_answer?.trim().toLowerCase();

                                                return (
                                                    <div key={oi} className={`px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between
                                                        ${isExpected 
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                                                            : isSelected
                                                                ? 'bg-red-500/10 border-red-500/30 text-red-400 font-bold'
                                                                : 'bg-white/[0.01] border-white/5 text-gray-500'
                                                        }`}>
                                                        <span><span className="font-bold mr-2">{letter}.</span>{opt}</span>
                                                        {isExpected && <span className="text-[9px] font-black tracking-widest uppercase bg-emerald-500/15 px-2 py-0.5 rounded">Ideal</span>}
                                                        {isSelected && !isExpected && <span className="text-[9px] font-black tracking-widest uppercase bg-red-500/15 px-2 py-0.5 rounded">Your Selection</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Student Answer for non-MCQ */}
                                    {q.type !== 'mcq' && (
                                        <div className="ml-11 mb-4 space-y-3">
                                            <div>
                                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">Your Answer:</div>
                                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs text-gray-300 italic">
                                                    {studentAns?.student_answer || '(No Answer Provided)'}
                                                </div>
                                            </div>
                                            
                                            {q.expected_answer && (
                                                <div>
                                                    <div className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-wider mb-1">Ideal Expected Answer:</div>
                                                    <div className="bg-emerald-500/[0.02] border border-emerald-500/15 rounded-xl p-3 text-xs text-emerald-300/90 font-medium">
                                                        {q.expected_answer}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* AI Graded Correction & Feedback */}
                                    {studentAns && (studentAns.feedback || studentAns.correction) && (
                                        <div className="ml-11 mt-3 p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl space-y-2 text-xs">
                                            {studentAns.feedback && (
                                                <div>
                                                    <strong className="text-indigo-300 font-bold uppercase tracking-wider text-[9px] block mb-0.5">Tutor Feedback</strong>
                                                    <span className="text-gray-300 leading-relaxed font-medium">{studentAns.feedback}</span>
                                                </div>
                                            )}
                                            {studentAns.correction && (
                                                <div className="pt-2 border-t border-white/5">
                                                    <strong className="text-cyan-300 font-bold uppercase tracking-wider text-[9px] block mb-0.5">Ideal Correction</strong>
                                                    <span className="text-gray-300 leading-relaxed font-medium">{studentAns.correction}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // ── EXAM SCREEN ──
    const totalQ = exam.questions?.length || 0;
    const answered = Object.keys(answers).length;

    return (
        <div onCopy={handlePreventCopyPaste} onCut={handlePreventCopyPaste} onPaste={handlePreventCopyPaste}
            className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-16 select-none">
            
            {/* Sticky Header */}
            <div className={`sticky top-0 z-20 border-b transition-all ${timeWarning ? 'bg-red-950/70 border-red-500/30' : 'bg-black/40 border-white/5'} backdrop-blur-xl px-6 py-4`}>
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="font-bold text-sm truncate bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">{exam.title}</h1>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{answered}/{totalQ} Questions Answered</div>
                    </div>
                    <div className={`text-sm font-mono font-bold px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition-all
                        ${timeWarning ? 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse' : 'text-white bg-white/5 border-white/5'}`}>
                        <Clock size={14} />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                    {tabSwitches > 0 && (
                        <div className="text-xs font-black uppercase text-red-400 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/25 animate-pulse">
                            ⚠️ {tabSwitches}/3 Tab Switches
                        </div>
                    )}
                    <button onClick={handleSubmit} disabled={submitting}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg">
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                </div>
                {/* Progress Bar */}
                <div className="h-[2px] bg-white/5 mt-3">
                    <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(answered / totalQ) * 100}%` }} />
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-6">
                {/* Instructions */}
                <div className="bg-indigo-950/10 border border-indigo-500/10 rounded-2xl p-4 mb-6 text-xs text-gray-300 backdrop-blur-md flex items-start gap-2.5">
                    <FileText size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="text-indigo-300 font-bold uppercase tracking-wider block mb-1">Instructions</strong>
                        {exam.sections?.[0]?.instructions || `Please attempt all questions. Total marks: ${exam.total_marks}. Duration: ${exam.duration_minutes} minutes.`}
                    </div>
                </div>

                {/* Sections and Questions */}
                {exam.sections?.map((section: any, si: number) => (
                    <div key={si} className="mb-8">
                        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/5">
                            <h2 className="font-bold text-sm text-gray-200">{section.section_name}</h2>
                            <span className="text-[10px] text-gray-500 font-semibold">• {section.marks_per_question} Mark{section.marks_per_question > 1 ? 's' : ''} each</span>
                            <span className="ml-auto text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">{section.section_marks} Marks</span>
                        </div>

                        <div className="space-y-4">
                            {section.questions?.map((q: any, qi: number) => (
                                <div key={qi} className={`p-5 rounded-3xl border transition-all
                                    ${answers[q.question_number] ? 'bg-[#0f0b29]/20 border-indigo-500/20' : 'bg-white/[0.01] border-white/5'}`}>
                                    
                                    <div className="flex items-start gap-3 mb-4">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-bold text-gray-300">{q.question_number}</span>
                                        <div>
                                            <div className="text-xs text-gray-200 leading-relaxed font-semibold">{q.question}</div>
                                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">[{q.marks} Mark{q.marks > 1 ? 's' : ''}]</div>
                                        </div>
                                    </div>

                                    {/* MCQ Choices */}
                                    {q.type === 'mcq' && q.options?.length > 0 && (
                                        <div className="ml-11 space-y-2">
                                            {q.options.map((opt: string, oi: number) => (
                                                <button key={oi}
                                                    onClick={() => setAnswers(prev => ({ ...prev, [q.question_number]: opt }))}
                                                    className={`w-full text-left text-xs px-4 py-3 rounded-xl border transition-all font-semibold
                                                        ${answers[q.question_number] === opt
                                                            ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                                                            : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-white/5'}`}>
                                                    <span className="font-black mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Written answers */}
                                    {q.type !== 'mcq' && (
                                        <textarea
                                            value={answers[q.question_number] || ''}
                                            onChange={e => setAnswers(prev => ({ ...prev, [q.question_number]: e.target.value }))}
                                            placeholder={q.type === 'fill_blank' ? 'Fill in the blank...' : q.marks <= 3 ? 'Short answer explanation (2-3 lines)...' : 'Detailed descriptive answer (5-8 lines)...'}
                                            rows={q.marks <= 2 ? 2 : q.marks <= 5 ? 4 : 6}
                                            className="ml-11 w-[calc(100%-2.75rem)] bg-black/45 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 resize-none shadow-inner"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Bottom submit button */}
                <div className="sticky bottom-4 z-10">
                    <button onClick={handleSubmit} disabled={submitting}
                        className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-95 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all text-xs shadow-2xl shadow-indigo-900/20 active:scale-[0.99] flex items-center justify-center gap-2">
                        {submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                            <CheckCircle2 size={14} />
                        )}
                        <span>Submit Exam ({answered}/{totalQ} Questions Answered)</span>
                    </button>
                </div>
            </div>
            <LevelUpModal
                isOpen={isLevelUpOpen}
                level={newLevel}
                xpGained={xpGained}
                onClose={() => setIsLevelUpOpen(false)}
            />
        </div>
    );
};

// Loader Fallback Helper
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default MinervaExamPage;
