import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Languages,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Clock,
  Ticket,
  MapPin,
  Calendar,
  Layers,
  Settings,
  X,
  ChevronRight,
  Radio
} from 'lucide-react';
import {
  SupportedLanguage,
  AssistantMessage,
  AssistantVoiceState,
  AssistantContextSnapshot,
  AssistantActionType
} from '../../types';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { aiService } from '../../services/aiService';
import { voiceUtils } from '../../utils/voiceUtils';
import { Button } from '../../components/common/Button';

export interface FarmerAssistantProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenVoiceModal?: () => void;
}

export const FarmerAssistant: React.FC<FarmerAssistantProps> = ({
  currentLanguage: initialLang,
  onLanguageChange,
  onNavigateToTab,
  onOpenVoiceModal
}) => {
  const {
    farmer,
    activeBooking,
    currentToken,
    selectedCentre,
    centres,
    queueTokens,
    completedTodayCount,
    isProcurementPaused,
    notifications,
    rescheduleBooking,
    takeNextAvailableSlot,
    clearActiveBooking,
    getCentreQueueState,
    language: contextLang,
    setLanguage
  } = useKisanSetu();

  // Active language can be controlled locally or synced with global context
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>(
    initialLang || contextLang || 'en'
  );

  // Voice & Interaction States
  const [voiceState, setVoiceState] = useState<AssistantVoiceState>('READY');
  const [voiceErrorMsg, setVoiceErrorMsg] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState<boolean>(false);

  // Input text & chat history
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Build real-time context snapshot
  const centreQueue = getCentreQueueState(selectedCentre?.id || 'PC-TN-04');
  const contextSnapshot: AssistantContextSnapshot = {
    farmerName: farmer.name,
    farmerPhone: farmer.phone,
    farmerVillage: farmer.village,
    language: activeLanguage,
    booking: activeBooking,
    token: currentToken,
    centre: selectedCentre,
    queueLength: centreQueue.waitingCount,
    waitMinutes: centreQueue.estimatedWaitMinutes,
    queuePosition: currentToken ? 13 : undefined,
    allCentres: centres,
    isCentrePaused: isProcurementPaused,
    todayCompletedCount: completedTodayCount,
    recentNotificationText: notifications[0]?.message,
    todayProduceSummary: activeBooking
      ? `${activeBooking.quantityKg} kg ${activeBooking.produceType}`
      : '450 kg Paddy (Grade A)'
  };

  // Initial welcome greeting depending on language
  const getGreetingText = (lang: SupportedLanguage): string => {
    switch (lang) {
      case 'ta':
        return 'வணக்கம்! நான் கிசான் சேது மித்ரா. இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்? உங்கள் டோக்கன், கொள்முதல் நேரம் அல்லது காத்திருப்பு விவரங்களை கேட்கலாம்.';
      case 'hi':
        return 'नमस्ते! मैं किसानसेतु मित्र हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ? आप अपना टोकन, स्लॉट समय या कतार की स्थिति पूछ सकते हैं।';
      case 'en':
      default:
        return "Vanakkam! I'm KisanSetu Mitra, your procurement companion. How can I help you today? You can ask about your slot, token, or queue.";
    }
  };

  // Reset or initialize conversation
  useEffect(() => {
    setMessages([
      {
        id: 'init-msg',
        sender: 'assistant',
        text: getGreetingText(activeLanguage),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local_rules',
        isSimulated: false,
        actions: [
          {
            label: activeLanguage === 'ta' ? 'என் slot எப்போது?' : activeLanguage === 'hi' ? 'मेरा स्लॉट कब है?' : 'When is my slot?',
            action: 'VIEW_BOOKING',
            variant: 'primary'
          },
          {
            label: activeLanguage === 'ta' ? 'என் டோக்கன் என்ன?' : activeLanguage === 'hi' ? 'मेरा टोकन क्या है?' : 'What is my token?',
            action: 'VIEW_TOKEN',
            variant: 'outline'
          }
        ]
      }
    ]);
  }, [activeLanguage]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, voiceState]);

  // Handle Language switch
  const handleSwitchLanguage = (newLang: SupportedLanguage) => {
    setActiveLanguage(newLang);
    onLanguageChange?.(newLang);
    setLanguage(newLang);
    voiceUtils.stopSpeaking();
    setIsSpeaking(false);
  };

  // Suggested Questions per language
  const suggestedQuestions: Record<SupportedLanguage, string[]> = {
    en: [
      'When is my slot?',
      'What is my token?',
      'How long will I wait?',
      'Which centre is less crowded?',
      'Can I reschedule?',
      'Where should I go?'
    ],
    ta: [
      'என் slot எப்போது?',
      'என் token என்ன?',
      'எவ்வளவு நேரம் காத்திருக்க வேண்டும்?',
      'எந்த மையம் குறைவான கூட்டம்?',
      'என் slot மாற்ற முடியுமா?',
      'நான் எங்கு செல்ல வேண்டும்?'
    ],
    hi: [
      'मेरा स्लॉट कब है?',
      'मेरा टोकन क्या है?',
      'कितना इंतज़ार करना होगा?',
      'कौन सा केंद्र कम भीड़भाड़ वाला है?',
      'क्या मैं रीशेड्यूल कर सकता हूँ?',
      'मुझे कहाँ जाना चाहिए?'
    ]
  };

  // Send message pipeline
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    voiceUtils.stopSpeaking();
    setIsSpeaking(false);

    // 1. Append user message
    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setVoiceState('PROCESSING');

    // 2. Call AI Service (Context-grounded)
    try {
      const responseMsg = await aiService.sendMessage(query, contextSnapshot, messages);
      setMessages((prev) => [...prev, responseMsg]);
      setVoiceState('READY');

      // 3. Auto-read if enabled
      if (autoSpeak) {
        handleSpeak(responseMsg.id, responseMsg.text);
      }
    } catch (err) {
      setVoiceState('ERROR');
      setVoiceErrorMsg('I had trouble understanding. Please try again.');
      setTimeout(() => setVoiceState('READY'), 3000);
    }
  };

  // Voice Input Speech Recognition
  const handleToggleVoiceInput = () => {
    if (voiceState === 'LISTENING') {
      recognitionRef.current?.stop();
      setVoiceState('READY');
      return;
    }

    if (!voiceUtils.isRecognitionSupported()) {
      setVoiceState('ERROR');
      setVoiceErrorMsg("Voice input isn't supported on this device.");
      return;
    }

    try {
      setVoiceState('LISTENING');
      setVoiceErrorMsg(null);

      const rec = voiceUtils.createRecognition(
        activeLanguage,
        (transcript: string) => {
          setVoiceState('PROCESSING');
          handleSendMessage(transcript);
        },
        (error: any) => {
          setVoiceState('ERROR');
          setVoiceErrorMsg(
            activeLanguage === 'ta'
              ? 'குரல் கேட்க முடியவில்லை, மீண்டும் முயற்சிக்கவும்.'
              : activeLanguage === 'hi'
              ? 'आवाज़ समझ नहीं आई, कृपया पुनः प्रयास करें।'
              : 'Could not capture speech. Please tap to try again.'
          );
          setTimeout(() => setVoiceState('READY'), 3500);
        },
        () => {
          if (voiceState === 'LISTENING') {
            setVoiceState('READY');
          }
        }
      );

      recognitionRef.current = rec;
      rec?.start();
    } catch (e) {
      setVoiceState('ERROR');
      setVoiceErrorMsg('Microphone access unavailable in this view.');
      setTimeout(() => setVoiceState('READY'), 3500);
    }
  };

  // Text to speech playback
  const handleSpeak = (msgId: string, text: string) => {
    if (isSpeaking && activePlayingId === msgId) {
      voiceUtils.stopSpeaking();
      setIsSpeaking(false);
      setActivePlayingId(null);
      return;
    }

    voiceUtils.stopSpeaking();
    setIsSpeaking(true);
    setActivePlayingId(msgId);

    voiceUtils.speakText(
      text,
      activeLanguage,
      () => {
        setIsSpeaking(true);
        setActivePlayingId(msgId);
      },
      () => {
        setIsSpeaking(false);
        setActivePlayingId(null);
      },
      () => {
        setIsSpeaking(false);
        setActivePlayingId(null);
      }
    );
  };

  // Handle Quick Actions
  const handleActionClick = (action: AssistantActionType, payload?: any) => {
    switch (action) {
      case 'VIEW_BOOKING':
        onNavigateToTab?.('bookings');
        break;
      case 'VIEW_TOKEN':
        onNavigateToTab?.('token');
        break;
      case 'VIEW_CENTRE':
        onNavigateToTab?.('centre-status');
        break;
      case 'FIND_SLOT':
        onNavigateToTab?.('book-slot');
        break;
      case 'TRACK_TRANSPORT':
        onNavigateToTab?.('centre-status');
        break;
      case 'CHOOSE_CENTRE':
        onNavigateToTab?.('book-slot');
        break;
    }
  };

  // Handle Confirmation of state changes
  const handleConfirmAction = (confirmObj: any) => {
    if (confirmObj.type === 'RESCHEDULE') {
      rescheduleBooking(
        confirmObj.payload?.slotTime || '11:30 AM',
        '11:15 AM',
        confirmObj.payload?.estimatedWait || 22
      );
      const successReply: AssistantMessage = {
        id: `confirm-${Date.now()}`,
        sender: 'assistant',
        text:
          activeLanguage === 'ta'
            ? '✓ உங்கள் முன்பதிவு காலை 11:30 மணிக்கு வெற்றிகரமாக மாற்றப்பட்டது! டோக்கன் புதுப்பிக்கப்பட்டுள்ளது.'
            : activeLanguage === 'hi'
            ? '✓ आपकी बुकिंग सुबह 11:30 बजे के लिए सफलतापूर्वक रीशेड्यूल कर दी गई है! टोकन अपडेट हो गया है।'
            : '✓ Your booking has been successfully rescheduled to 11:30 AM! Your token is updated.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          {
            label: activeLanguage === 'ta' ? 'புதிய டோக்கன் பார்க்க' : activeLanguage === 'hi' ? 'नया टोकन देखें' : 'View New Token',
            action: 'VIEW_TOKEN',
            variant: 'primary'
          }
        ]
      };
      setMessages((prev) => [...prev, successReply]);
    } else if (confirmObj.type === 'CANCEL') {
      clearActiveBooking();
      const cancelReply: AssistantMessage = {
        id: `cancel-${Date.now()}`,
        sender: 'assistant',
        text:
          activeLanguage === 'ta'
            ? 'உங்கள் முன்பதிவு மற்றும் டோக்கன் ரத்து செய்யப்பட்டுள்ளது. புதிய ஸ்லாட் பதிவு செய்ய "Find Best Time" அழுத்தவும்.'
            : activeLanguage === 'hi'
            ? 'आपकी बुकिंग और टोकन रद्द कर दिए गए हैं। नया स्लॉट बुक करने के लिए "स्लॉट बुक करें" पर टैप करें।'
            : 'Your booking and token have been cancelled. Whenever you are ready, tap below to book a new slot.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          {
            label: activeLanguage === 'ta' ? 'புதிய ஸ்லாட் பதிவு' : activeLanguage === 'hi' ? 'स्लॉट बुक करें' : 'Book New Slot',
            action: 'FIND_SLOT',
            variant: 'primary'
          }
        ]
      };
      setMessages((prev) => [...prev, cancelReply]);
    } else if (confirmObj.type === 'BOOK_ALTERNATIVE') {
      takeNextAvailableSlot();
      const altReply: AssistantMessage = {
        id: `alt-${Date.now()}`,
        sender: 'assistant',
        text:
          activeLanguage === 'ta'
            ? '✓ அடுத்த வாய்ப்பான 11:30 AM ஸ்லாட் உங்களுக்காக ஒதுக்கப்பட்டது! புதிய டோக்கனை கீழே காணலாம்.'
            : activeLanguage === 'hi'
            ? '✓ 11:30 AM का अगला स्लॉट आपके लिए सफलतापूर्वक आवंटित कर दिया गया है!'
            : '✓ The 11:30 AM slot has been reserved for you! View your refreshed token below.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          {
            label: activeLanguage === 'ta' ? 'டோக்கன் பார்க்க' : activeLanguage === 'hi' ? 'टोकन देखें' : 'View Token',
            action: 'VIEW_TOKEN',
            variant: 'primary'
          }
        ]
      };
      setMessages((prev) => [...prev, altReply]);
    }
  };

  // Reset Conversation
  const handleNewConversation = () => {
    voiceUtils.stopSpeaking();
    setIsSpeaking(false);
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'assistant',
        text: getGreetingText(activeLanguage),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local_rules',
        actions: [
          {
            label: activeLanguage === 'ta' ? 'என் slot எப்போது?' : activeLanguage === 'hi' ? 'मेरा स्लॉट कब है?' : 'When is my slot?',
            action: 'VIEW_BOOKING',
            variant: 'primary'
          }
        ]
      }
    ]);
  };

  // Simulated Voice Demo trigger (walkthrough without mic permission requirement)
  const handleSimulatedVoiceDemo = () => {
    setVoiceState('LISTENING');
    setTimeout(() => {
      setVoiceState('PROCESSING');
      const sampleQuestion =
        activeLanguage === 'ta'
          ? 'என் slot எப்போது?'
          : activeLanguage === 'hi'
          ? 'मेरा स्लॉट कब है?'
          : 'When is my slot?';
      handleSendMessage(sampleQuestion);
    }, 1500);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-16">
      {/* 1. Header & Identity Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-slate-900 text-lg sm:text-xl">
                KisanSetu Mitra
              </h1>
              {/* Ready / Voice Status Pill */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                  voiceState === 'LISTENING'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                    : voiceState === 'PROCESSING'
                    ? 'bg-purple-100 text-purple-900 border-purple-300 animate-pulse'
                    : voiceState === 'ERROR'
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    voiceState === 'LISTENING'
                      ? 'bg-amber-500 animate-ping'
                      : voiceState === 'PROCESSING'
                      ? 'bg-purple-500 animate-ping'
                      : voiceState === 'ERROR'
                      ? 'bg-rose-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span>
                  {voiceState === 'LISTENING'
                    ? "I'm listening..."
                    : voiceState === 'PROCESSING'
                    ? 'Understanding...'
                    : voiceState === 'ERROR'
                    ? 'Needs Retry'
                    : '● Ready'}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Your procurement companion • Voice, Tamil, Hindi & English
            </p>
          </div>
        </div>

        {/* Top Controls: Language Switcher, Auto-Read, Voice Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Switch Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { code: 'en', label: 'English' },
              { code: 'ta', label: 'தமிழ்' },
              { code: 'hi', label: 'हिन्दी' }
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => handleSwitchLanguage(l.code as SupportedLanguage)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeLanguage === l.code
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Auto-Read Toggle */}
          <button
            type="button"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 ${
              autoSpeak
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Automatically speak AI responses"
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">Auto-read</span>
          </button>

          {/* Voice Mode Toggle */}
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 font-bold"
            onClick={() => setIsVoiceModeOpen(true)}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Mode</span>
          </Button>

          {/* New Conversation Reset */}
          <button
            type="button"
            onClick={handleNewConversation}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Clear current conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Conversational Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              {/* Mitra Avatar */}
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mr-2 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed space-y-2.5 ${
                  m.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-xs shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="font-sans whitespace-pre-wrap">{m.text}</div>

                {/* State-changing Confirmation Card */}
                {m.confirmation && (
                  <div className="mt-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-300 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{m.confirmation.title}</span>
                    </div>
                    <p className="text-xs text-amber-900 leading-snug">
                      {m.confirmation.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleConfirmAction(m.confirmation)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shadow-2xs"
                      >
                        {m.confirmation.confirmLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: `cancel-note-${Date.now()}`,
                              sender: 'assistant',
                              text: 'Understood. No changes were made to your schedule.',
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                          ]);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                      >
                        {m.confirmation.cancelLabel}
                      </button>
                    </div>
                  </div>
                )}

                {/* Contextual Action Buttons */}
                {m.actions && m.actions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {m.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        type="button"
                        onClick={() => handleActionClick(act.action, act.payload)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          act.variant === 'primary'
                            ? 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-2xs'
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        <span>{act.label}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Assistant Footer: Speaker Button + Time + Source */}
                {m.sender === 'assistant' && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSpeak(m.id, m.text)}
                      className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                        isSpeaking && activePlayingId === m.id
                          ? 'text-emerald-700 font-bold'
                          : 'text-slate-500 hover:text-emerald-700'
                      }`}
                    >
                      {isSpeaking && activePlayingId === m.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 animate-pulse text-emerald-700" />
                          <span>Stop Playing</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>🔊 Listen</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {m.source === 'gemini' ? (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          Gemini 3.8 Flash
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          AI Demo Mode
                        </span>
                      )}
                      <span>{m.time}</span>
                    </div>
                  </div>
                )}

                {/* User Message Timestamp */}
                {m.sender === 'user' && (
                  <div className="text-[10px] text-emerald-200 text-right">
                    {m.time}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Voice Listening / Processing Indicator in Stream */}
          {voiceState === 'LISTENING' && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <Mic className="w-4 h-4 animate-bounce" />
              </div>
              <span className="font-bold">
                {activeLanguage === 'ta'
                  ? 'உங்கள் கேள்வியை இப்போது கேட்கவும்...'
                  : activeLanguage === 'hi'
                  ? 'कृपया अपना प्रश्न बोलें...'
                  : "I'm listening to your voice..."}
              </span>
            </div>
          )}

          {voiceState === 'PROCESSING' && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-purple-50 border border-purple-300 text-purple-950 text-xs">
              <Sparkles className="w-4 h-4 text-purple-700 animate-spin" />
              <span className="font-semibold">
                Understanding your question and checking depot status...
              </span>
            </div>
          )}

          {voiceErrorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
              <span>{voiceErrorMsg}</span>
              <button
                type="button"
                onClick={() => setVoiceErrorMsg(null)}
                className="font-bold text-rose-900 underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Suggested Questions Pills */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 pl-1">
            Suggested:
          </span>
          {suggestedQuestions[activeLanguage]?.map((qText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qText)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200/90 shrink-0 transition-all shadow-2xs hover:border-emerald-300 text-left"
            >
              {qText}
            </button>
          ))}
        </div>

        {/* 4. Chat Input & Large Microphone Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2.5">
          {/* Large Voice Button with Animated Ripple */}
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className={`p-3 rounded-2xl font-bold transition-all shrink-0 flex items-center justify-center relative shadow-sm ${
              voiceState === 'LISTENING'
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                : 'bg-emerald-700 text-white hover:bg-emerald-800'
            }`}
            title={voiceState === 'LISTENING' ? 'Stop listening' : 'Tap to speak'}
            aria-label="Microphone"
          >
            {voiceState === 'LISTENING' ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              activeLanguage === 'ta'
                ? 'தமிழில் அல்லது ஆங்கிலத்தில் கேளுங்கள்...'
                : activeLanguage === 'hi'
                ? 'हिंदी या अंग्रेज़ी में पूछें...'
                : 'Ask in English, தமிழ் or हिन्दी...'
            }
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-slate-900"
          />

          {/* Send Button */}
          <Button
            size="md"
            icon={<Send className="w-4 h-4" />}
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
          >
            Send
          </Button>
        </div>
      </div>

      {/* 5. Demo / Evaluation Utility Bar */}
      <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
          <span>
            Smart India Hackathon Evaluator Simulation: Test speech recognition without microphone permissions.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSimulatedVoiceDemo}
          className="px-3 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold border border-purple-300 transition-colors"
        >
          Try Voice Demo
        </button>
      </div>

      {/* 6. Simple Accessible Voice Mode (Modal for low-literacy farmers) */}
      {isVoiceModeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-6 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                Voice Mode Active
              </span>
              <button
                type="button"
                onClick={() => {
                  voiceUtils.stopSpeaking();
                  setIsVoiceModeOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title */}
            <div>
              <h3 className="font-display font-black text-slate-900 text-xl">
                {activeLanguage === 'ta'
                  ? 'உங்களுக்கு என்ன வேண்டும் என்று கூறுங்கள்'
                  : activeLanguage === 'hi'
                  ? 'बताइए, आपको क्या सहायता चाहिए'
                  : 'Tell me what you need'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                KisanSetu Mitra will listen and speak the answer back to you.
              </p>
            </div>

            {/* Giant Microphone Button */}
            <div className="py-4 flex justify-center">
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all shadow-xl ${
                  voiceState === 'LISTENING'
                    ? 'bg-rose-600 text-white ring-8 ring-rose-200 animate-pulse'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800 ring-8 ring-emerald-100'
                }`}
              >
                <Mic className="w-10 h-10 mb-1" />
                <span className="text-[11px] font-bold">
                  {voiceState === 'LISTENING' ? 'Listening...' : 'Tap to Speak'}
                </span>
              </button>
            </div>

            {/* Spoken Response Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left min-h-[100px] space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Mitra Spoken Answer:
              </span>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {messages[messages.length - 1]?.text ||
                  (activeLanguage === 'ta'
                    ? 'வணக்கம்! மைக் பொத்தானை அழுத்தி பேசவும்.'
                    : 'Vanakkam! Tap the microphone to speak.')}
              </p>
            </div>

            {/* Action buttons inside voice mode */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  const lastMsg = messages[messages.length - 1];
                  if (lastMsg) handleSpeak(lastMsg.id, lastMsg.text);
                }}
                className="flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4 text-emerald-700" />
                <span>Hear Again</span>
              </Button>

              <Button
                size="md"
                onClick={() => {
                  voiceUtils.stopSpeaking();
                  setIsVoiceModeOpen(false);
                }}
              >
                Exit Voice Mode
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
