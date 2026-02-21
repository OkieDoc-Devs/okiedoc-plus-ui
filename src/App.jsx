import "./App.css";
import { useNavigate } from "react-router";
import { useState } from "react";
import nurseDocImage from "./assets/NurseDoc.png";
import phoneImage from "./assets/phoneImage.png";
import doc1 from "./assets/doc1.jpg";
import doc2 from "./assets/doc2.jpg";
import doc3 from "./assets/doc3.jpg";
import doc4 from "./assets/doc4.jpg";

function App() {
  const navigate = useNavigate();
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);

  const navLinks = [
    "Products",
    "Solutions",
    "Community",
    "Resources",
    "Pricing",
    "Contact",
    "Link",
  ];

  const toggleDropdownMenu = () => {
    setIsDropdownMenuOpen(!isDropdownMenuOpen);
  };

  // MOCK DOCTOR DATA
  const doctors = [
    {
      id: 1,
      name: "Dr. Lady Dominique Lumidao",
      credentials: "RMT, MD - General Medicine",
      image: doc1,
      onlineConsultation: true,
      inPersonConsultation: false,
      clinicType: "Online Clinic",
      schedule: "Today, 09:00 AM - 10:00 PM",
      fee: "₱350.00",
    },
    {
      id: 2,
      name: "Dr. Ciarra Isabella Liguid",
      credentials: "RMT, MD - General Medicine",
      image: doc3,
      onlineConsultation: true,
      inPersonConsultation: false,
      clinicType: "Online Clinic",
      schedule: "Today, 01:00 PM - 10:00 PM",
      fee: "₱315.00",
    },
    {
      id: 3,
      name: "Dr. Juan Carlos Santos",
      credentials: "MD - Internal Medicine",
      image: doc2,
      onlineConsultation: true,
      inPersonConsultation: true,
      clinicType: "Online Clinic",
      schedule: "Today, 08:00 AM - 05:00 PM",
      fee: "₱400.00",
    },
    {
      id: 4,
      name: "Dr. Maria Elena Cruz",
      credentials: "MD - Pediatrics",
      image: doc4,
      onlineConsultation: true,
      inPersonConsultation: false,
      clinicType: "Online Clinic",
      schedule: "Today, 10:00 AM - 06:00 PM",
      fee: "₱350.00",
    },
  ];

  return (
    <div className="app-container">
      <div className="container1">
        <div className="header">
          <button
            className="mobile-nav-toggle"
            onClick={toggleDropdownMenu}
            aria-label="Toggle dropdown menu"
          >
            ☰
          </button>

          <div className="logo-section">
            <img
              src="/okie-doc-logo.png"
              alt="OkieDoc+"
              className="logo-image"
            />
          </div>

          <div className="text-and-buttons">
            <nav className="nav-links">
              {navLinks.map((link) => (
                <a key={link} href="#" className="nav-link">
                  {link}
                </a>
              ))}
            </nav>
          </div>

          <div className="button-group">
            <button className="btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="btn" onClick={() => navigate("/registration")}>
              Register
            </button>
          </div>

          <div
            className={`mobile-nav-dropdown ${
              isDropdownMenuOpen ? "open" : ""
            }`}
          >
            {navLinks.map((link) => (
              <a key={link} href="#" className="nav-link">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Commercial Page Content */}
      <div className="commercial-sections">
        <div className="content-wrapper">
          <div className="doctor-section">
            <img
              src={nurseDocImage}
              alt="Medical Professional"
              className="doctor-image"
            />
          </div>

          <div className="info-section">
            <div className="search-section">
              <h1 className="main-heading">FIND A SPECIALIST</h1>
              <p className="sub-heading">
                Book your Appointment - Anytime, Anywhere
              </p>

              <div className="search-form">
                <div className="search-bar">
                  <svg
                    className="search-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <path d="M21 21l-4.35-4.35" strokeWidth="2" />
                  </svg>
                  <div className="search-input">
                    Your health starts here — search by doctor, hospital, or
                    specialty
                  </div>
                </div>
              </div>
            </div>

            <div className="cta-section">
              <div className="cta-content">
                <h2 className="cta-heading">
                  Immediate access to medical professionals
                </h2>
                <p className="cta-text">Get connected to a doctor right away.</p>
                <button
                  className="consult-now-btn"
                  onClick={() => navigate("/loading")}
                >
                  Consult Now
                </button>
              </div>
              <div className="phone-mockup">
                <img
                  src={phoneImage}
                  alt="Mobile App Preview"
                  className="phone-image"
                />
              </div>
            </div>
          </div>
        </div>

        <section className="doctors-listing-section">
          <div className="doctors-listing-container">
            <h2 className="doctors-listing-heading">
              Our Available Specialists
            </h2>
            <div className="doctors-list">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-info">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="doctor-avatar"
                    />
                    <div className="doctor-details">
                      <h3 className="doctor-name">{doctor.name}</h3>
                      <p className="doctor-credentials">{doctor.credentials}</p>
                      <div className="consultation-types">
                        <span
                          className={`consultation-badge ${
                            doctor.onlineConsultation ? "active" : "inactive"
                          }`}
                        >
                          {doctor.onlineConsultation ? "✓" : "✕"} Online
                          Consultation
                        </span>
                        <span
                          className={`consultation-badge ${
                            doctor.inPersonConsultation ? "active" : "inactive"
                          }`}
                        >
                          {doctor.inPersonConsultation ? "✓" : "✕"} In-Person
                          Consultation
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="schedule-info">
                    <p className="schedule-label">
                      Earliest Available Schedule
                    </p>
                    <div className="schedule-details">
                      <div className="clinic-icon">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#4aa7ed"
                          strokeWidth="1.5"
                        >
                          <rect x="5" y="2" width="14" height="20" rx="2" />
                          <path d="M12 18h.01" />
                          <path d="M9 6h6" />
                          <path d="M9 10h6" />
                        </svg>
                      </div>
                      <div className="clinic-info">
                        <p className="clinic-type">{doctor.clinicType}</p>
                        <p className="clinic-schedule">{doctor.schedule}</p>
                        <p className="clinic-fee">Fee: {doctor.fee}</p>
                      </div>
                    </div>
                  </div>

                  <div className="doctor-actions">
                    <button
                      className="book-appointment-link"
                      onClick={() => navigate("/loading")}
                    >
                      BOOK APPOINTMENT
                    </button>
                    <button
                      className="view-profile-btn"
                      onClick={() => navigate("/loading")}
                    >
                      VIEW PROFILE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
