import React, { useState, useEffect, useCallback } from "react";
import { logoutPatient } from "../services/auth";
import { useNavigate, useLocation } from "react-router-dom";
import MedicalRecords from "./MedicalRecords";
import Appointments from "./Appointments";
import Messages from "./Messages";
import "../css/PatientDashboard.css";
import LabResults from "./LabResults";
import Billing from "./Billing";
import MyAccount from "./MyAccount";
import ConsultationHistory from "./ConsultationHistory";
import { fetchPatientProfile } from "../services/apiService";
import appointmentService from "../services/appointmentService";
import { fetchLabResults } from "../services/labResultsService";
import { fetchMedicalRecords } from "../services/medicalRecordsService";
import {
  FaCalendarAlt,
  FaPills,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaCreditCard,
  FaUserCheck,
  FaPlay,
  FaComments, FaPhone,
  FaVideo,
  FaPhoneAlt,
} from "react-icons/fa";
import { FaTimes } from "react-icons/fa";

const PatientDashboard = () => {
  const [_globalId, setGlobalId] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [profileImage, setProfileImage] = useState(null);
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
  const navigate = useNavigate();
  const location = useLocation();

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
  const [recentLabResults, setRecentLabResults] = useState([]);
  const [currentMedications, setCurrentMedications] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isLoadingDashboardData, setIsLoadingDashboardData] = useState(true);

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
    loadDashboardData();
  }, []);

  // Sync activePage with URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/appointments")) setActivePage("appointments");
    else if (path.includes("/messages")) setActivePage("messages");
    else if (path.includes("/medical_records")) setActivePage("medical-records");
    else if (path.includes("/lab_results")) setActivePage("lab-results");
    else if (path.includes("/consultation_billing")) setActivePage("billing");
    else if (path.includes("/consultation_history")) setActivePage("consultation-history");
    else if (path.includes("/account")) setActivePage("my-account");
    else setActivePage("home");
  }, [location]);

  // Debug: Monitor homeAppointments changes
  useEffect(() => {
    // console.log("homeAppointments state changed:", homeAppointments);
  }, [homeAppointments]);

  const loadHomeAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const appointments = await appointmentService.getAllAppointments();
      // Filter for active or pending appointments for the dashboard
      const active = appointments.filter(app => app.status !== 'Completed' && app.status !== 'Cancelled').slice(0, 3);
      setHomeAppointments(active);
    } catch (error) {
      console.error("Failed to load home appointments", error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const loadDashboardData = async () => {
    setIsLoadingDashboardData(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const userId = currentUser?.id;
      if (userId) {
        const labs = await fetchLabResults(userId);
        setRecentLabResults(labs.slice(0, 3)); // Show top 3
        
        const records = await fetchMedicalRecords(userId);
        setCurrentMedications(records.medications || []);
      }
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setIsLoadingDashboardData(false);
    }
  };

  // Refresh appointments when new ones are added
  const refreshAppointments = () => {
    console.log("Refreshing home appointments...");
    loadHomeAppointments();
  };

  const openChat = (appointment) => {
    if (!appointment.specialistId) {
      console.error("Cannot open chat: Missing specialist ID");
      return;
    }
    navigate("/patient/messages", { 
      state: { 
        chatTarget: { 
          name: appointment.specialist, 
          id: appointment.specialistId 
        } 
      } 
    });
  };

  const handlePayment = (appointment) => {
    navigate("/patient/consultation_billing", { state: { appointmentId: appointment.id } });
  };

  const closeAppointmentDetails = () => {
    setShowAppointmentDetails(false);
    setSelectedAppointment(null);
  };

  // Add class to body for App.css override
  useEffect(() => {
    document.body.classList.add("patient-dashboard-active");

    return () => {
      document.body.classList.remove("patient-dashboard-active");
    };
  }, []);


  const handleViewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
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
                      {isLoadingAppointments ? (
                        <div className="patient-loading-box">
                          <div className="patient-loading-box-spinner"></div>
                        </div>
                      ) : homeAppointments.length === 0 ? (
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
                                <div
                                  className="patient-home-ticket-actions"
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  {appointment.status === "Active" && (
                                    <button
                                      className="patient-chat-btn"
                                      onClick={() => openChat(appointment)}
                                    >
                                      <FaComments className="patient-home-action-icon" />
                                      Chat
                                    </button>
                                  )}
                                  {appointment.status === "For Payment" && (
                                    <button
                                      className="patient-payment-btn"
                                      onClick={() => handlePayment(appointment)}
                                    >
                                      <FaCreditCard className="patient-home-action-icon" />
                                      Pay
                                    </button>
                                  )}
                                  <button
                                    className="patient-view-details-btn"
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
                    </div>
                    {isLoadingDashboardData ? (
                      <div className="patient-loading-box">
                        <div className="patient-loading-box-spinner"></div>
                      </div>
                    ) : (
                      <div className="patient-lab-results-list">
                        {recentLabResults.length > 0 ? (
                          recentLabResults.map((result) => (
                            <div key={result.id} className="patient-lab-result-item">
                              <div className="patient-result-icon"><FaFileAlt /></div>
                              <div className="patient-result-name">{result.name}</div>
                              <div className="patient-result-date">{result.date}</div>
                            </div>
                          ))
                        ) : (
                          <p>No lab results available.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Medications Card */}
                  <div className="patient-medications-card">
                    <div className="patient-card-header">
                      <h3 className="patient-card-title">Medications</h3>
                    </div>
                    {isLoadingDashboardData ? (
                      <div className="patient-loading-box">
                        <div className="patient-loading-box-spinner"></div>
                      </div>
                    ) : (
                      <div className="patient-medications-list">
                        {currentMedications.length > 0 ? (
                          currentMedications.map((med) => (
                            <div key={med.id} className="patient-medication-item">
                              <div className="patient-medication-icon"><FaPills /></div>
                              <div className="patient-medication-name">{med.name}</div>
                              <div className="patient-medication-dosage">{med.description || med.dosage}</div>
                            </div>
                          ))
                        ) : (
                          <p>No medications prescribed.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Appointment Details Modal */}
              {showAppointmentDetails && selectedAppointment && (
                <div className="patient-appointment-details-overlay" onClick={closeAppointmentDetails}>
                  <div className="patient-appointment-details-modal" onClick={(e) => e.stopPropagation()}>
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
                      <div className="patient-appointment-details-section">
                        <h3 className="patient-appointment-details-title">
                          Appointment Information
                        </h3>
                        <div className="patient-appointment-details-grid">
                          <div className="patient-appointment-details-item">
                            <span className="patient-appointment-details-label">
                              Title:
                            </span>
                            <span className="patient-appointment-details-value">
                              {selectedAppointment.title}
                            </span>
                          </div>
                          <div className="patient-appointment-details-item">
                            <span className="patient-appointment-details-label">
                              Status:
                            </span>
                            <span className="patient-appointment-details-value">
                              {selectedAppointment.status}
                            </span>
                          </div>
                          <div className="patient-appointment-details-item">
                            <span className="patient-appointment-details-label">
                              Specialist:
                            </span>
                            <span className="patient-appointment-details-value">
                              {selectedAppointment.specialist}
                            </span>
                          </div>
                          <div className="patient-appointment-details-item">
                            <span className="patient-appointment-details-label">
                              Specialty:
                            </span>
                            <span className="patient-appointment-details-value">
                              {selectedAppointment.specialty}
                            </span>
                          </div>
                          <div className="patient-appointment-details-item">
                            <span className="patient-appointment-details-label">
                              Date:
                            </span>
                            <span className="patient-appointment-details-value">
                              {selectedAppointment.date}
                            </span>
                          </div>
                          <div className="patient-appointment-details-item">
                            <span className="patient-appointment-details-label">
                              Time:
                            </span>
                            <span className="patient-appointment-details-value">
                              {selectedAppointment.time}
                            </span>
                          </div>
                          <div className="patient-appointment-details-item">
                            <span className="patient-appointment-details-label">
                              Consultation Type:
                            </span>
                            <span className="patient-appointment-details-value">
                              {selectedAppointment.consultationType}
                            </span>
                          </div>
                          <div className="patient-appointment-details-item">
                            <span className="patient-appointment-details-label">
                              Consultation Channel:
                            </span>
                            <span className="patient-appointment-details-value">
                              {selectedAppointment.consultationChannel}
                            </span>
                          </div>
                          <div className="patient-appointment-details-item">
                            <span className="patient-appointment-details-label">
                              Booking Method:
                            </span>
                            <span className="patient-appointment-details-value">
                              {selectedAppointment.bookingMethod}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedAppointment.medicalDetails && (
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
                                {selectedAppointment.medicalDetails.chiefComplaint || "General Consultation"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            </>
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

  return renderPage();
};

export default PatientDashboard;
