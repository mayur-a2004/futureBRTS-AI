import { useState } from 'react';
import {
    ShieldCheck,
    Key,
    Lock,
    Unlock,
    Save,
    RefreshCcw,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function PermissionsManager() {
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState([
        { id: 'admin', name: 'Supreme Administrator', permissions: ['ALL_ACCESS', 'GSC_CONTROL', 'NEURAL_UPDATE', 'USER_MOD'], level: 99 },
        { id: 'moderator', name: 'Neural Moderator', permissions: ['USER_VIEW', 'TASK_REVIEW', 'SUPPORT_CHAT'], level: 50 },
        { id: 'user_premium', name: 'Master Builder', permissions: ['UNLIMITED_SYNTHESIS', 'DEEP_LEARNING', 'PRIORITY_QUEUE'], level: 10 },
        { id: 'user_free', name: 'Aspirant', permissions: ['BASIC_SYNTHESIS', 'COMMUNITY_ACCESS'], level: 1 },
    ]);

    const handleLevelChange = (roleId: string, newLevel: number) => {
        setRoles(roles.map(r => r.id === roleId ? { ...r, level: newLevel } : r));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    key: 'RBAC_MATRIX',
                    value: JSON.stringify(roles),
                    description: 'Global Role-Based Access Control configuration'
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("RBAC Permission Matrix Synchronized in Core Registry.");
            } else {
                toast.error("Registry update failed.");
            }
        } catch (err) {
            toast.error("Network conflict: Authority update failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tighter">Authority Matrix</h1>
                <p className="text-gray-400 mt-1 font-medium">Define Role-Based Access Control (RBAC) and security tiers.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {roles.map((role) => (
                    <div key={role.id} className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.03] transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-white/10 flex items-center justify-center shrink-0">
                                    <ShieldCheck size={32} className={role.id === 'admin' ? 'text-rose-500' : 'text-indigo-400'} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">{role.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Key size={12} className="text-gray-500" />
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ID: {role.id}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 md:max-w-md justify-start md:justify-end">
                                {role.permissions.map((p, i) => (
                                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                        {p}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5 px-6">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Power Level</p>
                                    <p className="text-lg font-black text-white tabular-nums">{role.level}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => handleLevelChange(role.id, Math.min(role.level + 1, 99))} className="p-1 hover:text-white text-gray-600 transition-colors"><Unlock size={12} /></button>
                                    <button onClick={() => handleLevelChange(role.id, Math.max(role.level - 1, 0))} className="p-1 hover:text-white text-gray-600 transition-colors"><Lock size={12} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between p-8 rounded-[32px] bg-white/[0.01] border border-dashed border-white/10">
                <div className="flex items-center gap-4">
                    <AlertCircle className="text-amber-500" size={24} />
                    <div>
                        <p className="text-sm font-bold text-white">Critical Authority Lock</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Permission changes are applied instantly to all active neural sessions.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                >
                    {isLoading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
                    Enforce Matrix
                </button>
            </div>
        </div>
    );
}
