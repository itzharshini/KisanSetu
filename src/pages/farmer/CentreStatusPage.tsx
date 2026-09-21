import React, { useState } from 'react';
import {
  Building2,
  Clock,
  MapPin,
  Scale,
  Truck,
  Users,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Phone
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DemoBadge } from '../../components/common/DemoBadge';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { ProcurementCentre } from '../../types';

export interface CentreStatusPageProps {
  onBookAtCentre?: (centreId: string) => void;
}

export const CentreStatusPage: React.FC<CentreStatusPageProps> = ({ onBookAtCentre }) => {
  const { centres, selectedCentre, simulateCongestion } = useKisanSetu();
  const [activeCentreId, setActiveCentreId] = useState<string>(selectedCentre?.id || 'PC-TN-04');
  const [filterQuery, setFilterQuery] = useState('');

  const displayedCentre = centres.find((c) => c.id === activeCentreId) || centres[0];

  const filteredCentres = centres.filter(
    (c) =>
      c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Centre Status & Waiting Times
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time live queue, weighbridge capacity, and yard occupancy
          </p>
        </div>
        <DemoBadge type="mode" />
      </div>

      {/* Centre Selector Tabs / Pills */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filteredCentres.map((c) => {
            const isSelected = c.id === activeCentreId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCentreId(c.id)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{c.name.split(' ')[0]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    c.loadLabel === 'Low'
                      ? isSelected
                        ? 'bg-emerald-800 text-emerald-100'
                        : 'bg-emerald-100 text-emerald-800'
                      : c.loadLabel === 'Moderate'
                      ? isSelected
                        ? 'bg-amber-700 text-white'
                        : 'bg-amber-100 text-amber-800'
                      : isSelected
                      ? 'bg-rose-700 text-white'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {c.loadLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Highlighted Centre Detailed View */}
      <div className="rounded-3xl bg-white border-2 border-slate-200 shadow-sm overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {displayedCentre.code}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-700">
                  🟢 {displayedCentre.status === 'optimal' || displayedCentre.status === 'open' ? 'Open & Receiving' : 'Heavy Queue'}
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-white">
                {displayedCentre.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {displayedCentre.address} • {displayedCentre.distanceKm} km away
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Wait Time
              </span>
              <span className="text-2xl font-black font-display text-amber-300">
                ~{displayedCentre.currentWaitMinutes} min
              </span>
            </div>
          </div>
        </div>

        {/* Humanized Plain Language Banner (Section 19 requirement) */}
        <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs font-bold text-emerald-950">
              {displayedCentre.humanizedLoadText}
            </span>
          </div>
          <p className="text-xs text-emerald-800 pl-6">
            ✓ Weighbridge is running normally with minimal gate congestion.
          </p>
          <p className="text-xs text-emerald-800 pl-6 font-medium">
            ✓ {displayedCentre.humanizedSpaceText}
          </p>
        </div>

        {/* Operational Metrics Cards */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {/* Hours */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <Clock className="w-4 h-4 text-slate-500 mx-auto mb-1" />
              <span className="text-[11px] text-slate-500 block">Operating Hours</span>
              <strong className="text-xs font-bold text-slate-800">
                {displayedCentre.operatingHours}
              </strong>
            </div>

            {/* Weighing stations */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <Scale className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <span className="text-[11px] text-slate-500 block">Weigh Stations</span>
              <strong className="text-xs font-bold text-slate-800">
                {displayedCentre.activeWeighingStations} of {displayedCentre.totalWeighingStations} Active
              </strong>
            </div>

            {/* Farmers Waiting */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <Users className="w-4 h-4 text-amber-700 mx-auto mb-1" />
              <span className="text-[11px] text-slate-500 block">Farmers Waiting</span>
              <strong className="text-xs font-bold text-slate-800">
                {displayedCentre.farmersWaitingCount} in queue
              </strong>
            </div>

            {/* Storage capacity */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <Building2 className="w-4 h-4 text-blue-700 mx-auto mb-1" />
              <span className="text-[11px] text-slate-500 block">Storage Filled</span>
              <strong className="text-xs font-bold text-slate-800">
                {displayedCentre.storageUtilizationPercent}% used
              </strong>
            </div>
          </div>

          {/* Contact Helpline */}
          <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Have questions about yard entry?</span>
            <a
              href={`tel:${displayedCentre.contactNumber}`}
              className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{displayedCentre.contactNumber}</span>
            </a>
          </div>

          {/* Action button */}
          {onBookAtCentre && (
            <button
              type="button"
              onClick={() => onBookAtCentre(displayedCentre.id)}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-colors"
            >
              Book Slot at {displayedCentre.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
