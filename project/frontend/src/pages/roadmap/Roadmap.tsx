import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Activity, Navigation, Target, Youtube, Circle, Lock, ListTodo, Plus, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { sanitizeExternalUrl } from "@/utils/url";

export default function Roadmap() {
    const navigate = useNavigate();
    const [roadmaps, setRoadmaps] = useState<any[]>([]);
    const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expandedStep, setExpandedStep] = useState<number | null>(null);
    const [expandedSmallTopic, setExpandedSmallTopic] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false); // ?? Task sync state
    const containerRef = useRef<HTMLDivElement>(null);

    // Modal & generation state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [topic, setTopic] = useState('');
    const [board, setBoard] = useState('cbse');
    const [language, setLanguage] = useState('hinglish');
    const [genLoading, setGenLoading] = useState(false);

    const handleCreateRoadmap = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setGenLoading(true);
        const token = localStorage.getItem('fbrts_token');
        try {
            const res = await fetch('/api/roadmap/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: topic,
                    board,
                    language
                })
            });
            const data = await res.json();
            if (data.success && data.roadmap) {
                setRoadmaps(prev => [data.roadmap, ...prev]);
                setSelectedRoadmap(data.roadmap);
                setShowCreateModal(false);
                setTopic('');
            } else {
                alert(data.error || data.message || 'Failed to assemble roadmap.');
            }
        } catch (err) {
            console.error('Roadmap generation error:', err);
            alert('Failed to generate roadmap.');
        } finally {
            setGenLoading(false);
        }
    };

    const [searchParams] = useSearchParams();
    const urlSessionId = searchParams.get('sessionId');

    useEffect(() => {
        initData();
    }, [urlSessionId]);

    useEffect(() => {
        if (selectedRoadmap && expandedStep === null) {
            const currentIdx = selectedRoadmap.steps?.findIndex((s: any) => s.state === 'IN_PROGRESS' || s.state === 'UNLOCKED');
            setExpandedStep(currentIdx >= 0 ? currentIdx : 0);
        }
    }, [selectedRoadmap, expandedStep]);

    const initData = async () => {
        const token = localStorage.getItem('fbrts_token');
        try {
            const res = await fetch('/api/roadmap', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setRoadmaps(data.roadmaps || []);
                if (urlSessionId) {
                    const roadmap = data.roadmaps.find((r: any) => String(r.sessionId) === String(urlSessionId));
                    if (roadmap) setSelectedRoadmap(roadmap);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ?? GO BUTTON — Generate tasks then navigate
    const goToTasks = async () => {
        if (!selectedRoadmap) return;
        const token = localStorage.getItem('fbrts_token');
        setSyncing(true);
        try {
            // Check if tasks already exist for this roadmap
            const checkRes = await fetch(`/api/tasks?roadmapId=${selectedRoadmap._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const checkData = await checkRes.json();

            if (!checkData.success || checkData.tasks?.length === 0) {
                // No tasks yet — trigger generation
                const genRes = await fetch('/api/roadmap/convert-tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ roadmapId: selectedRoadmap._id })
                });
                const genData = await genRes.json();
                if (!genData.success) {
                    alert(genData.error || 'Task generation failed. Try again.');
                    setSyncing(false);
                    return;
                }
            }
            // Navigate to tasks page
            navigate(`/today-task?roadmapId=${selectedRoadmap._id}`);
        } catch (e) {
            console.error('GO Error:', e);
            // Navigate anyway — tasks page will handle empty state
            navigate(`/today-task?roadmapId=${selectedRoadmap._id}`);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) return <LoadingScreen />;

    const totalSteps = selectedRoadmap?.steps?.length || 0;
    const completedStepsCount = selectedRoadmap?.steps?.filter((s: any) => s.state === 'COMPLETED' || s.state === 'MASTERED').length || 0;
    const currentStepIdx = selectedRoadmap?.steps?.findIndex((s: any) => s.state === 'IN_PROGRESS' || s.state === 'UNLOCKED') ?? 0;
    const currentStep = selectedRoadmap?.steps?.[currentStepIdx >= 0 ? currentStepIdx : 0];

    const getNodeCoords = (idx: number) => {
        let x = 250;
        let y = 80 + idx * 160;
        if (idx === 0) {
            x = 250;
        } else if (idx % 3 === 1) {
            x = 120;
        } else if (idx % 3 === 2) {
            x = 380;
        } else {
            x = 250;
        }
        return { x, y };
    };

    return (
        <div className="h-full bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-24 overflow-y-auto overflow-x-hidden custom-scrollbar" ref={containerRef}>
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Dots Grid background pattern */}
            <div className="absolute inset-0 bg-cyber-dots opacity-20 pointer-events-none" />

            {/* Neural Navigator Overlay (Google Maps Style) */}
            {selectedRoadmap && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[calc(100%-2rem)] md:max-w-xl px-0 pointer-events-none">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-[#0B0915]/95 backdrop-blur-3xl border border-white/[0.06] p-3 md:p-5 rounded-[24px] md:rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] flex items-center justify-between pointer-events-auto"
                    >
                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative shrink-0">
                                <Navigation size={20} className="text-indigo-400 md:size-[28px] fill-indigo-400/20 animate-pulse" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                    <Target size={8} className="text-white md:size-[10px]" />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <div className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1 md:mb-1.5 flex items-center gap-1 md:gap-2">
                                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-indigo-500"></div>
                                    Tracking
                                </div>
                                <div className="text-sm md:text-lg font-black font-display tracking-tight truncate max-w-[120px] md:max-w-[200px] text-gray-200">
                                    {currentStep?.title || "Goal Reached"}
                                </div>
                            </div>
                        </div>

                        <div className="h-8 md:h-10 w-[1px] bg-white/10 mx-2 md:mx-0"></div>

                        <div className="flex items-center gap-3 md:gap-6 pr-2">
                            <div className="text-right hidden sm:block">
                                <div className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Exit Strategy</div>
                                <div className="text-sm md:text-base font-black font-display tracking-tight text-gray-300">
                                    {(totalSteps - completedStepsCount)} Steps Left
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={goToTasks}
                                disabled={syncing}
                                className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 active:scale-95 disabled:opacity-60 text-white font-bold px-4 md:px-6 rounded-xl md:rounded-2xl h-10 md:h-12 shadow-lg shadow-indigo-950/20 text-[10px] md:text-xs transition-all flex items-center justify-center gap-1.5 border border-indigo-400/20"
                            >
                                {syncing ? <span className="animate-pulse">Syncing...</span> : <><span>GO</span> <Target size={14} className="ml-1 md:ml-2" /></>}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {!selectedRoadmap ? (
                <div className="max-w-6xl mx-auto space-y-12 pt-4 md:pt-0 relative z-10">
                    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-indigo-200 mb-2">Neural Hub</h1>
                            <p className="text-gray-500 uppercase text-[10px] md:text-xs font-black tracking-widest leading-loose">Architect your destiny. Launch a strategic path.</p>
                        </div>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 active:scale-95 text-white font-bold rounded-xl text-xs px-5 py-2.5 transition-all shadow-md shadow-indigo-950/20 border border-indigo-400/20 flex items-center justify-center gap-1.5"
                        >
                            <Plus size={16} />
                            <span>Start New Goal</span>
                        </Button>
                    </header>
                    {roadmaps.length === 0 ? (
                        <div className="text-center py-24 bg-[#0B0915]/30 border border-dashed border-white/5 rounded-3xl p-8 shadow-md">
                            <h2 className="text-2xl font-black font-display tracking-tight text-white mb-4">No Active Directives</h2>
                            <p className="text-gray-400 font-medium mb-8">You haven't initiated any roadmaps. Begin your journey.</p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button 
                                    onClick={() => setShowCreateModal(true)} 
                                    className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 active:scale-95 text-white font-bold rounded-xl text-xs px-6 py-3 transition-all shadow-md shadow-indigo-950/20 border border-indigo-400/20 flex items-center justify-center gap-1.5"
                                >
                                    <Plus size={16} className="mr-2" /> Start Custom Roadmap
                                </Button>
                                <Button 
                                    onClick={() => navigate('/builder')} 
                                    className="bg-[#0B0915]/40 hover:bg-[#120e2a]/40 border border-white/10 hover:border-indigo-500/30 rounded-xl px-8 h-12 text-white font-bold text-xs transition-all"
                                >
                                    Enter the Builder
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                            {roadmaps.map((r: any) => (
                                <div
                                    key={r._id}
                                    onClick={() => setSelectedRoadmap(r)}
                                    className="bg-[#0B0915]/60 border border-white/[0.05] hover:border-indigo-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-indigo-500/5 duration-300 group flex flex-col justify-between min-h-60 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div>
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-500/25 transition-all">
                                                <Activity size={20} />
                                            </div>
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-black font-display text-base text-gray-200 mt-4 group-hover:text-white transition-colors line-clamp-2 leading-snug">{r.title}</h3>
                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 font-medium leading-relaxed">{r.description}</p>
                                    </div>
                                    
                                    <div>
                                        {r.progress !== undefined && r.progress > 0 && (
                                            <div className="mt-4 pt-3 border-t border-white/5">
                                                <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1.5">
                                                    <span className="font-medium">Progress</span>
                                                    <span className="font-bold text-indigo-400">{r.progress}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-full transition-all duration-500" 
                                                        style={{ width: `${r.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => <div key={i} className="w-5.5 h-5.5 rounded-full bg-[#18181b] border border-white/5" />)}
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-400 group-hover:text-white transition-colors uppercase tracking-wider">
                                                Initialize →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-5xl mx-auto space-y-12 md:space-y-20 pb-64 pt-8 md:pt-12 relative z-10">
                    <header className="relative z-10 overflow-visible px-2">
                        <button 
                            onClick={() => setSelectedRoadmap(null)} 
                            className="p-2 bg-[#0B0915]/60 hover:bg-[#120e2a]/60 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all text-gray-400 hover:text-white flex items-center justify-center active:scale-95 shrink-0 w-max gap-2 text-[10px] font-bold uppercase tracking-wider mb-8 md:mb-12"
                        >
                            <ArrowLeft size={14} /> Return to Hub
                        </button>
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight leading-[1.1] pb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-indigo-200 max-w-4xl">
                                {selectedRoadmap.title}
                            </h1>
                            <p className="text-base md:text-xl text-gray-400 font-medium leading-relaxed max-w-2xl">{selectedRoadmap.description}</p>
                        </div>
                    </header>

                    {/* Meta Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 px-2">
                        <div className="bg-[#0B0915]/50 border border-white/[0.05] rounded-3xl p-5 flex flex-col items-center shadow-xl backdrop-blur-2xl transition-all hover:border-white/10">
                            <span className="text-xl mb-1">⚡</span>
                            <div className="text-2xl font-black text-indigo-400 font-display">{selectedRoadmap.status || 'Active'}</div>
                            <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Status</div>
                        </div>
                        <div className="bg-[#0B0915]/50 border border-white/[0.05] rounded-3xl p-5 flex flex-col items-center shadow-xl backdrop-blur-2xl transition-all hover:border-white/10">
                            <span className="text-xl mb-1">📈</span>
                            <div className="text-2xl font-black text-emerald-400 font-display">{selectedRoadmap.progress || 0}%</div>
                            <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Progress</div>
                        </div>
                        <div className="bg-[#0B0915]/50 border border-white/[0.05] rounded-3xl p-5 flex flex-col items-center shadow-xl backdrop-blur-2xl transition-all hover:border-white/10">
                            <span className="text-xl mb-1">🎯</span>
                            <div className="text-2xl font-black text-amber-400 font-display">{selectedRoadmap.type?.toUpperCase() || 'MAIN'}</div>
                            <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Type</div>
                        </div>
                        <div className="bg-[#0B0915]/50 border border-white/[0.05] rounded-3xl p-5 flex flex-col items-center shadow-xl backdrop-blur-2xl transition-all hover:border-white/10">
                            <span className="text-xl mb-1">📚</span>
                            <div className="text-2xl font-black text-indigo-400 font-display">{totalSteps}</div>
                            <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Nodes</div>
                        </div>
                    </div>

                    {/* Interactive Winding Highway Roadmap Flow */}
                    <div className="grid lg:grid-cols-12 gap-8 items-start relative z-10 px-2">
                        {/* Winding Branches Canvas */}
                        <div className="lg:col-span-5 bg-[#0B0915]/60 border border-white/[0.05] rounded-3xl p-6 flex flex-col items-center overflow-auto shadow-2xl min-h-[500px] max-h-[80vh] custom-scrollbar scrollbar-hide backdrop-blur-2xl hover:border-indigo-500/10 transition-all duration-300">
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6 self-start flex items-center gap-2">
                                <Activity size={16} className="animate-pulse" /> Interactive Highway Map
                            </h3>
                            
                            <div className="relative" style={{ width: '500px', height: `${Math.max(500, totalSteps * 160 + 100)}px` }}>
                                {/* SVG Connections Layer */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                                    <defs>
                                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="6" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>
                                    
                                    {/* Draw Winding Paths */}
                                    {selectedRoadmap.steps?.map((_: any, i: number) => {
                                        const fromCoords = getNodeCoords(i);
                                        const targets: number[] = [];
                                        
                                        if (i % 3 === 0) {
                                            if (i + 1 < totalSteps) targets.push(i + 1);
                                            if (i + 2 < totalSteps) targets.push(i + 2);
                                        } else if (i % 3 === 1) {
                                            if (i + 2 < totalSteps) targets.push(i + 2);
                                        } else if (i % 3 === 2) {
                                            if (i + 1 < totalSteps) targets.push(i + 1);
                                        }
                                        
                                        return targets.map(targetIdx => {
                                            const toCoords = getNodeCoords(targetIdx);
                                            const toStep = selectedRoadmap.steps[targetIdx];
                                            const isUnlocked = toStep.state !== 'LOCKED';
                                            
                                            // Bezier curve points
                                            const x1 = fromCoords.x;
                                            const y1 = fromCoords.y;
                                            const x2 = toCoords.x;
                                            const y2 = toCoords.y;
                                            const pathData = `M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`;
                                            
                                            return (
                                                <g key={`${i}-${targetIdx}`}>
                                                    {/* Background path line */}
                                                    <path
                                                        d={pathData}
                                                        fill="none"
                                                        stroke={isUnlocked ? '#6366f1' : '#18181b'}
                                                        strokeWidth={8}
                                                        strokeOpacity={isUnlocked ? 0.15 : 0.4}
                                                    />
                                                    {/* Foreground path line */}
                                                    <path
                                                        d={pathData}
                                                        fill="none"
                                                        stroke={isUnlocked ? '#6366f1' : '#27272a'}
                                                        strokeWidth={3}
                                                        strokeDasharray={isUnlocked ? undefined : '6, 6'}
                                                        filter={isUnlocked ? 'url(#glow)' : undefined}
                                                        className="transition-all duration-500"
                                                    />
                                                </g>
                                            );
                                        });
                                    })}
                                </svg>
                                
                                {/* SVG Interactive Nodes Layer */}
                                {selectedRoadmap.steps?.map((step: any, idx: number) => {
                                    const coords = getNodeCoords(idx);
                                    const isPast = idx < currentStepIdx;
                                    const isCurrent = idx === currentStepIdx;
                                    const isSelected = expandedStep === idx;
                                    const isLocked = step.state === 'LOCKED';
                                    
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setExpandedStep(idx)}
                                            style={{
                                                position: 'absolute',
                                                left: `${coords.x - 24}px`, // center of 48px circle
                                                top: `${coords.y - 24}px`,
                                                zIndex: 10
                                            }}
                                            className="group cursor-pointer select-none"
                                        >
                                            {/* Glowing Pulse Ring for current active step */}
                                            {isCurrent && (
                                                <div className="absolute -inset-2 rounded-full bg-indigo-500/30 animate-ping pointer-events-none" />
                                            )}
                                            
                                            {/* Node Circle */}
                                            <div
                                                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all duration-300 relative
                                                    ${isPast ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' :
                                                      isCurrent ? 'bg-indigo-900 border-indigo-500 text-white ring-4 ring-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.6)]' :
                                                      isLocked ? 'bg-[#0f0f11] border-white/5 text-gray-700' :
                                                      'bg-[#18181b] border-white/10 text-gray-300 hover:border-indigo-500/50'
                                                    }
                                                    ${isSelected ? 'scale-110 ring-4 ring-white/15' : 'hover:scale-105'}
                                                `}
                                            >
                                                {isPast ? <CheckCircle2 size={18} /> : idx + 1}
                                                
                                                {/* Mini Locked Key badge */}
                                                {isLocked && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-500">
                                                        <Lock size={8} />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Node Label Tooltip on hover */}
                                            <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-black/90 border border-zinc-800 px-2 py-1 rounded text-[10px] text-center text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                                                {step.title}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Details Panel for Selected Step */}
                        <div className="lg:col-span-7 space-y-6">
                            {expandedStep !== null && selectedRoadmap.steps[expandedStep] ? (() => {
                                const step = selectedRoadmap.steps[expandedStep];
                                const isCurrent = expandedStep === currentStepIdx;
                                const isLocked = step.state === 'LOCKED';
                                
                                return (
                                    <div className={`p-6 md:p-8 bg-[#0B0915]/60 border border-white/[0.05] rounded-3xl shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-indigo-500/10 ${isCurrent ? 'border-indigo-500/30 bg-indigo-500/10' : ''}`}>
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                                    STEP {expandedStep + 1}
                                                    {isCurrent && <span className="ml-2 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md">LIVE PHASE</span>}

                                                    {/* 3-Stage Phase Badge */}
                                                    {step.phase && (
                                                        <span className={`ml-auto px-2.5 py-1 rounded-lg border font-bold tracking-widest text-[8px] md:text-[9px] ${step.phase === 'Legend' ? 'text-amber-500 bg-amber-500/10 border-amber-500/30' :
                                                            step.phase === 'High' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                                                                'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                                                            }`}>
                                                            {step.phase === 'Legend' ? 'LEGEND' : step.phase === 'High' ? 'ACCEL' : 'FOUNDATION'}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white leading-tight">
                                                    {step.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {!isLocked ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            navigate(`/today-task?roadmapId=${selectedRoadmap._id}&step=${expandedStep + 1}`);
                                                        }}
                                                        className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 active:scale-95 text-white text-[11px] font-bold px-6 h-10 rounded-[12px] shadow-[0_10px_20px_-5px_rgba(79,70,229,0.5)] transition-all hover:scale-105 border border-indigo-400/20"
                                                    >
                                                        GO
                                                    </Button>
                                                ) : (
                                                    <div className="h-10 px-5 rounded-[12px] border border-white/5 bg-white/5 flex items-center justify-center">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">LOCKED</span>
                                                    </div>
                                                )}

                                                {step.state === 'COMPLETED' && (
                                                    <div className="h-10 px-5 rounded-[12px] border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">MASTERED</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Strategic Context Layer */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            {step.what && (
                                                <div className="p-4 bg-[#0B0915]/45 border border-white/5 rounded-2xl">
                                                    <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> WHAT IS THIS?
                                                    </div>
                                                    <p className="text-[12px] text-gray-300 leading-relaxed font-medium">{step.what}</p>
                                                </div>
                                            )}
                                            {step.why && (
                                                <div className="p-4 bg-[#0B0915]/45 border border-white/5 rounded-2xl">
                                                    <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> WHY IT MATTERS?
                                                    </div>
                                                    <p className="text-[12px] text-gray-300 leading-relaxed font-medium">{step.why}</p>
                                                </div>
                                            )}
                                            {step.how && (
                                                <div className="p-4 bg-[#0B0915]/45 border border-white/5 rounded-2xl">
                                                    <div className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> HOW WE'LL DO IT?
                                                    </div>
                                                    <p className="text-[12px] text-gray-300 leading-relaxed font-medium">{step.how}</p>
                                                </div>
                                            )}
                                            {step.who && (
                                                <div className="p-4 bg-[#0B0915]/45 border border-white/5 rounded-2xl">
                                                    <div className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> WHO IS RESPONSIBLE?
                                                    </div>
                                                    <p className="text-[12px] text-gray-300 leading-relaxed font-medium">{step.who}</p>
                                                </div>
                                            )}
                                        </div>

                                        {(!step.what && !step.why && !step.how) && (
                                            <p className="text-sm text-gray-400 leading-relaxed mb-6">{step.description || "Synthesizing deep tactical plan..."}</p>
                                        )}
                                        
                                        {/* Micro Steps list inside the selected node */}
                                        {step.microSteps && step.microSteps.length > 0 && (
                                            <div className="pt-6 border-t border-white/5 space-y-4">
                                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <ListTodo size={14} /> Micro Steps
                                                </h4>
                                                <div className="space-y-3">
                                                    {step.microSteps.map((ms: any, mIdx: number) => {
                                                        const topicKey = `${expandedStep}-${mIdx}`;
                                                        const isTopicOpen = expandedSmallTopic === topicKey;

                                                        return (
                                                            <div
                                                                key={mIdx}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedSmallTopic(isTopicOpen ? null : topicKey);
                                                                }}
                                                                className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${isTopicOpen ? 'bg-indigo-500/15 border-indigo-500/30 shadow-md shadow-indigo-500/5' : 'bg-[#0B0915]/40 border-white/[0.04] hover:bg-[#120e2a]/40 hover:border-indigo-500/20'}`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ms.isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-gray-600'}`}>
                                                                        {ms.isCompleted ? <CheckCircle2 size={16} /> : <Circle size={14} />}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="text-sm font-bold text-gray-200">{ms.title}</h4>
                                                                        {!isTopicOpen && <p className="text-xs text-gray-500 line-clamp-1">{ms.what || ms.description}</p>}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <a
                                                                            href={sanitizeExternalUrl(ms.youtubeLink || `https://www.youtube.com/results?search_query=${encodeURIComponent(ms.title)}`)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="text-red-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg shrink-0"
                                                                            title={`Learn about ${ms.title} on YouTube`}
                                                                        >
                                                                            <Youtube size={16} />
                                                                        </a>
                                                                        <span className={`text-[10px] font-black tracking-widest uppercase ${isTopicOpen ? 'text-indigo-400 rotate-180' : 'text-gray-600'} transition-transform`}>
                                                                            ▼
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <AnimatePresence>
                                                                    {isTopicOpen && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: 'auto', opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                                                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Neural Learning Brief</div>
                                                                                <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-medium mb-5">
                                                                                    {ms.what || ms.detailedContext || ms.description || "Deep technical data is being synchronized... Click the YouTube link for immediate deep-dive material!"}
                                                                                </p>

                                                                                {/* Inner Concepts List */}
                                                                                {ms.innerTopics && ms.innerTopics.length > 0 && (
                                                                                    <div className="mb-6 space-y-3">
                                                                                        <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-2 border-b border-emerald-500/10 pb-1">Micro Concepts & Key Nodes</div>
                                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                            {ms.innerTopics.map((it: any, itIdx: number) => (
                                                                                                <div key={itIdx} className="flex flex-col p-2.5 bg-[#0B0915]/40 border border-white/5 rounded-xl group/node">
                                                                                                    <div className="flex items-center gap-2 mb-1">
                                                                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                                                                        <span className="text-[10px] font-bold text-gray-200">{it.title}</span>
                                                                                                    </div>
                                                                                                    {it.what && <p className="text-[10px] text-gray-500 leading-tight pl-3.5">{it.what}</p>}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                                                        </div>
                                                                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Mastery Time: {ms.timeEstimate || ms.suggestedTime || '40 mins'}</span>
                                                                                    </div>
                                                                                    <Button
                                                                                        size="sm"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            window.open(sanitizeExternalUrl(ms.youtubeLink || `https://www.youtube.com/results?search_query=${encodeURIComponent(ms.title)}`), '_blank');
                                                                                        }}
                                                                                        className="h-7 text-[9px] bg-red-600 hover:bg-red-500 font-bold px-4 rounded-full border-none"
                                                                                    >
                                                                                        Watch Deep-Dive
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })() : (
                                <div className="bg-[#0B0915]/60 border border-white/[0.05] rounded-3xl p-12 text-center text-gray-500 font-medium">
                                    Select a node on the highway map to load strategic blueprints.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Goal Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
                    <div className="bg-[#0b081e]/90 border border-white/10 rounded-3xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left backdrop-blur-2xl">
                        <button 
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                        
                        <h2 className="font-bold text-lg text-white mb-2 flex items-center gap-2 font-display">
                            <Sparkles size={18} className="text-indigo-400 animate-pulse" /> Start New Goal
                        </h2>
                        <p className="text-gray-400 text-xs mb-6">
                            Describe the topic or goal you want to master. Our AI will build a custom, board-aligned roadmap for you.
                        </p>

                        <form onSubmit={handleCreateRoadmap} className="space-y-4">
                            <div>
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Goal / Subject / Topic</label>
                                <textarea
                                    required
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g., Class 10 Physics Electricity, or Full-Stack Next.js Developer Pathway"
                                    className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none mb-1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Target Board / Domain</label>
                                    <select
                                        value={board}
                                        onChange={e => setBoard(e.target.value)}
                                        className="w-full bg-black/45 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50 bg-indigo-950/20"
                                    >
                                        <option value="cbse">CBSE (NCERT)</option>
                                        <option value="icse">ICSE / ISC</option>
                                        <option value="msbshse">Maharashtra Board</option>
                                        <option value="upmsp">UP Board</option>
                                        <option value="developer">Developer Profile</option>
                                        <option value="general">General / Custom</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Instruction Medium</label>
                                    <select
                                        value={language}
                                        onChange={e => setLanguage(e.target.value)}
                                        className="w-full bg-black/45 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50 bg-indigo-950/20"
                                    >
                                        <option value="hinglish">Hinglish (Mix)</option>
                                        <option value="english">English</option>
                                        <option value="hindi">Hindi (हिंदी)</option>
                                        <option value="marathi">Marathi (मराठी)</option>
                                        <option value="gujarati">Gujarati (ગુજરાતી)</option>
                                    </select>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={genLoading || !topic.trim()}
                                className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-95 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2 border border-indigo-400/20"
                            >
                                {genLoading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Sparkles size={14} />
                                )}
                                <span>Assemble AI Roadmap</span>
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
