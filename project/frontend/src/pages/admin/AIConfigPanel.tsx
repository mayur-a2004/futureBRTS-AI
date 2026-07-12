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
    ExternalLink,
    Database,
    ChevronDown,
    Layers,
    Bot
} from 'lucide-react';
import { toast } from 'react-toastify';

// All available NVIDIA NIM models per task type
const NVIDIA_MODEL_OPTIONS: Record<string, string[]> = {
    chat: [
        'deepseek-ai/deepseek-v4-flash',
        'nvidia/llama-3.3-nemotron-super-49b-v1',
        'meta/llama-3.2-3b-instruct',
        'google/gemma-3n-e4b-it',
        'meta/llama-3.3-70b-instruct',
    ],
    code: [
        'qwen/qwen3.5-122b-a10b',
        'nvidia/nemotron-3-super-120b-a12b',
        'meta/llama-3.3-70b-instruct',
        'google/gemma-4-31b-it',
        'deepseek-ai/deepseek-v4-flash',
    ],
    vision: [
        'meta/llama-3.2-11b-vision-instruct',
        'minimax/minimax-m3',
        'google/gemma-3n-e4b-it',
    ],
    logic: [
        'nvidia/llama-3.3-nemotron-super-49b-v1',
        'meta/llama-3.3-70b-instruct',
        'qwen/qwen3.5-122b-a10b',
        'google/gemma-4-31b-it',
    ],
};

const TASK_LABELS: Record<string, { label: string; desc: string; color: string }> = {
    chat: { label: 'Student Chat & Quiz', desc: 'Minerva chat, quiz battle, real-time Q&A', color: 'emerald' },
    code: { label: 'Code Builder & Roadmap', desc: 'Project builder, syllabus parser, roadmap generation', color: 'indigo' },
    vision: { label: 'Virtual Lab Vision', desc: 'Diagram analysis, image understanding, lab AI', color: 'amber' },
    logic: { label: 'Heavy Logic & Analytics', desc: 'Complex reasoning, analytics, exam generation', color: 'purple' },
};

