import * as React from 'react';
import { useNavigate } from 'react-router';
import { User, Star, Video, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpecialistCardProps extends React.ComponentProps<'div'> {
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  onConsult?: () => void;
  icon?: LucideIcon;
  doctorId?: number | string;
}

function SpecialistCard({
  name,
  specialization,
  experience,
  rating,
  reviewCount,
  imageUrl,
  onConsult,
  icon: Icon = User,
  doctorId,
  className,
  ...props
}: SpecialistCardProps) {
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-all bg-white border border-gray-100',
        'w-full  xl:w-150 2xl:w-90',
        className,
      )}
      {...props}
    >
      <div className='bg-blue-100 items-center flex justify-center h-80 sm:h-96 rounded-t-xl overflow-hidden'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <Icon className='bg-blue-200 size-40 text-blue-300 rounded-full p-4' />
        )}
      </div>

      <div className='p-6'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <span className='font-bold text-lg text-slate-900'>{name}</span>
            <span className='text-md font-medium text-blue-600'>
              {specialization}
            </span>
            <span className='text-md text-gray-600 leading-relaxed'>
              {experience}
            </span>
          </div>

          <div className='flex items-center gap-1.5'>
            <Star className='size-5 fill-yellow-400 text-yellow-400' />
            <span className='font-semibold text-slate-900'>
              {rating.toFixed(1)}
            </span>
            <span className='text-gray-500 text-sm'>
              ({reviewCount} reviews)
            </span>
          </div>

          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate(`/specialist/1`);
            }}
            className={cn(
              'flex items-center justify-center gap-2 w-full p-3 mt-2',
              'bg-blue-600 hover:bg-blue-700 text-white font-medium',
              'rounded-lg transition-all duration-200 cursor-pointer active:scale-[0.98]',
            )}
          >
            <Video className='size-4' />
            Consult Now
          </button>
        </div>
      </div>
    </div>
  );
}

export { SpecialistCard };
