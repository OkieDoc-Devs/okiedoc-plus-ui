/**
 * Chat Service Module
 * Handles all Chat API communication including WebSocket real-time features
 */

const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://your-production-url.com"
    : "http://localhost:1337";

function getSocket() {
  if (typeof window !== "undefined" && window.io && window.io.socket) {
    return window.io.socket;
  }
  console.log("[Chat] getSocket - no socket available", {
    hasWindow: typeof window !== "undefined",
    hasIo: typeof window !== "undefined" && !!window.io,
    hasSocket: typeof window !== "undefined" && window.io && !!window.io.socket,
  });
  return null;
}

export function isSocketConnected() {
  const socket = getSocket();
  if (!socket) return false;
  const connected =
    typeof socket.isConnected === "function"
      ? socket.isConnected()
      : socket._raw?.connected || false;
  return connected;
}

let socketAuthUserId = null;
let socketAuthPromise = null;
let authRetryCount = 0;
const MAX_AUTH_RETRIES = 3;

function reconnectSocket() {
  if (typeof window !== "undefined" && window.io && window.io.socket) {
    console.log("[Chat] Reconnecting socket to refresh session...");
    window.io.socket.reconnect();
  }
}

export async function authenticateSocket(userId = null) {
  if (socketAuthPromise && socketAuthUserId === userId) {
    return socketAuthPromise;
  }

  if (userId && socketAuthUserId !== userId) {
    socketAuthPromise = null;
    socketAuthUserId = userId;
    authRetryCount = 0;
  }

  socketAuthPromise = new Promise((resolve) => {
    const socket = getSocket();
    if (!socket) {
      console.warn("[Chat] Cannot authenticate socket - no socket available");
      resolve(false);
      return;
    }

    const url = userId
      ? `/api/chat/conversations?socketUserId=${userId}`
      : "/api/chat/conversations";

    socket.get(url, (data, response) => {
      console.log("[Chat] Socket auth response:", {
        statusCode: response?.statusCode,
        hasData: !!data,
        userId: userId,
        retryCount: authRetryCount,
      });
      if (response && response.statusCode === 200) {
        console.log(
          "[Chat] Socket authenticated successfully for user:",
          userId
        );
        socketAuthUserId = userId;
        authRetryCount = 0;
        resolve(true);
      } else if (response && response.statusCode === 401) {
        if (authRetryCount < MAX_AUTH_RETRIES) {
          authRetryCount++;
          console.warn(
            `[Chat] Socket not authenticated (attempt ${authRetryCount}/${MAX_AUTH_RETRIES}) - reconnecting socket...`
          );
          socketAuthPromise = null;
          reconnectSocket();
          resolve(false);
        } else {
          console.warn(
            "[Chat] Socket authentication failed after max retries - user may need to re-login"
          );
          socketAuthPromise = null;
          resolve(false);
        }
      } else {
        console.warn("[Chat] Socket authentication failed:", data);
        socketAuthPromise = null;
        resolve(false);
      }
    });
  });

  return socketAuthPromise;
}

export function resetSocketAuth() {
  console.log("[Chat] Resetting socket auth state and reconnecting...");
  socketAuthPromise = null;
  socketAuthUserId = null;
  authRetryCount = 0;

  if (typeof window !== "undefined" && window.io && window.io.socket) {
    window.io.socket.disconnect();
    setTimeout(() => {
      if (window.io && window.io.socket) {
        window.io.socket.reconnect();
      }
    }, 100);
  }
}

