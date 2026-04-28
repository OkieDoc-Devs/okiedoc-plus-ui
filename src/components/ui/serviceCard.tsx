import * as React from 'react';
import { Activity, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps extends React.ComponentProps<'div'> {
  title: string;
  description: string;
  imageUrl?: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

function ServiceCard({
  title,
  description,
  imageUrl,
  icon: Icon = Activity,
  onClick,
  className,
  ...props
}: ServiceCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 mt-2',
        'hover:shadow-xl transition-shadow duration-200',
        'w-full',
        className,
      )}
      {...props}
    >
      {/* Image Area */}
      <div className='relative h-44 sm:h-52 overflow-hidden rounded-t-2xl bg-gray-200'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full bg-gray-300 flex items-center justify-center'>
            <Icon className='size-16 text-gray-400' />
          </div>
        )}
        {/* Icon badge overlay */}
        <div className='absolute bottom-3 left-4 bg-white rounded-xl p-2 shadow-sm'>
          <Icon className='size-7 text-blue-500' strokeWidth={1.75} />
        </div>
      </div>

      {/* Text Area */}
      <div className='p-5 flex flex-col gap-1.5'>
        <span className='font-bold text-base text-slate-900'>{title}</span>
        <p className='text-sm text-slate-500 leading-snug'>{description}</p>
      </div>
    </div>
  );
}

export { ServiceCard };
export type { ServiceCardProps };
