import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Zap, LogOut, Clock, Menu, X, MessageSquare, Map, CheckSquare, Edit2, Check, MoreHorizontal, Trash2, Share2, Pin, Archive, FolderInput, Sparkles, PanelLeftClose, PanelLeftOpen, Settings, User, ChevronRight, Briefcase, ShieldCheck, FileText, GraduationCap, Award } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect, useRef } from "react";
import TokenWall from "@/components/economy/TokenWall";
import { useModal } from "@/context/ModalContext";


export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { confirm } = useModal();

    // Session State
    const [sessions, setSessions] = useState<any[]>([]);
    const [futureEdSessions, setFutureEdSessions] = useState<any[]>([]);
    const [futureEdStats, setFutureEdStats] = useState<any>(null);
    const [futureEdCourses, setFutureEdCourses] = useState<any[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const editInputRef = useRef<HTMLInputElement>(null);
    const [isTokenWallOpen, setIsTokenWallOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        return localStorage.getItem('sidebar_collapsed') === 'true';
    });
    const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());

    const isFutureEd = location.pathname.startsWith('/future-education');
    const isMinervaMain = location.pathname === '/future-education' || location.pathname === '/future-education/';
    const isFullHeight = ['/builder', '/roadmap', '/today-task'].includes(location.pathname) || isFutureEd;

    useEffect(() => {
        const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
        window.addEventListener('toggle-mobile-menu', handleToggle);
        return () => window.removeEventListener('toggle-mobile-menu', handleToggle);
    }, []);

    const queryParams = new URLSearchParams(location.search);
    const currentSessionId = queryParams.get('sessionId') || localStorage.getItem('fbrts_active_session') || "";

    const handleTokenWallAction = () => {
        setIsTokenWallOpen(false);
        if (isFutureEd) {
            fetchFutureEdStats();
        }
    };


    useEffect(() => {
        const timer = setInterval(() => {
            setSystemTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem('sidebar_collapsed', String(newState));
    };

    // Initial Load & URL Sync
    useEffect(() => {
        if (isFutureEd) {
            fetchFutureEdSessions();
            fetchFutureEdStats();
            fetchFutureEdCourses();
        } else {
            fetchSessions();
        }
    }, [location.pathname, location.search, isFutureEd]);

    // 🧠 REAL-TIME SYNC: Listen for title changes from Builder
    useEffect(() => {
        const handleRefresh = () => {
            if (isFutureEd) {
                fetchFutureEdSessions();
                fetchFutureEdStats();
                fetchFutureEdCourses();
            } else {
                fetchSessions();
            }
        };
        window.addEventListener('fb-refresh-sessions', handleRefresh);
        window.addEventListener('future-education-refresh-sessions', handleRefresh);
        return () => {
            window.removeEventListener('fb-refresh-sessions', handleRefresh);
            window.removeEventListener('future-education-refresh-sessions', handleRefresh);
        };
    }, [isFutureEd]);

    // Focus input when editing starts
    useEffect(() => {
        if (editingSessionId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingSessionId]);

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            if (!token) return;
            const res = await fetch('/api/builder/sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const unique = (data.sessions || []).filter((v: any, i: number, a: any[]) => a.findIndex((v2: any) => v2._id === v._id) === i);
                setSessions(unique);
            }
        } catch (e) { console.error(e); }
    };

    const fetchFutureEdSessions = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            if (!token) return;
            const res = await fetch('/api/future-education/chat/sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setFutureEdSessions(data.sessions || []);
            }
        } catch (e) { console.error(e); }
    };

    const fetchFutureEdStats = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            if (!token) return;
            const res = await fetch('/api/future-education/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setFutureEdStats(data.stats);
            }
        } catch (e) { console.error(e); }
    };

    const fetchFutureEdCourses = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            if (!token) return;
            const res = await fetch('/api/future-education/sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setFutureEdCourses(data.sessions || []);
            }
        } catch (e) { console.error(e); }
    };

    const handleCreateSession = async () => {
        const token = localStorage.getItem('fbrts_token');
        if (!token) return;

        if (isFutureEd) {
            try {
                const res = await fetch('/api/future-education/chat/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ title: 'New Chat' })
                });
                const data = await res.json();
                if (data.success) {
                    await fetchFutureEdSessions();
                    navigate(`/future-education?sessionId=${data.session._id}`);
                    closeMobileMenu();
                }
            } catch (e) { console.error(e); }
        } else {
            const intent = "";
            const title = "New Session";
            try {
                const res = await fetch('/api/builder/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ initialPrompt: intent, title })
                });
                const data = await res.json();
                if (data.success) {
                    await fetchSessions();
                    localStorage.setItem('fbrts_active_session', data.session._id);
                    navigate(`/builder?sessionId=${data.session._id}`);
                    closeMobileMenu();
                }
            } catch (e) { console.error(e); }
        }
    };

    const handleRenameSession = async (id: string) => {
        if (!editTitle.trim()) {
            setEditingSessionId(null);
            return;
        }

        if (isFutureEd) {
            setFutureEdSessions(prev => prev.map(s => s._id === id ? { ...s, title: editTitle } : s));
            setEditingSessionId(null);
            try {
                const token = localStorage.getItem('fbrts_token');
                await fetch(`/api/future-education/chat/session/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ title: editTitle })
                });
                fetchFutureEdSessions();
            } catch (e) { console.error(e); }
        } else {
            setSessions(prev => prev.map(s => s._id === id ? { ...s, title: editTitle } : s));
            setEditingSessionId(null);
            try {
                const token = localStorage.getItem('fbrts_token');
                await fetch(`/api/builder/session/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ title: editTitle })
                });
                fetchSessions();
            } catch (e) { console.error(e); }
        }
    };

    const handleTogglePin = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const token = localStorage.getItem('fbrts_token');
        if (!token) return;

        if (isFutureEd) {
            try {
                const res = await fetch(`/api/future-education/chat/session/${id}/pin`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setFutureEdSessions(prev => {
                        const updated = prev.map(s => s._id === id ? { ...s, isPinned: data.session.isPinned } : s);
                        return [...updated].sort((a, b) => {
                            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
                            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                        });
                    });
                }
            } catch (e) { console.error(e); }
        } else {
            try {
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
                            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                        });
                    });
                }
            } catch (e) { console.error(e); }
        }
    };

    const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const token = localStorage.getItem('fbrts_token');
        if (!token) return;

        if (isFutureEd) {
            const confirmed = await confirm({
                title: "Delete Chat?",
                message: "This will permanently delete this conversation and all its messages. This action cannot be undone.",
                confirmText: "Delete Permanently",
                cancelText: "Keep Chat"
            });
            if (!confirmed) return;

            setFutureEdSessions(prev => prev.filter(s => s._id !== id));
            if (location.search.includes(id)) navigate('/future-education');

            try {
                const res = await fetch(`/api/future-education/chat/session/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    fetchFutureEdSessions();
                }
            } catch (e) { console.error(e); }
        } else {
            const confirmed = await confirm({
                title: "Delete Session?",
                message: "This will permanently erase this session's history and roadmaps. This action cannot be undone.",
                confirmText: "Delete Permanently",
                cancelText: "Keep Session"
            });
            if (!confirmed) return;

            setSessions(prev => prev.filter(s => s._id !== id));
            if (location.search.includes(id)) navigate('/builder');

            try {
                const res = await fetch(`/api/builder/session/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    fetchSessions();
                }
            } catch (e) { console.error(e); }
        }
    };

    const startEditing = (session: any) => {
        setEditingSessionId(session._id);
        setEditTitle(session.title);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const handleSessionClick = (id: string) => {
        if (isFutureEd) {
            navigate(`/future-education?sessionId=${id}`);
        } else {
            localStorage.setItem('fbrts_active_session', id);
            navigate(`/builder?sessionId=${id}`);
        }
        closeMobileMenu();
    };

    const navItems = isFutureEd ? [
        { name: "Tutor Chat", path: "/future-education", icon: <MessageSquare size={20} /> },
        { name: "Study Roadmaps", path: "/future-education/roadmaps", icon: <Map size={20} /> },
        { name: "Study Tasks", path: "/future-education/tasks", icon: <CheckSquare size={20} /> },
        { name: "E-Builder", path: "/future-education/builder", icon: <Zap size={20} /> },
        { name: "Practice Exams", path: "/future-education/exams", icon: <FileText size={20} /> },
        { name: "Academic Results", path: "/future-education/results", icon: <Award size={20} /> },
        { name: "Exit Student OS", path: "/dashboard", icon: <LogOut size={20} /> },
    ] : [
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "Future Education OS", path: "/future-education", icon: <GraduationCap size={20} /> },
        { name: "Roadmap", path: "/roadmap", icon: <Map size={20} /> },
        { name: "Today Task", path: "/today-task", icon: <CheckSquare size={20} /> },
        { name: "Builder", path: "/builder", icon: <Zap size={20} /> },
        { name: "Exam Generator", path: "/exam-generator", icon: <FileText size={20} /> },
        { name: "Business War Room", path: "/war-room", icon: <Briefcase size={20} /> },
    ];

    if (!isFutureEd && user?.role === 'admin') {
        navItems.push({ name: "Genesis Admin", path: "/admin", icon: <ShieldCheck size={20} className="text-orange-400" /> });
    }

    const xp = futureEdStats ? (futureEdStats.completed_topics * 200 + futureEdStats.total_exams_taken * 300 + futureEdStats.total_study_minutes * 5) : 650;
    const level = Math.floor(xp / 1000) + 1;
    const levelProgressXp = xp % 1000;
    const levelProgressPercent = (levelProgressXp / 1000) * 100;
    const gold = futureEdStats ? (futureEdStats.completed_topics * 50 + futureEdStats.total_exams_taken * 100 + futureEdStats.streak_days * 10) : 320;

    return (
        <div className="flex h-screen text-white overflow-hidden font-sans relative bg-black">


            {/* Mobile Header */}
            {!isMinervaMain && (
                <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-white/5 bg-black/20 backdrop-blur-xl z-40 flex items-center px-4">
                    <button onClick={toggleMobileMenu} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Menu size={24} />
                    </button>
                    <div className="ml-3 flex items-center justify-between flex-1">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-black text-[10px]">{isFutureEd ? "FE" : "FB"}</div>
                            <span className="text-sm font-black tracking-widest uppercase">{isFutureEd ? "Future Ed" : "FutureBRTS"}</span>
                        </div>

                        {/* New Chat Button - Mobile/Tablet Only */}
                        <button
                            onClick={handleCreateSession}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 active:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-900/20 border border-indigo-400/20 transition-all"
                        >
                            <span className="text-lg leading-none mb-0.5">+</span>
                            <span className="text-xs font-bold tracking-wide">{isFutureEd ? "New Chat" : "New Mission"}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" onClick={closeMobileMenu} />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:relative inset-y-0 left-0 ${isSidebarCollapsed ? 'w-20' : 'w-72 md:w-64'} border-r border-white/5 flex flex-col z-[60] bg-black/40 backdrop-blur-2xl transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className={`pl-4 py-4 pr-2 md:pl-5 md:py-5 md:pr-2 border-b border-white/5 flex flex-col gap-4 bg-gradient-to-b from-indigo-500/5 to-transparent relative group/sidebar-header`}>
                    <div className="flex items-center justify-between w-full">
                        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-3'} overflow-hidden relative group/header-actions`}>
                            {/* Logo Button - Collapsed state hover trigger */}
                            <div
                                onClick={isSidebarCollapsed ? toggleSidebar : undefined}
                                className={`w-9 h-9 rounded-xl ${isFutureEd ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600' : 'bg-indigo-600'} flex items-center justify-center font-black text-xs shrink-0 cursor-pointer transition-all hover:opacity-90 relative`}
                            >
                                <span className={`${isSidebarCollapsed ? 'group-hover/header-actions:opacity-0' : ''} transition-opacity`}>{isFutureEd ? "FE" : "FB"}</span>
                                {isSidebarCollapsed && (
                                    <PanelLeftOpen size={18} className="absolute opacity-0 group-hover/header-actions:opacity-100 transition-opacity text-white" />
                                )}
                            </div>

                            {!isSidebarCollapsed && (
                                <>
                                    <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 leading-none whitespace-nowrap">{isFutureEd ? "Future Ed OS" : "FutureBRTS"}</h1>
                                    <button
                                        onClick={toggleSidebar}
                                        className="ml-auto p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                        title="Close sidebar"
                                    >
                                        <PanelLeftClose size={18} />
                                    </button>
                                </>
                            )}

                            {/* ChatGPT style "Open sidebar" float-label */}
                            {isSidebarCollapsed && (
                                <div className="absolute left-14 opacity-0 group-hover/header-actions:opacity-100 pointer-events-none transition-all translate-x-1 group-hover/header-actions:translate-x-0 whitespace-nowrap">
                                    <div className="bg-black border border-white/10 px-3 py-1.5 rounded-lg shadow-2xl">
                                        <span className="text-[11px] font-bold text-white tracking-tight uppercase">Open sidebar</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={closeMobileMenu} className="md:hidden p-2 text-gray-500"><X size={20} /></button>
                    </div>
                </div>

                <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-hide">
                    {/* Gamification RPG Progression Profile Card */}
                    {isFutureEd && !isSidebarCollapsed && (
                        <div className="px-3 animate-in fade-in duration-300">
                            <div className="bg-gradient-to-br from-[#0c0a21] via-[#050410] to-black border border-indigo-500/30 rounded-2xl p-3.5 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                                <div className="flex items-center justify-between text-[11px] font-bold text-gray-200">
                                    <span className="flex items-center gap-1"><span className="text-[10px] text-indigo-400">Lv.</span> {level} Scholar</span>
                                    <span className="text-amber-400 flex items-center gap-1">🪙 {gold} Gold</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full mt-2 overflow-hidden border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full" style={{ width: `${levelProgressPercent}%` }} />
                                </div>
                                <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-bold">
                                    <span>XP: {levelProgressXp} / 1000</span>
                                    <span>{Math.round(levelProgressPercent)}% to Lv. {level + 1}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Widget for Future Education OS */}
                    {isFutureEd && !isSidebarCollapsed && futureEdStats && (
                        <div className="grid grid-cols-2 gap-2 mb-6 animate-in fade-in duration-300 px-3">
                            {[
                                { label: 'Active Streak', value: `${futureEdStats.streak_days} Days`, icon: '🔥', color: 'from-orange-500/10 via-red-500/5 to-transparent border-orange-500/20 text-orange-400' },
                                { label: 'Chapters Done', value: `${futureEdStats.completed_topics}/${futureEdStats.total_topics}`, icon: '📚', color: 'from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20 text-indigo-400' },
                                { label: 'Exams Taken', value: futureEdStats.total_exams_taken, icon: '🏆', color: 'from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20 text-emerald-400' },
                                { label: 'Study Minutes', value: `${futureEdStats.total_study_minutes} Min`, icon: '⏱️', color: 'from-pink-500/10 via-rose-500/5 to-transparent border-pink-500/20 text-pink-400' },
                            ].map((s, i) => (
                                <div key={i} className={`bg-gradient-to-br ${s.color} border border-white/5 rounded-2xl p-2.5 flex flex-col justify-between shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02]`}>
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{s.label}</div>
                                    <div className="text-xs font-black mt-1 flex items-center justify-between">
                                        <span>{s.value}</span>
                                        <span>{s.icon}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-1">
                        {!isSidebarCollapsed && (
                            <div className="px-3 pb-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Main Menu</div>
                        )}
                        {navItems.map(item => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    title={isSidebarCollapsed ? item.name : ""}
                                    to={item.path}
                                    className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-2 px-3'} py-2 rounded-lg text-[13px] font-medium transition-all group ${isActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'}`}
                                >
                                    {isActive && !isSidebarCollapsed && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-indigo-500 rounded-l-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                    )}
                                    <div className={`shrink-0 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-110'}`}>{item.icon}</div>
                                    {!isSidebarCollapsed && <span>{item.name}</span>}
                                </Link>
                            )
                        })}

                        <button
                            onClick={() => { handleCreateSession(); }}
                            title={isSidebarCollapsed ? (isFutureEd ? "New Chat" : "New Mission") : ""}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2 px-3'} py-2 rounded-lg text-[13px] font-medium transition-all text-indigo-400 hover:text-white hover:bg-indigo-500/10 border border-dashed border-indigo-500/20 hover:border-indigo-500/40 mt-2 group relative`}
                        >
                            <div className="w-5 h-5 rounded border border-indigo-500/30 flex items-center justify-center group-hover:border-indigo-400 transition-colors shrink-0">
                                <span className="text-indigo-400/70 group-hover:text-indigo-300 text-xs leading-none mb-0.5">+</span>
                            </div>
                            {!isSidebarCollapsed && <span>{isFutureEd ? "New Chat" : "New Mission"}</span>}
                        </button>
                    </div>

                    <div className="space-y-1">
                        {!isSidebarCollapsed && (
                            <div className="px-3 pb-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                                <span>History</span>
                                <Clock size={12} className="text-gray-600" />
                            </div>
                        )}
                        <div className="space-y-0.5 pb-4">
                            {(isFutureEd ? futureEdSessions : sessions).length > 0 ? (
                                (isFutureEd ? futureEdSessions : sessions).slice(0, isSidebarCollapsed ? 5 : undefined).map(s => (
                                    <div key={s._id} className="group relative">
                                        {editingSessionId === s._id && !isSidebarCollapsed ? (
                                            <div className="px-3 py-1.5 bg-white/5 rounded-lg flex items-center gap-2 border border-indigo-500/50 my-0.5">
                                                <input
                                                    ref={editInputRef}
                                                    value={editTitle}
                                                    onChange={e => setEditTitle(e.target.value)}
                                                    onBlur={() => handleRenameSession(s._id)}
                                                    onKeyDown={e => e.key === 'Enter' && handleRenameSession(s._id)}
                                                    className="bg-transparent border-0 outline-none text-[13px] w-full text-white placeholder-gray-500 font-medium"
                                                    placeholder="Session Title"
                                                    autoFocus
                                                />
                                                <Check size={14} className="text-emerald-500 cursor-pointer" onClick={() => handleRenameSession(s._id)} />
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => isSidebarCollapsed && handleSessionClick(s._id)}
                                                className={`w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-2 px-3'} py-1.5 rounded-lg text-[13px] font-normal transition-all flex items-center cursor-pointer group/item relative ${currentSessionId === s._id ? 'bg-white/5 text-gray-200' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'}`}
                                            >
                                                {currentSessionId === s._id && !isSidebarCollapsed && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-indigo-500/50 rounded-r-full" />
                                                )}
                                                {!isSidebarCollapsed ? (
                                                    <>
                                                        <button onClick={() => handleSessionClick(s._id)} className="flex-1 flex items-center gap-2 text-left overflow-hidden z-0">
                                                            <div className="relative shrink-0">
                                                                <MessageSquare size={13} className={`${currentSessionId === s._id ? 'text-indigo-400' : 'text-gray-600 group-hover/item:text-gray-500'}`} />
                                                                {s.isPinned && (
                                                                    <div className="absolute -top-1.5 -right-1.5 bg-black rounded-full p-0.5">
                                                                        <Pin size={8} className="text-indigo-500 fill-indigo-500" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="truncate">{s.title || 'Untitled'}</span>
                                                        </button>
                                                        <div className="opacity-0 group-hover/item:opacity-100 absolute right-2 top-1/2 -translate-y-1/2 z-10">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const dropdown = document.getElementById(`menu-${s._id}`);
                                                                    if (dropdown) dropdown.classList.toggle('hidden');
                                                                }}
                                                                className="p-1.5 hover:bg-[#2f2f2f] rounded-md text-gray-500 hover:text-white transition-colors"
                                                            >
                                                                <MoreHorizontal size={14} />
                                                            </button>
                                                            <div
                                                                id={`menu-${s._id}`}
                                                                className="hidden absolute top-full right-0 mt-1 w-48 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 origin-top-right"
                                                                onMouseLeave={(e) => e.currentTarget.classList.add('hidden')}
                                                            >
                                                                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-lg hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); startEditing(s); }}><Edit2 size={12} /> Rename</button>
                                                                <div className="h-px bg-white/5 my-1" />
                                                                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-lg hover:text-white transition-colors"><FolderInput size={12} /> Move to project</button>
                                                                <button
                                                                    className={`flex items-center gap-2 w-full px-3 py-2 text-xs rounded-lg transition-colors ${s.isPinned ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                                                    onClick={(e) => handleTogglePin(s._id, e)}
                                                                >
                                                                    <Pin size={12} className={s.isPinned ? 'fill-indigo-400' : ''} /> {s.isPinned ? 'Unpin chat' : 'Pin chat'}
                                                                </button>
                                                                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-lg hover:text-white transition-colors"><Archive size={12} /> Archive</button>
                                                                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-lg hover:text-white transition-colors" onClick={() => alert("Export feature coming soon!")}><Share2 size={12} /> Export (PDF/PPT)</button>
                                                                <div className="h-px bg-white/5 my-1" />
                                                                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" onClick={(e) => { handleDeleteSession(s._id, e); }}><Trash2 size={12} /> Delete</button>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div title={s.title}>
                                                        <MessageSquare size={14} className={`${currentSessionId === s._id ? 'text-indigo-500' : 'text-gray-700'}`} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : !isSidebarCollapsed ? (
                                <div className="px-4 py-3 text-[11px] text-gray-700 italic">No history found</div>
                            ) : null}
                        </div>
                    </div>

                    {/* Active Study Sessions / Courses for Future Education OS */}
                    {isFutureEd && !isSidebarCollapsed && (
                        <div className="space-y-1 px-3 pt-4 border-t border-white/5">
                            <div className="pb-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Study Courses</div>
                            {futureEdCourses.length === 0 ? (
                                <div className="text-[11px] text-gray-500 italic py-2 bg-white/[0.01] border border-dashed border-white/5 rounded-lg text-center">No active courses. Ask the AI tutor to start a topic!</div>
                            ) : (
                                <div className="space-y-2">
                                    {futureEdCourses.slice(0, 5).map((s, i) => (
                                        <button key={i} onClick={() => navigate(`/future-education/session/${s._id}`)}
                                            className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group">
                                            <div className="text-xs font-semibold text-gray-200 truncate group-hover:text-white transition-colors">{s.title}</div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: `${s.progress_percent}%` }} />
                                                </div>
                                                <span className="text-[9px] text-indigo-400 font-bold">{s.progress_percent}%</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/5 relative">
                    {/* System Pulse area */}
                    {!isSidebarCollapsed && (
                        <div className="flex items-center justify-between px-4 pb-4 animate-in fade-in duration-500">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Sync Active</span>
                                </div>
                                <span className="text-[12px] font-mono text-gray-500 mt-0.5">{systemTime}</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center">
                                <Clock size={14} className="text-gray-600" />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        title={isSidebarCollapsed ? "Settings" : ""}
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-white hover:bg-white/[0.03] transition-all relative group`}
                    >
                        <Settings size={20} className={`shrink-0 ${isSettingsOpen ? 'text-indigo-400 rotate-90' : ''} transition-all duration-500`} />
                        {!isSidebarCollapsed && (
                            <>
                                <span>Settings</span>
                                <ChevronRight size={14} className={`ml-auto opacity-50 transition-transform ${isSettingsOpen ? 'rotate-90' : ''}`} />
                            </>
                        )}
                    </button>

                    {/* Settings Dropdown */}
                    {isSettingsOpen && (
                        <div
                            className={`absolute ${isSidebarCollapsed ? 'left-full bottom-0 ml-2 mb-2' : 'bottom-full left-4 right-4 mb-2'} bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 w-56 md:w-auto overflow-hidden`}
                            onMouseLeave={() => setIsSettingsOpen(false)}
                        >
                            {!user?.isPremium && (
                                <button onClick={() => { navigate('/pricing'); setIsSettingsOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all font-bold">
                                    <Sparkles size={16} /> Pricing / Upgrade
                                </button>
                            )}
                            <button onClick={() => { navigate('/settings'); setIsSettingsOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 rounded-xl transition-all font-medium">
                                <User size={16} /> System Settings
                            </button>
                            <div className="h-px bg-white/5 my-1.5" />
                            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold">
                                <LogOut size={16} /> Log Out
                            </button>
                        </div>
                    )}
                </div>
            </aside >

            <main className={`flex-1 min-w-0 ${isFullHeight ? 'overflow-hidden pb-0' : 'overflow-y-auto pb-16'} relative w-full md:pb-0`}>
                <div className={`relative ${isFullHeight ? 'h-full' : 'min-h-full'} flex flex-col ${isFullHeight ? (isMinervaMain ? 'pt-0 px-0 pb-0' : 'pt-14 md:pt-0 px-0 pb-0') : 'p-4 md:p-8 pt-20 md:pt-8 pb-20 md:pb-8'} w-full max-w-full overflow-x-hidden`}>
                    <div className={`flex-1 flex flex-col ${isFutureEd && !isMinervaMain ? 'overflow-y-auto' : 'overflow-hidden'} min-w-0 min-h-0`}>
                        <Outlet />
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            {!isFullHeight && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#09090b]/95 backdrop-blur-2xl border-t border-white/10 z-[60] flex items-center justify-start overflow-x-auto scrollbar-hide px-3 pb-1 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] gap-1">
                    {navItems.map(item => {
                        const isActive = location.pathname.startsWith(item.path);
                        const getShortName = (name: string) => {
                            switch (name) {
                                case "Future Education OS": return "Future Ed";
                                case "Business War Room": return "War Room";
                                case "Genesis Admin": return "Admin";
                                case "Today Task": return "Tasks";
                                case "Exam Generator": return "Exams";
                                case "Tutor Chat": return "Chat";
                                case "Study Roadmaps": return "Roadmaps";
                                case "Study Tasks": return "Tasks";
                                case "E-Builder": return "Builder";
                                case "Practice Exams": return "Exams";
                                case "Exit Student OS": return "Exit";
                                default: return name;
                            }
                        };
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center min-w-[74px] flex-shrink-0 h-full gap-1.5 transition-all ${isActive ? 'text-indigo-400' : 'text-gray-500 active:text-gray-300'}`}
                            >
                                <div className={`${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'scale-95'} transition-transform duration-300`}>
                                    {item.icon}
                                </div>
                                <span className={`text-[9px] font-bold tracking-wide whitespace-nowrap ${isActive ? 'text-indigo-300' : ''}`}>
                                    {getShortName(item.name)}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            )}

            {/* 📺 Manual Ad Trigger (TokenWall) */}
            <TokenWall
                isOpen={isTokenWallOpen}
                onClose={() => setIsTokenWallOpen(false)}
                onActionComplete={handleTokenWallAction}
            />
        </div >
    )
}
