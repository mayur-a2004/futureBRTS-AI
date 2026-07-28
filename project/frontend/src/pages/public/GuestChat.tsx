import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import UniverseBackground from "@/components/ui/UniverseBackground"
import axios from "axios"
import { MessageBubble } from "@/components/chat/MessageBubble"

interface Message {
    role: 'user' | 'assistant';
    content: string;
    suggestions?: string[];
}

export default function GuestChat() {
    const navigate = useNavigate();
    const location = useLocation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [activeSymbol, setActiveSymbol] = useState<'/' | '@' | '#' | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    const scrollRef = useRef<HTMLDivElement>(null);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getGuestSessionId = () => {
        let id = sessionStorage.getItem('fbrts_guest_session_id');
        if (!id) {
            id = 'guest_sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
            sessionStorage.setItem('fbrts_guest_session_id', id);
        }
        return id;
    };

    const handleSend = async (e: React.FormEvent | null, directMessage?: string) => {
        if (e) e.preventDefault();
        const content = directMessage || input;
        if (!content.trim() || isTyping) return;

        const userMsg: Message = { role: 'user', content };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:7001';
            const res = await axios.post(`${API_URL}/api/guest/chat`, {
                message: content,
                history: messages.concat(userMsg),
                guestSessionId: getGuestSessionId()
            });

            if (res.data?.success) {
                let rawContent = res.data.response || "⚠️ The AI returned an empty response. Please try again.";
                let suggestions: string[] = [];

                if (rawContent.includes('||SUGGESTIONS_JSON||')) {
                    const parts = rawContent.split('||SUGGESTIONS_JSON||');
                    rawContent = parts[0].trim();
                    try {
                        suggestions = JSON.parse(parts[1].trim());
                    } catch (e) {
                        console.error("Suggestions parse error", e);
                    }
                }

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: rawContent,
                    suggestions: suggestions.length > 0 ? suggestions : ["EXPLORE CODING TOPICS", "DISCUSS BUSINESS IDEAS", "LEARN ABOUT AI"]
                }]);
            }
        } catch (err) {
            console.error("Guest Chat Error:", err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "🚀 **System Alert**: Neural link interrupted. Please try again later. 🧠"
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const hasInited = useRef(false);
    useEffect(() => {
        if (hasInited.current) return;
        const state = location.state as { initialPrompt?: string };
        if (state?.initialPrompt) {
            hasInited.current = true;
            handleSend(null, state.initialPrompt);
        }
    }, [location.state]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div className="relative h-screen bg-black text-white selection:bg-indigo-500/30 overflow-hidden flex flex-col font-sans">
            {/* Universal Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <UniverseBackground intensity={0.4} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
            </div>

            {/* Header */}
            <header className="relative z-20 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                        <span className="font-black text-xl italic tracking-tighter text-white">F</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black tracking-widest text-[#00ff88] uppercase">GUEST MODE</span>
                        <span className="text-[10px] font-bold text-gray-500">{currentTime}</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <button onClick={() => navigate('/auth/login')} className="text-xs font-black tracking-widest text-gray-400 hover:text-white transition-colors uppercase">LOGIN</button>
                    <button
                        onClick={() => navigate('/auth/register')}
                        className="px-6 py-2.5 bg-white text-black text-xs font-black tracking-widest rounded-full hover:bg-gray-200 transition-all uppercase"
                    >
                        SIGN UP
                    </button>
                </div>
            </header>

            {/* Main Chat Area */}
            <main ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-6 md:px-0 scrollbar-hide pt-2">
                <div className="max-w-4xl mx-auto space-y-4 pb-14">
                    <AnimatePresence>
                        {messages.length === 0 && !isTyping && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8 opacity-20">
                                <Sparkles size={40} className="text-indigo-500 mb-4" />
                                <h1 className="text-4xl font-black italic tracking-tighter uppercase">Initializing Consciousness...</h1>
                                <p className="text-sm font-medium tracking-wide">Enter a command to begin your journey.</p>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <MessageBubble
                                    role={msg.role}
                                    content={msg.content}
                                    suggestions={msg.suggestions}
                                    onSuggestionClick={(s) => handleSend(null, s)}
                                />
                            </motion.div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-4 items-start">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                                    <span className="font-black text-lg italic tracking-tighter text-indigo-400 animate-pulse">F</span>
                                </div>
                                <div className="flex gap-1 items-center p-3.5 bg-[#1a1a1a]/40 rounded-3xl border border-white/5">
                                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0s]" />
                                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Input Bar Section */}
            <footer className="relative z-30 px-8 py-4 flex flex-col items-center gap-3">
                <div className="w-full max-w-4xl relative">
                    {/* ⚡ SMART SYMBOL POPUP MATRIX (/, @, #) FOR GUEST CHAT */}
                    {activeSymbol && (
                        <div className="absolute bottom-[calc(100%+12px)] left-4 bg-[#111113]/95 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,1)] p-2 w-[320px] max-h-[320px] overflow-y-auto z-50 font-sans backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2">
                            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 border-b border-white/5 mb-1 flex items-center justify-between">
                                <span>{activeSymbol === '/' ? '⚡ Slash Commands' : activeSymbol === '@' ? '🌐 AI Tools & Mentions' : '🏷️ Educational Standards'}</span>
                                <span className="text-gray-500 font-normal">Esc to close</span>
                            </div>
                            {activeSymbol === '/' && (
                                <div className="space-y-1">
                                    {[
                                        { label: '3D Science Lab', desc: 'Open Virtual Lab', icon: '🔬', tag: '/lab' },
                                        { label: 'Generate NCERT Exam', desc: 'AI Quiz Creator', icon: '📄', tag: '/exam' },
                                        { label: 'Deep Thinking Mode', desc: 'For detailed answers', icon: '💡', tag: '/think' }
                                    ].map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                const words = input.split(/\s+/);
                                                words.pop();
                                                setInput((words.join(' ') + ' ' + item.tag).trim() + ' ');
                                                setActiveSymbol(null);
                                            }}
                                            className="flex items-center gap-3 w-full px-3 py-2 text-xs text-white hover:bg-white/10 rounded-xl transition-all text-left group"
                                        >
                                            <span className="text-base">{item.icon}</span>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-indigo-300 transition-colors">{item.label}</div>
                                                <div className="text-[10px] text-gray-400">{item.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {activeSymbol === '@' && (
                                <div className="space-y-1">
                                    {[
                                        { tag: '@web', label: 'Web Search & Scrape', desc: 'Find real-time news & sources', icon: '🌐' },
                                        { tag: '@image', label: 'Create Image', desc: 'Visualize anything', icon: '🎨' },
                                        { tag: '@math', label: 'Desmos Math Grapher', desc: 'Interactive equations', icon: '📊' },
                                        { tag: '@3d', label: '3D Science Lab Viewer', desc: 'Biology & Chemistry 3D', icon: '🧬' },
                                        { tag: '@news', label: 'Live News Bulletin', desc: 'Real-time Indian & Global news', icon: '📰' }
                                    ].map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                const words = input.split(/\s+/);
                                                words.pop();
                                                setInput((words.join(' ') + ' ' + item.tag).trim() + ' ');
                                                setActiveSymbol(null);
                                            }}
                                            className="flex items-center gap-3 w-full px-3 py-2 text-xs text-white hover:bg-white/10 rounded-xl transition-all text-left group"
                                        >
                                            <span className="text-base">{item.icon}</span>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-indigo-300 transition-colors">{item.label}</div>
                                                <div className="text-[10px] text-gray-400">{item.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {activeSymbol === '#' && (
                                <div className="space-y-1">
                                    {[
                                        { tag: '#NCERTClass10', label: 'NCERT Class 10', desc: 'Official CBSE Standard', icon: '📘' },
                                        { tag: '#JEE2026', label: 'JEE Advanced', desc: 'High-difficulty engineering prep', icon: '⚡' },
                                        { tag: '#NEETBiology', label: 'NEET Medical', desc: 'Medical entrance standard', icon: '🩺' },
                                        { tag: '#CBSEBoard', label: 'CBSE Curriculum', desc: 'School board guidelines', icon: '🎓' }
                                    ].map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                const words = input.split(/\s+/);
                                                words.pop();
                                                setInput((words.join(' ') + ' ' + item.tag).trim() + ' ');
                                                setActiveSymbol(null);
                                            }}
                                            className="flex items-center gap-3 w-full px-3 py-2 text-xs text-white hover:bg-white/10 rounded-xl transition-all text-left group"
                                        >
                                            <span className="text-base">{item.icon}</span>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-indigo-300 transition-colors">{item.label}</div>
                                                <div className="text-[10px] text-gray-400">{item.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <form
                        onSubmit={handleSend}
                        className="relative bg-[#0d0d0d]/90 border border-white/10 rounded-[1.8rem] p-1 pr-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-3xl focus-within:border-indigo-500/20 transition-all"
                    >
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={e => {
                                    const val = e.target.value;
                                    setInput(val);
                                    const lastWord = val.split(/\s+/).pop() || '';
                                    if (lastWord.startsWith('/') && lastWord.length <= 4) setActiveSymbol('/');
                                    else if (lastWord.startsWith('@') && lastWord.length <= 4) setActiveSymbol('@');
                                    else if (lastWord.startsWith('#') && lastWord.length <= 4) setActiveSymbol('#');
                                    else setActiveSymbol(null);
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Escape') setActiveSymbol(null);
                                }}
                                placeholder="Message Future BRTS... (Type / for actions, @ for tools, # for subjects)"
                                className="flex-1 bg-transparent border-none py-3 px-6 text-sm md:text-base text-white font-medium focus:ring-0 outline-none placeholder:text-gray-800"
                            />
                            <div className="flex items-center gap-2">
                                <div className="w-px h-5 bg-white/5 mx-1" />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="w-9 h-9 bg-[#161616] hover:bg-white hover:text-black disabled:opacity-20 rounded-full flex items-center justify-center transition-all shadow-xl group"
                                >
                                    <Send size={16} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </footer>
        </div>
    )
}
