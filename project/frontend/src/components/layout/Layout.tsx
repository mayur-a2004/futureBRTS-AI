import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Zap, User, LogOut, Clock, Menu, X, MessageSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect } from "react";

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    // Recent Sessions removed
    const { logout } = useAuth();
    const sessions: any[] = [];
    const activeSessionId = null;
    const setActiveSession = (_id: string) => { };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const handleSessionClick = (id: string) => {
        setActiveSession(id);
        navigate("/builder");
        closeMobileMenu();
    };

    // Close mobile menu on route change
    useEffect(() => {
        closeMobileMenu();
    }, [location.pathname]);

    const navItems = [
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "Builder", path: "/builder", icon: <Zap size={20} /> },
    ];

    const bottomItems = [
        { name: "Profile", path: "/profile", icon: <User size={20} /> },
    ];

    return (
        <div className="flex h-screen text-white overflow-hidden font-sans relative">
            {/* Mobile Header - Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-white/5 bg-black/20 backdrop-blur-xl z-40 flex items-center px-4">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div className="ml-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-black text-[10px]">FB</div>
                    <span className="text-sm font-black tracking-widest uppercase">Builder</span>
                </div>
            </div>

            {/* Overlay for mobile sidebar */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar with Glassmorphism */}
            <aside className={`
                fixed md:relative inset-y-0 left-0 w-72 md:w-64 border-r border-white/5 flex flex-col z-[60] 
                bg-black/40 backdrop-blur-2xl
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-xs">FB</div>
                        <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">FutureBuilder</h1>
                    </div>
                    <button onClick={closeMobileMenu} className="md:hidden p-2 text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto scrollbar-hide">
                    {/* Navigation */}
                    <div className="space-y-1.5">
                        <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Main Menu</div>
                        {navItems.map(item => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-indigo-600/10 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'}`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Recent Sessions */}
                    <div className="space-y-1.5">
                        <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 flex items-center justify-between">
                            <span>Recent Thinking</span>
                            <Clock size={12} className="text-gray-700" />
                        </div>
                        <div className="space-y-1 pb-4">
                            {sessions.length > 0 ? (
                                sessions.slice(0, 10).map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleSessionClick(s.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-medium transition-all flex items-center gap-3 group ${activeSessionId === s.id ? 'bg-white/5 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.01]'}`}
                                    >
                                        <MessageSquare size={14} className={activeSessionId === s.id ? 'text-indigo-500' : 'text-gray-700 group-hover:text-gray-500'} />
                                        <span className="truncate flex-1">{s.title}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-[11px] text-gray-700 italic">No recent sessions</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 space-y-1">
                    <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Preferences</div>
                    {bottomItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-white hover:bg-white/[0.03] transition-all"
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-bold transition-all"
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content - Transparent to show global background */}
            <main className={`flex-1 ${location.pathname === '/builder' ? 'overflow-hidden' : 'overflow-y-auto'} relative w-full`}>
                <div className={`relative z-10 ${location.pathname === '/builder' ? 'h-full' : 'min-h-full'} flex flex-col ${location.pathname === '/builder' ? 'p-0 pt-14 md:pt-0' : 'p-4 md:p-8 pt-20 md:pt-8'}`}>
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    )
}
