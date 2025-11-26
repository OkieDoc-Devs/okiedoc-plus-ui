import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaUser,
  FaComments,
  FaTimes,
  FaFileAlt,
  FaPaperclip,
  FaPhone,
  FaVideo,
  FaPlus,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import {
  getNurseFirstName,
  getNurseProfileImage,
} from "./services/storageService.js";
import {
  fetchNotificationsFromAPI,
  logoutFromAPI,
} from "./services/apiService.js";
import { useChat } from "./services/useChat.js";
import {
  isAllowedFileType,
  getMaxFileSize,
  formatFileSize,
  getUserTypeLabel,
} from "./services/chatService.js";
import VideoCall from "./VideoCall.jsx";
import "./NurseStyles.css";

const Messages = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);

  const getCurrentUserId = () => {
    try {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        const user = JSON.parse(currentUser);
        if (user.id) {
          console.log("Chat: Using currentUser.id:", user.id);
          return user.id;
        }
      }
      const nurseId = localStorage.getItem("nurse.id");
      if (nurseId) {
        const parsed = parseInt(nurseId, 10);
        if (!isNaN(parsed)) {
          console.log("Chat: Using nurse.id (parsed):", parsed);
          return parsed;
        }
        console.warn("Chat: nurse.id is not a numeric ID:", nurseId);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
    console.warn("Chat: Could not determine current user ID");
    return null;
  };

  const currentUserId = getCurrentUserId();

  const {
    conversations,
    activeConversation,
    messages: chatMessages,
    loading: chatLoading,
    error: chatError,
    typingUsers,
    openConversation,
    closeConversation,
    sendMessage: sendChatMessage,
    uploadFile: uploadChatFile,
    handleTyping,
    startConversation,
    searchUsers,
    getAllUsers,
    loadConversations,
  } = useChat({ currentUserId, currentUserType: "n" });

  const CHARACTER_LIMIT = 500;

  const handleLogout = async () => {
    try {
      await logoutFromAPI();
    } catch (error) {
      console.error("Logout error:", error);
    }
    navigate("/");
  };

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notificationsArray = await fetchNotificationsFromAPI();
        setNotifications(notificationsArray || []);
      } catch (error) {
        console.error("Messages: Error loading notifications:", error);
        setNotifications([]);
      }
    };

    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUserSearch = useCallback(
    async (query) => {
      setIsSearchingUsers(true);
      try {
        if (!query.trim()) {
          const results = await getAllUsers();
          setUserSearchResults(results);
        } else {
          const results = await searchUsers(query);
          setUserSearchResults(results);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setUserSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    },
    [searchUsers, getAllUsers]
  );

  useEffect(() => {
    if (showNewChatModal) {
      handleUserSearch("");
    }
  }, [showNewChatModal]);

  useEffect(() => {
    if (!showNewChatModal) return;
    const timer = setTimeout(() => {
      handleUserSearch(userSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery, handleUserSearch, showNewChatModal]);

  const handleStartNewChat = async (userId) => {
    try {
      await startConversation("direct", userId);
      setShowNewChatModal(false);
      setUserSearchQuery("");
      setUserSearchResults([]);
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  const openChat = (conversation) => {
    openConversation(conversation);
    setUploadedFiles([]);
  };

  const closeChat = () => {
    closeConversation();
    setNewMessage("");
    setUploadedFiles([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (activeConversation && (newMessage.trim() || uploadedFiles.length > 0)) {
      const trimmedMessage = newMessage.trim();

      if (trimmedMessage) {
        await sendChatMessage(trimmedMessage);
      }

      if (uploadedFiles.length > 0) {
        for (const fileData of uploadedFiles) {
          if (!isAllowedFileType(fileData.type)) {
            console.error("File type not allowed:", fileData.type);
            continue;
          }
          const maxSize = getMaxFileSize(fileData.type);
          if (fileData.size > maxSize) {
            console.error("File too large:", fileData.name);
            continue;
          }
          await uploadChatFile(fileData.file);
        }
      }

      setNewMessage("");
      setUploadedFiles([]);
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    if (value.length <= CHARACTER_LIMIT) {
      setNewMessage(value);
      if (value.length > 0) {
        handleTyping(true);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredConversations = conversations.filter((conversation) => {
    const query = searchQuery.toLowerCase();
    return (
      conversation.name.toLowerCase().includes(query) ||
      (conversation.role || "").toLowerCase().includes(query) ||
      (conversation.lastMessage || "").toLowerCase().includes(query)
    );
  });

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files
      .filter((file) => {
        if (!isAllowedFileType(file.type)) {
          console.error("File type not allowed:", file.type);
          return false;
        }
        const maxSize = getMaxFileSize(file.type);
        if (file.size > maxSize) {
          console.error(
            "File too large:",
            file.name,
            "Max:",
            formatFileSize(maxSize)
          );
          return false;
        }
        return true;
      })
      .map((file) => ({
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

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleVoiceCall = () => {
    setIsVideoCall(false);
    setShowVideoCall(true);
  };

  const handleVideoCallClick = () => {
    setIsVideoCall(true);
    setShowVideoCall(true);
  };

  const handleCloseVideoCall = () => {
    setShowVideoCall(false);
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
        {chatLoading && conversations.length === 0 && (
          <div className="nurse-loading-state">
            <FaSpinner className="nurse-spinner" />
            <p>Loading conversations...</p>
          </div>
        )}
        {chatError && (
          <div className="nurse-error-state">
            <p>Error loading conversations: {chatError}</p>
            <button onClick={loadConversations}>Retry</button>
          </div>
        )}

        <div
          className={`nurse-messenger-container ${
            activeConversation ? "has-active-chat" : ""
          }`}
        >
          <div className="nurse-conversations-sidebar">
            <div className="nurse-conversations-header">
              <h2 className="nurse-conversations-title">
                <span>Messages</span>
                <button
                  className="nurse-new-chat-btn"
                  onClick={() => setShowNewChatModal(true)}
                  title="Start new conversation"
                >
                  <FaPlus />
                </button>
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
                      activeConversation?.id === conversation.id ? "active" : ""
                    } ${conversation.unreadCount > 0 ? "unread" : ""}`}
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
                          {conversation.timestamp || ""}
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

          {activeConversation ? (
            <div className="nurse-chat-area">
              <div className="nurse-chat-header">
                <div className="nurse-chat-user-info">
                  <div className="nurse-chat-avatar">
                    {activeConversation.avatar ? (
                      <img
                        src={activeConversation.avatar}
                        alt={activeConversation.name}
                      />
                    ) : (
                      <FaUser className="nurse-avatar-icon" />
                    )}
                    <div
                      className={`nurse-online-indicator ${
                        activeConversation.isOnline ? "online" : "offline"
                      }`}
                    ></div>
                  </div>
                  <div className="nurse-chat-user-details">
                    <h3 className="nurse-chat-user-name">
                      {activeConversation.name}
                    </h3>
                    <p className="nurse-chat-user-role">
                      {activeConversation.role ||
                        getUserTypeLabel(activeConversation.otherUserType)}
                    </p>
                    {typingUsers.length > 0 && (
                      <div className="nurse-typing-indicator">
                        <div className="nurse-typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="nurse-chat-actions">
                  <button
                    className="nurse-call-btn"
                    onClick={handleVoiceCall}
                    title="Voice Call"
                  >
                    <FaPhone />
                  </button>
                  <button
                    className="nurse-call-btn video-btn"
                    onClick={handleVideoCallClick}
                    title="Video Call"
                  >
                    <FaVideo />
                  </button>
                  <button
                    className="nurse-chat-close-btn"
                    onClick={closeChat}
                    title="Back to Messages"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="nurse-chat-messages" ref={chatMessagesRef}>
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`nurse-message ${
                      message.isSent
                        ? "nurse-message-sent"
                        : "nurse-message-received"
                    } nurse-message-type-${message.sender}`}
                  >
                    {message.sender === "system" ? (
                      <div className="nurse-system-message">
                        <p className="nurse-message-text">{message.text}</p>
                        {message.subtext && (
                          <p className="nurse-message-subtext">
                            {message.subtext}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        {!message.isSent && (
                          <div className="nurse-message-avatar">
                            {message.avatar ? (
                              <img
                                src={message.avatar}
                                alt={message.senderName || "User"}
                              />
                            ) : (
                              <FaUser className="nurse-avatar-icon-small" />
                            )}
                          </div>
                        )}
                        <div className="nurse-message-bubble-wrapper">
                          <div
                            className={`nurse-message-content nurse-message-content-${message.sender}`}
                          >
                            {message.messageType === "file" ||
                            message.messageType === "image" ? (
                              <div className="nurse-message-file">
                                {message.messageType === "image" ? (
                                  <img
                                    src={message.fileUrl}
                                    alt={message.fileName}
                                    className="nurse-message-image"
                                  />
                                ) : (
                                  <a
                                    href={message.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="nurse-file-link"
                                  >
                                    <FaFileAlt /> {message.fileName} (
                                    {formatFileSize(message.fileSize)})
                                  </a>
                                )}
                                {message.text && (
                                  <p className="nurse-message-text">
                                    {message.text}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="nurse-message-text">
                                {message.text}
                              </p>
                            )}
                          </div>
                          <span className="nurse-message-time">
                            {message.timestamp}
                          </span>
                        </div>
                        {message.isSent && (
                          <div className="nurse-message-avatar">
                            {message.avatar ? (
                              <img
                                src={message.avatar}
                                alt={message.senderName || "You"}
                              />
                            ) : (
                              <FaUser className="nurse-avatar-icon-small" />
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}

                {typingUsers.length > 0 && (
                  <div className="nurse-message nurse-message-received nurse-typing-bubble">
                    <div className="nurse-message-avatar">
                      <FaUser className="nurse-avatar-icon-small" />
                    </div>
                    <div className="nurse-message-bubble-wrapper">
                      <div className="nurse-message-content nurse-typing-content">
                        <div className="nurse-typing-dots-chat">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <input
                type="file"
                id="nurse-file-upload"
                ref={fileInputRef}
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />

              {uploadedFiles.length > 0 && (
                <div className="nurse-attached-files">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="nurse-attached-file-item">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="nurse-attached-file-preview"
                        />
                      ) : (
                        <FaFileAlt className="nurse-attached-file-icon" />
                      )}
                      <span className="nurse-attached-file-name">
                        {file.name}
                      </span>
                      <button
                        className="nurse-attached-file-remove"
                        onClick={() => handleRemoveFile(file.id)}
                        type="button"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form
                className="nurse-chat-input-form"
                onSubmit={handleSendMessage}
              >
                <div className="nurse-chat-input-container">
                  <button
                    type="button"
                    className="nurse-attach-btn"
                    onClick={handleAttachClick}
                    title="Attach file"
                  >
                    <FaPaperclip />
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

      {showNewChatModal && (
        <div
          className="nurse-modal-overlay"
          onClick={() => setShowNewChatModal(false)}
        >
          <div className="nurse-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nurse-modal-header">
              <h3>Start New Conversation</h3>
              <button
                className="nurse-modal-close"
                onClick={() => setShowNewChatModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="nurse-modal-body">
              <div className="nurse-user-search">
                <FaSearch className="nurse-search-icon" />
                <input
                  type="text"
                  placeholder="Search users by name..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="nurse-user-search-input"
                />
              </div>
              <div className="nurse-user-results">
                {isSearchingUsers ? (
                  <div className="nurse-searching">
                    <FaSpinner className="nurse-spinner" />
                    <span>Searching...</span>
                  </div>
                ) : userSearchResults.length > 0 ? (
                  userSearchResults.map((user) => (
                    <div
                      key={user.Id || user.id}
                      className="nurse-user-result-item"
                      onClick={() => handleStartNewChat(user.Id || user.id)}
                    >
                      <div className="nurse-user-avatar">
                        <FaUser />
                      </div>
                      <div className="nurse-user-info">
                        <span className="nurse-user-name">
                          {user.Display_Name || user.name || user.Email}
                        </span>
                        <span className="nurse-user-type">
                          {user.User_Type ||
                            getUserTypeLabel(
                              user.User_Type_Code || user.userType || user.type
                            )}
                        </span>
                      </div>
                    </div>
                  ))
                ) : userSearchQuery ? (
                  <div className="nurse-no-users">
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="nurse-search-hint">
                    <p>Type a name to search for users</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showVideoCall && activeConversation && (
        <VideoCall
          activeUser={activeConversation}
          onClose={handleCloseVideoCall}
          isVideoCall={isVideoCall}
        />
      )}
    </div>
  );
};

export default Messages;