export async function createConversation(conversationData) {
  const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(conversationData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  const data = await response.json();
  return data.conversation || data;
}

export async function getConversations() {
  const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.conversations || data || [];
}

export async function getConversationById(conversationId) {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversations/${conversationId}`,
    {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.conversation || data;
}

export async function addParticipant(conversationId, userId) {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversations/${conversationId}/participants`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
}

export async function removeParticipant(conversationId, participantId) {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversations/${conversationId}/participants/${participantId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function leaveConversation(conversationId) {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversations/${conversationId}/leave`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function getMessages(conversationId, options = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.append("limit", options.limit);
  if (options.beforeId) params.append("beforeId", options.beforeId);
  if (options.afterId) params.append("afterId", options.afterId);
  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages${
    queryString ? `?${queryString}` : ""
  }`;
  const response = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.messages || data || [];
}

export async function sendMessage(conversationId, content, replyToId = null) {
  const body = { content };
  if (replyToId) body.replyToId = replyToId;
  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  const data = await response.json();
  return data.message || data;
}

export async function uploadFile(conversationId, file, caption = "") {
  const formData = new FormData();
  formData.append("file", file);
  if (caption) formData.append("caption", caption);
  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages/upload`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  const data = await response.json();
  return data.message || data;
}

export async function deleteMessage(conversationId, messageId) {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages/${messageId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function markAsRead(conversationId, messageId = null) {
  const body = messageId ? { messageId } : {};
  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversations/${conversationId}/read`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export function sendTypingIndicator(conversationId, isTyping = true) {
  const socket = getSocket();
  if (socket && isSocketConnected()) {
    socket.post(
      `/api/chat/conversations/${conversationId}/typing`,
      { isTyping },
      () => {}
    );
  }
}

export async function searchUsers(query) {
  const response = await fetch(
    `${API_BASE_URL}/api/chat/users/search?q=${encodeURIComponent(query)}`,
    {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.users || data || [];
}

export async function getAllChatUsers() {
  const response = await fetch(`${API_BASE_URL}/api/chat/users`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.users || data || [];
}

export function subscribeToConversation(conversationId, callback) {
  const socket = getSocket();
  console.log("[Chat] subscribeToConversation called", {
    conversationId,
    socketExists: !!socket,
    isConnected: socket ? isSocketConnected() : false,
  });
  if (socket && isSocketConnected()) {
    socket.get(
      `/api/chat/conversations/${conversationId}/subscribe`,
      (data, response) => {
        console.log("[Chat] Subscribed to conversation", conversationId, data);
        if (callback) callback(data, response);
      }
    );
  } else {
    console.info("[Chat] Socket not available - subscription skipped");
    if (callback) callback({ error: "Socket not available" });
  }
}

export function unsubscribeFromConversation(conversationId, callback) {
  const socket = getSocket();
  if (socket && isSocketConnected()) {
    socket.get(
      `/api/chat/conversations/${conversationId}/unsubscribe`,
      (data, response) => {
        console.log("Unsubscribed from conversation", conversationId);
        if (callback) callback(data, response);
      }
    );
  } else {
    if (callback) callback({ error: "Socket not available" });
  }
}

export function setupChatSocketListeners(handlers) {
  const socket = getSocket();
  console.log("[Chat] setupChatSocketListeners called", {
    socketExists: !!socket,
    isConnected: socket ? isSocketConnected() : false,
    handlers: Object.keys(handlers),
  });
  if (!socket) {
    console.info("[Chat] Socket not available - event listeners not set up");
    return () => {};
  }

  const {
    onMessage,
    onTyping,
    onRead,
    onParticipantAdded,
    onParticipantRemoved,
    onMessageDeleted,
    onNewConversation,
  } = handlers;

  const processedMessageIds = new Set();

  const wrappedOnMessage = onMessage
    ? (data) => {
        const messageId =
          data.message?.Message_ID || data.message?.Id || data.message?.id;
        if (messageId && processedMessageIds.has(messageId)) {
          console.log(
            "[Chat] Skipping duplicate message event for ID:",
            messageId
          );
          return;
        }
        if (messageId) {
          processedMessageIds.add(messageId);
          setTimeout(() => processedMessageIds.delete(messageId), 5000);
        }
        console.log("[Chat] Received message event:", data);
        onMessage(data);
      }
    : null;

  if (wrappedOnMessage) {
    socket.on("chat:message", wrappedOnMessage);
    socket.on("chat:newMessage", wrappedOnMessage);
    console.log("[Chat] Listening for chat:message and chat:newMessage events");
  }
  if (onTyping) {
    socket.on("chat:typing", onTyping);
    socket.on("chat:userTyping", onTyping);
    console.log("[Chat] Listening for chat:typing and chat:userTyping events");
  }
  if (onRead) {
    socket.on("chat:read", onRead);
    socket.on("chat:messageRead", onRead);
  }
  if (onParticipantAdded) {
    socket.on("chat:participant-added", onParticipantAdded);
    socket.on("chat:participantAdded", onParticipantAdded);
  }
  if (onParticipantRemoved) {
    socket.on("chat:participant-removed", onParticipantRemoved);
    socket.on("chat:participantRemoved", onParticipantRemoved);
  }
  if (onMessageDeleted) {
    socket.on("chat:message-deleted", onMessageDeleted);
    socket.on("chat:messageDeleted", onMessageDeleted);
  }
  if (onNewConversation) {
    socket.on("chat:newConversation", onNewConversation);
    socket.on("chat:conversation-created", onNewConversation);
    console.log("[Chat] Listening for chat:newConversation events");
  }

  return () => {
    console.log("[Chat] Cleaning up socket listeners");
    if (wrappedOnMessage) {
      socket.off("chat:message", wrappedOnMessage);
      socket.off("chat:newMessage", wrappedOnMessage);
    }
    if (onTyping) {
      socket.off("chat:typing", onTyping);
      socket.off("chat:userTyping", onTyping);
    }
    if (onRead) {
      socket.off("chat:read", onRead);
      socket.off("chat:messageRead", onRead);
    }
    if (onParticipantAdded) {
      socket.off("chat:participant-added", onParticipantAdded);
      socket.off("chat:participantAdded", onParticipantAdded);
    }
    if (onParticipantRemoved) {
      socket.off("chat:participant-removed", onParticipantRemoved);
      socket.off("chat:participantRemoved", onParticipantRemoved);
    }
    if (onMessageDeleted) {
      socket.off("chat:message-deleted", onMessageDeleted);
      socket.off("chat:messageDeleted", onMessageDeleted);
    }
    if (onNewConversation) {
      socket.off("chat:newConversation", onNewConversation);
      socket.off("chat:conversation-created", onNewConversation);
    }
  };
}

export function getUserTypeLabel(userType) {
  const labels = { p: "Patient", n: "Nurse", s: "Specialist", a: "Admin" };
  return labels[userType?.toLowerCase()] || "User";
}

function normalizeTimestamp(timestamp) {
  if (!timestamp) return null;
  let ts = timestamp;
  if (typeof ts === "number" && ts < 4102444800) {
    ts = ts * 1000;
  }
  return ts;
}

export function formatRelativeTime(timestamp) {
  const ts = normalizeTimestamp(timestamp);
  if (!ts) return "";

  const date = new Date(ts);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function formatExactTime(timestamp) {
  const ts = normalizeTimestamp(timestamp);
  if (!ts) return "";

  const date = new Date(ts);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (messageDate.getTime() === today.getTime()) {
    return timeStr;
  }

  if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeStr}`;
  }

  const diffDays = Math.floor((today - messageDate) / 86400000);
  if (diffDays < 7) {
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    return `${dayName} ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
  return `${dateStr}, ${timeStr}`;
}

export function formatMessageTime(timestamp) {
  return formatRelativeTime(timestamp);
}

export function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function isAllowedFileType(fileOrType) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];

  const typeToCheck = fileOrType.type ? fileOrType.type : fileOrType;

  return allowedTypes.includes(typeToCheck);
}

export function getMaxFileSize() {
  return 10 * 1024 * 1024;
}

export function transformConversationForUI(conversation, currentUserId) {
  const participants = conversation.participants || [];
  const otherParticipant = participants.find(
    (p) => (p.User_ID || p.User_Id || p.userId || p.id) !== currentUserId
  );
  const displayName =
    conversation.Conversation_Title ||
    conversation.Title ||
    conversation.title ||
    otherParticipant?.Display_Name ||
    otherParticipant?.displayName ||
    otherParticipant?.name ||
    otherParticipant?.Email ||
    otherParticipant?.email ||
    "Unknown User";
  const lastMsg = conversation.lastMessage || conversation.Last_Message;
  const lastMessageContent =
    typeof lastMsg === "object"
      ? lastMsg?.Message_Content || lastMsg?.content
      : lastMsg;

  const lastMessageSenderId =
    conversation.Last_Message_Sender_Id ||
    conversation.lastMessageSenderId ||
    (typeof lastMsg === "object"
      ? lastMsg?.Sender_ID || lastMsg?.Sender_Id || lastMsg?.senderId
      : null);
  const lastMessageSentByMe =
    lastMessageSenderId !== null &&
    Number(lastMessageSenderId) === Number(currentUserId);

  let lastMessageSenderName = null;
  if (typeof lastMsg === "object" && lastMsg) {
    lastMessageSenderName =
      lastMsg.Sender_Name ||
      lastMsg.senderName ||
      lastMsg.sender?.Display_Name ||
      lastMsg.sender?.displayName ||
      lastMsg.sender?.name ||
      null;
  }
  if (
    !lastMessageSenderName &&
    lastMessageSenderId &&
    !lastMessageSentByMe &&
    lastMessageContent
  ) {
    lastMessageSenderName = displayName?.split(" ")[0] || displayName;
  }

  const conversationId =
    conversation.Conversation_ID || conversation.Id || conversation.id;

  const otherUserTypeRaw =
    otherParticipant?.User_Type_Code ||
    otherParticipant?.User_Type ||
    otherParticipant?.userType ||
    "p";

  const otherUserType =
    otherUserTypeRaw?.length === 1
      ? otherUserTypeRaw.toLowerCase()
      : otherUserTypeRaw?.toLowerCase().startsWith("nurse")
      ? "n"
      : otherUserTypeRaw?.toLowerCase().startsWith("spec")
      ? "s"
      : otherUserTypeRaw?.toLowerCase().startsWith("patient")
      ? "p"
      : otherUserTypeRaw?.toLowerCase().startsWith("admin")
      ? "a"
      : "p";

  return {
    id: conversationId,
    name: displayName,
    type:
      conversation.Conversation_Type ||
      conversation.Type ||
      conversation.type ||
      "direct",
    lastMessage: lastMessageContent || "No messages yet",
    lastMessageSentByMe: lastMessageSentByMe,
    lastMessageSenderName: lastMessageSenderName,
    timestamp: formatMessageTime(
      conversation.Updated_At ||
        conversation.updatedAt ||
        conversation.createdAt
    ),
    unreadCount: conversation.unreadCount || 0,
    otherUserType: otherUserType,
    participants: participants.map((p) => {
      const pAvatar = p.avatar || p.Avatar || null;
      return {
        id: p.User_ID || p.User_Id || p.userId || p.id,
        name: p.Display_Name || p.displayName || p.name || p.Email || "Unknown",
        type: p.User_Type_Code || p.User_Type || p.userType || "p",
        avatar: pAvatar
          ? pAvatar.startsWith("http") || pAvatar.startsWith("blob:")
            ? pAvatar
            : `${API_BASE_URL}${pAvatar.startsWith("/") ? "" : "/"}${pAvatar}`
          : null,
      };
    }),
    avatar: otherParticipant?.avatar
      ? otherParticipant.avatar.startsWith("http") ||
        otherParticipant.avatar.startsWith("blob:")
        ? otherParticipant.avatar
        : `${API_BASE_URL}${
            otherParticipant.avatar.startsWith("/") ? "" : "/"
          }${otherParticipant.avatar}`
      : null,
    raw: conversation,
  };
}

export function transformMessageForUI(message, currentUserId, currentUserType) {
  const senderId =
    message.Sender_ID ||
    message.Sender_Id ||
    message.senderId ||
    message.sender?.id;
  const isSent = Number(senderId) === Number(currentUserId);

  const senderType =
    message.sender?.User_Type_Code ||
    message.Sender_Type ||
    message.sender?.userType ||
    message.sender?.User_Type ||
    "p";

  const normalizedSenderType =
    senderType?.length === 1
      ? senderType.toLowerCase()
      : senderType?.toLowerCase().startsWith("nurse")
      ? "n"
      : senderType?.toLowerCase().startsWith("spec")
      ? "s"
      : senderType?.toLowerCase().startsWith("patient")
      ? "p"
      : senderType?.toLowerCase().startsWith("admin")
      ? "a"
      : "p";

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const senderAvatar = getFullUrl(
    message.Sender_Avatar ||
      message.sender_avatar ||
      message.sender?.avatar ||
      message.sender?.Avatar ||
      message.sender?.Profile_Image ||
      null
  );
  const senderName =
    message.sender?.Display_Name ||
    message.Sender_Name ||
    message.sender?.displayName ||
    message.sender?.name ||
    message.senderName ||
    "Unknown";

  return {
    id: message.Message_ID || message.Id || message.id,
    text: message.Message_Content || message.content || "",
    timestamp: formatExactTime(message.Created_At || message.createdAt),
    rawTimestamp: message.Created_At || message.createdAt,
    isSent,
    sender: normalizedSenderType,
    senderId: senderId,
    senderName: senderName,
    avatar: senderAvatar,
    senderInfo: {
      id: senderId,
      name: senderName,
      type: normalizedSenderType,
      avatar: senderAvatar,
    },
    messageType: message.Message_Type || message.type || "text",
    fileUrl: getFullUrl(
      message.File_URL || message.File_Url || message.fileUrl
    ),
    fileName: message.File_Name || message.fileName || "Attached File",
    fileSize: message.File_Size || message.fileSize || null,
    replyTo: message.Reply_To_ID || message.replyToId || null,
    isDeleted: message.Is_Deleted || message.isDeleted || false,
    readBy: message.readBy || [],
    raw: message,
  };
}

export default {
  createConversation,
  getConversations,
  getConversationById,
  addParticipant,
  removeParticipant,
  leaveConversation,
  getMessages,
  sendMessage,
  uploadFile,
  deleteMessage,
  markAsRead,
  sendTypingIndicator,
  searchUsers,
  getAllChatUsers,
  isSocketConnected,
  authenticateSocket,
  resetSocketAuth,
  subscribeToConversation,
  unsubscribeFromConversation,
  setupChatSocketListeners,
  getUserTypeLabel,
  formatMessageTime,
  formatRelativeTime,
  formatExactTime,
  formatFileSize,
  isAllowedFileType,
  getMaxFileSize,
  transformConversationForUI,
  transformMessageForUI,
};
