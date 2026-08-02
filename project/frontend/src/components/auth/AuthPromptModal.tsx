import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Lock, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  title = "Unlock Full AI Access & Save Progress",
  subtitle = "Register your free account in 5 seconds to save chats, unlock 5,000 bonus tokens & access Live Quiz Battles!"
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg p-6 md:p-8 rounded-3xl bg-gradient-to-b from-zinc-900 via-[#0a0c16] to-black border border-indigo-500/30 shadow-2xl overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Icon Badge */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-600 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Header Title */}
          <div className="text-center space-y-2 mb-6">
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-xs font-bold text-gray-200">5,000 Free AI Tokens</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-xs font-bold text-gray-200">Permanent Chat Sync</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="text-xs font-bold text-gray-200">Live Quiz Battles</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="text-xs font-bold text-gray-200">Full Builder Access</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/auth/register')}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Create Free Account (5 sec)</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate('/auth/login')}
              className="w-full py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer border border-white/10"
            >
              Already have an account? Sign In
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthPromptModal;
