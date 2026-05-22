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
            tCtx.font = `900 ${fontSize}px Inter, system-ui`;
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
            const points = morph ? getPointsFromText("ANTIGRAVITY") : [];

            for (let i = 0; i < particleCount; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;

                const colors = ['#4f46e5', '#818cf8', '#312e81']; // Indigo variants

                particles.push({
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: Math.random() * 1.5 + 0.5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    targetX: null,
                    targetY: null
                });
            }

            if (points.length > 0 && morph) {
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

            // Draw Subtle Grid
            ctx.strokeStyle = 'rgba(79, 70, 229, 0.03)';
            ctx.lineWidth = 1;
            const gridSize = 100;
            for (let x = 0; x < width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y < height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            particles.forEach(p => {
                if (morph && p.targetX !== null && p.targetY !== null) {
                    const dx = p.targetX - p.x;
                    const dy = p.targetY - p.y;
                    p.x += dx * 0.05;
                    p.y += dy * 0.05;
                } else {
                    p.x += p.vx;
                    p.y += p.vy;

                    // Bounds
                    if (p.x < 0) p.x = width;
                    if (p.x > width) p.x = 0;
                    if (p.y < 0) p.y = height;
                    if (p.y > height) p.y = 0;
                }

                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Mouse force
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    const force = (200 - dist) / 200;
                    p.x -= dx * force * 0.02;
                    p.y -= dy * force * 0.02;
                }
            });

            // Draw neural connections
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.strokeStyle = `rgba(79, 70, 229, ${(1 - dist / 120) * 0.15})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
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
                opacity: morph ? 1 : 0.7
            }}
        />
    );
};

export default UniverseBackground;