export default function AIConfigPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [configs, setConfigs] = useState<any>({
        openrouter: { key: '', isActive: true, isLive: false },
        groq: { key: '', isActive: true, isLive: false },
        gemini: { key: '', isActive: false, isLive: false },
        nvidia: { key: '', isActive: true, isLive: true },
    });

    const [nvidiaModels, setNvidiaModels] = useState({
        chat: { primary: 'deepseek-ai/deepseek-v4-flash', secondary: 'nvidia/llama-3.3-nemotron-super-49b-v1' },
        code: { primary: 'qwen/qwen3.5-122b-a10b', secondary: 'nvidia/nemotron-3-super-120b-a12b' },
        vision: { primary: 'meta/llama-3.2-11b-vision-instruct', secondary: 'minimax/minimax-m3' },
        logic: { primary: 'nvidia/llama-3.3-nemotron-super-49b-v1', secondary: 'meta/llama-3.3-70b-instruct' },
    });

    useEffect(() => { fetchConfigs(); }, []);

    const fetchConfigs = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/settings', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                const newConfigs = { ...configs };
                const newModels = { ...nvidiaModels };
                data.settings.forEach((s: any) => {
                    if (s.key === 'AI_OPENROUTER_KEY') newConfigs.openrouter.key = s.value;
                    if (s.key === 'AI_GROQ_KEY') newConfigs.groq.key = s.value;
                    if (s.key === 'AI_GEMINI_KEY') newConfigs.gemini.key = s.value;
                    if (s.key === 'AI_NVIDIA_KEY') newConfigs.nvidia.key = s.value;
                    if (s.key === 'AI_OPENROUTER_ACTIVE') newConfigs.openrouter.isActive = s.value === 'true' || s.value === true;
                    if (s.key === 'AI_GROQ_ACTIVE') newConfigs.groq.isActive = s.value === 'true' || s.value === true;
                    if (s.key === 'AI_GEMINI_ACTIVE') newConfigs.gemini.isActive = s.value === 'true' || s.value === true;
                    if (s.key === 'AI_NVIDIA_ACTIVE') newConfigs.nvidia.isActive = s.value === 'true' || s.value === true;
                    if (s.key === 'NVIDIA_MODEL_CHAT_PRIMARY') newModels.chat.primary = s.value;
                    if (s.key === 'NVIDIA_MODEL_CHAT_SECONDARY') newModels.chat.secondary = s.value;
                    if (s.key === 'NVIDIA_MODEL_CODE_PRIMARY') newModels.code.primary = s.value;
                    if (s.key === 'NVIDIA_MODEL_CODE_SECONDARY') newModels.code.secondary = s.value;
                    if (s.key === 'NVIDIA_MODEL_VISION_PRIMARY') newModels.vision.primary = s.value;
                    if (s.key === 'NVIDIA_MODEL_VISION_SECONDARY') newModels.vision.secondary = s.value;
                    if (s.key === 'NVIDIA_MODEL_LOGIC_PRIMARY') newModels.logic.primary = s.value;
                    if (s.key === 'NVIDIA_MODEL_LOGIC_SECONDARY') newModels.logic.secondary = s.value;
                });
                setConfigs(newConfigs);
                setNvidiaModels(newModels);
            }
        } catch {
            toast.error('Telemetry link failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const saveSetting = async (key: string, value: string) => {
        try {
            const token = localStorage.getItem('fbrts_token');
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ key, value })
            });
            toast.success(`✅ Saved: ${key}`);
        } catch {
            toast.error('Save failed.');
        }
    };

    const handleProviderKeyUpdate = (provider: string, key: string) => {
        saveSetting(`AI_${provider.toUpperCase()}_KEY`, key);
        setConfigs((prev: any) => ({ ...prev, [provider]: { ...prev[provider], key } }));
    };

    const handleProviderToggle = (provider: string) => {
        const newVal = !configs[provider].isActive;
        saveSetting(`AI_${provider.toUpperCase()}_ACTIVE`, String(newVal));
        setConfigs((prev: any) => ({ ...prev, [provider]: { ...prev[provider], isActive: newVal } }));
    };

    const handleNvidiaModelChange = (taskType: string, slot: 'primary' | 'secondary', model: string) => {
        saveSetting(`NVIDIA_MODEL_${taskType.toUpperCase()}_${slot.toUpperCase()}`, model);
        setNvidiaModels((prev: any) => ({ ...prev, [taskType]: { ...prev[taskType], [slot]: model } }));
    };

    const ProviderCard = ({ provider, name, icon: Icon, color }: any) => {
        const data = configs[provider];
        const [localKey, setLocalKey] = useState(data?.key || '');
        useEffect(() => { setLocalKey(data?.key || ''); }, [data?.key]);
        return (
            <div className={`p-5 rounded-[24px] bg-white/[0.02] border transition-all ${data?.isActive ? 'border-white/10' : 'border-white/5'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center`}>
                            <Icon className={`text-${color}-400`} size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white tracking-widest uppercase">{name}</h3>
                            <span className={`text-[10px] font-black ${data?.isActive ? 'text-emerald-400' : 'text-rose-400'} uppercase tracking-widest`}>
                                {data?.isActive ? '● Active' : '● Suspended'}
                            </span>
                        </div>
                    </div>
                    <button onClick={() => handleProviderToggle(provider)} className="text-gray-500 hover:text-white transition-colors">
                        {!data?.isActive ? <ToggleLeft size={26} /> : <ToggleRight size={26} className="text-emerald-500" />}
                    </button>
                </div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1 mb-1.5"><Key size={10} /> API Key</label>
                <input type="password" value={localKey} onChange={(e) => setLocalKey(e.target.value)}
                    placeholder={`Enter ${name} API Key...`}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-indigo-400 outline-none focus:border-indigo-500/50 transition-all"
                    onBlur={() => { if (localKey !== data?.key) handleProviderKeyUpdate(provider, localKey); }} />
            </div>
        );
    };

    return (
        <div className="max-w-6xl space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Neural Engine Management</h1>
                    <p className="text-gray-400 mt-1 font-medium">NVIDIA NIM primary pool + Groq/Gemini fallback. All dynamic from this panel.</p>
                </div>
                <button onClick={fetchConfigs} className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all self-start">
                    <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {isLoading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-4 bg-white/[0.01] border border-white/5 rounded-[48px]">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing AI Registry...</p>
                </div>
            ) : (
                <>
                    {/* ── NVIDIA NIM Primary Engine ── */}
                    <div className="p-8 rounded-[36px] bg-gradient-to-br from-emerald-950/50 to-green-950/30 border border-emerald-500/20 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                    <Bot className="text-emerald-400" size={28} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-2xl font-black text-white tracking-tight">NVIDIA NIM</h2>
                                        <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-black tracking-wider animate-pulse">PRIMARY ENGINE</span>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-0.5">8-model pool • Auto-failover in 1 second • ₹0 cost</p>
                                </div>
                            </div>
                            <button onClick={() => handleProviderToggle('nvidia')} className="text-gray-500 hover:text-white transition-colors">
                                {!configs.nvidia?.isActive ? <ToggleLeft size={34} /> : <ToggleRight size={34} className="text-emerald-500" />}
                            </button>
                        </div>

                        {/* NVIDIA API Key */}
                        <div className="mb-6 p-4 rounded-2xl bg-black/30 border border-white/5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                <Key size={11} /> NVIDIA NIM API Key (nvapi-...)
                            </label>
                            <div className="flex gap-3">
                                <input type="password" value={configs.nvidia?.key || ''}
                                    onChange={(e) => setConfigs((p: any) => ({ ...p, nvidia: { ...p.nvidia, key: e.target.value } }))}
                                    placeholder="nvapi-xxxxxxxxxxxxxxxxxxxx"
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-emerald-400 outline-none focus:border-emerald-500/50 transition-all"
                                    onBlur={() => handleProviderKeyUpdate('nvidia', configs.nvidia?.key || '')} />
                                <a href="https://build.nvidia.com" target="_blank" rel="noreferrer"
                                    className="px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all whitespace-nowrap">
                                    <ExternalLink size={13} /> Get Key
                                </a>
                            </div>
                        </div>

                        {/* Per-Task Model Dropdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(TASK_LABELS).map((taskType) => {
                                const info = TASK_LABELS[taskType];
                                const models = NVIDIA_MODEL_OPTIONS[taskType];
                                const current = nvidiaModels[taskType as keyof typeof nvidiaModels];
                                return (
                                    <div key={taskType} className="p-5 rounded-2xl bg-black/30 border border-white/5 hover:border-white/10 transition-all">
                                        <div className="flex items-start gap-3 mb-4">
                                            <Layers className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                                            <div>
                                                <h4 className="text-white font-black text-sm">{info.label}</h4>
                                                <p className="text-gray-500 text-[10px] font-medium mt-0.5">{info.desc}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                    <CheckCircle2 size={9} /> Primary Model
                                                </label>
                                                <div className="relative">
                                                    <select value={current.primary}
                                                        onChange={(e) => handleNvidiaModelChange(taskType, 'primary', e.target.value)}
                                                        className="w-full bg-black/50 border border-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-emerald-300 font-mono outline-none appearance-none cursor-pointer hover:border-emerald-500/40 transition-all pr-8">
                                                        {models.map((m) => (<option key={m} value={m}>{m}</option>))}
                                                    </select>
                                                    <ChevronDown size={11} className="absolute right-3 top-3 text-emerald-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                    <AlertCircle size={9} /> Fallback Model
                                                </label>
                                                <div className="relative">
                                                    <select value={current.secondary}
                                                        onChange={(e) => handleNvidiaModelChange(taskType, 'secondary', e.target.value)}
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-400 font-mono outline-none appearance-none cursor-pointer hover:border-white/20 transition-all pr-8">
                                                        {models.map((m) => (<option key={m} value={m}>{m}</option>))}
                                                    </select>
                                                    <ChevronDown size={11} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Failover Chain Visualization */}
                        <div className="mt-5 p-4 rounded-xl bg-black/20 border border-white/5">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Activity size={11} className="text-emerald-400" /> Auto Failover Chain
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg">NIM Model 1</span>
                                <span className="text-gray-600">→</span>
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg">NIM Model 2</span>
                                <span className="text-gray-600">→</span>
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg">NIM Model 3</span>
                                <span className="text-gray-600">→</span>
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg">NIM Model 4</span>
                                <span className="text-gray-600">→</span>
                                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-lg">Groq</span>
                                <span className="text-gray-600">→</span>
                                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-lg">OpenRouter</span>
                                <span className="text-gray-600">→</span>
                                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-lg">Gemini</span>
                            </div>
                        </div>
                    </div>

                    {/* Backup Providers */}
                    <div>
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Shield size={13} /> Backup Providers (Auto-used when NVIDIA pool exhausts)
                        </h3>
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                            <ProviderCard provider="groq" name="Groq" icon={Zap} color="orange" />
                            <ProviderCard provider="gemini" name="Gemini" icon={Cpu} color="blue" />
                            <ProviderCard provider="openrouter" name="OpenRouter" icon={Settings} color="purple" />
                        </div>
                    </div>

                    {/* Zero-Cost Services */}
                    <div className="p-6 rounded-[28px] bg-black/30 border border-white/5">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Database size={13} className="text-emerald-400" /> Zero-Cost Services (Always Active — No Key Needed)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { name: 'Pollinations.ai', desc: 'Free diagram generation for Virtual Lab', badge: '100% FREE', link: 'https://pollinations.ai' },
                                { name: 'Kroki.io', desc: 'Architecture diagrams — unlimited renders', badge: '100% FREE', link: 'https://kroki.io' },
                                { name: 'GeoGebra / Chart.js', desc: 'Math graphs & statistics — open source', badge: 'OPEN SOURCE', link: 'https://www.geogebra.org' },
                            ].map((svc) => (
                                <div key={svc.name} className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-white font-bold text-sm">{svc.name}</h4>
                                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-black tracking-widest">{svc.badge}</span>
                                    </div>
                                    <p className="text-gray-500 text-[11px] mb-3">{svc.desc}</p>
                                    <a href={svc.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-emerald-400 flex items-center gap-1 hover:underline">
                                        <ExternalLink size={10} /> Visit
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shield Banner */}
                    <div className="p-6 rounded-[28px] bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-2xl flex-shrink-0">
                                <Shield className="text-black" size={28} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-white tracking-tight">8-Model Failover Active</h4>
                                <p className="text-gray-400 text-sm font-medium">NVIDIA NIM → Groq → OpenRouter → Gemini. Students never see errors.</p>
                            </div>
                        </div>
                        <a href="https://build.nvidia.com" target="_blank" rel="noreferrer"
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap shadow-lg">
                            <ExternalLink size={14} /> NVIDIA NIM Dashboard
                        </a>
                    </div>
                </>
            )}
        </div>
    );
}
