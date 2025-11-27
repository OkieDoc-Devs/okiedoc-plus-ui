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
  setupChatSocketListeners,
  transformConversationForUI,
  transformMessageForUI,
  isSocketConnected,
  authenticateSocket,
} from "./chatService.js";

export function useChat({ currentUserId, currentUserType = "n" } = {}) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const [socketReady, setSocketReady] = useState(false);

  const subscribedIdsRef = useRef(new Set());

  const typingTimeoutRef = useRef(null);
  const typingUsersTimeoutRef = useRef({});
  const cleanupRef = useRef(null);
  const globalCleanupRef = useRef(null);
  const activeConversationRef = useRef(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  const prevUserIdRef = useRef(currentUserId);
  useEffect(() => {
    if (prevUserIdRef.current !== currentUserId) {
      console.log("[useChat] User ID changed, resetting socket state", {
        previous: prevUserIdRef.current,
        current: currentUserId,
      });
      prevUserIdRef.current = currentUserId;
      setSocketReady(false);
      subscribedIdsRef.current.clear();
    }
  }, [currentUserId]);

  useEffect(() => {
    let timeoutId;
    let mounted = true;

    const initSocket = async () => {
      if (!mounted) return;

      const connected = isSocketConnected();

      if (socketReady) {
        if (connected) {
          timeoutId = setTimeout(initSocket, 5000);
          return;
        } else {
          console.warn("[useChat] Socket disconnected. Resetting state.");
          setSocketReady(false);
          subscribedIdsRef.current.clear();
          timeoutId = setTimeout(initSocket, 1000);
          return;
        }
      }

      if (connected && currentUserId) {
        try {
          const authenticated = await authenticateSocket(currentUserId);
          if (mounted) {
            console.log("[useChat] Socket auth result:", authenticated);

            if (authenticated) {
              subscribedIdsRef.current.clear();
            }

            setSocketReady(authenticated);
            timeoutId = setTimeout(initSocket, 2000);
          }
        } catch (err) {
          console.error("[useChat] Auth failed", err);
          timeoutId = setTimeout(initSocket, 2000);
        }
      } else {
        timeoutId = setTimeout(initSocket, 1000);
      }
    };

    initSocket();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [currentUserId, socketReady]);

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
      if (err.message && err.message.includes("404")) {
        console.warn("Chat API not available yet. Using empty state.");
        setConversations([]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!socketReady || conversations.length === 0) return;

    conversations.forEach((conv) => {
      if (!subscribedIdsRef.current.has(conv.id)) {
        console.log(`[useChat] Auto-subscribing to conversation ${conv.id}`);
        subscribeToConversation(conv.id);
        subscribedIdsRef.current.add(conv.id);
      }
    });
  }, [socketReady, conversations]);

  useEffect(() => {
    if (!socketReady) return;

    globalCleanupRef.current = setupChatSocketListeners({
      onMessage: (data) => {
        const incomingConversationId = data.conversationId;
        const currentActive = activeConversationRef.current;

        const senderId =
          data.message?.Sender_ID ||
          data.message?.Sender_Id ||
          data.message?.senderId;

        if (Number(senderId) === Number(currentUserId)) return;

        console.log(
          "[useChat] Incoming Global Message:",
          incomingConversationId
        );

        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === incomingConversationId);

          if (index === -1) {
            console.log(
              "[useChat] New conversation detected via message. Reloading list."
            );
            loadConversations();
            return prev;
          }

          const existingConv = prev[index];
          const isActive =
            currentActive && currentActive.id === incomingConversationId;

          const senderName =
            data.message?.Sender_Name ||
            data.message?.senderName ||
            data.message?.sender?.Display_Name ||
            data.message?.sender?.displayName ||
            data.message?.sender?.name ||
            existingConv.name?.split(" ")[0] ||
            existingConv.name;

          const updatedConv = {
            ...existingConv,
            lastMessage:
              data.message?.Message_Content ||
              data.message?.content ||
              data.message?.text ||
              "New message",
            lastMessageSentByMe: false,
            lastMessageSenderName: senderName,
            timestamp: "Just now",
            unreadCount: isActive ? 0 : (existingConv.unreadCount || 0) + 1,
            isOnline:
              data.isOnline !== undefined
                ? data.isOnline
                : existingConv.isOnline,
          };

          const newConversations = [...prev];
          newConversations.splice(index, 1);
          newConversations.unshift(updatedConv);

          return newConversations;
        });
      },

      onNewConversation: (data) => {
        console.log("[useChat] New conversation received:", data);
        loadConversations();
      },

      onTyping: (data) => {
        const currentActive = activeConversationRef.current;

        if (!currentActive) return;

        const incomingConvId =
          data.conversationId || data.Conversation_ID || data.conversation_id;
        const typingUserId = data.userId || data.User_ID || data.user_id;
        const isTyping =
          data.isTyping !== undefined ? data.isTyping : data.is_typing;

        if (
          incomingConvId === currentActive.id &&
          Number(typingUserId) !== Number(currentUserId)
        ) {
          if (typingUsersTimeoutRef.current[typingUserId]) {
            clearTimeout(typingUsersTimeoutRef.current[typingUserId]);
          }

          if (isTyping) {
            setTypingUsers((prev) =>
              !prev.includes(typingUserId) ? [...prev, typingUserId] : prev
            );

            typingUsersTimeoutRef.current[typingUserId] = setTimeout(() => {
              setTypingUsers((prev) =>
                prev.filter((id) => id !== typingUserId)
              );
            }, 3000);
          } else {
            setTypingUsers((prev) => prev.filter((id) => id !== typingUserId));
          }
        }
      },

      onRead: () => {},
      onMessageDeleted: () => {},
    });

    return () => {
      if (globalCleanupRef.current) {
        globalCleanupRef.current();
      }
    };
  }, [socketReady, currentUserId, loadConversations]);

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
        markAsRead(conversationId).catch(() => {});
        return transformed;
      } catch (err) {
        setError(err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [currentUserId, currentUserType]
  );

  const setupActiveConversationListeners = useCallback(
    (conversationId) => {
      if (!socketReady || !conversationId) return;

      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      subscribeToConversation(conversationId);
      subscribedIdsRef.current.add(conversationId);

      cleanupRef.current = setupChatSocketListeners({
        onMessage: (data) => {
          const currentActive = activeConversationRef.current;

          if (data.conversationId !== currentActive?.id) return;

          const senderId =
            data.message?.Sender_ID ||
            data.message?.Sender_Id ||
            data.message?.senderId;

          if (Number(senderId) === Number(currentUserId)) return;

          const transformedMsg = transformMessageForUI(
            data.message,
            currentUserId,
            currentUserType
          );

          setMessages((prev) => {
            const exists = prev.some((m) => m.id === transformedMsg.id);
            if (exists) return prev;
            return [...prev, transformedMsg];
          });

          markAsRead(currentActive?.id).catch(() => {});
        },
        onTyping: () => {},
        onRead: (data) => {
          const currentActive = activeConversationRef.current;
          if (data.conversationId === currentActive?.id) {
            setMessages((prev) =>
              prev.map((msg) => {
                if (!msg.isSent) return msg;
                return { ...msg, isRead: true };
              })
            );
          }
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

  const openConversation = useCallback(
    async (conversation) => {
      if (activeConversation?.id && cleanupRef.current) {
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
    if (activeConversation?.id && cleanupRef.current) {
      cleanupRef.current();
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

        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === activeConversation.id);
          if (index === -1) return prev;

          const updated = {
            ...prev[index],
            lastMessage: content,
            lastMessageSentByMe: true,
            lastMessageSenderName: null,
            timestamp: "Just now",
          };
          const newArr = [...prev];
          newArr.splice(index, 1);
          newArr.unshift(updated);
          return newArr;
        });

        return transformedMsg;
      } catch (err) {
        setError(err.message);
        return null;
      }
    },
    [activeConversation, currentUserId, currentUserType]
  );

  const handleUploadFile = useCallback(
    async (file, caption = "") => {
      if (!activeConversation) {
        console.error("[useChat] No active conversation to upload to.");
        return null;
      }

      console.log("[useChat] handleUploadFile called", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        conversationId: activeConversation.id,
      });

      try {
        const result = await uploadFile(activeConversation.id, file, caption);

        const transformedMsg = transformMessageForUI(
          result,
          currentUserId,
          currentUserType
        );

        setMessages((prev) => [...prev, transformedMsg]);

        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === activeConversation.id);
          if (index === -1) return prev;

          const updated = {
            ...prev[index],
            lastMessage: `📎 ${file.name}`,
            lastMessageSentByMe: true,
            lastMessageSenderName: null,
            timestamp: "Just now",
          };
          const newArr = [...prev];
          newArr.splice(index, 1);
          newArr.unshift(updated);
          return newArr;
        });

        return transformedMsg;
      } catch (err) {
        console.error("[useChat] File upload error:", err.message);
        setError(err.message);
        return null;
      }
    },
    [activeConversation, currentUserId, currentUserType]
  );

  const handleTyping = useCallback(
    (isTyping = true) => {
      if (!activeConversation) return;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

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

        if (socketReady) {
          subscribeToConversation(transformed.id);
          subscribedIdsRef.current.add(transformed.id);
        }

        return transformed;
      } catch (err) {
        setError(err.message);
        return null;
      }
    },
    [currentUserId, openConversation, socketReady]
  );

  const handleSearchUsers = useCallback(async (query) => {
    if (!query.trim()) return [];
    try {
      return await searchUsers(query);
    } catch (err) {
      return [];
    }
  }, []);

  const handleGetAllUsers = useCallback(async () => {
    try {
      return await getAllChatUsers();
    } catch (err) {
      return [];
    }
  }, []);

  useEffect(() => {
    if (currentUserId) loadConversations();
  }, [currentUserId, loadConversations]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      Object.values(typingUsersTimeoutRef.current).forEach(clearTimeout);
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
