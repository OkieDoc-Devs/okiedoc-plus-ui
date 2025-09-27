// Helper to generate invoice text
const generateInvoiceText = () => {
  if (!selectedTicket) return "";
  let lines = [];
  lines.push(`Invoice No.: ${invoiceData.invoiceNumber}`);
  lines.push(
    `Date of Consultation: ${selectedTicket.preferredDate} ${selectedTicket.preferredTime}`
  );
  lines.push(`Patient Name: ${selectedTicket.patientName}`);
  lines.push(`Mobile Number: ${selectedTicket.mobile}`);
  lines.push(`Email Address: ${selectedTicket.email}`);
  lines.push("");
  lines.push("Invoice Items:");
  invoiceData.items.forEach((item, idx) => {
    lines.push(
      `  ${idx + 1}. ${item.name} - ${item.description} | Qty: ${
        item.quantity
      } | Amount: ₱${item.amount}`
    );
  });
  lines.push(`Platform Fee: ₱${invoiceData.platformFee}`);
  lines.push(`E-Nurse Fee: ₱${invoiceData.eNurseFee}`);
  lines.push(`Total Amount: ₱${invoiceTotal.toFixed(2)}`);
  lines.push("");
  lines.push(`Payment Link: ${invoiceData.paymentLink}`);
  lines.push("");
  lines.push("OkieDoc+ Address: 123 Health St, Wellness City, Country");
  return lines.join("\n");
};

