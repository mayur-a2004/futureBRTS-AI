import React, { useState, useEffect, useRef } from 'react';
import { LabConfig, ContentLayer } from './types/LabConfig';
import { LabSidePanel } from './LabSidePanel';
import { LabControlPanel } from './LabControlPanel';
import TextLab from './modules/TextLab';
import DiagramLab from './modules/DiagramLab';
import VideoLab from './modules/VideoLab';
import { Model3DLab } from './modules/Model3DLab';
import SandboxLab from './modules/SandboxLab';


interface DynamicLabEngineProps {
  labConfig: LabConfig | null;
  isOpen: boolean;
  onClose: () => void;
  isDetached: boolean;
  onToggleDetach: () => void;
  isMuted?: boolean;
}

export const DynamicLabEngine: React.FC<DynamicLabEngineProps> = ({
  labConfig,
  isOpen,
  onClose,
  isDetached,
  onToggleDetach,
  isMuted = false,
}) => {
  const [activeLayer, setActiveLayer] = useState<ContentLayer>('text');
  
  // Voice Narration States
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [voiceLang, setVoiceLang] = useState('en');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync state on config load
  useEffect(() => {
    if (labConfig) {
      // Pick first available layer
      if (labConfig.content_layers.length > 0) {
        setActiveLayer(labConfig.content_layers[0]);
      }
      
      // Reset voice
      stopSpeech();
    }
  }, [labConfig]);

  // Clean speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Stop speaking when global mute state changes to true
  useEffect(() => {
    if (isMuted) {
      stopSpeech();
    }
  }, [isMuted]);

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setVoicePlaying(false);
  };

  const startSpeech = () => {
    if (!window.speechSynthesis || !labConfig?.voice_script || isMuted) return;
    
    stopSpeech();
    
    const cleanText = labConfig.voice_script
      .replace(/[*#`_\-]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = voiceSpeed;
    
    // Choose correct voice locale
    let locale = 'en-US';
    if (voiceLang === 'hi') locale = 'hi-IN';
    else if (voiceLang === 'mr') locale = 'mr-IN';
    else if (voiceLang === 'gu') locale = 'gu-IN';
    else if (voiceLang === 'ta') locale = 'ta-IN';
    
    utterance.lang = locale;

    utterance.onend = () => {
      setVoicePlaying(false);
    };

    utterance.onerror = () => {
      setVoicePlaying(false);
    };

    utteranceRef.current = utterance;
    setVoicePlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoice = () => {
    if (voicePlaying) {
      stopSpeech();
    } else {
      startSpeech();
    }
  };

  // Render current tab module
  const renderActiveModule = () => {
    if (!labConfig) return null;

    switch (activeLayer) {
      case 'text':
        return (
          <TextLab
            content={labConfig.voice_script}
            topic={labConfig.topic}
            subject={labConfig.subject}
          />
        );
      case 'diagram':
        return (
          <DiagramLab
            diagram_type={labConfig.diagram_type || `${labConfig.subject}_general_diagram`}
            topic={labConfig.topic}
            sensitivity_level={labConfig.sensitivity_level}
            mermaid_schema={labConfig.mermaid_schema}
          />
        );
      case 'youtube':
        return (
          <VideoLab
            youtube_query={labConfig.youtube_query}
            youtube_video_id={labConfig.youtube_video_id}
            topic={labConfig.topic}
          />
        );
      case 'threejs':
      case 'sketchfab':
        return (
          <Model3DLab
            three_js_config={labConfig.three_js_config}
            sketchfab_hint={labConfig.sketchfab_hint}
            subject={labConfig.subject}
            sensitivity_level={labConfig.sensitivity_level}
          />
        );
      case 'sandbox':
        return (
          <SandboxLab
            subject={labConfig.subject}
            topic={labConfig.topic}
            sandboxConfig={labConfig.sandbox_config}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-zinc-500 text-sm">
            Content Layer not loaded. Select another option above.
          </div>
        );
    }
  };

  if (!labConfig || !isOpen) return null;

  return (
    <LabSidePanel
      labConfig={labConfig}
      isOpen={isOpen}
      onClose={onClose}
      onDetach={onToggleDetach}
      isDetached={isDetached}
    >
      <LabControlPanel
        activeLayer={activeLayer}
        availableLayers={labConfig.content_layers.filter(l => l !== 'voice')}
        onLayerChange={(layer) => {
          setActiveLayer(layer);
          stopSpeech(); // Stop speech when switching modes
        }}
        subject={labConfig.subject}
        voiceProps={{
          isPlaying: voicePlaying,
          onToggle: toggleVoice,
          speed: voiceSpeed,
          onSpeedChange: (s) => {
            setVoiceSpeed(s);
            // restart speech if active
            if (voicePlaying) {
              setTimeout(startSpeech, 50);
            }
          },
          language: voiceLang,
          onLanguageChange: (l) => {
            setVoiceLang(l);
            // restart speech if active
            if (voicePlaying) {
              setTimeout(startSpeech, 50);
            }
          },
        }}
      />

      <div className="flex-1 min-h-[350px] overflow-hidden flex flex-col">
        {renderActiveModule()}
      </div>
    </LabSidePanel>
  );
};
