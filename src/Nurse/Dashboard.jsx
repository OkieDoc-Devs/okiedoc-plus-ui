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

  // Tickets from localStorage
  const [tickets, setTickets] = useState(() => {
    try {
      const raw = localStorage.getItem("nurse.tickets");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const onStorage = () => {
      try {
        const raw = localStorage.getItem("nurse.tickets");
        setTickets(raw ? JSON.parse(raw) : []);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const nurseId = useMemo(() => {
    let id = localStorage.getItem("nurse.id");
    if (!id) {
      id = `N${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("nurse.id", id);
    }
    return id;
  }, []);

  const confirmedTickets = useMemo(
    () =>
      tickets.filter(
        (t) => t.status === "Confirmed" && t.claimedBy === nurseId
      ),
    [tickets, nurseId]
  );

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
    const location = encodeURIComponent("Okie-Doc+ Platform");
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

      {/* Confirmed Tickets for scheduling */}
      <div className="appointments-section">
        <div className="processing-tickets">
          <h2>Confirmed Tickets ({confirmedTickets.length})</h2>
          {confirmedTickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card processing">
              <div className="ticket-header">
                <h3>{ticket.patientName}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: "#4caf50" }}
                >
                  Confirmed
                </span>
              </div>
              <div className="ticket-actions">
                <a
                  href={buildGoogleCalendarUrl(ticket)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn edit"
                >
                  Create Schedule (Google Calendar)
                </a>
                <button
                  className="action-btn remove"
                  style={{
                    marginLeft: 8,
                    background: "#f44336",
                    color: "#fff",
                  }}
                  onClick={() => {
                    // Remove ticket from state and localStorage
                    setTickets((prev) => {
                      const updated = prev.filter((t) => t.id !== ticket.id);
                      localStorage.setItem(
                        "nurse.tickets",
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
        </div>
      </div>
    </div>
  );
}
