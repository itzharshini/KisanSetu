import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Clock,
  Warehouse,
  Scale,
  Sparkles
} from 'lucide-react';
import { OperationalAlert } from '../../types';
import { Button } from '../common/Button';

export interface OperationalAlertsListProps {
  alerts: OperationalAlert[];
  onApplyAction: (alert: OperationalAlert) => void;
}

export const OperationalAlertsList: React.FC<OperationalAlertsListProps> = ({
  alerts,
  onApplyAction
}) => {
  if (alerts.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span className="font-semibold">All operational telemetry within nominal thresholds. No active bottlenecks.</span>
        </div>
        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
          0 Alerts
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <h3 className="font-display font-bold text-slate-900 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Active Bottleneck Warnings ({alerts.length})</span>
        </h3>
        <span className="text-[11px] text-slate-500">Autonomous recommendation engine</span>
      </div>

      <div className="space-y-2.5">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';

          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                isCritical
                  ? 'bg-rose-50/70 border-rose-300 shadow-2xs'
                  : isWarning
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-blue-50/70 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {isCritical ? (
                    <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="font-bold text-slate-900 block text-xs">
                      {alert.title}
                    </strong>
                    <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isCritical
                      ? 'bg-rose-200 text-rose-900 border border-rose-300'
                      : isWarning
                      ? 'bg-amber-200 text-amber-900 border border-amber-300'
                      : 'bg-blue-200 text-blue-900 border border-blue-300'
                  }`}
                >
                  {alert.severity}
                </span>
              </div>

              {/* Impact & Suggestion */}
              <div className="p-2 rounded-lg bg-white/80 border border-slate-200/70 space-y-1 text-[11px]">
                <div>
                  <span className="text-slate-500 font-medium">Impact: </span>
                  <strong className="text-slate-800 font-semibold">{alert.impact}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Recommendation: </span>
                  <span className="text-emerald-800 font-bold">{alert.suggestedAction}</span>
                </div>
              </div>

              {/* 1-Click Action Button */}
              {alert.actionType && (
                <div className="pt-1 flex justify-end">
                  <Button
                    size="sm"
                    variant={isCritical ? 'primary' : 'outline'}
                    className="text-[11px] py-1 px-3 flex items-center gap-1.5"
                    onClick={() => onApplyAction(alert)}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Apply Recommendation →</span>
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
