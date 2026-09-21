import React, { useState } from 'react';
import {
  X,
  Play,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Clock,
  Users,
  Scale,
  Warehouse,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import {
  WhatIfScenarioConfig,
  WhatIfScenarioResult,
  ScenarioPresetKey,
  ProcessingStation
} from '../../types';
import { digitalTwinService } from '../../services/digitalTwinService';
import { Button } from '../common/Button';

export interface WhatIfSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  waitingCount: number;
  avgWaitMinutes: number;
  activeStations: number;
  storageCapacityKg: number;
  onApplyRecommendation: (stationNumber: number) => void;
}

const PRESET_SCENARIOS: {
  id: ScenarioPresetKey;
  label: string;
  desc: string;
  config: WhatIfScenarioConfig;
}[] = [
  {
    id: 'NORMAL_DAY',
    label: 'Normal Day',
    desc: 'Regular arrivals across scheduled morning shifts',
    config: {
      additionalFarmers: 5,
      activeStations: 3,
      processingSpeed: 'normal',
      storageCapacityKg: 10000,
      vehicleAvailability: 3,
      staffCount: 8
    }
  },
  {
    id: 'BUSY_MORNING',
    label: 'Busy Morning Surge',
    desc: 'Surge of 30 inbound tractor trolleys with 2 bays',
    config: {
      additionalFarmers: 30,
      activeStations: 2,
      processingSpeed: 'normal',
      storageCapacityKg: 10000,
      vehicleAvailability: 2,
      staffCount: 6
    }
  },
  {
    id: 'FESTIVAL_PEAK',
    label: 'Peak Harvest Demand',
    desc: 'Bumper crop delivery influx of 55 farmers',
    config: {
      additionalFarmers: 55,
      activeStations: 3,
      processingSpeed: 'fast',
      storageCapacityKg: 10000,
      vehicleAvailability: 4,
      staffCount: 10
    }
  },
  {
    id: 'VEHICLE_SHORTAGE',
    label: 'Transport Shortage',
    desc: 'Zero evacuation fleet carriers available for dispatch',
    config: {
      additionalFarmers: 20,
      activeStations: 3,
      processingSpeed: 'normal',
      storageCapacityKg: 10000,
      vehicleAvailability: 0,
      staffCount: 8
    }
  },
  {
    id: 'STORAGE_CONSTRAINT',
    label: 'Storage Constraint',
    desc: 'Godown 94% full with heavy intake',
    config: {
      additionalFarmers: 25,
      activeStations: 3,
      processingSpeed: 'normal',
      storageCapacityKg: 8500,
      vehicleAvailability: 1,
      staffCount: 8
    }
  },
  {
    id: 'STAFF_SHORTAGE',
    label: 'Staff Shortage',
    desc: 'Only 1 weighbridge active with reduced inspection pace',
    config: {
      additionalFarmers: 18,
      activeStations: 1,
      processingSpeed: 'slow',
      storageCapacityKg: 10000,
      vehicleAvailability: 2,
      staffCount: 3
    }
  }
];

