import '../App.css';
import './NurseStyles.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Avatar from '../components/Avatar';
import {
  getNurseFirstName,
  getNurseProfileImage,
} from './services/storageService.js';
import { useNotification } from '../contexts/NotificationContext';
import NotificationBell from '../components/Notifications/NotificationBell';
import { useAuth } from '../contexts/AuthContext';

export default function Notifications() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { notifications, unreadCount, markAsRead, refreshNotifications } =
    useNotification();
  const [loading, setLoading] = useState(false);
  const [error] = useState(null);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/');
  };

  return (
    <div className='dashboard'>
      <div className='dashboard-header'>
        <img src='/okie-doc-logo.png' alt='Okie-Doc+' className='logo-image' />
        <h2 className='dashboard-title'>Notifications</h2>
        <div className='nurse-header-actions'>
          <NotificationBell />
          <div className='user-account'>
            <Avatar
              profileImageUrl={getNurseProfileImage() !== '/account.svg' ? getNurseProfileImage() : null}
              firstName={getNurseFirstName()}
              lastName={localStorage.getItem('nurse.lastName') || ''}
              userType='nurse'
              size={40}
              alt='Account'
              className='account-icon'
            />
            <span className='account-name'>{getNurseFirstName()}</span>
            <div className='account-dropdown'>
              <button
                className='dropdown-item'
                onClick={() => navigate('/nurse-myaccount')}
              >
                My Account
              </button>
              <button
                className='dropdown-item logout-item'
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className='dashboard-nav'>
          <button
            className='nav-tab'
            onClick={() => navigate('/nurse-dashboard')}
          >
            Dashboard
          </button>
          <button
            className='nav-tab'
            onClick={() => navigate('/nurse-manage-appointments')}
          >
            Manage Appointments
          </button>
          <button
            className='nav-tab'
            onClick={() => navigate('/nurse-messages')}
          >
            Messages
          </button>
        </div>
        <div className='notification-summary'>
          <span className='unread-count'>
            {unreadCount} unread notifications
          </span>
        </div>
      </div>

      <div className='notifications-section'>
        {loading && (
          <div className='loading-message'>Loading notifications...</div>
        )}

        {error && (
          <div className='error-banner'>
            <p>⚠️ Using offline data. API Error: {error}</p>
          </div>
        )}

        <div className='notifications-list'>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${
                !notification.isRead ? 'unread' : ''
              }`}
              onClick={() =>
                !notification.isRead && markAsRead(notification.id)
              }
              style={{ cursor: !notification.isRead ? 'pointer' : 'default' }}
            >
              <div className='notification-type'>{notification.type}</div>
              <div className='notification-content'>
                <p>{notification.message}</p>
                <span className='notification-time'>
                  {notification.timeRelative ||
                    (notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString()
                      : '')}
                </span>
              </div>
              {!notification.isRead && <div className='unread-indicator'></div>}
            </div>
          ))}

          {notifications.length === 0 && !loading && (
            <div className='empty-state'>
              <p>No notifications available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
