import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
});

export interface DiagramLabProps {
  diagram_type: string;
  topic: string;
  sensitivity_level: number;
  mermaid_schema?: string | null;
}

interface DiagramEntry {
  url: string;
  label: string;
  source: string;
  attribution: string;
}

const DIAGRAM_MAP: Record<string, DiagramEntry> = {
  cell_mitosis_stages: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Animal_mitosis_diagram.svg/1200px-Animal_mitosis_diagram.svg.png',
    label: 'Animal Cell Mitosis Stages',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  photosynthesis_process: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Photosynthesis.gif/300px-Photosynthesis.gif',
    label: 'Photosynthesis Process',
    source: 'Wikimedia Commons',
    attribution: 'Public Domain',
  },
  human_heart_diagram: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Heart_diagram-en.svg/1200px-Heart_diagram-en.svg.png',
    label: 'Human Heart Anatomy',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  digestive_system: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Digestive_system_diagram_en.svg/800px-Digestive_system_diagram_en.svg.png',
    label: 'Human Digestive System',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  food_chain_diagram: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Food_chain.svg/1200px-Food_chain.svg.png',
    label: 'Food Chain Diagram',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  water_cycle: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Water_cycle.png/1200px-Water_cycle.png',
    label: 'The Water Cycle',
    source: 'Wikimedia Commons',
    attribution: 'Public Domain (USGS)',
  },
  periodic_table: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Simple_Periodic_Table_Chart-en.svg/1200px-Simple_Periodic_Table_Chart-en.svg.png',
    label: 'Periodic Table of Elements',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  light_refraction: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Snells_law2.svg/400px-Snells_law2.svg.png',
    label: "Snell's Law – Light Refraction",
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  dna_structure: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/DNA_Structure%2BKey%2BLabelled.pn_NoBB.png/800px-DNA_Structure%2BKey%2BLabelled.pn_NoBB.png',
    label: 'DNA Double Helix Structure',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  plant_cell_diagram: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Plant_cell_structure_svg.svg/1200px-Plant_cell_structure_svg.svg.png',
    label: 'Plant Cell Structure',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  animal_cell_diagram: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Animal_cell_structure_en.svg/1200px-Animal_cell_structure_en.svg.png',
    label: 'Animal Cell Structure',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  human_nervous_system: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Nervous_system_diagram.png/800px-Nervous_system_diagram.png',
    label: 'Human Nervous System',
    source: 'Wikimedia Commons',
    attribution: 'Public Domain',
  },
  human_skeleton: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Human_skeleton_front_en.svg/600px-Human_skeleton_front_en.svg.png',
    label: 'Human Skeleton (Front View)',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  atom_structure: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Atom_diagram.png/640px-Atom_diagram.png',
    label: 'Atomic Structure Model',
    source: 'Wikimedia Commons',
    attribution: 'Public Domain',
  },
  chemical_bonding: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Covalent_bond_hydrogen.svg/640px-Covalent_bond_hydrogen.svg.png',
    label: 'Covalent Bonding (H₂)',
    source: 'Wikimedia Commons',
    attribution: 'Public Domain',
  },
  acid_base_ph: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/PH_scale_2.svg/1200px-PH_scale_2.svg.png',
    label: 'pH Scale – Acids and Bases',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  newton_laws: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Newton%27s_law_of_universal_gravitation.svg/640px-Newton%27s_law_of_universal_gravitation.svg.png',
    label: "Newton's Law of Gravitation",
    source: 'Wikimedia Commons',
    attribution: 'Public Domain',
  },
  electromagnetic_spectrum: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/EM_Spectrum_Properties_edit.svg/1200px-EM_Spectrum_Properties_edit.svg.png',
    label: 'Electromagnetic Spectrum',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  simple_pendulum: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Simple_gravity_pendulum.svg/400px-Simple_gravity_pendulum.svg.png',
    label: 'Simple Pendulum Diagram',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  ohms_law_circuit: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Ohms_law_triangle.svg/400px-Ohms_law_triangle.svg.png',
    label: "Ohm's Law Triangle (V = IR)",
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  solar_system: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Planets2013.svg/1200px-Planets2013.svg.png',
    label: 'Solar System (to scale)',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  earth_layers: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Earth-cutaway-schematic-english.svg/800px-Earth-cutaway-schematic-english.svg.png',
    label: "Earth's Layers (Cross Section)",
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  rock_cycle: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Rock_cycle_nps.jpg/1200px-Rock_cycle_nps.jpg',
    label: 'The Rock Cycle',
    source: 'Wikimedia Commons',
    attribution: 'Public Domain (NPS)',
  },
  carbon_cycle: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Carbon_cycle-cute_diagram.svg/1200px-Carbon_cycle-cute_diagram.svg.png',
    label: 'The Carbon Cycle',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  nitrogen_cycle: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Nitrogen_Cycle.svg/1200px-Nitrogen_Cycle.svg.png',
    label: 'The Nitrogen Cycle',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  plant_reproduction: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Lifecycle_of_a_flowering_plant.svg/1200px-Lifecycle_of_a_flowering_plant.svg.png',
    label: 'Life Cycle of a Flowering Plant',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  human_respiratory: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Illu_conducting_passages.svg/800px-Illu_conducting_passages.svg.png',
    label: 'Human Respiratory System',
    source: 'Wikimedia Commons',
    attribution: 'Public Domain',
  },
  blood_cell_types: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Blausen_0761_RedBloodCells_cropped.jpg/640px-Blausen_0761_RedBloodCells_cropped.jpg',
    label: 'Red Blood Cells (SEM)',
    source: 'Wikimedia Commons',
    attribution: 'CC BY 3.0',
  },
  demand_supply_curve: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Supply-and-demand.svg/640px-Supply-and-demand.svg.png',
    label: 'Supply and Demand Curve',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  mendelian_genetics: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Punnett_square_mendel_flowers.svg/640px-Punnett_square_mendel_flowers.svg.png',
    label: 'Punnett Square – Mendelian Genetics',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  wave_types: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/EM_Wave.gif/300px-EM_Wave.gif',
    label: 'Transverse Electromagnetic Wave',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
  eye_anatomy: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Schematic_diagram_of_the_human_eye_en.svg/1200px-Schematic_diagram_of_the_human_eye_en.svg.png',
    label: 'Human Eye Anatomy',
    source: 'Wikimedia Commons',
    attribution: 'CC BY-SA 3.0',
  },
};

