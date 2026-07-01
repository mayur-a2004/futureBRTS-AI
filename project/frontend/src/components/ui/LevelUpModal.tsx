import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, X } from 'lucide-react';

interface LevelUpModalProps {
    isOpen: boolean;
    level: number;
    xpGained?: number;
    onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
    isOpen,
    level,
    xpGained,
    onClose
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Dark Blur Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Glowing Light Beacons */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-[#05040a] border border-indigo-500/30 rounded-[40px] p-8 text-center shadow-3xl overflow-hidden backdrop-blur-2xl"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-full transition-all"
                        >
                            <X size={14} />
                        </button>

                        {/* Animated Sparkles Background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02)_1px,_transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

                        {/* Celebration Icons */}
                        <div className="relative flex justify-center mb-6 mt-4">
                            <motion.div
                                initial={{ rotate: -15, scale: 0.8 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] text-white shadow-lg shadow-indigo-500/30 relative z-10"
                            >
                                <Trophy size={40} className="animate-bounce" />
                            </motion.div>
                            
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0 flex items-center justify-center text-yellow-500 opacity-20 pointer-events-none scale-[2.2]"
                            >
                                <Sparkles size={60} />
                            </motion.div>
                        </div>

                        {/* Text Announcements */}
                        <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Level Up!</h2>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white mb-2">
                            LEVEL {level} REACHED
                        </h1>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6">
                            Awesome job! You have gained {xpGained ? `+${xpGained} XP` : 'XP'} and progressed to the next academic level. Your verified certificate has been updated.
                        </p>

                        {/* Level stats mini grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                            <div>
                                <span className="text-[9px] font-black text-gray-500 block uppercase tracking-wider mb-0.5">NEW TITLE</span>
                                <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wide">Scholar V{level}</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-gray-500 block uppercase tracking-wider mb-0.5">BADGE UNLOCKED</span>
                                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide">🎓 LEVEL {level}</span>
                            </div>
                        </div>

                        {/* Continue Action */}
                        <button
                            onClick={onClose}
                            className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest active:scale-[0.98]"
                        >
                            Continue Learning
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpModal;
