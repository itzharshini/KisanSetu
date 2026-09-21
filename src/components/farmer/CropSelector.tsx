import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';

export interface CropOption {
  id: string;
  name: string;
  emoji: string;
  variety?: string;
  msp?: number;
}

export interface CropSelectorProps {
  selectedCrop: string;
  onSelectCrop: (cropName: string) => void;
}

export const CROPS: CropOption[] = [
  { id: 'paddy', name: 'Paddy', emoji: '🌾', variety: 'Ponni / Grade A', msp: 2320 },
  { id: 'maize', name: 'Maize', emoji: '🌽', variety: 'Hybrid Yellow', msp: 2225 },
  { id: 'groundnut', name: 'Groundnut', emoji: '🥜', variety: 'TMV-7 Pods', msp: 6780 },
  { id: 'cotton', name: 'Cotton', emoji: '🌿', variety: 'Medium Staple', msp: 7122 },
  { id: 'wheat', name: 'Wheat', emoji: '🌾', variety: 'Sharbati / Mill', msp: 2275 },
  { id: 'sugarcane', name: 'Sugarcane', emoji: '🌱', variety: 'Co 86032', msp: 340 }
];

export const CropSelector: React.FC<CropSelectorProps> = ({
  selectedCrop,
  onSelectCrop
}) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customCrop, setCustomCrop] = useState('');

  const handleCustomCropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCrop.trim()) {
      onSelectCrop(customCrop.trim());
      setShowOtherInput(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {CROPS.map((crop) => {
          const isSelected = selectedCrop.toLowerCase().includes(crop.name.toLowerCase());

          return (
            <button
              key={crop.id}
              type="button"
              onClick={() => {
                setShowOtherInput(false);
                onSelectCrop(crop.name);
              }}
              className={`p-4 sm:p-5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between min-h-[110px] sm:min-h-[125px] relative focus:outline-none focus:ring-2 focus:ring-emerald-600 active:scale-[0.98] select-none ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl sm:text-4xl" role="img" aria-label={crop.name}>
                  {crop.emoji}
                </span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                  {crop.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{crop.variety}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* "Don't see your crop?" option */}
      <div className="pt-2">
        {!showOtherInput ? (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 font-medium">Don't see your crop in the list?</span>
            <button
              type="button"
              onClick={() => setShowOtherInput(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-emerald-800 font-bold bg-white hover:bg-slate-100 transition-colors self-start sm:self-center"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Other Crop</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleCustomCropSubmit}
            className="p-4 rounded-xl bg-white border-2 border-emerald-500 shadow-sm space-y-3"
          >
            <label className="block text-xs font-bold text-slate-800">
              Enter Crop Name:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customCrop}
                onChange={(e) => setCustomCrop(e.target.value)}
                placeholder="e.g., Ragi, Black Gram, Sesame..."
                className="flex-1 text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                autoFocus
              />
              <button
                type="submit"
                disabled={!customCrop.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs disabled:opacity-50"
              >
                Set Crop
              </button>
              <button
                type="button"
                onClick={() => setShowOtherInput(false)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
