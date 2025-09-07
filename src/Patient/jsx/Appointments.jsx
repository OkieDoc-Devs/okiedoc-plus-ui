import React, { useState } from 'react';
import { FaUserMd, FaCalendarPlus, FaClock, FaCheckCircle, FaCreditCard, FaUserCheck, FaPlay, FaComments, FaPaperclip, FaUpload, FaFileAlt, FaTimes } from 'react-icons/fa';

const Appointments = () => {
  const [activeTicket, setActiveTicket] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Sample appointment/ticket data
  const appointments = [
    {
      id: 1,
      title: "General Consultation",
      status: "Pending",
      specialist: "Dr. Maria Santos",
      date: "2024-01-15",
      time: "10:00 AM",
      specialty: "General Medicine",
      description: "Routine checkup and health assessment"
    },
    {
      id: 2,
      title: "Blood Test Results Review",
      status: "Processing",
      specialist: "Dr. John Smith",
      date: "2024-01-16",
      time: "2:00 PM",
      specialty: "Hematology",
      description: "Review of recent blood test results"
    },
    {
      id: 3,
      title: "X-Ray Consultation",
      status: "For Payment",
      specialist: "Dr. Lisa Garcia",
      date: "2024-01-17",
      time: "11:30 AM",
      specialty: "Radiology",
      description: "X-ray examination and consultation"
    },
    {
      id: 4,
      title: "Follow-up Consultation",
      status: "Confirmed",
      specialist: "Dr. Michael Brown",
      date: "2024-01-18",
      time: "3:00 PM",
      specialty: "Cardiology",
      description: "Follow-up appointment for previous treatment"
    },
    {
      id: 5,
      title: "Emergency Consultation",
      status: "Active",
      specialist: "Dr. Sarah Wilson",
      date: "2024-01-19",
      time: "9:00 AM",
      specialty: "Emergency Medicine",
      description: "Urgent consultation for symptoms"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <FaClock className="patient-status-icon patient-pending" />;
      case 'Processing':
        return <FaUserCheck className="patient-status-icon patient-processing" />;
      case 'For Payment':
        return <FaCreditCard className="patient-status-icon patient-payment" />;
      case 'Confirmed':
        return <FaCheckCircle className="patient-status-icon patient-confirmed" />;
      case 'Active':
        return <FaPlay className="patient-status-icon patient-active" />;
      default:
        return <FaClock className="patient-status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'patient-status-pending';
      case 'Processing':
        return 'patient-status-processing';
      case 'For Payment':
        return 'patient-status-payment';
      case 'Confirmed':
        return 'patient-status-confirmed';
      case 'Active':
        return 'patient-status-active';
      default:
        return 'patient-status-default';
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        text: chatMessage,
        sender: 'patient',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const openChat = (appointment) => {
    setActiveTicket(appointment);
    // Initialize with sample messages for this appointment
    setChatMessages([
      {
        id: 1,
        sender: 'nurse',
        text: `Hello! I'm here to assist you with your ${appointment.title} appointment.`,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 2,
        sender: 'nurse',
        text: 'Please feel free to ask any questions or share any concerns you may have.',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const closeChat = () => {
    setActiveTicket(null);
    setChatMessages([]);
    setChatMessage('');
  };

  return (
    <div className="patient-page-content">
      <div className="patient-appointments-header">
        <div>
          <h2 className="patient-page-title">My Appointments</h2>
          <p className="patient-page-subtitle">Track your consultation requests and appointments</p>
        </div>
        <div className="patient-book-appointment">
          <button className="patient-book-btn">
            <FaCalendarPlus className="patient-book-icon" />
            Book New Appointment
          </button>
        </div>
      </div>
      
      <div className="patient-appointments-section">
        {appointments.map(appointment => (
          <div key={appointment.id} className={`patient-appointment-card ${getStatusColor(appointment.status)}`}>
            <div className="patient-appointment-left">
              <h3 className="patient-appointment-title">{appointment.title}</h3>
            </div>

            <div className="patient-appointment-middle">
              <div className="patient-appointment-details">
                <span className="patient-appointment-doctor">{appointment.specialist}</span>
                <span className="patient-appointment-specialty">{appointment.specialty}</span>
                <span className="patient-appointment-date">{appointment.date} at {appointment.time}</span>
                <p className="patient-appointment-description">{appointment.description}</p>
              </div>
            </div>

            <div className="patient-appointment-right">
              <div className="patient-appointment-status">
                {getStatusIcon(appointment.status)}
                <span className="patient-status-text">{appointment.status}</span>
              </div>
              <div className="patient-appointment-actions">
                {appointment.status === 'Active' && (
                  <button 
                    className="patient-chat-btn"
                    onClick={() => openChat(appointment)}
                  >
                    <FaComments className="patient-action-icon" />
                    Chat
                  </button>
                )}
                {appointment.status === 'For Payment' && (
                  <button className="patient-payment-btn">
                    <FaCreditCard className="patient-action-icon" />
                    Pay
                  </button>
                )}
                <button className="patient-view-details-btn">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Modal for Active Appointments */}
      {activeTicket && (
        <div className="patient-chat-modal-overlay" onClick={closeChat}>
          <div className="patient-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="patient-chat-header">
              <div className="patient-chat-ticket-info">
                <h3 className="patient-chat-ticket-title">{activeTicket.title}</h3>
                <p className="patient-chat-ticket-specialist">{activeTicket.specialist}</p>
              </div>
              <button className="patient-chat-close-btn" onClick={closeChat}>
                <FaTimes />
              </button>
            </div>

            <div className="patient-chat-messages">
              {chatMessages.map(message => (
                <div key={message.id} className={`patient-message ${message.sender === 'patient' ? 'patient-message-patient' : 'patient-message-nurse'}`}>
                  <div className="patient-message-content">
                    <p className="patient-message-text">{message.text}</p>
                    <span className="patient-message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="patient-document-upload">
              <div className="patient-upload-header">
                <h4 className="patient-upload-title">Upload Documents</h4>
                <p className="patient-upload-subtitle">Share files with your specialist</p>
              </div>
              
              <div className="patient-file-upload-area">
                <input
                  type="file"
                  id="patient-file-upload"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="patient-file-upload" className="patient-file-label">
                  <FaUpload className="patient-upload-icon" />
                  <span className="patient-upload-text">Choose files to upload</span>
                  <span className="patient-upload-hint">PDF, DOC, JPG, PNG up to 10MB</span>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="patient-uploaded-files">
                  <h5 className="patient-files-title">Uploaded Files:</h5>
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="patient-file-item">
                      <FaFileAlt className="patient-file-icon" />
                      <div className="patient-file-info">
                        <span className="patient-file-name">{file.name}</span>
                        <span className="patient-file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button 
                        className="patient-file-remove"
                        onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form className="patient-chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
              <div className="patient-chat-input-container">
                <input
                  type="text"
                  className="patient-chat-input"
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button type="submit" className="patient-chat-send-btn">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;