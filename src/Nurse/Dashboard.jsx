import "../App.css";
import "./NurseStyles.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  getNurseFirstName,
  getNurseProfileImage,
} from "./services/storageService.js";
import {
  fetchTicketsFromAPI,
  fetchNotificationsFromAPI,
  fetchDashboardFromAPI,
  fetchNurseProfile,
  logoutFromAPI,
} from "./services/apiService.js";
import { transformProfileFromAPI } from "./services/profileService.js";

export default function Dashboard() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [nurseName, setNurseName] = useState(getNurseFirstName());

  const handleTabClick = (tab) => {
    if (tab === "notifications") {
      navigate("/nurse-notifications");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutFromAPI();
    } catch (error) {
      console.error("Logout error:", error);
    }
    navigate("/");
  };

  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      console.log(
        "Dashboard: Starting to load dashboard data for logged-in nurse..."
      );

      try {
        console.log("Dashboard: Fetching nurse profile...");
        const nurse = await fetchNurseProfile();
        const profileData = transformProfileFromAPI(nurse);

        if (profileData.firstName) {
          setNurseName(profileData.firstName);
          localStorage.setItem("nurse.firstName", profileData.firstName);
          console.log(
            "Dashboard: Updated nurse name to:",
            profileData.firstName
          );
        }
      } catch (profileError) {
        console.log(
          "Dashboard: Could not fetch nurse profile:",
          profileError.message
        );
      }

      try {
        console.log("Dashboard: Fetching from dashboard API...");
        const dashboardData = await fetchDashboardFromAPI();
        console.log("Dashboard: Dashboard API response:", dashboardData);
        if (dashboardData) {
          if (dashboardData.tickets && Array.isArray(dashboardData.tickets)) {
            console.log(
              "Dashboard: Received tickets from dashboard API:",
              dashboardData.tickets.length,
              "tickets"
            );
            setTickets(dashboardData.tickets);
          } else {
            console.log("Dashboard: No tickets in dashboard response");
            setTickets([]);
          }
          if (
            dashboardData.notifications &&
            Array.isArray(dashboardData.notifications) &&
            dashboardData.notifications.length > 0
          ) {
            console.log(
              "Dashboard: Received notifications from dashboard API:",
              dashboardData.notifications.length,
              "notifications"
            );
            console.log(
              "Dashboard: Notification IDs:",
              dashboardData.notifications.map((n) => n.id)
            );
            console.log(
              "Dashboard: Unread count:",
              dashboardData.notifications.filter((n) => n.unread).length
            );
            setNotifications(dashboardData.notifications);
          } else {
            console.log(
              "Dashboard: No notifications in dashboard response, setting to empty"
            );
            setNotifications([]);
          }
          return;
        } else {
          // Dashboard data is empty/null, set defaults
          console.log("Dashboard: Empty dashboard response, setting defaults");
          setTickets([]);
          setNotifications([]);
          return;
        }
      } catch (error) {
        console.log(
          "Dashboard API not available, trying individual endpoints:",
          error.message
        );

        try {
          console.log("Dashboard: Fetching tickets from individual API...");
          const apiTickets = await fetchTicketsFromAPI();
          console.log("Dashboard: Tickets API response:", apiTickets);
          if (apiTickets && apiTickets.length > 0) {
            console.log(
              "Dashboard: Received tickets from API:",
              apiTickets.length,
              "tickets"
            );
            setTickets(apiTickets);
          } else {
            console.log("Dashboard: No tickets received from API");
            setTickets([]);
          }
        } catch (ticketError) {
          console.error("Dashboard: Tickets API error:", ticketError.message);
          setTickets([]);
        }

        try {
          const apiNotifications = await fetchNotificationsFromAPI();
          console.log(
            "Dashboard: Notifications from individual API:",
            apiNotifications
          );
          if (
            apiNotifications &&
            Array.isArray(apiNotifications) &&
            apiNotifications.length > 0
          ) {
            console.log(
              "Dashboard: Notification count from individual API:",
              apiNotifications.length
            );
            console.log(
              "Dashboard: Notification IDs:",
              apiNotifications.map((n) => n.id)
            );
            console.log(
              "Dashboard: Unread count:",
              apiNotifications.filter((n) => n.unread).length
            );
            setNotifications(apiNotifications);
          } else {
            console.log(
              "Dashboard: No notifications from individual API, setting to empty"
            );
            setNotifications([]);
          }
        } catch (notifError) {
          console.error(
            "Dashboard: Notifications API error:",
            notifError.message
          );
          setNotifications([]);
        }
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
  }, []);

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
          <span className="account-name">{nurseName}</span>
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
            onClick={() => navigate("/nurse-messages")}
          >
            Messages
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
            <div key={ticket.id} className="ticket-card-new">
              <div className="ticket-card-header">
                <span className="ticket-number">TICKET #{ticket.id}</span>
              </div>

              <div className="ticket-card-body">
                <div className="ticket-left-section">
                  <div className="ticket-patient-details">
                    <h4 className="ticket-section-title">PATIENT DETAILS</h4>
                    <div className="ticket-details-grid">
                      <div className="ticket-details-col">
                        <p>
                          <strong>Name:</strong> {ticket.patientName}
                        </p>
                        <p>
                          <strong>Age:</strong> {ticket.age}
                        </p>
                        <p>
                          <strong>Birthdate:</strong> {ticket.birthdate}
                        </p>
                      </div>
                      <div className="ticket-details-col">
                        <p>
                          <strong>Email:</strong> {ticket.email}
                        </p>
                        <p>
                          <strong>Mobile:</strong> {ticket.mobile}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ticket-assignments">
                    <p>
                      <strong>Assigned Nurse:</strong>{" "}
                      {ticket.assignedNurse || nurseName}
                    </p>
                    <p>
                      <strong>Assigned Specialist:</strong>{" "}
                      {ticket.preferredSpecialist}
                    </p>
                    <p>
                      <strong>Consultation Type:</strong>{" "}
                      {ticket.consultationType || ticket.chiefComplaint}
                    </p>
                  </div>
                </div>

                <div className="ticket-right-section">
                  <div className="ticket-meta">
                    <p>
                      <strong>Date Created:</strong>{" "}
                      {ticket.dateCreated || ticket.preferredDate}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`ticket-status-text ${ticket.status?.toLowerCase()}`}
                      >
                        {ticket.status}
                      </span>
                    </p>
                  </div>

                  <button
                    className="ticket-history-btn"
                    onClick={() =>
                      navigate(`/consultation-history/${ticket.id}`)
                    }
                  >
                    Consultation Histories
                  </button>
                </div>
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
