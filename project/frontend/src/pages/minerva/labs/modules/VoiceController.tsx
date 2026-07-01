import React, { useState, useEffect, useRef, useCallback } from 'react';

export type VoiceSpeed = 0.75 | 1 | 1.25 | 1.5;
export type VoiceLanguage = 'en-IN' | 'hi-IN' | 'hi-IN-hinglish';

export interface VoiceControllerProps {
  script: string;
  language: VoiceLanguage;
  onLanguageChange: (lang: VoiceLanguage) => void;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  speed: VoiceSpeed;
  onSpeedChange: (speed: VoiceSpeed) => void;
}

const LANGUAGE_OPTIONS: { value: VoiceLanguage; label: string; speechLang: string }[] = [
  { value: 'en-IN',            label: 'English',  speechLang: 'en-IN' },
  { value: 'hi-IN',            label: 'Hindi',    speechLang: 'hi-IN' },
  { value: 'hi-IN-hinglish',   label: 'Hinglish', speechLang: 'hi-IN' },
];

const SPEED_OPTIONS: { value: VoiceSpeed; label: string }[] = [
  { value: 0.75, label: 'Slow' },
  { value: 1,    label: 'Normal' },
  { value: 1.25, label: 'Fast' },
  { value: 1.5,  label: 'Faster' },
];

// Animated sound wave bars
const SoundWave: React.FC = () => (
  <div className="flex items-end gap-0.5 h-4">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-1 bg-indigo-400 rounded-full"
        style={{
          animation: `soundWave 0.8s ease-in-out infinite`,
          animationDelay: `${i * 0.15}s`,
          height: '100%',
        }}
      />
    ))}
    <style>{`
      @keyframes soundWave {
        0%, 100% { transform: scaleY(0.3); }
        50%       { transform: scaleY(1); }
      }
    `}</style>
  </div>
);

export const VoiceController: React.FC<VoiceControllerProps> = ({
  script,
  language,
  onLanguageChange,
  isPlaying,
  onPlayingChange,
  speed,
  onSpeedChange,
}) => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSupportedRef = useRef<boolean>(typeof window !== 'undefined' && 'speechSynthesis' in window);

  const stopSpeech = useCallback(() => {
    if (isSupportedRef.current) {
      window.speechSynthesis.cancel();
    }
    onPlayingChange(false);
  }, [onPlayingChange]);

  const startSpeech = useCallback(() => {
    if (!isSupportedRef.current || !script.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.volume = 1;

    const langEntry = LANGUAGE_OPTIONS.find((l) => l.value === language);
    utterance.lang = langEntry?.speechLang ?? 'en-IN';

    // Pick the best available voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) =>
      v.lang.startsWith(utterance.lang.slice(0, 2))
    );
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onend = () => onPlayingChange(false);
    utterance.onerror = () => onPlayingChange(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    onPlayingChange(true);
  }, [script, speed, language, onPlayingChange]);

  const handleToggle = useCallback(() => {
    if (isPlaying) {
      stopSpeech();
    } else {
      startSpeech();
    }
  }, [isPlaying, startSpeech, stopSpeech]);

  // Re-start when speed or language changes while playing
  useEffect(() => {
    if (isPlaying) {
      startSpeech();
    }
  }, [speed, language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cancel on unmount
  useEffect(() => {
    return () => {
      if (isSupportedRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Cancel when script changes
  useEffect(() => {
    stopSpeech();
  }, [script]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isSupportedRef.current) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/30 italic">
        <span>🔇</span>
        <span>Voice not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Icon + Play/Pause */}
      <div className="flex items-center gap-2">
        <span className="text-base">🔊</span>
        <button
          onClick={handleToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
            isPlaying
              ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/30'
              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <SoundWave />
              <span>Pause</span>
            </>
          ) : (
            <>
              <span>▶</span>
              <span>Play</span>
            </>
          )}
        </button>
      </div>

      {/* Speed Selector */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10">
        {SPEED_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSpeedChange(opt.value)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
              speed === opt.value
                ? 'bg-indigo-500/40 text-indigo-200'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Language Selector */}
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as VoiceLanguage)}
        className="bg-white/5 border border-white/10 text-white/70 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500/50 focus:text-white cursor-pointer"
      >
        {LANGUAGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-gray-900">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Hook version for use in DynamicLabEngine
export interface VoiceState {
  isPlaying: boolean;
  speed: VoiceSpeed;
  language: VoiceLanguage;
}

export function useVoiceController(script: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<VoiceSpeed>(1);
  const [language, setLanguage] = useState<VoiceLanguage>('en-IN');

  const handlePlayingChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  const handleSpeedChange = useCallback((s: VoiceSpeed) => {
    setSpeed(s);
  }, []);

  const handleLanguageChange = useCallback((lang: VoiceLanguage) => {
    setLanguage(lang as VoiceLanguage);
  }, []);

  // Stop on script change
  useEffect(() => {
    setIsPlaying(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [script]);

  return {
    voiceState: { isPlaying, speed, language } as VoiceState,
    setIsPlaying: handlePlayingChange,
    setSpeed: handleSpeedChange,
    setLanguage: handleLanguageChange,
  };
}

export default VoiceController;
