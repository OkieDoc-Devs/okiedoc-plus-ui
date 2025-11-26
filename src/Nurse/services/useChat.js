/**
 * useChat Hook
 * React hook for managing chat state and real-time updates
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getConversations,
  getMessages,
  sendMessage,
  uploadFile,
  markAsRead,
  sendTypingIndicator,
  createConversation,
  searchUsers,
  getAllChatUsers,
  subscribeToConversation,
  unsubscribeFromConversation,
  setupChatSocketListeners,
  transformConversationForUI,
  transformMessageForUI,
  isSocketConnected,
  authenticateSocket,
} from "./chatService.js";

/**
 * Hook for managing chat functionality
 */
export function useChat({ currentUserId, currentUserType = "n" } = {}) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [socketReady, setSocketReady] = useState(false);

  const typingTimeoutRef = useRef(null);
  const typingUsersTimeoutRef = useRef({});
  const cleanupRef = useRef(null);
  const globalCleanupRef = useRef(null);
  const activeConversationRef = useRef(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    const initSocket = async () => {
      if (isSocketConnected() && currentUserId) {
        const authenticated = await authenticateSocket(currentUserId);
        console.log(
          "[useChat] Socket authentication result:",
          authenticated,
          "for user:",
          currentUserId
        );
        setSocketReady(authenticated);
      } else {
        setSocketReady(false);
      }
    };

    initSocket();
    const interval = setInterval(initSocket, 2000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  useEffect(() => {
    if (!socketReady) return;

    console.log(
      "[useChat] Setting up global socket listener for unread counts"
    );

    globalCleanupRef.current = setupChatSocketListeners({
      onMessage: (data) => {
        console.log("[useChat] Global onMessage received:", data);
        const incomingConversationId = data.conversationId;
        const currentActive = activeConversationRef.current;

        const senderId =
          data.message?.Sender_ID ||
          data.message?.Sender_Id ||
          data.message?.senderId;
        if (Number(senderId) === Number(currentUserId)) {
          return;
        }

        if (currentActive && currentActive.id === incomingConversationId) {
          console.log(
            "[useChat] Global listener: Message is for active conversation, skipping"
          );
          return;
        }

        console.log(
          "[useChat] Global listener: Incrementing unread for conversation:",
          incomingConversationId
        );
        setConversations((prev) =>
          prev.map((c) =>
            c.id === incomingConversationId
              ? {
                  ...c,
                  unreadCount: (c.unreadCount || 0) + 1,
                  lastMessage:
                    data.message?.Message_Content ||
                    data.message?.content ||
                    c.lastMessage,
                  timestamp: "Just now",
                }
              : c
          )
        );
      },
      onTyping: () => {},
      onRead: () => {},
      onMessageDeleted: () => {},
    });

    return () => {
      console.log("[useChat] Cleaning up global socket listener");
      if (globalCleanupRef.current) {
        globalCleanupRef.current();
      }
    };
  }, [socketReady, currentUserId]);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConversations();
      const transformed = data.map((conv) =>
        transformConversationForUI(conv, currentUserId)
      );
      setConversations(transformed);
    } catch (err) {
      if (err.message.includes("404")) {
        console.warn("Chat API not available yet. Using empty state.");
        setConversations([]);
      } else {
        setError(err.message);
        console.error("Failed to load conversations:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const loadMessages = useCallback(
    async (conversationId, options = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMessages(conversationId, options);
        const transformed = data.map((msg) =>
          transformMessageForUI(msg, currentUserId, currentUserType)
        );

        if (options.beforeId) {
          setMessages((prev) => [...transformed, ...prev]);
        } else {
          setMessages(transformed);
        }

        setHasMoreMessages(data.length >= (options.limit || 50));

        try {
          await markAsRead(conversationId);
        } catch (readErr) {
          console.warn("Could not mark messages as read:", readErr.message);
        }

        return transformed;
      } catch (err) {
        setError(err.message);
        console.error("Failed to load messages:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [currentUserId, currentUserType]
  );

  const setupActiveConversationListeners = useCallback(
    (conversationId) => {
      console.log("[useChat] setupActiveConversationListeners called", {
        conversationId,
        socketReady,
      });

      if (!socketReady || !conversationId) {
        console.log(
          "[useChat] Cannot setup listeners - socketReady:",
          socketReady,
          "conversationId:",
          conversationId
        );
        return;
      }

      if (cleanupRef.current) {
        console.log(
          "[useChat] Cleaning up existing active conversation listeners"
        );
        cleanupRef.current();
        cleanupRef.current = null;
      }

      console.log("[useChat] Subscribing to conversation:", conversationId);
      subscribeToConversation(conversationId, (response) => {
        console.log("[useChat] Subscribe response:", response);
        if (response.error && response.error !== "Socket not available") {
          console.warn("Failed to subscribe:", response.error);
        }
      });

      console.log(
        "[useChat] Setting up socket listeners for active conversation:",
        conversationId
      );
      cleanupRef.current = setupChatSocketListeners({
        onMessage: (data) => {
          console.log(
            "[useChat] Active conversation onMessage received:",
            data
          );
          const currentActive = activeConversationRef.current;
          console.log(
            "[useChat] Current active conversation:",
            currentActive?.id,
            "Incoming:",
            data.conversationId
          );

          if (data.conversationId === currentActive?.id) {
            const senderId =
              data.message?.Sender_ID ||
              data.message?.Sender_Id ||
              data.message?.senderId;
            console.log(
              "[useChat] Sender ID:",
              senderId,
              "Current user:",
              currentUserId
            );

            if (Number(senderId) === Number(currentUserId)) {
              console.log("[useChat] Skipping own message");
              return;
            }

            const transformedMsg = transformMessageForUI(
              data.message,
              currentUserId,
              currentUserType
            );

            setMessages((prev) => {
              const exists = prev.some((m) => m.id === transformedMsg.id);
              if (exists) {
                console.log("[useChat] Message already exists, skipping");
                return prev;
              }
              console.log("[useChat] Adding new message to state");
              return [...prev, transformedMsg];
            });

            setConversations((prev) =>
              prev.map((c) =>
                c.id === currentActive?.id
                  ? {
                      ...c,
                      lastMessage:
                        data.message.Message_Content || data.message.content,
                      timestamp: "Just now",
                    }
                  : c
              )
            );
            markAsRead(currentActive?.id).catch(() => {});
          }
        },
        onTyping: (data) => {
          console.log("[useChat] onTyping received:", data);
          const currentActive = activeConversationRef.current;
          if (
            data.conversationId === currentActive?.id &&
            Number(data.userId) !== Number(currentUserId)
          ) {
            const typingUserId = data.userId;

            if (typingUsersTimeoutRef.current[typingUserId]) {
              clearTimeout(typingUsersTimeoutRef.current[typingUserId]);
              delete typingUsersTimeoutRef.current[typingUserId];
            }

            if (data.isTyping) {
              setTypingUsers((prev) => {
                if (!prev.includes(typingUserId)) {
                  console.log("[useChat] Adding typing user:", typingUserId);
                  return [...prev, typingUserId];
                }
                return prev;
              });

              typingUsersTimeoutRef.current[typingUserId] = setTimeout(() => {
                console.log(
                  "[useChat] Auto-removing typing user after timeout:",
                  typingUserId
                );
                setTypingUsers((prev) =>
                  prev.filter((id) => id !== typingUserId)
                );
                delete typingUsersTimeoutRef.current[typingUserId];
              }, 5000);
            } else {
              console.log("[useChat] Removing typing user:", typingUserId);
              setTypingUsers((prev) =>
                prev.filter((id) => id !== typingUserId)
              );
            }
          }
        },
        onRead: (data) => {
          console.log("[useChat] Message read:", data);
        },
        onMessageDeleted: (data) => {
          const currentActive = activeConversationRef.current;
          if (data.conversationId === currentActive?.id) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.messageId
                  ? {
                      ...msg,
                      isDeleted: true,
                      text: "This message was deleted",
                    }
                  : msg
              )
            );
          }
        },
      });
    },
    [socketReady, currentUserId, currentUserType]
  );

  useEffect(() => {
    const currentActive = activeConversationRef.current;
    if (socketReady && currentActive?.id) {
      console.log(
        "[useChat] Socket ready, setting up listeners for conversation:",
        currentActive.id
      );
      setupActiveConversationListeners(currentActive.id);
    }
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [socketReady, setupActiveConversationListeners]);

  const openConversation = useCallback(
    async (conversation) => {
      if (activeConversation?.id && cleanupRef.current) {
        unsubscribeFromConversation(activeConversation.id, () => {});
        cleanupRef.current();
        cleanupRef.current = null;
      }

      setActiveConversation(conversation);
      setMessages([]);
      setTypingUsers([]);
      setHasMoreMessages(true);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        )
      );

      await loadMessages(conversation.id);

      if (socketReady) {
        setupActiveConversationListeners(conversation.id);
      }
    },
    [
      activeConversation,
      loadMessages,
      socketReady,
      setupActiveConversationListeners,
    ]
  );

  const closeConversation = useCallback(() => {
    if (activeConversation?.id) {
      unsubscribeFromConversation(activeConversation.id, () => {});
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    }
    setActiveConversation(null);
    setMessages([]);
    setTypingUsers([]);
  }, [activeConversation]);

  const handleSendMessage = useCallback(
    async (content, replyToId = null) => {
      if (!activeConversation || !content.trim()) return null;

      try {
        const result = await sendMessage(
          activeConversation.id,
          content,
          replyToId
        );
        const transformedMsg = transformMessageForUI(
          result,
          currentUserId,
          currentUserType
        );
        setMessages((prev) => [...prev, transformedMsg]);

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? { ...c, lastMessage: content, timestamp: "Just now" }
              : c
          )
        );

        return transformedMsg;
      } catch (err) {
        setError(err.message);
        console.error("Failed to send message:", err);
        return null;
      }
    },
    [activeConversation, currentUserId, currentUserType]
  );

  const handleUploadFile = useCallback(
    async (file, caption = "") => {
      if (!activeConversation) return null;

      try {
        const result = await uploadFile(activeConversation.id, file, caption);
        const transformedMsg = transformMessageForUI(
          result,
          currentUserId,
          currentUserType
        );
        setMessages((prev) => [...prev, transformedMsg]);
        return transformedMsg;
      } catch (err) {
        setError(err.message);
        console.error("Failed to upload file:", err);
        return null;
      }
    },
    [activeConversation, currentUserId, currentUserType]
  );

  const handleTyping = useCallback(
    (isTyping = true) => {
      if (!activeConversation) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      sendTypingIndicator(activeConversation.id, isTyping);

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          sendTypingIndicator(activeConversation.id, false);
        }, 3000);
      }
    },
    [activeConversation]
  );

  const loadMoreMessages = useCallback(async () => {
    if (!activeConversation || !hasMoreMessages || loading) return;

    const oldestMessage = messages[0];
    if (oldestMessage) {
      await loadMessages(activeConversation.id, {
        beforeId: oldestMessage.id,
        limit: 50,
      });
    }
  }, [activeConversation, hasMoreMessages, loading, messages, loadMessages]);

  const startConversation = useCallback(
    async (type, participantIdOrIds, title = null) => {
      try {
        const conversationData =
          type === "direct"
            ? { type: "direct", participantId: participantIdOrIds }
            : { type: "group", participantIds: participantIdOrIds, title };

        const result = await createConversation(conversationData);
        const transformed = transformConversationForUI(result, currentUserId);

        setConversations((prev) => [transformed, ...prev]);
        await openConversation(transformed);

        return transformed;
      } catch (err) {
        setError(err.message);
        console.error("Failed to start conversation:", err);
        return null;
      }
    },
    [currentUserId, openConversation]
  );

  const handleSearchUsers = useCallback(async (query) => {
    if (!query.trim()) return [];
    try {
      return await searchUsers(query);
    } catch (err) {
      console.error("Failed to search users:", err);
      return [];
    }
  }, []);

  const handleGetAllUsers = useCallback(async () => {
    try {
      return await getAllChatUsers();
    } catch (err) {
      console.error("Failed to get all users:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    }
  }, [currentUserId, loadConversations]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      Object.values(typingUsersTimeoutRef.current).forEach(clearTimeout);
      typingUsersTimeoutRef.current = {};
    };
  }, []);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    typingUsers,
    hasMoreMessages,
    socketReady,

    loadConversations,
    openConversation,
    closeConversation,
    sendMessage: handleSendMessage,
    uploadFile: handleUploadFile,
    handleTyping,
    loadMoreMessages,
    startConversation,
    searchUsers: handleSearchUsers,
    getAllUsers: handleGetAllUsers,

    setError,
    setConversations,
  };
}

export default useChat;
