export type SubjectType =
  | 'biology'
  | 'chemistry'
  | 'physics'
  | 'mathematics'
  | 'statistics'
  | 'accounting'
  | 'geography'
  | 'economics';

export type ContentLayer =
  | 'text'
  | 'diagram'
  | 'threejs'
  | 'sketchfab'
  | 'youtube'
  | 'voice';

export interface SliderControl {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
}

export interface OutputField {
  name: string;
  label: string;
  unit?: string;
}

export interface VisualElement {
  type: 'circle' | 'rect' | 'line' | 'particles' | 'graph';
  color: string;
  label?: string;
  sizeExpr?: string;
  speedExpr?: string;
  glowExpr?: string;
}

export interface ThreeJsConfig {
  type: string;
  params?: Record<string, number | string | boolean>;
  sliders?: string[];
  title?: string;
  description?: string;
  controls?: SliderControl[];
  outputs?: OutputField[];
  equations?: Record<string, string>;
  visual_mapping?: {
    elements?: VisualElement[];
  };
}

export interface LabConfig {
  subject: SubjectType;
  topic: string;
  grade_level: string;
  board: string;
  sensitivity_level: 0 | 1 | 2;
  content_layers: ContentLayer[];
  diagram_type: string | null;
  three_js_config: ThreeJsConfig | null;
  sketchfab_hint: string | null;
  youtube_query: string;
  voice_script: string;
  auto_open: boolean;
  youtube_video_id?: string; // Enriched by Node.js
  mermaid_schema?: string | null;
}

export const SUBJECT_COLORS: Record<SubjectType, {
  primary: string;
  gradient: string;
  border: string;
  badge: string;
  text: string;
  accent: string;
}> = {
  biology:     { primary: 'green',   gradient: 'from-green-900/50 to-emerald-900/50',  border: 'border-green-500/30',   badge: 'bg-green-500/20 text-green-300 border-green-500/40',   text: 'text-green-400',   accent: '#22c55e' },
  chemistry:   { primary: 'cyan',    gradient: 'from-cyan-900/50 to-teal-900/50',      border: 'border-cyan-500/30',    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',      text: 'text-cyan-400',    accent: '#06b6d4' },
  physics:     { primary: 'orange',  gradient: 'from-orange-900/50 to-red-900/50',     border: 'border-orange-500/30',  badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', text: 'text-orange-400',  accent: '#f97316' },
  mathematics: { primary: 'indigo',  gradient: 'from-indigo-900/50 to-purple-900/50',  border: 'border-indigo-500/30',  badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', text: 'text-indigo-400',  accent: '#6366f1' },
  statistics:  { primary: 'purple',  gradient: 'from-purple-900/50 to-violet-900/50',  border: 'border-purple-500/30',  badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', text: 'text-purple-400',  accent: '#a855f7' },
  accounting:  { primary: 'amber',   gradient: 'from-amber-900/50 to-yellow-900/50',   border: 'border-amber-500/30',   badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',   text: 'text-amber-400',   accent: '#f59e0b' },
  geography:   { primary: 'emerald', gradient: 'from-emerald-900/50 to-green-900/50',  border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', text: 'text-emerald-400', accent: '#10b981' },
  economics:   { primary: 'yellow',  gradient: 'from-yellow-900/50 to-amber-900/50',   border: 'border-yellow-500/30',  badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', text: 'text-yellow-400',  accent: '#eab308' },
};

export const SUBJECT_ICONS: Record<SubjectType, string> = {
  biology:     '🧬',
  chemistry:   '⚗️',
  physics:     '⚡',
  mathematics: '🔢',
  statistics:  '📊',
  accounting:  '📒',
  geography:   '🌍',
  economics:   '📈',
};

export const LAYER_ICONS: Record<ContentLayer, string> = {
  text:      '📄',
  diagram:   '🖼️',
  threejs:   '📊',
  sketchfab: '🧊',
  youtube:   '▶️',
  voice:     '🔊',
};

export const LAYER_LABELS: Record<ContentLayer, string> = {
  text:      'Explain',
  diagram:   'Diagram',
  threejs:   'Graph/3D',
  sketchfab: '3D Model',
  youtube:   'Video',
  voice:     'Voice',
};
