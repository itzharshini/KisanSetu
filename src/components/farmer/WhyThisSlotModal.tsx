import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, Cpu, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { SlotRecommendation } from '../../types';

export interface WhyThisSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: SlotRecommendation;
  centreName: string;
}

export const WhyThisSlotModal: React.FC<WhyThisSlotModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  centreName
}) => {
  const [showTechnical, setShowTechnical] = useState(false);

  if (!isOpen) return null;

  const score = recommendation.score;
  const reasons = recommendation.reasons || [];
  const technical = recommendation.technicalExplanation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-white">
                Why was this slot recommended?
              </h3>
              <p className="text-xs text-emerald-200 font-medium">
                {centreName} • {recommendation.slot?.time || 'Selected Slot'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-700/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explainability Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Main farmer-friendly bullets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Procurement Factors Considered:
            </h4>
            <div className="space-y-2.5">
              {reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-slate-800 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 24: Technical / Operator Breakdown Toggle */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowTechnical(!showTechnical)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-slate-600" />
                <span>Operator & Technical Score Breakdown</span>
              </span>
              {showTechnical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTechnical && (
              <div className="mt-3 p-3.5 rounded-2xl bg-slate-900 text-slate-200 space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Composite Score</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {score.totalScore} / 100
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Queue Latency (28%):</span>
                    <span className="text-slate-100 font-bold">{score.queueScore} / 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Yard Capacity (24%):</span>
                    <span className="text-slate-100 font-bold">{score.capacityScore} / 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Travel & Distance (22%):</span>
                    <span className="text-slate-100 font-bold">{score.travelScore} / 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Processing Rate (16%):</span>
                    <span className="text-slate-100 font-bold">{score.processingScore} / 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Transport Fit (10%):</span>
                    <span className="text-slate-100 font-bold">{score.transportScore} / 100</span>
                  </div>
                </div>

                {technical && (
                  <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-300">
                    <div>{technical.queueBreakdown}</div>
                    <div>{technical.capacityBreakdown}</div>
                    <div>{technical.travelBreakdown}</div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-tight">
                  Normalized objective function balancing vehicle congestion, weighbridge throughput, and road transit time.
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-normal flex items-center justify-between">
            <span>Deterministic rule-based scheduling engine</span>
            <span className="font-bold text-slate-700">Demo Prediction</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
