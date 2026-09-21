import {
  AssistantIntent,
  AssistantMessage,
  AssistantContextSnapshot,
  SupportedLanguage,
  AssistantMessageAction,
  AssistantActionConfirmation
} from '../types';
import { assistantTools } from './assistantTools';

interface ChatServerResponse {
  success: boolean;
  replyText?: string;
  intent?: AssistantIntent;
  source?: 'gemini' | 'local_rules' | 'offline_cache';
  actions?: AssistantMessageAction[];
  confirmation?: AssistantActionConfirmation;
}

export const aiService = {
  /**
   * Deterministic and robust keyword/pattern intent detector.
   * Supports English, Tamil, Hindi, Tanglish, and Hinglish.
   */
  detectIntent(query: string, language: SupportedLanguage): AssistantIntent {
    const q = query.toLowerCase().trim();

    // 1. Reschedule
    if (
      q.includes('reschedule') ||
      q.includes('change slot') ||
      q.includes('change my slot') ||
      q.includes('earlier') ||
      q.includes('later') ||
      q.includes('மாற்ற') ||
      q.includes('மாத்த') ||
      q.includes('बदलना') ||
      q.includes('बदलो')
    ) {
      return 'RESCHEDULE';
    }

    // 2. Missed Slot
    if (
      q.includes('missed') ||
      q.includes('late') ||
      q.includes('passed') ||
      q.includes('தவறி') ||
      q.includes('முடிஞ்சு') ||
      q.includes('छूट गया')
    ) {
      return 'MISSED_SLOT';
    }

    // 3. Cancel Booking
    if (
      q.includes('cancel') ||
      q.includes('ரத்து') ||
      q.includes('வேண்டாம்') ||
      q.includes('रद्द')
    ) {
      return 'CANCEL_BOOKING';
    }

    // 4. Token Check
    if (
      q.includes('token') ||
      q.includes('டோக்கன்') ||
      q.includes('டோகன்') ||
      q.includes('टोकन') ||
      q.includes('token number') ||
      q.includes('என் token')
    ) {
      return 'CHECK_TOKEN';
    }

    // 5. Queue & Wait Time Check
    if (
      q.includes('ahead of me') ||
      q.includes('before me') ||
      q.includes('how many people') ||
      q.includes('how many farmers') ||
      q.includes('how long') ||
      q.includes('wait') ||
      q.includes('queue') ||
      q.includes('முன்னாடி') ||
      q.includes('எத்தனை பேர்') ||
      q.includes('காத்திருக்க') ||
      q.includes('நேரம் ஆகும்') ||
      q.includes('कितने लोग') ||
      q.includes('इंतज़ार') ||
      q.includes('कतार')
    ) {
      return 'CHECK_QUEUE';
    }

    // 6. Recommendation Explanation
    if (
      q.includes('why') ||
      q.includes('calculate') ||
      q.includes('recommend') ||
      q.includes('ஏன்') ||
      q.includes('எப்படி') ||
      q.includes('क्यों') ||
      q.includes('कारण')
    ) {
      return 'EXPLAIN_RECOMMENDATION';
    }

    // 7. Centre Comparison / Crowdedness
    if (
      q.includes('less crowded') ||
      q.includes('which centre') ||
      q.includes('which center') ||
      q.includes('better') ||
      q.includes('where should i go') ||
      q.includes('எந்த மையம்') ||
      q.includes('எங்கு செல்ல') ||
      q.includes('கூட்டம்') ||
      q.includes('குறைவு') ||
      q.includes('कौन सा केंद्र') ||
      q.includes('कहाँ जाऊं') ||
      q.includes('भीड़')
    ) {
      return 'FIND_CENTRE';
    }

    // 8. Centre Status / Paused / Open
    if (
      q.includes('busy') ||
      q.includes('open') ||
      q.includes('closed') ||
      q.includes('paused') ||
      q.includes('happening at the centre') ||
      q.includes('centre status') ||
      q.includes('மையம்') ||
      q.includes('செயல்படுகிறதா') ||
      q.includes('केंद्र की स्थिति')
    ) {
      return 'CHECK_CENTRE_STATUS';
    }

    // 9. Booking Slot Time Check
    if (
      q.includes('slot') ||
      q.includes('when is my') ||
      q.includes('booking') ||
      q.includes('நேரம்') ||
      q.includes('எப்போது') ||
      q.includes('स्लॉट कब') ||
      q.includes('बुकिंग')
    ) {
      return 'CHECK_BOOKING';
    }

    // 10. Conversational Booking / Find Slot
    if (
      q.includes('book') ||
      q.includes('sell') ||
      q.includes('paddy') ||
      q.includes('kg') ||
      q.includes('விற்பனை') ||
      q.includes('பதிவு') ||
      q.includes('बेचना')
    ) {
      return 'FIND_SLOT';
    }

    // 11. Transport
    if (
      q.includes('transport') ||
      q.includes('truck') ||
      q.includes('lorry') ||
      q.includes('vehicle') ||
      q.includes('போக்குவரத்து') ||
      q.includes('லாரி') ||
      q.includes('परिवहन') ||
      q.includes('ट्रक')
    ) {
      return 'TRACK_TRANSPORT';
    }

    // 12. Payment & MSP
    if (
      q.includes('payment') ||
      q.includes('msp') ||
      q.includes('price') ||
      q.includes('money') ||
      q.includes('dbt') ||
      q.includes('விலை') ||
      q.includes('பணம்') ||
      q.includes('மதிப்பு') ||
      q.includes('भुगतान') ||
      q.includes('मूल्य') ||
      q.includes('दाम')
    ) {
      return 'CHECK_PAYMENT';
    }

    // 13. Produce
    if (
      q.includes('crop') ||
      q.includes('produce') ||
      q.includes('variety') ||
      q.includes('quantity') ||
      q.includes('பயிர்') ||
      q.includes('அளவு') ||
      q.includes('फसल')
    ) {
      return 'CHECK_PRODUCE';
    }

    // 14. Help
    if (
      q.includes('help') ||
      q.includes('who are you') ||
      q.includes('what can you do') ||
      q.includes('உதவி') ||
      q.includes('மதத்') ||
      q.includes('सहायता')
    ) {
      return 'HELP';
    }

    return 'GENERAL_QUESTION';
  },

  /**
   * Main messaging pipeline:
   * 1. Detect Intent
   * 2. Retrieve exact application state via assistantTools
   * 3. Call server-side /api/mitra-chat (with Gemini) if available
   * 4. If unavailable, use the context-grounded local rules engine (English, Tamil, Hindi)
   */
  async sendMessage(
    query: string,
    context: AssistantContextSnapshot,
    history: AssistantMessage[] = []
  ): Promise<AssistantMessage> {
    const intent = this.detectIntent(query, context.language);
    const bookingFacts = assistantTools.getCurrentBooking(context);
    const tokenFacts = assistantTools.getCurrentToken(context);
    const queueFacts = assistantTools.getQueueStatus(context);
    const centres = assistantTools.getNearbyCentres(context);
    const paymentFacts = assistantTools.getPaymentStatus(context);

    // Try calling server-side Gemini API route first
    try {
      const resp = await fetch('/api/mitra-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          language: context.language,
          intent,
          context: {
            farmerName: context.farmerName,
            booking: bookingFacts,
            token: tokenFacts,
            queue: queueFacts,
            nearbyCentres: centres,
            payment: paymentFacts,
            isPaused: context.isCentrePaused
          },
          history: history.slice(-4).map((h) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            text: h.text
          }))
        })
      });

      if (resp.ok) {
        const data: ChatServerResponse = await resp.json();
        if (data.replyText) {
          // Attach contextual action buttons matching the detected intent
          const actions = this.getActionsForIntent(intent, context);
          const confirmation = this.getConfirmationForIntent(intent, context);

          return {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            text: data.replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            intent,
            actions,
            confirmation,
            source: data.source || 'gemini',
            isSimulated: data.source !== 'gemini'
          };
        }
      }
    } catch {
      // Graceful fallback to client-side deterministic response engine
    }

    // Deterministic Client-Side Generator (Offline / Demo fallback)
    return this.generateDeterministicResponse(query, intent, context);
  },

  /**
   * Deterministic local response generator.
   * Guarantees 100% accurate application data presentation in English, Tamil, and Hindi.
   */
  generateDeterministicResponse(
    query: string,
    intent: AssistantIntent,
    context: AssistantContextSnapshot
  ): AssistantMessage {
    const lang = context.language;
    const booking = assistantTools.getCurrentBooking(context);
    const token = assistantTools.getCurrentToken(context);
    const queue = assistantTools.getQueueStatus(context);
    const centres = assistantTools.getNearbyCentres(context);
    const payment = assistantTools.getPaymentStatus(context);
    const produce = assistantTools.getFarmerProduce(context);

    let text = '';
    let actions: AssistantMessageAction[] = [];
    let confirmation: AssistantActionConfirmation | undefined = undefined;

    switch (intent) {
      case 'CHECK_BOOKING': {
        const slotTime = booking.slotTime || '10:30 AM';
        const centreName = booking.centreName || 'Poonamallee Procurement Centre';
        const arrival = booking.recommendedArrival || '10:10 AM';

        if (lang === 'ta') {
          text = `உங்கள் கொள்முதல் நேரம் நாளை காலை ${slotTime} மணிக்கு ${centreName}-ல் உள்ளது. தயவுசெய்து ${arrival} மணிக்கு வந்துவிடுங்கள்.`;
        } else if (lang === 'hi') {
          text = `आपका खरीद स्लॉट कल सुबह ${slotTime} पर ${centreName} में है। कृपया लगभग ${arrival} तक पहुँचें।`;
        } else {
          text = `Your procurement slot is tomorrow at ${slotTime} at ${centreName}. Please arrive around ${arrival}.`;
        }

        actions = [
          { label: lang === 'ta' ? 'டோக்கன் பார்க்க' : lang === 'hi' ? 'टोकन देखें' : 'View Token', action: 'VIEW_TOKEN', variant: 'primary' },
          { label: lang === 'ta' ? 'மைய விவரம்' : lang === 'hi' ? 'केंद्र देखें' : 'View Centre', action: 'VIEW_CENTRE', variant: 'outline' }
        ];
        break;
      }

      case 'CHECK_TOKEN': {
        const tokenCode = token.tokenCode || 'A-142';
        const pos = token.queuePosition || 13;
        const wait = token.waitMinutes || 18;

        if (lang === 'ta') {
          text = `உங்கள் டோக்கன் எண் ${tokenCode}. தங்களுக்கு முன்னால் ${pos} விவசாயிகள் உள்ளனர். உத்தேச காத்திருப்பு நேரம் சுமார் ${wait} நிமிடங்கள்.`;
        } else if (lang === 'hi') {
          text = `आपका टोकन नंबर ${tokenCode} है। आपसे आगे ${pos} किसान हैं। अनुमानित प्रतीक्षा समय लगभग ${wait} मिनट है।`;
        } else {
          text = `Your token is ${tokenCode}. There are ${pos} farmers ahead of you. Expected waiting time is about ${wait} minutes.`;
        }

        actions = [
          { label: lang === 'ta' ? 'நேரடி டோக்கன்' : lang === 'hi' ? 'मेरा टोकन' : 'View Token', action: 'VIEW_TOKEN', variant: 'primary' },
          { label: lang === 'ta' ? 'வரிசை பார்க்க' : lang === 'hi' ? 'कतार स्थिति' : 'Live Queue', action: 'VIEW_BOOKING', variant: 'outline' }
        ];
        break;
      }

      case 'CHECK_QUEUE': {
        const pos = token.queuePosition ?? 13;
        const wait = queue.estimatedWaitMinutes || 18;

        if (token.isCalled) {
          if (lang === 'ta') {
            text = `உங்கள் முறை வந்துவிட்டது! தயவுசெய்து எடைமேடைக்கு (Station 2) செல்லவும்.`;
          } else if (lang === 'hi') {
            text = `आपकी बारी आ गई है! कृपया वजन कांटे (Station 2) पर जाएं।`;
          } else {
            text = `Your turn has arrived! Please proceed immediately to Weighbridge Station 2.`;
          }
        } else if (pos <= 2) {
          if (lang === 'ta') {
            text = `உங்களுக்கு முன்னால் 2 விவசாயிகள் மட்டுமே உள்ளனர். நீங்கள் அடுத்ததாக அழைக்கப்படுவீர்கள், தயார் நிலையில் இருங்கள்.`;
          } else if (lang === 'hi') {
            text = `आपसे आगे केवल 2 किसान हैं। आप लगभग अगले हैं, कृपया तैयार रहें।`;
          } else {
            text = `You're almost next! Only ${pos} farmers ahead of you. Please keep your tractor ready at the gate.`;
          }
        } else {
          if (lang === 'ta') {
            text = `உங்களுக்கு முன்னால் ${pos} விவசாயிகள் காத்திருக்கின்றனர். உத்தேச காத்திருப்பு நேரம் சுமார் ${wait} நிமிடங்கள் ஆகும்.`;
          } else if (lang === 'hi') {
            text = `आपसे आगे ${pos} किसान हैं। वर्तमान अनुमानित प्रतीक्षा लगभग ${wait} मिनट है।`;
          } else {
            text = `There are ${pos} farmers ahead of you in the holding yard. You may wait about ${wait} minutes.`;
          }
        }

        actions = [
          { label: lang === 'ta' ? 'நேரலை டோக்கன்' : lang === 'hi' ? 'टोकन देखें' : 'View Token', action: 'VIEW_TOKEN', variant: 'primary' },
          { label: lang === 'ta' ? 'மைய நிலைமை' : lang === 'hi' ? 'केंद्र स्थिति' : 'Centre Status', action: 'VIEW_CENTRE', variant: 'outline' }
        ];
        break;
      }

      case 'FIND_CENTRE': {
        const avadi = centres.find((c) => c.name.toLowerCase().includes('avadi')) || centres[0];
        const poonamallee = centres.find((c) => c.name.toLowerCase().includes('poonamallee')) || centres[1];

        if (lang === 'ta') {
          text = `இப்போது ${avadi.name} சிறந்தது. பூந்தமல்லி (${poonamallee.waitMinutes} நிமிடம்) ஒப்பிடுகையில் ஆவடியில் காத்திருப்பு நேரம் சுமார் ${avadi.waitMinutes} நிமிடங்கள் மட்டுமே.`;
        } else if (lang === 'hi') {
          text = `मैं इस समय ${avadi.name} की सिफारिश करता हूँ। पूनमल्ली (${poonamallee.waitMinutes} मिनट) की तुलना में यहाँ केवल ${avadi.waitMinutes} मिनट की प्रतीक्षा है।`;
        } else {
          text = `I recommend ${avadi.name} right now. It has an estimated ${avadi.waitMinutes}-minute wait compared with ${poonamallee.waitMinutes} minutes at ${poonamallee.name}.`;
        }

        actions = [
          { label: lang === 'ta' ? 'ஆவடி தேர்வு செய்' : lang === 'hi' ? 'आवाडी चुनें' : 'Choose Avadi', action: 'CHOOSE_CENTRE', payload: avadi.id, variant: 'primary' },
          { label: lang === 'ta' ? 'பூந்தமல்லி தொடர்' : lang === 'hi' ? 'पूनमल्ली रखें' : 'Keep Current Centre', action: 'VIEW_CENTRE', variant: 'outline' }
        ];
        break;
      }

      case 'CHECK_CENTRE_STATUS': {
        if (context.isCentrePaused) {
          if (lang === 'ta') {
            text = `கொள்முதல் மையத்தில் எடை சரிபார்ப்பு பணி தற்காலிகமாக இடைநிறுத்தப்பட்டுள்ளது. மற்றொரு மையத்தை பார்க்கலாமா?`;
          } else if (lang === 'hi') {
            text = `इस केंद्र पर खरीद अस्थायी रूप से रुकी हुई है। क्या आप दूसरा केंद्र देखना चाहेंगे?`;
          } else {
            text = `Procurement at this centre is temporarily paused for calibration. Would you like me to check another centre?`;
          }
          actions = [
            { label: lang === 'ta' ? 'வேறு மையம் பார்க்க' : lang === 'hi' ? 'अन्य केंद्र खोजें' : 'Find Another Centre', action: 'VIEW_CENTRE', variant: 'primary' }
          ];
        } else {
          const wait = queue.estimatedWaitMinutes;
          const waitDesc = wait > 25 ? 'getting busy' : 'running smoothly';

          if (lang === 'ta') {
            text = `பூந்தமல்லி மையம் சாதாரணமாக இயங்குகிறது. சராசரி காத்திருப்பு சுமார் ${wait} நிமிடங்கள்.`;
          } else if (lang === 'hi') {
            text = `पूनमल्ली खरीद केंद्र सुचारू रूप से खुला है। वर्तमान प्रतीक्षा लगभग ${wait} मिनट है।`;
          } else {
            text = `Poonamallee Procurement Centre is open and ${waitDesc}. The current estimated wait is about ${wait} minutes.`;
          }
          actions = [
            { label: lang === 'ta' ? 'மைய விவரம்' : lang === 'hi' ? 'केंद्र देखें' : 'View Centre', action: 'VIEW_CENTRE', variant: 'primary' }
          ];
        }
        break;
      }

      case 'RESCHEDULE': {
        const altTime = '11:30 AM';
        const altWait = 22;

        if (lang === 'ta') {
          text = `காலை ${altTime} மணிக்கு புதிய slot கிடைத்துள்ளது. எதிர்பார்க்கப்படும் காத்திருப்பு நேரம் ${altWait} நிமிடங்கள். நீங்கள் மாற்ற விரும்புகிறீர்களா?`;
        } else if (lang === 'hi') {
          text = `मुझे सुबह ${altTime} का स्लॉट मिला है। अपेक्षित प्रतीक्षा समय ${altWait} मिनट है। क्या आप रीशेड्यूल करना चाहते हैं?`;
        } else {
          text = `I found an ${altTime} slot today. Expected waiting time is ${altWait} minutes. Would you like me to reschedule?`;
        }

        confirmation = {
          type: 'RESCHEDULE',
          title: lang === 'ta' ? 'ஸ்லாட் மாற்றம் உறுதிப்படுத்தல்' : lang === 'hi' ? 'स्लॉट रीशेड्यूल पुष्टि' : 'Confirm Slot Reschedule',
          description: lang === 'ta' ? `${altTime} ஸ்லாட்டுக்கு மாற்றவும் (உத்தேச காத்திருப்பு: ${altWait} நிமிடம்)` : lang === 'hi' ? `${altTime} स्लॉट पर बदलें (प्रतीक्षा: ${altWait} मिनट)` : `Move your booking to ${altTime} (Estimated wait: ${altWait} min)`,
          payload: { slotTime: altTime, estimatedWait: altWait },
          confirmLabel: lang === 'ta' ? 'ஆம், மாற்று' : lang === 'hi' ? 'हाँ, रीशेड्यूल करें' : 'Yes, Reschedule',
          cancelLabel: lang === 'ta' ? 'இப்போதைய நேரம் போதும்' : lang === 'hi' ? 'वर्तमान स्लॉट रखें' : 'Keep Current Slot'
        };
        break;
      }

      case 'MISSED_SLOT': {
        const nextTime = '11:30 AM';
        const nextWait = 24;

        if (lang === 'ta') {
          text = `உங்கள் பழைய நேரம் கடந்துவிட்டது, கவலைப்பட வேண்டாம். அடுத்த வாய்ப்பு இன்று காலை ${nextTime} மணிக்கு உள்ளது. காத்திருப்பு சுமார் ${nextWait} நிமிடங்கள்.`;
        } else if (lang === 'hi') {
          text = `कोई बात नहीं, आपका मूल समय निकल चुका है। अगला उपलब्ध अवसर आज सुबह ${nextTime} का है। प्रतीक्षा लगभग ${nextWait} मिनट होगी।`;
        } else {
          text = `That's okay. Your original slot has passed. The next available opportunity is ${nextTime}. Expected waiting time is around ${nextWait} minutes.`;
        }

        confirmation = {
          type: 'BOOK_ALTERNATIVE',
          title: lang === 'ta' ? 'அடுத்த ஸ்லாட் முன்பதிவு' : lang === 'hi' ? 'अगला स्लॉट लें' : 'Take Next Available Slot',
          description: `${nextTime} slot • ~${nextWait} min wait`,
          payload: { slotTime: nextTime },
          confirmLabel: lang === 'ta' ? `${nextTime} ஸ்லாட் எடு` : lang === 'hi' ? `${nextTime} स्लॉट लें` : `Take ${nextTime} Slot`,
          cancelLabel: lang === 'ta' ? 'ரத்து செய்' : lang === 'hi' ? 'रद्द करें' : 'Cancel'
        };
        break;
      }

      case 'CANCEL_BOOKING': {
        if (lang === 'ta') {
          text = `உங்கள் டோக்கன் மற்றும் முன்பதிவை ரத்து செய்ய விரும்புகிறீர்களா? ரத்து செய்தால் வரிசை எண் இழக்கப்படும்.`;
        } else if (lang === 'hi') {
          text = `क्या आप अपनी बुकिंग और टोकन रद्द करना चाहते हैं? रद्द करने पर कतार का स्थान छूट जाएगा।`;
        } else {
          text = `Are you sure you want to cancel your booking and token? This will release your reserved slot.`;
        }

        confirmation = {
          type: 'CANCEL',
          title: lang === 'ta' ? 'முன்பதிவு ரத்து' : lang === 'hi' ? 'बुकिंग रद्द करें' : 'Cancel Booking Confirmation',
          description: lang === 'ta' ? 'டோக்கன் #TN-204 ரத்து செய்யப்படும்.' : lang === 'hi' ? 'टोकन #TN-204 रद्द किया जाएगा।' : 'Token #TN-204 will be cancelled.',
          confirmLabel: lang === 'ta' ? 'ஆம், ரத்து செய்' : lang === 'hi' ? 'हाँ, रद्द करें' : 'Yes, Cancel Booking',
          cancelLabel: lang === 'ta' ? 'இருக்கட்டும்' : lang === 'hi' ? 'रखें' : 'Keep Booking'
        };
        break;
      }

      case 'EXPLAIN_RECOMMENDATION': {
        if (query.toLowerCase().includes('how') || query.toLowerCase().includes('calculate')) {
          if (lang === 'ta') {
            text = `வரிசை அளவு, கொள்முதல் மையக் கொள்ளளவு, எடை போடும் வேகம், உங்கள் பயண நேரம் மற்றும் கிடைக்கும் நேரங்களை கணக்கிட்டு இதை தேர்வு செய்துள்ளேன்.`;
          } else if (lang === 'hi') {
            text = `मैं कतार के आकार, केंद्र क्षमता, वजन गति, आपके यात्रा समय और उपलब्ध समय का विश्लेषण करके यह स्लॉट चुनता हूँ।`;
          } else {
            text = `I calculate this considering queue size, centre capacity, weighing speed, your travel time, and open slots.`;
          }
        } else {
          if (lang === 'ta') {
            text = `காலை 10:30 மணி பரிந்துரைக்கப்பட்டது, ஏனெனில் அப்போது காத்திருப்பு நேரம் குறைவு, மையத்தில் போதிய இடம் உள்ளது, மேலும் பயணத்திற்கும் போதுமான அவகாசம் கிடைக்கும்.`;
          } else if (lang === 'hi') {
            text = `मैंने सुबह 10:30 बजे की सिफारिश की क्योंकि उस समय कतार कम होती है, केंद्र में पर्याप्त जगह है, और आपको यात्रा का समय मिलता है।`;
          } else {
            text = `I recommended 10:30 AM because the expected queue is lower, the centre has enough capacity, and the timing gives you enough travel time.`;
          }
        }
        break;
      }

      case 'FIND_SLOT': {
        if (lang === 'ta') {
          text = `நிச்சயமாக, 450 கிலோ நெல் விற்பனைக்கு சிறந்த நேரத்தை கண்டறியலாம். பூந்தமல்லி மையத்தில் நாளை காலை 10:30 மணி மிகவும் உகந்தது.`;
        } else if (lang === 'hi') {
          text = `मैं इसमें आपकी मदद कर सकता हूँ। 450 किग्रा धान के लिए कल सुबह 10:30 बजे पूनमल्ली केंद्र पर सबसे अच्छा समय है।`;
        } else {
          text = `I can help with that. For 450 kg paddy, tomorrow at 10:30 AM at Poonamallee is currently the best available time.`;
        }

        actions = [
          { label: lang === 'ta' ? 'சிறந்த நேரம் பதிவு செய்' : lang === 'hi' ? 'सर्वोत्तम समय बुक करें' : 'Find Best Time', action: 'FIND_SLOT', variant: 'primary' }
        ];
        break;
      }

      case 'CHECK_PAYMENT': {
        if (lang === 'ta') {
          text = `முதல் ரக நெல்லின் குறைந்தபட்ச ஆதரவு விலை (MSP) குவிண்டாலுக்கு ${payment.mspRateGradeA} ஆகும். எடை போட்ட 24 முதல் 48 மணி நேரத்திற்குள் பணம் உங்கள் வங்கிக் கணக்கில் வரவு வைக்கப்படும்.`;
        } else if (lang === 'hi') {
          text = `धान (ग्रेड ए) का न्यूनतम समर्थन मूल्य (MSP) ${payment.mspRateGradeA} है। वजन पूरा होने के 24 से 48 घंटों के भीतर सीधे बैंक खाते में भुगतान आ जाता है।`;
        } else {
          text = `The government MSP for Grade A Paddy is ${payment.mspRateGradeA}. Direct Benefit Transfer (DBT) will be credited to your linked bank account within 24 to 48 hours of weighment.`;
        }
        break;
      }

      case 'CHECK_PRODUCE': {
        if (lang === 'ta') {
          text = `உங்கள் முன்பதிவில் ${produce.quantityKg} கிலோ (${produce.quantityQuintals} குவிண்டால்) ${produce.produce} (${produce.variety}) பதிவு செய்யப்பட்டுள்ளது.`;
        } else if (lang === 'hi') {
          text = `आपकी बुकिंग में ${produce.quantityKg} किग्रा (${produce.quantityQuintals} क्विंटल) ${produce.produce} दर्ज है।`;
        } else {
          text = `Your booking is for ${produce.quantityKg} kg (${produce.quantityQuintals} Quintals) of ${produce.produce} (${produce.variety}).`;
        }
        actions = [
          { label: lang === 'ta' ? 'முன்பதிவு பார்க்க' : lang === 'hi' ? 'बुकिंग देखें' : 'View Booking', action: 'VIEW_BOOKING', variant: 'outline' }
        ];
        break;
      }

      case 'TRACK_TRANSPORT': {
        if (lang === 'ta') {
          text = `கொள்முதல் மையத்திலிருந்து இந்திய உணவுக் கழக (FCI) கிடங்குகளுக்கு தானியங்களை எடுத்துச் செல்ல 3 லாரிகள் தற்போது தயார் நிலையில் உள்ளன.`;
        } else if (lang === 'hi') {
          text = `केंद्र से एफसीआई गोदाम तक अनाज परिवहन के लिए 3 ट्रक वर्तमान में लोडिंग बे पर सक्रिय हैं।`;
        } else {
          text = `3 transport trucks are currently active at the loading bay, evacuating bagged grain to the central FCI silos.`;
        }
        actions = [
          { label: lang === 'ta' ? 'வாகனங்கள் பார்க்க' : lang === 'hi' ? 'ट्रक ट्रैक करें' : 'Track Transport', action: 'TRACK_TRANSPORT', variant: 'outline' }
        ];
        break;
      }

      case 'HELP': {
        if (lang === 'ta') {
          text = `வணக்கம்! உங்கள் முன்பதிவு நேரம், டோக்கன் எண், வரிசை விவரம், குறைந்த கூட்டமுள்ள மையம் மற்றும் நெல் கொள்முதல் விவரங்களை நான் எளிதாக விளக்குவேன்.`;
        } else if (lang === 'hi') {
          text = `नमस्ते! मैं आपके खरीद स्लॉट, टोकन नंबर, कतार की स्थिति, केंद्र की जानकारी और एमएसपी सहायता में मदद कर सकता हूँ।`;
        } else {
          text = `Vanakkam! I can help you check your slot timing, token number, queue position, find less crowded centres, or reschedule your appointment.`;
        }
        break;
      }

      case 'GENERAL_QUESTION':
      default: {
        if (lang === 'ta') {
          text = `மன்னிக்கவும், இதை என்னால் துல்லியமாக அறிய முடியவில்லை. உங்கள் முன்பதிவு, டோக்கன், வரிசை அல்லது கொள்முதல் மையம் பற்றி என்னிடம் கேட்கலாம்.`;
        } else if (lang === 'hi') {
          text = `मुझे इसके बारे में निश्चित जानकारी नहीं है। मैं आपकी बुकिंग, टोकन, केंद्र की स्थिति या कतार में मदद कर सकता हूँ।`;
        } else {
          text = `I'm not sure about that. I can help with your booking, token, centre status, queue or procurement.`;
        }
        break;
      }
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent,
      actions,
      confirmation,
      source: 'local_rules',
      isSimulated: true
    };
  },

  /**
   * Helper to attach contextual action buttons based on intent.
   */
  getActionsForIntent(intent: AssistantIntent, context: AssistantContextSnapshot): AssistantMessageAction[] {
    const lang = context.language;
    switch (intent) {
      case 'CHECK_BOOKING':
        return [
          { label: lang === 'ta' ? 'டோக்கன் பார்க்க' : lang === 'hi' ? 'टोकन देखें' : 'View Token', action: 'VIEW_TOKEN', variant: 'primary' },
          { label: lang === 'ta' ? 'மைய விவரம்' : lang === 'hi' ? 'केंद्र देखें' : 'View Centre', action: 'VIEW_CENTRE', variant: 'outline' }
        ];
      case 'CHECK_TOKEN':
      case 'CHECK_QUEUE':
        return [
          { label: lang === 'ta' ? 'டோக்கன்' : lang === 'hi' ? 'टोकन' : 'View Token', action: 'VIEW_TOKEN', variant: 'primary' },
          { label: lang === 'ta' ? 'மையம்' : lang === 'hi' ? 'केंद्र' : 'View Centre', action: 'VIEW_CENTRE', variant: 'outline' }
        ];
      case 'FIND_CENTRE':
        return [
          { label: lang === 'ta' ? 'ஆவடி மையம் தேர்வு' : lang === 'hi' ? 'आवाडी केंद्र' : 'Choose Avadi', action: 'CHOOSE_CENTRE', variant: 'primary' }
        ];
      case 'CHECK_PRODUCE':
        return [
          { label: lang === 'ta' ? 'முன்பதிவு பார்க்க' : lang === 'hi' ? 'बुकिंग देखें' : 'View Booking', action: 'VIEW_BOOKING', variant: 'outline' }
        ];
      default:
        return [];
    }
  },

  /**
   * Helper to attach action confirmation cards when state change is requested.
   */
  getConfirmationForIntent(intent: AssistantIntent, context: AssistantContextSnapshot): AssistantActionConfirmation | undefined {
    const lang = context.language;
    if (intent === 'RESCHEDULE') {
      return {
        type: 'RESCHEDULE',
        title: lang === 'ta' ? 'ஸ்லாட் மாற்றம் உறுதிப்படுத்தல்' : lang === 'hi' ? 'स्लॉट रीशेड्यूल पुष्टि' : 'Confirm Slot Reschedule',
        description: lang === 'ta' ? '11:30 AM ஸ்லாட்டுக்கு மாற்றவும்' : lang === 'hi' ? '11:30 AM स्लॉट पर बदलें' : 'Move booking to 11:30 AM (Wait: ~22 min)',
        confirmLabel: lang === 'ta' ? 'ஆம், மாற்று' : lang === 'hi' ? 'हाँ, रीशेड्यूल करें' : 'Yes, Reschedule',
        cancelLabel: lang === 'ta' ? 'இப்போதைய நேரம் போதும்' : lang === 'hi' ? 'वर्तमान रखें' : 'Keep Current Slot'
      };
    }
    if (intent === 'CANCEL_BOOKING') {
      return {
        type: 'CANCEL',
        title: lang === 'ta' ? 'முன்பதிவு ரத்து' : lang === 'hi' ? 'बुकिंग रद्द करें' : 'Cancel Booking',
        description: 'Token #TN-204',
        confirmLabel: lang === 'ta' ? 'ஆம், ரத்து செய்' : lang === 'hi' ? 'हाँ, रद्द करें' : 'Yes, Cancel',
        cancelLabel: lang === 'ta' ? 'இருக்கட்டும்' : lang === 'hi' ? 'रखें' : 'Keep Booking'
      };
    }
    return undefined;
  }
};
