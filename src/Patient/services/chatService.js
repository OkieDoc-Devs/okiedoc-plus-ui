import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { dummyConversations, dummyMessages, dummyUsers } from "../../api/Patient/test";
const API_BASE_URL = "http://localhost:8080/api";

// Helper functions required by Messages.jsx
export const isAllowedFileType = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  return file && allowedTypes.includes(file.type);
};

export const getMaxFileSize = (fileType) => {
  return 10 * 1024 * 1024; // 10 MB limit
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getUserTypeLabel = (type) => {
  const labels = {
    p: "Patient",
    d: "Doctor",
    s: "Specialist",
    a: "Admin",
  };
  return labels[type] || type || "User";
};

export const useChat = ({ currentUserId, currentUserType }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  // Create axios instance
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const loadConversations = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    try {
      console.log(`[Backend] Fetching conversations for user ${currentUserId}...`);
      const response = await api.get(`/conversations/${currentUserId}`);
      setConversations(response.data || []);
    } catch (err) {
      console.error("[Backend] Failed to fetch conversations. This is expected if backend is not running.", err);
      // Fallback to dummy data
      console.log("[Fallback] Using dummy conversations.");
      setConversations(dummyConversations);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const openConversation = useCallback(async (conversation) => {
    setActiveConversation(conversation);
    setMessagesLoading(true);
    setMessages([]);
    try {
      console.log(`[Backend] Fetching messages for conversation ${conversation.id}...`);
      const response = await api.get(`/messages/${conversation.id}`);
      setMessages(response.data || []);
      setMessagesLoading(false);
    } catch (err) {
      console.error("[Backend] Failed to fetch messages:", err);
      // Fallback to dummy data
      console.log(`[Fallback] Using dummy messages for conversation ${conversation.id}.`);
      setTimeout(() => { // Simulate network delay
        setMessages(dummyMessages[conversation.id] || []);
        setMessagesLoading(false);
      }, 500);
    }
  }, []);

  const closeConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!activeConversation) return;

    const sentMessage = {
      id: `msg-sent-${Date.now()}`,
      isSent: true,
      sender: currentUserType,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };

    // Optimistic UI update
    setMessages(prev => [...prev, sentMessage]);
    setConversations(prev => prev.map(c =>
      c.id === activeConversation.id
        ? { ...c, lastMessage: text, timestamp: sentMessage.timestamp, lastMessageSentByMe: true }
        : c
    ));

    try {
      console.log(`[Backend] Sending message to conversation ${activeConversation.id}...`);
      const payload = {
        conversationId: activeConversation.id,
        senderId: currentUserId,
        text,
        timestamp: new Date().toISOString(),
      };
      const response = await api.post("/messages", payload);
      // Replace optimistic message with one from server if needed
      setMessages((prev) => prev.map(m => m.id === sentMessage.id ? response.data : m));
    } catch (err) {
      console.error("[Backend] Failed to send message:", err);
      // For dummy data, we just keep the optimistic update.
      // In a real app, you might want to show an error state on the message.
      // We don't want to throw and show an alert for dummy mode.
    }
  }, [activeConversation, currentUserId, currentUserType]);

  const uploadFile = useCallback(async (file) => {
    if (!activeConversation) return;
    try {
      console.log(`[Backend] Uploading file to conversation ${activeConversation.id}...`);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", activeConversation.id);
      formData.append("senderId", currentUserId);

      const response = await api.post("/messages/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessages((prev) => [...prev, response.data]);
    } catch (err) {
      console.error("[Backend] Failed to upload file:", err);
      throw err;
    }
  }, [activeConversation, currentUserId]);

  const handleTyping = useCallback((isTyping) => {
    // Placeholder for socket integration
    // console.log(`[Backend] Typing status: ${isTyping}`);
  }, []);

  const startConversation = useCallback(async (type, otherUserId) => {
    try {
      console.log(`[Backend] Starting conversation with user ${otherUserId}...`);
      const response = await api.post("/conversations", {
        initiatorId: currentUserId,
        recipientId: otherUserId,
        type,
      });
      const newConversation = response.data;
      setConversations((prev) => [newConversation, ...prev]);
      openConversation(newConversation);
    } catch (err) {
      console.error("[Backend] Failed to start conversation:", err);
      throw err;
    }
  }, [currentUserId, openConversation]);

  const searchUsers = useCallback(async (query) => {
    try {
      console.log(`[Backend] Searching users with query "${query}"...`);
      const response = await api.get(`/users/search`, { params: { q: query } });
      return response.data || [];
    } catch (err) {
      console.error("[Backend] Failed to search users:", err);
      // Fallback to dummy data
      console.log(`[Fallback] Searching dummy users with query "${query}".`);
      const lowerCaseQuery = query.toLowerCase();
      return dummyUsers.filter(user =>
        (user.name && user.name.toLowerCase().includes(lowerCaseQuery)) ||
        (user.specialty && user.specialty.toLowerCase().includes(lowerCaseQuery))
      );
    }
  }, []);

  const getAllUsers = useCallback(async () => {
    try {
      console.log(`[Backend] Fetching all users...`);
      const response = await api.get('/users');
      return response.data || [];
    } catch (err) {
      console.error("[Backend] Failed to fetch all users:", err);
      // Fallback to dummy data
      console.log("[Fallback] Using dummy users.");
      return dummyUsers;
    }
  }, []);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    messagesLoading,
    error,
    typingUsers,
    openConversation,
    closeConversation,
    sendMessage,
    uploadFile,
    handleTyping,
    startConversation,
    searchUsers,
    getAllUsers,
    loadConversations,
  };
};
