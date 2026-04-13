import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  IconCheck,
  IconChevronLeft,
  IconUpload,
  IconAlertCircle,
  IconCalendarEvent,
  IconClock,
  IconStethoscope,
  IconShield,
  IconCurrencyDollar,
  IconMapPin,
  IconCreditCard,
  IconFileDescription,
  IconCircleCheck,
  IconSearch,
  IconFilter,
  IconSortAscending,
} from "@tabler/icons-react";
import "../css/BookSpecialist.css";

const STEPS = [
  { label: "Specialist", icon: IconStethoscope },
  { label: "Payment", icon: IconCreditCard },
  { label: "Schedule", icon: IconCalendarEvent },
  { label: "Details", icon: IconFileDescription },
  { label: "Review", icon: IconCircleCheck },
];

const specialists = [
  {
    id: 1,
    name: "Dr. Sofia Lim",
    spec: "Cardiologist",
    clinic: "OkieDoc+ Heart Center",
    loc: "BGC, Taguig City",
    exp: 20,
    price: "₱1,500",
    payments: ["Cash", "HMO", "PhilHealth"],
    initials: "SL",
    available: true,
  },
  {
    id: 2,
    name: "Dr. Carlos Torres",
    spec: "Dermatologist",
    clinic: "OkieDoc+ Skin Clinic",
    loc: "Ortigas, Pasig City",
    exp: 5,
    price: "₱1,200",
    payments: ["Cash"],
    initials: "CT",
    available: true,
  },
  {
    id: 3,
    name: "Dr. Anna Cruz",
    spec: "Psychiatrist",
    clinic: "OkieDoc+ Mental Health Center",
    loc: "Manila",
    exp: 18,
    price: null,
    payments: ["HMO"],
    initials: "AC",
    available: true,
  },
  {
    id: 4,
    name: "Dr. Miguel Garcia",
    spec: "Orthopedic Surgeon",
    clinic: "OkieDoc+ Orthopedic Center",
    loc: "Makati City",
    exp: 22,
    price: null,
    payments: ["PhilHealth"],
    initials: "MG",
    available: true,
  },
  {
    id: 5,
    name: "Dr. Ramon Santos",
    spec: "Gastroenterologist",
    clinic: "OkieDoc+ Digestive Health",
    loc: "Makati City",
    exp: 12,
    price: "₱1,900",
    payments: ["Cash", "HMO"],
    initials: "RS",
    available: true,
  },
];

const UNIQUE_SPECS = [...new Set(specialists.map((s) => s.spec))];
const symptomsList = [
  "Pain",
  "Swelling",
  "Fatigue",
  "Numbness",
  "Weakness",
  "Dizziness",
  "Nausea",
  "Loss of Appetite",
  "Sleep Issues",
  "Anxiety",
];
const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];
const CURRENT_DATE = new Date("2026-04-08T00:00:00");

