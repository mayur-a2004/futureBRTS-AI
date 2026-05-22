// @ts-nocheck
import { useState, useEffect } from "react";
import { Clock, Zap, ArrowRight, Trash2, Edit2, MessageSquare, Search, RotateCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useModal } from "@/context/ModalContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function History() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const { confirm } = useModal();

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/builder/sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSessions(data.sessions || []);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to load history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleTogglePin = async (id, e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/builder/session/${id}/pin`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSessions(prev => {
                    const updated = prev.map(s => s._id === id ? { ...s, isPinned: data.isPinned } : s);
                    return [...updated].sort((a, b) => {
                        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
                        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
                    });
                });
                toast.success(data.isPinned ? "Thread Pinned" : "Thread Unpinned");
                window.dispatchEvent(new CustomEvent('fb-refresh-sessions'));
            }
        } catch (e) {
            toast.error("Pin failed.");
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        const confirmed = await confirm({
            title: "Delete Permenantly?",
            message: "This session will be erased from the neural bank forever. Are you sure?",
            confirmText: "Delete",
            cancelText: "Keep"
        });

        if (!confirmed) return;

        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/builder/session/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSessions(prev => prev.filter(s => s._id !== id));
                toast.success("Session deleted successfully.");
                // Trigger global refresh for sidebar
                window.dispatchEvent(new CustomEvent('fb-refresh-sessions'));
            }
        } catch (e) {
            toast.error("Delete failed.");
        }
    };

    const handleOpen = (id) => {
        localStorage.setItem('fbrts_active_session', id);
        navigate(`/builder?sessionId=${id}`);
    };

    const filteredSessions = sessions.filter(s =>
        (s.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white">
                        Intelligence <span className="text-indigo-500">Bank</span>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-md">Access your archived neural threads and strategic roadmaps.</p>
                </div>

                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search threads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Content List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-4">
                        <RotateCw size={40} className="text-indigo-500 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Retrieving Neural Logs</span>
                    </div>
                ) : filteredSessions.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {filteredSessions.map((session, idx) => (
                            <motion.div
                                key={session._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleOpen(session._id)}
                                className="group relative p-6 rounded-[2rem] bg-gradient-to-r from-white/[0.03] to-transparent border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all cursor-pointer flex flex-col md:flex-row md:items-center gap-6"
                            >
                                <div className="relative shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-indigo-500/20">
                                        <MessageSquare size={24} />
                                    </div>
                                    {session.isPinned && (
                                        <div className="absolute -top-2 -right-2 bg-black border border-indigo-500/30 rounded-full p-1.5 shadow-xl">
                                            <Pin size={12} className="text-indigo-400 fill-indigo-400" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-xl text-white group-hover:text-indigo-400 transition-colors truncate max-w-md">
                                            {session.title || "Untitled Strategic Session"}
                                        </h3>
                                        {session.hasRoadmap && (
                                            <div className="p-1 px-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                                <Zap size={8} /> Roadmap Live
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-700" /> {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span>{session.messages?.length || 0} Neural Conversions</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => handleTogglePin(session._id, e)}
                                        className={`p-3 rounded-xl transition-all ${session.isPinned ? 'text-indigo-400 opacity-100 bg-indigo-500/10' : 'text-gray-600 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/5'}`}
                                        title={session.isPinned ? "Unpin Session" : "Pin Session"}
                                    >
                                        <Pin size={20} className={session.isPinned ? 'fill-indigo-400' : ''} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(session._id, e)}
                                        className="p-3 rounded-xl hover:bg-red-500/10 text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Session"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all duration-500 group-hover:translate-x-1">
                                        <ArrowRight size={20} className="text-gray-700 group-hover:text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="py-40 flex flex-col items-center text-center space-y-6 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/[0.01]">
                        <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center text-gray-700">
                            <Clock size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">No intelligence history found.</h2>
                            <p className="text-gray-500 max-w-xs mx-auto">Initialize your first strategic thread to begin mapping your future roadmap.</p>
                        </div>
                        <button
                            onClick={() => navigate('/builder')}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                        >
                            Start New Exploration
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

