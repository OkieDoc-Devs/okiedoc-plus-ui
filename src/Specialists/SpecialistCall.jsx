import React, { useState, useEffect, useRef } from 'react';
import { 
  FaPhone, FaVideo, FaTimes, FaMicrophone, FaMicrophoneSlash,
  FaVideoSlash, FaVolumeUp, FaVolumeMute, FaUser, FaUserMd
} from 'react-icons/fa';

/**
 * Specialist Call/Video Call Component
 * All-in-one component with embedded styles
 */
const SpecialistCall = ({ 
  isOpen, 
  onClose, 
  callType = 'audio', // 'audio' or 'video'
  patient = null,
  currentUser = null
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting', 'ringing', 'active', 'ended'
  const [isIncoming, setIsIncoming] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const callTimerRef = useRef(null);

  // Simulate call connection
  useEffect(() => {
    if (isOpen && callStatus === 'connecting') {
      // Simulate connection delay
      setTimeout(() => {
        setCallStatus('ringing');
        setTimeout(() => {
          setCallStatus('active');
          startCallTimer();
          initializeMedia();
        }, 2000);
      }, 1000);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      stopMedia();
    };
  }, [isOpen, callStatus]);

  const initializeMedia = async () => {
    try {
      const constraints = {
        audio: true,
        video: callType === 'video' && !isVideoOff
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && callType === 'video' && !isVideoOff) {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate remote video (in real app, this would come from WebRTC)
      if (remoteVideoRef.current && callType === 'video') {
        // For demo purposes, we'll just show a placeholder
        // In production, this would be the remote stream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const stopMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
  };

  const handleVideoToggle = () => {
    setIsVideoOff(!isVideoOff);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = isVideoOff ? localStreamRef.current : null;
    }
  };

  const handleSpeakerToggle = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    stopMedia();
    setTimeout(() => {
      onClose();
      setCallStatus('connecting');
      setCallDuration(0);
    }, 1000);
  };

  const handleAcceptCall = () => {
    setIsIncoming(false);
    setCallStatus('active');
    startCallTimer();
    initializeMedia();
  };

  const handleRejectCall = () => {
    handleEndCall();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{specialistCallStyles}</style>
      <div className="specialist-call-overlay">
        <div className="specialist-call-container">
          {/* Call Header */}
          <div className="specialist-call-header">
            <div className="specialist-call-info">
              <div className="specialist-call-avatar">
                {patient?.avatar ? (
                  <img src={patient.avatar} alt={patient.name} />
                ) : (
                  <FaUser />
                )}
              </div>
              <div className="specialist-call-details">
                <h3 className="specialist-call-name">{patient?.name || 'Patient'}</h3>
                <p className="specialist-call-status">
                  {callStatus === 'connecting' && 'Connecting...'}
                  {callStatus === 'ringing' && 'Ringing...'}
                  {callStatus === 'active' && formatDuration(callDuration)}
                  {callStatus === 'ended' && 'Call Ended'}
                </p>
                {callType === 'video' && callStatus === 'active' && (
                  <p className="specialist-call-type">Video Call</p>
                )}
                {callType === 'audio' && callStatus === 'active' && (
                  <p className="specialist-call-type">Audio Call</p>
                )}
              </div>
            </div>
            <button 
              className="specialist-call-close-btn"
              onClick={handleEndCall}
              title="End Call"
            >
              <FaTimes />
            </button>
          </div>

          {/* Video Area */}
          {callType === 'video' && callStatus === 'active' && (
            <div className="specialist-call-video-area">
              <div className="specialist-remote-video">
                {remoteVideoRef.current?.srcObject ? (
                  <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline
                    className="specialist-video-element"
                  />
                ) : (
                  <div className="specialist-video-placeholder">
                    <div className="specialist-video-placeholder-avatar">
                      {patient?.avatar ? (
                        <img src={patient.avatar} alt={patient.name} />
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <p className="specialist-video-placeholder-name">{patient?.name || 'Patient'}</p>
                  </div>
                )}
              </div>
              <div className="specialist-local-video">
                {!isVideoOff && localVideoRef.current?.srcObject ? (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="specialist-video-element small"
                  />
                ) : (
                  <div className="specialist-video-placeholder small">
                    <div className="specialist-video-placeholder-avatar">
                      {currentUser?.profileImage ? (
                        <img src={currentUser.profileImage} alt="You" />
                      ) : (
                        <FaUserMd />
                      )}
                    </div>
                  </div>
                )}
                {isVideoOff && (
                  <div className="specialist-video-off-indicator">
                    <FaVideoSlash />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audio Call View */}
          {callType === 'audio' && callStatus === 'active' && (
            <div className="specialist-call-audio-area">
              <div className="specialist-call-audio-avatar-large">
                {patient?.avatar ? (
                  <img src={patient.avatar} alt={patient.name} />
                ) : (
                  <FaUser />
                )}
              </div>
              <div className="specialist-call-audio-pulse"></div>
            </div>
          )}

          {/* Connecting/Ringing View */}
          {(callStatus === 'connecting' || callStatus === 'ringing') && (
            <div className="specialist-call-connecting-area">
              <div className="specialist-call-connecting-avatar">
                {patient?.avatar ? (
                  <img src={patient.avatar} alt={patient.name} />
                ) : (
                  <FaUser />
                )}
              </div>
              <div className="specialist-call-connecting-pulse"></div>
              <div className="specialist-call-connecting-pulse delay-1"></div>
              <div className="specialist-call-connecting-pulse delay-2"></div>
            </div>
          )}

          {/* Incoming Call */}
          {isIncoming && callStatus === 'ringing' && (
            <div className="specialist-call-incoming">
              <button 
                className="specialist-call-accept-btn"
                onClick={handleAcceptCall}
                title="Accept Call"
              >
                <FaPhone />
              </button>
              <button 
                className="specialist-call-reject-btn"
                onClick={handleRejectCall}
                title="Reject Call"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* Call Controls */}
          {callStatus === 'active' && (
            <div className="specialist-call-controls">
              <button
                className={`specialist-call-control-btn ${isMuted ? 'active' : ''}`}
                onClick={handleMuteToggle}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>

              {callType === 'video' && (
                <button
                  className={`specialist-call-control-btn ${isVideoOff ? 'active' : ''}`}
                  onClick={handleVideoToggle}
                  title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
                >
                  {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
                </button>
              )}

              <button
                className={`specialist-call-control-btn ${!isSpeakerOn ? 'active' : ''}`}
                onClick={handleSpeakerToggle}
                title={isSpeakerOn ? 'Turn Off Speaker' : 'Turn On Speaker'}
              >
                {isSpeakerOn ? <FaVolumeUp /> : <FaVolumeMute />}
              </button>

              <button
                className="specialist-call-end-btn"
                onClick={handleEndCall}
                title="End Call"
              >
                <FaPhone />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Embedded CSS Styles
const specialistCallStyles = `
.specialist-call-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: specialist-call-fade-in 0.3s ease;
}

@keyframes specialist-call-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.specialist-call-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: white;
  position: relative;
}

.specialist-call-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.specialist-call-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.specialist-call-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #4aa7ed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  overflow: hidden;
}

.specialist-call-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.specialist-call-details h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.specialist-call-status {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #ccc;
}

.specialist-call-type {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #999;
}

.specialist-call-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 18px;
}

.specialist-call-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* Video Call Area */
.specialist-call-video-area {
  flex: 1;
  position: relative;
  background: #000;
  overflow: hidden;
}

.specialist-remote-video {
  width: 100%;
  height: 100%;
  position: relative;
}

.specialist-local-video {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 200px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: #1a1a1a;
}

.specialist-video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.specialist-video-element.small {
  transform: scaleX(-1);
}

.specialist-video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
}

.specialist-video-placeholder.small {
  flex-direction: row;
}

.specialist-video-placeholder-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #4aa7ed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  overflow: hidden;
}

.specialist-video-placeholder.small .specialist-video-placeholder-avatar {
  width: 60px;
  height: 60px;
  font-size: 24px;
}

.specialist-video-placeholder-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.specialist-video-placeholder-name {
  margin-top: 10px;
  font-size: 16px;
  color: #ccc;
}

.specialist-video-off-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 24px;
}

/* Audio Call Area */
.specialist-call-audio-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.specialist-call-audio-avatar-large {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: #4aa7ed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  position: relative;
  z-index: 2;
  overflow: hidden;
  border: 4px solid rgba(74, 167, 237, 0.3);
}

.specialist-call-audio-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.specialist-call-audio-pulse {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 2px solid #4aa7ed;
  animation: specialist-pulse 2s infinite;
}

@keyframes specialist-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Connecting Area */
.specialist-call-connecting-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.specialist-call-connecting-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #4aa7ed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  position: relative;
  z-index: 2;
  overflow: hidden;
}

.specialist-call-connecting-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.specialist-call-connecting-pulse {
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 3px solid #4aa7ed;
  animation: specialist-connecting-pulse 2s infinite;
}

.specialist-call-connecting-pulse.delay-1 {
  animation-delay: 0.3s;
}

.specialist-call-connecting-pulse.delay-2 {
  animation-delay: 0.6s;
}

@keyframes specialist-connecting-pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Call Controls */
.specialist-call-controls {
  padding: 30px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background: rgba(0, 0, 0, 0.5);
}

.specialist-call-control-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 24px;
}

.specialist-call-control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.specialist-call-control-btn.active {
  background: #f44336;
  color: white;
}

.specialist-call-end-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: none;
  background: #f44336;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 28px;
  transform: rotate(135deg);
}

.specialist-call-end-btn:hover {
  background: #d32f2f;
  transform: rotate(135deg) scale(1.1);
}

/* Incoming Call */
.specialist-call-incoming {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 20;
}

.specialist-call-accept-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: none;
  background: #4caf50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 28px;
}

.specialist-call-accept-btn:hover {
  background: #45a049;
  transform: scale(1.1);
}

.specialist-call-reject-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: none;
  background: #f44336;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 28px;
}

.specialist-call-reject-btn:hover {
  background: #d32f2f;
  transform: scale(1.1);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .specialist-local-video {
    width: 120px;
    height: 90px;
    bottom: 10px;
    right: 10px;
  }

  .specialist-call-controls {
    padding: 20px 15px;
    gap: 15px;
  }

  .specialist-call-control-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .specialist-call-end-btn {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }

  .specialist-call-audio-avatar-large {
    width: 150px;
    height: 150px;
    font-size: 60px;
  }
}
`;

export default SpecialistCall;

