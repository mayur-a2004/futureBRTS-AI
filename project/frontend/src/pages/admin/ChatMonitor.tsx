import { useState, useEffect } from 'react';
import {
    MessageSquare,
    Search,
    Clock,
    User,
    Shield,
    TrendingUp,
    ChevronRight,
    ExternalLink,
    Loader2,
    Activity,
    Brain
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatMonitor() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/chats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSessions(data.logs);
            }
        } catch (err) {
            toast.error("Telemetry link failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSessionFull = async (sessionId: string) => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/admin/session/${sessionId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSelectedSession(data.session);
            }
        } catch (err) {
            toast.error("Neural probe failed.");
        }
    };

    const filteredSessions = sessions.filter(s =>
        (s.user || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.lastMessage || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Neural Chat Monitor</h1>
                    <p className="text-gray-400 mt-1 font-medium">Observe real-time neural exchanges and user intent patterns.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Surveillance</span>
                    </div>
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400" size={18} />
                <input
                    type="text"
                    placeholder="Search for user email, session ID, or neural content..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing with Neural Core...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSessions.map((s) => (
                        <div
                            key={s.id}
                            onClick={() => fetchSessionFull(s.id)}
                            className="p-6 rounded-[32px] bg-white/[0.01] border border-white/5 hover:border-indigo-500/30 transition-all group cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink size={14} className="text-indigo-400" />
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                                    <User size={20} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white">{s.user || 'Guest Identity'}</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{s.email || 'Encrypted'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs text-gray-400 line-clamp-2 font-medium bg-white/[0.02] p-3 rounded-xl border border-white/5 italic">
                                    "{s.lastMessage}"
                                </p>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-[9px] font-black text-gray-500 uppercase">
                                            <MessageSquare size={10} /> {s.messageCount} units
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] font-black text-gray-500 uppercase">
                                            <Clock size={10} /> {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-500'}`}>
                                        {s.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Neural Probe Modal */}
            <AnimatePresence>
                {selectedSession && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                            onClick={() => setSelectedSession(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-5xl h-full bg-[#0a0a0b] border border-white/10 rounded-[48px] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-black shadow-lg shadow-indigo-500/20">
                                        <Brain size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tighter">Neural Probe: {selectedSession.title || 'Live Session'}</h2>
                                        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">Subject: {(selectedSession.userId as any)?.email || 'Guest'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="px-6 py-2.5 bg-rose-500 group text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-rose-400 transition-all flex items-center gap-2">
                                        <Shield size={14} className="group-hover:rotate-12 transition-transform" /> Intercept
                                    </button>
                                    <button onClick={() => setSelectedSession(null)} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white">
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar bg-black/40">
                                {selectedSession.messages.map((m: any, i: number) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-2xl p-6 rounded-[32px] ${m.role === 'user' ? 'bg-white text-black font-bold' : 'bg-white/[0.03] border border-white/5 text-gray-300'}`}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                            <div className={`mt-3 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest ${m.role === 'user' ? 'text-black/40' : 'text-gray-600'}`}>
                                                <Clock size={10} /> {new Date(m.timestamp || selectedSession.updatedAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={16} className="text-emerald-400" />
                                        <span className="text-[10px] font-black text-gray-500 uppercase">Intent Score: 94%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Activity size={16} className="text-indigo-400" />
                                        <span className="text-[10px] font-black text-gray-500 uppercase">Model: Groq-L3-70B</span>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">End of Neural Stream</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
