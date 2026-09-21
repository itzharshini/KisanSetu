import React, { useState } from 'react';
import {
  Wheat,
  Calendar,
  MapPin,
  Truck,
  Package,
  CreditCard,
  Bot,
  Clock,
  Building2,
  Hourglass,
  Gauge,
  ArrowRight,
  Sparkles,
  Ticket,
  CheckCircle2,
  ShieldCheck,
  PlusCircle,
  HelpCircle,
  Mic
} from 'lucide-react';
import { Farmer, Booking, QueueToken, SupportedLanguage, FarmerNavTab } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DemoBadge } from '../../components/common/DemoBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { VoiceButton } from '../../components/farmer/VoiceButton';
import { FarmerActionModal, FarmerActionType } from './FarmerActionModal';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { useTranslation } from '../../utils/translations';

export interface FarmerHomeProps {
  farmer: Farmer;
  activeBooking: Booking | null;
  queueToken: QueueToken | null;
  selectedLanguage: SupportedLanguage;
  onNavigateToTab: (tab: FarmerNavTab) => void;
  onOpenVoiceAssistant: () => void;
}

export const FarmerHome: React.FC<FarmerHomeProps> = ({
  farmer,
  activeBooking,
  queueToken,
  selectedLanguage,
  onNavigateToTab,
  onOpenVoiceAssistant
}) => {
  const [activeActionModal, setActiveActionModal] = useState<FarmerActionType>(null);
  const { easyMode, language } = useKisanSetu();
  const { t } = useTranslation(language);

  const actionButtons: {
    type: Exclude<FarmerActionType, null>;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    directTab?: FarmerNavTab;
  }[] = [
    {
      type: 'book',
      label: t('bookSlot', 'Book Slot'),
      sublabel: 'Step-by-Step Scheduling',
      icon: Calendar,
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      directTab: 'book-slot'
    },
    {
      type: 'token',
      label: t('myToken', 'My Token'),
      sublabel: 'Live Gate Queue & Turn',
      icon: Ticket,
      accentColor: 'text-blue-700 bg-blue-50 border-blue-300',
      directTab: 'token'
    },
    {
      type: 'centre',
      label: t('centreStatus', 'Centre Status'),
      sublabel: 'Live Waiting Times',
      icon: MapPin,
      accentColor: 'text-amber-700 bg-amber-50 border-amber-300',
      directTab: 'centre-status'
    },
    {
      type: 'track',
      label: t('trackTransport', 'Track Transport'),
      sublabel: 'Gate & Vehicle Sync',
      icon: Truck,
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-300'
    },
    {
      type: 'produce',
      label: t('myProduce', 'My Produce'),
      sublabel: 'Registered Harvest',
      icon: Package,
      accentColor: 'text-slate-700 bg-slate-100 border-slate-300',
      directTab: 'produce'
    },
    {
      type: 'payments',
      label: t('payments', 'Payments'),
      sublabel: 'Direct Benefit Transfer',
      icon: CreditCard,
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      directTab: 'payments'
    },
    {
      type: 'ask',
      label: t('askKisanSetu', 'Ask KisanSetu'),
      sublabel: 'Voice & AI Assistance',
      icon: Bot,
      accentColor: 'text-purple-700 bg-purple-50 border-purple-300',
      directTab: 'assistant'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* SECTION 27 & 41: Easy Mode Active Banner & Primary 4 Interactions */}
      {easyMode && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-600 text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-700 animate-ping" />
              <div>
                <strong className="text-sm font-black font-display block">
                  {t('easyModeActive', 'Easy Mode Active')}
                </strong>
                <p className="text-xs text-emerald-800">
                  {t('easyModeDesc', 'Simplified view with large touch buttons and direct voice assistance.')}
                </p>
              </div>
            </div>
          </div>

          {/* Section 41: 4 Primary Easy Mode Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => onNavigateToTab('assistant')}
              className="p-4 rounded-2xl bg-purple-700 text-white hover:bg-purple-800 transition-all text-center flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <span className="text-2xl">🎙</span>
              <strong className="text-sm font-black font-display">Ask KisanSetu</strong>
              <span className="text-[11px] text-purple-200">Voice Assistant</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('book-slot')}
              className="p-4 rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800 transition-all text-center flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <span className="text-2xl">📅</span>
              <strong className="text-sm font-black font-display">Book Slot</strong>
              <span className="text-[11px] text-emerald-200">Choose Best Time</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('token')}
              className="p-4 rounded-2xl bg-blue-700 text-white hover:bg-blue-800 transition-all text-center flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <span className="text-2xl">🎫</span>
              <strong className="text-sm font-black font-display">My Token</strong>
              <span className="text-[11px] text-blue-200">Gate Queue Turn</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('centre-status')}
              className="p-4 rounded-2xl bg-amber-700 text-white hover:bg-amber-800 transition-all text-center flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <span className="text-2xl">📍</span>
              <strong className="text-sm font-black font-display">Centre Status</strong>
              <span className="text-[11px] text-amber-200">Live Waiting Times</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Header Greeting Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              {t('verifiedProfile', 'Verified Farmer Profile')}
            </span>
            <DemoBadge type="mode" />
          </div>
          <h1
            className={`${
              easyMode ? 'text-3xl sm:text-4xl font-black' : 'text-2xl sm:text-3xl font-extrabold'
            } text-slate-900 tracking-tight font-display`}
          >
            {t('welcome', 'Good morning')}, {farmer.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {t('village', 'Village')}: <strong className="text-slate-700">{farmer.village}</strong>, {t('district', 'District')}: {farmer.district}
          </p>
        </div>

        {/* SECTION 29: Reusable Voice Button */}
        <div className="flex items-center gap-2 shrink-0">
          <VoiceButton
            language={language}
            onResult={(transcript) => {
              onOpenVoiceAssistant();
            }}
            size={easyMode ? 'lg' : 'md'}
          />
        </div>
      </div>

      {/* SECTION 42: Prominent AI Assistant Banner (Ask KisanSetu Mitra) */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-emerald-900 rounded-3xl p-5 sm:p-6 text-white shadow-sm border border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
            <Bot className="w-7 h-7 text-purple-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded text-purple-200">
                Voice & Multilingual AI
              </span>
              <span className="text-xs text-purple-300">English • தமிழ் • हिन्दी</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-display text-white mt-1">
              Not sure what to do? Ask KisanSetu Mitra.
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 mt-0.5 max-w-xl">
              Ask when your slot is, how long the queue will be, which procurement centre is less crowded, or reschedule with your voice.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToTab('assistant')}
          className="py-3 px-5 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 font-black text-sm flex items-center gap-2 shrink-0 shadow-md transition-all active:scale-95 self-start sm:self-center"
        >
          <Mic className="w-4 h-4 text-purple-700" />
          <span>Ask Now</span>
          <ArrowRight className="w-4 h-4 text-purple-700" />
        </button>
      </div>

      {/* 2. SECTION 3: Today's Procurement Card */}
      <section aria-labelledby="todays-procurement-heading">
        <div className="flex items-center justify-between mb-3">
          <h2
            id="todays-procurement-heading"
            className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2"
          >
            <span>{t('todaysProcurement', "Today's Procurement")}</span>
            {activeBooking ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                {t('activeBooking', 'Active Booking')}
              </span>
            ) : null}
          </h2>
          <DemoBadge type="data" />
        </div>

        {activeBooking ? (
          /* State A: Active Booking Exists */
          <Card padding="none" className="overflow-hidden border-2 border-emerald-600/40 shadow-xs rounded-3xl">
            {/* Top Banner */}
            <div className="bg-emerald-800 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-0.5 rounded bg-emerald-700 text-emerald-100 border border-emerald-600/60">
                    {activeBooking.produceType} — {activeBooking.quantityKg} kg
                  </span>
                  <span className="text-xs font-semibold text-emerald-200 font-mono">
                    Token: <strong>{activeBooking.tokenNumber}</strong>
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                  {activeBooking.centreName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab('token')}
                className="py-2.5 px-4 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 border border-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-2xs transition-colors self-start sm:self-center"
              >
                <Ticket className="w-4 h-4 text-emerald-800" />
                <span>{t('viewDigitalToken', 'View Digital Token')}</span>
              </button>
            </div>

              {/* Section 29: Smart Recommendation & Congestion Alert Banners */}
              <div className="p-4 sm:px-6 pt-4 pb-0 space-y-2.5">
                {/* 1. Smart Arrival Recommendation */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 flex items-start sm:items-center justify-between gap-3 text-xs sm:text-sm shadow-2xs">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </span>
                    <span className="font-medium">
                      <strong>✨ Smart recommendation:</strong> Arrive around{' '}
                      <strong className="underline decoration-emerald-500 font-black font-mono">
                        {activeBooking.recommendedArrival}
                      </strong>{' '}
                      to avoid the busiest period and bypass gate bottle-necks.
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 shrink-0 hidden sm:inline-block">
                    AI-Assisted
                  </span>
                </div>

                {/* 2. Dynamic Congestion Alert Banner (Triggers if centre becomes congested in demo simulation) */}
                {activeBooking.centreLoad === 'High' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm animate-in fade-in">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                        <Gauge className="w-4 h-4 text-white" />
                      </span>
                      <span>
                        <strong>⚠ Centre activity has increased:</strong> High inbound vehicle arrivals at{' '}
                        {activeBooking.centreName}. Consider arriving later or switching to an alternative centre.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigateToTab('centre-status')}
                      className="py-1.5 px-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shrink-0 self-start sm:self-center transition-colors shadow-2xs"
                    >
                      View Options
                    </button>
                  </div>
                )}
              </div>

              {/* Key Metrics Grid */}
              <div className="p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white">
              {/* Slot */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('slotTime', 'Slot Time')}</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 font-display mt-1">
                  {activeBooking.slotTime}
                </p>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {activeBooking.slotDate}
                </span>
              </div>

              {/* Estimated Waiting */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Hourglass className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('estimatedWait', 'Estimated Waiting')}</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-amber-800 font-display mt-1">
                  {activeBooking.estimatedWaitingMinutes} min
                </p>
                <span className="text-[11px] text-slate-500">Normal yard pace</span>
              </div>

              {/* Centre Load */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Gauge className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('centreLoad', 'Centre Load')}</span>
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      activeBooking.centreLoad === 'Low'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeBooking.centreLoad === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {activeBooking.centreLoad === 'Low'
                      ? t('lowWaiting', 'Low waiting')
                      : activeBooking.centreLoad === 'Moderate'
                      ? t('moderateWaiting', 'Moderate waiting')
                      : t('busyWaiting', 'Busy')}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">Balanced arrivals</span>
              </div>

              {/* Recommended Arrival */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90">
                <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('recommendedArrival', 'Recommended Arrival')}</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-emerald-950 font-display mt-1">
                  {activeBooking.recommendedArrival}
                </p>
                <span className="text-[11px] text-emerald-800 font-medium">20 min prior for gate check</span>
              </div>
            </div>

            {/* Guidance Footer */}
            <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 gap-2">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Gate 2 • Assigned Weighbridge #1 • Keep tractor ready</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Verified by Tamil Nadu Civil Supplies Corporation (TNCSC)
              </span>
            </div>
          </Card>
        ) : (
          /* State B: No Booking Exists (Section 3 requirement) */
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-dashed border-emerald-300 shadow-2xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-xl font-black text-slate-900 font-display">
                {t('planProcurement', 'Plan your procurement')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {t(
                  'planProcurementSubtitle',
                  'Find the best time and centre with KisanSetu to eliminate long mandi queues.'
                )}
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onNavigateToTab('book-slot')}
                className="py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm sm:text-base inline-flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                <span>{t('bookProcurementSlot', 'Book Procurement Slot')}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. SECTION 16: Farmer Quick Actions */}
      <section aria-labelledby="quick-actions-heading">
        <div className="flex items-center justify-between mb-3">
          <h2
            id="quick-actions-heading"
            className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-display"
          >
            {t('quickActions', 'Farmer Quick Actions')}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Minimal typing • Touch-friendly
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {actionButtons.map((btn) => {
            const Icon = btn.icon;

            return (
              <button
                key={btn.type}
                onClick={() => {
                  if (btn.directTab) {
                    onNavigateToTab(btn.directTab);
                  } else {
                    setActiveActionModal(btn.type);
                  }
                }}
                className={`group p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all text-left flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-emerald-600 active:scale-[0.98] select-none ${
                  easyMode ? 'min-h-[140px] sm:min-h-[160px]' : 'min-h-[120px] sm:min-h-[140px]'
                }`}
              >
                <div className="space-y-2">
                  <div
                    className={`rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 shadow-2xs ${
                      easyMode ? 'w-14 h-14' : 'w-11 h-11 sm:w-12 sm:h-12'
                    } ${btn.accentColor}`}
                  >
                    <Icon className={`${easyMode ? 'w-7 h-7' : 'w-6 h-6'} stroke-[2]`} />
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-slate-900 group-hover:text-emerald-950 font-display leading-snug ${
                        easyMode ? 'text-base sm:text-lg font-black' : 'text-sm sm:text-base'
                      }`}
                    >
                      {btn.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {btn.sublabel}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Action Detail / Track Modal if needed */}
      {activeActionModal && (
        <FarmerActionModal
          actionType={activeActionModal}
          onClose={() => setActiveActionModal(null)}
          farmer={farmer}
          onNavigateToTab={onNavigateToTab}
        />
      )}
    </div>
  );
};
