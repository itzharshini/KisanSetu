import React, { useState } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Search,
  ScanLine,
  ArrowRight
} from 'lucide-react';
import { QueueToken } from '../../types';

interface ArrivalCheckInModalProps {
  tokens: QueueToken[];
  onClose: () => void;
  onCheckIn: (tokenCode: string) => {
    success: boolean;
    message: string;
    isEarly?: boolean;
    isLate?: boolean;
  };
}

export const ArrivalCheckInModal: React.FC<ArrivalCheckInModalProps> = ({
  tokens,
  onClose,
  onCheckIn
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  // Eligible tokens for check-in (Booked or not arrived yet)
  const unarrivedTokens = tokens.filter(
    (t) => t.arrivalStatus !== 'arrived' && t.status !== 'COMPLETED'
  );

  const handleSubmit = (codeToUse?: string) => {
    const code = (codeToUse || tokenInput).trim().toUpperCase();
    if (!code) {
      setFeedback({ type: 'error', message: 'Please enter a valid token number (e.g. A-148)' });
      return;
    }

    const res = onCheckIn(code);
    if (!res.success) {
      setFeedback({ type: 'error', message: res.message });
    } else if (res.isLate) {
      setFeedback({
        type: 'warning',
        message: `Checked In (Late): ${res.message}`
      });
      setTokenInput('');
    } else if (res.isEarly) {
      setFeedback({
        type: 'warning',
        message: `Checked In (Early): ${res.message}`
      });
      setTokenInput('');
    } else {
      setFeedback({
        type: 'success',
        message: `Token ${code} checked in successfully! Farmer has joined the waiting queue.`
      });
      setTokenInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Gate Arrival & Token Check-In
              </h2>
              <p className="text-xs text-slate-500">
                Scan farmer pass or enter token to admit into queue
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                : feedback.type === 'warning'
                ? 'bg-amber-50 border border-amber-300 text-amber-950'
                : 'bg-rose-50 border border-rose-200 text-rose-950'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : feedback.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            ) : (
              <X className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed font-medium">{feedback.message}</p>
          </div>
        )}

        {/* Manual Input Form */}
        <div className="space-y-2">
          <label htmlFor="token-code-input" className="text-xs font-bold text-slate-700 block">
            Scan Gate QR or Enter Token Code:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="token-code-input"
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                placeholder="e.g. A-148"
                className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ScanLine className="w-4 h-4" />
              <span>Check In</span>
            </button>
          </div>
        </div>

        {/* Quick Check-in for Today's Booked Arrivals */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Awaiting Gate Arrival ({unarrivedTokens.length})
          </span>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {unarrivedTokens.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                All booked farmers have reported to the gate.
              </div>
            ) : (
              unarrivedTokens.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-white flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-slate-800">{t.tokenCode}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-medium text-slate-700">{t.farmerName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Slot: {t.slotTime} ({t.quantityKg} kg {t.produceType})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubmit(t.tokenCode)}
                    className="py-1 px-2.5 rounded-lg bg-emerald-100/80 hover:bg-emerald-700 text-emerald-900 hover:text-white font-bold text-[11px] transition-colors"
                  >
                    Admit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
