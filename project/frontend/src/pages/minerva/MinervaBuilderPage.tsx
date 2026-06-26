import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, Zap, FileText, Check, Copy, Download, Sparkles, Layers } from 'lucide-react';

interface Flashcard {
    term: string;
    definition: string;
}

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
    const [materialText, setMaterialText] = useState('');
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    
    // Interactive states
    const [activeFlashcardIdx, setActiveFlashcardIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (token) {
            loadSessions();
        }
    }, [token, querySessionId]);

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
        setMaterialText('');
        setFlashcards([]);
        setActiveFlashcardIdx(0);
        setIsFlipped(false);

        try {
            const res = await minervaApi.generateStudyMaterial(token, {
                session_id: selectedSession,
                type,
                language
            });

            if (res.success) {
                if (type === 'flashcards') {
                    setFlashcards(res.material || []);
                } else {
                    setMaterialText(res.material || '');
                }
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

    const handleCopy = () => {
        if (!materialText) return;
        navigator.clipboard.writeText(materialText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!materialText) return;
        const blob = new Blob([materialText], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const course = sessions.find(s => s._id === selectedSession);
        const title = course ? course.title.replace(/\s+/g, '_') : 'study';
        link.setAttribute('download', `${title}_${type}_notes.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                
                {/* Options Panel */}
                <div className="bg-[#0b081a]/60 border border-indigo-500/20 rounded-3xl p-6 mb-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                    <h2 className="font-bold text-xs text-indigo-300 mb-4 flex items-center gap-2 uppercase tracking-wider select-none">
                        <Sparkles size={16} className="text-indigo-400" /> Build Custom Study Materials
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
                            className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-95 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99] shadow-lg shadow-indigo-950/20 border border-indigo-400/20"
                        >
                            {genLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Zap size={14} />
                            )}
                            <span>Assemble Study Material</span>
                        </button>
                    </form>
                </div>

                {/* Material Result Panel */}
                {(materialText || flashcards.length > 0 || genLoading) && (
                    <div className="bg-[#0b081a]/60 border border-white/[0.05] rounded-3xl p-6 min-h-[300px] shadow-2xl relative backdrop-blur-2xl">
                        {genLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 select-none">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Drafting content via LLM Core</span>
                            </div>
                        ) : type === 'flashcards' && flashcards.length > 0 ? (
                            <div className="flex flex-col items-center py-6">
                                <h3 className="text-gray-400 font-bold text-[10px] tracking-wider uppercase mb-6 flex items-center gap-1.5 select-none">
                                    <Layers size={12} /> Interactive Flashcards ({activeFlashcardIdx + 1} of {flashcards.length})
                                </h3>

                                {/* 3D Flashcard container */}
                                <div 
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    className="w-full max-w-md h-64 cursor-pointer relative group perspective-1000 mb-8"
                                >
                                    <div className={`w-full h-full duration-500 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
                                        
                                        {/* Front Side */}
                                        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#120a2e] to-black border border-indigo-500/35 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-purple-600" />
                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest select-none">Question / Concept</span>
                                            <div className="text-center font-bold text-sm text-gray-100 flex items-center justify-center flex-1 px-4 leading-relaxed font-sans">
                                                {flashcards[activeFlashcardIdx]?.term}
                                            </div>
                                            <div className="text-center text-[10px] text-gray-500 font-medium select-none">Click Card to Flip & Reveal Answer</div>
                                        </div>

                                        {/* Back Side */}
                                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#081e14] to-black border border-emerald-500/35 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500" />
                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest select-none">Answer / Explanation</span>
                                            <div className="text-center text-xs text-gray-200 flex items-center justify-center flex-1 px-4 leading-relaxed font-semibold font-sans">
                                                {flashcards[activeFlashcardIdx]?.definition}
                                            </div>
                                            <div className="text-center text-[10px] text-gray-500 font-medium select-none">Click Card to Flip Back</div>
                                        </div>

                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex gap-4 items-center">
                                    <button 
                                        disabled={activeFlashcardIdx === 0}
                                        onClick={() => {
                                            setActiveFlashcardIdx(prev => prev - 1);
                                            setIsFlipped(false);
                                        }}
                                        className="px-4 py-2 border border-white/10 hover:bg-white/5 hover:border-indigo-500/30 disabled:opacity-30 rounded-xl text-xs transition-all font-bold"
                                    >
                                        Previous
                                    </button>
                                    <button 
                                        disabled={activeFlashcardIdx === flashcards.length - 1}
                                        onClick={() => {
                                            setActiveFlashcardIdx(prev => prev + 1);
                                            setIsFlipped(false);
                                        }}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 rounded-xl text-xs transition-all font-bold"
                                    >
                                        Next Card
                                    </button>
                                </div>
                            </div>
                        ) : materialText ? (
                            <div>
                                <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/[0.06]">
                                    <h3 className="text-gray-400 font-bold text-[10px] tracking-wider uppercase flex items-center gap-1.5 select-none">
                                        <FileText size={12} /> Generated Study Guide
                                    </h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleCopy}
                                            className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                                            title="Copy markdown code"
                                        >
                                            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        </button>
                                        <button 
                                            onClick={handleDownload}
                                            className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                                            title="Download Markdown file"
                                        >
                                            <Download size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Markdown Content container */}
                                <div className="prose prose-invert max-w-none text-xs leading-relaxed text-gray-300 whitespace-pre-wrap font-medium font-mono select-text bg-[#030209]/80 p-5 rounded-2xl border border-white/[0.06] shadow-inner max-h-[500px] overflow-y-auto">
                                    {materialText}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

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
