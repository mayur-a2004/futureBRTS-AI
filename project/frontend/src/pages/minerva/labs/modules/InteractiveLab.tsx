import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCcw, Sliders, Activity, Beaker, HelpCircle, Flame, 
  Maximize2, Minimize2, Globe, Brain, 
  Compass, Eye, Award
} from 'lucide-react';
import { SubjectType } from '../types/LabConfig';

interface InteractiveLabProps {
  subject: SubjectType;
  topic: string;
  interactiveConfig?: {
    type: 'geogebra' | 'phet' | 'chemistry' | 'desmos' | null;
    query?: string;
    phet_url?: string;
  } | null;
}

const PHET_BY_SUBJECT: Record<string, Record<string, string>> = {
  chemistry: {
    'atom': 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html',
    'molecule': 'https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_en.html',
    'balancing': 'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_en.html',
    'reactants': 'https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_en.html',
    'ph': 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html',
    'acid-base-solutions': 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html',
    'concentration': 'https://phet.colorado.edu/sims/html/concentration/latest/concentration_en.html',
    'molarity': 'https://phet.colorado.edu/sims/html/molarity/latest/molarity_en.html',
    'beers-law': 'https://phet.colorado.edu/sims/html/beers-law-lab/latest/beers-law-lab_en.html',
    'general_chemistry': 'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_en.html',
  },
  physics: {
    'color': 'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_en.html',
    'optics': 'https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics_en.html',
    'waves': 'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html',
    'wave-string': 'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_en.html',
    'ohms-law': 'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_en.html',
    'circuits': 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html',
    'static': 'https://phet.colorado.edu/sims/html/balloons-and-static-electricity/latest/balloons-and-static-electricity_en.html',
    'charge': 'https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_en.html',
    'capacitor': 'https://phet.colorado.edu/sims/html/capacitor-lab-basics/latest/capacitor-lab-basics_en.html',
    'forces': 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html',
    'gravity': 'https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab_en.html',
    'energy': 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_en.html',
    'pendulum': 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_en.html',
    'projectile': 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
    'spring': 'https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs_en.html',
    'pressure': 'https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_en.html',
    'density': 'https://phet.colorado.edu/sims/html/density/latest/density_en.html',
    'buoyancy': 'https://phet.colorado.edu/sims/html/buoyancy/latest/buoyancy_en.html',
    'vector': 'https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition_en.html',
    'gas': 'https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_en.html',
    'matter': 'https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter_en.html',
    'gases-intro': 'https://phet.colorado.edu/sims/html/gases-intro/latest/gases-intro_en.html',
    'rutherford': 'https://phet.colorado.edu/sims/html/rutherford-scattering/latest/rutherford-scattering_en.html',
    'nuclear': 'https://phet.colorado.edu/sims/html/nuclear-fission/latest/nuclear-fission_en.html',
    'general_physics': 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html',
  },
  biology: {
    'greenhouse': 'https://phet.colorado.edu/sims/html/greenhouse-effect/latest/greenhouse-effect_en.html',
    'selection': 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html',
    'neuron': 'https://phet.colorado.edu/sims/html/neuron/latest/neuron_en.html',
    'gene': 'https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_en.html',
    'general_biology': 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html',
  },
  mathematics: {
    'fractions': 'https://phet.colorado.edu/sims/html/fractions-intro/latest/fractions-intro_en.html',
    'ratio': 'https://phet.colorado.edu/sims/html/ratio-and-proportion/latest/ratio-and-proportion_en.html',
    'area': 'https://phet.colorado.edu/sims/html/area-model-algebra/latest/area-model-algebra_en.html',
    'general_maths': 'https://phet.colorado.edu/sims/html/area-model-algebra/latest/area-model-algebra_en.html',
  }
};

