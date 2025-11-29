import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaUser,
  FaUserNurse,
  FaUserMd,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaPhone,
  FaVideo,
  FaPaperclip,
  FaFileAlt,
  FaPlus,
  FaSpinner,
} from "react-icons/fa";
import useChat from "../Nurse/services/useChat";
import {
  isAllowedFileType,
  getMaxFileSize,
  formatFileSize,
  getUserTypeLabel,
} from "../Nurse/services/chatService";
import VideoCall from "../Nurse/VideoCall";

/**
 * Floating Chat Widget for Specialist Dashboard
 * All-in-one component with embedded styles
 */
const FloatingChat = ({
  tickets = [], // Kept for backward compatibility
  currentUser, // Kept for backward compatibility
  onStartCall, // Kept for backward compatibility
  onStartVideoCall, // Kept for backward compatibility
}) => {
  // Suppress unused prop warnings - these are kept for API compatibility
  void tickets;
  void currentUser;
  void onStartCall;
  void onStartVideoCall;
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const maxMessageLength = 500;

  // Get specialist user ID from localStorage
  const getCurrentUserId = () => {
    try {
      const user = localStorage.getItem("okiedoc_specialist_user");
      return user ? JSON.parse(user).id : null;
    } catch {
      return null;
    }
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
  } = useChat({ currentUserId, currentUserType: "s" });

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
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
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
  }, [showNewChatModal, handleUserSearch]);

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
      console.error("Error starting conversation:", error);
    }
  };

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conversation.role || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (conversation.lastMessage || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Auto-scroll to bottom
  useEffect(() => {
    if (
      messagesEndRef.current &&
      isOpen &&
      !isMinimized &&
      activeConversation
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isOpen, isMinimized, activeConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (
      !activeConversation ||
      (!newMessage.trim() && uploadedFiles.length === 0)
    ) {
      return;
    }

    try {
      const trimmedMessage = newMessage.trim();
      if (trimmedMessage) {
        await sendChatMessage(trimmedMessage);
      }

      if (uploadedFiles.length > 0) {
        for (const fileData of uploadedFiles) {
          if (!isAllowedFileType(fileData.file)) continue;
          const maxSize = getMaxFileSize(fileData.type);
          if (fileData.size > maxSize) continue;
          await uploadChatFile(fileData.file);
        }
      }

      setNewMessage("");
      setUploadedFiles([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxMessageLength) {
      setNewMessage(value);
      if (value.length > 0 && activeConversation) {
        handleTyping(true);
      }
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files
      .filter((file) => {
        if (!isAllowedFileType(file)) return false;
        const maxSize = getMaxFileSize(file.type);
        if (file.size > maxSize) return false;
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

  const handleChatSelect = (conversation) => {
    openConversation(conversation);
    setUploadedFiles([]);
  };

  const handleBackToConversations = () => {
    closeConversation();
    setNewMessage("");
    setUploadedFiles([]);
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

  const handleCallEnd = async (callInfo) => {
    if (activeConversation && callInfo.duration > 0) {
      const callType = callInfo.type === "video" ? "Video call" : "Voice call";
      const callMessage = `${callType} ended - ${callInfo.formattedDuration}`;
      try {
        await sendChatMessage(callMessage);
      } catch (error) {
        console.error("Error sending call message:", error);
      }
    }
  };

  const getAvatarIcon = (type, avatar) => {
    if (avatar) {
      return (
        <img
          src={avatar}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      );
    }
    switch (type) {
      case "patient":
        return <FaUser />;
      case "nurse":
        return <FaUserNurse />;
      case "specialist":
        return <FaUserMd />;
      default:
        return <FaUser />;
    }
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
    closeConversation();
    setNewMessage("");
    setUploadedFiles([]);
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
      <div className={`floating-chat-widget ${isMinimized ? "minimized" : ""}`}>
        {/* Header */}
        <div className="floating-chat-header">
          <div className="floating-chat-header-left">
            <FaComments className="floating-chat-header-icon" />
            <h3 className="floating-chat-title">Messages</h3>
            {conversations.length > 0 && (
              <span className="floating-chat-count">
                {conversations.length}
              </span>
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
            {!activeConversation ? (
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
                <div className="floating-conversations-header">
                  <button
                    className="floating-new-chat-btn"
                    onClick={() => setShowNewChatModal(true)}
                    title="Start new conversation"
                  >
                    <FaPlus />
                  </button>
                </div>
                {chatLoading && conversations.length === 0 ? (
                  <div className="floating-loading">
                    <FaSpinner className="floating-spinner" />
                    <p>Loading conversations...</p>
                  </div>
                ) : chatError ? (
                  <div className="floating-error">
                    <p>Error: {chatError}</p>
                    <button onClick={loadConversations}>Retry</button>
                  </div>
                ) : (
                  <div className="floating-conversations-list">
                    {filteredConversations.length > 0 ? (
                      filteredConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`floating-conversation-item ${
                            conversation.unreadCount > 0 ? "unread" : ""
                          }`}
                          onClick={() => handleChatSelect(conversation)}
                        >
                          <div className="floating-conversation-avatar">
                            {getAvatarIcon(
                              conversation.otherUserType || conversation.type,
                              conversation.avatar
                            )}
                            {conversation.isOnline && (
                              <div className="floating-online-indicator"></div>
                            )}
                          </div>
                          <div className="floating-conversation-content">
                            <div className="floating-conversation-header">
                              <h4 className="floating-conversation-name">
                                {conversation.name}
                              </h4>
                              <span className="floating-conversation-time">
                                {conversation.timestamp || ""}
                              </span>
                            </div>
                            <p className="floating-conversation-message">
                              {conversation.lastMessage &&
                              conversation.lastMessage !== "No messages yet"
                                ? conversation.lastMessageSentByMe
                                  ? "You: "
                                  : conversation.lastMessageSenderName
                                  ? `${conversation.lastMessageSenderName}: `
                                  : ""
                                : ""}
                              {conversation.lastMessage}
                            </p>
                            <div className="floating-conversation-meta">
                              {conversation.role && (
                                <span className="floating-ticket-service">
                                  {conversation.role}
                                </span>
                              )}
                              {conversation.unreadCount > 0 && (
                                <span className="floating-unread-badge">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="floating-no-conversations">
                        <p>No conversations found</p>
                        <span>Start a new conversation to begin messaging</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Chat View */
              <div className="floating-chat-view">
                <div className="floating-chat-view-header">
                  <button
                    className="floating-chat-back-btn"
                    onClick={handleBackToConversations}
                    title="Back to conversations"
                  >
                    ← Back
                  </button>
                  <div className="floating-chat-view-user">
                    <div className="floating-chat-view-avatar">
                      {getAvatarIcon(
                        activeConversation.otherUserType ||
                          activeConversation.type,
                        activeConversation.avatar
                      )}
                      {activeConversation.isOnline && (
                        <div className="floating-online-indicator"></div>
                      )}
                    </div>
                    <div className="floating-chat-view-info">
                      <h4 className="floating-chat-view-name">
                        {activeConversation.name}
                      </h4>
                      <p className="floating-chat-view-role">
                        {activeConversation.role ||
                          getUserTypeLabel(activeConversation.otherUserType)}
                      </p>
                      {typingUsers.length > 0 && (
                        <div className="floating-typing-indicator">
                          <span>typing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="floating-chat-view-actions">
                    <button
                      className="floating-chat-call-btn"
                      onClick={handleVoiceCall}
                      title="Voice Call"
                    >
                      <FaPhone />
                    </button>
                    <button
                      className="floating-chat-video-btn"
                      onClick={handleVideoCallClick}
                      title="Video Call"
                    >
                      <FaVideo />
                    </button>
                  </div>
                </div>

                <div className="floating-chat-messages">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`floating-message ${
                          message.isSent ? "sent" : "received"
                        }`}
                      >
                        {!message.isSent && (
                          <div className="floating-message-avatar">
                            {getAvatarIcon(
                              message.senderType ||
                                activeConversation.otherUserType,
                              message.avatar
                            )}
                          </div>
                        )}
                        <div className="floating-message-bubble">
                          {message.messageType === "file" ||
                          message.messageType === "image" ? (
                            <div>
                              {message.messageType === "image" ? (
                                <img
                                  src={message.fileUrl}
                                  alt={message.fileName}
                                  className="floating-message-image"
                                  onClick={() =>
                                    window.open(message.fileUrl, "_blank")
                                  }
                                  style={{
                                    cursor: "pointer",
                                    maxWidth: "200px",
                                    borderRadius: "8px",
                                  }}
                                />
                              ) : (
                                <a
                                  href={message.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="floating-file-link"
                                  download
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    textDecoration: "none",
                                    color: "inherit",
                                  }}
                                >
                                  <FaFileAlt />
                                  <div>
                                    <div style={{ fontWeight: "600" }}>
                                      {message.fileName}
                                    </div>
                                    <div
                                      style={{ fontSize: "11px", opacity: 0.7 }}
                                    >
                                      {formatFileSize(message.fileSize)}
                                    </div>
                                  </div>
                                </a>
                              )}
                              {message.text && (
                                <p
                                  className="floating-message-text"
                                  style={{ marginTop: "8px" }}
                                >
                                  {message.text}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="floating-message-text">
                              {message.text}
                            </p>
                          )}
                          <span className="floating-message-time">
                            {message.timestamp}
                          </span>
                        </div>
                        {message.isSent && (
                          <div className="floating-message-avatar">
                            {getAvatarIcon("specialist", message.avatar)}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="floating-message-empty">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  {typingUsers.length > 0 && (
                    <div className="floating-message received floating-typing-bubble">
                      <div className="floating-message-avatar">
                        {getAvatarIcon(
                          activeConversation.otherUserType,
                          activeConversation.avatar
                        )}
                      </div>
                      <div className="floating-message-bubble">
                        <div className="floating-typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <input
                  type="file"
                  id="specialist-file-upload"
                  ref={fileInputRef}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />

                {uploadedFiles.length > 0 && (
                  <div className="floating-attached-files">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="floating-attached-file-item"
                      >
                        {file.type.startsWith("image/") ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="floating-attached-file-preview"
                          />
                        ) : (
                          <FaFileAlt className="floating-attached-file-icon" />
                        )}
                        <span className="floating-attached-file-name">
                          {file.name}
                        </span>
                        <button
                          className="floating-attached-file-remove"
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
                  className="floating-chat-input-form"
                  onSubmit={handleSendMessage}
                >
                  <div className="floating-chat-input-container">
                    <button
                      type="button"
                      className="floating-attach-btn"
                      onClick={handleAttachClick}
                      title="Attach file"
                    >
                      <FaPaperclip />
                    </button>
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
                      disabled={
                        !newMessage.trim() && uploadedFiles.length === 0
                      }
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

      {showNewChatModal && (
        <div
          className="floating-modal-overlay"
          onClick={() => setShowNewChatModal(false)}
        >
          <div className="floating-modal" onClick={(e) => e.stopPropagation()}>
            <div className="floating-modal-header">
              <h3>Start New Conversation</h3>
              <button
                className="floating-modal-close"
                onClick={() => setShowNewChatModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="floating-modal-body">
              <div className="floating-user-search">
                <FaSearch className="floating-search-icon" />
                <input
                  type="text"
                  placeholder="Search users by name..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="floating-user-search-input"
                />
              </div>
              <div className="floating-user-results">
                {isSearchingUsers ? (
                  <div className="floating-searching">
                    <FaSpinner className="floating-spinner" />
                    <span>Searching...</span>
                  </div>
                ) : userSearchResults.length > 0 ? (
                  userSearchResults.map((user) => (
                    <div
                      key={user.Id || user.id}
                      className="floating-user-result-item"
                      onClick={() => handleStartNewChat(user.Id || user.id)}
                    >
                      <div className="floating-user-avatar">
                        {getAvatarIcon(
                          user.User_Type_Code || user.userType || user.type
                        )}
                      </div>
                      <div className="floating-user-info">
                        <span className="floating-user-name">
                          {user.Display_Name || user.name || user.Email}
                        </span>
                        <span className="floating-user-type">
                          {getUserTypeLabel(
                            user.User_Type_Code || user.userType || user.type
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                ) : userSearchQuery ? (
                  <div className="floating-no-users">
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="floating-search-hint">
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
          onCallEnd={handleCallEnd}
          isVideoCall={isVideoCall}
        />
      )}
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

.floating-conversations-header {
  padding: 8px 12px;
  display: flex;
  justify-content: flex-end;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.floating-new-chat-btn {
  width: 32px;
  height: 32px;
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

.floating-new-chat-btn:hover {
  background: #0b5388;
  transform: scale(1.1);
}

.floating-loading,
.floating-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
  gap: 12px;
}

.floating-spinner {
  animation: spin 1s linear infinite;
  font-size: 24px;
  color: #4aa7ed;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  position: relative;
}

.floating-conversation-item:hover {
  background: #e3f2fd;
  transform: translateX(4px);
}

.floating-conversation-item.unread {
  background: #e3f2fd;
  font-weight: 600;
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
  position: relative;
  overflow: hidden;
}

.floating-online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #4caf50;
  border: 2px solid white;
  border-radius: 50%;
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
  margin-top: 4px;
}

.floating-ticket-service {
  color: #999;
}

.floating-unread-badge {
  background: #4aa7ed;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  margin-left: auto;
}

.floating-no-conversations {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.floating-no-conversations span {
  display: block;
  font-size: 12px;
  margin-top: 8px;
  opacity: 0.7;
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
  position: relative;
  overflow: hidden;
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

.floating-typing-indicator {
  font-size: 11px;
  color: #999;
  font-style: italic;
  margin-top: 2px;
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
  overflow: hidden;
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

.floating-message-image {
  max-width: 200px;
  border-radius: 8px;
  cursor: pointer;
}

.floating-file-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
}

.floating-typing-bubble .floating-message-bubble {
  padding: 12px 16px;
}

.floating-typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.floating-typing-dots span {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  animation: typing 1.4s infinite;
  opacity: 0.4;
}

.floating-typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.floating-typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.4;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

.floating-message-empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.floating-attached-files {
  padding: 8px 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.floating-attached-file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 12px;
}

.floating-attached-file-preview {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.floating-attached-file-icon {
  font-size: 20px;
  color: #4aa7ed;
}

.floating-attached-file-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.floating-attached-file-remove {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  margin-left: 4px;
}

.floating-attached-file-remove:hover {
  color: #f44336;
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

.floating-attach-btn {
  background: none;
  border: none;
  color: #4aa7ed;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
}

.floating-attach-btn:hover {
  color: #0b5388;
  transform: scale(1.1);
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

.floating-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.floating-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.floating-modal-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.floating-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.floating-modal-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.floating-modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.floating-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.floating-user-search {
  position: relative;
  margin-bottom: 16px;
}

.floating-user-search-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.floating-user-search-input:focus {
  border-color: #4aa7ed;
  box-shadow: 0 0 0 3px rgba(74, 167, 237, 0.1);
}

.floating-user-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.floating-searching,
.floating-no-users,
.floating-search-hint {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.floating-user-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.floating-user-result-item:hover {
  background: #e3f2fd;
  transform: translateX(4px);
}

.floating-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4aa7ed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.floating-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.floating-user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.floating-user-type {
  font-size: 12px;
  color: #999;
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
.floating-chat-messages::-webkit-scrollbar,
.floating-modal-body::-webkit-scrollbar {
  width: 6px;
}

.floating-conversations-list::-webkit-scrollbar-track,
.floating-chat-messages::-webkit-scrollbar-track,
.floating-modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.floating-conversations-list::-webkit-scrollbar-thumb,
.floating-chat-messages::-webkit-scrollbar-thumb,
.floating-modal-body::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.floating-conversations-list::-webkit-scrollbar-thumb:hover,
.floating-chat-messages::-webkit-scrollbar-thumb:hover,
.floating-modal-body::-webkit-scrollbar-thumb:hover {
  background: #999;
}
`;

export default FloatingChat;
