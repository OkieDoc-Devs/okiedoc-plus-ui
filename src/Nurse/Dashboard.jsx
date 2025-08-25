import "../App.css";
import "./NurseStyles.css";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("tickets");
  const navigate = useNavigate();

  // Dummy data for pending tickets
  const [pendingTickets] = useState([
    {
      id: "T001",
      patientName: "John Smith",
      issue: "Chest Pain",
      priority: "High",
      timeSubmitted: "2025-08-24 09:30 AM",
      status: "Pending Review",
    },
    {
      id: "T002",
      patientName: "Jane Doe",
      issue: "Migraine Headaches",
      priority: "Medium",
      timeSubmitted: "2025-08-24 10:20 AM",
      status: "Pending Review",
    },
    {
      id: "T003",
      patientName: "Mike Davis",
      issue: "Back Pain",
      priority: "Low",
      timeSubmitted: "2025-08-24 11:00 AM",
      status: "In Progress",
    },
    {
      id: "T004",
      patientName: "Emily Wilson",
      issue: "Skin Rash",
      priority: "Medium",
      timeSubmitted: "2025-08-24 11:45 AM",
      status: "Pending Review",
    },
  ]);

  // Dummy notifications
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

  const handleTicketAction = (ticketId, action) => {
    console.log(`${action} ticket ${ticketId}`);
    // Implement actual ticket function here
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#ff4444";
      case "Medium":
        return "#ffa500";
      case "Low":
        return "#4CAF50";
      default:
        return "#666";
    }
  };

  const handleTabClick = (tab) => {
    if (tab === "notifications") {
      navigate("/notifications");
    } else if (tab === "schedule") {
      navigate("/create-schedule");
    } else {
      setActiveTab(tab);
    }
  };

  const handleLogout = () => {
    // Add any logout logic here (clear tokens, etc.)
    navigate("/");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-center">
          <img
            src="/okie-doc-logo.png"
            alt="Okie-Doc+"
            className="logo-image"
          />
        </div>
        <h3 className="dashboard-title">Nurse Dashboard</h3>
        <div className="user-account">
          <img src="/account.svg" alt="Account" className="account-icon" />
          <span className="account-name">Nurse</span>
          <div className="account-dropdown">
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
            className={`nav-tab ${activeTab === "tickets" ? "active" : ""}`}
            onClick={() => handleTabClick("tickets")}
          >
            Pending Tickets
          </button>
          <button
            className={`nav-tab`}
            onClick={() => handleTabClick("schedule")}
          >
            Create Schedule
          </button>
          <button
            className={`nav-tab`}
            onClick={() => handleTabClick("notifications")}
          >
            Notifications ({notifications.filter((n) => n.unread).length})
          </button>
        </div>
      </div>

      {activeTab === "tickets" && (
        <div className="tickets-section">
          <div className="tickets-carousel">
            {pendingTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <span className="ticket-id">{ticket.id}</span>
                  <span
                    className="ticket-priority"
                    style={{
                      color: getPriorityColor(ticket.priority),
                    }}
                  >
                    {ticket.priority} Priority
                  </span>
                </div>
                <div className="ticket-details">
                  <h4>{ticket.patientName}</h4>
                  <p>
                    <strong>Issue:</strong> {ticket.issue}
                  </p>
                  <p>
                    <strong>Submitted:</strong> {ticket.timeSubmitted}
                  </p>
                  <p>
                    <strong>Status:</strong> {ticket.status}
                  </p>
                </div>
                <div className="ticket-actions">
                  <button
                    className="action-btn review"
                    onClick={() => handleTicketAction(ticket.id, "review")}
                  >
                    Review
                  </button>
                  <button
                    className="action-btn assign"
                    onClick={() => handleTicketAction(ticket.id, "assign")}
                  >
                    Assign
                  </button>
                  <button
                    className="action-btn close"
                    onClick={() => handleTicketAction(ticket.id, "close")}
                  >
                    Close
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