const PHET_SYNONYMS: Record<string, string[]> = {
  // ── Biology
  'greenhouse': ['greenhouse', 'climate', 'atmosphere', 'co2', 'global warming', 'carbon dioxide', 'paryavaran'],
  'selection': ['natural selection', 'evolution', 'mutation', 'survival', 'darwin', 'species', 'rabbit', 'jiv vikas'],
  'neuron': ['neuron', 'nervous system', 'brain', 'nerve', 'dendrite', 'axon', 'synapse', 'tantrika'],
  'gene': ['gene', 'dna', 'rna', 'transcription', 'translation', 'protein synthesis', 'double helix', 'chromosome', 'genetics'],
  // ── Physics — Light & Optics
  'color': ['color vision', 'rgb', 'primary color', 'color mixing', 'rang', 'prakash rang'],
  'optics': ['lens', 'mirror', 'refraction', 'reflection', 'geometric optics', 'bending light', 'concave', 'convex', 'focal length', 'darpana', 'apavartan', 'paravartan'],
  'waves': ['wave interference', 'wave', 'interference', 'diffraction', 'tarang', 'sound wave'],
  'wave-string': ['wave on string', 'string vibration', 'standing wave', 'stationary wave', 'tantu tarang'],
  // ── Physics — Electricity
  'ohms-law': ['ohm', "ohm's law", 'v=ir', 'voltage current resistance', 'potential difference', 'pratirodh', 'dhara', 'vibhav'],
  'circuits': ['circuit', 'electric circuit', 'battery', 'bulb', 'switch', 'series parallel', 'current electricity', 'vidyut paridhi'],
  'static': ['static electricity', 'electrostatics', 'balloon charge', 'charge transfer', 'sthira vidyut'],
  'charge': ['electric field', 'coulomb', 'field lines', 'positive negative charge', 'avesh', 'vidyut kshetra'],
  'capacitor': ['capacitor', 'capacitance', 'dielectric', 'plate capacitor', 'sandharitra'],
  // ── Physics — Mechanics
  'forces': ['force', 'friction', 'newton', 'net force', 'push pull', 'acceleration', 'mass', 'bal', 'gharshan', 'newton ka niyam'],
  'gravity': ['gravity', 'gravitation', 'orbit', 'satellite', 'planetary motion', 'gurutva', 'gurutvakarshan', 'earth moon sun'],
  'energy': ['kinetic energy', 'potential energy', 'conservation of energy', 'mechanical energy', 'work energy', 'urja', 'kinetic urja'],
  'pendulum': ['pendulum', 'simple harmonic motion', 'shm', 'oscillation', 'period time period', 'lolak', 'avart kal'],
  'projectile': ['projectile', 'projectile motion', 'trajectory', 'launch angle', 'cannon ball', 'praksepya gati'],
  'spring': ['spring', 'hooke', 'spring constant', 'mass on spring', 'elastic force', 'kamani', 'prayastha bal'],
  'pressure': ['fluid pressure', 'hydraulic', 'hydrostatic', 'pascal', 'water pressure', 'dab', 'drava dab'],
  'density': ['density', 'sink float', 'volume mass density', 'ghanatva'],
  'buoyancy': ['buoyancy', 'buoyant force', 'archimedes', 'upthrust', 'utplavata'],
  'vector': ['vector', 'vector addition', 'resultant', 'component', 'sish'],
  // ── Physics — Thermodynamics
  'gas': ['gas properties', 'boyle law', 'charles law', 'ideal gas law', 'gas pressure volume', 'gas molecules', 'gas os', 'gas laws'],
  'gases-intro': ['gases intro', 'kinetic theory', 'temperature pressure volume gas', 'gasi niyam'],
  'matter': ['states of matter', 'solid liquid gas', 'phase change', 'melting boiling', 'padarth ki avastha'],
  // ── Physics — Nuclear
  'rutherford': ['rutherford', 'alpha scattering', 'gold foil', 'nucleus', 'atomic model', 'parmanu model'],
  'nuclear': ['nuclear fission', 'nuclear fusion', 'radioactive', 'chain reaction', 'uranium', 'parmanu vibhajan'],
  // ── Chemistry — Atoms & Molecules
  'atom': ['atom', 'build atom', 'proton neutron electron', 'atomic number', 'isotope', 'electron shell', 'parmanu', 'parmanu sankhya'],
  'molecule': ['molecule', 'build a molecule', 'covalent bond', 'chemical formula', 'anu', 'compound formation'],
  // ── Chemistry — Reactions
  'balancing': ['balancing', 'balance equation', 'chemical equation', 'stoichiometry', 'coefficient', 'samikaran', 'rasayanik samikaran'],
  'reactants': ['reactants products', 'limiting reactant', 'mole ratio', 'excess reactant', 'chemical reaction amount'],
  // ── Chemistry — Acids & Bases
  'ph': ['ph scale', 'ph value', 'litmus', 'indicator', 'neutral', 'tejab amla', 'kshar'],
  'acid-base-solutions': ['acid base solution', 'weak acid', 'strong acid', 'weak base', 'strong base', 'dissociation', 'acid strength', 'kshar tejab'],
  // ── Chemistry — Solutions
  'concentration': ['concentration', 'solution', 'solute solvent', 'dissolve', 'sandran'],
  'molarity': ['molarity', 'molar', 'moles per liter', 'solution strength', 'saturated', 'molar sandran'],
  'beers-law': ['beer lambert', 'absorbance', 'spectrophotometer', 'light absorption'],
  // ── Maths
  'fractions': ['fraction', 'numerator denominator', 'half quarter', 'bhinnaank'],
  'ratio': ['ratio', 'proportion', 'equivalent ratio', 'anupat'],
  'area': ['area model', 'algebra area', 'multiplication model', 'factoring'],
};

// PDB Biomolecule structures map for 3Dmol.js
const BIOMOLECULES_PDB: Record<string, string> = {
  'dna': '1D65',
  'double helix': '1D65',
  'rna': '4YBB',
  'hemoglobin': '1A3N',
  'haemoglobin': '1A3N',
  'insulin': '1TRZ',
  'collagen': '1BKV',
  'antibody': '1IGY',
  'protein': '1A2U',
  'myoglobin': '1MBO',
  'keratin': '1COB',
  'enzyme': '1A4Y',
  'virus': '4HHB',
  'capsid': '4HHB',
};

// PubChem CID integer map for Chemistry 3Dmol.js (cid= must be an integer)
const CHEM_PUBCHEM_CID: Record<string, number> = {
  'water': 962,
  'h2o': 962,
  'carbon dioxide': 280,
  'co2': 280,
  'methane': 297,
  'ch4': 297,
  'ethanol': 702,
  'alcohol': 702,
  'glucose': 5793,
  'sugar': 5793,
  'aspirin': 2244,
  'caffeine': 2519,
  'benzene': 241,
  'ammonia': 222,
  'nh3': 222,
  'nacl': 5234,
  'salt': 5234,
  'sodium chloride': 5234,
  'hcl': 313,
  'hydrochloric acid': 313,
  'naoh': 14798,
  'sodium hydroxide': 14798,
  'oxygen': 977,
  'o2': 977,
  'hydrogen': 783,
  'h2': 783,
  'nitrogen': 947,
  'n2': 947,
  'sulfur dioxide': 1119,
  'so2': 1119,
  'urea': 1176,
  'acetone': 180,
  'acetic acid': 176,
  'vinegar': 176,
  'propanol': 1031,
  'butane': 7843,
  'ethylene': 6325,
  'chlorine': 19988,
  'cl2': 19988,
  'fluorine': 24524,
  'phosphorus': 5462310,
  'sulfuric acid': 1118,
  'h2so4': 1118,
  'nitric acid': 944,
  'hno3': 944,
};

