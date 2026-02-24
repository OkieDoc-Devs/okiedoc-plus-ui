import "./App.css";
import { useNavigate } from "react-router";
import { useState, useMemo } from "react";
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

  // CAROUSEL LOGIC
  const slides = useMemo(() => {
    const howItWorksSlides = [
      {
        id: "how-1",
        type: "info",
        label: "How it works",
        title: "Search for the right specialist",
        description:
          "Filter by doctor, hospital, or specialty and instantly see who is available today for online or in-person consultations.",
        steps: ["Browse verified specialists", "See real-time availability", "Compare consultation options"],
      },
      {
        id: "how-2",
        type: "info",
        label: "How it works",
        title: "Book in minutes, not days",
        description:
          "Choose a time that works for you, confirm your details, and receive your appointment confirmation straight away.",
        steps: ["Pick a schedule that fits you", "Confirm your contact details", "Receive instant confirmation"],
      },
      {
        id: "how-3",
        type: "info",
        label: "How it works",
        title: "Consult from wherever you are",
        description:
          "Join your consultation via mobile or desktop and keep all your records and follow-ups in one secure place.",
        steps: ["Join via mobile or desktop", "Get medical advice and e-prescriptions", "Track your history in OkieDoc+"],
      },
    ];

    const specialistSlides = (doctors || []).slice(0, 4).map((doctor) => ({
      id: `doc-${doctor.id}`,
      type: "specialist",
      label: "Featured specialist",
      doctor,
    }));

    const combined = [];
    const maxLength = Math.max(howItWorksSlides.length, specialistSlides.length);

    for (let i = 0; i < maxLength; i += 1) {
      if (howItWorksSlides[i]) combined.push(howItWorksSlides[i]);
      if (specialistSlides[i]) combined.push(specialistSlides[i]);
    }

    return combined.length ? combined : howItWorksSlides;
  }, [doctors]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = (index) => {
    const total = slides.length;
    if (!total) return;
    const normalized = ((index % total) + total) % total;
    setCurrentIndex(normalized);
  };

  const handlePrev = () => {
    goTo(currentIndex - 1);
  };

  const handleNext = () => {
    goTo(currentIndex + 1);
  };

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

        <section className="carousel-section" aria-label="How OkieDoc+ works and featured specialists">
          <div className="carousel-container">
            <div className="carousel-header">
              <h2 className="carousel-title">How OkieDoc+ works & our specialists</h2>
              <p className="carousel-subtitle">
                Learn how appointments work while discovering specialists you can book with today.
              </p>
            </div>

            <div className="carousel-shell">
              <button
                type="button"
                className="carousel-arrow carousel-arrow--prev"
                onClick={handlePrev}
                aria-label="Previous slide"
              >
                ‹
              </button>

              <div className="carousel-viewport">
                <div
                  className="carousel-track"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {slides.map((slide) => (
                    <div key={slide.id} className="carousel-slide">
                      {slide.type === "info" ? (
                        <div className="carousel-card carousel-card--info">
                          <span className="carousel-pill">{slide.label}</span>
                          <h3 className="carousel-card-title">{slide.title}</h3>
                          <p className="carousel-card-text">{slide.description}</p>
                          {slide.steps && (
                            <ul className="carousel-steps">
                              {slide.steps.map((step) => (
                                <li key={step} className="carousel-step-item">
                                  {step}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <div className="carousel-card carousel-card--specialist">
                          <span className="carousel-pill carousel-pill--accent">
                            {slide.label}
                          </span>
                          <div className="carousel-doctor-card">
                            <div className="carousel-doctor-main">
                              <img
                                src={slide.doctor.image}
                                alt={slide.doctor.name}
                                className="carousel-doctor-avatar"
                              />
                              <div className="carousel-doctor-info">
                                <h3 className="carousel-doctor-name">{slide.doctor.name}</h3>
                                <p className="carousel-doctor-credentials">
                                  {slide.doctor.credentials}
                                </p>
                                <div className="carousel-badges">
                                  <span
                                    className={`carousel-badge ${
                                      slide.doctor.onlineConsultation ? "carousel-badge--active" : ""
                                    }`}
                                  >
                                    {slide.doctor.onlineConsultation ? "✓" : "✕"} Online
                                  </span>
                                  <span
                                    className={`carousel-badge ${
                                      slide.doctor.inPersonConsultation ? "carousel-badge--active" : ""
                                    }`}
                                  >
                                    {slide.doctor.inPersonConsultation ? "✓" : "✕"} In-person
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="carousel-doctor-meta">
                              <p className="carousel-doctor-schedule-label">
                                Earliest schedule today
                              </p>
                              <p className="carousel-doctor-schedule">
                                {slide.doctor.schedule}
                              </p>
                              <p className="carousel-doctor-fee">Fee: {slide.doctor.fee}</p>
                              <div className="carousel-doctor-actions">
                                <button
                                  type="button"
                                  className="carousel-primary-btn"
                                  onClick={() => navigate("/loading")}
                                >
                                  Book appointment
                                </button>
                                <button
                                  type="button"
                                  className="carousel-secondary-link"
                                  onClick={() => navigate("/loading")}
                                >
                                  View profile
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="carousel-arrow carousel-arrow--next"
                onClick={handleNext}
                aria-label="Next slide"
              >
                ›
              </button>
            </div>

            <div className="carousel-dots" aria-hidden="true">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`carousel-dot ${index === currentIndex ? "carousel-dot--active" : ""}`}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
          </div>
        </section>

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
