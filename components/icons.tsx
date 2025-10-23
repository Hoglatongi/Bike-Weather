
import React from 'react';

export const WindIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1a2 2 0 100 4h1m-1-4a2 2 0 110-4h1m5 4h-1a2 2 0 100 4h1m-1-4a2 2 0 110-4h1M6 12a6 6 0 0112 0Z" />
  </svg>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export const RainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-2-9.586A5.002 5.002 0 0012 5a5.002 5.002 0 00-5 5c0 .786.155 1.536.434 2.218M15 19l-1 1M12 21l-1 1M9 19l-1 1" />
  </svg>
);

export const RainDropIcon: React.FC<{ className?: string; percentage: number }> = ({ className, percentage }) => {
    const gradientId = `rain-drop-gradient-${React.useId()}`;
    const safePercentage = Math.max(0, Math.min(100, percentage));
    const fillOffset = 100 - safePercentage;
  
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" aria-label={`Rain probability: ${percentage}%`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset={`${fillOffset}%`} stopColor="rgba(100, 116, 139, 0.4)" />
            <stop offset={`${fillOffset}%`} stopColor="#5eead4" />
          </linearGradient>
        </defs>
        <path
          stroke="#94a3b8"
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          d="M12 2.69l5.66 5.66a8 8 0 11-11.32 0L12 2.69z"
        />
      </svg>
    );
};

export const LocationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
