import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Send, User, Bot, Map, Plus, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from 'react-markdown';

export default function Builder() {
    const { } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [sessions, setSessions] = useState<any[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    // Initial Load: Get Sessions
    useEffect(() => {
        fetchSessions();
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('fb_token');
            const res = await fetch('/api/builder/sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const sessionList = data.sessions || [];
                setSessions(sessionList);
                if (sessionList.length > 0) {
                    // Load most recent if not selected
                    if (!activeSessionId) loadSession(sessionList[0]._id);
                } else {
                    // Create first session automatically if none exist
                    createSession();
                }
            }
        } catch (e) { console.error(e); }
    };

    const loadSession = async (id: string, force = false) => {
        if (activeSessionId === id && !force) return;
        setActiveSessionId(id);
        const token = localStorage.getItem('fb_token');
        try {
            const res = await fetch(`/api/builder/session/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.session.messages);
            }
        } catch (e) { console.error(e); }
    };

    const createSession = async () => {
        // "New Goal" logic
        const intent = localStorage.getItem('fb_intent') || "";
        const onboardingBackupStr = localStorage.getItem('fb_onboarding_backup');

        const isFirst = sessions.length === 0;
        let initialPrompt = "";

        if (isFirst && (intent || onboardingBackupStr)) {
            let context = "";
            if (onboardingBackupStr) {
                try {
                    const backup = JSON.parse(onboardingBackupStr);
                    const stage = backup.stage ? `Current Stage: ${backup.stage}\n` : "";
                    const problems = backup.problems && backup.problems.length > 0 ? `Challenges: ${backup.problems.join(", ")}\n` : "";
                    context = `${stage}${problems}`;
                } catch (e) {
                    console.error("Failed to parse onboarding backup", e);
                }
            }
            initialPrompt = `User Goal: ${intent}\n${context}`.trim();
        } else {
            // For subsequent sessions, we could ask the user for a prompt, 
            // but effectively this creates an empty session or just uses the intent if it lingers.
            // Better to have just empty or "New Session"
            // For now, let's keep it clean:
            initialPrompt = isFirst ? intent : ""; // Fallback if parsing failed or just intent
        }

        // If we constructed a rich prompt, use it.
        const finalPrompt = (isFirst && initialPrompt.length > 5) ? initialPrompt : (intent || "New Strategy Session");

        const title = finalPrompt.length > 30 ? (finalPrompt.substring(0, 30) + "...") : finalPrompt;

        const token = localStorage.getItem('fb_token');
        try {
            const res = await fetch('/api/builder/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ initialPrompt: finalPrompt, title })
            });
            const data = await res.json();
            if (data.success) {
                await fetchSessions();
                loadSession(data.session._id, true);
                if (!isFirst) setSidebarOpen(false); // Auto close sidebar on mobile for new chat

                // Optional: Clear onboarding data after successful create to avoid re-use?
                // localStorage.removeItem('fb_intent');
                // localStorage.removeItem('fb_onboarding_backup');
            }
        } catch (e) { console.error(e); }
    };

    const handleSend = async () => {
        if (!input.trim() || !activeSessionId) return;

        const tempMsg = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, tempMsg]);
        setInput("");
        setLoading(true);

        try {
            const token = localStorage.getItem('fb_token');
            const res = await fetch(`/api/builder/session/${activeSessionId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: tempMsg.content })
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-transparent text-white">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-full md:w-72' : 'w-0'} bg-[#09090b]/80 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col overflow-hidden fixed md:relative z-20 h-full`}>
                <div className="p-4 flex items-center justify-between border-b border-white/5">
                    <span className="font-black text-xs tracking-widest text-gray-500 uppercase">History</span>
                    <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="md:hidden"><X size={16} /></Button>
                </div>

                <div className="p-4">
                    <Button onClick={createSession} className="w-full bg-indigo-600 hover:bg-indigo-700 justify-start gap-2 py-6 rounded-xl font-bold">
                        <Plus size={18} /> New Objective
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sessions.map(s => (
                        <div key={s._id}
                            onClick={() => loadSession(s._id)}
                            className={`p-3 rounded-lg text-sm cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis transition-colors border border-transparent ${activeSessionId === s._id ? 'bg-white/10 text-white border-white/10' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                            {s.title || 'Untitled Session'}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat */}
            <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center px-4 justify-between bg-[#09090b]/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
                            <Menu size={20} />
                        </Button>
                        <span className="font-bold truncate hidden md:block">FutureBuilder Intelligence</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/roadmap')} className="border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 text-xs gap-2">
                            <Map size={14} /> View Roadmap
                        </Button>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                    {messages.length === 0 && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <Bot size={48} className="mb-4" />
                            <p>Ready to architect your future.</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={msg.id || i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                            </div>
                            <div className={`p-4 rounded-2xl max-w-[85%] md:max-w-[70%] leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-[#1a1a1c]/80 backdrop-blur-sm text-gray-200 border border-white/5 rounded-tl-sm'}`}>
                                {msg.role === 'user' ? (
                                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                                ) : (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                p: (props: any) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: (props: any) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                ol: (props: any) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                li: (props: any) => <li className="pl-1" {...props} />,
                                                strong: (props: any) => <strong className="font-bold text-white" {...props} />,
                                            }}
                                        >
                                            {String(msg.content)}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-4 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0"><Bot size={14} /></div>
                            <div className="bg-[#1a1a1c]/80 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-2 border border-white/5">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-[#09090b]/80 backdrop-blur-md border-t border-white/5">
                    <div className="max-w-4xl mx-auto flex gap-4">
                        <input
                            className="flex-1 bg-[#1a1a1c] border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-gray-500 font-medium shadow-inner"
                            placeholder="Type your instruction..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                        />
                        <Button onClick={handleSend} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-xl shadow-lg shadow-indigo-500/20">
                            <Send size={20} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
