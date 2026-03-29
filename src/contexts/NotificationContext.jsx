import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import socketClient, { connectSocket } from '../utils/socketClient';
import { apiRequest } from '../api/apiClient';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiRequest('/api/v1/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('[Notifications] Error fetching notifications:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setSocketConnected(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications();

    connectSocket();

    const handleConnect = () => {
      setSocketConnected(true);
      /* console.log(
        '[Notifications] Socket connected and auto-joined to room via afterConnect',
      ); */
      fetchNotifications();
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
      // console.log('[Notifications] Socket disconnected');
    };

    const handleReconnect = () => {
      setSocketConnected(true);
      /* console.log(
        '[Notifications] Socket reconnected — re-fetching notifications',
      ); */
      fetchNotifications();
    };

    const handleNotification = (msg) => {
      // console.log('[Notifications] Received real-time notification:', msg);
      const notif = msg?.notification || msg;
      if (notif && notif.id) {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    };

    socketClient.on('connect', handleConnect);
    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('reconnect', handleReconnect);
    socketClient.on('notification', handleNotification);

    if (socketClient.connected) {
      setSocketConnected(true);
    }

    return () => {
      socketClient.off('connect', handleConnect);
      socketClient.off('disconnect', handleDisconnect);
      socketClient.off('reconnect', handleReconnect);
      socketClient.off('notification', handleNotification);
    };
  }, [fetchNotifications, isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error(
        '[Notifications] Error marking notification as read:',
        error,
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest('/api/v1/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error(
        '[Notifications] Error marking all notifications as read:',
        error,
      );
    }
  };

  const value = {
    notifications,
    unreadCount,
    socketConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
