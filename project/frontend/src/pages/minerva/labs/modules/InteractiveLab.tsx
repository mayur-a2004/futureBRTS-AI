import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Sliders, Activity, Beaker, HelpCircle, Flame, Maximize2, Minimize2 } from 'lucide-react';
import { SubjectType } from '../types/LabConfig';

interface InteractiveLabProps {
  subject: SubjectType;
  topic: string;
  interactiveConfig?: {
    type: 'geogebra' | 'phet' | 'chemistry' | null;
    query?: string;
    phet_url?: string;
  } | null;
}

const PHET_SIMS: Record<string, string> = {
  'ohms-law': 'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_en.html',
  'ohms_law': 'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_en.html',
  'ohm': 'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_en.html',
  'circuits': 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html',
  'circuit': 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html',
  'waves': 'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html',
  'wave': 'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html',
  'optics': 'https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics_en.html',
  'lens': 'https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics_en.html',
  'mirror': 'https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics_en.html',
  'bending-light': 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_en.html',
  'bending_light': 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_en.html',
  'refraction': 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_en.html',
  'forces': 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html',
  'friction': 'https://phet.colorado.edu/sims/html/friction/latest/friction_en.html',
  'gravity': 'https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab_en.html',
  'orbit': 'https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab_en.html',
  'gas': 'https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_en.html',
  'matter': 'https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter_en.html',
  'energy': 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_en.html',
  'skate': 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_en.html',
  'pendulum': 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_en.html',
  'projectile': 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
  'motion': 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
  'spring': 'https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs_en.html',
  'hooke': 'https://phet.colorado.edu/sims/html/hookes-law/latest/hookes-law_en.html',
  'static': 'https://phet.colorado.edu/sims/html/balloons-and-static-electricity/latest/balloons-and-static-electricity_en.html',
  'charge': 'https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_en.html',
  'capacitor': 'https://phet.colorado.edu/sims/html/capacitor-lab-basics/latest/capacitor-lab-basics_en.html',
  'coulomb': 'https://phet.colorado.edu/sims/html/coulombs-law/latest/coulombs-law_en.html',
  'pressure': 'https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_en.html',
  'fluid': 'https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_en.html',
  'density': 'https://phet.colorado.edu/sims/html/density/latest/density_en.html',
  'buoyancy': 'https://phet.colorado.edu/sims/html/buoyancy/latest/buoyancy_en.html',
  'rutherford': 'https://phet.colorado.edu/sims/html/rutherford-scattering/latest/rutherford-scattering_en.html',
  'atom': 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html',
  'molecule': 'https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_en.html',
  'ph': 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html',
  'acid-base': 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html',
  'concentration': 'https://phet.colorado.edu/sims/html/concentration/latest/concentration_en.html',
  'beers-law': 'https://phet.colorado.edu/sims/html/beers-law-lab/latest/beers-law-lab_en.html',
  'reactants': 'https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_en.html',
  'fraction': 'https://phet.colorado.edu/sims/html/fraction-matcher/latest/fraction-matcher_en.html',
  'calculus': 'https://phet.colorado.edu/sims/html/calculus-grapher/latest/calculus-grapher_en.html',
  'quadratics': 'https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics_en.html',
  'lines': 'https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines_en.html',
  'probability': 'https://phet.colorado.edu/sims/html/plinko-probability/latest/plinko-probability_en.html',
  'general_physics': 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html'
};

