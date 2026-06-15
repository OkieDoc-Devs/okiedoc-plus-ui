import React, { useState, useEffect, useRef } from 'react';
import {
  FaComments,
  FaTimes,
  FaFileAlt,
  FaPaperclip,
  FaPhone,
  FaVideo,
  FaSearch,
  FaSpinner,
} from 'react-icons/fa';
import Avatar from '../../components/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../Nurse/services/useChat.js';
import {
  isAllowedFileType,
  getMaxFileSize,
  formatFileSize,
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
  const chatMessagesRef = useRef(null);
  const chatBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUserId = user?.id || null;

  const {
    conversations,
    activeConversation,
    messages: chatMessagesData,
    loading: chatLoading,
    error: chatError,
    typingUsers,
    openConversation,
    closeConversation,
    sendMessage: sendChatMessage,
    uploadFile: uploadChatFile,
    handleTyping,
    loadConversations,
    isCallActive,
    activeCallHost,
  } = useChat({ currentUserId, currentUserType: 'p' });

  const messages = Array.isArray(chatMessagesData) ? chatMessagesData : (chatMessagesData?.messages || []);

  const CHARACTER_LIMIT = 500;

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

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
      const convId = activeConversation.id || activeConversation.ticket?.id;
      if (!convId) {
        throw new Error('No active conversation ID found');
      }

      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          await uploadChatFile(convId, file, newMessage.trim());
        }
        setUploadedFiles([]);
        setNewMessage('');
      } else {
        await sendChatMessage(newMessage.trim());
        setNewMessage('');
      }
      
      // Auto-refresh chat window
      const scrollTimeout = setTimeout(() => {
        if (chatBottomRef.current) {
          chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

      // In ticket-based chat, useChat's sendChatMessage already updates messages state
      // but we call loadConversations to update the sidebar preview
      await loadConversations();

      return () => clearTimeout(scrollTimeout);
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

  const filteredConversations = conversations.filter(conv => {
    const name = (conv.name || '').toLowerCase();
    const ticketNumber = (conv.ticketNumber || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || ticketNumber.includes(query);
  });

  return (
    <div className="patient-messages-container">
      <div className="patient-messenger-layout">
        <aside className="patient-conversations-sidebar">
          <div className="patient-conversations-header">
            <div className="patient-conversations-title">
              <span>Messages</span>
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
                const isActive = activeConversation?.id === conv.id;
                const isUnread = conv.unreadCount > 0;

                // For ticket-based chats, the name is already the formatted name from backend
                const displayName = conv.name || conv.ticketNumber || 'Consultation';

                return (
                  <div 
                    key={conv.id} 
                    className={`patient-conversation-item ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                    onClick={() => openConversation(conv)}
                  >
                    <Avatar 
                      firstName={displayName}
                      size={48}
                    />
                    <div className="patient-conversation-info">
                      <div className="patient-conversation-top">
                        <span className="patient-conversation-name">
                          {displayName}
                        </span>
                        {conv.rawCreatedAt && (
                          <span className="patient-conversation-time">
                            {new Date(conv.rawCreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="patient-conversation-last-msg">
                        {conv.lastMessage || 'No messages yet'}
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
                    firstName={activeConversation.participants?.find(p => p.id !== currentUserId)?.firstName || activeConversation.role} 
                    lastName={activeConversation.participants?.find(p => p.id !== currentUserId)?.lastName}
                    size={40}
                  />
                  <div className="patient-chat-header-text">
                    <span className="patient-chat-name">
                      {activeConversation.name || (activeConversation.participants?.find(p => p.id !== currentUserId) ? `${activeConversation.participants.find(p => p.id !== currentUserId).firstName} ${activeConversation.participants.find(p => p.id !== currentUserId).lastName}` : activeConversation.role)}
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
                  const isMe = Number(msg.senderId || msg.sender?.id) === Number(currentUserId);
                  const sender = msg.sender || activeConversation.participants?.find(p => p.id === msg.senderId) || { firstName: (activeConversation.role || 'U'), lastName: '' };
                  
                  return (
                    <div key={msg.id || index} className={`patient-message-row ${isMe ? 'sent' : 'received'}`}>
                      {!isMe && (
                        <Avatar 
                          profileImageUrl={sender.profilePictureUrl} 
                          firstName={sender.firstName || sender.name?.split(' ')[0] || sender.fullName?.split(' ')[0]} 
                          lastName={sender.lastName || sender.name?.split(' ')[1] || sender.fullName?.split(' ')[1]}
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
                        {!isMe && (
                          <span className="patient-message-sender-name" style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px', color: '#4aa7ed', opacity: 0.8 }}>
                            {sender.fullName || sender.name || `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || activeConversation.role}
                          </span>
                        )}
                        {(msg.content || msg.text) && <p className="patient-message-text">{msg.content || msg.text}</p>}
                        <span className="patient-message-time">
                          {msg.createdAt && !isNaN(new Date(msg.createdAt).getTime()) 
                            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
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
            </div>
          )}
        </main>
      </div>

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

