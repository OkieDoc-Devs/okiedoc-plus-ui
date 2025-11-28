import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaUserMd,
  FaUserNurse,
  FaComments,
  FaTimes,
  FaUpload,
  FaFileAlt,
  FaUser,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaPaperclip,
  FaPhone,
  FaVideo,
} from "react-icons/fa";
import { useChat } from "../services/chatService";
import {
  isAllowedFileType,
  getMaxFileSize,
  formatFileSize,
  getUserTypeLabel,
} from "../services/chatService";
import VideoCall from "./VideoCall.jsx";

const Messages = () => {
  const [newMessage, setNewMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(true);
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
  } = useChat({ currentUserId, currentUserType: "p" });

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
    setNewMessage(e.target.value);
    if (e.target.value.length > 0) {
      handleTyping(true);
    }
  };

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
      }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

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

  return (
    <div className="patient-page-content">
      {chatLoading && conversations.length === 0 && (
        <div className="patient-loading-state">
          <FaSpinner className="patient-spinner" />
          <p>Loading conversations...</p>
        </div>
      )}
      {chatError && (
        <div className="patient-error-state">
          <p>Error loading conversations: {chatError}</p>
          <button onClick={loadConversations}>Retry</button>
        </div>
      )}

      <div
        className={`patient-messenger-container ${
          activeConversation ? "has-active-chat" : ""
        }`}
      >
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
            <button
              className="patient-new-chat-btn"
              onClick={() => setShowNewChatModal(true)}
              title="Start new conversation"
            >
              <FaPlus />
            </button>
          </div>

          <div className="patient-conversations-list">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`patient-conversation-item ${
                  activeConversation?.id === conversation.id ? "active" : ""
                } ${conversation.unreadCount > 0 ? "has-unread" : ""}`}
                onClick={() => openChat(conversation)}
              >
                <div className="patient-conversation-avatar">
                  {conversation.avatar ? (
                    <img src={conversation.avatar} alt={conversation.name} />
                  ) : (
                    <FaUser className="patient-avatar-icon" />
                  )}
                  <div
                    className={`patient-online-indicator ${
                      conversation.isOnline ? "online" : "offline"
                    }`}
                  ></div>
                </div>

                <div className="patient-conversation-content">
                  <div className="patient-conversation-header">
                    <h4 className="patient-conversation-name">
                      {conversation.name}
                    </h4>
                    <span className="patient-conversation-time">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <div className="patient-conversation-preview">
                    <p className="patient-conversation-message">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <div className="patient-unread-badge">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="patient-conversation-role">
                    {conversation.role ||
                      getUserTypeLabel(conversation.otherUserType)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {activeConversation ? (
          <div className="patient-chat-area">
            <div className="patient-chat-header">
              <div className="patient-chat-user-info">
                <div className="patient-chat-avatar">
                  {activeConversation.avatar ? (
                    <img
                      src={activeConversation.avatar}
                      alt={activeConversation.name}
                    />
                  ) : (
                    <FaUser className="patient-avatar-icon" />
                  )}
                  <div
                    className={`patient-online-indicator ${
                      activeConversation.isOnline ? "online" : "offline"
                    }`}
                  ></div>
                </div>
                <div className="patient-chat-user-details">
                  <h3 className="patient-chat-user-name">
                    {activeConversation.name}
                  </h3>
                  <p className="patient-chat-user-role">
                    {activeConversation.role ||
                      getUserTypeLabel(activeConversation.otherUserType)}
                  </p>
                  {typingUsers.length > 0 && (
                    <div className="patient-typing-indicator">
                      <div className="patient-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="patient-chat-actions">
                <button
                  className="patient-call-btn"
                  onClick={handleVoiceCall}
                  title="Voice Call"
                >
                  <FaPhone />
                </button>
                <button
                  className="patient-call-btn video-btn"
                  onClick={handleVideoCallClick}
                  title="Video Call"
                >
                  <FaVideo />
                </button>
                <button
                  className="patient-chat-close-btn"
                  onClick={closeChat}
                  title="Back to Messages"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="patient-chat-messages" ref={chatMessagesRef}>
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`patient-message ${
                    message.isSent
                      ? "patient-message-sent"
                      : "patient-message-received"
                  } patient-message-type-${message.sender}`}
                >
                  {message.sender === "system" ? (
                    <div className="patient-system-message">
                      <p className="patient-message-text">{message.text}</p>
                      {message.subtext && (
                        <p className="patient-message-subtext">
                          {message.subtext}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      {!message.isSent && (
                        <div className="patient-message-avatar">
                          {message.avatar ? (
                            <img
                              src={message.avatar}
                              alt={message.senderName || "User"}
                            />
                          ) : (
                            <FaUser className="patient-avatar-icon-small" />
                          )}
                        </div>
                      )}
                      <div className="patient-message-bubble-wrapper">
                        <div
                          className={`patient-message-content patient-message-content-${message.sender}`}
                        >
                          {message.messageType === "file" ||
                          message.messageType === "image" ? (
                            <div className="patient-message-file">
                              {message.messageType === "image" ? (
                                <img
                                  src={message.fileUrl}
                                  alt={message.fileName}
                                  className="patient-message-image"
                                />
                              ) : (
                                <a
                                  href={message.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="patient-file-link"
                                >
                                  <FaFileAlt /> {message.fileName} (
                                  {formatFileSize(message.fileSize)})
                                </a>
                              )}
                              {message.text && (
                                <p className="patient-message-text">
                                  {message.text}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="patient-message-text">
                              {message.text}
                            </p>
                          )}
                        </div>
                        <span className="patient-message-time">
                          {message.timestamp}
                        </span>
                      </div>
                      {message.isSent && (
                        <div className="patient-message-avatar">
                          {message.avatar ? (
                            <img
                              src={message.avatar}
                              alt={message.senderName || "You"}
                            />
                          ) : (
                            <FaUser className="patient-avatar-icon-small" />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}

              {typingUsers.length > 0 && (
                <div className="patient-message patient-message-received patient-typing-bubble">
                  <div className="patient-message-avatar">
                    <FaUser className="patient-avatar-icon-small" />
                  </div>
                  <div className="patient-message-bubble-wrapper">
                    <div className="patient-message-content patient-typing-content">
                      <div className="patient-typing-dots-chat">
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
              ref={fileInputRef}
              multiple
              onChange={handleFileUpload}
              style={{ display: "none" }}
              accept="image/*,.pdf,.doc,.docx"
            />

            {uploadedFiles.length > 0 && (
              <div className="patient-attached-files">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="patient-attached-file">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file.file)}
                        alt={file.name}
                        className="patient-attached-preview"
                      />
                    ) : (
                      <div className="patient-attached-file-icon">
                        <FaFileAlt />
                      </div>
                    )}
                    <span className="patient-attached-file-name">
                      {file.name}
                    </span>
                    <button
                      className="patient-attached-file-remove"
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
              className="patient-chat-input-form"
              onSubmit={handleSendMessage}
            >
              <div className="patient-chat-input-container">
                <button
                  type="button"
                  className="patient-attach-btn"
                  onClick={handleAttachClick}
                  title="Attach file"
                >
                  <FaPaperclip />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleMessageChange}
                  placeholder="Type your message..."
                  className="patient-chat-input"
                />
                <button
                  type="submit"
                  className="patient-chat-send-btn"
                  disabled={!newMessage.trim() && uploadedFiles.length === 0}
                >
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

      {showNewChatModal && (
        <div
          className="patient-modal-overlay"
          onClick={() => setShowNewChatModal(false)}
        >
          <div className="patient-modal" onClick={(e) => e.stopPropagation()}>
            <div className="patient-modal-header">
              <h3>Start New Conversation</h3>
              <button
                className="patient-modal-close"
                onClick={() => setShowNewChatModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="patient-modal-body">
              <div className="patient-user-search">
                <FaSearch className="patient-search-icon" />
                <input
                  type="text"
                  placeholder="Search doctors or nurses..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="patient-user-search-input"
                />
              </div>
              <div className="patient-user-results">
                {isSearchingUsers ? (
                  <div className="patient-searching">
                    <FaSpinner className="patient-spinner" />
                    <span>Searching...</span>
                  </div>
                ) : userSearchResults.length > 0 ? (
                  userSearchResults.map((user) => (
                    <div
                      key={user.Id || user.id}
                      className="patient-user-result-item"
                      onClick={() => handleStartNewChat(user.Id || user.id)}
                    >
                      <div className="patient-user-avatar">
                        <FaUser />
                      </div>
                      <div className="patient-user-info">
                        <span className="patient-user-name">
                          {user.Display_Name || user.name}
                        </span>
                        <span className="patient-user-type">
                          {user.User_Type || user.type}
                        </span>
                      </div>
                    </div>
                  ))
                ) : userSearchQuery ? (
                  <div className="patient-no-users">
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="patient-search-hint">
                    <p>Type a name to search for doctors or nurses</p>
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
    </div>
  );
};

export default Messages;
