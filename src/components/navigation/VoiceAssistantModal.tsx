import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Languages,
  ArrowRight,
  ChevronRight,
  Bot,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SupportedLanguage, AssistantContextSnapshot } from '../../types';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { aiService } from '../../services/aiService';
import { voiceUtils } from '../../utils/voiceUtils';

export interface VoiceAssistantModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  onNavigateToTab?: (tab: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  id,
  isOpen,
  onClose,
  currentLanguage: initialLanguage,
  onNavigateToTab
}) => {
  const {
    farmer,
    activeBooking,
    currentToken,
    selectedCentre,
    centres,
    isProcurementPaused,
    completedTodayCount,
    notifications,
    getCentreQueueState
  } = useKisanSetu();

  const [lang, setLang] = useState<SupportedLanguage>(initialLanguage || 'en');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [activeAnswer, setActiveAnswer] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [actionButton, setActionButton] = useState<{ label: string; tab: string } | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setLang(initialLanguage);
  }, [initialLanguage]);

  useEffect(() => {
    if (!isOpen) {
      voiceUtils.stopSpeaking();
      setIsPlayingAudio(false);
      setIsListening(false);
      recognitionRef.current?.stop();
    }
  }, [isOpen]);

  const queueInfo = getCentreQueueState(selectedCentre?.id || 'PC-TN-04');
  const contextSnapshot: AssistantContextSnapshot = {
    farmerName: farmer.name,
    farmerPhone: farmer.phone,
    farmerVillage: farmer.village,
    language: lang,
    booking: activeBooking,
    token: currentToken,
    centre: selectedCentre,
    queueLength: queueInfo.waitingCount,
    waitMinutes: queueInfo.estimatedWaitMinutes,
    queuePosition: currentToken ? 13 : undefined,
    allCentres: centres,
    isCentrePaused: isProcurementPaused,
    todayCompletedCount: completedTodayCount,
    recentNotificationText: notifications[0]?.message
  };

  const sampleQueries: Record<SupportedLanguage, { query: string; actionTab?: string }[]> = {
    en: [
      { query: 'When is my slot today?', actionTab: 'bookings' },
      { query: 'What is my token number?', actionTab: 'token' },
      { query: 'How many farmers are ahead of me?', actionTab: 'token' },
      { query: 'Which centre is less crowded right now?', actionTab: 'centre-status' }
    ],
    ta: [
      { query: 'என் slot எப்போது?', actionTab: 'bookings' },
      { query: 'என் token என்ன?', actionTab: 'token' },
      { query: 'எனக்கு முன்னாடி எத்தனை பேர் இருக்காங்க?', actionTab: 'token' },
      { query: 'எந்த மையம் குறைவான கூட்டம்?', actionTab: 'centre-status' }
    ],
    hi: [
      { query: 'मेरा स्लॉट कब है?', actionTab: 'bookings' },
      { query: 'मेरा टोकन नंबर क्या है?', actionTab: 'token' },
      { query: 'मुझसे आगे कितने किसान हैं?', actionTab: 'token' },
      { query: 'कौन सा केंद्र कम भीड़भाड़ वाला है?', actionTab: 'centre-status' }
    ]
  };

  const handleProcessQuery = async (queryText: string, suggestedActionTab?: string) => {
    setActiveQuery(queryText);
    setIsProcessing(true);
    setIsListening(false);
    voiceUtils.stopSpeaking();
    setIsPlayingAudio(false);

    try {
      const response = await aiService.sendMessage(queryText, contextSnapshot);
      setActiveAnswer(response.text);
      setIsProcessing(false);

      // Determine action button
      if (response.actions && response.actions.length > 0) {
        const act = response.actions[0];
        const targetTab =
          act.action === 'VIEW_TOKEN'
            ? 'token'
            : act.action === 'VIEW_CENTRE'
            ? 'centre-status'
            : act.action === 'FIND_SLOT'
            ? 'book-slot'
            : 'bookings';
        setActionButton({ label: act.label, tab: targetTab });
      } else if (suggestedActionTab) {
        setActionButton({
          label: lang === 'ta' ? 'விவரம் பார்க்க' : lang === 'hi' ? 'देखें' : 'View Details',
          tab: suggestedActionTab
        });
      } else {
        setActionButton(null);
      }

      // Automatically speak answer in voice assistant modal
      voiceUtils.speakText(
        response.text,
        lang,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
    } catch {
      setActiveAnswer('Sorry, I could not process your query. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleToggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (voiceUtils.isRecognitionSupported()) {
      setIsListening(true);
      setActiveQuery(null);
      setActiveAnswer(null);
      setActionButton(null);

      const rec = voiceUtils.createRecognition(
        lang,
        (transcript: string) => {
          handleProcessQuery(transcript);
        },
        () => {
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
      recognitionRef.current = rec;
      rec?.start();
    } else {
      // Fallback voice demo simulation
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const randomQuery = sampleQueries[lang][0];
        handleProcessQuery(randomQuery.query, randomQuery.actionTab);
      }, 1400);
    }
  };

  const handlePlayAudioToggle = () => {
    if (isPlayingAudio) {
      voiceUtils.stopSpeaking();
      setIsPlayingAudio(false);
    } else if (activeAnswer) {
      voiceUtils.speakText(
        activeAnswer,
        lang,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const queries = sampleQueries[lang] || sampleQueries.en;

  return (
    <Modal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      title="KisanSetu Mitra"
      subtitle="Voice-first multilingual guidance for farmers"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { code: 'en', label: 'EN' },
              { code: 'ta', label: 'தமிழ்' },
              { code: 'hi', label: 'हिन्दी' }
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLang(item.code as SupportedLanguage)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === item.code ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Voice Trigger Banner */}
        <div className="text-center py-6 px-4 bg-emerald-50/60 rounded-3xl border border-emerald-200/80">
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-400 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse scale-105 ring-8 ring-rose-200'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
            }`}
            aria-label="Tap to speak"
          >
            {isListening ? (
              <MicOff className="w-8 h-8 animate-bounce" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>

          <p className="mt-3 text-sm font-semibold text-slate-900">
            {isListening
              ? lang === 'ta'
                ? 'கேட்கிறது... இப்போது பேசவும்'
                : lang === 'hi'
                ? 'सुन रहा हूँ... बोलिए'
                : 'Listening in your regional language...'
              : lang === 'ta'
              ? 'பேச மைக் பொத்தானை அழுத்தவும்'
              : lang === 'hi'
              ? 'बोलने के लिए माइक दबाएं'
              : 'Tap microphone to speak'}
          </p>

          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Tamil, Hindi and English voice assistant for KisanSetu
          </p>
        </div>

        {/* Live Recognized Query & Dynamic Answer */}
        {isProcessing && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin text-purple-700 shrink-0" />
            <span>Understanding question and retrieving live centre data...</span>
          </div>
        )}

        {activeQuery && !isProcessing && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Farmer Query</span>
              <span className="flex items-center gap-1 text-emerald-700">
                <Sparkles className="w-3 h-3" /> Voice Recognized
              </span>
            </div>
            <p className="text-sm font-medium text-slate-900 italic">"{activeQuery}"</p>

            {activeAnswer && (
              <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-emerald-700" /> Mitra Response
                  </span>
                  <button
                    type="button"
                    onClick={handlePlayAudioToggle}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold"
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 animate-pulse" /> Stop Voice
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" /> 🔊 Replay Voice
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-slate-800 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed font-sans shadow-2xs">
                  {activeAnswer}
                </p>

                {actionButton && (
                  <div className="pt-1 flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => {
                        onClose();
                        onNavigateToTab?.(actionButton.tab);
                      }}
                      className="flex items-center gap-1 font-bold text-xs"
                    >
                      <span>{actionButton.label}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Voice Suggestions */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick Common Voice Queries
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {queries.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleProcessQuery(item.query, item.actionTab)}
                className="text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors flex items-center justify-between group text-xs text-slate-700 bg-white"
              >
                <div className="flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-medium line-clamp-1">{item.query}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
