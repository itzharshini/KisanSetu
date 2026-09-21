import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileCheck,
  Building2,
  Clock,
  User,
  ArrowRight,
  ShieldCheck,
  Printer,
  ChevronRight
} from 'lucide-react';
import { QueueToken, TokenStatus } from '../../types';

interface FarmerProcessingModalProps {
  token: QueueToken;
  onClose: () => void;
  onAdvanceStage: (tokenId: string) => void;
  onCompleteProcurement: (tokenId: string) => void;
  onMarkNoShow: (tokenId: string) => void;
}

export const FarmerProcessingModal: React.FC<FarmerProcessingModalProps> = ({
  token,
  onClose,
  onAdvanceStage,
  onCompleteProcurement,
  onMarkNoShow
}) => {
  const [showNoShowConfirm, setShowNoShowConfirm] = useState(false);
  const [qualityDeduction, setQualityDeduction] = useState(false);

  const stages: { key: TokenStatus; label: string; desc: string }[] = [
    { key: 'CALLED', label: '1. Called to Bay', desc: 'Farmer notified to proceed to counter' },
    { key: 'IN_PROCESS', label: '2. Intake Initiated', desc: 'Vehicle positioned at station bay' },
    { key: 'QUALITY_CHECK', label: '3. Quality & Moisture', desc: 'Grain sampling & grading' },
    { key: 'WEIGHING', label: '4. Weighbridge', desc: 'Gross & Tare weighment' },
    { key: 'PROCUREMENT', label: '5. Warehouse Intake', desc: 'Unloading & receipt generation' },
    { key: 'COMPLETED', label: '6. Completed', desc: 'Finished with digital receipt' }
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === token.status);
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 1;

  const handleAdvance = () => {
    if (token.status === 'PROCUREMENT') {
      onCompleteProcurement(token.id);
    } else {
      onAdvanceStage(token.id);
    }
  };

  const grossKg = token.quantityKg + 1850; // Truck + produce
  const tareKg = 1850;
  const netKg = token.quantityKg;
  const mspRate = 23.2;
  const totalAmount = Math.round(netKg * mspRate);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black font-mono text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg">
                {token.tokenCode}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Intake Desk • {token.assignedStation || 'Counter 2'}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 font-display mt-1">
              {token.farmerName}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {token.farmerVillage || 'Thiruvallur'} • {token.farmerPhone || '+91 98400 00000'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Progress Tracker */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Procurement Pipeline Stage
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {stages.map((stage, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div
                  key={stage.key}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/30'
                      : isPast
                      ? 'border-slate-200 bg-slate-50 text-slate-600 font-medium'
                      : 'border-slate-100 bg-white text-slate-400 opacity-60'
                  }`}
                >
                  <span className="text-[10px] block font-mono">Step {idx + 1}</span>
                  <span className="text-[11px] font-bold leading-tight block truncate">
                    {stage.key.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Stage Details Card */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Produce Declared:</span>
            <span className="font-bold text-slate-900">
              {token.produceType} • {token.quantityKg.toLocaleString('en-IN')} kg ({(token.quantityKg / 100).toFixed(1)} Quintals)
            </span>
          </div>

          {/* QUALITY CHECK DETAILS */}
          {(token.status === 'QUALITY_CHECK' || activeIndex >= 2) && (
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Quality Lab Assessment</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  FAQ GRADE A
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Moisture</span>
                  <span className="font-bold text-slate-800">14.2%</span>
                  <span className="text-[9px] text-emerald-700 block">≤17% PASS</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Foreign Matter</span>
                  <span className="font-bold text-slate-800">1.1%</span>
                  <span className="text-[9px] text-emerald-700 block">≤2% PASS</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Damaged/Discolor</span>
                  <span className="font-bold text-slate-800">0.8%</span>
                  <span className="text-[9px] text-emerald-700 block">≤5% PASS</span>
                </div>
              </div>
            </div>
          )}

          {/* WEIGHBRIDGE METRICS */}
          {(token.status === 'WEIGHING' || token.status === 'PROCUREMENT' || token.status === 'COMPLETED') && (
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-purple-600" />
                  <span>Electronic Weighbridge Reading</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Calibrated: Today 06:00 AM</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Gross Weight</span>
                  <span className="font-bold text-slate-800 font-mono">{grossKg} kg</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-400 block text-[10px]">Tare (Vehicle)</span>
                  <span className="font-bold text-slate-800 font-mono">{tareKg} kg</span>
                </div>
                <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
                  <span className="text-purple-700 block text-[10px] font-bold">Net Procured</span>
                  <span className="font-black text-purple-950 font-mono text-sm">{netKg} kg</span>
                </div>
              </div>
            </div>
          )}

          {/* PROCUREMENT PAYOUT CALCULATION */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-600 font-medium">Govt MSP Value (₹2,320 / quintal):</span>
            <span className="text-sm font-black text-emerald-900 font-mono">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Operational Actions */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={handleAdvance}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <span>
                {token.status === 'PROCUREMENT'
                  ? 'Complete Procurement & Generate Slip'
                  : `Advance to Next Stage (${stages[activeIndex + 1]?.label || 'Next'})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onCompleteProcurement(token.id)}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors"
            >
              Quick Complete
            </button>
          </div>

          {/* Secondary Controls: No-Show & Quality Issue */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            {!showNoShowConfirm ? (
              <button
                type="button"
                onClick={() => setShowNoShowConfirm(true)}
                className="text-rose-700 hover:text-rose-900 font-semibold hover:underline"
              >
                Mark Farmer No-Show
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-50 p-2 rounded-xl border border-rose-200">
                <span className="text-[11px] text-rose-900 font-bold">Confirm No-Show?</span>
                <button
                  type="button"
                  onClick={() => {
                    onMarkNoShow(token.id);
                    onClose();
                  }}
                  className="py-1 px-2 rounded-lg bg-rose-700 text-white text-[10px] font-bold"
                >
                  Yes, Move to Missed
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoShowConfirm(false)}
                  className="py-1 px-2 rounded-lg bg-white border text-slate-600 text-[10px]"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setQualityDeduction(!qualityDeduction)}
              className="text-slate-500 hover:text-slate-800 text-[11px] font-medium"
            >
              {qualityDeduction ? '✓ Deduction Applied' : '+ Record Moisture Deduction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
