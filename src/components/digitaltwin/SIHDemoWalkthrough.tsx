import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers
} from 'lucide-react';
import { Button } from '../common/Button';

export interface SIHDemoWalkthroughProps {
  onStepAction: (stepNumber: number) => void;
  onResetDemo: () => void;
}

interface DemoStep {
  step: number;
  title: string;
  narrative: string;
  actionLabel: string;
  badge: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: 'Normal Operational Baseline',
    narrative: 'Depot operates normally. 3 active stations, 14 farmers in queue, wait time is 18 minutes. Storage is at 68%.',
    actionLabel: 'Advance: Simulate Gate Arrivals',
    badge: 'Baseline'
  },
  {
    step: 2,
    title: 'Farmers Arrive at Inbound Gate',
    narrative: 'Morning tractor convoy arrives from Poonamallee villages. Tokens are validated at the barrier gate and admitted to holding yard.',
    actionLabel: 'Advance: Holding Yard Queuing',
    badge: 'Arrivals'
  },
  {
    step: 3,
    title: 'Queue Surges in Holding Yard',
    narrative: 'Holding yard occupancy exceeds 22 tractors. Estimated wait times climb from 18 min to 35 min.',
    actionLabel: 'Advance: Trigger AI Advisory',
    badge: 'Queue Surge'
  },
  {
    step: 4,
    title: 'Autonomous Bottleneck Warning',
    narrative: 'KisanSetu digital twin detects queue latency threshold breach. Alerts operator of incoming delay.',
    actionLabel: 'Advance: Generate Recommendation',
    badge: 'AI Alert'
  },
  {
    step: 5,
    title: 'Predictive Recommendation Generated',
    narrative: 'Simulator calculates that activating Station 4 will recover throughput and reduce wait time by 16 minutes.',
    actionLabel: 'Advance: Activate Station 4',
    badge: 'Decision Support'
  },
  {
    step: 6,
    title: 'Operator Activates Weighing Bay 4',
    narrative: 'Operator activates backup Station 4. Electronic scales calibrate and system routes next tractor.',
    actionLabel: 'Advance: Queue Clears',
    badge: 'Station Opened'
  },
  {
    step: 7,
    title: 'Queue Clearance Accelerates',
    narrative: 'With 4 active stations, throughput jumps to 16 farmers/hour. Wait time drops back under 20 minutes.',
    actionLabel: 'Advance: Complete Intake',
    badge: 'Throughput High'
  },
  {
    step: 8,
    title: 'Farmer Procurement Completed',
    narrative: 'Weighment slip generated, digital moisture recorded at 14.8%, direct bank transfer (DBT) triggered.',
    actionLabel: 'Advance: Godown Storage Check',
    badge: 'Slip Issued'
  },
  {
    step: 9,
    title: 'Godown Storage Updates',
    narrative: 'Warehouse inventory absorbs new paddy tonnage, reaching 72% capacity. Warehouse space monitor activates.',
    actionLabel: 'Advance: Evacuation Fleet',
    badge: 'Storage'
  },
  {
    step: 10,
    title: 'Transport Fleet Evacuation Scheduled',
    narrative: 'Automated logistics request dispatches two 12-tonne trucks to transfer grain to FCI Silos. Depot balance restored.',
    actionLabel: 'Walkthrough Complete',
    badge: 'Full Cycle Complete'
  }
];

export const SIHDemoWalkthrough: React.FC<SIHDemoWalkthroughProps> = ({
  onStepAction,
  onResetDemo
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  const step = DEMO_STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < DEMO_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      onStepAction(nextIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      onStepAction(prevIdx + 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    onResetDemo();
  };

  return (
    <div className="rounded-2xl border border-purple-300 bg-linear-to-r from-purple-50 via-white to-indigo-50 p-4 shadow-sm text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-slate-900 text-sm">
                Smart India Hackathon (SIH) Guided Simulation
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                Step {step.step} of 10
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Interactive 10-step lifecycle demo for evaluators & jury
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-slate-600 hover:text-slate-900 text-[11px] flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo State</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsWalkthroughOpen(!isWalkthroughOpen)}
            className="text-[11px]"
          >
            {isWalkthroughOpen ? 'Hide Script' : 'View Script'}
          </Button>
        </div>
      </div>

      {/* Current Step Card */}
      <div className="p-3.5 bg-white rounded-xl border border-purple-200/80 shadow-2xs space-y-2 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px]">
              {step.step}
            </span>
            <strong className="text-slate-900 font-bold text-xs">{step.title}</strong>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            {step.badge}
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          {step.narrative}
        </p>

        {/* Stepper controls */}
        <div className="pt-1 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="text-[11px] flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </Button>

          {/* Stepper dots */}
          <div className="hidden sm:flex items-center gap-1">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setCurrentStepIdx(idx);
                  onStepAction(idx + 1);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStepIdx
                    ? 'w-5 bg-purple-600'
                    : idx < currentStepIdx
                    ? 'bg-purple-300'
                    : 'bg-slate-200'
                }`}
                title={`Step ${s.step}: ${s.title}`}
              />
            ))}
          </div>

          <Button
            size="sm"
            onClick={handleNext}
            disabled={currentStepIdx === DEMO_STEPS.length - 1}
            className="text-[11px] flex items-center gap-1"
          >
            <span>{step.actionLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Expanded script details */}
      {isWalkthroughOpen && (
        <div className="mt-3 p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-1.5 animate-fadeIn">
          <div className="text-[11px] font-bold text-purple-950 uppercase tracking-wider">
            Evaluation Script Sequence:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700">
            {DEMO_STEPS.map((s) => (
              <li key={s.step} className={s.step === step.step ? 'font-bold text-purple-900' : ''}>
                {s.title} — {s.narrative.substring(0, 60)}...
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
