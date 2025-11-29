import "../App.css";
import "./NurseStyles.css";
import "./NurseStyles.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import NurseConsultationHistory from "../Patient/jsx/ConsultationHistory";

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
  const [showConsultationHistory, setShowConsultationHistory] = useState(false);
  const navigate = useNavigate();
  const [online] = useState(true);
  const [tickets, setTickets] = useState(() => {
    const existing = loadFromStorage(LOCAL_STORAGE_KEYS.tickets, []);
    if (existing.length > 0) return existing;
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
  useEffect(() => {
    // Load tickets on mount - API integration currently using local storage
    // To enable API integration, uncomment the code below and import fetchTicketsFromAPI from './services/apiService.js'
    // const loadTicketsData = async () => {
    //   try {
    //     const data = await fetchTicketsFromAPI();
    //     setTickets(data);
    //     console.log("Tickets loaded successfully:", data);
    //   } catch (error) {
    //     console.error("Error loading tickets:", error);
    //   }
    // };
    // loadTicketsData();
    // const interval = setInterval(loadTicketsData, 30000);
    // return () => clearInterval(interval);
  }, []);

  const [notifications] = useState(getFallbackNotifications());
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceTicket, setInvoiceTicket] = useState(null);
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
    source: "platform",
  });
  const [specialistAvailable, setSpecialistAvailable] = useState(null);
  const [hmoVerified, setHmoVerified] = useState(null);
  const [assignedSpecialist, setAssignedSpecialist] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [createTicketTab, setCreateTicketTab] = useState("medical");

  const [textPills, setTextPills] = useState({
    medicalRecords: [],
    familyHistory: [],
    allergies: [],
  });
  const [textInput, setTextInput] = useState({
    medicalRecords: "",
    familyHistory: "",
    allergies: "",
  });

  const addTextPill = (field, text) => {
    if (!text.trim()) return;

    const trimmedText = text.trim();
    if (textPills[field].includes(trimmedText)) return;

    setTextPills((prev) => ({
      ...prev,
      [field]: [...prev[field], trimmedText],
    }));

    setTextInput((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const removeTextPill = (field, textToRemove) => {
    setTextPills((prev) => ({
      ...prev,
      [field]: prev[field].filter((text) => text !== textToRemove),
    }));
  };

  const handleTextInputKeyPress = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTextPill(field, textInput[field]);
    }
  };

  const painMapFields = [
    "Thymus",
    "Lung and diaphragm",
    "Spleen",
    "Heart",
    "Stomach",
    "Pancreas",
    "Small intestine",
    "Ovary",
    "Colon",
    "Kidney",
    "Urinary bladder",
    "Ureter",
    "Appendix",
    "Liver and gall bladder",
  ];
  <button
    className={createTicketTab === "painmap" ? "tab-btn active" : "tab-btn"}
    onClick={() => setCreateTicketTab("painmap")}
    type="button"
  >
    Pain Map
  </button>;

  const rosFields = {
    constitutional: [
      "Chills",
      "Fatigue",
      "Fever",
      "Weight gain",
      "Weight loss",
    ],
    heent: ["Hearing loss", "Sinus pressure", "Visual changes"],
    respiratory: ["Cough", "Shortness of breath", "Wheezing"],
    cardiovascular: [
      "Chest pain",
      "Pain while walking (Claudication)",
      "Edema",
      "Palpitations",
    ],
    gastrointestinal: [
      "Abdominal pain",
      "Blood in stool",
      "Constipation",
      "Diarrhea",
      "Heartburn",
      "Loss of appetite",
      "Nausea",
      "Vomiting",
    ],
    genitourinary: [
      "Painful urination (Dysuria)",
      "Excessive amount of urine (Polyuria)",
      "Urinary frequency",
    ],
    metabolic: [
      "Cold intolerance",
      "Heat intolerance",
      "Excessive thirst (Polydipsia)",
      "Excessive hunger (Polyphagia)",
    ],
    neurological: [
      "Dizziness",
      "Extremity numbness",
      "Extremity weakness",
      "Headaches",
      "Seizures",
      "Tremors",
    ],
    psychiatric: ["Anxiety", "Depression"],
    integumentary: [
      "Breast discharge",
      "Breast lump",
      "Hives",
      "Mole change(s)",
      "Rash",
      "Skin lesion",
    ],
    musculoskeletal: ["Back pain", "Joint pain", "Joint swelling", "Neck pain"],
    hematologic: [
      "Easily bleeds",
      "Easily bruises",
      "Lymphedema",
      "Issues with blood clots",
    ],
    immunologic: ["Food allergies", "Seasonal allergies"],
  };

  const nurseName = getNurseFirstName();
  const nurseId = getNurseId();

  useEffect(() => {}, [online]);

  useEffect(() => {
    saveToStorage(LOCAL_STORAGE_KEYS.tickets, tickets);
  }, [tickets]);

  const handleLogout = () => {
    navigate("/");
  };

  const claimTicket = (ticketId) => {
    setTickets((prev) => claimTicketUtil(prev, ticketId, nurseId));
    addNotification("New Ticket", `Ticket ${ticketId} claimed by ${nurseName}`);
  };

  const updateStatus = (ticketId, newStatus) => {
    setTickets((prev) => updateTicketStatus(prev, ticketId, newStatus));
    if (newStatus === "For Payment")
      addNotification("Payment", `Invoice generated for ticket ${ticketId}`);
    if (newStatus === "Confirmed")
      addNotification(
        "Payment Confirmation",
        `Payment confirmed for ticket ${ticketId}`
      );
  };

  const openInvoice = (ticket, fromDetailsModal = false) => {
    const invoiceNumber = generateId("INV");
    const paymentLink = `${window.location.origin}/pay/${invoiceNumber}`;
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items,
      invoiceNumber,
      paymentLink,
    }));
    setInvoiceTicket(ticket);
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
  const invoiceTotal = useMemo(
    () => calculateInvoiceTotal(invoiceData),
    [invoiceData]
  );

  const sendInvoice = (e) => {
    e.preventDefault();
    if (!invoiceTicket) return;
    updateStatus(invoiceTicket.id, "Processing");
    setShowInvoiceModal(false);
    alert("Invoice sent to patient's email (simulated).");
  };

  const simulatePayment = (ticketId) => {
    updateStatus(ticketId, "Confirmed");
  };

  const handleReschedule = (ticketId) => {
    if (rescheduleDate && rescheduleTime) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                preferredDate: rescheduleDate,
                preferredTime: rescheduleTime,
              }
            : t
        )
      );
      setRescheduleDate("");
      setRescheduleTime("");
      alert("Appointment rescheduled successfully!");
    } else {
      alert("Please select both date and time for rescheduling.");
    }
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

  const openCreateTicket = (source = "hotline") => {
    setNewTicketData({
      patientName: "",
      email: "",
      mobile: "",
      chiefComplaint: "",
      symptoms: "",
      otherSymptoms: "",
      preferredDate: "",
      preferredTime: "",
      preferredSpecialist: "",
      consultationChannel:
        source === "hotline" ? "Mobile Call" : "Platform Chat",
      hasHMO: false,
      hmo: {
        company: "",
        memberId: "",
        expirationDate: "",
        loaCode: "",
        eLOAFile: null,
      },
      source,
      ros: {},
      painMap: [],
      actualChiefComplaint: "",
      medicalRecords: "",
      familyHistory: "",
      allergies: "",
      smoking: "",
      drinking: "",
    });
    setTextPills({
      medicalRecords: [],
      familyHistory: [],
      allergies: [],
    });
    setTextInput({
      medicalRecords: "",
      familyHistory: "",
      allergies: "",
    });
    setShowCreateTicketModal(true);
  };

  const submitCreateTicket = (e) => {
    e.preventDefault();
    const id = generateId("TK");
    const newTicket = {
      id,
      ...newTicketData,
      medicalRecordsPills: textPills.medicalRecords,
      familyHistoryPills: textPills.familyHistory,
      allergiesPills: textPills.allergies,
      hmo: newTicketData.hasHMO ? newTicketData.hmo : null,
      status: "Pending",
      createdAt: new Date().toISOString(),
      claimedBy: null,
    };
    setTickets((prev) => [newTicket, ...prev]);
    setShowCreateTicketModal(false);
    setTextPills({
      medicalRecords: [],
      familyHistory: [],
      allergies: [],
    });
    setTextInput({
      medicalRecords: "",
      familyHistory: "",
      allergies: "",
    });
    addNotification(
      "New Ticket",
      `Ticket ${newTicket.id} created via ${newTicket.source}`
    );
  };

  const pendingTickets = filterTicketsByStatus(tickets, "Pending");
  const processingTickets = filterTicketsByStatus(
    tickets,
    "Processing",
    nurseId
  );
  const confirmedTickets = tickets.filter(
    (t) => t.status === "Confirmed" && t.claimedBy === nurseId
  );

  const generateInvoicePDF = async () => {
    if (!invoiceTicket) return;

    const { default: jsPDF } = await import("jspdf");
    const pdf = new jsPDF();

    const logoUrl = "/okie-doc-logo.png";
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      let displayWidth = 40;
      let displayHeight = displayWidth / (1839 / 544);

      img.onload = () => {
        canvas.width = img.width + 12;
        canvas.height = img.height + 12;

        ctx.shadowColor = "#399eeb";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 63;
        ctx.shadowOffsetY = 80;

        ctx.drawImage(img, 0, 0, img.width, img.height);

        const logoBase64 = canvas.toDataURL("image/png");

        pdf.addImage(logoBase64, "PNG", 85, 10, displayWidth, displayHeight);

        generatePDFContent(pdf);
      };

      img.src = logoUrl;
    } catch {
      generatePDFContent(pdf);
    }
  };

  const generatePDFContent = (pdf) => {
    pdf.setFont("helvetica");

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");

    let yPosition = 35;

    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 150, yPosition);
    pdf.text(`Invoice No: ${invoiceData.invoiceNumber}`, 20, yPosition);

    yPosition += 6;
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        const [y, m, day] = dateStr.split("-");
        if (y && m && day) {
          return `${day}/${m}/${y.slice(-2)}`;
        }
        return dateStr;
      }
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    };

    const formatTime = (timeStr) => {
      if (!timeStr) return "";
      let [h, m] = timeStr.split(":");
      h = Number(h);
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${h}:${m} ${ampm}`;
    };

    pdf.text(
      `Date of Consultation: ${formatDate(
        invoiceTicket.preferredDate
      )} ${formatTime(invoiceTicket.preferredTime)}`,
      20,
      yPosition
    );

    yPosition += 15;
    pdf.setFont("helvetica", "bold");
    pdf.text("PATIENT INFORMATION:", 20, yPosition);

    pdf.setFont("helvetica", "normal");
    yPosition += 8;

    pdf.text(`Name: ${invoiceTicket.patientName}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Mobile Number: ${invoiceTicket.mobile}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Email Address: ${invoiceTicket.email}`, 20, yPosition);

    yPosition += 20;
    pdf.setFont("helvetica", "bold");
    pdf.text("INVOICE ITEMS:", 20, yPosition);

    yPosition += 10;
    pdf.setFont("helvetica", "bold");
    pdf.text("Item", 20, yPosition);
    pdf.text("Description", 70, yPosition);
    pdf.text("Qty", 130, yPosition);
    pdf.text("Amount", 150, yPosition);

    pdf.line(20, yPosition + 2, 180, yPosition + 2);

    pdf.setFont("helvetica", "normal");
    yPosition += 8;
    invoiceData.items.forEach((item) => {
      pdf.text(item.name, 20, yPosition);
      pdf.text(item.description, 70, yPosition);
      pdf.text(item.quantity.toString(), 130, yPosition);
      pdf.text(`PHP ${item.amount}`, 150, yPosition);
      yPosition += 8;
    });

    yPosition += 10;
    pdf.line(20, yPosition, 180, yPosition);
    yPosition += 8;

    pdf.text(`Platform Fee:`, 120, yPosition);
    pdf.text(`PHP ${invoiceData.platformFee}`, 150, yPosition);
    yPosition += 6;

    pdf.text(`E-Nurse Fee:`, 120, yPosition);
    pdf.text(`PHP ${invoiceData.eNurseFee}`, 150, yPosition);
    yPosition += 8;

    pdf.setFont("helvetica", "bold");
    pdf.text(`TOTAL AMOUNT:`, 110, yPosition);
    pdf.text(`PHP ${invoiceTotal.toFixed(2)}`, 150, yPosition);

    yPosition += 15;
    pdf.setFont("helvetica", "normal");
    pdf.text("Payment Link:", 20, yPosition);
    yPosition += 6;
    pdf.setTextColor(0, 0, 255);
    pdf.text(invoiceData.paymentLink, 20, yPosition);
    pdf.setTextColor(0, 0, 0);

    yPosition += 20;
    pdf.line(20, yPosition, 180, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.text("This is a system-generated invoice.", 105, yPosition, {
      align: "center",
    });

    yPosition += 8;
    pdf.text(
      "For inquiries, please contact support@okiedocplus.com",
      105,
      yPosition,
      {
        align: "center",
      }
    );

    pdf.save(`Invoice_${invoiceData.invoiceNumber || "OkieDoc"}.pdf`);
  };

  const handleDownloadInvoice = () => {
    generateInvoicePDF();
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
        <h3 className="dashboard-title">Manage Appointments</h3>
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
          <button className="nav-tab active">Manage Appointments</button>
          <button
            className="nav-tab"
            onClick={() => navigate("/nurse-messages")}
          >
            Messages
          </button>
          <button
            className="nav-tab"
            onClick={() => navigate("/nurse-notifications")}
          >
            Notifications ({notifications.filter((n) => n.unread).length})
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
                <div
                  className="ticket-actions"
                  style={{ display: "flex", gap: 8 }}
                >
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
                  <button
                    className="action-btn"
                    style={{ marginLeft: "auto" }}
                    onClick={() => setShowConsultationHistory(true)}
                  >
                    View Consultation History
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
                <div
                  className="ticket-actions"
                  style={{ display: "flex", gap: 8 }}
                >
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
                  <button
                    className="action-btn"
                    style={{ marginLeft: "auto" }}
                    onClick={() => setShowConsultationHistory(true)}
                  >
                    View Consultation History
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showConsultationHistory && (
            <div className="modal-overlay">
              <div className="ticket-modal">
                <div className="modal-header">
                  <h2>Consultation History</h2>
                  <button
                    onClick={() => setShowConsultationHistory(false)}
                    className="close-btn"
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <NurseConsultationHistory />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
            <div className="modal-body">
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
                  <div className="info-item">
                    <label>Actual Chief Complaint (Nurse):</label>
                    <span>{selectedTicket.actualChiefComplaint || ""}</span>
                  </div>
                  <div className="info-item">
                    <label>Medical Records:</label>
                    <div className="view-pills-container">
                      {selectedTicket.medicalRecordsPills &&
                      selectedTicket.medicalRecordsPills.length > 0 ? (
                        <div className="view-pills">
                          {selectedTicket.medicalRecordsPills.map(
                            (text, index) => (
                              <div key={index} className="view-pill">
                                <span>{text}</span>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <span>No data</span>
                      )}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Family History:</label>
                    <div className="view-pills-container">
                      {selectedTicket.familyHistoryPills &&
                      selectedTicket.familyHistoryPills.length > 0 ? (
                        <div className="view-pills">
                          {selectedTicket.familyHistoryPills.map(
                            (text, index) => (
                              <div key={index} className="view-pill">
                                <span>{text}</span>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <span>No data</span>
                      )}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Allergies:</label>
                    <div className="view-pills-container">
                      {selectedTicket.allergiesPills &&
                      selectedTicket.allergiesPills.length > 0 ? (
                        <div className="view-pills">
                          {selectedTicket.allergiesPills.map((text, index) => (
                            <div key={index} className="view-pill">
                              <span>{text}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span>No data</span>
                      )}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Smoking:</label>
                    <span>{selectedTicket.smoking || ""}</span>
                  </div>
                  <div className="info-item">
                    <label>Drinking:</label>
                    <span>{selectedTicket.drinking || ""}</span>
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
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginBottom: 12,
                    justifyContent: "center",
                  }}
                >
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
                  <div
                    style={{
                      marginBottom: 12,
                      display: "flex",
                      gap: 16,
                      justifyContent: "center",
                    }}
                  >
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    justifyContent: "center",
                  }}
                >
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

              <div className="ros-info" style={{ marginTop: 24 }}>
                <h3>Review of Systems</h3>
                <div className="info-grid">
                  {selectedTicket.ros &&
                  Object.values(selectedTicket.ros).flat().length > 0 ? (
                    Object.values(selectedTicket.ros)
                      .flat()
                      .map((item, idx) => (
                        <div key={idx} className="info-item">
                          <span>{item}</span>
                        </div>
                      ))
                  ) : (
                    <div className="info-item">No ROS data provided.</div>
                  )}
                </div>
              </div>

              <div className="painmap-info" style={{ marginTop: 24 }}>
                <h3>Pain Map</h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/1506_Referred_Pain_Chart.jpg/1280px-1506_Referred_Pain_Chart.jpg"
                    alt="Pain Map"
                    style={{
                      height: 180,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                      background: "#fff",
                      marginBottom: 12,
                    }}
                  />
                  <div style={{ textAlign: "center" }}>
                    {selectedTicket.painMap &&
                    selectedTicket.painMap.length > 0 ? (
                      selectedTicket.painMap.map((area, idx) => (
                        <div key={idx} className="info-item">
                          <span>{area}</span>
                        </div>
                      ))
                    ) : (
                      <div className="info-item">No pain areas selected.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="ticket-actions" style={{ marginTop: 12 }}>
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
            <div className="modal-body" style={{ padding: 20, opacity: 1 }}>
              <div className="invoice-info">
                <p>
                  <strong>Invoice No.:</strong> {invoiceData.invoiceNumber}
                </p>
                <p>
                  <strong>Date of Consultation:</strong>{" "}
                  {invoiceTicket?.preferredDate} {invoiceTicket?.preferredTime}
                </p>
                <p>
                  <strong>Patient Name:</strong> {invoiceTicket?.patientName}
                </p>
                <p>
                  <strong>Mobile Number:</strong> {invoiceTicket?.mobile}
                </p>
                <p>
                  <strong>Email Address:</strong> {invoiceTicket?.email}
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
                    Download PDF
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
            <div className="modal-body">
              <div style={{ marginBottom: 24, display: "flex", gap: 16 }}>
                <button
                  className={
                    createTicketTab === "medical" ? "tab-btn active" : "tab-btn"
                  }
                  type="button"
                  onClick={() => setCreateTicketTab("medical")}
                >
                  Medical Info
                </button>
                <button
                  className={
                    createTicketTab === "ros" ? "tab-btn active" : "tab-btn"
                  }
                  type="button"
                  onClick={() => setCreateTicketTab("ros")}
                >
                  Review of Systems (ROS)
                </button>
                <button
                  className={
                    createTicketTab === "painmap" ? "tab-btn active" : "tab-btn"
                  }
                  type="button"
                  onClick={() => setCreateTicketTab("painmap")}
                >
                  Pain Map
                </button>
              </div>
              {createTicketTab === "medical" && (
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
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="actualChiefComplaint">
                          Actual Chief Complaint (Nurse)
                        </label>
                        <textarea
                          id="actualChiefComplaint"
                          name="actualChiefComplaint"
                          rows="2"
                          value={newTicketData.actualChiefComplaint || ""}
                          onChange={(e) =>
                            setNewTicketData({
                              ...newTicketData,
                              actualChiefComplaint: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="medicalRecords">Medical Records</label>
                        <div className="text-input-container">
                          {textPills.medicalRecords.length > 0 && (
                            <div className="text-pills">
                              {textPills.medicalRecords.map((text, index) => (
                                <div key={index} className="text-pill">
                                  <span>{text}</span>
                                  <button
                                    type="button"
                                    className="remove-pill"
                                    onClick={() =>
                                      removeTextPill("medicalRecords", text)
                                    }
                                    aria-label="Remove text"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <input
                            type="text"
                            id="medicalRecords"
                            name="medicalRecords"
                            placeholder="Type and press Enter to add"
                            value={textInput.medicalRecords}
                            onChange={(e) =>
                              setTextInput((prev) => ({
                                ...prev,
                                medicalRecords: e.target.value,
                              }))
                            }
                            onKeyPress={(e) =>
                              handleTextInputKeyPress(e, "medicalRecords")
                            }
                            onBlur={() => {
                              if (textInput.medicalRecords.trim()) {
                                addTextPill(
                                  "medicalRecords",
                                  textInput.medicalRecords
                                );
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="familyHistory">Family History</label>
                        <div className="text-input-container">
                          {textPills.familyHistory.length > 0 && (
                            <div className="text-pills">
                              {textPills.familyHistory.map((text, index) => (
                                <div key={index} className="text-pill">
                                  <span>{text}</span>
                                  <button
                                    type="button"
                                    className="remove-pill"
                                    onClick={() =>
                                      removeTextPill("familyHistory", text)
                                    }
                                    aria-label="Remove text"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <input
                            type="text"
                            id="familyHistory"
                            name="familyHistory"
                            placeholder="Type and press Enter to add"
                            value={textInput.familyHistory}
                            onChange={(e) =>
                              setTextInput((prev) => ({
                                ...prev,
                                familyHistory: e.target.value,
                              }))
                            }
                            onKeyPress={(e) =>
                              handleTextInputKeyPress(e, "familyHistory")
                            }
                            onBlur={() => {
                              if (textInput.familyHistory.trim()) {
                                addTextPill(
                                  "familyHistory",
                                  textInput.familyHistory
                                );
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="allergies">Allergies</label>
                        <div className="text-input-container">
                          {textPills.allergies.length > 0 && (
                            <div className="text-pills">
                              {textPills.allergies.map((text, index) => (
                                <div key={index} className="text-pill">
                                  <span>{text}</span>
                                  <button
                                    type="button"
                                    className="remove-pill"
                                    onClick={() =>
                                      removeTextPill("allergies", text)
                                    }
                                    aria-label="Remove text"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <input
                            type="text"
                            id="allergies"
                            name="allergies"
                            placeholder="Type and press Enter to add"
                            value={textInput.allergies}
                            onChange={(e) =>
                              setTextInput((prev) => ({
                                ...prev,
                                allergies: e.target.value,
                              }))
                            }
                            onKeyPress={(e) =>
                              handleTextInputKeyPress(e, "allergies")
                            }
                            onBlur={() => {
                              if (textInput.allergies.trim()) {
                                addTextPill("allergies", textInput.allergies);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Smoking</label>
                        <div className="checkbox-group">
                          <label className="checkbox-item">
                            <input
                              type="checkbox"
                              name="smoking"
                              value="yes"
                              checked={newTicketData.smoking === "yes"}
                              onChange={(e) =>
                                setNewTicketData({
                                  ...newTicketData,
                                  smoking: e.target.checked ? "yes" : "",
                                })
                              }
                            />
                            <span className="checkmark"></span>
                            Yes
                          </label>
                          <label className="checkbox-item">
                            <input
                              type="checkbox"
                              name="smoking"
                              value="no"
                              checked={newTicketData.smoking === "no"}
                              onChange={(e) =>
                                setNewTicketData({
                                  ...newTicketData,
                                  smoking: e.target.checked ? "no" : "",
                                })
                              }
                            />
                            <span className="checkmark"></span>
                            No
                          </label>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Drinking</label>
                        <div className="checkbox-group">
                          <label className="checkbox-item">
                            <input
                              type="checkbox"
                              name="drinking"
                              value="yes"
                              checked={newTicketData.drinking === "yes"}
                              onChange={(e) =>
                                setNewTicketData({
                                  ...newTicketData,
                                  drinking: e.target.checked ? "yes" : "",
                                })
                              }
                            />
                            <span className="checkmark"></span>
                            Yes
                          </label>
                          <label className="checkbox-item">
                            <input
                              type="checkbox"
                              name="drinking"
                              value="no"
                              checked={newTicketData.drinking === "no"}
                              onChange={(e) =>
                                setNewTicketData({
                                  ...newTicketData,
                                  drinking: e.target.checked ? "no" : "",
                                })
                              }
                            />
                            <span className="checkmark"></span>
                            No
                          </label>
                        </div>
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
                          min={new Date().toISOString().split("T")[0]}
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
                          min={
                            newTicketData.preferredDate ===
                            new Date().toISOString().split("T")[0]
                              ? new Date().toTimeString().slice(0, 5)
                              : undefined
                          }
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
                              hmo: e.target.checked
                                ? prev.hmo || {
                                    company: "",
                                    memberId: "",
                                    expirationDate: "",
                                    loaCode: "",
                                    eLOAFile: null,
                                  }
                                : {
                                    company: "",
                                    memberId: "",
                                    expirationDate: "",
                                    loaCode: "",
                                    eLOAFile: null,
                                  },
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
                                  hmo: {
                                    ...prev.hmo,
                                    memberId: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="hmoExpiration">
                              Expiration Date
                            </label>
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
              )}
              {createTicketTab === "painmap" && (
                <div className="painmap-section">
                  <h3>Pain Map</h3>
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/1506_Referred_Pain_Chart.jpg/1280px-1506_Referred_Pain_Chart.jpg"
                      alt="Pain Map"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: 12,
                        boxShadow: "0 2px 8px rgba(11,83,136,0.07)",
                      }}
                    />
                  </div>
                  <div className="painmap-checklist">
                    <strong
                      style={{
                        display: "block",
                        marginBottom: 10,
                        color: "#2a4d6c",
                      }}
                    >
                      Select pain locations:
                    </strong>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "16px 24px",
                      }}
                    >
                      {painMapFields.map((part) => (
                        <label key={part} className="painmap-item-label">
                          <input
                            type="checkbox"
                            checked={
                              newTicketData.painMap &&
                              newTicketData.painMap.includes(part)
                            }
                            onChange={(e) => {
                              let painMap = newTicketData.painMap || [];
                              if (e.target.checked) {
                                painMap = [...painMap, part];
                              } else {
                                painMap = painMap.filter((p) => p !== part);
                              }
                              setNewTicketData({ ...newTicketData, painMap });
                            }}
                          />
                          {part}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {createTicketTab === "ros" && (
                <div className="ros-section">
                  <h3>Review of Systems</h3>
                  <div style={{ marginBottom: 18 }}>
                    <label className="ros-item-label">
                      <input
                        type="checkbox"
                        checked={newTicketData.rosNone || false}
                        onChange={(e) =>
                          setNewTicketData({
                            ...newTicketData,
                            rosNone: e.target.checked,
                          })
                        }
                      />
                      None apply
                    </label>
                  </div>
                  {Object.entries(rosFields).map(([group, items]) => (
                    <div key={group} className="ros-group">
                      <span className="ros-group-title">
                        {group.charAt(0).toUpperCase() +
                          group.slice(1).replace(/([A-Z])/g, " $1")}
                      </span>
                      <div className="ros-items">
                        {items.map((item) => (
                          <label key={item} className="ros-item-label">
                            <input
                              type="checkbox"
                              checked={
                                newTicketData.ros && newTicketData.ros[group]
                                  ? newTicketData.ros[group].includes(item)
                                  : false
                              }
                              onChange={(e) => {
                                const ros = { ...(newTicketData.ros || {}) };
                                ros[group] = ros[group] || [];
                                if (e.target.checked) {
                                  ros[group] = [...ros[group], item];
                                } else {
                                  ros[group] = ros[group].filter(
                                    (i) => i !== item
                                  );
                                }
                                setNewTicketData({ ...newTicketData, ros });
                              }}
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
