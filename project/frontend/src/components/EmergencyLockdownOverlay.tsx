import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, RefreshCw, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EmergencyLockdownOverlay: React.FC = () => {
    const { user } = useAuth() as any;
    const [isLockdown, setIsLockdown] = useState(false);
    const [reason, setReason] = useState('Emergency Security Protocol Activated by Administrator');
    const [checking, setChecking] = useState(false);

    const checkStatus = async () => {
        try {
            setChecking(true);
            const res = await fetch('/api/landing/lockdown-status');
            const data = await res.json();
            if (data.success) {
                setIsLockdown(data.emergencyLockdown);
                if (data.reason) setReason(data.reason);
            }
        } catch (e) {
            console.error('[LockdownOverlay] Check failed:', e);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 4000);
        return () => clearInterval(interval);
    }, []);

    // 🛡️ Admin users bypass the lockdown overlay so they can access /admin/dashboard & turn it off!
    if (!isLockdown || user?.role === 'admin') {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-[#050508] flex flex-col items-center justify-center p-6 text-center overflow-hidden font-sans selection:bg-rose-500/30"
            >
                {/* Background Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
                
                {/* Siren Container */}
                <motion.div
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="relative z-10 max-w-xl w-full bg-black/60 border border-rose-500/30 backdrop-blur-2xl p-8 md:p-12 rounded-[40px] shadow-2xl shadow-rose-950/80 flex flex-col items-center space-y-6"
                >
                    <div className="w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center relative shadow-inner">
                        <div className="absolute inset-0 bg-rose-500/20 rounded-3xl blur-xl animate-ping" />
                        <ShieldAlert size={48} className="text-rose-500 relative z-10" />
                    </div>

                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-black text-[10px] uppercase tracking-[0.3em]">
                            🚨 System Emergency Protocol
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight">
                            Website Security Lockdown Active
                        </h1>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            {reason}
                        </p>
                    </div>

                    <div className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-2 font-mono text-[11px]">
                            <Lock size={14} className="text-rose-400" /> Security Status: Isolated
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <RefreshCw size={12} className={checking ? "animate-spin text-rose-400" : "text-gray-600"} /> Auto-Checking (4s)
                        </span>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            onClick={checkStatus}
                            className="flex-1 py-3.5 px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} className={checking ? "animate-spin" : ""} /> Retry Connection
                        </button>
                        <a
                            href="/auth/login"
                            className="flex-1 py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
                        >
                            Admin Override Login
                        </a>
                    </div>
                </motion.div>

                {/* Footer Security Watermark */}
                <div className="absolute bottom-6 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
                    Future BRTS • 7-Layer WAF Security Sentinel Override
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
