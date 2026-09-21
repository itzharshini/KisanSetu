import React from 'react';
import {
  Sparkles,
  UserPlus,
  Users,
  Megaphone,
  FastForward,
  Clock,
  PlusCircle,
  Play
} from 'lucide-react';
import { useKisanSetu } from '../../context/KisanSetuContext';

export const OperatorSimulationBar: React.FC = () => {
  const {
    callNextFarmer,
    addOneDemoFarmer,
    addFiveDemoFarmers,
    processNextActiveFarmer,
    advanceSimulatedClock,
    openAdditionalStation,
    simulatedTime,
    stations
  } = useKisanSetu();

  const closedStationExists = stations.some((s) => s.status !== 'active');

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-sm border border-slate-800 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
            Operational Simulation Controls
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Test live queue progression, station load & throughput in real-time
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Depot Clock:</span>
          <span className="font-mono font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded">
            {simulatedTime}
          </span>
        </div>
      </div>

      {/* Control Buttons Strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Call Next */}
        <button
          type="button"
          onClick={() => callNextFarmer()}
          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 transition-colors shadow-2xs"
          title="Call the next waiting farmer to an active station"
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Call Next</span>
        </button>

        {/* Process Next */}
        <button
          type="button"
          onClick={processNextActiveFarmer}
          className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-colors"
          title="Complete currently processed intake and immediately call next farmer"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Process Next</span>
        </button>

        {/* +1 Farmer */}
        <button
          type="button"
          onClick={() => addOneDemoFarmer()}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          title="Admit 1 realistic demo farmer into the waiting queue"
        >
          <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
          <span>+1 Farmer</span>
        </button>

        {/* +5 Farmers */}
        <button
          type="button"
          onClick={addFiveDemoFarmers}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          title="Admit 5 farmers to simulate busy arrival burst"
        >
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>+5 Farmers</span>
        </button>

        {/* +5 Minutes Clock */}
        <button
          type="button"
          onClick={() => advanceSimulatedClock(5)}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          title="Advance operational clock by 5 minutes"
        >
          <FastForward className="w-3.5 h-3.5 text-blue-400" />
          <span>+5 Mins</span>
        </button>

        {/* +15 Minutes Clock */}
        <button
          type="button"
          onClick={() => advanceSimulatedClock(15)}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          title="Advance operational clock by 15 minutes"
        >
          <FastForward className="w-3.5 h-3.5 text-purple-400" />
          <span>+15 Mins</span>
        </button>

        {/* Open Station */}
        {closedStationExists && (
          <button
            type="button"
            onClick={openAdditionalStation}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors ml-auto"
            title="Open auxiliary weighbridge station to increase throughput"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Bay 4</span>
          </button>
        )}
      </div>
    </div>
  );
};
