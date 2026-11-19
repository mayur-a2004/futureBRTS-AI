import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    FlaskConical, Atom, Maximize2, Minimize2, Play, Shield, Microscope, Layers, Globe
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ─────────────────────────────────────────────────────────────
// TYPES & LABXCHANGE NCERT INDIA + GEOGEBRA 3D CATALOG (NO MOLVIEW MODALS)
// ─────────────────────────────────────────────────────────────

type LabCategory = 'biology' | 'chemistry' | 'physics' | 'mathematics';
type GradeLevel = 'class_11' | 'class_12' | 'jee_neet';

interface LabXchangeNcertLab {
    id: string;
    title: string;
    level: GradeLevel;
    category: LabCategory;
    cleanSimulationUrl: string;
}

const LABXCHANGE_NCERT_CATALOG: LabXchangeNcertLab[] = [
    // 🔬 LABXCHANGE BIOLOGY (NCERT CLASS 11-12)
    {
        id: 'bio_labxchange_simulations',
        title: 'LabXchange NCERT Biology Interactive Simulation Suite',
        level: 'class_12',
        category: 'biology',
        cleanSimulationUrl: 'https://www.labxchange.org/library?types=SIMULATION'
    },
    {
        id: 'bio_electrophoresis_engine',
        title: 'NCERT Class 12 DNA Gel Electrophoresis Simulation',
        level: 'class_12',
        category: 'biology',
        cleanSimulationUrl: 'https://www.labxchange.org/library?types=SIMULATION'
    },
    {
        id: 'bio_transformation_engine',
        title: 'NCERT Class 12 Biotechnology Bacterial Transformation',
        level: 'class_12',
        category: 'biology',
        cleanSimulationUrl: 'https://www.labxchange.org/library?types=SIMULATION'
    },

    // 🥼 LABXCHANGE CHEMISTRY (NCERT CLASS 11-12)
    {
        id: 'chem_labxchange_simulations',
        title: 'LabXchange NCERT Chemistry Interactive Simulation Suite',
        level: 'class_12',
        category: 'chemistry',
        cleanSimulationUrl: 'https://www.labxchange.org/library?types=SIMULATION'
    },
    {
        id: 'chem_titration_engine',
        title: 'NCERT Class 12 Quantitative Acid-Base Titration Molarity',
        level: 'class_12',
        category: 'chemistry',
        cleanSimulationUrl: 'https://www.labxchange.org/library?types=SIMULATION'
    },

    // ⚛️ LABXCHANGE PHYSICS (NCERT CLASS 11-12)
    {
        id: 'phys_labxchange_simulations',
        title: 'LabXchange NCERT Physics Interactive Simulation Suite',
        level: 'class_12',
        category: 'physics',
        cleanSimulationUrl: 'https://www.labxchange.org/library?types=SIMULATION'
    },
    {
        id: 'phys_circuits_engine',
        title: 'NCERT Class 12 Electrical Circuit & Resistance Mechanics',
        level: 'class_12',
        category: 'physics',
        cleanSimulationUrl: 'https://www.geogebra.org/graphing?embed'
    },

    // 📐 MATHEMATICS 3D ENGINES (GEOGEBRA 3D)
    {
        id: 'math_geogebra_3d_spatial',
        title: 'GeoGebra 3D Spatial Geometry & Vector Cross-Product Canvas',
        level: 'jee_neet',
        category: 'mathematics',
        cleanSimulationUrl: 'https://www.geogebra.org/3d?embed'
    },
    {
        id: 'math_calculus_graphing',
        title: 'Calculus, Tangent Slopes dy/dx & Integration Area Engine',
        level: 'class_12',
        category: 'mathematics',
        cleanSimulationUrl: 'https://www.geogebra.org/graphing?embed'
    }
];

