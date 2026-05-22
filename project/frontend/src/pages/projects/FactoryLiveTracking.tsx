import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, CheckCircle, Database, Layout, Server, Brain,
    Download, ArrowLeft, Terminal, FileCode,
    Folder, Layers, Box, Cpu, Rocket, MessageSquare, Activity, Play, Send
} from 'lucide-react';
import UniverseBackground from '@/components/ui/UniverseBackground';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/Button';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-markup'; // For Vue/HTML
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' });

const MermaidViewer = ({ chart }: { chart: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current && chart) {
            try {
                // H1 & L1: Safer ID for mermaid to prevent collisions + Memoize prevents re-render wiping
                const safeId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                mermaid.render(safeId, chart).then(({ svg }) => {
                    if (ref.current) ref.current.innerHTML = svg;
                }).catch(e => console.error("Mermaid render error:", e));
            } catch (e) {
                console.error("Mermaid core error:", e);
            }
        }
    }, [chart]);
    return <div ref={ref} className="mermaid flex justify-center w-full items-center overflow-auto max-h-[400px]" />;
};

type TabType = 'OVERVIEW' | 'FILES' | 'DIAGRAMS' | 'DOCS' | 'ROADMAP';

export default function ProjectStudio() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');

    // Live Agent State
    const [virtualFiles, setVirtualFiles] = useState<string[]>([]);
    const [fileContents, setFileContents] = useState<Record<string, string>>({});
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [liveLogs, setLiveLogs] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const chatBottomRef = useRef<HTMLDivElement>(null);

    const CORE_STEPS = [
        { id: 'analyze', name: 'Neural Planner', icon: <Brain size={12} />, ordinal: 1 },
        { id: 'blueprint', name: 'Blueprint Engine', icon: <Layers size={12} />, ordinal: 2 },
        { id: 'context_memory', name: 'Context Fusion', icon: <Cpu size={12} />, ordinal: 3 },
        { id: 'database', name: 'Database Forge', icon: <Database size={12} />, ordinal: 4 },
        { id: 'api', name: 'API Nexus', icon: <Server size={12} />, ordinal: 5 },
        { id: 'backend_module', name: 'Backend Synthesis', icon: <Server size={12} />, ordinal: 6 },
        { id: 'frontend_module', name: 'Frontend Synthesis', icon: <Layout size={12} />, ordinal: 7 },
        { id: 'packaging', name: 'Compiler & Packager', icon: <Box size={12} />, ordinal: 8 }
    ];

    const fetchProject = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/collage-project/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setProject(data.project);
                    const initialLogs = (data.project.logs || []).map((l: any) => {
                        try { return typeof l === 'string' ? JSON.parse(l) : l; } catch { return l; }
                    });
                    setLiveLogs(initialLogs);

                    // Fetch Real Tasks
                    const taskRes = await fetch(`/api/collage-project/${id}/tasks`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const taskData = await taskRes.json();
                    setTasks(taskData.tasks || []);

                    const legacyFiles = initialLogs
                        .filter((l: any) => l.metadata?.type === 'file_discovery' && typeof l.metadata?.path === 'string')
                        .map((l: any) => l.metadata.path);

                    // Fetch Real System Logs
                    const logsRes = await fetch(`/api/collage-project/${id}/system-logs`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const logsData = await logsRes.json();
                    if (logsData.success && logsData.logs) {
                        setLiveLogs(() => {
                            const combined = [...initialLogs, ...logsData.logs];
                            const uniqueMap = new Map();
                            combined.forEach(log => {
                                // M3/F12: Truly stable composite key
                                const key = log._id || `${log.timestamp}-${log.message}-${log.agent}`;
                                if (!uniqueMap.has(key)) uniqueMap.set(key, log);
                            });
                            return Array.from(uniqueMap.values());
                        });
                    }

                    // Fetch actual files
                    const fileRes = await fetch(`/api/collage-project/${id}/files`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const fileData = await fileRes.json();
                    const dbFiles = (fileData.files || []).map((f: any) => f.filePath).filter((p: any) => typeof p === 'string');
                    
                    setVirtualFiles(Array.from(new Set([...legacyFiles, ...dbFiles])).filter(f => typeof f === 'string'));
                }
            }
        } catch (e) {
            console.error("Sync Error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
        let socket: any;

        if (id) {
            // L5: Hardened URL replacement regex so it doesn't break if port changes
            const socketUrl = (import.meta as any).env?.VITE_SOCKET_URL || window.location.origin.replace(/:\d+$/, ':7001');
            socket = io(socketUrl);

            socket.on('connect', () => {
                socket.emit('join_session', id);
            });
            
            // Listen for agent logs
            socket.on('agent_pulse', (data: any) => {
                if (data.metadata?.type === 'code_stream' && data.metadata?.path) {
                    setFileContents((prev: any) => ({
                        ...prev,
                        [data.metadata.path]: data.metadata.content || ""
                    }));
                    setVirtualFiles((prev: any) => Array.from(new Set([...prev, data.metadata.path])));
                }
                if (data.metadata?.type === 'file_discovery' && data.metadata?.path) {
                    setVirtualFiles((prev: any) => Array.from(new Set([...prev, data.metadata.path])));
                }
                setLiveLogs((prev: any) => {
                    const next = [...prev, data];
                    return next.length > 500 ? next.slice(-500) : next;
                });
            });

            // Add listener for newly created real files
            socket.on('file_created', (data: any) => {
                if (data.path) {
                    setVirtualFiles((prev: any) => Array.from(new Set([...prev, data.path])));
                }
            });

            socket.on('project_update', (update: any) => {
                // F12: Selective merge to prevent UI wipeout
                setProject((prev: any) => {
                    if (!prev) return update;
                    const next = { ...prev, ...update };
                    // Preserve nested objects if update doesn't have them
                    if (!update.blueprint && prev.blueprint) next.blueprint = prev.blueprint;
                    if (!update.artifacts && prev.artifacts) next.artifacts = prev.artifacts;
                    return next;
                });
                if (update.status === 'COMPLETED') fetchProject();
            });

            socket.on('task_update', (data: any) => {
                setTasks((prev: any) => {
                    const exists = prev.find((t: any) => t.taskType === data.taskType);
                    if (exists) return prev.map((t: any) => t.taskType === data.taskType ? { ...t, status: data.status } : t);
                    return [...prev, data];
                });
            });

            socket.on('chat_reply', (msg: any) => {
                // H2: Replace the Optimistic PROCESSING message to prevent double-entries
                setChatHistory(prev => {
                    const filtered = prev.filter(m => m.status === 'PROCESSING' ? m.userMessage !== msg.userMessage : true);
                    return [...filtered, msg];
                });
            });
        }
        return () => { if (socket) socket.disconnect(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        const fetchContent = async () => {
            if (selectedFile && !fileContents[selectedFile]) {
                try {
                    const token = localStorage.getItem('fbrts_token');
                    const res = await fetch(`/api/collage-project/${id}/file-content?path=${encodeURIComponent(selectedFile)}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.success) {
                        setFileContents((prev: any) => ({ ...prev, [selectedFile]: data.content }));
                    }
                } catch (e) {
                    console.error("Content Sync Error:", e);
                }
            }
        };
        fetchContent();
        // H3: Removed fileContents from dependency array to prevent infinite fetch loop on network error
    }, [selectedFile, id]);

    // Fetch Chat History once on load
    useEffect(() => {
        const fetchChat = async () => {
             if (!id) return;
             try {
                const token = localStorage.getItem('fbrts_token');
                const res = await fetch(`/api/collage-project/${id}/chat-history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) setChatHistory(data.history || []);
             } catch (e) { console.error(e); }
        };
        fetchChat();
    }, [id]);

    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'auto' });
    }, [liveLogs.length]);

    useEffect(() => {
        if (chatBottomRef.current) chatBottomRef.current.scrollIntoView({ behavior: 'auto' });
    }, [chatHistory, isChatOpen]);

    useEffect(() => {
        if (activeTab === 'FILES' && selectedFile) {
            requestAnimationFrame(() => Prism.highlightAll()); // L8 Fix: Native frame scheduling instead of 50ms race condition
        }
    }, [activeTab, selectedFile, fileContents]);

    const handleApprove = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/collage-project/${id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            // F11: UI Error Handling for Build Block
            if (!data.success) {
                alert(`BUILD_ERROR: ${data.message || 'Check connection'}`);
            } else {
                fetchProject();
            }
        } catch (e: any) {
            console.error(e);
            alert("ENGINE_COLLAPSE: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    // F10: Secure Downloader (Blob-based)
    const secureDownload = async (url: string, filename: string) => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}token=${token}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Download failed");
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (e) {
            alert("DOWNLOAD_SYNC_FAULT: Permission rejected or file missing.");
        }
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const msg = chatInput;
        setChatInput('');
        setIsChatOpen(true); // Open chat window on send
        
        // Optimistic UI update
        const tempId = Date.now().toString();
        setChatHistory(prev => [...prev, { _id: tempId, userMessage: msg, status: 'PROCESSING', aiResponse: '' }]);

        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/collage-project/${id}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: msg })
            });
            if (!res.ok) throw new Error("API Execution Failed");
            // Result is actively managed by 'chat_reply' Socket event
        } catch (err) {
            console.error(err);
            setChatHistory(prev => prev.map(m => m._id === tempId ? { ...m, status: 'FAILED', aiResponse: '⚠️ Transmission failed. Please try again.' } : m));
        }
    };

    if (loading && !project) return <div className="fixed inset-0 z-[100] bg-[#030304] flex items-center justify-center"><Loader2 className="animate-spin text-[#6366f1] w-12 h-12" /></div>;
    if (!project) return <div className="fixed inset-0 z-[100] bg-[#030304] flex items-center justify-center text-[#f43f5e] font-black tracking-widest text-[11px] md:text-[13px] uppercase">VAULT_ACCESS_DENIED</div>;

    const isComplete = project.status === 'COMPLETED';
    const isAwaiting = project.status === 'AWAITING_APPROVAL';

    const TABS: { id: TabType, label: string }[] = [
        { id: 'OVERVIEW', label: 'OVERVIEW' },
        { id: 'FILES', label: 'FILE SYS' },
        { id: 'DIAGRAMS', label: 'DIAGRAMS' },
        { id: 'DOCS', label: 'DOCUMENTS' },
        { id: 'ROADMAP', label: 'ROADMAP' }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-[#020203]/40 backdrop-blur-2xl text-[#ffffff] flex flex-col font-sans selection:bg-[#6366f1]/30 overflow-hidden text-[14px]">
            {/* 🌌 UNIVERSAL BACKGROUND - Handled by App.tsx Global Layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/[0.05] to-transparent pointer-events-none" />

            {/* 🔝 HEADER: SLEEK, ULTRA SMALL */}
            <header className="h-12 shrink-0 border-b border-[#ffffff]/10 bg-[#060608]/90 backdrop-blur-3xl flex items-center justify-between px-4 z-20 shadow-md">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/projects')} className="w-7 h-7 rounded shrink-0 bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center text-[#ffffff]/60 hover:text-white hover:bg-[#ffffff]/10 hover:border-[#ffffff]/20 transition-all">
                        <ArrowLeft size={14} />
                    </button>

                    <div className="flex items-center gap-3 border-l border-[#ffffff]/10 pl-4 h-6">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#6366f1]/10 rounded border border-[#6366f1]/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
                            <span className="text-[8px] font-[900] uppercase tracking-widest text-[#818cf8]">EXT SYS 9.0</span>
                        </div>
                        <h1 className="text-[11px] font-[900] italic tracking-tight uppercase text-[#ffffff]">
                            {project.title || 'UNTITLED_MISSION'}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-[#ffffff]/30">
                        <span className="text-[#6366f1] bg-[#6366f1]/10 px-1.5 py-0.5 rounded border border-[#6366f1]/20">ID: {id?.slice(-10)}</span>
                        <span>•</span>
                        <span>{project.category?.replace(/_/g, ' ') || 'GRADUATION'}</span>
                    </div>

                    <div className="w-[1px] h-4 bg-[#ffffff]/10 hidden md:block" />

                    {isAwaiting && (
                        <Button disabled={loading || project.status === 'GENERATING'} onClick={handleApprove} className="h-7 px-3 rounded bg-[#ffffff] text-[#030304] font-[900] uppercase tracking-widest text-[8px] hover:bg-[#6366f1] hover:text-[#ffffff] transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none">
                            <Play size={8} className="fill-current" />
                            DEPLOY CORE
                        </Button>
                    )}
                    {isComplete && (
                        <div className="flex items-center gap-2">
                            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/20 rounded shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <CheckCircle size={10} className="text-[#10b981]" />
                                <span className="text-[8px] font-black text-[#10b981] uppercase tracking-widest">SYNTHESIS_STABLE</span>
                            </div>
                            <button onClick={() => secureDownload(`/api/collage-project/${id}/download`, `project_v1.zip`)} className="h-7 px-3 rounded bg-[#6366f1] text-[#ffffff] font-[900] uppercase tracking-widest text-[8px] hover:bg-[#818cf8] transition-all flex items-center gap-1.5 shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95">
                                <Download size={10} />
                                SYNC_V1.0
                            </button>
                        </div>
                    )}
                    {!isComplete && !isAwaiting && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                            <Activity size={10} className="text-[#6366f1] animate-spin" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#818cf8] pt-[1px]">NEURAL_SYNTHESIS_LIVE</span>
                        </div>
                    )}
                </div>
            </header>

            {/* 🎛️ SUB NAV / TABS */}
            <div className="h-9 border-b border-[#ffffff]/5 flex items-center px-4 shrink-0 bg-[#040406]/60 z-10 backdrop-blur-xl">
                <nav className="flex gap-1.5">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-[2px] rounded text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${isActive ? 'bg-[#6366f1] text-white shadow-[0_0_8px_rgba(99,102,241,0.3)]' : 'text-[#ffffff]/40 hover:text-[#ffffff] hover:bg-[#ffffff]/5'}`}
                            >
                                {isActive && <div className="w-1 h-1 rounded-full bg-white animate-pulse" />}
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* 🧩 DYNAMIC CONTENT AREA (Main Body) */}
            <main className="flex-1 w-full min-h-0 relative z-0 p-3 flex flex-col overflow-hidden bg-[#000000]/20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="w-full h-full flex flex-col min-h-0"
                    >
                        {/* OVERVIEW TAB */}
                        {activeTab === 'OVERVIEW' && (
                            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-3 flex-1 min-h-0">
                                {/* AGENT STACK (Left) */}
                                <div className="bg-[#0b0b10]/60 backdrop-blur-xl border border-[#ffffff]/10 rounded-xl p-3 flex flex-col shadow-lg overflow-hidden relative">
                                    <div className="flex items-center justify-between border-b border-[#ffffff]/5 pb-2 mb-2 shrink-0">
                                        <h2 className="text-[9px] font-[900] text-[#ffffff] uppercase tracking-widest flex items-center gap-1.5">
                                            <Cpu className="text-[#6366f1]" size={12} /> NEURAL NODES
                                        </h2>
                                        <span className="text-[7px] bg-[#ffffff]/5 px-1.5 py-[1px] rounded uppercase tracking-widest text-[#ffffff]/40 border border-[#ffffff]/10 font-bold">LIVE LINK</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1.5 pr-1">
                                        {CORE_STEPS.map((step) => {
                                            const task = tasks.find(t => t.taskType === step.id);
                                            const status = task?.status || 'waiting'; // WAITING / RUNNING / COMPLETED / FAILED / RETRYING
                                            const isCur = status === 'running';
                                            const isDone = status === 'completed';
                                            const isFailed = status === 'failed';

                                            return (
                                                <div key={step.id} className={`relative group border rounded-lg p-2 transition-all flex items-center gap-3 shadow-sm
                                                    ${isCur ? 'bg-[#6366f1]/10 border-[#6366f1]/50' : 
                                                      isDone ? 'bg-[#10b981]/5 border-[#10b981]/20 opacity-80' : 
                                                      isFailed ? 'bg-[#f43f5e]/10 border-[#f43f5e]/30' :
                                                      'bg-[#13131a]/50 border-[#ffffff]/5 opacity-40'}`}>
                                                    
                                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-300 relative shrink-0
                                                        ${isCur ? 'bg-[#6366f1] text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]' :
                                                          isDone ? 'bg-[#10b981] text-white' :
                                                          isFailed ? 'bg-[#f43f5e] text-white' :
                                                          'bg-[#0a0a0f] border border-[#ffffff]/5 text-[#ffffff]/30'}`}>
                                                        {React.cloneElement(step.icon as React.ReactElement, { size: 12 })}
                                                        {isCur && <div className="absolute -inset-1 rounded-md border border-white/50 animate-ping opacity-20" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-[1px]">
                                                            <p className={`text-[9px] font-[900] uppercase tracking-wider truncate transition-colors ${isCur ? 'text-[#ffffff]' : isDone ? 'text-[#ffffff]/80' : 'text-[#ffffff]/50'}`}>
                                                                {step.name}
                                                            </p>
                                                            <span className="text-[7px] text-white/20 font-mono">#{step.ordinal}</span>
                                                        </div>
                                                        <span className={`text-[7px] font-[1000] uppercase tracking-widest transition-colors block truncate ${isCur ? 'text-[#818cf8] animate-pulse' : isDone ? 'text-[#10b981]' : isFailed ? 'text-[#f43f5e]' : 'text-[#ffffff]/20'}`}>
                                                            {status === 'running' ? 'MISSION_ACTIVE' : 
                                                             status === 'completed' ? 'SYNTHESIS_DONE' : 
                                                             status === 'failed' ? 'SYNTHESIS_FAULT' :
                                                             'WAITING_IN_QUEUE'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* TERMINAL STREAM (Right) */}
                                <div className="bg-[#040406] border border-[#ffffff]/10 rounded-xl p-3 flex flex-col font-mono shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] relative min-h-0">
                                    <div className="flex items-center justify-between border-b border-[#ffffff]/5 pb-2 mb-2 shrink-0">
                                        <h2 className="text-[9px] font-[900] text-[#ffffff]/60 uppercase tracking-widest flex items-center gap-1.5">
                                            <Terminal className="text-[#10b981]" size={12} /> DISCOVERY STREAM
                                        </h2>
                                        <div className="flex items-center gap-1 px-1.5 py-[2px] bg-[#16161e] rounded border border-[#ffffff]/10 shadow-sm">
                                            <div className="w-1 h-1 rounded-full bg-[#10b981] animate-pulse" />
                                            <span className="text-[7px] font-bold text-[#10b981] uppercase tracking-widest">OK</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto scrollbar-hide text-[13px] space-y-1 pb-2">
                                        {liveLogs.length === 0 ? (
                                            <div className="h-full flex items-center justify-center text-[#ffffff]/20 font-bold uppercase tracking-widest text-[8px]">
                                                Waiting for connection...
                                            </div>
                                        ) : (
                                            liveLogs.map((log, idx) => {
                                                const timeStr = log.timestamp && !isNaN(new Date(log.timestamp).getTime())
                                                    ? new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                    : '--:--:--';
                                                
                                                // M3: Stable key using _id or composite signature without random factor
                                                const stableKey = log._id || `${log.timestamp}-${log.message}-${idx}`;

                                                return (
                                                    <div key={stableKey} className="flex gap-2 items-start break-words border-l-[1.5px] border-[#ffffff]/10 pl-2 py-0.5 hover:border-[#6366f1]/50 hover:bg-[#ffffff]/[0.02] transition-colors">
                                                        <span className="text-[#6366f1]/70 font-semibold shrink-0">{timeStr}</span>
                                                        <span className="text-[#ffffff]/30 shrink-0">[{log.agent || 'SYS'}]</span>
                                                        <span className={`${log.state === 'error' ? 'text-[#f43f5e] font-bold' : log.state === 'done' ? 'text-[#10b981] font-bold' : 'text-[#ffffff]/80'} leading-tight font-medium`}>
                                                            {log.message}
                                                        </span>
                                                    </div>
                                                )
                                            })
                                        )}
                                        <div ref={bottomRef} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FILES TAB */}
                        {activeTab === 'FILES' && (
                            <div className="flex-1 flex flex-col md:flex-row gap-0 border border-[#ffffff]/10 rounded-xl bg-[#0b0b10] overflow-hidden min-h-0">
                                <div className="w-full md:w-[240px] shrink-0 border-r border-[#ffffff]/10 flex flex-col bg-[#ffffff]/[0.01]">
                                    <div className="p-3 border-b border-[#ffffff]/5 shrink-0">
                                        <h3 className="text-[9px] font-[900] text-[#ffffff]/70 uppercase tracking-widest flex items-center gap-1.5">
                                            <Folder className="text-[#6366f1]" size={12} /> NEXUS BROWSER
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-3">
                                        {virtualFiles.length === 0 ? (
                                            <div className="text-center mt-6 text-[8px] font-bold uppercase tracking-widest text-[#ffffff]/20">Empty Space</div>
                                        ) : (
                                            Object.entries(
                                                virtualFiles.filter(f => typeof f === 'string').reduce((acc: any, f) => {
                                                    const dir = f.includes('/') ? f.split('/')[0] : 'ROOT';
                                                    if (!acc[dir]) acc[dir] = [];
                                                    acc[dir].push(f);
                                                    return acc;
                                                }, {})
                                            ).map(([dir, files]: [string, any]) => (
                                                <div key={dir} className="space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-[8px] font-black text-[#ffffff]/40 uppercase tracking-widest px-1">
                                                        <Folder size={10} className="text-[#6366f1]" /> {dir}
                                                    </div>
                                                    <div className="space-y-0.5 ml-1 border-l border-[#ffffff]/10 pl-2">
                                                        {files.map((file: string) => {
                                                            const name = file.includes('/') ? file.split('/').pop() : file;
                                                            const isActive = selectedFile === file;
                                                            return (
                                                                <button
                                                                    key={file}
                                                                    onClick={() => setSelectedFile(file)}
                                                                    className={`w-full text-left px-2 py-1.5 rounded-md text-[9px] font-mono transition-all flex items-center gap-1.5
                                                                        ${isActive ? 'bg-[#6366f1]/20 text-[#ffffff] font-bold' : 'text-[#ffffff]/50 hover:text-[#ffffff] hover:bg-[#ffffff]/5 font-medium'}`}
                                                                >
                                                                    <FileCode size={10} className={isActive ? 'text-[#818cf8]' : 'text-[#ffffff]/30'} />
                                                                    <span className="truncate">{name}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* CODE VIEWER */}
                                <div className="flex flex-col bg-transparent flex-1 min-w-0">
                                    <div className="h-9 border-b border-[#ffffff]/5 px-3 flex items-center shrink-0 bg-[#ffffff]/[0.02]">
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#ffffff]/70 font-mono tracking-widest">
                                            <FileCode size={12} className="text-[#6366f1]" />
                                            {selectedFile || 'SELECT_MODULE'}
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-auto p-4 font-mono text-[10px] leading-snug text-[#ffffff]/90 scrollbar-hide bg-[#1d1f21]">
                                        {selectedFile ? (
                                            <pre className="!m-0 !bg-transparent !p-0"><code className={`language-${
                                                ['ts', 'tsx'].includes(selectedFile.split('.').pop() || '') ? 'typescript' : 
                                                selectedFile.split('.').pop() === 'json' ? 'json' : 
                                                selectedFile.split('.').pop() === 'md' ? 'markdown' : 
                                                selectedFile.split('.').pop() === 'py' ? 'python' : 
                                                selectedFile.split('.').pop() === 'java' ? 'java' : 
                                                selectedFile.split('.').pop() === 'vue' ? 'html' : 
                                                'javascript'
                                            }`}>
                                                {fileContents[selectedFile] || '// Decrypting neural stream...'}
                                            </code></pre>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center opacity-10">
                                                <Box size={30} className="mb-2" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">AWAITING_INPUT</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* DIAGRAMS TAB */}
                        {activeTab === 'DIAGRAMS' && (
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-4 scrollbar-hide">
                                {project.blueprint?.diagrams ? (
                                    Object.entries(project.blueprint.diagrams).map(([name, code]: [string, any]) => (
                                        <div key={name} className="bg-[#0b0b10]/60 backdrop-blur-xl border border-[#ffffff]/10 rounded-xl p-4 flex flex-col gap-3 group hover:border-[#6366f1]/30 transition-all">
                                            <div className="flex items-center justify-between border-b border-[#ffffff]/5 pb-2">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#ffffff]/70 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                                                    {name.toUpperCase()} MODEL
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    {project.blueprint?.krokiUrls?.[name] && (
                                                        <a 
                                                            href={project.blueprint.krokiUrls[name]} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="text-[7px] bg-[#6366f1]/20 hover:bg-[#6366f1] hover:text-white px-1.5 py-0.5 rounded border border-[#6366f1]/30 transition-all text-[#818cf8]"
                                                        >
                                                            SVG_LENS
                                                        </a>
                                                    )}
                                                    <span className="text-[8px] font-bold text-[#6366f1] uppercase tracking-widest">INDUSTRIAL_SPEC</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-auto bg-black/40 rounded-lg p-3 border border-[#ffffff]/5">
                                                {project.blueprint?.krokiUrls?.[name] ? (
                                                    <img 
                                                        src={project.blueprint.krokiUrls[name]} 
                                                        alt={name} 
                                                        className="max-w-full h-auto mx-auto brightness-90 contrast-125 rounded shadow-xl"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <MermaidViewer chart={typeof code === 'string' ? code : JSON.stringify(code, null, 2)} />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20">
                                        <Layers size={48} className="mb-4 text-[#6366f1]" />
                                        <h2 className="text-[14px] font-[1000] italic uppercase tracking-widest">MAPS_NOT_FOUND</h2>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DOCS TAB */}
                        {activeTab === 'DOCS' && (
                            <div className="flex-1 p-6 flex flex-col items-center justify-center gap-8 min-h-0 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                                    {[
                                        { id: 'zip', label: 'SOURCE_CODE_ARTIFACT', icon: <Box className="text-[#6366f1]" />, url: project.artifacts?.zipUrl, desc: 'Full production logic zip.' },
                                        { id: 'pdf', label: 'TECHNICAL_SPEC_PDF', icon: <FileCode className="text-[#f43f5e]" />, url: project.artifacts?.documentUrl, desc: 'Detailed industrial report.' },
                                        { id: 'ppt', label: 'VISION_DECK_PPTX', icon: <Layout className="text-[#f59e0b]" />, url: project.artifacts?.pitchDeckUrl, desc: 'Professional pitch presentation.' },
                                        { id: 'word', label: 'SOFTWARE_DOCX', icon: <Layers className="text-[#10b981]" />, url: project.artifacts?.wordUrl, desc: 'Academic Word document.' }
                                    ].map(art => (
                                        <div key={art.id} className="bg-[#0b0b10] border border-[#ffffff]/10 rounded-2xl p-6 flex flex-col items-center text-center gap-5 hover:border-[#6366f1]/50 hover:bg-[#111118] transition-all group relative overflow-hidden shadow-xl">
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 duration-700">
                                                <Rocket size={80} />
                                            </div>
                                            <div className="w-16 h-16 rounded-2xl bg-[#030304] border border-[#ffffff]/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                                {React.cloneElement(art.icon as React.ReactElement, { size: 30 })}
                                            </div>
                                            <div>
                                                <h3 className="text-[11px] font-[1000] text-[#ffffff] uppercase tracking-widest mb-1 italic">{art.label}</h3>
                                                <p className="text-[8px] font-bold text-[#ffffff]/30 uppercase tracking-[0.2em]">{art.desc}</p>
                                            </div>
                                            {art.url ? (
                                                <button 
                                                    onClick={() => secureDownload(art.url!, `${art.label.toLowerCase()}_package.zip`)} 
                                                    className="w-full h-11 rounded-xl bg-[#6366f1] text-white flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-[#6366f1]/20 hover:bg-[#818cf8] active:scale-95 transition-all"
                                                >
                                                    <Download size={14} /> DOWNLOAD_SYNC
                                                </button>
                                            ) : (
                                                <div className="w-full h-11 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/5 text-[#ffffff]/20 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest">
                                                    <Loader2 size={14} className="animate-spin" /> SYNCHRONIZING...
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={fetchProject} 
                                    className="mt-4 px-8 h-12 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/5 text-[#818cf8] font-black text-[10px] uppercase tracking-[0.3em] hover:text-white hover:bg-[#6366f1] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all flex items-center gap-3 group"
                                >
                                    <Activity size={16} className="group-hover:animate-pulse" />
                                    REFRESH_WORKSPACE_DATA
                                </button>
                             </div>
                        )}

                        {/* ROADMAP TAB */}
                        {activeTab === 'ROADMAP' && (
                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 bg-[#08080c]/60 backdrop-blur-xl rounded-xl border border-[#ffffff]/10">
                                <div className="flex items-center gap-2 border-b border-[#ffffff]/10 pb-3 mb-2 shrink-0">
                                    <Layers className="text-[#10b981]" size={16} />
                                    <h2 className="text-[12px] font-[900] uppercase tracking-widest text-[#ffffff]">SYSTEM ROADMAP & LIFECYCLE</h2>
                                </div>
                                <div className="space-y-3 pl-2 border-l-2 border-[#ffffff]/10 ml-2">
                                    {tasks.length > 0 ? (
                                        tasks.map((task, index) => {
                                            const isDone = task.status === 'completed';
                                            const isCur = task.status === 'running';
                                            const PHASE_MAP: Record<string, string> = {
                                                analyze: 'Neural Strategy Planning',
                                                blueprint: 'System Architecture Blueprint',
                                                context_memory: 'Contextual Memory Fusion',
                                                database: 'Global Database Synthesis',
                                                api: 'Restful API Nexus Generation',
                                                backend_module: 'Production Backend Core',
                                                frontend_module: 'Universal UI Synthesis',
                                                packaging: 'Final Industrial Packaging'
                                            };
                                            return (
                                                <div key={task._id || index} className="relative pl-6">
                                                    <div className={`absolute left-[-29px] w-4 h-4 rounded-full border-2 bg-[#08080c] flex items-center justify-center transition-all ${
                                                        isDone ? 'border-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 
                                                        isCur ? 'border-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 
                                                        'border-[#ffffff]/20'
                                                    }`}>
                                                        {isDone && <CheckCircle size={8} className="text-[#10b981]" />}
                                                        {isCur && <Activity size={8} className="text-[#6366f1] animate-spin" />}
                                                    </div>
                                                    <div className={`p-3 rounded-lg border flex flex-col gap-1 transition-all ${
                                                        isDone ? 'bg-[#10b981]/5 border-[#10b981]/20' : 
                                                        isCur ? 'bg-[#6366f1]/10 border-[#6366f1]/40' : 
                                                        'bg-[#ffffff]/5 border-[#ffffff]/10 opacity-50'
                                                    }`}>
                                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-white">
                                                            PHASE {index + 1}: {PHASE_MAP[task.taskType] || task.taskType.replace(/_/g, ' ')}
                                                        </h3>
                                                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                                            STATUS: <span className={isDone ? 'text-[#10b981]' : isCur ? 'text-[#6366f1]' : ''}>{task.status.toUpperCase()}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-10 text-center text-[#ffffff]/30 text-[10px] uppercase font-bold tracking-widest">Initializing Timeline...</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* 💬 COMPACT CHAT INPUT & CHAT UI TOGGLE */}
            <div className="h-10 shrink-0 border-t border-[#ffffff]/10 bg-[#060608]/90 backdrop-blur-3xl flex items-center px-4 z-20 gap-2 relative">
                
                {/* Embedded Chat Overlay */}
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-[44px] left-2 md:left-[280px] w-[calc(100%-16px)] md:w-[400px] h-[350px] bg-[#0c0c11]/95 backdrop-blur-xl border border-[#ffffff]/20 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden z-[500]"
                        >
                            <div className="flex items-center justify-between px-3 min-h-8 border-b border-[#ffffff]/10 bg-[#ffffff]/5 shrink-0">
                                <h3 className="text-[10px] font-[900] text-[#ffffff] uppercase tracking-widest flex items-center gap-1.5">
                                    <Brain size={12} className="text-[#6366f1]" /> TITAN NEURAL NET
                                </h3>
                                <button onClick={() => setIsChatOpen(false)} className="text-[#ffffff]/40 hover:text-white transition-colors p-1">
                                    <Activity size={12} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-[12px] scrollbar-hide">
                                {chatHistory.length === 0 ? (
                                    <div className="h-full flex items-center justify-center opacity-30 text-center">
                                       <div>
                                           <Brain size={30} className="mb-2 mx-auto" />
                                           <p className="text-[9px] uppercase tracking-widest font-bold">Neural Chat Idle</p>
                                       </div>
                                    </div>
                                ) : (
                                    chatHistory.map((msg, idx) => (
                                        <div key={msg._id || idx} className="space-y-2">
                                            <div className="flex justify-end pr-2">
                                                <div className="bg-[#6366f1] text-white px-3 py-1.5 rounded-l-xl rounded-tr-sm rounded-br-xl max-w-[85%] text-[11px] font-medium leading-relaxed break-words shadow-sm">
                                                    {msg.userMessage}
                                                </div>
                                            </div>
                                            {(msg.aiResponse || msg.status === 'PROCESSING') && (
                                                <div className="flex justify-start pl-2">
                                                    <div className="bg-[#1a1b26] border border-[#ffffff]/10 text-[#ffffff]/90 px-3 py-1.5 rounded-r-xl rounded-tl-sm rounded-bl-xl max-w-[85%] text-[11px] font-medium leading-relaxed break-words relative overflow-hidden">
                                                        {msg.status === 'PROCESSING' && !msg.aiResponse ? (
                                                            <div className="flex items-center gap-2 italic text-[#ffffff]/40 text-[10px]">
                                                                <Loader2 size={10} className="animate-spin text-[#6366f1]" /> Formulating logic...
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-1">
                                                                {msg.aiResponse.split('\n').map((line: string, i: number) => (
                                                                    <span key={i} className="min-h-[14px] break-words">{line}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                                <div ref={chatBottomRef} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button 
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`h-7 px-3 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all shrink-0 ${isChatOpen ? 'bg-[#6366f1] text-white' : 'bg-[#16161e] border border-[#ffffff]/10 text-[#ffffff]/60 hover:text-white'}`}
                >
                    <MessageSquare size={12} /> 
                    <span className="hidden md:inline">CHAT</span>
                </button>

                <form onSubmit={handleChatSubmit} className="w-full relative flex items-center">
                    <input
                        type="text"
                        disabled={isAwaiting || project?.status === 'GENERATING'}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={isAwaiting ? "AWAITING AUTHORIZATION..." : project?.status === 'GENERATING' ? "SYSTEM IS GENERATING..." : "Inject modifications or instructions..."}
                        className="w-full h-7 bg-[#16161e] border border-[#ffffff]/10 focus:border-[#6366f1]/50 text-[10px] font-medium text-[#ffffff] pl-8 pr-16 outline-none transition-all placeholder:text-[#ffffff]/30 font-sans disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-inner"
                    />
                    <button
                        disabled={isAwaiting || project?.status === 'GENERATING' || !chatInput.trim()}
                        type="submit"
                        className="absolute right-[2px] top-[2px] bottom-[2px] px-3 rounded-[4px] bg-[#6366f1] hover:bg-[#818cf8] text-white flex items-center gap-1 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        <span className="text-[8px] font-black uppercase tracking-widest hidden md:inline pt-[1px]">SEND</span>
                        <Send size={10} />
                    </button>
                </form>
            </div>

        </div>
    );
}
