import { useState, useRef, useEffect } from "react";
import { submitConsultationIntake } from "../services/apiService";
import {
  IconArrowLeft,
  IconFileText,
  IconInfoCircle,
  IconActivity,
  IconClock,
  IconTrendingUp,
  IconUpload,
  IconDeviceFloppy,
  IconArrowRight,
  IconCircleCheckFilled,
  IconChevronUp,
  IconChevronDown,
  IconX,
  IconPaperclip,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";
import "../css/ConsultationIntakeForm.css";

const MAX_DURATIONS = {
  Hours: 72,
  Days: 31,
  Weeks: 52,
  Months: 12,
  Years: 10,
};

export default function ConsultationIntakeForm({
  setActive,
  type = "Video Consultation",
}) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    mainConcern: "",
    symptoms: [],
    otherSymptoms: "",
    duration: "",
    durationUnit: "Days",
    severity: 5,
    additionalDetails: "",
    attachments: [],
    painAreas: [],
  });

  const [painMapView, setPainMapView] = useState("front");
  const [uploadError, setUploadError] = useState("");

  // UX Polish: Form Error Highlights
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(`intake_draft_${type}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          attachments: [],
        }));
      } catch (e) {
        console.error("Failed to parse intake draft", e);
      }
    }
  }, [type]);

  useEffect(() => {
    const { attachments, ...serializable } = formData;
    sessionStorage.setItem(
      `intake_draft_${type}`,
      JSON.stringify(serializable),
    );
  }, [formData, type]);

  const PAIN_MAP_AREAS = {
    front: [
      { key: "head", label: "Head", className: "part-head" },
      { key: "neck", label: "Neck", className: "part-neck" },
      { key: "chest", label: "Chest", className: "part-chest" },
      { key: "abdomen", label: "Abdomen", className: "part-abdomen" },
      { key: "left-arm", label: "Left Arm", className: "part-left-arm" },
      { key: "right-arm", label: "Right Arm", className: "part-right-arm" },
      { key: "left-leg", label: "Left Leg", className: "part-left-leg" },
      { key: "right-leg", label: "Right Leg", className: "part-right-leg" },
    ],
    back: [
      { key: "head", label: "Head", className: "part-head" },
      { key: "neck", label: "Neck", className: "part-neck" },
      { key: "upper-back", label: "Upper Back", className: "part-chest" },
      { key: "lower-back", label: "Lower Back", className: "part-abdomen" },
      { key: "left-arm", label: "Left Arm", className: "part-left-arm" },
      { key: "right-arm", label: "Right Arm", className: "part-right-arm" },
      { key: "left-leg", label: "Left Leg", className: "part-left-leg" },
      { key: "right-leg", label: "Right Leg", className: "part-right-leg" },
    ],
  };

  const commonSymptoms = [
    "Fever",
    "Headache",
    "Cough",
    "Body Pain",
    "Dizziness",
    "Chest Pain",
    "Sore Throat",
    "Nausea",
    "Fatigue",
    "Shortness of Breath",
    "Stomach Pain",
    "Loss of Appetite",
  ];

  const toggleSymptom = (symptom) => {
    if (formErrors.symptoms)
      setFormErrors((prev) => ({ ...prev, symptoms: null }));
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const handleBack = () => {
    if (setActive) setActive("Services");
    else window.location.hash = "#/Services";
  };

  const handleDurationChange = (val) => {
    if (formErrors.duration)
      setFormErrors((prev) => ({ ...prev, duration: null }));

    let num = parseInt(val.replace(/\D/g, ""));
    if (isNaN(num)) {
      setFormData({ ...formData, duration: "" });
      return;
    }
    const maxLimit = MAX_DURATIONS[formData.durationUnit];
    if (num > maxLimit) num = maxLimit;
    setFormData({ ...formData, duration: num.toString() });
  };

  const adjustDuration = (amount) => {
    if (formErrors.duration)
      setFormErrors((prev) => ({ ...prev, duration: null }));
    setFormData((prev) => {
      const current = parseInt(prev.duration) || 0;
      let next = Math.max(0, current + amount);
      const maxLimit = MAX_DURATIONS[prev.durationUnit];
      if (next > maxLimit) next = maxLimit;
      return { ...prev, duration: next.toString() };
    });
  };

  const handleUnitChange = (unit) => {
    setFormData((prev) => {
      let current = parseInt(prev.duration) || 0;
      const newMaxLimit = MAX_DURATIONS[unit];
      if (current > newMaxLimit) current = newMaxLimit;
      return {
        ...prev,
        durationUnit: unit,
        duration: current ? current.toString() : "",
      };
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

    setUploadError("");

    const validFiles = files.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError("Only PNG and JPG files are accepted.");
        return false;
      }
      if (file.size > MAX_SIZE) {
        setUploadError("Files must be smaller than 10MB.");
        return false;
      }
      return true;
    });

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles],
    }));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handlePainAreaToggle = (area) => {
    const areaId = `${painMapView}:${area.key}`;
    setFormData((prev) => {
      const isSelected = prev.painAreas.some((a) => a.id === areaId);
      if (isSelected) {
        return {
          ...prev,
          painAreas: prev.painAreas.filter((a) => a.id !== areaId),
        };
      } else {
        return {
          ...prev,
          painAreas: [
            ...prev.painAreas,
            { ...area, id: areaId, view: painMapView },
          ],
        };
      }
    });
  };

  const handlePainAreaRemove = (areaId) => {
    setFormData((prev) => ({
      ...prev,
      painAreas: prev.painAreas.filter((a) => a.id !== areaId),
    }));
  };

  // --- SUBMIT LOGIC WITH HIGHLIGHTING ---
  const handleProceed = async () => {
    const newErrors = {};

    // 1. Validate Main Concern
    if (!formData.mainConcern.trim()) {
      newErrors.mainConcern = "Please describe your main concern.";
    }

    // 2. Validate Symptoms (Must have at least one common OR typed in other)
    if (formData.symptoms.length === 0 && !formData.otherSymptoms.trim()) {
      newErrors.symptoms =
        "Please select at least one symptom or describe it in 'Other Symptoms'.";
    }

    // 3. Validate Duration
    const durationNum = parseInt(formData.duration);
    if (!formData.duration || isNaN(durationNum) || durationNum <= 0) {
      newErrors.duration = "Please provide a valid duration.";
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setSubmitError("Please fill out the highlighted required fields.");

      // Smart scrolling: Scroll to the highest error on the page
      if (newErrors.mainConcern) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (newErrors.symptoms) {
        window.scrollTo({ top: 300, behavior: "smooth" });
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setFormErrors({});

    try {
      const convertedAttachments = await Promise.all(
        formData.attachments.map(async (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () =>
              resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                data: reader.result,
              });
            reader.onerror = (error) => reject(error);
          });
        }),
      );

      const channelMap = {
        "Chat Consultation": "chat",
        "Voice Consultation": "mobile_call",
        "Video Consultation": "platform_call",
      };

      const payload = {
        mainConcern: formData.mainConcern.trim(),
        consultationChannel: channelMap[type] || "platform_call",
        symptoms: formData.symptoms,
        otherSymptoms: formData.otherSymptoms.trim(),
        durationValue: durationNum,
        durationUnit: formData.durationUnit,
        severity: formData.severity,
        additionalDetails: formData.additionalDetails.trim(),
        painAreas: formData.painAreas,
        attachments: convertedAttachments,
      };

      await submitConsultationIntake(payload);

      sessionStorage.removeItem(`intake_draft_${type}`);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to submit intake:", error);
      setSubmitError(
        error.message || "Failed to submit request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="intake-page-container">
      <div className="intake-header-nav">
        <button
          className="intake-back-btn"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          <IconArrowLeft size={18} /> Back to Services
        </button>
      </div>

      <div className="intake-form-header">
        <div className="intake-icon-box">
          <IconFileText size={32} />
        </div>
        <div className="intake-title-section">
          <h1>Consultation Intake Form</h1>
          <span className="intake-type-badge">{type}</span>
        </div>
      </div>
      <p className="intake-subtitle">
        Help us understand your health concern to provide better care
      </p>

      <div className="intake-sections-wrapper">
        {/* Main Concern */}
        <div className="intake-card">
          <div className="intake-card-title">
            <IconInfoCircle
              size={20}
              className={formErrors.mainConcern ? "text-red" : "text-cyan"}
            />
            <h3 className={formErrors.mainConcern ? "text-red" : ""}>
              What is your main concern? *
            </h3>
          </div>
          <textarea
            placeholder="Describe your concern briefly (e.g., 'I have a persistent cough for 3 days with mild fever')"
            value={formData.mainConcern}
            maxLength={255}
            onChange={(e) => {
              setFormData({ ...formData, mainConcern: e.target.value });
              if (formErrors.mainConcern)
                setFormErrors((prev) => ({ ...prev, mainConcern: null }));
            }}
            className={`intake-textarea ${formErrors.mainConcern ? "intake-error-field" : ""}`}
          />
          {formErrors.mainConcern && (
            <div className="intake-error-text">
              <IconAlertCircle size={14} /> {formErrors.mainConcern}
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "12px",
            }}
          >
            <p className="intake-hint" style={{ marginTop: 0 }}>
              This helps the doctor prepare for your consultation
            </p>
            <p className="intake-hint" style={{ marginTop: 0 }}>
              {formData.mainConcern.length}/255
            </p>
          </div>
        </div>

        {/* Common Symptoms */}
        <div
          className={`intake-card ${formErrors.symptoms ? "intake-error-field" : ""}`}
          style={{ transition: "background-color 0.2s" }}
        >
          <div className="intake-card-title">
            <IconActivity
              size={20}
              className={formErrors.symptoms ? "text-red" : "text-cyan"}
            />
            <h3 className={formErrors.symptoms ? "text-red" : ""}>
              Symptoms *
            </h3>
          </div>
          <p className="intake-card-subtitle">
            Select all that apply, or type unlisted symptoms below.
          </p>
          <div className="intake-symptoms-grid">
            {commonSymptoms.map((symptom) => (
              <button
                key={symptom}
                className={`symptom-tag ${formData.symptoms.includes(symptom) ? "active" : ""}`}
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </button>
            ))}
          </div>

          {/* Other Symptoms integrated into the required Symptoms block */}
          <div style={{ marginTop: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#475569",
                marginBottom: "8px",
              }}
            >
              Other Symptoms
            </label>
            <input
              type="text"
              placeholder="e.g., Rash on arms, numbness in fingers, etc."
              className="intake-input"
              maxLength={255}
              value={formData.otherSymptoms}
              onChange={(e) => {
                setFormData({ ...formData, otherSymptoms: e.target.value });
                if (formErrors.symptoms)
                  setFormErrors((prev) => ({ ...prev, symptoms: null }));
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "4px",
              }}
            >
              <div>
                {formErrors.symptoms && (
                  <div className="intake-error-text" style={{ marginTop: 0 }}>
                    <IconAlertCircle size={14} /> {formErrors.symptoms}
                  </div>
                )}
              </div>
              <p className="intake-hint" style={{ margin: 0 }}>
                {formData.otherSymptoms.length}/255
              </p>
            </div>
          </div>
        </div>

        {/* Pain Location */}
        <div className="intake-card">
          <div className="intake-card-title">
            <IconActivity size={20} className="text-cyan" />
            <h3>Pain Location</h3>
          </div>
          <p className="intake-card-subtitle">
            Click on the body areas where you feel pain or discomfort
          </p>

          <div className="triage-pain-map-view-toggle">
            <button
              className={`triage-pain-map-view-btn ${painMapView === "front" ? "active" : ""}`}
              onClick={() => setPainMapView("front")}
            >
              Front View
            </button>
            <button
              className={`triage-pain-map-view-btn ${painMapView === "back" ? "active" : ""}`}
              onClick={() => setPainMapView("back")}
            >
              Back View
            </button>
          </div>

          <div className="triage-pain-map-content">
            <div
              className={`triage-pain-map-figure ${painMapView === "back" ? "back" : "front"}`}
            >
              <div className="body-map-visual"></div>
              {PAIN_MAP_AREAS[painMapView].map((area) => {
                const areaId = `${painMapView}:${area.key}`;
                const isSelected = formData.painAreas.some(
                  (a) => a.id === areaId,
                );

                return (
                  <button
                    key={areaId}
                    type="button"
                    className={`triage-body-part ${area.className} ${isSelected ? "selected" : ""}`}
                    onClick={() => handlePainAreaToggle(area)}
                  />
                );
              })}
            </div>

            <div className="triage-pain-map-selection">
              <div className="triage-pain-map-selection-title">
                Selected areas:
              </div>
              {formData.painAreas.length === 0 ? (
                <div className="triage-pain-map-empty">No areas selected</div>
              ) : (
                <div className="triage-pain-map-chips">
                  {formData.painAreas.map((area) => (
                    <div key={area.id} className="triage-pain-map-chip">
                      <span>
                        {area.label} ({area.view === "back" ? "Back" : "Front"})
                      </span>
                      <button
                        type="button"
                        className="triage-pain-map-chip-remove"
                        onClick={() => handlePainAreaRemove(area.id)}
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="intake-hint">
            Click on body parts to mark pain locations
          </p>
        </div>

        {/* Additional Details */}
        <div className="intake-card">
          <div className="intake-card-title">
            <IconFileText size={20} className="text-cyan" />
            <h3>Additional Details (Optional)</h3>
          </div>
          <p className="intake-card-subtitle">
            Anything else the doctor should know?
          </p>
          <textarea
            placeholder="List medications you are currently taking, allergies, or other relevant health information..."
            value={formData.additionalDetails}
            maxLength={255}
            onChange={(e) =>
              setFormData({ ...formData, additionalDetails: e.target.value })
            }
            className="intake-textarea"
          />
          <p className="intake-hint" style={{ textAlign: "right" }}>
            {formData.additionalDetails.length}/255
          </p>
        </div>

        <div className="intake-card">
          <div className="intake-card-title">
            <IconClock
              size={20}
              className={formErrors.duration ? "text-red" : "text-cyan"}
            />
            <h3 className={formErrors.duration ? "text-red" : ""}>
              Symptom Timeline & Severity *
            </h3>
          </div>

          <div className="intake-field-group">
            <label className={formErrors.duration ? "text-red" : ""}>
              How long have you had these symptoms?
            </label>
            <div className="duration-input-row">
              <div className="intake-duration-wrapper">
                <input
                  type="text"
                  placeholder="Duration"
                  className={`intake-input ${formErrors.duration ? "intake-error-field" : ""}`}
                  value={formData.duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                />
                <div className="duration-controls">
                  <button
                    className="duration-ctrl-btn"
                    onClick={() => adjustDuration(1)}
                  >
                    <IconChevronUp size={14} />
                  </button>
                  <button
                    className="duration-ctrl-btn"
                    onClick={() => adjustDuration(-1)}
                  >
                    <IconChevronDown size={14} />
                  </button>
                </div>
              </div>
              <select
                className={`intake-select ${formErrors.duration ? "intake-error-field" : ""}`}
                value={formData.durationUnit}
                onChange={(e) => handleUnitChange(e.target.value)}
              >
                <option>Hours</option>
                <option>Days</option>
                <option>Weeks</option>
                <option>Months</option>
                <option>Years</option>
              </select>
            </div>
            {formErrors.duration && (
              <div className="intake-error-text">
                <IconAlertCircle size={14} /> {formErrors.duration}
              </div>
            )}
          </div>

          <div className="intake-field-group">
            <div className="severity-header">
              <div className="severity-title">
                <IconTrendingUp size={18} className="text-cyan" />
                <span>Pain/Discomfort Severity</span>
              </div>
              <span className="severity-value">{formData.severity}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={formData.severity}
              onChange={(e) =>
                setFormData({ ...formData, severity: parseInt(e.target.value) })
              }
              className="intake-slider"
            />
            <div className="severity-labels">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="intake-card">
          <div className="intake-card-title">
            <IconUpload size={20} className="text-cyan" />
            <h3>Attachments (Optional)</h3>
          </div>
          <p className="intake-card-subtitle">
            Upload images of rashes, prescriptions, lab results, etc.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            multiple
            accept="image/png, image/jpeg"
            onChange={handleFileUpload}
          />
          <div
            className="upload-dropzone"
            onClick={() => fileInputRef.current.click()}
          >
            <div className="upload-icon-circle">
              <IconUpload size={24} color="#4aa7ed" />
            </div>
            <p className="upload-primary-text">Click to upload images</p>
            {uploadError && (
              <p
                className="upload-error-text"
                style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}
              >
                {uploadError}
              </p>
            )}
            <p className="upload-secondary-text">PNG, JPG up to 10MB each</p>
          </div>

          {formData.attachments.length > 0 && (
            <div className="uploaded-files-list">
              {formData.attachments.map((file, index) => (
                <div key={index} className="upload-item">
                  <div className="upload-item-info">
                    <IconPaperclip size={18} color="#94a3b8" />
                    <span className="upload-item-name">{file.name}</span>
                    <span className="upload-item-size">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    className="upload-item-remove"
                    onClick={() => removeAttachment(index)}
                  >
                    <IconX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Important Information */}
        <div className="intake-info-box">
          <div className="info-icon-circle">
            <IconInfoCircle size={20} color="#F59E0B" />
          </div>
          <div className="info-content">
            <h4>Important Information</h4>
            <ul>
              <li>This information is confidential and HIPAA-protected</li>
              <li>A doctor will review your intake before the consultation</li>
              <li>
                In case of emergency, please call 911 or go to the nearest ER
              </li>
            </ul>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="intake-sticky-footer">
          <div
            className="footer-content"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <div
              className="footer-right"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "8px",
              }}
            >
              {submitError && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <IconAlertCircle size={16} /> {submitError}
                </div>
              )}
              <button
                className="footer-proceed-btn"
                onClick={handleProceed}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2
                      size={18}
                      className="loading-spinner"
                      style={{
                        width: 18,
                        height: 18,
                        borderTopColor: "transparent",
                        animation: "spin 1s linear infinite",
                        border: "2px solid white",
                      }}
                    />{" "}
                    Submitting...
                  </>
                ) : (
                  <>
                    Proceed to Consultation <IconArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL OVERLAY */}
      {isModalOpen && (
        <div className="intake-loading-overlay">
          <div
            className="intake-card"
            style={{
              maxWidth: "400px",
              textAlign: "center",
              margin: "0 auto",
              border: "none",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <IconCircleCheckFilled size={64} color="#4aa7ed" />
            </div>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "12px",
                marginTop: 0,
              }}
            >
              Form Submitted!
            </h3>
            <p
              style={{
                color: "#64748b",
                fontSize: "15px",
                marginBottom: "32px",
                lineHeight: 1.5,
              }}
            >
              Your consultation intake has been successfully sent. A doctor will
              review your details shortly.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (setActive) setActive("Appointments");
                  else window.location.hash = "#/Appointments";
                }}
                className="footer-proceed-btn"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  backgroundColor: "#4aa7ed",
                  color: "white",
                }}
              >
                Go to Appointments
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  handleBack();
                }}
                style={{
                  background: "none",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Back to Services
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