// Zoom-enabled image viewer
const ImageViewer: React.FC<{
  src: string;
  alt: string;
  onOpenLightbox: () => void;
}> = ({ src, alt, onOpenLightbox }) => {
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleReset = () => setZoom(1);

  if (failed) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-white/3 border border-white/10">
      {/* Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-full h-64 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-xl" />
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-20 flex gap-1 bg-black/50 backdrop-blur-sm rounded-lg p-1 border border-white/10">
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-md text-sm font-bold transition-colors"
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={handleReset}
          className="px-2 h-7 flex items-center justify-center text-white/50 hover:text-white/80 text-xs transition-colors"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-md text-sm font-bold transition-colors"
          title="Zoom in"
        >
          +
        </button>
        <div className="w-px bg-white/10 mx-0.5" />
        <button
          onClick={onOpenLightbox}
          className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-md text-xs transition-colors"
          title="Full screen"
        >
          ⛶
        </button>
      </div>

      {/* Image */}
      <div className="overflow-auto max-h-80 flex items-center justify-center p-2">
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setFailed(true); }}
          onClick={onOpenLightbox}
          className={`max-w-full object-contain cursor-zoom-in transition-all duration-300 rounded-lg ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center', maxHeight: '300px' }}
        />
      </div>
    </div>
  );
};

// Full-screen lightbox
const Lightbox: React.FC<{ src: string; alt: string; onClose: () => void }> = ({
  src, alt, onClose,
}) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-colors border border-white/20"
        onClick={onClose}
      >
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-[95vw] max-h-[95vh] object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

// Placeholder when image fails or not found
const DiagramPlaceholder: React.FC<{ diagramType: string; topic: string }> = ({
  diagramType, topic,
}) => {
  const searchUrl = `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(
    topic + ' diagram'
  )}&title=Special:MediaSearch&type=image`;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 rounded-xl bg-white/3 border border-dashed border-white/15">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
        <span className="text-3xl">🖼️</span>
      </div>
      <div className="text-center">
        <p className="text-white/60 text-sm font-medium mb-1">Diagram not loaded</p>
        <p className="text-white/30 text-xs font-mono bg-white/5 px-2 py-1 rounded-lg inline-block">
          {diagramType}
        </p>
      </div>
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-colors"
      >
        <span>🔍</span>
        <span>Search on Wikimedia Commons</span>
      </a>
    </div>
  );
};

const MermaidRenderer: React.FC<{ chart: string }> = ({ chart }) => {
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setError(false);
    const id = `mermaid-${Math.floor(Math.random() * 100000)}`;
    
    mermaid.render(id, chart)
      .then(({ svg }) => {
        setSvgHtml(svg);
      })
      .catch((err) => {
        console.error('Mermaid rendering error:', err);
        setError(true);
      });
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-mono">
        Failed to render diagram. Raw schema:
        <pre className="mt-2 whitespace-pre-wrap overflow-auto max-h-48 bg-black/40 p-2.5 rounded-lg">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-6 bg-[#0b0c10]/80 border border-white/5 rounded-2xl overflow-auto max-h-[400px] shadow-inner scrollbar-thin">
      <div 
        className="w-full max-w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
    </div>
  );
};

const DiagramLab: React.FC<DiagramLabProps> = ({
  diagram_type,
  topic,
  sensitivity_level,
  mermaid_schema,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [dynamicDiagram, setDynamicDiagram] = useState<DiagramEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const mappedEntry = diagram_type ? DIAGRAM_MAP[diagram_type] ?? null : null;
  const entry = mappedEntry || dynamicDiagram;

  useEffect(() => {
    setImageFailed(false);
    setLightboxOpen(false);
    setDynamicDiagram(null);

    // If diagram_type exists in DIAGRAM_MAP, use it directly
    if (diagram_type && DIAGRAM_MAP[diagram_type]) {
      return;
    }

    // Otherwise, fetch dynamically from Wikimedia Commons!
    let searchQuery = topic.replace(/[?._\-]/g, '').trim();
    const lowerTopic = searchQuery.toLowerCase();
    
    // Safety & NCERT filter overrides for dynamic searches
    if (lowerTopic === 'sex' || lowerTopic.includes('what is sex') || lowerTopic.includes('biological sex') || lowerTopic === 'gender' || lowerTopic.includes('reproduction')) {
      searchQuery = 'chromosomes sex determination biology';
    } else {
      searchQuery = `${searchQuery} biology diagram`;
    }

    setLoading(true);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=filetype:bitmap|png|jpg|gif%20${encodeURIComponent(searchQuery)}&gsrlimit=5&prop=pageimages|imageinfo&iiprop=url&pithumbsize=1000&format=json&origin=*`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const pages = data?.query?.pages;
        if (pages) {
          const pageKey = Object.keys(pages).find((key) => pages[key].thumbnail?.source);
          if (pageKey) {
            const page = pages[pageKey];
            setDynamicDiagram({
              url: page.thumbnail.source,
              label: page.title.replace('File:', '').replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
              source: 'Wikimedia Commons',
              attribution: 'Public Domain / Creative Commons',
            });
            setImageFailed(false);
            return;
          }
        }
        setDynamicDiagram(null);
      })
      .catch((err) => {
        console.error('Failed to fetch dynamic diagram:', err);
        setDynamicDiagram(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [diagram_type, topic]);

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white/80">{topic}</h3>
          {entry && (
            <p className="text-xs text-white/40 mt-0.5">{entry.label}</p>
          )}
        </div>

        {sensitivity_level > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <span>📚</span>
            <span>NCERT Reference</span>
          </span>
        )}
      </div>

      {/* Diagram viewer */}
      {mermaid_schema ? (
        <MermaidRenderer chart={mermaid_schema} />
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-xl bg-white/3 border border-white/10 animate-pulse">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-white/60 text-sm">Searching Wikimedia Commons for educational diagrams...</p>
        </div>
      ) : entry && !imageFailed ? (
        <>
          <ImageViewer
            src={entry.url}
            alt={entry.label}
            onOpenLightbox={() => setLightboxOpen(true)}
          />
          {/* Attribution */}
          <div className="flex items-center justify-between text-xs text-white/25">
            <span>Source: {entry.source}</span>
            <span>{entry.attribution}</span>
          </div>
        </>
      ) : (
        <DiagramPlaceholder diagramType={diagram_type ?? 'unknown'} topic={topic} />
      )}

      {/* Hidden img to pre-detect failure if entry exists */}
      {entry && (
        <img
          src={entry.url}
          alt=""
          className="hidden"
          onError={() => setImageFailed(true)}
        />
      )}

      {/* Lightbox */}
      {lightboxOpen && entry && (
        <Lightbox
          src={entry.url}
          alt={entry.label}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default DiagramLab;
