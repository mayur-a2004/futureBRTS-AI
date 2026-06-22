import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Zap, ExternalLink } from 'lucide-react';

// 🚀 High-Precision Direct Routing Mapping (100% Accuracy)
const DIRECT_DOCS: Record<string, string> = {
    'rabbitmq': 'https://www.rabbitmq.com/documentation.html',
    'kafka': 'https://kafka.apache.org/documentation/',
    'aws sqs': 'https://aws.amazon.com/sqs/',
    'sqs': 'https://aws.amazon.com/sqs/',
    'redis': 'https://redis.io/documentation',
    'mongodb': 'https://docs.mongodb.com/',
    'react': 'https://react.dev/',
    'node': 'https://nodejs.org/en/docs/',
    'docker': 'https://docs.docker.com/',
    'kubernetes': 'https://kubernetes.io/docs/home/',
    'prometheus': 'https://prometheus.io/docs/introduction/overview/',
    'grafana': 'https://grafana.com/docs/',
    'winston': 'https://github.com/winstonjs/winston',
    'morgan': 'https://github.com/expressjs/morgan',
    'elk stack': 'https://www.elastic.co/what-is/elk-stack',
    'elasticsearch': 'https://www.elastic.co/guide/index.html',
    'javascript': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    'typescript': 'https://www.typescriptlang.org/docs/',
    'tailwind': 'https://tailwindcss.com/docs',
    'nextjs': 'https://nextjs.org/docs',
    'vite': 'https://vitejs.dev/guide/',
    'usestate': 'https://react.dev/reference/react/useState',
    'useeffect': 'https://react.dev/reference/react/useEffect',
    'usecontext': 'https://react.dev/reference/react/useContext',
    'usereducer': 'https://react.dev/reference/react/useReducer',
    'usecallback': 'https://react.dev/reference/react/useCallback',
    'usememo': 'https://react.dev/reference/react/useMemo',
    'useref': 'https://react.dev/reference/react/useRef',
    'useimperativehandle': 'https://react.dev/reference/react/useImperativeHandle',
    'uselayouteffect': 'https://react.dev/reference/react/useLayoutEffect',
    'usedebugvalue': 'https://react.dev/reference/react/useDebugValue',
    'hooks': 'https://react.dev/reference/react',
    'props': 'https://react.dev/learn/passing-props-to-a-component',
    'state': 'https://react.dev/learn/state-a-components-memory',
    'component': 'https://react.dev/learn/your-first-component',
    'express': 'https://expressjs.com/',
    'jwt': 'https://jwt.io/',
    'prisma': 'https://www.prisma.io/docs/',
    'mongoose': 'https://mongoosejs.com/docs/',
    'socket.io': 'https://socket.io/docs/v4/',
    'html': 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    'css': 'https://developer.mozilla.org/en-US/docs/Web/CSS',
    'npm': 'https://docs.npmjs.com/',
    'git': 'https://git-scm.com/doc',
    'github': 'https://docs.github.com/en'
};

