import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, CheckSquare, Award, Clock, ArrowRight, Lock, Youtube, MessageSquare, Zap } from 'lucide-react';

const MinervaSessionPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth() as any;
    const navigate = useNavigate();

    const [session, setSession] = useState<any>(null);
    const [nodes, setNodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [examLoading, setExamLoading] = useState(false);

    useEffect(() => {
        if (!token || !id) return;
        loadSession();
    }, [token, id]);

    const loadSession = async () => {
        setLoading(true);
        const res = await minervaApi.getSession(token, id!);
        if (res.success) {
            setSession(res.session);
            setNodes(res.nodes || []);
        }
        setLoading(false);
    };

    const handleLearnNode = async (node: any) => {
        if (node.status === 'LOCKED') return;
        navigate(`/future-education/learn/${node._id}`);
    };

    const handleTogglePriority = async (e: React.MouseEvent, nodeId: string, currentPriority: string) => {
        e.stopPropagation();
        const nextPriority = currentPriority === 'HIGH' ? 'MEDIUM' : currentPriority === 'MEDIUM' ? 'LOW' : 'HIGH';
        try {
            const res = await minervaApi.updateNodePriority(token, nodeId, nextPriority);
            if (res.success) {
                setNodes(prev => prev.map(n => n._id === nodeId ? { ...n, priority: nextPriority } : n));
            } else {
                alert(res.error || 'Failed to update priority');
            }
        } catch (err) {
            console.error('Error toggling priority:', err);
            alert('Failed to update priority');
        }
    };

    const handleGenerateExam = async () => {
        setExamLoading(true);
        const res = await minervaApi.generateExam(token, { session_id: id!, exam_type: 'chapter_test', total_marks: 50 });
        setExamLoading(false);
        if (res.success) {
            navigate(`/future-education/exam/${res.exam._id}`);
        } else {
            alert(res.error || 'Exam generate nahi hua');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-4" />
                    <div className="text-gray-400 text-sm font-semibold">Generating Curriculum Path...</div>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter text-gray-400">
                <div className="text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <div className="font-bold text-lg mb-2">Session Not Found</div>
                    <button onClick={() => navigate('/future-education')} className="text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all text-indigo-400">
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    const highNodes = nodes.filter(n => n.priority === 'HIGH');
    const medNodes = nodes.filter(n => n.priority === 'MEDIUM');
    const lowNodes = nodes.filter(n => n.priority === 'LOW');
    const doneCount = nodes.filter(n => n.status === 'DONE').length;
    const canExam = session.exam_ready || doneCount >= 2;

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-12">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
            
            {/* Sticky Header */}
            <header className="sticky top-14 md:top-0 z-20 bg-[#030209]/40 backdrop-blur-xl border-b border-white/[0.06] px-6 py-3.5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => navigate('/future-education/roadmaps')} className="p-2 bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all text-gray-400 hover:text-white flex items-center justify-center active:scale-95 shrink-0">
                        <ChevronLeft size={14} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-black text-xs sm:text-sm truncate bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-indigo-200 uppercase tracking-wider">{session.title}</h1>
                        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                            <span className="text-[8px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0">
                                {session.board?.replace('_', ' ').toUpperCase()} • {session.grade_level?.replace('_', ' ').toUpperCase()}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-full transition-all" style={{ width: `${session.progress_percent}%` }} />
                                </div>
                                <span className="text-[9px] text-indigo-400 font-bold">{session.progress_percent}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button onClick={() => navigate(`/future-education/builder?sessionId=${session._id}`)}
                        className="px-3 py-1.5 text-[10px] sm:text-xs bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 text-indigo-400 hover:text-indigo-300 rounded-xl transition-all font-bold flex items-center gap-1">
                        <Zap size={11} className="text-indigo-400" /> <span className="hidden sm:inline">E-Builder Notes</span><span className="inline sm:hidden">Notes</span>
                    </button>
                    <button onClick={() => navigate('/future-education/homework')}
                        className="px-3 py-1.5 text-[10px] sm:text-xs bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 text-gray-300 hover:text-white rounded-xl transition-all font-bold flex items-center gap-1">
                        <CheckSquare size={11} className="text-indigo-400" /> <span>Homework</span>
                    </button>
                    {canExam && (
                        <button onClick={handleGenerateExam} disabled={examLoading}
                            className="px-3 py-1.5 text-[10px] sm:text-xs bg-gradient-to-r from-amber-500 via-orange-600 to-pink-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl transition-all font-bold flex items-center gap-1 shadow-md shadow-orange-950/20 border border-orange-400/20">
                            {examLoading ? (
                                <Loader2 size={11} className="animate-spin" />
                            ) : (
                                <Award size={11} />
                            )}
                            <span>Generate Exam</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">
                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Topics', value: nodes.length, color: 'text-indigo-400', icon: '📚' },
                        { label: 'Completed', value: doneCount, color: 'text-emerald-400', icon: '✅' },
                        { label: 'In Progress', value: nodes.filter(n => n.status === 'IN_PROGRESS').length, color: 'text-amber-400', icon: '⚡' },
                        { label: 'Locked', value: nodes.filter(n => n.status === 'LOCKED').length, color: 'text-gray-500', icon: '🔒' },
                    ].map((s, i) => (
                        <div key={i} className="bg-[#0B0915]/50 border border-white/[0.05] rounded-3xl p-4 flex flex-col items-center shadow-xl backdrop-blur-2xl transition-all hover:border-white/10">
                            <span className="text-xl mb-1">{s.icon}</span>
                            <div className={`text-2xl font-black ${s.color} font-display`}>{s.value}</div>
                            <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Nodes List */}
                {[
                    { label: '🔴 High Importance', nodes: highNodes, desc: 'Highest probability of appearing in exams', border: 'border-red-500/20 bg-red-950/5' },
                    { label: '🟡 Medium Importance', nodes: medNodes, desc: 'Frequently tested subject matter', border: 'border-amber-500/10 bg-amber-950/5' },
                    { label: '🟢 General Knowledge', nodes: lowNodes, desc: 'Optional or supportive learning topics', border: 'border-emerald-500/10 bg-emerald-950/5' },
                ].map((group, gi) => group.nodes.length > 0 && (
                    <div key={gi} className="mb-8 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 mb-3">
                            <h2 className="font-bold text-xs sm:text-sm text-gray-200">{group.label}</h2>
                            <span className="text-[10px] text-gray-500 font-semibold hidden sm:inline">• {group.desc}</span>
                            <span className="ml-auto text-[10px] bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full text-indigo-300 font-bold">{group.nodes.length} Topics</span>
                        </div>

                        <div className="space-y-3">
                            {group.nodes.map((node, ni) => {
                                const isLocked = node.status === 'LOCKED';
                                const isDone = node.status === 'DONE';

                                return (
                                    <div key={ni}
                                        onClick={() => handleLearnNode(node)}
                                        className={`flex items-center gap-4 p-4 rounded-3xl border transition-all relative overflow-hidden group
                                            ${isLocked
                                                ? 'bg-white/[0.01] border-white/5 cursor-not-allowed opacity-40'
                                                : 'bg-[#0B0915]/60 border-white/[0.05] hover:bg-[#120e2a]/40 hover:border-indigo-500/35 cursor-pointer shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 duration-300'
                                            }`}>

                                        {!isLocked && (
                                            <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-indigo-500 via-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        )}

                                        {/* Status Icon Indicator Left */}
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold flex-shrink-0 border transition-all
                                            ${isDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5'
                                                : isLocked ? 'bg-white/5 text-gray-600 border-white/5'
                                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/5'}`}>
                                            {isDone ? '✓' : isLocked ? <Lock size={14} /> : node.order_index}
                                        </div>

                                        {/* Content info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-xs sm:text-sm font-semibold truncate ${isLocked ? 'text-gray-500' : 'text-gray-200 group-hover:text-white'}`}>
                                                    {node.title}
                                                </span>
                                                {node.exam_weightage_percent > 0 && (
                                                    <span className="text-[8px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-wider shrink-0">
                                                        {node.exam_weightage_percent}% weightage
                                                    </span>
                                                )}
                                            </div>
                                            {node.chapter && (
                                                <div className="text-xs text-gray-500 mt-1 truncate">{node.chapter}</div>
                                            )}
                                            {node.board_relevance && (
                                                <div className="text-[10px] text-indigo-400/70 mt-0.5 truncate">{node.board_relevance}</div>
                                            )}
                                        </div>

                                        {/* Right side items */}
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {node.last_score > 0 && (
                                                <div className={`text-xs font-black px-2.5 py-1 rounded-lg border
                                                    ${node.last_score >= 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                    {node.last_score}% Score
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => handleTogglePriority(e, node._id, node.priority)}
                                                title="Click to cycle priority (High -> Medium -> Low)"
                                                className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-xl transition-all shrink-0 active:scale-95 hover:brightness-125 border
                                                    ${node.priority === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        : node.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                                            >
                                                {node.priority}
                                            </button>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                                                <Clock size={12} className="text-gray-400" /> {node.estimated_time_minutes}m
                                            </div>
                                            {!isLocked && (
                                                <a 
                                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(node.title + ' ' + (session.subject || ''))}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Watch YouTube lessons for this topic"
                                                    className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 hover:bg-red-500/25 hover:text-red-300 transition-all shrink-0"
                                                >
                                                    <Youtube size={12} />
                                                </a>
                                            )}
                                            {!isLocked && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/future-education?askDoubt=${encodeURIComponent(`Mujhe topic '${node.title}' mein doubt hai, please help me understand this concept!`)}`);
                                                    }}
                                                    title="Ask doubt in Chat"
                                                    className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/25 hover:text-indigo-300 transition-all shrink-0"
                                                >
                                                    <MessageSquare size={12} />
                                                </button>
                                            )}
                                            {!isLocked && (
                                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all shrink-0">
                                                    <ArrowRight size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Exam Call To Action Card */}
                {canExam && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-[#1b143a]/75 via-[#0b0818]/65 to-transparent border border-amber-500/20 rounded-3xl text-center shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                        <div className="text-3xl mb-2">🎯</div>
                        <h3 className="font-black text-sm sm:text-base text-amber-300 uppercase tracking-wider font-display">Exam Ke Liye Taiyaar Ho!</h3>
                        <p className="text-xs text-gray-400 mt-1.5 max-w-md mx-auto mb-5 leading-relaxed font-normal">
                            Aapne minimum curriculum standards ({doneCount} topics) achieve kar liye hain. AI teacher se test paper generate karwa ke performance verify karein.
                        </p>
                        <button onClick={handleGenerateExam} disabled={examLoading}
                            className="bg-gradient-to-r from-amber-500 via-orange-600 to-pink-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95 flex items-center gap-2 mx-auto border border-orange-400/20">
                            {examLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Award size={14} />
                            )}
                            <span>Generate Exam Paper</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Loader Fallback Helper Import (Expressive)
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default MinervaSessionPage;
