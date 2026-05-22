import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Copy, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import UniverseBackground from "@/components/ui/UniverseBackground"
import axios from "axios"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    const scrollRef = useRef<HTMLDivElement>(null);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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
                history: messages.concat(userMsg)
            });

            if (res.data?.success) {
                let rawContent = res.data.response || "Bhai, AI ne kutch response nahi diya.";
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
                                className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end items-start' : 'items-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="relative shrink-0 mt-1">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                                            <span className="font-black text-lg italic tracking-tighter text-indigo-400">F</span>
                                        </div>
                                    </div>
                                )}

                                <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end max-w-[80%]' : 'max-w-[85%]'}`}>
                                    <div className={`p-4 rounded-[1.5rem] text-sm md:text-[14px] leading-[1.5] whitespace-pre-wrap ${msg.role === 'assistant'
                                        ? 'text-gray-200'
                                        : 'bg-[#1a1a1a]/80 border border-white/5 text-gray-100 shadow-xl backdrop-blur-sm px-5'
                                        }`}>
                                        {msg.role === 'assistant' ? (
                                            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-2.5 prose-strong:text-white prose-strong:font-black prose-ul:list-disc prose-ul:pl-4 prose-li:mb-1 prose-code:text-indigo-300">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                            </div>
                                        ) : msg.content}
                                    </div>

                                    {msg.role === 'assistant' && (
                                        <div className="flex flex-col gap-3 mt-0.5">
                                            <div className="flex items-center gap-3 px-1">
                                                <button className="text-gray-700 hover:text-white transition-colors" title="Copy"><Copy size={13} /></button>
                                                <button className="text-gray-700 hover:text-white transition-colors"><ThumbsUp size={13} /></button>
                                                <button className="text-gray-700 hover:text-white transition-colors"><ThumbsDown size={13} /></button>
                                            </div>

                                            {msg.suggestions && msg.suggestions.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {msg.suggestions.map((s, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleSend(null, s)}
                                                            className="px-5 py-1.5 rounded-full bg-[#1a1a1a]/40 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-[9px] font-black tracking-widest text-gray-500 hover:text-white transition-all uppercase"
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-9 h-9 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center shrink-0 shadow-lg mt-1">
                                        <span className="text-[10px] font-black text-gray-500">G</span>
                                    </div>
                                )}
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
                    <form
                        onSubmit={handleSend}
                        className="relative bg-[#0d0d0d]/90 border border-white/10 rounded-[1.8rem] p-1 pr-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-3xl focus-within:border-indigo-500/20 transition-all"
                    >
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Message Future BRTS..."
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
