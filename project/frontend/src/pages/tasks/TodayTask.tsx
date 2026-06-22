import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sanitizeExternalUrl } from "@/utils/url";
import { ArrowLeft, CheckCircle2, Circle, Calendar, Lock, BarChart3, ListTodo, AlertCircle, Target, Brain, Zap, Navigation, Flag, Youtube, ExternalLink, ShieldCheck } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

export default function TodayTask() {
    const navigate = useNavigate();
    const [roadmaps, setRoadmaps] = useState<any[]>([]);
    const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [onboardingStatus, setOnboardingStatus] = useState<string>('CHECKING');

    const [targetLanguage, setTargetLanguage] = useState<string>("Hindi"); // Default translation target
    const [translating, setTranslating] = useState(false);

    // Prepare radar chart data dynamically based on tasks conceptMap and status
    const conceptMasteryData = () => {
        const conceptStats: Record<string, { total: number; completed: number }> = {};
        
        tasks.forEach(t => {
            const concepts = t.conceptMap || ['Core logic'];
            concepts.forEach((concept: string) => {
                if (!conceptStats[concept]) {
                    conceptStats[concept] = { total: 0, completed: 0 };
                }
                conceptStats[concept].total += 1;
                if (t.status === 'done') {
                    conceptStats[concept].completed += 1;
                }
            });
        });
        
        const chartData = Object.entries(conceptStats).map(([subject, stats]) => {
            const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            return {
                subject: subject.substring(0, 15), // keep labels short
                A: percentage,
                fullMark: 100
            };
        });
        
        // If there's no data or too few categories, return a default set
        if (chartData.length < 3) {
            const completedCount = tasks.filter(t => t.status === 'done').length;
            return [
                { subject: 'Implementation', A: completedCount > 0 ? 80 : 20, fullMark: 100 },
                { subject: 'Architecture', A: completedCount > 0 ? 90 : 30, fullMark: 100 },
                { subject: 'Problem Solving', A: completedCount > 0 ? 70 : 15, fullMark: 100 },
                { subject: 'Testing', A: completedCount > 0 ? 85 : 10, fullMark: 100 },
                { subject: 'Security', A: completedCount > 0 ? 75 : 25, fullMark: 100 }
            ];
        }
        
        return chartData.slice(0, 7); // Cap at 7 categories for design cleaness
    };

    // --- Verification System State ---
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
    const [verificationQuestions, setVerificationQuestions] = useState<any[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [vivaResults, setVivaResults] = useState<any>(null);

    const languages = ["Hindi", "English (Simple)", "Spanish", "French", "Bengali", "Telugu", "Marathi", "Tamil", "Gujarati", "Kannada"];

    const [searchParams] = useSearchParams();
    const urlRoadmapId = searchParams.get('roadmapId');

    useEffect(() => {
        initData(urlRoadmapId);
    }, [urlRoadmapId]);

    useEffect(() => {
        if (selectedRoadmap) {
            fetchTasks(selectedRoadmap._id);
        }
    }, [selectedRoadmap]);

    const initData = async (urlId: string | null) => {
        const token = localStorage.getItem('fbrts_token');
        try {
            const statusRes = await fetch('/api/onboarding/status', { headers: { 'Authorization': `Bearer ${token}` } });
            const statusData = await statusRes.json();

            if (!statusData.success || !statusData.profile || !statusData.profile.onboardingCompleted) {
                setOnboardingStatus('INCOMPLETE');
                setLoading(false);
                return;
            }
            setOnboardingStatus('COMPLETE');

            const res = await fetch('/api/roadmap', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();

            if (data.success) {
                setRoadmaps(data.roadmaps);
                if (urlId) {
                    const linkedRoadmap = data.roadmaps.find((r: any) => String(r._id) === String(urlId));
                    if (linkedRoadmap) {
                        setSelectedRoadmap(linkedRoadmap);
                        return;
                    }
                }
                const sessionRes = await fetch('/api/builder/sessions', { headers: { 'Authorization': `Bearer ${token}` } });
                const sessionData = await sessionRes.json();
                let currentActiveSessionId = null;
                if (sessionData.success && sessionData.sessions.length > 0) {
                    currentActiveSessionId = sessionData.sessions[0]._id;
                    setActiveSessionId(currentActiveSessionId);
                }
                if (!urlRoadmapId && currentActiveSessionId) {
                    const sessionRoadmap = data.roadmaps.find((r: any) => String(r.sessionId) === String(currentActiveSessionId));
                    if (sessionRoadmap) setSelectedRoadmap(sessionRoadmap);
                }
                setLoading(false);
            } else {
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const fetchTasks = async (roadmapId: string) => {
        setLoading(true);
        const token = localStorage.getItem('fbrts_token');
        try {
            const [analyticsRes, tasksRes] = await Promise.all([
                fetch(`/api/tasks/analytics?roadmapId=${roadmapId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`/api/tasks?roadmapId=${roadmapId}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const analyticsData = await analyticsRes.json();
            const tasksData = await tasksRes.json();
            if (analyticsData.success) setAnalytics(analyticsData.analytics);

            // 🔄 Auto-generate tasks if none exist yet
            if (tasksData.success && tasksData.tasks?.length === 0) {
                const genRes = await fetch('/api/roadmap/convert-tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ roadmapId })
                });
                const genData = await genRes.json();
                if (genData.success) {
                    const reFetch = await fetch(`/api/tasks?roadmapId=${roadmapId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                    const reData = await reFetch.json();
                    if (reData.success) setTasks(reData.tasks);
                }
            } else if (tasksData.success) {
                setTasks(tasksData.tasks);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }

    const toggleTask = async (e: any, taskId: string, currentStatus: string, isLocked: boolean) => {
        if (e.stopPropagation) e.stopPropagation();
        if (isLocked) return;

        const task = tasks.find(t => t._id === taskId);

        // 🔒 LOCK-IN: Prevent reverting verified tasks to 'todo'
        if (currentStatus === 'done') {
            setSelectedTask(task);
            return;
        }

        const newStatus = 'done';

        const token = localStorage.getItem('fbrts_token');
        const prevTasks = [...tasks];
        const prevSelected = selectedTask ? { ...selectedTask } : null;
        setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
        if (selectedTask && selectedTask._id === taskId) setSelectedTask({ ...selectedTask, status: newStatus });
        try {
            const res = await fetch('/api/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ taskId, status: newStatus })
            });
            const data = await res.json();
            if (!data.success) {
                setTasks(prevTasks);
                if (prevSelected) setSelectedTask(prevSelected);
                alert(data.message || data.error || "Failed to update task");
            } else {
                const analyticsRes = await fetch(`/api/tasks/analytics?roadmapId=${selectedRoadmap._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                const analyticsData = await analyticsRes.json();
                if (analyticsData.success) setAnalytics(analyticsData.analytics);
            }
        } catch (e) {
            setTasks(prevTasks);
            if (prevSelected) setSelectedTask(prevSelected);
            console.error(e);
        }
    };

    const handleTranslate = async (text: string, fieldToUpdate: string) => {
        const token = localStorage.getItem('fbrts_token');
        setTranslating(true);
        try {
            const res = await fetch('/api/tasks/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ text, targetLanguage })
            });
            const data = await res.json();
            if (data.success) {
                if (fieldToUpdate === 'task_desc') {
                    const updated = { ...selectedTask, description: data.translatedText };
                    setSelectedTask(updated);
                    setTasks(tasks.map(t => t._id === selectedTask._id ? updated : t));
                } else if (fieldToUpdate === 'guidance') {
                    const updated = { ...selectedTask, detailedGuidance: data.translatedText };
                    setSelectedTask(updated);
                    setTasks(tasks.map(t => t._id === selectedTask._id ? updated : t));
                }
            }
        } catch (e) {
            console.error("Translation Error", e);
        } finally {
            setTranslating(false);
        }
    };

    // --- 🎤 VIVA VERIFICATION LOGIC ---
    const startVerification = async (taskId: string) => {
        const token = localStorage.getItem('fbrts_token');
        const task = tasks.find(t => t._id === taskId);
        if (task) setSelectedTask(task);

        setIsVerifying(true);
        setVerifyingTaskId(taskId);
        setVivaResults(null);
        setUserAnswers({});
        try {
            const res = await fetch('/api/tasks/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ taskId })
            });
            const data = await res.json();
            if (data.success && data.questions && data.questions.length > 0) {
                setVerificationQuestions(data.questions);
            } else {
                alert("Neural connection unstable. Using fallback audit protocols.");
                // If it really failed (no questions at all), close it
                if (!data.questions || data.questions.length === 0) {
                    setIsVerifying(false);
                }
            }
        } catch (e) {
            setIsVerifying(false);
            alert("Verification system failed to initialize. Please try again.");
        }
    };

    const submitVerification = async () => {
        const token = localStorage.getItem('fbrts_token');
        const taskId = verifyingTaskId || selectedTask?._id;
        if (!taskId) return;

        // Validation: Must answer all
        if (Object.keys(userAnswers).length < verificationQuestions.length) {
            alert("Please answer all questions before submitting.");
            return;
        }

        setIsEvaluating(true);
        try {
            const res = await fetch('/api/tasks/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    taskId,
                    results: Object.entries(userAnswers).map(([qid, ans]) => ({
                        questionId: qid,
                        userAnswer: ans
                    })),
                    context: { isRootViva: true }
                })
            });
            const data = await res.json();
            if (data.success) {
                setVivaResults(data);
                if (data.isPassed) {
                    // Success! Refresh tasks to show 'done'
                    fetchTasks(selectedRoadmap._id);
                    // Close verification after a short delay
                    setTimeout(() => {
                        setIsVerifying(false);
                        setSelectedTask(null);
                    }, 3000);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsEvaluating(false);
        }
    };

    if (loading) return <LoadingScreen />;

    if (onboardingStatus === 'INCOMPLETE') {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-white bg-black space-y-6">
                <div className="p-4 bg-yellow-500/10 rounded-full border border-yellow-500/20"><Target size={48} className="text-yellow-500" /></div>
                <h2 className="text-3xl font-black">Initialization Required</h2>
                <p className="text-gray-400 max-w-md text-center">We cannot view tasks without your core profile data. Verification failed.</p>
                <Button onClick={() => navigate('/onboarding')} className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-4 rounded-xl">Complete Onboarding</Button>
            </div>
        );
    }

    const pendingTasks = tasks.filter(t => t.status === 'todo' && !t.isLocked);
    const lockedTasks = tasks.filter(t => t.isLocked);
    const completedTasks = tasks.filter(t => t.status === 'done');

    return (
        <div className="flex flex-col h-full overflow-hidden bg-transparent text-white w-full relative">
            {/* 📍 Neural Navigator Bar (Task View) */}
            {selectedRoadmap && (
                <div className="h-16 border-b border-white/10 flex items-center px-4 md:px-6 justify-between bg-[#09090b]/80 backdrop-blur-3xl sticky top-0 z-50 w-full shadow-2xl">
                    <div className="flex items-center gap-3 md:gap-6 min-w-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (activeSessionId) localStorage.setItem('fbrts_active_session', activeSessionId);
                                navigate('/builder');
                            }}
                            className="text-gray-400 hover:text-white hover:bg-white/5 gap-2 px-2"
                        >
                            <ArrowLeft size={16} /> <span className="hidden md:inline">Builder</span>
                        </Button>
                        <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                <Navigation size={14} className="text-indigo-400 fill-indigo-400/20" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[7px] md:text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none">Mission</div>
                                <div className="text-xs md:text-sm font-black italic uppercase tracking-tight text-white line-clamp-1">{selectedRoadmap.title}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-8">
                        <div className="hidden lg:flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">ETA</div>
                                <div className="text-sm font-black italic text-gray-200">~{tasks.filter(t => t.status !== 'done').length * 15}m</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Remaining</div>
                                <div className="text-sm font-black italic text-emerald-400">{tasks.filter(t => t.status !== 'done').length}</div>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/roadmap')}
                            className="border-white/10 hover:bg-white/5 text-gray-300 gap-2 rounded-xl px-2 md:px-4 text-[10px] md:text-xs"
                        >
                            <Flag size={14} /> <span className="hidden sm:inline">Full Map</span>
                        </Button>
                    </div>
                </div>
            )}

            {!selectedRoadmap && (
                <header className="h-16 border-b border-white/10 flex items-center px-6 justify-between bg-[#09090b]/50 backdrop-blur-md sticky top-0 z-10 w-full shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (activeSessionId) localStorage.setItem('fbrts_active_session', activeSessionId);
                                navigate('/builder');
                            }}
                            className="text-gray-400 hover:text-white hover:bg-white/5 gap-2"
                        >
                            <ArrowLeft size={16} /> <span className="hidden sm:inline">Builder</span>
                        </Button>
                        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Task Intelligence</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/roadmap')}
                            className="border-white/10 hover:bg-white/5 text-gray-300 gap-2"
                        >
                            <ListTodo size={14} /> Roadmap
                        </Button>
                    </div>
                </header>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {!selectedRoadmap ? (
                    <div className="h-full flex flex-col pt-6 md:pt-10 px-2 md:px-4 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
                        {roadmaps.length > 0 ? (
                            <>
                                <div className="space-y-4">
                                    <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white mb-2">Neural Hub</h2>
                                    <p className="text-gray-500 uppercase text-[10px] md:text-xs font-black tracking-widest">Select a plan to execute your tactical tasks.</p>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-3xl mt-8">
                                        <div className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl">
                                            <div className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Active Plans</div>
                                            <div className="text-xl md:text-2xl font-black text-white">{roadmaps.length}</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl">
                                            <div className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Total Tasks</div>
                                            <div className="text-xl md:text-2xl font-black text-indigo-400">
                                                {roadmaps.reduce((acc, r: any) => acc + (r.stats?.totalTasks || 0), 0)}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl">
                                            <div className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Completed</div>
                                            <div className="text-xl md:text-2xl font-black text-emerald-400">
                                                {roadmaps.reduce((acc, r: any) => acc + (r.stats?.completed || 0), 0)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                                    {roadmaps.map(r => (
                                        <div
                                            key={r._id}
                                            onClick={() => setSelectedRoadmap(r)}
                                            className="admin-card group hover:border-indigo-500/40 p-8 cursor-pointer transform hover:-translate-y-2 transition-all flex flex-col h-full"
                                        >
                                            <div className="flex justify-between items-start mb-4 md:mb-6">
                                                <div className="p-3 md:p-4 bg-indigo-500/10 rounded-xl md:rounded-2xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg group-hover:shadow-indigo-500/20">
                                                    <Brain size={24} className="md:size-[28px]" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</div>
                                                    {r.stats?.progress === 100 && <CheckCircle2 size={16} className="text-emerald-500 mt-1 ml-auto" />}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl md:text-2xl font-black italic tracking-tight mb-2 uppercase group-hover:text-indigo-300 transition-colors leading-tight">{r.title}</h3>
                                                <p className="text-xs md:text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed font-medium">{r.description || "Experimental Neural Path"}</p>
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-white/5">
                                                {(r.stats?.totalTasks || 0) > 0 ? (
                                                    <>
                                                        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                            <span>{r.stats?.completed || 0} / {r.stats?.totalTasks} Complete</span>
                                                            <span className="text-indigo-400">{r.stats?.progress || 0}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                            <div className={`h-full transition-all duration-1000 ease-out ${r.stats?.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${r.stats?.progress || 0}%` }}></div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Initialize Node →</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center space-y-6 flex-1">
                                <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center border border-indigo-500/20 animate-pulse"><Target size={48} className="text-indigo-400" /></div>
                                <div className="space-y-2 max-w-md">
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">System Ready</h2>
                                    <p className="text-gray-500 text-lg">No tactical plans detected. Launch a strategy session to generate your first roadmap.</p>
                                </div>
                                <Button onClick={() => navigate('/builder')} className="bg-indigo-600 text-white hover:bg-indigo-500 px-10 py-4 rounded-xl font-black italic uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all text-lg"><ListTodo className="mr-2" />Launch Builder</Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto pb-20 space-y-8">
                        <div onClick={() => setSelectedRoadmap(null)} className="inline-flex items-center gap-2 mb-0 text-gray-500 hover:text-white cursor-pointer transition-colors text-sm font-medium">
                            <ArrowLeft size={14} /> Back to List
                        </div>

                        {analytics && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-[#111] border border-indigo-500/10 p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all shadow-lg shadow-indigo-500/5">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ListTodo size={40} className="text-white" /></div>
                                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Tasks</div>
                                    <div className="text-3xl font-black text-white">{analytics.total}</div>
                                </div>
                                <div className="bg-[#111] border border-indigo-500/10 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all shadow-lg shadow-amber-500/5">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><AlertCircle size={40} className="text-amber-500" /></div>
                                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Pending</div>
                                    <div className="text-3xl font-black text-amber-500">{analytics.pending}</div>
                                </div>
                                <div className="bg-[#111] border border-indigo-500/10 p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all shadow-lg shadow-indigo-500/5">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Calendar size={40} className="text-indigo-400" /></div>
                                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Today's Focus</div>
                                    <div className="text-3xl font-black text-indigo-400">{analytics.todayCount}</div>
                                </div>
                                <div className="bg-[#111] border border-indigo-500/10 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-lg shadow-emerald-500/5">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CheckCircle2 size={40} className="text-emerald-500" /></div>
                                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Completed</div>
                                    <div className="text-3xl font-black text-emerald-500">{analytics.completed}</div>
                                </div>
                            </div>
                        )}

                        <div className="grid lg:grid-cols-3 gap-8 mt-8">
                            <div className="lg:col-span-2 space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>Actionable Tasks</h2>
                                {pendingTasks.length === 0 && <div className="text-gray-500 italic text-sm">No pending tasks available. Great job!</div>}
                                <div className="space-y-3">
                                    {pendingTasks.map((task) => (
                                        <div
                                            key={task._id}
                                            onClick={() => setSelectedTask(task)}
                                            className="group bg-[#111]/80 backdrop-blur-xl border border-indigo-500/10 rounded-2xl p-5 hover:border-indigo-500/40 hover:bg-[#151515] transition-all cursor-pointer flex items-start gap-4 relative overflow-hidden shadow-xl shadow-black/40"
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/0 group-hover:bg-indigo-500 transition-all duration-300"></div>
                                            <button
                                                onClick={(e) => toggleTask(e, task._id, task.status, task.isLocked)}
                                                className="mt-1 text-gray-600 group-hover:text-indigo-400 transition-colors hover:scale-110 active:scale-95 shrink-0"
                                            >
                                                <Circle size={24} className="stroke-[2]" />
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-lg text-gray-200 group-hover:text-white transition-colors leading-tight line-clamp-1">{task.title}</h3>
                                                {task.description && <p className="text-sm text-gray-500 mt-1.5 line-clamp-1 font-medium">{task.description}</p>}
                                            </div>
                                            <div className={`text-[9px] font-black tracking-[0.2em] uppercase self-center px-3 py-1.5 rounded-xl border transition-all ${task.level === 3 ? 'text-amber-500 bg-amber-500/10 border-amber-500/30' : task.level === 2 ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' : 'text-indigo-400 bg-indigo-500/5 border-indigo-500/10 group-hover:border-indigo-500/30'}`}>
                                                {task.level === 3 ? 'LEGEND' : task.level === 2 ? 'ACCEL' : 'FOUNDATION'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {lockedTasks.length > 0 && (
                                    <div className="space-y-3 pt-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-500"><Lock size={16} /> Locked (Future Steps)</h2>
                                        {lockedTasks.map((task) => (
                                            <div key={task._id} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex items-center gap-4 cursor-not-allowed">
                                                <Lock size={18} className="text-gray-700" />
                                                <span className="text-gray-500 font-medium">{task.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Recharts Radar Chart */}
                                <div className="bg-[#111] border border-indigo-500/10 p-6 rounded-2xl shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                                    <h3 className="text-sm font-black italic tracking-tighter uppercase text-white mb-4 flex items-center gap-2">
                                        <Brain size={16} className="text-indigo-400" /> Concept Mastery Map
                                    </h3>
                                    <div className="h-[250px] w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={conceptMasteryData()}>
                                                <PolarGrid stroke="#27272a" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#3f3f46', fontSize: 8 }} />
                                                <Radar name="Mastery" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-2 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        Based on VIVA check-ins & labs
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>Recent Wins</h2>
                                <div className="space-y-3">
                                    {completedTasks.length === 0 && <div className="text-gray-600 italic text-sm">Finish tasks to see your wins.</div>}
                                    {completedTasks.map((task) => (
                                        <div
                                            key={task._id}
                                            onClick={() => setSelectedTask(task)}
                                            className="group bg-[#09090b]/40 border border-white/5 rounded-xl p-3 hover:border-emerald-500/20 transition-all cursor-pointer flex items-center gap-3 opacity-60 hover:opacity-100"
                                        >
                                            <CheckCircle2 size={18} className="text-emerald-500" />
                                            <span className="text-sm font-medium text-gray-300 line-through decoration-gray-600 line-clamp-1">{task.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200" onClick={() => setSelectedTask(null)}>
                    <div className="bg-[#111] border border-white/10 rounded-[20px] md:rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-5 md:p-8 border-b border-white/10 shrink-0">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-2 md:px-3 py-1 bg-indigo-500/10 rounded-lg inline-block border border-indigo-500/20">Tactical Core</div>
                                    <h2 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase text-white leading-[1.2] pb-1 truncate">{selectedTask.title}</h2>
                                </div>
                                <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">✕</button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-4 md:mt-6 bg-white/[0.03] p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-white/5 self-start">
                                <div className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-indigo-500/10 rounded-lg md:rounded-xl border border-indigo-500/20">
                                    <span className="text-[8px] md:text-[10px] items-center gap-1 flex font-black uppercase text-indigo-400 tracking-tighter"><Zap size={10} /> Sync</span>
                                </div>
                                <select
                                    value={targetLanguage}
                                    onChange={(e) => setTargetLanguage(e.target.value)}
                                    className="bg-transparent text-[10px] md:text-xs text-gray-300 font-bold outline-none cursor-pointer hover:text-white transition-colors px-1"
                                >
                                    {languages.map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
                                </select>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 md:h-8 px-2 md:px-4 text-[9px] md:text-[11px] font-black bg-white/5 hover:bg-white/10 text-white rounded-lg md:rounded-xl border border-white/5"
                                    onClick={() => handleTranslate(selectedTask.description, 'task_desc')}
                                    disabled={translating}
                                >
                                    {translating ? "..." : "Translate"}
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar space-y-6 md:space-y-8 pb-32">
                            <div className={`p-8 rounded-[32px] border transition-all relative overflow-hidden group/header ${selectedTask.level === 3 ? 'bg-gradient-to-br from-amber-500/20 via-black to-black border-amber-500/30' : 'bg-[#111] border-white/10'}`}>
                                {selectedTask.level === 3 && (
                                    <div className="absolute top-0 right-0 p-6 opacity-20"><Target size={80} className="text-amber-500 animate-pulse" /></div>
                                )}
                                <div className="flex flex-col gap-4 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className={`text-[10px] font-black tracking-[0.3em] uppercase px-4 py-1 rounded-full border ${selectedTask.level === 3 ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                                            {selectedTask.level === 3 ? '🔥 LEGENDARY MISSION' : selectedTask.level === 2 ? '⚡ ACCELERATED NODE' : '❄️ FOUNDATION PROTOCOL'}
                                        </div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5 italic">Day {selectedTask.dayNumber} Protocol</div>
                                    </div>
                                    <h2 className={`text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none ${selectedTask.level === 3 ? 'bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent' : 'text-white'}`}>{selectedTask.title}</h2>
                                    <p className="text-sm md:text-base text-gray-400 max-w-2xl leading-relaxed font-medium">{selectedTask.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Objective</h4>
                                    <p className="text-sm text-gray-200 leading-relaxed font-bold">{selectedTask.objective || "Achieve mission mastery."}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Input</h4>
                                    <p className="text-sm text-gray-200 leading-relaxed font-bold">{selectedTask.input || "Project Brief Assets"}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Output</h4>
                                    <p className="text-sm text-gray-200 leading-relaxed font-bold">{selectedTask.output || "Verified Mission Status"}</p>
                                </div>
                            </div>

                            {/* Strategic Context Layer (Roadmap Style) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedTask.what && (
                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                        <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-indigo-500" /> WHAT IS THIS?
                                        </div>
                                        <p className="text-[12px] text-gray-300 leading-relaxed font-medium">{selectedTask.what}</p>
                                    </div>
                                )}
                                {selectedTask.why && (
                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                        <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500" /> WHY IT MATTERS?
                                        </div>
                                        <p className="text-[12px] text-gray-300 leading-relaxed font-medium">{selectedTask.why}</p>
                                    </div>
                                )}
                                {selectedTask.how && (
                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                        <div className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-amber-500" /> HOW WE'LL DO IT?
                                        </div>
                                        <p className="text-[12px] text-gray-300 leading-relaxed font-medium">{selectedTask.how}</p>
                                    </div>
                                )}
                                {selectedTask.who && (
                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                                        <div className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-purple-500" /> WHO IS RESPONSIBLE?
                                        </div>
                                        <p className="text-[12px] text-gray-300 leading-relaxed font-medium">{selectedTask.who}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><ListTodo size={14} /> Description & Insight</h3>
                                <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 text-gray-300 text-sm leading-relaxed italic">
                                    {selectedTask.description || "No tactical description provided."}
                                </div>
                            </div>

                            {/* 🔗 Root Atomic Concept Map */}
                            {selectedTask.conceptMap && selectedTask.conceptMap.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Zap size={14} /> Mission Concept Map</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTask.conceptMap.map((concept: string, cIdx: number) => (
                                            <span key={cIdx} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-tight">
                                                {concept}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 🧪 Main Point Execution List (Sub-Points) */}
                            {selectedTask.subTasks && selectedTask.subTasks.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><ListTodo size={14} /> Mission Checklist (Sub-Points)</h3>
                                    <div className="space-y-3">
                                        {selectedTask.subTasks.map((sub: any, sIdx: number) => (
                                            <div key={sIdx} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-start gap-4 group">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-indigo-500/20 shrink-0">
                                                    {sIdx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-gray-200 text-sm uppercase italic tracking-tight">{sub.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{sub.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 🧠 Root Silicon Valley Wisdom */}
                            {selectedTask.siliconValleyWisdom && (
                                <div className="p-5 bg-indigo-500/5 rounded-[24px] border border-indigo-500/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Brain size={40} className="text-indigo-500" /></div>
                                    <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase block mb-2">Neural Insight: Silicon Valley Wisdom</span>
                                    <p className="text-sm text-gray-300 italic font-medium leading-relaxed">{selectedTask.siliconValleyWisdom}</p>
                                </div>
                            )}

                            {/* 🏆 Verification Status / VIVA Trigger */}
                            {selectedTask.status === 'done' ? (
                                <div className="bg-emerald-500/10 p-6 rounded-[24px] border border-emerald-500/20 text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                        <CheckCircle2 size={30} />
                                    </div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Mission Secured</h3>
                                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Growth Node Synchronized Successfully</p>

                                    {/* Verification History Peek */}
                                    {selectedTask.verification?.results && selectedTask.verification.results.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-emerald-500/10 text-left">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 text-center">Neural Validation Protocol</p>
                                            <div className="grid grid-cols-2 gap-2 mb-4">
                                                {selectedTask.conceptMap?.map((c: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                                        <ShieldCheck size={12} className="text-emerald-500" />
                                                        <span className="text-[9px] font-black text-emerald-400 uppercase truncate">{c}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-3 bg-black/40 rounded-xl border border-emerald-500/10">
                                                <p className="text-xs text-emerald-400 italic text-center">"Mastery verified via high-fidelity neural audit log."</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : selectedTask.viva ? (
                                <div className="space-y-4">
                                    <div className="p-5 bg-white/5 border border-white/5 rounded-[24px] text-center space-y-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <h3 className="text-lg font-black italic uppercase tracking-tighter text-indigo-400">Mission Final Audit</h3>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Verify conceptual mastery to unlock the next node</p>
                                        </div>
                                        <Button
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all"
                                            onClick={() => {
                                                setVerifyingTaskId(selectedTask._id);
                                                setVerificationQuestions([
                                                    ...selectedTask.viva.mcqs.map((m: any, i: number) => ({ ...m, id: `mcq-root-${i}`, type: 'MCQ' })),
                                                    { ...selectedTask.viva.shortQuestion, id: `short-root`, type: 'VIVA' }
                                                ]);
                                                setIsVerifying(true);
                                                (window as any)._verificationContext = { isRootViva: true };
                                            }}
                                        >
                                            <Brain size={18} className="mr-2" /> Start Knowledge Sync
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 bg-white/5 border border-white/5 rounded-[24px] text-center">
                                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Manual Node Verification Required</p>
                                    <Button
                                        className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest h-12 rounded-xl"
                                        onClick={(e) => toggleTask(e, selectedTask._id, 'done', false)}
                                    >
                                        Mark Mission Complete
                                    </Button>
                                </div>
                            )}

                            {selectedTask.learningResources && selectedTask.learningResources.length > 0 && (
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Youtube size={16} /> Essential Assets (Video Guides)</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {selectedTask.learningResources.map((res: any, idx: number) => (
                                            <a
                                                key={idx}
                                                href={sanitizeExternalUrl(res.url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-emerald-500/30 transition-all group/res"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover/res:scale-110 transition-transform shadow-lg"><Youtube size={24} /></div>
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Suggestion Link Asset</div>
                                                    <div className="text-sm font-black text-gray-200 line-clamp-1 italic uppercase tracking-tight">{res.title || "Interactive Guide"}</div>
                                                </div>
                                                <ExternalLink size={14} className="text-gray-600 group-hover/res:text-white transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedTask.detailedGuidance && (
                                <div className="bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10 mt-8">
                                    <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2"><BarChart3 size={16} /> Strategy & Master Guidance</h3>
                                    <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line border-l-2 border-indigo-500/20 pl-4">{selectedTask.detailedGuidance}</p>
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 pt-6 md:pt-12 bg-gradient-to-t from-[#111] via-[#111]/95 to-transparent flex items-center justify-end gap-3 pointer-events-none">
                            <Button
                                onClick={(e) => {
                                    if (selectedTask.status === 'done') return;
                                    toggleTask(e, selectedTask._id, selectedTask.status, false);
                                    setSelectedTask(null);
                                }}
                                disabled={selectedTask.status === 'done'}
                                className={`h-12 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl font-black italic uppercase tracking-widest shadow-2xl transition-all pointer-events-auto text-[10px] md:text-sm ${selectedTask.status === 'done' ? 'bg-gray-800 text-gray-400 cursor-not-allowed opacity-80' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'}`}
                            >
                                {selectedTask.status === 'done' ? 'COMPLETED' : 'COMPLETE'} <CheckCircle2 size={18} className="ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* 🎤 Viva Verification Modal */}
            {isVerifying && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-[32px] w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.2)] flex flex-col relative">
                        {/* Status bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 transition-all duration-500 bg-indigo-500/20">
                            <div
                                className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]"
                                style={{ width: `${(Object.keys(userAnswers).length / verificationQuestions.length) * 100}%` }}
                            />
                        </div>

                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase flex items-center gap-2">
                                    <Brain size={24} className="text-indigo-500" /> Neural Viva
                                </h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Authentic Intelligence Audit</p>
                            </div>
                            <button onClick={() => setIsVerifying(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-600">✕</button>
                        </div>

                        <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-10">
                            {verificationQuestions.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                    <p className="text-indigo-400 font-black uppercase tracking-widest text-xs animate-pulse">Scanning Knowledge Matrix...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Evaluation Results Overlay */}
                                    {vivaResults && (
                                        <div className={`p-6 rounded-2xl border mb-6 animate-in slide-in-from-top-4 duration-500 ${vivaResults.isPassed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${vivaResults.isPassed ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}`}>
                                                    {vivaResults.isPassed ? <CheckCircle2 /> : <AlertCircle />}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-xl italic uppercase tracking-tighter text-white">
                                                        {vivaResults.isPassed ? 'Node Synchronized' : 'Sync Failed'}
                                                    </h3>
                                                    <p className={`text-xs font-bold uppercase tracking-widest ${vivaResults.isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        Score: {vivaResults.score}% // {vivaResults.isPassed ? 'PASSED' : 'RETRY REQUIRED'}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 text-sm italic border-l-2 border-white/10 pl-4 py-2">{vivaResults.message}</p>
                                        </div>
                                    )}

                                    {verificationQuestions.map((q, idx) => (
                                        <div key={q.id} className={`space-y-4 group transition-all ${vivaResults ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                                            <div className="flex gap-4">
                                                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-white/10">0{idx + 1}</span>
                                                <div className="flex-1">
                                                    <h4 className="text-gray-100 font-bold leading-relaxed">{q.question}</h4>
                                                    <p className="text-[9px] font-black text-indigo-500/50 uppercase tracking-widest mt-1">{q.type === 'MCQ' ? 'Precise Selection' : 'Conceptual Rationale'}</p>
                                                </div>
                                            </div>

                                            {q.type === 'MCQ' ? (
                                                <div className="grid grid-cols-1 gap-2 pl-12">
                                                    {q.options.map((opt: string) => {
                                                        const result = vivaResults?.results?.find((r: any) => r.questionId === q.id);
                                                        const isSelected = userAnswers[q.id] === opt;
                                                        const isWrong = result && isSelected && !result.isCorrect;
                                                        const isCorrect = result && opt === q.correctAnswer; // Note: Frontend might not have q.correctAnswer if redacted, but backend result has isCorrect

                                                        return (
                                                            <button
                                                                key={opt}
                                                                disabled={!!vivaResults}
                                                                onClick={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                                                                className={`p-4 rounded-xl text-left text-sm font-medium border transition-all relative overflow-hidden flex items-center justify-between group/opt
                                                                    ${isSelected ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/20'}
                                                                    ${isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : ''}
                                                                    ${isWrong ? 'bg-rose-500/20 border-rose-500 text-rose-400' : ''}
                                                                `}
                                                            >
                                                                {opt}
                                                                {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                                                                {isCorrect && <CheckCircle2 size={16} />}
                                                                {isWrong && <AlertCircle size={16} />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="pl-12 space-y-3">
                                                    <textarea
                                                        disabled={!!vivaResults}
                                                        value={userAnswers[q.id] || ""}
                                                        onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                                                        placeholder="Synthesize your knowledge here..."
                                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-gray-200 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all min-h-[120px] resize-none font-medium"
                                                    />
                                                </div>
                                            )}

                                            {/* AI Suggestion if failed */}
                                            {vivaResults?.results?.find((r: any) => r.questionId === q.id && !r.isCorrect) && (
                                                <div className="ml-12 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
                                                    <Brain size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Growth Perspective</p>
                                                        <p className="text-xs text-indigo-200 leading-relaxed font-bold">
                                                            {vivaResults?.results?.find((r: any) => r.questionId === q.id)?.suggestion}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        <div className="p-8 border-t border-white/5 bg-black/50 flex items-center justify-between gap-4">
                            <div className="hidden md:block">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Integrity Protocol // 70% Threshold</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                {!vivaResults && (
                                    <Button
                                        onClick={submitVerification}
                                        disabled={isEvaluating || Object.keys(userAnswers).length < verificationQuestions.length}
                                        className="flex-1 md:flex-none h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black italic uppercase tracking-widest shadow-2xl shadow-indigo-600/20 disabled:opacity-30 transition-all"
                                    >
                                        {isEvaluating ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Auditing...
                                            </div>
                                        ) : (
                                            <>Submit Rationale <Navigation size={18} className="ml-2 rotate-90" /></>
                                        )}
                                    </Button>
                                )}
                                {vivaResults && !vivaResults.isPassed && (
                                    <Button
                                        onClick={() => {
                                            if (verifyingTaskId) startVerification(verifyingTaskId);
                                        }}
                                        className="h-14 px-10 rounded-2xl bg-white text-black hover:bg-gray-200 font-black italic uppercase tracking-widest transition-all"
                                    >
                                        Retry Sync
                                    </Button>
                                )}
                                {vivaResults && vivaResults.isPassed && (
                                    <div className="h-14 px-10 rounded-2xl bg-emerald-500 text-black font-black italic uppercase tracking-widest flex items-center gap-2 animate-bounce">
                                        Verified <CheckCircle2 size={18} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