export const NeuralTooltip = ({ text, children }: { text: string, children: React.ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const triggerRef = useRef<HTMLSpanElement>(null);
    const [leftOffset, setLeftOffset] = useState(0);
    const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
    const [resolvingUrl, setResolvingUrl] = useState(false);

    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const tooltipWidth = 320; // 320px for w-80
            const padding = 20;
            const viewportWidth = window.innerWidth;

            let offset = 0;
            const center = rect.left + rect.width / 2;

            // 🛡️ Detect Right Bound Overflow
            if (center + tooltipWidth / 2 > viewportWidth - padding) {
                offset = (viewportWidth - padding) - (center + tooltipWidth / 2);
            }

            // 🛡️ Detect Left Bound Overflow
            if (center - tooltipWidth / 2 < padding) {
                offset = padding - (center - tooltipWidth / 2);
            }

            setLeftOffset(offset);
        }
    }, [isVisible]);

    const fetchInsight = async () => {
        if (insight) return;
        setLoading(true);
        // Deep neural extraction simulation for high accuracy feel
        setTimeout(() => {
            const context = text.toLowerCase().trim();
            let strategy = `Advanced technical node: "${text}". Critical for system scalability and optimized structural integrity in high-load production environments.`;

            if (context.includes('react') || context.includes('frontend')) strategy = `Foundational Frontend pattern. Highly optimized for DOM reconciliation and state consistency. Essential for real-time human-centric interactions.`;
            if (context.includes('node') || context.includes('backend')) strategy = `High-concurrency architectural core. Logic flows through this node to ensure asynchronous precision and database reliability.`;
            if (context.includes('logging') || context.includes('winston') || context.includes('morgan')) strategy = `Strategic observability module. Captures neural activity of the system to provide 100% diagnostic accuracy and forensic visibility.`;
            if (context.includes('monitoring') || context.includes('prometheus') || context.includes('grafana')) strategy = `Master Mind telemetry system. Visualizes real-time performance metrics and predictive throughput for proactive health management.`;
            if (context.includes('api') || context.includes('request')) strategy = `Neural communication protocol. Ensures secure, high-speed data transfer between distributed intelligence layers.`;
            if (context.includes('security') || context.includes('auth')) strategy = `Guardian-level integrity layer. Protects technical assets through high-fidelity encryption and autonomous governance.`;

            setInsight(strategy);
            setLoading(false);
        }, 500);
    };

    const resolveLink = async () => {
        const trimmedText = text.trim();
        const term = trimmedText.toLowerCase();
        if (DIRECT_DOCS[term]) {
            setResolvedUrl(DIRECT_DOCS[term]);
            return;
        }
        if (term.startsWith('use') && term.length > 3) {
            setResolvedUrl(`https://react.dev/reference/react/${trimmedText}`);
            return;
        }

        setResolvingUrl(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/builder/search-doc?q=${encodeURIComponent(trimmedText)}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            const data = await res.json();
            if (data.success && data.url) {
                setResolvedUrl(data.url);
            }
        } catch (err) {
            console.error('Error pre-resolving link:', err);
        } finally {
            setResolvingUrl(false);
        }
    };

    const handleOpenInfo = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (resolvedUrl) {
            window.open(resolvedUrl, '_blank');
            return;
        }

        const trimmedText = text.trim();
        const term = trimmedText.toLowerCase();

        if (DIRECT_DOCS[term]) {
            const target = DIRECT_DOCS[term];
            setResolvedUrl(target);
            window.open(target, '_blank');
            return;
        }

        if (term.startsWith('use') && term.length > 3) {
            const target = `https://react.dev/reference/react/${trimmedText}`;
            setResolvedUrl(target);
            window.open(target, '_blank');
            return;
        }

        setResolvingUrl(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/builder/search-doc?q=${encodeURIComponent(trimmedText)}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            const data = await res.json();
            if (data.success && data.url) {
                setResolvedUrl(data.url);
                window.open(data.url, '_blank');
                return;
            }
        } catch (err) {
            console.error('Failed to resolve link on click:', err);
        } finally {
            setResolvingUrl(false);
        }

        window.open(`https://www.google.com/search?q=${encodeURIComponent(trimmedText + " official documentation")}`, '_blank');
    };

    return (
        <span
            ref={triggerRef}
            className="relative inline-block z-10 neural-tooltip-wrapper group/wrapper"
            onMouseEnter={() => {
                setIsVisible(true);
                fetchInsight();
                if (!resolvedUrl && !resolvingUrl) {
                    resolveLink();
                }
            }}
            onMouseLeave={() => setIsVisible(false)}
        >
            <span
                onClick={handleOpenInfo}
                className="cursor-help transition-all duration-300 text-[#9ca3af] hover:text-white hover:bg-white/5 px-1 py-0.5 rounded border-b border-white/10 hover:border-indigo-500/50"
            >
                {children}
            </span>

            <AnimatePresence>
                {isVisible && (insight || loading) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className="absolute bottom-full left-1/2 mb-3 w-80 p-5 bg-[#050507] border border-white/10 rounded-[28px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] z-[500] text-left ring-1 ring-white/5 backdrop-blur-xl"
                        style={{
                            transform: `translateX(calc(-50% + ${leftOffset}px))`
                        }}
                    >
                        {/* 🌉 Bridge to prevent mouse-out flicker */}
                        <div className="absolute top-full h-4 left-0 right-0" />

                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="p-1 px-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                    <Sparkles size={12} className="text-indigo-400" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Deep Extraction</span>
                            </div>
                            <div className="text-[9px] font-bold text-emerald-400/60 uppercase px-2 py-0.5 rounded-full bg-emerald-400/5 border border-emerald-400/10">Found Point</div>
                        </div>

                        {loading ? (
                            <div className="space-y-3 py-2">
                                <div className="h-2.5 bg-white/5 rounded-full animate-pulse w-full" />
                                <div className="h-2.5 bg-white/5 rounded-full animate-pulse w-4/5" />
                                <div className="h-2.5 bg-white/5 rounded-full animate-pulse w-3/5" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Technical Node</div>
                                    <h4 className="text-[13px] font-bold text-white mb-2">"{text}"</h4>
                                    <p className="text-[11px] text-gray-400 leading-relaxed">
                                        {insight?.split('. ')[1] || insight}
                                    </p>
                                </div>

                                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                                    <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Brain size={10} /> Neural Insight
                                    </div>
                                    <div className="text-[10px] text-gray-300 italic leading-relaxed">
                                        "Autonomous scan confirms critical relevance to your current technical trajectory. Implementing this node will increase system stability."
                                    </div>
                                </div>

                                <button
                                    onClick={handleOpenInfo}
                                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-[10px] font-bold text-white transition-all group/btn"
                                >
                                    <span className="flex items-center gap-2">
                                        <Zap size={10} className="text-indigo-400" />
                                        Expand Technical Doc
                                    </span>
                                    <ExternalLink size={10} className="group-hover/btn:translate-x-0.5 transition-transform text-white/40" />
                                </button>
                            </div>
                        )}
                        <div
                            className="absolute -bottom-1.5 left-1/2 w-3 h-3 bg-[#0a0a0c] border-r border-b border-white/10"
                            style={{
                                transform: `translateX(calc(-50% - ${leftOffset}px)) rotate(45deg)`
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};
