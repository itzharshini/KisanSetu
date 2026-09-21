import React from 'react';
import { Clock, Check, Sparkles, X, ArrowRight, ShieldAlert, Users } from 'lucide-react';
import { SlotComparisonItem } from '../../types';

export interface WhatIfSlotComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  slots: SlotComparisonItem[];
  selectedSlotTime: string;
  centreName: string;
  onSelectSlot: (slotTime: string, arrival: string, waitMinutes: number) => void;
}

export const WhatIfSlotComparison: React.FC<WhatIfSlotComparisonProps> = ({
  isOpen,
  onClose,
  slots,
  selectedSlotTime,
  centreName,
  onSelectSlot
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-700/80 flex items-center justify-center text-white">
              <Clock className="w-4 h-4 text-emerald-200" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-white">
                Compare Arrival Times
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {centreName} • What-If Simulation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explain Header */}
        <div className="p-3 bg-emerald-50 border-b border-emerald-200/60 text-xs text-emerald-950 flex items-center justify-between">
          <span className="font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            Compare expected wait and yard congestion across different hours.
          </span>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            Demo Model
          </span>
        </div>

        {/* Comparison List (Stacked cards for mobile, table on desktop) */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-100">
          {slots.map((item) => {
            const isSelected = item.time === selectedSlotTime;
            const isFull = item.availability === 'FULL';
            const isRecommended = item.isRecommended;

            const loadBadgeColor =
              item.centreLoad === 'Low'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : item.centreLoad === 'Moderate'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-rose-100 text-rose-800 border-rose-300';

            return (
              <div
                key={item.slotId}
                className={`pt-2.5 first:pt-0 p-3 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600/30'
                    : isRecommended
                    ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400'
                    : isFull
                    ? 'border-slate-200 bg-slate-50 opacity-60'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-black text-slate-900 font-mono">
                      {item.time}
                    </div>
                    {isRecommended && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                        Best Choice
                      </span>
                    )}
                    {isFull && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-700 text-white">
                        Full
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">
                      ~{item.waitMinutes} min wait
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${loadBadgeColor}`}
                    >
                      {item.centreLoad} Load
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Arrive by: <strong>{item.recommendedArrival}</strong>
                    </span>
                  </div>

                  {!isFull ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSlot(item.time, item.recommendedArrival, item.waitMinutes);
                        onClose();
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-800 hover:bg-emerald-100 hover:text-emerald-900'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-rose-600">No Slots</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
