import * as React from 'react';
import { Search, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepsCardProps extends React.ComponentProps<'div'> {
  step: number;
  title: string;
  description: string;
  icon?: LucideIcon;
  iconBgClassName?: string;
  onClick?: () => void;
}

function StepsCard({
  step,
  title,
  description,
  icon: Icon = Search,
  iconBgClassName = 'bg-blue-500',
  onClick,
  className,
  ...props
}: StepsCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-5 pt-8',
        'hover:shadow-lg transition-shadow duration-200',
        'w-full',
        className,
      )}
      {...props}
    >
      <div className='absolute -top-4 -left-2 flex items-center justify-center size-8 rounded-full bg-blue-600 text-white text-sm font-bold shadow-sm select-none'>
        {step}
      </div>

      <div
        className={cn(
          'flex items-center justify-center size-14 rounded-2xl mb-4',
          iconBgClassName,
        )}
      >
        <Icon className='size-7 text-white' strokeWidth={2} />
      </div>

      <span className='font-bold text-base text-slate-900 mb-1.5'>{title}</span>
      <p className='text-sm text-slate-500 leading-snug'>{description}</p>
    </div>
  );
}

export { StepsCard };
export type { StepsCardProps };
