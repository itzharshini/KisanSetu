import React from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DemoBadge } from '../../components/common/DemoBadge';
import { useKisanSetu } from '../../context/KisanSetuContext';

export const FarmerNotificationsPage: React.FC = () => {
  const { notifications, markAllNotificationsRead } = useKisanSetu();

  const farmerNotifs = notifications.filter(
    (n) => n.roleTarget === 'farmer' || !n.roleTarget
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 md:pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Notifications & Advisories
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time procurement alerts, arrival reminders, and mandi advisories
          </p>
        </div>

        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="py-1.5 px-3 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="space-y-3">
        {farmerNotifs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">No new notifications.</p>
          </div>
        ) : (
          farmerNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                n.isRead
                  ? 'bg-white border-slate-200 opacity-80'
                  : 'bg-white border-emerald-300 shadow-2xs'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {n.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                    {n.timeAgo}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
