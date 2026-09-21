import React, { useState } from 'react';
import {
  Ticket,
  QrCode,
  Clock,
  MapPin,
  CheckCircle2,
  Volume2,
  BellRing,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { QueueToken } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { DemoBadge } from '../../components/common/DemoBadge';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';

export interface FarmerTokenProps {
  token: QueueToken;
  onRefresh?: () => void;
}

export const FarmerToken: React.FC<FarmerTokenProps> = ({ token, onRefresh }) => {
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [isRefreshed, setIsRefreshed] = useState(false);

  const handleRefresh = () => {
    setIsRefreshed(true);
    setTimeout(() => setIsRefreshed(false), 800);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      <PageHeader
        title="Live Digital Token"
        description="Show this token at the entry gate and weighbridge checkpoint"
        badge={<DemoBadge type="data" />}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            icon={<RefreshCw className={`w-4 h-4 ${isRefreshed ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        }
      />

      {/* Main Token Pass */}
      <Card
        padding="none"
        className="overflow-hidden border-2 border-emerald-600 shadow-md bg-white"
      >
        {/* Header Ribbon */}
        <div className="bg-emerald-800 text-white p-5 text-center relative">
          <div className="flex items-center justify-between text-xs text-emerald-200 mb-1">
            <span className="font-semibold uppercase tracking-wider">Tamil Nadu Civil Supplies Corp</span>
            <span className="bg-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">GATE PASS</span>
          </div>
          <div className="py-2">
            <span className="text-xs text-emerald-100 font-medium">Digital Token Number</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-white my-1">
              {token.tokenCode}
            </h2>
            <p className="text-xs text-emerald-200">
              Valid for {token.slotTime} • Bay {token.bayNumber || 2}
            </p>
          </div>
        </div>

        {/* Token Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Status and Queue Position */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-xs text-slate-500 font-medium">Queue Position</span>
              <p className="text-2xl font-extrabold text-slate-900 font-display">
                #{token.queuePosition}
              </p>
              <span className="text-[11px] text-emerald-700 font-medium">2 ahead of you</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Estimated Wait</span>
              <p className="text-2xl font-extrabold text-amber-800 font-display">
                ~{token.estimatedWaitMinutes} min
              </p>
              <span className="text-[11px] text-slate-500">Fast clearance</span>
            </div>
          </div>

          {/* QR Code Simulation */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-dashed border-emerald-300 flex flex-col items-center text-center">
            <div className="w-36 h-36 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center">
              {/* SVG Styled QR Code Representation */}
              <div className="w-full h-full border-4 border-slate-900 p-1 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-7 h-7 bg-slate-900 border-2 border-white" />
                  <div className="w-7 h-7 bg-slate-900 border-2 border-white" />
                </div>
                <div className="grid grid-cols-5 gap-1 my-1 px-1">
                  <div className="h-2 bg-slate-900 rounded-xs" />
                  <div className="h-2 bg-slate-900 rounded-xs" />
                  <div className="h-2 bg-slate-900 rounded-xs" />
                  <div className="h-2 bg-slate-900 rounded-xs" />
                  <div className="h-2 bg-slate-900 rounded-xs" />
                </div>
                <div className="flex justify-between">
                  <div className="w-7 h-7 bg-slate-900 border-2 border-white" />
                  <div className="text-[9px] font-mono font-bold text-slate-900 flex items-center">
                    #TN204
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-800 mt-2.5">
              Scan at Weighbridge Scanner
            </p>
            <p className="text-[11px] text-slate-500">
              Works offline without active internet connection
            </p>
          </div>

          {/* Key Particulars */}
          <div className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Farmer Name</span>
              <strong className="text-slate-900">{token.farmerName}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Procurement Centre</span>
              <strong className="text-slate-900">{token.centreName}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Produce Details</span>
              <strong>{token.produceType}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Recommended Arrival</span>
              <strong className="text-emerald-800 font-semibold">{token.recommendedGateArrival}</strong>
            </div>
          </div>

          {/* Sound notification toggle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-xs font-semibold text-slate-800">Voice Gate Call Alert</p>
                <p className="text-[11px] text-slate-500">Play regional loudspeaker chime when called</p>
              </div>
            </div>
            <button
              onClick={() => setSoundAlerts(!soundAlerts)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                soundAlerts ? 'bg-emerald-700' : 'bg-slate-300'
              }`}
              aria-label="Toggle voice gate call alert"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  soundAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-200 text-center text-xs text-slate-500">
          <span>Backup SMS token dispatched to: <strong>+91 98401 23456</strong></span>
        </div>
      </Card>
    </div>
  );
};
