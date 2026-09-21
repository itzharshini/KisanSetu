import React from 'react';
import {
  X,
  User,
  Phone,
  Package,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { QueueToken, TokenStatus } from '../../types';
import { Button } from '../common/Button';

export interface TokenDetailModalProps {
  token: QueueToken | null;
  activeBookingTokenCode?: string;
  onClose: () => void;
  onAdvanceStage?: (tokenId: string) => void;
  onCallToken?: (token: QueueToken) => void;
  onMarkNoShow?: (tokenId: string) => void;
}

const STAGES: { key: TokenStatus; label: string }[] = [
  { key: 'WAITING', label: 'Holding Yard' },
  { key: 'CALLED', label: 'Called to Bay' },
  { key: 'QUALITY_CHECK', label: 'Quality Lab' },
  { key: 'WEIGHING', label: 'Electronic Scale' },
  { key: 'PROCUREMENT', label: 'Digital Intake' },
  { key: 'COMPLETED', label: 'Dispatched' }
];

export const TokenDetailModal: React.FC<TokenDetailModalProps> = ({
  token,
  activeBookingTokenCode = 'A-142',
  onClose,
  onAdvanceStage,
  onCallToken,
  onMarkNoShow
}) => {
  if (!token) return null;

  const isCurrentFarmer = token.tokenCode === activeBookingTokenCode;
  const currentStageIndex = STAGES.findIndex((s) => s.key === token.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg text-emerald-950 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
              {token.tokenCode}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-bold text-slate-900 text-sm">
                  {token.farmerName}
                </h3>
                {isCurrentFarmer && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                    <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                    Current User
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">{token.farmerPhone}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Stage Progress Stepper */}
          <div>
            <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px] block mb-2">
              Procurement Lifecycle Progress
            </span>
            <div className="grid grid-cols-6 gap-1 text-center">
              {STAGES.map((st, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div key={st.key} className="space-y-1">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCurrent
                          ? 'bg-amber-500 ring-2 ring-amber-300'
                          : isPassed
                          ? 'bg-emerald-600'
                          : 'bg-slate-200'
                      }`}
                    />
                    <span
                      className={`text-[9px] block leading-tight font-medium ${
                        isCurrent
                          ? 'text-amber-900 font-bold'
                          : isPassed
                          ? 'text-emerald-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Produce:</span>
              <strong className="text-slate-900 font-semibold">{token.produceType}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Quantity:</span>
              <strong className="text-slate-900 font-semibold">{token.quantityKg} kg ({token.bagsCount} Gunny Bags)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Booked Slot:</span>
              <span className="text-slate-800 font-medium">{token.slotTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Arrival Time:</span>
              <span className="text-slate-800 font-medium">{token.arrivalTime}</span>
            </div>
            {token.assignedStationNumber && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Assigned Bay:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Station {token.assignedStationNumber}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Est. Wait:</span>
              <span className="font-bold text-slate-800">{token.estimatedWaitMinutes} mins</span>
            </div>
          </div>

          {/* Priority or Notes */}
          {token.priorityReason && (
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Priority Note: {token.priorityReason}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {token.status === 'WAITING' && onCallToken && (
              <Button size="sm" onClick={() => { onCallToken(token); onClose(); }}>
                Call to Bay →
              </Button>
            )}
            {token.status !== 'COMPLETED' && token.status !== 'CANCELLED' && onAdvanceStage && (
              <Button size="sm" onClick={() => { onAdvanceStage(token.id); onClose(); }}>
                Advance Next Stage
              </Button>
            )}
            {token.status === 'CALLED' && onMarkNoShow && (
              <Button
                variant="outline"
                size="sm"
                className="text-rose-700 hover:bg-rose-50 border-rose-200"
                onClick={() => { onMarkNoShow(token.id); onClose(); }}
              >
                No Show
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
