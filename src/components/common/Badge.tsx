import React from 'react';

export interface BadgeProps {
  id?: string;
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  id,
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon
}) => {
  const variantStyles = {
    default: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    success: 'bg-emerald-100/70 text-emerald-800 border-emerald-300',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1',
    md: 'px-2.5 py-1 text-xs sm:text-sm font-medium gap-1.5'
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-md border tracking-tight select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
