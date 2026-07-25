import React, { useRef, useState, useEffect } from 'react';
import { 
    Eraser, Download, Sparkles, X, Volume2, VolumeX, 
    SkipForward, SkipBack, ZoomIn, ZoomOut, ChevronDown, ChevronUp, PenTool, Layout, Play
} from 'lucide-react';

export interface SolutionStep {
    stepNumber: number;
    title: string;
    explanation: string;
    latexOrFormula: string;
    svgStrokes?: string[];
}

interface MinervaWhiteboardCanvasProps {
    isOpen: boolean;
    onClose: () => void;
    initialTitle?: string;
    solutionSteps?: SolutionStep[];
}

const buildDynamicSteps = (title: string, customSteps?: SolutionStep[]): SolutionStep[] => {
    if (customSteps && customSteps.length > 0) return customSteps;
    
    return [
        {
            stepNumber: 1,
            title: `Step 1: Given Parameters & Core Concept Setup`,
            explanation: `Dost, pehle step me hum '${title}' ke fundamental principles aur equations ko set up karte hain.`,
            latexOrFormula: `Given: ${title} ==> Core Equation: f(x) = ...`
        },
        {
            stepNumber: 2,
            title: `Step 2: Step-by-Step Mathematical Derivation`,
            explanation: `Is step me hum step-by-step values substitute karke derivation ya formula evaluate karte hain.`,
            latexOrFormula: `Step 2: Substitute Known Values & Evaluate Formula Intermediates`
        },
        {
            stepNumber: 3,
            title: `Step 3: Intermediate Simplification & Calculations`,
            explanation: `Algebraic simplification karke exact numerical values derive karte hain.`,
            latexOrFormula: `Step 3: Simplify Terms & Combine Operations`
        },
        {
            stepNumber: 4,
            title: `Step 4: Final Verified Answer & Board Exam Blueprint Box`,
            explanation: `Final calculation complete karke verified result derive karte hain.`,
            latexOrFormula: `Final Verified Result for ${title} ✅`
        }
    ];
};

