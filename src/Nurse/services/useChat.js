/**
 * useChat Hook
 * React hook for managing chat state and real-time updates
 */

import { useState, useEffect, useCallback, useRef } from "react";
import socketClient from "../../utils/socketClient";
import { connectSocket } from "../../utils/socketClient";
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
  setupChatSocketListeners,
  subscribeToConversation,
  unsubscribeFromConversation,
  transformConversationForUI,
  transformMessageForUI,
  isSocketConnected,
  authenticateSocket,
  respondToMedicalHistoryRequest as respondToHistoryApi,
} from "./chatService.js";

export function useChat({ currentUserId, currentUserType = "n" } = {}) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeCallHost, setActiveCallHost] = useState(null);
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
      /* console.log("[useChat] User ID changed, resetting socket state", {
        previous: prevUserIdRef.current,
        current: currentUserId,
      }); */
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
          // Socket is healthy, check again in 30 seconds instead of 5
          timeoutId = setTimeout(initSocket, 30000);
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
            if (authenticated) {
              subscribedIdsRef.current.clear();
            }

            setSocketReady(authenticated);
            // If auth succeeded, wait 10s before next check
            timeoutId = setTimeout(initSocket, 10000);
          }
        } catch (err) {
          console.error("[useChat] Auth failed", err);
          timeoutId = setTimeout(initSocket, 3000);
        }
      } else {
        // Not yet connected — trigger a connection attempt then retry
        if (!connected) {
          connectSocket();
        }
        timeoutId = setTimeout(initSocket, 2000);
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
      return transformed;
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
        // console.log(`[useChat] Auto-subscribing to conversation ${conv.id}`);
        subscribeToConversation(conv.id);
        subscribedIdsRef.current.add(conv.id);
      }
    });
  }, [socketReady, conversations]);

  useEffect(() => {
    if (!socketReady) return;

    globalCleanupRef.current = setupChatSocketListeners({
      onMessage: (data) => {
        const incomingConversationId = data.conversationId || data.ticket || data.message?.ticket;
        const currentActive = activeConversationRef.current;
        const message = data.message || data;

        const senderId =
          message.sender?.id || 
          message.Sender_ID ||
          message.Sender_Id ||
          message.senderId;

        if (Number(senderId) === Number(currentUserId)) return;

        /* console.log(
          "[useChat] Incoming Global Message:",
          incomingConversationId
        ); */

        setConversations((prev) => {
          const index = prev.findIndex((c) => Number(c.id) === Number(incomingConversationId));

          if (index === -1) {
            /* console.log(
              "[useChat] New conversation detected via message. Reloading list."
            ); */
            loadConversations();
            return prev;
          }

          const existingConv = prev[index];
          const isActive =
            currentActive && Number(currentActive.id) === Number(incomingConversationId);

          const senderName =
            message.sender?.fullName ||
            message.senderName ||
            message.sender?.Display_Name ||
            message.sender?.displayName ||
            message.sender?.name ||
            existingConv.name?.split(" ")[0] ||
            existingConv.name;

          const updatedConv = {
            ...existingConv,
            lastMessage:
              message.content ||
              message.text ||
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
        // console.log("[useChat] New conversation received:", data);
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

      onRead: () => { },
      onMessageDeleted: () => { },
    });

    return () => {
      if (globalCleanupRef.current) {
        globalCleanupRef.current();
      }
    };
  }, [socketReady, currentUserId, loadConversations]);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
    // reset active call when conversation changes (it will be re-set by loadMessages)
    setActiveCallHost(null);
  }, [activeConversation]);

  const loadMessages = useCallback(
    async (conversationId, options = {}) => {
      // Avoid frequent full-screen loading spinners if we already have messages loaded
      // or if we're doing a background/refresh load
      const isInitialLoad = !options.beforeId && messages.length === 0;

      // Only set loading true for the initial empty-state load
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);
      try {
        const response = await getMessages(conversationId, options);
        // Handle both old array format and new object format for safety
        const data = Array.isArray(response) ? response : response.messages;
        const hostId = response.activeCallHost || null;

        const transformed = data.map((msg) =>
          transformMessageForUI(msg, currentUserId, currentUserType)
        );

        if (options.beforeId) {
          setMessages((prev) => [...transformed, ...prev]);
        } else {
          setMessages(transformed);
          setActiveCallHost(hostId);
        }
        setHasMoreMessages(data.length >= (options.limit || 50));
        markAsRead(conversationId).catch(() => { });
        return transformed;
      } catch (err) {
        setError(err.message);
        return [];
      } finally {
        if (isInitialLoad || options.showLoading !== false) {
          setLoading(false);
        }
      }
    },
    [currentUserId, currentUserType, messages.length]
  );

  const setupActiveConversationListeners = useCallback(
    (conversationId) => {
      if (!socketReady || !conversationId) return;

      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      // Join the ticket room via HTTP using the chatService helper (which uses socket.id + apiRequest)
      subscribeToConversation(conversationId);
      
      subscribedIdsRef.current.add(conversationId);

      cleanupRef.current = setupChatSocketListeners({
        onMessage: (data) => {
          const currentActive = activeConversationRef.current;

          // Use Number() comparison — socket broadcasts numeric ticketId,
          // but the stored conversation.id might be a string.
          if (Number(data.conversationId) !== Number(currentActive?.id)) return;

          const senderId =
            data.message?.sender?.id ||
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

          markAsRead(currentActive?.id).catch(() => { });
        },

        onCallEnded: (data) => {
          const currentActive = activeConversationRef.current;
          if (Number(data.ticketId) === Number(currentActive?.id)) {
            // console.log("[Chat] Call ended event received:", data);
            setActiveCallHost(null);
          }
        },

        onMessageUpdated: (data) => {
          const currentActive = activeConversationRef.current;
          if (Number(data.conversationId) === Number(currentActive?.id)) {
            setMessages((prev) =>
              prev.map((msg) =>
                Number(msg.id) === Number(data.messageId)
                  ? { ...msg, text: data.newContent }
                  : msg
              )
            );
          }
        },

        onHistoryShared: (data) => {
          const currentActive = activeConversationRef.current;
          if (Number(data.ticketId) === Number(currentActive?.id)) {
            // Trigger dashboard refresh if available
            if (window.refreshSpecialistDashboard) {
              window.refreshSpecialistDashboard();
            }
          }
        },

        onCallStarted: (data) => {
          const currentActive = activeConversationRef.current;
          if (Number(data.ticketId) === Number(currentActive?.id)) {
            // console.log("[Chat] Call started event received:", data);
            setActiveCallHost(data.activeCallHost);
          }
        },

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

        // Add real-time message update handling
        onMessageUpdated: (data) => {
          const currentActive = activeConversationRef.current;
          if (Number(data.conversationId) === Number(currentActive?.id)) {
            setMessages((prev) =>
              prev.map((msg) =>
                Number(msg.id) === Number(data.messageId)
                  ? { ...msg, text: data.newContent }
                  : msg
              )
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
        onTicketClaimed: (data) => {
          const currentActive = activeConversationRef.current;
          if (!currentActive || Number(data.ticketId) !== Number(currentActive.id)) return;
          const nurseName = data.nurse?.fullName || 'A nurse';
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-claimed-${Date.now()}`,
              isSystem: true,
              text: `${nurseName} has joined this consultation as the assigned nurse.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSent: false,
              sender: 'system',
            },
          ]);
        },
        onSpecialistJoined: (data) => {
          const currentActive = activeConversationRef.current;
          if (!currentActive || Number(data.ticketId) !== Number(currentActive.id)) return;
          const specName = data.specialist?.fullName || 'A specialist';
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-specialist-${Date.now()}`,
              isSystem: true,
              text: `Dr. ${specName} has been assigned and joined this consultation.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSent: false,
              sender: 'system',
            },
          ]);
        },
      });
    },
    [socketReady, currentUserId, currentUserType]
  );

  const openConversation = useCallback(
    async (conversation) => {
      // Avoid flickering if we're already on this conversation
      if (activeConversationRef.current?.id === conversation.id) return;

      setActiveConversation(conversation);
      // We don't clear messages if the ID is the same, but here we're switching
      setMessages([]);
      setTypingUsers([]);
      setHasMoreMessages(true);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        )
      );

      // Start loading and socket setup simultaneously
      const loadTask = loadMessages(conversation.id);

      if (socketReady) {
        setupActiveConversationListeners(conversation.id);
      }

      await loadTask;
    },
    [loadMessages, socketReady, setupActiveConversationListeners]
  );

  const closeConversation = useCallback(() => {
    if (activeConversation?.id) {
      // Leave the ticket socket room when closing the chat via HTTP
      unsubscribeFromConversation(activeConversation.id);

      if (cleanupRef.current) {
        cleanupRef.current();
      }
    }
    setActiveConversation(null);
    setMessages([]);
    setTypingUsers([]);
  }, [activeConversation]);

  const handleSendMessage = useCallback(
    async (content, replyToId = null, conversationIdOverride = null) => {
      const targetConversationId =
        conversationIdOverride || activeConversationRef.current?.id || activeConversation?.id;

      if (!targetConversationId || !content.trim()) return null;

      try {
        const result = await sendMessage(
          targetConversationId,
          content,
          replyToId
        );
        const transformedMsg = transformMessageForUI(
          result,
          currentUserId,
          currentUserType
        );

        if (Number(activeConversationRef.current?.id) === Number(targetConversationId)) {
          setMessages((prev) => [...prev, transformedMsg]);
        }

        setConversations((prev) => {
          const index = prev.findIndex((c) => Number(c.id) === Number(targetConversationId));
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

      /* console.log("[useChat] handleUploadFile called", {
        fileName: file.name,
        isCallActive: !!activeCallHost,
        activeCallHost,
        fileType: file.type,
        fileSize: file.size,
        conversationId: activeConversation.id,
      }); */

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

        setConversations((prev) => {
          if (prev.some((c) => c.id === transformed.id)) return prev;
          return [transformed, ...prev];
        });
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
      console.error("Error searching users:", err);
      return [];
    }
  }, []);

  const handleGetAllUsers = useCallback(async () => {
    try {
      return await getAllChatUsers();
    } catch (err) {
      console.error("Error getting all users:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      // Small delay on first load to prevent double-firing and race conditions
      const timer = setTimeout(() => {
        loadConversations();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentUserId, loadConversations]);

  useEffect(() => {
    const currentTypingTimeouts = typingUsersTimeoutRef.current;

    return () => {
      if (cleanupRef.current) cleanupRef.current();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      Object.values(currentTypingTimeouts).forEach(clearTimeout);
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
    loadMessages,
    respondToMedicalHistoryRequest: async (ticketId, approved, messageId) => {
      // Optimistically update the messaging UI immediately
      if (messageId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              const patientName = activeConversationRef.current?.patientName || "Patient";
              return {
                ...msg,
                text: approved
                  ? "MEDICAL_HISTORY_CONTENT:System"
                  : `MEDICAL_HISTORY_DENIED:${patientName}`,
              };
            }
            return msg;
          })
        );
      }

      // Perform the API call
      const result = await respondToHistoryApi(ticketId, approved, messageId);

      // After successful API call, we can update the conversations list's last message too
      setConversations((prev) => {
        const index = prev.findIndex((c) => Number(c.id) === Number(ticketId));
        if (index === -1) return prev;
        const newArr = [...prev];
        newArr[index] = {
          ...newArr[index],
          lastMessage: approved ? "Medical history shared" : "Request denied",
          timestamp: "Just now"
        };
        return newArr;
      });

      return result;
    },
    setError,
    setConversations,
    activeCallHost,
    isCallActive: !!activeCallHost,
  };
}

export default useChat;
