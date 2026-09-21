import React, { useState } from 'react';
import { Minus, Plus, AlertCircle, Scale } from 'lucide-react';

export interface QuantitySelectorProps {
  quantityKg: number;
  onChangeQuantity: (qty: number) => void;
  error?: string | null;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantityKg,
  onChangeQuantity,
  error
}) => {
  const [isDirectTyping, setIsDirectTyping] = useState(false);
  const [typedValue, setTypedValue] = useState(String(quantityKg || ''));

  const presets = [100, 250, 450, 500, 1000];

  const handleStep = (increment: number) => {
    const current = quantityKg || 0;
    const nextVal = Math.max(0, current + increment);
    onChangeQuantity(nextVal);
    setTypedValue(String(nextVal));
  };

  const handlePreset = (val: number) => {
    onChangeQuantity(val);
    setTypedValue(String(val));
    setIsDirectTyping(false);
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTypedValue(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      onChangeQuantity(parsed);
    } else {
      onChangeQuantity(0);
    }
  };

  const quintals = (quantityKg / 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-lg mx-auto text-center">
      {/* Label */}
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          How much produce are you bringing?
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Approximate weight in kilograms (weighbridge will record exact billable weight)
        </p>
      </div>

      {/* Stepper Display */}
      <div className="p-6 rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center gap-3 sm:gap-6 w-full">
          {/* Decrement Button */}
          <button
            type="button"
            onClick={() => handleStep(-50)}
            disabled={quantityKg <= 0}
            className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 flex items-center justify-center font-bold text-2xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 active:scale-95 shadow-2xs select-none"
            aria-label="Decrease quantity by 50 kg"
          >
            <Minus className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Central Input / Value */}
          <div className="flex flex-col items-center justify-center min-w-[150px]">
            <div className="flex items-baseline justify-center gap-1.5">
              <input
                type="number"
                min="0"
                step="10"
                value={typedValue}
                onChange={handleManualChange}
                onFocus={() => setIsDirectTyping(true)}
                className="w-36 text-4xl sm:text-5xl font-black text-slate-900 text-center font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded-xl bg-slate-50 py-1 border border-slate-200"
              />
              <span className="text-xl sm:text-2xl font-bold text-emerald-800 font-display">
                kg
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              ≈ {quintals} Quintals
            </span>
          </div>

          {/* Increment Button */}
          <button
            type="button"
            onClick={() => handleStep(50)}
            className="w-14 h-14 rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold text-2xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 active:scale-95 shadow-2xs select-none"
            aria-label="Increase quantity by 50 kg"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Validation Error Message */}
        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-700 font-medium bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 mt-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Preset Quick Buttons */}
      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Or Tap Quick Weight Preset:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePreset(p)}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all active:scale-95 select-none ${
                quantityKg === p
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {p} kg
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
