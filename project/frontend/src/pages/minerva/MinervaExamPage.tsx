import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { Clock, FileText, CheckCircle2, MessageSquare } from 'lucide-react';

const MinervaExamPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth() as any;
    const navigate = useNavigate();

    const [exam, setExam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const startTime = useRef(Date.now());
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (!token || !id) return;
        loadExam();
    }, [token, id]);

    useEffect(() => {
        if (!exam || submitted) return;
        setTimeLeft(exam.duration_minutes * 60);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [exam]);

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
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (submitting) return;
        clearInterval(timerRef.current);
        setSubmitting(true);
        const timeTaken = Math.round((Date.now() - startTime.current) / 60000);
        const res = await minervaApi.submitExam(token, id!, answers, timeTaken);
        setSubmitting(false);
        if (res.success) {
            setSubmitted(true);
            setResult(res);
        }
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
            <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white flex items-center justify-center px-6 font-inter pb-12">
                <div className="max-w-md w-full text-center bg-white/[0.01] border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
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

                    <div className="text-gray-300 text-xs leading-relaxed mb-8 bg-white/[0.01] border border-white/5 rounded-2xl p-4 font-medium">{result.message}</div>

                    <div className="flex gap-3 justify-center">
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
                </div>
            </div>
        );
    }

    // ── EXAM SCREEN ──
    const totalQ = exam.questions?.length || 0;
    const answered = Object.keys(answers).length;

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-16">
            
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
