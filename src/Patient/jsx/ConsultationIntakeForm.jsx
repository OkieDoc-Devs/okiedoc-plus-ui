import { useState, useRef, useEffect } from "react";
import { submitConsultationIntake, fetchPatientActiveTickets } from "../services/apiService";
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
  IconPaperclip
} from "@tabler/icons-react";
import "../css/ConsultationIntakeForm.css";

export default function ConsultationIntakeForm({ setActive, type = "Video Consultation" }) {
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
    painAreas: []
  });

  const [painMapView, setPainMapView] = useState("front");
  const [uploadError, setUploadError] = useState("");

  // Save later persistence logic
  useEffect(() => {
    const saved = sessionStorage.getItem(`intake_draft_${type}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          ...parsed,
          attachments: [] // Files cannot be serialized to JSON easily, so we keep attachments fresh
        }));
      } catch (e) {
        console.error("Failed to parse intake draft", e);
      }
    }
  }, [type]);

  useEffect(() => {
    const { attachments, ...serializable } = formData;
    sessionStorage.setItem(`intake_draft_${type}`, JSON.stringify(serializable));
  }, [formData, type]);

  const PAIN_MAP_AREAS = {
    front: [
      { key: 'head', label: 'Head', className: 'part-head' },
      { key: 'neck', label: 'Neck', className: 'part-neck' },
      { key: 'chest', label: 'Chest', className: 'part-chest' },
      { key: 'abdomen', label: 'Abdomen', className: 'part-abdomen' },
      { key: 'left-arm', label: 'Left Arm', className: 'part-left-arm' },
      { key: 'right-arm', label: 'Right Arm', className: 'part-right-arm' },
      { key: 'left-leg', label: 'Left Leg', className: 'part-left-leg' },
      { key: 'right-leg', label: 'Right Leg', className: 'part-right-leg' },
    ],
    back: [
      { key: 'head', label: 'Head', className: 'part-head' },
      { key: 'neck', label: 'Neck', className: 'part-neck' },
      { key: 'upper-back', label: 'Upper Back', className: 'part-chest' },
      { key: 'lower-back', label: 'Lower Back', className: 'part-abdomen' },
      { key: 'left-arm', label: 'Left Arm', className: 'part-left-arm' },
      { key: 'right-arm', label: 'Right Arm', className: 'part-right-arm' },
      { key: 'left-leg', label: 'Left Leg', className: 'part-left-leg' },
      { key: 'right-leg', label: 'Right Leg', className: 'part-right-leg' },
    ],
  };

  const commonSymptoms = [
    "Fever", "Headache", "Cough", "Body Pain", "Dizziness", "Chest Pain", "Sore Throat", "Nausea",
    "Fatigue", "Shortness of Breath", "Stomach Pain", "Loss of Appetite"
  ];

  const toggleSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleBack = () => {
    if (setActive) {
      setActive("Services");
    } else {
      window.location.hash = "#/Services";
    }
  };

  const adjustDuration = (amount) => {
    setFormData(prev => {
      const current = parseInt(prev.duration) || 0;
      const next = Math.max(0, current + amount);
      return { ...prev, duration: next.toString() };
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

    setUploadError("");

    const validFiles = files.filter(file => {
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

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handlePainAreaToggle = (area) => {
    const areaId = `${painMapView}:${area.key}`;
    setFormData(prev => {
      const isSelected = prev.painAreas.some(a => a.id === areaId);
      if (isSelected) {
        return { ...prev, painAreas: prev.painAreas.filter(a => a.id !== areaId) };
      } else {
        return { 
          ...prev, 
          painAreas: [...prev.painAreas, { ...area, id: areaId, view: painMapView }] 
        };
      }
    });
  };

  const handlePainAreaRemove = (areaId) => {
    setFormData(prev => ({
      ...prev,
      painAreas: prev.painAreas.filter(a => a.id !== areaId)
    }));
  };

  const handleProceed = async () => {
    if (!formData.mainConcern) return;
    
    try {
      // 1. Convert attachments to Base64 for BLOB storage
      const convertedAttachments = await Promise.all(
        formData.attachments.map(async (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              data: reader.result // Base64 including data prefix
            });
            reader.onerror = (error) => reject(error);
          });
        })
      );

      const channelMap = {
        "Chat Consultation": "chat",
        "Voice Consultation": "mobile_call",
        "Video Consultation": "platform_call"
      };

      const payload = {
        mainConcern: formData.mainConcern,
        consultationChannel: channelMap[type] || "platform_call",
        symptoms: formData.symptoms,
        otherSymptoms: formData.otherSymptoms,
        durationValue: parseInt(formData.duration) || 0,
        durationUnit: formData.durationUnit,
        severity: formData.severity,
        additionalDetails: formData.additionalDetails,
        painAreas: formData.painAreas, // Array of {id, label, view, key, ...}
        attachments: convertedAttachments
      };

      await submitConsultationIntake(payload);
      sessionStorage.removeItem(`intake_draft_${type}`);
      alert("Consultation request submitted successfully!");
      handleBack();
    } catch (error) {
      console.error("Failed to submit intake:", error);
      alert("Error: " + (error.message || "Failed to submit consultation request."));
    }
  };

  return (
    <div className="intake-page-container">
      <div className="intake-header-nav">
        <button className="intake-back-btn" onClick={handleBack}>
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
      <p className="intake-subtitle">Help us understand your health concern to provide better care</p>

      <div className="intake-sections-wrapper">
        {/* Main Concern */}
        <div className="intake-card">
          <div className="intake-card-title">
            <IconInfoCircle size={20} className="text-cyan" />
            <h3>What is your main concern? *</h3>
          </div>
          <textarea
            placeholder="Describe your concern briefly (e.g., 'I have a persistent cough for 3 days with mild fever')"
            value={formData.mainConcern}
            onChange={(e) => setFormData({ ...formData, mainConcern: e.target.value })}
            className="intake-textarea"
          />
          <p className="intake-hint">This helps the doctor prepare for your consultation</p>
        </div>

        {/* Common Symptoms */}
        <div className="intake-card">
          <div className="intake-card-title">
            <IconActivity size={20} className="text-cyan" />
            <h3>Common Symptoms</h3>
          </div>
          <p className="intake-card-subtitle">Select all that apply</p>
          <div className="intake-symptoms-grid">
            {commonSymptoms.map(symptom => (
              <button
                key={symptom}
                className={`symptom-tag ${formData.symptoms.includes(symptom) ? 'active' : ''}`}
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        {/* Other Symptoms */}
        <div className="intake-card">
          <div className="intake-card-title">
            <IconFileText size={20} className="text-cyan" />
            <h3>Other Symptoms</h3>
          </div>
          <p className="intake-card-subtitle">Add any symptoms not listed above</p>
          <input
            type="text"
            placeholder="e.g., Rash on arms, numbness in fingers, etc."
            className="intake-input"
            value={formData.otherSymptoms}
            onChange={(e) => setFormData({ ...formData, otherSymptoms: e.target.value })}
          />
        </div>

        {/* Pain Location */}
        <div className="intake-card">
          <div className="intake-card-title">
            <IconActivity size={20} className="text-cyan" />
            <h3>Pain Location</h3>
          </div>
          <p className="intake-card-subtitle">Click on the body areas where you feel pain or discomfort</p>
          
          <div className="triage-pain-map-view-toggle">
            <button 
              className={`triage-pain-map-view-btn ${painMapView === 'front' ? 'active' : ''}`}
              onClick={() => setPainMapView('front')}
            >
              Front View
            </button>
            <button 
              className={`triage-pain-map-view-btn ${painMapView === 'back' ? 'active' : ''}`}
              onClick={() => setPainMapView('back')}
            >
              Back View
            </button>
          </div>

          <div className="triage-pain-map-content">
            <div className={`triage-pain-map-figure ${painMapView === 'back' ? 'back' : 'front'}`}>
              <div className="body-map-visual"></div>
              {PAIN_MAP_AREAS[painMapView].map((area) => {
                const areaId = `${painMapView}:${area.key}`;
                const isSelected = formData.painAreas.some((a) => a.id === areaId);

                return (
                  <button
                    key={areaId}
                    type="button"
                    className={`triage-body-part ${area.className} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePainAreaToggle(area)}
                  />
                );
              })}
            </div>

            <div className="triage-pain-map-selection">
              <div className="triage-pain-map-selection-title">Selected areas:</div>
              {formData.painAreas.length === 0 ? (
                <div className="triage-pain-map-empty">No areas selected</div>
              ) : (
                <div className="triage-pain-map-chips">
                  {formData.painAreas.map((area) => (
                    <div key={area.id} className="triage-pain-map-chip">
                      <span>{area.label} ({area.view === 'back' ? 'Back' : 'Front'})</span>
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
          <p className="intake-hint">Click on body parts to mark pain locations</p>
        </div>

        {/* Additional Details */}
        <div className="intake-card">
          <div className="intake-card-title">
            <IconFileText size={20} className="text-cyan" />
            <h3>Additional Details (Optional)</h3>
          </div>
          <p className="intake-card-subtitle">Anything else the doctor should know?</p>
          <textarea
            placeholder="List medications you are currently taking, allergies, or other relevant health information..."
            value={formData.additionalDetails}
            onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
            className="intake-textarea"
          />
        </div>

        <div className="intake-card">
          <div className="intake-card-title">
            <IconClock size={20} className="text-cyan" />
            <h3>Symptom Timeline & Severity</h3>
          </div>

          <div className="intake-field-group">
            <label>How long have you had these symptoms?</label>
            <div className="duration-input-row">
              <div className="intake-duration-wrapper">
                <input 
                  type="text" 
                  placeholder="Duration" 
                  className="intake-input"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value.replace(/[^0-9]/g, '')})}
                />
                <div className="duration-controls">
                  <button className="duration-ctrl-btn" onClick={() => adjustDuration(1)}><IconChevronUp size={14} /></button>
                  <button className="duration-ctrl-btn" onClick={() => adjustDuration(-1)}><IconChevronDown size={14} /></button>
                </div>
              </div>
              <select 
                className="intake-select"
                value={formData.durationUnit}
                onChange={(e) => setFormData({...formData, durationUnit: e.target.value})}
              >
                <option>Hours</option>
                <option>Days</option>
                <option>Weeks</option>
                <option>Months</option>
              </select>
            </div>
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
              onChange={(e) => setFormData({...formData, severity: parseInt(e.target.value)})}
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
          <p className="intake-card-subtitle">Upload images of rashes, prescriptions, lab results, etc.</p>
          
          <input 
            type="file" 
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple 
            accept="image/png, image/jpeg"
            onChange={handleFileUpload}
          />
          <div className="upload-dropzone" onClick={() => fileInputRef.current.click()}>
            <div className="upload-icon-circle">
              <IconUpload size={24} color="#0891b2" />
            </div>
            <p className="upload-primary-text">Click to upload images</p>
            {uploadError && <p className="upload-error-text" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{uploadError}</p>}
            <p className="upload-secondary-text">PNG, JPG up to 10MB each</p>
          </div>

          {formData.attachments.length > 0 && (
            <div className="uploaded-files-list">
              {formData.attachments.map((file, index) => (
                <div key={index} className="upload-item">
                  <div className="upload-item-info">
                    <IconPaperclip size={18} color="#94a3b8" />
                    <span className="upload-item-name">{file.name}</span>
                    <span className="upload-item-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button className="upload-item-remove" onClick={() => removeAttachment(index)}>
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
              <li>In case of emergency, please call 911 or go to the nearest ER</li>
            </ul>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="intake-sticky-footer">
          <div className="footer-content">
            <button className="footer-save-btn">
              <IconDeviceFloppy size={18} /> Save for Later
            </button>
            <div className="footer-right">
              <button 
                className={`footer-proceed-btn ${!formData.mainConcern ? 'disabled' : ''}`}
                onClick={handleProceed}
              >
                Proceed to Consultation <IconArrowRight size={18} />
              </button>
              {!formData.mainConcern && <p className="footer-validation-msg">Please describe your main concern to continue</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}