export const MinervaWhiteboardCanvas: React.FC<MinervaWhiteboardCanvasProps> = ({
    isOpen,
    onClose,
    initialTitle = 'AI Touch Smart Board',
    solutionSteps
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    // Board Mode: 'ai_solution' (AI Solution Steps Overlay) vs 'blank_slate' (100% Clean Writing Blackboard)
    const [boardMode, setBoardMode] = useState<'ai_solution' | 'blank_slate'>('ai_solution');

    // Tools State
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [penThickness, setPenThickness] = useState<number>(2.5);
    const [color, setColor] = useState<string>('#6366f1');
    const [eraserSize] = useState<number>(35);
    
    // View & Scroll State
    const [zoomLevel, setZoomLevel] = useState<number>(1.0);
    const [scrollY, setScrollY] = useState<number>(0);
    const boardTheme = 'dark';
    
    // Dynamic Solution Steps
    const activeSteps = buildDynamicSteps(initialTitle, solutionSteps);
    const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);

    // ✍️ Live Animated Handwriting State
    const [writingCharCount, setWritingCharCount] = useState<number>(0);
    const [isWritingCompleted, setIsWritingCompleted] = useState<boolean>(false);

    const colors = [
        '#ffffff', '#6366f1', '#38bdf8', '#4ade80', 
        '#f43f5e', '#fbbf24', '#a855f7', '#f97316'
    ];

    // Live Handwriting Character Typing Animation Loop
    useEffect(() => {
        if (!isOpen || boardMode !== 'ai_solution') return;

        const currentStep = activeSteps[activeStepIdx];
        if (!currentStep) return;

        const targetText = currentStep.latexOrFormula || '';
        setWritingCharCount(0);
        setIsWritingCompleted(false);

        let charIdx = 0;
        const typingInterval = setInterval(() => {
            charIdx += 1;
            setWritingCharCount(charIdx);

            if (charIdx >= targetText.length) {
                clearInterval(typingInterval);
                setIsWritingCompleted(true);
                if (isVoiceEnabled) {
                    speakExplanation(currentStep.explanation);
                }
            }
        }, 22); // 22ms per char for realistic live chalk handwriting effect

        return () => clearInterval(typingInterval);
    }, [activeStepIdx, boardMode, isOpen]);

    // Auto-scroll canvas to active step
    useEffect(() => {
        if (boardMode === 'ai_solution') {
            const targetScroll = Math.max(0, (activeStepIdx - 1) * 125);
            setScrollY(targetScroll);
        }
    }, [activeStepIdx, boardMode]);

    useEffect(() => {
        if (!isOpen) return;
        renderBoardBackground();
    }, [isOpen, boardTheme, zoomLevel, activeStepIdx, scrollY, boardMode, initialTitle, writingCharCount]);

    const renderBoardBackground = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const logicalWidth = canvas.offsetWidth;
        const logicalHeight = canvas.offsetHeight;

        canvas.width = logicalWidth * dpr;
        canvas.height = logicalHeight * dpr;

        ctx.save();
        ctx.scale(dpr * zoomLevel, dpr * zoomLevel);

        // Fill Dark Blackboard Background
        ctx.fillStyle = boardTheme === 'dark' ? '#0b0917' : '#f8fafc';
        ctx.fillRect(0, 0, logicalWidth / zoomLevel, logicalHeight / zoomLevel);

        // Translate Canvas by Vertical Scroll Offset
        ctx.translate(0, -scrollY);

        // Draw Grid Lines
        ctx.strokeStyle = boardTheme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 30;
        const totalHeight = Math.max(logicalHeight + scrollY + 1000, 2500);

        for (let x = 0; x < logicalWidth / zoomLevel; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, totalHeight);
            ctx.stroke();
        }
        for (let y = 0; y < totalHeight; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(logicalWidth / zoomLevel, y);
            ctx.stroke();
        }

        // Render Dynamic Solution Steps ONLY IF boardMode === 'ai_solution'
        if (boardMode === 'ai_solution') {
            renderAIHandwritingSteps(ctx, logicalWidth / zoomLevel);
        } else {
            // Clean Slate Badge
            ctx.fillStyle = '#6366f1';
            ctx.font = 'bold 13px "Inter", sans-serif';
            ctx.fillText('✏️ CLEAN WRITING SLATE — WRITE YOUR CALCULATIONS FREEHAND HERE', 25, 40);
        }

        ctx.restore();
    };

    const renderAIHandwritingSteps = (ctx: CanvasRenderingContext2D, canvasLogicalWidth: number) => {
        const boxWidth = Math.max(280, Math.min(canvasLogicalWidth - 30, 800));
        const baseFontSize = canvasLogicalWidth < 480 ? 11 : canvasLogicalWidth < 768 ? 13 : 15;

        activeSteps.slice(0, activeStepIdx + 1).forEach((step, idx) => {
            const startY = 45 + idx * 135;
            const isActive = idx === activeStepIdx;

            // Highlight Box for Active Step
            if (isActive) {
                ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(15, startY - 20, boxWidth, 110, 14);
                ctx.fill();
                ctx.stroke();
            }

            // Step Header Title
            ctx.fillStyle = isActive ? '#818cf8' : '#94a3b8';
            ctx.font = `700 ${baseFontSize}px "Inter", sans-serif`;
            ctx.fillText(step.title, 25, startY - 2);

            // Step Formula / Live Animated Handwriting Text
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${baseFontSize + 2}px "KaTeX_Main", "Courier New", monospace`;
            
            const fullFormula = step.latexOrFormula;
            // If active step, show only written characters so far. If previous step, show full.
            const visibleFormula = isActive ? fullFormula.slice(0, writingCharCount) : fullFormula;

            // Wrap text multi-line according to boxWidth
            const maxCharsPerLine = Math.max(20, Math.floor(boxWidth / ((baseFontSize + 2) * 0.62)));
            const lines: string[] = [];

            for (let i = 0; i < visibleFormula.length; i += maxCharsPerLine) {
                lines.push(visibleFormula.slice(i, i + maxCharsPerLine));
            }

            if (lines.length === 0) lines.push('');

            lines.forEach((lineText, lineIdx) => {
                const lineY = startY + 26 + (lineIdx * (baseFontSize + 8));
                ctx.fillText(lineText, 25, lineY);

                // Draw Glowing Chalk Tip / Pen Tip Cursor at end of the last line being actively written
                if (isActive && lineIdx === lines.length - 1 && !isWritingCompleted) {
                    const textMetrics = ctx.measureText(lineText);
                    const tipX = 28 + textMetrics.width;

                    // Glowing Chalk Dot
                    ctx.save();
                    ctx.shadowColor = '#6366f1';
                    ctx.shadowBlur = 10;
                    ctx.fillStyle = '#38bdf8';
                    ctx.beginPath();
                    ctx.arc(tipX, lineY - 4, 5, 0, Math.PI * 2);
                    ctx.fill();

                    // Pen Emoji Indicator
                    ctx.font = '14px sans-serif';
                    ctx.fillText('✍️', tipX + 4, lineY);
                    ctx.restore();
                }
            });
        });
    };

    const speakExplanation = (text: string) => {
        if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.lang = 'hi-IN';
        window.speechSynthesis.speak(utterance);
    };

    const skipWritingAnimation = () => {
        const currentStep = activeSteps[activeStepIdx];
        if (currentStep) {
            setWritingCharCount(currentStep.latexOrFormula.length);
            setIsWritingCompleted(true);
        }
    };

    const handleNextStep = () => {
        if (activeStepIdx < activeSteps.length - 1) {
            const nextIdx = activeStepIdx + 1;
            setActiveStepIdx(nextIdx);
        }
    };

    const handlePrevStep = () => {
        if (activeStepIdx > 0) {
            const prevIdx = activeStepIdx - 1;
            setActiveStepIdx(prevIdx);
        }
    };

    const handleSelectStep = (idx: number) => {
        setActiveStepIdx(idx);
    };

    // Canvas Freehand Drawing & True Pixel Eraser Handlers
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const x = (clientX - rect.left) / zoomLevel;
        const y = (clientY - rect.top) / zoomLevel + scrollY;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.save();
        ctx.scale(dpr * zoomLevel, dpr * zoomLevel);
        ctx.translate(0, -scrollY);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const x = (clientX - rect.left) / zoomLevel;
        const y = (clientY - rect.top) / zoomLevel + scrollY;

        if (tool === 'eraser') {
            const radius = eraserSize;
            ctx.fillStyle = '#0b0917';
            ctx.fillRect(x - radius / 2, y - radius / 2, radius, radius);
        } else {
            ctx.strokeStyle = color;
            ctx.lineWidth = penThickness * 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.restore();
        }
    };

    const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setScrollY(prev => Math.max(0, Math.min((activeSteps.length - 1) * 135 + 400, prev + e.deltaY * 0.6)));
    };

    const clearCanvasToCleanSlate = () => {
        setBoardMode('blank_slate');
        setScrollY(0);
        renderBoardBackground();
    };

    const resetToAISolutionMode = () => {
        setBoardMode('ai_solution');
        renderBoardBackground();
    };

    const exportPNG = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `smartboard_notes_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    if (!isOpen) return null;

    const currentStep = activeSteps[activeStepIdx];

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between p-2 sm:p-4 animate-in fade-in duration-200 select-none overflow-hidden">
            
            {/* Header Control Panel - Responsive Scrollable Row */}
            <div className="flex items-center justify-between bg-[#0B0915]/95 border border-white/10 rounded-2xl px-3 py-2 shadow-2xl gap-2 overflow-x-auto scrollbar-none w-full shrink-0">
                
                {/* Title & Mode Badges */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shrink-0">
                        <Sparkles size={16} className="animate-pulse" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs font-black text-white tracking-wide flex items-center gap-1.5 whitespace-nowrap">
                            <span className="truncate max-w-[140px] sm:max-w-[220px]">{initialTitle}</span>
                            
                            {boardMode === 'ai_solution' ? (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] uppercase font-bold">
                                    Step {activeStepIdx + 1}/{activeSteps.length}
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] uppercase font-bold">
                                    ✏️ Clean Slate
                                </span>
                            )}
                        </h3>
                    </div>
                </div>

                {/* Main Toolbar - Compact & Fully Responsive */}
                <div className="flex items-center gap-1.5 shrink-0 flex-nowrap overflow-x-auto scrollbar-none">
                    
                    {/* Mode Selector Toggle */}
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 gap-0.5 shrink-0">
                        <button
                            onClick={resetToAISolutionMode}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                                boardMode === 'ai_solution'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Layout size={12} /> AI Solution
                        </button>

                        <button
                            onClick={clearCanvasToCleanSlate}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                                boardMode === 'blank_slate'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <PenTool size={12} /> Clean Slate
                        </button>
                    </div>

                    {/* Pen Thickness Selector */}
                    <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 gap-0.5 shrink-0">
                        {[
                            { label: '0.5m', size: 1 },
                            { label: '1.5m', size: 2.5 },
                            { label: '3.0m', size: 4.5 }
                        ].map(t => (
                            <button
                                key={t.label}
                                onClick={() => {
                                    setPenThickness(t.size);
                                    setTool('pen');
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all ${
                                    penThickness === t.size && tool === 'pen'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Color Palette */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/5 border border-white/10 shrink-0">
                        {colors.slice(0, 6).map(c => (
                            <button
                                key={c}
                                onClick={() => {
                                    setColor(c);
                                    setTool('pen');
                                }}
                                style={{ backgroundColor: c }}
                                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                                    color === c && tool === 'pen' ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Eraser Button */}
                    <button
                        onClick={() => setTool('eraser')}
                        className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                            tool === 'eraser'
                                ? 'bg-rose-600 text-white shadow-md'
                                : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                    >
                        <Eraser size={12} /> Eraser
                    </button>

                    {/* Voice Explain Toggle */}
                    <button
                        onClick={() => {
                            setIsVoiceEnabled(!isVoiceEnabled);
                            if (!isVoiceEnabled && currentStep) {
                                speakExplanation(currentStep.explanation);
                            } else {
                                window.speechSynthesis?.cancel();
                            }
                        }}
                        className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                            isVoiceEnabled
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-white/5 text-gray-500'
                        }`}
                    >
                        {isVoiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                        <span className="hidden sm:inline">Voice</span>
                    </button>

                    {/* Vertical Scroll Controls */}
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 gap-0.5 shrink-0">
                        <button
                            onClick={() => setScrollY(prev => Math.max(0, prev - 125))}
                            className="p-1 text-gray-400 hover:text-white rounded-lg"
                            title="Scroll Up"
                        >
                            <ChevronUp size={12} />
                        </button>
                        <button
                            onClick={() => setScrollY(prev => prev + 125)}
                            className="p-1 text-gray-400 hover:text-white rounded-lg"
                            title="Scroll Down"
                        >
                            <ChevronDown size={12} />
                        </button>
                    </div>

                    {/* Zoom In/Out */}
                    <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 gap-0.5 shrink-0">
                        <button
                            onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
                            className="p-1 text-gray-400 hover:text-white rounded-lg"
                        >
                            <ZoomOut size={12} />
                        </button>
                        <span className="text-[9px] font-bold text-gray-300 px-0.5">{Math.round(zoomLevel * 100)}%</span>
                        <button
                            onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.25))}
                            className="p-1 text-gray-400 hover:text-white rounded-lg"
                        >
                            <ZoomIn size={12} />
                        </button>
                    </div>

                    {/* Export PNG */}
                    <button
                        onClick={exportPNG}
                        className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 shadow-md"
                    >
                        <Download size={12} /> Export
                    </button>

                    {/* Close Modal */}
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all shrink-0"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Smart Canvas Scratchpad Container */}
            <div 
                onWheel={handleWheelScroll}
                className="relative flex-1 my-2 bg-[#0B0917] border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-h-[300px]"
            >
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair touch-none"
                />

                {/* Subtitle & Step Control Panel (Only in AI Solution Mode) */}
                {boardMode === 'ai_solution' && currentStep && (
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 bg-[#0B0915]/95 border border-indigo-500/30 rounded-xl p-2.5 sm:p-3 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
                        
                        {/* Voice Script & Step Title */}
                        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                                <Volume2 size={14} className="animate-pulse" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">
                                        AI Teacher Step Explanation
                                    </span>
                                    {!isWritingCompleted && (
                                        <span className="text-[9px] text-amber-400 font-bold animate-pulse flex items-center gap-1">
                                            ✍️ Live Handwriting...
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] font-medium text-gray-200 leading-snug truncate sm:whitespace-normal">
                                    "{currentStep.explanation}"
                                </p>
                            </div>
                        </div>

                        {/* Step Navigation Pill Selector & Previous / Next Step Buttons */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end w-full sm:w-auto">
                            
                            {/* Skip Handwriting Animation Button */}
                            {!isWritingCompleted && (
                                <button
                                    onClick={skipWritingAnimation}
                                    className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                                >
                                    <Play size={10} /> Fast Writing
                                </button>
                            )}

                            {/* Clickable Step Pills */}
                            <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 p-0.5 rounded-lg">
                                {activeSteps.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectStep(idx)}
                                        className={`w-5 h-5 rounded-md text-[9px] font-bold transition-all ${
                                            activeStepIdx === idx
                                                ? 'bg-indigo-600 text-white font-black scale-105'
                                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Previous Step Button */}
                            <button
                                onClick={handlePrevStep}
                                disabled={activeStepIdx === 0}
                                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 text-gray-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
                            >
                                <SkipBack size={12} />
                                <span>Prev</span>
                            </button>

                            {/* Next Step Button */}
                            <button
                                onClick={handleNextStep}
                                disabled={activeStepIdx >= activeSteps.length - 1}
                                className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-40 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all shadow-md active:scale-95"
                            >
                                <span>Next Step</span>
                                <SkipForward size={12} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MinervaWhiteboardCanvas;
