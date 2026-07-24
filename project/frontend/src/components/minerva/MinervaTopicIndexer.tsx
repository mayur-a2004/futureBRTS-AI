import React, { useState } from 'react';
import { ChevronRight, ChevronDown, CheckCircle2, Lock, Flame, BookOpen } from 'lucide-react';

export interface TopicIndexNode {
    id: string;
    indexCode: string;
    title: string;
    chapterTitle?: string;
    unitTitle?: string;
    status: 'DONE' | 'IN_PROGRESS' | 'LOCKED';
    weightageMarks?: number;
    isBoardHighPriority?: boolean;
    lastScore?: number;
}

interface MinervaTopicIndexerProps {
    unitTitle?: string;
    chapterTitle?: string;
    nodes: TopicIndexNode[];
    activeNodeId?: string;
    onSelectNode: (nodeId: string) => void;
    isCollapsedDefault?: boolean;
}

export const MinervaTopicIndexer: React.FC<MinervaTopicIndexerProps> = ({
    unitTitle = 'UNIT 1: SCIENCE & MATHEMATICAL BLUEPRINT',
    chapterTitle = 'Chapter 1.0: Core Textbook Curriculum',
    nodes,
    activeNodeId,
    onSelectNode,
    isCollapsedDefault = false
}) => {
    const [isCollapsed, setIsCollapsed] = useState(isCollapsedDefault);

    const getIndexedCode = (node: TopicIndexNode, idx: number): string => {
        if (node.indexCode) return node.indexCode;
        return `1.${idx + 1}`;
    };

    const getWeightageBadge = (node: TopicIndexNode, idx: number) => {
        const marks = node.weightageMarks || (idx % 3 === 0 ? 5 : idx % 2 === 0 ? 3 : 1);
        if (marks >= 5 || node.isBoardHighPriority || idx === 1) {
            return (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[9px] flex items-center gap-1 shadow-sm shrink-0">
                    <Flame size={10} className="text-amber-400 animate-pulse" />
                    <span>5 Marks 🔥</span>
                </span>
            );
        }
        if (marks >= 3) {
            return (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold text-[9px] shrink-0">
                    3 Marks
                </span>
            );
        }
        return (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-medium text-[9px] shrink-0">
                1 Mark MCQ
            </span>
        );
    };

    return (
        <div className="w-full bg-[#0B0915]/80 border border-white/10 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl transition-all">
            <div 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center justify-between cursor-pointer select-none pb-3 border-b border-white/10"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shrink-0">
                        <BookOpen size={16} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block truncate">
                            {unitTitle}
                        </span>
                        <h4 className="font-bold text-xs text-white tracking-wide truncate">
                            {chapterTitle}
                        </h4>
                    </div>
                </div>
                <button className="p-1.5 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors">
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {!isCollapsed && (
                <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                    {nodes.map((node, idx) => {
                        const code = getIndexedCode(node, idx);
                        const isActive = node.id === activeNodeId;
                        const isLocked = node.status === 'LOCKED';
                        const isDone = node.status === 'DONE';

                        return (
                            <div
                                key={node.id}
                                onClick={() => !isLocked && onSelectNode(node.id)}
                                className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/30'
                                        : isLocked
                                        ? 'bg-white/[0.01] border-white/5 opacity-40 cursor-not-allowed'
                                        : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5 hover:border-indigo-500/30 cursor-pointer'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`px-2 py-1 rounded-xl text-[10px] font-black tracking-wider shrink-0 ${
                                        isDone
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : isActive
                                            ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                                            : 'bg-white/5 text-gray-400 border border-white/10'
                                    }`}>
                                        {code}
                                    </div>

                                    <div className="min-w-0">
                                        <h5 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>
                                            {node.title}
                                        </h5>
                                        {node.lastScore !== undefined && node.lastScore > 0 && (
                                            <span className="text-[9px] text-emerald-400 font-medium">
                                                Mastery: {node.lastScore}%
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {getWeightageBadge(node, idx)}

                                    {isDone ? (
                                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                                    ) : isLocked ? (
                                        <Lock size={14} className="text-gray-500 shrink-0" />
                                    ) : (
                                        <ChevronRight size={14} className="text-gray-400 shrink-0" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MinervaTopicIndexer;
