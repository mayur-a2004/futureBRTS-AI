import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Zap, LogOut, Clock, Menu, X, MessageSquare, Map, CheckSquare, Edit2, Check, MoreHorizontal, Trash2, Share2, Pin, Archive, FolderInput, Sparkles, PanelLeftClose, PanelLeftOpen, Settings, User, ChevronRight, Briefcase, ShieldCheck } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect, useRef } from "react";
import TokenWall from "@/components/economy/TokenWall";
import { useModal } from "@/context/ModalContext";
import UniverseBackground from "@/components/ui/UniverseBackground";

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { confirm } = useModal();

    // Session State
    const [sessions, setSessions] = useState<any[]>([]);
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
        fetchSessions();
    }, [location.pathname, location.search]);

    // 🧠 REAL-TIME SYNC: Listen for title changes from Builder
    useEffect(() => {
        const handleRefresh = () => fetchSessions();
        window.addEventListener('fb-refresh-sessions', handleRefresh);
        return () => window.removeEventListener('fb-refresh-sessions', handleRefresh);
    }, []);

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

    const createSession = async () => {
        const token = localStorage.getItem('fbrts_token');
        if (!token) return;

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
    };

    const handleRenameSession = async (id: string) => {
        if (!editTitle.trim()) {
            setEditingSessionId(null);
            return;
        }

        setSessions(prev => prev.map(s => s._id === id ? { ...s, title: editTitle } : s));
        setEditingSessionId(null);

        try {
            const token = localStorage.getItem('fbrts_token');
            await fetch(`/api/builder/session/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title: editTitle })
            });
        } catch (e) { console.error(e); }
    };

    const handleTogglePin = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/builder/session/${id}/pin`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Optimistic update or just refetch
                setSessions(prev => {
                    const updated = prev.map(s => s._id === id ? { ...s, isPinned: data.isPinned } : s);
                    return [...updated].sort((a, b) => {
                        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
                        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                    });
                });
            }
        } catch (e) {
            console.error("Pin failed", e);
        }
    };

    const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

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
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/builder/session/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchSessions();
            }
        } catch (e) { console.error(e); }
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
        localStorage.setItem('fbrts_active_session', id);
        navigate(`/builder?sessionId=${id}`);
        closeMobileMenu();
    };

    const navItems = [
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "Roadmap", path: "/roadmap", icon: <Map size={20} /> },
        { name: "Today Task", path: "/today-task", icon: <CheckSquare size={20} /> },
        { name: "Builder", path: "/builder", icon: <Zap size={20} /> },
        { name: "Business War Room", path: "/war-room", icon: <Briefcase size={20} /> },
    ];

    if (user?.role === 'admin') {
        navItems.push({ name: "Genesis Admin", path: "/admin", icon: <ShieldCheck size={20} className="text-orange-400" /> });
    }

    const searchParams = new URLSearchParams(location.search);
    const currentSessionId = searchParams.get('sessionId') || localStorage.getItem('fbrts_active_session');

    const handleTokenWallAction = () => {
        setIsTokenWallOpen(false);
    };

    return (
        <div className="flex h-screen text-white overflow-hidden font-sans relative bg-black">
            {/* 🌌 Global Universe Background - Applied to every page */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <UniverseBackground intensity={0.8} />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-white/5 bg-black/20 backdrop-blur-xl z-40 flex items-center px-4">
                <button onClick={toggleMobileMenu} className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Menu size={24} />
                </button>
                <div className="ml-3 flex items-center justify-between flex-1">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-black text-[10px]">FB</div>
                        <span className="text-sm font-black tracking-widest uppercase">FutureBRTS</span>
                    </div>

                    {/* New Chat Button - Mobile/Tablet Only */}
                    <button
                        onClick={createSession}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 active:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-900/20 border border-indigo-400/20 transition-all"
                    >
                        <span className="text-lg leading-none mb-0.5">+</span>
                        <span className="text-xs font-bold tracking-wide">New Chat</span>
                    </button>
                </div>
            </div>

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
                                className={`w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xs shrink-0 cursor-pointer transition-all hover:bg-indigo-500 relative`}
                            >
                                <span className={`${isSidebarCollapsed ? 'group-hover/header-actions:opacity-0' : ''} transition-opacity`}>FB</span>
                                {isSidebarCollapsed && (
                                    <PanelLeftOpen size={18} className="absolute opacity-0 group-hover/header-actions:opacity-100 transition-opacity text-white" />
                                )}
                            </div>

                            {!isSidebarCollapsed && (
                                <>
                                    <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 leading-none whitespace-nowrap">FutureBRTS</h1>
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
                            onClick={() => { createSession(); }}
                            title={isSidebarCollapsed ? "New Mission" : ""}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2 px-3'} py-2 rounded-lg text-[13px] font-medium transition-all text-indigo-400 hover:text-white hover:bg-indigo-500/10 border border-dashed border-indigo-500/20 hover:border-indigo-500/40 mt-2 group relative`}
                        >
                            <div className="w-5 h-5 rounded border border-indigo-500/30 flex items-center justify-center group-hover:border-indigo-400 transition-colors shrink-0">
                                <span className="text-indigo-400/70 group-hover:text-indigo-300 text-xs leading-none mb-0.5">+</span>
                            </div>
                            {!isSidebarCollapsed && <span>New Mission</span>}
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
                            {sessions.length > 0 ? (
                                sessions.slice(0, isSidebarCollapsed ? 5 : undefined).map(s => (
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

            <main className={`flex-1 ${['/builder', '/roadmap', '/today-task'].includes(location.pathname) ? 'overflow-hidden' : 'overflow-y-auto'} relative w-full`}>
                <div className={`relative ${['/builder', '/roadmap', '/today-task'].includes(location.pathname) ? 'h-full' : 'min-h-full'} flex flex-col ${['/builder', '/roadmap', '/today-task'].includes(location.pathname) ? 'p-0 pt-14 md:pt-0' : 'p-4 md:p-8 pt-20 md:pt-8'}`}>
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Outlet />
                    </div>
                </div>
            </main>

            {/* 📺 Manual Ad Trigger (TokenWall) */}
            <TokenWall
                isOpen={isTokenWallOpen}
                onClose={() => setIsTokenWallOpen(false)}
                onActionComplete={handleTokenWallAction}
            />
        </div >
    )
}
