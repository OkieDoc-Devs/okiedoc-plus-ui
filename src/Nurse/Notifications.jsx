import "../App.css";
import "./NurseStyles.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  getNurseFirstName,
  getNurseProfileImage,
} from "./services/storageService.js";
import {
  fetchNotificationsFromAPI,
  markNotificationAsRead,
} from "./services/apiService.js";
import { getFallbackNotifications } from "./services/notificationService.js";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        console.log("Loading notifications from API...");

        const notificationsArray = await fetchNotificationsFromAPI();
        setNotifications(notificationsArray);
        setError(null);
        console.log("Notifications loaded successfully:", notificationsArray);
      } catch (error) {
        console.error("Error loading notifications:", error);
        setError(error.message);
        setNotifications(getFallbackNotifications());
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const success = await markNotificationAsRead(notificationId);

      if (success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, unread: false } : notif
          )
        );
        console.log(`Notification ${notificationId} marked as read`);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, unread: false } : notif
        )
      );
    }
  };

  const handleTabClick = (tab) => {
    if (tab === "notifications") {
      // Already on notifications page
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <img src="/okie-doc-logo.png" alt="Okie-Doc+" className="logo-image" />
        <h2 className="dashboard-title">Notifications</h2>
        <div className="user-account">
          <img
            src={getNurseProfileImage()}
            alt="Account"
            className="account-icon"
          />
          <span className="account-name">{getNurseFirstName()}</span>
          <div className="account-dropdown">
            <button
              className="dropdown-item"
              onClick={() => navigate("/nurse-myaccount")}
            >
              My Account
            </button>
            <button
              className="dropdown-item logout-item"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-nav">
          <button
            className="nav-tab"
            onClick={() => navigate("/nurse-dashboard")}
          >
            Dashboard
          </button>
          <button
            className="nav-tab"
            onClick={() => navigate("/nurse-manage-appointments")}
          >
            Manage Appointments
          </button>
          <button
            className="nav-tab active"
            onClick={() => handleTabClick("notifications")}
          >
            Notifications ({notifications.filter((n) => n.unread).length})
          </button>
        </div>
        <div className="notification-summary">
          <span className="unread-count">
            {notifications.filter((n) => n.unread).length} unread notifications
          </span>
        </div>
      </div>

      <div className="notifications-section">
        {loading && (
          <div className="loading-message">Loading notifications...</div>
        )}

        {error && (
          <div className="error-banner">
            <p>⚠️ Using offline data. API Error: {error}</p>
          </div>
        )}

        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${
                notification.unread ? "unread" : ""
              }`}
              onClick={() => notification.unread && markAsRead(notification.id)}
              style={{ cursor: notification.unread ? "pointer" : "default" }}
            >
              <div className="notification-type">{notification.type}</div>
              <div className="notification-content">
                <p>{notification.message}</p>
                <span className="notification-time">
                  {notification.timeRelative || notification.time}
                </span>
              </div>
              {notification.unread && <div className="unread-indicator"></div>}
            </div>
          ))}

          {notifications.length === 0 && !loading && (
            <div className="empty-state">
              <p>No notifications available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
