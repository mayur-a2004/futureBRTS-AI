import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Copy, RotateCw, ThumbsUp, ThumbsDown, Check, Download, FileText, ExternalLink, Sparkles, Edit2, Search, Rocket } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import { motion } from "framer-motion";

import { NeuralTooltip } from '@/components/ui/NeuralTooltip';
import { CitationTooltip } from '@/components/ui/CitationTooltip';

// 🌐 RESEARCH BADGE COMPONENT
const SearchBadge = ({ subject }: { subject: string }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 px-4 py-2 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit"
    >
        <div className="relative">
            <Search size={14} className="text-indigo-400" />
            <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-indigo-500 rounded-full blur-[2px]"
            />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
            Intelligence Gathering: <span className="text-white ml-1">{subject}</span>
        </span>
        <div className="flex gap-1 ml-2">
            {[1, 2, 3].map(i => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 h-1 rounded-full bg-indigo-400"
                />
            ))}
        </div>
    </motion.div>
);

// Sanitize Pollinations AI image links in Markdown (combines newlines and encodes prompt parts)
const sanitizeMarkdownImages = (text: string): string => {
    if (!text) return text;
    // 1. Remove newlines and whitespace between ![...] and (...)
    let sanitized = text.replace(/!\[([^\]]*)\]\s*\n+\s*\(([^)]+)\)/g, '![$1]($2)');
    
    // 2. Find pollinations.ai URLs and URL-encode their prompts safely
    sanitized = sanitized.replace(/https:\/\/image\.pollinations\.ai\/prompt\/([^?)\s]+(?:\s+[^?)\s]+)*)(?=\?|\)|$)/g, (_, promptPart) => {
        return `https://image.pollinations.ai/prompt/${encodeURIComponent(promptPart.trim())}`;
    });
    
    return sanitized;
};

export interface Attachment {
    name: string;
    type: string;
    preview?: string;
}

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    attachments?: Attachment[];
    onRetry?: () => void;
    onFeedback?: (type: 'up' | 'down') => void;
    icon?: React.ReactNode;
    summary?: string;
    suggestions?: string[];
    onEdit?: (content: string) => void;
    isProcessing?: boolean;
    onStop?: () => void;
    onSuggestionClick?: (suggestion: string) => void;
    onViewBuildConsole?: () => void;
}

