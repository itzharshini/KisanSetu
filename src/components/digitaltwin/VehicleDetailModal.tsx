import React from 'react';
import {
  X,
  Truck,
  MapPin,
  User,
  Package,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { LoadingBayVehicle } from '../../types';
import { Button } from '../common/Button';

export interface VehicleDetailModalProps {
  vehicle: LoadingBayVehicle | null;
  onClose: () => void;
  onUpdateStatus?: (vehicleId: string, newStatus: LoadingBayVehicle['status']) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  onClose,
  onUpdateStatus
}) => {
  if (!vehicle) return null;

  const loadPercent = Math.min(100, Math.round((vehicle.currentLoadKg / vehicle.capacityKg) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              <Truck className="w-4 h-4 text-emerald-800" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-slate-900 text-base">
                {vehicle.plateNumber}
              </h3>
              <p className="text-xs text-slate-500">{vehicle.type}</p>
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Vehicle Status:</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {vehicle.status}
            </span>
          </div>

          {/* Load Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Payload Capacity:</span>
              <span className="font-mono font-bold text-slate-900">
                {(vehicle.currentLoadKg / 1000).toFixed(1)}k / {(vehicle.capacityKg / 1000).toFixed(1)}k kg ({loadPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
          </div>

          {/* Details Table */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Destination:
              </span>
              <strong className="text-slate-900 font-semibold">{vehicle.destination}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Driver Name:
              </span>
              <span className="text-slate-800 font-medium">{vehicle.driverName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                Bay Assignment:
              </span>
              <span className="font-bold text-slate-900">
                {vehicle.bayNumber ? `Bay ${vehicle.bayNumber}` : 'Holding Yard'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (onUpdateStatus) {
                onUpdateStatus(vehicle.id, 'Departing');
              }
              onClose();
            }}
          >
            Mark Dispatched →
          </Button>
        </div>
      </div>
    </div>
  );
};
