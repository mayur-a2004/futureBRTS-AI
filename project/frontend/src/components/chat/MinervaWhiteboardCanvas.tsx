import React, { useRef, useState, useEffect } from 'react';
import { 
    Eraser, RotateCcw, Download, Sparkles, X, Volume2, VolumeX, 
    SkipForward, SkipBack, ZoomIn, ZoomOut, ChevronDown, ChevronUp, PenTool, Layout
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
            title: `Step 1: Core Concept & Formula Setup`,
            explanation: `Dost, pehle step me hum '${title}' ke fundamental principles aur equations ko set up karte hain.`,
            latexOrFormula: `Topic: ${title} ==> Setup Core Equation & Given Data`
        },
        {
            stepNumber: 2,
            title: `Step 2: Step-by-Step Mathematical & Technical Derivation`,
            explanation: `Is step me hum step-by-step values substitute karke derivation ya chemical/physics relation solve karte hain.`,
            latexOrFormula: `Step 2: Substitute Values & Solve Formula Intermediates`
        },
        {
            stepNumber: 3,
            title: `Step 3: Final Verified Result & Board Blueprint Answer`,
            explanation: `Final calculation complete karke verified result derive karte hain.`,
            latexOrFormula: `Final Result: Verified Solution for ${title} ✅`
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
    
    // Board Mode: 'ai_solution' (AI Solution Steps Overlay) vs 'blank_slate' (100% Clean Writing Blackboard for Student)
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

    const colors = [
        '#ffffff', '#6366f1', '#38bdf8', '#4ade80', 
        '#f43f5e', '#fbbf24', '#a855f7', '#f97316'
    ];

    // Auto-scroll canvas to active step whenever activeStepIdx changes (in AI Solution mode)
    useEffect(() => {
        if (boardMode === 'ai_solution') {
            const targetScroll = Math.max(0, (activeStepIdx - 1) * 115);
            setScrollY(targetScroll);
        }
    }, [activeStepIdx, boardMode]);

    useEffect(() => {
        if (!isOpen) return;
        renderBoardBackground();
    }, [isOpen, boardTheme, zoomLevel, activeStepIdx, scrollY, boardMode, initialTitle]);

    const renderBoardBackground = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;

        ctx.save();
        ctx.scale(2 * zoomLevel, 2 * zoomLevel);

        // Fill Dark Background
        ctx.fillStyle = boardTheme === 'dark' ? '#0b0917' : '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Translate Canvas by Vertical Scroll Offset
        ctx.translate(0, -scrollY);

        // Draw Grid Lines
        ctx.strokeStyle = boardTheme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 30;
        const totalHeight = Math.max(canvas.height + scrollY + 1000, 2500);

        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, totalHeight);
            ctx.stroke();
        }
        for (let y = 0; y < totalHeight; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Render Dynamic Solution Steps ONLY IF boardMode === 'ai_solution'
        if (boardMode === 'ai_solution') {
            renderAIHandwritingSteps(ctx);
        } else {
            // Render Clean Slate Header Badge
            ctx.fillStyle = '#6366f1';
            ctx.font = 'bold 14px "Inter", sans-serif';
            ctx.fillText('✏️ CLEAN WRITING SLATE — WRITE YOUR SOLUTIONS / CALCULATIONS HERE', 35, 45);
        }

        ctx.restore();
    };

    const renderAIHandwritingSteps = (ctx: CanvasRenderingContext2D) => {
        ctx.font = '600 16px "Inter", sans-serif';

        activeSteps.slice(0, activeStepIdx + 1).forEach((step, idx) => {
            const startY = 50 + idx * 115;

            // Highlight Box for Active Step
            if (idx === activeStepIdx) {
                ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(20, startY - 25, 740, 100, 14);
                ctx.fill();
                ctx.stroke();
            }

            // Step Header Title
            ctx.fillStyle = idx === activeStepIdx ? '#818cf8' : '#94a3b8';
            ctx.font = '700 13px "Inter", sans-serif';
            ctx.fillText(step.title, 35, startY - 5);

            // Step Formula / Derived Text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 17px "KaTeX_Main", "Courier New", monospace';
            
            // Format text cleanly if it overflows
            const formulaText = step.latexOrFormula;
            if (formulaText.length > 70) {
                ctx.fillText(formulaText.slice(0, 70), 35, startY + 22);
                ctx.fillText(formulaText.slice(70, 140), 35, startY + 45);
            } else {
                ctx.fillText(formulaText, 35, startY + 28);
            }
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

    const handleNextStep = () => {
        if (activeStepIdx < activeSteps.length - 1) {
            const nextIdx = activeStepIdx + 1;
            setActiveStepIdx(nextIdx);
            speakExplanation(activeSteps[nextIdx].explanation);
        }
    };

    const handlePrevStep = () => {
        if (activeStepIdx > 0) {
            const prevIdx = activeStepIdx - 1;
            setActiveStepIdx(prevIdx);
            speakExplanation(activeSteps[prevIdx].explanation);
        }
    };

    const handleSelectStep = (idx: number) => {
        setActiveStepIdx(idx);
        speakExplanation(activeSteps[idx].explanation);
    };

    // Canvas Drawing & True Pixel Eraser Handlers
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

        ctx.save();
        ctx.scale(2 * zoomLevel, 2 * zoomLevel);
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
            // True Pixel Eraser
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

    // Mouse Wheel Vertical Scroll Handler
    const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setScrollY(prev => Math.max(0, Math.min((activeSteps.length - 1) * 115 + 400, prev + e.deltaY * 0.6)));
    };

    // Clear Canvas Action
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
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-5 animate-in fade-in duration-200 select-none">
            
            {/* Header Control Panel */}
            <div className="flex flex-wrap items-center justify-between bg-[#0B0915]/95 border border-white/10 rounded-3xl px-4 py-2.5 shadow-2xl gap-3">
                
                {/* Title & Mode Switcher Badges */}
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 shrink-0">
                        <Sparkles size={18} className="animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-black text-white tracking-wide flex items-center gap-2">
                            <span>{initialTitle}</span>
                            
                            {boardMode === 'ai_solution' ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] uppercase font-bold tracking-wider">
                                    Step {activeStepIdx + 1}/{activeSteps.length}
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] uppercase font-bold tracking-wider">
                                    ✏️ Clean Writing Slate
                                </span>
                            )}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-medium truncate max-w-xs sm:max-w-md">
                            {boardMode === 'ai_solution' ? currentStep?.title : 'Student Freehand Blackboard — Write & Calculate Freehand'}
                        </p>
                    </div>
                </div>

                {/* Main Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                    
                    {/* Board Mode Selector Toggle */}
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                        <button
                            onClick={resetToAISolutionMode}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 ${
                                boardMode === 'ai_solution'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Layout size={12} /> AI Solution Mode
                        </button>

                        <button
                            onClick={clearCanvasToCleanSlate}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 ${
                                boardMode === 'blank_slate'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <PenTool size={12} /> Clean Slate Write
                        </button>
                    </div>

                    {/* Pen Size Selector */}
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                        {[
                            { label: '0.5mm', size: 1 },
                            { label: '1.5mm', size: 2.5 },
                            { label: '3.0mm', size: 4.5 }
                        ].map(t => (
                            <button
                                key={t.label}
                                onClick={() => {
                                    setPenThickness(t.size);
                                    setTool('pen');
                                }}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
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
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10">
                        {colors.map(c => (
                            <button
                                key={c}
                                onClick={() => {
                                    setColor(c);
                                    setTool('pen');
                                }}
                                style={{ backgroundColor: c }}
                                className={`w-4 h-4 rounded-full transition-transform ${
                                    color === c && tool === 'pen' ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Eraser Tool Button */}
                    <button
                        onClick={() => setTool('eraser')}
                        className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            tool === 'eraser'
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                                : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                    >
                        <Eraser size={14} /> Eraser
                    </button>

                    {/* Voice Explanation Toggle */}
                    <button
                        onClick={() => {
                            setIsVoiceEnabled(!isVoiceEnabled);
                            if (!isVoiceEnabled && currentStep) {
                                speakExplanation(currentStep.explanation);
                            } else {
                                window.speechSynthesis?.cancel();
                            }
                        }}
                        className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isVoiceEnabled
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md'
                                : 'bg-white/5 text-gray-500'
                        }`}
                    >
                        {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                        <span>Voice Explain</span>
                    </button>

                    {/* Vertical Scroll Up / Down Controls */}
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                        <button
                            onClick={() => setScrollY(prev => Math.max(0, prev - 115))}
                            className="p-1.5 text-gray-400 hover:text-white rounded-xl"
                            title="Scroll Board Up"
                        >
                            <ChevronUp size={14} />
                        </button>
                        <button
                            onClick={() => setScrollY(prev => prev + 115)}
                            className="p-1.5 text-gray-400 hover:text-white rounded-xl"
                            title="Scroll Board Down"
                        >
                            <ChevronDown size={14} />
                        </button>
                    </div>

                    {/* Zoom In/Out */}
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                        <button
                            onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
                            className="p-1.5 text-gray-400 hover:text-white rounded-xl"
                        >
                            <ZoomOut size={14} />
                        </button>
                        <span className="text-[10px] font-bold text-gray-300 px-1">{Math.round(zoomLevel * 100)}%</span>
                        <button
                            onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.25))}
                            className="p-1.5 text-gray-400 hover:text-white rounded-xl"
                        >
                            <ZoomIn size={14} />
                        </button>
                    </div>

                    {/* Clear Board Button */}
                    <button
                        onClick={clearCanvasToCleanSlate}
                        className="px-3 py-1.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
                        title="Clear board to clean slate for freehand writing"
                    >
                        <RotateCcw size={14} /> Clear to Clean Slate
                    </button>

                    {/* Export PNG */}
                    <button
                        onClick={exportPNG}
                        className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md border border-indigo-400/30"
                    >
                        <Download size={14} /> Export PNG
                    </button>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all ml-1"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Smart Canvas Scratchpad Container */}
            <div 
                onWheel={handleWheelScroll}
                className="relative flex-1 my-3 bg-[#0B0917] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
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
                    <div className="absolute bottom-4 left-4 right-4 bg-[#0B0915]/95 border border-indigo-500/30 rounded-2xl p-4 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                        
                        {/* Voice Script & Step Title */}
                        <div className="flex items-center gap-3 min-w-0 w-full md:w-auto">
                            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
                                <Volume2 size={16} className="animate-pulse" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">
                                        AI Teacher Step Explanation
                                    </span>
                                </div>
                                <p className="text-xs font-medium text-gray-200 leading-relaxed truncate md:whitespace-normal">
                                    "{currentStep.explanation}"
                                </p>
                            </div>
                        </div>

                        {/* Step Navigation Pill Selector & Previous / Next Step Buttons */}
                        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end w-full md:w-auto">
                            
                            {/* Clickable Step Pills */}
                            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
                                {activeSteps.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectStep(idx)}
                                        className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all ${
                                            activeStepIdx === idx
                                                ? 'bg-indigo-600 text-white shadow-md font-black scale-110'
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
                                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 text-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                            >
                                <SkipBack size={14} />
                                <span>Prev</span>
                            </button>

                            {/* Next Step Button */}
                            <button
                                onClick={handleNextStep}
                                disabled={activeStepIdx >= activeSteps.length - 1}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                            >
                                <span>Next Step</span>
                                <SkipForward size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MinervaWhiteboardCanvas;
