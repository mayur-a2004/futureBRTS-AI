// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    Plus,
    ImageIcon,
    Search,
    BookOpen,
    Zap,
    Mic,
    Globe,
    Cpu,
    FileText,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth, Message, Session, BuilderMode } from "@/context/AuthContext";
import UniverseBackground from "@/components/ui/UniverseBackground";
import { api } from "@/lib/api";

const PLACEHOLDERS = [
    "I'm in Class 10 and confused about streams...",
    "I want to build my first project...",
    "I want to switch careers but I'm scared...",
    "How to prepare for UPSC while working?",
    "What are the skills for a Product Manager?"
];

const MODES: BuilderMode[] = ['Student', 'Project', 'Career', 'Business', 'Exam'];

export default function ThinkingSpace() {
    const {
        user,
        sessions,
        activeSessionId,
        initialIntent,
        addSession,
        appendMessage,
        updateSessionMode,
        setActiveSession
    } = useAuth();

    const [inputText, setInputText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [attachments, setAttachments] = useState<{ type: 'image' | 'file', name: string, url?: string }[]>([]);

    // Feature Toggles (UI only)
    const [features, setFeatures] = useState({
        deepResearch: false,
        studyLearn: false,
        webSearch: false,
        thinking: true
    });

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollEndRef = useRef<HTMLDivElement>(null);
    const bottomSheetRef = useRef<HTMLDivElement>(null);
    const toggleButtonRef = useRef<HTMLButtonElement>(null);

    const currentSession = sessions.find(s => s.id === activeSessionId);

    // Click outside to close tool menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                bottomSheetRef.current &&
                !bottomSheetRef.current.contains(event.target as Node) &&
                toggleButtonRef.current &&
                !toggleButtonRef.current.contains(event.target as Node)
            ) {
                setIsBottomSheetOpen(false);
            }
        }
        if (isBottomSheetOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isBottomSheetOpen]);

    // Sync placeholder interval
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Initial Session Generation & Resumption
    useEffect(() => {
        const checkLandingContext = async () => {
            const token = localStorage.getItem('fb_auth_token');
            const landingId = localStorage.getItem('fb_landing_session_id');

            if (token && landingId && sessions.length <= 1) {
                try {
                    const res = await api.landing.resumeChat(token);
                    if (res.initialQuestion) {
                        // Create a session based on the landing question
                        const newSession: Session = {
                            id: landingId,
                            title: res.initialQuestion.length > 30 ? res.initialQuestion.slice(0, 30) + '...' : res.initialQuestion,
                            messages: [
                                { id: 'sys-1', session_id: landingId, role: 'assistant', content: res.systemMessage, timestamp: Date.now() },
                                { id: 'query-1', session_id: landingId, role: 'user', content: res.initialQuestion, timestamp: Date.now() },
                                { id: 'ai-1', session_id: landingId, role: 'assistant', content: `हमने आपके intent (${res.initialQuestion}) को capture कर लिया है। चलिए builder workspace में गहराई से काम शुरू करते हैं।`, timestamp: Date.now() + 100 }
                            ],
                            timestamp: Date.now(),
                            created_at: Date.now(),
                            user_id: user?.id || 'unknown',
                            intent: res.initialQuestion,
                            mode: 'Career',
                            keywords: []
                        };
                        addSession(newSession);
                        // Clear landing context after resumption
                        localStorage.removeItem('fb_landing_session_id');
                        return;
                    }
                } catch (err) {
                    console.error("Context resume failed", err);
                }
            }

            if (!activeSessionId && sessions.length === 0) {
                handleNewSession();
            }
        };

        checkLandingContext();
    }, []);

    // Auto-grow textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            const newHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(newHeight, 160)}px`;
        }
    }, [inputText]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollEndRef.current) {
            scrollEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [currentSession?.messages?.length, isProcessing]);

    const handleNewSession = async () => {
        const id = Date.now().toString();

        await api.builder.createSession({ id, intent: initialIntent });

        const firstMessage: Message = {
            id: 'init-' + Date.now(),
            role: 'assistant',
            content: `Based on your goal to "${initialIntent || 'explore new possibilities'}", I've analyzed your context. \n\nWhat is the biggest challenge on your mind right now?`,
            timestamp: Date.now(),
            session_id: id
        };

        const newSession: Session = {
            id,
            title: "New Session",
            timestamp: Date.now(),
            created_at: Date.now(),
            user_id: user?.id || 'guest',
            intent: initialIntent || '',
            messages: [firstMessage],
            keywords: [],
            mode: 'Career'
        };

        addSession(newSession);
        setActiveSession(id);
        setInputText("");
    };

    const handleContinueThinking = async () => {
        if (!inputText.trim() || isProcessing || !activeSessionId) return;

        setIsProcessing(true);
        const userInput = inputText.trim();
        setInputText(""); // Clear instantly
        setAttachments([]); // Clear attachments after send

        const userMessage: Message = {
            id: 'msg-' + Date.now(),
            role: 'user',
            content: userInput,
            timestamp: Date.now(),
            session_id: activeSessionId
        };

        appendMessage(activeSessionId, userMessage);

        await api.builder.sendMessage({ session_id: activeSessionId, content: userInput });

        try {
            await new Promise(r => setTimeout(r, 1200));

            const systemResponse = generateMockResponse(userInput);
            const assistantMessage: Message = {
                id: 'msg-' + (Date.now() + 1),
                role: 'assistant',
                content: systemResponse,
                timestamp: Date.now(),
                session_id: activeSessionId
            };

            appendMessage(activeSessionId, assistantMessage);
        } catch (error) {
            console.error("Failed to fetch AI response:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const generateMockResponse = (input: string) => {
        const lower = input.toLowerCase();
        if (lower.includes("class 10") || lower.includes("science") || lower.includes("stream")) {
            return "Choosing a stream is about matching your natural strengths with future opportunities. For Class 10, have you considered which subjects feel effortless to you compared to others?";
        }
        if (lower.includes("project") || lower.includes("build")) {
            return "The best project is one that solves a real problem you face. What's one annoyance in your daily workflow that could be fixed with a simple tool?";
        }
        if (lower.includes("career") || lower.includes("switch")) {
            return "Success in career pivots comes from 'Stackable Skills'. What's one skill from your current role that would be a superpower in your target field?";
        }
        return "That's a profound first step. To help me refine your roadmap further, could you describe what a perfect outcome looks like for you 6 months from now?";
    };

    const toggleFeature = (key: keyof typeof features) => {
        setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="chat-root flex-1 flex flex-col h-full bg-transparent relative overflow-hidden font-sans">
            {/* 4️⃣ Background Animation */}
            <div className="chat-background absolute inset-0 z-0 pointer-events-none">
                <UniverseBackground intensity={0.15} />
                <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
            </div>

            {/* Desktop Header */}
            <header className="hidden md:flex h-14 border-b border-white/5 px-6 items-center justify-between bg-black/40 backdrop-blur-xl relative z-40">
                <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-full p-1 gap-1">
                    {MODES.map(m => (
                        <button
                            key={m}
                            onClick={() => activeSessionId && updateSessionMode(activeSessionId, m)}
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${currentSession?.mode === m ? 'bg-white text-black shadow-lg' : 'text-gray-600 hover:text-gray-300'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleNewSession} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors">
                        <Plus size={12} /> New Session
                    </button>
                    <div className="h-4 w-px bg-white/10" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">Context: {currentSession?.mode || 'General'}</span>
                </div>
            </header>

            {/* 2️⃣ Chat Messages (ONLY THIS SCROLLS) */}
            <div className="chat-messages flex-1 overflow-y-auto relative z-10 scrollbar-hide scroll-smooth">
                <div className="max-w-[720px] mx-auto px-4 md:px-6 py-10 md:py-16 space-y-10 md:space-y-12 pb-10">
                    {currentSession?.messages && currentSession.messages.length > 0 ? (
                        currentSession.messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="w-full flex flex-col"
                            >
                                {message.role === 'user' ? (
                                    <div className="flex justify-end w-full">
                                        <div className="max-w-[90%] md:max-w-[85%] bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-[12.5px] md:text-[13px] text-gray-200 leading-relaxed font-medium">
                                            {message.content}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-4 md:gap-6 w-full group">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400/80 mt-1">
                                            <Zap size={14} />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="text-[12.5px] md:text-[13px] font-medium text-gray-100 leading-[1.8] tracking-tight whitespace-pre-wrap">
                                                {message.content}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center opacity-20 py-20">
                            <Zap size={40} className="text-gray-600 animate-pulse" />
                        </div>
                    )}
                    {isProcessing && (
                        <div className="flex gap-4 md:gap-6 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/5 shrink-0" />
                            <div className="flex-1 space-y-3 pt-3">
                                <div className="h-2 bg-white/[0.05] rounded w-3/4" />
                                <div className="h-2 bg-white/[0.05] rounded w-1/2" />
                            </div>
                        </div>
                    )}
                    <div ref={scrollEndRef} className="h-1" />
                </div>
            </div>

            {/* 3️⃣ Textarea / Input (Always Visible) */}
            <div className="chat-input-wrapper relative z-40 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent px-4 pb-4 pt-2 md:px-8 md:pb-8">
                <div className="max-w-[720px] mx-auto relative">

                    {/* Attachment Previews */}
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4 px-2">
                            {attachments.map((file, i) => (
                                <div key={i} className="group relative bg-[#111] border border-white/10 rounded-xl p-2 pr-8 flex items-center gap-2">
                                    {file.type === 'image' ? <ImageIcon size={14} className="text-purple-400" /> : <FileText size={14} className="text-blue-400" />}
                                    <span className="text-[10px] text-gray-400 font-bold truncate max-w-[120px]">{file.name}</span>
                                    <button onClick={() => removeAttachment(i)} className="absolute right-1 text-gray-500 hover:text-white transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Desktop Toolset */}
                    <div className="hidden md:flex items-center gap-2 mb-4">
                        {Object.entries(features).map(([key, active]) => (
                            <button
                                key={key}
                                onClick={() => toggleFeature(key as keyof typeof features)}
                                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${active ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold' : 'bg-white/[0.02] border-white/5 text-gray-600 hover:text-gray-400'}`}
                            >
                                {key === 'thinking' && <Cpu size={10} />}
                                {key === 'webSearch' && <Globe size={10} />}
                                {key === 'deepResearch' && <Search size={10} />}
                                {key === 'studyLearn' && <BookOpen size={10} />}
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </button>
                        ))}
                    </div>

                    {/* Main Input Component */}
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-[1.8rem] p-2 md:p-3 shadow-2xl focus-within:border-indigo-500/40 transition-all relative group">

                        <AnimatePresence>
                            {isBottomSheetOpen && (
                                <div className="absolute inset-0 pointer-events-none z-[100]">
                                    <motion.div
                                        ref={bottomSheetRef}
                                        initial={{ y: 20, opacity: 0, scale: 0.95 }}
                                        animate={{ y: -300, opacity: 1, scale: 1 }}
                                        exit={{ y: 20, opacity: 0, scale: 0.95 }}
                                        className="absolute hidden md:block left-0 w-[360px] bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-2xl pointer-events-auto"
                                    >
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => { setAttachments(p => [...p, { type: 'file', name: 'document.pdf' }]); setIsBottomSheetOpen(false); }} className="flex flex-col items-center gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-3xl active:scale-95 transition-all">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><FileText size={18} /></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">File</span>
                                            </button>
                                            <button onClick={() => { setAttachments(p => [...p, { type: 'image', name: 'image.jpg' }]); setIsBottomSheetOpen(false); }} className="flex flex-col items-center gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-3xl active:scale-95 transition-all">
                                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400"><ImageIcon size={18} /></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Image</span>
                                            </button>
                                            {Object.entries(features).map(([key, active]) => (
                                                <button
                                                    key={key}
                                                    onClick={() => { toggleFeature(key as keyof typeof features); setIsBottomSheetOpen(false); }}
                                                    className={`flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all active:scale-95 ${active ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/[0.01] border-white/5'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-gray-900 text-gray-700'}`}>
                                                        {key === 'thinking' && <Cpu size={16} />}
                                                        {key === 'webSearch' && <Globe size={16} />}
                                                        {key === 'deepResearch' && <Search size={16} />}
                                                        {key === 'studyLearn' && <BookOpen size={16} />}
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-indigo-400' : 'text-gray-600'}`}>{key.replace(/([A-Z])/g, ' $1')}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        <div className="absolute left-3 bottom-0 top-0 flex items-center md:left-5 z-20">
                            <button
                                ref={toggleButtonRef}
                                onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)}
                                className="p-2.5 bg-white/[0.05] md:bg-transparent rounded-xl text-gray-500 hover:text-white transition-all focus:outline-none"
                            >
                                <Plus size={20} className={`transition-transform duration-300 ${isBottomSheetOpen ? 'rotate-45' : ''}`} />
                            </button>
                        </div>

                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleContinueThinking();
                                }
                            }}
                            placeholder=""
                            className="w-full bg-transparent border-none px-14 md:px-16 pt-3 pb-3 md:pt-4 md:pb-4 text-[13px] text-white focus:ring-0 outline-none font-medium resize-none min-h-[54px] md:min-h-[64px] leading-[1.6] scrollbar-hide z-10"
                        />

                        {inputText === "" && (
                            <div className="absolute top-0 bottom-0 flex items-center left-[60px] md:left-[66px] pointer-events-none pr-12 z-0">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={placeholderIndex}
                                        initial={{ y: 2, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -2, opacity: 0 }}
                                        className="text-gray-700 text-[13px] font-medium"
                                    >
                                        {PLACEHOLDERS[placeholderIndex]}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="absolute right-3 bottom-0 top-0 flex items-center md:right-5 z-20">
                            <button className="p-2 text-gray-600 hover:text-white hidden md:block"><Mic size={18} /></button>
                            <Button
                                onClick={handleContinueThinking}
                                disabled={!inputText.trim() || isProcessing}
                                className="w-10 h-10 p-0 bg-white text-black rounded-2xl hover:bg-gray-100 shadow-xl hover:scale-105 transition-all flex items-center justify-center shrink-0 disabled:opacity-10 disabled:scale-100"
                            >
                                <ArrowRight size={20} strokeWidth={3} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Sheet */}
            <AnimatePresence>
                {isBottomSheetOpen && (
                    <div className="md:hidden fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsBottomSheetOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                        />
                        <motion.div
                            ref={bottomSheetRef}
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="relative w-full bg-[#0A0A0A] border border-white/10 rounded-t-[2.5rem] p-8 pb-14 shadow-2xl overflow-hidden pointer-events-auto"
                        >
                            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-10" />
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => { setAttachments(p => [...p, { type: 'file', name: 'document.pdf' }]); setIsBottomSheetOpen(false); }} className="flex flex-col items-center gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl active:scale-95 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><FileText size={18} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Upload File</span>
                                </button>
                                <button onClick={() => { setAttachments(p => [...p, { type: 'image', name: 'image.jpg' }]); setIsBottomSheetOpen(false); }} className="flex flex-col items-center gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl active:scale-95 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400"><ImageIcon size={18} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Upload Image</span>
                                </button>
                                {Object.entries(features).map(([key, active]) => (
                                    <button
                                        key={key}
                                        onClick={() => { toggleFeature(key as keyof typeof features); setIsBottomSheetOpen(false); }}
                                        className={`flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all active:scale-95 ${active ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/[0.01] border-white/5'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-gray-900 text-gray-700'}`}>
                                            {key === 'thinking' && <Cpu size={18} />}
                                            {key === 'webSearch' && <Globe size={18} />}
                                            {key === 'deepResearch' && <Search size={18} />}
                                            {key === 'studyLearn' && <BookOpen size={18} />}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-indigo-400 font-bold' : 'text-gray-600'}`}>{key.replace(/([A-Z])/g, ' $1')}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
