import React from 'react';
import {
  X,
  Users,
  Clock,
  Activity,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { CentreZone } from '../../types';
import { Button } from '../common/Button';

export interface ZoneDetailModalProps {
  zone: CentreZone | null;
  onClose: () => void;
  onCallFarmer?: () => void;
  onOpenStation?: () => void;
  onRequestTransport?: () => void;
}

export const ZoneDetailModal: React.FC<ZoneDetailModalProps> = ({
  zone,
  onClose,
  onCallFarmer,
  onOpenStation,
  onRequestTransport
}) => {
  if (!zone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4 text-emerald-800" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">
                {zone.name}
              </h3>
              <p className="text-xs text-slate-500">Zone ID: {zone.id} • Live Operational Metrics</p>
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
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {zone.description}
          </p>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Current Load</span>
              <span className="font-display font-bold text-base text-slate-900">
                {zone.currentLoad}
              </span>
              <span className="text-[10px] text-slate-500 block">
                / {zone.capacity} capacity
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Avg Time</span>
              <span className="font-display font-bold text-base text-slate-900">
                {zone.avgProcessingTimeMinutes}m
              </span>
              <span className="text-[10px] text-slate-500 block">per intake</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Depot Staff</span>
              <span className="font-display font-bold text-base text-slate-900">
                {zone.staffCount}
              </span>
              <span className="text-[10px] text-slate-500 block">officers on duty</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Zone Status</span>
              <span className="font-bold text-xs capitalize text-emerald-800 block mt-1">
                {zone.status}
              </span>
              <span className="text-[10px] text-slate-500 block">live telemetry</span>
            </div>
          </div>

          {/* Sub Units List */}
          {zone.subUnits && zone.subUnits.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Assigned Operational Bays & Units
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {zone.subUnits.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-slate-900 font-semibold">{sub.name}</strong>
                      {sub.assignedToken && (
                        <span className="ml-2 font-mono text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          Token {sub.assignedToken}
                        </span>
                      )}
                    </div>
                    <span className="capitalize text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Action recommendation */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Recommended Zone Action</strong>
              <span>
                {zone.id === 'WEIGHING' && 'High queue intake detected. Consider opening Station 4 if wait exceeds 25m.'}
                {zone.id === 'WAITING' && 'Holding yard is orderly. Call next token to maintain steady weighbridge throughput.'}
                {zone.id === 'STORAGE' && 'Warehouse godown is filling up. Schedule additional evacuation trucks to avoid blockage.'}
                {zone.id === 'LOADING' && 'Dispatch waiting transport vehicles promptly once full.'}
                {zone.id === 'ENTRY' && 'Inbound traffic flowing normally without trunk road spillover.'}
                {zone.id === 'CHECK_IN' && 'Ensure barcode scanner calibration is maintained.'}
                {zone.id === 'QUALITY' && 'Moisture meter calibrated for Paddy Grade A.'}
                {zone.id === 'EXIT' && 'Ensure digital weighment slip confirmation SMS is dispatched.'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {zone.id === 'WAITING' && onCallFarmer && (
              <Button size="sm" onClick={() => { onCallFarmer(); onClose(); }}>
                Call Next Farmer →
              </Button>
            )}
            {zone.id === 'WEIGHING' && onOpenStation && (
              <Button size="sm" onClick={() => { onOpenStation(); onClose(); }}>
                Open Station 4
              </Button>
            )}
            {zone.id === 'STORAGE' && onRequestTransport && (
              <Button size="sm" onClick={() => { onRequestTransport(); onClose(); }}>
                Request Evacuation Fleet
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
