import React, { useEffect, useRef, useState } from 'react';
import { apiRequest, API_BASE_URL } from '../../api/apiClient';
import './JitsiMeetCall.css';

/**
 * JitsiMeetCall Wrapper matches the older VideoCall signature.
 *
 * Props needed:
 * @param {boolean} isOpen - Boolean indicating if the modal should be rendered.
 * @param {function} onClose - Callback when the call ends or modal closes.
 * @param {string} callType - "video" or "audio".
 * @param {object} patient - Has { name, avatar, id }.
 * @param {object} currentUser - Has { firstName, lastName, email, profileUrl }.
 */
const JitsiMeetCall = ({
  isOpen,
  onClose,
  callType,
  patient,
  currentUser,
  ticketId,
  isPopout = false,
}) => {
  const jitsiContainerRef = useRef(null);
  const initInProgressRef = useRef(false);
  const closingInProgressRef = useRef(false);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let apiInstance = null;
    let isCancelled = false;

    const initJitsi = async () => {
      try {
        if (initInProgressRef.current) return;
        initInProgressRef.current = true;

        if (isCancelled) return;
        setLoading(true);
        setError(null);

        const currentId = currentUser?.id || currentUser?.uid || 'UnknownUser';
        const participantId =
          patient?.id || patient?.uid || 'UnknownParticipant';
        const sortedIds = [String(currentId), String(participantId)].sort();
        const roomName = ticketId
          ? `OkieDoc_Consultation_Ticket_${ticketId}`
          : `OkieDoc_Consultation_${sortedIds[0]}_${sortedIds[1]}`;

        const participantAvatar = currentUser?.profileUrl
          ? String(currentUser.profileUrl).startsWith('http')
            ? currentUser.profileUrl
            : `${API_BASE_URL}${currentUser.profileUrl}`
          : '';

        const tokenData = await apiRequest('/api/v1/comms/8x8-token', {
          method: 'POST',
          body: JSON.stringify({
            roomName: roomName,
            participantName: currentUser?.firstName
              ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
              : 'OkieDoc User',
            participantAvatar: participantAvatar,
            participantEmail: currentUser?.email || '',
            ticketId: ticketId,
          }),
        });

        if (isCancelled) return;

        const jwt = tokenData.token;
        const appId = tokenData.appId;
        setIsHost(!!tokenData.isHost);

        if (!appId) {
          throw new Error(
            'Video service configuration error: missing appId from token endpoint.',
          );
        }

        if (!window.JitsiMeetExternalAPI) {
          throw new Error(
            '8x8 JaaS External API script not loaded. Please verify index.html.',
          );
        }

        if (isCancelled) return;

        const domain = '8x8.vc';

        const options = {
          roomName: `${appId}/${roomName}`,
          jwt: jwt,
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: callType === 'audio',
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            SHOW_CHROME_EXTENSION_BANNER: false,
            disableDeepLinking: true,
          },
        };

        apiInstance = new window.JitsiMeetExternalAPI(domain, options);

        apiInstance.addEventListener('readyToClose', () => {
          handleClose(!!tokenData.isHost);
        });

        apiInstance.addEventListener('videoConferenceLeft', () => {
          handleClose(!!tokenData.isHost);
        });

        setJitsiApi(apiInstance);
      } catch (err) {
        if (isCancelled) return;
        console.error('Failed to initialize 8x8 JaaS Call:', err);
        setError(
          err.message || 'Failed to connect to the secure video server.',
        );
      } finally {
        initInProgressRef.current = false;
        if (isCancelled) return;
        setLoading(false);
      }
    };

    initJitsi();

    return () => {
      isCancelled = true;
      initInProgressRef.current = false;
      if (apiInstance) {
        try {
          apiInstance.dispose();
        } catch (e) {
          console.warn('Error disposing Jitsi instance:', e);
        }
      }
    };
  }, [isOpen]);

  const handleClose = async () => {
    if (closingInProgressRef.current) return;
    closingInProgressRef.current = true;

    if (ticketId) {
      try {
        await apiRequest('/api/v1/comms/end-call', {
          method: 'POST',
          body: JSON.stringify({ ticketId }),
        });
      } catch (err) {
        console.warn('Failed to notify backend about call end:', err);
      }
    }

    if (jitsiApi) {
      try {
        jitsiApi.dispose();
      } catch (e) {}
    }
    setJitsiApi(null);
    onClose();
    if (isPopout) {
      window.close();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={isPopout ? 'jitsi-call-popout-container' : 'jitsi-call-overlay'}>
      <div className={isPopout ? 'jitsi-call-popout' : 'jitsi-call-modal'}>
        <div className='jitsi-call-header'>
          <h3>
            OkieDoc+ Secure {callType === 'video' ? 'Video' : 'Audio'}{' '}
            Consultation
          </h3>
          <button className='jitsi-close-button' onClick={() => handleClose()}>
            &times;
          </button>
        </div>

        {loading && (
          <div className='jitsi-loading-state'>
            <div className='jitsi-spinner'></div>
            <p>Connecting to secure server...</p>
          </div>
        )}

        {error && (
          <div className='jitsi-error-state'>
            <p className='jitsi-error-text'>Connection Error: {error}</p>
            <button
              className='jitsi-retry-btn'
              onClick={() => {
                setLoading(true);
                setError(null);
                setJitsiApi(null);
              }}
            >
              Retry
            </button>
          </div>
        )}

        <div
          ref={jitsiContainerRef}
          className='jitsi-video-container'
          style={{ display: loading || error ? 'none' : 'block' }}
        ></div>
      </div>
    </div>
  );
};

export default JitsiMeetCall;
