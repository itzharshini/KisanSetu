import React from 'react';
import { ShieldCheck } from 'lucide-react';

export interface DemoBadgeProps {
  id?: string;
  type?: 'mode' | 'data';
  className?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  id,
  type = 'mode',
  className = ''
}) => {
  const isMode = type === 'mode';

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border border-amber-300 bg-amber-50 text-amber-900 select-none ${className}`}
      title="This environment displays mock data for application preview and architecture validation."
    >
      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
      <span>{isMode ? 'DEMO MODE' : 'DEMO DATA'}</span>
    </span>
  );
};
