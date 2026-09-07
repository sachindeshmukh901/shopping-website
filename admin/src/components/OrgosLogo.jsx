import React from 'react';
import orgosLogoImg from '../image 80 (1).png';

export default function OrgosLogo({ className = "" }) {
  return (
    <div className={`flex flex-col items-center select-none w-52 ${className}`}>
      <img
        src={orgosLogoImg}
        alt="ORGOS Garments Solution"
        className="w-full h-auto object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

