import React, { useState, useEffect, useRef } from "react";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaTimes,
  FaExpand,
  FaCompress,
} from "react-icons/fa";
import "./VideoCall.css";

const VideoCall = ({ activeUser, onClose, onCallEnd, isVideoCall = true }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stream, setStream] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [, setManualTrigger] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const localVideoRef = useRef(null);
  const containerRef = useRef(null);
  const callStartTime = useRef(null);
  const permissionRequested = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const setupAudioMonitoring = (mediaStream) => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(mediaStream);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const checkAudioLevel = () => {
        if (!analyserRef.current) return;

        analyser.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((a, b) => a + b) / bufferLength;

        const threshold = 20;
        setIsSpeaking(average > threshold);

        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();
    } catch (error) {
      console.error("Error setting up audio monitoring:", error);
    }
  };

  const requestPermissions = async () => {
    if (permissionRequested.current) {
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        "Your browser doesn't support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Edge."
      );
      setPermissionDenied(true);
      setIsConnecting(false);
      return;
    }

    permissionRequested.current = true;

    try {
      setIsRequestingPermission(true);

      const constraints = {
        audio: true,
        video: isVideoCall ? { width: 1280, height: 720 } : false,
      };

      let mediaStream = null;

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstError) {
        if (firstError.name === "NotFoundError" && isVideoCall) {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
          });
          alert(
            "Note: No microphone detected. Video call will work but without audio from your side."
          );
        } else if (firstError.name === "NotFoundError" && !isVideoCall) {
          throw new Error(
            "No microphone found. Cannot make audio call without a microphone."
          );
        } else {
          throw firstError;
        }
      }

      console.log("Stream ID:", mediaStream.id);
      console.log("Video tracks:", mediaStream.getVideoTracks().length);
      console.log("Audio tracks:", mediaStream.getAudioTracks().length);

      setStream(mediaStream);
      setPermissionGranted(true);
      setIsRequestingPermission(false);
      setIsConnecting(false);
      setManualTrigger(false);
      callStartTime.current = Date.now();

      if (mediaStream.getAudioTracks().length > 0) {
        setupAudioMonitoring(mediaStream);
      }
    } catch (error) {
      setPermissionDenied(true);
      setIsRequestingPermission(false);
      setIsConnecting(false);
      setManualTrigger(false);
      permissionRequested.current = false;

      if (error.name === "NotFoundError") {
        const device = isVideoCall ? "camera" : "microphone";
        alert(`No ${device} found. Please connect a ${device} and try again.`);
      } else if (error.name === "NotReadableError") {
        alert(
          "Camera or microphone is in use by another application. Please close other apps and try again."
        );
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      requestPermissions();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (stream && localVideoRef.current && isVideoCall && !isVideoOff) {
      localVideoRef.current.srcObject = stream;

      localVideoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
      });
    }
  }, [stream, isVideoCall, isVideoOff]);

  useEffect(() => {
    if (permissionGranted && callStartTime.current) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime.current) / 1000);
        setCallDuration(elapsed);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [permissionGranted]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream && isVideoCall) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (onCallEnd && callStartTime.current) {
      const duration = Math.floor((Date.now() - callStartTime.current) / 1000);
      onCallEnd({
        type: isVideoCall ? "video" : "voice",
        duration: duration,
        formattedDuration: formatDuration(duration),
      });
    }

    onClose();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="video-call-overlay" ref={containerRef}>
      <div className="video-call-container">
        <div className="video-call-header">
          <div className="video-call-user-info">
            {activeUser.avatar ? (
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="video-call-header-avatar"
              />
            ) : (
              <div className="video-call-header-avatar-placeholder">
                {activeUser.name.charAt(0)}
              </div>
            )}
            <div className="video-call-user-details">
              <h3>{activeUser.name}</h3>
              <span className="video-call-role">{activeUser.role}</span>
            </div>
          </div>
          <div className="video-call-status">
            {isConnecting && (
              <span className="connecting-status">Connecting...</span>
            )}
            {permissionGranted && (
              <span className="call-duration">
                {formatDuration(callDuration)}
              </span>
            )}
          </div>
          <button
            className="video-call-close-btn"
            onClick={endCall}
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="video-call-content">
          {(isRequestingPermission || isConnecting) &&
            !permissionDenied &&
            !permissionGranted && (
              <div className="permission-request-overlay">
                <div className="permission-request-content">
                  <div className="permission-spinner"></div>
                  <h3>Permission Required</h3>
                  <p>Please allow access to your camera and microphone</p>
                  <p className="permission-hint">
                    Look for the popup at the TOP of your browser window
                    (address bar area)
                  </p>
                  {!isRequestingPermission && (
                    <div className="manual-trigger-section">
                      <p className="manual-trigger-text">No popup appearing?</p>
                      <button
                        className="manual-permission-btn"
                        onClick={() => {
                          setManualTrigger(true);
                          requestPermissions();
                        }}
                      >
                        Click Here to Request Permission
                      </button>
                      <button
                        className="test-page-btn"
                        onClick={() =>
                          window.open("/camera-test.html", "_blank")
                        }
                      >
                        Open Test Page
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          <div className="remote-video">
            <div className="remote-user-placeholder">
              {activeUser.avatar ? (
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="remote-user-avatar-img"
                />
              ) : (
                <div className="remote-user-avatar">
                  {activeUser.name.charAt(0)}
                </div>
              )}
              <h2>{activeUser.name}</h2>
              <p className="remote-status">Waiting to connect...</p>
            </div>
          </div>

          {isVideoCall && permissionGranted && (
            <div className={`local-video ${isVideoOff ? "video-off" : ""}`}>
              {!isVideoOff ? (
                <>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="local-video-element"
                  />
                  {stream && stream.getAudioTracks().length > 0 && !isMuted && (
                    <div
                      className={`mic-indicator ${
                        isSpeaking ? "speaking" : ""
                      }`}
                      title={
                        isSpeaking
                          ? "Microphone active"
                          : "Microphone on (no sound)"
                      }
                    >
                      <div className="mic-dot"></div>
                    </div>
                  )}
                  {stream && stream.getAudioTracks().length > 0 && isMuted && (
                    <div
                      className="mic-indicator muted"
                      title="Microphone muted"
                    >
                      <FaMicrophoneSlash
                        style={{ color: "#ff6b6b", fontSize: "14px" }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="video-off-placeholder">
                  <FaVideoSlash />
                  <span>Camera Off</span>
                </div>
              )}
            </div>
          )}

          {permissionDenied && (
            <div className="permission-denied-message">
              <div className="permission-denied-content">
                <h3>Permission Required</h3>
                <p>
                  Unable to access your camera or microphone. This may happen
                  if:
                </p>
                <ul className="permission-tips">
                  <li>You clicked "Block" or "Deny" on the permission popup</li>
                  <li>
                    Your browser doesn't have permission to access these devices
                  </li>
                  <li>Another application is using your camera/microphone</li>
                  <li>
                    You're using HTTP instead of HTTPS (required for security)
                  </li>
                </ul>
                <p className="permission-help">
                  <strong>To fix this:</strong> Look for a camera/microphone
                  icon in your browser's address bar and click "Allow", or check
                  your browser settings.
                </p>
                <button
                  className="permission-retry-btn"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
                <button className="permission-close-btn" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {permissionGranted && !permissionDenied && (
          <div className="video-call-controls">
            <button
              className={`control-btn ${isMuted ? "active" : ""}`}
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>

            {isVideoCall && (
              <button
                className={`control-btn ${isVideoOff ? "active" : ""}`}
                onClick={toggleVideo}
                title={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
              </button>
            )}

            <button
              className="control-btn end-call-btn"
              onClick={endCall}
              title="End call"
            >
              <FaPhoneSlash />
            </button>

            <button
              className="control-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;

