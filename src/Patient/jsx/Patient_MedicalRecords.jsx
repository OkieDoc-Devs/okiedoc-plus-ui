import { useState, useMemo, useEffect, useRef } from "react";
import {
  IconFileDescription,
  IconPill,
  IconFlask,
  IconCertificate,
  IconClipboardHeart,
  IconMessageCircle,
  IconShare,
  IconShieldCheck,
  IconLock,
  IconClock,
  IconSearch,
  IconFilter,
  IconVideo,
  IconDownload,
  IconMail,
  IconEye,
  IconMapPin,
  IconCalendarEvent,
  IconStethoscope,
  IconCheck,
} from "@tabler/icons-react";
import "../css/Patient_MedicalRecords.css";

// --- MOCK DATA ---
const mockHistory = Array.from({ length: 7 }).map((_, i) => ({
  id: i,
  dr: `Dr. ${["Maria Santos", "Carlos Torres", "Sofia Lim", "Anna Cruz", "Miguel Garcia", "Elena Rostova", "James Lee"][i]}`,
  spec: [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Psychiatrist",
    "Orthopedic",
    "Pediatrician",
    "Neurologist",
  ][i],
  date: `Sat, Mar ${28 - i}, 2026`,
  time: "10:30 AM",
  complaint: "Persistent cough and mild fever",
  dur: "25 minutes",
  status: "Completed",
}));

const mockPrescriptions = Array.from({ length: 7 }).map((_, i) => ({
  id: i,
  dr: `Dr. ${["Maria Santos", "Carlos Torres", "Sofia Lim", "Anna Cruz", "Miguel Garcia", "Elena Rostova", "James Lee"][i]}`,
  date: `March ${28 - i}, 2026`,
  meds: [
    ["Amoxicillin 500mg", "Cetirizine 10mg", "Paracetamol 500mg"],
    ["Hydrocortisone Cream 1%", "Cetirizine 10mg"],
    ["Lisinopril 10mg"],
    ["Sertraline 50mg"],
    ["Ibuprofen 400mg"],
    ["Salbutamol Inhaler"],
    ["Gabapentin 300mg"],
  ][i],
  status: "Active",
}));

const mockLabs = Array.from({ length: 7 }).map((_, i) => ({
  id: i,
  dr: `Dr. Maria Santos`,
  date: `March ${28 - i}, 2026`,
  test: [
    "Complete Blood Count (CBC)",
    "Lipid Profile, ECG, Chest X-Ray",
    "Knee X-Ray, MRI Scan",
    "Urinalysis",
    "Fasting Blood Sugar",
    "Thyroid Panel",
    "Liver Function Test",
  ][i],
  clinic: [
    "OkieDoc+ Lab Center - BGC",
    "OkieDoc+ Diagnostic - Makati",
    "OkieDoc+ Imaging - Ortigas",
    "Partner Clinic - QC",
    "OkieDoc+ Lab Center - BGC",
    "Partner Clinic - Alabang",
    "OkieDoc+ Diagnostic - Makati",
  ][i],
  status: i === 0 ? "Pending" : "Completed",
}));

const mockCerts = Array.from({ length: 7 }).map((_, i) => ({
  id: i,
  dr: `Dr. Carlos Torres`,
  date: `March ${28 - i}, 2026`,
  type: [
    "Sick Leave - Flu",
    "Fit to Work Certificate",
    "Medical Clearance - Travel",
    "Sick Leave - Migraine",
    "Fit to Play - Sports",
    "Clearance - Gym",
    "Sick Leave - Viral Infection",
  ][i],
  status: "Completed",
}));

const mockPlans = Array.from({ length: 7 }).map((_, i) => ({
  id: i,
  dr: `Dr. Sofia Lim`,
  start: `Feb ${10 + i}, 2026`,
  next: `May ${10 + i}, 2026`,
  condition: [
    "Hypertension Management",
    "Anxiety Disorder Treatment",
    "Type 2 Diabetes Control",
    "Asthma Management Plan",
    "Physical Therapy Routine",
    "Weight Management Plan",
    "Migraine Prevention",
  ][i],
  spec: "Internal Medicine",
  status: "Active",
}));

