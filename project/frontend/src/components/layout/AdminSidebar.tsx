import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Map,
    CheckSquare,
    Settings,
    Globe,
    Search,
    Bell,
    ShieldCheck,
    Activity,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    LogOut,
    Brain,
    Coins,
    MessageSquare,
    Sparkles,
    Briefcase,
    GraduationCap,
    Flame,
    FileText,
    HeartHandshake,
    Building2,
    UserCheck
} from 'lucide-react';

interface SidebarItemProps {
    name: string;
    path: string;
    icon: React.ReactNode;
    isCollapsed: boolean;
    isActive: boolean;
}

const SidebarItem = ({ name, path, icon, isCollapsed, isActive }: SidebarItemProps) => {
    return (
        <Link
            to={path}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-indigo-600/10 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'}`}
        >
            <div className="shrink-0">{icon}</div>
            {!isCollapsed && <span>{name}</span>}
            {!isCollapsed && isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
        </Link>
    );
};

export default function AdminSidebar({ isCollapsed, toggleSidebar, logout }: { isCollapsed: boolean, toggleSidebar: () => void, logout: () => void }) {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Switch between 'core' (Future BRTS) and 'education' (Future Education OS) admin layouts
    const [sidebarMode, setSidebarMode] = useState<'core' | 'education'>(() => {
        return (localStorage.getItem('admin_sidebar_mode') as 'core' | 'education') || 'core';
    });

    const handleModeChange = (mode: 'core' | 'education') => {
        setSidebarMode(mode);
        localStorage.setItem('admin_sidebar_mode', mode);
        if (mode === 'core') {
            navigate('/admin/dashboard');
        } else {
            navigate('/admin/education/tutor-chats');
        }
    };

    const coreItems = [
        { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "Users", path: "/admin/users", icon: <Users size={20} /> },
        { name: "Project Registry", path: "/admin/projects", icon: <Briefcase size={20} /> },
        { name: "AI Config", path: "/admin/ai", icon: <Brain size={20} /> },
        { name: "Economy Hub", path: "/admin/economy", icon: <Coins size={20} /> },
        { name: "Chat Monitor", path: "/admin/chats", icon: <MessageSquare size={20} /> },
        { name: "SEO Management", path: "/admin/seo", icon: <Search size={20} /> },
        { name: "Strategic Intel", path: "/admin/intelligence", icon: <Sparkles size={20} /> },
        { name: "Tracking Logs", path: "/admin/tracking", icon: <Activity size={20} /> },
        { name: "Roadmaps", path: "/admin/roadmaps", icon: <Map size={20} /> },
        { name: "Tasks", path: "/admin/tasks", icon: <CheckSquare size={20} /> },
        { name: "Google Services", path: "/admin/google", icon: <Globe size={20} /> },
        { name: "Notifications", path: "/admin/notifications", icon: <Bell size={20} /> },
        { name: "Permissions", path: "/admin/permissions", icon: <ShieldCheck size={20} /> },
        { name: "System Settings", path: "/admin/settings", icon: <Settings size={20} /> },
    ];

    const educationItems = [
        { name: "Users", path: "/admin/education/users", icon: <Users size={20} className="text-blue-400" /> },
        { name: "Tutor Chats", path: "/admin/education/tutor-chats", icon: <MessageSquare size={20} className="text-violet-400" /> },
        { name: "Study Roadmaps", path: "/admin/education/roadmaps", icon: <Map size={20} className="text-indigo-400" /> },
        { name: "Study Tasks", path: "/admin/education/tasks", icon: <CheckSquare size={20} className="text-emerald-400" /> },
        { name: "1v1 Quiz Battles", path: "/admin/education/battles", icon: <Flame size={20} className="text-orange-400" /> },
        { name: "E-Builder Projects", path: "/admin/education/builder", icon: <Briefcase size={20} className="text-sky-400" /> },
        { name: "Practice Exams", path: "/admin/education/exams", icon: <FileText size={20} className="text-pink-400" /> },
        { name: "Academic Results", path: "/admin/education/results", icon: <GraduationCap size={20} className="text-amber-400" /> },
        { name: "Teacher Workspace 👩‍🏫", path: "/teacher/workspace", icon: <GraduationCap size={20} className="text-purple-400" /> },
        { name: "Teacher & Parent Hub 🏫", path: "/future-education/teacher-dashboard", icon: <HeartHandshake size={20} className="text-pink-400" /> },
        { name: "Student Portal 🎓", path: "/student/workspace", icon: <UserCheck size={20} className="text-emerald-400" /> },
        { name: "School & ERP B2B", path: "/admin/education/school-management", icon: <Building2 size={20} className="text-teal-400" /> },
    ];

    const menuItems = sidebarMode === 'core' ? coreItems : educationItems;

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-72'} border-r border-white/5 flex flex-col h-screen bg-black/40 backdrop-blur-2xl transition-all duration-300 ease-in-out`}>
            <div className="p-5 border-b border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-white/10 shadow-md">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <h1 className="text-lg font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 leading-none">Admin Panel</h1>
                        </div>
                    )}
                    <button onClick={toggleSidebar} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all ml-auto">
                        {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                    </button>
                </div>

                {/* Mode Selector Segmented Tabs */}
                {!isCollapsed && (
                    <div className="flex bg-black/45 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => handleModeChange('core')}
                            className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${sidebarMode === 'core' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-450 hover:text-white'}`}
                        >
                            Future BRTS
                        </button>
                        <button
                            onClick={() => handleModeChange('education')}
                            className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${sidebarMode === 'education' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-450 hover:text-white'}`}
                        >
                            Education OS
                        </button>
                    </div>
                )}
                {isCollapsed && (
                    <button
                        onClick={() => handleModeChange(sidebarMode === 'core' ? 'education' : 'core')}
                        title={sidebarMode === 'core' ? 'Switch to Future Education OS' : 'Switch to Future BRTS'}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black mx-auto hover:bg-white/10 text-indigo-400 transition-all active:scale-95"
                    >
                        {sidebarMode === 'core' ? '🎓' : '💼'}
                    </button>
                )}
            </div>

            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                {!isCollapsed && (
                    <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                        {sidebarMode === 'core' ? 'Core Management' : 'Education OS Telemetry'}
                    </div>
                )}
                {menuItems.map(item => (
                    <SidebarItem
                        key={item.path}
                        {...item}
                        isCollapsed={isCollapsed}
                        isActive={location.pathname === item.path}
                    />
                ))}
            </div>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={logout}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all`}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span>Log Out</span>}
                </button>
            </div>
        </aside>
    );
}
