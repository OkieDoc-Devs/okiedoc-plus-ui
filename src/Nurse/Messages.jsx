import React, { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaComments,
  FaTimes,
  FaFileAlt,
  FaUpload,
  FaCamera,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import {
  getNurseFirstName,
  getNurseProfileImage,
} from "./services/storageService.js";
import { getFallbackNotifications } from "./services/notificationService.js";
import "./NurseStyles.css";

const Messages = () => {
  const navigate = useNavigate();
  const [notifications] = useState(getFallbackNotifications());
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);

  const CHARACTER_LIMIT = 500;

  const handleLogout = () => {
    navigate("/");
  };

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
      status: "online",
    },
    {
      id: 2,
      name: "John",
      role: "Patient",
      avatar: null,
      lastMessage: "Alright, I'll transfer to you to our Doctor",
      timestamp: "08-20-2022 13:12 PM",
      unreadCount: 0,
      isOnline: true,
      status: "online",
    },
    {
      id: 3,
      name: "Nurse Jackie",
      role: "Nurse",
      avatar: null,
      lastMessage: "Please send me the patient John's latest test results",
      timestamp: "08-19-2022 10:45 AM",
      unreadCount: 1,
      isOnline: false,
      status: "offline",
    },
    {
      id: 4,
      name: "Dr. Sarah Martinez",
      role: "Specialist - Neurology",
      avatar: null,
      lastMessage: "The patient ticket of John Smith needs urgent attention",
      timestamp: "08-19-2022 09:30 AM",
      unreadCount: 1,
      isOnline: true,
      status: "online",
    },
    {
      id: 5,
      name: "Nurse Emily",
      role: "Nurse",
      avatar: null,
      lastMessage: "Thanks for the help with the transfer!",
      timestamp: "08-18-2022 02:30 PM",
      unreadCount: 0,
      isOnline: true,
      status: "online",
    },
  ];

  // Dummy data for received messages
  const getDummyMessages = (conversationId) => {
    const messageTemplates = {
      1: [
        {
          id: 1,
          sender: "specialist",
          text: "Hi, there! This is Dr. Christina",
          timestamp: "08-20-2022 13:12 PM",
        },
        {
          id: 2,
          sender: "nurse",
          text: "Good day, we have a ticket for patient Jane who is experiencing severe headaches.",
          timestamp: "08-20-2022 13:12 PM",
        },
        {
          id: 3,
          sender: "specialist",
          text: "Will check the ticket and need some more supporting details",
          timestamp: "08-20-2022 13:12 PM",
        },
      ],
      2: [
        {
          id: 1,
          sender: "nurse",
          text: "Hi, there! Just want to confirm the level of pain",
          timestamp: "08-20-2022 13:12 PM",
        },
        {
          id: 2,
          sender: "patient",
          text: "Hi, there! I'm in deep pain. Let's say 8/10!",
          timestamp: "08-20-2022 13:12 PM",
        },
        {
          id: 3,
          sender: "nurse",
          text: "Alright, I'll transfer to you to our Doctor",
          timestamp: "08-20-2022 13:12 PM",
        },
        {
          id: 4,
          sender: "system",
          text: "You have been transferred to Dr. Christina. Please wait 5-10 mins",
          timestamp: "08-20-2022 13:12 PM",
        },
        {
          id: 5,
          sender: "system",
          text: "Dr. Christina is in the chat now",
          timestamp: "08-20-2022 13:12 PM",
        },
      ],
      3: [
        {
          id: 1,
          sender: "nurse",
          text: "Hi Nurse Jackie, I need help with patient John's latest test results",
          timestamp: "08-19-2022 10:30 AM",
        },
        {
          id: 2,
          sender: "other-nurse",
          text: "Please send me the patient John's latest test results",
          timestamp: "08-19-2022 10:45 AM",
        },
        {
          id: 3,
          sender: "nurse",
          text: "Sure, I'll upload them now",
          timestamp: "08-19-2022 10:46 AM",
        },
      ],
      4: [
        {
          id: 1,
          sender: "nurse",
          text: "The patient ticket of John Smith needs urgent attention",
          timestamp: "08-19-2022 09:30 AM",
        },
      ],
      5: [
        {
          id: 1,
          sender: "other-nurse",
          text: "Hey! Can you help me with the patient transfer to another specialist?",
          timestamp: "08-18-2022 02:15 PM",
        },
        {
          id: 2,
          sender: "nurse",
          text: "Of course! What do you need?",
          timestamp: "08-18-2022 02:18 PM",
        },
        {
          id: 3,
          sender: "other-nurse",
          text: "I need to transfer the patient Mr. Smith to Dr. Martin.",
          timestamp: "08-18-2022 02:20 PM",
        },
        {
          id: 4,
          sender: "nurse",
          text: "Done! Patient should be with Dr. Martin now.",
          timestamp: "08-18-2022 02:25 PM",
        },
        {
          id: 5,
          sender: "other-nurse",
          text: "Thanks for the help with the ticket!",
          timestamp: "08-18-2022 02:30 PM",
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
    setNewMessage("");
    setUploadedFiles([]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (activeChat && (newMessage.trim() || uploadedFiles.length > 0)) {
      const trimmedMessage = newMessage.trim();
      if (trimmedMessage) {
        const message = {
          id: Date.now(),
          sender: "nurse",
          text: trimmedMessage,
          timestamp: new Date().toLocaleString(),
        };
        setChatMessages((prev) => [...prev, message]);
      }

      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((file, index) => {
          const fileMessage = {
            id: Date.now() + index + 1,
            sender: "nurse",
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

      setNewMessage("");
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
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-center">
          <img
            src="/okie-doc-logo.png"
            alt="Okie-Doc+"
            className="logo-image"
          />
        </div>
        <h3 className="dashboard-title">Nurse Dashboard</h3>
        <div className="user-account">
          <img
            src={getNurseProfileImage()}
            alt="Account"
            className="account-icon"
          />
          <span className="account-name">{getNurseFirstName()}</span>
          <div className="account-dropdown">
            <button
              className="dropdown-item"
              onClick={() => navigate("/nurse-myaccount")}
            >
              My Account
            </button>
            <button
              className="dropdown-item logout-item"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
        <div className="dashboard-nav">
          <button
            className="nav-tab"
            onClick={() => navigate("/nurse-dashboard")}
          >
            Dashboard
          </button>
          <button
            className="nav-tab"
            onClick={() => navigate("/nurse-manage-appointments")}
          >
            Manage Appointments
          </button>
          <button className="nav-tab active">Messages</button>
          <button
            className="nav-tab"
            onClick={() => navigate("/nurse-notifications")}
          >
            Notifications ({notifications.filter((n) => n.unread).length})
          </button>
        </div>
      </div>
      <div className="nurse-page-content">
        <div
          className={`nurse-messenger-container ${
            activeChat ? "has-active-chat" : ""
          }`}
        >
          {/* Conversations List */}
          <div className="nurse-conversations-sidebar">
            <div className="nurse-conversations-header">
              <h2 className="nurse-conversations-title">
                {activeChat ? activeChat.name : "Messages"}
              </h2>
              <div className="nurse-conversations-search">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="nurse-search-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="nurse-conversations-list">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`nurse-conversation-item ${
                      activeChat?.id === conversation.id ? "active" : ""
                    }`}
                    onClick={() => openChat(conversation)}
                  >
                    <div className="nurse-conversation-avatar">
                      {conversation.avatar ? (
                        <img
                          src={conversation.avatar}
                          alt={conversation.name}
                        />
                      ) : (
                        <FaUser className="nurse-avatar-icon" />
                      )}
                      <div
                        className={`nurse-online-indicator ${
                          conversation.isOnline ? "online" : "offline"
                        }`}
                      ></div>
                    </div>

                    <div className="nurse-conversation-content">
                      <div className="nurse-conversation-header">
                        <h4 className="nurse-conversation-name">
                          {conversation.name}
                        </h4>
                        <span className="nurse-conversation-time">
                          {conversation.timestamp.split(" ")[0]}
                        </span>
                      </div>
                      <div className="nurse-conversation-preview">
                        <p className="nurse-conversation-message">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <div className="nurse-unread-badge">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="nurse-conversation-role">
                        {conversation.role}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="nurse-no-results">
                  <p>No conversations found</p>
                  <span>Try searching for a different name or keyword</span>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          {activeChat ? (
            <div className="nurse-chat-area">
              <div className="nurse-chat-header">
                <div className="nurse-chat-user-info">
                  <div className="nurse-chat-avatar">
                    {activeChat.avatar ? (
                      <img src={activeChat.avatar} alt={activeChat.name} />
                    ) : (
                      <FaUser className="nurse-avatar-icon" />
                    )}
                    <div
                      className={`nurse-online-indicator ${
                        activeChat.isOnline ? "online" : "offline"
                      }`}
                    ></div>
                  </div>
                  <div className="nurse-chat-user-details">
                    <h3 className="nurse-chat-user-name">{activeChat.name}</h3>
                    <p className="nurse-chat-user-role">{activeChat.role}</p>
                  </div>
                </div>
                <button
                  className="nurse-chat-close-btn"
                  onClick={closeChat}
                  title="Back to Messages"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="nurse-chat-messages" ref={chatMessagesRef}>
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`nurse-message ${
                      message.sender === "nurse"
                        ? "nurse-message-nurse"
                        : message.sender === "system"
                        ? "nurse-message-system"
                        : "nurse-message-other"
                    }`}
                  >
                    {message.sender === "system" ? (
                      <div className="nurse-system-message">
                        <p className="nurse-message-text">{message.text}</p>
                        <span className="nurse-message-time">
                          {message.timestamp}
                        </span>
                      </div>
                    ) : (
                      <div className="nurse-message-content">
                        <p className="nurse-message-text">{message.text}</p>
                        <span className="nurse-message-time">
                          {message.timestamp}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Document Upload Section */}
              <div className="nurse-document-upload">
                <div className="nurse-upload-header">
                  <h4 className="nurse-upload-title">Upload Documents</h4>
                  <p className="nurse-upload-subtitle">
                    Share files and images with specialists
                  </p>
                </div>

                <div className="nurse-file-upload-area">
                  <input
                    type="file"
                    id="nurse-file-upload"
                    ref={fileInputRef}
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="nurse-file-upload"
                    className="nurse-file-label"
                  >
                    <FaUpload className="nurse-upload-icon" />
                    <span className="nurse-upload-text">
                      Choose files to upload
                    </span>
                    <span className="nurse-upload-hint">
                      Images, PDF, DOC, TXT up to 10MB
                    </span>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="nurse-uploaded-files">
                    <h5 className="nurse-files-title">Attached Files:</h5>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="nurse-file-item">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="nurse-file-preview"
                          />
                        ) : (
                          <FaFileAlt className="nurse-file-icon" />
                        )}
                        <div className="nurse-file-info">
                          <span className="nurse-file-name">{file.name}</span>
                          <span className="nurse-file-size">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <button
                          className="nurse-file-remove"
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

              <form
                className="nurse-chat-input-form"
                onSubmit={handleSendMessage}
              >
                <div className="nurse-chat-input-container">
                  <button
                    type="button"
                    className="nurse-camera-btn"
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
                    className="nurse-chat-input"
                    maxLength={CHARACTER_LIMIT}
                  />
                  <div className="nurse-char-counter">
                    {remainingChars}/{CHARACTER_LIMIT}
                  </div>
                  <button
                    type="submit"
                    className="nurse-chat-send-btn"
                    disabled={!newMessage.trim() && uploadedFiles.length === 0}
                    title="Send message"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="nurse-no-chat-selected">
              <FaComments className="nurse-no-chat-icon" />
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
