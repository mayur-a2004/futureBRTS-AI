import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    targetX: number | null;
    targetY: number | null;
}

interface UniverseBackgroundProps {
    morph?: boolean;
    intensity?: number; // 0 to 1
}

const UniverseBackground = ({ morph = false, intensity = 1 }: UniverseBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles: Particle[] = [];
        const particleCount = Math.floor(150 * intensity);

        // Pre-render text to get target points
        const getPointsFromText = (text: string) => {
            const tempCanvas = document.createElement('canvas');
            const tCtx = tempCanvas.getContext('2d');
            if (!tCtx) return [];

            tempCanvas.width = width;
            tempCanvas.height = height;

            tCtx.fillStyle = 'white';
            const fontSize = Math.min(width / 6, 120);
            tCtx.font = `black ${fontSize}px Inter, system-ui`;
            tCtx.textAlign = 'center';
            tCtx.textBaseline = 'middle';
            tCtx.fillText(text, width / 2, height / 2);

            const imageData = tCtx.getImageData(0, 0, width, height).data;
            const points = [];
            const step = 6; // Sampling density

            for (let y = 0; y < height; y += step) {
                for (let x = 0; x < width; x += step) {
                    const index = (y * width + x) * 4;
                    if (imageData[index] > 128) {
                        points.push({ x, y });
                    }
                }
            }
            return points;
        };

        const init = () => {
            particles.length = 0;
            const points = getPointsFromText("FutureBilder");

            for (let i = 0; i < particleCount; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;

                const colors = ['#3b82f6', '#8b5cf6', '#06b6d4']; // Blue, Purple, Cyan

                particles.push({
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 0.5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    targetX: null,
                    targetY: null
                });
            }

            // Assign targets if points available
            if (points.length > 0) {
                particles.forEach((p, i) => {
                    const target = points[i % points.length];
                    p.targetX = target.x;
                    p.targetY = target.y;
                });
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                if (morph) {
                    // Pull towards target text points
                    const dx = (p.targetX || p.baseX) - p.x;
                    const dy = (p.targetY || p.baseY) - p.y;
                    p.x += dx * 0.08;
                    p.y += dy * 0.08;
                } else {
                    // Natural slow movement
                    p.x += p.vx;
                    p.y += p.vy;

                    // Mouse reaction
                    const mdx = mouseRef.current.x - p.x;
                    const mdy = mouseRef.current.y - p.y;
                    const distance = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (distance < 150) {
                        const force = (150 - distance) / 150;
                        p.x -= mdx * force * 0.05;
                        p.y -= mdy * force * 0.05;
                    }

                    // Bounds
                    if (p.x < 0) p.x = width;
                    if (p.x > width) p.x = 0;
                    if (p.y < 0) p.y = height;
                    if (p.y > height) p.y = 0;
                }

                ctx.fillStyle = p.color;
                ctx.globalAlpha = morph ? 0.8 : 0.4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw connections only when not morphing or at lower intensity
            if (!morph) {
                particles.forEach((a, i) => {
                    for (let j = i + 1; j < particles.length; j++) {
                        const b = particles[j];
                        const dx = a.x - b.x;
                        const dy = a.y - b.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 100) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - dist / 100) * 0.1})`;
                            ctx.moveTo(a.x, a.y);
                            ctx.lineTo(b.x, b.y);
                            ctx.stroke();
                        }
                    }
                });
            }

            requestAnimationFrame(animate);
        };

        init();
        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [morph, intensity]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
            style={{
                background: 'transparent',
                opacity: morph ? 1 : 0.4
            }}
        />
    );
};

export default UniverseBackground;