export const WhatIfSimulationModal: React.FC<WhatIfSimulationModalProps> = ({
  isOpen,
  onClose,
  waitingCount,
  avgWaitMinutes,
  activeStations,
  storageCapacityKg,
  onApplyRecommendation
}) => {
  const [config, setConfig] = useState<WhatIfScenarioConfig>({
    additionalFarmers: 25,
    activeStations: activeStations || 2,
    processingSpeed: 'normal',
    storageCapacityKg: storageCapacityKg || 10000,
    vehicleAvailability: 2,
    staffCount: 6
  });

  const [activePreset, setActivePreset] = useState<string>('BUSY_MORNING');
  const [simulationResult, setSimulationResult] = useState<WhatIfScenarioResult>(() =>
    digitalTwinService.simulateScenario(
      config,
      waitingCount,
      avgWaitMinutes,
      activeStations
    )
  );

  if (!isOpen) return null;

  const handleRunSimulation = (newCfg: WhatIfScenarioConfig) => {
    setConfig(newCfg);
    const result = digitalTwinService.simulateScenario(
      newCfg,
      waitingCount,
      avgWaitMinutes,
      activeStations
    );
    setSimulationResult(result);
  };

  const handleSelectPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setActivePreset(preset.id);
    handleRunSimulation(preset.config);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
              <Sliders className="w-4 h-4 text-purple-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-slate-900 text-base">
                  What-If Operational Simulator
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                  DEMO SIMULATION
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Predict queue bottlenecks, wait times & bay throughput before committing shifts
              </p>
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

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
              1. Choose an Operational Stress Scenario:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_SCENARIOS.map((p) => {
                const isSel = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`text-left p-2.5 rounded-xl border transition-all ${
                      isSel
                        ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <strong className={`block text-xs font-bold ${isSel ? 'text-purple-950' : 'text-slate-900'}`}>
                      {p.label}
                    </strong>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5 line-clamp-2">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Parameter Sliders */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              2. Fine-tune Parameters:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Additional Farmers */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Additional Inbound Farmers:</span>
                  <strong className="font-mono text-slate-900 font-bold">+{config.additionalFarmers} farmers</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={5}
                  value={config.additionalFarmers}
                  onChange={(e) => {
                    setActivePreset('CUSTOM');
                    handleRunSimulation({ ...config, additionalFarmers: Number(e.target.value) });
                  }}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Active Weighing Stations */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Active Weighing Stations:</span>
                  <strong className="font-mono text-slate-900 font-bold">{config.activeStations} of 4 bays</strong>
                </div>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={1}
                  value={config.activeStations}
                  onChange={(e) => {
                    setActivePreset('CUSTOM');
                    handleRunSimulation({ ...config, activeStations: Number(e.target.value) });
                  }}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Processing Speed */}
              <div className="space-y-1">
                <span className="text-slate-600 block text-xs">Intake & Inspection Speed:</span>
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {(['slow', 'normal', 'fast'] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => {
                        setActivePreset('CUSTOM');
                        handleRunSimulation({ ...config, processingSpeed: spd });
                      }}
                      className={`py-1 px-2 rounded-lg font-semibold text-xs border text-center capitalize transition-all ${
                        config.processingSpeed === spd
                          ? 'bg-purple-100 text-purple-900 border-purple-400 font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport Fleet Available */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Available Evacuation Fleet:</span>
                  <strong className="font-mono text-slate-900 font-bold">{config.vehicleAvailability} trucks</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  step={1}
                  value={config.vehicleAvailability}
                  onChange={(e) => {
                    setActivePreset('CUSTOM');
                    handleRunSimulation({ ...config, vehicleAvailability: Number(e.target.value) });
                  }}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Outcome Projection: Current vs Predicted vs After Action */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              3. Outcome Projection: Current Baseline vs. Scenario vs. Recommended Fix:
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Current */}
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                  Current Baseline
                </span>
                <div>
                  <span className="text-slate-500 text-[11px] block">Queue</span>
                  <strong className="font-mono text-base text-slate-800">
                    {simulationResult.current.waitingFarmers} farmers
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Avg Wait</span>
                  <strong className="font-mono text-base text-slate-800">
                    {simulationResult.current.avgWaitMinutes} min
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Depot Load</span>
                  <strong className="font-mono text-xs text-slate-800">
                    {simulationResult.current.centreLoadPercent}%
                  </strong>
                </div>
              </div>

              {/* Scenario Predicted */}
              <div className={`p-3 rounded-xl border space-y-2 ${
                simulationResult.predicted.avgWaitMinutes > 30
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-amber-50 border-amber-300'
              }`}>
                <span className="font-bold text-rose-900 uppercase tracking-wider text-[10px] block">
                  Simulated Scenario
                </span>
                <div>
                  <span className="text-slate-500 text-[11px] block">Queue</span>
                  <strong className="font-mono text-base text-rose-950 font-extrabold flex items-center justify-center gap-1">
                    {simulationResult.predicted.waitingFarmers} farmers
                    <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Avg Wait</span>
                  <strong className="font-mono text-base text-rose-950 font-extrabold">
                    {simulationResult.predicted.avgWaitMinutes} min
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Risk Factor</span>
                  <strong className="text-xs text-rose-900 font-bold block truncate">
                    {simulationResult.predicted.bottleneckRisk}
                  </strong>
                </div>
              </div>

              {/* After Action */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
                <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] block">
                  With Recommended Fix
                </span>
                <div>
                  <span className="text-slate-500 text-[11px] block">Queue</span>
                  <strong className="font-mono text-base text-emerald-950 font-extrabold flex items-center justify-center gap-1">
                    {simulationResult.afterAction.waitingFarmers} farmers
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Avg Wait</span>
                  <strong className="font-mono text-base text-emerald-950 font-extrabold">
                    {simulationResult.afterAction.avgWaitMinutes} min
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Active Bays</span>
                  <strong className="text-xs text-emerald-900 font-bold block">
                    {simulationResult.afterAction.activeStations} Weighbridges
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 space-y-2">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold font-display">
                  {simulationResult.recommendedAction.title}
                </strong>
                <p className="text-xs text-purple-900 leading-relaxed mt-0.5">
                  {simulationResult.recommendedAction.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close Simulator
          </Button>

          <Button
            size="sm"
            className="flex items-center gap-1.5"
            onClick={() => {
              onApplyRecommendation(simulationResult.recommendedAction.stationToActivate || 4);
              onClose();
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Recommendation to Centre</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
