import React, { useRef, useState, useEffect } from 'react';
import { Pen, Eraser, RotateCcw, Download, Sparkles, X } from 'lucide-react';

interface MinervaWhiteboardCanvasProps {
    isOpen: boolean;
    onClose: () => void;
    initialTitle?: string;
}

export const MinervaWhiteboardCanvas: React.FC<MinervaWhiteboardCanvasProps> = ({
    isOpen,
    onClose,
    initialTitle = 'Live Math & Physics Whiteboard'
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#6366f1'); // Default Indigo
    const [brushSize] = useState(3);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [stepTitle] = useState('Step 1: Freeform Diagram & Equation Scratchpad');

    useEffect(() => {
        if (!isOpen) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set high DPI canvas resolution
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        // Fill dark mathematical grid background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 30;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
        ctx.lineWidth = tool === 'eraser' ? brushSize * 4 : brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Redraw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 30;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `minerva_whiteboard_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex flex-col justify-between p-4 animate-in fade-in duration-200">
            {/* Header Controls */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-white/10 rounded-2xl px-6 py-3 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">{initialTitle}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">{stepTitle}</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTool('pen')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            tool === 'pen'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                    >
                        <Pen size={14} /> Pen
                    </button>

                    <button
                        onClick={() => setTool('eraser')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            tool === 'eraser'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                    >
                        <Eraser size={14} /> Eraser
                    </button>

                    {/* Color palette */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                        {['#6366f1', '#38bdf8', '#4ade80', '#f43f5e', '#fbbf24', '#ffffff'].map(c => (
                            <button
                                key={c}
                                onClick={() => {
                                    setColor(c);
                                    setTool('pen');
                                }}
                                style={{ backgroundColor: c }}
                                className={`w-4 h-4 rounded-full transition-transform ${
                                    color === c && tool === 'pen' ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={clearCanvas}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-gray-400 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                        <RotateCcw size={14} /> Clear
                    </button>

                    <button
                        onClick={downloadCanvas}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-gray-400 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                        <Download size={14} /> Export
                    </button>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all ml-2"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Canvas Scratchpad Area */}
            <div className="relative flex-1 my-3 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full cursor-crosshair touch-none"
                />
            </div>
        </div>
    );
};
export default MinervaWhiteboardCanvas;
