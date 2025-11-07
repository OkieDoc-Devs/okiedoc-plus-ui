import React, { useState, useEffect, useRef } from 'react';
import { 
  FaComments, FaTimes, FaPaperPlane, FaUser, FaUserNurse, FaUserMd,
  FaChevronDown, FaChevronUp, FaSearch, FaPhone, FaVideo
} from 'react-icons/fa';

/**
 * Floating Chat Widget for Specialist Dashboard
 * All-in-one component with embedded styles
 */
const FloatingChat = ({ tickets = [], currentUser, onStartCall, onStartVideoCall }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const maxMessageLength = 500;

  // Convert tickets to conversations
  const conversations = tickets.map(ticket => ({
    id: ticket.id,
    name: ticket.patient,
    role: ticket.service,
    avatar: null,
    lastMessage: "Click to start conversation",
    timestamp: extractTimeFromWhen(ticket.when),
    unreadCount: 0,
    isOnline: true,
    type: "patient",
    status: ticket.status,
    when: ticket.when
  }));

  function extractTimeFromWhen(when) {
    const timeMatch = when?.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
    return timeMatch ? timeMatch[1] : 'Now';
  }

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialize messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      const dummyMessages = [
        {
          id: 1,
          sender: 'patient',
          senderName: selectedChat.name,
          text: `Hi, there! I need help with my ${selectedChat.role} appointment.`,
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          type: 'text'
        },
        {
          id: 2,
          sender: 'nurse',
          senderName: 'Nurse Tyler',
          text: `I'll transfer you to the specialist.`,
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          type: 'text'
        }
      ];
      setMessages(dummyMessages);
    }
  }, [selectedChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && newMessage.length <= maxMessageLength && selectedChat) {
      const message = {
        id: Date.now(),
        sender: 'specialist',
        senderName: currentUser?.firstName ? `Dr. ${currentUser.firstName}` : 'Dr. Specialist',
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }),
        type: 'text'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxMessageLength) {
      setNewMessage(value);
    }
  };

  const getAvatarIcon = (type) => {
    switch (type) {
      case 'patient':
        return <FaUser />;
      case 'nurse':
        return <FaUserNurse />;
      case 'specialist':
        return <FaUserMd />;
      default:
        return <FaUser />;
    }
  };

  const handleChatSelect = (conversation) => {
    setSelectedChat(conversation);
  };

  const toggleChat = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setSelectedChat(null);
    setMessages([]);
    setNewMessage('');
  };

  if (!isOpen) {
    return (
      <>
        <style>{floatingChatStyles}</style>
        <button 
          className="floating-chat-button"
          onClick={toggleChat}
          title="Open Chat"
        >
          <FaComments />
          {conversations.length > 0 && (
            <span className="floating-chat-badge">{conversations.length}</span>
          )}
        </button>
      </>
    );
  }

  return (
    <>
      <style>{floatingChatStyles}</style>
      <div className={`floating-chat-widget ${isMinimized ? 'minimized' : ''}`}>
        {/* Header */}
        <div className="floating-chat-header">
          <div className="floating-chat-header-left">
            <FaComments className="floating-chat-header-icon" />
            <h3 className="floating-chat-title">Messages</h3>
            {conversations.length > 0 && (
              <span className="floating-chat-count">{conversations.length}</span>
            )}
          </div>
          <div className="floating-chat-header-actions">
            <button 
              className="floating-chat-minimize-btn"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <button 
              className="floating-chat-close-btn"
              onClick={closeChat}
              title="Close Chat"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="floating-chat-content">
            {!selectedChat ? (
              /* Conversations List */
              <div className="floating-chat-sidebar">
                <div className="floating-chat-search">
                  <FaSearch className="floating-search-icon" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="floating-search-input"
                  />
                </div>
                <div className="floating-conversations-list">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map(conversation => (
                      <div
                        key={conversation.id}
                        className="floating-conversation-item"
                        onClick={() => handleChatSelect(conversation)}
                      >
                        <div className="floating-conversation-avatar">
                          {getAvatarIcon(conversation.type)}
                        </div>
                        <div className="floating-conversation-content">
                          <div className="floating-conversation-header">
                            <h4 className="floating-conversation-name">{conversation.name}</h4>
                            <span className="floating-conversation-time">{conversation.timestamp}</span>
                          </div>
                          <p className="floating-conversation-message">{conversation.lastMessage}</p>
                          <div className="floating-conversation-meta">
                            <span className="floating-ticket-id">{conversation.id}</span>
                            <span className="floating-ticket-service">• {conversation.role}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="floating-no-conversations">
                      <p>No conversations found</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Chat View */
              <div className="floating-chat-view">
                <div className="floating-chat-view-header">
                  <button 
                    className="floating-chat-back-btn"
                    onClick={() => setSelectedChat(null)}
                    title="Back to conversations"
                  >
                    ← Back
                  </button>
                  <div className="floating-chat-view-user">
                    <div className="floating-chat-view-avatar">
                      {getAvatarIcon(selectedChat.type)}
                    </div>
                  <div className="floating-chat-view-info">
                    <h4 className="floating-chat-view-name">{selectedChat.name}</h4>
                    <p className="floating-chat-view-role">{selectedChat.role}</p>
                  </div>
                </div>
                <div className="floating-chat-view-actions">
                  <button
                    className="floating-chat-call-btn"
                    onClick={() => onStartCall && onStartCall(selectedChat)}
                    title="Call"
                  >
                    <FaPhone />
                  </button>
                  <button
                    className="floating-chat-video-btn"
                    onClick={() => onStartVideoCall && onStartVideoCall(selectedChat)}
                    title="Video Call"
                  >
                    <FaVideo />
                  </button>
                </div>
              </div>

                <div className="floating-chat-messages">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`floating-message ${
                          message.sender === 'specialist' ? 'sent' : 'received'
                        }`}
                      >
                        <div className="floating-message-avatar">
                          {getAvatarIcon(message.sender === 'specialist' ? 'specialist' : selectedChat.type)}
                        </div>
                        <div className="floating-message-bubble">
                          <p className="floating-message-text">{message.text}</p>
                          <span className="floating-message-time">{message.timestamp}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="floating-message-empty">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="floating-chat-input-form" onSubmit={handleSendMessage}>
                  <div className="floating-chat-input-container">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleInputChange}
                      placeholder="Type a message..."
                      className="floating-chat-input"
                      maxLength={maxMessageLength}
                    />
                    <button 
                      type="submit" 
                      className="floating-chat-send-btn" 
                      disabled={!newMessage.trim()}
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                  <div className="floating-chat-character-count">
                    {newMessage.length}/{maxMessageLength}
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// Embedded CSS Styles
const floatingChatStyles = `
/* Floating Chat Widget Styles */
.floating-chat-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #4aa7ed;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(74, 167, 237, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 9999;
  transition: all 0.3s ease;
}

.floating-chat-button:hover {
  background: #0b5388;
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(74, 167, 237, 0.6);
}

.floating-chat-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f44336;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid white;
}

.floating-chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 9999;
  overflow: hidden;
  transition: all 0.3s ease;
}

.floating-chat-widget.minimized {
  height: 60px;
}

.floating-chat-header {
  background: linear-gradient(135deg, #4aa7ed 0%, #0b5388 100%);
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px 16px 0 0;
}

.floating-chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.floating-chat-header-icon {
  font-size: 20px;
}

.floating-chat-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.floating-chat-count {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.floating-chat-header-actions {
  display: flex;
  gap: 8px;
}

.floating-chat-minimize-btn,
.floating-chat-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.floating-chat-minimize-btn:hover,
.floating-chat-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.floating-chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f5f5;
}

.floating-chat-sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.floating-chat-search {
  padding: 12px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
}

.floating-search-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
}

.floating-search-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.floating-search-input:focus {
  border-color: #4aa7ed;
  box-shadow: 0 0 0 3px rgba(74, 167, 237, 0.1);
}

.floating-conversations-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.floating-conversation-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.floating-conversation-item:hover {
  background: #e3f2fd;
  transform: translateX(4px);
}

.floating-conversation-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #4aa7ed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.floating-conversation-content {
  flex: 1;
  min-width: 0;
}

.floating-conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.floating-conversation-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.floating-conversation-time {
  font-size: 11px;
  color: #999;
}

.floating-conversation-message {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.floating-conversation-meta {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 11px;
  color: #999;
}

.floating-ticket-id {
  font-weight: 600;
  color: #4aa7ed;
}

.floating-ticket-service {
  color: #999;
}

.floating-no-conversations {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.floating-chat-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
}

.floating-chat-view-header {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.floating-chat-back-btn {
  background: #f5f5f5;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
}

.floating-chat-back-btn:hover {
  background: #e0e0e0;
}

.floating-chat-view-user {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.floating-chat-view-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4aa7ed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.floating-chat-view-info {
  flex: 1;
}

.floating-chat-view-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.floating-chat-view-role {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.floating-chat-view-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.floating-chat-call-btn,
.floating-chat-video-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  color: #4aa7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.floating-chat-call-btn:hover {
  background: #4aa7ed;
  color: white;
  transform: scale(1.1);
}

.floating-chat-video-btn:hover {
  background: #4aa7ed;
  color: white;
  transform: scale(1.1);
}

.floating-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.floating-message {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.floating-message.sent {
  flex-direction: row-reverse;
}

.floating-message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #4aa7ed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.floating-message.sent .floating-message-avatar {
  background: #0b5388;
}

.floating-message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.floating-message.sent .floating-message-bubble {
  background: #4aa7ed;
  color: white;
}

.floating-message-text {
  margin: 0 0 4px 0;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.floating-message-time {
  font-size: 10px;
  opacity: 0.7;
  display: block;
}

.floating-message-empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.floating-chat-input-form {
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.floating-chat-input-container {
  display: flex;
  gap: 8px;
  align-items: center;
  background: #f5f5f5;
  border-radius: 24px;
  padding: 8px 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.floating-chat-input-container:focus-within {
  border-color: #4aa7ed;
  background: white;
}

.floating-chat-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #333;
  padding: 4px 0;
}

.floating-chat-input::placeholder {
  color: #999;
}

.floating-chat-send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #4aa7ed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.floating-chat-send-btn:hover:not(:disabled) {
  background: #0b5388;
  transform: scale(1.1);
}

.floating-chat-send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.floating-chat-character-count {
  text-align: right;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .floating-chat-widget {
    width: calc(100vw - 40px);
    height: calc(100vh - 40px);
    max-width: 400px;
    max-height: 600px;
  }

  .floating-chat-button {
    width: 56px;
    height: 56px;
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .floating-chat-widget {
    width: 100vw;
    height: 100vh;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }

  .floating-chat-header {
    border-radius: 0;
  }
}

.floating-conversations-list::-webkit-scrollbar,
.floating-chat-messages::-webkit-scrollbar {
  width: 6px;
}

.floating-conversations-list::-webkit-scrollbar-track,
.floating-chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.floating-conversations-list::-webkit-scrollbar-thumb,
.floating-chat-messages::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.floating-conversations-list::-webkit-scrollbar-thumb:hover,
.floating-chat-messages::-webkit-scrollbar-thumb:hover {
  background: #999;
}
`;

export default FloatingChat;
