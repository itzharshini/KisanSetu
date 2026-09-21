import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  id?: string;
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  id,
  message = 'Loading KisanSetu module...',
  className = ''
}) => {
  return (
    <div
      id={id}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 animate-pulse border border-emerald-100">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-700">{message}</p>
      <span className="text-xs text-slate-400 mt-1">Connecting to intelligent procurement coordinator</span>
    </div>
  );
};
