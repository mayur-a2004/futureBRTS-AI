import { useState, useEffect } from 'react';
import {
    Cpu,
    Zap,
    Shield,
    Settings,
    RefreshCcw,
    Activity,
    Key,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ToggleLeft,
    ToggleRight,
    CreditCard,
    ExternalLink,
    Database
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AIConfigPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [configs, setConfigs] = useState<any>({
        openrouter: { key: "", isActive: true, isLive: true },
        groq: { key: "", isActive: true, isLive: false },
        gemini: { key: "", isActive: false, isLive: false }
    });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Map DB settings to localized state
                const newConfigs = { ...configs };
                data.settings.forEach((s: any) => {
                    if (s.key.includes('AI_OPENROUTER_KEY')) newConfigs.openrouter.key = s.value;
                    if (s.key.includes('AI_GROQ_KEY')) newConfigs.groq.key = s.value;
                    if (s.key.includes('AI_GEMINI_KEY')) newConfigs.gemini.key = s.value;

                    if (s.key.includes('AI_OPENROUTER_ACTIVE')) newConfigs.openrouter.isActive = s.value === 'true' || s.value === true;
                    if (s.key.includes('AI_GROQ_ACTIVE')) newConfigs.groq.isActive = s.value === 'true' || s.value === true;
                    if (s.key.includes('AI_GEMINI_ACTIVE')) newConfigs.gemini.isActive = s.value === 'true' || s.value === true;

                    if (s.key.includes('AI_LIVE_PROVIDER')) {
                        const live = s.value.toLowerCase();
                        Object.keys(newConfigs).forEach(k => newConfigs[k].isLive = (k === live));
                    }
                });
                setConfigs(newConfigs);
            }
        } catch (err) {
            toast.error("Telemetry link failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (provider: string, updates: any) => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/settings/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ provider, ...updates })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`${provider.toUpperCase()} state synchronized.`);
                fetchConfigs();
            }
        } catch (err) {
            toast.error("Configuration dispatch failed.");
        }
    };

    const ProviderCard = ({ name, icon: Icon, color, data }: any) => {
        const [localKey, setLocalKey] = useState(data.key);

        // If data.key changes from fetch, update local
        useEffect(() => { setLocalKey(data.key); }, [data.key]);

        return (
            <div className={`p-8 rounded-[32px] bg-white/[0.02] border transition-all ${data.isLive ? 'border-indigo-500/50 shadow-2xl shadow-indigo-500/5' : 'border-white/5'}`}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center`}>
                            <Icon className={`text-${color}-400`} size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-widest uppercase">{name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {data.isActive ? (
                                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                        <CheckCircle2 size={10} /> Online
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                        <AlertCircle size={10} /> Suspended
                                    </span>
                                )}
                                {data.isLive && (
                                    <span className="text-[10px] font-black text-white bg-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">Live Prime</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleUpdate(name.toLowerCase(), { isActive: !data.isActive })}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            {!data.isActive ? <ToggleLeft size={32} /> : <ToggleRight size={32} className="text-emerald-500" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Key size={12} /> Neural Key [AES-256]
                        </label>
                        <div className="relative group">
                            <input
                                type="password"
                                value={localKey || ''}
                                onChange={(e) => setLocalKey(e.target.value)}
                                placeholder={`Enter ${name} API Key...`}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono text-indigo-400 outline-none focus:border-indigo-500/50 transition-all"
                                onBlur={() => {
                                    if (localKey !== data.key) handleUpdate(name.toLowerCase(), { key: localKey });
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <p className="text-[10px] font-bold text-gray-500 italic max-w-[150px]">Used for execution & project blueprinting logic.</p>
                        <button
                            disabled={data.isLive}
                            onClick={() => handleUpdate(name.toLowerCase(), { isLive: true })}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${data.isLive ? 'bg-indigo-500/20 text-indigo-400 cursor-default' : 'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/5'}`}
                        >
                            {data.isLive ? 'Set As Live' : 'Make Live'}
                        </button>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div className="max-w-6xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Neural Engine Management</h1>
                    <p className="text-gray-400 mt-1 font-medium">Provision API keys, toggle intelligence providers, and control baseline neural logic.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                        <Activity size={20} />
                    </button>
                    <button onClick={fetchConfigs} className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                        <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-4 bg-white/[0.01] border border-white/5 rounded-[48px]">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Accessing Core Registry...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <ProviderCard name="OpenRouter" icon={Settings} color="purple" data={configs.openrouter} />
                    <ProviderCard name="Groq" icon={Zap} color="orange" data={configs.groq} />
                    <ProviderCard name="Gemini" icon={Cpu} color="indigo" data={configs.gemini} />
                </div>
            )}

            {!isLoading && (
                <div className="p-8 rounded-[40px] bg-black/40 border border-white/5 space-y-8 shadow-2xl mt-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Activity className="text-emerald-400 animate-pulse" size={28} />
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest">Live Pipeline Providers & Billing</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Real-time agent routing and API cost tracking</p>
                            </div>
                        </div>
                        <span className="text-[10px] bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-gray-400 font-black uppercase tracking-widest">Active System</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* OpenRouter */}
                        <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-white font-bold text-lg">OpenRouter (DeepSeek)</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">Core Code Synthesizer</p>
                                </div>
                                <span className="text-[9px] bg-red-500/10 text-red-400 px-3 py-1.5 rounded border border-red-500/20 font-black tracking-widest">PAID API</span>
                            </div>
                            <div className="flex items-center gap-2 mb-6 text-[11px] font-black uppercase tracking-widest text-gray-500">
                                <Cpu size={14} className="text-indigo-400" /> Agents: [5] Backend, [7] Frontend
                            </div>
                            <div className="flex gap-3">
                                <a href="https://openrouter.ai/settings/credits" target="_blank" rel="noreferrer" className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                                    <CreditCard size={16} /> Pay / Refill
                                </a>
                            </div>
                        </div>

                        {/* Groq */}
                        <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-white font-bold text-lg">Groq Cloud (Llama 3)</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">Planner & Auditor</p>
                                </div>
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded border border-emerald-500/20 font-black tracking-widest">FREE / PAID</span>
                            </div>
                            <div className="flex items-center gap-2 mb-6 text-[11px] font-black uppercase tracking-widest text-gray-500">
                                <Cpu size={14} className="text-emerald-400" /> Agents: [1], [2], [3], [4], [6], [8]
                            </div>
                            <div className="flex gap-3">
                                <a href="https://console.groq.com/billing" target="_blank" rel="noreferrer" className="flex-1 px-4 py-3 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                                    <ExternalLink size={16} /> View Usage
                                </a>
                            </div>
                        </div>

                        {/* Kroki */}
                        <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-white font-bold text-lg">Kroki.io Pipeline</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">Architecture Diagrams</p>
                                </div>
                                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded border border-blue-500/20 font-black tracking-widest">100% FREE</span>
                            </div>
                            <div className="flex items-center gap-2 mb-6 text-[11px] font-black uppercase tracking-widest text-gray-500">
                                <Database size={14} className="text-blue-400" /> Unlimited Live Renders
                            </div>
                            <div className="flex gap-3">
                                <span className="flex-1 px-4 py-3 bg-white/[0.02] text-gray-600 border border-white/5 text-[11px] font-black uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2">
                                    <Shield size={16} /> No Account Needed
                                </span>
                            </div>
                        </div>

                        {/* HuggingFace */}
                        <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-white font-bold text-lg">HuggingFace Hub</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">Image & Asset Forge</p>
                                </div>
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded border border-emerald-500/20 font-black tracking-widest">FREE TIER</span>
                            </div>
                            <div className="flex items-center gap-2 mb-6 text-[11px] font-black uppercase tracking-widest text-gray-500">
                                <Database size={14} className="text-amber-400" /> Community Flux/SDXL
                            </div>
                            <div className="flex gap-3">
                                <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="flex-1 px-4 py-3 bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                                    <ExternalLink size={16} /> Access Tokens
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-2xl">
                        <Shield className="text-black" size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-white tracking-tight">Enterprise Fallback Activated</h4>
                        <p className="text-gray-400 text-sm font-medium">If the live provider fails, the system will automatically route signals to the next active node.</p>
                    </div>
                </div>
                <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white">
                    Configure Matrix
                </button>
            </div>
        </div>
    );
}
