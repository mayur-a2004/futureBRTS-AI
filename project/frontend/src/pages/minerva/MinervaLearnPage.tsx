import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, BookOpen, Sparkles, Youtube, Lightbulb, Play, Check, MessageSquare, Zap, Mic, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MinervaLearnPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth() as any;
    const navigate = useNavigate();

    const [node, setNode] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [ytLinks, setYtLinks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [results, setResults] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [view, setView] = useState<'simple' | 'detailed' | 'viva'>('simple');
    const [memoryTrick, setMemoryTrick] = useState('');
    const [boardNote, setBoardNote] = useState('');
    
    // AI Oral Viva States
    const [vivaState, setVivaState] = useState<'idle' | 'listening' | 'feedback'>('idle');
    const [vivaQuestion, setVivaQuestion] = useState('Welcome to the AI Oral Viva Room! Let me test your concept: Please explain what this topic is about?');
    const [useTextMode, setUseTextMode] = useState(false);
    const [vivaAnswerText, setVivaAnswerText] = useState('');

    // Translation States
    const [selectedLanguage, setSelectedLanguage] = useState<string>('original');
    const [translating, setTranslating] = useState<boolean>(false);
    const [translationsCache, setTranslationsCache] = useState<Record<string, Record<string, string>>>({});

    const getActiveText = () => {
        if (view === 'simple') return node?.explanation_simple || '';
        if (view === 'detailed') return node?.explanation_detailed || '';
        return vivaQuestion || '';
    };

    const getDisplayText = () => {
        const activeKey = view === 'viva' ? 'viva' : view;
        if (selectedLanguage !== 'original' && translationsCache[selectedLanguage]?.[activeKey]) {
            return translationsCache[selectedLanguage][activeKey];
        }
        return getActiveText();
    };

    const handleLanguageChange = async (lang: string) => {
        setSelectedLanguage(lang);
        if (lang === 'original') return;

        const activeKey = view === 'viva' ? 'viva' : view;
        const sourceText = getActiveText();

        if (translationsCache[lang]?.[activeKey]) {
            return;
        }

        await translateActiveText(lang, activeKey, sourceText);
    };

    const translateActiveText = async (lang: string, key: string, text: string) => {
        if (!text || !text.trim()) return;
        setTranslating(true);
        try {
            const res = await minervaApi.translateText(token, text, lang);
            if (res.success && res.translated) {
                setTranslationsCache(prev => ({
                    ...prev,
                    [lang]: {
                        ...(prev[lang] || {}),
                        [key]: res.translated
                    }
                }));
            }
        } catch (err) {
            console.error('[Translation client error]', err);
        } finally {
            setTranslating(false);
        }
    };

    // Speech Synthesis (TTS) States
    const [isSpeaking, setIsSpeaking] = useState(false);
    const speechUtteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

    const speakText = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel(); // Stop any active speech

        if (!text) return;
        // Clean markdown symbols
        const cleanText = text.replace(/[*#_`~]/g, '').trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Find a natural voice matching selectedLanguage
        const voices = window.speechSynthesis.getVoices();
        let langCode = 'en';
        if (selectedLanguage === 'hindi' || selectedLanguage === 'hinglish') langCode = 'hi';
        else if (selectedLanguage === 'marathi') langCode = 'mr';
        else if (selectedLanguage === 'gujarati') langCode = 'gu';
        else if (selectedLanguage === 'spanish') langCode = 'es';
        else if (selectedLanguage === 'bengali') langCode = 'bn';
        else if (selectedLanguage === 'tamil') langCode = 'ta';
        else if (selectedLanguage === 'telugu') langCode = 'te';
        else if (selectedLanguage === 'kannada') langCode = 'kn';
        else if (selectedLanguage === 'punjabi') langCode = 'pa';

        const preferredVoice = voices.find(v => v.lang.toLowerCase().includes(langCode)) || 
                               voices.find(v => v.lang.includes('hi') || v.lang.includes('IN')) || 
                               voices.find(v => v.lang.includes('en'));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 0.95; // Slightly slower for better classroom teaching pace
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        speechUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeech = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    };

    const toggleSpeech = () => {
        if (isSpeaking) {
            stopSpeech();
        } else {
            speakText(getDisplayText());
        }
    };

    // Auto-translate on view change or language change
    useEffect(() => {
        if (selectedLanguage === 'original' || !node) return;

        const activeKey = view === 'viva' ? 'viva' : view;
        const sourceText = getActiveText();

        if (!translationsCache[selectedLanguage]?.[activeKey]) {
            translateActiveText(selectedLanguage, activeKey, sourceText);
        }
    }, [view, selectedLanguage, node]);

    // Auto-stop speech when view changes, and auto-read in Viva room
    useEffect(() => {
        stopSpeech();
        if (view === 'viva') {
            const timer = setTimeout(() => {
                speakText(getDisplayText());
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [view]);

    // Auto-read Viva Question when it changes or translation finishes
    useEffect(() => {
        if (view === 'viva' && !translating) {
            const timer = setTimeout(() => {
                speakText(getDisplayText());
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [vivaQuestion, translating]);

    // Clean up speech on unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        if (node) {
            setVivaQuestion(`Welcome to the AI Oral Viva Room for '${node.title}'! Main aapka verbal test conduct kar raha hoon. Please explain in your own words: What do you understand by '${node.title}' and what are its key applications?`);
        }
    }, [node]);

    useEffect(() => {
        if (!token || !id) return;
        loadNode();
    }, [token, id]);

    const loadNode = async () => {
        setLoading(true);
        const res = await minervaApi.learnNode(token, id!);
        if (res.success) {
            setNode(res.node);
            setTasks(res.tasks || []);
            setYtLinks(res.youtube_links || []);
            if (res.memory_trick) setMemoryTrick(res.memory_trick);
            if (res.board_specific_note) setBoardNote(res.board_specific_note);
            setSelectedLanguage('original');
            setTranslationsCache({});
        }
        setLoading(false);
    };

    const submitTask = async (taskId: string) => {
        const answer = answers[taskId];
        if (!answer?.trim()) { alert('Pehle jawab likho!'); return; }
        setSubmitting(taskId);
        const res = await minervaApi.submitTask(token, taskId, answer);
        if (res.success) {
            setResults(prev => ({ ...prev, [taskId]: res }));
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, submitted: true, ai_score: res.score, passed: res.passed } : t));
        }
        setSubmitting(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-gray-400 text-sm font-semibold">Tutor is preparing study content... ⚡</div>
                    <div className="text-gray-600 text-xs mt-1">Analyzing board pattern & generating tasks</div>
                </div>
            </div>
        );
    }

    if (!node) return (
        <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter text-gray-400">
            Topic not found. <button onClick={() => navigate(-1)} className="ml-2 text-indigo-400 hover:underline font-semibold">Go Back</button>
        </div>
    );

    const allTasksDone = tasks.length > 0 && tasks.every(t => t.submitted);
    const avgScore = tasks.filter(t => t.submitted).reduce((s, t) => s + t.ai_score, 0) / (tasks.filter(t => t.submitted).length || 1);

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-16">
            
            {/* Header */}
            <div className="sticky top-14 md:top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all text-gray-400 hover:text-white">
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-bold text-sm truncate bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">{node.title}</h1>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            {node.chapter && <span>{node.chapter}</span>}
                            <span className="text-gray-600">•</span>
                            <span className={`px-2 py-0.5 rounded border 
                                ${node.priority === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' : node.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                {node.priority} Priority
                            </span>
                            <span className="text-gray-600">•</span>
                            <span>{node.estimated_time_minutes} Mins study</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/future-education?askDoubt=${encodeURIComponent(`Mujhe topic '${node.title}' mein doubt hai, iska explanation aur reference topics clear karo.`)}`)}
                            className="text-xs bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-xl transition-all font-semibold flex items-center gap-1.5 text-indigo-400"
                        >
                            <MessageSquare size={13} />
                            <span>Ask Doubt</span>
                        </button>
                        <button
                            onClick={() => navigate(`/future-education/builder?sessionId=${node.session_id}`)}
                            className="text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-indigo-500/20 px-3 py-1.5 rounded-xl transition-all font-semibold flex items-center gap-1.5 text-white"
                        >
                            <Zap size={13} />
                            <span>E-Builder</span>
                        </button>
                    </div>
                    {node.status === 'DONE' && (
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full font-bold">✅ Complete</span>
                    )}
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

                {/* View Mode & Translator Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* View Mode Toggle */}
                    <div className="flex bg-white/[0.02] border border-white/5 rounded-2xl p-1.5 w-fit backdrop-blur-md shadow-lg">
                        {(['simple', 'detailed', 'viva'] as const).map(v => (
                            <button key={v} onClick={() => setView(v)}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all
                                    ${view === v ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                                {v === 'simple' ? '⚡ Story' : v === 'detailed' ? '📖 Theory' : '🎙️ AI Oral Viva'}
                            </button>
                        ))}
                    </div>

                    {/* Premium Language Translator */}
                    <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-2xl p-1.5 backdrop-blur-md shadow-lg">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider pl-2">🗣️ Translate:</span>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500/50 transition-all font-semibold cursor-pointer hover:border-white/20"
                        >
                            <option value="original">Original (English)</option>
                            <option value="hinglish">Hinglish</option>
                            <option value="hindi">Hindi (हिंदी)</option>
                            <option value="marathi">Marathi (मराठी)</option>
                            <option value="gujarati">Gujarati (ગુજરાતી)</option>
                            <option value="bengali">Bengali (বাংলা)</option>
                            <option value="tamil">Tamil (தமிழ்)</option>
                            <option value="telugu">Telugu (తెలుగు)</option>
                            <option value="kannada">Kannada (ಕನ್ನಡ)</option>
                            <option value="punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                            <option value="spanish">Spanish (Español)</option>
                        </select>
                    </div>
                </div>

                {/* Explanation Theory Card / AI Oral Viva Panel */}
                {view === 'viva' ? (
                    <div className="bg-gradient-to-br from-[#0c0a21] via-[#050410] to-black border border-cyan-500/25 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden min-h-[350px] flex flex-col justify-between animate-in fade-in duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                        
                        {/* Title Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 shadow-md">
                                    <Mic size={16} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-sm text-gray-200">AI Oral Viva Room</h2>
                                    <p className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-wider mt-0.5">Active Retrieval Test</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => speakText(getDisplayText())}
                                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-all flex items-center justify-center"
                                    title="Replay AI Teacher Question"
                                >
                                    <Volume2 size={13} />
                                </button>
                                <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-black tracking-widest uppercase animate-pulse">Live</span>
                            </div>
                        </div>

                        {/* Interactive Waveform / Dialog space */}
                        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center w-full">
                            {vivaState === 'listening' && !useTextMode ? (
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="flex gap-1.5 items-center h-12 justify-center">
                                        {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                                            <div key={i} className="w-1.5 bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-full animate-bounce" style={{ height: `${h * 6}px`, animationDelay: `${i * 0.1}s` }} />
                                        ))}
                                    </div>
                                    <div className="text-xs text-cyan-300 font-bold tracking-wide animate-pulse">Minerva is listening to your answer...</div>
                                </div>
                            ) : (
                                <div className="w-full max-w-lg space-y-4">
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs text-gray-200 leading-relaxed font-semibold italic">
                                        {translating ? (
                                            <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold py-2 animate-pulse">
                                                <Loader2 className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                                <span>Translating Question...</span>
                                            </div>
                                        ) : (
                                            `"${getDisplayText()}"`
                                        )}
                                    </div>
                                    {useTextMode && (
                                        <textarea
                                            value={vivaAnswerText}
                                            onChange={e => setVivaAnswerText(e.target.value)}
                                            placeholder="Apna answer detail me type karein..."
                                            rows={3}
                                            className="w-full bg-black/45 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-cyan-500/50 resize-none shadow-inner"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Speech Input Trigger Controls */}
                        <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                            {useTextMode ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            if (!vivaAnswerText.trim()) return;
                                            setVivaAnswerText('');
                                            setVivaQuestion(`Aapka typed answer analyze ho chuka hai. Agla conceptual question: Explain the relation between resistance and temperature?`);
                                        }}
                                        disabled={!vivaAnswerText.trim()}
                                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                                    >
                                        <span>Submit Typed Answer</span>
                                    </button>
                                </div>
                            ) : vivaState === 'idle' ? (
                                <button
                                    onClick={() => setVivaState('listening')}
                                    className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/20 active:scale-95 transition-all"
                                >
                                    <Mic size={14} />
                                    <span>Press to Speak / Answer</span>
                                </button>
                            ) : vivaState === 'listening' ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setVivaState('idle');
                                            setVivaQuestion(`Bahut badhiya! Aapka response accurate tha. Agla sawal: Is topic ka daily application kya ho sakta hai, standard rules ke according?`);
                                        }}
                                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                                    >
                                        <span>Stop & Submit Answer</span>
                                    </button>
                                    <button
                                        onClick={() => setVivaState('idle')}
                                        className="px-5 py-3 border border-white/10 hover:bg-white/5 rounded-2xl text-xs font-bold text-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : null}
                            
                            <div className="flex justify-center text-[10px] text-gray-500 mt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseTextMode(!useTextMode);
                                        setVivaState('idle');
                                    }}
                                    className="hover:text-cyan-400 font-bold transition-colors flex items-center gap-1"
                                >
                                    {useTextMode ? "🎙️ Switch to Voice Mode" : "⌨️ Type your Answer instead"}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 shadow-md">
                                    <BookOpen size={16} />
                                </div>
                                <h2 className="font-bold text-sm text-gray-200">{view === 'simple' ? 'Concept Analogy' : 'Detailed Study Material'}</h2>
                            </div>
                            {/* AI Voice Narration Button */}
                            <button
                                onClick={toggleSpeech}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md border
                                    ${isSpeaking 
                                        ? 'bg-cyan-500/20 border-cyan-500/35 text-cyan-300 animate-pulse' 
                                        : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                                    }`}
                                title={isSpeaking ? "Pause Narration" : "Listen to AI Teacher"}
                            >
                                {isSpeaking ? (
                                    <>
                                        <Volume2 size={13} className="text-cyan-400 animate-bounce" />
                                        <span>Stop Voice</span>
                                    </>
                                ) : (
                                    <>
                                        <VolumeX size={13} />
                                        <span>Play Voice</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="text-gray-300 text-xs leading-relaxed font-medium prose prose-invert max-w-none space-y-3 [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_strong]:text-white [&_strong]:font-bold [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-indigo-300 [&_code]:font-mono [&_code]:text-[11px]">
                            {translating ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Loader2 className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 text-indigo-400" />
                                    <div className="text-indigo-300 text-xs font-bold tracking-wide animate-pulse">Minerva is translating this section...</div>
                                    <div className="text-gray-500 text-[10px] mt-1 font-semibold">Keeping definitions and formatting intact ⚡</div>
                                </div>
                            ) : (
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        a: ({ node, ...props }) => (
                                            <a 
                                                {...props} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-cyan-400 hover:text-cyan-300 underline font-semibold inline-flex items-center gap-1"
                                            />
                                        )
                                    }}
                                >
                                    {getDisplayText()}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>
                )}

                {/* Real World Example Card */}
                {node.real_world_example && (
                    <div className="bg-emerald-950/5 border border-emerald-500/10 rounded-3xl p-6 shadow-xl backdrop-blur-md">
                        <div className="flex items-center gap-2.5 mb-3">
                            <span className="text-xl">🎯</span>
                            <h2 className="font-bold text-sm text-emerald-400">Real World Application</h2>
                        </div>
                        <div className="text-gray-300 text-xs leading-relaxed font-medium">{node.real_world_example}</div>
                    </div>
                )}

                {/* Key Points & Formulas Dashboard */}
                {(node.key_points?.length > 0 || node.key_formulas?.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {node.key_points?.length > 0 && (
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md">
                                <h2 className="font-bold text-xs text-gray-200 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <Sparkles size={14} className="text-indigo-400" /> Key takeaways
                                </h2>
                                <ul className="space-y-3">
                                    {node.key_points.map((pt: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2.5 text-xs text-gray-300 font-medium">
                                            <span className="text-indigo-400 mt-0.5">•</span>
                                            <span>{pt}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {node.key_formulas?.length > 0 && (
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md">
                                <h2 className="font-bold text-xs text-gray-200 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <Lightbulb size={14} className="text-amber-400" /> formulas & rules
                                </h2>
                                <ul className="space-y-3">
                                    {node.key_formulas.map((f: string, i: number) => (
                                        <li key={i} className="text-xs font-mono bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-amber-300 shadow-inner">
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Memory Mnemonic Trick Card */}
                {memoryTrick && (
                    <div className="bg-amber-950/5 border border-amber-500/10 rounded-2xl p-5 shadow-lg backdrop-blur-md">
                        <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">🧠 Memory Mnemonic</div>
                        <div className="text-xs text-gray-300 font-medium leading-relaxed">{memoryTrick}</div>
                    </div>
                )}

                {/* Board Specific Note */}
                {boardNote && (
                    <div className="bg-indigo-950/10 border border-indigo-500/10 rounded-2xl p-5 shadow-lg backdrop-blur-md">
                        <div className="text-xs font-bold text-indigo-300 mb-1 flex items-center gap-1.5 uppercase tracking-wider">📋 Board Exam Focus</div>
                        <div className="text-xs text-gray-300 font-medium leading-relaxed">{boardNote}</div>
                    </div>
                )}

                {/* Youtube Videos */}
                {ytLinks.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="font-bold text-xs text-gray-200 flex items-center gap-2 uppercase tracking-wider">
                            <Youtube size={16} className="text-red-500 animate-pulse" />
                            Curated YouTube Lessons
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ytLinks.map((yt: any, i: number) => (
                                <a key={i} href={yt.url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-3 p-4 bg-white/[0.01] hover:bg-white/5 border border-white/5 hover:border-red-500/30 rounded-2xl transition-all group shadow-lg">
                                    <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-400 flex-shrink-0 group-hover:bg-red-500/20 group-hover:text-red-300 transition-colors">
                                        <Play size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors truncate">{yt.title}</div>
                                        <div className="text-[10px] text-gray-500 mt-1">{yt.channel}</div>
                                    </div>
                                    <span className="text-gray-600 group-hover:text-red-400 transition-colors text-sm">↗</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Practice Tasks */}
                {tasks.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="font-bold text-xs text-gray-200 flex items-center gap-2 uppercase tracking-wider">
                            <span>📝</span> Practice tasks
                            {allTasksDone && <span className="ml-auto text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">All Completed</span>}
                        </h2>
                        <div className="space-y-4">
                            {tasks.map((task: any, ti: number) => (
                                <div key={task._id} className={`rounded-3xl border p-6 shadow-xl backdrop-blur-md transition-all
                                    ${task.submitted 
                                        ? (task.passed ? 'border-emerald-500/20 bg-emerald-950/5' : 'border-red-500/20 bg-red-950/5') 
                                        : 'border-white/5 bg-white/[0.01]'}`}>
                                    
                                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Task {ti + 1} • {task.marks} Marks</div>
                                        {task.submitted && (
                                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border
                                                ${task.passed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {task.ai_score}% {task.passed ? 'Passed' : 'Needs Review'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-xs text-gray-200 leading-relaxed font-semibold mb-4">{task.prompt}</div>

                                    {/* MCQ Choices */}
                                    {task.type === 'mcq' && task.options?.length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            {task.options.map((opt: string, oi: number) => (
                                                <button key={oi}
                                                    onClick={() => !task.submitted && setAnswers(prev => ({ ...prev, [task._id]: opt }))}
                                                    className={`w-full text-left text-xs px-4 py-3 rounded-xl border transition-all font-semibold
                                                        ${answers[task._id] === opt
                                                            ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-950/20'
                                                            : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                                                        } ${task.submitted ? 'cursor-default' : 'cursor-pointer'}`}>
                                                    <span className="font-black mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Written answer input */}
                                    {task.type !== 'mcq' && !task.submitted && (
                                        <textarea
                                            value={answers[task._id] || ''}
                                            onChange={e => setAnswers(prev => ({ ...prev, [task._id]: e.target.value }))}
                                            placeholder="Write your explanation answer here..."
                                            rows={3}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 resize-none mb-4 shadow-inner"
                                        />
                                    )}

                                    {/* Submit Answer */}
                                    {!task.submitted && (
                                        <button onClick={() => submitTask(task._id)}
                                            disabled={submitting === task._id}
                                            className="text-xs bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-950/20">
                                            {submitting === task._id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <Check size={12} />
                                            )}
                                            <span>Submit to AI Teacher</span>
                                        </button>
                                    )}

                                    {/* Grading Feedback Results */}
                                    {results[task._id] && (
                                        <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                                            <div className={`p-4 rounded-2xl border ${results[task._id].passed ? 'bg-emerald-950/10 border-emerald-500/20' : 'bg-red-950/10 border-red-500/20'}`}>
                                                <div className="font-bold text-xs mb-1.5 flex items-center gap-1">
                                                    <span>{results[task._id].passed ? '✅ Passed!' : '❌ Needs revision'}</span>
                                                </div>
                                                <div className="text-gray-300 text-xs leading-relaxed font-medium">{results[task._id].feedback}</div>
                                            </div>
                                            {results[task._id].correction && (
                                                <div className="p-4 bg-indigo-950/10 border border-indigo-500/25 rounded-2xl text-xs text-gray-300">
                                                    <span className="font-bold text-indigo-300 block mb-1">Model Answer Explanation:</span>
                                                    {results[task._id].correction}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Completion card */}
                        {allTasksDone && (
                            <div className={`p-6 rounded-3xl border text-center shadow-2xl backdrop-blur-md relative overflow-hidden
                                ${avgScore >= 60 ? 'bg-emerald-950/10 border-emerald-500/20' : 'bg-orange-950/10 border-orange-500/20'}`}>
                                <div className="text-3xl mb-2">{avgScore >= 60 ? '🎉' : '📚'}</div>
                                <h3 className="font-black text-sm">{avgScore >= 60 ? 'Topic Mastery Achieved!' : 'Revision Recommended'}</h3>
                                <p className="text-xs text-gray-400 mt-1 mb-4 max-w-sm mx-auto">
                                    Your average score is {Math.round(avgScore)}%. {avgScore >= 60 ? 'The next chapter has been unlocked automatically.' : 'We suggest reviewing and attempting the tasks again.'}
                                </p>
                                <button onClick={() => navigate(-1)} className="text-xs bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl transition-all font-bold text-indigo-400">
                                    ← Back to Session Map
                                </button>
                            </div>
                        )}
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

export default MinervaLearnPage;
