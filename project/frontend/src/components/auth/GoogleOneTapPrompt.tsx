import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, Zap, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleOneTapPrompt: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [showFallbackBanner, setShowFallbackBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // If already logged in, do nothing
    if (isAuthenticated) return;

    // Load Google GSI Client Script dynamically
    const scriptId = 'google-gsi-client-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeOneTap = () => {
      if (window.google?.accounts?.id) {
        const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '1058293750192-example.apps.googleusercontent.com';
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleOneTapCallback,
          auto_select: false,
          cancel_on_tap_outside: false
        });

        // Prompt Google One-Tap UI
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log("One-tap notification not displayed/skipped, showing fallback prompt");
            setShowFallbackBanner(true);
          }
        });
      } else {
        setShowFallbackBanner(true);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeOneTap;
      script.onerror = () => setShowFallbackBanner(true);
      document.head.appendChild(script);
    } else {
      initializeOneTap();
    }
  }, [isAuthenticated]);

  const handleOneTapCallback = async (response: any) => {
    try {
      const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:7001';
      const res = await axios.post(`${API_URL}/api/auth/google-one-tap`, {
        credential: response.credential
      });

      if (res.data?.success && res.data?.token) {
        login(res.data.user, res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("One-tap login error:", err);
      setShowFallbackBanner(true);
    }
  };

  if (isAuthenticated || bannerDismissed) return null;

  return (
    <>
      {/* 🚀 Sleek High-Conversion Floating Banner (Top-Left / Mobile Bottom) */}
      {showFallbackBanner && (
        <div className="fixed top-4 left-4 z-[9999] max-w-sm w-full p-4 rounded-2xl bg-gradient-to-r from-zinc-950 via-indigo-950/90 to-purple-950/90 border border-indigo-500/40 shadow-2xl backdrop-blur-md animate-in slide-in-from-top duration-300">
          <button
            onClick={() => setBannerDismissed(true)}
            className="absolute top-2.5 right-2.5 p-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 p-0.5 flex-shrink-0 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>

            <div className="flex-1 space-y-1 pr-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">🎁 5,000 Free AI Tokens</span>
                <span className="text-[9px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded-full border border-rose-500/30">1-TAP SIGNUP</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-tight">
                Create account in 1-click to save your AI chats, projects & battle stats!
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => navigate('/auth/register')}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-indigo-600 to-rose-600 hover:opacity-90 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Instant Google Signup</span>
              <ArrowRight size={12} />
            </button>
            <button
              onClick={() => navigate('/auth/login')}
              className="py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs rounded-xl border border-white/10 cursor-pointer"
            >
              Log In
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleOneTapPrompt;
