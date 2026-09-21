import React, { useState } from 'react';
import { Calendar, Plus, Clock, MapPin, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { Booking } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DemoBadge } from '../../components/common/DemoBadge';
import { PageHeader } from '../../components/common/PageHeader';

export interface FarmerBookingsProps {
  bookings: Booking[];
  onNavigateToToken: () => void;
  onBookNewSlot: () => void;
}

export const FarmerBookings: React.FC<FarmerBookingsProps> = ({
  bookings,
  onNavigateToToken,
  onBookNewSlot
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'active') return b.status === 'confirmed';
    if (filter === 'completed') return b.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Procurement Bookings"
        description="View your active and previous mandi arrival slots and status"
        badge={<DemoBadge type="data" />}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={onBookNewSlot}
          >
            Book New Slot
          </Button>
        }
      />

      {/* Module announcement */}
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-emerald-950 font-bold block mb-0.5">
            Stage 2 Preview: Automated Rescheduling & Moisture Sensor Sync
          </strong>
          <span>
            Upcoming KisanSetu modules will allow instant slot swapping if weather or transport delays occur.
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'active'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active (1)
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'completed'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed (2)
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-3.5">
        {filteredBookings.map((b) => {
          const isActive = b.status === 'confirmed';

          return (
            <Card
              key={b.id}
              padding="md"
              className={`transition-all ${
                isActive
                  ? 'border-2 border-emerald-600/50 bg-emerald-50/10'
                  : 'border border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      Ref: {b.bookingRef}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display mt-1">
                    {b.produceType} • {b.quantityQuintals} Quintals
                  </h3>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-500 font-medium">Digital Token</span>
                  <p className="text-base font-bold text-emerald-800 font-mono">
                    {b.tokenNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{b.centreName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{b.slotDate} at <strong>{b.slotTime}</strong></span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  {isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNavigateToToken}
                      className="text-xs py-1"
                    >
                      Track Token #TN-204 →
                    </Button>
                  ) : (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Weighbridge slip generated
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
