import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import "../css/PatientDashboard.css";
import { logoutPatient } from "../services/auth";
import { fetchPatientProfile } from "../services/apiService";

const PatientLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileImage, setProfileImage] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
  });

  // Get active page from URL
  const getActivePageFromPath = () => {
    const path = location.pathname;
    if (path === "/patient/main") return "home";
    if (path === "/patient/appointments") return "appointments";
    if (path === "/patient/messages") return "messages";
    if (path === "/patient/medical_records") return "medical-records";
    if (path === "/patient/lab_results") return "lab-results";
    if (path === "/patient/consultation_billing") return "billing";
    if (path === "/patient/consultation_history") return "consultation-history";
    if (path === "/patient/account") return "account";
    return "home";
  };

  const activePage = getActivePageFromPath();
  const displayName = `${profileData.firstName} ${profileData.lastName}`.trim() || "Patient";

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const currentUser = localStorage.getItem("currentUser");
        if (currentUser) {
          const user = JSON.parse(currentUser);
          setProfileData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
          });
        }

        const profile = await fetchPatientProfile();
        if (profile) {
          setProfileData((prev) => ({
            ...prev,
            firstName: profile.firstName || prev.firstName,
            lastName: profile.lastName || prev.lastName,
          }));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutPatient();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const navigateTo = (page) => {
    const routes = {
      home: "/patient/main",
      appointments: "/patient/appointments",
      messages: "/patient/messages",
      "medical-records": "/patient/medical_records",
      "lab-results": "/patient/lab_results",
      billing: "/patient/consultation_billing",
      "consultation-history": "/patient/consultation_history",
      account: "/patient/account",
    };
    navigate(routes[page]);
  };

  return (
    <div className="patient-dashboard">
      {/* Main Content */}
      <div className="patient-main-content">
        <div className="patient-header">
          <div className="patient-header-left">
          </div>
          <div className="patient-header-center">
            <button className="patient-header-logo-btn"
              onClick={() => navigateTo("home")}
              title="Go to Home"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <img
                src="/okie-doc-logo.png"
                alt="OkieDoc+"
                className="patient-header-logo"
              />
            </button>
          </div>
          <div className="patient-user-profile">
            <button
              className="patient-profile-trigger"
              onClick={() => navigateTo("account")}
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
                className="patient-dropdown-item patient-logout-item"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Button Navs */}
        <div className="patient-dashboard-nav">
          <button
            className={`patient-nav-tab ${activePage === "appointments" ? "active" : ""}`}
            onClick={() => navigateTo("appointments")}
          >
            Appointments
          </button>
          <button
            className={`patient-nav-tab ${activePage === "messages" ? "active" : ""}`}
            onClick={() => navigateTo("messages")}
          >
            Messages
          </button>
          <button
            className={`patient-nav-tab ${activePage === "medical-records" ? "active" : ""}`}
            onClick={() => navigateTo("medical-records")}
          >
            Medical Records
          </button>
          <button
            className={`patient-nav-tab ${activePage === "lab-results" ? "active" : ""}`}
            onClick={() => navigateTo("lab-results")}
          >
            Lab Results
          </button>
          <button
            className={`patient-nav-tab ${activePage === "billing" ? "active" : ""}`}
            onClick={() => navigateTo("billing")}
          >
            Consultation Billing
          </button>
          <button
            className={`patient-nav-tab ${activePage === "consultation-history" ? "active" : ""}`}
            onClick={() => navigateTo("consultation-history")}
          >
            Consultation History
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default PatientLayout;