const mockReferrals = Array.from({ length: 7 }).map((_, i) => ({
  id: i,
  refTo: `Dr. ${["Carlos Torres", "Miguel Garcia", "Elena Rostova", "James Lee", "Sofia Lim", "Anna Cruz", "Maria Santos"][i]}`,
  spec: [
    "Dermatologist",
    "Orthopedic Surgeon",
    "Pediatrician",
    "Neurologist",
    "Cardiologist",
    "Psychiatrist",
    "General Physician",
  ][i],
  reason: [
    "Skin rash on arms",
    "Knee pain after exercise",
    "Childhood vaccination",
    "Chronic headaches",
    "Palpitations",
    "Therapy session",
    "Routine Checkup",
  ][i],
  status: i % 2 === 0 ? "Booked" : "Pending",
}));

const TABS = [
  {
    id: "history",
    label: "Consultation History",
    icon: IconFileDescription,
    data: mockHistory,
  },
  {
    id: "prescriptions",
    label: "Prescriptions",
    icon: IconPill,
    data: mockPrescriptions,
  },
  { id: "labs", label: "Lab Requests", icon: IconFlask, data: mockLabs },
  {
    id: "certs",
    label: "Medical Certificates",
    icon: IconCertificate,
    data: mockCerts,
  },
  {
    id: "plans",
    label: "Treatment Plans",
    icon: IconClipboardHeart,
    data: mockPlans,
  },
  {
    id: "referrals",
    label: "Referrals",
    icon: IconMessageCircle,
    data: mockReferrals,
  },
];

