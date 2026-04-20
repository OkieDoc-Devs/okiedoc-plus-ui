import { useState, useEffect } from "react";
import {
  IconLayoutDashboard,
  IconStethoscope,
  IconCalendarEvent,
  IconFileDescription,
  IconUser,
  IconBell,
  IconMenu2,
  IconPill,
} from "@tabler/icons-react";
import styles from "../css/Patient_App.module.css";

// Import your pages
import Dashboard_Patient from "./Patient_Dashboard";
import Services_Patient from "./Patient_Services";
import Appointments_Patient from "./Patient_Appointments";
import MedicalRecords_Patient from "./Patient_MedicalRecords";
import Prescriptions_Patient from "./Patient_Prescriptions";
import Profile_Patient from "./Patient_Profile";

// Sub-Pages for Patient
import BookSpecialist from "../sub-pages/BookSpecialist";
import BookPhysical from "../sub-pages/BookPhysical";
import ConsultationIntakeForm from "../sub-pages/ConsultationIntakeForm";
import RecordSharing from "../sub-pages/RecordSharing";

const navLinks = [
  { label: "Dashboard", route: "Dashboard", icon: IconLayoutDashboard },
  { label: "Services", route: "Services", icon: IconStethoscope },
  { label: "Appointments", route: "Appointments", icon: IconCalendarEvent },
  {
    label: "Medical Records",
    route: "MedicalRecords",
    icon: IconFileDescription,
  },
  { label: "Prescriptions", route: "Prescriptions", icon: IconPill },
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
    const handleHashChange = (e) => {
      // 1. INTERCEPT BROWSER BACK BUTTON
      if (
        window.isProfileEditing &&
        typeof window.triggerProfileCancelModal === "function"
      ) {
        const targetPath = e.newURL ? e.newURL.split("#/")[1] : "Dashboard";

        // Silently revert the URL back to Profile without triggering an infinite loop
        window.history.replaceState(null, "", "#/Profile");

        // Trigger the custom modal inside the Profile component
        window.triggerProfileCancelModal(targetPath);
        return;
      }
      setCurrentHash(window.location.hash || "#/Dashboard");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Custom Navigation function
  const navigate = (path) => {
    // 2. INTERCEPT SIDEBAR CLICKS
    if (
      window.isProfileEditing &&
      typeof window.triggerProfileCancelModal === "function"
    ) {
      window.triggerProfileCancelModal(path);
      return; // Pause the navigation, let the Profile Modal handle it
    }

    window.location.hash = `#/${path}`;
    setSidebarOpen(false); // Close sidebar on mobile
  };

  // Parse the current URL Hash
  // Example: '#/BookSpecialist/BOK-1234' becomes -> mainRoute: 'BookSpecialist', idParam: 'BOK-1234'
  const pathParts = currentHash.replace("#/", "").split("/");
  const mainRoute = pathParts[0] || "Dashboard";
  const typeParam = pathParts[1];

  // For the active highlight in the sidebar (we don't want 'Services' highlighted if booking is open)
  const isBookingOpen =
    mainRoute === "BookSpecialist" ||
    mainRoute === "BookPhysical" ||
    mainRoute === "IntakeForm" ||
    mainRoute === "RecordSharing";
  const sidebarActiveTab = isBookingOpen ? null : mainRoute;

  const handleNotificationClick = () =>
    alert("DIY: Notification panel goes here!");

  // Find icon for the 404 page
  const currentNavLink = navLinks.find((link) => link.route === mainRoute);
  const ActiveIcon = currentNavLink ? currentNavLink.icon : null;

  return (
    <div className={styles["app-container"]}>
      {/* --- HEADER --- */}
      <header className={styles["app-header"]}>
        <div className={styles["header-left"]}>
          <button
            className={styles["mobile-menu-btn"]}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <IconMenu2 size={24} />
          </button>
          <div className={styles["logo-container"]}>
            <img
              src="/okie-doc-logo.png"
              alt="OkieDoc+"
              className={styles["logo"]}
            />
          </div>
        </div>

        <div className={styles["header-right"]}>
          <button
            className={`${styles["icon-button"]} ${styles["notification-btn"]}`}
            onClick={handleNotificationClick}
          >
            <IconBell size={24} stroke={1.5} />
            <span className={styles["notification-badge"]}>3</span>
          </button>
        </div>
      </header>

      <div className={styles["app-body"]}>
        {/* --- SIDEBAR NAVBAR --- */}
        <nav
          className={`${styles["app-sidebar"]} ${sidebarOpen ? styles["open"] : ""}`}
        >
          <div className={styles["patientapp-nav-links"]}>
            {navLinks.map((item) => (
              <button
                key={item.label}
                className={`${styles["nav-item"]} ${sidebarActiveTab === item.route ? styles["active"] : ""}`}
                onClick={() => navigate(item.route)}
              >
                <item.icon
                  size={20}
                  stroke={1.5}
                  className={styles["nav-icon"]}
                />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className={styles["help-box"]}>
            <h4>Need Help?</h4>
            <p>
              Our support team is available
              <br />
              24/7
            </p>
          </div>
        </nav>

        {/* --- MAIN CONTENT AREA --- */}
        <main className={styles["app-main"]}>
          <div className={styles["main-content-wrapper"]}>
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
            {mainRoute === "IntakeForm" && (
              <ConsultationIntakeForm
                setActive={navigate}
                type={decodeURIComponent(typeParam || "Consultation")}
              />
            )}

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

            {mainRoute === "RecordSharing" && (
              <RecordSharing onGoBack={() => navigate("MedicalRecords")} />
            )}

            {/* Custom 404 / Work In Progress State */}
            {mainRoute !== "Dashboard" &&
              mainRoute !== "Services" &&
              mainRoute !== "IntakeForm" &&
              mainRoute !== "BookPhysical" &&
              mainRoute !== "BookSpecialist" &&
              mainRoute !== "Appointments" &&
              mainRoute !== "MedicalRecords" &&
              mainRoute !== "RecordSharing" &&
              mainRoute !== "Prescriptions" &&
              mainRoute !== "Profile" && (
                <div className={styles["not-found-container"]}>
                  {ActiveIcon && (
                    <ActiveIcon
                      size={64}
                      className={styles["not-found-icon"]}
                    />
                  )}
                  <h2>{currentNavLink ? currentNavLink.label : mainRoute}</h2>
                  <p>This page is currently under development.</p>
                  <button
                    className={styles["back-home-btn"]}
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
            className={styles["sidebar-overlay"]}
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
}

export default Patient_App;
