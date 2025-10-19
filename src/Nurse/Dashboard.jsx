import "../App.css";
import "./NurseStyles.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const navigate = useNavigate();

  const [notifications] = useState([
    {
      id: 1,
      type: "New Ticket",
      message: "New ticket T005 submitted by Alex Smith",
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
      navigate("/nurse-notifications");
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  const [tickets, setTickets] = useState(() => {
    try {
      let raw = localStorage.getItem("nurse.tickets");
      if (!raw) raw = localStorage.getItem("tickets");
      if (!raw) raw = localStorage.getItem("appointmentTickets");
      if (!raw) raw = localStorage.getItem("manageAppointments.tickets");

      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    console.log("Dashboard - Logged in user info:", {
      "nurse.email": localStorage.getItem("nurse.email"),
      userEmail: localStorage.getItem("userEmail"),
      email: localStorage.getItem("email"),
      "user.email": localStorage.getItem("user.email"),
      currentUser: localStorage.getItem("currentUser"),
      authUser: localStorage.getItem("authUser"),
      "nurse.firstName": localStorage.getItem("nurse.firstName"),
      "nurse.lastName": localStorage.getItem("nurse.lastName"),
      allLocalStorageKeys: Object.keys(localStorage),
    });

    const loadTickets = () => {
      try {
        let raw = localStorage.getItem("nurse.tickets");
        let source = "nurse.tickets";

        if (!raw) {
          raw = localStorage.getItem("tickets");
          source = "tickets";
        }
        if (!raw) {
          raw = localStorage.getItem("appointmentTickets");
          source = "appointmentTickets";
        }
        if (!raw) {
          raw = localStorage.getItem("manageAppointments.tickets");
          source = "manageAppointments.tickets";
        }

        const tickets = raw ? JSON.parse(raw) : [];
        console.log(
          `Dashboard: Loading ${tickets.length} tickets from ${source}:`,
          tickets
        );
        setTickets(tickets);
      } catch (error) {
        console.error("Dashboard: Error loading tickets:", error);
        setTickets([]);
      }
    };

    loadTickets();

    const onVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Dashboard: Page became visible, reloading tickets");
        loadTickets();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const nurseId = useMemo(() => {
    let id = localStorage.getItem("nurse.id");
    if (!id) {
      id = `N${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("nurse.id", id);
    }
    return id;
  }, []);

  const toCalendarDateRange = (dateStr, timeStr, durationMinutes = 30) => {
    try {
      const startLocal = new Date(`${dateStr} ${timeStr}`);
      const endLocal = new Date(startLocal.getTime() + durationMinutes * 60000);
      const fmt = (d) =>
        d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      return { start: fmt(startLocal), end: fmt(endLocal) };
    } catch {
      const fmt = (d) =>
        d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const now = new Date();
      const end = new Date(now.getTime() + durationMinutes * 60000);
      return { start: fmt(now), end: fmt(end) };
    }
  };

  const buildGoogleCalendarUrl = (ticket) => {
    const { start, end } = toCalendarDateRange(
      ticket.preferredDate,
      ticket.preferredTime,
      30
    );
    const title = encodeURIComponent(`Consultation: ${ticket.patientName}`);
    const details = encodeURIComponent(
      `Patient: ${ticket.patientName}\nEmail: ${ticket.email}\nMobile: ${ticket.mobile}\nChief Complaint: ${ticket.chiefComplaint}\nChannel: ${ticket.consultationChannel}\nSpecialist: ${ticket.preferredSpecialist}`
    );
    const location = encodeURIComponent("OkieDoc+ Platform");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}%2F${end}`;
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
                        localStorage.setItem(
                          "nurse.tickets",
                          JSON.stringify(updated)
                        );
                        localStorage.setItem(
                          "tickets",
                          JSON.stringify(updated)
                        );
                        localStorage.setItem(
                          "appointmentTickets",
                          JSON.stringify(updated)
                        );
                        localStorage.setItem(
                          "manageAppointments.tickets",
                          JSON.stringify(updated)
                        );
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
                      localStorage.setItem(
                        "nurse.tickets",
                        JSON.stringify(updated)
                      );
                      localStorage.setItem("tickets", JSON.stringify(updated));
                      localStorage.setItem(
                        "appointmentTickets",
                        JSON.stringify(updated)
                      );
                      localStorage.setItem(
                        "manageAppointments.tickets",
                        JSON.stringify(updated)
                      );
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
