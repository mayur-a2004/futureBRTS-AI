import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, CheckCircle2, Send, Sparkles, MessageSquare, FileText, Loader2 } from 'lucide-react';
import { LevelUpModal } from '../../components/ui/LevelUpModal';

const MinervaTasksPage: React.FC = () => {
    const { user, token } = useAuth() as any;
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    
    // Interactive solving state
    const [solvingTaskId, setSolvingTaskId] = useState<string | null>(null);
    const [answer, setAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
    const [newLevel, setNewLevel] = useState(1);
    const [xpGained, setXpGained] = useState(0);

    useEffect(() => {
        if (token) {
            loadTasks();
        }
    }, [token]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const res = await minervaApi.getAllTasks(token);
            if (res.success) {
                setTasks(res.tasks || []);
            }
            const examRes = await minervaApi.getExams(token);
            if (examRes.success) {
                setExams(examRes.exams || []);
            }
        } catch (err) {
            console.error('Error loading tasks or exams:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSolve = (task: any) => {
        setSolvingTaskId(task._id);
        setAnswer('');
    };

    const handleCloseSolve = () => {
        setSolvingTaskId(null);
        setAnswer('');
    };

    const handleSubmitAnswer = async (e: React.FormEvent, task: any) => {
        e.preventDefault();
        if (!answer.trim() || submitting) return;

        setSubmitting(true);
        try {
            const res = await minervaApi.submitTask(token, task._id, answer);
            if (res.success) {
                // Update local task state
                setTasks(prev => prev.map(t => t._id === task._id ? {
                    ...t,
                    submitted: true,
                    student_answer: answer,
                    ai_score: res.score,
                    ai_feedback: res.feedback,
                    ai_correction: res.correction,
                    passed: res.passed
                } : t));
                if (res.levelUp) {
                    setNewLevel(res.currentLevel);
                    setXpGained(res.xpGained);
                    setIsLevelUpOpen(true);
                }
                setSolvingTaskId(null);
                setAnswer('');
            } else {
                alert(res.error || 'Failed to submit answer.');
            }
        } catch (err) {
            console.error('Task submission error:', err);
            alert('Failed to submit answer.');
        } finally {
            setSubmitting(false);
        }
    };

    const pendingTasks = tasks.filter(t => !t.submitted);
    const completedTasks = tasks.filter(t => t.submitted);

    if (loading) return (
        <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    const activeList = activeTab === 'pending' ? pendingTasks : completedTasks;

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-16">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
            
            {/* Header */}
            <header className="sticky top-14 md:top-0 z-20 bg-black/20 backdrop-blur-xl border-b border-white/[0.06] px-6 py-3.5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button onClick={() => navigate('/future-education')} className="p-2 bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all text-gray-400 hover:text-white flex items-center justify-center active:scale-95 shrink-0">
                        <ChevronLeft size={14} />
                    </button>
                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] shrink-0">
                            <FileText size={13} className="animate-pulse" />
                        </div>
                        <span className="font-display font-black text-xs tracking-[0.15em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-indigo-200 select-none">
                            Future Education OS
                        </span>
                    </div>
                    <div className="h-4 w-px bg-white/10 hidden sm:block" />
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02] border border-white/5 select-none text-[9px] font-black text-gray-400 tracking-wider uppercase">
                        <span>Tasks & Homework</span>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">
                
                {/* Tabs */}
                <div className="flex border-b border-white/[0.06] mb-6 select-none">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'pending' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-400'}`}
                    >
                        <span>Pending Tasks ({pendingTasks.length})</span>
                        {activeTab === 'pending' && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'completed' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-400'}`}
                    >
                        <span>Completed Archive ({completedTasks.length})</span>
                        {activeTab === 'completed' && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                        )}
                    </button>
                </div>

                {/* Daily RPG Quests Panel */}
                {activeTab === 'pending' && (
                    <div className="bg-[#0b081a]/60 border border-indigo-500/20 rounded-3xl p-5 mb-6 shadow-2xl backdrop-blur-md relative overflow-hidden animate-in fade-in duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                        <h2 className="font-bold text-xs text-indigo-300 mb-3.5 flex items-center gap-1.5 uppercase tracking-wider">
                            <span>⚔️</span> Active Daily Quests
                        </h2>
                        <div className="space-y-2.5">
                            {(() => {
                                const completedMicro = tasks.filter(t => !t.is_homework && t.submitted).length;
                                const hasHighScoringExam = exams.some(e => (e.status === 'submitted' || e.status === 'graded') && e.percentage >= 80);
                                const completedReview = tasks.some(t => t.submitted && (t.task_type === 'review' || t.is_homework || !t.passed));

                                return [
                                    { name: 'Solve 3 Micro-Tasks for your active topics', xp: '+150 XP', gold: '+20 Gold', progress: `${Math.min(completedMicro, 3)}/3`, done: completedMicro >= 3 },
                                    { name: 'Score 80%+ on Chapter Practice Exam', xp: '+300 XP', gold: '+50 Gold', progress: hasHighScoringExam ? '1/1' : '0/1', done: hasHighScoringExam },
                                    { name: 'Complete a Homework or Review task', xp: '+100 XP', gold: '+10 Gold', progress: completedReview ? '1/1' : '0/1', done: completedReview },
                                ];
                            })().map((q, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${q.done ? 'bg-emerald-950/10 border-emerald-500/25 opacity-70' : 'bg-black/30 border-white/[0.05]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border transition-all ${q.done ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                                            {q.done ? '✓' : idx + 1}
                                        </div>
                                        <div className="text-xs font-semibold text-gray-300">{q.name}</div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[10px] font-bold text-indigo-400">{q.xp}</span>
                                        <span className="text-[10px] font-bold text-amber-400">🪙 {q.gold}</span>
                                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 font-bold font-mono">{q.progress}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tasks List */}
                <div className="space-y-4">
                    {activeList.length === 0 ? (
                        <div className="text-center py-16 bg-[#0B0915]/30 border border-dashed border-white/5 rounded-3xl p-8 shadow-md">
                            <CheckCircle2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-gray-300 font-bold text-sm mb-1">
                                {activeTab === 'pending' ? 'All caught up!' : 'No completed tasks'}
                            </h3>
                            <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed">
                                {activeTab === 'pending'
                                    ? 'Awesome job! You have no pending study tasks or homework. Keep learning!'
                                    : 'When you submit answers to homework or micro-tasks, they will show up here.'}
                            </p>
                        </div>
                    ) : (
                        activeList.map((task: any) => (
                            <div
                                key={task._id}
                                className="bg-[#0B0915]/60 border border-white/[0.05] rounded-3xl p-5 shadow-2xl backdrop-blur-2xl transition-all hover:border-indigo-500/20"
                            >
                                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                            task.is_homework ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
                                        }`}>
                                            {task.is_homework ? 'Homework' : 'Self-Study Task'}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">Subject: {task.subject || 'General'}</span>
                                    </div>
                                    <div className="text-[10px] text-indigo-300 font-bold">
                                        Topic: {task.topic_title}
                                    </div>
                                </div>

                                <div className="text-xs text-gray-300 leading-relaxed font-semibold mb-4 bg-black/40 border border-white/[0.05] rounded-2xl p-4">
                                    {task.prompt}
                                </div>

                                {task.options && task.options.length > 0 && !task.submitted && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                        {task.options.map((opt: string, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setSolvingTaskId(task._id);
                                                    setAnswer(opt);
                                                }}
                                                className={`text-left p-3.5 rounded-2xl border text-[11px] font-semibold transition-all active:scale-[0.99] ${
                                                    solvingTaskId === task._id && answer === opt
                                                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)] font-bold'
                                                        : 'bg-black/20 border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.03]'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {task.submitted ? (
                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div className="text-[10px] text-gray-400">
                                                Your Answer: <span className="text-white font-bold italic">"{task.student_answer}"</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                                    task.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                    {task.passed ? 'PASSED' : 'NEEDS WORK'}
                                                </span>
                                                <span className="text-[10px] text-indigo-400 font-bold">AI Score: {task.ai_score}/100</span>
                                            </div>
                                        </div>

                                        {task.ai_feedback && (
                                            <div className="bg-[#0b1624]/60 border border-cyan-500/20 rounded-2xl p-4 text-[11px] leading-relaxed text-[#e2f9f6] shadow-md relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/30" />
                                                <div className="font-bold text-cyan-400 flex items-center gap-1.5 mb-1 select-none">
                                                    <Sparkles size={12} className="text-cyan-400 animate-pulse" /> AI Teacher Feedback
                                                </div>
                                                {task.ai_feedback}
                                            </div>
                                        )}

                                        {task.ai_correction && (
                                            <div className="bg-[#0a1e12]/60 border border-emerald-500/20 rounded-2xl p-4 text-[11px] leading-relaxed text-[#e2f9f6] shadow-md relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/30" />
                                                <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1 select-none">
                                                    <CheckCircle2 size={12} className="text-emerald-400" /> Correct / Ideal Answer
                                                </div>
                                                {task.ai_correction}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2 justify-between items-center pt-2">
                                            {user?.parentDetails?.parentEmail && (
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                    {user.parentDetails.parentEmailVerified ? 'Scorecard Emailed ✅' : 'Email Verification Pending 🟡'}
                                                </span>
                                            )}
                                            <div className="flex gap-2">
                                                {user?.parentDetails?.parentPhone && (
                                                    <button
                                                        onClick={() => {
                                                            const phone = user.parentDetails.parentPhone;
                                                            const text = `Dear Parent, I have submitted my homework assignment on Future Education OS.\nTask: ${task.prompt || 'Homework'}\nResult: ${task.passed ? 'PASSED ✅' : 'RETRY REQUIRED ❌'}\nScore: ${task.ai_score || 0}/100\nAI Feedback: ${task.ai_feedback || 'Completed.'}`;
                                                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                                                        }}
                                                        className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 active:scale-95 shadow-md shadow-emerald-500/5"
                                                    >
                                                        <span>📢 Share to Parent</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/future-education?askDoubt=${encodeURIComponent(`Maine is task ko solve kiya: '${task.prompt}'. Mera answer tha: '${task.student_answer}'. AI Feedback: '${task.ai_feedback || ''}'. Mujhe is feedback aur answer par clarity chahiye.`)}`)}
                                                    className="px-4 py-2 bg-white/[0.03] hover:bg-white/10 text-indigo-400 border border-white/5 rounded-2xl text-[11px] font-semibold transition-all inline-flex items-center gap-1.5 active:scale-95"
                                                >
                                                    <MessageSquare size={12} />
                                                    <span>Ask Doubt about Feedback</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-end">
                                        {solvingTaskId === task._id ? (
                                            <form onSubmit={(e) => handleSubmitAnswer(e, task)} className="w-full flex flex-col gap-3">
                                                {(!task.options || task.options.length === 0) && (
                                                    <textarea
                                                        required
                                                        value={answer}
                                                        onChange={e => setAnswer(e.target.value)}
                                                        placeholder="Type your detailed answer here..."
                                                        className="w-full h-24 bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-2xl px-4 py-3 text-xs text-white outline-none placeholder-gray-600 resize-none font-medium"
                                                    />
                                                )}
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleCloseSolve}
                                                        className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-[11px] transition-all font-bold active:scale-95"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={submitting || !answer.trim()}
                                                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-[11px] font-bold transition-all inline-flex items-center gap-1.5 border border-indigo-400/20 shadow-md active:scale-95"
                                                    >
                                                        {submitting ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Send size={12} />
                                                        )}
                                                        <span>Submit to AI Teacher</span>
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/future-education?askDoubt=${encodeURIComponent(`Mujhe is self-study task mein doubt hai: '${task.prompt}'. Iska concept aur solution explain kijiye.`)}`)}
                                                    className="px-4 py-2 bg-white/[0.03] hover:bg-white/10 text-gray-300 border border-white/5 rounded-2xl text-[11px] font-semibold transition-all inline-flex items-center gap-1.5 active:scale-95"
                                                >
                                                    <MessageSquare size={12} />
                                                    <span>Ask Doubt</span>
                                                </button>
                                                <button
                                                    onClick={() => handleOpenSolve(task)}
                                                    className="px-5 py-2 bg-indigo-600/10 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl text-[11px] font-black transition-all inline-flex items-center gap-1.5 active:scale-95"
                                                >
                                                    <Send size={12} /> Solve Task
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
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

// SVG Loader Helper
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default MinervaTasksPage;
