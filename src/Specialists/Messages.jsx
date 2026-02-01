import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaUser,
  FaTimes,
  FaPaperclip,
  FaPhone,
  FaVideo,
  FaPlus,
  FaSearch,
  FaFileAlt,
} from "react-icons/fa";
import useChat from "../Nurse/services/useChat";
import {
  isAllowedFileType,
  getMaxFileSize,
  formatFileSize,
  getUserTypeLabel,
} from "../Nurse/services/chatService";
import SpecialistCall from "./SpecialistCall";
import "./SpecialistDashboard.css";

const Messages = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);

  const CHARACTER_LIMIT = 500;

  const getCurrentUserId = () => {
    try {
      const user = localStorage.getItem("okiedoc_specialist_user");
      if (user) {
        const parsed = JSON.parse(user);
        return parsed.id;
      }
      return currentUser?.id || null;
    } catch {
      return currentUser?.id || null;
    }
  };

  const currentUserId = getCurrentUserId();

  const {
    conversations,
    activeConversation,
    messages: chatMessages,
    typingUsers,
    openConversation,
    closeConversation,
    sendMessage: sendChatMessage,
    uploadFile: uploadChatFile,
    handleTyping,
    startConversation,
    searchUsers,
    getAllUsers,
  } = useChat({ currentUserId, currentUserType: "s" });

  useEffect(() => {
    if (chatMessagesRef.current && activeConversation) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, activeConversation]);

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
    [searchUsers, getAllUsers],
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
    e?.preventDefault();

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
          if (!isAllowedFileType(fileData.file)) {
            console.warn("Skipping invalid file type:", fileData.type);
            continue;
          }

          const maxSize = getMaxFileSize(fileData.type);
          if (fileData.size > maxSize) {
            console.warn("Skipping file too large:", fileData.name);
            continue;
          }

          await uploadChatFile(fileData.file);
        }
      }

      setNewMessage("");
      setUploadedFiles([]);

      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop =
          chatMessagesRef.current.scrollHeight;
      }
    } catch (error) {
      console.error("Error sending message or uploading file:", error);
      alert("Failed to send message. Please try again.");
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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files
      .filter((file) => {
        if (!isAllowedFileType(file)) {
          console.error("File type not allowed:", file.type);
          return false;
        }

        const maxSize = getMaxFileSize(file.type);
        if (file.size > maxSize) {
          console.error("File too large:", file.name);
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

  const filteredConversations = conversations.filter((conversation) => {
    const query = searchQuery.toLowerCase();
    return (
      conversation.name.toLowerCase().includes(query) ||
      (conversation.role || "").toLowerCase().includes(query) ||
      (conversation.lastMessage || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="specialist-messages-container">
      <div className="messages-layout">
        <div className="conversations-sidebar">
          <div className="conversations-header">
            <h3>Messages</h3>
            <button
              className="new-chat-btn"
              onClick={() => setShowNewChatModal(true)}
              title="Start New Chat"
            >
              <FaPlus />
            </button>
          </div>

          <div className="conversations-search-box">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="conversations-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${
                    activeConversation?.id === conversation.id ? "active" : ""
                  } ${conversation.unreadCount > 0 ? "unread" : ""}`}
                  onClick={() => openChat(conversation)}
                >
                  <div className="conversation-avatar">
                    {conversation.avatar ? (
                      <img src={conversation.avatar} alt={conversation.name} />
                    ) : (
                      <FaUser />
                    )}
                    <div
                      className={`online-indicator ${
                        conversation.isOnline ? "online" : "offline"
                      }`}
                    ></div>
                  </div>

                  <div className="conversation-info">
                    <div className="conversation-header-row">
                      <span className="conversation-name">
                        {conversation.name}
                      </span>
                      <span className="conversation-time">
                        {conversation.timestamp || ""}
                      </span>
                    </div>
                    <div className="conversation-preview">
                      <p className="last-message">
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
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="conversation-role">
                      {conversation.role ||
                        getUserTypeLabel(conversation.otherUserType)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-conversations">
                <p>No conversations found</p>
                <span>Start a new chat to begin messaging</span>
              </div>
            )}
          </div>
        </div>

        <div className="chat-area">
          {activeConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {activeConversation.avatar ? (
                      <img
                        src={activeConversation.avatar}
                        alt={activeConversation.name}
                      />
                    ) : (
                      <FaUser />
                    )}
                    <div
                      className={`online-indicator ${
                        activeConversation.isOnline ? "online" : "offline"
                      }`}
                    ></div>
                  </div>
                  <div className="chat-user-details">
                    <h4>{activeConversation.name}</h4>
                    <p className="user-status">
                      {activeConversation.role ||
                        getUserTypeLabel(activeConversation.otherUserType)}
                    </p>
                    {typingUsers.length > 0 && (
                      <div className="typing-indicator">
                        <div className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="chat-actions">
                  <button
                    className="icon-btn"
                    onClick={handleVoiceCall}
                    title="Voice Call"
                  >
                    <FaPhone />
                  </button>
                  <button
                    className="icon-btn video-btn"
                    onClick={handleVideoCallClick}
                    title="Video Call"
                  >
                    <FaVideo />
                  </button>
                  <button
                    className="icon-btn"
                    onClick={closeChat}
                    title="Back to Messages"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="chat-messages" ref={chatMessagesRef}>
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${
                      message.isSent ? "own-message" : "other-message"
                    } message-type-${message.sender}`}
                  >
                    {message.sender === "system" ? (
                      <div className="system-message">
                        <p className="message-text">{message.text}</p>
                        {message.subtext && (
                          <p className="message-subtext">{message.subtext}</p>
                        )}
                      </div>
                    ) : (
                      <>
                        {!message.isSent && (
                          <div className="message-avatar">
                            {message.avatar ? (
                              <img
                                src={message.avatar}
                                alt={message.senderName || "User"}
                              />
                            ) : (
                              <FaUser className="avatar-icon-small" />
                            )}
                          </div>
                        )}

                        <div className="message-bubble-wrapper">
                          <div className="message-content">
                            {message.messageType === "file" ||
                            message.messageType === "image" ? (
                              <div className="message-media-wrapper">
                                {message.messageType === "image" ? (
                                  <div className="image-container">
                                    <img
                                      src={message.fileUrl}
                                      alt={message.fileName}
                                      className="message-image"
                                      onClick={() =>
                                        window.open(message.fileUrl, "_blank")
                                      }
                                      style={{ cursor: "pointer" }}
                                    />
                                  </div>
                                ) : (
                                  <div className="file-attachment">
                                    <a
                                      href={message.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="file-link"
                                    >
                                      <FaFileAlt className="file-icon" />
                                      <div className="file-info">
                                        <div className="file-name">
                                          {message.fileName}
                                        </div>
                                        <div className="file-size">
                                          {formatFileSize(message.fileSize)}
                                        </div>
                                      </div>
                                    </a>
                                  </div>
                                )}
                                {message.text && (
                                  <p className="caption">{message.text}</p>
                                )}
                              </div>
                            ) : (
                              <p className="message-text">{message.text}</p>
                            )}
                            <span className="message-time">
                              {message.timestamp}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="chat-input-area">
                {uploadedFiles.length > 0 && (
                  <div className="uploaded-files-preview">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="uploaded-file-chip">
                        <FaPaperclip />
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">
                          {formatFileSize(file.size)}
                        </span>
                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          className="remove-file-btn"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="input-row">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach File"
                  >
                    <FaPaperclip />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleMessageChange}
                    maxLength={CHARACTER_LIMIT}
                    className="message-input"
                  />
                  <button type="submit" className="send-btn">
                    Send
                  </button>
                </form>
                <div className="character-count">
                  {newMessage.length}/{CHARACTER_LIMIT}
                </div>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <FaUser size={48} />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {showNewChatModal && (
        <div className="modal" onClick={() => setShowNewChatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start New Chat</h3>
              <button
                className="close-modal"
                onClick={() => setShowNewChatModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>
            <div className="user-search-results">
              {isSearchingUsers ? (
                <div className="loading-state">Searching...</div>
              ) : userSearchResults.length > 0 ? (
                userSearchResults.map((user) => (
                  <div
                    key={user.Id || user.id}
                    className="user-result-item"
                    onClick={() => handleStartNewChat(user.Id || user.id)}
                  >
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={
                            user.Display_Name ||
                            user.name ||
                            user.Email ||
                            "User"
                          }
                        />
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <div className="user-info">
                      <div className="user-name">
                        {user.Display_Name ||
                          user.name ||
                          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                          user.Email ||
                          "User"}
                      </div>
                      <div className="user-role">
                        {user.User_Type ||
                          getUserTypeLabel(
                            user.User_Type_Code || user.userType || user.type,
                          ) ||
                          user.role ||
                          "User"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">No users found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showVideoCall && activeConversation && (
        <SpecialistCall
          isOpen={showVideoCall}
          onClose={handleCloseVideoCall}
          onCallEnd={handleCallEnd}
          callType={isVideoCall ? "video" : "audio"}
          patient={{
            name: activeConversation?.name,
            avatar: activeConversation?.avatar,
            id: activeConversation?.id,
          }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default Messages;
