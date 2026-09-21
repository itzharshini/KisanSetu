import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
  Users,
  Flame,
  Clock,
  Radio,
  Sparkles
} from 'lucide-react';
import { useKisanSetu } from '../../context/KisanSetuContext';

export const DemoSimulationBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    activeBooking,
    isMissedSlotActive,
    toggleMissedSlotDemo,
    simulateNextFarmer,
    simulateFiveMinutes,
    advanceSimulatedClock,
    simulateCongestion,
    clearActiveBooking,
    restoreActiveBooking,
    selectedCentre,
    simulatedTime
  } = useKisanSetu();

  return (
    <div className="fixed bottom-16 md:bottom-3 right-3 z-40">
      <div className="bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700/80 overflow-hidden text-xs max-w-xs transition-all">
        {/* Toggle Bar */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 bg-slate-950 flex items-center justify-between gap-2 text-[11px] font-mono font-bold text-amber-400 hover:bg-slate-900 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>DEMO SIMULATION</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-emerald-400" />
              {simulatedTime}
            </span>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </button>

        {isOpen && (
          <div className="p-3 space-y-2.5 bg-slate-900">
            {/* Operational Clock & Status Header */}
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  Operational Clock:
                </span>
                <span className="text-emerald-400 font-bold text-xs">{simulatedTime}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Simulate time progression to evaluate queue transitions & slot rebalancing.
              </p>
            </div>

            {/* Section 20: Simulated Operational Clock [+5 MIN] Action */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => advanceSimulatedClock(5)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-between shadow-xs transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Advance Clock [+5 MIN]</span>
                </span>
                <span className="text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded font-mono">
                  +5m
                </span>
              </button>
            </div>

            {/* Part 4 Queue and Station Operations */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => simulateNextFarmer()}
                className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-[11px] font-bold text-emerald-300 border border-emerald-800 text-left"
                title="Process next active token in unified queue"
              >
                ⚡ Call/Process Next
              </button>
              <button
                type="button"
                onClick={simulateFiveMinutes}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-700 text-left"
              >
                -5 Min Wait
              </button>
            </div>

            {/* Centre congestion simulator */}
            <button
              type="button"
              onClick={() => simulateCongestion(selectedCentre.id)}
              className="w-full p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-amber-300 border border-slate-700 flex items-center justify-between"
            >
              <span>Toggle Congestion Spike</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </button>

            {/* Missed Slot experience tester */}
            <button
              type="button"
              onClick={toggleMissedSlotDemo}
              className={`w-full p-1.5 rounded-lg text-[11px] font-semibold border flex items-center justify-between transition-colors ${
                isMissedSlotActive
                  ? 'bg-rose-900 text-rose-100 border-rose-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <span>{isMissedSlotActive ? 'Clear Missed State' : 'Test Missed Slot State'}</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </button>

            {/* Clear or restore active booking */}
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
              {activeBooking ? (
                <button
                  type="button"
                  onClick={clearActiveBooking}
                  className="text-slate-400 hover:text-white underline"
                >
                  Test "No Booking"
                </button>
              ) : (
                <button
                  type="button"
                  onClick={restoreActiveBooking}
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restore Booking
                </button>
              )}
              <span className="text-[9px] text-slate-500 font-mono">
                Digital Twin Demo
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
