import React, { useState, useEffect, useRef } from "react";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaExpand,
  FaCompress,
} from "react-icons/fa";
import "../css/PatientVideoCall.css";

const PatientVideoCall = ({ activeUser, onClose, onCallEnd, isVideoCall = true }) => {
  const [patient_isMuted, setPatient_isMuted] = useState(true);
  const [patient_isVideoOff, setPatient_isVideoOff] = useState(true);
  const [patient_isFullscreen, setPatient_isFullscreen] = useState(false);
  const [patient_stream, setPatient_stream] = useState(null);
  const [patient_permissionGranted, setPatient_permissionGranted] = useState(false);
  const [patient_permissionDenied, setPatient_permissionDenied] = useState(false);
  const [patient_isConnecting, setPatient_isConnecting] = useState(true);
  const [patient_isRequestingPermission, setPatient_isRequestingPermission] = useState(false);
  const [patient_callDuration, setPatient_callDuration] = useState(0);
  const [, setPatient_manualTrigger] = useState(false);
  const [patient_isSpeaking, setPatient_isSpeaking] = useState(false);

  const patient_localVideoRef = useRef(null);
  const patient_containerRef = useRef(null);
  const patient_callStartTime = useRef(null);
  const patient_permissionRequested = useRef(false);
  const patient_audioContextRef = useRef(null);
  const patient_analyserRef = useRef(null);
  const patient_animationFrameRef = useRef(null);

  const patient_setupAudioMonitoring = (mediaStream) => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(mediaStream);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      microphone.connect(analyser);

      patient_audioContextRef.current = audioContext;
      patient_analyserRef.current = analyser;

      const patient_checkAudioLevel = () => {
        if (!patient_analyserRef.current) return;

        analyser.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((a, b) => a + b) / bufferLength;

        const threshold = 20;
        setPatient_isSpeaking(average > threshold);

        patient_animationFrameRef.current = requestAnimationFrame(patient_checkAudioLevel);
      };

      patient_checkAudioLevel();
    } catch (error) {
      console.error("Error setting up audio monitoring:", error);
    }
  };

  const patient_requestPermissions = async () => {
    if (patient_permissionRequested.current) {
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        "Your browser doesn't support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Edge."
      );
      setPatient_permissionDenied(true);
      setPatient_isConnecting(false);
      return;
    }

    patient_permissionRequested.current = true;

    try {
      setPatient_isRequestingPermission(true);

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

      // Disable camera and audio by default
      if (isVideoCall && mediaStream.getVideoTracks().length > 0) {
        mediaStream.getVideoTracks()[0].enabled = false;
      }
      if (mediaStream.getAudioTracks().length > 0) {
        mediaStream.getAudioTracks()[0].enabled = false;
      }

      setPatient_stream(mediaStream);
      setPatient_permissionGranted(true);
      setPatient_isRequestingPermission(false);
      setPatient_isConnecting(false);
      setPatient_manualTrigger(false);
      patient_callStartTime.current = Date.now();

      if (mediaStream.getAudioTracks().length > 0) {
        patient_setupAudioMonitoring(mediaStream);
      }
    } catch (error) {
      setPatient_permissionDenied(true);
      setPatient_isRequestingPermission(false);
      setPatient_isConnecting(false);
      setPatient_manualTrigger(false);
      patient_permissionRequested.current = false;

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
      patient_requestPermissions();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (patient_stream) {
        patient_stream.getTracks().forEach((track) => track.stop());
      }
      if (patient_animationFrameRef.current) {
        cancelAnimationFrame(patient_animationFrameRef.current);
        patient_animationFrameRef.current = null;
      }
      if (
        patient_audioContextRef.current &&
        patient_audioContextRef.current.state !== "closed"
      ) {
        patient_audioContextRef.current.close().catch(() => {});
        patient_audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (patient_stream && patient_localVideoRef.current && isVideoCall) {
      patient_localVideoRef.current.srcObject = patient_stream;

      patient_localVideoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
      });
    }
  }, [patient_stream, isVideoCall]);

  useEffect(() => {
    if (patient_permissionGranted && patient_callStartTime.current) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - patient_callStartTime.current) / 1000);
        setPatient_callDuration(elapsed);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [patient_permissionGranted]);

  const patient_formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const patient_toggleMute = () => {
    if (patient_stream) {
      const audioTrack = patient_stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setPatient_isMuted(!audioTrack.enabled);
      }
    }
  };

  const patient_toggleVideo = () => {
    if (patient_stream && isVideoCall) {
      const videoTrack = patient_stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setPatient_isVideoOff(!videoTrack.enabled);
      }
    }
  };

  const patient_endCall = () => {
    if (patient_stream) {
      patient_stream.getTracks().forEach((track) => track.stop());
    }

    if (patient_animationFrameRef.current) {
      cancelAnimationFrame(patient_animationFrameRef.current);
      patient_animationFrameRef.current = null;
    }
    if (patient_audioContextRef.current && patient_audioContextRef.current.state !== "closed") {
      patient_audioContextRef.current.close().catch(() => {});
      patient_audioContextRef.current = null;
    }

    if (onCallEnd && patient_callStartTime.current) {
      const duration = Math.floor((Date.now() - patient_callStartTime.current) / 1000);
      onCallEnd({
        type: isVideoCall ? "video" : "voice",
        duration: duration,
        formattedDuration: patient_formatDuration(duration),
      });
    }

    onClose();
  };

  const patient_toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      patient_containerRef.current?.requestFullscreen();
      setPatient_isFullscreen(true);
    } else {
      document.exitFullscreen();
      setPatient_isFullscreen(false);
    }
  };

  useEffect(() => {
    const patient_handleFullscreenChange = () => {
      setPatient_isFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", patient_handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", patient_handleFullscreenChange);
    };
  }, []);

  return (
    <div className="patient-video-call-overlay" ref={patient_containerRef}>
      <div className="patient-video-call-container">
        <div className="patient-video-call-header">
          <div className="patient-video-call-user-info">
            {activeUser.avatar ? (
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="patient-video-call-header-avatar"
              />
            ) : (
              <div className="patient-video-call-header-avatar-placeholder">
                {activeUser.name.charAt(0)}
              </div>
            )}
            <div className="patient-video-call-user-details">
              <h3>{activeUser.name}</h3>
              <span className="patient-video-call-role">{activeUser.role}</span>
            </div>
          </div>
          <div className="patient-video-call-status">
            {patient_isConnecting && (
              <span className="patient-connecting-status">Connecting...</span>
            )}
            {patient_permissionGranted && (
              <span className="patient-call-duration">
                {patient_formatDuration(patient_callDuration)}
              </span>
            )}
          </div>
        </div>

        <div className="patient-video-call-content">
          {(patient_isRequestingPermission || patient_isConnecting) &&
            !patient_permissionDenied &&
            !patient_permissionGranted && (
              <div className="patient-permission-request-overlay">
                <div className="patient-permission-request-content">
                  <div className="patient-permission-spinner"></div>
                  <h3>Permission Required</h3>
                  <p>Please allow access to your camera and microphone</p>
                  <p className="patient-permission-hint">
                    Look for the popup at the TOP of your browser window
                    (address bar area)
                  </p>
                  {!patient_isRequestingPermission && (
                    <div className="patient-manual-trigger-section">
                      <p className="patient-manual-trigger-text">No popup appearing?</p>
                      <button
                        className="patient-manual-permission-btn"
                        onClick={() => {
                          setPatient_manualTrigger(true);
                          patient_requestPermissions();
                        }}
                      >
                        Click Here to Request Permission
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          <div className="patient-remote-video">
            <div className="patient-remote-user-placeholder">
              {activeUser.avatar ? (
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="patient-remote-user-avatar-img"
                />
              ) : (
                <div className="patient-remote-user-avatar">
                  {activeUser.name.charAt(0)}
                </div>
              )}
              <h2>{activeUser.name}</h2>
              <p className="patient-remote-status">Waiting to connect...</p>
            </div>
          </div>

          {isVideoCall && patient_permissionGranted && (
            <div className={`patient-local-video ${patient_isVideoOff ? "patient-video-off" : ""}`}>
              <video
                ref={patient_localVideoRef}
                autoPlay
                muted
                playsInline
                className="patient-local-video-element"
                style={{ display: patient_isVideoOff ? 'none' : 'block' }}
              />
              {patient_isVideoOff && (
                <div className="patient-video-off-placeholder">
                  <FaVideoSlash />
                  <span>Camera Off</span>
                </div>
              )}
              {!patient_isVideoOff && patient_stream && patient_stream.getAudioTracks().length > 0 && !patient_isMuted && (
                <div
                  className={`patient-mic-indicator ${
                    patient_isSpeaking ? "patient-speaking" : ""
                  }`}
                  title={
                    patient_isSpeaking
                      ? "Microphone active"
                      : "Microphone on (no sound)"
                  }
                >
                  <div className="patient-mic-dot"></div>
                </div>
              )}
              {!patient_isVideoOff && patient_stream && patient_stream.getAudioTracks().length > 0 && patient_isMuted && (
                <div
                  className="patient-mic-indicator patient-muted"
                  title="Microphone muted"
                >
                  <FaMicrophoneSlash
                    style={{ color: "#ff6b6b", fontSize: "14px" }}
                  />
                </div>
              )}
            </div>
          )}

          {patient_permissionDenied && (
            <div className="patient-permission-denied-message">
              <div className="patient-permission-denied-content">
                <h3>Permission Required</h3>
                <p>
                  Unable to access your camera or microphone. This may happen
                  if:
                </p>
                <ul className="patient-permission-tips">
                  <li>You clicked "Block" or "Deny" on the permission popup</li>
                  <li>
                    Your browser doesn't have permission to access these devices
                  </li>
                  <li>Another application is using your camera/microphone</li>
                  <li>
                    You're using HTTP instead of HTTPS (required for security)
                  </li>
                </ul>
                <p className="patient-permission-help">
                  <strong>To fix this:</strong> Look for a camera/microphone
                  icon in your browser's address bar and click "Allow", or check
                  your browser settings.
                </p>
                <button
                  className="patient-permission-retry-btn"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
                <button className="patient-permission-close-btn" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {patient_permissionGranted && !patient_permissionDenied && (
          <div className="patient-video-call-controls">
            <button
              className={`patient-control-btn ${patient_isMuted ? "patient-active" : ""}`}
              onClick={patient_toggleMute}
              title={patient_isMuted ? "Unmute" : "Mute"}
            >
              {patient_isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>

            {isVideoCall && (
              <button
                className={`patient-control-btn ${patient_isVideoOff ? "patient-active" : ""}`}
                onClick={patient_toggleVideo}
                title={patient_isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {patient_isVideoOff ? <FaVideoSlash /> : <FaVideo />}
              </button>
            )}

            <button
              className="patient-control-btn patient-end-call-btn"
              onClick={patient_endCall}
              title="End call"
            >
              <FaPhoneSlash />
            </button>

            <button
              className="patient-control-btn"
              onClick={patient_toggleFullscreen}
              title={patient_isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {patient_isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientVideoCall;

