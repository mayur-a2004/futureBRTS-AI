import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const FutureBrtsLogo: React.FC = () => {
    const [animationState, setAnimationState] = useState<'searching' | 'walking' | 'opening' | 'relaxing'>('searching');

    useEffect(() => {
        const runCycle = () => {
            // Step 1: Searching outside F (0 to 2 seconds)
            setAnimationState('searching');

            // Step 2: Walking through FUTURE and BRT (2 to 7 seconds)
            const walkTimer = setTimeout(() => {
                setAnimationState('walking');

                // Step 3: Reaching 'S' and opening door (7 to 8.5 seconds)
                const openTimer = setTimeout(() => {
                    setAnimationState('opening');

                    // Step 4: Stepping out and relaxing (8.5 to 11.5 seconds)
                    const relaxTimer = setTimeout(() => {
                        setAnimationState('relaxing');
                    }, 1500);

                    return () => clearTimeout(relaxTimer);
                }, 5000);

                return () => clearTimeout(openTimer);
            }, 2000);

            return () => clearTimeout(walkTimer);
        };

        runCycle();
        const interval = setInterval(runCycle, 12000); // 12 seconds loop

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="relative inline-flex items-center select-none w-full" style={{ height: '85px', maxWidth: '640px' }}>
            <svg viewBox="0 0 540 90" className="w-full h-full overflow-visible">
                <defs>
                    {/* Glowing filter for neon effect */}
                    <filter id="portal-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    
                    {/* Gradient for BRT */}
                    <linearGradient id="brt-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>

                    {/* Gradient for S Door */}
                    <linearGradient id="s-portal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                </defs>

                {/* --- 1. FUTURE Text (White) --- */}
                <g className="font-black italic uppercase tracking-tighter text-white select-none">
                    <text x="15" y="70" fill="#ffffff" fontSize="62" fontWeight="950" fontStyle="italic" letterSpacing="-2" className="drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]">
                        FUTURE
                    </text>
                    {/* Trademark superscript */}
                    <text x="278" y="24" fill="#6366f1" fontSize="12" fontWeight="bold" fontStyle="normal" opacity="0.6">TM</text>
                </g>

                {/* --- 2. BRT Text (Gradient) --- */}
                <g className="font-black italic uppercase tracking-tighter select-none">
                    <text x="310" y="70" fill="url(#brt-gradient)" fontSize="62" fontWeight="950" fontStyle="italic" letterSpacing="-2" className="drop-shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                        BRT
                    </text>
                </g>

                {/* --- 3. S Portal Base (Behind) --- */}
                <g transform="translate(440, 0)">
                    <text x="0" y="70" fill="#1e1b4b" fontSize="62" fontWeight="950" fontStyle="italic" opacity="0.3">
                        S
                    </text>
                    {/* Ring ping when door is open */}
                    {animationState === 'opening' && (
                        <circle cx="20" cy="42" r="30" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.5" className="animate-ping" />
                    )}
                </g>

                {/* --- 4. The Animated Character --- */}
                {/* STATE A: SEARCHING OUTSIDE F */}
                {animationState === 'searching' && (
                    <motion.g
                        initial={{ x: -10, y: 44, opacity: 0 }}
                        animate={{ x: 8, y: 44, opacity: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        {/* Head bobbing left and right searching */}
                        <motion.circle 
                            cx="0" cy="-12" r="4.5" fill="#ffffff" filter="url(#portal-glow)"
                            animate={{ x: [-2, 2, -2], y: [-12, -11, -12] }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        {/* Torso leaning */}
                        <line x1="0" y1="-8" x2="0" y2="4" stroke="#ffffff" strokeWidth="2.5" filter="url(#portal-glow)" />
                        {/* Arms raised in searching pose */}
                        <motion.line 
                            x1="0" y1="-5" x2="-6" y2="-10" stroke="#ffffff" strokeWidth="2" filter="url(#portal-glow)"
                            animate={{ y2: [-10, -8, -10] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.line 
                            x1="0" y1="-5" x2="6" y2="-10" stroke="#ffffff" strokeWidth="2" filter="url(#portal-glow)"
                            animate={{ y2: [-8, -10, -8] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        {/* Legs standing */}
                        <line x1="0" y1="4" x2="-4" y2="13" stroke="#ffffff" strokeWidth="2.5" filter="url(#portal-glow)" />
                        <line x1="0" y1="4" x2="4" y2="13" stroke="#ffffff" strokeWidth="2.5" filter="url(#portal-glow)" />
                    </motion.g>
                )}

                {/* STATE B: WALKING THROUGH FUTURE AND BRT */}
                {animationState === 'walking' && (
                    <motion.g
                        initial={{ x: 8, y: 44 }}
                        animate={{ x: 436, y: 44 }}
                        transition={{ duration: 5, ease: 'linear' }}
                    >
                        {/* Head */}
                        <motion.circle 
                            cx="0" cy="-12" r="4.5" fill="#ffffff" filter="url(#portal-glow)"
                            animate={{ y: [-12, -15, -12] }}
                            transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
                        />
                        {/* Torso */}
                        <line x1="0" y1="-8" x2="0" y2="4" stroke="#ffffff" strokeWidth="2.5" filter="url(#portal-glow)" />
                        {/* Walking legs */}
                        <motion.line 
                            x1="0" y1="4" x2="-5" y2="13" stroke="#ffffff" strokeWidth="2.5" filter="url(#portal-glow)"
                            animate={{ x2: [-5, 5, -5], y2: [13, 11, 13] }}
                            transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
                        />
                        <motion.line 
                            x1="0" y1="4" x2="5" y2="13" stroke="#ffffff" strokeWidth="2.5" filter="url(#portal-glow)"
                            animate={{ x2: [5, -5, 5], y2: [11, 13, 11] }}
                            transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
                        />
                        {/* Swinging arms */}
                        <motion.line 
                            x1="0" y1="-5" x2="-4" y2="2" stroke="#ffffff" strokeWidth="2" filter="url(#portal-glow)"
                            animate={{ x2: [-4, 4, -4], y2: [2, 0, 2] }}
                            transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
                        />
                        <motion.line 
                            x1="0" y1="-5" x2="4" y2="2" stroke="#ffffff" strokeWidth="2" filter="url(#portal-glow)"
                            animate={{ x2: [4, -4, 4], y2: [0, 2, 0] }}
                            transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
                        />
                    </motion.g>
                )}

                {/* STATE C: S PORTAL GATE OPENING */}
                {animationState === 'opening' && (
                    <motion.g
                        initial={{ x: 436, y: 44, opacity: 1 }}
                        animate={{ x: 456, y: 44, opacity: 0.9 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    >
                        {/* Entering the portal gate */}
                        <circle cx="0" cy="-12" r="4.5" fill="#22d3ee" filter="url(#portal-glow)" />
                        <line x1="0" y1="-8" x2="0" y2="4" stroke="#22d3ee" strokeWidth="2.5" filter="url(#portal-glow)" />
                        <line x1="0" y1="4" x2="-3" y2="13" stroke="#22d3ee" strokeWidth="2.5" filter="url(#portal-glow)" />
                        <line x1="0" y1="4" x2="3" y2="13" stroke="#22d3ee" strokeWidth="2.5" filter="url(#portal-glow)" />
                    </motion.g>
                )}

                {/* STATE D: STEPPING OUT AND SITTING TO RELAX (SUKOON LENA) */}
                {animationState === 'relaxing' && (
                    <g transform="translate(485, 44)">
                        {/* Wave of Sukoon (Expanding circle rings) */}
                        <motion.circle 
                            cx="0" cy="8" r="5" fill="none" stroke="#22d3ee" strokeWidth="1"
                            initial={{ scale: 1, opacity: 0.8 }}
                            animate={{ scale: 6, opacity: 0 }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                        />
                        <motion.circle 
                            cx="0" cy="8" r="5" fill="none" stroke="#a855f7" strokeWidth="0.8"
                            initial={{ scale: 1, opacity: 0.8 }}
                            animate={{ scale: 8, opacity: 0 }}
                            transition={{ duration: 2.2, delay: 0.8, repeat: Infinity, ease: 'easeOut' }}
                        />

                        {/* Twinkling mini stars above */}
                        <motion.path 
                            d="M 12,-20 L 14,-17 L 17,-16 L 14,-15 L 12,-12 L 10,-15 L 7,-16 L 10,-17 Z" fill="#22d3ee" filter="url(#portal-glow)"
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.path 
                            d="M -12,-25 L -10,-22 L -7,-21 L -10,-20 L -12,-17 L -14,-20 L -17,-21 L -14,-22 Z" fill="#a855f7" filter="url(#portal-glow)"
                            animate={{ opacity: [1, 0.3, 1], scale: [1.2, 0.8, 1.2] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                        />

                        {/* Seated relaxed figure path */}
                        <motion.g
                            initial={{ opacity: 0, scale: 0.6, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            {/* Head resting back */}
                            <circle cx="0" cy="-6" r="4.5" fill="#22d3ee" filter="url(#portal-glow)" />
                            {/* Torso leaning back slightly */}
                            <line x1="0" y1="-2" x2="-4" y2="8" stroke="#22d3ee" strokeWidth="2.5" filter="url(#portal-glow)" />
                            {/* Legs bent in seated rest pose */}
                            <line x1="-4" y1="8" x2="6" y2="8" stroke="#22d3ee" strokeWidth="2.5" filter="url(#portal-glow)" />
                            <line x1="6" y1="8" x2="10" y2="13" stroke="#22d3ee" strokeWidth="2.5" filter="url(#portal-glow)" />
                            {/* Arms relaxed in lap */}
                            <line x1="-2" y1="1" x2="2" y2="6" stroke="#22d3ee" strokeWidth="2" filter="url(#portal-glow)" />
                        </motion.g>
                    </g>
                )}

                {/* --- 5. S Portal Door (Swinging Open) --- */}
                <g transform="translate(440, 0)">
                    <motion.g
                        style={{ originX: '18px', originY: '42px' }}
                        animate={
                            animationState === 'opening'
                                ? { rotateY: -85, opacity: 0.75, scaleX: 0.35, x: -10 }
                                : { rotateY: 0, opacity: 1, scaleX: 1, x: 0 }
                        }
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <text x="0" y="70" fill="url(#s-portal-grad)" fontSize="62" fontWeight="950" fontStyle="italic" filter="url(#portal-glow)">
                            S
                        </text>
                    </motion.g>
                </g>
            </svg>
        </div>
    );
};
