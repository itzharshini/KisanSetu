import { SupportedLanguage } from '../types';

// Declare types for Web Speech API to satisfy TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const voiceUtils = {
  /**
   * Check if speech recognition is available in browser/device.
   */
  isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  /**
   * Check if speech synthesis is available in browser/device.
   */
  isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  },

  /**
   * Get BCP-47 language tag for speech recognition and synthesis.
   */
  getLangCode(lang: SupportedLanguage): string {
    switch (lang) {
      case 'ta':
        return 'ta-IN';
      case 'hi':
        return 'hi-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  },

  /**
   * Speak text in the target language using browser speech synthesis.
   */
  speakText(
    text: string,
    lang: SupportedLanguage,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void
  ): boolean {
    if (!this.isSynthesisSupported()) {
      onError?.();
      return false;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterances
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getLangCode(lang);
      utterance.rate = 0.95; // Slightly slower for rural clarity
      utterance.pitch = 1.0;

      // Try matching preferred voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((v) => v.lang.startsWith(utterance.lang) || v.lang.includes(utterance.lang));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => onStart?.();
      utterance.onend = () => onEnd?.();
      utterance.onerror = () => {
        onEnd?.();
        onError?.();
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      onError?.();
      return false;
    }
  },

  /**
   * Stop active speech synthesis.
   */
  stopSpeaking(): void {
    if (this.isSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe ignore
      }
    }
  },

  /**
   * Initialize a speech recognition instance.
   */
  createRecognition(
    lang: SupportedLanguage,
    onResult: (transcript: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): any {
    if (!this.isRecognitionSupported()) return null;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = this.getLangCode(lang);

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        onError(event);
      };

      recognition.onend = () => {
        onEnd();
      };

      return recognition;
    } catch (e) {
      onError(e);
      return null;
    }
  }
};
