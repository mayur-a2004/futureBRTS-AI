import { useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from './AdminSidebar';
import { ShieldAlert, Bell, Search, User } from 'lucide-react';

export default function AdminLayout() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    });

    // Security Gate: Ensure only admins can access
    if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-transparent backdrop-blur-3xl flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-6">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <ShieldAlert size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black text-white">Access Restricted</h1>
                    <p className="text-gray-400">You do not have the required permissions to access the Genesis Command Center.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem('admin_sidebar_collapsed', String(newState));
    };

    return (
        <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans relative">
            <AdminSidebar
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                logout={() => { logout(); navigate('/'); }}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Admin Header */}
                <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 relative z-20">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-black text-white/40 uppercase tracking-widest animate-in fade-in slide-in-from-left-4">Genesis Terminal v1.0</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search size={18} className="text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <button className="relative p-2 text-gray-500 hover:text-white transition-all">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-4 ring-black" />
                        </button>
                        <div className="h-8 w-px bg-white/5 mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-white">{user?.name}</p>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight">Supreme Administrator</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 flex items-center justify-center p-[1px]">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                    <User size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 relative z-10 scrollbar-hide">
                    <Outlet />
                </div>

                {/* Background Glows */}
                <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
            </main>
        </div>
    );
}
