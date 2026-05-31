import { useState, useMemo, useEffect, useRef } from "react";
import {
  IconFileDescription,
  IconPill,
  IconFlask,
  IconCertificate,
  IconMessageCircle,
  IconShare,
  IconShieldCheck,
  IconLock,
  IconClock,
  IconSearch,
  IconFilter,
  IconVideo,
  IconCalendarEvent,
  IconStethoscope,
  IconCheck,
  IconPhone,
  IconEye,
  IconCircleCheck,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";
import "../css/Patient_MedicalRecords.css";
import { fetchPatientMedicalHistory } from "../../api/apiClient";
import { ICD11_CHAPTERS, parseICDCode } from "../../Specialists/utils/icdData";

// Strict override for the requested Blue Color
const CORE_BLUE = "#228be6";
const LIGHT_BLUE = "#e7f5ff";

const toConsultationTypeLabel = (channel) => {
  const normalized = String(channel || "")
    .trim()
    .toLowerCase();
  if (!normalized) return "Chat";
  if (normalized.includes("video")) return "Video";
  if (normalized.includes("physical") || normalized.includes("clinic"))
    return "Physical";
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
  if (label === "Physical") return { label, Icon: IconStethoscope };
  return { label, Icon: IconMessageCircle };
};

const formatTicketStatus = (status) => {
  if (!status) return "Unknown";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const deriveDiagnosisReason = (h) => {
  const certs = h.medicalCertificates || [];
  const reasons = certs
    .map((c) => String(c?.diagnosisReason || "").trim())
    .filter(Boolean);

  if (reasons.length > 0) return reasons.join("\n");

  const code = String(h.icd10Code || "").trim();
  let label = "";

  if (code) {
    const parsed = parseICDCode(code);
    const chapter = parsed.chapter ? ICD11_CHAPTERS[parsed.chapter] : null;
    const block = chapter?.blocks?.[parsed.block] || null;
    const category = block?.categories?.[parsed.category] || null;
    const subcategory = category?.subcategories?.[parsed.subcategory] || null;

    const data = subcategory || category || block || chapter;
    if (data) {
      label = `${data.code} - ${data.label}`;
    } else {
      label = code;
    }
  }

  return label || "—";
};

const nurseInitials = (name) => {
  if (!name) return "N";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "N";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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
];

export default function Patient_MedicalRecords() {
  const [activeTab, setActiveTab] = useState("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // Advanced Filters
  const [statusFilter, setStatusFilter] = useState([
    "Completed",
    "Pending",
    "Active",
    "Booked",
    "Issued",
  ]);
  const [channelFilter, setChannelFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");

  const [backendHistory, setBackendHistory] = useState([]);
  const [backendPrescriptions, setBackendPrescriptions] = useState([]);
  const [backendLabs, setBackendLabs] = useState([]);
  const [backendCerts, setBackendCerts] = useState([]);

  // Modal State
  const [consultationDetail, setConsultationDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const popoverRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchPatientMedicalHistory();
        if (response) {
          // 1. Map Consultation History
          const rawHistory = response.history || [];
          const sortedHistory = [...rawHistory].sort((a, b) => {
            const ta = a.visitDate
              ? new Date(a.visitDate).getTime()
              : a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;
            const tb = b.visitDate
              ? new Date(b.visitDate).getTime()
              : b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;
            return tb - ta;
          });

          const history = sortedHistory.map((h, i) => ({
            id: `h-${h.ticketNumber || i}-${i}`,
            dr: `Dr. ${h.specialistName || "Unassigned"}`.replace(
              /^Dr\.\s*Dr\./i,
              "Dr.",
            ),
            spec: h.specialistTitle || "General Practice",
            date: h.visitDate
              ? new Date(h.visitDate).toLocaleDateString()
              : h.preferredDate
                ? new Date(h.preferredDate).toLocaleDateString()
                : "N/A",
            time: h.preferredTime || "N/A",
            complaint: h.chiefComplaint || "N/A",
            dur: "N/A",
            status: formatTicketStatus(h.status),
            channel: h.consultationType || h.consultationChannel,
            visitDateRaw: h.visitDate
              ? new Date(h.visitDate).getTime()
              : h.preferredDate
                ? new Date(h.preferredDate).getTime()
                : 0,
            detail: {
              ticketNumber: h.ticketNumber || "—",
              date: h.visitDate
                ? new Date(h.visitDate).toLocaleDateString()
                : h.preferredDate
                  ? new Date(h.preferredDate).toLocaleDateString()
                  : "N/A",
              consultationTypeLabel: toConsultationTypeLabel(
                h.consultationType || h.consultationChannel,
              ),
              specialistName: h.specialistName || "Unassigned",
              specialistTitle: h.specialistTitle || "General Practice",
              nurseName: h.nurseName,
              chiefComplaint: h.chiefComplaint || "—",
              status: formatTicketStatus(h.status),
              assessment: (h.assessment || "").trim() || "—",
              diagnosis: deriveDiagnosisReason(h),
              treatmentPlan: (h.plan || "").trim() || "—",
            },
          }));
          setBackendHistory(history);

          // SAFE DATA EXTRACTION: This handles data whether the backend dev nested it OR sent it at the top level
          const extractRecords = (rootKey, nestedKey) => {
            if (
              response[rootKey] &&
              Array.isArray(response[rootKey]) &&
              response[rootKey].length > 0
            ) {
              return response[rootKey].map((item) => ({
                ...item,
                _parentTicket: {},
              }));
            }
            return sortedHistory.flatMap((h) => {
              const arr = h[nestedKey] || [];
              return arr.map((item) => ({ ...item, _parentTicket: h }));
            });
          };

          const rawPrescriptions = extractRecords(
            "prescriptions",
            "prescriptions",
          );
          const rawLabs = extractRecords("labRequests", "labRequests");
          const rawCerts = extractRecords(
            "medicalCertificates",
            "medicalCertificates",
          );

          // 2. Map Prescriptions
          const prescriptions = rawPrescriptions.map((p, idx) => {
            const parent = p._parentTicket || {};
            return {
              id: p.id || `p-${idx}`,
              docId: p.id,
              docType: "prescription",
              dr: `Dr. ${parent.specialistName || "Specialist"}`,
              date: parent.visitDate
                ? new Date(parent.visitDate).toLocaleDateString()
                : p.createdAt
                  ? new Date(p.createdAt).toLocaleDateString()
                  : "N/A",
              visitDateRaw: parent.visitDate
                ? new Date(parent.visitDate).getTime()
                : p.createdAt
                  ? new Date(p.createdAt).getTime()
                  : 0,
              meds: [
                `${p.generic || ""} ${p.brand ? `(${p.brand})` : ""} - ${p.dosage || ""}`,
              ],
              status: p.status ? formatTicketStatus(p.status) : "Active",
            };
          });
          setBackendPrescriptions(prescriptions);

          // 3. Map Lab Requests
          const labs = rawLabs.map((l, idx) => {
            const parent = l._parentTicket || {};
            return {
              id: l.id || `l-${idx}`,
              docId: l.id,
              docType: "lab",
              dr: `Dr. ${parent.specialistName || "Specialist"}`,
              date: parent.visitDate
                ? new Date(parent.visitDate).toLocaleDateString()
                : l.createdAt
                  ? new Date(l.createdAt).toLocaleDateString()
                  : "N/A",
              visitDateRaw: parent.visitDate
                ? new Date(parent.visitDate).getTime()
                : l.createdAt
                  ? new Date(l.createdAt).getTime()
                  : 0,
              test: l.test || "Lab Test",
              clinic: l.customTestName || "Standard Clinic",
              status: l.status ? formatTicketStatus(l.status) : "Completed",
            };
          });
          setBackendLabs(labs);

          // 4. Map Certs
          const certs = rawCerts.map((c, idx) => {
            const parent = c._parentTicket || {};
            return {
              id: c.id || `c-${idx}`,
              docId: c.id,
              docType: "certificate",
              dr: `Dr. ${parent.specialistName || "Specialist"}`,
              date: c.dateIssued
                ? new Date(c.dateIssued).toLocaleDateString()
                : parent.visitDate
                  ? new Date(parent.visitDate).toLocaleDateString()
                  : "N/A",
              visitDateRaw: c.dateIssued
                ? new Date(c.dateIssued).getTime()
                : parent.visitDate
                  ? new Date(parent.visitDate).getTime()
                  : 0,
              type: c.diagnosisReason || "Medical Certificate",
              status: c.status ? formatTicketStatus(c.status) : "Issued",
            };
          });
          setBackendCerts(certs);
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
  });

  const currentTabData = tabs.find((t) => t.id === activeTab)?.data || [];

  const filteredData = useMemo(() => {
    let filtered = currentTabData.filter((item) => {
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

      const matchesStatus =
        activeTab === "history" ? true : statusFilter.includes(item.status);

      let matchesChannel = true;
      if (activeTab === "history" && channelFilter !== "All") {
        matchesChannel =
          toConsultationTypeLabel(item.channel) === channelFilter;
      }

      return matchesSearch && matchesStatus && matchesChannel;
    });

    filtered.sort((a, b) => {
      if (sortOrder === "Newest") return b.visitDateRaw - a.visitDateRaw;
      return a.visitDateRaw - b.visitDateRaw;
    });

    return filtered;
  }, [
    currentTabData,
    searchQuery,
    statusFilter,
    channelFilter,
    sortOrder,
    activeTab,
  ]);

  const handleOpenDocument = (docType, docId) => {
    // Uses the browser's native PDF pop-up in a new tab
    if (docType && docId) {
      window.open(`/api/v1/documents/${docType}/${docId}`, "_blank");
    } else {
      alert("Document not available.");
    }
  };

  const renderContent = () => {
    if (filteredData.length === 0) {
      return (
        <div className="mr-empty-state">
          <IconSearch
            size={48}
            className="mr-empty-icon"
            style={{ color: CORE_BLUE }}
          />
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
                    <div
                      className="mr-avatar"
                      style={{ backgroundColor: CORE_BLUE }}
                    >
                      {doctorInitials(item.dr)}
                    </div>
                    <div className="mr-card-details">
                      <div className="mr-card-header-row">
                        <h4 className="mr-card-title">{item.dr}</h4>
                        <span
                          className="mr-badge"
                          style={{
                            backgroundColor: LIGHT_BLUE,
                            color: CORE_BLUE,
                            border: `1px solid ${CORE_BLUE}`,
                          }}
                        >
                          <TypeIcon size={10} /> {typeLabel}
                        </span>
                      </div>
                      <p className="mr-card-spec">
                        <IconStethoscope
                          size={14}
                          style={{ color: CORE_BLUE }}
                        />{" "}
                        {item.spec}
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
                      </div>
                    </div>
                  </div>
                  <div className="mr-card-actions">
                    <button
                      type="button"
                      className="mr-btn"
                      style={{
                        backgroundColor: CORE_BLUE,
                        color: "white",
                        border: "none",
                      }}
                      onClick={() => {
                        setConsultationDetail(item.detail);
                        setIsModalOpen(true);
                      }}
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
                      <span
                        className="mr-badge"
                        style={{
                          backgroundColor: LIGHT_BLUE,
                          color: CORE_BLUE,
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mr-card-meta-margin">Issued on {item.date}</p>
                    <p className="mr-meds-label">Medications:</p>
                    <ul className="mr-meds-list">
                      {item.meds.map((m) => (
                        <li key={m} className="mr-med-item">
                          <IconPill size={14} style={{ color: CORE_BLUE }} />{" "}
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mr-card-actions">
                    <button
                      type="button"
                      className="mr-btn"
                      style={{
                        backgroundColor: CORE_BLUE,
                        color: "white",
                        border: "none",
                      }}
                      onClick={() =>
                        handleOpenDocument(item.docType, item.docId)
                      }
                    >
                      <IconFileDescription size={16} /> View Document
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
                        className="mr-badge"
                        style={
                          item.status !== "Pending"
                            ? { backgroundColor: LIGHT_BLUE, color: CORE_BLUE }
                            : { backgroundColor: "#fff3cd", color: "#f08c00" }
                        }
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
                      <IconFlask size={14} style={{ color: CORE_BLUE }} />{" "}
                      {item.clinic}
                    </p>
                  </div>
                  <div className="mr-card-actions">
                    <button
                      type="button"
                      className="mr-btn"
                      style={{
                        backgroundColor: CORE_BLUE,
                        color: "white",
                        border: "none",
                      }}
                      onClick={() =>
                        handleOpenDocument(item.docType, item.docId)
                      }
                    >
                      <IconFileDescription size={16} /> View Document
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
                    <div
                      className="mr-icon-box-primary"
                      style={{ backgroundColor: LIGHT_BLUE, color: CORE_BLUE }}
                    >
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
                      type="button"
                      className="mr-btn"
                      style={{
                        backgroundColor: CORE_BLUE,
                        color: "white",
                        border: "none",
                      }}
                      onClick={() =>
                        handleOpenDocument(item.docType, item.docId)
                      }
                    >
                      <IconFileDescription size={16} /> View Document
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
            <div
              className="mr-banner-icon-bg"
              style={{ backgroundColor: LIGHT_BLUE, color: CORE_BLUE }}
            >
              <IconShare size={24} />
            </div>
            <div className="mr-banner-text-area">
              <div className="mr-banner-title-row">
                <h4 className="mr-banner-title">
                  Medical Records Sharing & Consent
                </h4>
                <span
                  className="mr-badge"
                  style={{ backgroundColor: CORE_BLUE, color: "white" }}
                >
                  New
                </span>
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
                <span
                  className="mr-tag"
                  style={{ backgroundColor: LIGHT_BLUE, color: CORE_BLUE }}
                >
                  <IconLock size={12} /> Encrypted
                </span>
                <span
                  className="mr-tag"
                  style={{ backgroundColor: LIGHT_BLUE, color: CORE_BLUE }}
                >
                  <IconClock size={12} /> Time-Limited Access
                </span>
              </div>
            </div>
          </div>
          <button
            className="mr-btn"
            style={{
              backgroundColor: CORE_BLUE,
              color: "white",
              border: "none",
            }}
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
                style={
                  activeTab === tab.id
                    ? { borderBottomColor: CORE_BLUE, color: CORE_BLUE }
                    : {}
                }
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
              >
                <div className="mr-tab-top">
                  <tab.icon size={20} stroke={activeTab === tab.id ? 2 : 1.5} />
                  <span
                    className="mr-tab-count"
                    style={
                      activeTab === tab.id
                        ? { backgroundColor: CORE_BLUE, color: "white" }
                        : { backgroundColor: "#f1f3f5", color: "#868e96" }
                    }
                  >
                    {tab.data.length}
                  </span>
                </div>
                <span className="mr-tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
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
              type="button"
              className="mr-btn mr-btn-outline"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <IconFilter size={16} /> Filters & Sorting
            </button>

            {filterOpen && (
              <div className="mr-popover-menu" style={{ width: "250px" }}>
                <div className="mr-popover-title">
                  <span>Sort By</span>
                </div>
                <div
                  className="mr-checkbox-group"
                  style={{ marginBottom: "16px" }}
                >
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    <option value="Newest">Newest First</option>
                    <option value="Oldest">Oldest First</option>
                  </select>
                </div>

                {activeTab === "history" && (
                  <>
                    <div className="mr-popover-title">
                      <span>Channel Filter</span>
                    </div>
                    <div
                      className="mr-checkbox-group"
                      style={{ marginBottom: "16px" }}
                    >
                      <select
                        value={channelFilter}
                        onChange={(e) => setChannelFilter(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid #dee2e6",
                        }}
                      >
                        <option value="All">All Channels</option>
                        <option value="Video">Video</option>
                        <option value="Voice">Voice</option>
                        <option value="Physical">Physical</option>
                        <option value="Chat">Chat</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab !== "history" && (
                  <>
                    <div className="mr-popover-title">
                      <span>Status Filter</span>
                    </div>
                    <div className="mr-checkbox-group">
                      {[
                        "Completed",
                        "Pending",
                        "Active",
                        "Booked",
                        "Issued",
                      ].map((status) => (
                        <label key={status} className="mr-checkbox-label">
                          <input
                            type="checkbox"
                            className="mr-checkbox-input"
                            checked={statusFilter.includes(status)}
                            onChange={() => toggleStatus(status)}
                          />{" "}
                          {status}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mr-scrollable-content">{renderContent()}</div>

      {/* --- CONSULTATION DETAIL OVERLAY MODAL --- */}
      {isModalOpen &&
        consultationDetail &&
        (() => {
          const d = consultationDetail;
          const { Icon: TypeIcon } = consultationChannelBadge(
            d.consultationTypeLabel,
          );

          return (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  width: "100%",
                  maxWidth: "800px",
                  maxHeight: "90vh",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Modal Header */}
                <div
                  style={{
                    padding: "20px 24px",
                    backgroundColor: CORE_BLUE,
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: 600,
                    }}
                  >
                    <TypeIcon size={20} /> Consultation Details
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    <IconX size={24} />
                  </button>
                </div>

                {/* Modal Scrollable Body */}
                <div
                  style={{
                    padding: "24px",
                    overflowY: "auto",
                    flex: 1,
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      padding: "20px",
                      marginBottom: "20px",
                      border: "1px solid #e9ecef",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", gap: "16px" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          backgroundColor: CORE_BLUE,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        {doctorInitials(d.specialistName)}
                      </div>
                      <div>
                        <h2
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "18px",
                            color: "#343a40",
                          }}
                        >
                          Dr. {d.specialistName}
                        </h2>
                        <p
                          style={{
                            margin: 0,
                            color: "#868e96",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <IconStethoscope
                            size={14}
                            style={{ color: CORE_BLUE }}
                          />{" "}
                          {d.specialistTitle}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#343a40",
                          marginBottom: "4px",
                        }}
                      >
                        <IconCalendarEvent
                          size={14}
                          style={{
                            display: "inline",
                            verticalAlign: "text-bottom",
                            color: CORE_BLUE,
                          }}
                        />{" "}
                        {d.date}
                      </div>
                      <div style={{ fontSize: "14px", color: "#868e96" }}>
                        {d.time}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      padding: "20px",
                      marginBottom: "20px",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <h5
                      style={{
                        margin: "0 0 8px 0",
                        color: CORE_BLUE,
                        fontSize: "13px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: 700,
                      }}
                    >
                      Chief Complaint
                    </h5>
                    <p style={{ margin: 0, color: "#343a40", lineHeight: 1.5 }}>
                      {d.chiefComplaint}
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #e9ecef",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #e9ecef",
                        backgroundColor: "#f8f9fa",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <IconFileDescription
                        size={18}
                        style={{ color: CORE_BLUE }}
                      />
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          color: "#343a40",
                        }}
                      >
                        Clinical Notes
                      </h4>
                    </div>
                    <div style={{ padding: "20px" }}>
                      <div style={{ marginBottom: "24px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color: "#868e96",
                            fontSize: "14px",
                            fontWeight: 600,
                            marginBottom: "8px",
                          }}
                        >
                          <IconAlertCircle size={16} /> Assessment
                        </div>
                        <p
                          style={{
                            margin: 0,
                            color: "#343a40",
                            lineHeight: 1.5,
                          }}
                        >
                          {d.assessment}
                        </p>
                      </div>

                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color: "#868e96",
                            fontSize: "14px",
                            fontWeight: 600,
                            marginBottom: "8px",
                          }}
                        >
                          <IconCircleCheck
                            size={16}
                            style={{ color: "#40c057" }}
                          />{" "}
                          Diagnosis
                        </div>
                        <p
                          style={{
                            margin: 0,
                            color: "#343a40",
                            fontWeight: 500,
                          }}
                        >
                          {d.diagnosis}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
