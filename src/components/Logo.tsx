import React from 'react';
import logoImg from '../assets/images/elitetv_logo_1791855590776.jpg';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'icon-only' | 'stacked';
  showBadge?: boolean;
  className?: string;
  glow?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  showBadge = true,
  className = '',
  glow = true
}) => {
  // Dimensions for the icon
  const iconDimensions = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }[size];

  // Font sizes for the text
  const textSizes = {
    xs: 'text-lg',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl'
  }[size];

  // Badge sizes
  const badgeSizes = {
    xs: 'text-[8px] px-1 py-0.2',
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
    xl: 'text-sm px-3 py-1'
  }[size];

  const iconElement = (
    <div className={`relative flex-shrink-0 group ${iconDimensions}`}>
      {/* Background radial glow */}
      {glow && (
        <div className="absolute inset-0 bg-red-600/35 rounded-2xl blur-md -z-10 group-hover:bg-red-500/50 transition-all duration-300" />
      )}
      <img
        src={logoImg}
        alt="EliteTV Logo"
        className="w-full h-full object-cover rounded-xl shadow-lg border border-red-500/30 group-hover:border-red-400/60 transition-all duration-300"
      />
    </div>
  );

  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {iconElement}
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-2.5 ${className}`}>
        {iconElement}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 drop-shadow-md ${textSizes}`}>
              ELITETV
            </span>
            {showBadge && (
              <span className={`font-extrabold uppercase tracking-widest rounded-md bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm border border-amber-400/40 ${badgeSizes}`}>
                4K PRO
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
            IPTV Streaming Premium
          </span>
        </div>
      </div>
    );
  }

  // Default 'horizontal'
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {iconElement}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 drop-shadow-md ${textSizes}`}>
            ELITETV
          </span>
          {showBadge && (
            <span className={`font-extrabold uppercase tracking-widest rounded-md bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm border border-amber-400/30 ${badgeSizes}`}>
              IPTV PRO
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider hidden sm:block">
          Plataforma Oficial
        </span>
      </div>
    </div>
  );
};

export default Logo;
