import React from 'react';
import { Bell, CheckCheck, Clock, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Notification } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export interface NotificationDrawerProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead?: () => void;
  onNotificationAction?: (notification: Notification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  id,
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNotificationAction
}) => {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <Modal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      title="System Notifications"
      subtitle="Operational advisories, slot updates, and alerts"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          {onMarkAllAsRead && (
            <Button
              variant="ghost"
              size="sm"
              icon={<CheckCheck className="w-4 h-4" />}
              onClick={onMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 rounded-xl border transition-colors ${
                notif.isRead
                  ? 'bg-slate-50/70 border-slate-200/60 text-slate-600'
                  : 'bg-emerald-50/40 border-emerald-200/80 text-slate-900 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-white border border-slate-200/60 shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.timeAgo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.actionLabel && (
                    <button
                      onClick={() => {
                        if (onNotificationAction) onNotificationAction(notif);
                        onClose();
                      }}
                      className="mt-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 flex items-center gap-1"
                    >
                      {notif.actionLabel} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
