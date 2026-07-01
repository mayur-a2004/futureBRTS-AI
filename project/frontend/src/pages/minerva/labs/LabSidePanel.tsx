import React, { useState, useEffect, useRef } from 'react';
import { LabConfig, SUBJECT_COLORS, SUBJECT_ICONS } from './types/LabConfig';
import { X, ExternalLink } from 'lucide-react';

interface LabSidePanelProps {
  labConfig: LabConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onDetach: () => void;
  isDetached: boolean;
  children: React.ReactNode;
}

export const LabSidePanel: React.FC<LabSidePanelProps> = ({
  labConfig,
  isOpen,
  onClose,
  onDetach,
  isDetached,
  children,
}) => {
  const [pos, setPos] = useState({ x: window.innerWidth - 450, y: 100 });
  const size = { w: 420, h: 560 };
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Center it initially when detached
    if (isDetached) {
      setPos({
        x: Math.max(50, window.innerWidth - size.w - 50),
        y: 100,
      });
    }
  }, [isDetached]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDetached) return;
    // Don't drag if clicking buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('input')) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const nextX = Math.max(0, Math.min(window.innerWidth - size.w, e.clientX - dragStartRef.current.x));
      const nextY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragStartRef.current.y));
      setPos({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, size.w]);

  if (!isOpen || !labConfig) return null;

  const subject = labConfig.subject;
  const colors = SUBJECT_COLORS[subject] || SUBJECT_COLORS.mathematics;
  const icon = SUBJECT_ICONS[subject] || '🧪';

  // Detached/Floating Layout
  if (isDetached) {
    return (
      <div
        className="fixed z-[9999] flex flex-col bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl transition-shadow duration-300"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${size.w}px`,
          height: isMinimized ? '54px' : `${size.h}px`,
          boxShadow: isDragging
            ? '0 25px 50px -12px rgba(99, 102, 241, 0.4)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header Bar / Handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`px-4 py-3 bg-gradient-to-r ${colors.gradient} border-b ${colors.border} flex items-center justify-between cursor-move select-none`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div className="flex flex-col">
              <span className="text-zinc-100 text-xs font-bold tracking-wide uppercase">
                {subject} Lab
              </span>
              <span className="text-zinc-300 text-[10px] truncate max-w-[200px]">
                {labConfig.topic}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-zinc-800/40 rounded text-zinc-400 hover:text-zinc-200 text-xs"
              title="Minimize/Maximize"
            >
              {isMinimized ? '🔼' : '🔽'}
            </button>
            <button
              onClick={onDetach}
              className="p-1 hover:bg-zinc-800/40 rounded text-zinc-400 hover:text-zinc-200"
              title="Dock Back to Side"
            >
              📥
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-red-500/20 rounded text-zinc-400 hover:text-red-400"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {children}
          </div>
        )}
      </div>
    );
  }

  // Side Panel Layout (Standard Docked Mode)
  return (
    <div className="fixed top-0 right-0 h-full w-[400px] bg-zinc-950/95 border-l border-zinc-800 z-[40] flex flex-col shadow-2xl backdrop-blur-md animate-[slideIn_0.3s_ease-out]">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Panel Header */}
      <div className={`px-4 py-4 bg-gradient-to-r ${colors.gradient} border-b ${colors.border} flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-900/60 border border-zinc-700/30 flex items-center justify-center text-xl">
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-100 text-xs font-extrabold tracking-wider uppercase">
              {subject} Virtual Lab
            </span>
            <span className="text-zinc-300 text-[10px] font-medium max-w-[200px] truncate">
              {labConfig.topic}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onDetach}
            className="p-1.5 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 border border-zinc-700/30 transition-all duration-200"
            title="Detach into Floating Window"
          >
            <ExternalLink size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 bg-zinc-800/50 hover:bg-red-500/20 rounded-lg text-zinc-400 hover:text-red-400 border border-zinc-700/30 transition-all duration-200"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Sensitive warning for reproductive/mitosis topics */}
      {labConfig.sensitivity_level > 0 && (
        <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-[10px] flex items-center gap-2">
          <span>⚠️</span>
          <span>NCERT Textbook Reference: Clinical & Standardized diagrams only. 3D mode restricted.</span>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
};
