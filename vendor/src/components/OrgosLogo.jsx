import React from 'react';

export default function OrgosLogo({ className = '', size = 'md' }) {
  // Dimension presets based on aesthetic choice
  const widthMap = {
    sm: 'w-24',
    md: 'w-32',
    lg: 'w-44',
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className} ${widthMap[size]}`}>
      {/* Handcrafted vector silhouette of lady & gentleman in high fashion apparel */}
      <svg
        className="text-[#175c2e]"
        width="80"
        height="100"
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lady Hat & Head */}
        <path
          d="M32 30 C 34 26, 42 26, 44 30 C 42 32, 34 32, 32 30 Z"
          fill="currentColor"
        />
        <path
          d="M24 33 C 32 33, 40 32, 48 33 C 54 33.5, 48 31, 40 31 C 32 31, 24 31.5, 24 33 Z"
          fill="currentColor"
        />
        {/* Lady Face Profile & Neck */}
        <path
          d="M37 34 C 36 36, 38 38, 38.5 40 C 37 41, 38 42, 39 42 C 39.5 39, 39 36, 37 34 Z"
          fill="currentColor"
        />
        {/* Lady Body/Gown */}
        <path
          d="M39 43 
             C 38 48, 35 52, 33 58 
             C 34 68, 31 78, 35 90 
             C 37 96, 34 102, 38 108
             C 41 108, 43 108, 45 108
             C 47 101, 43 96, 42 90
             C 43 82, 45 74, 46 66
             C 45 56.5, 41 49, 39 43 Z"
          fill="currentColor"
        />
        {/* Lady's elegant arm on hip */}
        <path
          d="M38 44 C 35 48, 33 51, 32 55 C 33 57, 34 56, 35 54 C 36 50, 39 47, 38 44 Z"
          fill="currentColor"
        />

        {/* Gentleman Head */}
        <circle cx="56" cy="28" r="4.5" fill="currentColor" />
        <path d="M53 28 L51 31 C51.5 31.5, 52 32, 53 32 L54.5 30 Z" fill="currentColor" />
        
        {/* Gentleman Suit (Jacket & Bowtie) */}
        <path
          d="M56 34 
             C 51 37, 49 41, 49 46
             L 50 63
             C 50 64, 52 66, 53 66
             L 54 66
             L 54 53
             L 56.5 59
             L 59 53
             L 59 66
             L 60 66
             C 61 66, 63 64, 63 63
             L 64 46
             C 64 41, 62 37, 57 34 Z"
          fill="currentColor"
        />
        
        {/* Gentleman Shirt Front/Lapels */}
        <path d="M55.5 36 L54 44 H59 L57.5 36 Z" fill="#ffffff" className="stroke-none" />
        {/* Elegant Bowtie */}
        <path d="M55 36.5 L56.5 38 L58 36.5 L56.5 35 Z" fill="currentColor" />

        {/* Gentleman Trousers */}
        <path
          d="M51 66 
             L 49 105 
             C 49 107, 51.5 107, 52 105
             L 55.5 82
             L 59 105
             C 59.5 107, 62 107, 62 105
             L 61 66 H 51 Z"
          fill="currentColor"
        />
        {/* Gentleman Left arm */}
        <path
          d="M49.5 44 
             C 47.5 48, 47 52, 48 55
             C 48.5 54, 49.5 53, 49.5 51
             C 48.5 48, 50.5 45, 49.5 44 Z"
          fill="currentColor"
        />
        {/* Gentleman Right arm */}
        <path
          d="M63 44 
             C 64.5 48, 65 52, 64 57
             C 63.5 57, 62.5 56, 62.5 54
             C 63.5 50, 62 46, 63 44 Z"
          fill="currentColor"
        />
      </svg>

      {/* Brand Name Text */}
      <h1 className="text-[#175c2e] font-sans font-black tracking-[0.25em] text-3xl leading-none mt-2 select-none">
        ORGOS
      </h1>

      {/* Elegant Dot & Line Separator */}
      <div className="flex items-center gap-2 my-1 text-[#175c2e] opacity-90">
        <div className="h-[1px] w-8 bg-current"></div>
        <div className="flex gap-1 items-center">
          <span className="w-1 h-1 rounded-full bg-current"></span>
          <span className="w-2 h-2 rounded-full bg-current font-black"></span>
          <span className="w-1 h-1 rounded-full bg-current"></span>
        </div>
        <div className="h-[1px] w-8 bg-current"></div>
      </div>

      {/* Subtitle */}
      <span className="text-[#175c2e] uppercase font-sans font-semibold tracking-[0.15em] text-[10px] whitespace-nowrap">
        Garment Solution
      </span>
    </div>
  );
}
