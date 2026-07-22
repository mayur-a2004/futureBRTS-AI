import { useState, useEffect } from 'react';
import {
    Users,
    Zap,
    Map,
    Clock,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    MoreHorizontal,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative group hover:bg-white/[0.04] transition-all overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-2xl bg-${color}-500/10 border border-${color}-500/20`}>
                <Icon size={24} className={`text-${color}-400`} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-black ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}%
            </div>
        </div>

        <div className="relative z-10">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-3xl font-black text-white">{value}</h3>
        </div>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [telemetry, setTelemetry] = useState<any>(null);
    const [isLockdown, setIsLockdown] = useState(false);
    const [lockdownLoading, setLockdownLoading] = useState(false);

    useEffect(() => {
        fetchData();
        fetchLockdownStatus();
    }, []);

    const fetchLockdownStatus = async () => {
        try {
            const token = localStorage.getItem('fbrts_token') || localStorage.getItem('token') || localStorage.getItem('minerva_token');
            const res = await fetch('/api/admin/emergency-lockdown', {
                headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
            });
            const data = await res.json();
            if (data.success) {
                setIsLockdown(data.emergencyLockdown);
            }
        } catch (e) {
            console.error("Lockdown error", e);
        }
    };

    const toggleEmergencyLockdown = async () => {
        const nextState = !isLockdown;
        if (!window.confirm(nextState 
            ? "🚨 CRITICAL: Are you sure you want to ACTIVATE EMERGENCY LOCKDOWN? Non-admin users will immediately lose access!" 
            : "✅ RESTORE: Are you sure you want to RESTORE NORMAL SITE OPERATIONS?")) return;

        setLockdownLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token') || localStorage.getItem('token') || localStorage.getItem('minerva_token');
            const res = await fetch('/api/admin/emergency-lockdown', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                body: JSON.stringify({ active: nextState })
            });
            const data = await res.json();
            if (data.success) {
                setIsLockdown(data.emergencyLockdown);
                alert(data.message);
            } else {
                alert(data.error || data.message || "Lockdown toggle failed");
            }
        } catch (e: any) {
            alert(`Lockdown toggle failed: ${e.message || 'Server error'}`);
        } finally {
            setLockdownLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('fbrts_token') || localStorage.getItem('token') || localStorage.getItem('minerva_token');
            const headers = { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
            const [statsRes, trackingRes, telemetryRes] = await Promise.all([
                fetch('/api/admin/stats', { headers }),
                fetch('/api/admin/tracking', { headers }),
                fetch('/api/admin/live-telemetry', { headers })
            ]);
            
            const statsData = await statsRes.json();
            const trackingData = await trackingRes.json();
            const telemetryData = await telemetryRes.json();
            
            if (statsData.success) setStats(statsData.stats);
            if (trackingData.success) setRecentActivities(trackingData.logs || []);
            if (telemetryData.success) setTelemetry(telemetryData);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 🚨 Emergency System Lockdown Banner */}
            <div className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl ${isLockdown ? 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-rose-950/50' : 'bg-white/[0.02] border-white/10 text-white'}`}>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🚨</span>
                        <h3 className="text-base font-black tracking-tight uppercase">Emergency Website Lockdown & System Kill Switch</h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 font-medium max-w-xl">
                        If hackers, DDoS, or security emergencies occur, press this button to immediately take down site access for non-admins. Press again to restore normal operations instantly.
                    </p>
                </div>
                <button
                    onClick={toggleEmergencyLockdown}
                    disabled={lockdownLoading}
                    className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 ${isLockdown ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/30 animate-pulse'}`}
                >
                    {isLockdown ? '✅ RESTORE WEBSITE NORMAL OPERATION' : '🚨 ACTIVATE EMERGENCY LOCKDOWN'}
                </button>
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Command Dashboard</h1>
                    <p className="text-gray-400 mt-2 font-medium">Real-time intelligence from the Future BRTS neural network.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-black hover:bg-white/10 transition-all flex items-center gap-2">
                        <Filter size={16} /> Filter View
                    </button>
                    <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                        Export Intel
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || "0"}
                    change="+12"
                    trend="up"
                    icon={Users}
                    color="indigo"
                />
                <StatCard
                    title="Active Roadmaps"
                    value={stats?.totalRoadmaps || "0"}
                    change="+8"
                    trend="up"
                    icon={Map}
                    color="purple"
                />
                <StatCard
                    title="AI Syntheses"
                    value={stats?.totalSessions || "0"}
                    change="+24"
                    trend="up"
                    icon={Zap}
                    color="amber"
                />
                <StatCard
                    title="Current Pulse"
                    value={stats?.activeNow || "0"}
                    change="-2"
                    trend="down"
                    icon={Activity}
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white tracking-tight">Recent Neural Events</h2>
                        <button className="text-indigo-400 text-xs font-black uppercase tracking-widest hover:text-indigo-300">View All</button>
                    </div>

                    <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.03] border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Subject</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Action</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Timestamp</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Status</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {recentActivities.map((act: any) => (
                                        <tr key={act.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-black text-[10px]">
                                                        {act.user ? act.user.split(' ').map((n: string) => n[0]).join('') : 'SYS'}
                                                    </div>
                                                    <span className="text-sm font-bold text-white">{act.user || 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm text-gray-400">{act.event || act.action}</span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Clock size={14} /> {act.time}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${act.type === 'success' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : act.type === 'warn' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                    {act.type === 'success' ? 'Success' : act.type === 'warn' ? 'Warning' : 'Info'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button className="p-2 text-gray-600 hover:text-white transition-colors">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-white tracking-tight">System Integrity</h2>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold text-gray-400 uppercase tracking-widest">AI Engine Load</span>
                                <span className="text-white font-black">42%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "42%" }}
                                    className="h-full bg-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold text-gray-400 uppercase tracking-widest">DB Synchronization</span>
                                <span className="text-white font-black">98%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "98%" }}
                                    className="h-full bg-purple-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold text-gray-400 uppercase tracking-widest">Network Stability</span>
                                <span className="text-white font-black">Stable</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
                                    <TrendingUp size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Optimization Strategy</p>
                                    <p className="text-xs text-gray-400 leading-tight mt-1">Increasing cache depth for roadmap synthesis leads to 12% faster replies.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 📡 Live Telemetry & IP Location Stream */}
            {telemetry && (
                <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                📡 Real-Time Telemetry & Active User IP Map
                            </h2>
                            <p className="text-xs text-gray-400 font-medium mt-1">
                                Live stream of active users, IP addresses, locations, roadmaps, tasks, and exam arenas across the platform.
                            </p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                            ● Live Feed ({telemetry.liveUsers?.length || 0} Connected)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {telemetry.liveUsers?.slice(0, 6).map((u: any) => (
                            <div key={u._id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-white">{u.name} ({u.role})</p>
                                    <p className="text-[10px] text-cyan-300 font-mono font-bold mt-0.5">🌐 IP: {u.ipAddress}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">📍 {u.city}, India</p>
                                </div>
                                <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                                    Active
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
