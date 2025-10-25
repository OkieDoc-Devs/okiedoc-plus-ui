import React, { useState, useEffect, useRef } from 'react';
import { FaUserMd, FaUserNurse, FaComments, FaTimes, FaUpload, FaFileAlt, FaUser, FaCamera } from 'react-icons/fa';

const Messages = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);

  const CHARACTER_LIMIT = 500;

  // Sample conversations data
  const conversations = [
    {
      id: 1,
      name: "Dr. Christina Wung",
      role: "Specialist - Cardiology",
      avatar: null,
      lastMessage: "I will ask some supporting details",
      timestamp: "08-20-2022 13:12 PM",
      unreadCount: 0,
      isOnline: true,
      status: "online"
    },
    {
      id: 2,
      name: "Nurse Tyler",
      role: "General Medicine",
      avatar: null,
      lastMessage: "Alright, I'll transfer to you to our Doctor",
      timestamp: "08-20-2022 13:12 PM",
      unreadCount: 0,
      isOnline: true,
      status: "online"
    },
    {
      id: 3,
      name: "Dr. Maria Santos",
      role: "Cardiologist",
      avatar: null,
      lastMessage: "Your lab results are ready for review. Please schedule a follow-up appointment when convenient.",
      timestamp: "08-20-2022 14:30 PM",
      unreadCount: 3,
      isOnline: true,
      status: "online"
    },
    {
      id: 4,
      name: "Nurse Sarah Johnson",
      role: "General Medicine",
      avatar: null,
      lastMessage: "Reminder: Your appointment is tomorrow at 10 AM. Please arrive 15 minutes early.",
      timestamp: "08-19-2022 16:45 PM",
      unreadCount: 0,
      isOnline: false,
      status: "offline"
    },
    {
      id: 5,
      name: "Dr. Michael Brown",
      role: "Radiology",
      avatar: null,
      lastMessage: "The X-ray images look good. I'll send you the detailed report shortly.",
      timestamp: "08-18-2022 11:20 AM",
      unreadCount: 1,
      isOnline: true,
      status: "online"
    }
  ];

  // Dummy data for received messages - matching the reference image
  const getDummyMessages = (conversationId) => {
    const messageTemplates = {
      1: [
        {
          id: 1,
          sender: "nurse",
          text: "Hi, there! Just want to confirm the level of pain",
          timestamp: "08-20-2022 13:12 PM",
          avatar: "nurse-tyler"
        },
        {
          id: 2,
          sender: "patient",
          text: "Hi, there! I'm in deep pain. Let's say 8/10!",
          timestamp: "08-20-2022 13:12 PM",
          avatar: "patient"
        },
        {
          id: 3,
          sender: "nurse",
          text: "Alright, I'll transfer to you to our Doctor",
          timestamp: "08-20-2022 13:12 PM",
          avatar: "nurse-tyler"
        },
        {
          id: 4,
          sender: "system",
          text: "Nurse Tyler transferred you to Dr. Christina Please wait 5-10 mins Dr. Christina is in the chat now",
          timestamp: "08-20-2022 13:12 PM"
        },
        {
          id: 5,
          sender: "specialist",
          text: "Hi, there! This is Dr. Christina",
          timestamp: "08-20-2022 13:12 PM",
          avatar: "dr-christina"
        },
        {
          id: 6,
          sender: "patient",
          text: "Hi, there! I'm in deep pain right now.",
          timestamp: "08-20-2022 13:12 PM",
          avatar: "patient"
        },
        {
          id: 7,
          sender: "specialist",
          text: "I will ask some supporting details",
          timestamp: "08-20-2022 13:12 PM",
          avatar: "dr-christina"
        },
      ],
      2: [
        {
          id: 1,
          sender: "nurse",
          text: "Hi, there! Just want to confirm the level of pain",
          timestamp: "08-20-2022 13:12 PM",
          avatar: "nurse-tyler"
        },
        {
          id: 2,
          sender: "patient",
          text: "Hi, there! I'm in deep pain. Let's say 8/10!",
          timestamp: "08-20-2022 13:12 PM",
          avatar: "patient"
        },
        {
          id: 3,
          sender: "nurse",
          text: "Alright, I'll transfer to you to our Doctor",
          timestamp: "08-20-2022 13:12 PM",
          avatar: "nurse-tyler"
        },
      ],
      3: [
        {
          id: 1,
          sender: "specialist",
          text: "Hello! I'm Dr. Maria Santos, your cardiologist. How are you feeling today?",
          timestamp: "08-20-2022 14:25 PM",
          avatar: "dr-maria"
        },
        {
          id: 2,
          sender: "patient",
          text: "Hi Dr. Santos, I'm feeling much better. The chest pain has reduced significantly.",
          timestamp: "08-20-2022 14:26 PM",
          avatar: "patient"
        },
        {
          id: 3,
          sender: "specialist",
          text: "That's great to hear! Your lab results are ready for review. Please schedule a follow-up appointment when convenient.",
          timestamp: "08-20-2022 14:30 PM",
          avatar: "dr-maria"
        },
      ],
      4: [
        {
          id: 1,
          sender: "nurse",
          text: "Hello! This is Nurse Sarah from General Medicine. How can I help you today?",
          timestamp: "08-19-2022 16:40 PM",
          avatar: "nurse-sarah"
        },
        {
          id: 2,
          sender: "patient",
          text: "Hi Nurse Sarah, I have a question about my upcoming appointment.",
          timestamp: "08-19-2022 16:42 PM",
          avatar: "patient"
        },
        {
          id: 3,
          sender: "nurse",
          text: "Reminder: Your appointment is tomorrow at 10 AM. Please arrive 15 minutes early.",
          timestamp: "08-19-2022 16:45 PM",
          avatar: "nurse-sarah"
        },
      ],
      5: [
        {
          id: 1,
          sender: "specialist",
          text: "Good morning! I've reviewed your X-ray images and they look good.",
          timestamp: "08-18-2022 11:15 AM",
          avatar: "dr-michael"
        },
        {
          id: 2,
          sender: "patient",
          text: "That's a relief! When will I get the detailed report?",
          timestamp: "08-18-2022 11:18 AM",
          avatar: "patient"
        },
        {
          id: 3,
          sender: "specialist",
          text: "I'll send you the detailed report shortly. You should receive it within the next hour.",
          timestamp: "08-18-2022 11:20 AM",
          avatar: "dr-michael"
        },
      ],
    };

    return (
      messageTemplates[conversationId] || [
        {
          id: 1,
          sender: "specialist",
          text: `Hello! This is your conversation with ${
            conversations.find((c) => c.id === conversationId)?.name
          }`,
          timestamp: new Date().toLocaleString(),
        },
      ]
    );
  };

  const openChat = (conversation) => {
    setActiveChat(conversation);
    const messages = getDummyMessages(conversation.id);
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
            {filteredConversations.length > 0 ? (
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
            ) : (
              <div className="patient-no-results">
                <p>No conversations found</p>
                <span>Try searching for a different name or keyword</span>
              </div>
            )}
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