export const MinervaVirtualLabSuitePage: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);

    const urlBoard = searchParams.get('board') || (user as any)?.board || 'GSEB';
    const urlMedium = searchParams.get('medium') || (user as any)?.medium || 'English';
    const urlSubject = (searchParams.get('subject') || (user as any)?.selectedSubject || 'Biology').toLowerCase();

    const initialCategory: LabCategory = 
        urlSubject.includes('bio') ? 'biology' :
        urlSubject.includes('chem') ? 'chemistry' :
        urlSubject.includes('phys') ? 'physics' :
        urlSubject.includes('math') ? 'mathematics' : 'biology';

    const [board, setBoard] = useState<string>(urlBoard);
    const [medium, setMedium] = useState<string>(urlMedium);
    const [category, setCategory] = useState<LabCategory>(initialCategory);
    const [selectedLab, setSelectedLab] = useState<LabXchangeNcertLab>(LABXCHANGE_NCERT_CATALOG[0]);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const filtered = LABXCHANGE_NCERT_CATALOG.filter(e => e.category === category);
        if (filtered.length > 0) {
            setSelectedLab(filtered[0]);
        }
    }, [category]);

    // Handle HTML5 Fullscreen API toggle
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            if (containerRef.current?.requestFullscreen) {
                containerRef.current.requestFullscreen().catch(() => {});
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
            setIsFullscreen(false);
        }
    };

    // Listen to native ESC / exit fullscreen events
    useEffect(() => {
        const handleFSChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFSChange);
        return () => document.removeEventListener('fullscreenchange', handleFSChange);
    }, []);

    const categoryLabs = LABXCHANGE_NCERT_CATALOG.filter(e => e.category === category);

    return (
        <div ref={containerRef} className="w-full h-screen bg-[#05030a] text-white font-inter flex flex-col relative overflow-hidden">
            
            {/* ───────────────────────────────────────────────────────────── */}
            {/* TRUE 100% FULLSCREEN OVERLAY MODE */}
            {/* ───────────────────────────────────────────────────────────── */}
            {isFullscreen ? (
                <div className="fixed inset-0 z-[999999] w-screen h-screen bg-black flex flex-col overflow-hidden">
                    {/* Floating Exit Fullscreen Button */}
                    <button
                        onClick={toggleFullscreen}
                        className="absolute top-4 right-4 z-[1000000] px-4 py-2 bg-[#0b0717]/90 hover:bg-red-600 text-white rounded-2xl text-xs font-black shadow-2xl backdrop-blur-xl border border-white/20 transition-all flex items-center gap-2 group"
                    >
                        <Minimize2 size={16} className="group-hover:scale-110 transition-transform" />
                        <span>Exit Full Screen (ESC)</span>
                    </button>

                    {/* 100% Physical Monitor Screen Canvas */}
                    <div className="w-full h-full bg-black flex-1 relative overflow-hidden">
                        <iframe
                            key={`fs-${selectedLab.id}`}
                            src={selectedLab.cleanSimulationUrl}
                            title={selectedLab.title}
                            className="w-full h-full border-0 bg-black"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                </div>
            ) : (
                <>
                    {/* ───────────────────────────────────────────────────────────── */}
                    {/* NORMAL WORKSPACE TOP BAR */}
                    {/* ───────────────────────────────────────────────────────────── */}
                    <div className="bg-[#0b0717]/95 border-b border-white/10 px-4 py-2.5 flex items-center justify-between z-20 flex-wrap gap-2 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center shadow-lg">
                                <FlaskConical className="text-white" size={18} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="font-black text-xs text-white tracking-wide uppercase">FUTURE BRTS NCERT VIRTUAL LAB SUITE</h1>
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[9px] font-bold uppercase">
                                        🇮🇳 LabXchange &amp; GeoGebra Aligned
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Subject Selector Tabs */}
                        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => setCategory('biology')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${category === 'biology' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Microscope size={13} />
                                <span>Biology NCERT</span>
                            </button>
                            <button
                                onClick={() => setCategory('chemistry')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${category === 'chemistry' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                            >
                                <FlaskConical size={13} />
                                <span>Chemistry NCERT</span>
                            </button>
                            <button
                                onClick={() => setCategory('physics')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${category === 'physics' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Atom size={13} />
                                <span>Physics NCERT</span>
                            </button>
                            <button
                                onClick={() => setCategory('mathematics')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${category === 'mathematics' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Layers size={13} />
                                <span>Maths 3D</span>
                            </button>
                        </div>

                        {/* Fullscreen Trigger Button */}
                        <button
                            onClick={toggleFullscreen}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5 border border-emerald-400/40"
                            title="Full Screen Physical Display View"
                        >
                            <Maximize2 size={14} />
                            <span>🖥️ Full Screen Display Mode</span>
                        </button>
                    </div>

                    {/* ───────────────────────────────────────────────────────────── */}
                    {/* SUB-HEADER: DIRECT PRACTICAL LEVEL SELECTOR */}
                    {/* ───────────────────────────────────────────────────────────── */}
                    <div className="bg-[#080514] border-b border-white/10 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
                        <span className="text-[11px] font-black text-emerald-300 uppercase tracking-wider shrink-0">Select Practical Experiment:</span>
                        <div className="flex items-center gap-2 overflow-x-auto visible-scrollbar">
                            {categoryLabs.map((lab) => (
                                <button
                                    key={lab.id}
                                    onClick={() => setSelectedLab(lab)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border shrink-0 ${selectedLab.id === lab.id ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-md scale-105' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                                >
                                    <Play size={10} className={selectedLab.id === lab.id ? 'text-black' : 'text-gray-400'} />
                                    <span>{lab.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ───────────────────────────────────────────────────────────── */}
                    {/* MAIN WORKSPACE: 100% LABXCHANGE INTERACTIVE ENGINE (NO MOLVIEW POPUPS) */}
                    {/* ───────────────────────────────────────────────────────────── */}
                    <div className="flex-1 w-full h-full bg-black relative overflow-hidden flex flex-col">
                        <iframe
                            key={selectedLab.id}
                            src={selectedLab.cleanSimulationUrl}
                            title={selectedLab.title}
                            className="w-full h-full border-0 bg-black flex-1"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default MinervaVirtualLabSuitePage;
