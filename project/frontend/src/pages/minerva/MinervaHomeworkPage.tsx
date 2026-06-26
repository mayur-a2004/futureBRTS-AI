import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, CheckSquare, Clock, Check, MessageSquare } from 'lucide-react';

const MinervaHomeworkPage: React.FC = () => {
    const { token } = useAuth() as any;
    const navigate = useNavigate();
    const [hw, setHw] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [results, setResults] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState<string | null>(null);

    useEffect(() => { if (token) loadHomework(); }, [token]);

    const loadHomework = async () => {
        setLoading(true);
        const res = await minervaApi.getTodayHomework(token);
        if (res.success) setHw(res);
        setLoading(false);
    };

    const submitTask = async (taskId: string) => {
        const answer = answers[taskId];
        if (!answer?.trim()) { alert('Jawab likho!'); return; }
        setSubmitting(taskId);
        const res = await minervaApi.submitTask(token, taskId, answer);
        if (res.success) {
            setResults(prev => ({ ...prev, [taskId]: res }));
            loadHomework();
        }
        setSubmitting(null);
    };

    const today = new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) return (
        <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-16">
            
            {/* Header */}
            <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate('/future-education')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all text-gray-400 hover:text-white">
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex-1">
                        <h1 className="font-black text-base bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">📝 Today's Homework</h1>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{today}</div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-6">
                {/* Stats Dashboard */}
                {hw && (
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                            { label: 'Total Tasks', value: hw.total, color: 'text-gray-200', icon: '📝' },
                            { label: 'Completed', value: hw.completed_count, color: 'text-emerald-400', icon: '✅' },
                            { label: 'Pending', value: hw.pending_count, color: 'text-amber-400', icon: '⏳' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col items-center shadow-lg backdrop-blur-md">
                                <span className="text-xl mb-1">{s.icon}</span>
                                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No Homework Placeholder */}
                {hw?.total === 0 && (
                    <div className="text-center py-16 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl p-8 max-w-md mx-auto shadow-xl backdrop-blur-md">
                        <div className="text-5xl mb-4">🎉</div>
                        <h2 className="font-black text-sm text-gray-200">No Homework Assigned Today!</h2>
                        <p className="text-xs text-gray-500 mt-1 mb-6 max-w-xs mx-auto leading-relaxed">
                            Completing chapter tasks generates automatic personalized homework sheets. Ask the AI tutor to start a topic roadmap!
                        </p>
                        <button onClick={() => navigate('/future-education')} className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-950/20 active:scale-95">
                            Start Studying →
                        </button>
                    </div>
                )}

                {/* Pending Tasks */}
                {hw?.pending_tasks?.length > 0 && (
                    <div className="mb-8">
                        <h2 className="font-bold text-xs text-amber-400 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                            <Clock size={14} className="animate-pulse" /> Pending Homework ({hw.pending_count})
                        </h2>
                        <div className="space-y-4">
                            {hw.pending_tasks.map((task: any) => (
                                <div key={task._id} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-md">
                                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
                                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-wider">{task.topic_title} • {task.marks} Marks</div>
                                        <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-wider">{task.difficulty}</span>
                                    </div>
                                    <div className="text-xs text-gray-200 leading-relaxed font-semibold mb-4">{task.prompt}</div>

                                    {task.type === 'mcq' && task.options?.length > 0 ? (
                                        <div className="space-y-2 mb-4">
                                            {task.options.map((opt: string, oi: number) => (
                                                <button key={oi}
                                                    onClick={() => setAnswers(prev => ({ ...prev, [task._id]: opt }))}
                                                    className={`w-full text-left text-xs px-4 py-3 rounded-xl border transition-all font-semibold
                                                        ${answers[task._id] === opt 
                                                            ? 'bg-indigo-600/20 border-indigo-500/50 text-white' 
                                                            : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-white/5'}`}>
                                                    <span className="font-black mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <textarea
                                            value={answers[task._id] || ''}
                                            onChange={e => setAnswers(prev => ({ ...prev, [task._id]: e.target.value }))}
                                            placeholder="Write your explanation answer here..."
                                            rows={3}
                                            className="w-full bg-black/45 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 resize-none mb-4 shadow-inner"
                                        />
                                    )}

                                    <div className="flex gap-2">
                                        <button onClick={() => submitTask(task._id)} disabled={submitting === task._id}
                                            className="text-xs bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-950/20 active:scale-95">
                                            {submitting === task._id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <Check size={12} />
                                            )}
                                            <span>Submit Answer</span>
                                        </button>
                                        <button
                                            onClick={() => navigate(`/future-education?askDoubt=${encodeURIComponent(`Mujhe is homework task mein doubt hai: '${task.prompt}'. Please is concept ko clarify karein.`)}`)}
                                            className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 px-4 py-2.5 rounded-xl transition-all font-semibold flex items-center gap-1.5 shadow-lg active:scale-95"
                                        >
                                            <MessageSquare size={12} />
                                            <span>Ask Doubt</span>
                                        </button>
                                    </div>

                                    {results[task._id] && (
                                        <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                                            <div className={`p-4 rounded-2xl border ${results[task._id].passed ? 'bg-emerald-950/10 border-emerald-500/20' : 'bg-red-950/10 border-red-500/20'}`}>
                                                <div className="font-bold text-xs mb-1">
                                                    {results[task._id].passed ? '✅ Passed!' : '❌ Incorrect'} • Score: {results[task._id].score}%
                                                </div>
                                                <div className="text-gray-300 text-xs leading-relaxed font-medium">{results[task._id].feedback}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Tasks */}
                {hw?.completed_tasks?.length > 0 && (
                    <div>
                        <h2 className="font-bold text-xs text-emerald-400 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                            <CheckSquare size={14} /> Completed Homework ({hw.completed_count})
                        </h2>
                        <div className="space-y-3">
                            {hw.completed_tasks.map((task: any) => (
                                <div key={task._id} className="bg-emerald-950/5 border border-emerald-500/10 rounded-2xl p-4 shadow-lg flex items-center justify-between">
                                    <div className="text-xs text-gray-300 truncate max-w-[85%] font-medium">{task.prompt}</div>
                                    <div className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full font-bold ml-3 flex-shrink-0">
                                        {task.ai_score}% Score
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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

export default MinervaHomeworkPage;
