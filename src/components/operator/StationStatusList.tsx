import React, { useState } from 'react';
import {
  Server,
  Scale,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  Clock,
  User,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ProcessingStation, TokenStatus } from '../../types';

interface StationStatusListProps {
  stations: ProcessingStation[];
  onOpenStation: () => void;
  onCloseStation: (stationId: string) => { success: boolean; message: string };
  onSelectStationToken?: (tokenId: string) => void;
}

export const StationStatusList: React.FC<StationStatusListProps> = ({
  stations,
  onOpenStation,
  onCloseStation,
  onSelectStationToken
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeCount = stations.filter((s) => s.status === 'active').length;
  const totalCount = stations.length;

  const handleClose = (stationId: string) => {
    setErrorMessage(null);
    const result = onCloseStation(stationId);
    if (!result.success) {
      setErrorMessage(result.message);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const getStageBadge = (stage?: TokenStatus) => {
    switch (stage) {
      case 'CALLED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">CALLED</span>;
      case 'IN_PROCESS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">PROCESSING</span>;
      case 'QUALITY_CHECK':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-300">QUALITY CHECK</span>;
      case 'WEIGHING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300">WEIGHING</span>;
      case 'PROCUREMENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">INTAKE</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">ACTIVE</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Weighbridge & Processing Stations
            </h3>
            <p className="text-xs text-slate-500">
              {activeCount} of {totalCount} stations currently operational • Avg intake 11m/truck
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stations.some((s) => s.status !== 'active') && (
            <button
              type="button"
              onClick={onOpenStation}
              className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Open Station</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Error Notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Station Operation Restricted</p>
            <p className="text-[11px] text-rose-800">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stations.map((st) => {
          const isActive = st.status === 'active';
          const isOccupied = isActive && !!st.currentTokenId;

          return (
            <div
              key={st.id}
              className={`rounded-2xl border p-3.5 transition-all space-y-3 flex flex-col justify-between ${
                isActive
                  ? isOccupied
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-300 bg-white'
                  : 'border-slate-200 bg-slate-50/80 opacity-75'
              }`}
            >
              <div>
                {/* Station Title & Status */}
                <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-200/70">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-xs font-black text-slate-900 font-mono">
                      {st.counterName}
                    </span>
                  </div>
                  {isActive ? (
                    isOccupied ? (
                      getStageBadge(st.processingStage)
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        IDLE / READY
                      </span>
                    )
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                      CLOSED
                    </span>
                  )}
                </div>

                {/* Subtitle / Station Type */}
                <p className="text-[11px] text-slate-500 font-medium truncate pt-1">
                  {st.name}
                </p>

                {/* Current Processing Farmer */}
                {isActive && isOccupied ? (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-emerald-200/80 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">Token:</span>
                      <span className="text-sm font-black font-mono text-emerald-900 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                        {st.currentTokenCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 truncate">{st.currentFarmerName}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{st.startedAt}</span>
                    </div>
                    {st.currentProduce && (
                      <p className="text-[10px] text-slate-600 font-semibold truncate pt-0.5">
                        {st.currentProduce}
                      </p>
                    )}

                    {onSelectStationToken && st.currentTokenId && (
                      <button
                        type="button"
                        onClick={() => onSelectStationToken(st.currentTokenId!)}
                        className="w-full mt-1 py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Manage Process</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : isActive ? (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-100/70 border border-dashed border-slate-300 text-center">
                    <span className="text-xs text-slate-500 font-medium block">
                      Ready for next farmer
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      Available for Intake
                    </span>
                  </div>
                ) : (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-100/50 border border-slate-200 text-center">
                    <span className="text-xs text-slate-400 font-medium block">
                      Station is offline
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Open to reduce wait time
                    </span>
                  </div>
                )}
              </div>

              {/* Station Action Footer */}
              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                {isActive ? (
                  <button
                    type="button"
                    onClick={() => handleClose(st.id)}
                    className="w-full py-1.5 px-2 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                    title="Safely close station (requires no active processing)"
                  >
                    <MinusCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Close Station</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenStation}
                    className="w-full py-1.5 px-2 rounded-lg text-emerald-800 hover:bg-emerald-100/80 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Activate Bay</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
