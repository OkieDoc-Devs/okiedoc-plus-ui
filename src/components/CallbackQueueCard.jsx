import React from 'react';
import { Phone, Clock3, Video } from 'lucide-react';

const statusConfig = {
  new: {
    label: 'New',
    className: 'bg-green-50 text-green-600 border border-green-300',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-pink-50 text-pink-600 border border-pink-300',
  },
  expired: {
    label: 'Expired',
    className: 'bg-gray-100 text-gray-500 border border-gray-300',
  },
};

const formatTime = (dateString) => {
  if (!dateString) return '--:--';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '--:--';
  }
};

export default function CallbackQueueCard({
  callback,
  onSelect,
  isSelected = false,
}) {
  const statusInfo = statusConfig[callback.status] || statusConfig.new;
  const channel = String(callback.callType || callback.contactMethod || '')
    .trim()
    .toLowerCase();
  const isVideo = channel.includes('video');

  return (
    <button
      type='button'
      onClick={() => onSelect?.(callback)}
      title='Open callback details'
      className={`w-full bg-white border-l-4 border border-blue-500 rounded-2xl px-4 pt-3.5 pb-3 flex flex-col gap-1.5 text-left cursor-pointer hover:shadow-md transition-shadow duration-150 ${isSelected ? 'ring-2 ring-blue-300 ring-offset-1' : ''}`}
    >
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-1.5'>
          <span className='text-xs font-semibold text-gray-500'>
            {callback.callbackNumber}
          </span>
          <span className='text-xs font-semibold text-green-600 border border-green-500 rounded-full px-2.5 py-0.5 leading-none'>
            Callback
          </span>
        </div>
        <span
          className={`text-xs font-semibold rounded-full px-3 py-0.5 leading-none ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className='flex flex-col gap-2'>
        <div className='text-sm font-bold text-gray-800 mt-0.5'>
          {callback.fullName}
        </div>

        <div className='flex items-center gap-2 text-gray-500 text-xs'>
          {isVideo ? (
            <Video size={14} strokeWidth={2.2} className='text-blue-400' />
          ) : (
            <Phone size={14} strokeWidth={2.2} className='text-blue-400' />
          )}
          <span>Callback Request</span>
        </div>

        <div className='flex items-center gap-2 text-xs text-blue-800'>
          <Phone size={14} strokeWidth={2.2} className='text-blue-400' />
          <span>{callback.contactNumber}</span>
        </div>

        {callback.notes && (
          <div className='bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-600 mt-1'>
            {callback.notes}
          </div>
        )}
      </div>

      <div className='flex items-center gap-1.5 text-gray-400 text-xs mt-1'>
        <Clock3 size={13} strokeWidth={2.2} />
        <span>{formatTime(callback.createdAt)}</span>
      </div>
    </button>
  );
}
