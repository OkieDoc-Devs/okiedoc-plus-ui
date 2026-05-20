import React, { useState, useEffect } from "react";
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
import { useAuth } from "../../contexts/AuthContext";
import { apiRequest } from "../../api/apiClient";

const STEPS = [
  { label: "Doctor", icon: IconStethoscope },
  { label: "Facility", icon: IconBuildingHospital },
  { label: "Date & Time", icon: IconCalendarEvent },
  { label: "Patient Info", icon: IconUser },
  { label: "Details", icon: IconFileDescription },
  { label: "Review", icon: IconCircleCheck },
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

// Helper to get today's date safely in YYYY-MM-DD
const getTodayString = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function BookPhysical({
  onGoBack,
  onGoToAppointments,
  onGoToDashboard,
}) {
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data States
  const [doctors, setDoctors] = useState([]);
  const [facilities, setFacilities] = useState([]);

  // Form States
  const [searchQuery, setSearchQuery] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [facility, setFacility] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientContact, setPatientContact] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [complaint, setComplaint] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState("");

  // --- API INTEGRATION: Fetch Doctors & Facilities ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Facilities from normal endpoint
        const facRes = await apiRequest("/api/v1/booking-data", {
          method: "GET",
        });
        // Fetch Doctors WITH Schedules from specialist endpoint
        const docRes = await apiRequest("/api/v1/booking-data-specialist", {
          method: "GET",
        });

        if (docRes && docRes.doctors) {
          const mappedDocs = docRes.doctors.map((doc) => {
            let parsedSchedules = {};
            if (typeof doc.schedules === "string") {
              try {
                parsedSchedules = JSON.parse(doc.schedules);
              } catch (e) {}
            } else if (doc.schedules) {
              parsedSchedules = doc.schedules;
            }
            return {
              ...doc,
              schedules: parsedSchedules,
            };
          });
          setDoctors(mappedDocs);
        }

        if (facRes && facRes.facilities) {
          setFacilities(facRes.facilities);
        }
      } catch (error) {
        console.error("Failed to fetch booking data:", error);
      }
    };
    fetchData();
  }, []);

  // --- AUTO-POPULATE PATIENT DETAILS ---
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
      setPhoneError("Phone number is required.");
      return;
    }

    if (digits.startsWith("0")) {
      digits = "63" + digits.substring(1);
    } else if (!digits.startsWith("63")) {
      digits = digits === "6" ? "6" : "63" + digits;
    }

    if (digits.length > 0 && digits.length < 12) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
    } else {
      setPhoneError("");
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

  const todayStr = getTodayString();
  const isDateInvalid = date ? date < todayStr : false;

  // --- STRICT DYNAMIC TIME SLOTS (WITH UNAVAILABLE STATE) ---
  useEffect(() => {
    if (date && doctor && doctor.schedules) {
      const dateParts = date.split("-");
      const dateObj = new Date(
        parseInt(dateParts[0]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[2]),
      );

      const dayOfWeek = dateObj.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const dayKey = Object.keys(doctor.schedules).find(
        (k) => k.toLowerCase() === dayOfWeek.toLowerCase(),
      );

      if (!dayKey || !doctor.schedules[dayKey]) {
        setAvailableSlots([]);
        setTime("");
        return;
      }

      const now = new Date();
      const isToday = date === todayStr;
      const currentMins = now.getHours() * 60 + now.getMinutes();

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

      const timeBlocks = doctor.schedules[dayKey].split(",");

      let minTime = Infinity;
      let maxTime = -Infinity;
      const parsedBlocks = [];

      timeBlocks.forEach((block) => {
        const [startStr, endStr] = block.split("-");
        if (!startStr || !endStr) return;
        const start = parseTime(startStr);
        const end = parseTime(endStr);
        if (start < minTime) minTime = start;
        if (end > maxTime) maxTime = end;
        parsedBlocks.push({ start, end });
      });

      if (parsedBlocks.length === 0) {
        setAvailableSlots([]);
        return;
      }

      const slots = [];
      let current = minTime;

      while (current < maxTime) {
        const isInAWorkingBlock = parsedBlocks.some(
          (b) => current >= b.start && current < b.end,
        );
        const isPassedToday = isToday && current <= currentMins;

        slots.push({
          time: formatTime(current),
          isAvailable: isInAWorkingBlock && !isPassedToday,
        });

        current += 30; // 30-minute intervals
      }

      setAvailableSlots(slots);
      setTime("");
    } else {
      setAvailableSlots([]);
    }
  }, [date, doctor, todayStr]);

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.primarySpecialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const availableFacilities = facilities.filter(
    (fac) => fac.specialistId === doctor?.id,
  );

  const canProceed = () => {
    if (currentStep === 0) return doctor !== null;
    if (currentStep === 1) return facility !== null;
    if (currentStep === 2) return date !== "" && !isDateInvalid && time !== "";
    if (currentStep === 3) {
      const digits = patientContact.replace(/\D/g, "");
      return digits.length === 12; // Must be valid 12-digit number
    }
    if (currentStep === 4) return complaint.trim().length > 0;
    return true;
  };

  // --- API INTEGRATION: Clean Submission to Prevent 400 Bad Request ---
  const handleConfirmAppointment = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest("/api/v1/tickets", {
        method: "POST",
        body: JSON.stringify({
          patientId: user?.id,
          specialistId: doctor.id,
          consultationChannel: "Physical",
          preferredDate: date,
          preferredTime: time,
          chiefComplaint: complaint,
          symptoms:
            symptoms.length > 0
              ? JSON.stringify(symptoms)
              : JSON.stringify(["None"]),
          additionalDetails: `Facility: ${facility.name} | ${notes}`,
          targetSpecialty: doctor.primarySpecialty || "General Practice",
          isUsingHmo: false,
          hmoProvider: "",
          hmoMemberId: "",
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
    if (currentStep === 5) {
      handleConfirmAppointment();
    } else {
      setCurrentStep((c) => c + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) onGoBack();
    else setCurrentStep((c) => c - 1);
  };

  const toggleSymptom = (sym) =>
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym],
    );

  // --- UI SCHEDULE PILLS ---
  const formatSchedulePills = (schedules) => {
    if (!schedules || Object.keys(schedules).length === 0) {
      return (
        <span
          className="bp-badge"
          style={{
            backgroundColor: "#f1f3f5",
            color: "#868e96",
            border: "1px solid #dee2e6",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          No Schedule Set
        </span>
      );
    }

    return Object.entries(schedules).map(([day, t]) => (
      <span
        key={day}
        className="bp-badge"
        style={{
          backgroundColor: "var(--bs-cyan-light, #e3f2fd)",
          color: "var(--bs-cyan, #0ba3b0)",
          border: "1px solid var(--bs-cyan, #0ba3b0)",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        {day.substring(0, 3)} {t}
      </span>
    ));
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
                  className="bp-search-input pl-36"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="bp-specialist-list" style={{ marginTop: "16px" }}>
                {filteredDoctors.map((doc) => {
                  const isAvailable = true;
                  const initials = doc.name
                    ? doc.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "DR";

                  return (
                    <div
                      key={doc.id}
                      className={`bp-doc-card ${doctor?.id === doc.id ? "bp-doc-selected" : ""} ${!isAvailable ? "bp-doc-disabled" : ""}`}
                      onClick={() => {
                        if (isAvailable) {
                          setDoctor(doc);
                          setFacility(null);
                        }
                      }}
                    >
                      <div className="bp-doc-info-wrapper">
                        <div
                          className={`bp-doc-avatar ${isAvailable ? "bp-avatar-active" : "bp-avatar-inactive"}`}
                        >
                          {initials}
                        </div>
                        <div className="bp-doc-details">
                          <h4 className="bp-doc-name">{doc.name}</h4>
                          <p
                            className={`bp-doc-spec ${isAvailable ? "bp-spec-active" : "bp-spec-inactive"}`}
                          >
                            {doc.primarySpecialty}
                          </p>
                          <p className="bp-doc-meta">
                            <IconMapPin size={14} />{" "}
                            {doc.hospitalName || "Partner Clinics"}
                          </p>
                          {doc.yearsExperience > 0 && (
                            <p className="bp-doc-meta-last">
                              <IconStethoscope size={14} />{" "}
                              {doc.yearsExperience} years experience
                            </p>
                          )}

                          {/* Schedule Pills Display */}
                          <div
                            className="bp-doc-badges"
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "6px",
                              marginTop: "8px",
                            }}
                          >
                            {formatSchedulePills(doc.schedules)}
                          </div>
                        </div>
                      </div>
                      <div className="bp-doc-status-wrapper">
                        {isAvailable ? (
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
                  );
                })}
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
                Available locations for {doctor?.name}
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
                        <div
                          className="bp-icon-box bp-icon-cyan"
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "var(--bs-cyan-light, #e3f2fd)",
                            color: "var(--bs-cyan, #0ba3b0)",
                          }}
                        >
                          <IconMapPin size={24} />
                        </div>
                        <div className="bp-doc-details">
                          <h4 className="bp-doc-name">{fac.name}</h4>
                          <p
                            className="bp-doc-meta-last fw-500"
                            style={{ fontWeight: 500, margin: 0 }}
                          >
                            <IconMapPin size={14} /> {fac.address}
                          </p>
                        </div>
                      </div>
                      <IconCheck
                        size={24}
                        className={
                          facility?.id === fac.id ? "text-cyan" : "text-muted"
                        }
                        style={{
                          opacity: facility?.id === fac.id ? 1 : 0.2,
                          color:
                            facility?.id === fac.id
                              ? "var(--bs-cyan, #0ba3b0)"
                              : "#adb5bd",
                        }}
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
                  min={todayStr}
                  max="2030-12-31"
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime(""); // Reset time on date change
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
                    Available slots for {date} (Out-of-office hours excluded)
                  </p>

                  <div className="bp-time-grid-extended">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.isAvailable}
                          className={`bp-time-btn-extended ${
                            time === slot.time
                              ? "selected"
                              : slot.isAvailable
                                ? "available"
                                : "unavailable"
                          }`}
                          onClick={() => setTime(slot.time)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "16px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                            fontFamily: "inherit",
                            transition: "all 0.2s",
                            ...(time === slot.time
                              ? {
                                  backgroundColor: "var(--bs-cyan, #0ba3b0)",
                                  color: "white",
                                  border: "1px solid var(--bs-cyan, #0ba3b0)",
                                }
                              : slot.isAvailable
                                ? {
                                    background: "white",
                                    border:
                                      "1px solid var(--bs-border, #e9ecef)",
                                    color: "var(--bs-dark, #343a40)",
                                    cursor: "pointer",
                                  }
                                : {
                                    backgroundColor: "#f8f9fa",
                                    color: "#ced4da",
                                    border: "1px solid #f1f3f5",
                                    cursor: "not-allowed",
                                  }),
                          }}
                        >
                          <IconClock
                            size={18}
                            className="mb-8"
                            style={{ marginBottom: "8px" }}
                          />
                          {slot.time}
                        </button>
                      ))
                    ) : (
                      <p
                        className="bp-empty-state"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        The doctor is not scheduled to work on this day. Please
                        select another date.
                      </p>
                    )}
                  </div>

                  {availableSlots.length > 0 && (
                    <div
                      className="bp-time-legend"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "24px",
                        marginTop: "16px",
                      }}
                    >
                      <span
                        className="bp-legend-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "12px",
                          color: "var(--bs-text-muted, #868e96)",
                        }}
                      >
                        <div
                          className="bp-legend-dot selected"
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "4px",
                            backgroundColor: "var(--bs-cyan, #0ba3b0)",
                          }}
                        ></div>{" "}
                        Selected
                      </span>
                      <span
                        className="bp-legend-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "12px",
                          color: "var(--bs-text-muted, #868e96)",
                        }}
                      >
                        <div
                          className="bp-legend-dot available"
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "4px",
                            border: "1px solid var(--bs-border, #e9ecef)",
                            backgroundColor: "white",
                          }}
                        ></div>{" "}
                        Available
                      </span>
                      <span
                        className="bp-legend-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "12px",
                          color: "var(--bs-text-muted, #868e96)",
                        }}
                      >
                        <div
                          className="bp-legend-dot unavailable"
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "4px",
                            backgroundColor: "#f1f3f5",
                          }}
                        ></div>{" "}
                        Unavailable
                      </span>
                    </div>
                  )}
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
                  Your basic info is auto-filled. Please verify your contact
                  number.
                </p>

                <div className="bp-form-group">
                  <label className="bp-form-label">Full Name</label>
                  <input
                    type="text"
                    value={patientName}
                    className="bp-form-input"
                    disabled
                    style={{
                      backgroundColor: "#f1f5f9",
                      cursor: "not-allowed",
                    }}
                  />
                </div>

                <div className="bp-form-group">
                  <label className="bp-form-label">Age</label>
                  <input
                    type="text"
                    value={patientAge}
                    className="bp-form-input"
                    disabled
                    style={{
                      backgroundColor: "#f1f5f9",
                      cursor: "not-allowed",
                    }}
                  />
                </div>

                <div className="bp-form-group">
                  <label className="bp-form-label">Gender</label>
                  <input
                    type="text"
                    value={patientGender}
                    className="bp-form-input"
                    disabled
                    style={{
                      backgroundColor: "#f1f5f9",
                      cursor: "not-allowed",
                    }}
                  />
                </div>

                <div className="bp-form-group bp-margin-0">
                  <label className="bp-form-label">Contact Number *</label>
                  <div
                    className="bp-input-with-icon"
                    style={{ position: "relative" }}
                  >
                    <IconPhone
                      size={16}
                      className="bp-inner-icon"
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#adb5bd",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="+63 XXX XXX XXXX"
                      value={patientContact}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="bp-form-input"
                      style={{ paddingLeft: "36px" }}
                    />
                  </div>
                  {phoneError && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--bs-red, #e03131)",
                        fontWeight: 500,
                        margin: "8px 0 0 0",
                      }}
                    >
                      {phoneError}
                    </p>
                  )}
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
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        ...(symptoms.includes(sym)
                          ? {
                              backgroundColor: "var(--bs-cyan, #0ba3b0)",
                              color: "white",
                              border: "1px solid var(--bs-cyan, #0ba3b0)",
                            }
                          : {
                              background: "white",
                              color: "var(--bs-dark, #343a40)",
                              border: "1px solid var(--bs-border, #e9ecef)",
                            }),
                      }}
                    >
                      {symptoms.includes(sym) && (
                        <IconCheck
                          size={12}
                          className="bp-symptom-check"
                          style={{ marginRight: "4px" }}
                        />
                      )}{" "}
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="bp-form-group bp-form-group-last"
                style={{ marginBottom: 0, marginTop: "24px" }}
              >
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
                <div
                  className="bp-review-avatar"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "var(--bs-cyan, #0ba3b0)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                >
                  {doctor.name
                    ? doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "DR"}
                </div>
                <div className="bp-review-doctor-info">
                  <h4 className="bp-review-doctor-name">{doctor.name}</h4>
                  <p
                    className="bp-review-doctor-spec text-cyan"
                    style={{ color: "var(--bs-cyan, #0ba3b0)" }}
                  >
                    {doctor.primarySpecialty} • {facility.name}
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
                      className="bp-review-icon"
                      style={{ color: "var(--bs-cyan, #0ba3b0)" }}
                    />{" "}
                    {date}
                  </p>
                </div>
                <div className="bp-review-grid-item">
                  <p className="bp-review-label">Time</p>
                  <p className="bp-review-value-icon">
                    <IconClock
                      size={16}
                      className="bp-review-icon"
                      style={{ color: "var(--bs-cyan, #0ba3b0)" }}
                    />{" "}
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
              <h4
                className="bp-review-value-bold bp-margin-bottom-large"
                style={{ marginBottom: "24px" }}
              >
                {complaint}
              </h4>

              {symptoms.length > 0 && (
                <div
                  className="bp-review-symptoms-wrapper"
                  style={{ marginBottom: "32px" }}
                >
                  <p className="bp-review-label">Symptoms</p>
                  <div
                    className="bp-review-symptoms-list"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "4px",
                    }}
                  >
                    {symptoms.map((s) => (
                      <span
                        key={s}
                        className="bp-review-symptom-tag"
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: "var(--bs-cyan-light, #e3f2fd)",
                          color: "var(--bs-cyan, #0ba3b0)",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="bp-banner"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "16px",
                  borderRadius: "8px",
                  marginTop: "32px",
                  backgroundColor: "var(--bs-yellow-light, #fff9db)",
                  border: "1px solid var(--bs-yellow-border, #ffc078)",
                }}
              >
                <IconAlertCircle
                  size={20}
                  className="bp-icon-top"
                  style={{
                    marginTop: "4px",
                    color: "var(--bs-yellow, #e67700)",
                  }}
                />
                <div
                  className="bp-banner-content"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <h4
                    className="bp-banner-title-yellow"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--bs-yellow, #e67700)",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Important Reminders
                  </h4>
                  <ul
                    className="bp-banner-list-yellow"
                    style={{
                      fontSize: "12px",
                      color: "var(--bs-yellow, #e67700)",
                      margin: 0,
                      paddingLeft: "20px",
                    }}
                  >
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
            disabled={(currentStep === 0 && !onGoBack) || isSubmitting}
          >
            <IconChevronLeft size={16} /> Back
          </button>
          <button
            className={`bp-nav-btn ${!canProceed() || isSubmitting ? "bp-nav-btn-disabled" : ""}`}
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            style={
              canProceed() && !isSubmitting
                ? { backgroundColor: "var(--bs-cyan, #0ba3b0)", color: "white" }
                : {}
            }
          >
            {currentStep < 5 ? (
              <>
                Next <IconArrowRight size={16} />
              </>
            ) : isSubmitting ? (
              "Confirming..."
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
            <div
              className="bp-modal-icon-wrapper"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "var(--bs-green-light, #ebfbee)",
                color: "var(--bs-green, #2b8a3e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <IconCheck size={40} />
            </div>
            <h3 className="bp-modal-title">Appointment Created</h3>
            <p className="bp-modal-desc">
              Your physical consultation has been successfully scheduled.
            </p>
            <div className="bp-modal-actions">
              <button
                className="bp-modal-btn"
                style={{
                  backgroundColor: "var(--bs-cyan, #0ba3b0)",
                  color: "white",
                }}
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
