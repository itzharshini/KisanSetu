import React from 'react';
import { Card } from './Card';

export interface KPICardProps {
  id?: string;
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'info' | 'neutral';
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  id,
  title,
  value,
  unit,
  subtitle,
  icon,
  badgeText,
  badgeVariant = 'success',
  className = ''
}) => {
  const badgeStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <Card id={id} padding="md" className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-slate-600 tracking-tight">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              {value}
            </span>
            {unit && <span className="text-xs sm:text-sm font-medium text-slate-500">{unit}</span>}
          </div>
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/60 shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || badgeText) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {badgeText && (
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${badgeStyles[badgeVariant]}`}>
              {badgeText}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
