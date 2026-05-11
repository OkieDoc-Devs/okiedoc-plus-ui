import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaComments,
  FaTimes,
  FaFileAlt,
  FaPaperclip,
  FaPhone,
  FaVideo,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaUser,
} from 'react-icons/fa';
import Avatar from '../../components/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../Nurse/services/useChat.js';
import {
  isAllowedFileType,
  getMaxFileSize,
  formatFileSize,
  getUserTypeLabel,
} from '../../Nurse/services/chatService.js';
import JitsiMeetCall from '../../components/VideoCall/JitsiMeetCall.jsx';
import '../css/Patient_Messages.css';

const Patient_Messages = ({ setActive }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const chatMessagesRef = useRef(null);
  const chatBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUserId = user?.id || null;

  const {
    conversations,
    activeConversation,
    messages,
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
    isCallActive,
    activeCallHost,
  } = useChat({ currentUserId, currentUserType: 'p' });

  const CHARACTER_LIMIT = 500;

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  const handleUserSearch = useCallback(
    async (query) => {
      setIsSearchingUsers(true);
      try {
        if (!query.trim()) {
          const results = await getAllUsers();
          setUserSearchResults(results || []);
        } else {
          const results = await searchUsers(query);
          setUserSearchResults(results || []);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setUserSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    },
    [searchUsers, getAllUsers],
  );

  useEffect(() => {
    if (showNewChatModal) {
      handleUserSearch('');
    }
  }, [showNewChatModal, handleUserSearch]);

  useEffect(() => {
    if (!showNewChatModal) return;
    const timer = setTimeout(() => {
      handleUserSearch(userSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery, handleUserSearch, showNewChatModal]);

  const handleMessageChange = (e) => {
    const text = e.target.value;
    if (text.length <= CHARACTER_LIMIT) {
      setNewMessage(text);
      handleTyping(activeConversation?.id);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && uploadedFiles.length === 0) || isSendingMessage || !activeConversation) return;

    setIsSendingMessage(true);
    try {
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          await uploadChatFile(activeConversation.id, file, { caption: newMessage.trim() });
        }
        setUploadedFiles([]);
        setNewMessage('');
      } else {
        await sendChatMessage(activeConversation.id, newMessage.trim());
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (!isAllowedFileType(file.type)) {
        alert(`File type ${file.type} is not allowed.`);
        return false;
      }
      if (file.size > getMaxFileSize()) {
        alert(`File ${file.name} is too large. Max size is ${formatFileSize(getMaxFileSize())}`);
        return false;
      }
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartNewChat = async (userId) => {
    try {
      await startConversation('direct', userId);
      setShowNewChatModal(false);
      setUserSearchQuery('');
      setUserSearchResults([]);
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants?.find(p => p.id !== currentUserId);
    const name = `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="patient-messages-container">
      <div className="patient-messenger-layout">
        <aside className="patient-conversations-sidebar">
          <div className="patient-conversations-header">
            <div className="patient-conversations-title">
              <span>Messages</span>
              <button 
                className="patient-new-chat-btn"
                onClick={() => setShowNewChatModal(true)}
              >
                <FaPlus />
              </button>
            </div>
            <div className="patient-conversations-search">
              <FaSearch className="patient-search-icon" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="patient-search-input"
              />
            </div>
          </div>

          <div className="patient-conversations-list">
            {chatLoading && conversations.length === 0 ? (
              <div className="patient-chat-loading"><FaSpinner className="fa-spin" /></div>
            ) : filteredConversations.length === 0 ? (
              <div className="patient-no-conversations">No conversations found</div>
            ) : (
              filteredConversations.map(conv => {
                const otherUser = conv.participants?.find(p => p.id !== currentUserId);
                const isActive = activeConversation?.id === conv.id;
                const isUnread = conv.unreadCount > 0;

                return (
                  <div 
                    key={conv.id} 
                    className={`patient-conversation-item ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                    onClick={() => openConversation(conv)}
                  >
                    <Avatar 
                      profileImageUrl={otherUser?.profilePictureUrl} 
                      firstName={otherUser?.firstName} 
                      lastName={otherUser?.lastName}
                      size={48}
                    />
                    <div className="patient-conversation-info">
                      <div className="patient-conversation-top">
                        <span className="patient-conversation-name">
                          {otherUser?.firstName} {otherUser?.lastName}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="patient-conversation-time">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="patient-conversation-last-msg">
                        {conv.lastMessage?.content || (conv.lastMessage?.hasAttachments ? 'Sent an attachment' : 'No messages yet')}
                      </p>
                    </div>
                    {isUnread && <div className="patient-unread-badge">{conv.unreadCount}</div>}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <main className="patient-chat-window">
          {activeConversation ? (
            <>
              <div className="patient-chat-header">
                <div className="patient-chat-header-info">
                  <button className="patient-mobile-back" onClick={closeConversation}>
                    <FaTimes />
                  </button>
                  <Avatar 
                    profileImageUrl={activeConversation.participants?.find(p => p.id !== currentUserId)?.profilePictureUrl} 
                    firstName={activeConversation.participants?.find(p => p.id !== currentUserId)?.firstName} 
                    lastName={activeConversation.participants?.find(p => p.id !== currentUserId)?.lastName}
                    size={40}
                  />
                  <div className="patient-chat-header-text">
                    <span className="patient-chat-name">
                      {activeConversation.participants?.find(p => p.id !== currentUserId)?.firstName} {activeConversation.participants?.find(p => p.id !== currentUserId)?.lastName}
                    </span>
                    <span className="patient-chat-status">
                      {typingUsers.includes(activeConversation.participants?.find(p => p.id !== currentUserId)?.id) ? 'Typing...' : 'Online'}
                    </span>
                  </div>
                </div>
                <div className="patient-chat-actions">
                  <button className="patient-action-btn" onClick={() => { setShowVideoCall(true); setIsVideoCall(false); }}>
                    <FaPhone />
                  </button>
                  <button className="patient-action-btn" onClick={() => { setShowVideoCall(true); setIsVideoCall(true); }}>
                    <FaVideo />
                  </button>
                </div>
              </div>

              <div className="patient-chat-messages" ref={chatMessagesRef}>
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id || index} className={`patient-message-row ${isMe ? 'sent' : 'received'}`}>
                      {!isMe && (
                        <Avatar 
                          profileImageUrl={activeConversation.participants?.find(p => p.id === msg.senderId)?.profilePictureUrl} 
                          firstName={activeConversation.participants?.find(p => p.id === msg.senderId)?.firstName} 
                          lastName={activeConversation.participants?.find(p => p.id === msg.senderId)?.lastName}
                          size={32}
                        />
                      )}
                      <div className="patient-message-bubble">
                        {msg.attachments?.map((att, i) => (
                          <div key={i} className="patient-message-attachment">
                            {att.type?.startsWith('image/') ? (
                              <img src={att.url} alt="attachment" className="patient-att-img" />
                            ) : (
                              <div className="patient-att-file">
                                <FaFileAlt />
                                <span>{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {msg.content && <p className="patient-message-text">{msg.content}</p>}
                        <span className="patient-message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              <form className="patient-chat-input-area" onSubmit={handleSendMessage}>
                {uploadedFiles.length > 0 && (
                  <div className="patient-upload-preview">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="patient-preview-item">
                        <span>{file.name}</span>
                        <button type="button" onClick={() => removeFile(i)}><FaTimes /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="patient-input-wrapper">
                  <button type="button" className="patient-attach-btn" onClick={() => fileInputRef.current?.click()}>
                    <FaPaperclip />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    multiple 
                    onChange={handleFileSelect}
                  />
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={handleMessageChange}
                  />
                  <button type="submit" className="patient-send-btn" disabled={(!newMessage.trim() && uploadedFiles.length === 0) || isSendingMessage}>
                    {isSendingMessage ? <FaSpinner className="fa-spin" /> : 'Send'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="patient-no-active-chat">
              <FaComments size={64} />
              <h3>Your Messages</h3>
              <p>Select a conversation to start chatting</p>
              <button className="primary-button" onClick={() => setShowNewChatModal(true)}>New Chat</button>
            </div>
          )}
        </main>
      </div>

      {showNewChatModal && (
        <div className="patient-modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="patient-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="patient-modal-header">
              <h3>Start New Conversation</h3>
              <button className="patient-modal-close" onClick={() => setShowNewChatModal(false)}><FaTimes /></button>
            </div>
            <div className="patient-modal-body">
              <div className="patient-user-search">
                <FaSearch className="patient-search-icon" />
                <input 
                  type="text" 
                  placeholder="Search users by name..." 
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="patient-user-search-input"
                />
              </div>
              <div className="patient-user-results">
                {isSearchingUsers ? (
                  <div className="patient-searching">
                    <FaSpinner className="fa-spin" />
                    <span>Searching...</span>
                  </div>
                ) : userSearchResults.length > 0 ? (
                  userSearchResults.map(u => (
                    <div key={u.Id || u.id} className="patient-user-result-item" onClick={() => handleStartNewChat(u.Id || u.id)}>
                      <div className="patient-user-avatar">
                        <FaUser />
                      </div>
                      <div className="patient-user-info">
                        <span className="patient-user-name">{u.Display_Name || u.name || u.Email}</span>
                        <span className="patient-user-type">{u.User_Type || getUserTypeLabel(u.User_Type_Code || u.userType || u.type)}</span>
                      </div>
                    </div>
                  ))
                ) : userSearchQuery ? (
                  <div className="patient-no-users">
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="patient-search-hint">
                    <p>Type a name to search for users</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showVideoCall && (
        <JitsiMeetCall
          roomName={activeConversation?.id}
          userName={`${user?.firstName} ${user?.lastName}`}
          isVideo={isVideoCall}
          onClose={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
};

export default Patient_Messages;

