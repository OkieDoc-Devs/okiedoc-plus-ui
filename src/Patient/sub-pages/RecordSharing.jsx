import React, { useState } from "react";
import {
  IconArrowLeft,
  IconShieldCheck,
  IconUser,
  IconClock,
  IconLockOpen,
  IconEye,
  IconX,
  IconShare,
  IconCalendarEvent,
  IconPill,
  IconFlask,
  IconCertificate,
  IconClipboardList,
  IconInfoCircle,
  IconLock,
  IconCircleCheck,
  IconCheck,
} from "@tabler/icons-react";
import "../css/Patient_RecordSharing.css";

// --- MOCK DATA ---
const DOCTORS_FLOW = [
  {
    id: 1,
    name: "Dr. Maria Santos",
    spec: "Cardiologist",
    reason: "Heart condition follow-up",
  },
  {
    id: 2,
    name: "Dr. James Chen",
    spec: "Orthopedic Surgeon",
    reason: "Knee pain assessment",
  },
  {
    id: 3,
    name: "Dr. Sofia Reyes",
    spec: "Dermatologist",
    reason: "Skin condition review",
  },
];

const RECORD_TYPES = [
  {
    id: "consults",
    title: "Previous Consultations",
    items: 8,
    desc: "History of past doctor visits and diagnoses",
    icon: IconCalendarEvent,
  },
  {
    id: "prescriptions",
    title: "Prescriptions",
    items: 12,
    desc: "Medication history and current prescriptions",
    icon: IconPill,
  },
  {
    id: "labs",
    title: "Lab Results",
    items: 5,
    desc: "Blood tests, imaging, and diagnostic reports",
    icon: IconFlask,
  },
  {
    id: "certs",
    title: "Medical Certificates",
    items: 3,
    desc: "Sick leaves and fitness to work documents",
    icon: IconCertificate,
  },
  {
    id: "plans",
    title: "Treatment Plans",
    items: 2,
    desc: "Ongoing treatment protocols and care plans",
    icon: IconClipboardList,
  },
];

