import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, Zap, FileText, Check, Copy, Download, Sparkles, Layers, Map, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const MinervaBuilderPage: React.FC = () => {
    const { token } = useAuth() as any;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const querySessionId = searchParams.get('sessionId') || '';

    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [genLoading, setGenLoading] = useState(false);

    // Form inputs
    const [selectedSession, setSelectedSession] = useState('');
    const [type, setType] = useState('summary'); // 'summary' | 'flashcards' | 'cheatsheet' | 'essay'
    const [language, setLanguage] = useState('hinglish');

    // Generated outputs
    const [history, setHistory] = useState<any[]>([]);
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    
    // Interactive states
    const [activeFlashcardIdx, setActiveFlashcardIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (token) {
            loadSessions();
            loadHistory(true);
        }
    }, [token, querySessionId]);

    const loadHistory = async (autoSelectLatest = false) => {
        try {
            const res = await minervaApi.getMaterialHistory(token);
            if (res.success) {
                const hist = res.history || [];
                setHistory(hist);
                
                if (autoSelectLatest && hist.length > 0) {
                    const latest = hist[0];
                    setExpandedTopic(latest.topic_title);
                    setExpandedItemId(latest._id);

                    setType(latest.type);
                    setLanguage(latest.language);
                    setSelectedSession(latest.session_id);
                }
            }
        } catch (err) {
            console.error('Error loading history:', err);
        }
    };

    const loadSessions = async () => {
        setLoading(true);
        try {
            const res = await minervaApi.getSessions(token);
            if (res.success) {
                const fetchedSessions = res.sessions || [];
                setSessions(fetchedSessions);
                if (querySessionId && fetchedSessions.some((s: any) => s._id === querySessionId)) {
                    setSelectedSession(querySessionId);
                } else if (fetchedSessions.length > 0) {
                    setSelectedSession(fetchedSessions[0]._id);
                }
            }
        } catch (err) {
            console.error('Error loading sessions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSession) return;

        setGenLoading(true);
        setActiveFlashcardIdx(0);
        setIsFlipped(false);

        try {
            const res = await minervaApi.generateStudyMaterial(token, {
                session_id: selectedSession,
                type,
                language
            });

            if (res.success) {
                loadHistory(true);
            } else {
                alert(res.error || 'Failed to generate study materials.');
            }
        } catch (err) {
            console.error('Generation error:', err);
            alert('Failed to generate study materials.');
        } finally {
            setGenLoading(false);
        }
    };



    const getBuilderStats = (hist: any[]) => {
        const totalGenerated = hist.length;
        const totalSummaries = hist.filter(h => h.type === 'summary').length;
        const totalFlashcards = hist.filter(h => h.type === 'flashcards').length;
        const totalCheatsheets = hist.filter(h => h.type === 'cheatsheet').length;
        const totalEssays = hist.filter(h => h.type === 'essay').length;
        
        const subjects = hist.map(h => h.subject).filter(Boolean);
        const uniqueSubjects = Array.from(new Set(subjects));
        let favSubject = 'N/A';
        let maxCount = 0;
        uniqueSubjects.forEach(s => {
            const count = subjects.filter(sub => sub === s).length;
            if (count > maxCount) {
                maxCount = count;
                favSubject = s;
            }
        });

        return {
            totalGenerated,
            totalSummaries,
            totalFlashcards,
            totalCheatsheets,
            totalEssays,
            favSubject
        };
    };

    const getGroupedHistory = (hist: any[]) => {
        const groups: Record<string, {
            topic_title: string;
            subject: string;
            session_id: string;
            items: any[];
        }> = {};

        hist.forEach(item => {
            const key = item.topic_title || 'General';
            if (!groups[key]) {
                groups[key] = {
                    topic_title: key,
                    subject: item.subject || 'General',
                    session_id: item.session_id,
                    items: []
                };
            }
            groups[key].items.push(item);
        });

        return Object.values(groups);
    };

    const renderMaterialContent = (item: any) => {
        if (item.type === 'flashcards') {
            const cards = item.flashcards || [];
            return (
                <div className="flex flex-col items-center py-4 bg-[#030209]/40 rounded-2xl border border-white/5 p-4 mt-3">
                    <h3 className="text-gray-400 font-bold text-[9px] tracking-wider uppercase mb-4 flex items-center gap-1.5 select-none">
                        <Layers size={10} /> Interactive Flashcards ({activeFlashcardIdx + 1} of {cards.length})
                    </h3>

                    {/* 3D Flashcard container */}
                    <div 
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="w-full max-w-sm h-48 cursor-pointer relative group perspective-1000 mb-6"
                    >
                        <div className={`w-full h-full duration-500 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
                            {/* Front Side */}
                            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#120a2e] to-black border border-indigo-500/35 rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-600" />
                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest select-none">Question / Concept</span>
                                <div className="text-center font-bold text-xs text-gray-100 flex items-center justify-center flex-1 px-2 leading-relaxed">
                                    {cards[activeFlashcardIdx]?.term}
                                </div>
                                <div className="text-center text-[8px] text-gray-500 select-none">Click Card to Reveal Answer</div>
                            </div>

                            {/* Back Side */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#081e14] to-black border border-emerald-500/35 rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500" />
                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest select-none">Answer / Explanation</span>
                                <div className="text-center text-[10px] text-gray-200 flex items-center justify-center flex-1 px-2 leading-relaxed font-semibold">
                                    {cards[activeFlashcardIdx]?.definition}
                                </div>
                                <div className="text-center text-[8px] text-gray-500 select-none">Click Card to Flip Back</div>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-3 items-center">
                        <button 
                            disabled={activeFlashcardIdx === 0}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveFlashcardIdx(prev => prev - 1);
                                setIsFlipped(false);
                            }}
                            className="px-3 py-1.5 border border-white/10 hover:bg-white/5 hover:border-indigo-500/30 disabled:opacity-30 rounded-lg text-[10px] transition-all font-bold"
                        >
                            Previous
                        </button>
                        <button 
                            disabled={activeFlashcardIdx === cards.length - 1}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveFlashcardIdx(prev => prev + 1);
                                setIsFlipped(false);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 rounded-lg text-[10px] transition-all font-bold"
                        >
                            Next Card
                        </button>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="mt-3">
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-white/[0.06]">
                        <span className="text-gray-400 font-bold text-[9px] tracking-wider uppercase flex items-center gap-1.5 select-none">
                            <FileText size={10} /> Generated Study Notes
                        </span>
                        <div className="flex gap-1.5">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(item.materialText || '');
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="Copy markdown"
                            >
                                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const blob = new Blob([item.materialText || ''], { type: 'text/markdown;charset=utf-8;' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `${item.topic_title.replace(/\s+/g, '_')}_${item.type}_notes.md`);
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="Download"
                            >
                                <Download size={12} />
                            </button>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none text-[11px] leading-relaxed text-gray-350 whitespace-pre-wrap font-mono select-text bg-[#030209]/80 p-4 rounded-xl border border-white/[0.06] shadow-inner max-h-[400px] overflow-y-auto">
                        {item.materialText}
                    </div>
                </div>
            );
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-16">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
            
            {/* Header */}
            <header className="sticky top-14 md:top-0 z-20 bg-[#030209]/40 backdrop-blur-xl border-b border-white/[0.06] px-6 py-3.5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/future-education')} className="p-2 bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all text-gray-400 hover:text-white flex items-center justify-center active:scale-95 shrink-0">
                        <ChevronLeft size={14} />
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] shrink-0">
                            <Zap size={13} className="animate-pulse" />
                        </div>
                        <span className="font-display font-black text-xs tracking-[0.15em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-indigo-200 select-none">
                            Future Education OS
                        </span>
                    </div>
                    <div className="h-4 w-px bg-white/10 hidden sm:block" />
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02] border border-white/5 select-none text-[9px] font-black text-gray-400 tracking-wider uppercase">
                        <span>E-Builder Notes</span>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
                    {/* 📊 E-Builder Dashboard Panel */}
                    {(() => {
                        const stats = getBuilderStats(history);
                        return (
                            <div className="lg:col-span-5 bg-[#0b081a]/60 border border-indigo-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-full min-h-[340px]">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                                <div>
                                    <h2 className="font-bold text-xs text-indigo-300 mb-4 flex items-center gap-2 uppercase tracking-wider select-none">
                                        📊 E-Builder Dashboard
                                    </h2>
                                    
                                    <div className="bg-black/30 border border-white/5 rounded-2xl p-4 mb-4 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase block">Total Generated</span>
                                            <span className="text-2xl font-black text-white">{stats.totalGenerated}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] text-gray-500 font-bold uppercase block">Fav Subject</span>
                                            <span className="text-xs font-bold text-indigo-400 mt-1 block">{stats.favSubject}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-white/[0.02] border border-white/5">
                                            <span className="text-gray-400">📝 Summaries</span>
                                            <span className="font-bold text-white font-mono">{stats.totalSummaries}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-white/[0.02] border border-white/5">
                                            <span className="text-gray-400">⚡ Flashcards</span>
                                            <span className="font-bold text-white font-mono">{stats.totalFlashcards}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-white/[0.02] border border-white/5">
                                            <span className="text-gray-400">🔥 Cheatsheets</span>
                                            <span className="font-bold text-white font-mono">{stats.totalCheatsheets}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-white/[0.02] border border-white/5">
                                            <span className="text-gray-400">📖 Essays / Outlines</span>
                                            <span className="font-bold text-white font-mono">{stats.totalEssays}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[9px] text-slate-555 mt-4 italic">
                                    Expand any roadmap topic below to read its content
                                </div>
                            </div>
                        );
                    })()}

                    {/* Options Panel Form */}
                    <div className="lg:col-span-7 bg-[#0b081a]/60 border border-indigo-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-full min-h-[340px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                        <div>
                            <h2 className="font-bold text-xs text-indigo-300 mb-4 flex items-center gap-2 uppercase tracking-wider select-none">
                                <Sparkles size={16} className="text-indigo-400" /> Assemble Custom Materials
                            </h2>
                            
                            <form onSubmit={handleGenerate} className="space-y-4">
                                <div>
                                    <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Select Study Course</label>
                                    <select 
                                        value={selectedSession} 
                                        onChange={e => setSelectedSession(e.target.value)}
                                        className="w-full bg-[#030209] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50 shadow-inner"
                                    >
                                        {sessions.length === 0 ? (
                                            <option value="">No active courses found. Ask the AI Tutor to start a topic first!</option>
                                        ) : sessions.map((s: any) => (
                                            <option key={s._id} value={s._id}>{s.title} ({s.subject})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Material Format</label>
                                        <select 
                                            value={type} 
                                            onChange={e => setType(e.target.value)}
                                            className="w-full bg-[#030209] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                                        >
                                            <option value="summary">Structured Revision Notes</option>
                                            <option value="flashcards">Interactive Flashcards</option>
                                            <option value="cheatsheet">High-Yield Exam Cheatsheet</option>
                                            <option value="essay">Detailed Essay / Topic Outline</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Output Language</label>
                                        <select 
                                            value={language} 
                                            onChange={e => setLanguage(e.target.value)}
                                            className="w-full bg-[#030209] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                                        >
                                            <option value="hinglish">Hinglish (Mix Hindi-English)</option>
                                            <option value="english">Pure English</option>
                                            <option value="hindi">Hindi</option>
                                            <option value="marathi">Marathi</option>
                                            <option value="gujarati">Gujarati</option>
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={genLoading || !selectedSession}
                                    className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-95 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99] shadow-lg border border-indigo-400/20 mt-2"
                                >
                                    {genLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Zap size={14} />
                                    )}
                                    <span>Assemble Study Material</span>
                                </button>
                            </form>
                            <div className="text-[10px] text-gray-500 text-center mt-4 font-medium tracking-wide">
                                Future BRTS and Future education os is AI and can make mistakes.
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🗺️ Grouped Study Roadmaps & Library Accordion */}
                <div className="bg-[#0b081a]/40 border border-white/[0.05] rounded-3xl p-6 mt-8 shadow-2xl">
                    <h2 className="font-bold text-xs text-indigo-300 mb-6 flex items-center gap-2 uppercase tracking-wider select-none">
                        <Map size={14} className="text-indigo-400" /> My Generated Study Roadmaps
                    </h2>

                    {genLoading && (
                        <div className="p-4 bg-indigo-500/5 border border-dashed border-indigo-500/25 rounded-2xl animate-pulse flex items-center gap-3 mb-4">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-400 animate-pulse" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Assembling new roadmap topic via AI Core...</span>
                        </div>
                    )}

                    {history.length === 0 && !genLoading ? (
                        <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl p-6">
                            <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                            <h4 className="text-xs font-bold text-gray-450">No study roadmaps created yet</h4>
                            <p className="text-[10px] text-gray-500 max-w-xs mx-auto mt-1">
                                Choose a course and format above to build your first structured study roadmap summary!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {getGroupedHistory(history).map((group) => {
                                const isTopicExpanded = expandedTopic === group.topic_title;
                                return (
                                    <div 
                                        key={group.topic_title}
                                        className="border border-white/[0.04] bg-black/20 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/20"
                                    >
                                        {/* Topic Header Card */}
                                        <div 
                                            onClick={() => setExpandedTopic(isTopicExpanded ? null : group.topic_title)}
                                            className={`p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-white/[0.02] ${isTopicExpanded ? 'bg-indigo-500/[0.03] border-b border-white/[0.04]' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isTopicExpanded ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                                                    <BookOpen size={14} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold text-white leading-snug">{group.topic_title}</h3>
                                                    <p className="text-[9px] text-gray-500 mt-0.5 font-sans">Subject: {group.subject} • {group.items.length} materials assembled</p>
                                                </div>
                                            </div>
                                            <div className="text-gray-500">
                                                {isTopicExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>

                                        {/* Materials sub-list (Accordion Content) */}
                                        {isTopicExpanded && (
                                            <div className="p-4 bg-black/10 space-y-3 pl-12 border-l-2 border-indigo-500/20 ml-8 my-2">
                                                {group.items.map((item) => {
                                                    const isItemExpanded = expandedItemId === item._id;
                                                    return (
                                                        <div key={item._id} className="border border-white/[0.03] rounded-xl overflow-hidden bg-black/40">
                                                            {/* Material Header */}
                                                            <div 
                                                                onClick={() => {
                                                                    setExpandedItemId(isItemExpanded ? null : item._id);
                                                                    if (!isItemExpanded) {
                                                                        setActiveFlashcardIdx(0);
                                                                        setIsFlipped(false);
                                                                    }
                                                                }}
                                                                className={`p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors ${isItemExpanded ? 'bg-indigo-950/10' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                                                                        item.type === 'flashcards' 
                                                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                                                            : item.type === 'cheatsheet'
                                                                            ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                                                                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                                    }`}>
                                                                        {item.type}
                                                                    </span>
                                                                    <span className="text-[9px] text-gray-400 capitalize font-sans">({item.language})</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-[9px] text-slate-500 font-mono">
                                                                    <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                                    {isItemExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                                </div>
                                                            </div>

                                                            {/* Material Expanded Content */}
                                                            {isItemExpanded && (
                                                                <div className="p-3 border-t border-white/[0.03] bg-black/20">
                                                                    {renderMaterialContent(item)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

// SVG Loader Helper
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default MinervaBuilderPage;
