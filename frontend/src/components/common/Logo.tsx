import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Geometric Architectural Grid Symbol */}
      <div className={`${iconSizes[size]} bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded flex items-center justify-center p-1.5 shadow-sm`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Blueprint Structural Grid & Room Boundary Lines */}
          <rect x="4" y="4" width="32" height="32" rx="2" stroke="currentColor" strokeWidth="2.5" strokeDasharray="32" />
          <line x1="18" y1="4" x2="18" y2="36" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
          <rect x="8" y="8" width="8" height="10" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
          <rect x="22" y="24" width="10" height="8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`${textSizes[size]} font-bold tracking-tight text-slate-900 dark:text-white`}>
            ASAS
          </span>
          <span className="text-[10px] font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
            SMART ARCHITECTURE
          </span>
        </div>
      )}
    </div>
  );
};
