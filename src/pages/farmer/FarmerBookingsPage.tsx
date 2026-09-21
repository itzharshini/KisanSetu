import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Wheat,
  Ticket,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DemoBadge } from '../../components/common/DemoBadge';
import { useKisanSetu } from '../../context/KisanSetuContext';
import { Booking } from '../../types';

export interface FarmerBookingsPageProps {
  onNavigateToBook: () => void;
  onViewToken: () => void;
}

export const FarmerBookingsPage: React.FC<FarmerBookingsPageProps> = ({
  onNavigateToBook,
  onViewToken
}) => {
  const { bookings, activeBooking } = useKisanSetu();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending' || b.status === 'arrived' || b.status === 'weighed'
  );
  const completedBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  const displayedList =
    filter === 'upcoming'
      ? upcomingBookings
      : filter === 'completed'
      ? completedBookings
      : bookings;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Completed
          </span>
        );
      case 'weighed':
      case 'arrived':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            At Centre
          </span>
        );
      case 'missed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Missed Slot
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            My Procurement Bookings
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            History of all scheduled, active, and fulfilled procurement slots
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToBook}
          className="self-start sm:self-center py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
        >
          + Book New Slot
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filter === 'all'
              ? 'bg-emerald-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('upcoming')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filter === 'upcoming'
              ? 'bg-emerald-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filter === 'completed'
              ? 'bg-emerald-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Completed ({completedBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {displayedList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No bookings in this category.</p>
          </div>
        ) : (
          displayedList.map((b) => {
            const isActive = activeBooking?.id === b.id;

            return (
              <div
                key={b.id}
                className={`rounded-2xl border-2 transition-all p-5 bg-white space-y-3 ${
                  isActive
                    ? 'border-emerald-600 shadow-sm ring-2 ring-emerald-600/10'
                    : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-slate-500">
                        {b.bookingRef}
                      </span>
                      {getStatusBadge(b.status)}
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ACTIVE TOKEN
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      {b.produceType} • {b.quantityKg} kg
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Token</span>
                    <span className="text-2xl font-black font-mono text-emerald-900">
                      {b.tokenNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Centre</span>
                    <strong className="text-slate-800 truncate block">{b.centreName}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Slot Time</span>
                    <strong className="text-slate-800 block">
                      {b.slotDate}, {b.slotTime}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[11px]">Recommended Arrival</span>
                    <strong className="text-emerald-800 block">{b.recommendedArrival}</strong>
                  </div>
                </div>

                {isActive && (
                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={onViewToken}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>View Live Queue Token</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
