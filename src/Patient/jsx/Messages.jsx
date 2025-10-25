import React, { useState, useEffect, useRef } from "react";
import {
  FaComments,
  FaTimes,
  FaUpload,
  FaFileAlt,
  FaUser,
  FaCamera,
} from "react-icons/fa";
import axios from "axios";

const API_BASE = "http://localhost:1337/api";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const CHARACTER_LIMIT = 500;

  // Will replace if possible
  const loggedInUserId = 1;

  // Fetch all appointments (conversations)
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${API_BASE}/appointments`);
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  // Fetch messages for a selected appointment
  const fetchMessages = async (appointmentId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/appointments/${appointmentId}/messages`
      );
      setChatMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Open selected chat
  const openChat = (conversation) => {
    setActiveChat(conversation);
    setUploadedFiles([]);
    fetchMessages(conversation.Id || conversation.id);
  };

  const closeChat = () => {
    setActiveChat(null);
    setChatMessages([]);
    setNewMessage("");
    setUploadedFiles([]);
  };

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeChat || (!newMessage.trim() && uploadedFiles.length === 0)) return;

    try {
      const payload = {
        senderId: loggedInUserId,
        receiverId: activeChat.Doctor_Id || activeChat.doctorId || 1,
        message: newMessage.trim(),
      };

      const response = await axios.post(
        `${API_BASE}/appointments/${activeChat.Id || activeChat.id}/messages`,
        payload
      );

      console.log("New message response:", response.data);
      setChatMessages((prev) => [...prev, response.data]);
      setNewMessage("");
      setUploadedFiles([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    if (value.length <= CHARACTER_LIMIT) setNewMessage(value);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const query = searchQuery.toLowerCase();
    return (
      (conv.doctorName && conv.doctorName.toLowerCase().includes(query)) ||
      (conv.specialty && conv.specialty.toLowerCase().includes(query)) ||
      (conv.status && conv.status.toLowerCase().includes(query))
    );
  });

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
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
      <div
        className={`patient-messenger-container ${
          activeChat ? "has-active-chat" : ""
        }`}
      >
        {/* Conversations Sidebar */}
        <div className="patient-conversations-sidebar">
          <div className="patient-conversations-header">
            <h2 className="patient-conversations-title">Messages</h2>
            <div className="patient-conversations-search">
              <input
                type="text"
                placeholder="Search..."
                className="patient-search-input"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="patient-conversations-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.Id || conversation.id}
                  className={`patient-conversation-item ${
                    activeChat?.Id === conversation.Id ? "active" : ""
                  }`}
                  onClick={() => openChat(conversation)}
                >
                  <div className="patient-conversation-avatar">
                    <FaUser className="patient-avatar-icon" />
                    <div
                      className={`patient-online-indicator ${
                        conversation.isOnline ? "online" : "offline"
                      }`}
                    ></div>
                  </div>

                  <div className="patient-conversation-content">
                    <div className="patient-conversation-header">
                      <h4 className="patient-conversation-name">
                        {conversation.doctorName || "Doctor"}
                      </h4>
                      <span className="patient-conversation-time">
                        {conversation.Created_At
                          ? new Date(conversation.Created_At * 1000).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <p className="patient-conversation-message">
                      {conversation.lastMessage || "No messages yet"}
                    </p>
                    <div className="patient-conversation-role">
                      {conversation.specialty || "General"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="patient-no-results">
                <p>No conversations found</p>
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
                    <FaUser className="patient-avatar-icon" />
                    <div
                      className={`patient-online-indicator ${
                        activeChat.isOnline ? "online" : "offline"
                      }`}
                    ></div>
                  </div>
                  <div className="patient-chat-user-details">
                    <h3 className="patient-chat-user-name">
                      {activeChat.doctorName || "Doctor"}
                    </h3>
                    <p className="patient-chat-user-role">
                      {activeChat.specialty || "Specialist"}
                    </p>
                  </div>
                </div>
                <button
                  className="patient-chat-close-btn-mobile"
                  onClick={closeChat}
                  aria-label="Close chat"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="patient-chat-messages" ref={chatMessagesRef}>
                {chatMessages.length > 0 ? (
                  chatMessages.map((message) => (
                    <div
                      key={message.Id || message.id}
                      className={`patient-message ${
                        message.Sender_Id === loggedInUserId
                          ? "patient-message-patient"
                          : "patient-message-other"
                      }`}
                    >
                      <div className="patient-message-bubble">
                        <p className="patient-message-text">
                          {message.Message_Content}
                        </p>
                      </div>
                      <span className="patient-message-time">
                        {message.Created_At
                          ? new Date(message.Created_At *1000).toLocaleTimeString()
                          : ""}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="patient-no-chat-selected">
                    <p>No messages yet.</p>
                  </div>
                )}
              </div>

              {/* Upload Section */}
              <div className="patient-document-upload">
                <h4 className="patient-upload-title">Upload Documents</h4>
                <div className="patient-file-upload-area">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="patient-file-upload"
                    className="patient-file-label"
                    onClick={handleCameraClick}
                  >
                    <FaUpload className="patient-upload-icon" />
                    <span>Choose files to upload</span>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="patient-uploaded-files">
                    <h5>Attached Files:</h5>
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
                          <span>{file.name}</span>
                          <span>{formatFileSize(file.size)}</span>
                        </div>
                        <button
                          className="patient-file-remove"
                          onClick={() => handleRemoveFile(file.id)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form
                className="patient-chat-input-form"
                onSubmit={handleSendMessage}
              >
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
