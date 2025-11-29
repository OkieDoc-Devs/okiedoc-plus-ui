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
import authService from "./authService";
import {
  formatDateLabel,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  formatDateKey,
  parseTicketDate,
  isToday,
  isPastDate,
  loadTickets,
  saveTickets,
  loadProfileData,
  saveProfileData,
  loadServicesData,
  saveServicesData,
  loadAccountData,
  saveAccountData,
  loadScheduleData,
  saveScheduleData,
  loadEncounterData,
  saveEncounterData,
  loadMedicalHistoryData,
  saveMedicalHistoryData,
  getCurrentUserEmail,
  getStatusBadgeClass,
  filterTicketsByStatus,
  filterBySearchTerm,
  filterBySpecialization,
  filterTransactions,
  getAllSpecializations,
  formatFileSize,
  generateUserInitials,
  validateFormData,
  SUB_SPECIALIZATIONS,
  createDefaultEncounter,
  createDefaultMedicineForm,
  createDefaultLabForm,
  validateMedicine,
  validateLabRequest,
  addMedicineToEncounter,
  removeMedicineFromEncounter,
  addLabRequestToEncounter,
  removeLabRequestFromEncounter,
  createMedicalHistoryRequest,
  updateMedicalHistoryStatus,
  formatMedicineDisplay,
  formatLabRequestDisplay,
  getSubSpecializations,
  isValidSpecialization,
  isValidSubSpecialization,
  exportTransactionsToCSV,
  generateMedicalHistoryHTML,
  openPrintWindow,
  downloadMedicalHistoryPDF,
  generateEncounterSummaryHTML,
  downloadEncounterSummaryPDF,
  exportToJSON,
  validateEmail,
  validatePassword,
  validatePhone,
  validatePRCLicense,
  validateSpecialistProfile,
  validatePasswordChange,
  validateServiceFee,
  validateAccountDetails,
  validateScheduleData,
  validateMedicalHistoryRequest,
  sanitizeInput,
  validateFileUpload
} from "./utils";

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
  const [isLoading, setIsLoading] = useState(true);

  // SOAP Notes and Encounter Management
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [encounter, setEncounter] = useState(createDefaultEncounter());

  // Medicine prescription form
  const [medForm, setMedForm] = useState(createDefaultMedicineForm());

  // Lab request form
  const [labForm, setLabForm] = useState(createDefaultLabForm());

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



  const loadTicketsData = useCallback(() => {
    const savedTickets = loadTickets();
    if (savedTickets.length === 0) {
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
      saveTickets(defaultTickets);
    } else {
      setTickets(savedTickets);
    }
  }, []);

  useEffect(() => {
    document.body.classList.add("specialist-dashboard-body");

    // Check authentication using auth service
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser || currentUser.userType !== 'specialist') {
      navigate("/specialist-login");
      return;
    }

    setCurrentUser(currentUser.user);
    setIsLoading(false);

    const initials = generateUserInitials(
      currentUser.user.firstName || currentUser.user.fName,
      currentUser.user.lastName || currentUser.user.lName
    );
    setUserInitials(initials);

    const profile = loadProfileData(currentUser.user.email);
    setProfileData((prev) => ({
      ...prev,
      firstName: currentUser.user.firstName || currentUser.user.fName || "",
      lastName: currentUser.user.lastName || currentUser.user.lName || "",
      email: currentUser.user.email,
      phone: profile.phone || currentUser.user.phone || "+63 ",
      prcNumber: profile.prcNumber || currentUser.user.licenseNumber || "",
      specialization: profile.specialization || currentUser.user.specialty || "",
      subSpecialization: profile.subSpecialization || "",
      bio:
        profile.bio || "Board-certified specialist with years of experience.",
      prcImage: profile.prcImage || "",
      profileImage: profile.profileImage || "",
    }));

    const savedServices = loadServicesData(currentUser.user.email);
    setServices((prev) => ({ ...prev, ...savedServices }));

    const savedAccount = loadAccountData(currentUser.user.email);
    setAccountDetails((prev) => ({ ...prev, ...savedAccount }));

    const savedSchedules = loadScheduleData(currentUser.user.email);
    setSchedules(savedSchedules);

    loadTicketsData();

    return () => {
      document.body.classList.remove("specialist-dashboard-body");
    };
  }, [navigate, loadTicketsData]);

  // Handle ticket selection and encounter loading
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  useEffect(() => {
    if (selectedTicketId) {
      const data = loadEncounterData(selectedTicketId);
      if (data) {
        setEncounter(data);
      } else {
        setEncounter(createDefaultEncounter());
      }
      setMhRequests(loadMedicalHistoryData(selectedTicketId));
    }
  }, [selectedTicketId]);

  const handleNavigation = (target, title) => {
    setActiveTab(target);
    setPageTitle(title);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      authService.logout();
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
    const email = getCurrentUserEmail();
    if (!email) return;

    // Validate profile data
    const validation = validateSpecialistProfile(profileData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }

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
    saveProfileData(email, profile);

    setCurrentUser(user);
    const initials = generateUserInitials(user.fName, user.lName);
    setUserInitials(initials);

    alert("Profile saved successfully.");
  };

  const updatePassword = () => {
    const email = getCurrentUserEmail();
    if (!email) return;

    // Validate password data
    const validation = validatePasswordChange(passwordData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }

    const { currentPassword, newPassword } = passwordData;
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
    // Validate service fee
    const validation = validateServiceFee(editingService);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }

    const email = getCurrentUserEmail();
    const updatedServices = { ...services, [editingService.name]: parseFloat(editingService.fee) };
    setServices(updatedServices);
    saveServicesData(email, updatedServices);
    setShowEditServiceModal(false);
  };

  const saveAccountDetails = () => {
    // Validate account details
    const validation = validateAccountDetails(accountDetails);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }

    const email = getCurrentUserEmail();
    saveAccountData(email, accountDetails);
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
    saveTickets(updatedTickets);
    setSelectedTicket({ ...selectedTicket, status: newStatus });
  };

  // Encounter Management Functions
  const saveEncounter = (updated) => {
    const next = { ...encounter, ...(updated || {}) };
    setEncounter(next);
    if (selectedTicketId) saveEncounterData(selectedTicketId, next);
  };

  // Medicine Management
  const addMedicine = () => {
    try {
      const updatedEncounter = addMedicineToEncounter(encounter, medForm);
      setEncounter(updatedEncounter);
      setMedForm(createDefaultMedicineForm());
      saveEncounter({ medicines: updatedEncounter.medicines });
    } catch (error) {
      alert(error.message);
    }
  };

  const removeMedicine = (idx) => {
    const updatedEncounter = removeMedicineFromEncounter(encounter, idx);
    setEncounter(updatedEncounter);
    saveEncounter({ medicines: updatedEncounter.medicines });
  };

  // Lab Request Management
  const addLab = () => {
    try {
      const updatedEncounter = addLabRequestToEncounter(encounter, labForm);
      setEncounter(updatedEncounter);
      setLabForm(createDefaultLabForm());
      saveEncounter({ labRequests: updatedEncounter.labRequests });
    } catch (error) {
      alert(error.message);
    }
  };

  const removeLab = (idx) => {
    const updatedEncounter = removeLabRequestFromEncounter(encounter, idx);
    setEncounter(updatedEncounter);
    saveEncounter({ labRequests: updatedEncounter.labRequests });
  };

  // Medical History Management
  const openMhModal = () => {
    setMhModal({ open: true, reason: "", from: "", to: "", consent: false });
  };

  const submitMh = () => {
    try {
      const item = createMedicalHistoryRequest(mhModal);
      const list = loadMedicalHistoryData(selectedTicketId).concat([item]);
      saveMedicalHistoryData(selectedTicketId, list);
      setMhRequests(list);
      setMhModal({ open: false, reason: "", from: "", to: "", consent: false });
      downloadMhPdf(item);
    } catch (error) {
      alert(error.message);
    }
  };

  const updateMhStatus = (id, status) => {
    const list = loadMedicalHistoryData(selectedTicketId).map(x => 
      updateMedicalHistoryStatus(x, status)
    );
    saveMedicalHistoryData(selectedTicketId, list);
    setMhRequests(list);
  };

  const downloadMhPdf = (item) => {
    const t = tickets.find(x => x.id === selectedTicketId) || {};
    downloadMedicalHistoryPDF(item, t);
  };


  const filteredTickets = useMemo(() => {
    return filterTicketsByStatus(tickets, ticketFilter);
  }, [tickets, ticketFilter]);



  const addSchedule = () => {
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    // Validate schedule data
    const validation = validateScheduleData(scheduleData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }

    const email = getCurrentUserEmail();
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
    saveScheduleData(email, updatedSchedules);

    setShowScheduleModal(false);
    setSelectedDate(null);
    setScheduleData({ time: "", duration: "30", notes: "" });
  };

  const deleteSchedule = (dateKey, scheduleId) => {
    const email = getCurrentUserEmail();
    const updatedSchedules = {
      ...schedules,
      [dateKey]: schedules[dateKey].filter((s) => s.id !== scheduleId),
    };

    if (updatedSchedules[dateKey].length === 0) {
      delete updatedSchedules[dateKey];
    }

    setSchedules(updatedSchedules);
    saveScheduleData(email, updatedSchedules);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    const today = new Date();
    const isCurrentMonth = isToday(currentYear, currentMonth, today.getDate());

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(currentYear, currentMonth, day);
      const hasSchedule = schedules[dateKey] && schedules[dateKey].length > 0;
      
      // Check for confirmed tickets on this date
      const dayTickets = tickets.filter(ticket => {
        if (ticket.status !== 'Confirmed') return false;
        
        const parsedDate = parseTicketDate(ticket.when);
        if (!parsedDate) return false;
        
        return parsedDate.year === currentYear && 
               parsedDate.month === currentMonth && 
               parsedDate.day === day;
      });
      
      const hasTickets = dayTickets.length > 0;
      const totalItems = (schedules[dateKey]?.length || 0) + dayTickets.length;
      
      const isTodayDate = isToday(currentYear, currentMonth, day);
      const isPast = isPastDate(currentYear, currentMonth, day);

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasSchedule || hasTickets ? "has-schedule" : ""} ${
            isTodayDate ? "today" : ""
          } ${isPast ? "past" : ""} ${hasTickets ? "has-tickets" : ""}`}
          onClick={() => !isPast && setSelectedDate(day)}
        >
          <span className="day-number">{day}</span>
          {hasSchedule && (
            <div className="schedule-indicator">
              {schedules[dateKey].length}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const renderSchedules = () => (
    <div className="dashboard-content">
      <div className="schedule-container">
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
                  
                  const parsedDate = parseTicketDate(ticket.when);
                  if (!parsedDate) return false;
                  
                  return parsedDate.year === currentYear && 
                         parsedDate.month === currentMonth && 
                         parsedDate.day === selectedDate;
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
                 const parsedDate = parseTicketDate(ticket.when);
                 if (!parsedDate) return false;
                 return parsedDate.year === currentYear && 
                        parsedDate.month === currentMonth && 
                        parsedDate.day === selectedDate;
               }) && (
                <p>No schedules or appointments for this day</p>
              )}
            </div>
          </div>
        )}
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
      <div className="filters">
        {["All Tickets", "Confirmed", "Pending", "Completed"].map((filter) => (
          <div
            key={filter}
            className={`filter-item ${
              ticketFilter === (filter === "All Tickets" ? "All" : filter)
                ? "active"
                : ""
            }`}
            onClick={() =>
              setTicketFilter(filter === "All Tickets" ? "All" : filter)
            }
          >
            {filter}
          </div>
        ))}
      </div>
      <div className="ticket-list">
        <div className="table-header">
          <div>Patient Name</div>
          <div>Service Type</div>
          <div>Date & Time</div>
          <div>Status</div>
          <div>Action</div>
        </div>
        <div className="ticket-rows">{renderTickets()}</div>
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
            <div className="upload-btn">
              <FaUpload /> Upload Photo
              <input
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
              <div className="upload-btn">
                <FaUpload /> Upload PRC License Photo
                <input
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
              {getSubSpecializations(profileData.specialization).map(
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
                  <div className="upload-btn">
                    <FaUpload /> Upload GCash QR
                    <input
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

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#f0f8ff',
        fontSize: '18px',
        color: '#333'
      }}>
        Loading specialist dashboard...
      </div>
    );
  }

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
                  Dr. {currentUser?.firstName || currentUser?.fName || "Specialist"}{" "}
                  {currentUser?.lastName || currentUser?.lName || "Name"}
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
    </div>
  );
};

export default SpecialistDashboard;
