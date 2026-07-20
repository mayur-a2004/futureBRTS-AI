import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, CheckCircle2, Send, Sparkles, MessageSquare, FileText, Loader2, Plus, X, Trash2 } from 'lucide-react';
import { LevelUpModal } from '../../components/ui/LevelUpModal';

const MinervaTasksPage: React.FC = () => {
    const { user, token } = useAuth() as any;
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'topics' | 'pending' | 'completed'>('topics');
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    
    // Interactive solving state
    const [solvingTaskId, setSolvingTaskId] = useState<string | null>(null);
    const [answer, setAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
    const [newLevel, setNewLevel] = useState(1);
    const [xpGained, setXpGained] = useState(0);

    // Custom Homework Modal state
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [customSubject, setCustomSubject] = useState('');
    const [customMarks, setCustomMarks] = useState(5);
    const [customDifficulty, setCustomDifficulty] = useState('medium');
    const [customDueDate, setCustomDueDate] = useState('');
    const [customSubmitting, setCustomSubmitting] = useState(false);
    const [customFile, setCustomFile] = useState<File | null>(null);

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

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('Kya aap is task ko delete karna chahte hain?')) return;
        try {
            const res = await minervaApi.deleteTask(token, taskId);
            if (res.success) {
                setTasks(prev => prev.filter(t => t._id !== taskId));
            } else {
                alert(res.error || 'Failed to delete task.');
            }
        } catch (err) {
            console.error('Delete task error:', err);
            alert('Error deleting task.');
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

    const handleCreateCustomHomework = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customPrompt.trim() || !customTopic.trim() || !customSubject.trim() || customSubmitting) return;

        setCustomSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('prompt', customPrompt);
            formData.append('topic_title', customTopic);
            formData.append('subject', customSubject);
            formData.append('marks', String(customMarks));
            formData.append('difficulty', customDifficulty);
            if (customDueDate) {
                formData.append('due_date', customDueDate);
            }
            if (customFile) {
                formData.append('attachment', customFile);
            }

            const res = await fetch('/api/future-education/task/custom', {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setTasks(prev => [data.task, ...prev]);
                setCustomPrompt('');
                setCustomTopic('');
                setCustomSubject('');
                setCustomMarks(5);
                setCustomDifficulty('medium');
                setCustomDueDate('');
                setCustomFile(null);
                setIsCustomModalOpen(false);
            } else {
                alert(data.error || 'Failed to create custom task.');
            }
        } catch (err) {
            console.error('Create custom task error:', err);
            alert('Failed to create custom task.');
        } finally {
            setCustomSubmitting(false);
        }
    };

    const pendingTasks = tasks.filter(t => !t.submitted);
    const completedTasks = tasks.filter(t => t.submitted);

    if (loading) return (
        <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    const renderTaskCard = (task: any) => {
        return (
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
                    <div className="flex items-center gap-2">
                        <div className="text-[10px] text-indigo-300 font-bold">
                            Topic: {task.topic_title}
                        </div>
                        <button
                            onClick={() => handleDeleteTask(task._id)}
                            title="Delete Task"
                            className="p-1 bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 rounded-lg transition-all ml-1"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>

                <div className="text-xs text-gray-300 leading-relaxed font-semibold mb-4 bg-black/40 border border-white/[0.05] rounded-2xl p-4">
                    {task.prompt}
                </div>

                {task.attachmentPath && (
                    <div className="mb-4">
                        <div className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-wider flex items-center gap-1.5">
                            <span>📎</span> Reference Attachment
                        </div>
                        {task.attachmentType === 'image' ? (
                            <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/40 p-2 max-h-[300px] flex items-center justify-center">
                                <img 
                                    src={task.attachmentPath} 
                                    alt={task.attachmentName || "Reference Attachment"} 
                                    className="max-w-full max-h-[280px] object-contain rounded-xl cursor-pointer hover:scale-[1.02] transition-transform"
                                    onClick={() => window.open(task.attachmentPath, '_blank')}
                                />
                            </div>
                        ) : (
                            <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/40 p-3 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-550 font-black text-[10px]">PDF</div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-300">{task.attachmentName || 'Reference Document.pdf'}</div>
                                            <div className="text-[9px] text-gray-550">Click to open or view below</div>
                                        </div>
                                    </div>
                                    <a 
                                        href={task.attachmentPath} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-slate-900 border border-white/5 hover:border-red-500/20 hover:text-red-400 rounded-xl text-[10px] font-bold transition-all"
                                    >
                                        Open Full PDF
                                    </a>
                                </div>
                                <div className="w-full h-[350px] border border-white/5 rounded-xl overflow-hidden">
                                    <iframe 
                                        src={`${task.attachmentPath}#toolbar=0`} 
                                        className="w-full h-full" 
                                        title={task.attachmentName}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
                                    task.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-450 border border-red-500/20'
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
                                        className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-450 border border-emerald-500/20 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 active:scale-95 shadow-md shadow-emerald-500/5"
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
        );
    };

    const getHomeworkDashboard = (allTasks: any[]) => {
        const homeworkOnly = allTasks.filter(t => t.is_homework);
        const totalHw = homeworkOnly.length;
        const completedHw = homeworkOnly.filter(t => t.submitted).length;
        const pendingHw = homeworkOnly.filter(t => !t.submitted);
        
        const selfStudyOnly = allTasks.filter(t => !t.is_homework);
        const totalSelf = selfStudyOnly.length;
        const completedSelf = selfStudyOnly.filter(t => t.submitted).length;
        
        // Oldest pending homework is at the end of the pending array, or if array is sorted newest first, the earliest is index length - 1
        const priorityHw = pendingHw.length > 0 ? pendingHw[pendingHw.length - 1] : null;
        const latestHw = homeworkOnly.length > 0 ? homeworkOnly[0] : null;

        const totalCompletionRate = allTasks.length > 0 ? Math.round((allTasks.filter(t => t.submitted).length / allTasks.length) * 100) : 0;

        return {
            totalHw,
            completedHw,
            totalSelf,
            completedSelf,
            priorityHw,
            latestHw,
            totalCompletionRate
        };
    };

    const getTopicsWithHomework = (allTasks: any[]) => {
        const topicsMap: Record<string, {
            title: string;
            subject: string;
            total: number;
            completed: number;
            board: string;
            tasks: any[];
        }> = {};

        allTasks.forEach(task => {
            const key = task.topic_title || 'General';
            if (!topicsMap[key]) {
                topicsMap[key] = {
                    title: key,
                    subject: task.subject || 'General',
                    total: 0,
                    completed: 0,
                    board: task.board || 'STATE_BOARD',
                    tasks: []
                };
            }
            topicsMap[key].total++;
            if (task.submitted) {
                topicsMap[key].completed++;
            }
            topicsMap[key].tasks.push(task);
        });

        return Object.keys(topicsMap).map(key => {
            const item = topicsMap[key];
            return {
                ...item,
                progress: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0
            };
        });
    };

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-16">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            
            {/* Header */}
            <header className="sticky top-0 z-20 bg-[#030209]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 md:px-6 py-3 flex items-center justify-between shadow-xl w-full min-w-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button onClick={() => navigate('/future-education')} className="p-2 bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all text-gray-400 hover:text-white flex items-center justify-center active:scale-95 shrink-0">
                        <ChevronLeft size={14} />
                    </button>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] shrink-0">
                            <FileText size={13} className="animate-pulse" />
                        </div>
                        <span className="hidden sm:inline font-display font-black text-xs tracking-[0.15em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-indigo-200 select-none truncate">
                            Future Education OS
                        </span>
                        <span className="sm:hidden font-display font-black text-xs tracking-[0.1em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 select-none truncate">
                            Tasks
                        </span>
                    </div>
                    <div className="h-4 w-px bg-white/10 hidden sm:block" />
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02] border border-white/5 select-none text-[9px] font-black text-gray-400 tracking-wider uppercase">
                        <span>Tasks & Homework</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button 
                        onClick={() => setIsCustomModalOpen(true)}
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center gap-1 active:scale-95 shrink-0"
                    >
                        <Plus size={13} />
                        <span className="hidden sm:inline">Add Custom Homework</span>
                        <span className="sm:hidden">Custom</span>
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 relative z-10 w-full">
                {/* 📊 Tasks & Homework Dashboard */}
                {(() => {
                    const db = getHomeworkDashboard(tasks);
                    const circ = 2 * Math.PI * 26;
                    const strokeOffset = circ - (db.totalCompletionRate / 100) * circ;
                    return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 animate-in fade-in duration-300">
                            {/* Dial 1: Completion */}
                            <div className="bg-[#0B0915]/60 border border-white/[0.05] hover:border-indigo-500/20 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-3">Overall Progress</span>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                                            <svg className="absolute w-full h-full transform -rotate-90">
                                                <circle cx="32" cy="32" r="26" fill="transparent" stroke="#0f172a" strokeWidth="4" />
                                                <circle cx="32" cy="32" r="26" fill="transparent" stroke="#6366f1" strokeWidth="4"
                                                    strokeDasharray={circ} strokeDashoffset={strokeOffset} strokeLinecap="round" />
                                            </svg>
                                            <span className="text-xs font-black text-white">{db.totalCompletionRate}%</span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-white">{db.completedHw} / {db.totalHw} Homework</div>
                                            <div className="text-[10px] text-indigo-400 font-bold mt-0.5">{db.completedSelf} / {db.totalSelf} Study Tasks</div>
                                            <div className="text-[9px] text-slate-500 mt-1">Completion rate</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Priority/Earliest Homework */}
                            <div className="bg-[#0B0915]/60 border border-white/[0.05] hover:border-amber-500/20 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">⚠️ Priority Homework (Earliest)</span>
                                    </div>
                                    {db.priorityHw ? (
                                        <div>
                                            <h4 className="text-xs font-bold text-white line-clamp-1">{db.priorityHw.subject}</h4>
                                            <p className="text-[10px] text-indigo-300 font-semibold line-clamp-1 mt-0.5">{db.priorityHw.topic_title}</p>
                                            <p className="text-[9px] text-slate-450 mt-2 line-clamp-2 leading-relaxed italic">
                                                "{db.priorityHw.prompt}"
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-500 mt-2 font-medium">No pending homework assignments!</p>
                                    )}
                                </div>
                                {db.priorityHw && (
                                    <button
                                        onClick={() => {
                                            setActiveTab('pending');
                                            handleOpenSolve(db.priorityHw);
                                            // Smooth scroll down to tasks list
                                            window.scrollTo({ top: 380, behavior: 'smooth' });
                                        }}
                                        className="text-[9px] font-black uppercase text-amber-400 hover:text-white transition-colors bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl mt-3 text-center self-start active:scale-95"
                                    >
                                        ⚡ Solve First
                                    </button>
                                )}
                            </div>

                            {/* Card 3: Latest Homework Assigned */}
                            <div className="bg-[#0B0915]/60 border border-white/[0.05] hover:border-pink-500/20 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-pink-400">✨ Newest Assigned</span>
                                        {db.latestHw && (
                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${db.latestHw.submitted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                {db.latestHw.submitted ? 'Done' : 'Pending'}
                                            </span>
                                        )}
                                    </div>
                                    {db.latestHw ? (
                                        <div>
                                            <h4 className="text-xs font-bold text-white line-clamp-1">{db.latestHw.subject}</h4>
                                            <p className="text-[10px] text-indigo-300 font-semibold line-clamp-1 mt-0.5">{db.latestHw.topic_title}</p>
                                            <p className="text-[9px] text-slate-450 mt-2 line-clamp-2 leading-relaxed italic">
                                                "{db.latestHw.prompt}"
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-500 mt-2 font-medium">No homework assigned yet.</p>
                                    )}
                                </div>
                                {db.latestHw && !db.latestHw.submitted && (
                                    <button
                                        onClick={() => {
                                            setActiveTab('pending');
                                            handleOpenSolve(db.latestHw);
                                            window.scrollTo({ top: 380, behavior: 'smooth' });
                                        }}
                                        className="text-[9px] font-black uppercase text-pink-400 hover:text-white transition-colors bg-pink-500/10 border border-pink-500/20 px-3 py-1.5 rounded-xl mt-3 text-center self-start active:scale-95"
                                    >
                                        ⚡ Solve Latest
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })()}
                
                {/* Tabs */}
                <div className="flex border-b border-white/[0.06] mb-6 select-none">
                    <button
                        onClick={() => { setActiveTab('topics'); setSelectedTopic(null); }}
                        className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'topics' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-400'}`}
                    >
                        <span>Topic Dashboard</span>
                        {activeTab === 'topics' && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'pending' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-400'}`}
                    >
                        <span>All Pending ({pendingTasks.length})</span>
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

                {/* Topic Hub View */}
                {activeTab === 'topics' && (
                    <div className="animate-in fade-in duration-300">
                        {selectedTopic === null ? (
                            <div>
                                <div className="mb-4">
                                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                                        Select Topic to View Specific Homework
                                    </h2>
                                </div>
                                {(() => {
                                    const topics = getTopicsWithHomework(tasks);
                                    if (topics.length === 0) {
                                        return (
                                            <div className="text-center py-16 bg-[#0B0915]/30 border border-dashed border-white/5 rounded-3xl p-8 shadow-md">
                                                <CheckCircle2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                                <h3 className="text-gray-300 font-bold text-sm">No topics assigned yet</h3>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {topics.map((t, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedTopic(t.title)}
                                                    className="bg-[#0B0915]/60 border border-white/[0.05] hover:border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between transition-all cursor-pointer active:scale-[0.98] shadow-xl"
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[8px] font-black uppercase tracking-wider rounded-full">
                                                            {t.board}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="mb-6">
                                                        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{t.title}</h3>
                                                        <p className="text-[10px] text-gray-400 mt-1">Subject: {t.subject}</p>
                                                    </div>
                                                    
                                                    <div className="border-t border-white/[0.05] pt-4">
                                                        <div className="flex justify-between text-[10px] font-semibold mb-1.5">
                                                            <span className="text-gray-450">Course Progress</span>
                                                            <span className="text-indigo-400 font-mono">{t.progress}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${t.progress}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-[#0b081a]/40 border border-indigo-500/10 rounded-3xl p-5">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedTopic(null)}
                                            className="px-3.5 py-2 bg-white/[0.03] hover:bg-white/10 text-gray-300 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5"
                                        >
                                            ← Back to Topics
                                        </button>
                                        <div>
                                            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Topic</h3>
                                            <h2 className="text-xs font-black text-white mt-0.5">{selectedTopic}</h2>
                                        </div>
                                    </div>
                                    {(() => {
                                        const topicInfo = getTopicsWithHomework(tasks).find(t => t.title === selectedTopic);
                                        if (!topicInfo) return null;
                                        return (
                                            <div className="text-right">
                                                <div className="text-xs font-black text-indigo-400">{topicInfo.progress}% Completed</div>
                                                <div className="text-[9px] text-slate-550 mt-0.5">{topicInfo.completed} of {topicInfo.total} Done</div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="space-y-4">
                                    {tasks.filter(t => (t.topic_title || 'General') === selectedTopic).map(t => renderTaskCard(t))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Flat Pending List */}
                {activeTab === 'pending' && (
                    <div className="space-y-4">
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

                        <div className="space-y-4">
                            {pendingTasks.length === 0 ? (
                                <div className="text-center py-16 bg-[#0B0915]/30 border border-dashed border-white/5 rounded-3xl p-8 shadow-md">
                                    <CheckCircle2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                    <h3 className="text-gray-300 font-bold text-sm mb-1">All caught up!</h3>
                                    <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed">
                                        Awesome job! You have no pending study tasks or homework. Keep learning!
                                    </p>
                                </div>
                            ) : (
                                pendingTasks.map(t => renderTaskCard(t))
                            )}
                        </div>
                    </div>
                )}

                {/* Flat Completed List */}
                {activeTab === 'completed' && (
                    <div className="space-y-4">
                        {completedTasks.length === 0 ? (
                            <div className="text-center py-16 bg-[#0B0915]/30 border border-dashed border-white/5 rounded-3xl p-8 shadow-md">
                                <CheckCircle2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-gray-300 font-bold text-sm mb-1">No completed tasks</h3>
                                <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed">
                                    When you submit answers to homework or micro-tasks, they will show up here.
                                </p>
                            </div>
                        ) : (
                            completedTasks.map(t => renderTaskCard(t))
                        )}
                    </div>
                )}
            </div>

            {/* Custom Homework Modal */}
            {isCustomModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#0B0915] border border-white/[0.08] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setIsCustomModalOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-red-500/30 rounded-xl transition-all text-gray-400 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                                <Plus size={18} />
                            </div>
                            <div>
                                <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">Add Custom Homework</h3>
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Assign independent study task</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleCreateCustomHomework} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Subject</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Science, Mathematics, English"
                                    value={customSubject}
                                    onChange={(e) => setCustomSubject(e.target.value)}
                                    className="w-full bg-[#120F24]/80 border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Topic / Chapter Name</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Motion in One Dimension, Cell Theory"
                                    value={customTopic}
                                    onChange={(e) => setCustomTopic(e.target.value)}
                                    className="w-full bg-[#120F24]/80 border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Homework Prompt / Question</label>
                                <textarea 
                                    required
                                    rows={3}
                                    placeholder="Write details of the homework homework task here..."
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    className="w-full bg-[#120F24]/80 border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Marks Weightage</label>
                                    <select 
                                        value={customMarks}
                                        onChange={(e) => setCustomMarks(Number(e.target.value))}
                                        className="w-full bg-[#120F24]/80 border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    >
                                        <option value={2}>2 Marks</option>
                                        <option value={5}>5 Marks</option>
                                        <option value={10}>10 Marks</option>
                                        <option value={20}>20 Marks</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Difficulty</label>
                                    <select 
                                        value={customDifficulty}
                                        onChange={(e) => setCustomDifficulty(e.target.value)}
                                        className="w-full bg-[#120F24]/80 border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Due Date (Optional)</label>
                                <input 
                                    type="date" 
                                    value={customDueDate}
                                    onChange={(e) => setCustomDueDate(e.target.value)}
                                    className="w-full bg-[#120F24]/80 border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Reference File (Photo or PDF)</label>
                                <div className="relative flex items-center justify-center border border-dashed border-white/[0.08] hover:border-indigo-500/30 bg-[#120F24]/50 rounded-2xl p-4 transition-colors">
                                    <input 
                                        type="file" 
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setCustomFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="text-center">
                                        <div className="text-[10px] font-semibold text-indigo-400">
                                            {customFile ? `📎 ${customFile.name}` : 'Click or Drag photo/PDF here'}
                                        </div>
                                        <div className="text-[8px] text-slate-500 mt-1 uppercase tracking-wider">
                                            Supported: PNG, JPG, JPEG, PDF (Max 50MB)
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-2 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsCustomModalOpen(false)}
                                    className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold hover:bg-slate-850 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={customSubmitting}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center gap-1.5 active:scale-95"
                                >
                                    {customSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Add Homework</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <LevelUpModal
                isOpen={isLevelUpOpen}
                level={newLevel}
                xpGained={xpGained}
                onClose={() => setIsLevelUpOpen(false)}
            />
        </div>
    );
};

export default MinervaTasksPage;
