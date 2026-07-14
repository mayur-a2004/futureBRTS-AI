import React, { useState, useEffect, useRef } from 'react';
import { LabConfig, ContentLayer } from './types/LabConfig';
import { LabSidePanel } from './LabSidePanel';
import { LabControlPanel } from './LabControlPanel';
import TextLab from './modules/TextLab';
import DiagramLab from './modules/DiagramLab';
import VideoLab from './modules/VideoLab';
import { Model3DLab } from './modules/Model3DLab';
import SandboxLab from './modules/SandboxLab';
import { InteractiveLab } from './modules/InteractiveLab';


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

  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const translationsCache = useRef<Record<string, string>>({});

  useEffect(() => {
    translationsCache.current = {};
    if (labConfig) {
      setTranslatedText(labConfig.voice_script || '');
      
      // Pick first available layer safely
      const layers = labConfig.content_layers || [];
      if (layers.length > 0) {
        setActiveLayer(layers[0]);
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
        availableLayers={(labConfig.content_layers || []).filter(l => l !== 'voice')}
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
