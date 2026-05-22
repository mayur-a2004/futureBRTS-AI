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
    MessageSquare,
    Globe,
    ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

export default function UserManager() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

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
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`User status updated to ${newStatus}`);
                fetchUsers();
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
            const res = await fetch(`/api/admin/user/${userId}`, {
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
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Human Assets Manager</h1>
                    <p className="text-gray-400 mt-1 font-medium">Coordinate and manage all registered identities.</p>
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
                                        {/* Location & Context */}
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Location Intel</h3>
                                            <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                                        <Globe size={18} className="text-orange-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-white">{userDetail?.location?.city || 'Undetected City'}, {userDetail?.location?.country || 'International waters'}</p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{userDetail?.location?.ip || 'Encrypted IP'}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Signal</span>
                                            </div>
                                        </div>

                                        {/* Onboarding Summary */}
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Onboarding Signal</h3>
                                            <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 grid grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Field</p>
                                                    <p className="text-sm font-black text-white">{userDetail?.onboarding?.field || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Life Stage</p>
                                                    <p className="text-sm font-black text-white">{userDetail?.onboarding?.life_stage || 'N/A'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Final Goal</p>
                                                    <p className="text-sm font-bold text-indigo-400">{userDetail?.onboarding?.final_goal || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activity Units (Roadmap & Sessions) */}
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Neural Activity</h3>
                                            <div className="space-y-3">
                                                {userDetail?.sessions?.map((s: any) => (
                                                    <div key={s._id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all cursor-pointer">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                                                                <MessageSquare size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-white">{s.title || 'Untitled Session'}</p>
                                                                <p className="text-[10px] text-gray-500 font-bold">{s.messages?.length || 0} Neural Exchanges</p>
                                                            </div>
                                                        </div>
                                                        <ChevronRightIcon size={18} className="text-gray-700 group-hover:text-white transition-all" />
                                                    </div>
                                                ))}
                                                {(!userDetail?.sessions || userDetail.sessions.length === 0) && (
                                                    <div className="py-10 text-center text-gray-600 italic font-medium">No activity signals found.</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Economy History */}
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Economy Log</h3>
                                            <div className="p-1 rounded-[28px] border border-white/5 bg-white/[0.01]">
                                                {userDetail?.transactions?.map((t: any) => (
                                                    <div key={t._id} className="p-4 flex items-center justify-between border-b border-white/5 last:border-0">
                                                        <div>
                                                            <p className="text-xs font-black text-white">Token Recharge</p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{t.provider} • {new Date(t.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-black text-emerald-400">₹{t.amount}</p>
                                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{t.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl flex gap-3">
                                <button className="flex-1 py-4 bg-rose-500/10 text-rose-500 font-black text-xs uppercase tracking-widest rounded-2xl border border-rose-500/20 hover:bg-rose-500/20 transition-all">
                                    Flag & Suspend
                                </button>
                                <button className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
                                    Inject Energy
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
