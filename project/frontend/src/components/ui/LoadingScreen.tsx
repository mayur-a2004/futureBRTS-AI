import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Rocket } from "lucide-react";

const phrases = [
    "INITIALIZING CORE SYSTEMS...",
    "SYNCING NEURAL PATHWAYS...",
    "RETRIEVING STRATEGIC DATA...",
    "ARCHITECTING ROADMAP...",
    "OPTIMIZING INTELLIGENCE...",
    "PREPARING MISSION CONTROL..."
];

export default function LoadingScreen() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % phrases.length);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100000] bg-[#030304] flex flex-col items-center justify-center font-sans overflow-hidden">
            {/* 🌌 UNIVERSAL BACKGROUND SYNC */}
            <div className="absolute inset-0 bg-[url('/universe-bg.jpg')] bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/[0.02] to-transparent pointer-events-none" />

            {/* 📟 HUD DECORATIONS */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 mix-blend-screen hidden md:block">
                <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-[#ffffff]/10" />
                <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-[#ffffff]/10" />
                <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-[#ffffff]/10" />
                <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-[#ffffff]/10" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[500px] h-[500px] md:w-[800px] md:h-[800px] bg-[#6366f1]/5 rounded-full blur-[120px] md:blur-[200px] animate-pulse" />
            </div>

            <div className="relative mb-16 md:mb-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute -inset-6 md:-inset-10 border-2 border-dashed border-[#6366f1]/30 rounded-full" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute -inset-12 md:-inset-20 border border-[#ffffff]/10 rounded-full" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl md:rounded-[3rem] bg-[#0d0d14] border-2 border-[#6366f1]/60 flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.3)]">
                    <Rocket size={60} className="text-[#ffffff] -rotate-12" />
                </div>
            </div>

            <div className="mb-10 lg:mb-12 z-10 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-[1000] italic tracking-tighter uppercase text-[#ffffff] mb-4 drop-shadow-2xl"
                >
                    ANTIGRAVITY
                </motion.h1>

                <div className="h-6 flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={index}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="text-[#818cf8] font-black text-[10px] md:text-xs tracking-[0.5em] md:tracking-[0.8em] uppercase"
                        >
                            {phrases[index]}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex gap-2 h-1 z-10">
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <motion.div key={i} animate={{ opacity: [0.1, 1, 0.1], scaleY: [1, 2, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15, ease: "easeInOut" }} className="w-1 md:w-1.5 rounded-full bg-[#6366f1]" />
                ))}
            </div>
        </div>
    );
}
