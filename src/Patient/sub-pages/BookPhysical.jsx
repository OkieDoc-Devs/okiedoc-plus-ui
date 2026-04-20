import React, { useState } from "react";
import {
  IconCheck,
  IconChevronLeft,
  IconAlertCircle,
  IconCalendarEvent,
  IconClock,
  IconStethoscope,
  IconMapPin,
  IconSearch,
  IconUser,
  IconBuildingHospital,
  IconFileDescription,
  IconCircleCheck,
  IconPhone,
  IconArrowRight,
} from "@tabler/icons-react";
import "../css/BookPhysical.css";

const STEPS = [
  { label: "Doctor", icon: IconStethoscope },
  { label: "Facility", icon: IconBuildingHospital },
  { label: "Date & Time", icon: IconCalendarEvent },
  { label: "Patient Info", icon: IconUser },
  { label: "Details", icon: IconFileDescription },
  { label: "Review", icon: IconCircleCheck },
];

const doctors = [
  {
    id: 1,
    name: "Dr. Maria Santos",
    spec: "General Practitioner",
    clinic: "OkieDoc+ Makati Clinic",
    loc: "Makati City",
    exp: "15 years experience",
    initials: "MS",
    available: true,
  },
  {
    id: 2,
    name: "Dr. Juan Reyes",
    spec: "Pediatrician",
    clinic: "OkieDoc+ Quezon City Clinic",
    loc: "Quezon City",
    exp: "12 years experience",
    initials: "JR",
    available: true,
  },
  {
    id: 3,
    name: "Dr. Sofia Lim",
    spec: "Cardiologist",
    clinic: "OkieDoc+ BGC Clinic",
    loc: "Taguig City",
    exp: "20 years experience",
    initials: "SL",
    available: false,
  },
  {
    id: 4,
    name: "Dr. Carlos Torres",
    spec: "Dermatologist",
    clinic: "OkieDoc+ Skin Clinic",
    loc: "Ortigas",
    exp: "10 years experience",
    initials: "CT",
    available: true,
  },
];

// Expanded facilities to match the doctors' locations
const facilities = [
  {
    id: 1,
    name: "OkieDoc+ Makati Clinic",
    address: "123 Ayala Avenue, Makati City",
    room: "Room 301 • 3rd Floor",
    loc: "Makati City",
  },
  {
    id: 2,
    name: "OkieDoc+ Makati Annex",
    address: "456 Makati Avenue, Makati City",
    room: "Room 205 • 2nd Floor",
    loc: "Makati City",
  },
  {
    id: 3,
    name: "OkieDoc+ Quezon City Clinic",
    address: "789 Tomas Morato, Quezon City",
    room: "Room 102 • 1st Floor",
    loc: "Quezon City",
  },
  {
    id: 4,
    name: "OkieDoc+ BGC Clinic",
    address: "One Bonifacio High Street, Taguig City",
    room: "Suite 5A • 5th Floor",
    loc: "Taguig City",
  },
  {
    id: 5,
    name: "OkieDoc+ Skin Clinic",
    address: "Emerald Avenue, Ortigas",
    room: "Room 404 • 4th Floor",
    loc: "Ortigas",
  },
];

const symptomsList = [
  "Fever",
  "Cough",
  "Headache",
  "Sore Throat",
  "Body Pain",
  "Fatigue",
  "Nausea",
  "Dizziness",
  "Chest Pain",
  "Shortness of Breath",
  "Stomach Pain",
  "Loss of Appetite",
];

const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

const CURRENT_DATE = new Date("2026-04-08T00:00:00");

