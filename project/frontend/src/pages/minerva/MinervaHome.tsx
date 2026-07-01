import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Loader2, Map, CheckSquare,
    FileText, GraduationCap, Award, RefreshCw, Send, Languages,
    Atom, Landmark, Zap, Dna, Brain, ChevronRight, Mic, Plus,
    Volume2, VolumeX, Menu
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DynamicLabEngine } from './labs/DynamicLabEngine';
import { SUBJECT_COLORS, SUBJECT_ICONS, LabConfig } from './labs/types/LabConfig';



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

    // Voice / TTS States
    const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
    const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        return localStorage.getItem('minerva_tts_muted') === 'true';
    });
    const isMutedRef = useRef(isMuted);
    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    const toggleGlobalMute = () => {
        const nextMuteState = !isMuted;
        setIsMuted(nextMuteState);
        localStorage.setItem('minerva_tts_muted', String(nextMuteState));
        if (nextMuteState) {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            setIsSpeaking(null);
        }
    };


    const speakText = (text: string, msgId: string, forcedLang?: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        
        if (isMutedRef.current || !text) return;
        
        setIsSpeaking(msgId);

        const cleanText = text
            .replace(/[*#`_\-]/g, '')
            .replace(/\[.*?\]\(.*?\)/g, '')
            .replace(/\$\$[\s\S]*?\$\$/g, '')
            .replace(/\$[\s\S]*?\$/g, '')
            .trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        const voices = window.speechSynthesis.getVoices();
        
        let langCode = 'en';
        let fullLangTag = 'en-US';
        const activeLang = forcedLang || (speechLang === 'en-IN' ? 'en' : 'hi');
        
        if (activeLang === 'hindi' || activeLang === 'hinglish' || activeLang === 'hi') {
            langCode = 'hi';
            fullLangTag = 'hi-IN';
        } else if (activeLang === 'marathi' || activeLang === 'mr') {
            langCode = 'mr';
            fullLangTag = 'mr-IN';
        } else if (activeLang === 'gujarati' || activeLang === 'gu') {
            langCode = 'gu';
            fullLangTag = 'gu-IN';
        } else if (activeLang === 'spanish' || activeLang === 'es') {
            langCode = 'es';
            fullLangTag = 'es-ES';
        } else if (activeLang === 'bengali' || activeLang === 'bn') {
            langCode = 'bn';
            fullLangTag = 'bn-IN';
        } else if (activeLang === 'tamil' || activeLang === 'ta') {
            langCode = 'ta';
            fullLangTag = 'ta-IN';
        } else if (activeLang === 'telugu' || activeLang === 'te') {
            langCode = 'te';
            fullLangTag = 'te-IN';
        } else if (activeLang === 'kannada' || activeLang === 'kn') {
            langCode = 'kn';
            fullLangTag = 'kn-IN';
        } else if (activeLang === 'punjabi' || activeLang === 'pa') {
            langCode = 'pa';
            fullLangTag = 'pa-IN';
        } else if (activeLang === 'en' || activeLang === 'en-IN') {
            langCode = 'en';
            fullLangTag = 'en-IN';
        }

        utterance.lang = fullLangTag;

        const preferredVoice = voices.find(v => v.lang.toLowerCase().includes(langCode)) || 
                               voices.find(v => v.lang.toLowerCase().includes(fullLangTag.toLowerCase())) ||
                               voices.find(v => v.lang.includes('hi') || v.lang.includes('IN')) || 
                               voices.find(v => v.lang.includes('en'));

        const femaleVoice = voices.find(v => v.lang.toLowerCase().includes(langCode) && v.name.toLowerCase().includes('female')) ||
                            voices.find(v => v.lang.toLowerCase().includes(langCode) && (v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('swar') || v.name.toLowerCase().includes('swar-in') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('susan') || v.name.toLowerCase().includes('hazel') || v.name.toLowerCase().includes('zira'))) ||
                            preferredVoice;

        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        utterance.rate = 0.82; // slow female AI voice
        utterance.pitch = 1.1;

        utterance.onend = () => setIsSpeaking(null);
        utterance.onerror = () => setIsSpeaking(null);

        speechUtteranceRef.current = utterance;
        
        setTimeout(() => {
            if (!isMutedRef.current && speechUtteranceRef.current === utterance) {
                window.speechSynthesis.speak(utterance);
            }
        }, 100);
    };

    const stopSpeech = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(null);
    };

    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // ── VIRTUAL LAB STATE ──────────────────────────────────────────
    const [activeLabConfig, setActiveLabConfig] = useState<LabConfig | null>(null);
    const [labPanelOpen, setLabPanelOpen] = useState(false);
    const [labDetached, setLabDetached] = useState(false);


    // Message Translations & Selection States
    const [messageTranslations, setMessageTranslations] = useState<{[msgId: string]: {[lang: string]: string}}>({});
    const [messageSelectedLangs, setMessageSelectedLangs] = useState<{[msgId: string]: string}>({});
    const [translatingMsgId, setTranslatingMsgId] = useState<string | null>(null);

    const translateMessage = async (msgId: string, text: string, lang: string) => {
        setMessageSelectedLangs(prev => ({ ...prev, [msgId]: lang }));
        if (lang === 'original') {
            stopSpeech();
            return;
        }

        if (messageTranslations[msgId]?.[lang]) {
            const cachedText = messageTranslations[msgId][lang];
            speakText(cachedText, msgId, lang);
            return;
        }

        setTranslatingMsgId(msgId);
        try {
            const token = localStorage.getItem('token') || '';
            const res = await minervaApi.translateText(token, text, lang);
            if (res.success && res.translated) {
                setMessageTranslations(prev => ({
                    ...prev,
                    [msgId]: {
                        ...(prev[msgId] || {}),
                        [lang]: res.translated
                    }
                }));
                speakText(res.translated, msgId, lang);
            }
        } catch (err) {
            console.error('[Chat Translation error]', err);
        } finally {
            setTranslatingMsgId(null);
        }
    };

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
                    const signupName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
                    setStudentName(res.profile.name || signupName || user?.name || '');
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
                    // Restore latest virtual lab state from history
                    if (res.messages) {
                        const lastLabMsg = [...res.messages].reverse().find(m => m.metadata?.lab_config);
                        if (lastLabMsg?.metadata?.lab_config) {
                            setActiveLabConfig(lastLabMsg.metadata.lab_config);
                        }
                    }
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

                // Extract & load Virtual Lab Config
                if (res.metadata?.lab_config) {
                    const config = res.metadata.lab_config;
                    setActiveLabConfig(config);
                    if (config.auto_open) {
                        setLabPanelOpen(true);
                    }

                    // Dynamically fetch YouTube video ID if not preset
                    if (config.youtube_query && !config.youtube_video_id) {
                        try {
                            const ytRes = await fetch(`/api/future-education/lab/youtube-search?query=${encodeURIComponent(config.youtube_query)}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const ytData = await ytRes.json();
                            if (ytData.success && ytData.video_id) {
                                setActiveLabConfig((prev: any) => prev ? { ...prev, youtube_video_id: ytData.video_id } : null);
                            }
                        } catch (err) {
                            console.error('Failed to pre-fetch YouTube video ID for lab:', err);
                        }
                    }
                } else {
                    setActiveLabConfig(null);
                    setLabPanelOpen(false);
                }


                // Auto-read response removed (manual play only)


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

    const getTopicSuggestions = () => {
        if (messages.length <= 1) return [];
        
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'student');
        const topicText = (lastUserMsg?.content || '').toLowerCase();

        if (topicText.includes('h2o') || topicText.includes('co2') || topicText.includes('chemical') || topicText.includes('reaction') || topicText.includes('chemistry') || topicText.includes('science') || topicText.includes('biology') || topicText.includes('physics') || topicText.includes('bio') || topicText.includes('mechanic')) {
            return [
                { text: "🧪 Explain the reaction equation step-by-step?", prompt: "Can you explain the chemical reaction equation step-by-step with balanced details?" },
                { text: "🔬 What are the real-world applications of this?", prompt: "What are the real-world applications and daily life examples of this scientific concept?" },
                { text: "📝 Show me 3 practice MCQs on this topic?", prompt: "Show me 3 practice multiple-choice questions (MCQs) with answers to test my understanding of this topic." }
            ];
        }
        
        if (topicText.includes('math') || topicText.includes('equation') || topicText.includes('graph') || topicText.includes('slope') || topicText.includes('geometry') || topicText.includes('algebra') || topicText.includes('statistics') || topicText.includes('calculus')) {
            return [
                { text: "📐 Solve a sample problem step-by-step?", prompt: "Can you show and solve a sample mathematical problem on this topic step-by-step?" },
                { text: "📊 How do we plot this on a graph?", prompt: "How do we plot this equation on a Cartesian graph? Explain the steps." },
                { text: "📝 Test my understanding with a question?", prompt: "Ask me a math practice question on this topic and grade my answer." }
            ];
        }

        if (topicText.includes('account') || topicText.includes('ledger') || topicText.includes('debit') || topicText.includes('credit') || topicText.includes('balance sheet') || topicText.includes('finance') || topicText.includes('economics') || topicText.includes('stat')) {
            return [
                { text: "💵 Explain the Golden Rules of Accounting?", prompt: "Explain the Golden Rules of Accounting with simple real-life examples." },
                { text: "📊 Journal vs Ledger difference?", prompt: "What is the key difference between a Journal entry and a Ledger post? Explain simply." },
                { text: "📝 Give me a transaction to practice debit/credit?", prompt: "Give me a practice business transaction. I will write the debit and credit journal entry, and you can verify it." }
            ];
        }

        return [
            { text: "🧠 Explain this with a simple analogy?", prompt: "Can you explain this concept using a very simple real-world analogy?" },
            { text: "🎯 What is the most common board exam question from this?", prompt: "What is the most common question asked in Gujarat Board / CBSE exams from this topic?" },
            { text: "❓ Ask me a question to test my understanding?", prompt: "Ask me a conceptual question about what we just discussed to test my understanding." }
        ];
    };

    const quickPrompts = [
        { title: 'Class 10 Science Roadmap', prompt: 'Generate a detailed Class 10 Science study roadmap with board patterns, key topics & study times.', icon: Atom, desc: 'Board patterns, key topics & study times', color: 'from-blue-500/10 to-indigo-500/10 border-indigo-500/20 text-indigo-400' },
        { title: 'UPSC General Studies Prep', prompt: 'Generate a roadmap for UPSC General Studies preparation focusing on Indian Polity, History, and Geography.', icon: Landmark, desc: 'Indian Polity, History, and geography', color: 'from-amber-500/10 to-orange-500/10 border-orange-500/20 text-amber-400' },
        { title: 'JEE Physics - Mechanics', prompt: 'Provide a revision roadmap for JEE Physics - Mechanics with key formulas and mock questions practice.', icon: Zap, desc: 'Formulas, mock questions & quick revision', color: 'from-red-500/10 to-orange-500/10 border-red-500/20 text-orange-400' },
        { title: 'NEET Biology - Cell Division', prompt: 'Create a roadmap for NEET Biology starting with Cell Division, providing analogy-rich concepts and diagram breakdowns.', icon: Dna, desc: 'Analogy-rich concepts & diagram breakdowns', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400' }
    ];

    // ── RENDER MESSAGE ────────────────────────────
    const renderMessage = (msg: ChatMessage, idx: number) => {
        const isAI = msg.role === 'minerva';
        const isError = msg.content_type === 'error';

        const msgId = msg._id || String(idx);
        const activeLang = messageSelectedLangs[msgId] || 'original';
        let displayContent = msg.content;
        
        if (activeLang !== 'original' && messageTranslations[msgId]?.[activeLang]) {
            displayContent = messageTranslations[msgId][activeLang];
        }

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

                    {/* AI Speaker Button */}
                    {isAI && !isError && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 gap-1.5 flex-wrap">
                            {/* Premium Language Translator */}
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                <span>🗣️ Translate:</span>
                                <select
                                    value={activeLang}
                                    disabled={translatingMsgId === msgId}
                                    onChange={(e) => translateMessage(msgId, msg.content, e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded-md px-1.5 py-0.5 text-[9px] text-white outline-none focus:border-cyan-500/50 transition-all font-semibold cursor-pointer hover:border-white/20"
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
                                {translatingMsgId === msgId && (
                                    <Loader2 size={10} className="animate-spin text-cyan-400" />
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    if (isSpeaking === msgId) {
                                        stopSpeech();
                                    } else {
                                        const textToSpeak = activeLang !== 'original' && messageTranslations[msgId]?.[activeLang] 
                                            ? messageTranslations[msgId][activeLang] 
                                            : msg.content;
                                        speakText(textToSpeak, msgId, activeLang);
                                    }
                                }}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-95 cursor-pointer
                                    ${isSpeaking === msgId
                                        ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300 animate-pulse'
                                        : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                                    }`}
                                title={isSpeaking === msgId ? "Mute Voice" : "Play Voice"}
                            >
                                {isSpeaking === msgId ? (
                                    <>
                                        <Volume2 size={11} className="text-cyan-400" />
                                        <span>Mute</span>
                                    </>
                                ) : (
                                    <>
                                        <VolumeX size={11} />
                                        <span>Play Voice</span>
                                    </>
                                )}
                            </button>
                        </div>
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
            <header className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-6 py-3 md:py-3.5 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl flex-shrink-0 z-10 shadow-lg gap-3 md:gap-0">
                {/* Top Row on Mobile, Full Left Side on Desktop */}
                <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => window.dispatchEvent(new Event('toggle-mobile-menu'))}
                            className="md:hidden p-2 bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all text-gray-400 hover:text-white flex items-center justify-center active:scale-95 shrink-0"
                            title="Toggle menu"
                        >
                            <Menu size={16} />
                        </button>

                        {/* Brand Title */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] shrink-0">
                                <Brain size={13} className="animate-pulse" />
                            </div>
                            <span className="font-display font-black text-xs tracking-[0.15em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-indigo-200 select-none">
                                Future Education OS
                            </span>
                        </div>
                    </div>

                    {/* New Chat & Sync Buttons on Mobile Right Side */}
                    <div className="flex md:hidden items-center gap-1.5">
                        <button
                            onClick={() => navigate('/future-education')}
                            title="Start a new chat session"
                            className="p-2 bg-[#0D0B1C] hover:bg-[#14102c] border border-indigo-500/35 text-indigo-300 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                        >
                            <Plus size={14} />
                        </button>
                        <button
                            onClick={loadSessionData}
                            title="Sync Chat Data"
                            className="p-2 bg-white/[0.03] hover:bg-white/5 border border-white/5 text-gray-400 hover:text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>

                {/* Badges and Actions Row (Scrollable on Mobile, Flex on Desktop) */}
                <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 max-w-[calc(100%+2rem)] md:max-w-none pb-1.5 md:pb-0 shrink-0">
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02] border border-white/5 select-none text-[9px] font-black text-gray-400 tracking-wider uppercase shrink-0">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span>Minerva Active</span>
                    </div>

                    {profile?.board && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 select-none text-[9px] font-black text-indigo-300 tracking-wider uppercase shrink-0">
                            <span>{profile.grade_level?.replace('_', ' ')} ({profile.board?.toUpperCase()})</span>
                        </div>
                    )}

                    <div className="hidden md:block h-4 w-px bg-white/10 shrink-0" />

                    {/* Dashboard Button */}
                    <button
                        onClick={() => navigate('/future-education/dashboard')}
                        title="View progress analytics dashboard"
                        className="px-3 py-1.5 md:px-3.5 md:py-2 text-[10px] md:text-xs font-bold bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 text-gray-300 hover:text-white rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-md shrink-0"
                    >
                        <Brain size={12} className="text-yellow-400" />
                        <span>Analytics</span>
                    </button>

                    {/* Roadmaps Button */}
                    <button
                        onClick={() => navigate('/future-education/roadmaps')}
                        title="View study roadmaps"
                        className="px-3 py-1.5 md:px-3.5 md:py-2 text-[10px] md:text-xs font-bold bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 text-gray-300 hover:text-white rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-md shrink-0"
                    >
                        <Map size={12} className="text-indigo-400" />
                        <span>Roadmaps</span>
                    </button>

                    {/* Tasks Button */}
                    <button
                        onClick={() => navigate('/future-education/tasks')}
                        title="View daily learning tasks"
                        className="px-3 py-1.5 md:px-3.5 md:py-2 text-[10px] md:text-xs font-bold bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 text-gray-300 hover:text-white rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-md shrink-0"
                    >
                        <CheckSquare size={12} className="text-emerald-400" />
                        <span>Tasks</span>
                    </button>

                    {/* Results Button */}
                    <button
                        onClick={() => navigate('/future-education/results')}
                        title="View academic results transcript"
                        className="px-3 py-1.5 md:px-3.5 md:py-2 text-[10px] md:text-xs font-bold bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 text-gray-300 hover:text-white rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-md shrink-0"
                    >
                        <Award size={12} className="text-purple-400" />
                        <span>Results</span>
                    </button>

                    {/* Global Voice/Mute Toggle */}
                    <button
                        onClick={toggleGlobalMute}
                        title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                        className={`px-3 py-1.5 md:px-3.5 md:py-2 text-[10px] md:text-xs font-bold border rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-md cursor-pointer shrink-0
                            ${isMuted 
                                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20'
                            }`}
                    >
                        {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                        <span>{isMuted ? "Muted" : "Voice On"}</span>
                    </button>

                    <div className="hidden md:block h-4 w-px bg-white/10 mx-1 shrink-0" />

                    {/* New Chat Button - Desktop Only */}
                    <button
                        onClick={() => navigate('/future-education')}
                        title="Start a new chat session"
                        className="hidden md:flex px-4 py-2 text-xs font-black bg-[#0D0B1C] hover:bg-[#14102c] border border-indigo-500/35 hover:border-indigo-500/50 text-indigo-300 rounded-xl transition-all shadow-md active:scale-95 items-center gap-1.5 shrink-0"
                    >
                        <Plus size={13} className="text-indigo-400" />
                        <span>New Chat</span>
                    </button>

                    {/* Sync Button - Desktop Only */}
                    <button
                        onClick={loadSessionData}
                        title="Sync Chat Data"
                        className="hidden md:flex w-8.5 h-8.5 rounded-xl bg-white/[0.03] hover:bg-white/5 border border-white/5 hover:border-indigo-500/25 items-center justify-center transition-all text-gray-400 hover:text-white shadow-md active:scale-95 shrink-0"
                    >
                        <RefreshCw size={13} className="hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </header>

            {/* Main Chat + Lab Workspace Container */}
            <div className="flex-1 flex min-w-0 w-full overflow-hidden relative">
                {/* Left Side: Active Chat Column */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
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
                                        onClick={() => { setInput(''); sendMessage(qp.prompt); }}
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

                    {/* Active Roadmap Suggestions */}
                    {!loading && (
                        <div className="flex flex-wrap gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl">
                            {input.trim().length > 3 && (
                                <button
                                    onClick={() => {
                                        const originalInput = input;
                                        setInput('');
                                        sendMessage(`Create a roadmap for: ${originalInput}`);
                                    }}
                                    className="bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-full px-3.5 py-1.5 text-[10px] font-black text-indigo-300 uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                                >
                                    <span>🗺️</span>
                                    <span>Create Study Roadmap for "{input.substring(0, 30)}{input.length > 30 ? '...' : ''}"</span>
                                </button>
                            )}

                            {messages.length > 1 && (
                                <button
                                    onClick={() => {
                                        const lastUserMsg = [...messages].reverse().find(m => m.role === 'student');
                                        const topicText = lastUserMsg?.content || 'this topic';
                                        sendMessage(`Create a roadmap for: ${topicText}`);
                                    }}
                                    className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-full px-3.5 py-1.5 text-[10px] font-black text-cyan-300 uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                                >
                                    <span>🧭</span>
                                    <span>Generate Roadmap for this topic</span>
                                </button>
                            )}

                            {/* Dynamic LLM-generated or Category-based Suggestions */}
                            {(() => {
                                const lastAIMsg = [...messages].reverse().find(m => m.role === 'minerva' && m.metadata?.suggestions?.length > 0);
                                if (lastAIMsg && lastAIMsg.metadata.suggestions) {
                                    return lastAIMsg.metadata.suggestions.map((sug: string, sIdx: number) => (
                                        <button
                                            key={sIdx}
                                            onClick={() => sendMessage(sug)}
                                            className="bg-[#0f0b24]/80 hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-indigo-300 hover:text-indigo-200 transition-all flex items-center gap-1 shadow-md active:scale-95 cursor-pointer"
                                        >
                                            <span>💡</span>
                                            <span>{sug}</span>
                                        </button>
                                    ));
                                }
                                // Fallback to category-based suggestions
                                return getTopicSuggestions().map((sug, sIdx) => (
                                    <button
                                        key={sIdx}
                                        onClick={() => sendMessage(sug.prompt)}
                                        className="bg-white/[0.02] hover:bg-[#120a2e]/20 border border-white/[0.05] hover:border-indigo-500/25 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-gray-300 hover:text-indigo-200 transition-all flex items-center gap-1 shadow-md active:scale-95 cursor-pointer"
                                    >
                                        <span>{sug.text}</span>
                                    </button>
                                ));
                            })()}

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

                            <div className="ml-auto flex items-center gap-2">
                                {activeLabConfig ? (
                                    <button
                                        onClick={() => setLabPanelOpen(!labPanelOpen)}
                                        className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all active:scale-95 ${
                                            labPanelOpen
                                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                                                : 'bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/20 text-indigo-400/70 hover:text-indigo-300'
                                        }`}
                                        style={labPanelOpen ? {
                                            backgroundColor: `${SUBJECT_COLORS[activeLabConfig.subject]?.accent}20`,
                                            borderColor: `${SUBJECT_COLORS[activeLabConfig.subject]?.accent}80`,
                                            color: SUBJECT_COLORS[activeLabConfig.subject]?.accent,
                                            boxShadow: `0 0 10px ${SUBJECT_COLORS[activeLabConfig.subject]?.accent}30`
                                        } : {
                                            borderColor: `${SUBJECT_COLORS[activeLabConfig.subject]?.accent}30`,
                                            color: SUBJECT_COLORS[activeLabConfig.subject]?.accent
                                        }}
                                        title={`Toggle ${activeLabConfig.subject} Virtual Lab`}
                                    >
                                        <span>{SUBJECT_ICONS[activeLabConfig.subject] || '🧪'}</span>
                                        <span className="capitalize">{activeLabConfig.subject} Lab</span>
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="flex items-center gap-1.5 border border-white/5 bg-white/5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-gray-600 cursor-not-allowed"
                                        title="Ask a topic query to unlock the Virtual Lab"
                                    >
                                        <span>🧪</span>
                                        <span>Virtual Lab</span>
                                    </button>
                                )}
                            </div>

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
        </div>

        {/* Dynamic Virtual Lab Engine (Side or Detached) */}
        <DynamicLabEngine
            labConfig={activeLabConfig}
            isOpen={labPanelOpen}
            onClose={() => setLabPanelOpen(false)}
            isDetached={labDetached}
            onToggleDetach={() => setLabDetached(!labDetached)}
            isMuted={isMuted}
        />
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

