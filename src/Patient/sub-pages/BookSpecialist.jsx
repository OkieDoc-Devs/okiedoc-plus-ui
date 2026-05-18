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
  IconArrowRight,
  IconUser,
  IconPhone,
} from "@tabler/icons-react";
import "../css/BookSpecialist.css";
import { useAuth } from "../../contexts/AuthContext";
import { apiRequest } from "../../api/apiClient";

const STEPS = [
  { label: "Specialist", icon: IconStethoscope },
  { label: "Payment", icon: IconCreditCard },
  { label: "Schedule", icon: IconCalendarEvent },
  { label: "Patient Info", icon: IconUser },
  { label: "Details", icon: IconFileDescription },
  { label: "Review", icon: IconCircleCheck },
];

const ALLOWED_SPECIALTIES = [
  "cardiology",
  "dermatology",
  "psychiatry",
  "endocrinology",
  "gastroenterology",
  "orthopedics",
];

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

const CURRENT_DATE = new Date();

export default function BookSpecialist({
  onGoBack,
  onGoToAppointments,
  onGoToDashboard,
}) {
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Database Data
  const [specialistsData, setSpecialistsData] = useState([]);
  const [uniqueSpecs, setUniqueSpecs] = useState([]);

  // Form States
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
  const [availableSlots, setAvailableSlots] = useState([]);

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientContact, setPatientContact] = useState("");

  const [complaint, setComplaint] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState("");

  // --- API FETCH & DATA MAPPING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiRequest("/api/v1/booking-data-specialist", {
          method: "GET",
        });
        if (res && res.doctors) {
          const mappedDocs = res.doctors.map((doc) => {
            const hmoAccepted = doc.hmos && doc.hmos.length > 0;
            const formatCurrency = new Intl.NumberFormat("en-PH", {
              style: "currency",
              currency: "PHP",
            }).format(doc.feeInitialWithoutCert);

            return {
              id: doc.id,
              name: doc.name,
              spec: doc.primarySpecialty,
              clinic: "OkieDoc+ Virtual Clinic",
              loc: "Online",
              exp: doc.yearsExperience,
              price: formatCurrency,
              rawPrice: doc.feeInitialWithoutCert,
              payments: hmoAccepted ? ["Cash", "HMO"] : ["Cash"],
              initials: doc.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase(),
              available: true,
              schedules: doc.schedules,
              hmosList: doc.hmos || [],
            };
          });

          setSpecialistsData(mappedDocs);
          setUniqueSpecs([...new Set(mappedDocs.map((s) => s.spec))]);
        }
      } catch (error) {
        console.error("Failed to fetch specialists:", error);
      }
    };
    fetchData();
  }, []);

  // --- PATIENT AUTO-POPULATION ---
  useEffect(() => {
    if (user) {
      setPatientName(`${user.firstName} ${user.lastName}`.trim());
      setPatientGender(user.gender || "");
      setPatientContact(user.mobileNumber || "");

      if (user.birthday) {
        const ageDifMs = Date.now() - new Date(user.birthday).getTime();
        const ageDate = new Date(ageDifMs);
        setPatientAge(Math.abs(ageDate.getUTCFullYear() - 1970).toString());
      }
    }
  }, [user]);

  // --- STRICT CONTACT NUMBER VALIDATION ---
  const handlePhoneChange = (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length === 0) {
      setPatientContact("");
      return;
    }
    if (digits.startsWith("0")) {
      digits = "63" + digits.substring(1);
    } else if (!digits.startsWith("63")) {
      digits = digits === "6" ? "6" : "63" + digits;
    }

    digits = digits.substring(0, 12);
    let formatted = "+";
    if (digits.length <= 2) formatted += digits;
    else if (digits.length <= 5)
      formatted += digits.substring(0, 2) + " " + digits.substring(2);
    else if (digits.length <= 8)
      formatted +=
        digits.substring(0, 2) +
        " " +
        digits.substring(2, 5) +
        " " +
        digits.substring(5);
    else
      formatted +=
        digits.substring(0, 2) +
        " " +
        digits.substring(2, 5) +
        " " +
        digits.substring(5, 8) +
        " " +
        digits.substring(8);
    setPatientContact(formatted);
  };

  const isDateInvalid = date
    ? new Date(date + "T00:00:00") <
      new Date(CURRENT_DATE.toISOString().split("T")[0] + "T00:00:00")
    : false;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- DYNAMIC TIME SLOTS ---
  useEffect(() => {
    if (date && specialist && specialist.schedules) {
      const dateObj = new Date(date + "T00:00:00");
      const dayOfWeek = dateObj.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const dayKey = Object.keys(specialist.schedules).find(
        (k) => k.toLowerCase() === dayOfWeek.toLowerCase(),
      );
      if (!dayKey) {
        setAvailableSlots([]);
        setTime("");
        return;
      }

      const [startStr, endStr] = specialist.schedules[dayKey].split("-");
      const parseTime = (t) => {
        const [h, m] = t.trim().split(":");
        return parseInt(h) * 60 + parseInt(m);
      };
      const formatTime = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
      };

      const slots = [];
      let current = parseTime(startStr);
      const end = parseTime(endStr);

      while (current < end) {
        slots.push(formatTime(current));
        current += 30;
      }
      setAvailableSlots(slots);
      setTime("");
    } else {
      setAvailableSlots([]);
    }
  }, [date, specialist]);

  const filteredSpecialists = useMemo(() => {
    let result = specialistsData.filter((doc) => {
      const searchLower = searchQuery.toLowerCase();
      const specLower = (doc.spec || "").toLowerCase();

      const matchesSearch =
        doc.name.toLowerCase().includes(searchLower) ||
        specLower.includes(searchLower) ||
        doc.loc.toLowerCase().includes(searchLower);

      const matchesSpec =
        specFilter.length === 0 || specFilter.includes(doc.spec);
      const isAllowedSpecialty = ALLOWED_SPECIALTIES.includes(specLower);

      return matchesSearch && matchesSpec && isAllowedSpecialty;
    });

    if (expSort === "longest") result.sort((a, b) => b.exp - a.exp);
    if (expSort === "recent") result.sort((a, b) => a.exp - b.exp);
    return result;
  }, [searchQuery, specFilter, expSort, specialistsData]);

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
    setHmoProvider("");
    setHmoId("");
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
    if (currentStep === 3) return patientContact.trim().length > 0;
    if (currentStep === 4) return complaint.trim().length > 0;
    return true;
  };

  // --- API INTEGRATION: Submit Ticket ---
  const handleConfirmAppointment = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest("/api/v1/tickets", {
        method: "POST",
        body: JSON.stringify({
          patientId: user?.id,
          patient: user?.id,
          specialist: specialist.id,
          status: "pending",
          consultationChannel: "Video",
          preferredDate: date,
          preferredTime: time,
          chiefComplaint: complaint,
          symptoms: symptoms.length > 0 ? symptoms.join(", ") : "None",
          additionalDetails: notes,
          isUsingHmo: paymentMethod === "hmo" ? true : false,
          hmoProvider: paymentMethod === "hmo" ? hmoProvider : "",
          hmoMemberId: paymentMethod === "hmo" ? hmoId : "",

          targetSpecialty: specialist.spec,
          doctorFee: specialist.rawPrice,
        }),
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to book appointment:", error);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (currentStep === 5) handleConfirmAppointment();
    else setCurrentStep((c) => c + 1);
  };

  const handleBack = () => {
    if (currentStep === 0) onGoBack();
    else setCurrentStep((c) => c - 1);
  };

  // --- DYNAMIC SCHEDULE PILLS ---
  const formatSchedulePills = (schedules) => {
    if (!schedules) return null;

    // Group days by their time string
    const groupedSchedules = {};
    Object.entries(schedules).forEach(([day, t]) => {
      if (!groupedSchedules[t]) groupedSchedules[t] = [];
      groupedSchedules[t].push(day.substring(0, 3));
    });

    return Object.entries(groupedSchedules).map(([t, days]) => {
      let daysDisplay = "";
      if (days.length === 1) {
        daysDisplay = days[0];
      } else if (
        days.length === 5 &&
        days.join(",") === "Mon,Tue,Wed,Thu,Fri"
      ) {
        daysDisplay = "Mon - Fri";
      } else if (days.length === 7) {
        daysDisplay = "Mon - Sun";
      } else {
        daysDisplay = days.join(", ");
      }

      return (
        <span key={t + daysDisplay} className="bs-badge bs-badge-outline">
          {daysDisplay} {t}
        </span>
      );
    });
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
                      className={`bs-step-circle ${isCompleted ? "bs-step-circle-completed" : isCurrent ? "bs-step-circle-active" : ""}`}
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
                      className={`bs-step-line ${isCompleted ? "bs-step-line-completed" : isCurrent ? "bs-step-line-active" : ""}`}
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
              <div className="bs-section-heading text-violet">
                <IconStethoscope size={20} /> <h3>Select Specialist</h3>
              </div>

              <div className="bs-controls-bar mb-24">
                <div className="bs-search-box">
                  <IconSearch size={16} className="bs-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name, specialty, or location..."
                    className="bs-form-input pl-36"
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
                        {uniqueSpecs.map((spec) => (
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

                        {doc.exp > 0 && (
                          <p className="bs-doc-meta-last">
                            <IconStethoscope size={14} /> {doc.exp} Years
                            Experience
                          </p>
                        )}

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

                          {/* Dynamic Schedule Pills strictly using existing CSS classes */}
                          {formatSchedulePills(doc.schedules)}
                        </div>
                      </div>
                    </div>
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
              <div className="bs-section-heading text-violet mb-24">
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
                      {specialist.hmosList.map((hmo) => (
                        <option key={hmo} value={hmo}>
                          {hmo}
                        </option>
                      ))}
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
                        accept="image/png, image/jpeg"
                        onChange={handleHmoUpload}
                        style={{ display: "none" }}
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
            </div>
          )}

          {/* STEP 3: SCHEDULE */}
          {currentStep === 2 && (
            <div className="bs-step-content">
              <div className="bs-inner-card mb-24">
                <div className="bs-section-heading text-violet mb-16">
                  <IconCalendarEvent size={20} /> <h3>Select Date</h3>
                </div>
                <input
                  type="date"
                  value={date}
                  min={CURRENT_DATE.toISOString().split("T")[0]}
                  max="2030-12-31"
                  onChange={(e) => {
                    setDate(e.target.value);
                  }}
                  className="bs-form-input"
                />
              </div>

              {date && !isDateInvalid && (
                <div className="bs-inner-card">
                  <div className="bs-section-heading text-violet mb-8">
                    <IconClock size={20} /> <h3>Select Time Slot</h3>
                  </div>
                  <p className="bs-instruction-text-small">
                    Available slots for {date}
                  </p>

                  <div className="bs-time-grid-extended">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((t) => (
                        <button
                          key={t}
                          className={`bs-time-btn-extended ${time === t ? "selected" : "available"}`}
                          onClick={() => setTime(t)}
                        >
                          <IconClock size={18} className="mb-8" />
                          {t}
                        </button>
                      ))
                    ) : (
                      <p className="bs-empty-state">
                        The specialist is not scheduled on this day. Please
                        select another date.
                      </p>
                    )}
                  </div>

                  {availableSlots.length > 0 && (
                    <div className="bs-time-legend">
                      <span className="bs-legend-item">
                        <div className="bs-legend-dot selected"></div> Selected
                      </span>
                      <span className="bs-legend-item">
                        <div className="bs-legend-dot available"></div>{" "}
                        Available
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: PATIENT INFO */}
          {currentStep === 3 && (
            <div className="bs-step-content">
              <div className="bs-inner-card">
                <div className="bs-section-heading text-violet mb-8">
                  <IconUser size={20} /> <h3>Patient Details</h3>
                </div>
                <p className="bs-instruction-text">
                  Your basic info is auto-filled. Please verify your contact
                  number.
                </p>

                <div className="bs-form-group">
                  <label className="bs-form-label">Full Name</label>
                  <input
                    type="text"
                    value={patientName}
                    className="bs-form-input"
                    disabled
                  />
                </div>

                <div className="bs-form-group">
                  <label className="bs-form-label">Age</label>
                  <input
                    type="text"
                    value={patientAge}
                    className="bs-form-input"
                    disabled
                  />
                </div>

                <div className="bs-form-group">
                  <label className="bs-form-label">Gender</label>
                  <input
                    type="text"
                    value={patientGender}
                    className="bs-form-input"
                    disabled
                  />
                </div>

                <div className="bs-form-group bs-margin-0">
                  <label className="bs-form-label">Contact Number *</label>
                  <div className="bs-search-box">
                    <IconPhone size={16} className="bs-search-icon" />
                    <input
                      type="text"
                      placeholder="+63 XXX XXX XXXX"
                      value={patientContact}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="bs-form-input pl-36"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DETAILS */}
          {currentStep === 4 && (
            <div className="bs-step-content">
              <div className="bs-inner-card">
                <div className="bs-section-heading text-violet mb-24">
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

                <div className="bs-form-group bs-margin-0">
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
            </div>
          )}

          {/* STEP 6: REVIEW */}
          {currentStep === 5 && (
            <div className="bs-step-content">
              <div className="bs-review-header-wrapper">
                <div className="bs-section-heading bs-margin-0 text-violet">
                  <IconCheck size={20} /> <h3>Review Your Booking</h3>
                </div>
                {paymentMethod === "hmo" && (
                  <span className="bs-badge-status bs-badge-yellow">
                    <IconAlertCircle size={12} /> HMO Pending Approval
                  </span>
                )}
              </div>

              <p className="bs-review-label">Specialist</p>
              <div className="bs-review-doctor-row">
                <div className="bs-review-avatar bg-violet">
                  {specialist.initials}
                </div>
                <div className="bs-review-doctor-info">
                  <h4 className="bs-review-doctor-name">{specialist.name}</h4>
                  <p className="bs-review-doctor-spec text-violet">
                    {specialist.spec}
                  </p>
                </div>
              </div>
              <hr className="bs-divider" />

              <div className="bs-review-grid">
                <div className="bs-review-grid-item">
                  <p className="bs-review-label">Date</p>
                  <p className="bs-review-value-icon">
                    <IconCalendarEvent
                      size={16}
                      className="bs-review-icon text-violet"
                    />{" "}
                    {date}
                  </p>
                </div>
                <div className="bs-review-grid-item">
                  <p className="bs-review-label">Time</p>
                  <p className="bs-review-value-icon">
                    <IconClock
                      size={16}
                      className="bs-review-icon text-violet"
                    />{" "}
                    {time}
                  </p>
                </div>
              </div>
              <hr className="bs-divider" />

              <p className="bs-review-label">Patient Information</p>
              <h4 className="bs-review-value-bold">
                {patientName}, {patientAge} yrs ({patientGender})
              </h4>
              <p className="bs-review-value-sub">{patientContact}</p>
              <hr className="bs-divider" />

              <p className="bs-review-label">Payment Method</p>
              <h4 className="bs-review-value-bold">
                {paymentMethod === "cash" ? "Cash" : "HMO Coverage"}
              </h4>
              <p className="bs-review-value-sub">
                {paymentMethod === "hmo" ? `Provider: ${hmoProvider}` : ""}
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
                      <span
                        key={s}
                        className="bs-review-symptom-tag bg-light-violet text-violet"
                      >
                        {s}
                      </span>
                    ))}
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
            disabled={(currentStep === 0 && !onGoBack) || isSubmitting}
          >
            <IconChevronLeft size={16} /> Back
          </button>
          <button
            className={`bs-nav-btn ${!canProceed() || isSubmitting ? "bs-nav-btn-disabled" : "bs-nav-btn-primary"}`}
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
          >
            {currentStep < 5 ? (
              <>
                Next <IconArrowRight size={16} />
              </>
            ) : isSubmitting ? (
              "Confirming..."
            ) : paymentMethod === "hmo" ? (
              "Submit for Approval"
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="bs-modal-overlay">
          <div className="bs-modal-container">
            <div className="bs-modal-icon-wrapper bg-light-green text-green">
              <IconCheck size={40} />
            </div>
            <h3 className="bs-modal-title">Appointment Submitted</h3>
            <p className="bs-modal-desc">
              Your booking request has been received successfully.
            </p>
            <div className="bs-modal-actions">
              <button
                className="bs-modal-btn bs-modal-btn-primary"
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
