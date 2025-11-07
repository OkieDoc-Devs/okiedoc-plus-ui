import React, { useState } from 'react';
import { FaUser, FaUserNurse, FaUserMd, FaSearch, FaTimes } from 'react-icons/fa';

/**
 * Specialist Conversations Component
 * All-in-one component with embedded styles
 */
const SpecialistConversations = ({ onClose, onSelectConversation, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample conversations data
  const conversations = [
    {
      id: 1,
      name: "Dr. Christina Wung",
      role: "Specialist - Cardiology",
      avatar: null,
      lastMessage: "I will ask some supporting details",
      timestamp: "00-20-2022",
      unreadCount: 0,
      isOnline: true,
      status: "online",
      type: "specialist"
    },
    {
      id: 2,
      name: "John",
      role: "Patient",
      avatar: null,
      lastMessage: "Alright, I'll transfer to you to our Doctor",
      timestamp: "00-19-2022",
      unreadCount: 0,
      isOnline: true,
      status: "online",
      type: "patient"
    },
    {
      id: 3,
      name: "Nurse Jackie",
      role: "Nurse",
      avatar: null,
      lastMessage: "Please send me the patient information",
      timestamp: "00-18-2022",
      unreadCount: 1,
      isOnline: false,
      status: "offline",
      type: "nurse"
    },
    {
      id: 4,
      name: "Dr. Sarah Martinez",
      role: "Specialist - Neurosurgery",
      avatar: null,
      lastMessage: "The patient ticket of John Smith has been assigned to you",
      timestamp: "00-17-2022",
      unreadCount: 1,
      isOnline: true,
      status: "online",
      type: "specialist"
    },
    {
      id: 5,
      name: "Nurse Emily",
      role: "Nurse",
      avatar: null,
      lastMessage: "Thanks for the help with the budget planning",
      timestamp: "00-10-2012",
      unreadCount: 0,
      isOnline: true,
      status: "online",
      type: "nurse"
    }
  ];

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleConversationClick = (conversation) => {
    onSelectConversation(conversation);
  };

  return (
    <>
      <style>{specialistConversationsStyles}</style>
      <div className="specialist-conversations-container">
        <div className="specialist-conversations-header">
          <h2 className="specialist-conversations-title">{currentUser?.firstName || 'Specialist'}</h2>
          <button className="specialist-conversations-close-btn" onClick={onClose} title="Close">
            <FaTimes />
          </button>
        </div>

        <div className="specialist-conversations-search">
          <FaSearch className="specialist-search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="specialist-search-input"
          />
        </div>

        <div className="specialist-conversations-list">
          {filteredConversations.map(conversation => (
            <div
              key={conversation.id}
              className="specialist-conversation-item"
              onClick={() => handleConversationClick(conversation)}
            >
              <div className="specialist-conversation-avatar">
                <div className="specialist-avatar-icon">
                  {getAvatarIcon(conversation.type)}
                </div>
                {conversation.isOnline && (
                  <div className="specialist-online-indicator"></div>
                )}
              </div>
              
              <div className="specialist-conversation-content">
                <div className="specialist-conversation-header">
                  <h3 className="specialist-conversation-name">{conversation.name}</h3>
                  <span className="specialist-conversation-time">{conversation.timestamp}</span>
                </div>
                
                <div className="specialist-conversation-body">
                  <p className="specialist-conversation-message">{conversation.lastMessage}</p>
                  <p className="specialist-conversation-role">{conversation.role}</p>
                </div>
              </div>

              {conversation.unreadCount > 0 && (
                <div className="specialist-unread-badge">
                  {conversation.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Embedded CSS Styles
const specialistConversationsStyles = `
/* Specialist Conversations Styles - Facebook Messenger Style */
.specialist-conversations-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f0f8ff;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.specialist-conversations-header {
  background: #4aa7ed;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.specialist-conversations-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.specialist-conversations-close-btn {
  background: rgba(255, 255, 255, 0.2);
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
  font-size: 1.1rem;
}

.specialist-conversations-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.specialist-conversations-search {
  background: white;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
}

.specialist-search-icon {
  position: absolute;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 1rem;
}

.specialist-search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1rem;
  background: #f5f5f5;
  outline: none;
  transition: all 0.3s ease;
}

.specialist-search-input:focus {
  background: white;
  border-color: #4aa7ed;
  box-shadow: 0 0 0 3px rgba(74, 167, 237, 0.1);
}

.specialist-search-input::placeholder {
  color: #999;
}

.specialist-conversations-list {
  flex: 1;
  overflow-y: auto;
  background: white;
}

.specialist-conversation-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.specialist-conversation-item:hover {
  background: #f8f9fa;
}

.specialist-conversation-item:active {
  background: #e9ecef;
}

.specialist-conversation-avatar {
  position: relative;
  margin-right: 1rem;
  flex-shrink: 0;
}

.specialist-avatar-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.specialist-online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #4caf50;
  border: 2px solid white;
  border-radius: 50%;
}

.specialist-conversation-content {
  flex: 1;
  min-width: 0;
}

.specialist-conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.specialist-conversation-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.specialist-conversation-time {
  font-size: 0.8rem;
  color: #999;
  white-space: nowrap;
  margin-left: 0.5rem;
}

.specialist-conversation-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.specialist-conversation-message {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.specialist-conversation-role {
  margin: 0;
  font-size: 0.8rem;
  color: #999;
  font-weight: 500;
}

.specialist-unread-badge {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: #4aa7ed;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 20px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .specialist-conversations-header {
    padding: 0.75rem 1rem;
  }
  
  .specialist-conversations-title {
    font-size: 1.1rem;
  }
  
  .specialist-conversations-close-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  
  .specialist-conversations-search {
    padding: 0.75rem 1rem;
  }
  
  .specialist-search-icon {
    left: 1.5rem;
    font-size: 0.9rem;
  }
  
  .specialist-search-input {
    padding: 0.6rem 0.8rem 0.6rem 2.5rem;
    font-size: 0.9rem;
  }
  
  .specialist-conversation-item {
    padding: 0.75rem 1rem;
  }
  
  .specialist-avatar-icon {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }
  
  .specialist-online-indicator {
    width: 12px;
    height: 12px;
  }
  
  .specialist-conversation-name {
    font-size: 0.9rem;
    max-width: 150px;
  }
  
  .specialist-conversation-time {
    font-size: 0.75rem;
  }
  
  .specialist-conversation-message {
    font-size: 0.85rem;
    max-width: 200px;
  }
  
  .specialist-conversation-role {
    font-size: 0.75rem;
  }
  
  .specialist-unread-badge {
    top: 0.75rem;
    right: 1rem;
    width: 18px;
    height: 18px;
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .specialist-conversations-header {
    padding: 0.5rem 0.75rem;
  }
  
  .specialist-conversations-title {
    font-size: 1rem;
  }
  
  .specialist-conversations-close-btn {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
  
  .specialist-conversations-search {
    padding: 0.5rem 0.75rem;
  }
  
  .specialist-search-icon {
    left: 1.25rem;
    font-size: 0.8rem;
  }
  
  .specialist-search-input {
    padding: 0.5rem 0.6rem 0.5rem 2.2rem;
    font-size: 0.85rem;
  }
  
  .specialist-conversation-item {
    padding: 0.6rem 0.75rem;
  }
  
  .specialist-avatar-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .specialist-online-indicator {
    width: 10px;
    height: 10px;
  }
  
  .specialist-conversation-name {
    font-size: 0.85rem;
    max-width: 120px;
  }
  
  .specialist-conversation-time {
    font-size: 0.7rem;
  }
  
  .specialist-conversation-message {
    font-size: 0.8rem;
    max-width: 150px;
  }
  
  .specialist-conversation-role {
    font-size: 0.7rem;
  }
  
  .specialist-unread-badge {
    top: 0.6rem;
    right: 0.75rem;
    width: 16px;
    height: 16px;
    font-size: 0.6rem;
  }
}
`;

export default SpecialistConversations;
