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
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${cat.id === 'ai' ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                        >
                            <div className={`p-2 rounded-xl bg-white/5`}>
                                <cat.icon size={18} className={cat.id === 'ai' ? 'text-indigo-400' : 'text-gray-500'} />
                            </div>
                            <span className={`text-sm font-black uppercase tracking-widest ${cat.id === 'ai' ? 'text-white' : 'text-gray-500'}`}>
                                {cat.name}
                            </span>
                            <ChevronRight size={14} className="ml-auto opacity-30" />
                        </button>
                    ))}
                </div>

                {/* Settings Matrix */}
                <div className="md:col-span-2 space-y-6">
                    {isLoading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-4 bg-white/[0.01] border border-white/5 rounded-[32px]">
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Accessing Core Registry...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
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

                                    {/* Kroki */}
                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-white font-bold text-sm">Kroki.io Pipeline</h4>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">Architecture Diagrams</p>
                                            </div>
                                            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded border border-blue-500/20 font-black tracking-widest">100% FREE</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <Database size={12} className="text-blue-400" /> Unlimited Live Renders
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="flex-1 px-3 py-2.5 bg-white/[0.02] text-gray-600 border border-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2">
                                                <Shield size={14} /> No Account Needed
                                            </span>
                                        </div>
                                    </div>

                                    {/* HuggingFace */}
                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-white font-bold text-sm">HuggingFace Hub</h4>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">Image & Asset Forge</p>
                                            </div>
                                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20 font-black tracking-widest">FREE TIER</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <Database size={12} className="text-amber-400" /> Community Flux/SDXL
                                        </div>
                                        <div className="flex gap-2">
                                            <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="flex-1 px-3 py-2.5 bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                                                <ExternalLink size={14} /> Access Tokens
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 🚀 Dynamic Provider Key Injector (New) */}
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
                                            className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-black"
                                        >
                                            <Zap size={16} /> Update
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
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
                                        <div className="py-20 text-center text-gray-600 italic font-medium">No core constants registered in this unit.</div>
                                    )}
                                </div>

                                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                    <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest flex items-center gap-2">
                                        <Shield size={12} /> Modifying core constants requires L3 Authorization
                                    </p>
                                    <button className="flex items-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">
                                        View Audit Logs <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
