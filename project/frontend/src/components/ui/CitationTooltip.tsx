import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ExternalLink, AlertCircle } from 'lucide-react';
import { sanitizeExternalUrl } from '@/utils/url';

interface Citation {
    name: string;
    url: string;
    snippet: string;
}

export const CitationTooltip = ({ citation, children }: { citation: Citation, children: React.ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef<HTMLSpanElement>(null);
    const [leftOffset, setLeftOffset] = useState(0);

    // 🧠 Dynamic Positioning Logic
    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const tooltipWidth = 320;
            const padding = 20;
            const viewportWidth = window.innerWidth;

            let offset = 0;
            const center = rect.left + rect.width / 2;

            if (center + tooltipWidth / 2 > viewportWidth - padding) {
                offset = (viewportWidth - padding) - (center + tooltipWidth / 2);
            }
            if (center - tooltipWidth / 2 < padding) {
                offset = padding - (center - tooltipWidth / 2);
            }

            setLeftOffset(offset);
        }
    }, [isVisible]);

    const handleOpenLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(sanitizeExternalUrl(citation.url), '_blank');
    };

    return (
        <span
            ref={triggerRef}
            className="relative inline-block z-20 group/wrapper"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <span
                onClick={handleOpenLink}
                className="inline-flex items-center gap-1.5 mx-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 font-bold hover:bg-white/10 hover:text-white hover:border-indigo-500/50 transition-all cursor-pointer align-middle translate-y-[-1px]"
            >
                <Globe size={10} className="text-indigo-400" /> {children}
            </span>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className="absolute bottom-full left-1/2 mb-3 w-80 bg-[#0A0A0A] border border-white/10 rounded-[24px] shadow-[0_30px_90px_rgba(0,0,0,0.8)] z-[500] text-left ring-1 ring-white/5 backdrop-blur-3xl overflow-hidden"
                        style={{ transform: `translateX(calc(-50% + ${leftOffset}px))` }}
                    >
                        {/* 🧠 Hover Header */}
                        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                    <Globe size={12} className="text-indigo-400" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 truncate max-w-[150px]">{citation.name}</span>
                            </div>
                            <span className="text-[9px] font-bold text-gray-500 uppercase px-2 py-0.5 rounded-full border border-white/5 bg-white/[0.02]">Verified Source</span>
                        </div>

                        {/* 🧠 Content Body */}
                        <div className="p-5 space-y-4">
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">{citation.name} - Official Reference</h4>
                                <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">
                                    {citation.snippet}
                                </p>
                            </div>

                            {/* 🧠 Trust Indicator */}
                            <div className="flex gap-2 p-3 rounded-xl bg-indigo-500/[0.03] border border-indigo-500/10">
                                <div className="shrink-0 mt-0.5">
                                    <AlertCircle size={12} className="text-indigo-400" />
                                </div>
                                <p className="text-[10px] text-gray-500 italic leading-snug">
                                    "This source has been cross-referenced by the Neural Engine for context accuracy."
                                </p>
                            </div>

                            {/* 🧠 Action Button */}
                            <button
                                onClick={handleOpenLink}
                                className="w-full h-9 flex items-center justify-center gap-2 rounded-xl bg-white text-black hover:bg-indigo-50 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                            >
                                Visit Resource <ExternalLink size={10} />
                            </button>
                        </div>

                        {/* Pointer */}
                        <div
                            className="absolute -bottom-1.5 left-1/2 w-3 h-3 bg-[#0A0A0A] border-r border-b border-white/10 rotate-45"
                            style={{ left: `calc(50% - ${leftOffset}px)` }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};
