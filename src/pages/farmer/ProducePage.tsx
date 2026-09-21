import React, { useState } from 'react';
import { Wheat, Calendar, Plus, Scale, Tag, Check, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DemoBadge } from '../../components/common/DemoBadge';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { RegisteredProduce } from '../../types';

export interface ProducePageProps {
  onBookProduce?: (cropName: string) => void;
}

export const ProducePage: React.FC<ProducePageProps> = ({ onBookProduce }) => {
  const { farmer, addProduce } = useKisanSetu();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [cropName, setCropName] = useState('Paddy');
  const [variety, setVariety] = useState('Ponni Deluxe');
  const [harvestDate, setHarvestDate] = useState('2026-10-15');
  const [quantityQuintals, setQuantityQuintals] = useState<number>(45);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCrop: RegisteredProduce = {
      id: `CRP-${Date.now()}`,
      cropName,
      variety,
      harvestDate,
      estimatedQuantityQuintals: quantityQuintals,
      expectedDeliveryDate: 'October 2026',
      mspPerQuintal: cropName === 'Paddy' ? 2320 : cropName === 'Groundnut' ? 6780 : 2225,
      status: 'Growing'
    };
    addProduce(newCrop);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            My Registered Produce
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Pre-registered seasonal crops eligible for MSP procurement
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Produce</span>
        </button>
      </div>

      {/* Produce List */}
      <div className="space-y-4">
        {farmer.registeredProduce.map((crop) => (
          <div
            key={crop.id}
            className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-2xl border border-emerald-200">
                  {crop.cropName === 'Paddy' ? '🌾' : crop.cropName === 'Groundnut' ? '🥜' : '🌽'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      {crop.cropName}
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {crop.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{crop.variety}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Estimated Yield</span>
                <span className="text-xl font-black font-display text-slate-900">
                  {crop.estimatedQuantityQuintals} Quintals
                </span>
                <span className="text-[11px] text-slate-500 block">
                  ≈ {(crop.estimatedQuantityQuintals / 10).toFixed(1)} Tonnes
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Harvest Date</span>
                <strong className="text-slate-800 block">{crop.harvestDate}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Govt MSP Rate</span>
                <strong className="text-emerald-800 block">₹{crop.mspPerQuintal}/qtl</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[11px]">Expected Value</span>
                <strong className="text-slate-900 block">
                  ₹{Math.round(crop.estimatedQuantityQuintals * crop.mspPerQuintal).toLocaleString()}
                </strong>
              </div>
            </div>

            {onBookProduce && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onBookProduce(crop.cropName)}
                  className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 text-xs font-bold transition-colors"
                >
                  Schedule Delivery Slot →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Register New Produce Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                Crop Registration
              </span>
              <h3 className="text-lg font-black text-slate-900 font-display">
                Register New Produce
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Declare your upcoming harvest to secure procurement capacity
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Crop Type</label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="Paddy">Paddy (Rice)</option>
                  <option value="Groundnut">Groundnut</option>
                  <option value="Maize">Maize</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Wheat">Wheat</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Variety</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g., Ponni Deluxe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Est. Quantity (Quintals)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantityQuintals}
                    onChange={(e) => setQuantityQuintals(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-colors"
              >
                Register Crop
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
