import "../App.css";
import "./NurseStyles.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://your-production-url.com"
      : "http://localhost:1337";

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        console.log("Loading notifications from API...");

        const response = await fetch(
          `${API_BASE_URL}/api/nurse/notifications`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setNotifications(data.data || []);
          setError(null);
          console.log("Notifications loaded successfully:", data.data);
        } else {
          throw new Error(data.message || "Failed to load notifications");
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
        setError(error.message);

        const fallbackNotifications = [
          {
            id: 1,
            type: "New Ticket",
            message: "New ticket T005 submitted by Alex Brown",
            timeRelative: "5 mins ago",
            unread: true,
          },
          {
            id: 2,
            type: "Payment Confirmation",
            message: "Payment confirmed for appointment #A123",
            timeRelative: "15 mins ago",
            unread: true,
          },
          {
            id: 3,
            type: "Chat Notification",
            message: "New message from Dr. Smith",
            timeRelative: "30 mins ago",
            unread: false,
          },
          {
            id: 4,
            type: "Upload Files",
            message: "Patient uploaded medical records",
            timeRelative: "1 hour ago",
            unread: false,
          },
          {
            id: 5,
            type: "HMO Notification",
            message: "HMO approval received for patient ID P001",
            timeRelative: "2 hours ago",
            unread: false,
          },
        ];

        setNotifications(fallbackNotifications);
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
      const response = await fetch(
        `${API_BASE_URL}/api/nurse/notifications/${notificationId}/read`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
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
            src={
              localStorage.getItem("nurse.profileImageDataUrl") ||
              "/account.svg"
            }
            alt="Account"
            className="account-icon"
          />
          <span className="account-name">
            {localStorage.getItem("nurse.firstName") || "Nurse"}
          </span>
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
