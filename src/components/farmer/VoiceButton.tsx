import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { SupportedLanguage } from '../../types';

export interface VoiceButtonProps {
  onResult?: (transcript: string) => void;
  language?: SupportedLanguage;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onResult,
  language = 'en',
  className = '',
  size = 'md',
  showLabel = true
}) => {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const handleToggleListening = () => {
    setErrorMessage(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Voice input isn't supported on this device.");
      setTimeout(() => setErrorMessage(null), 3500);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langMap: Record<SupportedLanguage, string> = {
        en: 'en-IN',
        ta: 'ta-IN',
        hi: 'hi-IN'
      };
      recognition.lang = langMap[language] || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (onResult) {
          onResult(transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition notice:', err);
        setIsListening(false);
        setErrorMessage("Voice input paused. Please try tapping again or typing.");
        setTimeout(() => setErrorMessage(null), 3500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      setErrorMessage("Voice input isn't supported on this device.");
      setTimeout(() => setErrorMessage(null), 3500);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3.5 text-base'
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        type="button"
        onClick={handleToggleListening}
        aria-label="Tap to speak"
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 active:scale-95 select-none ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse shadow-md ring-4 ring-rose-200'
            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 shadow-2xs'
        } ${sizeClasses[size]} ${className}`}
      >
        {isListening ? (
          <>
            <MicOff className="w-5 h-5 animate-bounce" />
            {showLabel && <span>Listening...</span>}
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 text-emerald-700" />
            {showLabel && <span>🎙 Tap to speak</span>}
          </>
        )}
      </button>

      {errorMessage && (
        <div className="absolute top-full mt-2 z-30 w-56 p-2 rounded-lg bg-slate-900 text-white text-[11px] shadow-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
