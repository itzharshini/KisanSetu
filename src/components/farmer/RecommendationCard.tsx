import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  BarChart3,
  HelpCircle,
  Check,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { ProcurementCentre } from '../../types';
import { DemoBadge } from '../common/DemoBadge';
import { WhyThisSlotModal } from './WhyThisSlotModal';
import { WhatIfSlotComparison } from './WhatIfSlotComparison';
import { schedulingService } from '../../services/schedulingService';
import { useKisanSetu } from '../../context/KisanSetuContext';

export interface RecommendationCardProps {
  centre: ProcurementCentre;
  produceName: string;
  quantityKg: number;
  selectedSlotTime?: string;
  onSelectSlot: (time: string, recommendedArrival: string, waitMinutes: number) => void;
  onProceedToConfirm: () => void;
  onSelectCentre?: (centreId: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  centre,
  produceName,
  quantityKg,
  selectedSlotTime,
  onSelectSlot,
  onProceedToConfirm,
  onSelectCentre
}) => {
  const { centres, simulatedTime } = useKisanSetu();
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Compute smart scheduling recommendation dynamically
  const schedulingResult = schedulingService.recommendBestSlot({
    cropName: produceName,
    quantityKg,
    preferredCentreId: centre.id,
    date: 'Tomorrow',
    centres
  });

  const { bestRecommendation, alternatives, comparisonSlots } = schedulingResult;
  const recommendedSlot = bestRecommendation.slot;
  const earlierAlternative = alternatives.earlierSlot;
  const laterAlternative = alternatives.laterSlot;
  const nearbyAlternativeCentre = alternatives.nearbyCentre;

  return (
    <div className="space-y-6">
      {/* Primary Smart Recommendation Card */}
      <div className="rounded-3xl border-2 border-emerald-600 bg-white shadow-md overflow-hidden transition-all">
        {/* Header Ribbon */}
        <div className="bg-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200">
                  AI-assisted recommendation
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-700/80 text-emerald-100 border border-emerald-500/60">
                  Demo prediction
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-display text-white">
                ✨ BEST TIME FOR YOU
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 border border-emerald-400 text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              {bestRecommendation.statusMatch}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-baseline gap-3">
                <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">
                  {recommendedSlot.time}
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Score {bestRecommendation.score.totalScore}/100
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {centre.name}
              </p>
            </div>

            <div className="flex flex-col sm:items-end text-xs">
              <span className="text-slate-500 font-medium">Expected wait:</span>
              <strong className="text-base sm:text-lg font-extrabold text-emerald-800 font-display">
                {bestRecommendation.expectedWaitRange}
              </strong>
              <span className="text-slate-600 font-medium mt-0.5">
                Arrive by: <strong className="text-slate-900 font-bold">{bestRecommendation.recommendedArrival}</strong>
              </span>
            </div>
          </div>

          {/* "Why this slot?" Section */}
          <div className="space-y-2.5 bg-slate-50/90 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Why this slot?</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsWhyModalOpen(true)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why? (Details & Score)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
              {bestRecommendation.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => {
                onSelectSlot(
                  recommendedSlot.time,
                  bestRecommendation.recommendedArrival,
                  recommendedSlot.expectedWaitMinutes
                );
                onProceedToConfirm();
              }}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 active:scale-[0.99]"
            >
              <span>Choose This Slot ({recommendedSlot.time})</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="py-3 px-4 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span>Compare Times</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alternative Slot Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Alternative Slot Recommendations:
          </h4>
          <span className="text-[11px] text-slate-500">Pick what fits your travel plan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {earlierAlternative && (
            <button
              type="button"
              onClick={() => {
                onSelectSlot(
                  earlierAlternative.slot.time,
                  earlierAlternative.recommendedArrival,
                  earlierAlternative.expectedWaitMinutes
                );
                onProceedToConfirm();
              }}
              className="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/30 text-left transition-all flex items-center justify-between group shadow-2xs"
            >
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  EARLIER
                </span>
                <div className="text-xl font-black text-slate-900 font-mono mt-1">
                  {earlierAlternative.slot.time}
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Expected wait: <strong>{earlierAlternative.expectedWaitMinutes} min</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Arrive: {earlierAlternative.recommendedArrival}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-800 group-hover:underline inline-flex items-center gap-1">
                  Select <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5 max-w-[120px] truncate">
                  {earlierAlternative.reason}
                </span>
              </div>
            </button>
          )}

          {laterAlternative && (
            <button
              type="button"
              onClick={() => {
                onSelectSlot(
                  laterAlternative.slot.time,
                  laterAlternative.recommendedArrival,
                  laterAlternative.expectedWaitMinutes
                );
                onProceedToConfirm();
              }}
              className="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/30 text-left transition-all flex items-center justify-between group shadow-2xs"
            >
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                  LATER
                </span>
                <div className="text-xl font-black text-slate-900 font-mono mt-1">
                  {laterAlternative.slot.time}
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Expected wait: <strong>{laterAlternative.expectedWaitMinutes} min</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Arrive: {laterAlternative.recommendedArrival}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-800 group-hover:underline inline-flex items-center gap-1">
                  Select <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5 max-w-[120px] truncate">
                  {laterAlternative.reason}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Section 6 & 22: Nearby Alternative Centre Recommendation */}
      {nearbyAlternativeCentre && (
        <div className="p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                <Building2 className="w-3.5 h-3.5" />
              </span>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-950">
                NEARBY ALTERNATIVE CENTRE
              </h4>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Less Queue
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-blue-200">
            <div>
              <div className="text-sm font-bold text-slate-900 font-display">
                {nearbyAlternativeCentre.centre.name}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                <span>Distance: <strong>{nearbyAlternativeCentre.distanceKm} km</strong></span>
                <span>•</span>
                <span>Waiting: <strong className="text-emerald-700">{nearbyAlternativeCentre.expectedWaitMinutes} min</strong></span>
              </div>
              <p className="text-xs text-slate-500 mt-1 italic">
                "{nearbyAlternativeCentre.reason}"
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSelectCentre) {
                  onSelectCentre(nearbyAlternativeCentre.centre.id);
                }
                onSelectSlot(
                  nearbyAlternativeCentre.slot.time,
                  schedulingService.calculateRecommendedArrival(nearbyAlternativeCentre.slot.time, 20),
                  nearbyAlternativeCentre.expectedWaitMinutes
                );
                onProceedToConfirm();
              }}
              className="py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              <span>Choose Nearby Centre</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Why-This-Slot Explainability Modal */}
      <WhyThisSlotModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
        recommendation={bestRecommendation}
        centreName={centre.name}
      />

      {/* What-If Slot Comparison Modal */}
      <WhatIfSlotComparison
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        slots={comparisonSlots}
        selectedSlotTime={selectedSlotTime}
        centreName={centre.name}
        onSelectSlot={(time, arrival, wait) => {
          onSelectSlot(time, arrival, wait);
        }}
      />
    </div>
  );
};
