import React, { useState, useEffect, useRef } from 'react';
import { ThreeJsConfig } from '../types/LabConfig';

interface Model3DLabProps {
  three_js_config: ThreeJsConfig | null;
  sketchfab_hint: string | null;
  subject: string;
  sensitivity_level: number;
}

const evaluateExpr = (expr: string, context: Record<string, number>): number => {
  try {
    let sanitized = expr
      .replace(/\^/g, '**')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\blog\b/g, 'Math.log')
      .replace(/\bpow\b/g, 'Math.pow')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bpi\b/g, 'Math.PI')
      .replace(/\bexp\b/g, 'Math.exp');

    // Insert implicit multiplication: e.g. "2x" -> "2*x", "2(" -> "2*("
    sanitized = sanitized.replace(/(\d+)([a-zA-Z\(])/g, '$1*$2');
    
    // Also handle e.g. ")(" -> ")*(" or ")x" -> ")*x"
    sanitized = sanitized.replace(/(\))([a-zA-Z0-9\(])/g, '$1*$2');

    // Replace all variable names in expr with their values from context
    Object.entries(context).forEach(([key, val]) => {
      if (['sin', 'cos', 'tan', 'log', 'pow', 'sqrt', 'abs', 'pi', 'exp', 'Math'].includes(key)) return;
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      sanitized = sanitized.replace(regex, val.toString());
    });
    
    const fn = new Function(`return (${sanitized})`);
    const val = fn();
    return isNaN(val) || !isFinite(val) ? 0 : val;
  } catch (e) {
    console.error("Failed to evaluate expression:", expr, e);
    return 0;
  }
};

