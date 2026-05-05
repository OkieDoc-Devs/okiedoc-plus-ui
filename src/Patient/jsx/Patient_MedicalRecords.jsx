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
import { fetchPatientMedicalRecords } from "../services/apiService";

const TABS = (backendData) => [
  {
    id: "history",
    label: "Consultation History",
    icon: IconFileDescription,
    data: backendData.history,
  },
  {
    id: "prescriptions",
    label: "Prescriptions",
    icon: IconPill,
    data: backendData.prescriptions,
  },
  {
    id: "labs",
    label: "Lab Requests",
    icon: IconFlask,
    data: backendData.labs,
  },
  {
    id: "certs",
    label: "Medical Certificates",
    icon: IconCertificate,
    data: backendData.certs,
  },
  {
    id: "plans",
    label: "Treatment Plans",
    icon: IconClipboardHeart,
    data: backendData.plans,
  },
  { id: "referrals", label: "Referrals", icon: IconMessageCircle, data: [] }, // Ready for future expansion
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

  // Clean Data States
  const [isLoading, setIsLoading] = useState(true);
  const [recordData, setRecordData] = useState({
    history: [],
    prescriptions: [],
    labs: [],
    certs: [],
    plans: [],
  });

  const popoverRef = useRef(null);
  const handleDIY = (action) => alert(`Interactive Feature: ${action}`);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Fetching real data from your database!
        const response = await fetchPatientMedicalRecords();

        setRecordData({
          history: (response.history || []).map((h) => ({
            id: `h-${h.id}`,
            dr: `Dr. ${h.specialist?.lastName || "Specialist"}`,
            spec: h.targetSpecialty || "General Medicine",
            date: h.preferredDate
              ? new Date(h.preferredDate).toLocaleDateString()
              : "N/A",
            time: h.preferredTime || "N/A",
            complaint: h.chiefComplaint || "N/A",
            dur:
              `${h.durationValue || ""} ${h.durationUnit || ""}`.trim() ||
              "N/A",
            status: h.status === "completed" ? "Completed" : "Pending",
          })),
          prescriptions: (response.prescriptions || []).map((p) => ({
            id: `p-${p.id}`,
            dr: `Dr. ${p.specialist?.lastName || "Specialist"}`,
            date: p.createdAt
              ? new Date(p.createdAt).toLocaleDateString()
              : "N/A",
            meds: [
              `${p.generic || ""} ${p.brand ? `(${p.brand})` : ""} - ${p.dosage || ""}`,
            ],
            status: p.status
              ? p.status.charAt(0).toUpperCase() + p.status.slice(1)
              : "Active",
          })),
          labs: (response.labs || []).map((l) => ({
            id: `l-${l.id}`,
            dr: `Dr. ${l.specialist?.lastName || "Specialist"}`,
            date: l.createdAt
              ? new Date(l.createdAt).toLocaleDateString()
              : "N/A",
            test: l.test || "Lab Test",
            clinic: l.customTestName || "Open Clinic",
            status: l.status
              ? l.status.charAt(0).toUpperCase() + l.status.slice(1)
              : "Pending",
          })),
          certs: (response.certs || []).map((c) => ({
            id: `c-${c.id}`,
            dr: `Dr. ${c.specialist?.lastName || "Specialist"}`,
            date: c.createdAt
              ? new Date(c.createdAt).toLocaleDateString()
              : "N/A",
            type: c.diagnosisReason || "Medical Certificate",
            status: "Completed",
          })),
          plans: (response.plans || []).map((tp) => ({
            id: `tp-${tp.id}`,
            dr: `Dr. ${tp.specialist?.lastName || "Specialist"}`,
            start: tp.createdAt
              ? new Date(tp.createdAt).toLocaleDateString()
              : "N/A",
            next: "Follow up as needed",
            condition: "Treatment Plan",
            spec: "General Medicine",
            status: tp.status
              ? tp.status.charAt(0).toUpperCase() + tp.status.slice(1)
              : "Active",
          })),
        });
      } catch (err) {
        console.error("Failed to load medical history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

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

  const tabs = TABS(recordData);
  const currentTabData = tabs.find((t) => t.id === activeTab)?.data || [];

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
    if (isLoading) {
      return (
        <div className="mr-empty-state">
          <IconClock
            size={48}
            className="mr-empty-icon"
            style={{ animation: "spin 2s linear infinite" }}
          />
          <h3 className="mr-empty-title">Loading Records</h3>
          <p className="mr-empty-desc">
            Securely retrieving your medical history...
          </p>
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="mr-empty-state">
          <IconSearch size={48} className="mr-empty-icon" />
          <h3 className="mr-empty-title">No records found</h3>
          <p className="mr-empty-desc">
            You have no{" "}
            {tabs.find((t) => t.id === activeTab).label.toLowerCase()} matching
            this criteria.
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
                      {item.dr.replace("Dr. ", "")[0]}
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
                        <span
                          className={`mr-badge ${item.status === "Completed" ? "mr-badge-outline-green" : "mr-badge-pending"}`}
                        >
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
                      <span className="mr-badge mr-badge-active">
                        {item.status}
                      </span>
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
                      <span className="mr-badge mr-badge-active">
                        {item.status}
                      </span>
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
      <div className="mr-sticky-header">
        <div className="mr-header-title-container">
          <h2 className="mr-page-title">Medical Records</h2>
          <p className="mr-page-subtitle">
            Access your complete healthcare history
          </p>
        </div>

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

        <div className="mr-tabs-container">
          <div className="mr-tabs-scroll">
            {tabs.map((tab) => (
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
                    {isLoading ? "-" : tab.data.length}
                  </span>
                </div>
                <span className="mr-tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mr-controls-bar">
          <div className="mr-search-wrapper">
            <IconSearch size={16} className="mr-search-icon" />
            <input
              type="text"
              className="mr-search-input"
              placeholder={`Search ${tabs.find((t) => t.id === activeTab).label.toLowerCase()}...`}
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
                  {["Completed", "Pending", "Active", "Booked"].map(
                    (status) => (
                      <label key={status} className="mr-checkbox-label">
                        <input
                          type="checkbox"
                          className="mr-checkbox-input"
                          checked={statusFilter.includes(status)}
                          onChange={() => toggleStatus(status)}
                        />{" "}
                        {status}
                      </label>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mr-scrollable-content">{renderContent()}</div>

      {/* Required for the spinning icon animation */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
