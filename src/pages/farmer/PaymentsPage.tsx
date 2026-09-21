import React from 'react';
import { IndianRupee, CheckCircle2, Clock, Landmark, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DemoBadge } from '../../components/common/DemoBadge';
import { useKisanSetu } from '../../context/KisanSetuContext';

export const PaymentsPage: React.FC = () => {
  const { payments, farmer } = useKisanSetu();

  const totalDisbursed = payments
    .filter((p) => p.status === 'Completed')
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === 'Processing')
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Direct Benefit Transfer (DBT) Payments
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Transparent tracking of MSP payments credited directly to Aadhaar-linked bank account
          </p>
        </div>
        <DemoBadge type="mode" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white border-2 border-emerald-600/40 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Paid (This Season)</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
            ₹{totalDisbursed.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold mt-0.5 block">
            ✓ 100% Credited via PFMS DBT
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Under Processing</span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 font-display mt-1">
            ₹{pendingAmount.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            Expected 24-48 hrs after weighment
          </span>
        </div>
      </div>

      {/* Linked Bank Card */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Landmark className="w-5 h-5 text-emerald-800 shrink-0" />
          <div>
            <span className="font-bold text-emerald-950 block">Linked Bank Account:</span>
            <span className="text-emerald-800 font-mono">{farmer.bankAccountMasked}</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900">
          Aadhaar Seeded
        </span>
      </div>

      {/* Payment History */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Payment Transactions
        </h2>

        {payments.map((p) => (
          <div
            key={p.id}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{p.produceType}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ref: {p.bookingRef} • Weight: {p.quantityKg} kg
                </p>
              </div>

              <div className="text-right">
                <span className="text-lg sm:text-xl font-black font-display text-slate-900">
                  ₹{p.amount.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 block">{p.date}</span>
              </div>
            </div>

            {p.utrNumber && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>UTR: {p.utrNumber}</span>
                <span className="text-emerald-700 font-sans font-semibold">Bank Cleared</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