const sanitizeGgbQuery = (query: string): string => {
  if (!query) return 'y = sin(x)';
  let q = query.trim();
  
  if (q.toLowerCase().includes('i = v/r') || q.toLowerCase().includes('i=v/r')) {
    return 'y = 10 / x';
  }
  if (q.toLowerCase().includes('v = i*r') || q.toLowerCase().includes('v=i*r') || q.toLowerCase().includes('v = ir')) {
    return 'y = 2 * x';
  }
  if (q.toLowerCase().includes('f = m*a') || q.toLowerCase().includes('f=m*a') || q.toLowerCase().includes('f = ma')) {
    return 'y = 5 * x';
  }

  if (!q.includes('=')) {
    q = `y = ${q}`;
  }
  
  const parts = q.split('=');
  if (parts.length === 2) {
    let lhs = parts[0].trim().toLowerCase();
    let rhs = parts[1].trim();
    
    rhs = rhs.replace(/\b(v|r|i|f|m|a|t|d|v|u|k|q|p|g|z|w|s)\b/gi, 'x');
    
    if (lhs !== 'y' && !lhs.startsWith('f(') && !lhs.startsWith('g(')) {
      lhs = 'y';
    }
    q = `${lhs} = ${rhs}`;
  }
  return q;
};

export const InteractiveLab: React.FC<InteractiveLabProps> = ({ subject, topic, interactiveConfig }) => {
  const simType = interactiveConfig?.type || (subject === 'mathematics' ? 'geogebra' : subject === 'chemistry' ? 'chemistry' : 'phet');
  
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Lock body scroll while fullscreen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFullScreen]);

  // ESC to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullScreen]);

  // Script loaded flag for GeoGebra
  const [ggbLoaded, setGgbLoaded] = useState(false);
  const ggbInjected = useRef(false);

  // 1. PhET Simulation URL Resolver
  const getPhetUrl = () => {
    const hint = (interactiveConfig?.phet_url || topic || 'general_physics').toLowerCase();
    for (const key of Object.keys(PHET_SIMS)) {
      if (hint.includes(key)) {
        return PHET_SIMS[key];
      }
    }
    return PHET_SIMS['general_physics'];
  };

  // 2. Chemistry Titration Lab State
  const [beakerPH, setBeakerPH] = useState(13.0); // Starts alkaline (NaOH)
  const [addedAcidVolume, setAddedAcidVolume] = useState(0); // mL
  const [flowRate, setFlowRate] = useState(0); // drops per second (0 = closed tap)
  const [acidMolarity, setAcidMolarity] = useState(1.0); // M
  const [temperature, setTemperature] = useState(25.0); // Room temperature °C
  const [neutralized, setNeutralized] = useState(false);
  const [droplets, setDroplets] = useState<{ id: number; top: number }[]>([]);
  const dropCounter = useRef(0);
  const intervalRef = useRef<any>(null);

  // 3. Load GeoGebra CDN Script
  useEffect(() => {
    if (simType !== 'geogebra') return;
    
    // Check if script is already present
    if (window.hasOwnProperty('GGBApplet')) {
      setGgbLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.geogebra.org/apps/deployggb.js';
    script.async = true;
    script.onload = () => setGgbLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Clean up if needed
    };
  }, [simType]);

  // 4. Inject GeoGebra Applet
  useEffect(() => {
    if (simType !== 'geogebra' || !ggbLoaded || ggbInjected.current) return;

    try {
      const queryExpr = interactiveConfig?.query || 'y = sin(x)';
      const parameters = {
        id: "ggbApplet",
        width: 600,
        height: 400,
        showMenuBar: false,
        showAlgebraInput: true,
        showToolBar: false,
        showResetIcon: true,
        useBrowserForJS: true,
        preventFocus: true,
        enableShiftDragZoom: true,
        appName: "graphing",
        appletOnLoad: (api: any) => {
          const originalAlert = window.alert;
          window.alert = (msg) => {
            console.warn("Intercepted GeoGebra alert:", msg);
          };
          try {
            const sanitized = sanitizeGgbQuery(queryExpr);
            api.evalCommand(sanitized);
          } catch (err) {
            console.error("GeoGebra evaluation failed:", err);
          } finally {
            setTimeout(() => {
              window.alert = originalAlert;
            }, 500);
          }
        }
      };

      const applet = new (window as any).GGBApplet(parameters, true);
      applet.inject('ggb-element');
      ggbInjected.current = true;
    } catch (e) {
      console.error("Failed to inject GeoGebra applet:", e);
    }
  }, [ggbLoaded, simType, interactiveConfig]);

  // 5. Chemistry Simulator Tick Interval (Liquid Flow/Neutralization reaction)
  useEffect(() => {
    if (simType !== 'chemistry') return;

    if (flowRate > 0) {
      intervalRef.current = setInterval(() => {
        // Add droplet animation
        const newDropId = dropCounter.current++;
        setDroplets(prev => [...prev, { id: newDropId, top: 0 }]);

        // Math calculations for neutralization
        // NaOH starting: 100 mL of 0.1 M -> 10 millimoles NaOH
        // Added HCl: volume (mL) * molarity (M)
        setAddedAcidVolume(prevVol => {
          const deltaVol = 0.05 * flowRate; // 0.05 mL per drop
          const nextVol = prevVol + deltaVol;
          
          const HCl_mmoles = nextVol * acidMolarity;
          const NaOH_mmoles = 10.0; // Fixed starting base

          let nextPH = 7.0;
          let deltaTemp = 0;

          if (NaOH_mmoles > HCl_mmoles) {
            // Alkaline excess
            const remaining_NaOH_moles = (NaOH_mmoles - HCl_mmoles) / 1000;
            const totalVol_L = (100 + nextVol) / 1000;
            const OH_concentration = remaining_NaOH_moles / totalVol_L;
            const pOH = -Math.log10(OH_concentration);
            nextPH = 14.0 - pOH;
            // Exothermic heat curve
            deltaTemp = (HCl_mmoles / NaOH_mmoles) * 28.0;
          } else if (HCl_mmoles > NaOH_mmoles) {
            // Acid excess
            const remaining_HCl_moles = (HCl_mmoles - NaOH_mmoles) / 1000;
            const totalVol_L = (100 + nextVol) / 1000;
            const H_concentration = remaining_HCl_moles / totalVol_L;
            nextPH = -Math.log10(H_concentration);
            // Slowly cools down as excess cold acid dilutes the beaker
            deltaTemp = 28.0 - Math.min(20.0, (HCl_mmoles - NaOH_mmoles) * 0.4);
          } else {
            // Perfect equivalence point!
            nextPH = 7.0;
            deltaTemp = 28.0; // Max temperature delta (exothermic peak)
          }

          setBeakerPH(parseFloat(nextPH.toFixed(2)));
          setTemperature(parseFloat((25.0 + deltaTemp).toFixed(1)));
          
          if (Math.abs(nextPH - 7.0) < 0.2) {
            setNeutralized(true);
          } else {
            setNeutralized(false);
          }

          return nextVol;
        });

      }, 1000 / flowRate);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [flowRate, acidMolarity, simType]);

  // Droplet position animation ticks
  useEffect(() => {
    if (droplets.length === 0) return;
    const animation = setInterval(() => {
      setDroplets(prev =>
        prev
          .map(d => ({ ...d, top: d.top + 10 }))
          .filter(d => d.top < 140) // hit the beaker liquid surface
      );
    }, 50);
    return () => clearInterval(animation);
  }, [droplets]);

  // Reset Chemistry lab
  const handleResetChem = () => {
    setBeakerPH(13.0);
    setAddedAcidVolume(0);
    setFlowRate(0);
    setTemperature(25.0);
    setNeutralized(false);
    setDroplets([]);
  };

  // Get indicator color for Phenolphthalein
  const getIndicatorColor = () => {
    if (beakerPH >= 10.0) {
      return 'rgba(219, 39, 119, 0.8)'; // deep pink
    } else if (beakerPH > 8.2) {
      // Linear interpolation between colorless and pink
      const opacity = (beakerPH - 8.2) / 1.8;
      return `rgba(219, 39, 119, ${opacity * 0.8})`;
    } else {
      return 'rgba(224, 231, 255, 0.15)'; // transparent watery light blue
    }
  };

  const inner = (
    <div className="flex flex-col h-full bg-[#05040a] overflow-hidden">
      {/* ── Tab Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-black/40 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <Beaker className="text-indigo-400 w-4.5 h-4.5 shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">
            {simType === 'geogebra' ? 'GeoGebra Dynamic Math Lab' : simType === 'chemistry' ? 'Titration & Chemical Reaction Lab' : 'PhET Interactive Science Simulator'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {simType === 'chemistry' && (
            <button
              type="button"
              onClick={handleResetChem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-white/5"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullScreen(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border border-white/5"
            title={isFullScreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Mode'}
          >
            {isFullScreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            <span>{isFullScreen ? 'Exit' : 'Full'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Simulator Body ── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-5 custom-scrollbar">
        {simType === 'geogebra' && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            {!ggbLoaded && (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <span className="text-xs font-medium tracking-wide">Loading GeoGebra Applet CDN...</span>
              </div>
            )}
            <div id="ggb-element" className="w-full max-w-[600px] overflow-hidden rounded-2xl border border-indigo-500/20 bg-white shadow-xl shadow-indigo-950/20" />
            <p className="text-[10px] text-slate-500 mt-3 font-semibold uppercase tracking-wider text-center">
              💡 Formula: `{interactiveConfig?.query || 'y = sin(x)'}` injected into plotting engine.
            </p>
          </div>
        )}

        {simType === 'phet' && (
          <div className="flex flex-col h-full min-h-[420px] rounded-2xl overflow-hidden border border-indigo-500/20 bg-black">
            <iframe
              src={getPhetUrl()}
              allowFullScreen
              title="PhET HTML5 Simulation"
              className="w-full flex-1 border-none min-h-[380px] bg-[#000]"
            />
            <div className="bg-black/80 px-4 py-2 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-white/5">
              Powered by PhET™ Interactive Simulations (University of Colorado Boulder)
            </div>
          </div>
        )}

        {simType === 'chemistry' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
            {/* Left Column: Beaker & Titration Animation */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-4 bg-black/30 border border-white/5 rounded-2xl relative min-h-[320px]">
              {/* Droplets Layer */}
              <div className="absolute top-[80px] left-[50%] transform -translate-x-[50%] w-[10px] h-[140px] pointer-events-none overflow-hidden">
                {droplets.map(d => (
                  <div
                    key={d.id}
                    className="absolute w-[6px] h-[10px] bg-sky-400 rounded-full"
                    style={{ top: `${d.top}px`, left: '2px', opacity: 0.8 }}
                  />
                ))}
              </div>

              {/* Titration Burette SVG */}
              <svg width="60" height="120" className="mb-2 shrink-0 z-10">
                <rect x="25" y="0" width="10" height="80" fill="none" stroke="#6366f1" strokeWidth="2" opacity="0.4" />
                {/* Acid content level */}
                <rect x="26" y="20" width="8" height="60" fill="rgba(56, 189, 248, 0.3)" />
                {/* Valve tap */}
                <rect x="20" y="80" width="20" height="8" fill={flowRate > 0 ? "#10b981" : "#ef4444"} rx="2" />
                {/* Tip nozzle */}
                <polygon points="27,88 33,88 30,105" fill="#6366f1" opacity="0.6" />
              </svg>

              {/* Beaker SVG */}
              <div className="relative flex items-center justify-center">
                <svg width="120" height="130" className="z-10">
                  {/* Beaker Glass frame */}
                  <rect x="20" y="20" width="80" height="95" fill="none" stroke="#818cf8" strokeWidth="3" rx="4" opacity="0.5" />
                  <line x1="20" y1="20" x2="100" y2="20" stroke="#818cf8" strokeWidth="1" opacity="0.2" />
                  
                  {/* Liquid inside beaker */}
                  <rect
                    x="22"
                    y={Math.max(45, 112 - (100 + addedAcidVolume) * 0.3)} // Volume increases slightly
                    width="76"
                    height={Math.min(70, (100 + addedAcidVolume) * 0.3)}
                    fill={getIndicatorColor()}
                    rx="2"
                    className="transition-colors duration-200"
                  />

                  {/* Neutralization sparkle indicator */}
                  {neutralized && (
                    <circle cx="60" cy="80" r="10" fill="rgba(16, 185, 129, 0.2)" className="animate-ping" />
                  )}
                </svg>

                {/* Beaker liquid temperature gauge */}
                <div className="absolute right-[-45px] top-6 flex flex-col items-center gap-1 bg-black/60 px-2 py-1.5 rounded-lg border border-white/5">
                  <Flame size={12} className={temperature > 30 ? "text-amber-500 animate-bounce" : "text-slate-500"} />
                  <span className="text-[9px] font-black text-slate-300">{temperature}°C</span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="mt-4 w-full text-center">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  beakerPH > 8.2 
                    ? 'bg-pink-500/10 text-pink-300 border-pink-500/20' 
                    : beakerPH > 6.8 
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                }`}>
                  <span>Indicator: Phenolphthalein</span>
                  <span>•</span>
                  <span>{beakerPH > 8.2 ? 'Alkaline' : beakerPH > 6.8 ? 'Neutralized' : 'Acidic'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Simulation Parameters & Readouts */}
            <div className="md:col-span-6 flex flex-col gap-4">
              {/* Chemical Equation Widget */}
              <div className="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity size={12} />
                  <span>Neutralization Reaction</span>
                </h4>
                <code className="block font-mono text-xs text-white bg-black/40 px-3 py-2 rounded-xl border border-white/5 text-center">
                  HCl + NaOH &rarr; NaCl + H₂O + Heat
                </code>
              </div>

              {/* Readout stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-black/30 border border-white/5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Beaker pH</span>
                  <span className={`text-xl font-bold tracking-tight ${beakerPH > 8.2 ? 'text-pink-400' : beakerPH > 6.8 ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}>
                    {beakerPH}
                  </span>
                </div>

                <div className="p-3 bg-black/30 border border-white/5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Added Acid Vol</span>
                  <span className="text-xl font-bold text-sky-400 tracking-tight">
                    {addedAcidVolume.toFixed(2)} mL
                  </span>
                </div>
              </div>

              {/* Controls Panels */}
              <div className="p-4 bg-black/30 border border-white/5 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={12} />
                  <span>Active Parameters</span>
                </h4>

                {/* Slider 1: Flow Rate (Drops / Sec) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase">Acid Flow Rate (Burette Tap)</span>
                    <span className="text-indigo-400 font-mono">{flowRate} drops/sec</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={flowRate}
                    onChange={e => setFlowRate(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1 rounded-lg bg-white/10 cursor-pointer outline-none"
                  />
                </div>

                {/* Slider 2: Acid Molarity */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase">HCl Concentration (Acid Molarity)</span>
                    <span className="text-sky-400 font-mono">{acidMolarity.toFixed(1)} M</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={acidMolarity}
                    onChange={e => setAcidMolarity(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 h-1 rounded-lg bg-white/10 cursor-pointer outline-none"
                  />
                </div>
              </div>

              {/* Instructions banner */}
              <div className="p-3 bg-white/5 rounded-2xl flex items-start gap-2">
                <HelpCircle size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 font-medium leading-normal">
                  Adjust the flow rate to open the burette nozzle and start adding 1.0 M Hydrochloric Acid (HCl). Watch the beaker liquid turn from dark pink to colorless. Try to stop the tap exactly at pH 7.0 for perfect neutralization!
                </p>
              </div>

            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );

  if (isFullScreen) {
    return (
      <div
        className="fixed inset-0 z-[99999] flex flex-col bg-[#05040a] border border-indigo-500/30"
        style={{ animation: 'fadeInSlide 0.2s ease' }}
      >
        {inner}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#05040a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      {inner}
    </div>
  );
};

export default InteractiveLab;
