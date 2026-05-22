import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, Loader2, Database, Layout, Shield, Cpu,
    Globe, Terminal, PenTool, Zap, Flame, Blocks,
    Smartphone, Rocket, Brain, Activity, Target, Monitor, Server, X, BookOpen, GraduationCap, Microscope, Briefcase, Cloud, Layers, Lock, Cable, Box
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import UniverseBackground from '../ui/UniverseBackground';

interface CollageProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (prompt: string, rawData?: any) => void;
}

type Category = 'STUDENT_8_12' | 'GRADUATION' | 'POST_GRAD_PHD' | 'BUSINESS_FREELANCE';

const DEGREE_DATABASE = {
    GRADUATION: [
        "Bachelor of Technology in Computer Science", "Bachelor of Engineering in Computer Science", "Bachelor of Science in Computer Science",
        "Bachelor of Computer Applications", "Bachelor of Information Technology", "Bachelor of Science in Information Technology",
        "Bachelor of Engineering in Information Technology", "Bachelor of Science in Software Engineering", "Bachelor of Engineering in Software Engineering",
        "Bachelor of Technology in Software Engineering", "Bachelor in Computer Engineering", "Bachelor of Science in Artificial Intelligence",
        "Bachelor of Technology in Artificial Intelligence", "Bachelor of Science in Data Science", "Bachelor of Technology in Data Science",
        "Bachelor of Science in Machine Learning", "Bachelor in Data Analytics", "Bachelor of Science in Cyber Security",
        "Bachelor of Technology in Cyber Security", "Bachelor of Science in Information Security", "Bachelor of Engineering in Cyber Security",
        "Bachelor in Network Engineering", "Bachelor in Computer Networks", "Bachelor in Cloud Computing", "Bachelor in DevOps Engineering",
        "Bachelor in Systems Engineering", "Bachelor in Network and Cloud Computing", "Bachelor in Blockchain Technology",
        "Bachelor in Internet of Things", "Bachelor in Robotics", "Bachelor in Embedded Systems", "Bachelor in Computer Graphics and Game Development",
        "Bachelor in Game Development", "Bachelor in AR/VR Development", "Bachelor in Information Systems", "Bachelor in Management Information Systems",
        "Bachelor in Business Information Technology", "Bachelor in IT Management"
    ],
    POST_GRAD_PHD: [
        "Master of Science in Computer Science", "Master of Technology in Computer Science", "Master of Engineering in Computer Science",
        "Master of Computer Applications", "Master of Science in Software Engineering", "Master of Engineering in Software Engineering",
        "Master in Computer Engineering", "Master of Science in Artificial Intelligence", "Master of Science in Machine Learning",
        "Master of Science in Data Science", "Master of Technology in Data Science", "Master in Big Data Analytics",
        "Master in AI and Robotics", "Master of Science in Cyber Security", "Master in Information Security",
        "Master in Digital Forensics", "Master in Network Security", "Master in Cloud Computing", "Master in Distributed Systems",
        "Master in Systems Engineering", "Master in DevOps", "Master in Blockchain", "Master in Internet of Things",
        "Master in Quantum Computing", "Master in Human Computer Interaction", "Master in Game Development",
        "Master of Philosophy in Computer Science", "Master by Research in Computer Science",
        "PhD in Computer Science", "PhD in Artificial Intelligence", "PhD in Data Science", "PhD in Information Technology"
    ]
};