export default function Patient_MedicalRecords() {
  const [activeTab, setActiveTab] = useState("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState([
    "Completed",
    "Pending",
    "Active",
    "Booked",
  ]);
  const popoverRef = useRef(null);

  const handleDIY = (action) => alert(`DIY: ${action}`);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStatus = (status) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const currentTabData = TABS.find((t) => t.id === activeTab)?.data || [];

  const filteredData = useMemo(() => {
    return currentTabData.filter((item) => {
      const matchesSearch = Object.values(item).some((val) => {
        if (typeof val === "string")
          return val.toLowerCase().includes(searchQuery.toLowerCase());
        if (Array.isArray(val))
          return val.some((v) =>
            v.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        return false;
      });
      const matchesStatus = statusFilter.includes(item.status);
      return matchesSearch && matchesStatus;
    });
  }, [currentTabData, searchQuery, statusFilter]);

  const renderContent = () => {
    if (filteredData.length === 0) {
      return (
        <div className="mr-empty-state">
          <IconSearch size={48} className="mr-empty-icon" />
          <h3 className="mr-empty-title">No records found</h3>
          <p className="mr-empty-desc">
            Try adjusting your search or filter settings.
          </p>
        </div>
      );
    }

    return (
      <div className="mr-cards-stack">
        {filteredData.map((item) => {
          /* --- HISTORY --- */
          if (activeTab === "history") {
            return (
              <div key={item.id} className="mr-card">
                <div className="mr-card-flex">
                  <div className="mr-card-main">
                    <div className="mr-avatar">
                      {item.dr.split(" ")[1][0]}
                      {item.dr.split(" ")[2]?.[0] || ""}
                    </div>
                    <div className="mr-card-details">
                      <div className="mr-card-header-row">
                        <h4 className="mr-card-title">{item.dr}</h4>
                        <span className="mr-badge mr-badge-blue">
                          <IconVideo size={10} /> Video
                        </span>
                      </div>
                      <p className="mr-card-spec">
                        <IconStethoscope size={14} /> {item.spec}
                      </p>
                      <div className="mr-card-datetime">
                        <span className="mr-info-icon-text">
                          <IconCalendarEvent size={14} /> {item.date}
                        </span>
                        <span className="mr-info-icon-text">
                          <IconClock size={14} /> {item.time}
                        </span>
                      </div>
                      <p className="mr-card-complaint">
                        <strong>Chief Complaint:</strong> {item.complaint}
                      </p>
                      <div className="mr-card-status-row">
                        <span className="mr-badge mr-badge-outline-green">
                          <IconCheck size={10} /> {item.status}
                        </span>
                        <span className="mr-card-duration">
                          Duration: {item.dur}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mr-card-actions">
                    <button
                      className="mr-btn mr-btn-primary"
                      onClick={() => handleDIY("View Details")}
                    >
                      <IconEye size={16} /> View Details
                    </button>
                    <button
                      className="mr-btn mr-btn-outline"
                      onClick={() => handleDIY("Download")}
                    >
                      <IconDownload size={16} /> Download
                    </button>
                    <button
                      className="mr-btn mr-btn-ghost"
                      onClick={() => handleDIY("Email")}
                    >
                      <IconMail size={16} /> Email
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          /* --- PRESCRIPTIONS --- */
          if (activeTab === "prescriptions") {
            return (
              <div key={item.id} className="mr-card">
                <div className="mr-card-flex">
                  <div className="mr-card-main-col">
                    <div className="mr-card-header-row">
                      <h4 className="mr-card-title">{item.dr}</h4>
                      <span className="mr-badge mr-badge-active">Active</span>
                    </div>
                    <p className="mr-card-meta-margin">Issued on {item.date}</p>
                    <p className="mr-meds-label">Medications:</p>
                    <ul className="mr-meds-list">
                      {item.meds.map((m) => (
                        <li key={m} className="mr-med-item">
                          <IconPill size={14} /> {m}
                        </li>
                      ))}
                    </ul>
                    <p className="mr-card-meta-bottom">
                      Valid until: {item.date}
                    </p>
                  </div>
                  <div className="mr-card-actions">
                    <button
                      className="mr-btn mr-btn-primary"
                      onClick={() => handleDIY("View Details")}
                    >
                      <IconEye size={16} /> View Details
                    </button>
                    <button
                      className="mr-btn mr-btn-outline"
                      onClick={() => handleDIY("Download")}
                    >
                      <IconDownload size={16} /> Download
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          /* --- LABS --- */
          if (activeTab === "labs") {
            return (
              <div key={item.id} className="mr-card">
                <div className="mr-card-flex">
                  <div className="mr-card-main-col">
                    <div className="mr-card-header-row">
                      <h4 className="mr-card-title">{item.test}</h4>
                      <span
                        className={`mr-badge ${item.status === "Pending" ? "mr-badge-pending" : "mr-badge-active"}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mr-card-meta-margin">
                      Requested by {item.dr}
                    </p>
                    <p className="mr-info-icon-text mr-meta-spacing">
                      <IconCalendarEvent size={14} /> Request Date: {item.date}
                    </p>
                    <p className="mr-info-icon-text mr-meta-spacing">
                      <IconFlask size={14} /> {item.clinic}
                    </p>
                  </div>
                  <div className="mr-card-actions">
                    <button
                      className="mr-btn mr-btn-primary"
                      onClick={() => handleDIY("View Request")}
                    >
                      <IconEye size={16} /> View Request
                    </button>
                    {item.status === "Completed" && (
                      <button
                        className="mr-btn mr-btn-outline"
                        onClick={() => handleDIY("Download")}
                      >
                        <IconDownload size={16} /> Download Results
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          /* --- CERTS --- */
          if (activeTab === "certs") {
            return (
              <div key={item.id} className="mr-card">
                <div className="mr-card-flex">
                  <div className="mr-card-main">
                    <div className="mr-icon-box-primary">
                      <IconCertificate size={24} />
                    </div>
                    <div className="mr-card-details">
                      <h4 className="mr-card-title mr-title-spacing">
                        {item.type}
                      </h4>
                      <p className="mr-card-meta-margin">Issued by {item.dr}</p>
                      <p className="mr-info-icon-text mr-meta-spacing">
                        <IconCalendarEvent size={14} /> Issue Date: {item.date}
                      </p>
                    </div>
                  </div>
                  <div className="mr-card-actions">
                    <button
                      className="mr-btn mr-btn-primary"
                      onClick={() => handleDIY("View Certificate")}
                    >
                      <IconEye size={16} /> View Certificate
                    </button>
                    <button
                      className="mr-btn mr-btn-outline"
                      onClick={() => handleDIY("Download")}
                    >
                      <IconDownload size={16} /> Download PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          /* --- PLANS --- */
          if (activeTab === "plans") {
            return (
              <div key={item.id} className="mr-card">
                <div className="mr-card-flex">
                  <div className="mr-card-main-col">
                    <div className="mr-card-header-row">
                      <h4 className="mr-card-title">{item.condition}</h4>
                      <span className="mr-badge mr-badge-active">Active</span>
                    </div>
                    <p className="mr-card-spec mr-spec-spacing">{item.spec}</p>
                    <p className="mr-card-meta-margin">{item.dr}</p>
                    <p className="mr-info-icon-text mr-meta-spacing">
                      <IconCalendarEvent size={14} /> Start Date: {item.start}
                    </p>
                    <p className="mr-info-icon-text mr-meta-spacing">
                      <IconClock size={14} /> Next Review: {item.next}
                    </p>
                  </div>
                  <div className="mr-card-actions">
                    <button
                      className="mr-btn mr-btn-primary"
                      onClick={() => handleDIY("View Plan")}
                    >
                      <IconEye size={16} /> View Plan
                    </button>
                    <button
                      className="mr-btn mr-btn-outline"
                      onClick={() => handleDIY("Download")}
                    >
                      <IconDownload size={16} /> Download
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          /* --- REFERRALS --- */
          if (activeTab === "referrals") {
            return (
              <div key={item.id} className="mr-card">
                <div className="mr-card-flex">
                  <div className="mr-card-main-col">
                    <div className="mr-card-header-row">
                      <h4 className="mr-card-title">
                        Referral to {item.refTo}
                      </h4>
                      <span
                        className={`mr-badge ${item.status === "Booked" ? "mr-badge-active" : "mr-badge-pending"}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mr-card-meta-margin">
                      Referred by Dr. Maria Santos (General Physician)
                    </p>
                    <div className="mr-referral-grid">
                      <p className="mr-info-icon-text mr-meta-spacing">
                        <IconCalendarEvent size={14} /> Referral Date: Mar 10,
                        2026
                      </p>
                      <p className="mr-info-icon-text mr-meta-spacing">
                        <IconMapPin size={14} /> Specialist: {item.spec}
                      </p>
                      <p className="mr-info-icon-text mr-meta-spacing">
                        <IconMessageCircle size={14} /> Reason: {item.reason}
                      </p>
                    </div>
                  </div>
                  <div className="mr-card-actions-wide">
                    {item.status === "Pending" ? (
                      <>
                        <button
                          className="mr-btn mr-btn-warning"
                          onClick={() => handleDIY("Book")}
                        >
                          Book Appointment
                        </button>
                        <button
                          className="mr-btn mr-btn-outline"
                          onClick={() => handleDIY("View")}
                        >
                          <IconEye size={16} /> View Referral
                        </button>
                      </>
                    ) : (
                      <button
                        className="mr-btn mr-btn-primary mr-btn-tall"
                        onClick={() => handleDIY("View")}
                      >
                        <IconEye size={16} /> View Referral
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="mr-page-wrapper">
      {/* --- STICKY TOP SECTION --- */}
      <div className="mr-sticky-header">
        {/* Title Area */}
        <div className="mr-header-title-container">
          <h2 className="mr-page-title">Medical Records</h2>
          <p className="mr-page-subtitle">
            Access your complete healthcare history
          </p>
        </div>

        {/* Consent Banner */}
        <div className="mr-consent-banner">
          <div className="mr-banner-content">
            <div className="mr-banner-icon-bg">
              <IconShare size={24} />
            </div>
            <div className="mr-banner-text-area">
              <div className="mr-banner-title-row">
                <h4 className="mr-banner-title">
                  Medical Records Sharing & Consent
                </h4>
                <span className="mr-badge mr-badge-primary">New</span>
              </div>
              <p className="mr-banner-desc">
                Securely share your medical records with doctors during
                consultations. Full control over what you share and for how
                long.
              </p>
              <div className="mr-banner-tags-row">
                <span className="mr-tag mr-tag-green">
                  <IconShieldCheck size={12} /> Privacy Protected
                </span>
                <span className="mr-tag mr-tag-primary">
                  <IconLock size={12} /> Encrypted
                </span>
                <span className="mr-tag mr-tag-primary">
                  <IconClock size={12} /> Time-Limited Access
                </span>
              </div>
            </div>
          </div>
          <button
            className="mr-btn mr-btn-primary"
            onClick={() => (window.location.hash = "#/RecordSharing")}
          >
            <IconShare size={16} /> Manage Sharing
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="mr-tabs-container">
          <div className="mr-tabs-scroll">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`mr-custom-tab ${activeTab === tab.id ? "mr-tab-active" : ""}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
              >
                <div className="mr-tab-top">
                  <tab.icon size={20} stroke={activeTab === tab.id ? 2 : 1.5} />
                  <span
                    className={`mr-tab-count ${activeTab === tab.id ? "mr-tab-count-active" : "mr-tab-count-inactive"}`}
                  >
                    {tab.data.length}
                  </span>
                </div>
                <span className="mr-tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* STATIC SEARCH & FILTER BAR */}
        <div className="mr-controls-bar">
          <div className="mr-search-wrapper">
            <IconSearch size={16} className="mr-search-icon" />
            <input
              type="text"
              className="mr-search-input"
              placeholder={`Search ${TABS.find((t) => t.id === activeTab).label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mr-popover-container" ref={popoverRef}>
            <button
              className="mr-btn mr-btn-outline"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <IconFilter size={16} /> Filters
            </button>

            {filterOpen && (
              <div className="mr-popover-menu">
                <div className="mr-popover-title">
                  <span>Status Filter</span>
                </div>
                <div className="mr-checkbox-group">
                  <label className="mr-checkbox-label">
                    <input
                      type="checkbox"
                      className="mr-checkbox-input"
                      checked={statusFilter.includes("Completed")}
                      onChange={() => toggleStatus("Completed")}
                    />{" "}
                    Completed
                  </label>
                  <label className="mr-checkbox-label">
                    <input
                      type="checkbox"
                      className="mr-checkbox-input"
                      checked={statusFilter.includes("Pending")}
                      onChange={() => toggleStatus("Pending")}
                    />{" "}
                    Pending
                  </label>
                  <label className="mr-checkbox-label">
                    <input
                      type="checkbox"
                      className="mr-checkbox-input"
                      checked={statusFilter.includes("Active")}
                      onChange={() => toggleStatus("Active")}
                    />{" "}
                    Active
                  </label>
                  <label className="mr-checkbox-label">
                    <input
                      type="checkbox"
                      className="mr-checkbox-input"
                      checked={statusFilter.includes("Booked")}
                      onChange={() => toggleStatus("Booked")}
                    />{" "}
                    Booked
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT SECTION --- */}
      <div className="mr-scrollable-content">{renderContent()}</div>
    </div>
  );
}
