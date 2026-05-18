import * as React from 'react';
import { useNavigate } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpecialtyCardProps extends React.ComponentProps<'div'> {
  icon: LucideIcon;
  label: string;
  bgColor: string; // The "base" color (e.g., 'bg-pink-50')
  hoverColor: string; // The "hover" version (e.g., 'hover:bg-pink-50')
  textColor: string;
}

function SpecialtyCard({
  icon: Icon,
  label,
  bgColor,
  hoverColor,
  textColor,
  className,
  ...props
}: SpecialtyCardProps) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        window.scrollTo(0, 0);
        navigate('/search');
      }}
      className={cn(
        'group flex flex-col items-center justify-center',
        'w-full h-44 sm:h-40 p-4',
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
          'rounded-2xl size-16 flex items-center justify-center',
          'transition-all duration-300 group-hover:scale-110',
          bgColor,
        )}
      >
        <Icon className={cn('size-8', textColor)} />
      </div>
      <span className='mt-4 text-[14px] font-bold text-slate-900 text-center leading-tight'>
        {label}
      </span>
    </div>
  );
}
export { SpecialtyCard };
