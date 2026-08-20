import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      {/* House Outline */}
      <path 
        d="M10 40L50 10L90 40V85H10V40Z" 
        stroke="#0f172a" 
        strokeWidth="4" 
        strokeLinejoin="round" 
      />
      {/* Furniture Elements */}
      <rect x="20" y="45" width="15" height="30" fill="url(#goldGradient)" rx="1" />
      <rect x="40" y="45" width="40" height="5" fill="url(#goldGradient)" rx="1" />
      <rect x="40" y="55" width="18" height="20" fill="url(#goldGradient)" rx="1" />
      <rect x="62" y="55" width="18" height="20" fill="url(#goldGradient)" rx="1" />
      <rect x="45" y="60" width="8" height="1" fill="#000" opacity="0.2" />
      <rect x="67" y="60" width="8" height="1" fill="#000" opacity="0.2" />
    </svg>
  );
};