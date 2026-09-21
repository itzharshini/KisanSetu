import React from 'react';

export interface CardProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export const Card: React.FC<CardProps> = ({
  id,
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = 'md',
  border = true
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const interactiveStyles = hoverable || onClick
    ? 'cursor-pointer hover:shadow-md hover:border-emerald-300/80 transition-all active:scale-[0.99]'
    : 'shadow-xs';

  const borderStyle = border ? 'border border-slate-200/90' : '';

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-xl ${borderStyle} ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
    >
      {children}
    </div>
  );
};
