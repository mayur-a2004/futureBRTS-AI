import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const BrtsAnimatedLogo: React.FC = () => {
    const [animationState, setAnimationState] = useState<'idle' | 'walking' | 'opening' | 'blasting'>('walking');

    useEffect(() => {
        const cycle = () => {
            setAnimationState('walking');
            
            // Walking takes 3.5 seconds
            const walkTimer = setTimeout(() => {
                setAnimationState('opening');
                
                // Door opening takes 0.8 seconds
                const openTimer = setTimeout(() => {
                    setAnimationState('blasting');
                    
                    // Blasting takes 2.5 seconds
                    const blastTimer = setTimeout(() => {
                        setAnimationState('idle');
                    }, 2500);
                    
                    return () => clearTimeout(blastTimer);
                }, 800);
                
                return () => clearTimeout(openTimer);
            }, 3500);

            return () => clearTimeout(walkTimer);
        };

        cycle();
        const interval = setInterval(cycle, 8500); // repeat every 8.5 seconds

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="relative inline-flex items-center select-none" style={{ height: '1.2em', width: '4.2em', minWidth: '180px', verticalAlign: 'middle' }}>
            {/* The SVG containing the letters BRT and the animated S portal */}
            <svg viewBox="0 0 250 90" className="w-full h-full font-black italic tracking-tighter uppercase overflow-visible">
                <defs>
                    {/* Glowing filter for neon effect */}
                    <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    
                    {/* Gradient for BRT */}
                    <linearGradient id="brt-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>

                    {/* Gradient for S Door */}
                    <linearGradient id="s-door-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                </defs>

                {/* Letters B, R, T */}
                <text x="5" y="70" fill="url(#brt-grad)" fontSize="72" fontWeight="900" fontStyle="italic" letterSpacing="-2">
                    BRT
                </text>

                {/* S-Frame / Portal Boundary */}
                <g transform="translate(150, 0)">
                    {/* S base shadow/back-plate */}
                    <text x="0" y="70" fill="#1e1b4b" fontSize="72" fontWeight="900" fontStyle="italic" opacity="0.35">
                        S
                    </text>

                    {/* Outer portal glow rings */}
                    {animationState === 'blasting' && (
                        <circle cx="25" cy="42" r="32" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.4" className="animate-ping" />
                    )}
                </g>

                {/* Walking human silhouette */}
                {animationState === 'walking' && (
                    <motion.g
                        initial={{ x: 10, y: 42, opacity: 0 }}
                        animate={{ x: 146, y: 42, opacity: [0, 1, 1, 0.8] }}
                        transition={{ duration: 3.5, ease: 'linear' }}
                    >
                        {/* Bobbing Head */}
                        <motion.circle 
                            cx="0" cy="-12" r="4.5" fill="#ffffff" 
                            filter="url(#neon-glow)"
                            animate={{ y: [-12, -15, -12] }}
                            transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                        />
                        {/* Torso */}
                        <line x1="0" y1="-8" x2="0" y2="4" stroke="#ffffff" strokeWidth="2.5" filter="url(#neon-glow)" />
                        {/* Walking Legs */}
                        <motion.line 
                            x1="0" y1="4" x2="-5" y2="13" stroke="#ffffff" strokeWidth="2.5" filter="url(#neon-glow)"
                            animate={{ x2: [-5, 5, -5], y2: [13, 11, 13] }}
                            transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                        />
                        <motion.line 
                            x1="0" y1="4" x2="5" y2="13" stroke="#ffffff" strokeWidth="2.5" filter="url(#neon-glow)"
                            animate={{ x2: [5, -5, 5], y2: [11, 13, 11] }}
                            transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                        />
                        {/* Arms swinging */}
                        <motion.line 
                            x1="0" y1="-5" x2="-4" y2="2" stroke="#ffffff" strokeWidth="2" filter="url(#neon-glow)"
                            animate={{ x2: [-4, 4, -4], y2: [2, 0, 2] }}
                            transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                        />
                        <motion.line 
                            x1="0" y1="-5" x2="4" y2="2" stroke="#ffffff" strokeWidth="2" filter="url(#neon-glow)"
                            animate={{ x2: [4, -4, 4], y2: [0, 2, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                        />
                    </motion.g>
                )}

                {/* S Letter Door (Swinging/Rotating Open) */}
                <g transform="translate(150, 0)">
                    <motion.g
                        style={{ originX: '18px', originY: '42px' }}
                        animate={
                            animationState === 'opening' || animationState === 'blasting'
                                ? { rotateY: -80, opacity: 0.8, scaleX: 0.35, x: -10 }
                                : { rotateY: 0, opacity: 1, scaleX: 1, x: 0 }
                        }
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                    >
                        <text x="0" y="70" fill="url(#s-door-grad)" fontSize="72" fontWeight="900" fontStyle="italic" filter="url(#neon-glow)">
                            S
                        </text>
                    </motion.g>
                </g>

                {/* Blast/Emerging Elements */}
                {animationState === 'blasting' && (
                    <g transform="translate(172, 42)">
                        {/* Particle A */}
                        <motion.circle cx="0" cy="0" r="3.5" fill="#22d3ee" filter="url(#neon-glow)"
                            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                            animate={{ x: 50, y: -30, scale: 2, opacity: 0 }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                        {/* Particle B */}
                        <motion.circle cx="0" cy="0" r="3" fill="#a855f7" filter="url(#neon-glow)"
                            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                            animate={{ x: 40, y: 30, scale: 1.8, opacity: 0 }}
                            transition={{ duration: 1.4, ease: 'easeOut' }}
                        />
                        {/* Particle C */}
                        <motion.circle cx="0" cy="0" r="4.5" fill="#38bdf8" filter="url(#neon-glow)"
                            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                            animate={{ x: 70, y: 0, scale: 2.2, opacity: 0 }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                        {/* Star Sparkle A */}
                        <motion.path d="M 0,-10 L 2.5,-2.5 L 10,0 L 2.5,2.5 L 0,10 L -2.5,2.5 L -10,0 L -2.5,-2.5 Z" fill="#ffffff" filter="url(#neon-glow)"
                            initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
                            animate={{ x: 60, y: -20, scale: 1.4, rotate: 180, opacity: 0 }}
                            transition={{ duration: 1.3, ease: 'easeOut' }}
                        />
                        {/* Star Sparkle B */}
                        <motion.path d="M 0,-8 L 2,-2 L 8,0 L 2,2 L 0,8 L -2,2 L -8,0 L -2,-2 Z" fill="#22d3ee" filter="url(#neon-glow)"
                            initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
                            animate={{ x: 50, y: 20, scale: 1.2, rotate: -120, opacity: 0 }}
                            transition={{ duration: 1.6, ease: 'easeOut' }}
                        />
                        {/* Emerging Silhouette */}
                        <motion.g
                            initial={{ x: -12, y: 0, opacity: 0, scale: 0.55 }}
                            animate={{ x: 25, y: 0, opacity: [0, 1, 0], scale: 1.1 }}
                            transition={{ duration: 1.8, ease: 'easeOut' }}
                        >
                            <circle cx="0" cy="-12" r="4" fill="#22d3ee" filter="url(#neon-glow)" />
                            <line x1="0" y1="-8" x2="0" y2="4" stroke="#22d3ee" strokeWidth="2" filter="url(#neon-glow)" />
                            <line x1="0" y1="4" x2="-4" y2="13" stroke="#22d3ee" strokeWidth="2" filter="url(#neon-glow)" />
                            <line x1="0" y1="4" x2="4" y2="13" stroke="#22d3ee" strokeWidth="2" filter="url(#neon-glow)" />
                        </motion.g>
                    </g>
                )}
            </svg>
        </div>
    );
};