export const MessageBubble = React.memo(({
    role,
    content,
    attachments,
    onRetry,
    onFeedback,
    icon,
    summary,
    suggestions,
    onEdit,
    isProcessing,
    onStop,
    onSuggestionClick,
    onViewBuildConsole
}: MessageBubbleProps) => {
    const isUser = role === 'user';
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(content);

    const handleDownload = (e: React.MouseEvent, url: string, filename: string) => {
        e.preventDefault();
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 🧠 Extract Searching Tag & Protect Against JSON Leakage (Suggestions)
    const searchingMatch = !isUser ? content.match(/\[SEARCHING\]:\s*(.*?)(?=\n|$)/i) : null;
    let strippedContent = content.replace(/\[SEARCHING\]:.*?(?=\n|$)/gi, "").trim();

    // Ensure ||SUGGESTIONS_JSON|| never leaks to raw text
    if (!isUser && strippedContent.includes('||SUGGESTIONS_JSON||')) {
        strippedContent = strippedContent.split('||SUGGESTIONS_JSON||')[0].trim();
    }

    const cleanedContent = !isUser ? strippedContent : content;
    const sanitizedCleanedContent = sanitizeMarkdownImages(cleanedContent);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveEdit = () => {
        if (onEdit) onEdit(editValue);
        setIsEditing(false);
    };

    return (
        <div className={`flex items-start gap-2.5 mx-auto max-w-4xl w-full group ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {/* Avatar */}
            <div className={`w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center relative ${isUser ? 'rounded-xl bg-white/5 border border-white/10 shadow-xl' : 'rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-xl shadow-indigo-500/20'}`}>
                {!isUser && (
                    <div className="absolute inset-0 bg-indigo-500 blur-sm opacity-50 rounded-xl animate-pulse" />
                )}
                <div className="relative z-10 flex items-center justify-center w-full h-full">
                    {isUser ? (
                        <User size={16} className="text-gray-300" />
                    ) : (
                        icon ? icon : <span className="font-black text-[10px] md:text-[11px] text-white tracking-widest">FB</span>
                    )}
                </div>
            </div>

            {/* Bubble Content */}
            <div className={`flex-1 relative min-w-0 ${isUser ? 'flex justify-end' : ''}`}>
                <div className={`${isUser ? 'bg-[#2f2f2f] text-white px-5 py-3 rounded-2xl max-w-[85%] shadow-xl' : 'text-[#f3f4f6] w-full'}`}>
                    {/* Searching Indicator */}
                    {!isUser && searchingMatch && <SearchBadge subject={searchingMatch[1]} />}

                    {attachments && attachments.length > 0 && (
                        <div className={`flex flex-wrap gap-3 mb-4 ${isUser ? 'justify-end' : ''}`}>
                            {attachments.map((file, i) => (
                                <div key={i} className="relative group overflow-hidden rounded-[18px] border border-white/10 bg-black/40 backdrop-blur-md">
                                    {file.preview ? (
                                        <img
                                            src={file.preview}
                                            alt={file.name}
                                            className="h-52 w-auto max-w-full object-cover rounded-lg hover:scale-110 transition-transform duration-500 cursor-pointer"
                                            onClick={() => window.open(file.preview, '_blank')}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-4 py-3 h-14 min-w-[140px]">
                                            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                                                <FileText size={18} />
                                            </div>
                                            <span className="text-[11px] font-bold uppercase tracking-widest truncate max-w-[120px] opacity-70">{file.name}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {isUser ? (
                        <div className="space-y-2">
                            {isEditing ? (
                                <div className="space-y-3 min-w-[300px]">
                                    <textarea
                                        className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none min-h-[100px]"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
                                        <button onClick={handleSaveEdit} className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold transition-all">Save & Resend</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-[#f3f4f6]">{content}</div>
                                    <div className="flex items-center gap-2 pt-2 border-t border-white/5 -mx-1">
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="p-1 px-2 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5"
                                            title="Edit prompt"
                                        >
                                            <Edit2 size={11} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Edit</span>
                                        </button>
                                        <div className="w-px h-2.5 bg-white/10" />
                                        <button
                                            onClick={handleCopy}
                                            className="p-1 px-2 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5"
                                            title="Copy prompt"
                                        >
                                            {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{copied ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none break-words !pt-0
                            prose-headings:!text-white prose-headings:!mb-6 prose-headings:!mt-10 first:prose-headings:!mt-0 prose-headings:!tracking-tight
                            prose-h1:!text-[1.8rem] prose-h1:!font-black prose-h1:!italic prose-h1:!uppercase prose-h1:!leading-tight
                            prose-h2:!text-[1.5rem] prose-h2:!font-black prose-h2:!tracking-tight prose-h2:!mb-4
                            prose-h3:!text-[1.2rem] prose-h3:!font-bold prose-h3:!mb-3
                            prose-p:!text-[1.05rem] prose-p:!leading-[1.8] prose-p:!mb-6 prose-p:!text-[#f3f4f6]
                            prose-ul:!my-8 prose-ul:!list-none prose-ul:!pl-0 
                            prose-li:text-[#f3f4f6] prose-li:!mb-6 prose-li:!pl-0
                            prose-strong:text-white prose-strong:font-black prose-strong:text-[1.1rem]
                            prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-2.5 prose-code:py-1 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-[11px] prose-code:border prose-code:border-indigo-500/20 prose-code:shadow-[0_0_10px_rgba(99,102,241,0.05)]
                            prose-pre:bg-transparent prose-pre:border-0 prose-pre:p-0 prose-pre:my-8
                            prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-300 prose-blockquote:bg-indigo-500/5 prose-blockquote:py-6 prose-blockquote:rounded-r-2xl
                            prose-hr:border-white/10 prose-hr:my-12
                            [&_li_li]:ml-8 [&_li_li]:mt-4 [&_li_li]:!mb-2 [&_li_li_.neural-dot]:w-2 [&_li_li_.neural-dot]:h-2 [&_li_li_.neural-dot]:bg-indigo-400/60 [&_li_li_.neural-dot]:shadow-none [&_li_li_.neural-dot]:cursor-default [&_li_li_.neural-text]:text-[0.95rem] [&_li_li_.neural-text]:text-gray-400">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="!text-[1.8rem] !font-black !text-white !mb-6 first:!mt-0 !mt-10 !italic !uppercase !leading-tight !tracking-tighter" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="!text-[1.5rem] !font-black !text-white !mb-4 first:!mt-0 !mt-8 !tracking-tight" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="!text-[1.2rem] !font-bold !text-white !mb-3 first:!mt-0 !mt-6" {...props} />,
                                    ul: ({ children }) => <ul className="space-y-6 my-8">{children}</ul>,
                                    li: ({ children }) => {
                                        return (
                                            <li className="flex gap-5 items-start group/li relative">
                                                <div className="relative mt-2.5 shrink-0">
                                                    <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300 relative z-10" />
                                                </div>
                                                <div className="neural-text flex-1 text-[1.05rem] leading-relaxed group-hover/li:text-white transition-colors">
                                                    {children}
                                                </div>
                                            </li>
                                        );
                                    },
                                    p: ({ children }) => {
                                        const childrenArray = React.Children.toArray(children);
                                        return (
                                            <p className="mb-6 first:!mt-0 leading-relaxed font-medium text-[#f3f4f6]">
                                                {childrenArray.map((child) => {
                                                    if (typeof child === 'string') {
                                                        // 🧠 SPLIT BY CITATION PATTERN: [[Citation: Name | URL | Snippet]]
                                                        // eslint-disable-next-line
                                                        const parts = child.split(/(\[\[Citation:.*?\]\])/g);
                                                        return parts.map((part, i) => {
                                                            if (part.startsWith('[[Citation:')) {
                                                                const content = part.replace('[[Citation:', '').replace(']]', ''); // Keep inner content
                                                                // Safe split
                                                                const [name, url, snippet] = content.split('|').map(s => s.trim());

                                                                // Use default if missing (backward compatibility)
                                                                const finalName = name || "Source";
                                                                const finalUrl = url || `https://google.com/search?q=${encodeURIComponent(finalName)}`;
                                                                const finalSnippet = snippet || `Verified external reference for ${finalName}. Access the link for full documentation.`;

                                                                return (
                                                                    <CitationTooltip key={i} citation={{ name: finalName, url: finalUrl, snippet: finalSnippet }}>
                                                                        {finalName}
                                                                    </CitationTooltip>
                                                                );
                                                            }
                                                            return part;
                                                        });
                                                    }
                                                    return child;
                                                })}
                                            </p>
                                        );
                                    },
                                    pre: ({ children }) => {
                                        return <div className="rounded-[22px] overflow-hidden border border-white/10 bg-[#0d0d0d] my-6 shadow-2xl">{children}</div>;
                                    },
                                    code({ node, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const isInline = !match;
                                        if (isInline) {
                                            return (
                                                <NeuralTooltip text={String(children)}>
                                                    <code className="text-white bg-indigo-500/10 px-2.5 py-1 rounded-lg font-mono text-[11px] border border-indigo-500/20 hover:bg-indigo-500/20 transition-all font-black group/node shadow-[0_0_10px_rgba(99,102,241,0.1)]" {...props}>
                                                        {children}
                                                    </code>
                                                </NeuralTooltip>
                                            );
                                        }

                                        const codeContent = String(children).replace(/\n$/, '');
                                        return (
                                            <div className="relative group/code text-[13px]">
                                                <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5">
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{match?.[1] || 'code'}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            navigator.clipboard.writeText(codeContent);
                                                            const btn = e.currentTarget as HTMLButtonElement;
                                                            if (btn) btn.innerHTML = '<span class="text-emerald-400">COPIED</span>';
                                                            setTimeout(() => { if (btn) btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'; }, 2000);
                                                        }}
                                                        className="text-gray-500 hover:text-white transition-all active:scale-95"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex-1 overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                                    <SyntaxHighlighter
                                                        style={atomDark}
                                                        language={match?.[1] || 'text'}
                                                        PreTag="div"
                                                        className="!bg-transparent !p-6 !m-0 !text-[13px]"
                                                        customStyle={{
                                                            margin: 0,
                                                            background: 'transparent',
                                                            minWidth: '100%',
                                                            width: 'max-content'
                                                        }}
                                                    >
                                                        {codeContent}
                                                    </SyntaxHighlighter>
                                                </div>
                                            </div>
                                        );
                                    },
                                    // Custom Download Link Detection
                                    a: ({ href, children }) => {
                                        const isDownload = href?.includes('/download') ||
                                            href?.includes('storage') ||
                                            href?.endsWith('.pdf') ||
                                            href?.endsWith('.zip') ||
                                            href?.endsWith('.docx') ||
                                            href?.endsWith('.doc') ||
                                            href?.endsWith('.pptx') ||
                                            href?.endsWith('.ppt');
                                        if (isDownload) {
                                            return (
                                                <a
                                                    href={href}
                                                    onClick={(e) => handleDownload(e, href!, String(children))}
                                                    className="flex items-center gap-4 p-5 my-4 rounded-[22px] bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all no-underline group/link shadow-lg cursor-pointer"
                                                >
                                                    <div className="w-12 h-12 rounded-[16px] bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover/link:bg-indigo-500 group-hover/link:text-white transition-all shadow-inner">
                                                        <FileText size={22} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-black text-white truncate uppercase tracking-tight">{children}</div>
                                                        <div className="text-[9px] text-indigo-400/60 font-black uppercase tracking-[0.25em] mt-1 italic">Secure Object Ready</div>
                                                    </div>
                                                    <Download size={18} className="text-gray-500 group-hover/link:text-white transition-colors" />
                                                </a>
                                            );
                                        }
                                        return (
                                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 font-bold">
                                                {children} <ExternalLink size={12} />
                                            </a>
                                        );
                                    }
                                }}
                            >
                                {sanitizedCleanedContent}
                            </ReactMarkdown>

                            {/* Summary Section */}
                            {summary && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 p-6 rounded-[22px] bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 shadow-xl"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1 px-2 rounded-md bg-indigo-500/20 border border-indigo-500/20">
                                            <Sparkles size={12} className="text-indigo-400" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Strategic Executive Summary</span>
                                    </div>
                                    <p className="text-[13px] text-gray-300 leading-relaxed font-medium italic">
                                        "{summary}"
                                    </p>
                                </motion.div>
                            )}

                            {/* Suggestions Section */}
                            {suggestions && suggestions.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Neural Recommendations</div>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map((s, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => onSuggestionClick?.(s)}
                                                className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 text-[12px] font-bold text-gray-400 hover:text-white transition-all active:scale-95 flex items-center gap-2 group"
                                            >
                                                {s} <Sparkles size={10} className="text-indigo-400 group-hover:animate-pulse" />
                                            </button>
                                        ))}
                                    </div>

                                    {onViewBuildConsole && (
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
                                            <button
                                                onClick={onViewBuildConsole}
                                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400 transition-all font-black text-[11px] uppercase tracking-widest group shadow-xl shadow-indigo-500/10"
                                            >
                                                <Rocket size={14} className="text-indigo-400 group-hover:-rotate-12 transition-transform" />
                                                View Mission Console
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* AI Action Bar */}
                {!isUser && (
                    <div className="flex items-center gap-2 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {isProcessing ? (
                            <button
                                onClick={onStop}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                                <div className="w-2 h-2 bg-red-500 rounded-sm animate-pulse" /> Stop Engine
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>

                                {onRetry && (
                                    <button
                                        onClick={onRetry}
                                        className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
                                        title="Regenerate response"
                                    >
                                        <RotateCw size={14} />
                                    </button>
                                )}

                                <div className="h-3 w-px bg-white/10 mx-1" />

                                <button
                                    onClick={() => onFeedback?.('up')}
                                    className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-emerald-500 transition-colors"
                                    title="Good response"
                                >
                                    <ThumbsUp size={14} />
                                </button>
                                <button
                                    onClick={() => onFeedback?.('down')}
                                    className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-rose-500 transition-colors"
                                    title="Poor response"
                                >
                                    <ThumbsDown size={14} />
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* User Edit Bar - Handled inside bubble now */}
            </div>
        </div>
    );
});
