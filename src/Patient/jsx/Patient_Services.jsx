import {
  IconCheck,
  IconPhone,
  IconMessage,
  IconVideo,
  IconMapPin,
  IconArrowRight,
  IconStethoscope,
  IconClock,
  IconRefresh,
} from "@tabler/icons-react";
import "../css/Patient_Services.css";

export default function Patient_Services({ setActive }) {
  const handleDIY = (item) => alert(`DIY: ${item}`);

  // Generates a random simulated database ID (e.g., BOK-49281)
  const generateSimulatedId = () =>
    `BOK-${Math.floor(10000 + Math.random() * 90000)}`;

  // Updates the URL, which App.jsx will detect and switch pages
  const handleBookSpecialist = () => {
    window.location.hash = `#/BookSpecialist/${generateSimulatedId()}`;
  };

  const handleBookPhysical = () => {
    window.location.hash = `#/BookPhysical/${generateSimulatedId()}`;
  };

  const goToAppointments = () => {
    window.location.hash = "#/Appointments";
  };

  return (
    <div className="svc-page-container">
      {/* --- 1. HERO SECTION --- */}
      <div className="svc-hero-banner">
        <div className="svc-hero-content">
          <div className="svc-hero-text">
            <span className="svc-hero-badge">Why OkieDoc+</span>
            <h1 className="svc-hero-title">
              Quality Healthcare at Your Fingertips
            </h1>
            <p className="svc-hero-subtitle">
              Experience seamless healthcare delivery with our comprehensive
              platform
            </p>
          </div>
          <div className="svc-hero-checklist">
            <div className="svc-checklist-item">
              <IconCheck size={20} color="white" />
              <span>Board-certified physicians</span>
            </div>
            <div className="svc-checklist-item">
              <IconCheck size={20} color="white" />
              <span>Secure & HIPAA compliant</span>
            </div>
            <div className="svc-checklist-item">
              <IconCheck size={20} color="white" />
              <span>Prescriptions when needed</span>
            </div>
            <div className="svc-checklist-item">
              <IconCheck size={20} color="white" />
              <span>Medical records access</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. MAIN HEADER --- */}
      <div className="svc-section-header-center">
        <span className="svc-badge bg-cyan text-white">
          <IconStethoscope size={12} /> Healthcare On Demand
        </span>
        <h2>Choose Your Consultation Type</h2>
        <p>Connect with healthcare professionals anytime, anywhere</p>
      </div>

      <div className="svc-content-wrapper">
        {/* --- 3. GENERAL PHYSICIAN CARDS --- */}
        <div className="svc-group-title">
          <h3>General Physician</h3>
          <p>Quick access to primary care doctors</p>
        </div>

        <div className="svc-grid-4">
          {/* Card 1: Nurse Callback */}
          <div className="svc-card svc-relative">
            <span className="svc-floating-badge left bg-cyan text-white">
              <IconCheck size={12} /> Beginner Friendly
            </span>
            <div className="svc-icon-circle bg-light-cyan text-blue">
              <IconPhone size={30} />
            </div>
            <h4>Request Nurse Callback</h4>
            <p className="svc-card-desc">
              A nurse will call you to assess your condition and guide next
              steps
            </p>
            <div className="svc-time-info">
              <IconClock size={16} className="text-muted" />
              <span>Within 2 hours</span>
            </div>
            <hr className="svc-divider" />
            <span className="svc-badge bg-light-green text-green mb-8">
              Always Free
            </span>
            <h2 className="text-blue">Free</h2>
            <p className="svc-price-desc">Initial triage and assessment</p>
            <button
              className="svc-btn bg-cyan text-white"
              onClick={goToAppointments}
            >
              Select Service <IconArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Chat */}
          <div className="svc-card">
            <div className="svc-icon-circle bg-light-cyan text-blue">
              <IconMessage size={30} />
            </div>
            <h4>Chat Consultation</h4>
            <p className="svc-card-desc">Text with a doctor anytime</p>
            <div className="svc-time-info">
              <IconClock size={16} className="text-muted" />
              <span>24/7 availability</span>
            </div>
            <hr className="svc-divider" />
            <div className="svc-price-box">
              <h2>₱250</h2>
              <span>/ session</span>
            </div>
            <p className="svc-price-desc">One-time payment</p>
            <button
              className="svc-btn bg-cyan text-white"
              onClick={() => handleDIY("Chat")}
            >
              Select Service <IconArrowRight size={16} />
            </button>
          </div>

          {/* Card 3: Voice */}
          <div className="svc-card svc-relative">
            <span className="svc-floating-badge right bg-light-teal text-teal">
              Most Popular
            </span>
            <div className="svc-icon-circle bg-light-teal text-teal">
              <IconPhone size={30} />
            </div>
            <h4>Voice Consultation</h4>
            <p className="svc-card-desc">Speak to a doctor by phone</p>
            <div className="svc-time-info">
              <IconClock size={16} className="text-muted" />
              <span>15-20 minutes</span>
            </div>
            <hr className="svc-divider" />
            <div className="svc-price-box">
              <h2>₱350</h2>
              <span>/ session</span>
            </div>
            <p className="svc-price-desc">One-time payment</p>
            <button
              className="svc-btn bg-teal text-white"
              onClick={() => handleDIY("Voice")}
            >
              Select Service <IconArrowRight size={16} />
            </button>
          </div>

          {/* Card 4: Video */}
          <div className="svc-card svc-relative border-cyan">
            <span className="svc-floating-badge center bg-cyan text-white">
              Recommended
            </span>
            <div className="svc-icon-circle bg-light-cyan text-blue">
              <IconVideo size={30} />
            </div>
            <h4>Video Consultation</h4>
            <p className="svc-card-desc">Face-to-face virtual visit</p>
            <div className="svc-time-info">
              <IconClock size={16} className="text-muted" />
              <span>20-30 minutes</span>
            </div>
            <hr className="svc-divider" />
            <div className="svc-price-box">
              <h2>₱450</h2>
              <span>/ session</span>
            </div>
            <p className="svc-price-desc">One-time payment</p>
            <button
              className="svc-btn bg-cyan text-white"
              onClick={() => handleDIY("Video")}
            >
              Select Service <IconArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* --- 4. IN-PERSON CONSULTATION --- */}
        <div className="svc-group-title">
          <h3>In-Person Consultation</h3>
          <p>Book an appointment at our clinics</p>
        </div>

        <div className="svc-wide-card border-cyan">
          <div className="svc-wide-content">
            <div className="svc-icon-square bg-cyan text-white">
              <IconMapPin size={40} />
            </div>
            <div className="svc-wide-text">
              <h3>Book Physical Consultation</h3>
              <p>
                Schedule an in-person visit with our healthcare professionals at
                convenient locations across the metro
              </p>
              <div className="svc-tags">
                <span className="svc-tag outline-cyan text-blue">
                  <IconMapPin size={12} /> Multiple Locations
                </span>
                <span className="svc-tag outline-cyan text-blue">
                  <IconRefresh size={12} /> Various Specialties
                </span>
                <span className="svc-tag outline-cyan text-blue">
                  <IconClock size={12} /> Flexible Scheduling
                </span>
              </div>
            </div>
          </div>
          <button
            className="svc-btn bg-cyan text-white svc-btn-wide"
            onClick={handleBookPhysical}
          >
            Schedule Appointment <IconArrowRight size={16} />
          </button>
        </div>

        {/* --- 5. SPECIALIST SERVICES --- */}
        <div className="svc-group-title">
          <h3>Specialist Services</h3>
          <p>Access to specialized medical expertise</p>
        </div>

        <div className="svc-wide-card border-violet">
          <div className="svc-wide-content flex-1">
            <div className="svc-icon-square bg-light-violet text-violet">
              <IconStethoscope size={40} />
            </div>
            <div className="svc-wide-text">
              <h3>Book Specialist Consultation</h3>
              <p>Expert care for specialized medical needs</p>
              <div className="svc-time-info mb-12">
                <IconClock size={16} className="text-muted" />
                <span>30-45 minutes</span>
              </div>
              <strong className="svc-list-title">Available Specialties:</strong>
              <div className="svc-tags">
                {[
                  "Cardiology",
                  "Dermatology",
                  "Psychiatry",
                  "Endocrinology",
                  "Gastroenterology",
                  "Orthopedics",
                ].map((spec) => (
                  <span
                    key={spec}
                    className="svc-tag outline-violet text-violet"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="svc-vertical-divider"></div>

          <div className="svc-pricing-col">
            <h2>From ₱1,500</h2>
            <p>Varies by specialty</p>
            <button
              className="svc-btn bg-violet text-white"
              onClick={handleBookSpecialist}
            >
              Book Specialist <IconArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- HERO SUB-ACTION --- */}
      <div className="svc-footer-action">
        <p>Need help choosing? Our care coordinators are available 24/7</p>
        <button className="svc-btn outline-cyan text-blue svc-btn-large">
          <IconPhone size={18} /> Talk to Care Team
        </button>
      </div>
    </div>
  );
}
