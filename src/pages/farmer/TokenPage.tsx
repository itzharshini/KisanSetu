import React, { useState } from 'react';
import {
  Ticket,
  Clock,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Building2,
  Phone,
  HelpCircle,
  ArrowRight,
  QrCode,
  MapPin,
  Navigation,
  FileText,
  ShieldCheck,
  Scale,
  Bell
} from 'lucide-react';
import { QueueProgress } from '../../components/farmer/QueueProgress';
import { PageHeader } from '../../components/common/PageHeader';
import { DemoBadge } from '../../components/common/DemoBadge';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { useTranslation } from '../../utils/translations';

export interface TokenPageProps {
  onNavigateToBook: () => void;
  onNavigateToCentres: () => void;
}

export const TokenPage: React.FC<TokenPageProps> = ({
  onNavigateToBook,
  onNavigateToCentres
}) => {
  const {
    currentToken,
    activeBooking,
    isMissedSlotActive,
    takeNextAvailableSlot,
    rescheduleBooking,
    simulateNextFarmer,
    simulateFiveMinutes,
    language
  } = useKisanSetu();

  const { t } = useTranslation(language);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState({
    time: '11:30 AM',
    arrival: '11:15 AM',
    wait: 22
  });

  const rescheduleOptions = [
    { time: '11:30 AM (Today)', arrival: '11:15 AM', wait: 22 },
    { time: '02:00 PM (Today)', arrival: '01:45 PM', wait: 14 },
    { time: '10:00 AM (Tomorrow)', arrival: '09:40 AM', wait: 10 }
  ];

  const handleConfirmReschedule = () => {
    rescheduleBooking(
      selectedRescheduleSlot.time.split(' ')[0] + ' ' + selectedRescheduleSlot.time.split(' ')[1],
      selectedRescheduleSlot.arrival,
      selectedRescheduleSlot.wait
    );
    setShowRescheduleModal(false);
  };

  // If farmer has no active booking
  if (!activeBooking || !currentToken) {
    return (
      <div className="space-y-6 max-w-lg mx-auto py-12 text-center pb-24">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-300 flex items-center justify-center mx-auto text-slate-400">
          <Ticket className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 font-display">No Active Token</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You don't currently have an active gate pass or procurement slot booked for today.
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateToBook}
          className="py-3 px-6 rounded-2xl bg-emerald-700 text-white font-bold text-sm shadow-xs hover:bg-emerald-800 transition-colors"
        >
          Book Procurement Slot
        </button>
      </div>
    );
  }

  const isMissed = isMissedSlotActive || activeBooking.status === 'missed' || currentToken.status === 'MISSED';
  const isCompleted = currentToken.status === 'COMPLETED';

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-24 md:pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            {t('myToken', 'My Digital Token')}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Live queue tracker & gate pass for {activeBooking.centreName}
          </p>
        </div>
        <DemoBadge type="mode" />
      </div>

      {/* SECTION: PROCUREMENT COMPLETED CELEBRATION */}
      {isCompleted && (
        <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-400 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-200 text-emerald-900 shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-800" />
            </span>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                Procurement Successful
              </span>
              <h3 className="text-lg font-black text-emerald-950 font-display">
                {t('procurementCompleted', 'Procurement Completed')}
              </h3>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                Your produce has been weighed and accepted into the government warehouse. Digital
                weighment slip <strong>#KS-{currentToken.tokenCode}</strong> has been issued.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Commodity:</span>
              <span className="font-bold text-slate-800">
                {activeBooking.produceType} ({activeBooking.quantityKg} kg)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Net Value (Govt MSP):</span>
              <span className="font-mono font-black text-emerald-900">
                ₹{Math.round(activeBooking.quantityKg * 23.2).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-bold text-emerald-700">Direct DBT Transfer Processing</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 18: SMART MISSED SLOT EXPERIENCE */}
      {isMissed && !isCompleted && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-sm space-y-3.5">
          <div className="flex items-start gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-amber-950 font-display">
                {t('missedSlotNotice', 'Your original slot has passed.')}
              </h3>
              <p className="text-xs text-amber-900 font-medium leading-relaxed">
                Next available procurement opportunity: <strong>11:30 AM</strong> • Expected wait: <strong>24 min</strong>
              </p>
              <p className="text-xs text-amber-800/90 leading-relaxed pt-1 border-t border-amber-200">
                <em>"Farmers who arrived for earlier slots are currently being served. We have found the earliest safe window for you."</em>
              </p>
            </div>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={takeNextAvailableSlot}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('takeNextSlot', 'Take Next Available Slot')}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowRescheduleModal(true)}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-bold text-xs transition-colors"
            >
              Reschedule Date
            </button>
          </div>
        </div>
      )}

      {/* SECTION: LIVE QUEUE VISUALIZATION & DEMO CONTROLS */}
      <QueueProgress
        token={currentToken}
        onSimulateNextFarmer={simulateNextFarmer}
        onSimulateFiveMinutes={simulateFiveMinutes}
      />

      {/* SECTION: DIGITAL GATE PASS & QR CODE SIMULATION */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Gate Entry Barcode & Pass
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 font-mono">
            REF: {activeBooking.bookingRef}
          </span>
        </div>

        {/* QR Simulation Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
          {/* Simulated QR Pattern */}
          <div className="w-24 h-24 bg-white p-2 rounded-xl border border-slate-300 flex flex-col items-center justify-center shrink-0 shadow-2xs">
            <div className="grid grid-cols-5 gap-1 w-full h-full p-1 bg-slate-900 rounded-sm">
              <div className="bg-white col-span-2 row-span-2 rounded-xs" />
              <div className="bg-white col-span-1 row-span-1" />
              <div className="bg-white col-span-2 row-span-2 rounded-xs" />
              <div className="bg-white col-span-2 row-span-1" />
              <div className="bg-white col-span-1 row-span-2" />
              <div className="bg-white col-span-2 row-span-1" />
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold text-slate-800 block">
              Scan at Depot Security Barrier
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Show this screen to the gate officer upon arrival. Inbound Lane 1 is designated for tractor trolleys.
            </p>
            <span className="text-[10px] font-mono text-emerald-700 font-bold block pt-1">
              ✓ Verified Gate Pass #{currentToken.tokenCode}
            </span>
          </div>
        </div>

        {/* Additional Quick Token Details */}
        <div className="space-y-2.5 text-xs pt-1">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Commodity & Quantity:</span>
            <span className="font-bold text-slate-800">
              {activeBooking.produceType} ({activeBooking.quantityKg} kg)
            </span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Allocated Procurement Centre:</span>
            <span className="font-bold text-slate-800">{activeBooking.centreName}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Recommended Gate Arrival:</span>
            <span className="font-bold text-emerald-800">{activeBooking.recommendedArrival}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Centre Helpdesk:</span>
            <a
              href="tel:+914426279100"
              className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>+91 44 2627 9100</span>
            </a>
          </div>
        </div>
      </div>

      {/* SECTION: OPERATIONAL ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setShowDirectionsModal(true)}
          className="py-3 px-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <Navigation className="w-4 h-4 text-emerald-700" />
          <span>Gate Directions</span>
        </button>

        <button
          type="button"
          onClick={onNavigateToCentres}
          className="py-3 px-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <Building2 className="w-4 h-4 text-slate-600" />
          <span>Centre Status</span>
        </button>

        <button
          type="button"
          onClick={() => setShowRescheduleModal(true)}
          className="py-3 px-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <Calendar className="w-4 h-4 text-slate-600" />
          <span>Reschedule Slot</span>
        </button>

        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className="py-3 px-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Need Help?</span>
        </button>
      </div>

      {/* DIRECTIONS MODAL */}
      {showDirectionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Directions to {activeBooking.centreName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectionsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Depot Location:</span>
                <p className="text-[11px] text-slate-600">
                  NH 48 Bypass Road, Near Agricultural Market Committee Yard, Poonamallee, Thiruvallur District, Tamil Nadu 600056
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block">Inbound Vehicle Routing:</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  1. Tractors with trolleys enter through <strong>Gate 1 (West Lane)</strong>.
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  2. Present your digital token <strong>{currentToken.tokenCode}</strong> at the security barrier.
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  3. Park in holding yard <strong>Bay 2</strong> until your token is called to the electronic weighbridge.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDirectionsModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Centre Assistance & Support
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">
                If you encounter vehicle breakdown, transit delay, or moisture assessment questions:
              </p>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 space-y-1.5 text-blue-950">
                <span className="font-bold block">Poonamallee Field Officer Desk:</span>
                <p className="text-[11px]">Direct Line: +91 44 2627 9100</p>
                <p className="text-[11px]">Toll-Free Farmer Grievance: 1800 425 2425</p>
              </div>
              <p className="text-[11px] text-slate-500">
                KisanSetu automatically holds your position for up to 30 minutes if you experience highway delay.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                Easy Rescheduling
              </span>
              <h3 className="text-lg font-black text-slate-900 font-display">
                {t('reschedule', 'Reschedule Your Slot')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current: {activeBooking.slotDate} at {activeBooking.slotTime}
              </p>
            </div>

            <div className="space-y-2">
              {rescheduleOptions.map((opt) => {
                const isSelected = selectedRescheduleSlot.time === opt.time;
                return (
                  <button
                    key={opt.time}
                    type="button"
                    onClick={() => setSelectedRescheduleSlot(opt)}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-bold block">{opt.time}</span>
                      <span className="text-[11px] text-slate-500">
                        Arrive by: {opt.arrival} • Expected wait ~{opt.wait}m
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-colors"
              >
                {t('confirmNewSlot', 'Confirm New Slot')}
              </button>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                {t('close', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
