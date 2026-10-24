import React, { useState } from 'react';

const amecoLogoImg = '/assets/images/ameco_logo_1785844574405.jpg';

interface AmecoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const AmecoLogo: React.FC<AmecoLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const dimensions = {
    sm: { box: 'w-10 h-10', text: 'text-base', title: 'text-sm font-bold', sub: 'text-[10px]' },
    md: { box: 'w-14 h-14', text: 'text-xl', title: 'text-base sm:text-lg font-extrabold', sub: 'text-xs' },
    lg: { box: 'w-20 h-20 sm:w-24 sm:h-24', text: 'text-3xl', title: 'text-xl sm:text-2xl font-black', sub: 'text-sm' },
    xl: { box: 'w-28 h-28 sm:w-32 sm:h-32', text: 'text-4xl', title: 'text-2xl sm:text-3xl font-black', sub: 'text-base' },
  }[size];

  return (
    <div className={`flex items-center space-x-3.5 select-none ${className}`}>
      {/* Real AMECO Red Square Logo matching user image */}
      <div className={`relative ${dimensions.box} bg-[#E00000] rounded-xl shadow-lg overflow-hidden flex items-end justify-center pb-0.5 border border-red-700 transition-transform hover:scale-105 shrink-0`}>
        {!imgError ? (
          <img
            src={amecoLogoImg}
            alt="AMECO Logo"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <>
            {/* White right vertical accent strip matching AMECO logo specification */}
            <div className="absolute top-0 right-[3px] w-[3px] h-full bg-white opacity-95 z-10"></div>
            
            {/* Bold White Amharic Script "አሚኮ" */}
            <span
              className={`${dimensions.text} font-black text-white tracking-tighter leading-none font-sans pr-1 z-10`}
              style={{
                fontFamily: "'Noto Sans Ethiopic', 'Abyssinica SIL', 'Nyala', 'Ethiopic', sans-serif",
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                letterSpacing: '-0.05em',
              }}
            >
              አሚኮ
            </span>
          </>
        )}
      </div>

      {/* Brand Text */}
      <div>
        <span className={`tracking-tight text-red-600 dark:text-red-500 block leading-snug ${dimensions.title}`}>
          Amhara Media Corporation
        </span>
      </div>
    </div>
  );
};
