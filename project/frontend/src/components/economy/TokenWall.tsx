import React, { useState, useEffect } from 'react';
import { X, Play, Zap, Sparkles, BatteryCharging, ChevronRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TokenWallProps {
    isOpen: boolean;
    onClose: () => void;
    onActionComplete: () => void;
}

const TokenWall: React.FC<TokenWallProps> = ({ isOpen, onClose, onActionComplete }) => {
    const { user, setTokenBalance } = useAuth();
    const navigate = useNavigate();

    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [adConfig, setAdConfig] = useState<{ adUrl: string; rewardTokens: number }>({
        adUrl: 'https://google.com/adsense',
        rewardTokens: 50
    });
    const [adProgress, setAdProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            fetchStatus();
        }
    }, [isOpen]);

    const fetchStatus = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/economy/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.settings) {
                setAdConfig(data.settings);
            }
        } catch (e) { }
    };

    if (!isOpen) return null;

    const handleWatchAd = async () => {
        setIsWatchingAd(true);
        setAdProgress(0);
        setError(null);

        // Open Ad Link
        const adWindow = window.open(adConfig.adUrl, '_blank');
        if (!adWindow) {
            setError("Popup blocked! Please allow popups to earn energy.");
            setIsWatchingAd(false);
            return;
        }

        const interval = setInterval(() => {
            setAdProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    completeAd();
                    return 100;
                }
                return prev + 5;
            });
        }, 400); // ~8 seconds total
    };

    const completeAd = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/economy/reward-ad', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTokenBalance(data.newBalance);
                setIsWatchingAd(false);
                onActionComplete();
            } else {
                setError("Ad verification failed. Please try again.");
                setIsWatchingAd(false);
            }
        } catch (e) {
            setError("Connection lost. Credits not synced.");
            setIsWatchingAd(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[50px] bg-[#0A0A0A] border border-white/10 shadow-6xl">
                {/* 🌈 Top Glow Strip */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse" />

                <div className="p-10">
                    <div className="flex justify-between items-start mb-10">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                {isWatchingAd ? <Zap size={12} className="animate-bounce" /> : <BatteryCharging size={12} />}
                                {isWatchingAd ? 'Processing Sync' : 'Recharge Protocol'}
                            </div>
                            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Energy Wall</h2>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-all active:scale-95 group">
                            <X className="w-6 h-6 text-gray-600 group-hover:text-white" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {isWatchingAd ? (
                        <div className="py-16 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * adProgress) / 100} className="text-indigo-500 transition-all duration-300" />
                                </svg>
                                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white animate-pulse" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Allocating Credits</h3>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Syncing +{adConfig.rewardTokens} Building Tokens</p>
                                <div className="mt-4 text-[9px] text-indigo-400/50 font-black uppercase tracking-[0.2em]">Keep the ad window active</div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Option 1: Watch Ad */}
                            <button
                                onClick={handleWatchAd}
                                className="group w-full p-8 rounded-[35px] bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/[0.08] transition-all text-left flex items-center justify-between shadow-inner relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="p-5 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                                        <Play size={24} className="text-white fill-current" />
                                    </div>
                                    <div>
                                        <span className="block text-xl font-black text-white italic uppercase tracking-tighter leading-none">Watch Ad Sponsor</span>
                                        <span className="block text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-2">{adConfig.rewardTokens} Tokens Instantly</span>
                                    </div>
                                </div>
                                <ChevronRight className="text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all relative z-10" />
                            </button>

                            {/* Option 2: Pricing */}
                            <button
                                onClick={() => { onClose(); navigate('/pricing'); }}
                                className="group w-full p-8 rounded-[35px] bg-white border border-transparent hover:bg-gray-100 transition-all text-left flex items-center justify-between shadow-2xl"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="p-5 rounded-2xl bg-black shadow-2xl shadow-black/20 group-hover:scale-110 transition-transform">
                                        <Sparkles size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <span className="block text-xl font-black text-black italic uppercase tracking-tighter leading-none">Elite Upgrade</span>
                                        <span className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2 italic">Unlimited Power • Zero Ads</span>
                                    </div>
                                </div>
                                <Zap size={20} className="text-indigo-600 animate-pulse" />
                            </button>

                            <div className="pt-10 flex flex-col items-center gap-3">
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest italic flex items-center gap-2">
                                    <ShieldCheck size={14} /> Neural Connection Verified
                                </span>
                                <div className="text-[9px] text-gray-800 font-bold uppercase tracking-[0.2em] mt-2">
                                    Current Balance: <span className="text-indigo-400">{user?.tokenBalance?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TokenWall;
