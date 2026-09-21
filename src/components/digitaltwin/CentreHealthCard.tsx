import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { CentreHealthScore } from '../../types';

export interface CentreHealthCardProps {
  health: CentreHealthScore;
}

export const CentreHealthCard: React.FC<CentreHealthCardProps> = ({ health }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const getStatusStyle = (status: CentreHealthScore['statusLabel']) => {
    switch (status) {
      case 'Healthy':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          indicator: 'bg-emerald-500'
        };
      case 'Moderate Attention':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-950',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          indicator: 'bg-amber-500'
        };
      case 'High Stress':
      case 'Critical Bottleneck':
      default:
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          text: 'text-rose-950',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          indicator: 'bg-rose-500'
        };
    }
  };

  const style = getStatusStyle(health.statusLabel);

  return (
    <div className={`rounded-2xl border p-4 transition-all shadow-xs ${style.bg} ${style.border}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
            <Activity className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-slate-900 text-sm">
                Centre Health Score
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.badge}`}>
                {health.statusLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Deterministic composite metric: queue, bays, storage & fleet
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono font-extrabold text-2xl text-slate-900 leading-none">
            {health.overall}
            <span className="text-xs font-normal text-slate-500"> / 100</span>
          </div>
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-[11px] font-semibold text-emerald-800 hover:underline inline-flex items-center gap-0.5 mt-1"
          >
            <span>{showBreakdown ? 'Hide Breakdown' : 'Explain Score'}</span>
            {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {health.bottleneckFactor && (
        <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-white/70 border border-slate-200/80 text-[11px] text-slate-700 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Primary Strain Factor: <strong>{health.bottleneckFactor}</strong></span>
        </div>
      )}

      {/* Transparent Breakdown */}
      {showBreakdown && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 text-xs animate-fadeIn">
          <div className="text-[11px] text-slate-600 mb-1">
            Evaluated deterministically across four operational dimensions:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Queue & Wait Pacing (35%):</span>
              <strong className="font-mono font-bold text-slate-900">{health.queueHealth} / 100</strong>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Weighbridge Capacity (25%):</span>
              <strong className="font-mono font-bold text-slate-900">{health.capacityHealth} / 100</strong>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Storage Availability (25%):</span>
              <strong className="font-mono font-bold text-slate-900">{health.storageHealth} / 100</strong>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Evacuation Transport (15%):</span>
              <strong className="font-mono font-bold text-slate-900">{health.transportHealth} / 100</strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Scores ≥ 85 indicate optimal intake pacing; &lt; 70 triggers autonomous dispatch recommendations.</span>
          </div>
        </div>
      )}
    </div>
  );
};
