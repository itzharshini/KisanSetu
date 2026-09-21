import React from 'react';
import {
  CheckCircle2,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Wheat,
  Scale,
  Building2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Booking } from '../../types';
import { DemoBadge } from '../common/DemoBadge';

export interface PlanSummaryProps {
  produce: string;
  quantityKg: number;
  centreName: string;
  date: string;
  slotTime: string;
  expectedWait: string;
  recommendedArrival: string;
  onConfirm: () => void;
  onChangeDetails: () => void;
  isSubmitting?: boolean;
}

export const PlanSummaryCard: React.FC<PlanSummaryProps> = ({
  produce,
  quantityKg,
  centreName,
  date,
  slotTime,
  expectedWait,
  recommendedArrival,
  onConfirm,
  onChangeDetails,
  isSubmitting = false
}) => {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
              Review Details
            </span>
            <h3 className="text-xl font-black text-slate-900 font-display">
              YOUR PROCUREMENT PLAN
            </h3>
          </div>
          <DemoBadge type="data" />
        </div>

        {/* Particulars Grid */}
        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium flex items-center gap-2">
              <Wheat className="w-4 h-4 text-emerald-700" />
              Produce:
            </span>
            <strong className="text-slate-900 font-bold text-base">{produce}</strong>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              Quantity:
            </span>
            <strong className="text-slate-900 font-bold text-base">{quantityKg} kg</strong>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              Centre:
            </span>
            <strong className="text-slate-900 font-bold text-right truncate max-w-[220px]">
              {centreName}
            </strong>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              Date:
            </span>
            <strong className="text-slate-900 font-bold">{date}</strong>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-950 font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              Slot Time:
            </span>
            <strong className="text-emerald-950 font-black text-lg font-mono">
              {slotTime}
            </strong>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Expected waiting:</span>
              <strong className="text-slate-900 font-bold">{expectedWait}</strong>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <span className="text-emerald-900 block font-medium">Recommended arrival:</span>
              <strong className="text-emerald-950 font-bold">{recommendedArrival}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 space-y-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-base flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span>Confirming Booking...</span>
            ) : (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Confirm Booking</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onChangeDetails}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
          >
            Change Details
          </button>
        </div>
      </div>
    </div>
  );
};

export interface BookingConfirmedProps {
  booking: Booking;
  onViewToken: () => void;
  onViewCentreStatus: () => void;
  onBackToHome: () => void;
}

export const BookingConfirmedCard: React.FC<BookingConfirmedProps> = ({
  booking,
  onViewToken,
  onViewCentreStatus,
  onBackToHome
}) => {
  return (
    <div className="space-y-6 max-w-lg mx-auto text-center">
      {/* Success Badge Banner */}
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-sm animate-bounce">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>

      <div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">
          Confirmation Code: {booking.bookingRef}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">
          BOOKING CONFIRMED ✓
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Your slot is officially registered with the Tamil Nadu Civil Supplies Corporation
        </p>
      </div>

      {/* Main Confirmation Card */}
      <div className="rounded-3xl bg-white border-2 border-emerald-600/40 shadow-sm p-5 sm:p-6 text-left space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-500 font-medium">Digital Queue Token</span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-900 font-mono">
              {booking.tokenNumber}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Booking ID</span>
            <div className="text-sm font-bold font-mono text-slate-700">
              {booking.bookingRef}
            </div>
          </div>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Centre</span>
            <strong className="text-slate-900 text-right">{booking.centreName}</strong>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Date & Time</span>
            <strong className="text-slate-900">
              {booking.slotDate} at {booking.slotTime}
            </strong>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Produce & Quantity</span>
            <strong className="text-slate-900">
              {booking.produceType} • {booking.quantityKg} kg
            </strong>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Estimated Waiting</span>
            <strong className="text-amber-800">{booking.estimatedWaitingMinutes} min</strong>
          </div>
          <div className="flex justify-between py-1 p-2 rounded-xl bg-emerald-50 text-emerald-950 font-bold">
            <span>Recommended Arrival</span>
            <span className="text-emerald-900">{booking.recommendedArrival}</span>
          </div>
        </div>
      </div>

      {/* Action Navigation Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={onViewToken}
          className="w-full py-3.5 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 active:scale-[0.99]"
        >
          <Ticket className="w-5 h-5" />
          <span>View My Token</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onViewCentreStatus}
            className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors"
          >
            View Centre Status
          </button>
          <button
            type="button"
            onClick={onBackToHome}
            className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