export const Model3DLab: React.FC<Model3DLabProps> = ({
  three_js_config,
  sketchfab_hint,
  subject: _subject,
  sensitivity_level: _sensitivity_level,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [params, setParams] = useState<Record<string, number>>({});
  const [sketchfabLoading, setSketchfabLoading] = useState(true);
  const [activeModelId, setActiveModelId] = useState<string | null>(sketchfab_hint);
  const [show2DInterpretation, setShow2DInterpretation] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sketchfabApiRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = () => {
    const element = containerRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  const mouseRef = useRef({ x: 0, y: 0, click: false, clickX: 0, clickY: 0 });
  const animationRef = useRef<number | null>(null);
  const projectileStateRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, t: 0, path: [] as { x: number; y: number }[] });

  useEffect(() => {
    const isInvalid = !sketchfab_hint || 
                      sketchfab_hint === '3d6e5d8a9e7f4c17b5f00e28f3a38ca4' || 
                      sketchfab_hint.includes('default') || 
                      sketchfab_hint.includes('3d model ID') || 
                      sketchfab_hint.length > 45;

    setSketchfabLoading(true);
    const token = localStorage.getItem('fbrts_token');
    
    const searchQuery = (!isInvalid && sketchfab_hint) ? sketchfab_hint : (three_js_config?.title || _subject || 'science');
    const cleanQuery = searchQuery
      .replace(/Interactive/gi, '')
      .replace(/Simulator/gi, '')
      .replace(/Simulation/gi, '')
      .trim();

    fetch(`/api/future-education/lab/sketchfab-search?query=${encodeURIComponent(cleanQuery)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.model_id) {
          setActiveModelId(data.model_id);
        } else {
          setActiveModelId('57e27538f97a4617a716c3ca5448b6b7'); // DNA model fallback
        }
      })
      .catch(err => {
        console.error('Sketchfab dynamic search failed:', err);
        setActiveModelId('57e27538f97a4617a716c3ca5448b6b7');
      });
  }, [sketchfab_hint, three_js_config, _subject]);

  // Load Sketchfab Viewer API script once
  useEffect(() => {
    if ((window as any).Sketchfab) return;
    const script = document.createElement('script');
    script.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Initialize Sketchfab API on iframe
  useEffect(() => {
    if (!activeModelId || show2DInterpretation) {
      setAnnotations([]);
      setSelectedAnnotationIndex(null);
      sketchfabApiRef.current = null;
      return;
    }

    let apiInstance: any = null;
    let isMounted = true;

    const initViewer = () => {
      if (!(window as any).Sketchfab) {
        setTimeout(() => {
          if (isMounted) initViewer();
        }, 300);
        return;
      }

      if (!iframeRef.current) {
        return;
      }

      setSketchfabLoading(true);
      const client = new (window as any).Sketchfab('1.12.1', iframeRef.current);
      client.init(activeModelId, {
        success: (api: any) => {
          if (!isMounted) return;
          apiInstance = api;
          sketchfabApiRef.current = api;
          api.start();
          api.addEventListener('viewerready', () => {
            if (!isMounted) return;
            setSketchfabLoading(false);
            api.getAnnotationList((err: any, list: any[]) => {
              if (!err && list && isMounted) {
                setAnnotations(list);
              }
            });
            api.addEventListener('annotationSelect', (index: number) => {
              if (isMounted) {
                if (index !== -1) {
                  setSelectedAnnotationIndex(index);
                } else {
                  setSelectedAnnotationIndex(null);
                }
              }
            });
          });
        },
        error: () => {
          console.error('Sketchfab API init error');
          if (isMounted) setSketchfabLoading(false);
        },
        autostart: 1,
        ui_theme: 'dark',
        preload: 1
      });
    };

    const timer = setTimeout(initViewer, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (apiInstance && apiInstance.stop) {
        try { apiInstance.stop(); } catch (e) {}
      }
    };
  }, [activeModelId, show2DInterpretation]);

  const handleSelectAnnotation = (idx: number) => {
    setSelectedAnnotationIndex(idx);
    if (sketchfabApiRef.current) {
      sketchfabApiRef.current.selectAnnotation(idx);
    }
  };

  // Initialize parameters from config
  useEffect(() => {
    const initialParams: Record<string, number> = {};

    // 1. Initialize from dynamic controls if present
    if (three_js_config?.controls) {
      three_js_config.controls.forEach((control) => {
        if (typeof control.defaultValue === 'number') {
          initialParams[control.name] = control.defaultValue;
        } else if (typeof control.defaultValue === 'boolean') {
          initialParams[control.name] = control.defaultValue ? 1 : 0;
        } else {
          initialParams[control.name] = parseFloat(control.defaultValue as any) || 0;
        }
      });
    }

    // 2. Initialize from legacy params config
    if (three_js_config?.params) {
      Object.entries(three_js_config.params).forEach(([key, val]) => {
        if (typeof val === 'number') {
          initialParams[key] = val;
        } else if (typeof val === 'boolean') {
          initialParams[key] = val ? 1 : 0;
        } else {
          initialParams[key] = parseFloat(val) || 0;
        }
      });
    }

    setParams(initialParams);
  }, [three_js_config]);

  // Handle Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || (!three_js_config && !show2DInterpretation)) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.click = true;
      mouseRef.current.clickX = e.clientX - rect.left;
      mouseRef.current.clickY = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);

    let width = canvas.width = canvas.clientWidth;
    let height = canvas.height = canvas.clientHeight;

    const resizeObserver = new ResizeObserver(() => {
      if (canvas) {
        width = canvas.width = canvas.clientWidth;
        height = canvas.height = canvas.clientHeight;
      }
    });
    resizeObserver.observe(canvas);

    const type = three_js_config?.type;

    // Reset projectile state if type changes
    if (type === 'projectile_motion') {
      const angleRad = ((params.angle || 45) * Math.PI) / 180;
      const speed = params.speed || 20;
      projectileStateRef.current = {
        x: 20,
        y: height - 40,
        vx: speed * Math.cos(angleRad) * 4,
        vy: -speed * Math.sin(angleRad) * 4,
        t: 0,
        path: [],
      };
    }

    const drawGrid = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 1;
      const gridSize = 40;
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

      // Draw axis
      ctx.strokeStyle = '#4338ca';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
    };

    const render = () => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // ─────────────────────────────────────────────
      // DYNAMIC VISUAL ELEMENTS ENGINE
      // ─────────────────────────────────────────────
      if (three_js_config?.visual_mapping?.elements) {
        const evalContext: Record<string, number> = { ...params, time: Date.now() * 0.001 };
        
        // Evaluate equations
        const computedOutputs: Record<string, number> = {};
        if (three_js_config.equations) {
          Object.entries(three_js_config.equations).forEach(([outKey, expr]) => {
            computedOutputs[outKey] = evaluateExpr(expr, evalContext);
            evalContext[outKey] = computedOutputs[outKey]; // feed back
          });
        }

        // Draw elements
        three_js_config.visual_mapping.elements.forEach((elem) => {
          let color = elem.color || '#6366f1';
          if (color.startsWith('#') && !/^[#]([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)) {
            color = color.slice(1);
          }
          const size = elem.sizeExpr ? Math.max(2, evaluateExpr(elem.sizeExpr, evalContext)) : 20;
          const speed = elem.speedExpr ? evaluateExpr(elem.speedExpr, evalContext) : 0;
          const glow = elem.glowExpr ? Math.min(1, Math.max(0, evaluateExpr(elem.glowExpr, evalContext))) : 1;

          ctx.save();
          ctx.globalAlpha = glow;

          if (elem.type === 'circle') {
            const x = cx + Math.sin(Date.now() * 0.001 * (speed || 1)) * (cx - size - 20);
            const y = cy;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            if (elem.label) {
              ctx.fillStyle = '#94a3b8';
              ctx.font = '11px sans-serif';
              ctx.fillText(elem.label, x - size, y + size + 16);
            }
          } 
          else if (elem.type === 'rect') {
            const x = cx - size / 2;
            const y = cy - size / 2;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, size, size);
            if (elem.label) {
              ctx.fillStyle = '#94a3b8';
              ctx.font = '11px sans-serif';
              ctx.fillText(elem.label, x, y - 8);
            }
          }
          else if (elem.type === 'line') {
            ctx.strokeStyle = color;
            ctx.lineWidth = size / 5;
            ctx.beginPath();
            ctx.moveTo(40, cy);
            ctx.lineTo(width - 40, cy);
            ctx.stroke();
          }
          else if (elem.type === 'particles') {
            const particleCount = Math.floor(size);
            const timeSeed = Date.now() * 0.001 * (speed || 1);
            ctx.fillStyle = color;
            for (let i = 0; i < particleCount; i++) {
              const px = ((i * 73 + timeSeed * 80) % (width - 80)) + 40;
              const py = cy + Math.sin(i * 1.7 + timeSeed) * 30;
              ctx.beginPath();
              ctx.arc(px, py, 3 + (i % 3), 0, Math.PI * 2);
              ctx.fill();
            }
          }
          else if (elem.type === 'graph') {
            drawGrid(ctx, cx, cy);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            let first = true;
            const plotExpression = elem.plotExpr || 'size * sin(speed * x - time)';
            for (let px = 0; px < width; px += 2) {
              const x = (px - cx) / 25;
              const time = Date.now() * 0.001;
              const plotContext = { ...evalContext, x, time, size, speed };
              const y = evaluateExpr(plotExpression, plotContext);
              const py = cy - y * 15;
              
              if (isNaN(py) || !isFinite(py)) continue;
              
              if (first) {
                ctx.moveTo(px, py);
                first = false;
              } else {
                ctx.lineTo(px, py);
              }
            }
            ctx.stroke();
          }

          ctx.restore();
        });

        // Info Overlay
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 13px sans-serif';
        let textY = 40;
        if (three_js_config?.title) {
          ctx.fillText(three_js_config.title, 25, textY);
          textY += 24;
        }
        ctx.font = '12px monospace';
        Object.entries(computedOutputs).forEach(([key, val]) => {
          const outDef = three_js_config?.outputs?.find(o => o.name === key);
          const label = outDef?.label || key;
          const unit = outDef?.unit || '';
          ctx.fillText(`${label}: ${val.toFixed(2)} ${unit}`, 25, textY);
          textY += 18;
        });
      }

      // ─────────────────────────────────────────────
      // LEGACY HARCODED SIMULATIONS FALLBACKS
      // ─────────────────────────────────────────────
      else if (type === 'quadratic_graph') {
        drawGrid(ctx, cx, cy);
        const a = params.a ?? 1;
        const b = params.b ?? 0;
        const c = params.c ?? 0;

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        let first = true;
        for (let px = 0; px < width; px++) {
          const x = (px - cx) / 20;
          const y = a * x * x + b * x + c;
          const py = cy - y * 20;
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '14px monospace';
        ctx.fillText(`y = ${a.toFixed(1)}x² + ${b.toFixed(1)}x + ${c.toFixed(1)}`, 20, 30);
      }
      else if (type === 'linear_graph') {
        drawGrid(ctx, cx, cy);
        const m = params.m ?? 1;
        const cVal = params.c ?? 0;

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const y1 = m * (-cx / 20) + cVal;
        const y2 = m * (cx / 20) + cVal;
        ctx.moveTo(0, cy - y1 * 20);
        ctx.lineTo(width, cy - y2 * 20);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '14px monospace';
        ctx.fillText(`y = ${m.toFixed(1)}x + ${cVal.toFixed(1)}`, 20, 30);
      }
      else if (type === 'trig_graph') {
        drawGrid(ctx, cx, cy);
        const amp = params.amplitude ?? 2;
        const freq = params.frequency ?? 1;

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        let first = true;
        for (let px = 0; px < width; px++) {
          const x = (px - cx) / 40;
          const y = amp * Math.sin(freq * x);
          const py = cy - y * 40;
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '14px monospace';
        ctx.fillText(`y = ${amp.toFixed(1)} * sin(${freq.toFixed(1)}x)`, 20, 30);
      }
      else if (type === 'normal_distribution') {
        drawGrid(ctx, cx, cy + 40);
        const mean = params.mean ?? 0;
        const std = params.std ?? 1;

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        let first = true;
        for (let px = 0; px < width; px++) {
          const x = (px - cx) / 40;
          const diff = x - mean;
          const exponent = -0.5 * (diff * diff) / (std * std);
          const y = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent) * 4;
          const py = (cy + 40) - y * 60;
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '14px monospace';
        ctx.fillText(`Mean = ${mean.toFixed(1)}, StdDev = ${std.toFixed(2)}`, 20, 30);
      }
      else if (type === 'projectile_motion') {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height - 40);
        ctx.lineTo(width, height - 40);
        ctx.stroke();

        const state = projectileStateRef.current;
        const gravity = (params.gravity ?? 9.8) * 0.05;

        state.vy += gravity;
        state.x += state.vx * 0.1;
        state.y += state.vy * 0.1;

        if (state.y > height - 40) {
          state.y = height - 40;
          state.vx = 0;
          state.vy = 0;
        } else {
          state.path.push({ x: state.x, y: state.y });
        }

        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath();
        state.path.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(state.x, state.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '14px monospace';
        ctx.fillText(`Angle: ${params.angle ?? 45}°, Initial Speed: ${params.speed ?? 20} m/s`, 20, 30);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(width - 120, 20, 100, 30);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '12px sans-serif';
        ctx.fillText('Reset Sim', width - 100, 38);
      }
      else if (type === 'wave_simulation') {
        drawGrid(ctx, cx, cy);
        const amp = params.amplitude ?? 2;
        const freq = params.frequency ?? 1;
        const time = Date.now() * 0.005;

        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 3;
        ctx.beginPath();
        let first = true;
        for (let px = 0; px < width; px++) {
          const x = (px - cx) / 40;
          const y = amp * Math.sin(freq * x - time);
          const py = cy - y * 40;
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '14px monospace';
        ctx.fillText(`Wave Simulation: Amp=${amp.toFixed(1)}, Freq=${freq.toFixed(1)}`, 20, 30);
      }
      else if (type === 'ledger_visual') {
        const assets = params.assets ?? 500;
        const liabilities = params.liabilities ?? 500;

        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#fafafa';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('Debit and Credit Balance Sheet Simulator', 20, 35);

        // Draw central T-line
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2, 50);
        ctx.lineTo(width / 2, height - 20);
        ctx.stroke();

        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('Debit (Assets)', 40, 70);
        ctx.fillStyle = '#22c55e';
        ctx.fillText('Credit (Liabilities & Equity)', width / 2 + 40, 70);

        // Render dynamic bars
        const maxBarHeight = height - 180;
        const maxVal = 1000;
        
        const assetBarHeight = (assets / maxVal) * maxBarHeight;
        const liabBarHeight = (liabilities / maxVal) * maxBarHeight;

        // Debit/Asset Bar (Red/Orange)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(40, height - 60 - assetBarHeight, width / 2 - 80, assetBarHeight);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, height - 60 - assetBarHeight, width / 2 - 80, assetBarHeight);

        // Credit/Liability Bar (Green)
        ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.fillRect(width / 2 + 40, height - 60 - liabBarHeight, width / 2 - 80, liabBarHeight);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(width / 2 + 40, height - 60 - liabBarHeight, width / 2 - 80, liabBarHeight);

        // Text labels inside/above bars
        ctx.fillStyle = '#fafafa';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`$${assets.toFixed(0)}`, 50, height - 70 - assetBarHeight);
        ctx.fillText(`$${liabilities.toFixed(0)}`, width / 2 + 50, height - 70 - liabBarHeight);

        // Balancing status text
        const diff = assets - liabilities;
        ctx.fillStyle = diff === 0 ? '#3b82f6' : '#f59e0b';
        ctx.font = 'bold 13px sans-serif';
        if (diff === 0) {
            ctx.fillText('✨ Ledger is BALANCED! (Assets = Liabilities + Equity)', 20, height - 20);
        } else {
            ctx.fillText(`⚠️ Ledger is UNBALANCED by $${Math.abs(diff).toFixed(0)} (${diff > 0 ? 'Excess Assets' : 'Excess Liabilities'})`, 20, height - 20);
        }
      }
      else if (type === 'molecule_builder' || type === 'chemical_reaction' || type === 'beaker_chemical_lab') {
        const temp = params.temperature ?? 25;
        const ph = params.pH ?? 7.0;

        // Draw beaker background / burner stand
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Stand top
        ctx.moveTo(cx - 70, cy + 95);
        ctx.lineTo(cx + 70, cy + 95);
        // Stand legs
        ctx.moveTo(cx - 60, cy + 95);
        ctx.lineTo(cx - 80, cy + 160);
        ctx.moveTo(cx + 60, cy + 95);
        ctx.lineTo(cx + 80, cy + 160);
        ctx.stroke();

        // Burner Flame if temp is high
        if (temp > 30) {
          const flameHeight = 15 + (temp - 30) * 0.4;
          const timeSeed = Date.now() * 0.015;
          ctx.fillStyle = temp > 70 ? '#ef4444' : '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(cx - 15, cy + 160);
          ctx.quadraticCurveTo(cx + Math.sin(timeSeed) * 5, cy + 160 - flameHeight, cx + 15, cy + 160);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(cx - 8, cy + 160);
          ctx.quadraticCurveTo(cx + Math.sin(timeSeed + 2) * 3, cy + 160 - flameHeight * 0.6, cx + 8, cy + 160);
          ctx.closePath();
          ctx.fill();
        }

        // Draw Beaker
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 50, cy - 30);
        ctx.lineTo(cx - 50, cy + 90);
        ctx.lineTo(cx + 50, cy + 90);
        ctx.lineTo(cx + 50, cy - 30);
        ctx.stroke();

        // Color transition based on pH
        // Neutral (pH 7) -> Green
        // Acidic (pH < 7) -> Red/Yellow
        // Alkaline (pH > 7) -> Violet/Pink
        let r = 34; // neutral emerald
        let g = 197;
        let b = 94;
        let colorName = 'Neutral (pH 7)';

        if (ph < 6.8) {
          const factor = (6.8 - ph) / 6.8;
          r = Math.floor(34 + factor * 221); // transition to red
          g = Math.floor(197 - factor * 140);
          b = Math.floor(94 - factor * 60);
          colorName = `Acidic (pH ${ph.toFixed(1)})`;
        } else if (ph > 7.2) {
          const factor = (ph - 7.2) / 6.8;
          r = Math.floor(34 + factor * 180); // transition to purple/violet
          g = Math.floor(197 - factor * 160);
          b = Math.floor(94 + factor * 140);
          colorName = `Alkaline (pH ${ph.toFixed(1)})`;
        }

        // Draw liquid
        const liquidHeight = 80; // steady height
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
        ctx.fillRect(cx - 47, cy + 90 - liquidHeight, 94, liquidHeight);

        // Boiling Bubbles
        if (temp > 30) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          const bubbleCount = Math.floor((temp - 30) * 0.4);
          const timeSeed = Date.now() * 0.003;
          for (let i = 0; i < bubbleCount; i++) {
            const bx = cx - 35 + ((i * 17 + timeSeed * 20) % 70);
            const speed = 1 + (temp - 30) * 0.05;
            const by = cy + 90 - ((i * 12 + timeSeed * 40 * speed) % liquidHeight);
            if (by > cy + 90 - liquidHeight && by < cy + 85) {
              ctx.beginPath();
              ctx.arc(bx, by, 1.5 + (i % 3), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Info Text Overlay
        ctx.fillStyle = '#fafafa';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('Chemical Beaker & Reaction Lab', 25, 40);
        
        ctx.font = '12px monospace';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(`Temperature: ${temp}°C`, 25, 70);
        ctx.fillText(`Solution pH: ${ph.toFixed(1)} (${colorName})`, 25, 90);
        ctx.fillText(`Water State: ${temp >= 100 ? 'Boiling / Vaporizing' : temp > 30 ? 'Heating' : 'Room Temp'}`, 25, 110);
      }
      else if (type === 'supply_demand') {
        drawGrid(ctx, cx, cy);

        const demand = params.demand ?? 50;
        const supply = params.supply ?? 50;

        // Shift calculations
        const demandShift = (demand - 50) * 2;
        const supplyShift = (supply - 50) * 2;

        // Draw curves
        ctx.lineWidth = 3;

        // Demand curve (Red/Orange, sloping down)
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(40, cy - 80 + demandShift);
        ctx.lineTo(width - 40, cy + 80 + demandShift);
        ctx.stroke();

        // Supply curve (Blue/Green, sloping up)
        ctx.strokeStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(40, cy + 80 - supplyShift);
        ctx.lineTo(width - 40, cy - 80 - supplyShift);
        ctx.stroke();

        // Find intersection point (equilibrium)
        const eqX = cx + (demandShift + supplyShift) * 1.2;
        const eqY = cy + (demandShift - supplyShift) * 0.5;

        // Draw equilibrium point
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(eqX, eqY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Dotted lines to axes
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        
        // Dotted line to Y axis (Price)
        ctx.beginPath();
        ctx.moveTo(eqX, eqY);
        ctx.lineTo(cx, eqY);
        ctx.stroke();

        // Dotted line to X axis (Quantity)
        ctx.beginPath();
        ctx.moveTo(eqX, eqY);
        ctx.lineTo(eqX, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Text overlays
        ctx.fillStyle = '#fafafa';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('Supply and Demand Equilibrium', 25, 40);

        ctx.font = '12px monospace';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(`Demand Shift Level: ${demand}%`, 25, 70);
        ctx.fillText(`Supply Shift Level: ${supply}%`, 25, 90);

        const price = 100 - (eqY - cy) * 0.8;
        const quantity = 100 + (eqX - cx) * 0.8;
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`✨ Equilibrium Price: $${price.toFixed(1)}`, 25, 120);
        ctx.fillText(`✨ Equilibrium Quantity: ${quantity.toFixed(0)} units`, 25, 140);
      }
      else if (type === 'thermodynamics_piston') {
        const heat = params.heat ?? 100;
        const work = params.work ?? 50;
        const dU = Math.max(0, heat - work);

        // Draw cylinder
        const cylW = 120;
        const cylLeft = cx - cylW / 2;
        const cylBottom = cy + 100;
        const cylTop = cy - 80;

        // Piston position y
        const pistonHeight = 30 + work * 0.7;
        const pistonY = cylBottom - pistonHeight;

        // Draw Burner stand
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 30, cylBottom + 20);
        ctx.lineTo(cx + 30, cylBottom + 20);
        ctx.moveTo(cx, cylBottom + 20);
        ctx.lineTo(cx, cylBottom + 45);
        ctx.stroke();

        // Draw Flame
        if (heat > 0) {
            const flameSize = 10 + (heat / 200) * 20;
            const timeSeed = Date.now() * 0.02;
            ctx.fillStyle = heat > 120 ? '#ef4444' : '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(cx - 10, cylBottom + 20);
            ctx.quadraticCurveTo(cx + Math.sin(timeSeed) * 4, cylBottom + 20 - flameSize, cx + 10, cylBottom + 20);
            ctx.closePath();
            ctx.fill();
        }

        // Draw gas inside cylinder background
        let rVal = Math.min(255, Math.floor(30 + (dU / 200) * 220));
        let bVal = Math.max(0, Math.floor(180 - (dU / 200) * 180));
        ctx.fillStyle = `rgba(${rVal}, 50, ${bVal}, 0.15)`;
        ctx.fillRect(cylLeft, pistonY, cylW, pistonHeight);

        // Draw Piston shaft
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 8, cylTop - 20, 16, pistonY - cylTop - 12);

        // Draw Piston head
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cylLeft - 4, pistonY - 12, cylW + 8, 12);

        // Draw Cylinder walls
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(cylLeft, cylTop);
        ctx.lineTo(cylLeft, cylBottom);
        ctx.lineTo(cx + cylW / 2, cylBottom);
        ctx.lineTo(cx + cylW / 2, cylTop);
        ctx.stroke();

        // Draw bouncing gas particles
        ctx.fillStyle = `rgb(${Math.min(255, rVal + 100)}, 120, ${Math.min(255, bVal + 70)})`;
        const numParticles = 20;
        const timeSeed = Date.now() * 0.001 * (1 + dU * 0.03);
        for (let i = 0; i < numParticles; i++) {
            const px = cylLeft + 10 + ((Math.sin(i * 12.3 + timeSeed) + 1) / 2) * (cylW - 20);
            const py = pistonY + 5 + ((Math.cos(i * 7.9 + timeSeed * 1.3) + 1) / 2) * (pistonHeight - 15);
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Info Text Overlays
        ctx.fillStyle = '#fafafa';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('First Law of Thermodynamics Simulator', 25, 40);

        ctx.font = '12px monospace';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(`Heat Added (Q):        ${heat} J`, 25, 70);
        ctx.fillText(`Work Done by Gas (W):  ${work} J`, 25, 90);
        
        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`Change in Internal Energy (dU = Q - W): ${dU.toFixed(0)} J`, 25, 120);

        ctx.fillStyle = '#f472b6';
        ctx.font = 'italic 12px sans-serif';
        if (dU > 100) {
            ctx.fillText('Status: High Temperature Expansion 🌡️', 25, 145);
        } else if (dU === 0) {
            ctx.fillText('Status: Perfect Heat-Work Equilibrium ⚖️', 25, 145);
        } else {
            ctx.fillText('Status: Moderate Temperature State ❄️', 25, 145);
        }
      }
      else {
        // Draw interactive fallback
        ctx.fillStyle = '#06050b';
        ctx.fillRect(0, 0, width, height);

        // Grid background
        drawGrid(ctx, cx, cy);

        const lowerSubject = _subject.toLowerCase();
        const lowerTitle = (sketchfab_hint || '').toLowerCase();
        const lowerTopic = ((three_js_config as any)?.title || '').toLowerCase();

        if (lowerSubject.includes('biology') || lowerSubject.includes('fungi') || lowerSubject.includes('life') || lowerTitle.includes('fungi') || lowerTitle.includes('mushroom') || lowerTitle.includes('cell') || lowerTitle.includes('mitosis')) {
          // --- BIOLOGY SIMULATION ---
          const isMitosis = lowerTopic.includes('mitosis') || lowerTopic.includes('split') || lowerTopic.includes('division');
          const isCell = lowerTopic.includes('cell') || lowerTopic.includes('organelle') || lowerTopic.includes('nucleus') || lowerTopic.includes('mitochondria') || lowerTopic.includes('plant') || lowerTopic.includes('animal');
          const isReproductive = lowerTopic.includes('reproductive') || lowerTopic.includes('sperm') || lowerTopic.includes('penis') || lowerTopic.includes('male') || lowerTopic.includes('testis') || lowerSubject.includes('reproductive') || lowerSubject.includes('anatomy') || lowerTitle.includes('reproductive') || lowerTitle.includes('male');

          if (isMitosis) {
            const phase = params.mitosisPhase ?? 1;
            const mx = cx;
            const my = cy + 40;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText('Mitosis Step-by-Step Cell Division', 30, 38);
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '11px sans-serif';
            const phaseNames = ['Interphase (Resting)', 'Prophase (Condensing)', 'Metaphase (Aligning Middle)', 'Anaphase (Separating)', 'Telophase (Splitting Cells)'];
            ctx.fillText(`Current Phase: ${phaseNames[phase - 1]}`, 30, 58);

            if (phase === 1) {
              ctx.strokeStyle = '#a855f7';
              ctx.lineWidth = 3;
              ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
              ctx.beginPath();
              ctx.arc(mx, my, 60, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
              ctx.beginPath();
              ctx.arc(mx, my, 25, 0, Math.PI * 2);
              ctx.fill();
            } else if (phase === 2) {
              ctx.strokeStyle = '#a855f7';
              ctx.lineWidth = 3;
              ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
              ctx.beginPath();
              ctx.arc(mx, my, 60, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.arc(mx, my, 25, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(mx - 10, my - 10); ctx.lineTo(mx + 10, my + 10);
              ctx.moveTo(mx + 10, my - 10); ctx.lineTo(mx - 10, my + 10);
              ctx.stroke();
            } else if (phase === 3) {
              ctx.strokeStyle = '#a855f7';
              ctx.lineWidth = 3;
              ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
              ctx.beginPath();
              ctx.arc(mx, my, 60, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.strokeStyle = 'rgba(226, 232, 240, 0.3)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(mx - 50, my); ctx.lineTo(mx, my - 15); ctx.lineTo(mx + 50, my);
              ctx.moveTo(mx - 50, my); ctx.lineTo(mx, my); ctx.lineTo(mx + 50, my);
              ctx.moveTo(mx - 50, my); ctx.lineTo(mx, my + 15); ctx.lineTo(mx + 50, my);
              ctx.stroke();
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(mx, my - 25); ctx.lineTo(mx, my + 25);
              ctx.stroke();
            } else if (phase === 4) {
              ctx.strokeStyle = '#a855f7';
              ctx.lineWidth = 3;
              ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
              ctx.beginPath();
              ctx.roundRect(mx - 75, my - 45, 150, 90, 35);
              ctx.fill();
              ctx.stroke();
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(mx - 20, my - 15); ctx.lineTo(mx - 35, my - 5);
              ctx.moveTo(mx - 20, my + 15); ctx.lineTo(mx - 35, my + 5);
              ctx.moveTo(mx + 20, my - 15); ctx.lineTo(mx + 35, my - 5);
              ctx.moveTo(mx + 20, my + 15); ctx.lineTo(mx + 35, my + 5);
              ctx.stroke();
            } else {
              ctx.strokeStyle = '#a855f7';
              ctx.lineWidth = 3;
              ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
              ctx.beginPath();
              ctx.arc(mx - 35, my, 40, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(mx + 35, my, 40, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
              ctx.beginPath();
              ctx.arc(mx - 35, my, 15, 0, Math.PI * 2);
              ctx.arc(mx + 35, my, 15, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          else if (isCell) {
            const mx = cx;
            const my = cy + 45;
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 3;
            ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
            ctx.beginPath();
            ctx.roundRect(mx - 90, my - 60, 180, 120, 30);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(mx, my, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.ellipse(mx - 50, my - 25, 14, 7, Math.PI / 4, 0, Math.PI * 2);
            ctx.ellipse(mx + 50, my + 25, 14, 7, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            const m = mouseRef.current;
            let hoveredOrganelle = null;
            const distToCenter = Math.hypot(m.x - mx, m.y - my);
            const distToMitoL = Math.hypot(m.x - (mx - 50), m.y - (my - 25));
            const distToMitoR = Math.hypot(m.x - (mx + 50), m.y - (my + 25));
            if (distToCenter < 22) { hoveredOrganelle = 'Nucleus'; }
            else if (distToMitoL < 18 || distToMitoR < 18) { hoveredOrganelle = 'Mitochondria'; }
            else if (Math.abs(m.x - mx) < 95 && Math.abs(m.y - my) < 65) { hoveredOrganelle = 'Cytoplasm'; }

            if (m.click) {
              if (hoveredOrganelle) setSelectedPart(hoveredOrganelle);
              else setSelectedPart(null);
              m.click = false;
            }
            const currentPart = selectedPart || hoveredOrganelle;
            const desc = currentPart === 'Nucleus' ? 'The command center of the cell, containing chromatin genetic DNA material.'
              : currentPart === 'Mitochondria' ? 'Powerhouse of the cell, generating ATP molecules through cellular respiration.'
              : currentPart === 'Cytoplasm' ? 'Protective semi-permeable bilayer filled with jelly-like cytosol fluid.'
              : 'Hover organelles to inspect functions.';

            ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(15, 15, width - 30, 70, 16);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(currentPart ? `Organelle: ${currentPart}` : '🔬 Cell Exploded Organelles view', 30, 35);
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '11px sans-serif';
            ctx.fillText(desc, 30, 53);
          }
          else if (isReproductive) {
            // Draw interactive male reproductive simulation
            const sizeVal = params.penisSize ?? 10;
            const countVal = params.spermCount ?? 50;

            const mx = cx;
            const my = cy + 40;

            // Draw a beautiful anatomical representation
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText(three_js_config?.title || 'Male Reproductive System Simulator', 30, 38);
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '11px sans-serif';
            ctx.fillText(`Penis Size: ${sizeVal.toFixed(1)} cm | Sperm Count: ${countVal.toFixed(0)} million`, 30, 58);

            // Draw central glands/testis structure
            const baseRadius = 25 + sizeVal * 2;
            const grad = ctx.createRadialGradient(mx, my, 5, mx, my, baseRadius + 40);
            grad.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
            grad.addColorStop(0.6, 'rgba(168, 85, 247, 0.15)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(mx, my, baseRadius + 40, 0, Math.PI * 2);
            ctx.fill();

            // Draw scrotum/testis outline
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(mx - baseRadius * 0.5, my + 10, baseRadius * 0.6, 0, Math.PI * 2);
            ctx.arc(mx + baseRadius * 0.5, my + 10, baseRadius * 0.6, 0, Math.PI * 2);
            ctx.stroke();

            // Draw penis/urethra shaft representation based on sizeVal
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 15 + sizeVal * 0.8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(mx, my - 20 - sizeVal * 5);
            ctx.stroke();
            ctx.lineCap = 'butt';

            // Draw swimming sperm particles based on countVal
            const timeSeed = Date.now() * 0.0015;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 1.2;
            const spermCountNum = Math.min(100, Math.floor(countVal * 0.6));
            for (let i = 0; i < spermCountNum; i++) {
              const seed = i * 47.3;
              const speedFactor = 1 + (seed % 3) * 0.4;
              const angle = (seed + timeSeed * speedFactor) % (Math.PI * 2);
              const dist = (seed * 1.5 + timeSeed * 35) % (width / 2 - 30);
              
              // Only draw if inside canvas bounds
              const px = mx + Math.cos(angle) * dist;
              const py = my - 20 - sizeVal * 5 + Math.sin(angle) * dist;

              if (px > 20 && px < width - 20 && py > 80 && py < height - 20) {
                // Sperm head
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fill();

                // Wavy tail
                ctx.beginPath();
                ctx.moveTo(px, py);
                const tailAngle = angle + Math.PI;
                ctx.quadraticCurveTo(
                  px + Math.cos(tailAngle) * 6,
                  py + Math.sin(tailAngle) * 6 + Math.sin(Date.now() * 0.012 + i) * 3,
                  px + Math.cos(tailAngle) * 12,
                  py + Math.sin(tailAngle) * 12
                );
                ctx.stroke();
              }
            }
          }
          else {
            // Mushroom Fungi (original)
            const mx = cx;
            const my = cy + 40;
            ctx.strokeStyle = '#3f3f46';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(mx - 150, my + 80);
            ctx.lineTo(mx + 150, my + 80);
            ctx.stroke();

            const time = Date.now() * 0.002;
            ctx.strokeStyle = '#818cf8';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 8; i++) {
              ctx.beginPath();
              ctx.moveTo(mx + (i - 3.5) * 15, my + 80);
              let rx = mx + (i - 3.5) * 15;
              let ry = my + 80;
              for (let step = 0; step < 5; step++) {
                const angle = Math.PI/2 + Math.sin(time + i + step) * 0.4 + (i - 3.5) * 0.15;
                const len = 15;
                rx += Math.cos(angle) * len;
                ry += Math.sin(angle) * len;
                ctx.lineTo(rx, ry);
              }
              ctx.stroke();
            }

            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.moveTo(mx - 20, my + 80);
            ctx.quadraticCurveTo(mx - 15, my + 20, mx - 25, my - 20);
            ctx.lineTo(mx + 25, my - 20);
            ctx.quadraticCurveTo(mx + 15, my + 20, mx + 20, my + 80);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#fda4af';
            ctx.beginPath();
            ctx.ellipse(mx, my - 20, 70, 15, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(mx, my - 22, 75, Math.PI, 0);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            const spots = [
              { x: -40, y: -45, r: 8 },
              { x: 40, y: -45, r: 8 },
              { x: 0, y: -65, r: 10 },
              { x: -20, y: -30, r: 6 },
              { x: 20, y: -30, r: 6 },
            ];
            spots.forEach(s => {
              ctx.beginPath();
              ctx.arc(mx + s.x, my - 22 + s.y, s.r, 0, Math.PI * 2);
              ctx.fill();
            });

            ctx.fillStyle = '#fef08a';
            const wind = params.wind ?? 10;
            const releaseRate = params.rate ?? 50;
            for (let i = 0; i < releaseRate; i++) {
              const seed = i * 19.3;
              const t = (Date.now() * 0.001 + seed) % 6;
              const sx = mx - 50 + (seed % 100) + (t * wind * 2);
              const sy = my - 15 - (t * 25) + Math.sin(t * 3 + seed) * 10;
              if (sy < my - 20 && sx > 0 && sx < width) {
                ctx.beginPath();
                ctx.arc(sx, sy, 2 + (i % 2), 0, Math.PI * 2);
                ctx.fill();
              }
            }

            const m = mouseRef.current;
            let activeLabel = null;
            const distToCap = Math.hypot(m.x - mx, m.y - (my - 50));
            if (distToCap < 75 && m.y < my - 20) { activeLabel = 'Cap (Pileus)'; }
            else if (Math.abs(m.x - mx) < 25 && m.y > my - 20 && m.y < my + 80) { activeLabel = 'Stem (Stipe)'; }
            else if (Math.hypot(m.x - mx, m.y - (my - 20)) < 70 && m.y >= my - 22 && m.y <= my - 5) { activeLabel = 'Gills (Hymenium)'; }
            else if (m.y > my + 80) { activeLabel = 'Mycelium Network'; }

            if (m.click) {
              if (activeLabel) setSelectedPart(activeLabel);
              else setSelectedPart(null);
              m.click = false;
            }

            const currentPart = selectedPart || activeLabel;
            const currentDesc = currentPart === 'Cap (Pileus)' ? 'The protective top shield of the mushroom.'
              : currentPart === 'Stem (Stipe)' ? 'Supports the cap and elevates the gills off the ground.'
              : currentPart === 'Gills (Hymenium)' ? 'The ribbed underside where spores are generated and released.'
              : currentPart === 'Mycelium Network' ? 'The vegetative body absorbing nutrients from the soil.'
              : 'Explore pileus, stipe, gills, and mycelium network.';

            ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
            ctx.strokeStyle = '#4f46e5';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(15, 15, width - 30, 70, 16);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(currentPart ? `Interactive Label: ${currentPart}` : '💡 Click parts of the Fungi to explore functions', 30, 35);
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '11px sans-serif';
            ctx.fillText(currentDesc, 30, 53);
          }
        }
        else if (lowerSubject.includes('chemistry') || lowerTitle.includes('molecule') || lowerTitle.includes('atom') || lowerTitle.includes('reaction')) {
          // --- CHEMISTRY/ATOM INTERACTIVE BUILDER ---
          const mx = cx;
          const my = cy + 20;
          const protons = params.protons ?? 6;
          const electrons = params.electrons ?? 6;
          const energyState = params.energy ?? 1;

          for (let shell = 1; shell <= 3; shell++) {
            ctx.strokeStyle = shell === energyState ? '#818cf8' : 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(mx, my, 40 * shell, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.shadowBlur = 10;
          ctx.shadowColor = '#f43f5e';
          for (let i = 0; i < protons; i++) {
            const angle = (i * 2 * Math.PI) / protons + (Date.now() * 0.001);
            const radius = 6 + (i % 2) * 3;
            const nx = mx + Math.cos(angle) * radius;
            const ny = my + Math.sin(angle) * radius;
            ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#3b82f6';
            ctx.beginPath();
            ctx.arc(nx, ny, 6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;

          const time = Date.now() * 0.0015;
          ctx.fillStyle = '#10b981';
          for (let i = 0; i < electrons; i++) {
            const shellIndex = i < 2 ? 1 : i < 8 ? 2 : 3;
            const shellElecCount = shellIndex === 1 ? 2 : shellIndex === 2 ? 6 : 8;
            const angle = (i * 2 * Math.PI) / shellElecCount + time * (1.5 / shellIndex);
            const ex = mx + Math.cos(angle) * (40 * shellIndex);
            const ey = my + Math.sin(angle) * (40 * shellIndex);
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#10b981';
            ctx.beginPath();
            ctx.arc(ex, ey, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(15, 15, width - 30, 70, 16);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(`Interactive Bohr Model • Element: ${protons === 1 ? 'Hydrogen' : protons === 2 ? 'Helium' : protons === 6 ? 'Carbon' : protons === 8 ? 'Oxygen' : 'Custom Element'}`, 30, 35);
          ctx.fillStyle = '#a1a1aa';
          ctx.font = '11px sans-serif';
          ctx.fillText(`Protons: ${protons} • Electrons: ${electrons} • Shell state: energy shell ${energyState} active`, 30, 53);
        }
        else if (lowerSubject.includes('physics') || lowerTitle.includes('circuit') || lowerTitle.includes('wave') || lowerTitle.includes('optics') || lowerTitle.includes('kinetics')) {
          // --- PHYSICS SIMULATION ---
          const isWave = lowerTopic.includes('wave');
          if (isWave) {
            const amplitude = params.amplitude ?? 2;
            const frequency = params.frequency ?? 1.5;
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 3;
            ctx.beginPath();
            const time = Date.now() * 0.003;
            for (let x = 30; x < width - 30; x++) {
              const y = cy + Math.sin(x * 0.05 * frequency - time) * amplitude * 18;
              if (x === 30) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(15, 15, width - 30, 70, 16);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('Wave Frequency & Amplitude Simulator', 30, 35);
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '11px sans-serif';
            ctx.fillText(`Amplitude (A): ${amplitude.toFixed(1)} • Frequency (f): ${frequency.toFixed(2)}Hz`, 30, 53);
          } else {
            const angleDeg = params.angle ?? 45;
            const launchSpeed = params.speed ?? 20;
            const gravityVal = params.gravity ?? 9.8;
            const cannonX = 40;
            const cannonY = height - 40;

            ctx.strokeStyle = '#4b5563';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(15, cannonY);
            ctx.lineTo(width - 15, cannonY);
            ctx.stroke();

            const angleRad = (angleDeg * Math.PI) / 180;
            const gunLength = 35;
            const gunEndX = cannonX + Math.cos(angleRad) * gunLength;
            const gunEndY = cannonY - Math.sin(angleRad) * gunLength;

            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(cannonX, cannonY);
            ctx.lineTo(gunEndX, gunEndY);
            ctx.stroke();
            ctx.lineCap = 'butt';

            ctx.fillStyle = '#1f2937';
            ctx.beginPath();
            ctx.arc(cannonX, cannonY, 10, 0, Math.PI * 2);
            ctx.fill();

            const state = projectileStateRef.current;
            if (state) {
              state.t += 0.05;
              const t = state.t;
              const px = cannonX + state.vx * t;
              const py = cannonY - (state.vy * t - 0.5 * gravityVal * t * t);

              if (py <= cannonY && px < width - 15) {
                state.path.push({ x: px, y: py });
                ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                state.path.forEach((pt, idx) => {
                  if (idx === 0) ctx.moveTo(pt.x, pt.y);
                  else ctx.lineTo(pt.x, pt.y);
                });
                ctx.stroke();

                ctx.fillStyle = '#f43f5e';
                ctx.beginPath();
                ctx.arc(px, py, 6, 0, Math.PI * 2);
                ctx.fill();
              } else {
                ctx.fillStyle = '#fb7185';
                ctx.beginPath();
                const lastPt = state.path[state.path.length - 1] || { x: px, y: cannonY };
                ctx.arc(lastPt.x, cannonY, 5, 0, Math.PI * 2);
                ctx.fill();
              }
            }

            ctx.fillStyle = 'rgba(244, 63, 94, 0.85)';
            ctx.beginPath();
            ctx.roundRect(width - 120, 20, 100, 30, 8);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('🚀 LAUNCH', width - 100, 38);

            ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(15, 15, width - 150, 70, 16);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('Kinetics: Projectile Motion', 30, 35);
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '11px sans-serif';
            ctx.fillText(`Angle: ${angleDeg}° • Speed: ${launchSpeed} m/s • Gravity: ${gravityVal} m/s²`, 30, 53);
          }
        }
        else if (lowerSubject.includes('math') || lowerSubject.includes('algebra') || lowerSubject.includes('geometry') || lowerTitle.includes('math')) {
          // --- MATHEMATICS SIMULATION ---
          const isShape = lowerTopic.includes('shape') || lowerTopic.includes('area') || lowerTopic.includes('geometry') || lowerTopic.includes('circle') || lowerTopic.includes('triangle');
          if (isShape) {
            const shapeSize = params.radius ?? params.size ?? 40;
            const mx = cx;
            const my = cy + 40;
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 3;
            ctx.fillStyle = 'rgba(14, 165, 233, 0.1)';

            if (lowerTopic.includes('circle') || !lowerTopic.includes('triangle')) {
              ctx.beginPath();
              ctx.arc(mx, my, shapeSize, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.strokeStyle = '#fb7185';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(mx, my);
              ctx.lineTo(mx + shapeSize, my);
              ctx.stroke();

              const area = Math.PI * shapeSize * shapeSize;
              const perimeter = 2 * Math.PI * shapeSize;
              ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
              ctx.strokeStyle = '#0ea5e9';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.roundRect(15, 15, width - 30, 70, 16);
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 12px sans-serif';
              ctx.fillText('Geometry: Circle Area Solver', 30, 35);
              ctx.fillStyle = '#a1a1aa';
              ctx.font = '11px sans-serif';
              ctx.fillText(`Radius (r): ${shapeSize.toFixed(0)}px • Area: ${area.toFixed(0)}px² • Circumference: ${perimeter.toFixed(0)}px`, 30, 53);
            } else {
              ctx.beginPath();
              ctx.moveTo(mx, my - shapeSize);
              ctx.lineTo(mx - shapeSize, my + shapeSize);
              ctx.lineTo(mx + shapeSize, my + shapeSize);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();

              const area = shapeSize * 2 * shapeSize * 0.5;
              ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
              ctx.strokeStyle = '#0ea5e9';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.roundRect(15, 15, width - 30, 70, 16);
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 12px sans-serif';
              ctx.fillText('Geometry: Triangle Area Solver', 30, 35);
              ctx.fillStyle = '#a1a1aa';
              ctx.font = '11px sans-serif';
              ctx.fillText(`Base: ${(shapeSize * 2).toFixed(0)}px • Height: ${shapeSize.toFixed(0)}px • Area: ${area.toFixed(0)}px²`, 30, 53);
            }
          } else {
            drawGrid(ctx, cx, cy + 40);
            const slope = params.m ?? 1.5;
            const intercept = params.c ?? 0;
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 3;
            ctx.beginPath();
            let first = true;
            for (let px = 30; px < width - 30; px++) {
              const x = (px - cx) / 30;
              const y = slope * x + intercept;
              const py = (cy + 40) - y * 30;
              if (py > 80 && py < height - 20) {
                if (first) { ctx.moveTo(px, py); first = false; }
                else ctx.lineTo(px, py);
              }
            }
            ctx.stroke();

            ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
            ctx.strokeStyle = '#0ea5e9';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(15, 15, width - 30, 70, 16);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('Algebra: Linear Equation Plotter y = mx + c', 30, 35);
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '11px sans-serif';
            ctx.fillText(`Slope (m): ${slope.toFixed(2)} • Intercept (c): ${intercept.toFixed(1)}`, 30, 53);
          }
        }
        else if (lowerSubject.includes('history') || lowerSubject.includes('social') || lowerTitle.includes('history') || lowerTitle.includes('timeline')) {
          // --- HISTORY SIMULATION ---
          const activeYear = params.year ?? 1947;
          const railY = cy + 45;
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(50, railY);
          ctx.lineTo(width - 50, railY);
          ctx.stroke();

          const milestones = [
            { year: 1947, label: 'Independence', desc: 'India gains independence from British colonial rule on August 15.', x: 50 },
            { year: 1950, label: 'Republic State', desc: 'Constitution of India comes into effect on January 26.', x: 50 + (width - 100) * 0.2 },
            { year: 1969, label: 'ISRO Founded', desc: 'Indian Space Research Organisation is established to lead space efforts.', x: 50 + (width - 100) * 0.4 },
            { year: 1991, label: 'Economic Reforms', desc: 'New Economic Policy opens up markets, transforming corporate landscape.', x: 50 + (width - 100) * 0.65 },
            { year: 2024, label: 'Future Education OS', desc: 'Dynamic AI classroom interfaces revolutionize learning in India.', x: width - 50 }
          ];

          milestones.forEach((m) => {
            const isActive = activeYear >= m.year;
            ctx.fillStyle = isActive ? '#fb7185' : '#4b5563';
            ctx.beginPath();
            ctx.arc(m.x, railY, isActive ? 9 : 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isActive ? '#ffffff' : '#9ca3af';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(m.year.toString(), m.x - 12, railY - 15);
          });

          const activeMilestone = [...milestones].reverse().find(m => activeYear >= m.year) || milestones[0];
          ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
          ctx.strokeStyle = '#fb7185';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(15, 15, width - 30, 70, 16);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(`Milestone Event: ${activeMilestone.label} (${activeMilestone.year})`, 30, 35);
          ctx.fillStyle = '#a1a1aa';
          ctx.font = '11px sans-serif';
          ctx.fillText(activeMilestone.desc, 30, 53);
        }
        else if (lowerSubject.includes('geography')) {
          // --- GEOGRAPHY SIMULATION ---
          const driftVal = params.drift ?? 5;
          const windVal = params.wind ?? 15;
          const mx = cx;
          const my = cy + 40;

          const time = Date.now() * 0.001 * driftVal;
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
          ctx.beginPath();
          ctx.arc(mx, my, 60, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.beginPath();
          ctx.arc(mx - 20 + Math.sin(time) * 15, my + Math.cos(time) * 10, 25, 0, Math.PI * 2);
          ctx.arc(mx + 30 + Math.cos(time * 0.8) * 10, my - Math.sin(time * 0.8) * 8, 20, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 5; i++) {
            const windY = my - 50 + i * 25;
            const windXOffset = (Date.now() * 0.02 * windVal + i * 50) % (width - 100);
            ctx.beginPath();
            ctx.moveTo(mx - 80 + windXOffset % 160, windY);
            ctx.lineTo(mx - 60 + windXOffset % 160, windY);
            ctx.stroke();
          }

          ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(15, 15, width - 30, 70, 16);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('Geography: Tectonic Plates & Wind Circulation', 30, 35);
          ctx.fillStyle = '#a1a1aa';
          ctx.font = '11px sans-serif';
          ctx.fillText(`Tectonic Drift Speed: ${driftVal}x • Monsoon Winds: ${windVal} m/s`, 30, 53);
        }
        else if (lowerSubject.includes('accounting') || lowerSubject.includes('economics')) {
          if (lowerSubject.includes('accounting')) {
            const revenue = params.revenue ?? 10000;
            const expenses = params.expenses ?? 6500;
            const netProfit = revenue - expenses;

            const mx = cx;
            const my = cy + 40;

            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(mx - 150, my - 20); ctx.lineTo(mx + 150, my - 20);
            ctx.moveTo(mx, my - 20); ctx.lineTo(mx, my + 60);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px monospace';
            ctx.fillText('Debit (Dr)', mx - 130, my - 30);
            ctx.fillText('Credit (Cr)', mx + 70, my - 30);

            ctx.fillStyle = '#ef4444';
            ctx.fillText(`Operating Exp: $${expenses.toLocaleString()}`, mx - 130, my + 10);
            ctx.fillStyle = '#10b981';
            ctx.fillText(`Gross Revenue: $${revenue.toLocaleString()}`, mx + 10, my + 10);

            ctx.fillStyle = '#fbbf24';
            ctx.fillText(`Net Profit: $${netProfit.toLocaleString()}`, mx + 10, my + 40);

            ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(15, 15, width - 30, 70, 16);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('Accounting: Double-Entry T-Ledger Statement', 30, 35);
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '11px sans-serif';
            ctx.fillText(`Adjust sales and expenses to watch balancing ledger update live.`, 30, 53);
          } else {
            const price = params.price ?? 50;
            const demandShift = params.demandShift ?? 0;

            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 120, cy + 100);
            ctx.lineTo(cx + 120, cy + 100);
            ctx.moveTo(cx - 120, cy - 100);
            ctx.lineTo(cx - 120, cy + 100);
            ctx.stroke();

            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx - 100, cy - 80 + demandShift);
            ctx.lineTo(cx + 100, cy + 80 + demandShift);
            ctx.stroke();

            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx - 100, cy + 80);
            ctx.lineTo(cx + 100, cy - 80);
            ctx.stroke();

            const eqX = cx + demandShift / 2;
            const eqY = cy + demandShift / 2;
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(eqX, eqY, 6, 0, Math.PI * 2);
            ctx.fill();

            const sliderY = cy + 100 - (price * 2);
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 120, sliderY);
            ctx.lineTo(cx + 120, sliderY);
            ctx.stroke();

            ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(15, 15, width - 30, 70, 16);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('Economics: Market Equilibrium & Supply Curve', 30, 35);
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '11px sans-serif';
            ctx.fillText(`Demand Shift: ${demandShift > 0 ? '+' : ''}${demandShift} • Current Price: $${price}`, 30, 53);
          }
        }
        else if (lowerSubject.includes('statistics')) {
          const mean = params.mean ?? 0;
          const std = params.std ?? 1;

          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let px = 30; px < width - 30; px++) {
            const x = (px - cx) / 40;
            const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(std, 2));
            const y = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
            const py = (cy + 60) - y * 120;
            if (px === 30) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(15, 15, width - 30, 70, 16);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('Statistics: Normal distribution bell curve', 30, 35);
          ctx.fillStyle = '#a1a1aa';
          ctx.font = '11px sans-serif';
          ctx.fillText(`Mean (μ): ${mean.toFixed(1)} • Standard Dev (σ): ${std.toFixed(2)}`, 30, 53);
        }
        else {
          const gravity = params.gravity ?? 9.8;
          const particlesCount = 25;
          ctx.fillStyle = '#6366f1';
          for (let i = 0; i < particlesCount; i++) {
            const seed = i * 23.4;
            const speed = 0.5 + (seed % 3) * 0.3;
            const t = Date.now() * 0.001 * speed;
            const px = ((seed + t * 50) % (width - 60)) + 30;
            const bounceHeight = 80 - (gravity * 3);
            const py = cy + 40 + Math.abs(Math.sin(t + seed)) * -bounceHeight;
            ctx.beginPath();
            ctx.arc(px, py, 4 + (i % 4), 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.strokeStyle = '#4338ca';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(20, cy + 42);
          ctx.lineTo(width - 20, cy + 42);
          ctx.stroke();

          ctx.fillStyle = 'rgba(15, 12, 30, 0.85)';
          ctx.strokeStyle = '#4f46e5';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(15, 15, width - 30, 70, 16);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '11px sans-serif';
          ctx.fillText(`Adjust slider controls to modify local gravitational pull (${gravity} m/s²).`, 30, 58);
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    const handleCanvasClick = (e: MouseEvent) => {
      if (type === 'projectile_motion') {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        if (clickX >= width - 120 && clickX <= width - 20 && clickY >= 20 && clickY <= 50) {
          const angleRad = ((params.angle || 45) * Math.PI) / 180;
          const speed = params.speed || 20;
          projectileStateRef.current = {
            x: 20,
            y: height - 40,
            vx: speed * Math.cos(angleRad) * 4,
            vy: -speed * Math.sin(angleRad) * 4,
            t: 0,
            path: [],
          };
        }
      }
    };
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
      if (canvas) canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [three_js_config, params, show2DInterpretation, _subject, sketchfab_hint]);

  const handleSliderChange = (key: string, val: number) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  const isSketchfab = !!sketchfab_hint;

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex flex-col bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden ${
        isFullscreen ? 'p-4' : 'backdrop-blur-md'
      }`}
    >
      {/* Dynamic Lab Guide Description */}
      {three_js_config?.description && (
        <div className="p-3.5 bg-indigo-950/20 border-b border-zinc-800 text-xs text-zinc-300">
          <strong>🔬 Lab Guide: </strong> {three_js_config.description}
        </div>
      )}

      <div className="flex-1 min-h-[300px] relative flex flex-col md:flex-row">
        {/* Switch button overlay for Sketchfab models */}
        {isSketchfab && (
          <div className="absolute top-3 left-3 z-20 flex gap-2">
            <button
              type="button"
              onClick={() => setShow2DInterpretation(!show2DInterpretation)}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg shadow-black/50 active:scale-95 border border-indigo-400/20"
            >
              {show2DInterpretation ? "🔬 Switch to 3D View" : "🎨 Switch to Interactive 2D Simulation"}
            </button>

            {/* Fullscreen Button */}
            {!show2DInterpretation && (
              <button
                type="button"
                onClick={toggleFullscreen}
                className="px-3.5 py-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 border border-zinc-800 flex items-center gap-1.5"
              >
                <span>{isFullscreen ? "🗖 Exit Fullscreen" : "🗖 Go Fullscreen"}</span>
              </button>
            )}
          </div>
        )}

        {isSketchfab && !show2DInterpretation ? (
          <div className={`flex-1 flex w-full h-full min-h-[450px] ${
            isFullscreen ? 'flex-col md:flex-row' : 'flex-col'
          }`}>
            {/* Iframe View */}
            <div className={`flex-1 relative ${
              isFullscreen ? 'min-h-[300px] md:min-h-0 h-full' : 'h-[320px] min-h-[320px]'
            }`}>
              {sketchfabLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-10">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-zinc-400 text-sm">Loading 3D Model from Sketchfab...</p>
                </div>
              )}
              <iframe
                ref={iframeRef}
                id="sketchfab-iframe"
                title="3D Model Viewer"
                className="w-full h-full border-none"
                allow="autoplay; fullscreen; xr-spatial-tracking"
              />
            </div>

            {/* Interactive Annotations Panel */}
            {annotations.length > 0 && (
              <div className={`${
                isFullscreen 
                  ? 'w-full md:w-72 border-t md:border-t-0 md:border-l' 
                  : 'w-full border-t border-zinc-800'
              } bg-zinc-950/80 p-4 overflow-y-auto flex flex-col gap-2.5 max-h-[250px] md:max-h-none flex-1`}>
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <span>📍 Hotspots</span>
                  <span className="px-1.5 py-0.5 bg-indigo-500/20 text-[9px] rounded-full text-indigo-300 font-mono">{annotations.length}</span>
                </h4>
                <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                  {annotations.map((ann, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAnnotation(idx)}
                      className={`text-left p-3 rounded-xl text-xs transition-all flex flex-col gap-1 border ${
                        selectedAnnotationIndex === idx
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium shadow-md shadow-indigo-500/10'
                          : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] transition-colors ${
                          selectedAnnotationIndex === idx ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {idx + 1}
                        </span>
                        {ann.name || `Annotation ${idx + 1}`}
                      </span>
                      {selectedAnnotationIndex === idx && ann.description && (
                        <p className="text-[10px] text-zinc-300 font-normal leading-relaxed mt-2 pt-2 border-t border-zinc-800">
                          {ann.description.replace(/<[^>]*>/g, '') /* strip html */}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (three_js_config || show2DInterpretation) ? (
          <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/80">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-lg"></div>
              <div className="absolute inset-0 border-2 border-t-indigo-500 rounded-lg animate-spin"></div>
            </div>
            <p className="mt-4 text-zinc-400 text-sm font-medium">Virtual 3D Model Loading...</p>
          </div>
        )}
      </div>

      {/* Control sliders */}
      {(three_js_config || show2DInterpretation) && (
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex flex-col gap-3">
          {/* 1. Dynamic Sliders from config */}
          {three_js_config?.controls && three_js_config.controls.map((control) => {
            const val = Number(params[control.name] ?? control.defaultValue ?? 0);
            return (
              <div key={control.name} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <span>{control.label}</span>
                  <span className="text-indigo-400 font-mono">
                    {isNaN(val) ? '0.0' : val.toFixed(1)} {control.unit || ''}
                  </span>
                </div>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={val}
                  onChange={(e) => handleSliderChange(control.name, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            );
          })}

          {/* 2. Legacy fallback sliders */}
          {three_js_config && !three_js_config.controls && three_js_config.sliders && three_js_config.sliders.map((sliderKey) => {
            let min = 0;
            let max = 100;
            let step = 1;
            let label = sliderKey;

            if (sliderKey === 'a') { min = -5; max = 5; step = 0.1; label = 'Curvature (a)' }
            else if (sliderKey === 'b') { min = -10; max = 10; step = 0.5; label = 'Slope offset (b)' }
            else if (sliderKey === 'c') { min = -10; max = 10; step = 0.5; label = 'Y-Intercept (c)' }
            else if (sliderKey === 'm') { min = -5; max = 5; step = 0.1; label = 'Slope (m)' }
            else if (sliderKey === 'amplitude') { min = 0.5; max = 4; step = 0.1; label = 'Amplitude (A)' }
            else if (sliderKey === 'frequency') { min = 0.2; max = 5; step = 0.1; label = 'Frequency (f)' }
            else if (sliderKey === 'mean') { min = -5; max = 5; step = 0.1; label = 'Mean (μ)' }
            else if (sliderKey === 'std') { min = 0.2; max = 3; step = 0.1; label = 'Standard Deviation (σ)' }
            else if (sliderKey === 'angle') { min = 10; max = 80; step = 1; label = 'Launch Angle (θ)' }
            else if (sliderKey === 'speed') { min = 5; max = 45; step = 1; label = 'Initial Speed (v)' }
            else if (sliderKey === 'gravity') { min = 2; max = 25; step = 0.2; label = 'Gravity (g)' }
            else if (sliderKey === 'voltage') { min = 2; max = 24; step = 1; label = 'Voltage (V)' }
            else if (sliderKey === 'resistance') { min = 1; max = 20; step = 0.5; label = 'Resistance (R)' }
            else if (sliderKey === 'pour') { min = 0; max = 100; step = 1; label = 'Pour Amount (%)' }
            else if (sliderKey === 'temperature') { min = 0; max = 100; step = 1; label = 'Reaction Temp (°C)' }

            const val = Number(params[sliderKey] ?? 0);

            return (
              <div key={sliderKey} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <span>{label}</span>
                  <span className="text-indigo-400 font-mono">{isNaN(val) ? '0.0' : val.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={val}
                  onChange={(e) => handleSliderChange(sliderKey, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            );
          })}

          {/* 3. Custom interactive 2D Simulation sliders (when no config) */}
          {!three_js_config && show2DInterpretation && (() => {
            const lowerSubject = _subject.toLowerCase();
            const lowerTitle = (sketchfab_hint || '').toLowerCase();
            const lowerTopic = ((three_js_config as any)?.title || '').toLowerCase();
            
            const isBio = lowerSubject.includes('biology') || lowerSubject.includes('fungi') || lowerSubject.includes('life') || lowerTitle.includes('fungi') || lowerTitle.includes('mushroom') || lowerTitle.includes('cell') || lowerTitle.includes('mitosis');
            const isChem = lowerSubject.includes('chemistry') || lowerTitle.includes('molecule') || lowerTitle.includes('atom');
            const isGeog = lowerSubject.includes('geography');
            const isAcct = lowerSubject.includes('accounting');
            const isStats = lowerSubject.includes('statistics');
            const isEcon = lowerSubject.includes('economics');
            const isPhysics = lowerSubject.includes('physics') || lowerTitle.includes('circuit') || lowerTitle.includes('wave') || lowerTitle.includes('optics') || lowerTitle.includes('kinetics');
            const isMath = lowerSubject.includes('math') || lowerSubject.includes('algebra') || lowerSubject.includes('geometry') || lowerTitle.includes('math');
            const isHistory = lowerSubject.includes('history') || lowerSubject.includes('social') || lowerTitle.includes('history') || lowerTitle.includes('timeline');

            if (isBio) {
              const isMitosis = lowerTopic.includes('mitosis') || lowerTopic.includes('split') || lowerTopic.includes('division');
              if (isMitosis) {
                const phaseVal = params.mitosisPhase ?? 1;
                return (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Mitosis Division Phase</span>
                      <span className="text-indigo-400 font-mono">Phase {phaseVal.toFixed(0)}</span>
                    </div>
                    <input type="range" min="1" max="5" step="1" value={phaseVal} onChange={e => handleSliderChange('mitosisPhase', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                );
              }
              const rateVal = params.rate ?? 50;
              const windVal = params.wind ?? 10;
              return (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Spore Release Rate</span>
                      <span className="text-indigo-400 font-mono">{rateVal.toFixed(0)}</span>
                    </div>
                    <input type="range" min="10" max="100" step="5" value={rateVal} onChange={e => handleSliderChange('rate', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Wind Velocity</span>
                      <span className="text-indigo-400 font-mono">{windVal.toFixed(0)} m/s</span>
                    </div>
                    <input type="range" min="0" max="40" step="2" value={windVal} onChange={e => handleSliderChange('wind', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                </>
              );
            }
            if (isChem) {
              const protVal = params.protons ?? 6;
              const elecVal = params.electrons ?? 6;
              const energyVal = params.energy ?? 1;
              return (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Protons / Neutrons</span>
                      <span className="text-indigo-400 font-mono">{protVal.toFixed(0)}</span>
                    </div>
                    <input type="range" min="1" max="10" step="1" value={protVal} onChange={e => handleSliderChange('protons', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Electrons Count</span>
                      <span className="text-indigo-400 font-mono">{elecVal.toFixed(0)}</span>
                    </div>
                    <input type="range" min="1" max="10" step="1" value={elecVal} onChange={e => handleSliderChange('electrons', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Excitation Level</span>
                      <span className="text-indigo-400 font-mono">Shell {energyVal.toFixed(0)}</span>
                    </div>
                    <input type="range" min="1" max="3" step="1" value={energyVal} onChange={e => handleSliderChange('energy', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                </>
              );
            }
            if (isGeog) {
              const driftVal = params.drift ?? 5;
              const windVal = params.wind ?? 15;
              return (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Tectonic Drift Speed</span>
                      <span className="text-indigo-400 font-mono">{driftVal.toFixed(0)}x</span>
                    </div>
                    <input type="range" min="1" max="10" step="1" value={driftVal} onChange={e => handleSliderChange('drift', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Monsoon Winds Force</span>
                      <span className="text-indigo-400 font-mono">{windVal.toFixed(0)} m/s</span>
                    </div>
                    <input type="range" min="0" max="40" step="2" value={windVal} onChange={e => handleSliderChange('wind', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                </>
              );
            }
            if (isAcct) {
              const revVal = params.revenue ?? 10000;
              const expVal = params.expenses ?? 6500;
              return (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Gross Sales Revenue</span>
                      <span className="text-indigo-400 font-mono">${revVal.toLocaleString()}</span>
                    </div>
                    <input type="range" min="1000" max="25000" step="500" value={revVal} onChange={e => handleSliderChange('revenue', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Operating Expenses</span>
                      <span className="text-indigo-400 font-mono">${expVal.toLocaleString()}</span>
                    </div>
                    <input type="range" min="500" max="15000" step="250" value={expVal} onChange={e => handleSliderChange('expenses', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                </>
              );
            }
            if (isStats) {
              const meanVal = params.mean ?? 0;
              const stdVal = params.std ?? 1;
              return (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Mean Offset (μ)</span>
                      <span className="text-indigo-400 font-mono">{meanVal.toFixed(1)}</span>
                    </div>
                    <input type="range" min="-3" max="3" step="0.1" value={meanVal} onChange={e => handleSliderChange('mean', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Standard Deviation (σ)</span>
                      <span className="text-indigo-400 font-mono">{stdVal.toFixed(2)}</span>
                    </div>
                    <input type="range" min="0.2" max="2.5" step="0.05" value={stdVal} onChange={e => handleSliderChange('std', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                </>
              );
            }
            if (isEcon) {
              const priceVal = params.price ?? 50;
              const shiftVal = params.demandShift ?? 0;
              return (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Market Retail Price</span>
                      <span className="text-indigo-400 font-mono">${priceVal.toFixed(0)}</span>
                    </div>
                    <input type="range" min="10" max="90" step="1" value={priceVal} onChange={e => handleSliderChange('price', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Demand Curve Shift</span>
                      <span className="text-indigo-400 font-mono">{shiftVal > 0 ? '+' : ''}{shiftVal.toFixed(0)}</span>
                    </div>
                    <input type="range" min="-50" max="50" step="5" value={shiftVal} onChange={e => handleSliderChange('demandShift', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                </>
              );
            }
            if (isPhysics) {
              const isWave = lowerTopic.includes('wave');
              if (isWave) {
                const ampVal = params.amplitude ?? 2;
                const freqVal = params.frequency ?? 1.5;
                return (
                  <>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-semibold text-zinc-400">
                        <span>Wave Amplitude</span>
                        <span className="text-indigo-400 font-mono">{ampVal.toFixed(1)}</span>
                      </div>
                      <input type="range" min="0.5" max="4" step="0.1" value={ampVal} onChange={e => handleSliderChange('amplitude', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-semibold text-zinc-400">
                        <span>Wave Frequency</span>
                        <span className="text-indigo-400 font-mono">{freqVal.toFixed(2)}Hz</span>
                      </div>
                      <input type="range" min="0.2" max="5" step="0.1" value={freqVal} onChange={e => handleSliderChange('frequency', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                    </div>
                  </>
                );
              }
              const angleVal = params.angle ?? 45;
              const speedVal = params.speed ?? 20;
              const gravVal = params.gravity ?? 9.8;
              return (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Launch Angle (θ)</span>
                      <span className="text-indigo-400 font-mono">{angleVal.toFixed(0)}°</span>
                    </div>
                    <input type="range" min="10" max="80" step="1" value={angleVal} onChange={e => handleSliderChange('angle', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Initial Speed (v)</span>
                      <span className="text-indigo-400 font-mono">{speedVal.toFixed(0)} m/s</span>
                    </div>
                    <input type="range" min="5" max="45" step="1" value={speedVal} onChange={e => handleSliderChange('speed', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Gravity Acceleration (g)</span>
                      <span className="text-indigo-400 font-mono">{gravVal.toFixed(1)} m/s²</span>
                    </div>
                    <input type="range" min="1" max="25" step="0.5" value={gravVal} onChange={e => handleSliderChange('gravity', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                </>
              );
            }
            if (isMath) {
              const isShape = lowerTopic.includes('shape') || lowerTopic.includes('area') || lowerTopic.includes('geometry') || lowerTopic.includes('circle') || lowerTopic.includes('triangle');
              if (isShape) {
                const shapeSize = params.radius ?? params.size ?? 40;
                return (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Shape Size / Radius</span>
                      <span className="text-indigo-400 font-mono">{shapeSize.toFixed(0)}px</span>
                    </div>
                    <input type="range" min="15" max="90" step="1" value={shapeSize} onChange={e => handleSliderChange('radius', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                );
              }
              const mVal = params.m ?? 1.5;
              const cVal = params.c ?? 0;
              return (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Slope (m)</span>
                      <span className="text-indigo-400 font-mono">{mVal.toFixed(2)}</span>
                    </div>
                    <input type="range" min="-3" max="3" step="0.1" value={mVal} onChange={e => handleSliderChange('m', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>Intercept (c)</span>
                      <span className="text-indigo-400 font-mono">{cVal.toFixed(1)}</span>
                    </div>
                    <input type="range" min="-4" max="4" step="0.2" value={cVal} onChange={e => handleSliderChange('c', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                </>
              );
            }
            if (isHistory) {
              const yearVal = params.year ?? 1947;
              return (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold text-zinc-400">
                    <span>Timeline Year</span>
                    <span className="text-indigo-400 font-mono">{yearVal.toFixed(0)}</span>
                  </div>
                  <input type="range" min="1947" max="2024" step="1" value={yearVal} onChange={e => handleSliderChange('year', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
              );
            }

            const gravVal = params.gravity ?? 9.8;
            return (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <span>Gravitational Acceleration</span>
                  <span className="text-indigo-400 font-mono">{gravVal.toFixed(1)} m/s²</span>
                </div>
                <input type="range" min="1" max="25" step="0.5" value={gravVal} onChange={e => handleSliderChange('gravity', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