// Download invoice as text file
const handleDownloadInvoice = () => {
  const text = generateInvoiceText();
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice_${invoiceData.invoiceNumber || "OkieDoc"}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
import "../App.css";
import "./NurseStyles.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

const LOCAL_STORAGE_KEYS = {
  tickets: "nurse.tickets",
  notifications: "nurse.notifications",
  online: "nurse.online",
  nurseId: "nurse.id",
};

function generateId(prefix = "T") {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function ManageAppointment() {
  // Helper to generate invoice text
  const generateInvoiceText = () => {
    if (!selectedTicket) return "";
    let lines = [];
    lines.push(`Invoice No.: ${invoiceData.invoiceNumber}`);
    lines.push(
      `Date of Consultation: ${selectedTicket.preferredDate} ${selectedTicket.preferredTime}`
    );
    lines.push(`Patient Name: ${selectedTicket.patientName}`);
    lines.push(`Mobile Number: ${selectedTicket.mobile}`);
    lines.push(`Email Address: ${selectedTicket.email}`);
    lines.push("");
    lines.push("Invoice Items:");
    invoiceData.items.forEach((item, idx) => {
      lines.push(
        `  ${idx + 1}. ${item.name} - ${item.description} | Qty: ${
          item.quantity
        } | Amount: ₱${item.amount}`
      );
    });
    lines.push(`Platform Fee: ₱${invoiceData.platformFee}`);
    lines.push(`E-Nurse Fee: ₱${invoiceData.eNurseFee}`);
    lines.push(`Total Amount: ₱${invoiceTotal.toFixed(2)}`);
    lines.push("");
    lines.push(`Payment Link: ${invoiceData.paymentLink}`);
    lines.push("");
    lines.push("OkieDoc+ Address: 123 Health St, Wellness City, Country");
    return lines.join("\n");
  };

  // Download invoice as text file
  const handleDownloadInvoice = () => {
    const text = generateInvoiceText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${invoiceData.invoiceNumber || "OkieDoc"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const navigate = useNavigate();
  const [online, setOnline] = useState(true);
  const [tickets, setTickets] = useState(() => {
    const existing = loadFromStorage(LOCAL_STORAGE_KEYS.tickets, []);
    if (existing.length > 0) return existing;
    // Add dummy tickets if none exist
    return [
      {
        id: generateId(),
        patientName: "John Doe",
        email: "john.doe@example.com",
        mobile: "09171234567",
        chiefComplaint: "Headache",
        symptoms: "Mild pain",
        otherSymptoms: "Nausea",
        preferredDate: "2025-09-01",
        preferredTime: "09:00",
        preferredSpecialist: "Dr. Smith",
        consultationChannel: "Platform",
        hasHMO: false,
        hmo: {
          company: "",
          memberId: "",
          expirationDate: "",
          loaCode: "",
          eLOAFile: null,
        },
        source: "platform",
        status: "Pending",
        claimedBy: null,
      },
      {
        id: generateId(),
        patientName: "Jane Smith",
        email: "jane.smith@example.com",
        mobile: "09179876543",
        chiefComplaint: "Cough",
        symptoms: "Dry cough",
        otherSymptoms: "Fever",
        preferredDate: "2025-09-02",
        preferredTime: "14:00",
        preferredSpecialist: "Dr. Lee",
        consultationChannel: "Platform",
        hasHMO: true,
        hmo: {
          company: "MediCare",
          memberId: "MC12345",
          expirationDate: "2026-01-01",
          loaCode: "LOA9876",
          eLOAFile: null,
        },
        source: "platform",
        status: "Pending",
        claimedBy: null,
      },
      {
        id: generateId(),
        patientName: "Carlos Gomez",
        email: "carlos.gomez@example.com",
        mobile: "09175551234",
        chiefComplaint: "Back pain",
        symptoms: "Lower back pain",
        otherSymptoms: "None",
        preferredDate: "2025-09-03",
        preferredTime: "11:30",
        preferredSpecialist: "Dr. Patel",
        consultationChannel: "Platform",
        hasHMO: false,
        hmo: {
          company: "",
          memberId: "",
          expirationDate: "",
          loaCode: "",
          eLOAFile: null,
        },
        source: "platform",
        status: "Pending",
        claimedBy: null,
      },
    ];
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    items: [
      {
        name: "Consultation Fee",
        description: "Medical consultation",
        quantity: 1,
        amount: 100,
      },
    ],
    platformFee: 25,
    eNurseFee: 15,
    invoiceNumber: "",
    paymentLink: "",
  });
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    patientName: "",
    email: "",
    mobile: "",
    chiefComplaint: "",
    symptoms: "",
    otherSymptoms: "",
    preferredDate: "",
    preferredTime: "",
    preferredSpecialist: "",
    consultationChannel: "Mobile Call",
    hasHMO: false,
    hmo: {
      company: "",
      memberId: "",
      expirationDate: "",
      loaCode: "",
      eLOAFile: null,
    },
    source: "platform", // platform | hotline
  });
  const [specialistAvailable, setSpecialistAvailable] = useState(null);
  const [hmoVerified, setHmoVerified] = useState(null);
  const [assignedSpecialist, setAssignedSpecialist] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const nurseName = localStorage.getItem("nurse.firstName") || "Nurse";
  const nurseId = useMemo(() => {
    let id = localStorage.getItem(LOCAL_STORAGE_KEYS.nurseId);
    if (!id) {
      id = generateId("N");
      localStorage.setItem(LOCAL_STORAGE_KEYS.nurseId, id);
    }
    return id;
  }, []);

  useEffect(() => {}, [online]);

  useEffect(() => {
    saveToStorage(LOCAL_STORAGE_KEYS.tickets, tickets);
  }, [tickets]);

  const handleLogout = () => {
    navigate("/");
  };

  const addNotification = (type, message) => {
    const notifications = loadFromStorage(LOCAL_STORAGE_KEYS.notifications, []);
    const newItem = {
      id: generateId("NT"),
      type,
      message,
      time: new Date().toISOString(),
      unread: true,
    };
    const updated = [newItem, ...notifications];
    saveToStorage(LOCAL_STORAGE_KEYS.notifications, updated);
  };

  const goOnline = () => {};
  const goOffline = () => {};

  const claimTicket = (ticketId) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId && !t.claimedBy
          ? { ...t, claimedBy: nurseId, status: "Processing" }
          : t
      )
    );
    addNotification("New Ticket", `Ticket ${ticketId} claimed by ${nurseName}`);
  };

  const updateStatus = (ticketId, newStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    if (newStatus === "For Payment")
      addNotification("Payment", `Invoice generated for ticket ${ticketId}`);
    if (newStatus === "Confirmed")
      addNotification(
        "Payment Confirmation",
        `Payment confirmed for ticket ${ticketId}`
      );
  };

  const openInvoice = (ticket) => {
    const invoiceNumber = generateId("INV");
    const paymentLink = `${window.location.origin}/pay/${invoiceNumber}`;
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items,
      invoiceNumber,
      paymentLink,
    }));
    setSelectedTicket(ticket);
    setShowInvoiceModal(true);
  };

  const addInvoiceItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", description: "", quantity: 1, amount: 0 },
      ],
    }));
  };
  const removeInvoiceItem = (index) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };
  const updateInvoiceItem = (index, field, value) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((it, i) =>
        i === index ? { ...it, [field]: value } : it
      ),
    }));
  };
  const invoiceTotal = useMemo(() => {
    const itemsTotal = invoiceData.items.reduce(
      (sum, it) => sum + Number(it.amount || 0) * Number(it.quantity || 0),
      0
    );
    return (
      itemsTotal +
      Number(invoiceData.platformFee || 0) +
      Number(invoiceData.eNurseFee || 0)
    );
  }, [invoiceData]);

  const sendInvoice = (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    // Keep ticket in Processing after invoice generation
    updateStatus(selectedTicket.id, "Processing");
    setShowInvoiceModal(false);
    alert("Invoice sent to patient's email (simulated).");
  };

  const simulatePayment = (ticketId) => {
    // Move ticket to Confirmed after payment
    updateStatus(ticketId, "Confirmed");
  };

  const toCalendarDateRange = (dateStr, timeStr, durationMinutes = 30) => {
    try {
      const startLocal = new Date(`${dateStr} ${timeStr}`);
      if (isNaN(startLocal.getTime())) {
        const fallback = new Date();
        const endFallback = new Date(
          fallback.getTime() + durationMinutes * 60000
        );
        const fmt = (d) =>
          d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        return { start: fmt(fallback), end: fmt(endFallback) };
      }
      const endLocal = new Date(startLocal.getTime() + durationMinutes * 60000);
      const fmt = (d) =>
        d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      return { start: fmt(startLocal), end: fmt(endLocal) };
    } catch {
      const now = new Date();
      const end = new Date(now.getTime() + durationMinutes * 60000);
      const fmt = (d) =>
        d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
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

  const openCreateTicket = (source = "hotline") => {
    setNewTicketData((prev) => ({
      ...prev,
      source,
      consultationChannel:
        source === "hotline" ? "Mobile Call" : prev.consultationChannel,
    }));
    setShowCreateTicketModal(true);
  };

  const submitCreateTicket = (e) => {
    e.preventDefault();
    const id = generateId("TK");
    const newTicket = {
      id,
      ...newTicketData,
      hmo: newTicketData.hasHMO ? newTicketData.hmo : null,
      status: "Pending",
      createdAt: new Date().toISOString(),
      claimedBy: null,
    };
    setTickets((prev) => [newTicket, ...prev]);
    setShowCreateTicketModal(false);
    addNotification(
      "New Ticket",
      `Ticket ${id} created via ${newTicket.source}`
    );
  };

  const pendingTickets = tickets.filter((t) => t.status === "Pending");
  const processingTickets = tickets.filter(
    (t) => t.status === "Processing" && t.claimedBy === nurseId
  );
  const confirmedTickets = tickets.filter(
    (t) => t.status === "Confirmed" && t.claimedBy === nurseId
  );

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
        <h3 className="dashboard-title">Manage Appointments</h3>
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
          <button className="nav-tab active">Manage Appointments</button>
          <button
            className="nav-tab"
            onClick={() => navigate("/nurse-notifications")}
          >
            Notifications
          </button>
        </div>
      </div>

      <div className="appointments-section">
        <div
          className="appointments-controls"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            className="create-appointment-btn"
            onClick={() => openCreateTicket("hotline")}
          >
            + Create Ticket
          </button>
        </div>

        <div className="tickets-container">
          <div className="processing-tickets">
            <h2>Processing Tickets ({processingTickets.length})</h2>
            {processingTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card processing">
                <div className="ticket-header">
                  <h3>{ticket.patientName}</h3>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: "#2196f3" }}
                  >
                    {ticket.status}
                  </span>
                </div>
                <div className="ticket-actions">
                  {/* If ticket is claimed, show Generate Invoice, else show Manage */}
                  {ticket.claimedBy ? (
                    <button
                      className="action-btn edit"
                      onClick={() => openInvoice(ticket)}
                    >
                      Generate Invoice
                    </button>
                  ) : (
                    <button
                      className="action-btn view"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      Manage
                    </button>
                  )}
                  <button
                    className="action-btn"
                    onClick={() => simulatePayment(ticket.id)}
                  >
                    Simulate Payment
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="tickets-list">
            <h2>Pending Tickets ({pendingTickets.length})</h2>
            {pendingTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <h3>{ticket.patientName || "Unnamed"}</h3>
                  <span className="ticket-time">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="ticket-details">
                  <p>
                    <strong>Chief Complaint:</strong> {ticket.chiefComplaint}
                  </p>
                  <p>
                    <strong>Preferred:</strong> {ticket.preferredDate} at{" "}
                    {ticket.preferredTime}
                  </p>
                  <p>
                    <strong>Specialist:</strong> {ticket.preferredSpecialist}
                  </p>
                  <p>
                    <strong>Channel:</strong> {ticket.consultationChannel}
                  </p>
                  <p>
                    <strong>HMO:</strong>{" "}
                    {ticket.hasHMO ? "Yes" : ticket.hmo ? "Yes" : "No"}
                  </p>
                </div>
                <div className="ticket-actions">
                  <button
                    className="action-btn view"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    View Details
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => claimTicket(ticket.id)}
                    disabled={!!ticket.claimedBy}
                  >
                    Claim Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>

          {false && <div className="processing-tickets"></div>}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="modal-overlay">
          <div className="ticket-modal">
            <div className="modal-header">
              <h2>Patient Ticket Details</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-content" style={{ padding: 24 }}>
              <div className="patient-info">
                <h3>Patient Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedTicket.patientName}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedTicket.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Mobile:</label>
                    <span>{selectedTicket.mobile}</span>
                  </div>
                </div>
              </div>

              <div className="medical-info">
                <h3>Medical Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Chief Complaint:</label>
                    <span>{selectedTicket.chiefComplaint}</span>
                  </div>
                  <div className="info-item">
                    <label>Symptoms:</label>
                    <span>{selectedTicket.symptoms}</span>
                  </div>
                  <div className="info-item">
                    <label>Other Symptoms:</label>
                    <span>{selectedTicket.otherSymptoms || "None"}</span>
                  </div>
                </div>
              </div>

              <div className="appointment-info">
                <h3>Appointment Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Preferred Date:</label>
                    <span>{selectedTicket.preferredDate}</span>
                  </div>
                  <div className="info-item">
                    <label>Preferred Time:</label>
                    <span>{selectedTicket.preferredTime}</span>
                  </div>
                  <div className="info-item">
                    <label>Preferred Specialist:</label>
                    <span>{selectedTicket.preferredSpecialist}</span>
                  </div>
                  <div className="info-item">
                    <label>Consultation Channel:</label>
                    <span>{selectedTicket.consultationChannel}</span>
                  </div>
                </div>
              </div>

              {selectedTicket.hmo && (
                <div className="hmo-info">
                  <h3>HMO Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Company:</label>
                      <span>{selectedTicket.hmo.company}</span>
                    </div>
                    <div className="info-item">
                      <label>Member ID:</label>
                      <span>{selectedTicket.hmo.memberId}</span>
                    </div>
                    <div className="info-item">
                      <label>Expiration Date:</label>
                      <span>{selectedTicket.hmo.expirationDate}</span>
                    </div>
                    <div className="info-item">
                      <label>LOA Code:</label>
                      <span>{selectedTicket.hmo.loaCode}</span>
                    </div>
                    <div className="info-item">
                      <label>eLOA File:</label>
                      <span>{selectedTicket.hmo.eLOAFile}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="specialist-verification">
                <h3>Specialist & HMO Verification</h3>
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  <button
                    className="action-btn confirm"
                    style={{ background: "#4caf50", color: "#fff" }}
                    onClick={() => setSpecialistAvailable(true)}
                  >
                    Specialist Available
                  </button>
                  <button
                    className="action-btn warn"
                    style={{ background: "#ff9800", color: "#fff" }}
                    onClick={() => setSpecialistAvailable(false)}
                  >
                    Specialist Unavailable
                  </button>
                </div>
                {selectedTicket.hasHMO && (
                  <div style={{ marginBottom: 12 }}>
                    <button
                      className="action-btn confirm"
                      style={{ background: "#2196f3", color: "#fff" }}
                      onClick={() => setHmoVerified(true)}
                    >
                      Verify HMO
                    </button>
                    <button
                      className="action-btn warn"
                      style={{ background: "#f44336", color: "#fff" }}
                      onClick={() => setHmoVerified(false)}
                    >
                      Reject HMO
                    </button>
                  </div>
                )}
                {specialistAvailable === true && (
                  <div style={{ marginBottom: 12, color: "#4caf50" }}>
                    Specialist is available for consultation.
                  </div>
                )}
                {specialistAvailable === false && (
                  <div style={{ marginBottom: 12, color: "#ff9800" }}>
                    Specialist is unavailable. Please call patient for
                    arrangement or reschedule.
                  </div>
                )}
                {hmoVerified === true && (
                  <div style={{ marginBottom: 12, color: "#2196f3" }}>
                    HMO verified. You may proceed to generate invoice charged to
                    HMO.
                  </div>
                )}
                {hmoVerified === false && (
                  <div style={{ marginBottom: 12, color: "#f44336" }}>
                    HMO details cannot be verified. Please contact patient for
                    arrangement.
                  </div>
                )}
              </div>

              <div
                className="specialist-actions"
                style={{ marginTop: 24, marginBottom: 16 }}
              >
                <h3 style={{ marginBottom: 8 }}>Assign Specialist</h3>
                <label htmlFor="specialist-select" style={{ marginRight: 8 }}>
                  Specialist:
                </label>
                <select
                  id="specialist-select"
                  style={{
                    marginBottom: 0,
                    padding: "6px 12px",
                    borderRadius: 4,
                  }}
                  value={assignedSpecialist}
                  onChange={(e) => setAssignedSpecialist(e.target.value)}
                >
                  <option value="">Select Specialist</option>
                  <option value="Dr. Smith">Dr. Smith</option>
                  <option value="Dr. Lee">Dr. Lee</option>
                  <option value="Dr. Patel">Dr. Patel</option>
                </select>
              </div>
              <div
                className="reschedule-actions"
                style={{ marginTop: 16, marginBottom: 0 }}
              >
                <h3 style={{ marginBottom: 8 }}>Reschedule</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label htmlFor="reschedule-date" style={{ marginRight: 4 }}>
                    Date:
                  </label>
                  <input
                    id="reschedule-date"
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    style={{
                      marginRight: 8,
                      padding: "6px 12px",
                      borderRadius: 4,
                    }}
                  />
                  <label htmlFor="reschedule-time" style={{ marginRight: 4 }}>
                    Time:
                  </label>
                  <input
                    id="reschedule-time"
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    style={{
                      marginRight: 8,
                      padding: "6px 12px",
                      borderRadius: 4,
                    }}
                  />
                  <button
                    className="action-btn"
                    style={{
                      background: "#2196f3",
                      color: "#fff",
                      padding: "6px 16px",
                      borderRadius: 4,
                    }}
                    onClick={() => handleReschedule(selectedTicket.id)}
                  >
                    Reschedule
                  </button>
                </div>
              </div>

              <div className="ticket-actions" style={{ marginTop: 12 }}>
                {/* Only show Generate Invoice if ticket is not claimed and not Pending */}
                {!selectedTicket.claimedBy &&
                  selectedTicket.status !== "Pending" && (
                    <button
                      className="action-btn edit"
                      onClick={() => openInvoice(selectedTicket)}
                    >
                      Generate Invoice
                    </button>
                  )}
                <button
                  className="action-btn"
                  onClick={() => updateStatus(selectedTicket.id, "Incomplete")}
                >
                  Mark Incomplete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="modal-overlay">
          <div className="invoice-modal">
            <div className="modal-header">
              <img
                src="/okie-doc-logo.png"
                alt="OkieDoc+ Logo"
                style={{ height: 48, marginBottom: 8, opacity: 1 }}
              />
              <h2>Generate Invoice</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-content" style={{ padding: 20, opacity: 1 }}>
              <div className="invoice-info">
                <p>
                  <strong>Invoice No.:</strong> {invoiceData.invoiceNumber}
                </p>
                <p>
                  <strong>Date of Consultation:</strong>{" "}
                  {selectedTicket?.preferredDate}{" "}
                  {selectedTicket?.preferredTime}
                </p>
                <p>
                  <strong>Patient Name:</strong> {selectedTicket?.patientName}
                </p>
                <p>
                  <strong>Mobile Number:</strong> {selectedTicket?.mobile}
                </p>
                <p>
                  <strong>Email Address:</strong> {selectedTicket?.email}
                </p>
              </div>
              <form onSubmit={sendInvoice} className="invoice-form">
                <div className="invoice-items">
                  <h3>Invoice Items</h3>
                  {invoiceData.items.map((item, idx) => (
                    <div key={idx} className="invoice-item">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) =>
                          updateInvoiceItem(idx, "name", e.target.value)
                        }
                        required
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                          updateInvoiceItem(idx, "description", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          updateInvoiceItem(
                            idx,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="1"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) =>
                          updateInvoiceItem(
                            idx,
                            "amount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        step="0.01"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeInvoiceItem(idx)}
                        className="remove-item-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addInvoiceItem}
                    className="add-item-btn"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="invoice-fees">
                  <div className="fee-item">
                    <label>Platform Fee:</label>
                    <input
                      type="number"
                      value={invoiceData.platformFee}
                      onChange={(e) =>
                        setInvoiceData((prev) => ({
                          ...prev,
                          platformFee: parseFloat(e.target.value) || 0,
                        }))
                      }
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="fee-item">
                    <label>E-Nurse Fee:</label>
                    <input
                      type="number"
                      value={invoiceData.eNurseFee}
                      onChange={(e) =>
                        setInvoiceData((prev) => ({
                          ...prev,
                          eNurseFee: parseFloat(e.target.value) || 0,
                        }))
                      }
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div style={{ padding: "0 20px 10px 20px", opacity: 1 }}>
                  <h3>Items</h3>
                  {invoiceData.items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8 }}>
                      <span>{item.name}</span>
                      <span>{item.description}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>Amount: ₱{item.amount}</span>
                    </div>
                  ))}
                  <p>
                    <strong>Platform Fee:</strong> ₱{invoiceData.platformFee}
                  </p>
                  <p>
                    <strong>E-Nurse Fee:</strong> ₱{invoiceData.eNurseFee}
                  </p>
                  <h3>Total Amount: ₱{invoiceTotal.toFixed(2)}</h3>
                  <p>
                    <strong>Payment Link:</strong> {invoiceData.paymentLink}
                  </p>
                  <footer style={{ marginTop: 16, fontSize: 12, opacity: 1 }}>
                    <strong>OkieDoc+ Address:</strong> 123 Health St, Wellness
                    City, Country
                  </footer>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-btn">
                    Send Invoice
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadInvoice}
                    className="submit-btn"
                    style={{ marginLeft: 8 }}
                  >
                    Download Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCreateTicketModal && (
        <div className="modal-overlay">
          <div className="create-appointment-modal">
            <div className="modal-header">
              <h2>Create New Ticket ({newTicketData.source})</h2>
              <button
                onClick={() => setShowCreateTicketModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <form
              onSubmit={submitCreateTicket}
              className="create-appointment-form"
            >
              <div className="form-section">
                <h3>Patient Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="patientName">Patient Name *</label>
                    <input
                      id="patientName"
                      name="patientName"
                      value={newTicketData.patientName}
                      onChange={(e) =>
                        setNewTicketData({
                          ...newTicketData,
                          patientName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Number *</label>
                    <input
                      id="mobile"
                      name="mobile"
                      value={newTicketData.mobile}
                      onChange={(e) =>
                        setNewTicketData({
                          ...newTicketData,
                          mobile: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    value={newTicketData.email}
                    onChange={(e) =>
                      setNewTicketData({
                        ...newTicketData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Medical Information</h3>
                <div className="form-group">
                  <label htmlFor="chiefComplaint">Chief Complaint *</label>
                  <textarea
                    id="chiefComplaint"
                    name="chiefComplaint"
                    rows="3"
                    value={newTicketData.chiefComplaint}
                    onChange={(e) =>
                      setNewTicketData({
                        ...newTicketData,
                        chiefComplaint: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="symptoms">Symptoms</label>
                    <textarea
                      id="symptoms"
                      name="symptoms"
                      rows="2"
                      value={newTicketData.symptoms}
                      onChange={(e) =>
                        setNewTicketData({
                          ...newTicketData,
                          symptoms: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="otherSymptoms">Other Symptoms</label>
                    <textarea
                      id="otherSymptoms"
                      name="otherSymptoms"
                      rows="2"
                      value={newTicketData.otherSymptoms}
                      onChange={(e) =>
                        setNewTicketData({
                          ...newTicketData,
                          otherSymptoms: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Appointment Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="preferredDate">Preferred Date</label>
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      value={newTicketData.preferredDate}
                      onChange={(e) =>
                        setNewTicketData({
                          ...newTicketData,
                          preferredDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="preferredTime">Preferred Time</label>
                    <input
                      type="time"
                      id="preferredTime"
                      name="preferredTime"
                      value={newTicketData.preferredTime}
                      onChange={(e) =>
                        setNewTicketData({
                          ...newTicketData,
                          preferredTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="preferredSpecialist">
                      Preferred Specialist
                    </label>
                    <select
                      id="preferredSpecialist"
                      name="preferredSpecialist"
                      value={newTicketData.preferredSpecialist}
                      onChange={(e) =>
                        setNewTicketData({
                          ...newTicketData,
                          preferredSpecialist: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Doctor</option>
                      <option value="Dr. Smith">Dr. Smith</option>
                      <option value="Dr. Lee">Dr. Lee</option>
                      <option value="Dr. Patel">Dr. Patel</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="consultationChannel">
                      Consultation Channel
                    </label>
                    <select
                      id="consultationChannel"
                      name="consultationChannel"
                      value={newTicketData.consultationChannel}
                      onChange={(e) =>
                        setNewTicketData({
                          ...newTicketData,
                          consultationChannel: e.target.value,
                        })
                      }
                    >
                      <option value="Mobile Call">Mobile Call</option>
                      <option value="Platform Chat">Platform Chat</option>
                      <option value="Viber (Audio Call)">
                        Viber (Audio Call)
                      </option>
                      <option value="Viber (Video Call)">
                        Viber (Video Call)
                      </option>
                      <option value="Platform Video Call">
                        Platform Video Call
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>HMO Information</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newTicketData.hasHMO}
                      onChange={(e) =>
                        setNewTicketData((prev) => ({
                          ...prev,
                          hasHMO: e.target.checked,
                          hmo: e.target.checked ? prev.hmo : null,
                        }))
                      }
                    />{" "}
                    Patient has HMO coverage
                  </label>
                </div>
                {newTicketData.hasHMO && (
                  <div className="hmo-fields">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="hmoCompany">HMO Company</label>
                        <input
                          id="hmoCompany"
                          value={newTicketData.hmo.company}
                          onChange={(e) =>
                            setNewTicketData((prev) => ({
                              ...prev,
                              hmo: { ...prev.hmo, company: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="hmoMemberId">Member ID</label>
                        <input
                          id="hmoMemberId"
                          value={newTicketData.hmo.memberId}
                          onChange={(e) =>
                            setNewTicketData((prev) => ({
                              ...prev,
                              hmo: { ...prev.hmo, memberId: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="hmoExpiration">Expiration Date</label>
                        <input
                          type="date"
                          id="hmoExpiration"
                          value={newTicketData.hmo.expirationDate}
                          onChange={(e) =>
                            setNewTicketData((prev) => ({
                              ...prev,
                              hmo: {
                                ...prev.hmo,
                                expirationDate: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="hmoLoaCode">LOA Code</label>
                        <input
                          id="hmoLoaCode"
                          value={newTicketData.hmo.loaCode}
                          onChange={(e) =>
                            setNewTicketData((prev) => ({
                              ...prev,
                              hmo: { ...prev.hmo, loaCode: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="hmoFile">eLOA File</label>
                      <input
                        type="file"
                        id="hmoFile"
                        accept=".pdf,.jpg,.jpeg"
                        onChange={(e) =>
                          setNewTicketData((prev) => ({
                            ...prev,
                            hmo: {
                              ...prev.hmo,
                              eLOAFile: e.target.files?.[0]?.name || null,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  Create Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTicketModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
