import React from 'react';

export interface StatusBadgeProps {
  id?: string;
  status:
    | 'open'
    | 'optimal'
    | 'congested'
    | 'closed'
    | 'confirmed'
    | 'arrived'
    | 'weighed'
    | 'completed'
    | 'cancelled'
    | 'waiting'
    | 'Low'
    | 'Moderate'
    | 'High'
    | string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  id,
  status,
  label,
  className = '',
  size = 'md'
}) => {
  const normStatus = status.toLowerCase();

  let config = {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    display: label || status
  };

  if (['open', 'optimal', 'confirmed', 'completed', 'low'].includes(normStatus)) {
    config = {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-600',
      display: label || (normStatus === 'low' ? 'Low Traffic' : status)
    };
  } else if (['moderate', 'waiting', 'at_gate', 'in_transit'].includes(normStatus)) {
    config = {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      display: label || (normStatus === 'moderate' ? 'Moderate Load' : status)
    };
  } else if (['arrived', 'weighed', 'called'].includes(normStatus)) {
    config = {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-600',
      display: label || status
    };
  } else if (['congested', 'closed', 'cancelled', 'high'].includes(normStatus)) {
    config = {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      dot: 'bg-rose-600',
      display: label || (normStatus === 'high' ? 'High Congestion' : status)
    };
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm font-medium';

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />
      <span className="capitalize">{config.display}</span>
    </span>
  );
};
