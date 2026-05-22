import { Link, useLocation } from 'react-router-dom';
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
    Briefcase
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

    const menuItems = [
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

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-72'} border-r border-white/5 flex flex-col h-screen bg-black/40 backdrop-blur-2xl transition-all duration-300 ease-in-out`}>
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xs shrink-0">AD</div>
                        <h1 className="text-lg font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 leading-none">Admin Panel</h1>
                    </div>
                )}
                <button onClick={toggleSidebar} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all ml-auto">
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>
            </div>

            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                {!isCollapsed && <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Core Management</div>}
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
