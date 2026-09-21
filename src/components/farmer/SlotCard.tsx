import React, { useState } from 'react';
import { Clock, Calendar, Check, AlertCircle, BarChart3, Lock } from 'lucide-react';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { schedulingService } from '../../services/schedulingService';
import { WhatIfSlotComparison } from './WhatIfSlotComparison';

export type SlotAvailability = 'AVAILABLE' | 'LIMITED' | 'BUSY' | 'FULL' | 'CLOSED';

export interface DetailedTimeSlot {
  time: string;
  availability: SlotAvailability;
  estimatedWaitMinutes: number;
  expectedArrivals: number;
  recommendedArrival: string;
  period: 'Morning' | 'Afternoon';
}

export interface SlotCardProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
  selectedTime: string;
  onChangeTime: (time: string) => void;
  centreId?: string;
}

export const DATE_OPTIONS = ['Today', 'Tomorrow', 'Day After Tomorrow'];

export const SlotCard: React.FC<SlotCardProps> = ({
  selectedDate,
  onChangeDate,
  selectedTime,
  onChangeTime,
  centreId = 'PC-TN-04'
}) => {
  const { isSlotFull, centres, simulatedTime } = useKisanSetu();
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [blockedSlotAttempt, setBlockedSlotAttempt] = useState<string | null>(null);

  const selectedCentre = centres.find((c) => c.id === centreId) || centres[0];

  // 14 Standard Mandi Operational Slots
  const ALL_SLOTS: DetailedTimeSlot[] = [
    { time: '09:00 AM', availability: 'AVAILABLE', estimatedWaitMinutes: 10, expectedArrivals: 8, recommendedArrival: '08:45 AM', period: 'Morning' },
    { time: '09:30 AM', availability: 'AVAILABLE', estimatedWaitMinutes: 12, expectedArrivals: 11, recommendedArrival: '09:15 AM', period: 'Morning' },
    { time: '10:00 AM', availability: 'LIMITED', estimatedWaitMinutes: 18, expectedArrivals: 19, recommendedArrival: '09:40 AM', period: 'Morning' },
    { time: '10:30 AM', availability: 'AVAILABLE', estimatedWaitMinutes: 15, expectedArrivals: 14, recommendedArrival: '10:10 AM', period: 'Morning' },
    { time: '11:00 AM', availability: 'FULL', estimatedWaitMinutes: 32, expectedArrivals: 32, recommendedArrival: '10:45 AM', period: 'Morning' },
    { time: '11:30 AM', availability: 'BUSY', estimatedWaitMinutes: 26, expectedArrivals: 25, recommendedArrival: '11:10 AM', period: 'Morning' },
    { time: '12:00 PM', availability: 'BUSY', estimatedWaitMinutes: 28, expectedArrivals: 27, recommendedArrival: '11:40 AM', period: 'Afternoon' },
    { time: '12:30 PM', availability: 'LIMITED', estimatedWaitMinutes: 20, expectedArrivals: 18, recommendedArrival: '12:15 PM', period: 'Afternoon' },
    { time: '01:00 PM', availability: 'AVAILABLE', estimatedWaitMinutes: 14, expectedArrivals: 12, recommendedArrival: '12:45 PM', period: 'Afternoon' },
    { time: '01:30 PM', availability: 'AVAILABLE', estimatedWaitMinutes: 12, expectedArrivals: 10, recommendedArrival: '01:15 PM', period: 'Afternoon' },
    { time: '02:00 PM', availability: 'LIMITED', estimatedWaitMinutes: 18, expectedArrivals: 16, recommendedArrival: '01:45 PM', period: 'Afternoon' },
    { time: '02:30 PM', availability: 'AVAILABLE', estimatedWaitMinutes: 14, expectedArrivals: 11, recommendedArrival: '02:15 PM', period: 'Afternoon' },
    { time: '03:00 PM', availability: 'AVAILABLE', estimatedWaitMinutes: 11, expectedArrivals: 9, recommendedArrival: '02:45 PM', period: 'Afternoon' },
    { time: '03:30 PM', availability: 'LIMITED', estimatedWaitMinutes: 16, expectedArrivals: 14, recommendedArrival: '03:15 PM', period: 'Afternoon' }
  ];

  // Dynamic slot status resolution
  const resolvedSlots = ALL_SLOTS.map((slot) => {
    const isFullInStore = isSlotFull(centreId, slot.time, selectedDate);
    if (isFullInStore) {
      return { ...slot, availability: 'FULL' as SlotAvailability };
    }
    return slot;
  });

  const handleSlotClick = (slot: DetailedTimeSlot) => {
    if (slot.availability === 'FULL' || slot.availability === 'CLOSED') {
      setBlockedSlotAttempt(
        `Slot ${slot.time} has reached maximum gate & weighbridge capacity (32 vehicles max). Please select another time.`
      );
      setTimeout(() => setBlockedSlotAttempt(null), 4500);
      return;
    }
    setBlockedSlotAttempt(null);
    onChangeTime(slot.time);
  };

  const getStatusBadge = (status: SlotAvailability) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            🟢 Available
          </span>
        );
      case 'LIMITED':
        return (
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
            🟡 Limited
          </span>
        );
      case 'BUSY':
        return (
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-300">
            🟠 Busy
          </span>
        );
      case 'FULL':
        return (
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-0.5">
            <Lock className="w-2.5 h-2.5" /> 🔴 Full
          </span>
        );
      case 'CLOSED':
        return (
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
            ⚫ Closed
          </span>
        );
    }
  };

  // Build comparison items for What-If modal
  const comparisonItems = resolvedSlots.map((s, idx) => ({
    slotId: `slot-${idx}`,
    time: s.time,
    waitMinutes: s.estimatedWaitMinutes,
    centreLoad: (s.availability === 'AVAILABLE' ? 'Low' : s.availability === 'LIMITED' ? 'Moderate' : 'High') as 'Low' | 'Moderate' | 'High',
    recommendedArrival: s.recommendedArrival,
    isRecommended: s.time === '10:30 AM',
    availability: s.availability
  }));

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Select Arrival Date:
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {DATE_OPTIONS.map((d) => {
            const isSelected = selectedDate === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => onChangeDate(d)}
                className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <Calendar className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{d}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Blocked Slot Warning Banner */}
      {blockedSlotAttempt && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Slot Unavailable:</strong>
            <span>{blockedSlotAttempt}</span>
          </div>
        </div>
      )}

      {/* Time Slots Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Available Arrival Windows:
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              30-min windows • Mandi gate bays 1 & 2
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCompareOpen(true)}
            className="py-1.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Compare Times</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <span className="font-semibold text-slate-500">Legend:</span>
          <span className="flex items-center gap-1">🟢 Good</span>
          <span className="flex items-center gap-1">🟡 Limited</span>
          <span className="flex items-center gap-1">🟠 Busy</span>
          <span className="flex items-center gap-1">🔴 Full (Cannot Book)</span>
        </div>

        {/* Slot Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {resolvedSlots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            const isFull = slot.availability === 'FULL';
            const isRecommended = slot.time === '10:30 AM';

            return (
              <button
                key={slot.time}
                type="button"
                disabled={isFull}
                onClick={() => handleSlotClick(slot)}
                className={`p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between min-h-[96px] ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-600/20'
                    : isFull
                    ? 'border-slate-200 bg-slate-100/80 opacity-60 cursor-not-allowed text-slate-400'
                    : isRecommended
                    ? 'border-emerald-400 bg-emerald-50/30 hover:border-emerald-600 hover:bg-emerald-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className={`text-base font-bold font-mono ${isFull ? 'text-slate-400' : 'text-slate-900'}`}>
                    {slot.time}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                  {isRecommended && !isSelected && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-700 text-white uppercase">
                      Best
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  <div>{getStatusBadge(slot.availability)}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>~{slot.estimatedWaitMinutes}m wait</span>
                    <span>{slot.expectedArrivals} vh</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* What-If Slot Comparison Modal */}
      <WhatIfSlotComparison
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        slots={comparisonItems}
        selectedSlotTime={selectedTime}
        centreName={selectedCentre.name}
        onSelectSlot={(time) => {
          onChangeTime(time);
        }}
      />
    </div>
  );
};
