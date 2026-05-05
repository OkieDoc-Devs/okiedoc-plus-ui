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
  IconEye,
  IconCalendarEvent,
  IconStethoscope,
  IconCheck,
  IconPhone,
  IconClipboardList,
  IconActivity,
} from "@tabler/icons-react";
import "../css/Patient_MedicalRecords.css";
import { fetchPatientMedicalHistory } from "../../api/apiClient";

const toConsultationTypeLabel = (channel) => {
  const normalized = String(channel || "")
    .trim()
    .toLowerCase();
  if (!normalized) return "Chat";
  if (normalized.includes("video")) return "Video";
  if (
    normalized.includes("call") ||
    normalized.includes("audio") ||
    normalized.includes("voice")
  ) {
    return "Voice";
  }
  return "Chat";
};

const consultationChannelBadge = (channel) => {
  const label = toConsultationTypeLabel(channel);
  if (label === "Video") return { label, Icon: IconVideo };
  if (label === "Voice") return { label, Icon: IconPhone };
  return { label, Icon: IconMessageCircle };
};

const formatTicketStatus = (status) => {
  if (!status) return "Unknown";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/** Diagnosis / reason as entered on the Medical Certificate (issued certs from API). */
const deriveDiagnosisReason = (h) => {
  const certs = h.medicalCertificates || [];
  const reasons = certs
    .map((c) => String(c?.diagnosisReason || "").trim())
    .filter(Boolean);
  if (reasons.length > 0) return reasons.join("\n");
  const code = String(h.icd10Code || "").trim();
  return code || "—";
};

const doctorInitials = (drLabel) => {
  const stripped = String(drLabel || "")
    .replace(/^Dr\.?\s*/i, "")
    .trim();
  const parts = stripped.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

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
  const [backendHistory, setBackendHistory] = useState([]);
  const [backendPrescriptions, setBackendPrescriptions] = useState([]);
  const [backendLabs, setBackendLabs] = useState([]);
  const [backendCerts, setBackendCerts] = useState([]);
  const [backendPlans, setBackendPlans] = useState([]);
  const [consultationDetail, setConsultationDetail] = useState(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    setConsultationDetail(null);
  }, [activeTab]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchPatientMedicalHistory();
        if (response && response.history) {
          const sorted = [...response.history].sort((a, b) => {
            const ta = a.visitDate ? new Date(a.visitDate).getTime() : 0;
            const tb = b.visitDate ? new Date(b.visitDate).getTime() : 0;
            return tb - ta;
          });

          const history = sorted.map((h, i) => ({
            id: `h-${h.ticketNumber || i}-${i}`,
            dr: `Dr. ${h.specialistName || "Unassigned"}`.replace(
              /^Dr\.\s*Dr\./i,
              "Dr.",
            ),
            spec: h.specialistTitle || "Specialist",
            date: h.visitDate
              ? new Date(h.visitDate).toLocaleDateString()
              : "N/A",
            time: h.preferredTime || "N/A",
            complaint: h.chiefComplaint || "N/A",
            dur: "N/A",
            status: formatTicketStatus(h.status),
            channel: h.consultationType,
            detail: {
              ticketNumber: h.ticketNumber || "—",
              date: h.visitDate
                ? new Date(h.visitDate).toLocaleDateString()
                : "N/A",
              consultationTypeLabel: toConsultationTypeLabel(
                h.consultationType,
              ),
              specialistName: h.specialistName || "Unassigned",
              specialistTitle: h.specialistTitle || "Specialist",
              chiefComplaint: h.chiefComplaint || "—",
              status: formatTicketStatus(h.status),
              assessment: (h.assessment || "").trim() || "—",
              diagnosis: deriveDiagnosisReason(h),
              treatmentPlan: (h.plan || "").trim() || "—",
              prescriptions: h.prescriptions || [],
              labRequests: h.labRequests || [],
            },
          }));
          setBackendHistory(history);

          const prescriptions = sorted.flatMap((h) =>
            (h.prescriptions || []).map((p, idx) => ({
              id: `p-${h.ticketNumber}-${idx}`,
              dr: `Dr. ${h.specialistName}`,
              date: h.visitDate ? new Date(h.visitDate).toLocaleDateString() : "N/A",
              meds: [`${p.generic} ${p.brand ? `(${p.brand})` : ""} - ${p.dosage}`],
              status: "Active",
            })),
          );
          setBackendPrescriptions(prescriptions);

          const labs = sorted.flatMap((h) =>
            (h.labRequests || []).map((l, idx) => ({
              id: `l-${h.ticketNumber}-${idx}`,
              dr: `Dr. ${h.specialistName}`,
              date: h.visitDate ? new Date(h.visitDate).toLocaleDateString() : "N/A",
              test: l.test,
              clinic: l.customTestName || "N/A",
              status: "Completed",
            })),
          );
          setBackendLabs(labs);

          const certs = sorted.flatMap((h) =>
            (h.medicalCertificates || []).map((c, idx) => ({
              id: `c-${h.ticketNumber}-${idx}`,
              dr: `Dr. ${h.specialistName}`,
              date: h.visitDate ? new Date(h.visitDate).toLocaleDateString() : "N/A",
              type: c.diagnosisReason,
              status: "Completed",
            })),
          );
          setBackendCerts(certs);

          const plans = sorted.flatMap((h) =>
            (h.treatmentPlans || []).map((tp, idx) => ({
              id: `tp-${h.ticketNumber}-${idx}`,
              dr: `Dr. ${h.specialistName}`,
              start: h.visitDate ? new Date(h.visitDate).toLocaleDateString() : "N/A",
              next: "TBD",
              condition: tp.plan,
              spec: h.specialistTitle || "Specialist",
              status: "Active",
            })),
          );
          setBackendPlans(plans);
        }
      } catch (err) {
        console.error("Failed to load backend medical history:", err);
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

  const tabs = TABS({
    history: backendHistory,
    prescriptions: backendPrescriptions,
    labs: backendLabs,
    certs: backendCerts,
    plans: backendPlans,
  });

  const currentTabData = tabs.find((t) => t.id === activeTab)?.data || [];

  const filteredData = useMemo(() => {
    return currentTabData.filter((item) => {
      const matchesSearch = Object.entries(item).some(([key, val]) => {
        if (key === "detail") return false;
        if (typeof val === "string")
          return val.toLowerCase().includes(searchQuery.toLowerCase());
        if (Array.isArray(val))
          return val.some(
            (v) =>
              typeof v === "string" &&
              v.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        return false;
      });
      if (activeTab === "history") {
        return matchesSearch;
      }
      const matchesStatus = statusFilter.includes(item.status);
      return matchesSearch && matchesStatus;
    });
  }, [currentTabData, searchQuery, statusFilter, activeTab]);

  const renderContent = () => {
    if (activeTab === "history" && consultationDetail) {
      const d = consultationDetail;
      return (
        <div className="mr-consultation-detail">
          <div className="mr-consultation-detail-head">
            <div>
              <h3 className="mr-consultation-detail-title">
                Consultation details
              </h3>
              <p className="mr-consultation-detail-meta">
                {d.ticketNumber} · {d.consultationTypeLabel}
              </p>
            </div>
            <button
              type="button"
              className="mr-btn mr-btn-outline mr-consultation-back"
              onClick={() => setConsultationDetail(null)}
            >
              Back to list
            </button>
          </div>

          <div className="mr-consultation-detail-grid">
            <div>
              <span className="mr-detail-kicker">Date</span>
              <p className="mr-detail-value">{d.date}</p>
            </div>
            <div>
              <span className="mr-detail-kicker">Specialist</span>
              <p className="mr-detail-value">Dr. {d.specialistName}</p>
            </div>
            <div>
              <span className="mr-detail-kicker">Status</span>
              <p className="mr-detail-value">{d.status}</p>
            </div>
            <div>
              <span className="mr-detail-kicker">Chief complaint</span>
              <p className="mr-detail-value">{d.chiefComplaint}</p>
            </div>
          </div>

          <div className="mr-detail-blocks">
            <div className="mr-detail-block mr-detail-block-assessment">
              <div className="mr-detail-block-heading">
                <IconStethoscope size={14} aria-hidden />
                Assessment
              </div>
              <p className="mr-detail-block-body">{d.assessment}</p>
            </div>
            <div className="mr-detail-block mr-detail-block-diagnosis">
              <div className="mr-detail-block-heading">
                <IconActivity size={14} aria-hidden />
                Diagnosis
              </div>
              <p className="mr-detail-block-body">{d.diagnosis}</p>
            </div>
            <div className="mr-detail-block mr-detail-block-plan">
              <div className="mr-detail-block-heading">
                <IconClipboardList size={14} aria-hidden />
                Treatment plan
              </div>
              <p className="mr-detail-block-body">{d.treatmentPlan}</p>
            </div>

            {d.prescriptions?.length > 0 && (
              <div className="mr-detail-block mr-detail-block-rx">
                <div className="mr-detail-block-heading">
                  <IconPill size={14} aria-hidden />
                  Prescriptions
                </div>
                <ul className="mr-detail-list">
                  {d.prescriptions.map((p, idx) => (
                    <li key={idx}>
                      <span className="mr-detail-list-strong">
                        {p.generic} {p.brand ? `(${p.brand})` : ""}
                      </span>
                      {" — "}
                      {p.dosage}
                      {p.form ? `, ${p.form}` : ""}
                      {p.quantity != null ? `, ${p.quantity} units` : ""}
                      {p.instructions ? ` (${p.instructions})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {d.labRequests?.length > 0 && (
              <div className="mr-detail-block mr-detail-block-labs">
                <div className="mr-detail-block-heading">
                  <IconFlask size={14} aria-hidden />
                  Laboratory requests
                </div>
                <ul className="mr-detail-list">
                  {d.labRequests.map((l, idx) => (
                    <li key={idx}>
                      <span className="mr-detail-list-strong">{l.test}</span>
                      {l.customTestName ? ` (${l.customTestName})` : ""}
                      {l.remarks ? ` — ${l.remarks}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }

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
            const { label: typeLabel, Icon: TypeIcon } =
              consultationChannelBadge(item.channel);
            return (
              <div key={item.id} className="mr-card">
                <div className="mr-card-flex">
                  <div className="mr-card-main">
                    <div className="mr-avatar">{doctorInitials(item.dr)}</div>
                    <div className="mr-card-details">
                      <div className="mr-card-header-row">
                        <h4 className="mr-card-title">{item.dr}</h4>
                        <span className="mr-badge mr-badge-blue">
                          <TypeIcon size={10} /> {typeLabel}
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
                      type="button"
                      className="mr-btn mr-btn-primary"
                      onClick={() => setConsultationDetail(item.detail)}
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
                    <button type="button" className="mr-btn mr-btn-primary">
                      <IconEye size={16} /> View Details
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
                    <button type="button" className="mr-btn mr-btn-primary">
                      <IconEye size={16} /> View Details
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
                    <button type="button" className="mr-btn mr-btn-primary">
                      <IconEye size={16} /> View Details
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
                    <button type="button" className="mr-btn mr-btn-primary">
                      <IconEye size={16} /> View Details
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
                    {tab.data.length}
                  </span>
                </div>
                <span className="mr-tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* STATIC SEARCH & FILTER BAR */}
        <div
          className={`mr-controls-bar ${activeTab === "history" && consultationDetail ? "mr-controls-bar-hidden" : ""}`}
        >
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

          {activeTab !== "history" && (
            <div className="mr-popover-container" ref={popoverRef}>
              <button
                type="button"
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
          )}
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT SECTION --- */}
      <div className="mr-scrollable-content">{renderContent()}</div>
    </div>
  );
}
