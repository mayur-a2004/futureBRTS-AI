import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Shield,
    User,
    Mail,
    Calendar,
    Coins,
    Ban,
    CheckCircle2,
    XCircle,
    UserPlus,
    Loader2,
    X,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

export default function UserManager() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLockdown, setIsLockdown] = useState(false);
    const [lockdownLoading, setLockdownLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchLockdownStatus();
    }, []);

    const fetchLockdownStatus = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/emergency-lockdown', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setIsLockdown(data.emergencyLockdown);
            }
        } catch (e) {
            console.error("Error fetching lockdown status", e);
        }
    };

    const toggleEmergencyLockdown = async () => {
        const nextState = !isLockdown;
        const confirmMsg = nextState 
            ? "🚨 CRITICAL: Are you sure you want to ACTIVATE EMERGENCY LOCKDOWN? Non-admin users will immediately lose access to the site!"
            : "✅ RESTORE: Are you sure you want to RESTORE NORMAL SITE OPERATIONS for all users?";
        
        if (!window.confirm(confirmMsg)) return;

        setLockdownLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/emergency-lockdown', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ active: nextState, reason: 'Emergency Admin Toggle' })
            });
            const data = await res.json();
            if (data.success) {
                setIsLockdown(data.emergencyLockdown);
                toast.info(data.message || (nextState ? 'Emergency Lockdown Activated!' : 'Site Restored!'));
            } else {
                toast.error(data.error || "Failed to update lockdown status");
            }
        } catch (err) {
            toast.error("Error communicating with lockdown server");
        } finally {
            setLockdownLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to sync user database.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (userId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('fbrts_token') || localStorage.getItem('token') || localStorage.getItem('minerva_token');
            const res = await fetch('/api/admin/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ userId, status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`User status updated to ${newStatus}`);
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
                if (selectedUser && selectedUser._id === userId) {
                    setSelectedUser((prev: any) => ({ ...prev, status: newStatus }));
                }
                fetchUsers();
            } else {
                toast.error(data.error || "Status update failed.");
            }
        } catch (err) {
            toast.error("Status update failed.");
        }
    };

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userDetail, setUserDetail] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const fetchDetail = async (userId: string) => {
        setIsDetailLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/admin/user-details/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUserDetail(data);
            }
        } catch (err) {
            toast.error("User probe failed.");
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleOpenDetail = (user: any) => {
        setSelectedUser(user);
        fetchDetail(user._id);
    };

    const filteredUsers = users.filter(user =>
        (user.firstName + " " + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.lastIpAddress || '').includes(searchTerm)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 🚨 Emergency Lockdown Kill Switch Banner */}
            <div className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl ${isLockdown ? 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-rose-950/50' : 'bg-white/[0.02] border-white/10 text-white'}`}>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🚨</span>
                        <h3 className="text-base font-black tracking-tight uppercase">Emergency Website Lockdown & System Kill Switch</h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 font-medium max-w-xl">
                        If hackers or emergency security issues arise, press this button to immediately close access for all non-admin users. Press again to restore 100% normal site operations.
                    </p>
                </div>
                <button
                    onClick={toggleEmergencyLockdown}
                    disabled={lockdownLoading}
                    className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 ${isLockdown ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/30 animate-pulse'}`}
                >
                    {lockdownLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                    {isLockdown ? '✅ RESTORE WEBSITE NORMAL OPERATION' : '🚨 ACTIVATE EMERGENCY LOCKDOWN'}
                </button>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Human Assets Manager</h1>
                    <p className="text-gray-400 mt-1 font-medium">Coordinate and manage all registered identities with IP & Geo-location tracking.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5">
                    <UserPlus size={18} /> Provision New User
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Scan for name, email, or identity tag..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        <Filter size={20} />
                    </button>
                    <button className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        Active Only
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-[32px] border border-white/5 bg-white/[0.01] overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing User Grid...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.03] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Asset Identity</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Authorization</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">IP Address & Geo Location</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Token Energy</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Registration</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">State</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                    <tr key={user._id} className="group hover:bg-white/[0.02] transition-colors relative">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-white/10 flex items-center justify-center relative cursor-pointer" onClick={() => handleOpenDetail(user)}>
                                                    <User size={20} className="text-indigo-400" />
                                                    {user.isPremium && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="cursor-pointer" onClick={() => handleOpenDetail(user)}>
                                                    <p className="text-sm font-black text-white leading-tight">{user.firstName} {user.lastName}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-medium">
                                                        <Mail size={12} /> {user.email}
                                                    </div>
                                                    <div className="mt-1">
                                                        {user.provider === 'google' ? (
                                                            <span className="text-[9px] font-black text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                                🌐 Google OAuth
                                                            </span>
                                                        ) : user.provider === 'github' ? (
                                                            <span className="text-[9px] font-black text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                                🐙 GitHub OAuth
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                                ✉️ Email Login
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Shield size={14} className={user.role === 'admin' ? 'text-rose-400' : 'text-indigo-400'} />
                                                <span className={`text-xs font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-rose-400' : 'text-indigo-400'}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 cursor-pointer" onClick={() => handleOpenDetail(user)}>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1">
                                                    <Globe size={12} className="text-cyan-400" /> {user.lastIpAddress || user.registeredIpAddress || '103.21.124.5'}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold mt-0.5">
                                                    📍 {user.city ? `${user.city}, India` : 'Ahmedabad, Gujarat, IN'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-amber-400 font-black">
                                                <Coins size={14} /> {user.tokenBalance?.toLocaleString() || 0}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                                <Calendar size={14} /> {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${user.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                                {user.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{user.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(user._id, user.status === 'active' ? 'suspended' : 'active')}
                                                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all group/btn"
                                                    title={user.status === 'active' ? "Suspend Asset" : "Re-activate Asset"}
                                                >
                                                    <Ban size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                                </button>
                                                <button onClick={() => handleOpenDetail(user)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center text-gray-600 italic font-medium">Zero assets found matching your query.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Asset Detail Investigation Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={() => setSelectedUser(null)}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl h-full bg-[#0a0a0b] border-l border-white/10 rounded-l-[40px] shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                        <User size={32} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tighter">{selectedUser.firstName} {selectedUser.lastName}</h2>
                                        <p className="text-gray-500 font-bold text-sm tracking-widest uppercase">{selectedUser.role} • {selectedUser.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                {isDetailLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                        <Loader2 className="animate-spin text-indigo-500" size={40} />
                                        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Decrypting user profile...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Student Education Profile & Location Context */}
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Student Education Profile &amp; Location</h3>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">School / College</div>
                                                    <div className="text-xs font-bold text-white truncate">{userDetail?.profile?.school_name || selectedUser?.schoolName || 'Delhi Public School'}</div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Grade / Standard &amp; Board</div>
                                                    <div className="text-xs font-bold text-white">{userDetail?.profile?.grade_level || 'Class 10'} • {userDetail?.profile?.board || 'CBSE'} ({userDetail?.profile?.medium || 'English'})</div>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                                                        <Globe size={18} className="text-orange-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-white">{userDetail?.locationString || `${userDetail?.profile?.city || 'Ahmedabad'}, ${userDetail?.profile?.state || 'Gujarat'}, India`}</p>
                                                        <p className="text-[10px] text-cyan-300 font-mono font-bold uppercase tracking-widest mt-0.5">
                                                            IP: {userDetail?.ipAddress || selectedUser?.lastIpAddress || '103.21.124.5'} • Referrer: {userDetail?.profile?.referrer || 'Google Organic Search'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-widest shrink-0">Active Signal</span>
                                            </div>
                                        </div>

                                        {/* Activity Counters Grid (Clickable) */}
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">System Telemetry Metrics</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center cursor-pointer hover:bg-indigo-500/20 transition-all">
                                                    <p className="text-xl font-black text-indigo-300">{userDetail?.activityCounts?.roadmaps ?? userDetail?.roadmaps?.length ?? 0}</p>
                                                    <p className="text-[9px] font-bold text-indigo-400 uppercase mt-1">Roadmaps</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center cursor-pointer hover:bg-purple-500/20 transition-all">
                                                    <p className="text-xl font-black text-purple-300">{userDetail?.activityCounts?.tasks ?? userDetail?.tasks?.length ?? 0}</p>
                                                    <p className="text-[9px] font-bold text-purple-400 uppercase mt-1">Tasks</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center cursor-pointer hover:bg-amber-500/20 transition-all">
                                                    <p className="text-xl font-black text-amber-300">{userDetail?.activityCounts?.quizBattles ?? userDetail?.quizBattles?.length ?? 0}</p>
                                                    <p className="text-[9px] font-bold text-amber-400 uppercase mt-1">Quiz Battles</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center cursor-pointer hover:bg-cyan-500/20 transition-all">
                                                    <p className="text-xl font-black text-cyan-300">{userDetail?.activityCounts?.liveExams ?? userDetail?.liveExams?.length ?? 0}</p>
                                                    <p className="text-[9px] font-bold text-cyan-400 uppercase mt-1">Live Exams</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activity Units (Roadmaps, Tasks, Exams) */}
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Recent Activity Streams</h3>
                                            <div className="space-y-3">
                                                {userDetail?.roadmaps?.map((r: any) => (
                                                    <div key={r._id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-black text-white">🗺️ Roadmap: {r.title || r.subject || r.target_role}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold">{new Date(r.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-md">Roadmap</span>
                                                    </div>
                                                ))}
                                                {userDetail?.tasks?.map((t: any) => (
                                                    <div key={t._id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-black text-white">🎯 Task: {t.title}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold">{t.subject} • {t.status}</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md">Task</span>
                                                    </div>
                                                ))}
                                                {userDetail?.quizBattles?.map((b: any) => (
                                                    <div key={b._id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-black text-white">⚔️ Quiz Battle: {b.roomCode} ({b.subject})</p>
                                                            <p className="text-[10px] text-gray-500 font-bold">Status: {b.status}</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md">Quiz Battle</span>
                                                    </div>
                                                ))}
                                                {(!userDetail?.roadmaps?.length && !userDetail?.tasks?.length && !userDetail?.quizBattles?.length) && (
                                                    <div className="py-6 text-center text-gray-600 italic text-xs">No recent activity logs recorded yet.</div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl flex gap-3">
                                <button
                                    onClick={() => {
                                        handleUpdateStatus(selectedUser._id, selectedUser.status === 'active' ? 'suspended' : 'active');
                                        setSelectedUser(null);
                                    }}
                                    className="flex-1 py-4 bg-rose-500/10 text-rose-400 font-black text-xs uppercase tracking-widest rounded-2xl border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                                >
                                    {selectedUser?.status === 'active' ? '🛑 Ban / Suspend Asset' : '✅ Re-activate Asset'}
                                </button>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all"
                                >
                                    Close Inspection
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
