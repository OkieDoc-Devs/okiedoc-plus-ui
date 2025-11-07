import React, { useState, useEffect, useRef } from 'react';
import { FaUserMd, FaUserNurse, FaComments, FaTimes, FaUpload, FaFileAlt, FaUser, FaCamera, FaInbox } from 'react-icons/fa';
import apiService from '../services/apiService';

const Messages = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);

  const CHARACTER_LIMIT = 500;

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const patientId = localStorage.getItem('patientId');
      const patientData = await apiService.getPatientData(patientId);
      setConversations(patientData.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get messages for a conversation from backend
  const getMessagesForConversation = async (conversationId) => {
    try {
      const patientId = localStorage.getItem('patientId');
      const response = await apiService.fetchData(`/patient-messages?patient_id=${patientId}&conversation_id=${conversationId}`);
      return response.messages || [];
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
      return [];
    }
  };

  const openChat = async (conversation) => {
    setActiveChat(conversation);
    const messages = await getMessagesForConversation(conversation.id);
    setChatMessages(messages);
    setUploadedFiles([]);
  };

  const closeChat = () => {
    setActiveChat(null);
    setChatMessages([]);
    setNewMessage('');
    setUploadedFiles([]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (activeChat && (newMessage.trim() || uploadedFiles.length > 0)) {
      const trimmedMessage = newMessage.trim();
      if (trimmedMessage) {
        const message = {
          id: Date.now(),
          sender: "patient",
          text: trimmedMessage,
          timestamp: new Date().toLocaleString(),
        };
        setChatMessages((prev) => [...prev, message]);
      }

      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((file, index) => {
          const fileMessage = {
            id: Date.now() + index + 1,
            sender: "patient",
            text: file.type.startsWith("image/")
              ? "📷 Image attachment"
              : `📎 ${file.name}`,
            timestamp: new Date().toLocaleString(),
            file: file,
            isFileAttachment: true,
          };
          setChatMessages((prev) => [...prev, fileMessage]);
        });
      }

      setNewMessage('');
      setUploadedFiles([]);
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    if (value.length <= CHARACTER_LIMIT) {
      setNewMessage(value);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    const query = searchQuery.toLowerCase();
    return (
      conversation.name.toLowerCase().includes(query) ||
      conversation.role.toLowerCase().includes(query) ||
      conversation.lastMessage.toLowerCase().includes(query)
    );
  });

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      url: URL.createObjectURL(file),
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const remainingChars = CHARACTER_LIMIT - newMessage.length;

  return (
    <div className="patient-page-content">
      <div className={`patient-messenger-container ${activeChat ? 'has-active-chat' : ''}`}>
        {/* Conversations List */}
        <div className="patient-conversations-sidebar">
          <div className="patient-conversations-header">
            <h2 className="patient-conversations-title">
              Messages
            </h2>
            <div className="patient-conversations-search">
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="patient-search-input"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="patient-conversations-list">
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                Loading conversations...
              </div>
            ) : conversations.length === 0 && searchQuery === '' ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#666'
              }}>
                <FaInbox style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }} />
                <h3 style={{ color: '#999', marginBottom: '0.5rem' }}>No Messages Yet</h3>
                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                  Your messages with healthcare providers will appear here
                </p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                No conversations found matching "{searchQuery}"
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map(conversation => (
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
                    <span className="patient-conversation-time">
                      {conversation.timestamp.split(" ")[0]}
                    </span>
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
              ))
            ) : null}
          </div>
        </div>

        {/* Chat Area */}
        <div className="patient-chat-area">
          {activeChat ? (
            <>
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
                {/* Mobile close button */}
                <button 
                  className="patient-chat-close-btn-mobile"
                  onClick={closeChat}
                  aria-label="Close chat"
                >
                  <FaTimes />
                </button>
              </div>

            <div className="patient-chat-messages" ref={chatMessagesRef}>
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`patient-message ${
                    message.sender === "patient"
                      ? "patient-message-patient"
                      : message.sender === "system"
                      ? "patient-message-system"
                      : "patient-message-other"
                  }`}
                >
                  {message.sender === "system" ? (
                    <div className="patient-system-message">
                      <p className="patient-message-text">{message.text}</p>
                    </div>
                  ) : (
                    <div className="patient-message-wrapper">
                      {/* No avatars - removed all patient message avatars */}
                      <div className="patient-message-content">
                        <div className="patient-message-bubble">
                          <p className="patient-message-text">{message.text}</p>
                        </div>
                        <span className="patient-message-time">
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="patient-document-upload">
              <div className="patient-upload-header">
                <h4 className="patient-upload-title">Upload Documents</h4>
                <p className="patient-upload-subtitle">
                  Share files and images with specialists
                </p>
              </div>

              <div className="patient-file-upload-area">
                <input
                  type="file"
                  id="patient-file-upload"
                  ref={fileInputRef}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="patient-file-upload"
                  className="patient-file-label"
                >
                  <FaUpload className="patient-upload-icon" />
                  <span className="patient-upload-text">
                    Choose files to upload
                  </span>
                  <span className="patient-upload-hint">
                    Images, PDF, DOC, TXT up to 10MB
                  </span>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="patient-uploaded-files">
                  <h5 className="patient-files-title">Attached Files:</h5>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="patient-file-item">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="patient-file-preview"
                        />
                      ) : (
                        <FaFileAlt className="patient-file-icon" />
                      )}
                      <div className="patient-file-info">
                        <span className="patient-file-name">{file.name}</span>
                        <span className="patient-file-size">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <button
                        className="patient-file-remove"
                        onClick={() => handleRemoveFile(file.id)}
                        type="button"
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
                <button
                  type="button"
                  className="patient-camera-btn"
                  onClick={handleCameraClick}
                  title="Attach image or file"
                >
                  <FaCamera />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleMessageChange}
                  placeholder="Type here"
                  className="patient-chat-input"
                  maxLength={CHARACTER_LIMIT}
                />
                <div className="patient-char-counter">
                  {remainingChars}/{CHARACTER_LIMIT}
                </div>
                <button
                  type="submit"
                  className="patient-chat-send-btn"
                  disabled={!newMessage.trim() && uploadedFiles.length === 0}
                  title="Send message"
                >
                  Send
                </button>
              </div>
            </form>
            </>
          ) : (
            <div className="patient-no-chat-selected">
              <FaComments className="patient-no-chat-icon" />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
