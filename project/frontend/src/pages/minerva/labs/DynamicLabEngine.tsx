import React, { useState, useEffect, useRef } from 'react';
import { LabConfig, ContentLayer, ThreeJsConfig } from './types/LabConfig';
import { LabSidePanel } from './LabSidePanel';
import { LabControlPanel } from './LabControlPanel';
import TextLab from './modules/TextLab';
import DiagramLab from './modules/DiagramLab';
import VideoLab from './modules/VideoLab';
import { Model3DLab } from './modules/Model3DLab';
import SandboxLab from './modules/SandboxLab';
import { InteractiveLab } from './modules/InteractiveLab';

// Wrapper: passes onNoModel callback to Model3DLab so it can signal when no 3D model was found
const Model3DLabWrapper: React.FC<{
  three_js_config: ThreeJsConfig | null;
  sketchfab_hint: string | null;
  topic: string;
  subject: string;
  sensitivity_level: number;
  onNoModel: () => void;
}> = (props) => {
  return (
    <Model3DLab
      three_js_config={props.three_js_config}
      sketchfab_hint={props.sketchfab_hint}
      topic={props.topic}
      subject={props.subject}
      sensitivity_level={props.sensitivity_level}
      onNoModel={props.onNoModel}
    />
  );
};




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
  const [modelNotFound, setModelNotFound] = useState(false);
  const labConfigRef = useRef<LabConfig | null>(null); // Tracks current labConfig to guard stale callbacks
  
  // Voice Narration States
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [voiceLang, setVoiceLang] = useState('en');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const translationsCache = useRef<Record<string, string>>({});

  const getFilteredLayers = (overrideModelNotFound?: boolean): ContentLayer[] => {
    if (!labConfig) return [];
    const notFound = overrideModelNotFound !== undefined ? overrideModelNotFound : modelNotFound;
    return (labConfig.content_layers || [])
      .filter(l => l !== 'voice')
      .filter(layer => {
        // Hide the 3D model tab if the Sketchfab search returned no model (only for local threejs canvas)
        if (notFound && layer === 'threejs') return false;
        if (layer === 'threejs') {
          return !!labConfig.three_js_config && Object.keys(labConfig.three_js_config).length > 0;
        }
        if (layer === 'sketchfab') {
          // Show tab if backend included it in content_layers — Model3DLab handles empty state
          return true;
        }
        if (layer === 'interactive') {
          const type = labConfig.interactive_config?.type;
          if (!type) return false;
          if (type === 'geogebra') {
            return !!labConfig.interactive_config?.query;
          }
          // Chemistry: always show — the InteractiveLab will pick the right sim
          if (type === 'chemistry') {
            return true;
          }
          // PhET: show even if no exact key match — InteractiveLab falls back to general_physics
          if (type === 'phet') {
            return true;
          }
          // Desmos: always show — the InteractiveLab renders the Desmos graphing calculator
          if (type === 'desmos') {
            return true;
          }
          return false;
        }
        return true;
      });
  };


  useEffect(() => {
    translationsCache.current = {};
    labConfigRef.current = labConfig; // Update ref to new labConfig
    setModelNotFound(false); // Reset model-not-found on new lab config
    if (labConfig) {
      setTranslatedText(labConfig.voice_script || '');
      
      // Pass false explicitly to override stale modelNotFound closure
      const filtered = getFilteredLayers(false);

      // For science/math subjects with an interactive config, auto-open the interactive lab
      const shouldPreferInteractive =
        filtered.includes('interactive') &&
        labConfig.interactive_config?.type &&
        (
          labConfig.subject === 'chemistry' ||
          labConfig.subject === 'mathematics' ||
          labConfig.subject === 'physics' ||
          labConfig.subject === 'biology'
        );

      // For any topic with a 3D model hint, auto-open 3D model viewer
      const shouldPreferSketchfab =
        !shouldPreferInteractive &&
        (filtered.includes('sketchfab') || filtered.includes('threejs')) &&
        (labConfig.sketchfab_hint || labConfig.three_js_config);

      if (shouldPreferInteractive) {
        setActiveLayer('interactive');
      } else if (shouldPreferSketchfab) {
        setActiveLayer(filtered.includes('sketchfab') ? 'sketchfab' : 'threejs');
      } else if (filtered.length > 0) {
        setActiveLayer(filtered[0]);
      }
      
      // Reset voice
      setVoiceLang('en');
      stopSpeech();
    }
  }, [labConfig]);



  const handleLanguageChange = async (targetLang: string) => {
    setVoiceLang(targetLang);
    if (!labConfig?.voice_script) return;

    if (targetLang === 'en') {
      setTranslatedText(labConfig.voice_script);
      if (voicePlaying) {
        setTimeout(() => startSpeech(labConfig.voice_script, 'en'), 50);
      }
      return;
    }

    const langMap: Record<string, string> = {
      hi: 'hindi',
      mr: 'marathi',
      gu: 'gujarati',
      ta: 'tamil'
    };
    const mappedLang = langMap[targetLang] || targetLang;

    if (translationsCache.current[targetLang]) {
      const cached = translationsCache.current[targetLang];
      setTranslatedText(cached);
      if (voicePlaying) {
        setTimeout(() => startSpeech(cached, targetLang), 50);
      }
      return;
    }

    setIsTranslating(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fbrts_token') || '';
      const res = await fetch('/api/minerva/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: labConfig.voice_script, targetLanguage: mappedLang })
      });
      const data = await res.json();
      if (data.success && data.translated) {
        translationsCache.current[targetLang] = data.translated;
        setTranslatedText(data.translated);
        if (voicePlaying) {
          setTimeout(() => startSpeech(data.translated, targetLang), 50);
        }
      }
    } catch (err) {
      console.error('Failed to translate lab voice script:', err);
    } finally {
      setIsTranslating(false);
    }
  };

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

  const startSpeech = (textToSpeak?: string, langCode?: string) => {
    const text = textToSpeak || translatedText || labConfig?.voice_script;
    const currentLang = langCode || voiceLang;
    if (!window.speechSynthesis || !text || isMuted) return;
    
    stopSpeech();
    
    const cleanText = text
      .replace(/[*#`_\-]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = voiceSpeed;
    
    // Choose correct voice locale
    let locale = 'en-US';
    if (currentLang === 'hi') locale = 'hi-IN';
    else if (currentLang === 'mr') locale = 'mr-IN';
    else if (currentLang === 'gu') locale = 'gu-IN';
    else if (currentLang === 'ta') locale = 'ta-IN';
    
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
      startSpeech(translatedText, voiceLang);
    }
  };

  // Render current tab module
  const renderActiveModule = () => {
    if (!labConfig) return null;

    switch (activeLayer) {
      case 'text':
        return (
          <TextLab
            content={isTranslating ? "## 🗣️ Translating explanation, please wait...\nGenerating high-quality academic translation..." : (translatedText || labConfig.voice_script)}
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
            subject={labConfig.subject}
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
        <Model3DLabWrapper
            three_js_config={labConfig.three_js_config}
            sketchfab_hint={labConfig.sketchfab_hint}
            topic={labConfig.topic}
            subject={labConfig.subject}
            sensitivity_level={labConfig.sensitivity_level}
            onNoModel={() => {
              // Guard: only act if this callback belongs to the CURRENT labConfig
              if (labConfigRef.current !== labConfig) return;
              setModelNotFound(true);
              // For custom local threejs simulations, auto-switch to first available non-3D layer
              // But for sketchfab models, keep the user on the tab so they can use the manual search panel
              if (activeLayer === 'threejs') {
                const fallbackLayer = getFilteredLayers(true)
                  .filter(l => l !== 'sketchfab' && l !== 'threejs')[0];
                if (fallbackLayer) setActiveLayer(fallbackLayer);
              }
            }}
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
      case 'interactive':
        return (
          <InteractiveLab
            subject={labConfig.subject}
            topic={labConfig.topic}
            interactiveConfig={labConfig.interactive_config}
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
        availableLayers={getFilteredLayers(modelNotFound)}
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
            if (voicePlaying) {
              setTimeout(() => startSpeech(translatedText, voiceLang), 50);
            }
          },
          language: voiceLang,
          onLanguageChange: handleLanguageChange,
        }}
      />

      <div className="flex-1 min-h-[350px] overflow-hidden flex flex-col">
        {renderActiveModule()}
      </div>
    </LabSidePanel>
  );
};
