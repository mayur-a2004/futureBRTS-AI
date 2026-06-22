import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Send, Map, Menu, Zap, Brain, Plus, ArrowRight, RotateCw, Sparkles, X, Loader2, Rocket, Check, FileText, Shield, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MessageBubble } from "@/components/chat/MessageBubble";
import TokenWall from "@/components/economy/TokenWall";
import { useModal } from "@/context/ModalContext";
import { io } from 'socket.io-client';
import CollageProjectModal from '@/components/builder/CollageProjectModal';

// 🧠 Neural Loading Pulse (Infinite Cycle)
const NeuralLoadingText = () => {
    const [index, setIndex] = useState(0);
    const thoughts = [
        "Analyzing Technical Patterns...",
        "Mining Global Intelligence (Bing/Brave)...",
        "Synchronizing Neural Memory Bank...",
        "Identifying Market Gaps & GTM Signals...",
        "Refining Raw Data with Titan Engine...",
        "Calibrating Business War Room Matrix...",
        "Resonating Intelligence Signals..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % thoughts.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return <span>{thoughts[index]}</span>;
};

export default function Builder() {
    const { setTokenBalance, user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const sessionId = searchParams.get('sessionId');

    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [, setUserRank] = useState<'Normal' | 'Middle' | 'High Chat' | 'Legend'>('Normal');
    const [currentLoadedId, setCurrentLoadedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Navigation & Dropdown States
    const [roadmapMenuOpen, setRoadmapMenuOpen] = useState(false);
    const [taskMenuOpen, setTaskMenuOpen] = useState(false);
    const [hasRoadmap, setHasRoadmap] = useState(false);
    const [generatingMap, setGeneratingMap] = useState(false);
    const [tokenWallOpen, setTokenWallOpen] = useState(false);
    const { confirm, showAlert } = useModal();

    // Input & File States
    const [files, setFiles] = useState<{ name: string, type: string, preview?: string, file?: File }[]>([]);
    const [inputMode, setInputMode] = useState<{ label: string, icon: string, color: string } | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [menuView, setMenuView] = useState<'main' | 'more'>('main');
    const [collageProjectModalOpen, setCollageProjectModalOpen] = useState(false);

    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const roadmapMenuRef = useRef<HTMLDivElement>(null);
    const taskMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (roadmapMenuRef.current && !roadmapMenuRef.current.contains(event.target as Node)) {
                setRoadmapMenuOpen(false);
            }
            if (taskMenuRef.current && !taskMenuRef.current.contains(event.target as Node)) {
                setTaskMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Socket Integration
    // Socket Integration

    useEffect(() => {
        const newSocket = io('http://localhost:7001'); // Direct connection to API Port

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            if (currentLoadedId) newSocket.emit('join_session', currentLoadedId);
        });

        newSocket.on('job_update', (data: any) => {
            console.log('⚡ Socket Job Update:', data);

            // If completed, refresh messages to show the result
            if (data.status === 'completed' || data.status === 'failed') {
                if (currentLoadedId) loadSession(currentLoadedId);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [currentLoadedId]);

    const [generatingTasks, setGeneratingTasks] = useState(false);
    const [activeTitanProject, setActiveTitanProject] = useState<any>(null);
    const [, setTitanLogs] = useState<string[]>([]);
    const [showApprovalOverlay, setShowApprovalOverlay] = useState(false);
    const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'completed' | 'failed'>('idle');
    const [buildLogs, setBuildLogs] = useState<string[]>([]);
    const [projectDownloadUrl, setProjectDownloadUrl] = useState<string | null>(null);
    const [activeProjectFiles, setActiveProjectFiles] = useState<any>(null);


    // Initial Load & Session Management
    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('fbrts_token');
            if (!token) return;

            // Priority 1: URL Deep Link (User explicitly navigated here)
            if (sessionId) {
                if (sessionId !== currentLoadedId) {
                    loadSession(sessionId);
                }
                return;
            }

            // Priority 2: Local Persistence (The "Last Seen" session)
            const savedSessionId = localStorage.getItem('fbrts_active_session');
            if (savedSessionId) {
                console.info("⚡ Resuming Local Persistence Session:", savedSessionId);
                setSearchParams({ sessionId: savedSessionId });
                return;
            }

            // Priority 3: Server Registry (Most recent verified session)
            try {
                const res = await fetch('/api/builder/sessions', { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json();
                if (data.success && data.sessions && data.sessions.length > 0) {
                    const latest = data.sessions[0];
                    console.info("⚡ Synchronizing with Server Session:", latest._id);
                    setSearchParams({ sessionId: latest._id });
                    return;
                }
            } catch (e) {
                console.error("Neural Registry Sync Failed", e);
            }

            // Priority 4: Fresh Neural Thread — Open Project Architect instead of blank chat
            console.info("⚡ No session found — Opening Project Architect...");
            setCollageProjectModalOpen(true);
        };
        init();
    }, [sessionId, currentLoadedId, setSearchParams]);

    // 🎯 ARCHITECT MODE: Triggered by ?mode=architect in URL (from sidebar New Mission button)
    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'architect') {
            // Clear the param immediately so it doesn't re-trigger on re-renders
            const next = new URLSearchParams(searchParams);
            next.delete('mode');
            setSearchParams(next, { replace: true });
            // Open Project Architect modal
            setCollageProjectModalOpen(true);
        }
    }, [searchParams]);

    // Check Resources (Roadmap for CURRENT session)
    useEffect(() => {
        const checkResources = async () => {
            if (!currentLoadedId) return;
            const token = localStorage.getItem('fbrts_token');
            if (!token) return;
            try {
                // Fetch the session directly to check its specific roadmap status
                const sRes = await fetch(`/api/builder/session/${currentLoadedId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                const sData = await sRes.json();

                if (sData.success && sData.session && sData.session.hasRoadmap) {
                    setHasRoadmap(true);
                } else {
                    setHasRoadmap(false);
                }
            } catch (e) {
                console.error("Failed to sync session roadmap status", e);
            }
        };
        checkResources();
    }, [currentLoadedId]);

    useEffect(() => {
        let interval: any;
        if (activeTitanProject && (activeTitanProject.status !== 'COMPLETED' && activeTitanProject.status !== 'FAILED')) {
            interval = setInterval(async () => {
                const token = localStorage.getItem('fbrts_token');
                try {
                    const res = await fetch(`/api/collage-project/${activeTitanProject._id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.success) {
                        setActiveTitanProject(data.project);
                        if (data.project.status === 'COMPLETED') {
                            setProjectDownloadUrl(data.project.artifacts?.zip?.url || null);
                            setActiveProjectFiles(data.project.artifacts);
                            setBuildStatus('completed');
                            clearInterval(interval);
                        }
                    }
                } catch (e) {
                    console.error("Titan Polling Failed", e);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [activeTitanProject]);

    useEffect(() => {
        if (activeTitanProject?.status === 'AWAITING_APPROVAL') {
            setShowApprovalOverlay(true);
        }
    }, [activeTitanProject?.status]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const processMessages = (msgs: any[]) => {
        if (!msgs || !Array.isArray(msgs)) return [];
        return msgs.map((m: any) => {
            if (m.role === 'assistant' && typeof m.content === 'string' && m.content.includes('||SUGGESTIONS_JSON||')) {
                const parts = m.content.split('||SUGGESTIONS_JSON||');
                const cleanContent = parts[0].trim();
                let suggestions = m.suggestions || [];
                try {
                    const parsed = JSON.parse(parts[1].trim());
                    if (Array.isArray(parsed)) suggestions = parsed;
                } catch (e) { console.error("Failed to parse suggestions JSON", e); }

                return { ...m, content: cleanContent, suggestions };
            }
            return m;
        });
    };

    const loadSession = async (id: string) => {
        const token = localStorage.getItem('fbrts_token');
        try {
            setLoading(true);
            const res = await fetch(`/api/builder/session/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(processMessages(data.session.messages));
                setCurrentLoadedId(id);
                if (data.session.userContext?.rank) {
                    setUserRank(data.session.userContext.rank);
                }
                localStorage.setItem('fbrts_active_session', id); // Remember for subsequent page reloads
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const createSession = async () => {
        const token = localStorage.getItem('fbrts_token');

        try {
            // Rule 1: Do NOT assume intent. Wait for user message.
            const res = await fetch('/api/builder/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ initialPrompt: "", title: "New Chat" })
            });
            const data = await res.json();
            if (data.success) {
                if (typeof data.tokenBalance === 'number') {
                    setTokenBalance(data.tokenBalance);
                }
                setCurrentLoadedId(data.session._id);
                setMessages(data.session.messages || []);
                if (data.session.userContext?.rank) {
                    setUserRank(data.session.userContext.rank);
                }
                localStorage.setItem('fbrts_active_session', data.session._id);
                setSearchParams({ sessionId: data.session._id });
                return data.session;
            }
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const handleSend = async (overrideContent?: string) => {
        const contentToSend = overrideContent || input;
        if (!contentToSend.trim() || !currentLoadedId) return;
        await sendToSession(currentLoadedId, contentToSend, overrideContent ? undefined : [...files]);
    };

    // 🚀 Core send — accepts explicit sessionId to bypass React state race conditions
    const sendToSession = async (targetSessionId: string, contentToSend: string, attachmentFiles?: typeof files) => {
        if (!contentToSend.trim() || !targetSessionId) return;

        const usedFiles = attachmentFiles || [];
        const tempId = Date.now().toString();

        const optimisticMsg = {
            id: tempId,
            role: 'user',
            content: contentToSend,
            timestamp: new Date(),
            attachments: [...usedFiles]
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setInput('');
        setFiles([]);
        setLoading(true);

        const attachmentsPayload = await Promise.all(usedFiles.map(async (f) => {
            let preview = f.preview;
            if (f.file) {
                try {
                    const b64 = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(f.file!);
                    });
                    preview = b64;
                } catch (e) {
                    console.error('File read failure', e);
                }
            }
            return { name: f.name, type: f.type, preview };
        }));

        const assistantMsgId = crypto.randomUUID();
        const startTime = Date.now();

        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/builder/session/${targetSessionId}/message/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    content: contentToSend,
                    inputMode: inputMode?.label,
                    attachments: attachmentsPayload
                })
            });

            if (res.status === 403) {
                const data = await res.json();
                if (data.error === 'OUT_OF_TOKENS') {
                    setTokenWallOpen(true);
                    setMessages(prev => prev.filter(m => m.id !== tempId));
                    return;
                }
            }

            if (!res.ok) {
                throw new Error(`HTTP error ${res.status}`);
            }

            // Push an optimistic assistant message to start the stream
            setMessages(prev => [...prev, {
                id: assistantMsgId,
                role: 'assistant',
                content: '',
                thinking: '',
                isThinking: true,
                timestamp: new Date()
            }]);

            const reader = res.body?.getReader();
            if (!reader) throw new Error("No readable stream in response");

            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const cleanLine = line.trim();
                    if (!cleanLine) continue;

                    if (cleanLine.startsWith('data: ')) {
                        const dataStr = cleanLine.slice(6);
                        if (dataStr === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(dataStr);

                            if (parsed.type === 'think') {
                                setMessages(prev => prev.map(m => {
                                    if (m.id === assistantMsgId) {
                                        return {
                                            ...m,
                                            thinking: (m.thinking || "") + parsed.token
                                        };
                                    }
                                    return m;
                                }));
                            } else if (parsed.type === 'text') {
                                setMessages(prev => prev.map(m => {
                                    if (m.id === assistantMsgId) {
                                        const now = Date.now();
                                        const duration = m.thinkingTime || Math.round((now - startTime) / 1000);
                                        return {
                                            ...m,
                                            isThinking: false,
                                            thinkingTime: duration,
                                            content: (m.content || "") + parsed.token
                                        };
                                    }
                                    return m;
                                }));
                            } else if (parsed.type === 'metadata') {
                                const meta = parsed.data;
                                if (meta.messages && Array.isArray(meta.messages)) {
                                    setMessages(processMessages(meta.messages));
                                }
                                if (meta.title) {
                                    window.dispatchEvent(new Event('fb-refresh-sessions'));
                                }
                                if (meta.rank) {
                                    setUserRank(meta.rank);
                                }
                                if (typeof meta.tokenBalance === 'number') {
                                    setTokenBalance(meta.tokenBalance);
                                }
                                if (meta.projectFiles) {
                                    setBuildStatus('completed');
                                    setProjectDownloadUrl(meta.projectFiles.zip?.url || null);
                                    setActiveProjectFiles(meta.projectFiles);
                                }
                            }
                        } catch (e) {
                            // ignore malformed SSE
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e);
            // Show error on failure
            setMessages(prev => prev.map(m => {
                if (m.id === assistantMsgId) {
                    return {
                        ...m,
                        isThinking: false,
                        content: (m.content || "") + "\n\n⚠️ **Connection error during stream. Please retry.**"
                    };
                }
                return m;
            }));
        } finally {
            setLoading(false);
        }
    };


    const handleStopGeneration = () => {
        setLoading(false);
        // Add logic to cancel socket/fetch if needed
    };

    const handleSuggestionClick = (suggestion: string) => {
        // ⚡ INSTANT ACTION: Direct send, skipping input state delay
        setInput(suggestion); // Visual feedback
        handleSend(suggestion); // Logical execution
    };

    const handleEditPrompt = async (newContent: string, index: number) => {
        // Simple implementation: cut messages after this and resend
        const previousMessages = messages.slice(0, index);
        setMessages(previousMessages);
        setInput(newContent);
        // Wait for state to settle then send
        setTimeout(() => handleSend(), 100);
    };

    // Actions

    const handleGenerateTasks = async () => {
        if (!currentLoadedId) return;
        const token = localStorage.getItem('fbrts_token') || "";
        if (!token) return;

        // 1. Get Roadmap ID first (Since we only overlap session)
        if (!hasRoadmap) {
            showAlert("No Roadmap Found", "Please architect a strategic roadmap first using the 'Roadmap' button in the builder header.");
            return;
        }

        setGeneratingTasks(true);
        try {
            // Need to fetch roadmap ID associated with this session
            // For now, we assume the latest active roadmap or fetch via sessions
            const sessionRes = await fetch(`/api/builder/session/${currentLoadedId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const sessionData = await sessionRes.json();

            if (sessionData.session?.activeRoadmapId) {
                await generateTasksRequest(sessionData.session.activeRoadmapId, token);
            } else {
                // Try fetching roadmap direct
                const rRes = await fetch('/api/roadmap', { headers: { 'Authorization': `Bearer ${token}` } });
                const rData = await rRes.json();
                if (!rData.roadmaps?.[0]?._id) {
                    showAlert("Syncing Failed", "Neural roadmap syncing failed. No active roadmap identifier found in your secure vault.");
                    setGeneratingTasks(false);
                    return;
                }
                // Use latest
                await generateTasksRequest(rData.roadmaps[0]._id, token);
            }

        } catch (e) {
            console.error(e);
            showAlert("Generation Error", "A critical system error occurred while architecting your today-tasks. Please try syncing again.");
        } finally {
            setGeneratingTasks(false);
            setTaskMenuOpen(false);
        }
    };

    const generateTasksRequest = async (roadmapId: string, token: string) => {
        const res = await fetch('/api/roadmap/convert-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ roadmapId })
        });
        const data = await res.json();

        if (data.error === 'OUT_OF_TOKENS') {
            setTokenWallOpen(true);
            return;
        }

        if (data.success) {
            if (typeof data.tokenBalance === 'number') {
                setTokenBalance(data.tokenBalance);
            }
            showAlert("Architecting Complete", "Your tactical tasks have been generated. Switching to Task View.");
            setGeneratingTasks(false);
            setTaskMenuOpen(false);
            navigate(`/today-task?roadmapId=${roadmapId}`);
        } else {
            showAlert("Architecting Failed", "System Error: " + (data.error || data.message || "Unknown error"));
            setGeneratingTasks(false);
        }
    }

    const handleGenerateRoadmap = async () => {
        if (!currentLoadedId) return;
        const token = localStorage.getItem('fbrts_token');

        // 1. 🛡️ SMART NAVIGATION: If it already exists, ask to View or Evolve
        if (hasRoadmap) {
            const choice = await confirm({
                title: "Roadmap Evolution Detected",
                message: "A tactical roadmap already exists for this mission. Do you want to evolve it based on your latest chat context, or view the current blueprint?",
                confirmText: "Evolve Mode",
                cancelText: "View Current"
            });

            if (choice === false) {
                navigate(`/roadmap?sessionId=${currentLoadedId}`);
                setRoadmapMenuOpen(false);
                return;
            }
            // If they chose Evolve, we proceed to generation below
        }

        // 2. EXPLICIT INTENT: Only generate if user confirms (if not already handled by evolve choice)
        if (!hasRoadmap) {
            const confirmed = await confirm({
                title: "Architect Strategic Roadmap?",
                message: "This will run a deep-context analysis on your current chat history to generate a step-by-step career roadmap. Are you ready?",
                confirmText: "Initialize Build",
                cancelText: "Wait, I'm Refining"
            });
            if (!confirmed) return;
        }

        setGeneratingMap(true);
        try {
            const res = await fetch('/api/roadmap/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    sessionId: currentLoadedId,
                    evolve: hasRoadmap // Set evolve flag if a roadmap already exists
                })
            });
            const data = await res.json();

            if (data.error === 'OUT_OF_TOKENS') {
                setTokenWallOpen(true);
                return;
            }

            if (data.success) {
                if (typeof data.tokenBalance === 'number') {
                    setTokenBalance(data.tokenBalance);
                }
                setHasRoadmap(true); // Update state immediately
                navigate(`/roadmap?sessionId=${currentLoadedId}`);
            } else {
                showAlert("Build Error", "Generation failed: " + data.error);
            }
        } catch (e) {
            console.error(e);
            showAlert("Connection Terminated", "A neural connection failure occurred. Please check your network and try re-initializing.");
        } finally {
            setGeneratingMap(false);
            setRoadmapMenuOpen(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const rawFiles = Array.from(e.target.files);
            const validFiles: File[] = [];

            rawFiles.forEach(f => {
                if (f.size > 500 * 1024 * 1024) {
                    showAlert("Payload Overload", `System Alert: ${f.name} exceeds the 500MB secure transmission limit.`);
                } else {
                    validFiles.push(f);
                }
            });

            const newFiles = validFiles.map(f => ({
                name: f.name,
                type: f.type,
                preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
                file: f
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (e.clipboardData.files.length > 0) {
            e.preventDefault();
            const rawFiles = Array.from(e.clipboardData.files);
            const validFiles: File[] = [];

            rawFiles.forEach(f => {
                if (f.size > 500 * 1024 * 1024) {
                    alert(`Limit Overload: ${f.name} is larger than 500MB.`);
                } else {
                    validFiles.push(f);
                }
            });

            const newFiles = validFiles.map(f => ({
                name: f.name,
                type: f.type,
                preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
                file: f
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleModeSelect = async (label: string, icon: string, color: string) => {
        if (label === 'Collage Project') {
            setShowMenu(false);
            // Always spawn a brand new session for project builds
            await createSession();
            setCollageProjectModalOpen(true);
            return;
        }
        setInputMode({ label, icon, color });
        setShowMenu(false);
        setTimeout(() => textAreaRef.current?.focus(), 100);
    };

    // 🚀 Architect Complete: Modal already handled API create + navigate to /projects/live/
    // When rawData present — modal navigated, just reset state cleanly
    // When no rawData — standard chat mode
    const handleArchitectComplete = async (prompt: string, rawData?: any) => {
        setCollageProjectModalOpen(false);

        if (!rawData) {
            // Standard Chat Mode — no modal project, use chat session
            const freshSession = await createSession();
            const freshId = freshSession?._id;
            if (freshId) {
                setTimeout(() => sendToSession(freshId, prompt, []), 600);
            }
        }
        // If rawData: Modal already called /create API and navigate('/projects/live/id')
        // Nothing else needed here
    };

    const handleApproveManifest = async () => {
        if (!activeTitanProject) return;
        const token = localStorage.getItem('fbrts_token');
        try {
            setTitanLogs(prev => [...prev, '[USER]: Manifest Approved', '[PIPELINE]: Triggering Deep Documentation Engine']);
            const res = await fetch(`/api/collage-project/${activeTitanProject._id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ blueprint: activeTitanProject.blueprint })
            });
            const data = await res.json();
            if (data.success) {
                setActiveTitanProject(data.project);
                setShowApprovalOverlay(false);
            }
        } catch (err) {
            console.error("Approval Failed", err);
        }
    }

    const handleMicClick = () => {
        setIsListening(!isListening);
    };
    const handleContainerClick = (e: React.MouseEvent) => {
        // Prevent focus hijack if clicking buttons/text/icons or interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button, a, input, textarea, [role="button"]') || target.classList.contains('cursor-pointer')) return;

        // Only focus if text is not being customized/selected
        if (window.getSelection()?.toString()) return;

        textAreaRef.current?.focus();
    };

    // Project Build Pulse: Listen for AI or User trigger
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (!lastMsg) return;

        const isUserTrigger = lastMsg.role === 'user' && (
            lastMsg.content?.toLowerCase().includes('build mission') ||
            lastMsg.content?.toLowerCase().includes('titan build') ||
            lastMsg.content?.toLowerCase().includes('project banana') ||
            lastMsg.content?.toLowerCase().includes('website bana')
        );

        const isAiTrigger = lastMsg.role === 'assistant' && lastMsg.content?.includes('||START_BUILD||');

        if (isUserTrigger || isAiTrigger) {
            setCollageProjectModalOpen(true);
        }
    }, [messages]);

    // Handle Socket Updates for Build Completion
    useEffect(() => {
        const socket = io('http://localhost:7001');
        socket.on('job_update', (data: any) => {
            if (data.status === 'completed' && data.result?.download_url) {
                setBuildStatus('completed');
                setBuildLogs(prev => [...prev, "[SUCCESS]: Neural Synthesis Complete.", `[READY]: Project artifact archived.`]);
                setProjectDownloadUrl(data.result.download_url);
            }
        });
        return () => { socket.disconnect(); };
    }, []);

    const handleFeedback = async (type: 'up' | 'down', messageId: string) => {
        try {
            const token = localStorage.getItem('fbrts_token');
            await fetch(`/api/builder/message/${messageId}/feedback`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, sessionId: currentLoadedId })
            });
            // Optional: Show a subtle toast or impact animation
        } catch (e) {
            console.error("Feedback storage failed", e);
        }
    };

    return (
        <div className="flex h-full overflow-hidden bg-transparent text-white w-full" onClick={handleContainerClick}>
            {/* Main Chat */}
            <div className="flex-1 flex flex-col min-w-0 bg-transparent relative h-full">
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center px-4 md:px-6 bg-[#09090b]/50 backdrop-blur-md sticky top-0 z-10 w-full shadow-sm">
                    <div className="flex items-center justify-between w-full">
                        {/* 🌐 System Status (Left) */}
                        <div className="flex items-center">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5 text-xs gap-3 min-w-[140px] justify-start px-3 border border-white/5 rounded-xl bg-white/[0.02] cursor-default">
                                {loading ? (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
                                        <span className="font-black text-[10px] tracking-tight">NEURAL SYNC</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                                        <span className="font-black text-[10px] tracking-tight">Future V.1.0</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* ⚡ Action Center (Right) */}
                        <div className="flex items-center gap-2 md:gap-3">
                            {/* 🔌 Energy Chip */}
                            <div
                                onClick={() => setTokenWallOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 cursor-pointer hover:bg-indigo-500/20 transition-all active:scale-95 group"
                            >
                                <Zap size={12} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                                <span className="text-white font-black text-[11px] tabular-nums">
                                    {user?.tokenBalance?.toLocaleString() || '0'}
                                </span>
                            </div>

                            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block" />

                            {/* TASK BUTTON */}
                            <div className="relative" ref={taskMenuRef}>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setTaskMenuOpen(!taskMenuOpen)}
                                    className="bg-[#18181b] border border-white/10 hover:bg-white/5 hover:border-indigo-500/50 text-gray-200 text-xs font-semibold gap-2 h-9 px-4 rounded-xl shadow-sm transition-all"
                                >
                                    <Menu size={14} className="text-indigo-400" /> <span className="hidden sm:inline">Tasks</span>
                                </Button>
                                {taskMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a0b] border border-white/10 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                                        <button onClick={() => navigate('/today-task')} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg flex items-center justify-between">
                                            <span>View All Tasks</span>
                                            <ArrowRight size={12} className="text-gray-600" />
                                        </button>
                                        <div className="h-px bg-white/5 my-1" />
                                        <button onClick={handleGenerateTasks} disabled={generatingTasks} className="w-full text-left px-3 py-2 text-sm text-indigo-400 hover:bg-indigo-500/10 rounded-lg font-medium flex justify-between items-center group">
                                            <span>{generatingTasks ? 'Syncing...' : 'Sync Data'}</span>
                                            <RotateCw size={12} className={`group-hover:rotate-180 transition-transform duration-500 ${generatingTasks ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* ROADMAP BUTTON */}
                            <div className="relative flex-shrink-0" ref={roadmapMenuRef}>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setRoadmapMenuOpen(!roadmapMenuOpen)}
                                    className="bg-[#18181b] border border-white/10 hover:bg-white/5 hover:border-purple-500/50 text-gray-200 text-xs font-bold gap-2 h-10 px-5 rounded-2xl shadow-lg transition-all active:scale-95"
                                >
                                    <Map size={14} className="text-purple-400" /> Roadmap
                                </Button>
                                {roadmapMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-[#0a0a0b] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-2xl">
                                        <button
                                            onClick={() => navigate(hasRoadmap ? `/roadmap?sessionId=${currentLoadedId}` : '/roadmap')}
                                            className="w-full text-left px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 rounded-xl flex items-center justify-between group transition-colors"
                                        >
                                            <span className="font-semibold">{hasRoadmap ? 'View Active Roadmap' : 'Explore Global List'}</span>
                                            {hasRoadmap ? (
                                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-400/20 font-black tracking-tighter uppercase">Live</span>
                                            ) : (
                                                <ArrowRight size={14} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                                            )}
                                        </button>
                                        <div className="h-px bg-white/5 my-1.5" />
                                        <button
                                            onClick={handleGenerateRoadmap}
                                            disabled={generatingMap}
                                            className="w-full text-left px-3 py-2.5 text-sm text-purple-400 hover:bg-purple-500/10 rounded-xl font-bold flex justify-between items-center group transition-all"
                                        >
                                            <span>{generatingMap ? 'Generating...' : (hasRoadmap ? 'Refresh Analysis' : 'Generate Roadmap')}</span>
                                            {!generatingMap && <Sparkles size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 w-full scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {messages.length === 0 && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-100 max-w-2xl mx-auto w-full gap-6 pt-20 pb-10">
                            <div className="flex flex-col items-center">
                                <div className="relative group/logo">
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-[40px] rounded-full animate-pulse transition-all duration-1000 group-hover/logo:bg-indigo-500/40" />
                                    <div className="relative w-16 h-16 rounded-[24px] bg-gradient-to-b from-[#131316] to-[#09090b] border border-white/10 flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-all duration-700 hover:scale-110 hover:border-indigo-500/30">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05)_0%,transparent_60%)]" />
                                        <Rocket size={28} className="text-indigo-400 -rotate-12 transition-transform duration-700 group-hover/logo:rotate-0" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-lg bg-indigo-600/10 border border-indigo-500/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-white/80 text-center">How can I help you build today?</h2>

                            {/* 🚀 ELITE START POINT - Project Architect */}
                            <div className="relative group mt-2">
                                <div className="absolute -inset-1.5 bg-indigo-500/50 rounded-[28px] blur-2xl opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
                                <button
                                    onClick={() => setCollageProjectModalOpen(true)}
                                    className="relative flex flex-col items-center gap-3 px-8 py-6 rounded-[24px] bg-[#0c0c0e] border border-white/10 text-white hover:border-indigo-500/50 transition-all group overflow-hidden shadow-2xl"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        <Rocket size={24} className="text-indigo-400 group-hover:text-white -rotate-12 group-hover:rotate-0 transition-all duration-500" />
                                    </div>

                                    <div className="text-center">
                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 group-hover:text-white transition-colors">Start Titan Mission</p>
                                        <h3 className="text-lg font-black italic uppercase tracking-tighter mt-0.5 group-hover:scale-105 transition-transform">Project Architect</h3>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-white/5 border border-white/5 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all">
                                        <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 group-hover:text-indigo-300">Neural Synthesis Ready</span>
                                    </div>
                                </button>

                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.6em] animate-bounce">Click to Begin Genesis</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <MessageBubble
                            key={msg.id || i}
                            role={msg.role}
                            content={msg.content}
                            thinking={msg.thinking}
                            isThinking={msg.isThinking}
                            thinkingTime={msg.thinkingTime}
                            attachments={msg.attachments}
                            onRetry={i === messages.length - 1 && msg.role === 'assistant' ? () => handleSend() : undefined}
                            onFeedback={(type) => handleFeedback(type, msg.id)}
                            summary={msg.summary}
                            suggestions={msg.suggestions}
                            onEdit={(newVal) => handleEditPrompt(newVal, i)}
                            isProcessing={loading && i === messages.length - 1 && msg.role === 'assistant'}
                            onStop={handleStopGeneration}
                            onSuggestionClick={handleSuggestionClick}
                            onViewBuildConsole={
                                msg.content?.includes('🔱 TITAN MISSION COMPLETE') ||
                                    msg.content?.includes('BUILD MISSION')
                                    ? () => {
                                        setBuildStatus('completed');
                                        const points22 = [
                                            "Vision & Executive Summary", "Target Audience Analysis", "Market Gap Identification",
                                            "SWOT Matrix Analysis", "Strategic Roadmap Planning", "Modular System Architecture",
                                            "Database Schema & ERD", "Security & Encryption Protocol", "RESTful API Specification",
                                            "Performance Tuning & Latency", "UI/UX Design Philosophy", "Component Life Cycle Flow",
                                            "Global Authentication Logic", "System Resilience & Failover", "Industrial Deployment Strategy",
                                            "Unit & Integration Testing", "CI/CD Pipeline Automation", "Compliance & Legal Standards",
                                            "Accessibility & Inclusivity", "Expected Industrial Results", "Future Scaling & Maintenance",
                                            "Final Synthesis & Conclusion"
                                        ];
                                        setBuildLogs(points22.map((pt, idx) => `[NODE ${idx + 1}]: ${pt} - SYNTHESIZED`));
                                    }
                                    : undefined
                            }
                        />
                    ))}

                    {loading && (
                        <div className="flex gap-4 mx-auto max-w-6xl w-full animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                                <Brain size={18} className="text-indigo-400 animate-pulse" />
                            </div>
                            <div className="flex flex-col gap-2 pt-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75" />
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] animate-pulse">
                                        <NeuralLoadingText />
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* 🛠️ Neural Build Engine Console */}
                <AnimatePresence>
                    {buildStatus !== 'idle' && (
                        <motion.div
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            className="absolute inset-y-0 right-0 w-[400px] bg-[#050505] border-l border-white/10 z-[60] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
                        >
                            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${buildStatus === 'building' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Neural Build Engine</span>
                                </div>
                                <button onClick={() => setBuildStatus('idle')} className="text-gray-500 hover:text-white transition-all"><X size={18} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono">
                                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
                                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2">Build Manifest</p>
                                    <h4 className="text-sm font-bold text-white italic">Mission: {messages.find(m => m.content?.includes('TITAN_PLAN_REQUEST') || m.content?.includes('🔱'))?.content?.split('\n')?.[2]?.split(':')?.[1] || 'Neural Genesis'}</h4>
                                </div>

                                <div className="space-y-3">
                                    {(activeTitanProject ? [
                                        `[STATUS]: ${activeTitanProject.status}`,
                                        `[STEP]: ${activeTitanProject.currentStep || 'Synthesizing'}`,
                                        ...(activeTitanProject.logs || [])
                                    ] : buildLogs).map((log, i) => {
                                        const isNode = log.includes('[NODE');
                                        const nodeTitle = log.split(']: ')[1]?.split(' - ')?.[0];
                                        const isSynthesized = log.includes('SYNTHESIZED');

                                        return (
                                            <motion.div
                                                key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                                className={`text-[11px] flex items-center gap-3 p-2.5 rounded-lg border ${isSynthesized ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-400'}`}
                                            >
                                                <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${isSynthesized ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'border-white/20'}`}>
                                                    {isSynthesized ? <Check size={10} strokeWidth={4} /> : <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" />}
                                                </div>
                                                <div className="flex-1 flex justify-between items-center">
                                                    <span className={`font-bold uppercase tracking-tight ${isSynthesized ? 'text-emerald-300' : ''}`}>
                                                        {isNode ? nodeTitle : log}
                                                    </span>
                                                    {isSynthesized && <span className="text-[8px] font-black opacity-40 italic">VERIFIED</span>}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    {buildStatus === 'building' && (
                                        <div className="flex items-center gap-3 px-3 py-4 border border-indigo-500/20 bg-indigo-500/5 rounded-xl">
                                            <Loader2 size={14} className="animate-spin text-indigo-400" />
                                            <span className="text-[9px] font-black uppercase text-indigo-300 tracking-[0.2em] animate-pulse">Architecting Master Dossier...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {buildStatus === 'completed' && projectDownloadUrl && (
                                <div className="p-6 border-t border-white/10 bg-indigo-600/5 backdrop-blur-xl space-y-3">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 text-center">Neural Synthesis Verified: 4 Artifacts Ready</p>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-white text-black font-bold text-[10px] uppercase tracking-wider py-4 h-auto rounded-xl gap-2 hover:bg-white/90"
                                            onClick={() => handleDownload(projectDownloadUrl, 'Titan_Project_Package.zip')}
                                        >
                                            <Rocket size={14} /> ZIP Archive
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-[#0d0d0d] border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider py-4 h-auto rounded-xl gap-2 hover:bg-white/5"
                                            onClick={() => {
                                                const url = activeProjectFiles?.word?.url || projectDownloadUrl?.replace('.zip', '.docx');
                                                handleDownload(url, 'Technical_Dossier.docx');
                                            }}
                                        >
                                            <FileText size={14} className="text-blue-400" /> Word Doc
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-[#0d0d0d] border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider py-4 h-auto rounded-xl gap-2 hover:bg-white/5"
                                            onClick={() => {
                                                const url = activeProjectFiles?.pdf?.url || projectDownloadUrl?.replace('.zip', '.pdf');
                                                handleDownload(url, 'Industrial_Package.pdf');
                                            }}
                                        >
                                            <FileText size={14} className="text-red-400" /> PDF Pack
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-[#0d0d0d] border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider py-4 h-auto rounded-xl gap-2 hover:bg-white/5"
                                            onClick={() => {
                                                const url = activeProjectFiles?.ppt?.url || projectDownloadUrl?.replace('.zip', '.pptx');
                                                handleDownload(url, 'Strategic_Presentation.pptx');
                                            }}
                                        >
                                            <Plus size={14} className="text-amber-400 rotate-45" /> PPT Slides
                                        </Button>
                                    </div>

                                    <p className="text-[8px] text-center text-gray-500 font-bold uppercase tracking-widest pt-2">Building Structure Maintained</p>
                                </div>
                            )}

                            {buildStatus === 'building' && (
                                <div className="p-8 border-t border-white/10 flex flex-col items-center gap-4">
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-indigo-500"
                                            animate={{ width: ["0%", "40%", "40%", "70%", "70%", "100%"] }}
                                            transition={{ duration: 15, repeat: Infinity }}
                                        />
                                    </div>
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em]">System Constructing Artifacts</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 🧠 Neural Strategy Generation Overlay */}
                <AnimatePresence>
                    {generatingMap && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/98 backdrop-blur-2xl px-10 text-center"
                        >
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-indigo-500/25 blur-[60px] animate-pulse rounded-full" />
                                <div className="px-12 py-6 rounded-[24px] border border-white/10 flex flex-col items-center justify-center relative bg-black shadow-2xl shadow-indigo-500/20">
                                    <span className="text-3xl font-black italic uppercase tracking-[-0.05em] text-white">Future</span>
                                    <span className="text-xl font-black italic uppercase tracking-[0.4em] text-indigo-500 -mt-1 ml-1 animate-pulse">Bilder</span>
                                </div>
                            </div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">Architecting Strategy</h3>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">Initializing Neural Grid Sync</p>

                            <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
                                <motion.div
                                    className="h-full bg-indigo-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 5, ease: "easeInOut" }}
                                />
                            </div>

                            <div className="flex gap-4 items-center transition-all duration-700">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Neural Strategy Alignment...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Smart Input Area */}
                <div
                    className="p-6 bg-gradient-to-t from-[#09090b]/80 via-[#09090b]/70 to-transparent w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`max-w-4xl mx-auto relative bg-[#0d0d0f]/90 border border-white/5 backdrop-blur-2xl rounded-[28px] p-1.5 flex flex-col gap-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 ${isListening ? 'ring-2 ring-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'focus-within:border-white/20'}`}>


                        {/* File Previews & Mode Pill inside Input */}
                        {(files.length > 0 || inputMode) && (
                            <div className="flex gap-2 p-2 overflow-x-auto items-center">
                                {inputMode && (
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18181b] border border-white/10 ${inputMode.color} text-sm font-medium animate-in fade-in slide-in-from-bottom-1`}>
                                        <span>{inputMode.icon}</span>
                                        <span>{inputMode.label}</span>
                                        <button onClick={() => setInputMode(null)} className="ml-1 hover:text-white text-white/50" title="Clear Mode">x</button>
                                    </div>
                                )}
                                {files.map((f, i) => (
                                    <div key={i} className="relative group bg-white/5 rounded-lg p-2 border border-white/10 shrink-0">
                                        {f.preview ? <img src={f.preview} alt="preview" className="w-12 h-12 object-cover rounded-md" /> :
                                            <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-md"><span className="text-xs uppercase font-bold">{f.name.split('.').pop()}</span></div>}
                                        <button onClick={() => removeFile(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">x</button>
                                        <div className="text-[10px] truncate max-w-[60px] mt-1 text-gray-400">{f.name}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 🚀 QUICK ACTIONS (REDI-CLICKS) - Compacted for Premium Look */}
                        {!showMenu && !loading && (
                            <div className="flex gap-1.5 px-3 mb-1 animate-in fade-in slide-in-from-bottom-1 duration-500">
                                <button
                                    onClick={() => setCollageProjectModalOpen(true)}
                                    className="px-2.5 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all text-[8px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-indigo-600/5 group"
                                >
                                    <Rocket size={10} className="group-hover:animate-bounce" />
                                    Project Architect
                                </button>
                                <button
                                    onClick={() => handleModeSelect('Deep research', '🔭', 'text-blue-400')}
                                    className="px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-500 hover:bg-white/10 hover:text-white transition-all text-[8px] font-black uppercase tracking-wider flex items-center gap-1.5"
                                >
                                    <Search size={10} />
                                    Deep Research
                                </button>
                            </div>
                        )}

                        <div className="flex items-end gap-3 px-3 relative min-h-[48px] pb-1">
                            {/* Attachment Trigger */}
                            <button
                                onClick={() => { setShowMenu(!showMenu); setMenuView('main'); }}
                                className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center shrink-0 mb-1 border ${showMenu
                                    ? 'bg-white text-black border-white rotate-45 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'}`}
                                title="Add photos & files"
                            >
                                <Plus size={18} />
                            </button>
                            <input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />

                            {/* Main Text Input - Premium Minimalist Textarea */}
                            <textarea
                                ref={textAreaRef}
                                className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder:text-white/20 text-[14px] md:text-[15px] py-2.5 md:py-3 resize-none max-h-[200px] leading-relaxed font-medium transition-colors"
                                placeholder={isListening ? "Listening with Neural Precision..." : (inputMode ? `Collaborating in ${inputMode.label}...` : "Ask anything...")}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onPaste={handlePaste}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                disabled={loading}
                                rows={1}
                                autoFocus
                                style={{ height: 'auto', overflow: 'hidden' }}
                                onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                            />

                            {/* Right Actions */}
                            <div className="flex items-center gap-1.5 mb-1 h-8">
                                {input.trim() || files.length > 0 ? (
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={loading}
                                        className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95 shadow-[0_4px_12px_rgba(255,255,255,0.15)]"
                                    >
                                        {loading ? <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Send size={15} />}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleMicClick}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isListening
                                            ? 'text-red-500 bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'}`}
                                        title="Voice Input"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <div className="absolute bottom-[calc(100%+12px)] left-0 bg-[#111113] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,1)] p-2 w-[280px] animate-in fade-in slide-in-from-bottom-2 z-50 overflow-hidden font-sans backdrop-blur-2xl">
                                {menuView === 'main' ? (
                                    <>
                                        <button className="flex items-center gap-3 w-full px-4 py-3 text-[14px] text-white hover:bg-[#424242] rounded-xl transition-all text-left group" onClick={() => fileInputRef.current?.click()}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-white shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                                            <span className="text-white">📎</span> Add photos & files
                                        </button>
                                        <div className="h-px bg-white/10 my-1 mx-2" />
                                        <div className="py-1 space-y-1">
                                            <button onClick={() => handleModeSelect('Create image', '🎨', 'text-pink-400')} className="flex items-center gap-3 w-full px-4 py-3 text-[14px] text-white hover:bg-[#424242] rounded-xl transition-all text-left group">
                                                <div className="w-1 h-1 rounded-full bg-pink-500/40 group-hover:bg-pink-400 shrink-0" />
                                                <span>🎨</span> Create image
                                            </button>
                                            <button onClick={() => handleModeSelect('Deep research', '🔭', 'text-blue-400')} className="flex items-center gap-3 w-full px-4 py-3 text-[14px] text-white hover:bg-[#424242] rounded-xl transition-all text-left group">
                                                <div className="w-1 h-1 rounded-full bg-blue-500/40 group-hover:bg-blue-400 shrink-0" />
                                                <span>🔭</span> Deep research
                                            </button>
                                            <button onClick={() => handleModeSelect('Collage Project', '🖼️', 'text-indigo-400')} className="flex items-center gap-3 w-full px-4 py-3 text-[14px] font-black text-white bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/40 hover:to-purple-600/40 border border-indigo-500/30 rounded-xl transition-all text-left my-1 ring-1 ring-indigo-500/50 shadow-xl shadow-indigo-500/20 group">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:bg-indigo-400 shrink-0 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                                <span>🖼️</span> Create Collage Project
                                            </button>
                                            <button onClick={() => handleModeSelect('Shopping', '🛍️', 'text-orange-400')} className="flex items-center gap-3 w-full px-4 py-3 text-[14px] text-white hover:bg-[#424242] rounded-xl transition-all text-left group">
                                                <div className="w-1 h-1 rounded-full bg-orange-500/40 group-hover:bg-orange-400 shrink-0" />
                                                <span>🛍️</span> Shopping research
                                            </button>
                                            <div className="h-px bg-white/10 my-1 mx-2" />
                                            <button onClick={() => setMenuView('more')} className="flex items-center justify-between w-full px-4 py-3 text-[14px] text-white hover:bg-[#424242] rounded-xl transition-all text-left group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-white" />
                                                    <span className="text-gray-400 group-hover:text-white transition-colors">••• More</span>
                                                </div>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="animate-in slide-in-from-right-2 fade-in">
                                        <button onClick={() => setMenuView('main')} className="flex items-center gap-2 mb-2 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors">← Back</button>
                                        <div className="py-1 space-y-1">
                                            <button onClick={() => handleModeSelect('Study', '🎓', 'text-emerald-400')} className="flex items-center gap-3 w-full px-4 py-3 text-[14px] text-white hover:bg-[#424242] rounded-xl transition-all text-left group">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500/40 group-hover:bg-emerald-400" />
                                                <span>🎓</span> Study and learn
                                            </button>
                                            <button onClick={() => handleModeSelect('Canvas', '📝', 'text-amber-400')} className="flex items-center gap-3 w-full px-4 py-3 text-[14px] text-white hover:bg-[#424242] rounded-xl transition-all text-left group">
                                                <div className="w-1 h-1 rounded-full bg-amber-500/40 group-hover:bg-amber-400" />
                                                <span>📝</span> Canvas
                                            </button>
                                            <button onClick={() => handleModeSelect('Code', '💻', 'text-cyan-400')} className="flex items-center gap-3 w-full px-4 py-3 text-[14px] text-white hover:bg-[#424242] rounded-xl transition-all text-left group">
                                                <div className="w-1 h-1 rounded-full bg-cyan-500/40 group-hover:bg-cyan-400" />
                                                <span>💻</span> Coding Assistant
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 🔱 NEURAL MANIFEST APPROVAL OVERLAY */}
            <AnimatePresence>
                {showApprovalOverlay && activeTitanProject?.blueprint && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2500] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-5xl bg-[#0a0a0c] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)] flex flex-col max-h-[90vh]"
                        >
                            <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
                                        <Shield size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Titan Neural Manifest</h2>
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em]">Awaiting Architect Verification</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">High-Fidelity Ready</span>
                                    </div>
                                </div>
                            </header>

                            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">01_Mission_Vision</h3>
                                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                                            <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter">{activeTitanProject?.blueprint?.title || 'Unknown Mission'}</h4>
                                            <p className="text-sm text-gray-400 leading-relaxed italic">"{activeTitanProject?.blueprint?.vision || 'Synchronizing Vision...'}"</p>
                                        </div>
                                    </section>

                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">02_Neural_Stack</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {activeTitanProject.blueprint?.stack && typeof activeTitanProject.blueprint.stack === 'object' && Object.entries(activeTitanProject.blueprint.stack).map(([k, v]: any) => (
                                                <div key={k} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{k}</p>
                                                    <p className="text-xs font-bold text-white uppercase tracking-tight">{v}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">03_Database_DNA</h3>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-4 scrollbar-hide">
                                            {Array.isArray(activeTitanProject.blueprint.dbSchema) && activeTitanProject.blueprint.dbSchema.map((s: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{s?.table || 'SECURED_UNIT'}</span>
                                                    <span className="text-[8px] text-gray-500 font-bold">{s?.fields?.length || 0} Fields Synchronized</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-8">
                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">04_Document_Syllabus</h3>
                                        <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-indigo-500/10 space-y-3">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">22-Point Neural Outline</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-4 scrollbar-hide">
                                                {activeTitanProject.blueprint.outline22 && typeof activeTitanProject.blueprint.outline22 === 'object' && Object.entries(activeTitanProject.blueprint.outline22 || {}).map(([k, v]: any, i) => (
                                                    <div key={k} className="flex gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                                        <span className="text-[10px] font-black text-indigo-500/40">{(i + 1).toString().padStart(2, '0')}</span>
                                                        <div>
                                                            <p className="text-[9px] font-black text-white uppercase tracking-wider mb-1">
                                                                {typeof k === 'string' && k.includes('_') ? k.split('_').slice(1).join(' ') : k}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 italic leading-tight">{v}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>

                            <footer className="h-24 border-t border-white/5 px-10 flex items-center justify-between bg-white/[0.02]">
                                <p className="text-[10px] text-gray-500 font-bold max-w-sm leading-relaxed">
                                    <span className="text-amber-500/60 font-black">WARNING:</span> Approving this manifest will trigger the 4-phase iterative documentation and code generation engine. This process consumes neural tokens and cannot be paused.
                                </p>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setShowApprovalOverlay(false)} className="px-8 py-3 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-all">Cancel Mission</button>
                                    <button
                                        onClick={handleApproveManifest}
                                        className="px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-indigo-600/30 flex items-center gap-3 group"
                                    >
                                        <Rocket size={14} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                        Initialize Build Mission
                                    </button>
                                </div>
                            </footer>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <TokenWall
                isOpen={tokenWallOpen}
                onClose={() => setTokenWallOpen(false)}
                onActionComplete={() => {
                    setTokenWallOpen(false);
                    // Refresh logic could go here if balance was tracked in state
                }}
            />
            <CollageProjectModal
                isOpen={collageProjectModalOpen}
                onClose={() => setCollageProjectModalOpen(false)}
                onComplete={handleArchitectComplete}
            />
        </div>
    );
}

