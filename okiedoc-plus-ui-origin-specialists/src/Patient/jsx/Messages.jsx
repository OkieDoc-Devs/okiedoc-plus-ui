import React, { useState } from 'react';
import { FaUserMd, FaUserNurse, FaComments, FaTimes, FaUpload, FaFileAlt, FaUser } from 'react-icons/fa';

const Messages = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Sample conversations data
  const conversations = [
    {
      id: 1,
      name: "Dr. Maria Santos",
      role: "Cardiologist",
      avatar: null,
      lastMessage: "Your lab results are ready for review. Please schedule a follow-up appointment when convenient.",
      timestamp: "2:30 PM",
      unreadCount: 3,
      isOnline: true,
      status: "online"
    },
    {
      id: 2,
      name: "Nurse Sarah Johnson",
      role: "General Medicine",
      avatar: null,
      lastMessage: "Reminder: Your appointment is tomorrow at 10 AM. Please arrive 15 minutes early.",
      timestamp: "Yesterday",
      unreadCount: 0,
      isOnline: false,
      status: "offline"
    },
    {
      id: 3,
      name: "Dr. Michael Brown",
      role: "Radiology",
      avatar: null,
      lastMessage: "The X-ray images look good. I'll send you the detailed report shortly.",
      timestamp: "2 days ago",
      unreadCount: 1,
      isOnline: true,
      status: "online"
    },
    {
      id: 4,
      name: "Dr. Lisa Garcia",
      role: "Hematology",
      avatar: null,
      lastMessage: "Your blood test results are within normal range. Continue with your current medication.",
      timestamp: "3 days ago",
      unreadCount: 0,
      isOnline: false,
      status: "offline"
    },
    {
      id: 5,
      name: "Dr. John Smith",
      role: "Emergency Medicine",
      avatar: null,
      lastMessage: "Thank you for the quick response. Your symptoms should improve within 24-48 hours.",
      timestamp: "1 week ago",
      unreadCount: 0,
      isOnline: false,
      status: "offline"
    }
  ];

  const openChat = (conversation) => {
    setActiveChat(conversation);
    // Initialize with sample messages for this conversation
    setChatMessages([
      {
        id: 1,
        sender: 'specialist',
        text: `Hello! I'm ${conversation.name}, your ${conversation.role.toLowerCase()}. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 2,
        sender: 'specialist',
        text: conversation.lastMessage,
        timestamp: conversation.timestamp
      }
    ]);
  };

  const closeChat = () => {
    setActiveChat(null);
    setChatMessages([]);
    setNewMessage('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && activeChat) {
      const message = {
        id: Date.now(),
        sender: 'patient',
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="patient-page-content">
      <div className={`patient-messenger-container ${activeChat ? 'has-active-chat' : ''}`}>
        {/* Conversations List */}
        <div className="patient-conversations-sidebar">
          <div className="patient-conversations-header">
            <h2 className="patient-conversations-title">Messages</h2>
            <div className="patient-conversations-search">
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="patient-search-input"
              />
            </div>
          </div>
          
          <div className="patient-conversations-list">
            {conversations.map(conversation => (
              <div 
                key={conversation.id} 
                className={`patient-conversation-item ${activeChat?.id === conversation.id ? 'active' : ''}`}
                onClick={() => openChat(conversation)}
              >
                <div className="patient-conversation-avatar">
                  {conversation.avatar ? (
                    <img src={conversation.avatar} alt={conversation.name} />
                  ) : (
                    <FaUser className="patient-avatar-icon" />
                  )}
                  <div className={`patient-online-indicator ${conversation.isOnline ? 'online' : 'offline'}`}></div>
                </div>
                
                <div className="patient-conversation-content">
                  <div className="patient-conversation-header">
                    <h4 className="patient-conversation-name">{conversation.name}</h4>
                    <span className="patient-conversation-time">{conversation.timestamp}</span>
                  </div>
                  <div className="patient-conversation-preview">
                    <p className="patient-conversation-message">{conversation.lastMessage}</p>
                    {conversation.unreadCount > 0 && (
                      <div className="patient-unread-badge">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="patient-conversation-role">{conversation.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {activeChat ? (
          <div className="patient-chat-area">
            <div className="patient-chat-header">
              <div className="patient-chat-user-info">
                <div className="patient-chat-avatar">
                  {activeChat.avatar ? (
                    <img src={activeChat.avatar} alt={activeChat.name} />
                  ) : (
                    <FaUser className="patient-avatar-icon" />
                  )}
                  <div className={`patient-online-indicator ${activeChat.isOnline ? 'online' : 'offline'}`}></div>
                </div>
                <div className="patient-chat-user-details">
                  <h3 className="patient-chat-user-name">{activeChat.name}</h3>
                  <p className="patient-chat-user-role">{activeChat.role}</p>
                </div>
              </div>
              <button className="patient-chat-close-btn" onClick={closeChat} title="Back to Messages">
                <FaTimes />
              </button>
            </div>

            <div className="patient-chat-messages">
              {chatMessages.map((message) => (
                <div key={message.id} className={`patient-message ${message.sender === 'patient' ? 'patient-message-patient' : 'patient-message-specialist'}`}>
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
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="patient-file-label">
                  <FaUpload className="patient-upload-icon" />
                  <span className="patient-upload-text">Choose files to upload</span>
                  <span className="patient-upload-hint">PDF, DOC, JPG, PNG up to 10MB</span>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="patient-uploaded-files">
                  <h5 className="patient-files-title">Uploaded Files:</h5>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="patient-file-item">
                      <FaFileAlt className="patient-file-icon" />
                      <div className="patient-file-info">
                        <span className="patient-file-name">{file.name}</span>
                        <span className="patient-file-size">{formatFileSize(file.size)}</span>
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

            <form className="patient-chat-input-form" onSubmit={handleSendMessage}>
              <div className="patient-chat-input-container">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="patient-chat-input"
                />
                <button type="submit" className="patient-chat-send-btn">
                  Send
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="patient-no-chat-selected">
            <FaComments className="patient-no-chat-icon" />
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
