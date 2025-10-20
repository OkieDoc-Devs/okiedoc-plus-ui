import "../App.css";
import "./NurseStyles.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  getNurseId,
  getNurseFirstName,
  getNurseProfileImage,
  loadTickets,
  saveTickets,
} from "./services/storageService.js";
import { buildGoogleCalendarUrl } from "./services/calendarService.js";
import { getFallbackTickets } from "./services/ticketService.js";
import {
  fetchTicketsFromAPI,
  fetchNotificationsFromAPI,
  fetchDashboardFromAPI,
} from "./services/apiService.js";

export default function Dashboard() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  const handleTabClick = (tab) => {
    if (tab === "notifications") {
      navigate("/nurse-notifications");
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  const [tickets, setTickets] = useState(() => {
    const loadedTickets = loadTickets();
    // If no tickets in localStorage, use fallback data
    if (!loadedTickets || loadedTickets.length === 0) {
      const fallbackTickets = getFallbackTickets();
      saveTickets(fallbackTickets);
      return fallbackTickets;
    }
    return loadedTickets;
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Try to fetch from dashboard API first (includes both tickets and notifications)
        const dashboardData = await fetchDashboardFromAPI();
        if (dashboardData) {
          // Update tickets
          if (dashboardData.tickets && dashboardData.tickets.length > 0) {
            setTickets(dashboardData.tickets);
            saveTickets(dashboardData.tickets);
          }
          // Update notifications
          if (dashboardData.notifications) {
            setNotifications(dashboardData.notifications);
          }
          return;
        }
      } catch (error) {
        console.log(
          "Dashboard API not available, trying individual endpoints:",
          error.message
        );

        // Fallback to individual API calls
        try {
          const apiTickets = await fetchTicketsFromAPI();
          if (apiTickets && apiTickets.length > 0) {
            setTickets(apiTickets);
            saveTickets(apiTickets);
          }
        } catch (ticketError) {
          console.log("Tickets API not available:", ticketError.message);
        }

        try {
          const apiNotifications = await fetchNotificationsFromAPI();
          if (apiNotifications && apiNotifications.length > 0) {
            setNotifications(apiNotifications);
          }
        } catch (notifError) {
          console.log("Notifications API not available:", notifError.message);
        }
      }

      // Final fallback to localStorage or demo data if tickets not loaded
      if (tickets.length === 0) {
        let loadedTickets = loadTickets();
        if (!loadedTickets || loadedTickets.length === 0) {
          loadedTickets = getFallbackTickets();
          saveTickets(loadedTickets);
        }
        setTickets(loadedTickets);
      }
    };

    loadDashboardData();

    const onVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Dashboard: Page became visible, reloading data");
        loadDashboardData();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nurseId = getNurseId();

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
            className={`nav-tab active`}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-tab`}
            onClick={() => navigate("/nurse-manage-appointments")}
          >
            Manage Appointments
          </button>
          <button
            className={`nav-tab`}
            onClick={() => handleTabClick("notifications")}
          >
            Notifications ({notifications.filter((n) => n.unread).length})
          </button>
        </div>
      </div>

      <div className="appointments-section">
        <div className="processing-tickets">
          <h2>All Tickets ({tickets.length})</h2>
          {tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card processing">
              <div className="ticket-header">
                <h3>{ticket.patientName}</h3>
                <span
                  className="status-badge"
                  style={{
                    backgroundColor:
                      ticket.status === "Confirmed"
                        ? "#4caf50"
                        : ticket.status === "Pending"
                        ? "#ff9800"
                        : "#2196f3",
                  }}
                >
                  {ticket.status}
                </span>
              </div>
              <div className="ticket-content">
                <p>
                  <strong>Email:</strong> {ticket.email}
                </p>
                <p>
                  <strong>Mobile:</strong> {ticket.mobile}
                </p>
                <p>
                  <strong>Chief Complaint:</strong> {ticket.chiefComplaint}
                </p>
                <p>
                  <strong>Preferred Date:</strong> {ticket.preferredDate}
                </p>
                <p>
                  <strong>Preferred Time:</strong> {ticket.preferredTime}
                </p>
                <p>
                  <strong>Specialist:</strong> {ticket.preferredSpecialist}
                </p>
              </div>
              <div className="ticket-actions">
                {ticket.status === "Pending" && (
                  <button
                    className="action-btn edit"
                    style={{
                      background: "#4caf50",
                      color: "#fff",
                    }}
                    onClick={() => {
                      setTickets((prev) => {
                        const updated = prev.map((t) =>
                          t.id === ticket.id
                            ? { ...t, status: "Confirmed", claimedBy: nurseId }
                            : t
                        );
                        saveTickets(updated);
                        return updated;
                      });
                    }}
                  >
                    Confirm Ticket
                  </button>
                )}
                {ticket.status === "Confirmed" && (
                  <a
                    href={buildGoogleCalendarUrl(ticket)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn edit"
                  >
                    Create Schedule (Google Calendar)
                  </a>
                )}
                <button
                  className="action-btn remove"
                  style={{
                    marginLeft: 8,
                    background: "#f44336",
                    color: "#fff",
                  }}
                  onClick={() => {
                    setTickets((prev) => {
                      const updated = prev.filter((t) => t.id !== ticket.id);
                      saveTickets(updated);
                      return updated;
                    });
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="empty-state">
              <p>No tickets available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
