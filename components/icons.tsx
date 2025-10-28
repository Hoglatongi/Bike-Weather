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

export const TemperatureIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" transform="scale(0.8) translate(3, 3)"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75V5.25m0 13.5a2.25 2.25 0 01-2.25-2.25V7.5a2.25 2.25 0 014.5 0v9a2.25 2.25 0 01-2.25 2.25z" />
    <path d="M7.5 12h-1.5m12 0h-1.5m-6-3.75h-1.5m6 0h-1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
    </svg>
);

export const BikeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18.5" cy="17.5" r="3.5"/>
        <circle cx="5.5" cy="17.5" r="3.5"/>
        <circle cx="15" cy="5" r="1"/>
        <path d="M12 17.5h-2.5l1.5-5L8 5"/>
    </svg>
);

export const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const WindArrowIcon: React.FC<{ className?: string; rotation?: number }> = ({ className, rotation = 0 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ transform: `rotate(${rotation}deg)` }}
    aria-hidden="true"
  >
    <path d="M12 19V5"/>
    <path d="m5 12 7-7 7 7"/>
  </svg>
);

export const SnowflakeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20m-8-8-4 4 4 4m8 0-4 4 4 4m0-16 4 4-4 4M2 12l4-4-4-4" />
    </svg>
);