export function BookSpecialist({
  onGoBack,
  onGoToAppointments,
  onGoToDashboard,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [specFilter, setSpecFilter] = useState([]);
  const [expSort, setExpSort] = useState("none");
  const popoverRef = useRef(null);

  const [specialist, setSpecialist] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [hmoProvider, setHmoProvider] = useState("");
  const [hmoId, setHmoId] = useState("");
  const [philHealthId, setPhilHealthId] = useState("");
  const [hasReferral, setHasReferral] = useState(null);

  const fileInputRef = useRef(null);
  const [hmoFile, setHmoFile] = useState(null);
  const [hmoError, setHmoError] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [complaint, setComplaint] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState("");

  const selectedDateObj = date ? new Date(date + "T00:00:00") : null;
  const isDateInvalid = selectedDateObj && selectedDateObj < CURRENT_DATE;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSpecialists = useMemo(() => {
    let result = specialists.filter((doc) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        doc.name.toLowerCase().includes(searchLower) ||
        doc.spec.toLowerCase().includes(searchLower) ||
        doc.loc.toLowerCase().includes(searchLower);
      const matchesSpec =
        specFilter.length === 0 || specFilter.includes(doc.spec);
      return matchesSearch && matchesSpec;
    });
    if (expSort === "longest") result.sort((a, b) => b.exp - a.exp);
    if (expSort === "recent") result.sort((a, b) => a.exp - b.exp);
    return result;
  }, [searchQuery, specFilter, expSort]);

  const toggleSpecFilter = (spec) =>
    setSpecFilter((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    );
  const toggleSymptom = (sym) =>
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym],
    );

  const handleSelectSpecialist = (doc) => {
    setSpecialist(doc);
    setPaymentMethod(null);
  };

  const handleHmoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setHmoError("File exceeds 5MB limit. Please try a smaller image.");
      setHmoFile(null);
    } else {
      setHmoError("");
      setHmoFile(file);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return specialist !== null;
    if (currentStep === 1) {
      if (!paymentMethod) return false;
      if (paymentMethod === "hmo")
        return hmoProvider.trim().length > 0 && hmoId.trim().length > 0;
      if (paymentMethod === "philhealth")
        return philHealthId.trim().length > 0 && hasReferral === "yes";
      return true;
    }
    if (currentStep === 2) return date !== "" && !isDateInvalid && time !== "";
    if (currentStep === 3) return complaint.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (currentStep === 4) setIsModalOpen(true);
    else setCurrentStep((c) => c + 1);
  };

  const handleBack = () => {
    if (currentStep === 0) onGoBack();
    else setCurrentStep((c) => c - 1);
  };

  return (
    <div className="bs-container">
      {/* HEADER & STEPPER */}
      <div className="bs-header-wrapper">
        <div className="bs-title-container">
          <button className="bs-back-btn" onClick={onGoBack}>
            <IconChevronLeft size={24} />
          </button>
          <div className="bs-title-text-group">
            <h2 className="bs-title">Book Specialist Consultation</h2>
            <p className="bs-subtitle">
              Connect with specialized medical experts for your specific needs
            </p>
          </div>
        </div>

        <div className="bs-card">
          <div className="bs-stepper-container">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              return (
                <React.Fragment key={step.label}>
                  <div className="bs-step-item">
                    <div
                      className={`bs-step-circle ${isCompleted || isCurrent ? "bs-step-circle-active" : ""}`}
                    >
                      {isCompleted ? (
                        <IconCheck size={20} />
                      ) : (
                        <step.icon size={20} />
                      )}
                    </div>
                    <span
                      className={`bs-step-label ${isCompleted || isCurrent ? "bs-step-label-active" : ""}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`bs-step-line ${index < currentStep ? "bs-step-line-active" : ""}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="bs-scroll-wrapper">
        <div className="bs-card">
          {/* STEP 1: SPECIALIST */}
          {currentStep === 0 && (
            <div className="bs-step-content">
              <div className="bs-section-heading">
                <IconStethoscope size={20} /> <h3>Select Specialist</h3>
              </div>

              <div className="bs-controls-bar">
                <div className="bs-search-box">
                  <IconSearch size={16} className="bs-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name, specialty, or location..."
                    className="bs-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="bs-filter-wrapper" ref={popoverRef}>
                  <button
                    className="bs-filter-btn"
                    onClick={() => setFilterOpen(!filterOpen)}
                  >
                    <IconFilter size={16} /> Filters
                  </button>

                  {filterOpen && (
                    <div className="bs-popover-menu">
                      <div className="bs-popover-title">
                        <IconSortAscending size={16} /> Sort Experience
                      </div>
                      <div className="bs-popover-options">
                        <label className="bs-popover-label">
                          <input
                            type="radio"
                            className="bs-popover-input"
                            name="exp"
                            checked={expSort === "none"}
                            onChange={() => setExpSort("none")}
                          />{" "}
                          None
                        </label>
                        <label className="bs-popover-label">
                          <input
                            type="radio"
                            className="bs-popover-input"
                            name="exp"
                            checked={expSort === "longest"}
                            onChange={() => setExpSort("longest")}
                          />{" "}
                          Longest Experience
                        </label>
                        <label className="bs-popover-label">
                          <input
                            type="radio"
                            className="bs-popover-input"
                            name="exp"
                            checked={expSort === "recent"}
                            onChange={() => setExpSort("recent")}
                          />{" "}
                          Most Recent
                        </label>
                      </div>

                      <hr className="bs-popover-divider" />

                      <div className="bs-popover-title">Specialization</div>
                      <div className="bs-popover-options">
                        {UNIQUE_SPECS.map((spec) => (
                          <label key={spec} className="bs-popover-label">
                            <input
                              type="checkbox"
                              className="bs-popover-input"
                              checked={specFilter.includes(spec)}
                              onChange={() => toggleSpecFilter(spec)}
                            />{" "}
                            {spec}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bs-specialist-list">
                {filteredSpecialists.map((doc) => (
                  <div
                    key={doc.id}
                    className={`bs-doc-card ${specialist?.id === doc.id ? "bs-doc-selected" : ""} ${!doc.available ? "bs-doc-disabled" : ""}`}
                    onClick={() => doc.available && handleSelectSpecialist(doc)}
                  >
                    <div className="bs-doc-info-wrapper">
                      <div
                        className={`bs-doc-avatar ${doc.available ? "bs-avatar-active" : "bs-avatar-inactive"}`}
                      >
                        {doc.initials}
                      </div>
                      <div className="bs-doc-details">
                        <h4 className="bs-doc-name">{doc.name}</h4>
                        <p
                          className={`bs-doc-spec ${doc.available ? "bs-spec-active" : "bs-spec-inactive"}`}
                        >
                          {doc.spec}
                        </p>
                        <p className="bs-doc-meta">
                          <IconMapPin size={14} /> {doc.clinic}
                        </p>
                        <p className="bs-doc-meta">
                          <IconMapPin size={14} /> {doc.loc}
                        </p>
                        <p className="bs-doc-meta-last">
                          <IconStethoscope size={14} /> {doc.exp} Years
                          Experience
                        </p>

                        <div className="bs-doc-badges">
                          {doc.price ? (
                            <span className="bs-badge bs-badge-outline">
                              From {doc.price}
                            </span>
                          ) : (
                            <span className="bs-badge bs-badge-outline">
                              Insurance Only
                            </span>
                          )}
                          {doc.payments.map((b) => (
                            <span
                              key={b}
                              className={`bs-badge ${b === "HMO" ? "bs-badge-yellow" : b === "PhilHealth" ? "bs-badge-green" : "bs-badge-gray"}`}
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* NEW: Re-added the top-right status badges! */}
                    <div className="bs-doc-status-wrapper">
                      {doc.available ? (
                        <span className="bs-status-pill bs-pill-available">
                          Available
                        </span>
                      ) : (
                        <span className="bs-status-pill bs-pill-unavailable">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredSpecialists.length === 0 && (
                  <p className="bs-empty-state">No specialists found.</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT */}
          {currentStep === 1 && (
            <div className="bs-step-content">
              <div className="bs-section-heading">
                <IconShield size={20} /> <h3>Select Payment Method</h3>
              </div>
              <p className="bs-instruction-text">
                Showing accepted payment methods for {specialist.name}
              </p>

              <div className="bs-payment-list">
                {specialist.payments.includes("Cash") && (
                  <div
                    className={`bs-payment-card ${paymentMethod === "cash" ? "bs-payment-selected" : ""}`}
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <div className="bs-payment-info">
                      <div className="bs-payment-icon bs-icon-cyan">
                        <IconCurrencyDollar size={24} />
                      </div>
                      <div className="bs-payment-details">
                        <h4 className="bs-payment-title">
                          Cash / Pay per Consultation
                        </h4>
                        <p className="bs-payment-desc">
                          Pay directly for your consultation
                        </p>
                        <p className="bs-payment-price">{specialist.price}</p>
                      </div>
                    </div>
                    {paymentMethod === "cash" && (
                      <IconCheck size={20} className="bs-check-icon" />
                    )}
                  </div>
                )}

                {specialist.payments.includes("HMO") && (
                  <div
                    className={`bs-payment-card ${paymentMethod === "hmo" ? "bs-payment-selected" : ""}`}
                    onClick={() => setPaymentMethod("hmo")}
                  >
                    <div className="bs-payment-info">
                      <div className="bs-payment-icon bs-icon-yellow">
                        <IconShield size={24} />
                      </div>
                      <div className="bs-payment-details">
                        <h4 className="bs-payment-title">HMO Coverage</h4>
                        <p className="bs-payment-desc">
                          Use your HMO insurance for this consultation
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "hmo" && (
                      <IconCheck size={20} className="bs-check-icon-yellow" />
                    )}
                  </div>
                )}

                {specialist.payments.includes("PhilHealth") && (
                  <div
                    className={`bs-payment-card ${paymentMethod === "philhealth" ? "bs-payment-selected" : ""}`}
                    onClick={() => setPaymentMethod("philhealth")}
                  >
                    <div className="bs-payment-info">
                      <div className="bs-payment-icon bs-icon-green">
                        <IconShield size={24} />
                      </div>
                      <div className="bs-payment-details">
                        <h4 className="bs-payment-title">
                          PhilHealth (with referral)
                        </h4>
                        <p className="bs-payment-desc">
                          Use PhilHealth benefits for this consultation
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "philhealth" && (
                      <IconCheck size={20} className="bs-check-icon-green" />
                    )}
                  </div>
                )}
              </div>

              {paymentMethod === "hmo" && (
                <div className="bs-subform bs-subform-yellow">
                  <div className="bs-subform-heading bs-heading-yellow">
                    <IconShield size={18} /> <h4>HMO Information</h4>
                  </div>

                  <div className="bs-form-group">
                    <label className="bs-form-label">HMO Provider *</label>
                    <select
                      value={hmoProvider}
                      onChange={(e) => setHmoProvider(e.target.value)}
                      className="bs-form-input"
                    >
                      <option value="" disabled>
                        Select your HMO provider
                      </option>
                      <option value="Medicard">Medicard</option>
                      <option value="Maxicare">Maxicare</option>
                      <option value="Intellicare">Intellicare</option>
                      <option value="Cocolife">Cocolife</option>
                      <option value="Avega">Avega</option>
                      <option value="Pacific Cross">Pacific Cross</option>
                      <option value="Asian Life">AsianLife</option>
                      <option value="Insular Health Care">
                        Insular Health Care
                      </option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div className="bs-form-group">
                    <label className="bs-form-label">Membership ID *</label>
                    <input
                      type="text"
                      placeholder="Enter your HMO membership ID"
                      value={hmoId}
                      onChange={(e) => setHmoId(e.target.value)}
                      className="bs-form-input"
                    />
                  </div>

                  <div className="bs-form-group">
                    <label className="bs-form-label">
                      Upload HMO Card (Optional)
                    </label>
                    <div
                      className="bs-dropzone bs-dropzone-yellow"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/png, image/jpeg"
                        onChange={handleHmoUpload}
                      />
                      <div className="bs-dropzone-icon bs-icon-yellow">
                        <IconUpload size={20} />
                      </div>
                      <p className="bs-dropzone-title">
                        Click to upload HMO card
                      </p>
                      <p className="bs-dropzone-desc">PNG, JPG up to 5MB</p>
                    </div>
                    {hmoError && <p className="bs-error-msg">{hmoError}</p>}
                    {hmoFile && !hmoError && (
                      <p className="bs-success-msg">
                        Successfully attached: {hmoFile.name}
                      </p>
                    )}
                  </div>

                  <div className="bs-banner bs-banner-yellow">
                    <IconAlertCircle
                      size={20}
                      className="bs-banner-icon-yellow"
                    />
                    <div className="bs-banner-content">
                      <h4 className="bs-banner-title-yellow">
                        HMO Approval Required
                      </h4>
                      <p className="bs-banner-desc-yellow">
                        HMO consultations require approval before confirmation.
                        You will be notified once your HMO provider approves the
                        consultation. Typically takes 1-2 business days.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "philhealth" && (
                <div className="bs-subform bs-subform-green">
                  <div className="bs-subform-heading bs-heading-green">
                    <IconShield size={18} /> <h4>PhilHealth Information</h4>
                  </div>

                  <div className="bs-form-group">
                    <label className="bs-form-label">PhilHealth Number *</label>
                    <input
                      type="text"
                      placeholder="Enter your PhilHealth number"
                      value={philHealthId}
                      onChange={(e) => setPhilHealthId(e.target.value)}
                      className="bs-form-input"
                    />
                  </div>

                  <div className="bs-form-group">
                    <label className="bs-form-label">
                      Do you have a valid referral?
                    </label>
                    <div className="bs-button-group">
                      <button
                        className={`bs-toggle-btn ${hasReferral === "yes" ? "bs-toggle-btn-green" : ""}`}
                        onClick={() => setHasReferral("yes")}
                      >
                        Yes, I have a referral
                      </button>
                      <button
                        className={`bs-toggle-btn ${hasReferral === "no" ? "bs-toggle-btn-dark" : ""}`}
                        onClick={() => setHasReferral("no")}
                      >
                        No referral
                      </button>
                    </div>
                  </div>

                  {hasReferral === "yes" && (
                    <div className="bs-banner bs-banner-green">
                      <IconCheck size={20} className="bs-banner-icon-green" />
                      <div className="bs-banner-content">
                        <h4 className="bs-banner-title-green">
                          PhilHealth Coverage Confirmed
                        </h4>
                        <p className="bs-banner-desc-green">
                          Your consultation will be covered under PhilHealth
                          with a valid referral. Please bring your PhilHealth ID
                          and referral letter to your appointment.
                        </p>
                      </div>
                    </div>
                  )}
                  {hasReferral === "no" && (
                    <div className="bs-banner bs-banner-red">
                      <IconAlertCircle
                        size={20}
                        className="bs-banner-icon-red"
                      />
                      <div className="bs-banner-content">
                        <h4 className="bs-banner-title-red">
                          Referral Required
                        </h4>
                        <p className="bs-banner-desc-red">
                          A valid PhilHealth referral is required to proceed
                          with specialist consultation coverage. Please obtain a
                          referral from your primary care physician first.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: SCHEDULE */}
          {currentStep === 2 && (
            <div className="bs-step-content">
              <div className="bs-section-heading">
                <IconCalendarEvent size={20} /> <h3>Select Date</h3>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTime("");
                }}
                className="bs-form-input bs-date-input"
              />
              {isDateInvalid && (
                <p className="bs-error-msg-large">
                  Please select a valid future date.
                </p>
              )}

              {date && !isDateInvalid && (
                <div className="bs-time-section">
                  <div className="bs-section-heading-small">
                    <IconClock size={20} /> <h3>Select Time Slot</h3>
                  </div>
                  <p className="bs-instruction-text-small">
                    Available slots for {date}
                  </p>
                  <div className="bs-time-grid">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        className={`bs-time-btn ${time === t ? "bs-time-btn-selected" : ""}`}
                        onClick={() => setTime(t)}
                      >
                        <IconClock size={16} /> {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: DETAILS */}
          {currentStep === 3 && (
            <div className="bs-step-content">
              <div className="bs-section-heading">
                <IconStethoscope size={20} /> <h3>Consultation Details</h3>
              </div>

              <div className="bs-form-group">
                <label className="bs-form-label">Chief Complaint *</label>
                <input
                  type="text"
                  placeholder="Briefly describe your main concern"
                  maxLength={50}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="bs-form-input"
                />
                <p className="bs-char-count">{complaint.length}/50</p>
              </div>

              <div className="bs-form-group">
                <label className="bs-form-label">Related Symptoms</label>
                <div className="bs-symptom-badges">
                  {symptomsList.map((sym) => (
                    <span
                      key={sym}
                      className={`bs-symptom-badge ${symptoms.includes(sym) ? "bs-symptom-active" : ""}`}
                      onClick={() => toggleSymptom(sym)}
                    >
                      {symptoms.includes(sym) && (
                        <IconCheck size={12} className="bs-symptom-check" />
                      )}{" "}
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bs-form-group bs-form-group-last">
                <label className="bs-form-label">
                  Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="Any additional information for the specialist..."
                  maxLength={1000}
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bs-form-textarea"
                />
                <p className="bs-char-count">{notes.length}/1000</p>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {currentStep === 4 && (
            <div className="bs-step-content">
              <div className="bs-review-header-wrapper">
                <div className="bs-section-heading bs-margin-0">
                  <IconCheck size={20} /> <h3>Review Your Booking</h3>
                </div>
                {paymentMethod === "philhealth" && (
                  <span className="bs-badge-status bs-badge-green">
                    <IconShield size={12} /> PhilHealth Covered
                  </span>
                )}
                {paymentMethod === "hmo" && (
                  <span className="bs-badge-status bs-badge-yellow">
                    <IconAlertCircle size={12} /> HMO Pending Approval
                  </span>
                )}
              </div>

              <p className="bs-review-label">Specialist</p>
              <div className="bs-review-doctor-row">
                <div className="bs-review-avatar">{specialist.initials}</div>
                <div className="bs-review-doctor-info">
                  <h4 className="bs-review-doctor-name">{specialist.name}</h4>
                  <p className="bs-review-doctor-spec">{specialist.spec}</p>
                </div>
              </div>
              <hr className="bs-divider" />

              <div className="bs-review-grid">
                <div className="bs-review-grid-item">
                  <p className="bs-review-label">Date</p>
                  <p className="bs-review-value-icon">
                    <IconCalendarEvent size={16} className="bs-review-icon" />{" "}
                    {date}
                  </p>
                </div>
                <div className="bs-review-grid-item">
                  <p className="bs-review-label">Time</p>
                  <p className="bs-review-value-icon">
                    <IconClock size={16} className="bs-review-icon" /> {time}
                  </p>
                </div>
              </div>
              <hr className="bs-divider" />

              <p className="bs-review-label">Payment Method</p>
              <h4 className="bs-review-value-bold">
                {paymentMethod === "cash"
                  ? "Cash"
                  : paymentMethod === "hmo"
                    ? "HMO Coverage"
                    : "PhilHealth Covered"}
              </h4>
              <p className="bs-review-value-sub">
                {paymentMethod === "hmo"
                  ? `Provider: ${hmoProvider}`
                  : paymentMethod === "philhealth"
                    ? "With valid referral"
                    : ""}
              </p>
              <hr className="bs-divider" />

              <p className="bs-review-label">Chief Complaint</p>
              <h4 className="bs-review-value-bold bs-margin-bottom-large">
                {complaint}
              </h4>

              {symptoms.length > 0 && (
                <div className="bs-review-symptoms-wrapper">
                  <p className="bs-review-label">Symptoms</p>
                  <div className="bs-review-symptoms-list">
                    {symptoms.map((s) => (
                      <span key={s} className="bs-review-symptom-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === "philhealth" && (
                <div className="bs-banner bs-banner-green">
                  <IconShield
                    size={20}
                    className="bs-banner-icon-green bs-icon-top"
                  />
                  <div className="bs-banner-content">
                    <h4 className="bs-banner-title-green">
                      PhilHealth Coverage
                    </h4>
                    <ul className="bs-banner-list-green">
                      <li>
                        Please bring your PhilHealth ID to your appointment
                      </li>
                      <li>Bring your valid referral letter</li>
                      <li>Arrive 15 minutes early for verification</li>
                    </ul>
                  </div>
                </div>
              )}
              {paymentMethod === "hmo" && (
                <div className="bs-banner bs-banner-yellow">
                  <IconAlertCircle
                    size={20}
                    className="bs-banner-icon-yellow bs-icon-top"
                  />
                  <div className="bs-banner-content">
                    <h4 className="bs-banner-title-yellow">
                      Pending HMO Approval
                    </h4>
                    <p className="bs-banner-desc-yellow">
                      Your booking will be submitted for HMO approval. You will
                      receive a notification once your HMO provider confirms
                      coverage. This typically takes 1-2 business days.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="bs-footer-wrapper">
        <div className="bs-footer-inner">
          <button
            className="bs-nav-btn bs-nav-btn-outline"
            onClick={handleBack}
            disabled={currentStep === 0 && !onGoBack}
          >
            <IconChevronLeft size={16} /> Back
          </button>
          <button
            className={`bs-nav-btn ${!canProceed() ? "bs-nav-btn-disabled" : "bs-nav-btn-primary"}`}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep < 4
              ? "Next"
              : paymentMethod === "philhealth"
                ? "Confirm (Covered)"
                : paymentMethod === "hmo"
                  ? "Submit for Approval"
                  : "Confirm Booking"}
          </button>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="bs-modal-overlay">
          <div className="bs-modal-container">
            <div className="bs-modal-icon-wrapper">
              <IconCheck size={40} />
            </div>
            <h3 className="bs-modal-title">Appointment Submitted</h3>
            <p className="bs-modal-desc">
              Your booking request has been received successfully.
            </p>
            <div className="bs-modal-actions">
              <button
                className="bs-modal-btn bs-modal-btn-cyan"
                onClick={() => {
                  setIsModalOpen(false);
                  onGoToAppointments();
                }}
              >
                Go to Appointments
              </button>
              <button
                className="bs-modal-btn bs-modal-btn-ghost"
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
