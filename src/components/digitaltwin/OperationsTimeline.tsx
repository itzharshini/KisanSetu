import React, { useState } from 'react';
import {
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Truck,
  Layers,
  Pause,
  Play,
  Sparkles
} from 'lucide-react';
import { OperationalEvent } from '../../types';

export interface OperationsTimelineProps {
  events: OperationalEvent[];
}

export const OperationsTimeline: React.FC<OperationsTimelineProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvents = events.filter((evt) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'TOKENS') return evt.type === 'TOKEN_CALLED' || evt.type === 'PROCUREMENT_COMPLETED' || evt.type === 'FARMER_ARRIVED';
    if (filterType === 'STATIONS') return evt.type === 'STATION_OPENED' || evt.type === 'STATION_CLOSED';
    if (filterType === 'LOGISTICS') return evt.type === 'VEHICLE_ARRIVED' || evt.type === 'STORAGE_UPDATED';
    return true;
  });

  const getEventBadge = (variant?: OperationalEvent['badgeVariant']) => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'warning':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'error':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-blue-100 text-blue-900 border-blue-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>Today's Live Operational Log</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Real-time chronological events across stations, queues, and transport
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          {[
            { key: 'ALL', label: 'All Events' },
            { key: 'TOKENS', label: 'Tokens' },
            { key: 'STATIONS', label: 'Stations' },
            { key: 'LOGISTICS', label: 'Storage & Fleet' }
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilterType(f.key)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                filterType === f.key
                  ? 'bg-emerald-100 text-emerald-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-colors flex items-start gap-2.5"
            >
              <div className="shrink-0 font-mono text-[11px] font-bold text-slate-600 pt-0.5 w-16">
                {evt.timestamp}
              </div>

              <div className="grow space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">{evt.title}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getEventBadge(
                      evt.badgeVariant
                    )}`}
                  >
                    {evt.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {evt.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-slate-400 italic">
            No events recorded in this category yet.
          </div>
        )}
      </div>
    </div>
  );
};
