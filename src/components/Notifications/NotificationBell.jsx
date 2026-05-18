import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import './NotificationBell.css';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);

    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return (
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ' ' +
      date.toLocaleDateString()
    );
  };

  return (
    <div className='notification-bell-container' ref={dropdownRef}>
      <button
        className='notification-btn'
        onClick={() => setIsOpen(!isOpen)}
        title='Notifications'
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className='notification-badge'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='notification-dropdown'>
          <div className='notification-header'>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className='mark-all-read-btn'
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
              >
                <FaCheckDouble /> Mark all as read
              </button>
            )}
          </div>

          <div className='notification-list'>
            {notifications.length === 0 ? (
              <div className='no-notifications'>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className='notification-content'>
                    <div className='notification-title'>{notif.title}</div>
                    <div className='notification-message'>{notif.message}</div>
                    <div className='notification-time'>
                      {formatTime(notif.createdAt)}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <button
                      className='mark-read-btn'
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      }}
                      title='Mark as read'
                    >
                      <FaCheck />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
