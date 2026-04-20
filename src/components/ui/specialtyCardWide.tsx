import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpecialtyCardWideProps extends React.ComponentProps<'div'> {
  icon: LucideIcon;
  label: string;
  bgColor: string; // The "base" color (e.g., 'bg-pink-50')
  hoverColor: string; // The "hover" version (e.g., 'hover:bg-pink-50')
  textColor: string;
}

function SpecialtyCardWide({
  icon: Icon,
  label,
  bgColor,
  hoverColor,
  textColor,
  className,
  ...props
}: SpecialtyCardWideProps) {
  return (
    <div
      className={cn(
        'group flex flex-col items-center justify-center',
        'w-full h-28 sm:h-24 p-3',
        'border border-gray-200 rounded-2xl bg-white',
        'hover:shadow-md hover:border-transparent',
        'transition-all duration-300 cursor-pointer',
        hoverColor,
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'rounded-xl size-11 flex items-center justify-center',
          'transition-all duration-300 group-hover:scale-110',
          bgColor,
        )}
      >
        <Icon className={cn('size-5', textColor)} />
      </div>
      <span className='mt-2 text-[13px] font-base text-slate-900 text-center leading-tight'>
        {label}
      </span>
    </div>
  );
}
export { SpecialtyCardWide };
