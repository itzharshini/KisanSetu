import React from 'react';
import { Check } from 'lucide-react';

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps = 6,
  onStepClick
}) => {
  const steps = [
    { num: 1, label: 'Produce' },
    { num: 2, label: 'Quantity' },
    { num: 3, label: 'Centre' },
    { num: 4, label: 'Time' },
    { num: 5, label: 'Recommendation' },
    { num: 6, label: 'Confirm' }
  ];

  return (
    <div className="w-full">
      {/* Mobile step pill header */}
      <div className="flex items-center justify-between sm:hidden mb-2 px-1">
        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-xs font-bold text-slate-700">
          {steps[currentStep - 1]?.label}
        </span>
      </div>

      {/* Progress Bar for Mobile */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden sm:hidden mb-4">
        <div
          className="bg-emerald-700 h-full transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Desktop / Tablet Step Track */}
      <div className="hidden sm:flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-emerald-600 transition-all duration-300 -z-0"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.num < currentStep;
          const isCurrent = step.num === currentStep;

          return (
            <button
              key={step.num}
              type="button"
              disabled={step.num > currentStep}
              onClick={() => onStepClick && onStepClick(step.num)}
              className={`flex flex-col items-center gap-1.5 focus:outline-none z-10 transition-colors ${
                step.num <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                  isCompleted
                    ? 'bg-emerald-700 text-white'
                    : isCurrent
                    ? 'bg-white border-2 border-emerald-700 text-emerald-900 ring-4 ring-emerald-100 font-extrabold'
                    : 'bg-white border border-slate-300 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
              </div>
              <span
                className={`text-[11px] font-semibold tracking-tight ${
                  isCurrent
                    ? 'text-emerald-950 font-bold'
                    : isCompleted
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
