import "./App.css";
import { useNavigate } from "react-router";
import { useState, useMemo, useEffect } from "react";
import nurseDocImage from "./assets/NurseDoc.png";
import phoneImage from "./assets/phoneImage.png";
import doc1 from "./assets/doc1.jpg";
import doc2 from "./assets/doc2.jpg";
import doc3 from "./assets/doc3.jpg";
import doc4 from "./assets/doc4.jpg";

function App() {
  const navigate = useNavigate();
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [callbackForm, setCallbackForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    philHealthNumber: "",
    contactMethod: "",
  });
  const [callbackErrors, setCallbackErrors] = useState({});
  const [hasPhilHealth, setHasPhilHealth] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });

  const showToast = (message, type = "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "" }), 4000);
  };

  const handleCallbackChange = (e) => {
    const { name, value } = e.target;
    setCallbackForm((prev) => ({ ...prev, [name]: value }));
    if (callbackErrors[name]) {
      setCallbackErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhilHealthChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 12) value = value.slice(0, 12);
    let formatted = value;
    if (value.length > 2) formatted = value.slice(0, 2) + "-" + value.slice(2);
    if (value.length > 11)
      formatted = value.slice(0, 2) + "-" + value.slice(2, 11) + "-" + value.slice(11);
    setCallbackForm((prev) => ({ ...prev, philHealthNumber: formatted }));
    if (callbackErrors.philHealthNumber) {
      setCallbackErrors((prev) => ({ ...prev, philHealthNumber: "" }));
    }
  };

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!callbackForm.firstName.trim()) errors.firstName = "Required";
    if (!callbackForm.lastName.trim()) errors.lastName = "Required";
    if (!callbackForm.email.trim()) errors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(callbackForm.email)) errors.email = "Invalid email";
    if (!callbackForm.contactNumber.trim()) errors.contactNumber = "Required";
    if (!callbackForm.contactMethod) errors.contactMethod = "Please select a contact method";
    if (hasPhilHealth) {
      const philRegex = /^\d{2}-\d{9}-\d$/;
      if (!callbackForm.philHealthNumber.trim()) {
        errors.philHealthNumber = "Required";
      } else if (!philRegex.test(callbackForm.philHealthNumber)) {
        errors.philHealthNumber = "Incomplete or invalid format (XX-XXXXXXXXX-X)";
      }
    }
    if (Object.keys(errors).length > 0) {
      setCallbackErrors(errors);
      return;
    }
    try {
      const response = await fetch("http://localhost:1337/api/callback-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: callbackForm.firstName,
          lastName: callbackForm.lastName,
          email: callbackForm.email,
          contactNumber: callbackForm.contactNumber,
          philHealthNumber: callbackForm.philHealthNumber || null,
          contactMethod: callbackForm.contactMethod,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Submission failed");
      showToast("Your callback request has been submitted!", "success");
    } catch (err) {
      showToast(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setShowCallbackModal(false);
      setCallbackForm({ firstName: "", lastName: "", email: "", contactNumber: "", philHealthNumber: "", contactMethod: "" });
      setCallbackErrors({});
      setHasPhilHealth(false);
    }
  };

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

    return howItWorksSlides;
  }, [doctors]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredCarouselIndex, setFeaturedCarouselIndex] = useState(0);

  // Dummy data: featured specialists (randomly highlighted, 4 per carousel slide)
  const featuredSpecialists = useMemo(() => {
    const list = [
      { id: 1, specialty: "Pedia", fullName: "Dr. Maria Elena Cruz", writeUp: "Board-certified pediatrician with over 10 years of experience in child health and development.", image: doc4 },
      { id: 2, specialty: "Psychiatrist", fullName: "Dr. Ana Patricia Reyes", writeUp: "Specializes in adult and adolescent mental health, anxiety, and mood disorders.", image: doc1 },
      { id: 3, specialty: "Internal Medicine", fullName: "Dr. Juan Carlos Santos", writeUp: "Expert in preventive care and management of chronic conditions.", image: doc2 },
      { id: 4, specialty: "Pulmonologist", fullName: "Dr. Roberto Dela Cruz", writeUp: "Focused on respiratory diseases, asthma, and sleep medicine.", image: doc3 },
      { id: 5, specialty: "Cardiologist", fullName: "Dr. Sofia Mendoza", writeUp: "Cardiovascular care and preventive cardiology for adults.", image: doc4 },
      { id: 6, specialty: "Pedia", fullName: "Dr. Luis Fernando Gomez", writeUp: "Pediatric care with emphasis on vaccinations and growth monitoring.", image: doc2 },
      { id: 7, specialty: "Internal Medicine", fullName: "Dr. Carmen Villanueva", writeUp: "General internal medicine and hospital follow-ups.", image: doc1 },
      { id: 8, specialty: "Psychiatrist", fullName: "Dr. Miguel Torres", writeUp: "Adult psychiatry and cognitive behavioral therapy.", image: doc3 },
      { id: 9, specialty: "Pulmonologist", fullName: "Dr. Elena Bautista", writeUp: "Lung function testing and COPD management.", image: doc4 },
      { id: 10, specialty: "Cardiologist", fullName: "Dr. Ricardo Lim", writeUp: "Interventional cardiology and heart failure care.", image: doc1 },
      { id: 11, specialty: "Pedia", fullName: "Dr. Lady Dominique Lumidao", writeUp: "General Medicine and pediatric consultations.", image: doc1 },
      { id: 12, specialty: "Internal Medicine", fullName: "Dr. Ciarra Isabella Liguid", writeUp: "RMT, MD with focus on holistic patient care.", image: doc3 },
    ];
    return list;
  }, []);

  const featuredSlides = useMemo(() => {
    const slides = [];
    for (let i = 0; i < featuredSpecialists.length; i += 4) {
      slides.push(featuredSpecialists.slice(i, i + 4));
    }
    return slides;
  }, [featuredSpecialists]);

  const doctorsOnlineNow = useMemo(() => {
    return [
      { id: 101, fullName: "Dr. Carlo Miguel Matanguihan", specialty: "Family Medicine", price: "₱975.00", image: doc1 },
      { id: 102, fullName: "Dr. Danilyn Rose Torres-Morado", specialty: "Internal Medicine, Rheumatology", price: "₱650.00", image: doc3 },
      { id: 103, fullName: "Dr. Marie Concepcion Renacia", specialty: "General Practitioner", price: "₱600.00", image: doc4 },
    ];
  }, []);

  const goToFeatured = (index) => {
    if (!featuredSlides.length) return;
    const normalized = ((index % featuredSlides.length) + featuredSlides.length) % featuredSlides.length;
    setFeaturedCarouselIndex(normalized);
  };

  const goTo = (index) => {
    const total = slides.length;
    if (!total) return;
    const normalized = ((index % total) + total) % total;
    setCurrentIndex(normalized);
  };

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Auto-scroll featured specialists carousel
  useEffect(() => {
    if (featuredSlides.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedCarouselIndex((prev) => (prev + 1) % featuredSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredSlides.length]);

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
                <div className="cta-buttons">
                  <button
                    className="consult-now-btn"
                    onClick={() => navigate("/loading")}
                  >
                    Consult Now
                  </button>
                  <button
                    className="callback-request-btn"
                    onClick={() => setShowCallbackModal(true)}
                  >
                    Callback Request
                  </button>
                </div>
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

        <section className="carousel-section" aria-label="How OkieDoc+ works">
          <div className="carousel-container">

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

        {/* Main specialties + Featured Specialists Section */}
        <section className="featured-section">
          <div className="featured-heading-wrap">
            <hr className="featured-heading-line" />
            <h3 className="featured-heading">Featured Specialists</h3>
            <hr className="featured-heading-line" />
          </div>
          <p className="featured-subtitle">A section wherein we feature OkieDoc+ specialists</p>

          <div className="featured-carousel-shell">
            <button
              type="button"
              className="featured-carousel-arrow featured-carousel-arrow--prev"
              onClick={() => goToFeatured(featuredCarouselIndex - 1)}
              aria-label="Previous featured specialists"
            >
              &#8249;
            </button>
            <div className="featured-carousel-viewport">
              <div
                className="featured-carousel-track"
                style={{ transform: `translateX(-${featuredCarouselIndex * 100}%)` }}
              >
                {featuredSlides.map((slideGroup, slideIdx) => (
                  <div key={slideIdx} className="featured-carousel-slide">
                    <div className="featured-cards-row">
                      {slideGroup.map((specialist) => (
                        <div
                          key={specialist.id}
                          className="featured-card"
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/doctor/${specialist.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              navigate(`/doctor/${specialist.id}`);
                            }
                          }}
                          aria-label={`View profile of ${specialist.fullName}`}
                        >
                          <div className="featured-card-avatar-wrap">
                            <img
                              src={specialist.image}
                              alt=""
                              className="featured-card-avatar"
                            />
                          </div>
                          <p className="featured-card-specialty">{specialist.specialty}</p>
                          <h4 className="featured-card-name">{specialist.fullName}</h4>
                          <p className="featured-card-writeup">{specialist.writeUp}</p>
                          <button
                            type="button"
                            className="featured-card-consult-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/doctor/${specialist.id}`);
                            }}
                          >
                            Consult Now
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="featured-carousel-arrow featured-carousel-arrow--next"
              onClick={() => goToFeatured(featuredCarouselIndex + 1)}
              aria-label="Next featured specialists"
            >
              &#8250;
            </button>
          </div>
          <div className="featured-carousel-dots" aria-hidden="true">
            {featuredSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`featured-carousel-dot ${index === featuredCarouselIndex ? "featured-carousel-dot--active" : ""}`}
                onClick={() => goToFeatured(index)}
              />
            ))}
          </div>

          <div className="featured-cta-block">
            <h3 className="featured-cta-heading">Be part of our team!</h3>
            <p className="featured-cta-text">
              Know more about OkieDoc+ as a platform for specialist and proceed with hassle free registration.
            </p>
            <button
              type="button"
              className="featured-cta-register-btn"
              onClick={() => navigate("/specialist-registration")}
            >
              Register as a specialist!
            </button>
          </div>
        </section>

        <div className="featured-online-section" aria-label="Doctors Online Now">
          <div className="featured-online-header">
            <div className="featured-online-title">
              <span className="featured-online-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#EAF9F1" stroke="#2ECC71" strokeWidth="1.5" />
                  <path d="M8 12.2l2.4 2.4L16.5 8.5" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h4 className="featured-online-heading">Doctors Online Now</h4>
            </div>
            <button
              type="button"
              className="featured-online-viewall"
              onClick={() => {
                const el = document.getElementById("featured-doctors-listing");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              VIEW ALL
            </button>
          </div>

          <div className="featured-online-cards">
            {doctorsOnlineNow.map((doc) => (
              <div key={doc.id} className="featured-online-card">
                <div className="featured-online-card-top">
                  <img className="featured-online-avatar" src={doc.image} alt="" />
                  <div className="featured-online-meta">
                    <div className="featured-online-name">{doc.fullName}</div>
                    <div className="featured-online-specialty">{doc.specialty}</div>
                  </div>
                </div>
                <div className="featured-online-actions">
                  <button
                    type="button"
                    className="featured-online-profile"
                    onClick={() => navigate(`/doctor/${doc.id}`)}
                  >
                    VIEW PROFILE
                  </button>
                  <button
                    type="button"
                    className="featured-online-consult"
                    onClick={() => navigate(`/doctor/${doc.id}`)}
                  >
                    <span className="featured-online-consult-text">CONSULT NOW</span>
                    <span className="featured-online-consult-price">{doc.price}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="featured-online-more"
            onClick={() => {
              const el = document.getElementById("featured-doctors-listing");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            VIEW MORE DOCTORS
          </button>
        </div>

        <section className="doctors-listing-section" id="featured-doctors-listing">
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
      {showCallbackModal && (
        <div className="callback-overlay">
          <div className="callback-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="callback-modal__close"
              onClick={() => setShowCallbackModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <form className="callback-form" onSubmit={handleCallbackSubmit} noValidate>
              <div className="callback-row">
                <div className="callback-field">
                  {callbackErrors.firstName && <span className="cb-error">{callbackErrors.firstName}</span>}
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={callbackForm.firstName}
                    onChange={handleCallbackChange}
                    className={callbackErrors.firstName ? "cb-input cb-input-error" : "cb-input"}
                  />
                </div>
                <div className="callback-field">
                  {callbackErrors.lastName && <span className="cb-error">{callbackErrors.lastName}</span>}
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={callbackForm.lastName}
                    onChange={handleCallbackChange}
                    className={callbackErrors.lastName ? "cb-input cb-input-error" : "cb-input"}
                  />
                </div>
              </div>
              <div className="callback-field">
                {callbackErrors.email && <span className="cb-error">{callbackErrors.email}</span>}
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={callbackForm.email}
                  onChange={handleCallbackChange}
                  className={callbackErrors.email ? "cb-input cb-input-error" : "cb-input"}
                />
              </div>
              <div className="callback-field">
                {callbackErrors.contactNumber && <span className="cb-error">{callbackErrors.contactNumber}</span>}
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="Contact Number"
                  value={callbackForm.contactNumber}
                  onChange={handleCallbackChange}
                  className={callbackErrors.contactNumber ? "cb-input cb-input-error" : "cb-input"}
                />
              </div>
              <div className="callback-field">
                <label className="cb-checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasPhilHealth}
                    onChange={(e) => setHasPhilHealth(e.target.checked)}
                    className="cb-checkbox"
                  />
                  I have a PhilHealth ID number
                </label>
                {hasPhilHealth && (
                  <div className="callback-field" style={{ marginTop: "0.4rem" }}>
                    {callbackErrors.philHealthNumber && <span className="cb-error">{callbackErrors.philHealthNumber}</span>}
                    <input
                      type="text"
                      name="philHealthNumber"
                      placeholder="Philhealth ID Number (XX-XXXXXXXXX-X)"
                      value={callbackForm.philHealthNumber}
                      onChange={handlePhilHealthChange}
                      maxLength={14}
                      className={callbackErrors.philHealthNumber ? "cb-input cb-input-error" : "cb-input"}
                    />
                  </div>
                )}
              </div>
              <div className="callback-field">
                <div className="cb-radio-group">
                  <label className="cb-radio-label">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="mobile"
                      checked={callbackForm.contactMethod === "mobile"}
                      onChange={handleCallbackChange}
                    />
                    Call via Mobile
                  </label>
                  <label className="cb-radio-label">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="viber"
                      checked={callbackForm.contactMethod === "viber"}
                      onChange={handleCallbackChange}
                    />
                    Call via Viber
                  </label>
                  <label className="cb-radio-label">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="viber-video"
                      checked={callbackForm.contactMethod === "viber-video"}
                      onChange={handleCallbackChange}
                    />
                    Video Call via Viber
                  </label>
                </div>
                {callbackErrors.contactMethod && <span className="cb-error">{callbackErrors.contactMethod}</span>}
              </div>
              <button type="submit" className="cb-submit-btn">Submit</button>
            </form>
          </div>
        </div>
      )}
      {toast.visible && (
        <div className={`cb-toast cb-toast--${toast.type}`}>
          <span>{toast.message}</span>
          <button className="cb-toast__close" onClick={() => setToast({ visible: false, message: "", type: "" })}>✕</button>
        </div>
      )}
    </div>
  );
}

export default App;