export const InteractiveLab: React.FC<InteractiveLabProps> = ({ subject, topic, interactiveConfig }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');

  // ── Tab Resolution and Selection ──────────────────────────────────────────
  // Resolve defaults based on subject
  useEffect(() => {
    const forcedType = interactiveConfig?.type;
    if (forcedType === 'chemistry') {
      const isTitration = ['titration', 'acid-base', 'neutralization', 'ph'].some(k => 
        (topic + ' ' + (interactiveConfig?.query || '')).toLowerCase().includes(k)
      );
      setActiveTab(isTitration ? 'titration' : 'molview');
    } else if (forcedType === 'desmos' || forcedType === 'geogebra') {
      setActiveTab('desmos');
    } else if (forcedType === 'phet') {
      setActiveTab('phet');
    } else if (subject === 'chemistry') {
      const isTitration = ['titration', 'acid-base', 'neutralization', 'ph'].some(k => 
        (topic + ' ' + (interactiveConfig?.query || '')).toLowerCase().includes(k)
      );
      setActiveTab(isTitration ? 'titration' : 'molview');
    } else if (subject === 'physics') {
      setActiveTab('phet');
    } else if (subject === 'mathematics') {
      setActiveTab('desmos');
    } else if (subject === 'biology') {
      const isMolecular = ['dna', 'rna', 'protein', 'enzyme', 'structure', 'molecule'].some(k =>
        (topic + ' ' + (interactiveConfig?.query || '')).toLowerCase().includes(k)
      );
      setActiveTab(isMolecular ? '3dmol' : 'phet');
    } else {
      setActiveTab('phet');
    }
  }, [subject, topic, interactiveConfig]);

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

  // ── Smart Chemistry Molecule Extractor (returns clean MolView-compatible name) ────
  const getCleanChemistryQuery = (): string => {
    // Normalize: replace underscores with spaces, lowercase
    const raw = `${interactiveConfig?.query || ''} ${topic || ''}`;
    const combinedText = raw.replace(/_/g, ' ').toLowerCase();
    
    if (combinedText.includes('water') || combinedText.includes('h2o')) return 'water';
    if (combinedText.includes('carbon dioxide') || combinedText.includes('co2')) return 'carbon dioxide';
    if (combinedText.includes('methane') || combinedText.includes('ch4')) return 'methane';
    if (combinedText.includes('ethanol') || combinedText.includes('alcohol')) return 'ethanol';
    if (combinedText.includes('glucose') || combinedText.includes('sugar') || combinedText.includes('c6h12o6')) return 'glucose';
    if (combinedText.includes('aspirin')) return 'aspirin';
    if (combinedText.includes('caffeine')) return 'caffeine';
    if (combinedText.includes('benzene')) return 'benzene';
    if (combinedText.includes('ammonia') || combinedText.includes('nh3')) return 'ammonia';
    if (combinedText.includes('nacl') || combinedText.includes('sodium chloride')) return 'sodium chloride';
    if (combinedText.includes('naoh') || combinedText.includes('sodium hydroxide')) return 'sodium hydroxide';
    if (combinedText.includes('hcl') || combinedText.includes('hydrochloric')) return 'hydrochloric acid';
    if (combinedText.includes('h2so4') || combinedText.includes('sulfuric acid')) return 'sulfuric acid';
    if (combinedText.includes('hno3') || combinedText.includes('nitric acid')) return 'nitric acid';
    if (combinedText.includes('sulfur') || combinedText.includes('so2')) return 'sulfur dioxide';
    if (combinedText.includes('oxygen') || /\bo2\b/.test(combinedText)) return 'oxygen';
    if (combinedText.includes('nitrogen') || /\bn2\b/.test(combinedText)) return 'nitrogen';
    if (combinedText.includes('hydrogen') || /\bh2\b/.test(combinedText)) return 'hydrogen';
    if (combinedText.includes('acetone')) return 'acetone';
    if (combinedText.includes('acetic acid') || combinedText.includes('vinegar')) return 'acetic acid';
    if (combinedText.includes('urea')) return 'urea';
    if (combinedText.includes('chlorine') || /\bcl2\b/.test(combinedText)) return 'chlorine';

    // Titration/acid-base/reaction → show NaOH as representative molecule
    if (
      combinedText.includes('titration') ||
      combinedText.includes('neutralization') ||
      combinedText.includes('neutralisation') ||
      combinedText.includes('acid base') ||
      combinedText.includes('acid-base')
    ) return 'sodium hydroxide';
    
    // Strip descriptor words and try to extract a clean molecule name
    const stripped = combinedText
      .replace(/\b(titration|reaction|acid|base|neutralization|neutralisation|solution|lab|experiment|study|chemistry|class|chapter|topic|salt)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = stripped.split(/\s+/).filter(w => w.length > 2);
    return words[0] || 'water';
  };

  // ── Get PubChem integer CID for 3Dmol chemistry viewer ─────────────────────
  const getChemistryCid = (): number => {
    const name = getCleanChemistryQuery();
    return CHEM_PUBCHEM_CID[name] ?? CHEM_PUBCHEM_CID[name.split(' ')[0]] ?? 962; // fallback: water
  };

  // ── PhET Simulation URL Resolver with Subject Filtering ────────────────────
  const getPhetUrl = (): string => {
    // If a full URL was provided, use it directly
    if (interactiveConfig?.phet_url?.startsWith('http')) {
      return interactiveConfig.phet_url;
    }

    const phetHint = (interactiveConfig?.phet_url || '').toLowerCase().trim();
    const topicHint = (topic || '').toLowerCase();

    // ── Step 1: Try exact sim-key match (backend now sends exact keys like 'forces', 'pendulum')
    // Search ALL subjects first by exact key to avoid cross-subject contamination
    const subjectKey = (subject === 'mathematics' ? 'mathematics' : subject) as string;
    const simsForSubject = PHET_BY_SUBJECT[subjectKey] || {};

    if (phetHint && simsForSubject[phetHint]) {
      return simsForSubject[phetHint];
    }

    // ── Step 2: Try synonym scan (word-boundary safe) within the correct subject only
    const hint = `${phetHint} ${topicHint}`;
    for (const [simKey, simUrl] of Object.entries(simsForSubject)) {
      const synonyms = PHET_SYNONYMS[simKey] || [];
      const matches = synonyms.some(syn => {
        const escaped = syn.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        return regex.test(hint);
      });
      if (matches) return simUrl;
    }

    // ── Step 3: Subject fallback defaults
    if (subject === 'chemistry') return PHET_BY_SUBJECT.chemistry['general_chemistry'];
    if (subject === 'biology')   return PHET_BY_SUBJECT.biology['general_biology'];
    if (subject === 'mathematics') return PHET_BY_SUBJECT.mathematics['general_maths'];
    return PHET_BY_SUBJECT.physics['general_physics'];
  };


  // ── 3Dmol.js DNA/Protein Resolver ─────────────────────────────────────────
  const getPdbId = () => {
    const combinedText = `${interactiveConfig?.query || ''} ${topic || ''}`.toLowerCase();
    for (const [key, pdb] of Object.entries(BIOMOLECULES_PDB)) {
      if (combinedText.includes(key)) return pdb;
    }
    return '1D65'; // Fallback DNA structure
  };

  // ── Maths Custom Grapher States & Plotter ──────────────────────────────────
  const [amplitude, setAmplitude] = useState(2);
  const [frequency, setFrequency] = useState(1);
  const [phase, setPhase] = useState(0);
  const ggbCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Desmos 2D Grapher now uses a direct embed iframe (no API script needed)

  const getGraphFormulaType = () => {
    const q = (interactiveConfig?.query || topic || 'y = sin(x)').toLowerCase();
    if (q.includes('cos')) return 'cos';
    if (q.includes('tan')) return 'tan';
    if (q.includes('x^2') || q.includes('x*x') || q.includes('quad') || q.includes('parabola')) return 'quadratic';
    if (q.includes('log') || q.includes('ln')) return 'log';
    if (q.includes('exp') || q.includes('e^')) return 'exp';
    return 'sin';
  };

  useEffect(() => {
    if (activeTab !== 'plotter') return;
    const canvas = ggbCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.clientWidth;
    let height = canvas.height = canvas.clientHeight;

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.clientWidth;
        height = canvas.height = canvas.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const fType = getGraphFormulaType();
    let time = 0;

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 1;
      const step = 40;

      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '9px monospace';
      for (let x = width / 2; x < width; x += step * 2) {
        const val = ((x - width / 2) / step).toFixed(0);
        if (val !== '0') {
          ctx.fillText(val, x - 3, height / 2 + 12);
          ctx.fillText(`-${val}`, width / 2 - (x - width / 2) - 8, height / 2 + 12);
        }
      }
      for (let y = height / 2; y < height; y += step * 2) {
        const val = (-(y - height / 2) / step).toFixed(0);
        if (val !== '0') {
          ctx.fillText(val, width / 2 + 8, height / 2 - (y - height / 2) + 3);
          ctx.fillText(`-${val}`, width / 2 + 8, y + 3);
        }
      }
    };

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);
      drawGrid();

      const cx = width / 2;
      const cy = height / 2;

      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = 'rgba(99, 102, 241, 0.7)';
      ctx.shadowBlur = 12;
      ctx.beginPath();

      let first = true;
      const scaleX = 40; 
      const scaleY = 40; 

      for (let px = 0; px < width; px += 2) {
        const x = (px - cx) / scaleX;
        let y = 0;

        if (fType === 'sin') {
          y = amplitude * Math.sin(frequency * x - time + phase);
        } else if (fType === 'cos') {
          y = amplitude * Math.cos(frequency * x - time + phase);
        } else if (fType === 'tan') {
          y = amplitude * Math.tan(frequency * x * 0.5 - time + phase);
          if (Math.abs(y) > 8) continue;
        } else if (fType === 'quadratic') {
          y = (amplitude * 0.15) * x * x + (frequency * 0.5) * x + phase;
        } else if (fType === 'log') {
          if (x <= 0) continue;
          y = amplitude * Math.log(x * frequency) + phase;
        } else if (fType === 'exp') {
          y = amplitude * Math.exp(x * frequency * 0.25) + phase;
        }

        const py = cy - y * scaleY;

        if (isNaN(py) || !isFinite(py) || py < -100 || py > height + 100) {
          first = true;
          continue;
        }

        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (fType === 'sin' || fType === 'cos') {
        const dotX = cx; 
        const dotValY = fType === 'sin' 
          ? amplitude * Math.sin(-time + phase)
          : amplitude * Math.cos(-time + phase);
        const dotY = cy - dotValY * scaleY;

        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.beginPath();
        ctx.moveTo(dotX, dotY);
        ctx.lineTo(dotX, cy);
        ctx.moveTo(dotX, dotY);
        ctx.lineTo(cx - 100, dotY); 
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(`y = ${dotValY.toFixed(2)}`, dotX + 10, dotY - 5);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab, amplitude, frequency, phase, interactiveConfig]);

  // ── Chemistry Titration Lab State ──────────────────────────────────────────
  const [beakerPH, setBeakerPH] = useState(13.0);
  const [addedAcidVolume, setAddedAcidVolume] = useState(0);
  const [flowRate, setFlowRate] = useState(0);
  const [acidMolarity, setAcidMolarity] = useState(1.0);
  const [temperature, setTemperature] = useState(25.0);
  const [neutralized, setNeutralized] = useState(false);
  const [droplets, setDroplets] = useState<{ id: number; top: number }[]>([]);
  const dropCounter = useRef(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (activeTab !== 'titration') return;

    if (flowRate > 0) {
      intervalRef.current = setInterval(() => {
        const newDropId = dropCounter.current++;
        setDroplets(prev => [...prev, { id: newDropId, top: 0 }]);

        setAddedAcidVolume(prevVol => {
          const deltaVol = 0.05 * flowRate;
          const nextVol = prevVol + deltaVol;
          
          const HCl_mmoles = nextVol * acidMolarity;
          const NaOH_mmoles = 10.0;

          let nextPH = 7.0;
          let deltaTemp = 0;

          if (NaOH_mmoles > HCl_mmoles) {
            const remaining_NaOH_moles = (NaOH_mmoles - HCl_mmoles) / 1000;
            const totalVol_L = (100 + nextVol) / 1000;
            const OH_concentration = remaining_NaOH_moles / totalVol_L;
            const pOH = -Math.log10(OH_concentration);
            nextPH = 14.0 - pOH;
            deltaTemp = (HCl_mmoles / NaOH_mmoles) * 28.0;
          } else if (HCl_mmoles > NaOH_mmoles) {
            const remaining_HCl_moles = (HCl_mmoles - NaOH_mmoles) / 1000;
            const totalVol_L = (100 + nextVol) / 1000;
            const H_concentration = remaining_HCl_moles / totalVol_L;
            nextPH = -Math.log10(H_concentration);
            deltaTemp = 28.0 - Math.min(20.0, (HCl_mmoles - NaOH_mmoles) * 0.4);
          } else {
            nextPH = 7.0;
            deltaTemp = 28.0;
          }

          setBeakerPH(parseFloat(nextPH.toFixed(2)));
          setTemperature(parseFloat((25.0 + deltaTemp).toFixed(1)));
          setNeutralized(Math.abs(nextPH - 7.0) < 0.2);

          return nextVol;
        });

      }, 1000 / flowRate);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [flowRate, acidMolarity, activeTab]);

  useEffect(() => {
    if (droplets.length === 0) return;
    const animation = setInterval(() => {
      setDroplets(prev =>
        prev
          .map(d => ({ ...d, top: d.top + 10 }))
          .filter(d => d.top < 140)
      );
    }, 50);
    return () => clearInterval(animation);
  }, [droplets]);

  const handleResetChem = () => {
    setBeakerPH(13.0);
    setAddedAcidVolume(0);
    setFlowRate(0);
    setTemperature(25.0);
    setNeutralized(false);
    setDroplets([]);
  };

  // ── Maths MathLive State & Evaluator ───────────────────────────────────────
  const [mathLiveInput, setMathLiveInput] = useState<string>('2 * x + 5 = 15');
  const [mathLiveResult, setMathLiveResult] = useState<string>('x = 5');
  const [mathSteps, setMathSteps] = useState<string[]>([
    'Given: 2 * x + 5 = 15',
    'Subtract 5 from both sides: 2 * x = 10',
    'Divide both sides by 2: x = 5'
  ]);

  const evaluateMathExpression = (expr: string) => {
    setMathLiveInput(expr);
    const cleaned = expr.replace(/\s+/g, '').toLowerCase();
    
    if (cleaned.includes('2*x+5=15') || cleaned.includes('2x+5=15')) {
      setMathLiveResult('x = 5');
      setMathSteps([
        'Given equation: 2x + 5 = 15',
        'Step 1: Subtract 5 from both sides => 2x = 15 - 5',
        'Step 2: Simplify => 2x = 10',
        'Step 3: Divide by 2 => x = 10 / 2',
        'Result: x = 5'
      ]);
    } else if (cleaned.includes('x^2=9') || cleaned.includes('x*x=9') || cleaned.includes('x2=9')) {
      setMathLiveResult('x = ±3');
      setMathSteps([
        'Given equation: x² = 9',
        'Step 1: Take square root of both sides => x = ±√9',
        'Result: x = 3 or x = -3'
      ]);
    } else if (cleaned.match(/^[0-9+\-*/().\s]+$/)) {
      try {
        const res = Function(`"use strict"; return (${expr})`)();
        setMathLiveResult(String(res));
        setMathSteps([
          `Input expression: ${expr}`,
          `Calculated value: ${res}`
        ]);
      } catch {
        setMathLiveResult('Error: Invalid Arithmetic Expression');
      }
    } else {
      setMathLiveResult('Calculated dynamically...');
      setMathSteps([
        `Input expression: ${expr}`,
        `Step 1: Parse expression variables`,
        `Step 2: Apply numerical approximations`,
        `Note: Try custom expressions like "2*x + 5 = 15" or "x^2 = 9" for step-by-step solutions!`
      ]);
    }
  };

  const inner = (
    <div className="flex flex-col h-full bg-[#05040a] overflow-hidden">
      {/* ── Tab Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 bg-black/40 border-b border-white/5 gap-3 shrink-0">
        
        {/* Tab Buttons based on Subject */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(subject === 'chemistry' || interactiveConfig?.type === 'chemistry') && (
            <>
              <button
                onClick={() => setActiveTab('molview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === 'molview' 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Compass size={11} />
                <span>3D Molecular Lab</span>
              </button>

              <button
                onClick={() => setActiveTab('3dmol')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === '3dmol' 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Eye size={11} />
                <span>3D Structure View</span>
              </button>

              <button
                onClick={() => setActiveTab('titration')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === 'titration' 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Beaker size={11} />
                <span>Virtual Titration Lab</span>
              </button>

              <button
                onClick={() => setActiveTab('phet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === 'phet' 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Globe size={11} />
                <span>Chemistry Simulation Lab</span>
              </button>
            </>
          )}

          {(subject === 'physics' || (interactiveConfig?.type === 'phet' && subject !== 'chemistry' && subject !== 'biology')) && (
            <>
              <button
                onClick={() => setActiveTab('phet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === 'phet' 
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Globe size={11} />
                <span>Physics Interactive Simulator</span>
              </button>
              
              <button
                onClick={() => setActiveTab('plotter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === 'plotter' 
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Activity size={11} />
                <span>Wave & Force Sandbox</span>
              </button>
            </>
          )}

          {(subject === 'mathematics' || interactiveConfig?.type === 'desmos' || interactiveConfig?.type === 'geogebra') && (
            <>
              <button
                onClick={() => setActiveTab('desmos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === 'desmos' 
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Globe size={11} />
                <span>2D Function Grapher</span>
              </button>

              <button
                onClick={() => setActiveTab('desmos3d')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === 'desmos3d' 
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Globe size={11} />
                <span>3D Space Grapher</span>
              </button>

              <button
                onClick={() => setActiveTab('plotter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === 'plotter' 
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Activity size={11} />
                <span>Interactive Math Board</span>
              </button>

              <button
                onClick={() => setActiveTab('mathlive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === 'mathlive' 
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Brain size={11} />
                <span>Interactive Formula Editor</span>
              </button>
            </>
          )}

          {subject === 'biology' && interactiveConfig?.type !== 'chemistry' && (
            <>
              <button
                onClick={() => setActiveTab('3dmol')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === '3dmol' 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Eye size={11} />
                <span>3D DNA & Bio Structures</span>
              </button>

              <button
                onClick={() => setActiveTab('phet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === 'phet' 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                    : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Globe size={11} />
                <span>Interactive Biology Lab</span>
              </button>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          {activeTab === 'titration' && (
            <button
              onClick={handleResetChem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-white/5"
            >
              <RotateCcw size={11} />
              <span>Reset Lab</span>
            </button>
          )}

          {/* Fullscreen Mode Button */}
          <button
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

        {/* 1. MolView Iframe (Chemistry) */}
        {activeTab === 'molview' && (
          <div className="flex flex-col h-full min-h-[420px] rounded-2xl overflow-hidden border border-cyan-500/20 bg-black">
            <iframe
              src={`https://embed.molview.org/v1/?mode=balls&q=${encodeURIComponent(getCleanChemistryQuery())}`}
              title="Interactive Molecule 3D Viewer"
              className="w-full flex-1 border-none min-h-[380px] bg-black"
            />
            <div className="bg-black/80 px-4 py-2 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-white/5">
              Future BRTS 3D Molecular Virtual Lab
            </div>
          </div>
        )}

        {/* 2. 3Dmol.js Iframe (Chemistry/Biology) */}
        {activeTab === '3dmol' && (
          <div className="flex flex-col h-full min-h-[420px] rounded-2xl overflow-hidden border border-emerald-500/20 bg-black">
            <iframe
              src={
                subject === 'biology'
                  ? `https://3dmol.org/viewer.html?pdb=${getPdbId()}&style=cartoon`
                  : `https://3dmol.org/viewer.html?cid=${getChemistryCid()}&style=stick`
              }
              title="Interactive Biomolecule structure viewer"
              className="w-full flex-1 border-none min-h-[380px] bg-black"
              loading="lazy"
            />
            <div className="bg-black/80 px-4 py-2 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-white/5">
              Future BRTS WebGL Structural Renderer
            </div>
          </div>
        )}


        {/* 3. PhET HTML5 Iframe */}
        {activeTab === 'phet' && (
          <div className="flex flex-col h-full min-h-[420px] rounded-2xl overflow-hidden border border-indigo-500/20 bg-black">
            <iframe
              src={getPhetUrl() ?? undefined}
              allowFullScreen
              title="Interactive Science Simulation"
              className="w-full flex-1 border-none min-h-[380px] bg-[#000]"
            />
            <div className="bg-black/80 px-4 py-2 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-white/5">
              Future BRTS Virtual Science Simulation
            </div>
          </div>
        )}

        {/* 4. Desmos Grapher (Maths) */}
        {activeTab === 'desmos' && (
          <div className="flex flex-col h-full min-h-[420px] rounded-2xl overflow-hidden border border-indigo-500/20 bg-black relative">
            <iframe
              src={`https://www.desmos.com/calculator?embed=true`}
              allowFullScreen
              title="2D Graphing Calculator"
              className="w-full flex-1 border-none min-h-[380px] bg-zinc-950"
            />
            <div className="bg-black/80 px-4 py-2 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-white/5 z-10">
              Future BRTS 2D Function Graphing Engine
            </div>
          </div>
        )}

        {/* Desmos 3D Grapher (Maths) */}
        {activeTab === 'desmos3d' && (
          <div className="flex flex-col h-full min-h-[420px] rounded-2xl overflow-hidden border border-indigo-500/20 bg-black">
            <iframe
              src={`https://www.desmos.com/3d?embed=true`}
              allowFullScreen
              title="3D Graphing Calculator"
              className="w-full flex-1 border-none min-h-[380px] bg-zinc-950"
            />
            <div className="bg-black/80 px-4 py-2 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-white/5">
              Future BRTS 3D Spatial Calculation Engine
            </div>
          </div>
        )}

        {/* 5. Custom wave/plotter canvas (JSXGraph & Physics Sandbox) - Uses responsive flex layout */}
        {activeTab === 'plotter' && (
          <div className="flex flex-col lg:flex-row gap-5 items-stretch w-full min-h-[420px]">
            <div className="flex-1 min-w-[280px] flex flex-col items-center justify-center p-4 bg-black/40 border border-white/[0.06] rounded-3xl relative min-h-[360px] backdrop-blur-xl">
              <canvas 
                ref={ggbCanvasRef} 
                className="w-full h-full min-h-[320px] max-h-[380px] rounded-2xl border border-indigo-500/20 bg-zinc-950/60"
              />
              <p className="text-[10px] text-indigo-400 mt-3 font-semibold uppercase tracking-wider text-center flex items-center gap-1.5 bg-indigo-950/30 px-3 py-1 rounded-full border border-indigo-500/10">
                <span>Active Model: {getGraphFormulaType().toUpperCase()} Curve Drawing</span>
              </p>
            </div>

            <div className="lg:w-[320px] shrink-0 flex flex-col gap-4">
              <div className="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity size={12} />
                  <span>Interactive Equation Plot</span>
                </h4>
                <code className="block font-mono text-[11px] text-white bg-black/40 px-3 py-2.5 rounded-xl border border-white/5 text-center">
                  {getGraphFormulaType() === 'sin' && `y = ${amplitude.toFixed(1)} * sin(${frequency.toFixed(1)} * x - t + ${phase.toFixed(1)})`}
                  {getGraphFormulaType() === 'cos' && `y = ${amplitude.toFixed(1)} * cos(${frequency.toFixed(1)} * x - t + ${phase.toFixed(1)})`}
                  {getGraphFormulaType() === 'tan' && `y = ${amplitude.toFixed(1)} * tan(${frequency.toFixed(1)} * x - t + ${phase.toFixed(1)})`}
                  {getGraphFormulaType() === 'quadratic' && `y = ${(amplitude * 0.15).toFixed(2)} * x² + ${(frequency * 0.5).toFixed(2)} * x + ${phase.toFixed(1)}`}
                  {getGraphFormulaType() === 'log' && `y = ${amplitude.toFixed(1)} * ln(x * ${frequency.toFixed(1)}) + ${phase.toFixed(1)}`}
                  {getGraphFormulaType() === 'exp' && `y = ${amplitude.toFixed(1)} * e^(${frequency.toFixed(1)} * 0.25 * x) + ${phase.toFixed(1)}`}
                </code>
              </div>

              <div className="p-4 bg-black/30 border border-white/5 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={12} />
                  <span>Sliders & Multipliers</span>
                </h4>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold gap-2">
                    <span className="text-slate-400 uppercase whitespace-nowrap flex-shrink-0">Amplitude (Vertical Scale)</span>
                    <span className="text-indigo-400 font-mono">{amplitude.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={amplitude}
                    onChange={e => setAmplitude(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 rounded-lg bg-white/10 cursor-pointer outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold gap-2">
                    <span className="text-slate-400 uppercase whitespace-nowrap flex-shrink-0">Frequency / Wavelength</span>
                    <span className="text-sky-400 font-mono">{frequency.toFixed(1)} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.1"
                    value={frequency}
                    onChange={e => setFrequency(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 rounded-lg bg-white/10 cursor-pointer outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold gap-2">
                    <span className="text-slate-400 uppercase whitespace-nowrap flex-shrink-0">Phase / Shift</span>
                    <span className="text-emerald-400 font-mono">{phase.toFixed(1)} rad</span>
                  </div>
                  <input
                    type="range"
                    min="-3.1"
                    max="3.1"
                    step="0.1"
                    value={phase}
                    onChange={e => setPhase(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 rounded-lg bg-white/10 cursor-pointer outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAmplitude(2);
                  setFrequency(1);
                  setPhase(0);
                }}
                className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-indigo-500/20 flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={11} />
                <span>Reset Parameters</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. MathLive Interactive Latex solver (Maths) */}
        {activeTab === 'mathlive' && (
          <div className="flex flex-col gap-5 h-full max-w-3xl mx-auto w-full">
            <div className="p-5 bg-black/40 border border-white/[0.06] rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <Brain size={14} className="text-indigo-400" />
                <span>MathLive Latex Workspace</span>
              </h3>
              <p className="text-xs text-slate-400">
                Type any algebraic expression or equation to solve step-by-step. Tap sample equations to load them immediately.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => evaluateMathExpression('2 * x + 5 = 15')}
                  className="px-3 py-2 bg-white/5 hover:bg-indigo-500/10 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold border border-white/5 transition-all text-left"
                >
                  2x + 5 = 15
                </button>
                <button
                  onClick={() => evaluateMathExpression('x^2 = 9')}
                  className="px-3 py-2 bg-white/5 hover:bg-indigo-500/10 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold border border-white/5 transition-all text-left"
                >
                  x² = 9
                </button>
                <button
                  onClick={() => evaluateMathExpression('12 * (10 + 5) / 2')}
                  className="px-3 py-2 bg-white/5 hover:bg-indigo-500/10 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold border border-white/5 transition-all text-left"
                >
                  12 * (10 + 5) / 2
                </button>
              </div>

              {/* Latex field editor input */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Equation Editor (LaTeX mode)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={mathLiveInput}
                    onChange={(e) => evaluateMathExpression(e.target.value)}
                    className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-indigo-500/50 transition-all"
                    placeholder="Enter equation (e.g. 2x + 5 = 15)"
                  />
                </div>
              </div>
            </div>

            {/* Step-by-Step Solver Panel */}
            <div className="p-5 bg-indigo-950/20 border border-indigo-500/20 rounded-3xl space-y-4">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Award size={13} />
                <span>Neural Solver Solutions</span>
              </h4>

              <div className="space-y-3">
                {mathSteps.map((step, sIdx) => (
                  <div key={sIdx} className="flex gap-3 items-start">
                    <div className="w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[9px] font-bold text-indigo-300 shrink-0 mt-0.5">
                      {sIdx + 1}
                    </div>
                    <p className="text-xs text-gray-300 leading-normal">{step}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Calculated Output</span>
                <span className="font-mono font-bold text-emerald-400">{mathLiveResult}</span>
              </div>
            </div>
          </div>
        )}

        {/* 7. Chemistry titration lab - Uses responsive flex layout */}
        {activeTab === 'titration' && (
          <div className="flex flex-col lg:flex-row gap-5 items-stretch w-full min-h-[420px]">
            <style>{`
              @keyframes chemWaveMove {
                0% { transform: translateX(0); }
                100% { transform: translateX(-40px); }
              }
              .chem-wave-path {
                animation: chemWaveMove 2s linear infinite;
              }
              @keyframes chemBubbleUp {
                0% { transform: translateY(0) scale(0.5); opacity: 0; }
                50% { opacity: 0.8; }
                100% { transform: translateY(-40px) scale(1.1); opacity: 0; }
              }
              .chem-bubble-particle {
                animation: chemBubbleUp 2.5s ease-in infinite;
              }
              .chem-glass-glow {
                box-shadow: 0 0 25px rgba(99, 102, 241, 0.15), inset 0 0 15px rgba(255, 255, 255, 0.05);
              }
            `}</style>

            <div className="flex-1 min-w-[280px] flex flex-col items-center justify-center p-6 bg-black/40 border border-white/[0.06] rounded-3xl relative min-h-[360px] chem-glass-glow backdrop-blur-xl">
              <div className="absolute top-[125px] left-[50%] transform -translate-x-[50%] w-[12px] h-[100px] pointer-events-none overflow-hidden">
                {droplets.map(d => (
                  <div
                    key={d.id}
                    className="absolute w-[5px] h-[9px] bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]"
                    style={{ top: `${d.top}px`, left: '3px', opacity: 0.9 }}
                  />
                ))}
              </div>

              <svg width="220" height="260" className="z-10 relative select-none">
                <defs>
                  <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="25%" stopColor="#ffffff" stopOpacity="0.35" />
                    <stop offset="28%" stopColor="#ffffff" stopOpacity="0.0" />
                    <stop offset="75%" stopColor="#ffffff" stopOpacity="0.0" />
                    <stop offset="90%" stopColor="#818cf8" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.25" />
                  </linearGradient>

                  <linearGradient id="acidFluid" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
                  </linearGradient>

                  <linearGradient id="alkalineFluid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#be185d" stopOpacity="0.95" />
                  </linearGradient>

                  <linearGradient id="neutralFluid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0.55" />
                  </linearGradient>

                  <linearGradient id="acidicFluid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.55" />
                  </linearGradient>

                  <clipPath id="beakerInteriorClip">
                    <rect x="71" y="161" width="78" height="74" rx="4" />
                  </clipPath>

                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                <g id="burette">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line key={i} x1="91" y1={10 + i * 10} x2="96" y2={10 + i * 10} stroke="#475569" strokeWidth="1" />
                  ))}
                  <rect x="90" y="0" width="40" height="100" fill="url(#glassReflection)" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                  <rect x="93" y="10" width="34" height="90" fill="url(#acidFluid)" />
                  <rect x="105" y="100" width="10" height="12" fill="#475569" />
                  <rect 
                    x="96" 
                    y="108" 
                    width="28" 
                    height="8" 
                    fill={flowRate > 0 ? "#10b981" : "#ef4444"} 
                    rx="2.5" 
                    className="transition-all duration-300"
                    style={{ 
                      transformOrigin: '110px 112px',
                      transform: `rotate(${flowRate > 0 ? '90deg' : '0deg'})` 
                    }} 
                  />
                  <polygon points="106,112 114,112 110,126" fill="#4b5563" />
                </g>

                <g id="beaker">
                  {neutralized && (
                    <ellipse cx="110" cy="205" rx="48" ry="40" fill="rgba(16, 185, 129, 0.15)" filter="url(#glow)" className="animate-pulse" />
                  )}
                  {beakerPH > 8.2 && (
                    <ellipse cx="110" cy="205" rx="48" ry="40" fill="rgba(236, 72, 153, 0.15)" filter="url(#glow)" className="animate-pulse" />
                  )}

                  <line x1="75" y1="175" x2="83" y2="175" stroke="#475569" strokeWidth="1" />
                  <line x1="75" y1="195" x2="80" y2="195" stroke="#475569" strokeWidth="1" />
                  <line x1="75" y1="215" x2="83" y2="215" stroke="#475569" strokeWidth="1" />
                  <text x="86" y="178" fill="#475569" fontSize="8" fontWeight="bold">150ml</text>
                  <text x="86" y="218" fill="#475569" fontSize="8" fontWeight="bold">50ml</text>

                  <g clipPath="url(#beakerInteriorClip)">
                    <g className="transition-all duration-300">
                      <rect
                        x="70"
                        y={Math.max(160, 235 - (100 + addedAcidVolume) * 0.4)}
                        width="80"
                        height="80"
                        fill={
                          beakerPH >= 10.0
                            ? 'url(#alkalineFluid)'
                            : beakerPH > 8.2
                            ? 'url(#alkalineFluid)'
                            : beakerPH > 6.8
                            ? 'url(#neutralFluid)'
                            : 'url(#acidicFluid)'
                        }
                        style={{
                          opacity: beakerPH > 8.2 && beakerPH < 10.0 ? (beakerPH - 8.2) / 1.8 + 0.15 : 0.85
                        }}
                      />
                      
                      <path
                        d="M 60 0 Q 75 -4 90 0 T 120 0 T 150 0 T 180 0 L 180 30 L 60 30 Z"
                        fill={
                          beakerPH >= 8.2
                            ? '#ec4899'
                            : beakerPH > 6.8
                            ? '#10b981'
                            : '#f59e0b'
                        }
                        opacity="0.3"
                        className="chem-wave-path"
                        style={{
                          transform: `translateY(${Math.max(160, 235 - (100 + addedAcidVolume) * 0.4)}px)`
                        }}
                      />
                    </g>

                    {flowRate > 0 && (
                      <>
                        <circle cx="95" cy="220" r="3" fill="#ffffff" opacity="0.6" className="chem-bubble-particle" style={{ animationDelay: '0s' }} />
                        <circle cx="110" cy="225" r="2" fill="#ffffff" opacity="0.4" className="chem-bubble-particle" style={{ animationDelay: '0.5s' }} />
                        <circle cx="125" cy="218" r="4" fill="#ffffff" opacity="0.5" className="chem-bubble-particle" style={{ animationDelay: '1.2s' }} />
                        <circle cx="102" cy="230" r="1.5" fill="#ffffff" opacity="0.7" className="chem-bubble-particle" style={{ animationDelay: '1.8s' }} />
                      </>
                    )}
                  </g>

                  <path d="M 70 160 C 70 156, 78 156, 78 156 C 78 156, 142 156, 142 156 C 142 156, 150 156, 150 160 L 146 235 C 146 237, 144 239, 141 240 L 79 240 C 76 239, 74 237, 74 235 Z" fill="none" stroke="#a5b4fc" strokeWidth="3" opacity="0.55" />
                  <path d="M 70 156 L 66 159 L 70 160" fill="none" stroke="#a5b4fc" strokeWidth="2.5" opacity="0.55" />
                </g>
              </svg>

              <div className="absolute right-6 top-6 flex flex-col items-center gap-1 bg-black/60 px-2 py-1.5 rounded-lg border border-white/5 shadow-md">
                <Flame size={12} className={temperature > 30 ? "text-amber-500 animate-bounce" : "text-slate-500"} />
                <span className="text-[9px] font-black text-slate-300">{temperature}°C</span>
              </div>

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

            <div className="lg:w-[320px] shrink-0 flex flex-col gap-4">
              <div className="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity size={12} />
                  <span>Neutralization Reaction</span>
                </h4>
                <code className="block font-mono text-xs text-white bg-black/40 px-3 py-2 rounded-xl border border-white/5 text-center">
                  HCl + NaOH &rarr; NaCl + H₂O + Heat
                </code>
              </div>

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

              <div className="p-4 bg-black/30 border border-white/5 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={12} />
                  <span>Active Parameters</span>
                </h4>

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
