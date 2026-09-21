import React from 'react';
import { MapPin, Clock, Gauge, Building2, Check, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProcurementCentre } from '../../types';
import { DemoBadge } from '../common/DemoBadge';

export interface CentreCardProps {
  centre: ProcurementCentre;
  isSelected?: boolean;
  isRecommended?: boolean;
  whyRecommended?: string[];
  onSelect: (centreId: string) => void;
}

export const CentreCard: React.FC<CentreCardProps> = ({
  centre,
  isSelected = false,
  isRecommended = false,
  whyRecommended,
  onSelect
}) => {
  const getWaitingBadge = (load: 'Low' | 'Moderate' | 'High') => {
    switch (load) {
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            🟢 Low waiting
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            🟡 Moderate waiting
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            🔴 Busy
          </span>
        );
      default:
        return null;
    }
  };

  const defaultWhy = [
    'Shorter expected waiting time',
    'Good capacity and active weighing stations',
    'Suitable for your produce and vehicle transit'
  ];

  const reasons = whyRecommended || defaultWhy;

  return (
    <div
      onClick={() => onSelect(centre.id)}
      className={`rounded-2xl border-2 transition-all p-4 sm:p-5 text-left relative cursor-pointer select-none ${
        isSelected
          ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-600/20'
          : isRecommended
          ? 'border-emerald-500 bg-white hover:border-emerald-600 shadow-2xs ring-1 ring-emerald-400/30'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
      }`}
    >
      {/* Recommended Tag */}
      {isRecommended && (
        <div className="absolute -top-3 left-4 bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>RECOMMENDED CENTRE</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-slate-500">{centre.code}</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {centre.status === 'open' || centre.status === 'optimal' ? 'Open' : 'Limited'}
            </span>
            {isRecommended && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Best match
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
            {centre.name}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Distance: <strong className="text-slate-700">{centre.distanceKm} km</strong> from your village
          </p>
        </div>

        <div className="shrink-0">{getWaitingBadge(centre.loadLabel)}</div>
      </div>

      {/* Section 7 Intelligence: Why Recommended Panel */}
      {isRecommended && (
        <div className="my-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
          <span className="font-bold text-emerald-900 block mb-1">Why?</span>
          <div className="space-y-1 text-slate-700">
            {reasons.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 py-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <span className="text-slate-500 block text-[11px]">Estimated wait</span>
          <strong className="text-sm font-bold text-slate-900 font-display">
            {centre.currentWaitMinutes} min
          </strong>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <span className="text-slate-500 block text-[11px]">Available capacity</span>
          <strong className="text-sm font-bold text-emerald-800 font-display">
            {centre.capacityStatus}
          </strong>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <span className="text-slate-500 block text-[11px]">Weigh stations</span>
          <strong className="text-sm font-bold text-slate-900 font-display">
            {centre.activeWeighingStations}/{centre.totalWeighingStations} Active
          </strong>
        </div>
      </div>

      {/* Action / Select footer */}
      <div className="pt-2 flex items-center justify-between text-xs">
        <span className="text-slate-500 text-[11px] italic">
          {centre.humanizedSpaceText}
        </span>

        <button
          type="button"
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-colors ${
            isSelected
              ? 'bg-emerald-700 text-white'
              : 'bg-slate-100 text-slate-800 hover:bg-emerald-50 hover:text-emerald-800'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Selected</span>
            </>
          ) : (
            <>
              <span>Select Centre</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
