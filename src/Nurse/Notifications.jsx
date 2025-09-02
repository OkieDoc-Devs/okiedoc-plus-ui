import "../App.css";
import "./NurseStyles.css";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications] = useState([
    {
      id: 1,
      type: "New Ticket",
      message: "New ticket T005 submitted by Alex Brown",
      time: "5 mins ago",
      unread: true,
    },
    {
      id: 2,
      type: "Payment Confirmation",
      message: "Payment confirmed for appointment #A123",
      time: "15 mins ago",
      unread: true,
    },
    {
      id: 3,
      type: "Chat Notification",
      message: "New message from Dr. Smith",
      time: "30 mins ago",
      unread: false,
    },
    {
      id: 4,
      type: "Upload Files",
      message: "Patient uploaded medical records",
      time: "1 hour ago",
      unread: false,
    },
    {
      id: 5,
      type: "HMO Notification",
      message: "HMO approval received for patient ID P001",
      time: "2 hours ago",
      unread: false,
    },
  ]);

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
          <img src={localStorage.getItem("nurse.profileImageDataUrl") || "/account.svg"} alt="Account" className="account-icon" />
          <span className="account-name">{localStorage.getItem("nurse.firstName") || "Nurse"}</span>
          <div className="account-dropdown">
            <button
              className="dropdown-item"
              onClick={() => navigate("/myaccount")}
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
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className="nav-tab"
            onClick={() => navigate("/manage-appointments")}
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
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${
                notification.unread ? "unread" : ""
              }`}
            >
              <div className="notification-type">{notification.type}</div>
              <div className="notification-content">
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
              {notification.unread && <div className="unread-indicator"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
