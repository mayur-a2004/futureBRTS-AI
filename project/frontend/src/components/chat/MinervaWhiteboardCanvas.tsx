import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Eraser, Download, Sparkles, X, Volume2, VolumeX,
  SkipForward, SkipBack, ZoomIn, ZoomOut, ChevronDown, ChevronUp,
  PenTool, Layout, Play, Cloud, Check, Calculator, Search, Compass, Eye
} from "lucide-react";

export interface SolutionStep {
  stepNumber: number;
  title: string;
  explanation: string;
  latexOrFormula: string;
  svgStrokes?: string[];
}

interface MinervaWhiteboardCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  solutionSteps?: SolutionStep[];
}

type DrawTool = "pen" | "eraser" | "rect" | "circle" | "triangle" | "arrow" | "line" | "stamp";

export interface SyllabusToolItem {
  id: string;
  name: string;
  category: "maths" | "physics" | "chemistry" | "biology" | "diagrams";
  renderType: "text" | "diagram";
  content: string; // Text formula or diagram ID
  desc: string;
}

// ─── COMPREHENSIVE OFFICIAL BOARD SYLLABUS TOOLKIT CATALOG ────────────────────
const SYLLABUS_TOOLS_CATALOG: SyllabusToolItem[] = [
  // 📐 MATHEMATICS
  { id: "m_sqrt", name: "Square Root √x", category: "maths", renderType: "text", content: "√x", desc: "Square Root Operator" },
  { id: "m_pi", name: "Pi (π = 3.14159)", category: "maths", renderType: "text", content: "π ≈ 3.14159", desc: "Circle Constant" },
  { id: "m_theta", name: "Theta Angle (θ)", category: "maths", renderType: "text", content: "θ", desc: "Angle Variable" },
  { id: "m_integral", name: "Definite Integral ∫", category: "maths", renderType: "text", content: "∫ₐᵇ f(x) dx", desc: "Integration Operator" },
  { id: "m_sum", name: "Summation Σ", category: "maths", renderType: "text", content: "∑ᵢ₌₁ⁿ xᵢ", desc: "Series Summation" },
  { id: "m_limit", name: "Limit lim(x→a)", category: "maths", renderType: "text", content: "limₓ→ₐ f(x)", desc: "Calculus Limit" },
  { id: "m_derivative", name: "Derivative dy/dx", category: "maths", renderType: "text", content: "dy/dx = f'(x)", desc: "Differentiation" },
  { id: "m_pythagoras", name: "Pythagoras Theorem", category: "maths", renderType: "text", content: "a² + b² = c²", desc: "Right Triangle Theorem" },
  { id: "m_quad_formula", name: "Quadratic Formula", category: "maths", renderType: "text", content: "x = (-b ± √(b² - 4ac)) / (2a)", desc: "Roots of ax² + bx + c = 0" },
  { id: "m_trig_identity", name: "Trig Identity", category: "maths", renderType: "text", content: "sin²θ + cos²θ = 1", desc: "Fundamental Identity" },
  { id: "m_matrix", name: "2x2 Matrix", category: "maths", renderType: "text", content: "[ a  b ]\n[ c  d ]", desc: "Determinants & Matrices" },
  { id: "m_circle_area", name: "Circle Area", category: "maths", renderType: "text", content: "A = πr²", desc: "Area Formula" },

  // ⚛️ PHYSICS
  { id: "p_newton2", name: "Newton's 2nd Law", category: "physics", renderType: "text", content: "F = m · a", desc: "Force & Acceleration" },
  { id: "p_motion1", name: "1st Eq of Motion", category: "physics", renderType: "text", content: "v = u + a·t", desc: "Velocity Equation" },
  { id: "p_motion2", name: "2nd Eq of Motion", category: "physics", renderType: "text", content: "s = u·t + ½a·t²", desc: "Displacement Equation" },
  { id: "p_motion3", name: "3rd Eq of Motion", category: "physics", renderType: "text", content: "v² = u² + 2a·s", desc: "Velocity-Distance Eq" },
  { id: "p_ohm", name: "Ohm's Law", category: "physics", renderType: "text", content: "V = I · R", desc: "Current & Resistance" },
  { id: "p_power", name: "Electric Power", category: "physics", renderType: "text", content: "P = V · I = I²R", desc: "Electrical Power" },
  { id: "p_ke", name: "Kinetic Energy", category: "physics", renderType: "text", content: "KE = ½m·v²", desc: "Energy of Motion" },
  { id: "p_pe", name: "Potential Energy", category: "physics", renderType: "text", content: "PE = m·g·h", desc: "Gravitational Energy" },
  { id: "p_emc2", name: "Einstein Mass-Energy", category: "physics", renderType: "text", content: "E = m · c²", desc: "Relativity Equation" },
  { id: "p_coulomb", name: "Coulomb's Law", category: "physics", renderType: "text", content: "F = k · (q₁q₂ / r²)", desc: "Electrostatic Force" },
  { id: "p_wave", name: "Wave Speed Eq", category: "physics", renderType: "text", content: "v = f · λ", desc: "Frequency & Wavelength" },
  { id: "p_gas_law", name: "Ideal Gas Law", category: "physics", renderType: "text", content: "p·V = n·R·T", desc: "Thermodynamics" },

  // 🧪 CHEMISTRY
  { id: "c_water", name: "Water (H₂O)", category: "chemistry", renderType: "text", content: "H₂O", desc: "Water Molecule" },
  { id: "c_co2", name: "Carbon Dioxide (CO₂)", category: "chemistry", renderType: "text", content: "CO₂", desc: "Carbon Dioxide" },
  { id: "c_h2so4", name: "Sulphuric Acid", category: "chemistry", renderType: "text", content: "H₂SO₄", desc: "King of Chemicals" },
  { id: "c_hcl", name: "Hydrochloric Acid", category: "chemistry", renderType: "text", content: "HCl", desc: "Strong Acid" },
  { id: "c_naoh", name: "Sodium Hydroxide", category: "chemistry", renderType: "text", content: "NaOH", desc: "Strong Base" },
  { id: "c_glucose", name: "Glucose", category: "chemistry", renderType: "text", content: "C₆H₁₂O₆", desc: "Monosaccharide Sugar" },
  { id: "c_methane", name: "Methane", category: "chemistry", renderType: "text", content: "CH₄", desc: "Hydrocarbon Gas" },
  { id: "c_ph", name: "pH Scale Formula", category: "chemistry", renderType: "text", content: "pH = -log₁₀[H⁺]", desc: "Acidity Measurement" },
  { id: "c_rxn_arrow", name: "Reaction Arrow →", category: "chemistry", renderType: "text", content: "Reactants → Products", desc: "Forward Reaction" },
  { id: "c_equilibrium", name: "Equilibrium ⇌", category: "chemistry", renderType: "text", content: "A + B ⇌ C + D", desc: "Reversible Reaction" },
  { id: "c_gibbs", name: "Gibbs Free Energy", category: "chemistry", renderType: "text", content: "ΔG = ΔH - T·ΔS", desc: "Thermodynamic Spontaneity" },

  // 🧬 BIOLOGY
  { id: "b_dna", name: "DNA Code", category: "biology", renderType: "text", content: "DNA (Deoxyribonucleic Acid)", desc: "Genetic Code" },
  { id: "b_atp", name: "ATP Molecule", category: "biology", renderType: "text", content: "ATP ⇌ ADP + Pᵢ + Energy", desc: "Cellular Energy Currency" },
  { id: "b_photosynthesis", name: "Photosynthesis Eq", category: "biology", renderType: "text", content: "6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂", desc: "Plant Glucose Synthesis" },
  { id: "b_respiration", name: "Cellular Respiration", category: "biology", renderType: "text", content: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP", desc: "Aerobic Respiration" },
  { id: "b_punnett", name: "Punnett Monohybrid Cross", category: "biology", renderType: "text", content: "P: Aa × Aa  ==>  Ratio: 3:1 (Tall:Dwarf)", desc: "Mendelian Inheritance" },
  { id: "b_dihybrid", name: "Dihybrid Cross Ratio", category: "biology", renderType: "text", content: "F₂ Phenotypic Ratio = 9 : 3 : 3 : 1", desc: "Independent Assortment" },
  { id: "b_bmi", name: "BMI Formula", category: "biology", renderType: "text", content: "BMI = Weight(kg) / Height(m)²", desc: "Body Mass Index" },
  { id: "b_cardiac", name: "Cardiac Output Eq", category: "biology", renderType: "text", content: "CO = Heart Rate (HR) × Stroke Volume (SV)", desc: "Heart Output Rate" },

  // 📐 DIAGRAMS & LAB APPARATUS
  { id: "d_axes", name: "📈 X-Y Coordinate Plane", category: "diagrams", renderType: "diagram", content: "diag_axes", desc: "Coordinate Axes with Grid" },
  { id: "d_cube", name: "🧊 3D Wireframe Cube", category: "diagrams", renderType: "diagram", content: "diag_cube", desc: "3D Geometry Cube" },
  { id: "d_ruler", name: "📏 Measurement Ruler (Scale)", category: "diagrams", renderType: "diagram", content: "diag_ruler", desc: "15cm Scale Ruler" },
  { id: "d_protractor", name: "🧭 180° Angle Protractor", category: "diagrams", renderType: "diagram", content: "diag_protractor", desc: "Angle Measuring Tool" },
  { id: "d_resistor", name: "⚡ Circuit Resistor (R)", category: "diagrams", renderType: "diagram", content: "diag_resistor", desc: "Physics Circuit Resistor" },
  { id: "d_battery", name: "🔋 DC Battery Source", category: "diagrams", renderType: "diagram", content: "diag_battery", desc: "DC Cell/Battery" },
  { id: "d_bulb", name: "💡 Electric Light Bulb", category: "diagrams", renderType: "diagram", content: "diag_bulb", desc: "Circuit Lamp" },
  { id: "d_lens", name: "🔍 Double Convex Lens", category: "diagrams", renderType: "diagram", content: "diag_lens", desc: "Optics Convex Lens" },
  { id: "d_prism", name: "🌈 Triangular Glass Prism", category: "diagrams", renderType: "diagram", content: "diag_prism", desc: "Optics Light Refraction" },
  { id: "d_beaker", name: "🧪 Glass Chemistry Beaker", category: "diagrams", renderType: "diagram", content: "diag_beaker", desc: "Lab Beaker with Liquid" },
  { id: "d_flask", name: "⚗️ Erlenmeyer Conical Flask", category: "diagrams", renderType: "diagram", content: "diag_flask", desc: "Reaction Flask" },
  { id: "d_benzene", name: "⬡ Organic Benzene Ring", category: "diagrams", renderType: "diagram", content: "diag_benzene", desc: "Hexagonal Benzene Ring" },
  { id: "d_dna_strand", name: "🧬 DNA Helix Diagram", category: "diagrams", renderType: "diagram", content: "diag_dna", desc: "Double Helix Strand" },
  { id: "d_cell", name: "🦠 Biological Cell Structure", category: "diagrams", renderType: "diagram", content: "diag_cell", desc: "Cell Nucleus & Membrane" }
];

const buildDynamicSteps = (title: string, customSteps?: SolutionStep[]): SolutionStep[] => {
  if (customSteps && customSteps.length > 0) return customSteps;
  return [
    { stepNumber: 1, title: "Step 1: Core Concept & Given Parameters", explanation: `Pehle step me hum '${title}' ke fundamental principles set up karte hain.`, latexOrFormula: `Given: ${title} ⟹ Core Equation: f(x) = ...` },
    { stepNumber: 2, title: "Step 2: Step-by-Step Mathematical Derivation", explanation: "Values substitute karke formula evaluate karte hain.", latexOrFormula: "Step 2: Substitute Known Values & Evaluate" },
    { stepNumber: 3, title: "Step 3: Intermediate Simplification", explanation: "Algebraic simplification karke exact values derive karte hain.", latexOrFormula: "Step 3: Simplify & Combine Terms" },
    { stepNumber: 4, title: "Step 4: Final Verified Answer", explanation: "Final calculation complete karke verified result derive karte hain.", latexOrFormula: `✅ Final Verified Result for ${title}` }
  ];
};

const ScientificCalc: React.FC<{ onInsert: (val: string) => void }> = ({ onInsert }) => {
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState("");

  const press = (val: string) => {
    if (val === "C") { setDisplay("0"); setExpr(""); return; }
    if (val === "⌫") {
      const next = expr.slice(0, -1);
      setExpr(next);
      setDisplay(next || "0");
      return;
    }
    if (val === "=") {
      try {
        const safe = expr
          .replace(/√\(/g, "Math.sqrt(")
          .replace(/π/g, "(Math.PI)")
          .replace(/sin\(/g, "Math.sin(")
          .replace(/cos\(/g, "Math.cos(")
          .replace(/tan\(/g, "Math.tan(")
          .replace(/log\(/g, "Math.log10(")
          .replace(/ln\(/g, "Math.log(")
          .replace(/\^/g, "**");
        const result = Function('"use strict"; return (' + safe + ')')();
        const res = String(parseFloat(result.toFixed(10)));
        setDisplay(res);
        setExpr(res);
        onInsert(" = " + res);
      } catch { setDisplay("Error"); }
      return;
    }
    const next = expr === "0" ? val : expr + val;
    setExpr(next);
    setDisplay(next);
  };

  const rows = [
    ["sin(", "cos(", "tan(", "log(", "ln("],
    ["√(", "π", "(", ")", "C"],
    ["7", "8", "9", "/", "⌫"],
    ["4", "5", "6", "*", "^"],
    ["1", "2", "3", "-", "%"],
    ["0", ".", "+", "±", "="],
  ];

  return (
    <div className="bg-[#0b0917] border border-indigo-500/40 rounded-2xl p-3 w-60 shadow-2xl">
      <div className="text-right text-white font-mono text-base font-bold bg-black/40 rounded-xl px-3 py-2 mb-2 min-h-[2.5rem] overflow-x-auto break-all">{display}</div>
      {rows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-5 gap-1 mb-1">
          {row.map(btn => (
            <button key={btn} onClick={() => press(btn)}
              className={`py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95 hover:opacity-80 ${
                btn === "=" ? "bg-indigo-600 text-white shadow-lg"
                  : btn === "C" ? "bg-rose-600/90 text-white"
                  : btn === "⌫" ? "bg-orange-600/80 text-white"
                  : /[0-9.]/.test(btn) ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-indigo-950/80 text-indigo-200 hover:bg-indigo-900/60"
              }`}>
              {btn}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export const MinervaWhiteboardCanvas: React.FC<MinervaWhiteboardCanvasProps> = ({
  isOpen, onClose, initialTitle = "AI Touch Smart Board", solutionSteps
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const SESSION_KEY = `smartboard_${initialTitle.replace(/\W+/g, "_").slice(0, 40)}`;

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [boardMode, setBoardMode] = useState<"ai_solution" | "blank_slate">("ai_solution");
  const [tool, setTool] = useState<DrawTool>("pen");
  const [penThickness, setPenThickness] = useState(2.5);
  const [color, setColor] = useState("#6366f1");
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [scrollY, setScrollY] = useState(0);
  const activeSteps = buildDynamicSteps(initialTitle, solutionSteps);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [writingCharCount, setWritingCharCount] = useState(0);
  const [isWritingCompleted, setIsWritingCompleted] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // STAMP ITEM PLACEMENT STATE
  const [selectedStamp, setSelectedStamp] = useState<SyllabusToolItem | null>(null);

  const COLORS = ["#ffffff", "#6366f1", "#38bdf8", "#4ade80", "#f43f5e", "#fbbf24", "#a855f7", "#f97316"];

  useEffect(() => {
    if (!isOpen) return;
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);
    };
    img.src = saved;
  }, [isOpen, SESSION_KEY]);

  useEffect(() => {
    if (!isOpen || boardMode !== "ai_solution") return;
    const step = activeSteps[activeStepIdx];
    if (!step) return;
    setWritingCharCount(0);
    setIsWritingCompleted(false);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setWritingCharCount(i);
      if (i >= step.latexOrFormula.length) {
        clearInterval(t);
        setIsWritingCompleted(true);
        if (isVoiceEnabled) speakExplanation(step.explanation);
      }
    }, 22);
    return () => clearInterval(t);
  }, [activeStepIdx, boardMode, isOpen]);

  useEffect(() => {
    if (boardMode === "ai_solution") setScrollY(Math.max(0, (activeStepIdx - 1) * 145));
  }, [activeStepIdx, boardMode]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setActiveStepIdx(p => Math.min(activeSteps.length - 1, p + 1));
      else if (e.key === "ArrowLeft") setActiveStepIdx(p => Math.max(0, p - 1));
      else if (e.key === "Escape") {
        setSelectedStamp(null);
        setTool("pen");
        onClose();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, activeSteps.length, onClose]);

  const renderBoard = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const lw = canvas.offsetWidth, lh = canvas.offsetHeight;
    canvas.width = lw * dpr; canvas.height = lh * dpr;
    ctx.save();
    ctx.scale(dpr * zoomLevel, dpr * zoomLevel);
    ctx.fillStyle = "#0b0917";
    ctx.fillRect(0, 0, lw / zoomLevel, lh / zoomLevel);
    ctx.translate(0, -scrollY);
    ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
    const gs = 30, th = Math.max(lh + scrollY + 1000, activeSteps.length * 150 + 600);
    for (let x = 0; x < lw / zoomLevel; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, th); ctx.stroke(); }
    for (let y2 = 0; y2 < th; y2 += gs) { ctx.beginPath(); ctx.moveTo(0, y2); ctx.lineTo(lw / zoomLevel, y2); ctx.stroke(); }
    if (boardMode === "ai_solution") renderSteps(ctx, lw / zoomLevel);
    else { ctx.fillStyle = "#6366f1"; ctx.font = "bold 13px Inter, sans-serif"; ctx.fillText("✏️ CLEAN SLATE — Click anywhere to stamp formulas & lab tools", 25, 40); }
    ctx.restore();
  }, [zoomLevel, scrollY, boardMode, activeStepIdx, writingCharCount, isWritingCompleted]);

  useEffect(() => {
    if (isOpen) renderBoard();
  }, [isOpen, renderBoard]);

  const renderSteps = (ctx: CanvasRenderingContext2D, cw: number) => {
    const bw = Math.max(280, Math.min(cw - 30, 800));
    const fs = cw < 480 ? 11 : cw < 768 ? 13 : 15;
    activeSteps.slice(0, activeStepIdx + 1).forEach((step, idx) => {
      const sy = 45 + idx * 145;
      const isAct = idx === activeStepIdx;
      ctx.fillStyle = isAct ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)";
      ctx.strokeStyle = isAct ? "#6366f1" : "rgba(255,255,255,0.1)";
      ctx.lineWidth = isAct ? 2 : 1;
      ctx.beginPath(); ctx.roundRect(15, sy - 20, bw, 120, 14); ctx.fill(); ctx.stroke();
      ctx.fillStyle = isAct ? "#818cf8" : "#94a3b8";
      ctx.font = `bold ${fs + 2}px Caveat, cursive, sans-serif`;
      ctx.fillText(step.title, 25, sy - 2);
      const formula = step.latexOrFormula;
      const visible = isAct ? formula.slice(0, writingCharCount) : formula;
      const maxChars = Math.max(18, Math.floor((bw - 90) / ((fs + 3) * 0.55)));
      const lines: string[] = [];
      for (let i = 0; i < visible.length; i += maxChars) lines.push(visible.slice(i, i + maxChars));
      if (!lines.length) lines.push("");
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${fs + 3}px Caveat, monospace`;
      lines.forEach((l, li) => {
        const ly = sy + 28 + li * (fs + 9);
        if (l.includes("=") || l.includes("Given") || l.includes("✅")) {
          ctx.save(); ctx.fillStyle = "rgba(251,191,36,0.08)"; ctx.strokeStyle = "rgba(251,191,36,0.4)"; ctx.lineWidth = 1;
          const tw = ctx.measureText(l).width;
          ctx.fillRect(22, ly - 14, Math.min(tw + 12, bw - 40), fs + 10);
          ctx.strokeRect(22, ly - 14, Math.min(tw + 12, bw - 40), fs + 10);
          ctx.restore();
        }
        ctx.fillText(l, 25, ly);
        if (isAct && li === lines.length - 1 && !isWritingCompleted) {
          const tm = ctx.measureText(l);
          ctx.save(); ctx.shadowColor = "#6366f1"; ctx.shadowBlur = 10;
          ctx.fillStyle = "#38bdf8"; ctx.beginPath(); ctx.arc(28 + tm.width, ly - 4, 5, 0, Math.PI * 2); ctx.fill();
          ctx.font = "14px sans-serif"; ctx.fillText("✍️", 32 + tm.width, ly); ctx.restore();
        }
      });
      if (idx < activeSteps.length - 1 && idx <= activeStepIdx) {
        const ay = sy + 105;
        ctx.strokeStyle = "#6366f1"; ctx.fillStyle = "#6366f1"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(40, ay); ctx.lineTo(40, ay + 14); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(35, ay + 10); ctx.lineTo(40, ay + 16); ctx.lineTo(45, ay + 10); ctx.fill();
      }
    });
  };

  // ── RENDER VECTOR DIAGRAM ON CANVAS AT (x, y) ───────────────────────────────
  const drawDiagramOnCanvas = (ctx: CanvasRenderingContext2D, diagId: string, x: number, y: number, strokeColor: string) => {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (diagId) {
      case "diag_axes": // X-Y Coordinate Plane
        ctx.beginPath();
        ctx.moveTo(x - 80, y); ctx.lineTo(x + 80, y); // X axis
        ctx.moveTo(x, y - 80); ctx.lineTo(x, y + 80); // Y axis
        ctx.stroke();
        ctx.fillText("X", x + 85, y + 4);
        ctx.fillText("Y", x - 4, y - 85);
        ctx.font = "10px monospace";
        ctx.fillText("(0,0)", x + 5, y + 12);
        break;

      case "diag_cube": // 3D Wireframe Cube
        ctx.strokeRect(x - 30, y - 30, 50, 50);
        ctx.strokeRect(x - 15, y - 45, 50, 50);
        ctx.beginPath();
        ctx.moveTo(x - 30, y - 30); ctx.lineTo(x - 15, y - 45);
        ctx.moveTo(x + 20, y - 30); ctx.lineTo(x + 35, y - 45);
        ctx.moveTo(x - 30, y + 20); ctx.lineTo(x - 15, y + 5);
        ctx.moveTo(x + 20, y + 20); ctx.lineTo(x + 35, y + 5);
        ctx.stroke();
        break;

      case "diag_ruler": // 15cm Ruler Scale
        ctx.strokeRect(x - 70, y - 15, 140, 30);
        ctx.beginPath();
        for (let i = -60; i <= 60; i += 10) {
          const h = (i % 20 === 0) ? 12 : 6;
          ctx.moveTo(x + i, y - 15); ctx.lineTo(x + i, y - 15 + h);
        }
        ctx.stroke();
        ctx.font = "9px monospace";
        ctx.fillText("cm scale", x - 20, y + 8);
        break;

      case "diag_protractor": // Angle Protractor
        ctx.beginPath();
        ctx.arc(x, y, 50, Math.PI, 0);
        ctx.lineTo(x - 50, y);
        ctx.stroke();
        ctx.font = "9px monospace";
        ctx.fillText("0°", x - 55, y + 12);
        ctx.fillText("90°", x - 8, y - 55);
        ctx.fillText("180°", x + 40, y + 12);
        break;

      case "diag_resistor": // Circuit Resistor
        ctx.beginPath();
        ctx.moveTo(x - 50, y); ctx.lineTo(x - 30, y);
        ctx.lineTo(x - 24, y - 12); ctx.lineTo(x - 12, y + 12);
        ctx.lineTo(x, y - 12); ctx.lineTo(x + 12, y + 12);
        ctx.lineTo(x + 24, y - 12); ctx.lineTo(x + 30, y);
        ctx.lineTo(x + 50, y);
        ctx.stroke();
        ctx.font = "bold 11px monospace";
        ctx.fillText("R", x - 4, y - 18);
        break;

      case "diag_battery": // DC Battery
        ctx.beginPath();
        ctx.moveTo(x - 40, y); ctx.lineTo(x - 10, y);
        ctx.moveTo(x + 10, y); ctx.lineTo(x + 40, y);
        ctx.moveTo(x - 10, y - 20); ctx.lineTo(x - 10, y + 20);
        ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10);
        ctx.moveTo(x + 10, y - 20); ctx.lineTo(x + 10, y + 20);
        ctx.stroke();
        ctx.font = "bold 11px monospace";
        ctx.fillText("+", x - 18, y - 22);
        ctx.fillText("-", x + 12, y - 22);
        break;

      case "diag_bulb": // Electric Bulb
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.moveTo(x - 35, y); ctx.lineTo(x - 22, y);
        ctx.moveTo(x + 22, y); ctx.lineTo(x + 35, y);
        ctx.moveTo(x - 12, y - 12); ctx.lineTo(x + 12, y + 12);
        ctx.moveTo(x + 12, y - 12); ctx.lineTo(x - 12, y + 12);
        ctx.stroke();
        break;

      case "diag_lens": // Double Convex Lens
        ctx.beginPath();
        ctx.ellipse(x, y, 12, 45, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 60, y); ctx.lineTo(x + 60, y);
        ctx.stroke();
        ctx.font = "9px monospace";
        ctx.fillText("F₁", x - 40, y + 14);
        ctx.fillText("F₂", x + 30, y + 14);
        break;

      case "diag_prism": // Triangular Glass Prism
        ctx.beginPath();
        ctx.moveTo(x, y - 40); ctx.lineTo(x + 40, y + 30); ctx.lineTo(x - 40, y + 30);
        ctx.closePath();
        ctx.stroke();
        ctx.strokeStyle = "#fbbf24";
        ctx.beginPath();
        ctx.moveTo(x - 65, y + 15); ctx.lineTo(x - 20, y + 10);
        ctx.lineTo(x + 20, y + 18); ctx.lineTo(x + 65, y + 35);
        ctx.stroke();
        break;

      case "diag_beaker": // Chemistry Beaker
        ctx.beginPath();
        ctx.moveTo(x - 30, y - 35); ctx.lineTo(x - 30, y + 30);
        ctx.lineTo(x + 30, y + 30); ctx.lineTo(x + 30, y - 35);
        ctx.stroke();
        ctx.fillStyle = "rgba(56, 189, 248, 0.3)";
        ctx.fillRect(x - 28, y - 5, 56, 33);
        ctx.strokeStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(x - 28, y - 5); ctx.lineTo(x + 28, y - 5);
        ctx.stroke();
        break;

      case "diag_flask": // Erlenmeyer Flask
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 40); ctx.lineTo(x - 10, y - 20);
        ctx.lineTo(x - 35, y + 30); ctx.lineTo(x + 35, y + 30);
        ctx.lineTo(x + 10, y - 20); ctx.lineTo(x + 10, y - 40);
        ctx.stroke();
        ctx.fillStyle = "rgba(74, 222, 128, 0.3)";
        ctx.beginPath();
        ctx.moveTo(x - 22, y + 5); ctx.lineTo(x + 22, y + 5);
        ctx.lineTo(x + 33, y + 28); ctx.lineTo(x - 33, y + 28);
        ctx.closePath();
        ctx.fill();
        break;

      case "diag_benzene": // Benzene Ring
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const bx = x + 32 * Math.cos(angle);
          const by = y + 32 * Math.sin(angle);
          if (i === 0) ctx.moveTo(bx, by);
          else ctx.lineTo(bx, by);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case "diag_dna": // DNA Helix Strand
        ctx.beginPath();
        for (let i = -50; i <= 50; i += 5) {
          const y1 = y + i;
          const x1 = x + 20 * Math.sin(i * 0.1);
          const x2 = x - 20 * Math.sin(i * 0.1);
          ctx.fillRect(x1, y1, 2, 2);
          ctx.fillRect(x2, y1, 2, 2);
          if (i % 15 === 0) {
            ctx.moveTo(x1, y1); ctx.lineTo(x2, y1);
          }
        }
        ctx.stroke();
        break;

      case "diag_cell": // Biological Cell
        ctx.beginPath();
        ctx.ellipse(x, y, 50, 35, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - 10, y - 5, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "9px monospace";
        ctx.fillText("Nucleus", x - 22, y + 20);
        ctx.fillText("Membrane", x + 15, y - 25);
        break;

      default:
        ctx.strokeRect(x - 20, y - 20, 40, 40);
        ctx.fillText(diagId, x - 15, y + 4);
        break;
    }

    ctx.restore();
  };

  // ── STAMP STAMP ITEM AT SPECIFIC CANVAS (x, y) LOCATION ─────────────────────
  const stampItemAtLocation = (item: SyllabusToolItem, posX: number, posY: number) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    ctx.save();
    ctx.scale(dpr, dpr);

    if (item.renderType === "diagram") {
      drawDiagramOnCanvas(ctx, item.content, posX, posY - scrollY, color);
    } else {
      const fontSize = 18;
      ctx.font = `bold ${fontSize}px Caveat, monospace, sans-serif`;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;

      const lines = item.content.split("\n");
      lines.forEach((l, idx) => {
        ctx.fillText(l, posX, posY - scrollY + idx * 24);
      });
    }

    ctx.restore();
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
    const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) / zoomLevel, y: (cy - rect.top) / zoomLevel + scrollY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    mousePosRef.current = pos;
    if (isDrawing) draw(e);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const pos = getPos(e);
    startPos.current = pos;

    if (tool === "stamp" && selectedStamp) {
      stampItemAtLocation(selectedStamp, pos.x, pos.y);
      return;
    }

    if (["rect", "circle", "triangle", "arrow", "line"].includes(tool)) {
      snapshotRef.current = ctx.getImageData(0, 0, c.width, c.height);
    } else if (tool === "pen") {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.save(); ctx.scale(dpr * zoomLevel, dpr * zoomLevel); ctx.translate(0, -scrollY);
      ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    }
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === "stamp") return;
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const pos = getPos(e);
    const sp = startPos.current || pos;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (tool === "eraser") {
      const r = 35;
      ctx.fillStyle = "#0b0917";
      ctx.fillRect((pos.x - r / 2) * dpr * zoomLevel, (pos.y - scrollY - r / 2) * dpr * zoomLevel, r * dpr * zoomLevel, r * dpr * zoomLevel);
      return;
    }

    if (tool === "pen") {
      ctx.strokeStyle = color; ctx.lineWidth = penThickness * 2;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.lineTo(pos.x, pos.y); ctx.stroke();
      return;
    }

    if (snapshotRef.current) ctx.putImageData(snapshotRef.current, 0, 0);
    ctx.save();
    ctx.scale(dpr * zoomLevel, dpr * zoomLevel);
    ctx.translate(0, -scrollY);
    ctx.strokeStyle = color; ctx.lineWidth = penThickness * 2;
    ctx.lineCap = "round"; ctx.lineJoin = "round";

    const sx = sp.x, sy2 = sp.y, ex = pos.x, ey = pos.y;
    const w = ex - sx, h = ey - sy2;

    if (tool === "rect") {
      ctx.beginPath(); ctx.strokeRect(sx, sy2, w, h);
    } else if (tool === "circle") {
      ctx.beginPath();
      ctx.ellipse(sx + w / 2, sy2 + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === "triangle") {
      ctx.beginPath();
      ctx.moveTo(sx + w / 2, sy2); ctx.lineTo(ex, ey); ctx.lineTo(sx, ey);
      ctx.closePath(); ctx.stroke();
    } else if (tool === "line") {
      ctx.beginPath(); ctx.moveTo(sx, sy2); ctx.lineTo(ex, ey); ctx.stroke();
    } else if (tool === "arrow") {
      const angle = Math.atan2(ey - sy2, ex - sx);
      const hl = 18, ha = Math.PI / 7;
      ctx.beginPath(); ctx.moveTo(sx, sy2); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - hl * Math.cos(angle - ha), ey - hl * Math.sin(angle - ha));
      ctx.lineTo(ex - hl * Math.cos(angle + ha), ey - hl * Math.sin(angle + ha));
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const c = canvasRef.current;
    if (c && tool === "pen") { const ctx = c.getContext("2d"); if (ctx) ctx.restore(); }
    startPos.current = null; snapshotRef.current = null;
  };

  const saveSession = async () => {
    setIsSaving(true);
    try {
      const canvas = canvasRef.current;
      if (canvas) localStorage.setItem(SESSION_KEY, canvas.toDataURL("image/png"));
      try {
        const token = localStorage.getItem("token");
        await fetch("/api/v1/minerva/smartboard/save", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ title: initialTitle, steps: activeSteps, canvasData: canvas?.toDataURL() })
        });
      } catch { /* fallback */ }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally { setIsSaving(false); }
  };

  const clearSlate = () => {
    setBoardMode("blank_slate");
    setScrollY(0);
    const c = canvasRef.current;
    if (c) { const ctx = c.getContext("2d"); if (ctx) { ctx.fillStyle = "#0b0917"; ctx.fillRect(0, 0, c.width, c.height); } }
    localStorage.removeItem(SESSION_KEY);
  };

  const speakExplanation = (text: string) => {
    if (!isVoiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.lang = "hi-IN";
    window.speechSynthesis.speak(u);
  };

  const exportPNG = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a");
    a.download = `smartboard_${Date.now()}.png`;
    a.href = c.toDataURL();
    a.click();
  };

  const filteredSyllabusTools = SYLLABUS_TOOLS_CATALOG.filter(t => {
    const matchesCat = !activeCategory || t.category === activeCategory;
    const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!isOpen) return null;
  const currentStep = activeSteps[activeStepIdx];

  const ToolBtn = ({ id, icon, label }: { id: DrawTool; icon: React.ReactNode; label: string }) => (
    <button onClick={() => { setTool(id); setSelectedStamp(null); }} title={label}
      className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 border ${
        tool === id && !selectedStamp ? "bg-indigo-600 text-white border-indigo-400 shadow-md" : "bg-white/5 text-gray-400 hover:text-white border-white/10"
      }`}>
      {icon} <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-[#060610]/98 backdrop-blur-2xl flex flex-col gap-1.5 p-2 animate-in fade-in duration-200 select-none overflow-hidden">
      
      {/* ══ TOP MAIN CONTROL BAR ═════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 bg-[#0B0915]/95 border border-white/10 rounded-2xl px-3 py-2 shadow-2xl overflow-x-auto scrollbar-none w-full shrink-0 flex-wrap gap-y-1.5">
        
        {/* Title */}
        <div className="flex items-center gap-2 shrink-0 mr-1">
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Sparkles size={13} className="text-white animate-pulse" />
          </div>
          <span className="text-[11px] font-black text-white truncate max-w-[140px] sm:max-w-[280px]">{initialTitle}</span>
          {boardMode === "ai_solution"
            ? <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[8px] font-bold shrink-0">S{activeStepIdx + 1}/{activeSteps.length}</span>
            : <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] font-bold shrink-0">Slate</span>
          }
        </div>

        <div className="w-px h-5 bg-white/10 shrink-0 hidden sm:block" />

        {/* Board Mode Toggle */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5 gap-0.5 shrink-0">
          <button onClick={() => { setBoardMode("ai_solution"); renderBoard(); }}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${boardMode === "ai_solution" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>
            <Layout size={10} /> AI Steps
          </button>
          <button onClick={clearSlate}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${boardMode === "blank_slate" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"}`}>
            <PenTool size={10} /> Slate
          </button>
        </div>

        <div className="w-px h-5 bg-white/10 shrink-0 hidden sm:block" />

        {/* DRAWING SHAPE & PEN TOOLS */}
        <div className="flex items-center gap-1 shrink-0">
          <ToolBtn id="pen" icon={<PenTool size={10} />} label="Pen" />
          <ToolBtn id="rect" icon={
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" fill="none" strokeWidth="1.5"><rect x="1" y="1" width="8" height="8" rx="1"/></svg>
          } label="Rect" />
          <ToolBtn id="circle" icon={
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" fill="none" strokeWidth="1.5"><circle cx="5" cy="5" r="4"/></svg>
          } label="Circle" />
          <ToolBtn id="triangle" icon={
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" fill="none" strokeWidth="1.5"><polygon points="5,1 9,9 1,9"/></svg>
          } label="Tri" />
          <ToolBtn id="arrow" icon={
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" fill="none" strokeWidth="1.5"><line x1="1" y1="5" x2="9" y2="5"/><polyline points="6,2 9,5 6,8"/></svg>
          } label="Arrow" />
          <ToolBtn id="line" icon={
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" fill="none" strokeWidth="1.5"><line x1="1" y1="9" x2="9" y2="1"/></svg>
          } label="Line" />
          <ToolBtn id="eraser" icon={<Eraser size={10} />} label="Erase" />
        </div>

        {/* Pen Weight */}
        <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 gap-0.5 shrink-0">
          {[{ l: "S", s: 1 }, { l: "M", s: 2.5 }, { l: "L", s: 4.5 }, { l: "XL", s: 7 }].map(t => (
            <button key={t.l} onClick={() => { setPenThickness(t.s); setTool("pen"); setSelectedStamp(null); }}
              className={`w-7 h-6 rounded-lg text-[9px] font-bold transition-all ${penThickness === t.s && tool === "pen" && !selectedStamp ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>{t.l}
            </button>
          ))}
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
          {COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); if (tool === "eraser") setTool("pen"); }}
              style={{ backgroundColor: c }}
              className={`w-3.5 h-3.5 rounded-full transition-transform shrink-0 ${color === c ? "scale-125 ring-2 ring-white" : "opacity-70 hover:opacity-100"}`} />
          ))}
        </div>

        <div className="w-px h-5 bg-white/10 shrink-0 hidden sm:block" />

        {/* SUBJECT TOOLKIT CATEGORY SELECTORS */}
        {[
          { id: "maths", label: "📐 Maths", color: "#818cf8" },
          { id: "physics", label: "⚛️ Physics", color: "#38bdf8" },
          { id: "chemistry", label: "🧪 Chemistry", color: "#4ade80" },
          { id: "biology", label: "🧬 Biology", color: "#fb923c" },
          { id: "diagrams", label: "🔬 Lab Diagrams", color: "#a855f7" }
        ].map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            style={{
              borderColor: activeCategory === cat.id ? cat.color : "rgba(255,255,255,0.1)",
              color: activeCategory === cat.id ? cat.color : "#9ca3af",
              backgroundColor: activeCategory === cat.id ? cat.color + "20" : "rgba(255,255,255,0.04)"
            }}
            className="px-2 py-1 rounded-xl text-[9px] font-bold border transition-all shrink-0 hover:opacity-90">
            {cat.label}
          </button>
        ))}

        <div className="w-px h-5 bg-white/10 shrink-0 hidden sm:block" />

        {/* Scientific Calculator Toggle */}
        <button onClick={() => setShowCalc(p => !p)}
          className={`px-2 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 border transition-all ${showCalc ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-white/5 text-gray-400 hover:text-white border-white/10"}`}>
          <Calculator size={11} /> Calc
        </button>

        {/* Voice Speech Toggle */}
        <button onClick={() => { setIsVoiceEnabled(p => { if (p) window.speechSynthesis?.cancel(); return !p; }); }}
          className={`px-2 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 border transition-all ${isVoiceEnabled ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-white/5 text-gray-500 border-white/10"}`}>
          {isVoiceEnabled ? <Volume2 size={11} /> : <VolumeX size={11} />}
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 gap-0.5 shrink-0">
          <button onClick={() => setZoomLevel(p => Math.max(0.5, p - 0.25))} className="p-1 text-gray-400 hover:text-white rounded-lg"><ZoomOut size={11} /></button>
          <span className="text-[9px] text-gray-300 font-bold px-0.5 w-7 text-center">{Math.round(zoomLevel * 100)}%</span>
          <button onClick={() => setZoomLevel(p => Math.min(2.5, p + 0.25))} className="p-1 text-gray-400 hover:text-white rounded-lg"><ZoomIn size={11} /></button>
        </div>

        {/* Save Session */}
        <button onClick={saveSession} disabled={isSaving}
          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 border transition-all ${saveSuccess ? "bg-emerald-600/80 text-white border-emerald-400/50" : "bg-white/8 text-white hover:bg-white/15 border-white/10"}`}>
          {saveSuccess ? <Check size={11} /> : <Cloud size={11} className="text-sky-300" />}
          {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}
        </button>

        {/* Export Image */}
        <button onClick={exportPNG}
          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-md">
          <Download size={11} /> Export
        </button>

        {/* Close Smart Board */}
        <button onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shrink-0 shadow-lg border border-rose-400/30">
          <X size={13} /> Exit
        </button>
      </div>

      {/* ══ INTERACTIVE SUBJECT SYLLABUS TOOLKIT EXPANDABLE TRAY ═══════════════ */}
      {activeCategory && (
        <div className="shrink-0 bg-[#0B0915]/95 border border-indigo-500/30 rounded-2xl p-3 shadow-2xl space-y-2 overflow-x-auto scrollbar-none animate-in slide-in-from-top-2">
          
          {/* Header & Search Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Official Board Syllabus Lab & Formula Stamp Toolset — Click any item to Stamp on Canvas
              </span>
              {selectedStamp && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold rounded-md animate-pulse">
                  🎯 Selected: {selectedStamp.name} (Click on canvas to place)
                </span>
              )}
            </div>

            <div className="relative min-w-[180px]">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formulas, lab tools, diagrams..."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-7 pr-3 py-1 text-[10px] font-mono text-white placeholder:text-gray-500 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tools Grid */}
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto scrollbar-thin p-1">
            {filteredSyllabusTools.map(item => {
              const isSel = selectedStamp?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedStamp(item);
                    setTool("stamp");
                  }}
                  title={item.desc}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 active:scale-95 hover:scale-105 ${
                    isSel
                      ? "bg-amber-500/30 text-amber-200 border-amber-400 shadow-lg ring-1 ring-amber-400"
                      : item.renderType === "diagram"
                        ? "bg-purple-950/40 text-purple-200 border-purple-500/40 hover:bg-purple-900/60"
                        : "bg-indigo-950/40 text-indigo-200 border-indigo-500/40 hover:bg-indigo-900/60"
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-[9px] opacity-60 font-mono">({item.renderType})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ STAMP MODE FLOATING TOOLTIP BANNER ════════════════════════════════ */}
      {selectedStamp && (
        <div className="bg-gradient-to-r from-amber-950/80 to-purple-950/80 border border-amber-500/40 rounded-xl px-4 py-1.5 flex items-center justify-between shadow-lg shrink-0 text-xs">
          <span className="text-amber-200 font-bold flex items-center gap-2">
            🎯 STAMP MODE ACTIVE: <span className="text-white font-mono bg-black/40 px-2 py-0.5 rounded border border-amber-500/30">{selectedStamp.name}</span>
            — Click anywhere on canvas to stamp this tool at exact coordinates!
          </span>
          <button
            onClick={() => {
              setSelectedStamp(null);
              setTool("pen");
            }}
            className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold"
          >
            ✕ Exit Stamp Mode (Use Pen)
          </button>
        </div>
      )}

      {/* ══ CANVAS + CALCULATOR MAIN DISPLAY ══════════════════════════════════ */}
      <div className="relative flex gap-2 flex-1 min-h-0">
        <div
          onWheel={e => { e.stopPropagation(); setScrollY(p => Math.max(0, Math.min((activeSteps.length - 1) * 135 + 400, p + e.deltaY * 0.6))); }}
          className="relative flex-1 bg-[#0B0917] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
            onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
            className="w-full h-full touch-none"
            style={{ cursor: selectedStamp ? "crosshair" : tool === "eraser" ? "cell" : "crosshair" }}
          />

          {/* AI Step Overlay Panel */}
          {boardMode === "ai_solution" && currentStep && (
            <div className="absolute bottom-2 left-2 right-2 bg-[#0B0915]/95 border border-indigo-500/30 rounded-xl p-2.5 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
                <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                  <Volume2 size={12} className="animate-pulse" />
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block">AI Teacher Explanation</span>
                  <p className="text-[11px] font-medium text-gray-200 truncate sm:whitespace-normal">"{currentStep.explanation}"</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                {!isWritingCompleted && (
                  <button onClick={() => { setWritingCharCount(activeSteps[activeStepIdx].latexOrFormula.length); setIsWritingCompleted(true); }}
                    className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <Play size={10} /> Fast
                  </button>
                )}
                <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 p-0.5 rounded-lg">
                  {activeSteps.map((_, idx) => (
                    <button key={idx} onClick={() => setActiveStepIdx(idx)}
                      className={`w-5 h-5 rounded-md text-[9px] font-bold transition-all ${activeStepIdx === idx ? "bg-indigo-600 text-white scale-105 shadow-md" : "text-gray-400 hover:text-white hover:bg-white/10"}`}>
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => setActiveStepIdx(p => Math.max(0, p - 1))} disabled={activeStepIdx === 0}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 text-gray-300 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <SkipBack size={10} /> Prev
                </button>
                <button onClick={() => setActiveStepIdx(p => Math.min(activeSteps.length - 1, p + 1))} disabled={activeStepIdx >= activeSteps.length - 1}
                  className="px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-40 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md">
                  Next <SkipForward size={10} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scientific Calculator Floating Dock */}
        {showCalc && (
          <div className="shrink-0 self-start animate-in slide-in-from-right-4 duration-200">
            <ScientificCalc onInsert={(resVal) => {
              const canvas = canvasRef.current; if (!canvas) return;
              const ctx = canvas.getContext("2d"); if (!ctx) return;
              const dpr = Math.min(window.devicePixelRatio || 1, 2);
              ctx.save(); ctx.scale(dpr, dpr);
              ctx.font = "bold 20px Caveat, monospace";
              ctx.fillStyle = color;
              ctx.shadowColor = color; ctx.shadowBlur = 6;
              ctx.fillText(resVal, 100, 100);
              ctx.restore();
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MinervaWhiteboardCanvas;
