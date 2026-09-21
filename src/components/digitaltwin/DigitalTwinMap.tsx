import React, { useState } from 'react';
import {
  Scale,
  Warehouse,
  Truck,
  ArrowDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  FileText,
  Pause,
  Play,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Info
} from 'lucide-react';
import {
  DigitalTwinZoneId,
  CentreZone,
  ProcessingStation,
  QueueToken,
  LoadingBayVehicle
} from '../../types';

export interface DigitalTwinMapProps {
  zones: Record<DigitalTwinZoneId, CentreZone>;
  stations: ProcessingStation[];
  queueTokens: QueueToken[];
  storageUsedKg: number;
  storageCapacityKg: number;
  vehicles: LoadingBayVehicle[];
  isPaused: boolean;
  activeBookingTokenCode?: string;
  onSelectZone: (zoneId: DigitalTwinZoneId) => void;
  onSelectToken: (token: QueueToken) => void;
  onSelectVehicle: (vehicle: LoadingBayVehicle) => void;
}

export const DigitalTwinMap: React.FC<DigitalTwinMapProps> = ({
  zones,
  stations,
  queueTokens,
  storageUsedKg,
  storageCapacityKg,
  vehicles,
  isPaused,
  activeBookingTokenCode = 'A-142',
  onSelectZone,
  onSelectToken,
  onSelectVehicle
}) => {
  const [zoomMode, setZoomMode] = useState<'normal' | 'compact'>('normal');

  const storagePercent = Math.min(100, Math.round((storageUsedKg / storageCapacityKg) * 100));

  const getStorageStatusText = (pct: number) => {
    if (pct >= 90) return 'Critical storage level. Evacuation urgent.';
    if (pct >= 75) return 'Storage space is getting limited.';
    return 'Storage space is currently sufficient.';
  };

  const getZoneStatusBadge = (status: CentreZone['status']) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Operational
          </span>
        );
      case 'busy':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Busy
          </span>
        );
      case 'attention':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-300">
            <AlertTriangle className="w-2.5 h-2.5" />
            Attention
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            Critical
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
            <Pause className="w-2.5 h-2.5" />
            Paused
          </span>
        );
    }
  };

  // Filter tokens for specific zones
  const waitingTokens = queueTokens.filter((t) => t.status === 'WAITING');
  const calledTokens = queueTokens.filter((t) => t.status === 'CALLED');
  const qualityTokens = queueTokens.filter((t) => t.status === 'QUALITY_CHECK');
  const procurementTokens = queueTokens.filter((t) => t.status === 'PROCUREMENT');
  const completedTokens = queueTokens.filter((t) => t.status === 'COMPLETED').slice(-4);

  // Helper to render an interactive farmer token pill
  const renderTokenPill = (token: QueueToken, isHighlightTarget?: boolean) => {
    const isCurrentFarmer = token.tokenCode === activeBookingTokenCode || isHighlightTarget;

    return (
      <button
        key={token.id || token.tokenCode}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelectToken(token);
        }}
        className={`group relative inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xs ${
          isCurrentFarmer
            ? 'bg-amber-400 text-slate-950 border-2 border-amber-600 ring-2 ring-amber-300 shadow-md font-extrabold animate-pulse'
            : 'bg-white text-slate-800 border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50'
        }`}
        title={`Click for token details: ${token.tokenCode} (${token.farmerName})`}
      >
        {isCurrentFarmer && <Sparkles className="w-3 h-3 text-amber-900 fill-amber-800" />}
        <span>{token.tokenCode}</span>
        {isCurrentFarmer && <span className="text-[9px] bg-amber-950 text-amber-200 px-1 rounded-sm uppercase tracking-wider">YOU</span>}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Map Action Toolbar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Depot Floorplan Live Twin
          </span>
          <span className="hidden sm:inline-block text-slate-400">•</span>
          <span className="hidden sm:inline-block text-slate-600">
            Interactive 2D Spatial Layout
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom / View mode toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setZoomMode('normal')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                zoomMode === 'normal'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Standard</span>
            </button>
            <button
              type="button"
              onClick={() => setZoomMode('compact')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                zoomMode === 'compact'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ZoomOut className="w-3.5 h-3.5" />
              <span>Compact</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 hidden md:block">
            Click any zone or token to inspect
          </div>
        </div>
      </div>

      {/* Paused Procurement Banner */}
      {isPaused && (
        <div className="px-4 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <Pause className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>PROCUREMENT TEMPORARILY PAUSED — INBOUND ADMISSIONS SUSPENDED</span>
          </div>
          <span className="text-[11px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded font-mono">
            ACTIVE WEIGHMENTS FINISHING
          </span>
        </div>
      )}

      {/* Main Floorplan Container */}
      <div className={`p-3 sm:p-5 space-y-3 bg-[#F8FAFC] transition-all ${zoomMode === 'compact' ? 'space-y-2' : 'space-y-3.5'}`}>
        
        {/* ======================================================== */}
        {/* 1. ENTRY GATE & INBOUND LANE */}
        {/* ======================================================== */}
        <div
          onClick={() => onSelectZone('ENTRY')}
          className="cursor-pointer group relative bg-white rounded-xl border-2 border-slate-300 hover:border-emerald-500 hover:shadow-md transition-all p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>ENTRY GATE & SECURITY BARRIER</span>
                </h4>
                <p className="text-[11px] text-slate-500">Inbound lane check-in & barcode token validation</p>
              </div>
            </div>
            {getZoneStatusBadge(zones.ENTRY.status)}
          </div>

          <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg p-2 border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-medium">
                Inbound Tractors: <strong className="text-slate-900 font-bold">{zones.ENTRY.currentLoad}</strong>
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">
                Gate Officer: <strong className="text-slate-800">M. Natarajan</strong>
              </span>
            </div>
            <span className="text-[11px] text-emerald-800 font-semibold group-hover:underline">
              Inspect Gate Details →
            </span>
          </div>
        </div>

        {/* Direction Indicator */}
        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>

        {/* ======================================================== */}
        {/* 2. WAITING AREA (FARMER HOLDING YARD) */}
        {/* ======================================================== */}
        <div
          onClick={() => onSelectZone('WAITING')}
          className={`cursor-pointer group relative bg-white rounded-xl border-2 hover:shadow-md transition-all p-3.5 ${
            waitingTokens.length > 15 ? 'border-amber-400 bg-amber-50/20' : 'border-slate-300 hover:border-emerald-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>WAITING AREA (FARMER HOLDING YARD)</span>
                  <span className="text-xs font-normal text-slate-500">({waitingTokens.length} vehicles parked)</span>
                </h4>
                <p className="text-[11px] text-slate-500">Shaded tractor bays with live token audio broadcast</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getZoneStatusBadge(zones.WAITING.status)}
            </div>
          </div>

          {/* Tokens list inside waiting area */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Farmers Waiting In Yard</span>
              <span className="text-emerald-700 font-medium">Click token to inspect</span>
            </div>
            {waitingTokens.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {waitingTokens.map((token) => renderTokenPill(token))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-1">No farmers currently waiting in holding yard.</div>
            )}
          </div>
        </div>

        {/* Direction Indicator */}
        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* ======================================================== */}
        {/* 3 & 4. QUALITY INSPECTION LAB + TOKEN CHECK-IN DESK */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Quality Inspection */}
          <div
            onClick={() => onSelectZone('QUALITY')}
            className="cursor-pointer group bg-white rounded-xl border-2 border-slate-300 hover:border-emerald-500 hover:shadow-md transition-all p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                  3A
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-xs sm:text-sm">
                    QUALITY INSPECTION LAB
                  </h4>
                  <p className="text-[10px] text-slate-500">Digital Moisture ≤ 17.0% & FAQ Grading</p>
                </div>
              </div>
              {getZoneStatusBadge(zones.QUALITY.status)}
            </div>

            <div className="bg-purple-50/50 rounded-lg p-2.5 border border-purple-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-purple-900 font-medium">Active Samples:</span>
                <span className="font-bold text-purple-950">{qualityTokens.length} active</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {qualityTokens.length > 0 ? (
                  qualityTokens.map((token) => renderTokenPill(token))
                ) : (
                  <span className="text-[11px] text-slate-500 italic">No samples in test</span>
                )}
              </div>
            </div>
          </div>

          {/* Token Check-in Desk */}
          <div
            onClick={() => onSelectZone('CHECK_IN')}
            className="cursor-pointer group bg-white rounded-xl border-2 border-slate-300 hover:border-emerald-500 hover:shadow-md transition-all p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                  3B
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-xs sm:text-sm">
                    TOKEN CHECK-IN & DISPATCH
                  </h4>
                  <p className="text-[10px] text-slate-500">BarcodeInput & Weighbridge Lane Routing</p>
                </div>
              </div>
              {getZoneStatusBadge(zones.CHECK_IN.status)}
            </div>

            <div className="bg-indigo-50/50 rounded-lg p-2.5 border border-indigo-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-indigo-900 font-medium">Recently Called:</span>
                <span className="font-bold text-indigo-950">{calledTokens.length} called</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {calledTokens.length > 0 ? (
                  calledTokens.map((token) => renderTokenPill(token))
                ) : (
                  <span className="text-[11px] text-slate-500 italic">Ready to call next farmer</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Direction Indicator */}
        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* ======================================================== */}
        {/* 5. WEIGHING STATIONS (BAYS 1, 2, 3, 4) */}
        {/* ======================================================== */}
        <div
          onClick={() => onSelectZone('WEIGHING')}
          className="cursor-pointer group bg-white rounded-xl border-2 border-slate-300 hover:border-emerald-500 hover:shadow-md transition-all p-3.5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <span>WEIGHING STATIONS & WEIGHBRIDGES</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {stations.filter((s) => s.status === 'active').length} of {stations.length} bays currently active
                </p>
              </div>
            </div>
            {getZoneStatusBadge(zones.WEIGHING.status)}
          </div>

          {/* 4 Weighing Stations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {stations.map((st) => {
              const isProcessing = st.status === 'active' && !!st.currentTokenCode;
              const isAvailable = st.status === 'active' && !st.currentTokenCode;
              const isPaused = st.status === 'paused';
              const isMaintenance = st.status === 'maintenance' || st.status === 'closed';

              const activeTokenObj = queueTokens.find((t) => t.tokenCode === st.currentTokenCode);

              return (
                <div
                  key={st.id}
                  className={`rounded-lg p-3 border transition-all ${
                    isProcessing
                      ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
                      : isAvailable
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : isPaused
                      ? 'bg-slate-100 border-slate-300'
                      : 'bg-slate-50 border-dashed border-slate-300 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-display font-bold text-slate-900 text-xs">
                      Station {st.number}
                    </span>
                    {isProcessing && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                        Processing
                      </span>
                    )}
                    {isAvailable && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-900 bg-emerald-200/80 px-1.5 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Available
                      </span>
                    )}
                    {isPaused && (
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                        Paused
                      </span>
                    )}
                    {isMaintenance && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                        Idle / Off
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] space-y-1">
                    <div className="text-slate-600">{st.counterName}</div>
                    {isProcessing && activeTokenObj ? (
                      <div className="pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Active Token:</span>
                          {renderTokenPill(activeTokenObj)}
                        </div>
                        <div className="text-[10px] text-slate-700 mt-1 truncate">
                          {activeTokenObj.farmerName} • {activeTokenObj.quantityKg} kg
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 pt-1">
                        {isAvailable ? 'Ready for next tractor' : 'Station idle'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Direction Indicator */}
        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* ======================================================== */}
        {/* 6. PROCUREMENT AREA & DIGITAL PAYOUT COUNTER */}
        {/* ======================================================== */}
        <div
          onClick={() => onSelectZone('PROCUREMENT')}
          className="cursor-pointer group bg-white rounded-xl border-2 border-slate-300 hover:border-emerald-500 hover:shadow-md transition-all p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-700" />
                  <span>PROCUREMENT INTAKE COUNTER & WEIGHMENT SLIPS</span>
                </h4>
                <p className="text-[11px] text-slate-500">Net produce calculation, DBT verification & receipt print</p>
              </div>
            </div>
            {getZoneStatusBadge(zones.PROCUREMENT.status)}
          </div>

          <div className="bg-teal-50/50 rounded-lg p-2.5 border border-teal-100 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-teal-900 font-medium">In Final Intake:</span>
              <div className="flex gap-1">
                {procurementTokens.length > 0 ? (
                  procurementTokens.map((token) => renderTokenPill(token))
                ) : (
                  <span className="text-[11px] text-slate-500 italic">Processing sequentially</span>
                )}
              </div>
            </div>
            <div className="text-[11px] text-teal-900">
              Govt MSP: <strong className="font-mono font-bold">₹2,320 / Qtl</strong> (Paddy Common)
            </div>
          </div>
        </div>

        {/* Direction Indicator */}
        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* ======================================================== */}
        {/* 7. STORAGE AREA (COVERED GODOWN & GRAIN BINS) */}
        {/* ======================================================== */}
        <div
          onClick={() => onSelectZone('STORAGE')}
          className={`cursor-pointer group bg-white rounded-xl border-2 hover:shadow-md transition-all p-3.5 ${
            storagePercent >= 90
              ? 'border-rose-400 bg-rose-50/20'
              : storagePercent >= 75
              ? 'border-amber-400 bg-amber-50/20'
              : 'border-slate-300 hover:border-emerald-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                6
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-amber-800" />
                  <span>STORAGE AREA (COVERED GODOWN)</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {storagePercent}% Capacity
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">Gunny bag stacking sheds & moisture-controlled grain bins</p>
              </div>
            </div>
            {getZoneStatusBadge(zones.STORAGE.status)}
          </div>

          {/* Large Capacity Bar */}
          <div className="space-y-1.5 mb-3">
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  storagePercent >= 90
                    ? 'bg-rose-600'
                    : storagePercent >= 75
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${storagePercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600">
                Used: <strong className="text-slate-900">{(storageUsedKg / 1000).toFixed(1)}k kg</strong>
              </span>
              <span className="text-slate-600">
                Available: <strong className="text-slate-900">{((storageCapacityKg - storageUsedKg) / 1000).toFixed(1)}k kg</strong>
              </span>
              <span className="text-slate-600">
                Total Ceiling: <strong className="text-slate-900">{(storageCapacityKg / 1000).toFixed(1)}k kg</strong>
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-700 font-medium">
                {getStorageStatusText(storagePercent)}
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold group-hover:underline">
              Inspect Godown Details →
            </span>
          </div>
        </div>

        {/* Direction Indicator */}
        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* ======================================================== */}
        {/* 8. LOADING BAY & VEHICLES */}
        {/* ======================================================== */}
        <div
          onClick={() => onSelectZone('LOADING')}
          className="cursor-pointer group bg-white rounded-xl border-2 border-slate-300 hover:border-emerald-500 hover:shadow-md transition-all p-3.5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                7
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>LOADING BAY & DISPATCH VEHICLES</span>
                </h4>
                <p className="text-[11px] text-slate-500">Bulk grain evacuation trucks heading to FCI Silos & Mills</p>
              </div>
            </div>
            {getZoneStatusBadge(zones.LOADING.status)}
          </div>

          {/* Vehicles List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {vehicles.map((veh) => (
              <div
                key={veh.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVehicle(veh);
                }}
                className="bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-400 rounded-lg p-2.5 transition-all cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between font-mono font-bold text-slate-900 mb-1">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-slate-600" />
                    {veh.plateNumber}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      veh.status === 'Loading'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : veh.status === 'Waiting'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : veh.status === 'Departing'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {veh.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">{veh.type}</div>
                <div className="text-[10px] text-slate-600 mt-1 truncate">
                  To: <span className="font-medium text-slate-800">{veh.destination}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direction Indicator */}
        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* ======================================================== */}
        {/* 9. EXIT GATE */}
        {/* ======================================================== */}
        <div
          onClick={() => onSelectZone('EXIT')}
          className="cursor-pointer group bg-white rounded-xl border-2 border-slate-300 hover:border-emerald-500 hover:shadow-md transition-all p-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                8
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm">
                  EXIT GATE & TARE OUTBOUND BARRIER
                </h4>
                <p className="text-[11px] text-slate-500">Tare scale clearance, digital receipt delivery & depot departure</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-800">
                {zones.EXIT.currentLoad} Completed Today
              </span>
              {getZoneStatusBadge(zones.EXIT.status)}
            </div>
          </div>
        </div>

      </div>

      {/* Accessible Map Legend */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap font-medium">
          <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Legend:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Available / Operational</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Processing / Busy</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Expected / Waiting</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>Attention Load</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Critical Bottleneck</span>
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Poonamallee Depot ID: <strong className="text-slate-800 font-bold">PC-TN-04</strong>
        </div>
      </div>
    </div>
  );
};
