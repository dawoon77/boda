import React from 'react';

interface BaseballIconProps {
  className?: string;
}

export function BaseballIcon({ className = 'w-5.5 h-5.5' }: BaseballIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 야구공 외곽 원 */}
      <circle cx="12" cy="12" r="9.5" />
      
      {/* 좌측 실밥 곡선 */}
      <path d="M7 3.8C9.6 6.5 10.6 9.3 10.6 12C10.6 14.7 9.6 17.5 7 20.2" />
      {/* 좌측 실밥 땀 (stitching) */}
      <line x1="6.8" y1="5.6" x2="8.8" y2="4.8" />
      <line x1="8.1" y1="8.6" x2="10.2" y2="8.0" />
      <line x1="8.6" y1="12" x2="10.8" y2="12" />
      <line x1="8.1" y1="15.4" x2="10.2" y2="16.0" />
      <line x1="6.8" y1="18.4" x2="8.8" y2="19.2" />

      {/* 우측 실밥 곡선 */}
      <path d="M17 3.8C14.4 6.5 13.4 9.3 13.4 12C13.4 14.7 14.4 17.5 17 20.2" />
      {/* 우측 실밥 땀 (stitching) */}
      <line x1="17.2" y1="5.6" x2="15.2" y2="4.8" />
      <line x1="15.9" y1="8.6" x2="13.8" y2="8.0" />
      <line x1="15.4" y1="12" x2="13.2" y2="12" />
      <line x1="15.9" y1="15.4" x2="13.8" y2="16.0" />
      <line x1="17.2" y1="18.4" x2="15.2" y2="19.2" />
    </svg>
  );
}
