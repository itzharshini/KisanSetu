import React from 'react';
import {
  Users,
  Clock,
  ArrowRight,
  Play,
  FastForward,
  CheckCircle2,
  Ticket,
  AlertCircle,
  Scale,
  Bell,
  Building2,
  Sparkles,
  Info
} from 'lucide-react';
import { QueueToken } from '../../types';
import { DemoBadge } from '../common/DemoBadge';
import { queueService } from '../../services/queueService';
import { useKisanSetu } from '../../context/KisanSetuContext';

export interface QueueProgressProps {
  token: QueueToken;
  onSimulateNextFarmer?: () => void;
  onSimulateFiveMinutes?: () => void;
}

export const QueueProgress: React.FC<QueueProgressProps> = ({
  token,
  onSimulateNextFarmer,
  onSimulateFiveMinutes
}) => {
  const { stations, queueTokens, advanceSimulatedClock, processNextActiveFarmer } = useKisanSetu();

  const friendlyStatus = queueService.getHumanFriendlyStatus(
    token.status,
    token.assignedStation
  );

  // Active serving stations tokens
  const activeServing = stations
    .filter((s) => s.status === 'active' && s.currentTokenCode)
    .map((s) => `${s.currentTokenCode} at ${s.counterName}`);

  const servingLabel =
    activeServing.length > 0 ? activeServing.join(' • ') : 'Station Bays Ready';

  // Queue sequence from actual tokens
  const waitingOrServingTokens = queueTokens
    .filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
    .slice(0, 16);

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Real-time Dynamic Gate Pass Card */}
      <div className="rounded-3xl bg-white border-2 border-emerald-600/70 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-emerald-800 text-white p-5 text-center relative">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200">
            Official Gate Pass • {token.centreName}
          </span>
          <div className="py-2">
            <span className="text-xs text-emerald-100 font-medium">YOUR TOKEN NUMBER</span>
            <div className="text-5xl font-black text-white font-mono tracking-tight my-0.5">
              {token.tokenCode}
            </div>
            <p className="text-xs text-emerald-200">
              Scheduled: {token.slotTime} • Recommended Gate Arrival: {token.recommendedGateArrival}
            </p>
          </div>
        </div>

        {/* Live Operational Status Box */}
        <div className="p-5 space-y-4">
          {/* Main Status Headline */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
              token.status === 'CALLED'
                ? 'bg-emerald-100/80 border-emerald-500 text-emerald-950 ring-4 ring-emerald-300/40 animate-pulse'
                : token.status === 'COMPLETED'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : token.status === 'MISSED'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            {token.status === 'CALLED' ? (
              <Bell className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5 animate-bounce" />
            ) : token.status === 'COMPLETED' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            ) : token.status === 'MISSED' ? (
              <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            )}

            <div className="space-y-0.5">
              <h3 className="text-base font-black font-display leading-snug">
                {friendlyStatus.title}
              </h3>
              <p className="text-xs font-medium leading-relaxed opacity-90">
                {friendlyStatus.description}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 text-center">
            {/* Position / Ahead */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Ahead of You</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                {token.status === 'COMPLETED' ? 0 : token.farmersAhead}
              </div>
              <span className="text-[11px] text-slate-500">
                {token.farmersAhead === 0 ? 'You are being served' : 'farmers in line'}
              </span>
            </div>

            {/* Estimated Waiting */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Estimated Waiting</span>
              <div className="text-2xl font-black text-amber-800 font-display mt-0.5">
                {token.status === 'COMPLETED' ? '0 min' : `~${token.estimatedWaitMinutes} min`}
              </div>
              <span className="text-[11px] text-slate-500">
                {token.status === 'COMPLETED' ? 'Completed' : 'Intake pace ~11 min'}
              </span>
            </div>
          </div>

          {/* Currently Serving Broadcast */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Currently Serving:</span>
            <span className="font-mono font-bold text-slate-800 truncate ml-2">
              {servingLabel}
            </span>
          </div>

          {/* Queue Sequence Strip */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">
                Live Queue Sequence:
              </span>
              <span className="text-[11px] text-slate-400">Poonamallee Depot</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
              {waitingOrServingTokens.map((t) => {
                const isUserToken = t.tokenCode === token.tokenCode;
                const isServingNow = ['CALLED', 'IN_PROCESS', 'QUALITY_CHECK', 'WEIGHING', 'PROCUREMENT'].includes(
                  t.status
                );

                return (
                  <div
                    key={t.id}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex flex-col items-center justify-center ${
                      isUserToken
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-400 scale-105'
                        : isServingNow
                        ? 'bg-blue-100 text-blue-900 border-blue-300 ring-2 ring-blue-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{t.tokenCode}</span>
                    <span className="text-[9px] font-sans font-extrabold mt-0.5">
                      {isUserToken ? '⭐ YOU' : isServingNow ? 'SERVE' : 'WAIT'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Proximity Advisory */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              We will send immediate alerts when you have <strong>5</strong> and <strong>2</strong> farmers ahead.
              Keep your tractor trolley positioned near the weighbridge inbound gate.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 22 & 38: DEMO SIMULATION CONTROLS */}
      <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-extrabold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
            <DemoBadge type="mode" />
            <span>QUEUE CONTROLS</span>
          </span>
          <span className="text-[11px] text-slate-400">Progress queue in real-time</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSimulateNextFarmer || processNextActiveFarmer}
            disabled={token.status === 'COMPLETED'}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Process Next Farmer</span>
          </button>

          <button
            type="button"
            onClick={onSimulateFiveMinutes || (() => advanceSimulatedClock(5))}
            disabled={token.status === 'COMPLETED'}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-400" />
            <span>Advance 5 Minutes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