export default function BookPhysical({
  onGoBack,
  onGoToAppointments,
  onGoToDashboard,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [facility, setFacility] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientContact, setPatientContact] = useState("");

  const [complaint, setComplaint] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState("");

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.loc.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Dynamic filter: only show facilities matching the chosen doctor's location
  const availableFacilities = facilities.filter(
    (fac) => fac.loc === doctor?.loc,
  );

  const isDateInvalid = date
    ? new Date(date + "T00:00:00") < CURRENT_DATE
    : false;

  const canProceed = () => {
    if (currentStep === 0) return doctor !== null;
    if (currentStep === 1) return facility !== null;
    if (currentStep === 2) return date !== "" && !isDateInvalid && time !== "";
    if (currentStep === 3)
      return (
        patientName.trim().length > 0 &&
        patientAge.trim().length > 0 &&
        patientGender !== "" &&
        patientContact.trim().length > 0
      );
    if (currentStep === 4) return complaint.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (currentStep === 5) setIsModalOpen(true);
    else setCurrentStep((c) => c + 1);
  };

  const handleBack = () => {
    if (currentStep === 0) onGoBack();
    else setCurrentStep((c) => c - 1);
  };

  const toggleSymptom = (sym) =>
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym],
    );

  // --- STRICT PHONE NUMBER FORMATTER ---
  const handlePhoneChange = (value) => {
    let digits = value.replace(/\D/g, "");

    if (digits.length === 0) {
      setPatientContact("");
      return;
    }

    if (digits.startsWith("0")) {
      digits = "63" + digits.substring(1);
    } else if (!digits.startsWith("63")) {
      if (digits === "6") {
        digits = "6";
      } else {
        digits = "63" + digits;
      }
    }

    digits = digits.substring(0, 12);

    let formatted = "+";
    if (digits.length <= 2) {
      formatted += digits;
    } else if (digits.length <= 5) {
      formatted += digits.substring(0, 2) + " " + digits.substring(2);
    } else if (digits.length <= 8) {
      formatted +=
        digits.substring(0, 2) +
        " " +
        digits.substring(2, 5) +
        " " +
        digits.substring(5);
    } else {
      formatted +=
        digits.substring(0, 2) +
        " " +
        digits.substring(2, 5) +
        " " +
        digits.substring(5, 8) +
        " " +
        digits.substring(8);
    }

    setPatientContact(formatted);
  };

  return (
    <div className="bp-container">
      {/* HEADER & STEPPER */}
      <div className="bp-header-wrapper">
        <div className="bp-title-container">
          <button className="bp-back-btn" onClick={onGoBack}>
            <IconChevronLeft size={24} />
          </button>
          <div className="bp-title-text-group">
            <h2 className="bp-title">Book Physical Consultation</h2>
            <p className="bp-subtitle">
              Schedule an in-person visit with our healthcare professionals
            </p>
          </div>
        </div>

        <div className="bp-card">
          <div className="bp-stepper-container">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              return (
                <React.Fragment key={step.label}>
                  <div className="bp-step-item">
                    <div
                      className={`bp-step-circle ${isCompleted ? "bp-step-circle-completed" : isCurrent ? "bp-step-circle-active" : ""}`}
                    >
                      {isCompleted ? (
                        <IconCheck size={20} />
                      ) : (
                        <step.icon size={20} />
                      )}
                    </div>
                    <span
                      className={`bp-step-label ${isCompleted || isCurrent ? "bp-step-label-active" : ""}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`bp-step-line ${isCompleted ? "bp-step-line-completed" : isCurrent ? "bp-step-line-active" : ""}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="bp-scroll-wrapper">
        <div className="bp-card">
          {/* STEP 1: DOCTOR */}
          {currentStep === 0 && (
            <div className="bp-step-content">
              <div className="bp-section-heading text-cyan">
                <IconStethoscope size={20} /> <h3>Select Doctor</h3>
              </div>
              <div className="bp-search-box">
                <IconSearch size={16} className="bp-search-icon" />
                <input
                  type="text"
                  placeholder="Search by name, specialty, or location..."
                  className="bp-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="bp-specialist-list">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className={`bp-doc-card ${doctor?.id === doc.id ? "bp-doc-selected" : ""} ${!doc.available ? "bp-doc-disabled" : ""}`}
                    onClick={() => {
                      if (doc.available) {
                        setDoctor(doc);
                        setFacility(null); // Reset facility if doctor changes
                      }
                    }}
                  >
                    <div className="bp-doc-info-wrapper">
                      <div
                        className={`bp-doc-avatar ${doc.available ? "bp-avatar-active" : "bp-avatar-inactive"}`}
                      >
                        {doc.initials}
                      </div>
                      <div className="bp-doc-details">
                        <h4 className="bp-doc-name">{doc.name}</h4>
                        <p
                          className={`bp-doc-spec ${doc.available ? "bp-spec-active" : "bp-spec-inactive"}`}
                        >
                          {doc.spec}
                        </p>
                        <p className="bp-doc-meta">
                          <IconMapPin size={14} /> {doc.clinic}
                        </p>
                        <p className="bp-doc-meta-last">
                          <IconStethoscope size={14} /> {doc.exp}
                        </p>
                      </div>
                    </div>
                    <div className="bp-doc-status-wrapper">
                      {doc.available ? (
                        <span className="bp-status-pill bp-pill-available">
                          Available
                        </span>
                      ) : (
                        <span className="bp-status-pill bp-pill-unavailable">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredDoctors.length === 0 && (
                  <p className="bp-empty-state">
                    No doctors found matching your search.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: FACILITY */}
          {currentStep === 1 && (
            <div className="bp-step-content">
              <div className="bp-section-heading text-cyan">
                <IconMapPin size={20} /> <h3>Select Facility / Location</h3>
              </div>
              <p className="bp-instruction-text">
                Available locations for {doctor?.name} ({doctor?.loc})
              </p>

              <div className="bp-specialist-list">
                {availableFacilities.length > 0 ? (
                  availableFacilities.map((fac) => (
                    <div
                      key={fac.id}
                      className={`bp-doc-card ${facility?.id === fac.id ? "bp-doc-selected" : ""}`}
                      onClick={() => setFacility(fac)}
                    >
                      <div className="bp-doc-info-wrapper align-center">
                        <div className="bp-icon-box bp-icon-cyan">
                          <IconMapPin size={24} />
                        </div>
                        <div className="bp-doc-details">
                          <h4 className="bp-doc-name">{fac.name}</h4>
                          <p className="bp-doc-meta">
                            <IconMapPin size={14} /> {fac.address}
                          </p>
                          <p className="bp-doc-meta-last fw-500">{fac.room}</p>
                        </div>
                      </div>
                      <IconCheck
                        size={24}
                        className={
                          facility?.id === fac.id ? "text-cyan" : "text-muted"
                        }
                        style={{ opacity: facility?.id === fac.id ? 1 : 0.2 }}
                      />
                    </div>
                  ))
                ) : (
                  <p className="bp-empty-state">
                    No matching facilities found for this doctor's location.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULE */}
          {currentStep === 2 && (
            <div className="bp-step-content">
              <div className="bp-inner-card mb-24">
                <div className="bp-section-heading text-cyan mb-16">
                  <IconCalendarEvent size={20} /> <h3>Select Date</h3>
                </div>
                <input
                  type="date"
                  value={date}
                  min={CURRENT_DATE.toISOString().split("T")[0]}
                  max="2030-12-31"
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime("");
                  }}
                  className="bp-form-input"
                />
              </div>

              {date && !isDateInvalid && (
                <div className="bp-inner-card">
                  <div className="bp-section-heading text-cyan mb-8">
                    <IconClock size={20} /> <h3>Select Time Slot</h3>
                  </div>
                  <p className="bp-instruction-text-small">
                    Available slots for {date}
                  </p>

                  <div className="bp-time-grid-extended">
                    {timeSlots.map((t, i) => {
                      const isUnavailable = i === 12 || i === 14;
                      return (
                        <button
                          key={t}
                          disabled={isUnavailable}
                          className={`bp-time-btn-extended ${time === t ? "selected" : ""} ${isUnavailable ? "unavailable" : "available"}`}
                          onClick={() => setTime(t)}
                        >
                          <IconClock size={18} className="mb-8" />
                          {t}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bp-time-legend">
                    <span className="bp-legend-item">
                      <div className="bp-legend-dot selected"></div> Selected
                    </span>
                    <span className="bp-legend-item">
                      <div className="bp-legend-dot available"></div> Available
                    </span>
                    <span className="bp-legend-item">
                      <div className="bp-legend-dot unavailable"></div>{" "}
                      Unavailable
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: PATIENT INFO */}
          {currentStep === 3 && (
            <div className="bp-step-content">
              <div className="bp-inner-card">
                <div className="bp-section-heading text-cyan mb-8">
                  <IconUser size={20} /> <h3>Patient Details</h3>
                </div>
                <p className="bp-instruction-text">
                  Auto-filled from your profile
                </p>

                <div className="bp-form-group">
                  <label className="bp-form-label">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    maxLength={50}
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="bp-form-input"
                  />
                  <p className="bp-char-count">{patientName.length}/50</p>
                </div>

                <div className="bp-form-group">
                  <label className="bp-form-label">Age *</label>
                  <input
                    type="text"
                    placeholder="e.g. 35"
                    maxLength={3}
                    value={patientAge}
                    onChange={(e) =>
                      setPatientAge(e.target.value.replace(/\D/g, ""))
                    }
                    className="bp-form-input"
                  />
                  <p className="bp-char-count">{patientAge.length}/3</p>
                </div>

                <div className="bp-form-group">
                  <label className="bp-form-label">Gender *</label>
                  <div className="bp-gender-group">
                    <button
                      className={`bp-gender-btn ${patientGender === "Male" ? "selected" : ""}`}
                      onClick={() => setPatientGender("Male")}
                    >
                      Male
                    </button>
                    <button
                      className={`bp-gender-btn ${patientGender === "Female" ? "selected" : ""}`}
                      onClick={() => setPatientGender("Female")}
                    >
                      Female
                    </button>
                    <button
                      className={`bp-gender-btn ${patientGender === "Other" ? "selected" : ""}`}
                      onClick={() => setPatientGender("Other")}
                    >
                      Other
                    </button>
                  </div>
                </div>

                <div className="bp-form-group bp-margin-0">
                  <label className="bp-form-label">Contact Number *</label>
                  <div className="bp-input-with-icon">
                    <IconPhone size={16} className="bp-inner-icon" />
                    {/* UPDATED INPUT WITH HANDLEPHONECHANGE */}
                    <input
                      type="text"
                      placeholder="+63 XXX XXX XXXX"
                      value={patientContact}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="bp-form-number pl-36"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DETAILS */}
          {currentStep === 4 && (
            <div className="bp-step-content">
              <div className="bp-section-heading text-cyan">
                <IconStethoscope size={20} /> <h3>Consultation Details</h3>
              </div>
              <div className="bp-form-group">
                <label className="bp-form-label">Chief Complaint *</label>
                <input
                  type="text"
                  placeholder="What brings you in today?"
                  maxLength={50}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="bp-form-input"
                />
                <p className="bp-char-count">{complaint.length}/50</p>
              </div>
              <div className="bp-form-group">
                <label className="bp-form-label">
                  Symptoms (Select all that apply)
                </label>
                <div className="bp-symptom-badges">
                  {symptomsList.map((sym) => (
                    <span
                      key={sym}
                      className={`bp-symptom-badge ${symptoms.includes(sym) ? "bp-symptom-active" : ""}`}
                      onClick={() => toggleSymptom(sym)}
                    >
                      {symptoms.includes(sym) && (
                        <IconCheck size={12} className="bp-symptom-check" />
                      )}{" "}
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bp-form-group bp-form-group-last">
                <label className="bp-form-label">
                  Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="Any additional information you'd like the doctor to know..."
                  maxLength={1000}
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bp-form-textarea"
                />
                <p className="bp-char-count">{notes.length}/1000</p>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW */}
          {currentStep === 5 && (
            <div className="bp-step-content">
              <div className="bp-review-header-wrapper">
                <div className="bp-section-heading bp-margin-0 text-cyan">
                  <IconCheck size={20} /> <h3>Review Your Booking</h3>
                </div>
              </div>

              <p className="bp-review-label">Doctor & Facility</p>
              <div className="bp-review-doctor-row">
                <div className="bp-review-avatar bg-cyan">
                  {doctor.initials}
                </div>
                <div className="bp-review-doctor-info">
                  <h4 className="bp-review-doctor-name">{doctor.name}</h4>
                  <p className="bp-review-doctor-spec text-cyan">
                    {doctor.spec} • {facility.name}
                  </p>
                </div>
              </div>
              <hr className="bp-divider" />

              <div className="bp-review-grid">
                <div className="bp-review-grid-item">
                  <p className="bp-review-label">Date</p>
                  <p className="bp-review-value-icon">
                    <IconCalendarEvent
                      size={16}
                      className="bp-review-icon text-cyan"
                    />{" "}
                    {date}
                  </p>
                </div>
                <div className="bp-review-grid-item">
                  <p className="bp-review-label">Time</p>
                  <p className="bp-review-value-icon">
                    <IconClock size={16} className="bp-review-icon text-cyan" />{" "}
                    {time}
                  </p>
                </div>
              </div>
              <hr className="bp-divider" />

              <p className="bp-review-label">Patient Information</p>
              <h4 className="bp-review-value-bold">
                {patientName}, {patientAge} yrs ({patientGender})
              </h4>
              <p className="bp-review-value-sub">{patientContact}</p>
              <hr className="bp-divider" />

              <p className="bp-review-label">Chief Complaint</p>
              <h4 className="bp-review-value-bold bp-margin-bottom-large">
                {complaint}
              </h4>

              {symptoms.length > 0 && (
                <div className="bp-review-symptoms-wrapper">
                  <p className="bp-review-label">Symptoms</p>
                  <div className="bp-review-symptoms-list">
                    {symptoms.map((s) => (
                      <span
                        key={s}
                        className="bp-review-symptom-tag bg-light-cyan text-cyan"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bp-banner bp-banner-yellow">
                <IconAlertCircle
                  size={20}
                  className="bp-banner-icon-yellow bp-icon-top"
                />
                <div className="bp-banner-content">
                  <h4 className="bp-banner-title-yellow">
                    Important Reminders
                  </h4>
                  <ul className="bp-banner-list-yellow">
                    <li>Please arrive 15 minutes before your appointment</li>
                    <li>
                      Bring a valid ID and PhilHealth card (if applicable)
                    </li>
                    <li>Wear a face mask inside the clinic</li>
                    <li>
                      You will receive a confirmation SMS with appointment
                      details
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="bp-footer-wrapper">
        <div className="bp-footer-inner">
          <button
            className="bp-nav-btn bp-nav-btn-outline"
            onClick={handleBack}
            disabled={currentStep === 0 && !onGoBack}
          >
            <IconChevronLeft size={16} /> Back
          </button>
          <button
            className={`bp-nav-btn ${!canProceed() ? "bp-nav-btn-disabled" : "bp-nav-btn-primary"}`}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep < 5 ? (
              <>
                Next <IconArrowRight size={16} />
              </>
            ) : (
              "Confirm Appointment"
            )}
          </button>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="bp-modal-overlay">
          <div className="bp-modal-container">
            <div className="bp-modal-icon-wrapper bg-light-green text-green">
              <IconCheck size={40} />
            </div>
            <h3 className="bp-modal-title">Appointment Created</h3>
            <p className="bp-modal-desc">
              Your physical consultation has been successfully scheduled.
            </p>
            <div className="bp-modal-actions">
              <button
                className="bp-modal-btn bp-modal-btn-cyan"
                onClick={() => {
                  setIsModalOpen(false);
                  onGoToAppointments();
                }}
              >
                Go to Appointments
              </button>
              <button
                className="bp-modal-btn bp-modal-btn-ghost"
                onClick={() => {
                  setIsModalOpen(false);
                  onGoToDashboard();
                }}
              >
                Go Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
