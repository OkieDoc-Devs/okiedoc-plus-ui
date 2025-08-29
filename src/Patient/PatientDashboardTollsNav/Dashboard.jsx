import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { MessageCircle, Upload } from 'lucide-react';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const [showChat, setShowChat] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'nurse', message: 'Hello! How can I help you today?', timestamp: '10:00 AM' },
    { id: 2, sender: 'patient', message: 'Hi, I have some questions about my consultation.', timestamp: '10:02 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [tickets] = useState([
    {
      title: 'Initial Consultation',
      status: 'Pending',
      tag: 'CONSULTATION',
      tagType: 'consultation'
    },
    {
      title: 'Lab Results Review',
      status: 'Processing',
      tag: 'LAB',
      tagType: 'lab'
    },
    {
      title: 'Payment for Consultation',
      status: 'For Payment',
      tag: 'PAYMENT',
      tagType: 'payment'
    },
    {
      title: 'Follow-up Appointment',
      status: 'Confirmed',
      tag: 'APPOINTMENT',
      tagType: 'appointment'
    },
    {
      title: 'Ongoing Consultation',
      status: 'Active',
      tag: 'CONSULTATION',
      tagType: 'consultation'
    }
  ]);

  const getTicketsByStatus = (status) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#ffc107',
      'Processing': '#17a2b8',
      'For Payment': '#28a745',
      'Confirmed': '#fd7e14',
      'Active': '#6f42c1'
    };
    return colors[status] || '#6c757d';
  };

  const getTagColor = (tagType) => {
    const colors = {
      'consultation': { bg: '#fff3cd', color: '#856404' },
      'records': { bg: '#e2e3ff', color: '#4c63d2' },
      'treatment': { bg: '#f8d7da', color: '#721c24' },
      'appointment': { bg: '#d1ecf1', color: '#0c5460' },
      'payment': { bg: '#d4edda', color: '#155724' },
      'insurance': { bg: '#e2e3ff', color: '#4c63d2' },
      'lab': { bg: '#fff3cd', color: '#856404' },
      'medication': { bg: '#f8d7da', color: '#721c24' }
    };
    return colors[tagType] || { bg: '#e9ecef', color: '#6c757d' };
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: chatMessages.length + 1,
        sender: 'patient',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmitDocument = () => {
    if (selectedFile) {
      alert(`Document "${selectedFile.name}" uploaded successfully!`);
      setSelectedFile(null);
      setShowDocumentUpload(false);
    }
  };

  return (
    <Sidebar>
      <div className="patient-dashboard">
        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <a href="#" className="nav-tab active">Patient Dashboard</a>
        </nav>



        {/* Kanban Board */}
        <div className="kanban-board">
          {/* Pending Column */}
          <div className="column">
            <div className="column-header">
              <span className="column-title">Pending</span>
              <span className="column-count">{getTicketsByStatus('Pending').length}</span>
            </div>
            
            {getTicketsByStatus('Pending').map(ticket => (
              <div key={ticket.id} className="ticket pending">
                <div className="ticket-title">{ticket.title}</div>
                <div 
                  className="ticket-tag"
                  style={{ 
                    backgroundColor: getTagColor(ticket.tagType).bg,
                    color: getTagColor(ticket.tagType).color
                  }}
                >
                  {ticket.tag}
                </div>
              </div>
            ))}
            
          </div>

          {/* Processing Column */}
          <div className="column">
            <div className="column-header">
              <span className="column-title">Processing</span>
              <span className="column-count">{getTicketsByStatus('Processing').length}</span>
            </div>
            
            {getTicketsByStatus('Processing').map(ticket => (
              <div key={ticket.id} className="ticket processing">
                <div className="ticket-title">{ticket.title}</div>
                <div 
                  className="ticket-tag"
                  style={{ 
                    backgroundColor: getTagColor(ticket.tagType).bg,
                    color: getTagColor(ticket.tagType).color
                  }}
                >
                  {ticket.tag}
                </div>
              </div>
            ))}
            
          </div>

          {/* For Payment Column */}
          <div className="column">
            <div className="column-header">
              <span className="column-title">For Payment</span>
              <span className="column-count">{getTicketsByStatus('For Payment').length}</span>
            </div>
            
            {getTicketsByStatus('For Payment').map(ticket => (
              <div key={ticket.id} className="ticket payment">
                <div className="ticket-title">{ticket.title}</div>
                <div 
                  className="ticket-tag"
                  style={{ 
                    backgroundColor: getTagColor(ticket.tagType).bg,
                    color: getTagColor(ticket.tagType).color
                  }}
                >
                  {ticket.tag}
                </div>
              </div>
            ))}
            
          </div>

          {/* Confirmed Column */}
          <div className="column">
            <div className="column-header">
              <span className="column-title">Confirmed</span>
              <span className="column-count">{getTicketsByStatus('Confirmed').length}</span>
            </div>
            
            {getTicketsByStatus('Confirmed').map(ticket => (
              <div key={ticket.id} className="ticket confirmed">
                <div className="ticket-title">{ticket.title}</div>
                <div 
                  className="ticket-tag"
                  style={{ 
                    backgroundColor: getTagColor(ticket.tagType).bg,
                    color: getTagColor(ticket.tagType).color
                  }}
                >
                  {ticket.tag}
                </div>
              </div>
            ))}
            
          </div>

          {/* Active Column */}
          <div className="column">
            <div className="column-header">
              <span className="column-title">Active</span>
              <span className="column-count">{getTicketsByStatus('Active').length}</span>
            </div>
            
            {getTicketsByStatus('Active').map(ticket => (
              <div key={ticket.id} className="ticket active">
                <div className="ticket-title">{ticket.title}</div>
                <div 
                  className="ticket-tag"
                  style={{ 
                    backgroundColor: getTagColor(ticket.tagType).bg,
                    color: getTagColor(ticket.tagType).color
                  }}
                >
                  {ticket.tag}
                </div>
                <div className="ticket-actions">
                  <button 
                    className="action-btn chat-btn"
                    onClick={() => setShowChat(true)}
                  >
                    <MessageCircle size={16} />
                    Chat with Nurse
                  </button>
                  <button 
                    className="action-btn upload-btn"
                    onClick={() => setShowDocumentUpload(true)}
                  >
                    <Upload size={16} />
                    Upload Documents
                  </button>
                </div>
              </div>
            ))}
            
          </div>
        </div>

        {/* Chat Box Modal */}
        {showChat && (
          <div className="modal-overlay" onClick={() => setShowChat(false)}>
            <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
              <div className="chat-header">
                <h3>Chat with Nurse</h3>
                <button className="close-btn" onClick={() => setShowChat(false)}>×</button>
              </div>
              <div className="chat-messages">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.sender}`}>
                    <div className="message-content">{msg.message}</div>
                    <div className="message-time">{msg.timestamp}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Modal */}
        {showDocumentUpload && (
          <div className="modal-overlay" onClick={() => setShowDocumentUpload(false)}>
            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
              <div className="upload-header">
                <h3>Upload Documents</h3>
                <button className="close-btn" onClick={() => setShowDocumentUpload(false)}>×</button>
              </div>
              <div className="upload-content">
                <p>Please upload the documents requested by the Specialist:</p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                />
                {selectedFile && (
                  <div className="selected-file">
                    Selected: {selectedFile.name}
                  </div>
                )}
                <div className="upload-actions">
                  <button onClick={handleSubmitDocument} disabled={!selectedFile}>
                    Upload Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
