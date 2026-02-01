import React, { useState, useEffect } from "react";
import { logoutPatient } from "../services/auth";
import { useNavigate } from "react-router";
import MedicalRecords from "./MedicalRecords";
import Appointments from "./Appointments";
import Messages from "./Messages";
import "../css/PatientDashboard.css";
import LabResults from "./LabResults";
import Billing from "./Billing";
import MyAccount from "./MyAccount";
import ConsultationHistory from "./ConsultationHistory";
import appointmentService from "../services/appointmentService";
import { fetchPatientProfile } from "../services/apiService";
import {
  FaHome,
  FaCalendarAlt,
  FaEnvelope,
  FaFileMedicalAlt,
  FaFlask,
  FaReceipt,
  FaUser,
  FaUserMd,
  FaPills,
  FaFileAlt,
  FaHistory,
  FaClock,
  FaCheckCircle,
  FaCreditCard,
  FaUserCheck,
  FaPlay,
  FaComments,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaSpinner,
  FaHourglassHalf,
  FaDollarSign,
  FaUpload,
  FaTimes as FaClose,
  FaBell,
  FaEllipsisH,
  FaPhone,
  FaVideo,
  FaPhoneAlt,
} from "react-icons/fa";

const PatientDashboard = () => {
  const [_globalId, setGlobalId] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [profileImage, setProfileImage] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [profileData, setProfileData] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeProfileTab, setActiveProfileTab] = useState("profile");
  const [showMobileProfileModal, setShowMobileProfileModal] = useState(false);
  const navigate = useNavigate();

  const parseNameParts = (value) => {
    if (!value || typeof value !== "string") {
      return { firstName: "", lastName: "" };
    }
    const parts = value.trim().split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" };
    }
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  };

  const normalizeName = (value) =>
    typeof value === "string" ? value.trim() : "";

  // State for home appointments
  const [homeAppointments, setHomeAppointments] = useState([]);

  // Shows Global ID
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (currentUser.globalId) setGlobalId(currentUser.globalId);
  }, []);

  useEffect(() => {
    const loadPatientProfile = async () => {
      try {
        const profile = await fetchPatientProfile();

        const nameSource = normalizeName(
          profile.fullName ||
            profile.Full_Name ||
            profile.full_name ||
            profile.fullname ||
            profile.Name ||
            profile.Patient_Name ||
            profile.patient_name ||
            profile.displayName ||
            profile.Display_Name ||
            "",
        );
        const parsedName = parseNameParts(nameSource);
        const computedFullName =
          nameSource ||
          [
            normalizeName(
              profile.firstName || profile.First_Name || parsedName.firstName,
            ),
            normalizeName(
              profile.lastName || profile.Last_Name || parsedName.lastName,
            ),
          ]
            .filter(Boolean)
            .join(" ");

        const resolvedProfileImage =
          profile.profileImage ||
          profile.Profile_Image_Data_URL ||
          profile.Profile_Image ||
          profile.Profile_Image_URL ||
          profile.avatar ||
          null;

        setProfileData((prev) => ({
          ...prev,
          fullName: computedFullName || prev.fullName,
          firstName:
            profile.firstName ||
            profile.First_Name ||
            profile.first_name ||
            parsedName.firstName ||
            prev.firstName,
          lastName:
            profile.lastName ||
            profile.Last_Name ||
            profile.last_name ||
            parsedName.lastName ||
            prev.lastName,
          email: profile.email || profile.Email || prev.email,
          phone: profile.phone || profile.Phone || prev.phone,
          dateOfBirth:
            profile.dateOfBirth ||
            profile.Date_Of_Birth ||
            profile.Birth_Date ||
            profile.birthdate ||
            prev.dateOfBirth,
          address: profile.address || profile.Address || prev.address,
          emergencyContact:
            profile.emergencyContact ||
            profile.Emergency_Contact ||
            prev.emergencyContact,
          emergencyPhone:
            profile.emergencyPhone ||
            profile.Emergency_Phone ||
            prev.emergencyPhone,
        }));

        if (resolvedProfileImage) {
          setProfileImage(resolvedProfileImage);
        }

        if (
          profile.globalId ||
          profile.Global_Id ||
          profile.Global_ID ||
          profile.global_id ||
          profile.Patient_ID ||
          profile.Patient_Id ||
          profile.patient_id ||
          profile.Patient_Code ||
          profile.patient_code
        ) {
          setGlobalId(
            profile.globalId ||
              profile.Global_Id ||
              profile.Global_ID ||
              profile.global_id ||
              profile.Patient_ID ||
              profile.Patient_Id ||
              profile.patient_id ||
              profile.Patient_Code ||
              profile.patient_code,
          );
        }
      } catch (error) {
        console.warn("Falling back to currentUser profile data.", error);
        try {
          const currentUser = JSON.parse(
            localStorage.getItem("currentUser") || "{}",
          );

          const fallbackNameSource = normalizeName(
            currentUser.fullName ||
              currentUser.Full_Name ||
              currentUser.full_name ||
              currentUser.fullname ||
              currentUser.Name ||
              currentUser.Patient_Name ||
              currentUser.patient_name ||
              currentUser.displayName ||
              currentUser.Display_Name ||
              "",
          );
          const fallbackParsedName = parseNameParts(fallbackNameSource);
          const fallbackFullName =
            fallbackNameSource ||
            [
              normalizeName(fallbackParsedName.firstName),
              normalizeName(fallbackParsedName.lastName),
            ]
              .filter(Boolean)
              .join(" ");

          setProfileData((prev) => ({
            ...prev,
            fullName: fallbackFullName || prev.fullName,
            firstName:
              currentUser.firstName ||
              currentUser.First_Name ||
              fallbackParsedName.firstName ||
              prev.firstName,
            lastName:
              currentUser.lastName ||
              currentUser.Last_Name ||
              fallbackParsedName.lastName ||
              prev.lastName,
            email: currentUser.email || currentUser.Email || prev.email,
            phone: currentUser.phone || currentUser.Phone || prev.phone,
            dateOfBirth:
              currentUser.dateOfBirth ||
              currentUser.Date_Of_Birth ||
              currentUser.Birth_Date ||
              prev.dateOfBirth,
            address: currentUser.address || currentUser.Address || prev.address,
            emergencyContact:
              currentUser.emergencyContact ||
              currentUser.Emergency_Contact ||
              prev.emergencyContact,
            emergencyPhone:
              currentUser.emergencyPhone ||
              currentUser.Emergency_Phone ||
              prev.emergencyPhone,
          }));

          if (
            currentUser.profileImage ||
            currentUser.Profile_Image_URL ||
            currentUser.avatar
          ) {
            setProfileImage(
              currentUser.profileImage ||
                currentUser.Profile_Image_URL ||
                currentUser.avatar,
            );
          }
        } catch (localError) {
          console.error("Failed to load patient profile fallback:", localError);
        }
      }
    };

    loadPatientProfile();
  }, []);

  // Load appointments from localStorage on component mount
  useEffect(() => {
    loadHomeAppointments();
  }, []);

  // Debug: Monitor homeAppointments changes
  useEffect(() => {
    console.log("homeAppointments state changed:", homeAppointments);
    console.log("homeAppointments length:", homeAppointments.length);
  }, [homeAppointments]);

  const loadHomeAppointments = () => {
    // Initialize dummy tickets if none exist, but don't clear existing ones
    appointmentService.initializeDummyTickets();
    const savedAppointments = appointmentService.getAllAppointments();
    console.log("Home appointments loaded:", savedAppointments);
    console.log("Total appointments count:", savedAppointments.length);
    setHomeAppointments(savedAppointments);
  };

  // Refresh appointments when new ones are added
  const refreshAppointments = () => {
    console.log("Refreshing home appointments...");
    loadHomeAppointments();
  };

  // Chat functions
  const openChat = (appointment) => {
    setActiveTicket(appointment);
    // Initialize with sample messages for this appointment
    setChatMessages([
      {
        id: 1,
        sender: "nurse",
        message: `Hello! I'm here to assist you with your ${appointment.title} appointment.`,
        timestamp: new Date().toLocaleTimeString(),
        type: "text",
      },
      {
        id: 2,
        sender: "nurse",
        message:
          "Please feel free to ask any questions or share any concerns you may have.",
        timestamp: new Date().toLocaleTimeString(),
        type: "text",
      },
    ]);
  };

  const closeChat = () => {
    setActiveTicket(null);
    setChatMessages([]);
    setNewMessage("");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && activeTicket) {
      const message = {
        id: Date.now(),
        sender: "patient",
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString(),
        type: "text",
      };
      setChatMessages((prev) => [...prev, message]);
      setNewMessage("");
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Add class to body for App.css override
  useEffect(() => {
    document.body.classList.add("patient-dashboard-active");

    return () => {
      document.body.classList.remove("patient-dashboard-active");
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutPatient();
      localStorage.removeItem("currentUser");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Profile editing functions
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    console.log("Saving profile:", profileData);
    setIsEditingProfile(false);
    // You can add API call here to save to backend
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }
    console.log("Changing password");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    // You can add API call here to change password
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const handleViewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const closeAppointmentDetails = () => {
    setShowAppointmentDetails(false);
    setSelectedAppointment(null);
  };

  // Status functions for appointments
  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return (
          <FaClock className="patient-mobile-status-icon patient-mobile-pending" />
        );
      case "Processing":
        return (
          <FaUserCheck className="patient-mobile-status-icon patient-mobile-processing" />
        );
      case "For Payment":
        return (
          <FaCreditCard className="patient-mobile-status-icon patient-mobile-payment" />
        );
      case "Confirmed":
        return (
          <FaCheckCircle className="patient-mobile-status-icon patient-mobile-confirmed" />
        );
      case "Active":
        return (
          <FaPlay className="patient-mobile-status-icon patient-mobile-active" />
        );
      default:
        return <FaClock className="patient-mobile-status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "patient-mobile-status-pending";
      case "Processing":
        return "patient-mobile-status-processing";
      case "For Payment":
        return "patient-mobile-status-payment";
      case "Confirmed":
        return "patient-mobile-status-confirmed";
      case "Active":
        return "patient-mobile-status-active";
      default:
        return "patient-mobile-status-default";
    }
  };

  // Web view status functions
  const getWebStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="patient-status-icon patient-pending" />;
      case "Processing":
        return (
          <FaUserCheck className="patient-status-icon patient-processing" />
        );
      case "For Payment":
        return <FaCreditCard className="patient-status-icon patient-payment" />;
      case "Confirmed":
        return (
          <FaCheckCircle className="patient-status-icon patient-confirmed" />
        );
      case "Active":
        return <FaPlay className="patient-status-icon patient-active" />;
      default:
        return <FaClock className="patient-status-icon" />;
    }
  };

  const getWebStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "patient-status-pending";
      case "Processing":
        return "patient-status-processing";
      case "For Payment":
        return "patient-status-payment";
      case "Confirmed":
        return "patient-status-confirmed";
      case "Active":
        return "patient-status-active";
      default:
        return "patient-status-default";
    }
  };

  const displayName =
    normalizeName(profileData.fullName) ||
    [normalizeName(profileData.firstName), normalizeName(profileData.lastName)]
      .filter(Boolean)
      .join(" ") ||
    "Patient";

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return (
          <>
            {/* Desktop Home Layout */}
            <div className="patient-desktop-home">
              <div className="patient-dashboard-content">
                {/* Left Column - Appointment Tickets */}
                <div className="patient-left-column">
                  <div className="patient-desktop-action-buttons">
                    <button
                      className="patient-desktop-action-btn"
                      onClick={() =>
                        alert(
                          "Physical consultation booking will be implemented soon!",
                        )
                      }
                    >
                      <FaComments className="patient-desktop-action-icon" />
                      Book a Physical Consultation
                    </button>
                    <button
                      className="patient-desktop-action-btn"
                      onClick={() =>
                        alert(
                          "Physical consultation booking will be implemented soon!",
                        )
                      }
                    >
                      <FaVideo className="patient-desktop-action-icon" />
                      Book an Online Consultation
                    </button>
                    <button
                      className="patient-desktop-action-btn"
                      onClick={() =>
                        alert(
                          "Physical consultation booking will be implemented soon!",
                        )
                      }
                    >
                      <FaPhone className="patient-desktop-action-icon" />
                      Call a Doctor
                    </button>
                    <button
                      className="patient-desktop-action-btn"
                      onClick={() =>
                        alert(
                          "Physical consultation booking will be implemented soon!",
                        )
                      }
                    >
                      <FaPhoneAlt className="patient-desktop-action-icon" />
                      Request Callback
                    </button>
                  </div>
                  <div className="patient-home-section">
                    <div className="patient-home-tickets-container">
                      {homeAppointments.length === 0 ? (
                        <div className="patient-empty-state">
                          <FaCalendarAlt className="patient-empty-icon" />
                          <h3 className="patient-empty-title">
                            No Appointments Yet
                          </h3>
                          <p className="patient-empty-message">
                            You haven't booked any appointments yet. Go to the
                            Appointments page to book your first consultation.
                          </p>
                        </div>
                      ) : (
                        homeAppointments.map((appointment) => {
                          console.log(
                            "Rendering appointment:",
                            appointment.title,
                            appointment.status,
                            "ID:",
                            appointment.id,
                          );
                          return (
                            <div
                              key={appointment.id}
                              className={`patient-home-ticket-card ${getWebStatusColor(
                                appointment.status,
                              )}`}
                            >
                              <div className="patient-home-ticket-left">
                                <h4 className="patient-home-ticket-title">
                                  {appointment.title}
                                </h4>
                              </div>

                              <div className="patient-home-ticket-middle">
                                <div className="patient-home-ticket-details">
                                  <span className="patient-home-ticket-doctor">
                                    {appointment.specialist}
                                  </span>
                                  <span className="patient-home-ticket-specialty">
                                    {appointment.specialty}
                                  </span>
                                  <span className="patient-home-ticket-date">
                                    {appointment.date} at {appointment.time}
                                  </span>
                                  <p className="patient-home-ticket-description">
                                    {appointment.description}
                                  </p>
                                </div>
                              </div>

                              <div className="patient-home-ticket-right">
                                <div className="patient-home-ticket-status">
                                  {getWebStatusIcon(appointment.status)}
                                  <span className="patient-home-status-text">
                                    {appointment.status}
                                  </span>
                                </div>
                                <div className="patient-home-ticket-actions">
                                  {appointment.status === "Active" && (
                                    <button
                                      className="patient-home-chat-btn"
                                      onClick={() => openChat(appointment)}
                                    >
                                      <FaComments className="patient-home-action-icon" />
                                      Chat
                                    </button>
                                  )}
                                  {appointment.status === "For Payment" && (
                                    <button className="patient-home-payment-btn">
                                      <FaCreditCard className="patient-home-action-icon" />
                                      Pay
                                    </button>
                                  )}
                                  <button
                                    className="patient-home-view-btn"
                                    onClick={() =>
                                      handleViewAppointmentDetails(appointment)
                                    }
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Lab Results & Medications */}
                <div className="patient-right-column">
                  {/* Lab Test Results Card */}
                  <div className="patient-lab-results-card">
                    <div className="patient-card-header">
                      <h3 className="patient-card-title">Lab Test Results</h3>
                      <a
                        href="#"
                        className="patient-view-all-link"
                        onClick={() => setActivePage("lab-results")}
                      >
                        View All
                      </a>
                    </div>
                    <div className="patient-lab-results-list">
                      <div className="patient-lab-result-item">
                        <FaFileAlt className="patient-result-icon" />
                        <span className="patient-result-name">CBC</span>
                        <span className="patient-result-status patient-not-available">
                          Not Available Yet
                        </span>
                        <span className="patient-result-date">04/20/2025</span>
                      </div>
                      <div className="patient-lab-result-item">
                        <FaFileAlt className="patient-result-icon" />
                        <span className="patient-result-name">X-RAY</span>
                        <span className="patient-result-status patient-available">
                          View Result
                        </span>
                        <span className="patient-result-date">04/20/2025</span>
                      </div>
                      <div className="patient-lab-result-item">
                        <FaFileAlt className="patient-result-icon" />
                        <span className="patient-result-name">Urinalysis</span>
                        <span className="patient-result-status patient-not-available">
                          Not Available Yet
                        </span>
                        <span className="patient-result-date">04/20/2025</span>
                      </div>
                      <div className="patient-lab-result-item">
                        <FaFileAlt className="patient-result-icon" />
                        <span className="patient-result-name">Fecalysis</span>
                        <span className="patient-result-status patient-not-available">
                          Not Available Yet
                        </span>
                        <span className="patient-result-date">04/20/2025</span>
                      </div>
                      <div className="patient-lab-result-item">
                        <FaFileAlt className="patient-result-icon" />
                        <span className="patient-result-name">ECG</span>
                        <span className="patient-result-status patient-available">
                          View Result
                        </span>
                        <span className="patient-result-date">04/20/2025</span>
                      </div>
                    </div>
                  </div>

                  {/* Medications Card */}
                  <div className="patient-medications-card">
                    <div className="patient-card-header">
                      <h3 className="patient-card-title">Medications</h3>
                      <a href="#" className="patient-view-all-link">
                        View All
                      </a>
                    </div>
                    <div className="patient-medications-list">
                      <div className="patient-medication-item">
                        <FaPills className="patient-medication-icon" />
                        <span className="patient-medication-name">
                          Febuxostat
                        </span>
                        <span className="patient-medication-date">
                          04/20/2025
                        </span>
                        <span className="patient-medication-dosage">
                          40 mg, Take 1 tablet once a day
                        </span>
                      </div>
                      <div className="patient-medication-item">
                        <FaPills className="patient-medication-icon" />
                        <span className="patient-medication-name">
                          Pioglitazone
                        </span>
                        <span className="patient-medication-date">
                          04/20/2025
                        </span>
                        <span className="patient-medication-dosage">
                          15 mg, Take 1 tablet once a day
                        </span>
                      </div>
                      <div className="patient-medication-item">
                        <FaPills className="patient-medication-icon" />
                        <span className="patient-medication-name">
                          Atorvastin
                        </span>
                        <span className="patient-medication-date">
                          04/20/2025
                        </span>
                        <span className="patient-medication-dosage">
                          40 mg, Take 1 tablet once a day
                        </span>
                      </div>
                      <div className="patient-medication-item">
                        <FaPills className="patient-medication-icon" />
                        <span className="patient-medication-name">
                          Transmetil
                        </span>
                        <span className="patient-medication-date">
                          04/20/2025
                        </span>
                        <span className="patient-medication-dosage">
                          500 mg, Take 1 tablet 3x a day
                        </span>
                      </div>
                      <div className="patient-medication-item">
                        <FaPills className="patient-medication-icon" />
                        <span className="patient-medication-name">
                          Metformin
                        </span>
                        <span className="patient-medication-date">
                          04/20/2025
                        </span>
                        <span className="patient-medication-dosage">
                          500 mg, Twice daily, oral
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Modal */}
                {activeTicket && (
                  <div
                    className="patient-chat-modal-overlay"
                    onClick={closeChat}
                  >
                    <div
                      className="patient-chat-modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="patient-chat-header">
                        <div className="patient-chat-ticket-info">
                          <h3 className="patient-chat-ticket-title">
                            {activeTicket.title}
                          </h3>
                          <p className="patient-chat-ticket-specialist">
                            {activeTicket.specialist}
                          </p>
                        </div>
                        <button
                          className="patient-chat-close-btn"
                          onClick={closeChat}
                        >
                          <FaTimes />
                        </button>
                      </div>

                      <div className="patient-chat-messages">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`patient-message ${
                              message.sender === "patient"
                                ? "patient-message-patient"
                                : "patient-message-nurse"
                            }`}
                          >
                            <div className="patient-message-content">
                              <p className="patient-message-text">
                                {message.message}
                              </p>
                              <span className="patient-message-time">
                                {message.timestamp}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="patient-document-upload">
                        <div className="patient-upload-header">
                          <h4 className="patient-upload-title">
                            Upload Documents
                          </h4>
                          <p className="patient-upload-subtitle">
                            Share files with your specialist
                          </p>
                        </div>

                        <div className="patient-file-upload-area">
                          <input
                            type="file"
                            id="file-upload"
                            multiple
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                          />
                          <label
                            htmlFor="file-upload"
                            className="patient-file-label"
                          >
                            <FaUpload className="patient-upload-icon" />
                            <span className="patient-upload-text">
                              Choose files to upload
                            </span>
                            <span className="patient-upload-hint">
                              PDF, DOC, JPG, PNG up to 10MB
                            </span>
                          </label>
                        </div>

                        {uploadedFiles.length > 0 && (
                          <div className="patient-uploaded-files">
                            <h5 className="patient-files-title">
                              Uploaded Files:
                            </h5>
                            {uploadedFiles.map((file) => (
                              <div key={file.id} className="patient-file-item">
                                <FaFileAlt className="patient-file-icon" />
                                <div className="patient-file-info">
                                  <span className="patient-file-name">
                                    {file.name}
                                  </span>
                                  <span className="patient-file-size">
                                    {formatFileSize(file.size)}
                                  </span>
                                </div>
                                <button
                                  className="patient-file-remove"
                                  onClick={() =>
                                    setUploadedFiles((prev) =>
                                      prev.filter((f) => f.id !== file.id),
                                    )
                                  }
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <form
                        className="patient-chat-input-form"
                        onSubmit={handleSendMessage}
                      >
                        <div className="patient-chat-input-container">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="patient-chat-input"
                          />
                          <button
                            type="submit"
                            className="patient-chat-send-btn"
                          >
                            Send
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Home Layout */}
            <div className="patient-mobile-home">
              {/* Mobile Header with Logo and Profile */}
              <div className="patient-mobile-home-header">
                <div className="patient-mobile-logo">
                  <span className="patient-mobile-logo-text">OkieDoc</span>
                </div>
                <div className="patient-mobile-profile-section">
                  <div className="patient-profile-image-container">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="patient-profile-image"
                      />
                    ) : (
                      <div className="patient-profile-image-placeholder">
                        <FaUser className="patient-profile-icon" />
                      </div>
                    )}
                  </div>
                  <div className="patient-profile-name">
                    <h3 className="patient-profile-full-name">
                      {profileData.firstName} {profileData.lastName}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="patient-mobile-action-buttons">
                <button
                  className="patient-mobile-action-btn"
                  onClick={() =>
                    alert(
                      "Physical consultation booking will be implemented soon!",
                    )
                  }
                >
                  <FaComments className="patient-mobile-action-icon" />
                  <span>Book a Physical Consultation</span>
                </button>
                <button
                  className="patient-mobile-action-btn"
                  onClick={() =>
                    alert(
                      "Physical consultation booking will be implemented soon!",
                    )
                  }
                >
                  <FaVideo className="patient-mobile-action-icon" />
                  <span>Book an Online Consultation</span>
                </button>
                <button
                  className="patient-mobile-action-btn"
                  onClick={() =>
                    alert(
                      "Physical consultation booking will be implemented soon!",
                    )
                  }
                >
                  <FaPhone className="patient-mobile-action-icon" />
                  <span>Call a Doctor</span>
                </button>
                <button
                  className="patient-mobile-action-btn"
                  onClick={() =>
                    alert(
                      "Physical consultation booking will be implemented soon!",
                    )
                  }
                >
                  <FaPhoneAlt className="patient-mobile-action-icon" />
                  <span>Request Callback</span>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="patient-mobile-scroll-content">
                {/* Tickets Section */}
                <div className="patient-mobile-tickets-section">
                  <div className="patient-mobile-tickets-container">
                    {homeAppointments.length === 0 ? (
                      <div className="patient-empty-state">
                        <FaCalendarAlt className="patient-empty-icon" />
                        <h3 className="patient-empty-title">
                          No Appointments Yet
                        </h3>
                        <p className="patient-empty-message">
                          You haven't booked any appointments yet. Go to the
                          Appointments page to book your first consultation.
                        </p>
                      </div>
                    ) : (
                      homeAppointments.map((appointment, index) => (
                        <div
                          key={index}
                          className={`patient-mobile-appointment-card ${getStatusColor(
                            appointment.status,
                          )}`}
                        >
                          <div className="patient-mobile-appointment-left">
                            <h3 className="patient-mobile-appointment-title">
                              {appointment.title}
                            </h3>
                          </div>

                          <div className="patient-mobile-appointment-middle">
                            <div className="patient-mobile-appointment-details">
                              <span className="patient-mobile-appointment-doctor">
                                {appointment.specialist}
                              </span>
                              <span className="patient-mobile-appointment-specialty">
                                {appointment.specialty || "General Medicine"}
                              </span>
                              <span className="patient-mobile-appointment-date">
                                {appointment.date} at{" "}
                                {appointment.time || "10:00 AM"}
                              </span>
                              <p className="patient-mobile-appointment-description">
                                {appointment.description || appointment.title}
                              </p>
                            </div>
                          </div>

                          <div className="patient-mobile-appointment-right">
                            <div className="patient-mobile-appointment-status">
                              {getStatusIcon(appointment.status)}
                              <span className="patient-mobile-status-text">
                                {appointment.status}
                              </span>
                            </div>
                            <div className="patient-mobile-appointment-actions">
                              {appointment.status === "Active" && (
                                <button
                                  className="patient-mobile-chat-btn"
                                  onClick={() => openChat(appointment)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "0.4rem 0.8rem",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                    fontSize: "0.75rem",
                                    width: "100%",
                                    marginBottom: "0.25rem",
                                  }}
                                >
                                  <FaComments className="patient-mobile-action-icon" />
                                  Chat
                                </button>
                              )}
                              {appointment.status === "For Payment" && (
                                <button className="patient-mobile-payment-btn">
                                  <FaCreditCard className="patient-mobile-action-icon" />
                                  Pay
                                </button>
                              )}
                              <button
                                className="patient-mobile-view-details-btn"
                                onClick={() =>
                                  handleViewAppointmentDetails(appointment)
                                }
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Lab Results Section */}
                <div className="patient-mobile-lab-section">
                  <h3 className="patient-mobile-section-title">
                    Recent Lab Results
                  </h3>
                  <div className="patient-mobile-lab-results">
                    <div className="patient-mobile-lab-item">
                      <FaFileAlt className="patient-mobile-lab-icon" />
                      <div className="patient-mobile-lab-content">
                        <div className="patient-mobile-lab-test">CBC</div>
                        <div className="patient-mobile-lab-date">
                          04/20/2025
                        </div>
                      </div>
                      <span className="patient-mobile-lab-status not-available">
                        Not Available Yet
                      </span>
                    </div>
                    <div className="patient-mobile-lab-item">
                      <FaFileAlt className="patient-mobile-lab-icon" />
                      <div className="patient-mobile-lab-content">
                        <div className="patient-mobile-lab-test">X-RAY</div>
                        <div className="patient-mobile-lab-date">
                          04/20/2025
                        </div>
                      </div>
                      <span className="patient-mobile-lab-status available">
                        View Result
                      </span>
                    </div>
                    <div className="patient-mobile-lab-item">
                      <FaFileAlt className="patient-mobile-lab-icon" />
                      <div className="patient-mobile-lab-content">
                        <div className="patient-mobile-lab-test">
                          Urinalysis
                        </div>
                        <div className="patient-mobile-lab-date">
                          04/20/2025
                        </div>
                      </div>
                      <span className="patient-mobile-lab-status not-available">
                        Not Available Yet
                      </span>
                    </div>
                    <div className="patient-mobile-lab-item">
                      <FaFileAlt className="patient-mobile-lab-icon" />
                      <div className="patient-mobile-lab-content">
                        <div className="patient-mobile-lab-test">Fecalysis</div>
                        <div className="patient-mobile-lab-date">
                          04/20/2025
                        </div>
                      </div>
                      <span className="patient-mobile-lab-status not-available">
                        Not Available Yet
                      </span>
                    </div>
                    <div className="patient-mobile-lab-item">
                      <FaFileAlt className="patient-mobile-lab-icon" />
                      <div className="patient-mobile-lab-content">
                        <div className="patient-mobile-lab-test">ECG</div>
                        <div className="patient-mobile-lab-date">
                          04/20/2025
                        </div>
                      </div>
                      <span className="patient-mobile-lab-status available">
                        View Result
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medications Section */}
                <div className="patient-mobile-medications-section">
                  <h3 className="patient-mobile-section-title">
                    Current Medications
                  </h3>
                  <div className="patient-mobile-medications-list">
                    <div className="patient-mobile-medication-item">
                      <FaPills className="patient-mobile-medication-icon" />
                      <div className="patient-mobile-medication-content">
                        <div className="patient-mobile-medication-name">
                          Febuxostat
                        </div>
                        <div className="patient-mobile-medication-dosage">
                          40 mg, Take 1 tablet once a day
                        </div>
                        <div className="patient-mobile-medication-date">
                          04/20/2025
                        </div>
                      </div>
                    </div>
                    <div className="patient-mobile-medication-item">
                      <FaPills className="patient-mobile-medication-icon" />
                      <div className="patient-mobile-medication-content">
                        <div className="patient-mobile-medication-name">
                          Pioglitazone
                        </div>
                        <div className="patient-mobile-medication-dosage">
                          15 mg, Take 1 tablet once a day
                        </div>
                        <div className="patient-mobile-medication-date">
                          04/20/2025
                        </div>
                      </div>
                    </div>
                    <div className="patient-mobile-medication-item">
                      <FaPills className="patient-mobile-medication-icon" />
                      <div className="patient-mobile-medication-content">
                        <div className="patient-mobile-medication-name">
                          Atorvastin
                        </div>
                        <div className="patient-mobile-medication-dosage">
                          40 mg, Take 1 tablet once a day
                        </div>
                        <div className="patient-mobile-medication-date">
                          04/20/2025
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case "mobile-home":
        return (
          <div className="patient-mobile-home">
            {/* Mobile Header with Logo and Profile */}
            <div className="patient-mobile-home-header">
              <div className="patient-mobile-logo">
                <span className="patient-mobile-logo-text">OkieDoc</span>
              </div>
              <div
                className="patient-mobile-profile-section"
                onClick={() => setShowMobileProfileModal(true)}
              >
                <div className="patient-profile-image-container">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="patient-profile-image"
                    />
                  ) : (
                    <div className="patient-profile-image-placeholder">
                      <FaUser className="patient-profile-icon" />
                    </div>
                  )}
                </div>
                <div className="patient-profile-name">
                  <h3 className="patient-profile-full-name">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="patient-mobile-action-buttons">
              <button className="patient-mobile-action-btn">
                <FaComments className="patient-mobile-action-icon" />
                <span>Book a Physical Consultation</span>
              </button>
              <button className="patient-mobile-action-btn">
                <FaVideo className="patient-mobile-action-icon" />
                <span>Book an Online Consultation</span>
              </button>
              <button className="patient-mobile-action-btn">
                <FaPhone className="patient-mobile-action-icon" />
                <span>Call a Doctor</span>
              </button>
              <button className="patient-mobile-action-btn">
                <FaPhoneAlt className="patient-mobile-action-icon" />
                <span>Request Callback</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="patient-mobile-scroll-content">
              {/* Tickets Section */}
              <div className="patient-mobile-tickets-section">
                <div className="patient-mobile-tickets-container">
                  {homeAppointments.length === 0 ? (
                    <div className="patient-empty-state">
                      <FaCalendarAlt className="patient-empty-icon" />
                      <h3 className="patient-empty-title">
                        No Appointments Yet
                      </h3>
                      <p className="patient-empty-message">
                        You haven't booked any appointments yet. Go to the
                        Appointments page to book your first consultation.
                      </p>
                    </div>
                  ) : (
                    homeAppointments.map((appointment, index) => (
                      <div
                        key={index}
                        className={`patient-mobile-appointment-card ${getStatusColor(
                          appointment.status,
                        )}`}
                      >
                        <div className="patient-mobile-appointment-left">
                          <h3 className="patient-mobile-appointment-title">
                            {appointment.title}
                          </h3>
                        </div>

                        <div className="patient-mobile-appointment-middle">
                          <div className="patient-mobile-appointment-details">
                            <span className="patient-mobile-appointment-doctor">
                              {appointment.specialist}
                            </span>
                            <span className="patient-mobile-appointment-specialty">
                              {appointment.specialty || "General Medicine"}
                            </span>
                            <span className="patient-mobile-appointment-date">
                              {appointment.date} at{" "}
                              {appointment.time || "10:00 AM"}
                            </span>
                            <p className="patient-mobile-appointment-description">
                              {appointment.description || appointment.title}
                            </p>
                          </div>
                        </div>

                        <div className="patient-mobile-appointment-right">
                          <div className="patient-mobile-appointment-status">
                            {getStatusIcon(appointment.status)}
                            <span className="patient-mobile-status-text">
                              {appointment.status}
                            </span>
                          </div>
                          <div className="patient-mobile-appointment-actions">
                            {appointment.status === "Active" && (
                              <button
                                className="patient-mobile-chat-btn"
                                onClick={() => openChat(appointment)}
                              >
                                <FaComments className="patient-mobile-action-icon" />
                                Chat
                              </button>
                            )}
                            {appointment.status === "For Payment" && (
                              <button className="patient-mobile-payment-btn">
                                <FaCreditCard className="patient-mobile-action-icon" />
                                Pay
                              </button>
                            )}
                            <button
                              className="patient-mobile-view-details-btn"
                              onClick={() =>
                                handleViewAppointmentDetails(appointment)
                              }
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lab Results Section */}
              <div className="patient-mobile-lab-section">
                <h3 className="patient-mobile-section-title">
                  Recent Lab Results
                </h3>
                <div className="patient-mobile-lab-results">
                  <div className="patient-mobile-lab-item">
                    <FaFlask className="patient-mobile-lab-icon" />
                    <div className="patient-mobile-lab-content">
                      <div className="patient-mobile-lab-test">Blood Test</div>
                      <div className="patient-mobile-lab-date">
                        Dec 15, 2023
                      </div>
                    </div>
                    <span className="patient-mobile-lab-status normal">
                      Normal
                    </span>
                  </div>
                  <div className="patient-mobile-lab-item">
                    <FaFlask className="patient-mobile-lab-icon" />
                    <div className="patient-mobile-lab-content">
                      <div className="patient-mobile-lab-test">X-Ray Chest</div>
                      <div className="patient-mobile-lab-date">
                        Dec 10, 2023
                      </div>
                    </div>
                    <span className="patient-mobile-lab-status normal">
                      Normal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "appointments":
        return <Appointments onAppointmentAdded={refreshAppointments} />;
      case "messages":
        return <Messages />;
      case "medical-records":
        return <MedicalRecords />;
      case "lab-results":
        return <LabResults />;
      case "billing":
        return <Billing />;
      case "my-account":
        return (
          <MyAccount
            profileImage={profileImage}
            setProfileImage={setProfileImage}
            profileData={profileData}
            setProfileData={setProfileData}
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            isEditing={isEditingProfile}
            setIsEditing={setIsEditingProfile}
            activeTab={activeProfileTab}
            setActiveTab={setActiveProfileTab}
          />
        );
      case "consultation-history":
        return <ConsultationHistory />;
      default:
        return null;
    }
  };

  return (
    <div className="patient-dashboard">
      {/* Main Content */}
      <div className="patient-main-content">
        {/* Header */}
        <div className="patient-header">
          <div className="patient-header-left">
            <img
              src="/okie-doc-logo.png"
              alt="OkieDoc+"
              className="patient-header-logo"
            />
          </div>
          <div className="patient-header-center">
            <div className="patient-header-titles">
              <h1 className="patient-dashboard-title">Patient Dashboard</h1>
              {activePage === "home" && (
                <p className="patient-welcome-text">Welcome, {displayName}</p>
              )}
            </div>
          </div>
          <div className="patient-user-profile">
            <button
              className="patient-profile-trigger"
              onClick={() => setActivePage("my-account")}
            >
              <span className="patient-profile-avatar">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="patient-header-profile-image"
                  />
                ) : (
                  <FaUser className="patient-header-profile-icon" />
                )}
              </span>
              <span className="patient-profile-name">{displayName}</span>
            </button>
            <div className="patient-account-dropdown">
              <button
                className="patient-dropdown-item"
                onClick={() => setActivePage("my-account")}
              >
                My Account
              </button>
              <button
                className="patient-dropdown-item patient-logout-item"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="patient-dashboard-nav">
          <button
            className={`patient-nav-tab ${
              activePage === "home" ? "active" : ""
            }`}
            onClick={() => setActivePage("home")}
          >
            Home
          </button>
          <button
            className={`patient-nav-tab ${
              activePage === "appointments" ? "active" : ""
            }`}
            onClick={() => setActivePage("appointments")}
          >
            Appointments
          </button>
          <button
            className={`patient-nav-tab ${
              activePage === "messages" ? "active" : ""
            }`}
            onClick={() => setActivePage("messages")}
          >
            Messages
          </button>
          <button
            className={`patient-nav-tab ${
              activePage === "medical-records" ? "active" : ""
            }`}
            onClick={() => setActivePage("medical-records")}
          >
            Medical Records
          </button>
          <button
            className={`patient-nav-tab ${
              activePage === "lab-results" ? "active" : ""
            }`}
            onClick={() => setActivePage("lab-results")}
          >
            Lab Results
          </button>
          <button
            className={`patient-nav-tab ${
              activePage === "billing" ? "active" : ""
            }`}
            onClick={() => setActivePage("billing")}
          >
            Consultation Billing
          </button>
          <button
            className={`patient-nav-tab ${
              activePage === "consultation-history" ? "active" : ""
            }`}
            onClick={() => setActivePage("consultation-history")}
          >
            Consultation History
          </button>
        </div>

        {/* Page Content */}
        {renderPage()}
      </div>

      {/* Mobile Profile Modal */}
      {showMobileProfileModal && (
        <div
          className="patient-mobile-profile-overlay"
          onClick={() => setShowMobileProfileModal(false)}
        >
          <div
            className="patient-mobile-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="patient-mobile-profile-modal-header">
              <h3>My Account</h3>
              <button
                className="patient-mobile-profile-close-btn"
                onClick={() => setShowMobileProfileModal(false)}
              >
                <FaClose />
              </button>
            </div>

            {/* Profile Image Section */}
            <div className="patient-mobile-profile-image-section">
              <div className="patient-mobile-profile-image-container">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="patient-mobile-profile-image"
                  />
                ) : (
                  <div className="patient-mobile-profile-image-placeholder">
                    <FaUser className="patient-mobile-profile-icon" />
                  </div>
                )}
                <button
                  className="patient-mobile-upload-btn"
                  onClick={() =>
                    document.getElementById("mobile-profile-upload").click()
                  }
                  title="Upload Photo"
                >
                  <FaCamera />
                </button>
                <input
                  id="mobile-profile-upload"
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </div>
              <div className="patient-mobile-profile-name">
                <h3 className="patient-mobile-profile-full-name">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="patient-mobile-profile-email">
                  {profileData.email}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="patient-mobile-account-tabs">
              <button
                className={`patient-mobile-tab-btn ${
                  activeProfileTab === "profile" ? "patient-active" : ""
                }`}
                onClick={() => setActiveProfileTab("profile")}
              >
                <FaUser className="patient-mobile-tab-icon" />
                Profile Information
              </button>
              <button
                className={`patient-mobile-tab-btn ${
                  activeProfileTab === "password" ? "patient-active" : ""
                }`}
                onClick={() => setActiveProfileTab("password")}
              >
                <FaLock className="patient-mobile-tab-icon" />
                Change Password
              </button>
            </div>

            {/* Profile Information Tab */}
            {activeProfileTab === "profile" && (
              <div className="patient-mobile-profile-section">
                <div className="patient-mobile-section-header">
                  <h3>Personal Information</h3>
                  {!isEditingProfile ? (
                    <button
                      className="patient-mobile-edit-btn"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <FaEdit />
                    </button>
                  ) : (
                    <div className="patient-mobile-edit-actions">
                      <button
                        className="patient-mobile-save-btn"
                        onClick={handleSaveProfile}
                      >
                        <FaSave />
                      </button>
                      <button
                        className="patient-mobile-cancel-btn"
                        onClick={handleCancelEdit}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>

                <div className="patient-mobile-form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile}
                    className="patient-mobile-form-input"
                  />
                </div>

                <div className="patient-mobile-form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile}
                    className="patient-mobile-form-input"
                  />
                </div>

                <div className="patient-mobile-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile}
                    className="patient-mobile-form-input"
                  />
                </div>

                <div className="patient-mobile-form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile}
                    className="patient-mobile-form-input"
                  />
                </div>

                <div className="patient-mobile-form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile}
                    className="patient-mobile-form-input"
                  />
                </div>

                <div className="patient-mobile-form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile}
                    className="patient-mobile-form-textarea"
                    rows="3"
                  />
                </div>

                <div className="patient-mobile-form-group">
                  <label>Emergency Contact</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile}
                    className="patient-mobile-form-input"
                  />
                </div>

                <div className="patient-mobile-form-group">
                  <label>Emergency Phone</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={profileData.emergencyPhone}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile}
                    className="patient-mobile-form-input"
                  />
                </div>
              </div>
            )}

            {/* Password Change Tab */}
            {activeProfileTab === "password" && (
              <div className="patient-mobile-password-section">
                <div className="patient-mobile-section-header">
                  <h3>Change Password</h3>
                </div>

                <div className="patient-mobile-form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="patient-mobile-form-input"
                  />
                </div>

                <div className="patient-mobile-form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="patient-mobile-form-input"
                  />
                </div>

                <div className="patient-mobile-form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="patient-mobile-form-input"
                  />
                </div>

                <button
                  className="patient-mobile-password-save-btn"
                  onClick={handleSavePassword}
                >
                  Change Password
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showAppointmentDetails && selectedAppointment && (
        <div className="patient-appointment-details-overlay">
          <div className="patient-appointment-details-modal">
            <div className="patient-appointment-details-header">
              <h2>Appointment Details</h2>
              <button
                className="patient-appointment-details-close"
                onClick={closeAppointmentDetails}
              >
                <FaTimes />
              </button>
            </div>

            <div className="patient-appointment-details-content">
              {/* Patient Information Section */}
              <div className="patient-appointment-details-section">
                <h3 className="patient-appointment-details-title">
                  Patient Information
                </h3>
                <div className="patient-appointment-details-grid">
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">
                      Name:
                    </span>
                    <span className="patient-appointment-details-value">{`${profileData.firstName} ${profileData.lastName}`}</span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">
                      Email:
                    </span>
                    <span className="patient-appointment-details-value">
                      {profileData.email}
                    </span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">
                      Mobile:
                    </span>
                    <span className="patient-appointment-details-value">
                      {profileData.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="patient-appointment-details-section">
                <h3 className="patient-appointment-details-title">
                  Medical Information
                </h3>
                <div className="patient-appointment-details-grid">
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">
                      Chief Complaint:
                    </span>
                    <span className="patient-appointment-details-value">
                      {selectedAppointment.chiefComplaint ||
                        "General Consultation"}
                    </span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">
                      Symptoms:
                    </span>
                    <span className="patient-appointment-details-value">
                      {selectedAppointment.symptoms || "Not specified"}
                    </span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">
                      Other Symptoms:
                    </span>
                    <span className="patient-appointment-details-value">
                      {selectedAppointment.otherSymptoms || "None"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Appointment Details Section */}
              <div className="patient-appointment-details-section">
                <h3 className="patient-appointment-details-title">
                  Appointment Details
                </h3>
                <div className="patient-appointment-details-grid">
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">
                      Preferred Date:
                    </span>
                    <span className="patient-appointment-details-value">
                      {selectedAppointment.date}
                    </span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">
                      Preferred Time:
                    </span>
                    <span className="patient-appointment-details-value">
                      {selectedAppointment.time || "10:00 AM"}
                    </span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">
                      Preferred Specialist:
                    </span>
                    <span className="patient-appointment-details-value">
                      {selectedAppointment.specialist}
                    </span>
                  </div>
                  <div className="patient-appointment-details-item">
                    <span className="patient-appointment-details-label">
                      Consultation Channel:
                    </span>
                    <span className="patient-appointment-details-value">
                      {selectedAppointment.consultationChannel ||
                        "Platform Chat"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
