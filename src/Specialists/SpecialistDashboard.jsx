import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  FaHospitalUser,
  FaThLarge,
  FaUser,
  FaCalendarAlt,
  FaFirstAid,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaUpload,
  FaTimes,
} from "react-icons/fa";
import "./SpecialistDashboard.css";

const SpecialistDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [userInitials, setUserInitials] = useState("DR");

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+63 ",
    prcNumber: "",
    specialization: "",
    subSpecialization: "",
    bio: "Board-certified specialist with years of experience.",
    prcImage: "",
    profileImage: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [services, setServices] = useState({
    Consultation: 100,
    "Medical Certificate": 25,
    "Medical Clearance": 75,
  });

  const [accountDetails, setAccountDetails] = useState({
    accountType: "bank",
    accountName: "John Doe",
    accountNumber: "XXXX-XXXX-XXXX-1234",
    gcashNumber: "+63 ",
    gcashQr: "",
  });

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [schedules, setSchedules] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    time: "",
    duration: "30",
    notes: "",
  });

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketFilter, setTicketFilter] = useState("All");

  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingService, setEditingService] = useState({ name: "", fee: 0 });

  // SOAP Notes and Encounter Management
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [encounter, setEncounter] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    referral: "",
    followUp: false,
    medicines: [],
    labRequests: []
  });

  // Medicine prescription form
  const [medForm, setMedForm] = useState({
    brand: "",
    generic: "",
    dosage: "",
    form: "",
    quantity: "",
    instructions: ""
  });

  // Lab request form
  const [labForm, setLabForm] = useState({
    test: "",
    remarks: ""
  });

  // Medical History Requests
  const [mhRequests, setMhRequests] = useState([]);
  const [mhModal, setMhModal] = useState({
    open: false,
    reason: "",
    from: "",
    to: "",
    consent: false
  });

  // Center panel tab (Medicine | Lab)
  const [centerTab, setCenterTab] = useState("medicine");

  const SUB_SPECIALIZATIONS = {
    Cardiology: [
      "Interventional Cardiology",
      "Electrophysiology",
      "Heart Failure",
      "Pediatric Cardiology",
    ],
    Dermatology: [
      "Cosmetic Dermatology",
      "Mohs Surgery",
      "Pediatric Dermatology",
      "Dermatopathology",
    ],
    Orthopedics: [
      "Sports Medicine",
      "Spine Surgery",
      "Hand Surgery",
      "Joint Replacement",
    ],
    Pediatrics: [
      "Neonatology",
      "Pediatric Neurology",
      "Pediatric Cardiology",
      "Pediatric Endocrinology",
    ],
    "Internal Medicine": [
      "Endocrinology",
      "Gastroenterology",
      "Pulmonology",
      "Nephrology",
      "Rheumatology",
      "Infectious Disease",
    ],
    Neurology: ["Stroke", "Epilepsy", "Movement Disorders", "Neuromuscular"],
    Ophthalmology: ["Glaucoma", "Retina", "Cornea", "Pediatric Ophthalmology"],
    "Obstetrics & Gynecology": [
      "Maternal-Fetal Medicine",
      "Reproductive Endocrinology",
      "Gynecologic Oncology",
      "Urogynecology",
    ],
    "Otolaryngology (ENT)": [
      "Rhinology",
      "Laryngology",
      "Otology",
      "Head & Neck Surgery",
    ],
    Psychiatry: [
      "Child & Adolescent",
      "Addiction",
      "Geriatric",
      "Consultation-Liaison",
    ],
    Urology: [
      "Endourology",
      "Urologic Oncology",
      "Pediatric Urology",
      "Female Urology",
    ],
  };

  const formatDateLabel = (dt, timeLabel) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${
      monthNames[dt.getMonth()]
    } ${dt.getDate()}, ${dt.getFullYear()} - ${timeLabel}`;
  };

  const loadTickets = useCallback(() => {
    const savedTickets = localStorage.getItem("specialistTickets");
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    } else {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const plusDays = (n) =>
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

      const defaultTickets = [
        {
          id: "TKT-001",
          patient: "John Doe",
          service: "Consultation",
          when: formatDateLabel(plusDays(0), "10:30 AM"),
          status: "Confirmed",
        },
        {
          id: "TKT-002",
          patient: "Jane Smith",
          service: "Medical Certificate",
          when: formatDateLabel(plusDays(1), "2:15 PM"),
          status: "Pending",
        },
        {
          id: "TKT-003",
          patient: "Robert Johnson",
          service: "Medical Clearance",
          when: formatDateLabel(plusDays(2), "9:00 AM"),
          status: "Confirmed",
        },
      ];

      setTickets(defaultTickets);
      localStorage.setItem("specialistTickets", JSON.stringify(defaultTickets));
    }
  }, []);

  useEffect(() => {
    document.body.classList.add("specialist-dashboard-body");

    const email = localStorage.getItem("currentSpecialistEmail");
    if (!email) {
      navigate("/login");
      return;
    }

    let user = JSON.parse(localStorage.getItem(email) || "{}");
    if (!user.fName) {
      user = {
        fName: "Dr. John",
        lName: "Specialist",
        password: "password123",
      };
      localStorage.setItem(email, JSON.stringify(user));
    }

    setCurrentUser(user);

    const initials = (
      (user.fName || "D")[0] + (user.lName || "S")[0]
    ).toUpperCase();
    setUserInitials(initials);

    const profile = JSON.parse(
      localStorage.getItem("profile:" + email) || "{}"
    );
    setProfileData((prev) => ({
      ...prev,
      firstName: user.fName || "",
      lastName: user.lName || "",
      email: email,
      phone: profile.phone || "+63 ",
      prcNumber: profile.prcNumber || "",
      specialization: profile.specialization || "",
      subSpecialization: profile.subSpecialization || "",
      bio:
        profile.bio || "Board-certified specialist with years of experience.",
      prcImage: profile.prcImage || "",
      profileImage: profile.profileImage || "",
    }));

    const savedServices = JSON.parse(
      localStorage.getItem("services:" + email) || "{}"
    );
    setServices((prev) => ({ ...prev, ...savedServices }));

    const savedAccount = JSON.parse(
      localStorage.getItem("account:" + email) || "{}"
    );
    setAccountDetails((prev) => ({ ...prev, ...savedAccount }));

    const savedSchedules = JSON.parse(
      localStorage.getItem("schedule:" + email) || "{}"
    );
    setSchedules(savedSchedules);

    loadTickets();

    return () => {
      document.body.classList.remove("specialist-dashboard-body");
    };
  }, [navigate, loadTickets]);

  // Handle ticket selection and encounter loading
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  useEffect(() => {
    if (selectedTicketId) {
      const data = readEncounter(selectedTicketId);
      if (data) {
        setEncounter(data);
      } else {
        setEncounter({
          subjective: "",
          objective: "",
          assessment: "",
          plan: "",
          referral: "",
          followUp: false,
          medicines: [],
          labRequests: []
        });
      }
      setMhRequests(readMh(selectedTicketId));
    }
  }, [selectedTicketId]);

  const handleNavigation = (target, title) => {
    setActiveTab(target);
    setPageTitle(title);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("currentSpecialistEmail");
      navigate("/");
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = () => {
    const email = localStorage.getItem("currentSpecialistEmail");
    if (!email) return;

    const user = JSON.parse(localStorage.getItem(email) || "{}");
    user.fName = profileData.firstName || user.fName;
    user.lName = profileData.lastName || user.lName;
    localStorage.setItem(email, JSON.stringify(user));

    const profile = {
      phone: profileData.phone,
      prcNumber: profileData.prcNumber,
      specialization: profileData.specialization,
      subSpecialization: profileData.subSpecialization,
      bio: profileData.bio,
      prcImage: profileData.prcImage,
      profileImage: profileData.profileImage,
    };
    localStorage.setItem("profile:" + email, JSON.stringify(profile));

    setCurrentUser(user);
    const initials = (
      (user.fName || "D")[0] + (user.lName || "R")[0]
    ).toUpperCase();
    setUserInitials(initials);

    alert("Profile saved successfully.");
  };

  const updatePassword = () => {
    const email = localStorage.getItem("currentSpecialistEmail");
    if (!email) return;

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 3) {
      alert("New password must be at least 3 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    const user = JSON.parse(localStorage.getItem(email) || "{}");
    if (!user || user.password !== currentPassword) {
      alert("Current password is incorrect.");
      return;
    }

    user.password = newPassword;
    localStorage.setItem(email, JSON.stringify(user));

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    alert("Password updated successfully.");
  };

  const openEditServiceModal = (name, fee) => {
    setEditingService({ name, fee });
    setShowEditServiceModal(true);
  };

  const updateServiceFee = () => {
    const newFee = parseFloat(editingService.fee);
    if (isNaN(newFee) || newFee < 0) {
      alert("Please enter a valid fee.");
      return;
    }

    const email = localStorage.getItem("currentSpecialistEmail");
    const updatedServices = { ...services, [editingService.name]: newFee };
    setServices(updatedServices);
    localStorage.setItem("services:" + email, JSON.stringify(updatedServices));
    setShowEditServiceModal(false);
  };

  const saveAccountDetails = () => {
    const email = localStorage.getItem("currentSpecialistEmail");
    localStorage.setItem("account:" + email, JSON.stringify(accountDetails));
    alert("Account details saved.");
  };

  const viewTicket = (ticketId) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
      setShowTicketModal(true);
    }
  };

  const updateTicketStatus = (newStatus) => {
    if (!selectedTicket) return;

    const updatedTickets = tickets.map((t) =>
      t.id === selectedTicket.id ? { ...t, status: newStatus } : t
    );
    setTickets(updatedTickets);
    localStorage.setItem("specialistTickets", JSON.stringify(updatedTickets));
    setSelectedTicket({ ...selectedTicket, status: newStatus });
  };

  // Encounter Management Functions
  const getEncounterKey = (ticketId) => `encounter:${ticketId}`;
  
  const readEncounter = (ticketId) => {
    if (!ticketId) return null;
    try {
      return JSON.parse(localStorage.getItem(getEncounterKey(ticketId)) || 'null');
    } catch {
      return null;
    }
  };

  const writeEncounter = (ticketId, data) => {
    if (!ticketId) return;
    localStorage.setItem(getEncounterKey(ticketId), JSON.stringify(data));
  };

  const saveEncounter = (updated) => {
    const next = { ...encounter, ...(updated || {}) };
    setEncounter(next);
    if (selectedTicketId) writeEncounter(selectedTicketId, next);
  };

  // Medicine Management
  const addMedicine = () => {
    const payload = { ...medForm };
    if (!payload.brand && !payload.generic) {
      alert('Enter medicine brand or generic.');
      return;
    }
    if (!payload.instructions) {
      alert('Enter instructions.');
      return;
    }
    const list = (encounter.medicines || []).slice();
    list.push(payload);
    setMedForm({ brand: "", generic: "", dosage: "", form: "", quantity: "", instructions: "" });
    saveEncounter({ medicines: list });
  };

  const removeMedicine = (idx) => {
    const list = (encounter.medicines || []).slice();
    list.splice(idx, 1);
    saveEncounter({ medicines: list });
  };

  // Lab Request Management
  const addLab = () => {
    const test = (labForm.test || '').trim();
    const remarks = (labForm.remarks || '').trim();
    if (!test) {
      alert('Enter a lab test.');
      return;
    }
    const list = Array.isArray(encounter.labRequests) ? encounter.labRequests.slice() : [];
    list.push({ test, remarks });
    setLabForm({ test: "", remarks: "" });
    saveEncounter({ labRequests: list });
  };

  const removeLab = (idx) => {
    const list = (encounter.labRequests || []).slice();
    list.splice(idx, 1);
    saveEncounter({ labRequests: list });
  };

  // Medical History Management
  const mhKey = (ticketId) => `mh:${ticketId}`;
  
  const readMh = (ticketId) => {
    try {
      return JSON.parse(localStorage.getItem(mhKey(ticketId)) || '[]');
    } catch {
      return [];
    }
  };

  const writeMh = (ticketId, items) => {
    localStorage.setItem(mhKey(ticketId), JSON.stringify(items || []));
  };

  const openMhModal = () => {
    setMhModal({ open: true, reason: "", from: "", to: "", consent: false });
  };

  const submitMh = () => {
    if (!mhModal.consent) {
      alert('Please confirm consent.');
      return;
    }
    const item = {
      id: 'MH-' + Date.now(),
      reason: (mhModal.reason || '').trim(),
      from: mhModal.from || '',
      to: mhModal.to || '',
      consent: true,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    const list = readMh(selectedTicketId).concat([item]);
    writeMh(selectedTicketId, list);
    setMhRequests(list);
    setMhModal({ open: false, reason: "", from: "", to: "", consent: false });
    downloadMhPdf(item);
  };

  const updateMhStatus = (id, status) => {
    const list = readMh(selectedTicketId).map(x => 
      x.id === id ? { ...x, status, updatedAt: new Date().toISOString() } : x
    );
    writeMh(selectedTicketId, list);
    setMhRequests(list);
  };

  const downloadMhPdf = (item) => {
    const t = tickets.find(x => x.id === selectedTicketId) || {};
    const html = `
      <h1>Medical History Request</h1>
      <div class="meta">
        <div><strong>Patient:</strong> ${t.patient || ''}</div>
        <div><strong>Ticket:</strong> ${selectedTicketId || ''}</div>
        <div><strong>Created:</strong> ${new Date(item.createdAt).toLocaleString()}</div>
        <div><strong>Status:</strong> ${item.status}</div>
      </div>
      <div class="box">
        <div><strong>Reason:</strong> ${item.reason || '—'}</div>
        <div><strong>Date range:</strong> ${item.from || '—'} to ${item.to || '—'}</div>
        <div><strong>Consent:</strong> Yes</div>
      </div>
    `;
    openPrintWindow(html);
  };

  const openPrintWindow = (html) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(`<!DOCTYPE html><html><head><title>Medical History Request</title><style>
      body{font-family:Poppins,Arial,sans-serif;padding:24px;color:#111}
      h1{font-size:20px;margin-bottom:8px}
      h2{font-size:16px;margin:10px 0}
      .meta div{margin:4px 0}
      .box{background:#f2f2f2;padding:16px;border-radius:10px}
    </style></head><body>${html}</body></html>`);
    w.document.close();
    setTimeout(() => { try { w.focus(); w.print(); } catch(e){} }, 300);
  };

  const filteredTickets = useMemo(() => {
    if (ticketFilter === "All") return tickets;
    return tickets.filter(
      (t) => t.status.toLowerCase() === ticketFilter.toLowerCase()
    );
  }, [tickets, ticketFilter]);

  const getStatusBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed" || s === "processing" || s === "completed")
      return "status-confirmed";
    if (s === "pending") return "status-pending";
    return "status-pending";
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const getMonthName = (month) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[month];
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const addSchedule = () => {
    if (!selectedDate || !scheduleData.time) {
      alert("Please select a date and time.");
      return;
    }

    const email = localStorage.getItem("currentSpecialistEmail");
    const dateKey = formatDateKey(currentYear, currentMonth, selectedDate);
    const newSchedule = {
      time: scheduleData.time,
      duration: parseInt(scheduleData.duration),
      notes: scheduleData.notes || "Available for consultation",
      id: Date.now(),
    };

    const updatedSchedules = {
      ...schedules,
      [dateKey]: [...(schedules[dateKey] || []), newSchedule],
    };

    setSchedules(updatedSchedules);
    localStorage.setItem("schedule:" + email, JSON.stringify(updatedSchedules));

    setShowScheduleModal(false);
    setSelectedDate(null);
    setScheduleData({ time: "", duration: "30", notes: "" });
  };

  const deleteSchedule = (dateKey, scheduleId) => {
    const email = localStorage.getItem("currentSpecialistEmail");
    const updatedSchedules = {
      ...schedules,
      [dateKey]: schedules[dateKey].filter((s) => s.id !== scheduleId),
    };

    if (updatedSchedules[dateKey].length === 0) {
      delete updatedSchedules[dateKey];
    }

    setSchedules(updatedSchedules);
    localStorage.setItem("schedule:" + email, JSON.stringify(updatedSchedules));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === currentYear && today.getMonth() === currentMonth;

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(currentYear, currentMonth, day);
      const hasSchedule = schedules[dateKey] && schedules[dateKey].length > 0;
      
      // Check for confirmed tickets on this date
      const dayTickets = tickets.filter(ticket => {
        if (ticket.status !== 'Confirmed') return false;
        
        // Parse the ticket date from the "when" field
        const ticketDateStr = ticket.when;
        if (!ticketDateStr) return false;
        
        // Extract date from format like "January 15, 2024 - 10:30 AM"
        const dateMatch = ticketDateStr.match(/(\w+)\s+(\d+),\s+(\d+)/);
        if (!dateMatch) return false;
        
        const [, monthName, dayStr, yearStr] = dateMatch;
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        const ticketMonth = monthNames.indexOf(monthName);
        const ticketDay = parseInt(dayStr);
        const ticketYear = parseInt(yearStr);
        
        return ticketYear === currentYear && ticketMonth === currentMonth && ticketDay === day;
      });
      
      const hasTickets = dayTickets.length > 0;
      const totalItems = (schedules[dateKey]?.length || 0) + dayTickets.length;
      
      const isToday = isCurrentMonth && today.getDate() === day;
      const isPast =
        new Date(currentYear, currentMonth, day) <
        new Date(today.getFullYear(), today.getMonth(), today.getDate());

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasSchedule || hasTickets ? "has-schedule" : ""} ${
            isToday ? "today" : ""
          } ${isPast ? "past" : ""} ${hasTickets ? "has-tickets" : ""}`}
          onClick={() => !isPast && setSelectedDate(day)}
        >
          <span className="day-number">{day}</span>
          {totalItems > 0 && (
            <div className="schedule-indicator">
              {totalItems}
            </div>
          )}
          {hasTickets && (
            <div className="ticket-indicator">
              T
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const renderSchedules = () => (
    <div className="dashboard-content schedule-page">
      <div className="schedule-container">
        <div className="schedule-layout">
          <div className="calendar-main">
            <div className="calendar-header">
              <button
                className="calendar-nav"
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
              >
                ‹
              </button>
              <h2>
                {getMonthName(currentMonth)} {currentYear}
              </h2>
              <button
                className="calendar-nav"
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
              >
                ›
              </button>
            </div>

            <div className="calendar">
              <div className="calendar-weekdays">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="weekday">
                    {day}
                  </div>
                ))}
              </div>
              <div className="calendar-days">{renderCalendar()}</div>
            </div>
          </div>

          {selectedDate && (
            <div className="selected-date-panel">
              <h3>
                {getMonthName(currentMonth)} {selectedDate}, {currentYear}
              </h3>
              <button
                className="btn-primary"
                onClick={() => setShowScheduleModal(true)}
              >
                Add Schedule
              </button>

              <div className="day-schedules">
              {/* Show confirmed tickets for this day */}
              {(() => {
                const dayTickets = tickets.filter(ticket => {
                  if (ticket.status !== 'Confirmed') return false;
                  
                  const ticketDateStr = ticket.when;
                  if (!ticketDateStr) return false;
                  
                  const dateMatch = ticketDateStr.match(/(\w+)\s+(\d+),\s+(\d+)/);
                  if (!dateMatch) return false;
                  
                  const [, monthName, dayStr, yearStr] = dateMatch;
                  const monthNames = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ];
                  const ticketMonth = monthNames.indexOf(monthName);
                  const ticketDay = parseInt(dayStr);
                  const ticketYear = parseInt(yearStr);
                  
                  return ticketYear === currentYear && ticketMonth === currentMonth && ticketDay === selectedDate;
                });

                return dayTickets.map((ticket) => {
                  // Extract time from ticket.when
                  const timeMatch = ticket.when.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
                  const ticketTime = timeMatch ? timeMatch[1] : 'Time TBD';
                  
                  return (
                    <div key={`ticket-${ticket.id}`} className="schedule-item ticket-item">
                      <div className="schedule-time">{ticketTime}</div>
                      <div className="schedule-duration">Consultation</div>
                      <div className="schedule-notes">
                        <strong>Patient:</strong> {ticket.patient}<br />
                        <strong>Service:</strong> {ticket.service}
                      </div>
                      <div className="ticket-badge">Ticket</div>
                    </div>
                  );
                });
              })()}

              {/* Show regular schedules */}
              {schedules[
                formatDateKey(currentYear, currentMonth, selectedDate)
              ]?.map((schedule) => (
                <div key={schedule.id} className="schedule-item">
                  <div className="schedule-time">{schedule.time}</div>
                  <div className="schedule-duration">
                    {schedule.duration} mins
                  </div>
                  <div className="schedule-notes">{schedule.notes}</div>
                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteSchedule(
                        formatDateKey(currentYear, currentMonth, selectedDate),
                        schedule.id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              ))}

              {/* Show message if no items */}
              {!schedules[formatDateKey(currentYear, currentMonth, selectedDate)]?.length && 
               !tickets.some(ticket => {
                 if (ticket.status !== 'Confirmed') return false;
                 const ticketDateStr = ticket.when;
                 if (!ticketDateStr) return false;
                 const dateMatch = ticketDateStr.match(/(\w+)\s+(\d+),\s+(\d+)/);
                 if (!dateMatch) return false;
                 const [, monthName, dayStr, yearStr] = dateMatch;
                 const monthNames = [
                   "January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"
                 ];
                 const ticketMonth = monthNames.indexOf(monthName);
                 const ticketDay = parseInt(dayStr);
                 const ticketYear = parseInt(yearStr);
                 return ticketYear === currentYear && ticketMonth === currentMonth && ticketDay === selectedDate;
               }) && (
                <p>No schedules or appointments for this day</p>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTickets = () => {
    if (filteredTickets.length === 0) {
      return (
        <div style={{ padding: "1rem", color: "#7A7A7A" }}>
          No tickets found.
        </div>
      );
    }

    return filteredTickets.map((ticket) => (
      <div key={ticket.id} className="ticket-row">
        <div>{ticket.patient}</div>
        <div>{ticket.service}</div>
        <div>{ticket.when}</div>
        <div>
          <span
            className={`status-badge ${getStatusBadgeClass(ticket.status)}`}
          >
            {ticket.status}
          </span>
        </div>
        <div>
          <button className="action-btn" onClick={() => viewTicket(ticket.id)}>
            View
          </button>
        </div>
      </div>
    ));
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="chart-layout">
        <div className="panel">
          <div className="left-col-header">
            <div style={{ fontWeight: 700 }}>Tickets</div>
          </div>
          <div style={{ padding: '12px 10px' }}>
            <div className="filters two-col" style={{ marginRight: '0' }}>
              {['All Tickets','Pending','Confirmed','Completed'].map(label => (
                <div key={label} className={`filter-item ${ticketFilter === (label === 'All Tickets' ? 'All' : label) ? 'active' : ''}`} onClick={() => setTicketFilter(label === 'All Tickets' ? 'All' : label)}>{label}</div>
        ))}
      </div>
            {filteredTickets.length === 0 ? (
              <div style={{ padding: '1rem', color: '#7A7A7A' }}>No tickets found.</div>
            ) : (
              filteredTickets.map(t => (
                <div key={t.id} className={`sidebar-ticket ${selectedTicketId === t.id ? 'active' : ''}`} onClick={() => setSelectedTicketId(t.id)}>
                  <div className="name">{t.patient}</div>
                  <div className="meta">{t.id} • {t.service}</div>
                  <div className="meta">{t.when}</div>
                  <div style={{ marginTop:8, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span className={`status-badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span>
                    <button className="edit-btn small" onClick={(e) => { e.stopPropagation(); viewTicket(t.id); }}>Details</button>
        </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-body">
            {(() => {
              const t = tickets.find(x => x.id === selectedTicketId);
              if (!t) return <div style={{ color:'#7A7A7A' }}>Select a ticket to start.</div>;
              return (
                <div>
                  <div style={{ fontWeight:700, fontSize:'18px', marginBottom:'8px' }}>Name: {t.patient}</div>
                  <div style={{ marginBottom:'6px' }}>Birthday: June 19, 1988</div>
                  <div style={{ marginBottom:'6px' }}>Mobile Number: 09377413567</div>
                  <div style={{ marginBottom:'14px' }}>Email Address: johnsantos@gmail.com</div>
                  <div style={{ fontWeight:700, marginBottom:'12px' }}>Chief Complaint: Headache</div>
                  <div>
                    <div className="tabbar" style={{ marginBottom:'12px' }}>
                      <button className={centerTab==='medicine'?'active':''} onClick={()=>setCenterTab('medicine')}>Medicine</button>
                      <button className={centerTab==='lab'?'active':''} onClick={()=>setCenterTab('lab')}>Lab Request</button>
                      <div style={{ marginLeft:'auto' }}>
                        <button className="request-btn" onClick={openMhModal}>Request Medical History</button>
                      </div>
                    </div>
                    {centerTab === 'medicine' ? (
                      <div>
                        <div className="grid-2">
                          <div>
                            <div style={{ fontWeight:600 }}>Brand</div>
                            <input className="input-sm pill" value={medForm.brand} onChange={(e)=> setMedForm(m=>({...m, brand:e.target.value}))} />
                          </div>
                          <div>
                            <div style={{ fontWeight:600 }}>Generic</div>
                            <input className="input-sm pill" value={medForm.generic} onChange={(e)=> setMedForm(m=>({...m, generic:e.target.value}))} />
                          </div>
                          <div>
                            <div style={{ fontWeight:600 }}>Dosage</div>
                            <input className="input-sm pill" value={medForm.dosage} onChange={(e)=> setMedForm(m=>({...m, dosage:e.target.value}))} />
                          </div>
                          <div>
                            <div style={{ fontWeight:600 }}>Form</div>
                            <input className="input-sm pill" value={medForm.form} onChange={(e)=> setMedForm(m=>({...m, form:e.target.value}))} />
                          </div>
                          <div>
                            <div style={{ fontWeight:600 }}>Quantity</div>
                            <input className="input-sm pill" value={medForm.quantity} onChange={(e)=> setMedForm(m=>({...m, quantity:e.target.value}))} />
                          </div>
                          <div>
                            <div style={{ fontWeight:600 }}>Instructions</div>
                            <input className="input-sm pill" value={medForm.instructions} onChange={(e)=> setMedForm(m=>({...m, instructions:e.target.value}))} />
                          </div>
                        </div>
                        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'10px' }}>
                          <button className="tiny-btn plus-black" title="Add medicine" onClick={addMedicine}>+</button>
                        </div>
                        <div className="prescription-list">
                          {(encounter.medicines || []).length === 0 ? (
                            <div style={{ color:'#555' }}>No medicines added yet.</div>
                          ) : (
                            <ol className="rx-list">
                              {(encounter.medicines || []).map((m, idx) => (
                                <li key={idx} className="prescription-item">
                                  <div className="rx-item-title">{(m.brand || m.generic)}{m.dosage?` ${m.dosage}`:''}{m.form?`/ ${m.form}`:''}{m.quantity?` (Qty: ${m.quantity})`:''}</div>
                                  <div className="rx-sig">Sig: {m.instructions}</div>
                                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                                    <button className="edit-btn" onClick={() => removeMedicine(idx)}>Remove</button>
                                  </div>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="grid-2">
                          <div>
                            <div style={{ fontWeight:600 }}>Lab Test</div>
                            <input className="input-sm pill" value={labForm.test} onChange={(e)=> setLabForm(f=>({...f, test:e.target.value}))} />
                          </div>
                          <div>
                            <div style={{ fontWeight:600 }}>Remarks</div>
                            <input className="input-sm pill" value={labForm.remarks} onChange={(e)=> setLabForm(f=>({...f, remarks:e.target.value}))} />
                          </div>
                        </div>
                        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'10px' }}>
                          <button className="tiny-btn plus-black" title="Add lab request" onClick={addLab}>+</button>
                        </div>
                        <div className="prescription-list">
                          {(encounter.labRequests || []).length === 0 ? (
                            <div style={{ color:'#555' }}>No lab requests added yet.</div>
                          ) : (
                            <ol className="lab-list">
                              {(encounter.labRequests || []).map((l, idx) => (
                                <li className="prescription-item" key={idx}>
                                  <div className="rx-item-title">{l.test}</div>
                                  <div className="rx-sig">Remarks: {l.remarks || 'N/A'}</div>
                                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                                    <button className="edit-btn" onClick={() => removeLab(idx)}>Remove</button>
                                  </div>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="panel">
          <div className="panel-body soap-section">
            <div className="right-label">Subjective:</div>
            <textarea className="input-lg" value={encounter.subjective} onChange={(e)=> saveEncounter({ subjective: e.target.value })}></textarea>
            <div className="right-label">Objective:</div>
            <textarea className="input-lg" value={encounter.objective} onChange={(e)=> saveEncounter({ objective: e.target.value })}></textarea>
            <div className="right-label">Assessment:</div>
            <textarea className="input-lg" value={encounter.assessment} onChange={(e)=> saveEncounter({ assessment: e.target.value })}></textarea>
            <div className="right-label">Plan:</div>
            <textarea className="input-lg" value={encounter.plan} onChange={(e)=> saveEncounter({ plan: e.target.value })}></textarea>
            <div className="right-label">Referral:</div>
            <textarea className="input-lg" value={encounter.referral} onChange={(e)=> saveEncounter({ referral: e.target.value })}></textarea>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'8px' }}>
              <div>Follow up?</div>
              <input type="checkbox" checked={!!encounter.followUp} onChange={(e) => saveEncounter({ followUp: e.target.checked })} />
              <button className="btn-primary" style={{ marginLeft:'auto' }} onClick={() => { saveEncounter({}); alert('Encounter saved.'); }}>Save Encounter</button>
            </div>
          </div>
        </div>
      </div>

      {/* Medical history requests list below center section for visibility */}
      <div className="prescription-list" style={{ marginTop:'16px' }}>
        <h4 style={{ marginBottom:'8px' }}>Medical History Requests</h4>
        {mhRequests.length === 0 ? (
          <div style={{ color:'#555' }}>No requests yet.</div>
        ) : (
          <div className="lab-list">
            {mhRequests.map((r, index)=> (
              <div key={r.id} className="prescription-item" style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '12px', 
                marginBottom: '12px',
                backgroundColor: '#fff'
              }}>
                <div className="rx-item-title" style={{ marginBottom: '8px' }}>
                  {index + 1}. {new Date(r.createdAt).toLocaleDateString()} — {r.status}
                </div>
                {r.reason && <div className="rx-sig" style={{ marginBottom: '4px' }}>Reason: {r.reason}</div>}
                {(r.from || r.to) && <div className="rx-sig" style={{ marginBottom: '8px' }}>Range: {r.from || '—'} to {r.to || '—'}</div>}
                <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                  {r.status !== 'Fulfilled' && r.status !== 'Cancelled' && (
                    <button className="btn-primary" onClick={()=> updateMhStatus(r.id, 'Fulfilled')}>Mark Fulfilled</button>
                  )}
                  <button className="edit-btn" onClick={()=> downloadMhPdf(r)}>Download PDF</button>
                  {r.status !== 'Cancelled' && (
                    <button className="edit-btn" onClick={()=> updateMhStatus(r.id, 'Cancelled')}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="dashboard-content">
      <div className="profile-section">
        <h2 className="section-title">Personal Information</h2>
        <div className="profile-image-upload">
          <img
            src={profileData.profileImage || "/placeholder-avatar.png"}
            alt="Profile"
            className="profile-img"
          />
          <div>
            <label htmlFor="profile-photo-upload" className="upload-btn">
              <FaUpload /> Upload Photo
            </label>
            <input
              id="profile-photo-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    handleProfileChange("profileImage", e.target.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="input-group">
            <label>First Name</label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => handleProfileChange("firstName", e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Last Name</label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => handleProfileChange("lastName", e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={profileData.email} readOnly />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleProfileChange("phone", e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>PRC License Number</label>
            <input
              type="text"
              value={profileData.prcNumber}
              onChange={(e) => handleProfileChange("prcNumber", e.target.value)}
              placeholder="e.g., 1234567"
            />
          </div>
          <div className="profile-image-upload">
            <img
              src={profileData.prcImage || "/placeholder-document.png"}
              alt="PRC License"
              className="profile-img"
            />
            <div>
              <label htmlFor="prc-license-upload" className="upload-btn">
                <FaUpload /> Upload PRC License Photo
              </label>
              <input
                id="prc-license-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      handleProfileChange("prcImage", e.target.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ display: "none" }}
              />
            </div>
          </div>
          <div className="input-group full-width">
            <label>Specialization</label>
            <select
              value={profileData.specialization}
              onChange={(e) => {
                handleProfileChange("specialization", e.target.value);
                handleProfileChange("subSpecialization", "");
              }}
            >
              <option value="">Select specialization</option>
              {Object.keys(SUB_SPECIALIZATIONS).map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group full-width">
            <label>Sub Specialization</label>
            <select
              value={profileData.subSpecialization}
              onChange={(e) =>
                handleProfileChange("subSpecialization", e.target.value)
              }
            >
              <option value="">Select sub specialization</option>
              {(SUB_SPECIALIZATIONS[profileData.specialization] || []).map(
                (subSpec) => (
                  <option key={subSpec} value={subSpec}>
                    {subSpec}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="input-group full-width">
            <label>Bio</label>
            <textarea
              rows="4"
              value={profileData.bio}
              onChange={(e) => handleProfileChange("bio", e.target.value)}
            />
          </div>
          <div className="full-width">
            <button type="button" className="btn-primary" onClick={saveProfile}>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="profile-section" style={{ marginTop: "2rem" }}>
        <h2 className="section-title">Change Password</h2>
        <div className="form-grid">
          <div className="input-group">
            <label>Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
            />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                handlePasswordChange("newPassword", e.target.value)
              }
            />
          </div>
          <div className="input-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
            />
          </div>
          <div className="full-width">
            <button
              type="button"
              className="btn-primary"
              onClick={updatePassword}
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="dashboard-content">
      <div className="services-container">
        <h2 className="section-title">Professional Fees</h2>
        <div>
          {Object.entries(services).map(([name, fee]) => (
            <div key={name} className="service-item">
              <div className="service-info">
                <div className="service-name">{name}</div>
                <div className="service-fee">₱{Number(fee).toFixed(2)}</div>
              </div>
              <button
                className="edit-btn"
                onClick={() => openEditServiceModal(name, fee)}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="services-container" style={{ marginTop: "2rem" }}>
        <h2 className="section-title">Disbursement Account</h2>
        <div className="form-grid">
          <div className="input-group">
            <label>Account Type</label>
            <select
              value={accountDetails.accountType}
              onChange={(e) =>
                setAccountDetails((prev) => ({
                  ...prev,
                  accountType: e.target.value,
                }))
              }
            >
              <option value="bank">Bank Account</option>
              <option value="gcash">GCash</option>
            </select>
          </div>
          {accountDetails.accountType === "bank" ? (
            <>
              <div className="input-group">
                <label>Account Name</label>
                <input
                  type="text"
                  value={accountDetails.accountName}
                  onChange={(e) =>
                    setAccountDetails((prev) => ({
                      ...prev,
                      accountName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="input-group">
                <label>Account Number</label>
                <input
                  type="text"
                  value={accountDetails.accountNumber}
                  onChange={(e) =>
                    setAccountDetails((prev) => ({
                      ...prev,
                      accountNumber: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={accountDetails.gcashNumber}
                  onChange={(e) =>
                    setAccountDetails((prev) => ({
                      ...prev,
                      gcashNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="profile-image-upload">
                <img
                  src={accountDetails.gcashQr || "/placeholder-qr.png"}
                  alt="GCash QR"
                  className="profile-img"
                />
                <div>
                  <label htmlFor="gcash-qr-upload" className="upload-btn">
                    <FaUpload /> Upload GCash QR
                  </label>
                  <input
                    id="gcash-qr-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setAccountDetails((prev) => ({
                            ...prev,
                            gcashQr: e.target.result,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button className="btn-primary" onClick={saveAccountDetails}>
            Save Account Details
          </button>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="dashboard-content">
      <div className="services-container">
        <h2 className="section-title">Payments to be Disbursed</h2>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Patient</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TKT-001</td>
              <td>John Doe</td>
              <td>Consultation</td>
              <td>₱100.00</td>
              <td>
                <span className="status-badge status-pending">Pending</span>
              </td>
            </tr>
            <tr>
              <td>TKT-003</td>
              <td>Robert Johnson</td>
              <td>Medical Clearance</td>
              <td>₱75.00</td>
              <td>
                <span className="status-badge status-confirmed">
                  Processing
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="services-container" style={{ marginTop: "2rem" }}>
        <h2 className="section-title">HMO Transactions</h2>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Patient</th>
              <th>Service</th>
              <th>HMO Provider</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TKT-002</td>
              <td>Jane Smith</td>
              <td>Medical Certificate</td>
              <td>Maxicare</td>
              <td>
                <span className="status-badge status-pending">
                  Verification
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="specialist-dashboard">
      <div className="sidebar">
        <div className="logo-container">
          <div className="logo">
            <img src="/okie-doc-logo.png" alt="Okiedoc+" className="logo-img" />
          </div>
        </div>

        <div className="nav-menu">
          <div
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => handleNavigation("dashboard", "Dashboard")}
          >
            <FaThLarge />
            <span className="nav-text">Dashboard</span>
          </div>
          <div
            className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => handleNavigation("profile", "Personal Data")}
          >
            <FaUser />
            <span className="nav-text">Personal Data</span>
          </div>
          <div
            className={`nav-item ${activeTab === "schedule" ? "active" : ""}`}
            onClick={() => handleNavigation("schedule", "Schedules")}
          >
            <FaCalendarAlt />
            <span className="nav-text">Schedules</span>
          </div>
          <div
            className={`nav-item ${activeTab === "services" ? "active" : ""}`}
            onClick={() => handleNavigation("services", "Services & Fees")}
          >
            <FaFirstAid />
            <span className="nav-text">Services & Fees</span>
          </div>
          <div
            className={`nav-item ${
              activeTab === "transactions" ? "active" : ""
            }`}
            onClick={() => handleNavigation("transactions", "Transactions")}
          >
            <FaMoneyBillWave />
            <span className="nav-text">Transactions</span>
          </div>
          <div className="nav-item" onClick={handleLogout}>
            <FaSignOutAlt />
            <span className="nav-text">Logout</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <h1 className="page-title">{pageTitle}</h1>
          <div className="user-menu">
            <div className="user-profile">
              <div className="avatar">
                {profileData.profileImage ? (
                  <img src={profileData.profileImage} alt="Profile" />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
              <div className="user-info">
                <div className="user-name">
                  Dr. {currentUser?.fName || "Specialist"}{" "}
                  {currentUser?.lName || "Name"}
                </div>
                <div className="user-role">Specialist</div>
              </div>
            </div>
          </div>
        </div>

        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "profile" && renderProfile()}
        {activeTab === "schedule" && renderSchedules()}
        {activeTab === "services" && renderServices()}
        {activeTab === "transactions" && renderTransactions()}
      </div>

      {showEditServiceModal && (
        <div
          className="modal"
          onClick={(e) =>
            e.target.className === "modal" && setShowEditServiceModal(false)
          }
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Service Fee</h2>
              <span
                className="close-modal"
                onClick={() => setShowEditServiceModal(false)}
              >
                <FaTimes />
              </span>
            </div>
            <div className="input-group">
              <label>Service Name</label>
              <input type="text" value={editingService.name} readOnly />
            </div>
            <div className="input-group">
              <label>Professional Fee (₱)</label>
              <input
                type="number"
                value={editingService.fee}
                onChange={(e) =>
                  setEditingService((prev) => ({
                    ...prev,
                    fee: e.target.value,
                  }))
                }
                min="0"
                step="0.01"
              />
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <button className="btn-primary" onClick={updateServiceFee}>
                Update Fee
              </button>
            </div>
          </div>
        </div>
      )}

      {showTicketModal && selectedTicket && (
        <div
          className="modal"
          onClick={(e) =>
            e.target.className === "modal" && setShowTicketModal(false)
          }
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>Ticket Details</h2>
              <span
                className="close-modal"
                onClick={() => setShowTicketModal(false)}
              >
                <FaTimes />
              </span>
            </div>
            <div className="input-group">
              <label>Ticket #</label>
              <input value={selectedTicket.id} readOnly />
            </div>
            <div className="input-group">
              <label>Patient</label>
              <input value={selectedTicket.patient} readOnly />
            </div>
            <div className="input-group">
              <label>Service</label>
              <input value={selectedTicket.service} readOnly />
            </div>
            <div className="input-group">
              <label>Date & Time</label>
              <input value={selectedTicket.when} readOnly />
            </div>
            <div className="input-group">
              <label>Status</label>
              <input value={selectedTicket.status} readOnly />
            </div>
            <div style={{ marginTop: "1.2rem", display: "flex", gap: "10px" }}>
              <button
                className="btn-primary"
                onClick={() => updateTicketStatus("Confirmed")}
              >
                Mark Confirmed
              </button>
              <button
                className="edit-btn"
                onClick={() => updateTicketStatus("Completed")}
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div
          className="modal"
          onClick={(e) =>
            e.target.className === "modal" && setShowScheduleModal(false)
          }
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Schedule</h2>
              <span
                className="close-modal"
                onClick={() => setShowScheduleModal(false)}
              >
                <FaTimes />
              </span>
            </div>
            <div className="input-group">
              <label>Date</label>
              <input
                value={
                  selectedDate
                    ? `${getMonthName(
                        currentMonth
                      )} ${selectedDate}, ${currentYear}`
                    : ""
                }
                readOnly
              />
            </div>
            <div className="input-group">
              <label>Time</label>
              <input
                type="time"
                value={scheduleData.time}
                onChange={(e) =>
                  setScheduleData((prev) => ({ ...prev, time: e.target.value }))
                }
              />
            </div>
            <div className="input-group">
              <label>Duration (minutes)</label>
              <select
                value={scheduleData.duration}
                onChange={(e) =>
                  setScheduleData((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div className="input-group">
              <label>Notes</label>
              <textarea
                rows="3"
                value={scheduleData.notes}
                onChange={(e) =>
                  setScheduleData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Available for consultation, Follow-up appointment, etc."
              />
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <button className="btn-primary" onClick={addSchedule}>
                Add Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {mhModal.open && (
        <div className="modal" style={{ display:'flex', position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center', zIndex:1000 }} onClick={(e)=>{ if (e.target.classList.contains('modal')) setMhModal({ open:false, reason:'', from:'', to:'', consent:false }); }}>
          <div className="modal-content" style={{ background:'#fff', padding:'1.6rem', borderRadius:'12px', width:'90%', maxWidth:'520px' }}>
            <h3 style={{ marginBottom:'1rem' }}>Request Medical History</h3>
            <div className="input-group"><label>Reason</label><textarea rows="3" value={mhModal.reason} onChange={(e)=> setMhModal(m=>({ ...m, reason:e.target.value }))}></textarea></div>
            <div className="form-grid">
              <div className="input-group"><label>From</label><input type="date" value={mhModal.from} onChange={(e)=> setMhModal(m=>({ ...m, from:e.target.value }))} /></div>
              <div className="input-group"><label>To</label><input type="date" value={mhModal.to} onChange={(e)=> setMhModal(m=>({ ...m, to:e.target.value }))} /></div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', margin:'8px 0 16px' }}>
              <input id="mhConsent" type="checkbox" checked={mhModal.consent} onChange={(e)=> setMhModal(m=>({ ...m, consent:e.target.checked }))} />
              <label htmlFor="mhConsent">I have the patient's consent</label>
            </div>
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button className="edit-btn" onClick={()=> setMhModal({ open:false, reason:'', from:'', to:'', consent:false })}>Cancel</button>
              <button className="btn-primary" onClick={submitMh}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialistDashboard;
