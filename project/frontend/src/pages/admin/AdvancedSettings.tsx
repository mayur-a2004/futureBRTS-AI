import { useState, useEffect } from 'react';
import {
    Cpu,
    Shield,
    Zap,
    Database,
    RefreshCcw,
    ChevronRight,
    Lock,
    Loader2,
    Sparkles,
    CreditCard,
    ExternalLink,
    Activity
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdvancedSettings() {
    const [settings, setSettings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [, setIsSaving] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'ai' | 'security' | 'perf' | 'storage'>('ai');

    // 🔐 Admin 2FA OTP Credential Change State
    const [otpTargetEmail, setOtpTargetEmail] = useState('mayursavaliya2004@gmail.com');
    const [otpCode, setOtpCode] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [latestGeneratedOtp, setLatestGeneratedOtp] = useState<string>('');

    const handleRequestOtp = async () => {
        setOtpLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            let res = await fetch('/api/admin/request-credential-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ targetEmail: otpTargetEmail })
            });

            if (!res.ok) {
                res = await fetch('/api/auth/admin/request-credential-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ targetEmail: otpTargetEmail })
                });
            }

            const data = await res.json();
            if (data.success) {
                setIsOtpSent(true);
                if (data.devOtpPreview) {
                    setLatestGeneratedOtp(data.devOtpPreview);
                    setOtpCode(data.devOtpPreview);
                }
                toast.success(data.message || `Security OTP dispatched to ${otpTargetEmail}`);
            } else {
                toast.error(data.error || 'Failed to request OTP');
            }
        } catch (err: any) {
            toast.error('Error sending OTP: ' + err.message);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleUpdateCredentials = async () => {
        if (!otpCode) {
            toast.error('Please enter the 6-Digit Security OTP');
            return;
        }
        setOtpLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            let res = await fetch('/api/admin/update-credentials-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ otp: otpCode, newEmail: newAdminEmail, newPassword: newAdminPassword })
            });

            if (!res.ok) {
                res = await fetch('/api/auth/admin/update-credentials-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ otp: otpCode, newEmail: newAdminEmail, newPassword: newAdminPassword })
                });
            }

            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setIsOtpSent(false);
                setOtpCode('');
                setNewAdminEmail('');
                setNewAdminPassword('');
            } else {
                toast.error(data.error || 'Credential update failed');
            }
        } catch (err: any) {
            toast.error('Error updating credentials');
        } finally {
            setOtpLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSettings(data.settings);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch system constants.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (key: string, value: any) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ key, value })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`${key} modified in global registry.`);
                fetchSettings();
            }
        } catch (err) {
            toast.error("Registry update failed.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Genesis Core Configuration</h1>
                    <p className="text-gray-400 mt-1 font-medium">Manipulate fundamental system constants and neural parameters.</p>
                </div>
                <button
                    onClick={fetchSettings}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"
                >
                    <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Categories */}
                <div className="space-y-2">
                    {[
                        { id: 'ai', name: 'Neural Engine', icon: Cpu, color: 'indigo' },
                        { id: 'security', name: 'Security Protocol', icon: Shield, color: 'rose' },
                        { id: 'perf', name: 'Performance Unit', icon: Zap, color: 'amber' },
                        { id: 'storage', name: 'Storage Matrix', icon: Database, color: 'purple' },
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id as any)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${activeCategory === cat.id ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}`}
                        >
                            <div className={`p-2 rounded-xl bg-white/5`}>
                                <cat.icon size={18} className={activeCategory === cat.id ? 'text-indigo-400' : 'text-gray-500'} />
                            </div>
                            <span className={`text-sm font-black uppercase tracking-widest ${activeCategory === cat.id ? 'text-white font-black' : 'text-gray-500'}`}>
                                {cat.name}
                            </span>
                            <ChevronRight size={14} className={`ml-auto transition-transform ${activeCategory === cat.id ? 'rotate-90 text-indigo-400 opacity-100' : 'opacity-30'}`} />
                        </button>
                    ))}
                </div>                {/* Settings Matrix */}
                <div className="md:col-span-2 space-y-6">
                    {isLoading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-4 bg-white/[0.01] border border-white/5 rounded-[32px]">
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Accessing Core Registry...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* 🧠 CATEGORY 1: NEURAL ENGINE */}
                            {activeCategory === 'ai' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    {/* 🔥 Live AI Pipeline Dashboard */}
                                    <div className="p-6 rounded-3xl bg-black/40 border border-white/5 space-y-6 shadow-2xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Activity className="text-emerald-400 animate-pulse" />
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Pipeline Providers & Billing</h3>
                                            </div>
                                            <span className="text-[10px] bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-gray-400 font-black uppercase tracking-widest">Active System</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* OpenRouter */}
                                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm">OpenRouter (DeepSeek)</h4>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">Core Code Synthesizer</p>
                                                    </div>
                                                    <span className="text-[9px] bg-red-500/10 text-red-400 px-2.5 py-1 rounded border border-red-500/20 font-black tracking-widest">PAID API</span>
                                                </div>
                                                <div className="flex items-center gap-2 mb-5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                    <Cpu size={12} className="text-indigo-400" /> Agents: [5] Backend, [7] Frontend
                                                </div>
                                                <div className="flex gap-2">
                                                    <a href="https://openrouter.ai/settings/credits" target="_blank" rel="noreferrer" className="flex-1 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                                                        <CreditCard size={14} /> Pay / Refill
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Groq */}
                                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm">Groq Cloud (Llama 3)</h4>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">Planner & Auditor</p>
                                                    </div>
                                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20 font-black tracking-widest">FREE / PAID</span>
                                                </div>
                                                <div className="flex items-center gap-2 mb-5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                    <Cpu size={12} className="text-emerald-400" /> Agents: [1], [2], [3], [4], [6], [8]
                                                </div>
                                                <div className="flex gap-2">
                                                    <a href="https://console.groq.com/billing" target="_blank" rel="noreferrer" className="flex-1 px-3 py-2.5 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                                                        <ExternalLink size={14} /> View Usage
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🚀 Dynamic Provider Key Injector */}
                                    <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Sparkles size={18} className="text-indigo-400" />
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Override Neural Keys</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="KEY_NAME (e.g. AI_OPENROUTER_KEY)"
                                                id="new-key-name"
                                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-indigo-500/50"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="Secure Value"
                                                    id="new-key-value"
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-indigo-500/50"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const k = (document.getElementById('new-key-name') as HTMLInputElement).value;
                                                        const v = (document.getElementById('new-key-value') as HTMLInputElement).value;
                                                        if (k && v) handleUpdate(k, v);
                                                    }}
                                                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all"
                                                >
                                                    Inject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 🛡️ CATEGORY 2: SECURITY PROTOCOL */}
                            {activeCategory === 'security' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    {/* Live OTP Banner */}
                                    {latestGeneratedOtp && (
                                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Sparkles className="text-emerald-400" size={20} />
                                                <div>
                                                    <p className="text-xs font-black text-emerald-300 uppercase tracking-widest">Active Security OTP Generated</p>
                                                    <p className="text-xl font-mono font-black text-white">{latestGeneratedOtp}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(latestGeneratedOtp);
                                                    toast.success("OTP Copied to Clipboard!");
                                                }}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
                                            >
                                                📋 Copy OTP
                                            </button>
                                        </div>
                                    )}

                                    {/* Master Admin Credentials 2FA Card */}
                                    <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-500/10 via-black to-indigo-500/10 border border-rose-500/30 space-y-6 shadow-2xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                                                    <Shield size={20} className="text-rose-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Master Admin Credential 2FA Security</h3>
                                                    <p className="text-[11px] text-gray-400 font-medium">Update Admin Email/Password via Mandatory 2-Factor OTP</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] bg-rose-500/20 text-rose-300 font-black px-3 py-1 rounded-full border border-rose-500/30 tracking-widest uppercase">Strict 2FA OTP Protected</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Master Email for OTP</label>
                                                <select
                                                    value={otpTargetEmail}
                                                    onChange={(e) => setOtpTargetEmail(e.target.value)}
                                                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-rose-500/50"
                                                >
                                                    <option value="mayursavaliya2004@gmail.com">mayursavaliya2004@gmail.com (Master Admin 1)</option>
                                                    <option value="visup409@gmail.com">visup409@gmail.com (Master Admin 2)</option>
                                                </select>
                                            </div>

                                            <div className="flex items-end">
                                                <button
                                                    onClick={handleRequestOtp}
                                                    disabled={otpLoading}
                                                    className="w-full px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {otpLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                                                    {isOtpSent ? 'Resend 6-Digit Security OTP' : 'Request 6-Digit Security OTP'}
                                                </button>
                                            </div>
                                        </div>

                                        {isOtpSent && (
                                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 animate-in fade-in duration-300">
                                                <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                                                    <Sparkles size={16} /> Security OTP code generated: <span className="font-mono text-white font-black">{latestGeneratedOtp || otpCode}</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter 6-Digit OTP Code"
                                                        value={otpCode}
                                                        onChange={(e) => setOtpCode(e.target.value)}
                                                        className="bg-black/60 border border-rose-500/40 rounded-xl px-4 py-3 text-sm font-mono text-center text-white tracking-widest outline-none focus:border-rose-400"
                                                    />
                                                    <input
                                                        type="email"
                                                        placeholder="New Admin Email (Optional)"
                                                        value={newAdminEmail}
                                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                                        className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder="New Admin Password (Optional)"
                                                        value={newAdminPassword}
                                                        onChange={(e) => setNewAdminPassword(e.target.value)}
                                                        className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500"
                                                    />
                                                </div>

                                                <button
                                                    onClick={handleUpdateCredentials}
                                                    disabled={otpLoading || !otpCode}
                                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {otpLoading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                                                    Verify OTP &amp; Commit Admin Credential Update
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ⚡ CATEGORY 3: PERFORMANCE UNIT */}
                            {activeCategory === 'perf' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Zap className="text-amber-400" size={24} />
                                            <div>
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Performance & Caching Optimization</h3>
                                                <p className="text-xs text-gray-400">Manage Redis/Memory Cache TTL, connection pools, and payload compression.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cache Time-To-Live (TTL)</span>
                                                <p className="text-xl font-black text-amber-400 font-mono">3,600 sec (1 Hr)</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">MongoDB Max Connection Pool</span>
                                                <p className="text-xl font-black text-emerald-400 font-mono">50 Connections</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 💾 CATEGORY 4: STORAGE MATRIX */}
                            {activeCategory === 'storage' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="p-6 rounded-3xl bg-purple-500/5 border border-purple-500/20 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Database className="text-purple-400" size={24} />
                                            <div>
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Storage Matrix & Database Collections</h3>
                                                <p className="text-xs text-gray-400">Inspect collection statistics, upload directory storage, and database backup routines.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total DB Size</span>
                                                <p className="text-lg font-black text-white font-mono">248.4 MB</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Uploads Folder</span>
                                                <p className="text-lg font-black text-purple-400 font-mono">1.2 GB</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Backups Status</span>
                                                <p className="text-lg font-black text-emerald-400 font-mono">Synced Daily</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Global Constants Panel */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3 px-2">
                                    <Database size={16} className="text-indigo-400" />
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Global Constant Registry</h3>
                                </div>
                                <div className="space-y-6 bg-black/20 p-6 rounded-3xl border border-white/5">
                                    {settings.map((s) => (
                                        <div key={s.key} className="space-y-3 group">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{s.key}</p>
                                                    <p className="text-xs text-gray-400 font-bold max-w-sm leading-tight">{s.description || 'Global system constant.'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 text-gray-700 hover:text-white transition-colors">
                                                        <Lock size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <input
                                                    type={s.key.includes('KEY') ? 'password' : 'text'}
                                                    defaultValue={s.value}
                                                    onBlur={(e) => {
                                                        if (e.target.value !== String(s.value)) {
                                                            handleUpdate(s.key, e.target.value);
                                                        }
                                                    }}
                                                    className="flex-1 px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-black text-white font-mono"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {settings.length === 0 && (
                                        <div className="py-12 text-center text-gray-500 font-medium">Core constants loaded into registry.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
