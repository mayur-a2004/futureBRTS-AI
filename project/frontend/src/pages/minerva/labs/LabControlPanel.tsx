import React from 'react';
import { ContentLayer, LAYER_ICONS, LAYER_LABELS, SUBJECT_COLORS, SubjectType } from './types/LabConfig';

interface VoiceProps {
  isPlaying: boolean;
  onToggle: () => void;
  speed: number;
  onSpeedChange: (s: number) => void;
  language: string;
  onLanguageChange: (l: string) => void;
}

interface LabControlPanelProps {
  activeLayer: ContentLayer;
  availableLayers: ContentLayer[];
  onLayerChange: (layer: ContentLayer) => void;
  subject: SubjectType;
  voiceProps: VoiceProps;
}

export const LabControlPanel: React.FC<LabControlPanelProps> = ({
  activeLayer,
  availableLayers,
  onLayerChange,
  subject,
  voiceProps,
}) => {
  const colors = SUBJECT_COLORS[subject] || SUBJECT_COLORS.mathematics;

  return (
    <div className="w-full flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800 overflow-x-auto scrollbar-thin">
        {availableLayers.map((layer) => {
          const isActive = activeLayer === layer;
          return (
            <button
              key={layer}
              onClick={() => onLayerChange(layer)}
              className={`flex-1 min-w-[80px] py-3.5 px-2 text-center transition-all duration-300 relative font-medium text-xs md:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'text-zinc-50 font-bold bg-zinc-800/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/10'
              }`}
            >
              <span>{LAYER_ICONS[layer]}</span>
              <span>{LAYER_LABELS[layer]}</span>
              
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full transition-all duration-300"
                  style={{ backgroundColor: colors.accent }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Embedded Voice Controls Bar */}
      <div className="p-3.5 bg-zinc-950/40 flex flex-wrap gap-4 items-center justify-between border-t border-zinc-800/50">
        <div className="flex items-center gap-3">
          <button
            onClick={voiceProps.onToggle}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
              voiceProps.isPlaying
                ? 'bg-red-500/20 border border-red-500/30 text-red-400 animate-pulse'
                : 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700'
            }`}
            title={voiceProps.isPlaying ? 'Stop Voice Narration' : 'Start Voice Narration'}
          >
            {voiceProps.isPlaying ? '⏹️' : '🔊'}
          </button>
          
          {voiceProps.isPlaying && (
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-1 bg-red-400 animate-[bounce_0.8s_infinite_100ms] rounded-full h-full"></span>
              <span className="w-1 bg-red-400 animate-[bounce_0.8s_infinite_300ms] rounded-full h-1/2"></span>
              <span className="w-1 bg-red-400 animate-[bounce_0.8s_infinite_200ms] rounded-full h-3/4"></span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3.5 flex-1 justify-end">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Lang</span>
            <select
              value={voiceProps.language}
              onChange={(e) => voiceProps.onLanguageChange(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-md py-1 px-2 text-xs text-zinc-300 outline-none focus:border-indigo-500"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
              <option value="gu">Gujarati</option>
              <option value="ta">Tamil</option>
            </select>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Speed</span>
            <select
              value={voiceProps.speed}
              onChange={(e) => voiceProps.onSpeedChange(parseFloat(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 rounded-md py-1 px-2 text-xs text-zinc-300 outline-none focus:border-indigo-500"
            >
              <option value="0.75">0.75x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
