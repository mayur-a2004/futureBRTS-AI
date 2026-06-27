import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Loader2, Map, CheckSquare,
    FileText, GraduationCap, Award, RefreshCw, Send, Languages,
    Atom, Landmark, Zap, Dna, Brain, ChevronRight, Mic, Plus
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ── TYPES ────────────────────────────────────────
interface ChatMessage {
    _id?: string;
    role: 'student' | 'minerva';
    content: string;
    content_type: string;
    metadata?: any;
    createdAt?: string;
}

// ── COMPONENT ────────────────────────────────────
const MinervaHome: React.FC = () => {
    const { user, token } = useAuth() as any;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeSessionId = searchParams.get('sessionId') || '';
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ name: string; text: string } | null>(null);
    const [isDeepStudy, setIsDeepStudy] = useState(false);
    const [showHoloAlert, setShowHoloAlert] = useState(false);

    // Onboarding Form States
    const [profile, setProfile] = useState<any>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [standard, setStandard] = useState('class_10');
    const [board, setBoard] = useState('cbse');
    const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);

    const [isListening, setIsListening] = useState(false);
    const [speechLang, setSpeechLang] = useState<'en-IN' | 'hi-IN'>('hi-IN');
    const recognitionRef = useRef<any>(null);
    const initialTextRef = useRef<string>('');
    const hasTranscribedRef = useRef<boolean>(false);
    const sessionTranscriptRef = useRef<string>('');
    const switchingLangRef = useRef<boolean>(false);

    useEffect(() => {
        if (isDeepStudy) {
            setShowHoloAlert(true);
            const timer = setTimeout(() => setShowHoloAlert(false), 2500);
            return () => clearTimeout(timer);
        }
    }, [isDeepStudy]);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    console.error(e);
                }
            }
        };
    }, []);

    const stopListening = (shouldSend = true) => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error(e);
            }
        }
        setIsListening(false);

        if (shouldSend && hasTranscribedRef.current) {
            const textToSend = initialTextRef.current + (initialTextRef.current ? ' ' : '') + sessionTranscriptRef.current;
            if (textToSend.trim()) {
                sendMessage(textToSend);
            }
            hasTranscribedRef.current = false;
            sessionTranscriptRef.current = '';
        }
    };

    const startListening = (langToUse = speechLang) => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
            return;
        }

        try {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {}
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = langToUse;

            initialTextRef.current = input;
            hasTranscribedRef.current = false;
            sessionTranscriptRef.current = '';
            switchingLangRef.current = false;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    alert("Microphone access was denied. Please allow microphone permissions in your browser settings.");
                }
                stopListening(false);
            };

            recognition.onend = () => {
                if (recognitionRef.current === recognition) {
                    setIsListening(prevListening => {
                        if (prevListening && !switchingLangRef.current) {
                            setTimeout(() => {
                                if (hasTranscribedRef.current) {
                                    const textToSend = initialTextRef.current + (initialTextRef.current ? ' ' : '') + sessionTranscriptRef.current;
                                    if (textToSend.trim()) {
                                        sendMessage(textToSend);
                                    }
                                    hasTranscribedRef.current = false;
                                    sessionTranscriptRef.current = '';
                                }
                            }, 50);
                        }
                        return false;
                    });
                }
            };

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i] && event.results[i][0]) {
                        const text = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += text;
                        } else {
                            interimTranscript += text;
                        }
                    }
                }

                const fullTranscript = finalTranscript + interimTranscript;
                if (fullTranscript) {
                    hasTranscribedRef.current = true;
                    sessionTranscriptRef.current = fullTranscript;
                    const currentInitial = initialTextRef.current;
                    setInput(currentInitial + (currentInitial ? ' ' : '') + fullTranscript);
                }
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error('Error starting speech recognition:', err);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening(true);
        } else {
            startListening();
        }
    };

    const changeLanguage = (lang: 'en-IN' | 'hi-IN') => {
        setSpeechLang(lang);
        if (isListening) {
            switchingLangRef.current = true;
            stopListening(false);
            setTimeout(() => {
                switchingLangRef.current = false;
                startListening(lang);
            }, 100);
        }
    };

    // ── PARSE URL PARAMETERS (DOUBT SHORTCUTS) ────
    useEffect(() => {
        const askDoubt = searchParams.get('askDoubt');
        if (askDoubt) {
            setInput(askDoubt);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 250);
        }
    }, [searchParams]);

    // ── LOAD INITIAL DATA ─────────────────────────
    useEffect(() => {
        if (!token) return;
        loadSessionData();
        checkProfileOnboarding();
    }, [token, activeSessionId]);

    const checkProfileOnboarding = async () => {
        try {
            const res = await minervaApi.getProfile(token);
            if (res.success && res.profile) {
                setProfile(res.profile);
                if (!res.profile.onboarding_done) {
                    setShowOnboarding(true);
                    setStudentName(res.profile.name || user?.name || '');
                    setSchoolName(res.profile.school_name || '');
                    setMobileNumber(res.profile.mobile_number || '');
                    setStandard(res.profile.grade_level || 'class_10');
                    setBoard(res.profile.board || 'cbse');
                }
            }
        } catch (err) {
            console.error("Failed to check profile onboarding status:", err);
        }
    };

    const handleSaveOnboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName.trim() || !schoolName.trim() || !mobileNumber.trim()) {
            alert("Please fill all required fields.");
            return;
        }
        setOnboardingSubmitting(true);
        try {
            const res = await minervaApi.updateProfile(token, {
                name: studentName,
                school_name: schoolName,
                mobile_number: mobileNumber,
                grade_level: standard,
                board: board,
                learning_style: 'mixed',
                daily_time_minutes: 60,
            });
            if (res.success) {
                setProfile(res.profile);
                setShowOnboarding(false);
            } else {
                alert(res.error || "Failed to save profile details");
            }
        } catch (err) {
            console.error("Failed to update onboarding profile:", err);
            alert("Error saving onboarding details.");
        } finally {
            setOnboardingSubmitting(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadSessionData = async () => {
        setLoading(true);
        try {
            if (activeSessionId) {
                const res = await minervaApi.getChatSessionMessages(token, activeSessionId);
                if (res.success) {
                    setMessages(res.messages || []);
                } else {
                    setMessages([]);
                }
            } else {
                // Welcome message in English by default for new chats
                setMessages([{
                    role: 'minerva',
                    content: `Welcome to **Future Education OS**! 🎓\n\nI am your AI Personal Tutor. I communicate in **English by default**, but you can speak or ask to learn in any language (Hindi, Hinglish, Marathi, Gujarati, etc.) at any time — just ask!\n\n**How we can help you today:**\n• **Ask doubts** on any subject from Class 1 to 12, Masters, or PhD research.\n• **Upload PDF notes** or **textbook photos** (scans) for automatic curriculum analysis.\n• **Generate custom roadmaps** and target weak topics with **daily homework**.\n\nType a topic below or click a quick action to get started! 🚀`,
                    content_type: 'text',
                }]);
            }
        } catch (err) {
            console.error('Error loading chat session messages:', err);
        } finally {
            setLoading(false);
        }
    };

    // ── FILE UPLOAD ───────────────────────────────
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/future-education/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setUploadedFile({
                    name: data.filename,
                    text: data.extractedText
                });
            } else {
                alert(data.error || 'File upload failed');
            }
        } catch (err) {
            console.error('File upload error:', err);
            alert('File upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ── SEND MESSAGE ──────────────────────────────
    const sendMessage = async (textToSend?: string | React.MouseEvent) => {
        const currentInput = typeof textToSend === 'string' ? textToSend : input;
        if ((!currentInput.trim() && !uploadedFile) || loading) return;

        stopListening(false);

        let finalContent = currentInput.trim();
        let displayContent = currentInput.trim();

        if (uploadedFile) {
            finalContent = `[Uploaded File: ${uploadedFile.name}]\n\nExtracted Content:\n"""\n${uploadedFile.text}\n"""\n\nStudent Query: ${currentInput.trim() || 'Please explain the uploaded document and generate a study roadmap.'}`;
            displayContent = `📁 ${uploadedFile.name}\n\n${currentInput.trim() || 'Explain this uploaded study material.'}`;
        }

        const userMsg: ChatMessage = { role: 'student', content: displayContent, content_type: 'text' };
        setMessages(prev => [...prev, userMsg]);
        const msgText = finalContent;
        setInput('');
        setUploadedFile(null);
        setLoading(true);

        try {
            const res = await minervaApi.sendChat(token, msgText, undefined, activeSessionId || undefined, isDeepStudy);
            if (res.success) {
                const minervaMsg: ChatMessage = {
                    role: 'minerva',
                    content: res.reply,
                    content_type: res.content_type,
                    metadata: res.metadata,
                };
                setMessages(prev => [...prev, minervaMsg]);

                // Auto-navigate to session if roadmap created
                if (res.content_type === 'roadmap' && res.metadata?.session_id) {
                    setTimeout(() => {
                        navigate(`/future-education/session/${res.metadata.session_id}`);
                    }, 2000);
                }
                
                // Redirection for first message of a new chat session
                if (!activeSessionId && res.chat_session_id) {
                    navigate(`/future-education?sessionId=${res.chat_session_id}`);
                }

                // Refresh layout stats/sessions list
                window.dispatchEvent(new Event('future-education-refresh-sessions'));
            } else {
                setMessages(prev => [...prev, {
                    role: 'minerva',
                    content: res.error || 'Oops! Something went wrong. Please try again.',
                    content_type: 'error',
                }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'minerva',
                content: 'AI teacher ka connection problem hai. Dobara try karo!',
                content_type: 'error',
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickPrompts = [
        { title: 'Class 10 Science Roadmap', icon: Atom, desc: 'Board patterns, key topics & study times', color: 'from-blue-500/10 to-indigo-500/10 border-indigo-500/20 text-indigo-400' },
        { title: 'UPSC General Studies Preparation', icon: Landmark, desc: 'Indian Polity, History, and geography', color: 'from-amber-500/10 to-orange-500/10 border-orange-500/20 text-amber-400' },
        { title: 'JEE Physics - Mechanics Practice', icon: Zap, desc: 'Formulas, mock questions & quick revision', color: 'from-red-500/10 to-orange-500/10 border-red-500/20 text-orange-400' },
        { title: 'NEET Biology - Cell Division', icon: Dna, desc: 'Analogy-rich concepts & diagram breakdowns', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400' }
    ];

    // ── RENDER MESSAGE ────────────────────────────
    const renderMessage = (msg: ChatMessage, idx: number) => {
        const isAI = msg.role === 'minerva';
        const isError = msg.content_type === 'error';

        let displayContent = msg.content;
        // Clean raw uploaded PDF rendering if present in DB
        if (displayContent.startsWith('[Uploaded File:')) {
            const fileMatch = displayContent.match(/\[Uploaded File:\s*(.*?)\]/);
            const queryMatch = displayContent.match(/Student Query:\s*([\s\S]*)$/);
            const filename = fileMatch ? fileMatch[1] : 'File';
            const studentQuery = queryMatch ? queryMatch[1].trim() : 'Explain this uploaded study material.';
            displayContent = `📁 ${filename}\n\n${studentQuery}`;
        }

        return (
            <div key={idx} className={`flex gap-4 mb-6 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 border border-white/10
                    ${isAI 
                        ? isDeepStudy 
                            ? 'bg-gradient-to-br from-cyan-400 via-teal-500 to-indigo-600 shadow-[0_0_15px_rgba(6,182,212,0.4)] text-white' 
                            : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white' 
                        : 'bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-500 text-white'}`}>
                    {isAI ? <GraduationCap size={18} /> : (user?.name?.[0] || 'S')}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap shadow-[0_8px_30px_rgb(0,0,0,0.4)] border backdrop-blur-md transition-all duration-500
                    ${isAI
                        ? isError
                            ? 'bg-red-950/20 border-red-500/30 text-red-200'
                            : isDeepStudy
                                ? 'smart-board-bubble'
                                : 'bg-white/[0.03] border-white/10 text-gray-200 shadow-indigo-500/5'
                        : 'bg-gradient-to-br from-indigo-600/90 via-indigo-700/90 to-purple-800/90 border-indigo-500/30 text-white shadow-purple-500/5'
                    }`}>

                    {isAI && isDeepStudy && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-cyan-500/25 smart-board-title text-cyan-300 text-[10px] uppercase tracking-widest select-none">
                            <Atom size={12} className="animate-spin-slow text-cyan-400" />
                            <span>Minerva Interactive Smartboard Note</span>
                        </div>
                    )}

                    <div className={`prose prose-invert max-w-none text-[13px] space-y-2 [&_p]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-2 [&_strong]:font-bold [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[11px]
                        ${isAI && isDeepStudy
                            ? 'smart-board-content text-[#e2f9f6] [&_strong]:text-cyan-200 [&_code]:bg-cyan-950/40 [&_code]:text-cyan-300 [&_code]:border-cyan-500/10'
                            : 'text-gray-300 [&_strong]:text-white [&_code]:bg-white/10 [&_code]:text-indigo-300'
                        }`}>
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
                            {displayContent}
                        </ReactMarkdown>
                    </div>

                    {/* Roadmap metadata badge */}
                    {msg.content_type === 'roadmap' && msg.metadata && (
                        <div className="mt-4 p-4 bg-indigo-950/30 rounded-xl border border-indigo-500/30 shadow-inner flex flex-col gap-2 backdrop-blur-md">
                            <div className="text-xs text-indigo-300 font-bold flex items-center gap-1.5">
                                <Map size={14} className="animate-pulse" /> Roadmap Created Successfully
                            </div>
                            <div className="text-gray-300 text-xs">{msg.metadata.total_nodes} key chapters • Estimated {msg.metadata.estimated_hours} study hours</div>
                            <button
                                onClick={() => navigate(`/future-education/session/${msg.metadata.session_id}`)}
                                className="mt-1 w-fit text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-indigo-500/20 active:scale-95">
                                View Curriculum Roadmap →
                            </button>
                        </div>
                    )}

                    {/* Homework metadata */}
                    {msg.content_type === 'homework' && msg.metadata && (
                        <button
                            onClick={() => navigate('/future-education/homework')}
                            className="mt-3 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5">
                            <CheckSquare size={14} /> Open Homework Sheet →
                        </button>
                    )}
                    {/* Exam metadata */}
                    {msg.content_type === 'exam_ready' && (
                        <button
                            onClick={() => navigate('/future-education/exams')}
                            className="mt-3 text-xs font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-amber-500/20 active:scale-95 flex items-center gap-1.5">
                            <Award size={14} /> Take Subject Exam →
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full relative bg-transparent overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Classroom Holographic Overlay */}
            <div className={`classroom-overlay ${isDeepStudy ? 'active' : ''}`}>
                <div className="classroom-grid" />
                <div className="classroom-light-beam-1" />
                <div className="classroom-light-beam-2" />
                
                {/* Simulated Floating Classroom Particles */}
                <div className="classroom-dust" style={{ left: '10%', animationDelay: '0s', animationDuration: '12s' }} />
                <div className="classroom-dust" style={{ left: '25%', animationDelay: '3s', animationDuration: '18s' }} />
                <div className="classroom-dust" style={{ left: '40%', animationDelay: '1.5s', animationDuration: '14s' }} />
                <div className="classroom-dust" style={{ left: '55%', animationDelay: '6s', animationDuration: '22s' }} />
                <div className="classroom-dust" style={{ left: '70%', animationDelay: '4.5s', animationDuration: '16s' }} />
                <div className="classroom-dust" style={{ left: '85%', animationDelay: '8s', animationDuration: '20s' }} />
                
                {/* Floating equations/atoms for real study feel */}
                <div className="absolute text-[12px] font-mono text-cyan-500/10 select-none animate-[pulse_4s_infinite]" style={{ top: '15%', left: '15%', transform: 'rotate(-10deg)' }}>E = mc²</div>
                <div className="absolute text-[11px] font-mono text-indigo-500/10 select-none animate-[pulse_5s_infinite]" style={{ top: '45%', right: '20%', transform: 'rotate(15deg)' }}>∫ x² dx = x³/3 + C</div>
                <div className="absolute text-[12px] font-mono text-purple-500/10 select-none animate-[pulse_6s_infinite]" style={{ bottom: '30%', left: '22%', transform: 'rotate(-5deg)' }}>H₂O + CO₂ → H₂CO₃</div>
                <div className="absolute text-[11px] font-mono text-cyan-500/10 select-none animate-[pulse_7s_infinite]" style={{ top: '25%', right: '35%', transform: 'rotate(-15deg)' }}>F = G · (m₁m₂)/r²</div>
            </div>

            {/* Holographic Classroom Alert */}
            <AnimatePresence>
                {showHoloAlert && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute inset-x-0 top-20 z-[100] flex justify-center pointer-events-none px-4"
                    >
                        <div className="bg-cyan-950/80 backdrop-blur-2xl border-2 border-cyan-500/40 px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_40px_rgba(6,182,212,0.4)]">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                            </span>
                            <span className="text-xs font-black text-cyan-300 tracking-[0.2em] uppercase select-none font-display">
                                Holographic Classroom Active
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="hidden md:flex items-center justify-between px-6 py-3.5 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl flex-shrink-0 z-10 shadow-lg">
                {/* Left: Brand Badge & Info */}
                <div className="flex items-center gap-3">
                    {/* Brand Title */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] shrink-0">
                            <Brain size={13} className="animate-pulse" />
                        </div>
                        <span className="font-display font-black text-xs tracking-[0.15em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-indigo-200 select-none">
                            Future Education OS
                        </span>
                    </div>

                    <div className="h-4 w-px bg-white/10" />

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02] border border-white/5 select-none text-[9px] font-black text-gray-400 tracking-wider uppercase">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span>Minerva Active</span>
                    </div>

                    {profile?.board && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 select-none text-[9px] font-black text-indigo-300 tracking-wider uppercase">
                            <span>{profile.grade_level?.replace('_', ' ')} ({profile.board?.toUpperCase()})</span>
                        </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5">
                    {/* Roadmaps Button */}
                    <button
                        onClick={() => navigate('/future-education/roadmaps')}
                        title="View study roadmaps"
                        className="px-3.5 py-2 text-xs font-bold bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 text-gray-300 hover:text-white rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
                    >
                        <Map size={13} className="text-indigo-400" />
                        <span>Roadmaps</span>
                    </button>

                    {/* Tasks Button */}
                    <button
                        onClick={() => navigate('/future-education/tasks')}
                        title="View daily learning tasks"
                        className="px-3.5 py-2 text-xs font-bold bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 text-gray-300 hover:text-white rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
                    >
                        <CheckSquare size={13} className="text-emerald-400" />
                        <span>Tasks</span>
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    {/* New Chat Button */}
                    <button
                        onClick={() => navigate('/future-education')}
                        title="Start a new chat session"
                        className="px-4 py-2 text-xs font-black bg-[#0D0B1C] hover:bg-[#14102c] border border-indigo-500/35 hover:border-indigo-500/50 text-indigo-300 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                        <Plus size={13} className="text-indigo-400" />
                        <span>New Chat</span>
                    </button>

                    {/* Sync Button */}
                    <button
                        onClick={loadSessionData}
                        title="Sync Chat Data"
                        className="w-8.5 h-8.5 rounded-xl bg-white/[0.03] hover:bg-white/5 border border-white/5 hover:border-indigo-500/25 flex items-center justify-center transition-all text-gray-400 hover:text-white shadow-md active:scale-95"
                    >
                        <RefreshCw size={13} className="hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </header>

            {/* Messages Space */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-4">
                {/* Welcome screen — only when no messages */}
                {messages.length <= 1 && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
                        {/* Hero Section */}
                        <div className="text-center py-8 relative bg-cyber-dots rounded-3xl border border-white/[0.02] p-6 shadow-inner overflow-hidden">
                            <div className="absolute inset-0 blueprint-mesh opacity-25 pointer-events-none" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
                            
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-bold tracking-wider uppercase mb-4 shadow-lg">
                                <Brain size={12} className="animate-pulse text-indigo-400" /> 
                                <span className="font-display">Future Education OS</span>
                            </div>
                            <h1 className="text-4xl font-black font-display tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-100 to-indigo-200">
                                Meet Minerva
                            </h1>
                            <p className="text-indigo-300/90 text-sm font-semibold tracking-wide mt-1 uppercase font-display">
                                Your Advanced Personal AI Tutor
                            </p>
                            <p className="text-gray-400 text-xs mt-4 max-w-2xl mx-auto leading-relaxed font-normal">
                                Empowering students through personalized curriculum mappings, textbook scans, handwritten notes, and standard school/college subjects across all Indian state boards, Master's research, and PhD prep.
                            </p>
                        </div>

                        {/* Feature Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-card hover:bg-white/[0.02] border border-white/5 focus-within:border-indigo-500/30 rounded-2xl p-6 transition-all hover:-translate-y-0.5 duration-300 group relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform shadow-md">
                                    <Languages size={20} />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">Language Auto-Switch</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">I teach in English by default. Speak or ask questions in Hindi, Hinglish, or any regional language and I will automatically switch for you!</p>
                            </div>
                            <div className="glass-card hover:bg-white/[0.02] border border-white/5 focus-within:border-indigo-500/30 rounded-2xl p-6 transition-all hover:-translate-y-0.5 duration-300 group relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform shadow-md">
                                    <FileText size={20} />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">Photo & Document Uploads</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">Click the Paperclip button below to upload textbook page photos, notes scans, or research PDFs for analysis.</p>
                            </div>
                        </div>

                        {/* Quick suggestions */}
                        <div className="pt-4">
                            <div className="text-[10px] text-indigo-400/60 font-black uppercase tracking-[0.2em] mb-4 text-center">Suggested Topics to Launch</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickPrompts.map((qp, i) => (
                                    <button key={i}
                                        onClick={() => { setInput(qp.title); inputRef.current?.focus(); }}
                                        className="text-left text-xs bg-[#0b0813]/40 hover:bg-[#120a2e]/40 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-4 transition-all text-gray-300 hover:text-white shadow-xl flex items-start gap-4 hover:-translate-y-1 duration-300 group backdrop-blur-md"
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${qp.color} flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
                                            <qp.icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-200 group-hover:text-white transition-colors flex items-center justify-between">
                                                <span>{qp.title}</span>
                                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 duration-300" />
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-1 leading-relaxed truncate">{qp.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* List of chat bubbles */}
                {messages.map((msg, i) => renderMessage(msg, i))}

                {/* Loading bubble */}
                {loading && (
                    <div className="flex gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md">
                            <Loader2 size={18} className="animate-spin text-white" />
                        </div>
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 max-w-[80%] shadow-xl">
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                            <span className="text-xs text-indigo-300 font-medium">Tutor is analyzing curriculum...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Bottom Input Area */}
            <div className="px-6 pb-3 pt-3 bg-gradient-to-t from-black/95 via-black/90 to-transparent z-10 border-t border-white/[0.04]">
                <div className="max-w-4xl mx-auto">
                    
                    {/* Uploaded attachment indicator */}
                    {uploadedFile && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-950/40 to-purple-950/20 border border-indigo-500/30 rounded-2xl p-3 mb-3 w-fit max-w-full shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-[pulse_2s_infinite]" />
                            <span className="text-xs text-indigo-300 font-medium truncate flex items-center gap-2">
                                <FileText size={14} className="text-indigo-400" />
                                Attachment: {uploadedFile.name}
                            </span>
                            <span className="text-[10px] text-gray-500">Ready to Analyze</span>
                            <button
                                onClick={() => setUploadedFile(null)}
                                className="text-indigo-400 hover:text-indigo-200 transition-colors p-1 rounded-full hover:bg-white/10 ml-2"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    {/* OCR Uploading Progress Card */}
                    {uploading && (
                        <div className="flex items-center gap-3 bg-white/[0.02] border border-dashed border-indigo-500/20 rounded-2xl p-4 mb-3 w-fit max-w-full shadow-xl relative overflow-hidden">
                            {/* Glowing scanner pulse line */}
                            <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent top-0 animate-bounce" />
                            <Loader2 size={16} className="animate-spin text-indigo-400 flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-300 font-bold">Scanning Document...</span>
                                <span className="text-[10px] text-indigo-400/70 mt-0.5">Extracting curriculum pattern & textbook scans</span>
                            </div>
                        </div>
                    )}

                    {/* Styled Card Container */}
                    <div className={`flex flex-col gap-3.5 bg-[#0B0915]/60 border ${isDeepStudy ? 'deep-study-gradient-border deep-study-input-glow border-cyan-500/30' : 'border-white/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.6)]'} rounded-[24px] p-3 backdrop-blur-2xl relative transition-all duration-500`}>
                        {/* Top Row: Mode Toggles */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsDeepStudy(false)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[10px] font-black tracking-wider uppercase
                                    ${!isDeepStudy 
                                        ? 'bg-[#0D0B1C] border border-indigo-500/30 text-indigo-400 shadow-inner' 
                                        : 'bg-white/[0.02] border border-white/5 text-gray-500 hover:text-gray-400'
                                    }`}
                            >
                                <Brain size={11} className={`text-indigo-400 ${!isDeepStudy ? 'animate-pulse' : ''}`} />
                                Minerva Tutor
                            </button>
                            <button
                                onClick={() => setIsDeepStudy(true)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[10px] font-black tracking-wider uppercase
                                    ${isDeepStudy 
                                        ? 'bg-[#0b1624] border border-cyan-500/30 text-cyan-400 shadow-inner' 
                                        : 'bg-white/[0.02] border border-white/5 text-gray-500 hover:text-gray-400'
                                    }`}
                            >
                                <Atom size={11} className={`text-cyan-400 ${isDeepStudy ? 'animate-spin-slow' : ''}`} />
                                Deep Study
                            </button>

                            {isDeepStudy && (
                                <span className="text-[9px] font-black text-cyan-400/80 uppercase tracking-widest animate-pulse ml-auto flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 inline-block"></span>
                                    Deep Mentor Active
                                </span>
                            )}
                        </div>

                        {/* Bottom Row: Controls */}
                        <div className="flex gap-3.5 items-end relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf,image/*"
                                className="hidden"
                            />
                            
                            {/* Circular Plus Attachment Button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading || loading}
                                type="button"
                                title="Attach textbook scan or study PDF"
                                className="flex-shrink-0 w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-white/10 disabled:opacity-40 flex items-center justify-center transition-all text-gray-400 hover:text-white"
                            >
                                <Plus size={16} />
                            </button>

                            {/* Text Area */}
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isDeepStudy ? "Ask a doubt, explain in detail..." : "Ask a doubt or request a topic..."}
                                rows={1}
                                className={`flex-1 bg-transparent resize-none text-sm placeholder-gray-500 outline-none max-h-32 leading-relaxed py-1.5 transition-colors duration-300 scrollbar-hide ${isDeepStudy ? 'text-cyan-100 caret-cyan-400' : 'text-white'}`}
                                style={{ minHeight: '24px' }}
                            />
                            
                            {/* Action Buttons (Send and/or Mic) */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                                {isListening && (
                                    <div className="flex items-center gap-1 bg-[#120e2e]/80 border border-indigo-500/30 rounded-full p-0.5 text-[10px] font-bold text-gray-300 select-none">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                changeLanguage('en-IN');
                                            }}
                                            className={`px-1.5 py-0.5 rounded-full transition-colors ${speechLang === 'en-IN' ? 'bg-indigo-600 text-white font-extrabold' : 'hover:text-white'}`}
                                        >
                                            EN
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                changeLanguage('hi-IN');
                                            }}
                                            className={`px-1.5 py-0.5 rounded-full transition-colors ${speechLang === 'hi-IN' ? 'bg-indigo-600 text-white font-extrabold' : 'hover:text-white'}`}
                                        >
                                            HI
                                        </button>
                                    </div>
                                )}
                                
                                <button
                                    type="button"
                                    title={isListening ? "Stop listening" : "Voice input"}
                                    className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                        isListening 
                                            ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)]' 
                                            : 'bg-transparent hover:bg-white/5 text-gray-500 hover:text-gray-300'
                                    }`}
                                    onClick={toggleListening}
                                >
                                    {isListening && (
                                        <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
                                    )}
                                    <Mic size={14} className={isListening ? 'animate-pulse' : ''} />
                                </button>

                                {(input.trim() || uploadedFile) && (
                                    <button
                                        onClick={sendMessage}
                                        disabled={loading || uploading}
                                        title="Send message"
                                        className={`w-9 h-9 rounded-full ${isDeepStudy ? 'bg-gradient-to-br from-cyan-500 via-teal-600 to-indigo-600' : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600'} hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-md active:scale-95 text-white`}
                                    >
                                        <Send size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* First-time Onboarding Modal */}
            <AnimatePresence>
                {showOnboarding && (
                    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0b0915] border border-indigo-500/30 rounded-[2rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(79,70,229,0.3)] relative overflow-hidden"
                        >
                            {/* Scanning beam animation */}
                            <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent top-0 animate-bounce" />
                            
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white mx-auto shadow-[0_0_20px_rgba(99,102,241,0.4)] mb-4">
                                    <Brain size={24} className="animate-pulse" />
                                </div>
                                <h3 className="text-sm font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 tracking-tight uppercase">Minerva System Initialization</h3>
                                <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider">First-time student profile synchronization</p>
                            </div>

                            <form onSubmit={handleSaveOnboarding} className="space-y-4 text-left">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-indigo-400">Student Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Enter your name" 
                                        value={studentName}
                                        onChange={e => setStudentName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/40"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-indigo-400">School / Institution Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Enter your school name" 
                                        value={schoolName}
                                        onChange={e => setSchoolName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/40"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-indigo-400">Mobile Number (Result Alerts)</label>
                                    <input 
                                        type="tel" 
                                        required
                                        pattern="[0-9]{10}"
                                        placeholder="Enter 10-digit mobile number" 
                                        value={mobileNumber}
                                        onChange={e => setMobileNumber(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/40"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-indigo-400">Standard / Grade</label>
                                        <select 
                                            value={standard} 
                                            onChange={e => setStandard(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => `class_${i + 1}`).map(cls => (
                                                <option key={cls} value={cls}>{cls.replace('_', ' ').toUpperCase()}</option>
                                            ))}
                                            <option value="undergraduate">Undergraduate</option>
                                            <option value="postgraduate">Postgraduate</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-indigo-400">Board / Council</label>
                                        <select 
                                            value={board} 
                                            onChange={e => setBoard(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none"
                                        >
                                            <option value="cbse">CBSE</option>
                                            <option value="gseb">GSEB (Gujarat Board)</option>
                                            <option value="icse">ICSE</option>
                                            <option value="up_board">UP Board</option>
                                            <option value="state_board">Other State Board</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Deep Board preparation warning */}
                                {(standard === 'class_10' || standard === 'class_12') && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-[9px] text-red-300 font-medium leading-normal animate-pulse flex items-start gap-2">
                                        <span className="flex-shrink-0">⚠️</span>
                                        <span>BOARD PREPARATION MODE DETECTED: Minerva will deeply prioritize target board blueprints, syllabus nodes, and exam simulations.</span>
                                    </div>
                                )}

                                <button 
                                    type="submit"
                                    disabled={onboardingSubmitting}
                                    className="w-full mt-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition-all text-xs shadow-lg shadow-indigo-950/20 active:scale-[0.99] flex items-center justify-center gap-1.5"
                                >
                                    {onboardingSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    ) : (
                                        <span>Initialize OS Study Nodes</span>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MinervaHome;
