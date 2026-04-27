import { useEffect, useState } from 'react';
import { Phone, Clock3, Video, Save } from 'lucide-react';

const statusConfig = {
  new: {
    label: 'New',
    className: 'bg-green-50 text-green-600 border border-green-300',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-pink-50 text-pink-600 border border-pink-300',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border border-amber-300',
  },
  expired: {
    label: 'Expired',
    className: 'bg-gray-100 text-gray-500 border border-gray-300',
  },
};

const statusOptions = ['new', 'in_progress', 'pending', 'expired'];
const NOTES_MAX_LENGTH = 200;

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
  onSave,
  isSelected = false,
}) {
  const incomingStatus = statusConfig[callback.status]
    ? callback.status
    : 'new';
  const incomingNotes = String(callback.notes || '');

  const [draftStatus, setDraftStatus] = useState(incomingStatus);
  const [draftNotes, setDraftNotes] = useState(incomingNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setDraftStatus(incomingStatus);
    setDraftNotes(incomingNotes);
    setSaveError('');
  }, [callback.id, incomingStatus, incomingNotes]);

  const statusInfo = statusConfig[incomingStatus] || statusConfig.new;
  const channel = String(callback.callType || callback.contactMethod || '')
    .trim()
    .toLowerCase();
  const isVideo = channel.includes('video');

  const hasChanges =
    draftStatus !== incomingStatus || draftNotes !== incomingNotes;

  const notesLength = draftNotes.length;

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  const handleSave = async (event) => {
    event.stopPropagation();

    if (!onSave || !hasChanges || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      await onSave(callback.id, {
        status: draftStatus,
        notes: draftNotes,
      });
    } catch (error) {
      setSaveError(error?.message || 'Failed to update callback.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`w-full bg-white border-l-4 border border-blue-500 rounded-2xl hover:shadow-md transition-shadow duration-150 ${isSelected ? 'ring-2 ring-blue-300 ring-offset-1' : ''}`}
    >
      <button
        type='button'
        onClick={() => onSelect?.(callback)}
        title='Open callback details'
        className='w-full text-left px-4 pt-3.5 pb-2'
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

        <div className='flex flex-col gap-2 mt-1'>
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
        </div>

        <div className='flex items-center gap-1.5 text-gray-400 text-xs mt-2'>
          <Clock3 size={13} strokeWidth={2.2} />
          <span>{formatTime(callback.createdAt)}</span>
        </div>
      </button>

      <div
        className='px-4 pb-3 pt-2 border-t border-gray-100 space-y-2'
        onClick={stopPropagation}
      >
        <div className='flex items-center gap-2'>
          <span className='text-[11px] font-semibold text-gray-500 uppercase tracking-wide'>
            Status
          </span>
          <select
            value={draftStatus}
            onChange={(event) => setDraftStatus(event.target.value)}
            onClick={stopPropagation}
            className='ml-auto text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 bg-white'
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {statusConfig[option].label}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={draftNotes}
          rows={2}
          maxLength={NOTES_MAX_LENGTH}
          onClick={stopPropagation}
          onChange={(event) =>
            setDraftNotes(event.target.value.slice(0, NOTES_MAX_LENGTH))
          }
          placeholder='Add nurse notes for this callback...'
          className='w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:border-blue-400'
        />

        <div className='flex items-center justify-between gap-2'>
          <span className='text-[10px] text-gray-400'>
            {notesLength}/{NOTES_MAX_LENGTH} characters
          </span>
          <button
            type='button'
            onClick={handleSave}
            disabled={!onSave || !hasChanges || isSaving}
            className='inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-2.5 py-1.5 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Save size={12} strokeWidth={2.2} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {saveError ? (
          <p className='text-[11px] text-red-600'>{saveError}</p>
        ) : null}
      </div>
    </div>
  );
}