export default function RecordSharing({ onGoBack }) {
  // --- STATE ---
  const [availableDoctors, setAvailableDoctors] = useState(DOCTORS_FLOW);
  const [sharedActivities, setSharedActivities] = useState([]);

  // Share Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [accessDuration, setAccessDuration] = useState("one-time");

  // View Modal State
  const [viewingActivity, setViewingActivity] = useState(null);

  // --- HANDLERS ---
  const openModal = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedRecords([]);
    setAccessDuration("one-time");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleToggleRecord = (id) => {
    if (selectedRecords.includes(id)) {
      setSelectedRecords(selectedRecords.filter((rId) => rId !== id));
    } else {
      setSelectedRecords([...selectedRecords, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === RECORD_TYPES.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(RECORD_TYPES.map((r) => r.id));
    }
  };

  const handleShare = (isAll = false) => {
    const recordsToShare = isAll
      ? RECORD_TYPES.map((r) => r.id)
      : selectedRecords;

    const newActivity = {
      id: Date.now(),
      doctor: selectedDoctor,
      recordCount: recordsToShare.length,
      sharedRecordIds: recordsToShare, // <--- NEW: Saves the exact records checked
      duration:
        accessDuration === "one-time" ? "One-time only" : "30 Days (Follow-up)",
      date: "April 23, 2026 at 02:22 PM",
    };

    setSharedActivities([newActivity, ...sharedActivities]);
    setAvailableDoctors(
      availableDoctors.filter((d) => d.id !== selectedDoctor.id),
    );
    closeModal();
  };

  const handleRevoke = (activityId, doctor) => {
    setSharedActivities(sharedActivities.filter((a) => a.id !== activityId));
    setAvailableDoctors([...availableDoctors, doctor]);
    setViewingActivity(null); // Close view modal if open
  };

  const isAllSelected = selectedRecords.length === RECORD_TYPES.length;

  return (
    <div className="mrs-container">
      <div className="mrs-header-nav">
        <button className="mrs-back-btn" onClick={onGoBack}>
          <IconArrowLeft size={18} /> Back to Medical Records
        </button>
      </div>

      <div className="mrs-page-header">
        <div className="mrs-icon-box bg-cyan text-white">
          <IconShare size={28} />
        </div>
        <div className="mrs-title-group">
          <h1 className="mrs-page-title">Medical Records Sharing</h1>
          <p className="mrs-page-subtitle">
            Manage your medical data consent and privacy
          </p>
        </div>
      </div>

      <div className="mrs-banner mrs-banner-blue">
        <IconShieldCheck size={24} className="text-cyan mrs-banner-icon" />
        <div className="mrs-banner-text">
          <h4>Your Privacy is Protected</h4>
          <p>
            All medical records are encrypted and shared securely. You have full
            control over who can access your data and for how long.
          </p>
        </div>
      </div>

      {/* LATEST SHARE ACTIVITY */}
      {sharedActivities.length > 0 && (
        <div className="mrs-section">
          <h3 className="mrs-section-title">Latest Share Activity</h3>
          <div className="mrs-activity-list">
            {sharedActivities.map((activity) => (
              <div key={activity.id} className="mrs-activity-card">
                <div className="mrs-activity-icon">
                  <IconCircleCheck size={28} />
                </div>
                <div className="mrs-activity-content">
                  <div className="mrs-activity-header">
                    <h4>Records Shared Successfully</h4>
                    <span className="mrs-badge-active">Active</span>
                  </div>

                  <div className="mrs-activity-meta">
                    <div className="meta-item">
                      <IconUser size={16} /> Shared with:{" "}
                      <strong>{activity.doctor.name}</strong>
                    </div>
                    <div className="meta-item">
                      <IconClipboardList size={16} /> Records shared:{" "}
                      <strong>{activity.recordCount} types</strong>
                    </div>
                    <div className="meta-item">
                      <IconClock size={16} /> Access:{" "}
                      <strong>{activity.duration}</strong>
                    </div>
                    <div className="meta-item">
                      <IconCalendarEvent size={16} /> Shared on:{" "}
                      <strong>{activity.date}</strong>
                    </div>
                  </div>

                  <div className="mrs-activity-actions">
                    <button
                      className="mrs-btn-outline-gray"
                      onClick={() => setViewingActivity(activity)}
                    >
                      <IconEye size={16} /> View Shared Records
                    </button>
                    <button
                      className="mrs-btn-outline-red"
                      onClick={() => handleRevoke(activity.id, activity.doctor)}
                    >
                      <IconLock size={16} /> Revoke Access
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRY RECORD SHARING FLOW */}
      {availableDoctors.length > 0 && (
        <div className="mrs-section">
          <h3 className="mrs-section-title">Try Record Sharing Flow</h3>
          <p className="mrs-section-desc">
            Click on any scenario below to experience the consent flow
          </p>

          <div className="mrs-scenario-grid">
            {availableDoctors.map((doc) => (
              <div key={doc.id} className="mrs-scenario-card">
                <div className="mrs-scenario-icon">
                  <IconUser size={24} />
                </div>
                <h4>{doc.name}</h4>
                <p className="mrs-spec">{doc.spec}</p>
                <p className="mrs-reason">{doc.reason}</p>
                <button className="mrs-btn-teal" onClick={() => openModal(doc)}>
                  <IconShare size={18} /> Start Sharing Flow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRIVACY FEATURES */}
      <div className="mrs-section mt-40">
        <h3 className="mrs-section-title">Privacy Features</h3>
        <div className="mrs-features-grid">
          <div className="mrs-feature-card">
            <div className="mrs-feature-icon bg-light-green text-green">
              <IconShieldCheck size={24} />
            </div>
            <h4>Granular Control</h4>
            <p>Choose exactly which records to share</p>
          </div>
          <div className="mrs-feature-card">
            <div className="mrs-feature-icon bg-light-cyan text-cyan">
              <IconClock size={24} />
            </div>
            <h4>Time-Limited Access</h4>
            <p>Set duration for record access</p>
          </div>
          <div className="mrs-feature-card">
            <div className="mrs-feature-icon bg-light-orange text-orange">
              <IconLockOpen size={24} />
            </div>
            <h4>Revoke Anytime</h4>
            <p>Remove access with one click</p>
          </div>
          <div className="mrs-feature-card">
            <div className="mrs-feature-icon bg-light-cyan text-cyan">
              <IconEye size={24} />
            </div>
            <h4>Audit Trail</h4>
            <p>See who accessed your records</p>
          </div>
        </div>
      </div>

      {/* --- SHARE RECORDS MODAL OVERLAY --- */}
      {isModalOpen && selectedDoctor && (
        <div className="mrs-modal-overlay">
          <div className="mrs-modal-content">
            <div className="mrs-modal-header">
              <button className="mrs-modal-close" onClick={closeModal}>
                <IconX size={24} />
              </button>
              <div className="mrs-modal-title-group">
                <IconShieldCheck size={28} />
                <div>
                  <h2>Share Medical Records</h2>
                  <p>{selectedDoctor.spec} Consultation</p>
                </div>
              </div>
              <div className="mrs-modal-doc-info">
                <div className="doc-icon">
                  <IconUser size={24} />
                </div>
                <div>
                  <h3>{selectedDoctor.name}</h3>
                  <p>{selectedDoctor.spec}</p>
                </div>
              </div>
              <div className="mrs-modal-warning">
                <IconInfoCircle size={16} />
                This doctor requires your medical records for accurate diagnosis
                and treatment planning
              </div>
            </div>

            <div className="mrs-modal-body">
              <div className="mrs-modal-section-header">
                <div>
                  <h4>Select Records to Share</h4>
                  <p>Choose which medical records to provide</p>
                </div>
                <button className="mrs-btn-text" onClick={handleSelectAll}>
                  <IconCircleCheck size={18} />{" "}
                  {isAllSelected ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="mrs-record-list">
                {RECORD_TYPES.map((record) => (
                  <div
                    key={record.id}
                    className={`mrs-record-item ${selectedRecords.includes(record.id) ? "selected" : ""}`}
                    onClick={() => handleToggleRecord(record.id)}
                  >
                    <div className="mrs-checkbox">
                      {selectedRecords.includes(record.id) && (
                        <IconCheck size={14} strokeWidth={3} />
                      )}
                    </div>
                    <div className="mrs-record-icon">
                      <record.icon size={20} />
                    </div>
                    <div className="mrs-record-details">
                      <div className="mrs-record-title-row">
                        <h5>{record.title}</h5>
                        <span className="mrs-item-count">
                          {record.items} items
                        </span>
                      </div>
                      <p>{record.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mrs-modal-section-header no-flex">
                <h4>Access Duration</h4>
                <p>Control how long the doctor can access your records</p>
              </div>

              <div className="mrs-duration-list">
                <div
                  className={`mrs-duration-item ${accessDuration === "one-time" ? "selected" : ""}`}
                  onClick={() => setAccessDuration("one-time")}
                >
                  <div className="mrs-radio"></div>
                  <div className="mrs-duration-details">
                    <div className="mrs-duration-title-row">
                      <IconClock size={18} className="duration-icon" />
                      <h5>One-time Access</h5>
                      <span className="mrs-badge-recommended">Recommended</span>
                    </div>
                    <p>
                      Records accessible only during this consultation session
                    </p>
                  </div>
                </div>

                <div
                  className={`mrs-duration-item ${accessDuration === "follow-up" ? "selected" : ""}`}
                  onClick={() => setAccessDuration("follow-up")}
                >
                  <div className="mrs-radio"></div>
                  <div className="mrs-duration-details">
                    <div className="mrs-duration-title-row">
                      <IconEye size={18} className="duration-icon" />
                      <h5>Allow Access for Follow-up</h5>
                    </div>
                    <p>
                      Doctor can access records for future consultations (30
                      days)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mrs-security-warning">
                <IconLock size={20} className="warning-icon" />
                <div>
                  <h4>Privacy & Security</h4>
                  <p>
                    Your records will only be shared with{" "}
                    <strong>{selectedDoctor.name}</strong> for this
                    consultation. All data is encrypted and HIPAA compliant. You
                    can revoke access anytime from your Privacy Settings.
                  </p>
                </div>
              </div>

              <div className="mrs-modal-footer">
                <button className="mrs-btn-outline" onClick={closeModal}>
                  Deny Access
                </button>

                {!isAllSelected && (
                  <button
                    className="mrs-btn-share-selected"
                    disabled={selectedRecords.length === 0}
                    onClick={() => handleShare(false)}
                  >
                    Share Selected ({selectedRecords.length})
                  </button>
                )}

                <button
                  className={`mrs-btn-share-all ${isAllSelected ? "full-width" : ""}`}
                  onClick={() => handleShare(true)}
                >
                  <IconCheck size={18} /> Share All Records
                </button>
              </div>

              <div className="mrs-modal-terms">
                By sharing records, you consent to the terms outlined in our{" "}
                <span>Privacy Policy</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW SHARED RECORDS MODAL --- */}
      {viewingActivity && (
        <div className="mrs-modal-overlay">
          <div className="mrs-modal-content" style={{ maxWidth: "500px" }}>
            <div
              className="mrs-modal-header"
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
                padding: "24px",
              }}
            >
              <button
                className="mrs-modal-close"
                onClick={() => setViewingActivity(null)}
              >
                <IconX size={24} />
              </button>
              <div
                className="mrs-modal-title-group"
                style={{ marginBottom: 0 }}
              >
                <IconEye size={28} />
                <div>
                  <h2>Shared Records</h2>
                  <p>with {viewingActivity.doctor.name}</p>
                </div>
              </div>
            </div>

            <div className="mrs-modal-body">
              <div className="mrs-record-list" style={{ marginBottom: "24px" }}>
                {/* Dynamically filters the records to only show what was actually shared */}
                {RECORD_TYPES.filter((r) =>
                  viewingActivity.sharedRecordIds.includes(r.id),
                ).map((record) => (
                  <div
                    key={record.id}
                    className="mrs-record-item"
                    style={{ cursor: "default", padding: "16px" }}
                  >
                    <div className="mrs-record-icon">
                      <record.icon size={20} />
                    </div>
                    <div className="mrs-record-details">
                      <div className="mrs-record-title-row">
                        <h5>{record.title}</h5>
                      </div>
                      <p style={{ marginTop: "2px" }}>{record.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mrs-modal-footer"
                style={{ borderTop: "none", paddingTop: 0 }}
              >
                <button
                  className="mrs-btn-outline"
                  style={{ width: "100%" }}
                  onClick={() => setViewingActivity(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