export const CollageProjectModal: React.FC<CollageProjectModalProps> = ({ isOpen, onClose, onComplete }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState<Category | null>(null);
    const [field, setField] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [type, setType] = useState('Full Stack App');
    const [projectTitle, setProjectTitle] = useState(''); // FIX #3: Direct Title State
    const [requirements, setRequirements] = useState('');
    const [prototypeMode, setPrototypeMode] = useState(true); // Default to true as per user request
    const [integrations, setIntegrations] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // AI DISCOVERY STATE
    const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);
    const [chatHistory, setChatHistory] = useState<{role: 'user'|'agent', text: string}[]>([{role: 'agent', text: 'Hi! I am your AI Architect. What kind of features do you want in this project? (Aap Hindi ya English dono me apne features aur ideas bata sakte hain, I will adapt!)'}]);
    const [chatMsg, setChatMsg] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isDiscoveryComplete, setIsDiscoveryComplete] = useState(false);

    const handleDiscoverySubmit = async (e?: React.FormEvent, customMsg?: string, isSystemAuto?: boolean) => {
        if(e) e.preventDefault();
        const msg = (customMsg !== undefined ? customMsg : chatMsg).trim();
        if (!msg || isChatLoading) return;
        
        const newHistory = isSystemAuto ? chatHistory : [...chatHistory, {role: 'user' as const, text: msg}];
        setChatHistory(newHistory);
        if(!isSystemAuto) setChatMsg('');
        setIsChatLoading(true);

        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/collage-project/discovery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    message: msg,
                    context: { title: projectTitle || 'Untitled', type, category, field },
                    history: newHistory
                })
            });
            const data = await res.json();
            
            setIsChatLoading(false);
            if (data.success === false) {
                setChatHistory(prev => [...prev, {role: 'agent', text: `⚠️ API Error: ${data.message || data.error || 'Failed to process request due to heavy load.'}`}]);
            } else if (data.isComplete && data.document) {
                setIsDiscoveryComplete(true);
                setRequirements(JSON.stringify(data.document, null, 2));
                setChatHistory(prev => [...prev, {role: 'agent', text: "✅ System Data: Apka pura R&D and memory save kiya gaya hai! Now click BUILD_MISSION to start development!"}]);
            } else {
                setChatHistory(prev => [...prev, {role: 'agent', text: data.question || data.data?.question}]);
            }
        } catch(err) {
            setIsChatLoading(false);
            console.error(err);
        }
    };

    const startAutoRnD = (e: React.MouseEvent) => {
        e.preventDefault();
        if(!projectTitle.trim()) return;
        setIsDiscoveryMode(true);
        const msg = `System Direct: The user wants to build "${projectTitle}". ACT LIKE CHATGPT DOING FULL R&D. Provide an extremely long, exhaustive, point-by-point Architectural Blueprint right now. Detail every single feature, every role, every admin panel function deeply. Make it massive and comprehensive before we proceed.`;
        handleDiscoverySubmit(undefined, msg, true);
    };

    const filteredDegrees = useMemo(() => {
        if (!category || !field || !showSuggestions) return [];
        const pool = DEGREE_DATABASE[category as keyof typeof DEGREE_DATABASE] || [];
        return pool.filter(d => d.toLowerCase().includes(field.toLowerCase())).slice(0, 6);
    }, [category, field, showSuggestions]);

    const [selectedTech, setSelectedTech] = useState<Record<string, string>>({});

    const stackOptions = {
        frontend: {
            label: 'Web Frontend', icon: <Layout className="text-[#6366f1]" />,
            options: [
                { id: 'vanilla', name: 'HTML, CSS & JS', desc: 'Vanilla Core Web', icon: <Box size={14} /> },
                { id: 'next', name: 'Next.js 14 / React', desc: 'Vercel React Framework', icon: <Blocks size={14} /> },
                { id: 'react', name: 'React + Vite', desc: 'Modern SPA Core', icon: <Zap size={14} /> },
                { id: 'vue', name: 'Vue.js 3', desc: 'Progressive Framework', icon: <Target size={14} /> },
                { id: 'angular', name: 'Angular', desc: 'Enterprise MVC', icon: <Globe size={14} /> },
                { id: 'svelte', name: 'SvelteKit', desc: 'Cybernetically Enhanced', icon: <Zap size={14} /> },
                { id: 'astro', name: 'Astro', desc: 'Content-driven SSG', icon: <Rocket size={14} /> },
                { id: 'jquery', name: 'jQuery / Ajax', desc: 'Legacy DOM Scripting', icon: <Box size={14} /> },
                { id: 'tailwind', name: 'Tailwind CSS', desc: 'Utility-first Styling', icon: <Layout size={14} /> },
                { id: 'bootstrap', name: 'Bootstrap 5', desc: 'Standard UI Kit', icon: <Layout size={14} /> },
                { id: 'htmx', name: 'HTMX + Vanilla', desc: 'Minimal JS Hypermedia', icon: <Terminal size={14} /> }
            ]
        },
        backend: {
            label: 'Web Server & Backend', icon: <Server className="text-[#10b981]" />,
            options: [
                { id: 'node', name: 'Node.js / Express', desc: 'Asynchronous JS', icon: <Terminal size={14} /> },
                { id: 'nestjs', name: 'NestJS', desc: 'Enterprise TS Backend', icon: <Server size={14} /> },
                { id: 'core_php', name: 'Core PHP', desc: 'Raw PHP Programming', icon: <Terminal size={14} /> },
                { id: 'laravel', name: 'PHP Laravel', desc: 'Modern Web Artisan', icon: <Globe size={14} /> },
                { id: 'codeigniter', name: 'CodeIgniter', desc: 'Lightweight PHP MVC', icon: <Zap size={14} /> },
                { id: 'symfony', name: 'Symfony', desc: 'Robust PHP Components', icon: <Blocks size={14} /> },
                { id: 'fastapi', name: 'Python FastAPI', desc: 'High-performance AI', icon: <Cpu size={14} /> },
                { id: 'django', name: 'Python Django', desc: 'Batteries Included', icon: <Terminal size={14} /> },
                { id: 'flask', name: 'Python Flask', desc: 'Micro Web Framework', icon: <Box size={14} /> },
                { id: 'spring', name: 'Java Spring Boot', desc: 'Enterprise Robustness', icon: <Shield size={14} /> },
                { id: 'go', name: 'Go (Fiber/Gin)', desc: 'High Concurrency', icon: <Zap size={14} /> },
                { id: 'rust', name: 'Rust (Actix/Axum)', desc: 'Memory Safe & Fast', icon: <Target size={14} /> },
                { id: 'aspnet', name: 'C# ASP.NET Core', desc: 'Microsoft Enterprise', icon: <Blocks size={14} /> }
            ]
        },
        mobile: {
            label: 'Mobile Ecosystem', icon: <Smartphone className="text-[#ec4899]" />,
            options: [
                { id: 'reactnative', name: 'React Native (Expo)', desc: 'Native Hybrid UI', icon: <Smartphone size={14} /> },
                { id: 'flutter', name: 'Flutter (Dart)', desc: 'Google Multi-platform', icon: <Smartphone size={14} /> },
                { id: 'swift', name: 'SwiftUI (iOS)', desc: 'Apple Native', icon: <Smartphone size={14} /> },
                { id: 'kotlin', name: 'Kotlin (Android)', desc: 'Android Native', icon: <Smartphone size={14} /> },
                { id: 'ionic', name: 'Ionic / Cordova', desc: 'Web Tech Mobile', icon: <Globe size={14} /> },
                { id: 'maui', name: '.NET MAUI', desc: 'C# Cross-platform', icon: <Blocks size={14} /> }
            ]
        },
        desktop: {
            label: 'Desktop Software', icon: <Monitor className="text-[#f59e0b]" />,
            options: [
                { id: 'electron', name: 'Electron.js', desc: 'Web Tech Desktop', icon: <Monitor size={14} /> },
                { id: 'tauri', name: 'Tauri (Rust)', desc: 'Lightweight Rust Core', icon: <Monitor size={14} /> },
                { id: 'pyqt', name: 'Python PyQt/Tkinter', desc: 'Native Python UI', icon: <Terminal size={14} /> },
                { id: 'wpf', name: 'C# .NET WPF', desc: 'Windows Native', icon: <Monitor size={14} /> },
                { id: 'javafx', name: 'JavaFX', desc: 'Java UI Toolkit', icon: <Monitor size={14} /> },
                { id: 'cppqt', name: 'C++ Qt Framework', desc: 'High-perf GUI', icon: <Cpu size={14} /> }
            ]
        },
        database: {
            label: 'Persistence Layer', icon: <Database className="text-[#f59e0b]" />,
            options: [
                { id: 'pg', name: 'PostgreSQL', desc: 'Advanced SQL RDBMS', icon: <Database size={14} /> },
                { id: 'mysql', name: 'MySQL / MariaDB', desc: 'Standard Relational', icon: <Database size={14} /> },
                { id: 'sqlite', name: 'SQLite', desc: 'Local Database', icon: <Database size={14} /> },
                { id: 'mongo', name: 'MongoDB', desc: 'NoSQL Document Store', icon: <Database size={14} /> },
                { id: 'redis', name: 'Redis / Memcached', desc: 'High-speed Cache', icon: <Flame size={14} /> },
                { id: 'supabase', name: 'Supabase / Firebase', desc: 'BaaS DB & Auth', icon: <Cloud size={14} /> },
                { id: 'cassandra', name: 'Cassandra / Scylla', desc: 'Wide Column DB', icon: <Database size={14} /> },
                { id: 'dynamodb', name: 'AWS DynamoDB', desc: 'Serverless NoSQL', icon: <Cloud size={14} /> },
                { id: 'oracle', name: 'Oracle DB', desc: 'Enterprise SQL', icon: <Shield size={14} /> },
                { id: 'neo4j', name: 'Neo4j', desc: 'Graph Database', icon: <Target size={14} /> }
            ]
        },
        microservices: {
            label: 'Microservices & APIs', icon: <Cable className="text-[#3b82f6]" />,
            options: [
                { id: 'graphql', name: 'GraphQL / Apollo', desc: 'Typed Graph API', icon: <Cable size={14} /> },
                { id: 'grpc', name: 'gRPC / Protobuf', desc: 'High-speed RPC', icon: <Zap size={14} /> },
                { id: 'kafka', name: 'Apache Kafka', desc: 'Event Streaming', icon: <Layers size={14} /> },
                { id: 'rabbitmq', name: 'RabbitMQ', desc: 'Message Queue', icon: <Server size={14} /> },
                { id: 'webhooks', name: 'Webhooks System', desc: 'Event-driven Triggers', icon: <Globe size={14} /> },
                { id: 'nats', name: 'NATS.io', desc: 'Distributed Messaging', icon: <Target size={14} /> }
            ]
        },
        security: {
            label: 'Security & Auth', icon: <Lock className="text-[#ef4444]" />,
            options: [
                { id: 'jwt', name: 'JWT Custom Auth', desc: 'Stateless Tokens', icon: <Lock size={14} /> },
                { id: 'oauth', name: 'OAuth 2.0 (Google/GitHub)', desc: 'Social Logins', icon: <Shield size={14} /> },
                { id: 'keycloak', name: 'Keycloak / Auth0', desc: 'Identity Provider', icon: <Shield size={14} /> },
                { id: 'bcrypt', name: 'Argon2 / bcrypt', desc: 'Hash Cryptography', icon: <Lock size={14} /> },
                { id: 'ssl', name: 'SSL / TLS Config', desc: 'Protocol Encryption', icon: <Lock size={14} /> },
                { id: 'waf', name: 'Cloudflare WAF', desc: 'Web Application Firewall', icon: <Shield size={14} /> }
            ]
        },
        devops: {
            label: 'Cloud & DevOps', icon: <Cloud className="text-[#06b6d4]" />,
            options: [
                { id: 'docker', name: 'Docker Containers', desc: 'Isolated Envs', icon: <Box size={14} /> },
                { id: 'k8s', name: 'Kubernetes (K8s)', desc: 'Container Orchestration', icon: <Layers size={14} /> },
                { id: 'aws', name: 'AWS Cloud', desc: 'Amazon Web Services', icon: <Cloud size={14} /> },
                { id: 'gcp', name: 'GCP / Firebase', desc: 'Google Cloud Engine', icon: <Globe size={14} /> },
                { id: 'azure', name: 'Microsoft Azure', desc: 'Azure Cloud Services', icon: <Cloud size={14} /> },
                { id: 'vercel', name: 'Vercel / Netlify', desc: 'Edge Deployment', icon: <Zap size={14} /> },
                { id: 'github_actions', name: 'GitHub Actions CI/CD', desc: 'Automated Pipelines', icon: <Terminal size={14} /> },
                { id: 'terraform', name: 'Terraform / Ansible', desc: 'Infrastructure as Code', icon: <Blocks size={14} /> }
            ]
        },
        ai: {
            label: 'AI / Machine Learning', icon: <Brain className="text-[#f43f5e]" />,
            options: [
                { id: 'openai', name: 'OpenAI / GPT-4', desc: 'Cloud LLM Integration', icon: <Brain size={14} /> },
                { id: 'claude', name: 'Anthropic Claude', desc: 'Advanced Context LLM', icon: <Brain size={14} /> },
                { id: 'llama', name: 'Llama 3 / Local Models', desc: 'Offline Inference', icon: <Cpu size={14} /> },
                { id: 'huggingface', name: 'HuggingFace Transformers', desc: 'Pre-Trained AI', icon: <Target size={14} /> },
                { id: 'langchain', name: 'LangChain / LlamaIndex', desc: 'AI Orchestration', icon: <Layers size={14} /> },
                { id: 'pinecone', name: 'Pinecone Vector DB', desc: 'RAG Embeddings', icon: <Database size={14} /> },
                { id: 'tensorflow', name: 'TensorFlow / PyTorch', desc: 'Deep Learning Core', icon: <Cpu size={14} /> },
                { id: 'opencv', name: 'OpenCV / YOLO', desc: 'Computer Vision', icon: <Monitor size={14} /> }
            ]
        }
    };

    const visibleCategories = useMemo(() => {
        const categories = Object.keys(stackOptions);
        const isMobileType = type === 'Mobile Interface';
        const isDesktopType = type === 'Desktop UI';
        const isWebType = ['Full Stack App', 'Web Portal', 'SaaS Platform'].includes(type);
        const isAIType = type === 'AI Model';

        return categories.filter(cat => {
            if (cat === 'frontend') return isWebType || isAIType;
            if (cat === 'mobile') return isMobileType;
            if (cat === 'desktop') return isDesktopType;
            return true;
        });
    }, [type]);

    const steps = [
        { id: 1, label: 'Identity', desc: 'User Tier', icon: <Rocket size={18} /> },
        { id: 2, label: 'Subject', desc: 'Field Selection', icon: <Globe size={18} /> },
        { id: 3, label: 'Tech Mesh', desc: 'Stack Config', icon: <Cpu size={18} /> },
        { id: 4, label: 'Vision', desc: 'Project Specs', icon: <PenTool size={18} /> }
    ];

    const handleEngage = async () => {
        setIsGenerating(true);
        setErrorMsg(null);
        const enhancedRequirements = integrations.length > 0
            ? `${requirements}\n\nRequired Integrations: ${integrations.join(', ')}`
            : requirements;
        const autoTitle = requirements.trim()
            ? requirements.trim().split(/\s+/).slice(0, 10).join(' ').toUpperCase() + '...'
            : 'NEW_MISSION';

        // FIX #1: Cleanly pass full named tech stack — selectedTech already stores opt.name
        // No ID → name lookup needed; just pass through directly
        const processedTechStack: Record<string, string> = { ...selectedTech };

        const data = {
            title: projectTitle.trim() || autoTitle, // FIX #3: Custom or Auto Title
            category,
            field,
            type, // Transmitting Type
            technologyStack: processedTechStack, // FIX #1: Full Name Sent
            requirements: enhancedRequirements,
            prototypeMode: prototypeMode
        };
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/collage-project/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            const parsedRes = await res.json();
            setTimeout(() => {
                setIsGenerating(false);
                if (parsedRes.success && parsedRes.project?._id) {
                    navigate(`/projects/live/${parsedRes.project._id}`);
                    if (onComplete) onComplete(parsedRes.prompt || enhancedRequirements, data);
                    onClose();
                } else {
                    setErrorMsg(parsedRes.message || 'Validation error. Please check Tech Stack selection.');
                }
            }, 800);
        } catch (e: any) {
            console.error("Failed to start Master Builder:", e);
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030304] overflow-hidden font-sans text-[#ffffff]">
                {/* 🌌 UNIVERSAL BACKGROUND - 100% PRESERVED */}
                <UniverseBackground intensity={1.5} />
                <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/[0.02] to-transparent pointer-events-none" />

                {/* 📟 STUDIO HUD DECORATIONS */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 mix-blend-screen hidden md:block">
                    <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-[#ffffff]/10" />
                    <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-[#ffffff]/10" />
                    <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-[#ffffff]/10" />
                    <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-[#ffffff]/10" />
                </div>

                {/* 🏗️ MAIN RESPONSIVE CONTAINER */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full h-[100dvh] md:h-[85vh] md:max-h-[850px] md:w-[95vw] md:max-w-[1200px] bg-[#0d0d14]/80 backdrop-blur-3xl md:border md:border-[#ffffff]/10 md:rounded-[2rem] flex flex-col md:flex-row overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)]"
                >
                    {/* 📱 MOBILE HEADER (Hidden on Desktop) */}
                    <header className="md:hidden h-20 border-b border-[#ffffff]/10 px-6 flex items-center justify-between bg-[#030304]/80 backdrop-blur-xl shrink-0 z-50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/30 flex items-center justify-center">
                                <Rocket className="text-[#818cf8]" size={20} />
                            </div>
                            <div>
                                <h1 className="font-[1000] text-lg italic tracking-tight uppercase">ANTIGRAVITY</h1>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#818cf8]">STUDIO V9</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full bg-[#111118] border border-[#ffffff]/10 text-[#ffffff]/40 hover:text-white">
                            <X size={20} />
                        </button>
                    </header>

                    {/* 🏛️ LEFT SIDEBAR (Desktop: 280px width, Mobile: Horizontal scroll) */}
                    <aside className="md:w-[240px] lg:w-[260px] md:h-full border-b md:border-b-0 md:border-r border-[#ffffff]/10 bg-[#111118]/60 flex flex-col shrink-0 z-40 backdrop-blur-xl">
                        <div className="hidden md:block p-4 lg:p-5 border-b border-[#ffffff]/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                    <div className="w-full h-full bg-[#0d0d14] rounded-[11px] flex items-center justify-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[#6366f1]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                        <Rocket className="text-[#ffffff] relative z-10" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-sm lg:text-base font-[1000] italic tracking-tight leading-none uppercase text-[#ffffff]">ANTIGRAVITY</h1>
                                    <p className="text-[7px] lg:text-[8px] font-black uppercase tracking-[0.25em] text-[#818cf8] mt-1 opacity-90">STUDIO V9 BUILDER</p>
                                </div>
                            </div>
                        </div>

                        {/* NAV: Mobile horizontal scroll, Desktop vertical list */}
                        <nav className="flex-1 w-full overflow-x-auto md:overflow-y-auto scrollbar-hide flex md:flex-col md:px-4 md:py-5 p-3 gap-2 md:gap-2.5 items-center md:items-stretch">
                            {steps.map((s) => {
                                const isActive = s.id === step;
                                const isCompleted = s.id < step;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => isCompleted && setStep(s.id)}
                                        className={`shrink-0 flex items-center md:items-start gap-3 p-2.5 md:p-3 rounded-xl transition-all duration-300 relative border ${isActive ? 'bg-[#16161e] border-[#6366f1]/40 shadow-[0_2px_15px_rgba(99,102,241,0.05)]' : 'border-transparent hover:bg-[#16161e]/50 hover:border-[#ffffff]/5'} ${(isCompleted || isActive) ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
                                    >
                                        <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-lg flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white shadow-lg' : isCompleted ? 'bg-[#6366f1]/10 text-[#818cf8]' : 'bg-[#ffffff]/5 text-[#ffffff]/20'}`}>
                                            {isCompleted ? <Check size={16} strokeWidth={3} /> : React.cloneElement(s.icon as React.ReactElement, { size: 14, strokeWidth: 2.5 })}
                                        </div>
                                        <div className="hidden md:block text-left pt-0.5">
                                            <span className={`block text-[11px] font-[900] uppercase tracking-wide ${isActive ? 'text-[#ffffff]' : 'text-[#ffffff]/60'}`}>{s.label}</span>
                                            <span className="block text-[8px] font-semibold text-[#ffffff]/30 mt-0.5 tracking-wider">{s.desc}</span>
                                        </div>
                                        {/* Mobile Label only for active */}
                                        {isActive && (
                                            <div className="md:hidden text-left pr-2">
                                                <span className="block text-[10px] font-[900] uppercase tracking-wide text-[#ffffff]">{s.label}</span>
                                                <span className="block text-[8px] font-semibold text-[#818cf8] tracking-wider">{s.desc}</span>
                                            </div>
                                        )}
                                        {isActive && <div className="hidden md:block absolute -left-px top-1/2 -translate-y-1/2 w-[3px] h-1/2 bg-[#6366f1] rounded-r shadow-[0_0_8px_#6366f1]" />}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="hidden md:flex p-4 border-t border-[#ffffff]/5 bg-[#030304]/40 flex-col items-center gap-3">
                            <div className="w-full flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-[#ffffff]/30 px-1">
                                <span className="flex items-center gap-1.5"><Activity size={10} className="text-[#10b981]" /> SYS_LIVE</span>
                                <span>v9.1.0</span>
                            </div>
                        </div>
                    </aside>

                    {/* 💻 MAIN ACTION CENTER (RIGHT) */}
                    <main className="flex-1 h-full min-h-0 flex flex-col z-30 relative bg-[#030304]/40">
                        {/* DESKTOP HEADER */}
                        <header className="hidden md:flex h-16 shrink-0 border-b border-[#ffffff]/5 items-center justify-between px-8 bg-[#0d0d14]/40 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/20 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]" />
                                    <span className="text-[9px] font-bold text-[#10b981] uppercase tracking-[0.2em]">CONNECTION SECURE</span>
                                </div>
                                <div className="text-[9px] font-mono font-bold text-[#ffffff]/20 uppercase tracking-widest">SESSION_091A_X</div>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#16161e] border border-[#ffffff]/5 flex items-center justify-center text-[#ffffff]/40 hover:text-white hover:bg-[#ffffff]/10 hover:border-[#ffffff]/20 transition-all">
                                <X size={14} />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto scrollbar-hide relative w-full h-full">
                            <div className="max-w-4xl mx-auto px-5 py-5 md:px-8 md:py-8 w-full h-full">
                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div key="s1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} className="space-y-5 md:space-y-6 flex flex-col h-full">
                                            <div>
                                                <h2 className="text-xl md:text-2xl lg:text-2xl font-[1000] italic uppercase tracking-tighter text-[#ffffff] leading-none mb-2">IDENTITY_PROTOCOL</h2>
                                                <p className="text-[9px] md:text-[10px] font-semibold text-[#ffffff]/40 uppercase tracking-[0.2em]">Select execution tier scale.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 flex-1 content-start">
                                                {[
                                                    { id: 'STUDENT_8_12', name: 'JUNIOR CORE', desc: '8-12 Grade baseline.', icon: <BookOpen size={20} /> },
                                                    { id: 'GRADUATION', name: 'BACHELOR PRO', desc: 'BTech/BCA level.', icon: <GraduationCap size={20} /> },
                                                    { id: 'POST_GRAD_PHD', name: 'EXEC MASTER', desc: 'MCA/PhD research.', icon: <Microscope size={20} /> },
                                                    { id: 'BUSINESS_FREELANCE', name: 'IND TRIAL SAAS', desc: 'Production SaaS.', icon: <Briefcase size={20} /> }
                                                ].map(cat => {
                                                    const isSelected = category === cat.id;
                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => { setCategory(cat.id as any); setStep(2); }}
                                                            className={`group relative p-4 md:p-5 backdrop-blur-sm border rounded-xl text-left transition-all duration-300 md:min-h-[160px] flex flex-row md:flex-col justify-between items-center md:items-start
                                                            ${isSelected ? 'border-[#6366f1] bg-[#6366f1]/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'border-[#ffffff]/10 bg-[#16161e]/80 hover:border-[#6366f1]/50 hover:bg-[#16161e]'}`}
                                                        >
                                                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 scale-125 transition-all duration-700 text-[#6366f1] hidden md:block">{cat.icon}</div>
                                                            <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl border flex items-center justify-center md:mb-4 transition-all duration-300 shadow-[inset_0_2px_10px_rgba(255,255,255,0.02)]
                                                            ${isSelected ? 'bg-[#6366f1] border-[#818cf8] text-white' : 'bg-[#030304] border-[#ffffff]/10 text-[#ffffff]/50 group-hover:border-[#6366f1]/60 group-hover:bg-[#6366f1]/20 group-hover:text-[#ffffff]'}`}>
                                                                {React.cloneElement(cat.icon as React.ReactElement, { size: 20, strokeWidth: 2 })}
                                                            </div>
                                                            <div className="flex-1 ml-4 md:ml-0 flex flex-col justify-center">
                                                                <h4 className="text-sm lg:text-md font-[1000] uppercase italic text-[#ffffff] mb-1 tracking-tight group-hover:text-white transition-all">{cat.name}</h4>
                                                                <p className="text-[8px] md:text-[9px] text-[#ffffff]/50 font-bold uppercase tracking-[0.1em]">{cat.desc}</p>
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5 md:space-y-6 flex flex-col h-full">
                                            <div>
                                                <h2 className="text-xl md:text-2xl lg:text-2xl font-[1000] italic uppercase tracking-tighter text-[#ffffff] leading-none mb-2">SUBJECT_DOMAIN</h2>
                                                <p className="text-[9px] md:text-[10px] font-semibold text-[#ffffff]/40 uppercase tracking-[0.2em]">Define operational target sector.</p>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 flex-1 content-start">
                                                <div className="space-y-2">
                                                    <label className="text-[8px] md:text-[9px] font-black text-[#ffffff]/40 uppercase tracking-[0.2em] ml-1">MISSION_FIELD_TARGET</label>
                                                    <div className="relative group">
                                                        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#6366f1]/50 to-[#a855f7]/50 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                                                        <input
                                                            type="text"
                                                            value={field}
                                                            onChange={e => { setField(e.target.value); setShowSuggestions(true); }}
                                                            onFocus={() => setShowSuggestions(true)}
                                                            placeholder="e.g. BTech Computer Science"
                                                            className="relative w-full h-10 md:h-12 bg-[#0d0d14] border border-[#ffffff]/20 px-4 md:px-5 rounded-xl text-xs md:text-sm text-[#ffffff] outline-none focus:border-[#6366f1] focus:bg-[#111118] transition-all font-[900] placeholder:text-[#ffffff]/20 font-sans shadow-inner"
                                                        />
                                                        <AnimatePresence>
                                                            {filteredDegrees.length > 0 && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                                                    className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#16161e] border border-[#ffffff]/10 rounded-xl shadow-2xl overflow-hidden py-1.5"
                                                                >
                                                                    {filteredDegrees.map((degree, idx) => (
                                                                        <button
                                                                            key={idx}
                                                                            onClick={() => { setField(degree); setShowSuggestions(false); }}
                                                                            className="w-full text-left px-4 py-2 hover:bg-[#6366f1]/10 hover:text-[#818cf8] text-[#ffffff]/60 font-bold text-[9px] md:text-[10px] transition-all flex items-center justify-between"
                                                                        >
                                                                            {degree}
                                                                        </button>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[8px] md:text-[9px] font-black text-[#ffffff]/40 uppercase tracking-[0.2em] ml-1">CONSTRUCTION_SPEC</label>
                                                    <div className="grid grid-cols-2 gap-2.5">
                                                        {['Full Stack App', 'Mobile Interface', 'Web Portal', 'Desktop UI', 'AI Model', 'SaaS Platform'].map(t => (
                                                            <button
                                                                key={t}
                                                                onClick={() => setType(t)}
                                                                className={`h-10 md:h-10 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-wider transition-all border ${type === t ? 'bg-[#6366f1] border-[#818cf8] text-white shadow-md' : 'bg-[#16161e] text-[#ffffff]/40 border-[#ffffff]/10 hover:border-[#ffffff]/30 hover:bg-[#16161e]/80'}`}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-4 mt-auto sticky bottom-0 bg-transparent md:bg-[#030304]/40 backdrop-blur-md pb-3 md:pb-0">
                                                <button onClick={() => setStep(1)} className="text-[8px] md:text-[9px] font-black text-[#ffffff]/40 uppercase tracking-widest hover:text-white transition-all py-2">← BACK</button>
                                                <Button onClick={() => setStep(3)} disabled={!field} className="h-8 md:h-10 px-5 md:px-6 rounded-full bg-[#ffffff] text-[#030304] font-[1000] uppercase tracking-widest text-[8px] md:text-[9px] hover:bg-[#6366f1] hover:text-[#ffffff] transition-all shadow-lg">CONTINUE →</Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5 md:space-y-6 flex flex-col h-full">
                                            <div>
                                                <h2 className="text-xl md:text-2xl lg:text-2xl font-[1000] italic uppercase tracking-tighter text-[#ffffff] leading-none mb-2">TECH_MESH_CORE</h2>
                                                <p className="text-[9px] md:text-[10px] font-semibold text-[#ffffff]/40 uppercase tracking-[0.2em]">Select framework matrices.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 flex-1 content-start overflow-y-auto pb-16 scrollbar-hide">
                                                {visibleCategories.map((layer) => {
                                                    const data = stackOptions[layer as keyof typeof stackOptions];
                                                    return (
                                                        <div key={layer} className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 bg-[#16161e] rounded-[5px] flex items-center justify-center border border-[#ffffff]/10 shrink-0">
                                                                    {React.cloneElement(data.icon as React.ReactElement, { size: 12 })}
                                                                </div>
                                                                <h4 className="text-[9px] font-[900] uppercase tracking-wider text-[#ffffff]/60">{data.label}</h4>
                                                                <div className="h-px w-full bg-[#ffffff]/5" />
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-1.5">
                                                                {data.options.map(opt => {
                                                                    const isSelected = selectedTech[layer] === opt.name;
                                                                    return (
                                                                        <button
                                                                            key={opt.id}
                                                                            onClick={() => setSelectedTech(prev => {
                                                                                const next = { ...prev };
                                                                                if (next[layer] === opt.name) delete next[layer];
                                                                                else next[layer] = opt.name;
                                                                                return next;
                                                                            })}
                                                                            className={`h-10 px-2.5 rounded-lg border transition-all duration-300 text-left flex items-center gap-2.5 relative group ${isSelected ? 'bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/10 border-[#6366f1]/50 text-[#ffffff] shadow-[0_2px_10px_rgba(99,102,241,0.1)]' : 'bg-[#0d0d14] border-[#ffffff]/10 text-[#ffffff]/40 hover:border-[#ffffff]/30 hover:bg-[#16161e]'}`}
                                                                        >
                                                                            <div className={`p-1 rounded-md shrink-0 transition-colors ${isSelected ? 'text-[#818cf8] bg-[#6366f1]/20' : 'text-[#ffffff]/30 bg-[#ffffff]/5 group-hover:text-[#ffffff]/80'}`}>
                                                                                {React.cloneElement(opt.icon as React.ReactElement, { size: 10 })}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className={`text-[9px] md:text-[10px] font-[900] tracking-wide truncate ${isSelected ? 'text-[#ffffff]' : 'text-[#ffffff]/70'}`}>{opt.name}</p>
                                                                                <p className="text-[7px] md:text-[8px] font-semibold truncate text-[#ffffff]/30">{opt.desc}</p>
                                                                            </div>
                                                                            {isSelected && <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#6366f1] rounded-r-lg" />}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex justify-between items-center pt-4 mt-auto sticky bottom-0 bg-[#030304]/80 md:bg-[#030304]/40 backdrop-blur-xl border-t border-[#ffffff]/10 pb-3 md:pb-0 z-10 px-3 md:px-0">
                                                <button onClick={() => setStep(2)} className="text-[8px] md:text-[9px] font-black text-[#ffffff]/40 uppercase tracking-widest hover:text-white transition-all py-2">← BACK</button>
                                                <Button onClick={() => setStep(4)} className="h-8 md:h-10 px-5 md:px-6 rounded-full bg-[#ffffff] text-[#030304] font-[1000] uppercase tracking-widest text-[8px] md:text-[9px] hover:bg-[#6366f1] hover:text-[#ffffff] transition-all shadow-lg">FINALIZE →</Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 4 && (
                                        <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-5 md:space-y-6 flex flex-col h-full">
                                            <div>
                                                <h2 className="text-xl md:text-2xl lg:text-2xl font-[1000] italic uppercase tracking-tighter text-[#ffffff] leading-none mb-2">MISSION_SPEC</h2>
                                                <p className="text-[9px] md:text-[10px] font-semibold text-[#ffffff]/40 uppercase tracking-[0.2em]">Final architectural manifest.</p>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 flex-1 content-start">
                                                <div className="space-y-3 flex flex-col h-full min-h-[220px] lg:min-h-0">

                                                    {/* INTEGRATIONS SELECTOR */}
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <div className="flex-1">
                                                            <p className="text-[9px] font-black text-[#ffffff]/40 uppercase tracking-[0.2em] flex items-center gap-1.5 ml-1 mb-1.5">
                                                                <Globe size={12} className="text-[#a855f7]" /> EXTERNAL_INTEGRATIONS
                                                            </p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {['Stripe', 'PayPal', 'Razorpay', 'JWT', 'OAuth', 'Firebase', 'AWS S3', 'Twilio', 'Mail'].map(integ => {
                                                                    const isSelected = integrations.includes(integ);
                                                                    return (
                                                                        <button
                                                                            key={integ}
                                                                            onClick={() => setIntegrations(prev => isSelected ? prev.filter(i => i !== integ) : [...prev, integ])}
                                                                            className={`px-2 py-1 rounded-md text-[8px] font-[900] uppercase tracking-wider transition-all border shadow-sm ${isSelected ? 'bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 border-[#818cf8]/50 text-[#ffffff]' : 'bg-[#16161e] text-[#ffffff]/40 border-[#ffffff]/10 hover:border-[#ffffff]/30 hover:bg-[#ffffff]/5'}`}
                                                                        >
                                                                            {integ}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>

                                                        <div className="w-full md:w-[200px]">
                                                            <p className="text-[9px] font-black text-[#ffffff]/40 uppercase tracking-[0.2em] flex items-center gap-1.5 ml-1 mb-1.5">
                                                                <Shield size={12} className="text-[#10b981]" /> BUILD_STRATEGY
                                                            </p>
                                                            <button 
                                                                onClick={() => setPrototypeMode(!prototypeMode)}
                                                                className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all ${prototypeMode ? 'bg-[#10b981]/10 border-[#10b981]/40' : 'bg-[#16161e] border-white/10'}`}
                                                            >
                                                                <div className="text-left">
                                                                    <p className={`text-[9px] font-black uppercase ${prototypeMode ? 'text-[#10b981]' : 'text-white'}`}>Prototype Mode</p>
                                                                    <p className="text-[7px] text-white/30 font-bold uppercase">Commented Backend</p>
                                                                </div>
                                                                <div className={`w-8 h-4 rounded-full relative transition-colors ${prototypeMode ? 'bg-[#10b981]' : 'bg-white/10'}`}>
                                                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${prototypeMode ? 'right-0.5' : 'left-0.5'}`} />
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5 flex-1 flex flex-col">
                                                        <div className="flex justify-between items-end mb-2">
                                                            <p className="text-[9px] font-black text-[#ffffff]/40 uppercase tracking-[0.2em] flex items-center gap-1.5 ml-1">
                                                                <Brain size={12} className="text-[#6366f1]" /> DEEP_OBJECTIVE_STREAM
                                                            </p>
                                                        </div>
                                                        <input 
                                                            type="text"
                                                            value={projectTitle}
                                                            onChange={(e) => setProjectTitle(e.target.value)}
                                                            placeholder="Project Name / Title..."
                                                            maxLength={70}
                                                            className="w-full h-10 bg-[#0d0d14] border border-[#ffffff]/20 px-3 rounded-xl text-[10px] md:text-[11px] flex-shrink-0 font-bold text-[#ffffff] uppercase tracking-wider outline-none focus:border-[#a855f7] focus:bg-[#111118] transition-all placeholder:text-[#ffffff]/20 mb-2"
                                                        />
                                                        <div className="relative group flex-1 flex flex-col min-h-[150px]">
                                                            {!isDiscoveryMode ? (
                                                                <div className="flex flex-col flex-1 justify-center items-center h-full bg-[#16161e] border border-[#ffffff]/10 rounded-xl p-4">
                                                                    <Brain size={24} className="text-[#818cf8] mb-2 opacity-50" />
                                                                    <p className="text-[#ffffff]/40 text-[10px] font-medium text-center mb-4 max-w-[80%]">Enter the title above and click Start R&D. The AI Architect will autonomously brainstorm and map all project requirements.</p>
                                                                    <Button 
                                                                        onClick={startAutoRnD}
                                                                        disabled={!projectTitle.trim()}
                                                                        className="h-10 px-6 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] flex items-center gap-2 hover:opacity-90 transition-all font-black text-[10px] tracking-widest"
                                                                    >
                                                                        <Rocket size={14} /> START AI R&D
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex-1 flex flex-col bg-[#0d0d14] border border-[#6366f1]/50 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                                                    <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                                                                        {chatHistory.map((m, i) => (
                                                                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                                                <div className={`max-w-[85%] p-3 rounded-xl text-[11px] font-medium leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-[#6366f1] text-white rounded-br-none' : 'bg-[#16161e] border border-[#ffffff]/10 text-[#ffffff]/90 rounded-bl-none shadow-[0_4px_15px_rgba(0,0,0,0.3)]'} ${m.text?.includes('Apka pura R&D and memory') ? 'bg-[#10b981]/20 border border-[#10b981]/50 text-[#10b981]' : ''}`}>
                                                                                    {m.text || "⚠️ Invalid System Feedback..."}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {isChatLoading && (
                                                                            <div className="flex justify-start">
                                                                                <div className="bg-[#16161e] border border-[#ffffff]/10 text-[#ffffff]/40 p-2 rounded-xl rounded-bl-none text-[10px]">
                                                                                    <Loader2 size={12} className="animate-spin inline mr-1" /> Thinking...
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {(!isDiscoveryComplete && chatHistory.length > 2) && (
                                                                        <div className="px-2 pb-1">
                                                                            <Button onClick={() => handleDiscoverySubmit(undefined, "SYSTEM OVERRIDE: User explicitly clicked FINALIZE. STOP asking questions and output STRICT JSON describing the final parsed requirements NOW based on our discussion.", true)} className="w-full h-8 text-[9px] font-bold bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/30">FINALIZE R&D ✅</Button>
                                                                        </div>
                                                                    )}
                                                                    <form onSubmit={handleDiscoverySubmit} className="border-t border-[#ffffff]/10 flex focus-within:border-[#6366f1] transition-colors p-1">
                                                                        <input 
                                                                            type="text" 
                                                                            value={chatMsg} 
                                                                            onChange={e => setChatMsg(e.target.value)} 
                                                                            disabled={isDiscoveryComplete || isChatLoading}
                                                                            placeholder={isDiscoveryComplete ? "R&D Initialized." : "Type extra details if needed..."} 
                                                                            className="flex-1 bg-transparent px-3 py-2 text-[10px] md:text-[11px] text-white outline-none placeholder:text-[#ffffff]/30 disabled:opacity-50"
                                                                        />
                                                                        <button type="submit" disabled={!chatMsg.trim() || isChatLoading || isDiscoveryComplete} className="px-3 text-[#6366f1] hover:text-[#818cf8] disabled:opacity-50">
                                                                            <svg className="w-4 h-4 transform rotate-90" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                                                                        </button>
                                                                    </form>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-[#16161e] border border-[#ffffff]/10 p-5 rounded-xl shadow-2xl relative overflow-hidden flex flex-col">
                                                    <div className="absolute -top-6 -right-6 p-6 opacity-[0.02] rotate-12 pointer-events-none"><Blocks size={120} /></div>

                                                    <h5 className="text-[9px] font-black text-[#818cf8] uppercase tracking-[0.3em] mb-4 flex items-center gap-1.5">
                                                        <Cpu size={12} /> SYNTHESIS_MANIFEST
                                                    </h5>

                                                    <div className="grid gap-y-2 mb-5">
                                                        {Object.entries(selectedTech).map(([key, val]) => (
                                                            <div key={key} className="flex items-center justify-between border-b border-[#ffffff]/5 pb-1.5">
                                                                <p className="text-[8px] font-bold text-[#ffffff]/30 uppercase tracking-widest">{key}</p>
                                                                <p className="text-[9px] font-[900] text-[#ffffff] uppercase text-right pl-3 truncate">{val}</p>
                                                            </div>
                                                        ))}
                                                        {Object.keys(selectedTech).length === 0 && (
                                                            <div className="py-4 text-center text-[#ffffff]/20 text-[8px] font-bold uppercase tracking-wider">No stack selected</div>
                                                        )}
                                                    </div>

                                                    <div className="mt-auto relative z-10 flex flex-col gap-2">
                                                        <Button
                                                            onClick={handleEngage}
                                                            disabled={!requirements || isGenerating}
                                                            className="w-full h-10 md:h-12 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:opacity-90 text-white font-[1000] uppercase tracking-[0.2em] text-[10px] shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2 overflow-hidden relative"
                                                        >
                                                            {isGenerating ? (
                                                                <><Loader2 size={14} className="animate-spin" /> ENGAGING...</>
                                                            ) : (
                                                                <>
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:animate-[shimmer_1.5s_infinite]" />
                                                                    <Rocket size={12} className="translate-y-[-1px]" />
                                                                    BUILD_MISSION
                                                                </>
                                                            )}
                                                        </Button>
                                                        {errorMsg && (
                                                            <div className="w-full text-center bg-[#f43f5e]/10 border border-[#f43f5e]/30 rounded-xl py-2 px-3 mt-1 shadow-lg shadow-[#f43f5e]/10">
                                                                <p className="text-[#f43f5e] text-[9px] font-black uppercase tracking-widest">{errorMsg}</p>
                                                            </div>
                                                        )}
                                                        <button onClick={() => setStep(3)} className="text-[8px] font-black text-[#ffffff]/40 uppercase tracking-widest hover:text-white transition-all py-1.5 text-center w-full mt-1">← ADJUST MESH</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </main>
                </motion.div>

                {/* 🚀 BRANDED NEURAL SYNTHESIS OVERLAY */}
                <AnimatePresence>
                    {isGenerating && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                            className="fixed inset-0 z-[99999] bg-[#030304]/90 backdrop-blur-3xl flex flex-col items-center justify-center text-center font-sans"
                        >
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-[400px] h-[400px] bg-[#6366f1]/15 rounded-full blur-[100px] animate-pulse" />
                            </div>

                            <div className="relative mb-12">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute -inset-6 border-2 border-dashed border-[#6366f1]/30 rounded-full" />
                                <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -inset-12 border border-[#ffffff]/10 rounded-full" />
                                <div className="relative w-24 h-24 rounded-2xl bg-[#0d0d14] border-2 border-[#6366f1]/60 flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.4)]">
                                    <Rocket size={40} className="text-[#ffffff] -rotate-12" />
                                </div>
                            </div>

                            <div className="mb-8 z-10">
                                <h1 className="text-3xl md:text-4xl font-[1000] italic uppercase tracking-tighter leading-none text-[#ffffff] mb-2">SYNTHESIZING</h1>
                                <p className="text-[9px] font-black uppercase tracking-[0.8em] text-[#818cf8] animate-pulse ml-3">PRIME_V9_COLOSSUS</p>
                            </div>

                            <div className="flex gap-2 h-1 z-10">
                                {[0, 1, 2, 3, 4, 5].map(i => (
                                    <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2], scaleY: [1, 2, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15, ease: "easeInOut" }} className="w-1.5 rounded-full bg-[#6366f1]" />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >
        </AnimatePresence >
    );
};

export default CollageProjectModal;
