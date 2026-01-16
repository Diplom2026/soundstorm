import React from 'react';

const Logo = ({ size = 40 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1db954" />
          <stop offset="100%" stopColor="#1ed760" />
        </linearGradient>
      </defs>
      
      {/* Круговая волна */}
      <circle cx="50" cy="50" r="45" stroke="url(#logoGradient)" strokeWidth="3" fill="none" opacity="0.3"/>
      <circle cx="50" cy="50" r="35" stroke="url(#logoGradient)" strokeWidth="3" fill="none" opacity="0.5"/>
      
      {/* Центральный треугольник (play) */}
      <path d="M 40 30 L 40 70 L 70 50 Z" fill="url(#logoGradient)"/>
      
      {/* Звуковые волны */}
      <path d="M 75 35 Q 80 40, 75 45" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M 80 30 Q 88 40, 80 50" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      
      <path d="M 25 35 Q 20 40, 25 45" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M 20 30 Q 12 40, 20 50" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  );
};

export default Logo;