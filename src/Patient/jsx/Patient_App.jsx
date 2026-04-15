import { useState, useEffect } from "react";
import {
  IconLayoutDashboard,
  IconStethoscope,
  IconCalendarEvent,
  IconFileDescription,
  IconUser,
  IconBell,
  IconMenu2,
} from "@tabler/icons-react";
import "../css/Patient_App.css";

// Import your pages
import Dashboard_Patient from "./Patient_Dashboard";
import Services_Patient from "./Patient_Services";
import Appointments_Patient from "./Patient_Appointments";
import ConsultationIntakeForm from "./ConsultationIntakeForm";
// import { MedicalRecords } from "./MedicalRecords";
// import { Profile } from "./Profile";
// import { BookSpecialist } from "./sub-page/BookSpecialist";
// import { BookPhysical } from "./sub-page/BookPhysical";
import MedicalRecords_Patient from "./Patient_MedicalRecords";
import Prescriptions_Patient from "./Patient_Prescriptions";
import Profile_Patient from "./Patient_Profile";

// Sub-Pages for Patient
import { BookSpecialist } from "../sub-pages/BookSpecialist";
import { BookPhysical } from "../sub-pages/BookPhysical";

const navLinks = [
  { label: "Dashboard", route: "Dashboard", icon: IconLayoutDashboard },
  { label: "Services", route: "Services", icon: IconStethoscope },
  { label: "Appointments", route: "Appointments", icon: IconCalendarEvent },
  {
    label: "Medical Records",
    route: "MedicalRecords",
    icon: IconFileDescription,
  },
  { label: "Profile", route: "Profile", icon: IconUser },
];

function Patient_App() {
  // THE ROUTING ENGINE: Reads the browser URL Hash
  const [currentHash, setCurrentHash] = useState(
    window.location.hash || "#/Dashboard",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Listen for native browser navigation (Back, Forward, Refresh, Links)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || "#/Dashboard");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Custom Navigation function
  const navigate = (path) => {
    window.location.hash = `#/${path}`;
    setSidebarOpen(false); // Close sidebar on mobile
  };

  // Parse the current URL Hash
  // Example: "#/BookSpecialist/BOK-1234" becomes -> mainRoute: "BookSpecialist", idParam: "BOK-1234"
  const pathParts = currentHash.replace("#/", "").split("/");
  const mainRoute = pathParts[0] || "Dashboard";
  const typeParam = pathParts[1];

  // For the active highlight in the sidebar (we don't want "Services" highlighted if booking is open)
  const isBookingOpen =
    mainRoute === "BookSpecialist" ||
    mainRoute === "BookPhysical" ||
    mainRoute === "IntakeForm";
  const sidebarActiveTab = isBookingOpen ? null : mainRoute;

  const handleNotificationClick = () =>
    alert("DIY: Notification panel goes here!");

  // Find icon for the 404 page
  const currentNavLink = navLinks.find((link) => link.route === mainRoute);
  const ActiveIcon = currentNavLink ? currentNavLink.icon : null;

  return (
    <div className="app-container">
      {/* --- HEADER --- */}
      <header className="app-header">
        <div className="header-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <IconMenu2 size={24} />
          </button>
          <div className="logo-container">
            <img src="/okie-doc-logo.png" alt="OkieDoc+" className="logo" />
          </div>
        </div>

        <div className="header-right">
          <button
            className="icon-button notification-btn"
            onClick={handleNotificationClick}
          >
            <IconBell size={24} stroke={1.5} />
            <span className="notification-badge">3</span>
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* --- SIDEBAR NAVBAR --- */}
        <nav className={`app-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="patientapp-nav-links">
            {navLinks.map((item) => (
              <button
                key={item.label}
                className={`nav-item ${sidebarActiveTab === item.route ? "active" : ""}`}
                onClick={() => navigate(item.route)}
              >
                <item.icon size={20} stroke={1.5} className="nav-icon" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="help-box">
            <h4>Need Help?</h4>
            <p>
              Our support team is available
              <br />
              24/7
            </p>
          </div>
        </nav>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="app-main">
          <div className="main-content-wrapper">
            {/* The Router Switch */}
            {mainRoute === "Dashboard" && (
              <Dashboard_Patient setActive={navigate} />
            )}
            {mainRoute === "Appointments" && (
              <Appointments_Patient setActive={navigate} />
            )}
            {mainRoute === "Services" && (
              <Services_Patient setActive={navigate} />
            )}
            {mainRoute === "MedicalRecords" && (
              <MedicalRecords_Patient setActive={navigate} />
            )}
            {mainRoute === "Prescriptions" && (
              <Prescriptions_Patient setActive={navigate} />
            )}
            {mainRoute === "Profile" && (
              <Profile_Patient setActive={navigate} />
            )}

            {/* Your Sub-Pages */}
            {mainRoute === "BookSpecialist" && (
              <BookSpecialist
                onGoBack={() => navigate("Services")}
                onGoToAppointments={() => navigate("Appointments")}
                onGoToDashboard={() => navigate("Dashboard")}
              />
            )}

            {mainRoute === "BookPhysical" && (
              <BookPhysical
                onGoBack={() => navigate("Services")}
                onGoToAppointments={() => navigate("Appointments")}
                onGoToDashboard={() => navigate("Dashboard")}
                  />
            )}
            {mainRoute === "IntakeForm" && (
              <ConsultationIntakeForm
                setActive={navigate}
                type={decodeURIComponent(typeParam || "Consultation")}
              />
            )}

            {/* Custom 404 / Work In Progress State */}
            {mainRoute !== "Dashboard" &&
              mainRoute !== "Services" &&
              mainRoute !== "Appointments" &&
              mainRoute !== "BookPhysical" &&
              mainRoute !== "BookSpecialist" &&
              mainRoute !== "MedicalRecords" &&
              mainRoute !== "Prescriptions" &&
              mainRoute !== "Profile" &&
              mainRoute !== "IntakeForm" && (
                <div className="not-found-container">
                  {ActiveIcon && (
                    <ActiveIcon size={64} className="not-found-icon" />
                  )}
                  <h2>{currentNavLink ? currentNavLink.label : mainRoute}</h2>
                  <p>This page is currently under development.</p>
                  <button
                    className="back-home-btn"
                    onClick={() => navigate("Dashboard")}
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
          </div>
        </main>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
}

export default Patient_App;
