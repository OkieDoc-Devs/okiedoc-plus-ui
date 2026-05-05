import React, { useState, useEffect, useRef } from "react";
import {
  IconSearch,
  IconFilter,
  IconCalendarEvent,
  IconClock,
  IconVideo,
  IconMessageCircle,
  IconPhone,
  IconStethoscope,
  IconLoader2,
  IconCalendarOff,
  IconMapPin,
  IconX,
  IconUser,
  IconActivity,
  IconAlertCircle,
} from "@tabler/icons-react";
import { fetchPatientActiveTickets } from "../services/apiService";
import "../css/Patient_Appointments.css";
import { useModal } from "../contexts/Modals";

import { useAuth } from "../../contexts/AuthContext";
import JitsiMeetCall from "../../components/VideoCall/JitsiMeetCall";
import {
  RedirectModal,
  InvoiceView,
  PaymentSuccess,
  PaymentFailure,
} from "../components/PaymentComponents";
import * as apiService from "../services/apiService";
import usePaymentFlow from "../hooks/usePaymentFlow";

export default function Patient_Appointments({ setActive, ticketIdParam }) {
  const { openDiyModal } = useModal();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewingAppt, setViewingAppt] = useState(null);
  const [painMapView, setPainMapView] = useState("front");

  const payment = usePaymentFlow();

  const [jitsiConfig, setJitsiConfig] = useState({ isOpen: false, appt: null });
  const { user: currentUser } = useAuth();
  const popoverRef = useRef(null);

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

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data from MySQL backend

  useEffect(() => {
    const loadAppointments = async (isBackgroundRefresh = false) => {
      try {
        if (!isBackgroundRefresh) {
          setIsLoading(true);
        }

        const response = await fetchPatientActiveTickets();
        const tickets = response?.activeTickets || [];
        setAppointments(tickets);
      } catch (error) {
        console.error("Failed to load appointments:", error);
      } finally {
        if (!isBackgroundRefresh) {
          setIsLoading(false);
        }
      }
    };

    loadAppointments();

    const pollingInterval = setInterval(() => {
      loadAppointments(true);
    }, 10000);

    return () => clearInterval(pollingInterval);
  }, []);

  // Filter logic
  const filteredAppointments = appointments.filter((appt) => {
    const matchesSearch =
      (appt.specialistName &&
        appt.specialistName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (appt.chiefComplaint &&
        appt.chiefComplaint
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (appt.ticketNumber &&
        appt.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending" &&
        ["pending", "unclaimed", "processing", "for_payment"].includes(
          appt.status,
        )) ||
      (statusFilter === "Confirmed" &&
        ["confirmed", "active"].includes(appt.status));

    return matchesSearch && matchesStatus;
  });

  // Helper functions for UI mapping
  const getStatusBadge = (status) => {
    if (status === "completed") {
      return (
        <span
          className="appt-badge badge-confirmed"
          style={{
            backgroundColor: "#e2fadb",
            color: "#2b8a3e",
            border: "1px solid #b2f2bb",
          }}
        >
          Completed
        </span>
      );
    }
    if (["confirmed", "active"].includes(status)) {
      return <span className="appt-badge badge-confirmed">Confirmed</span>;
    }
    if (status === "for_payment") {
      return (
        <span
          className="appt-badge badge-pending"
          style={{
            backgroundColor: "#fff3cd",
            color: "#f59f00",
            border: "1px solid #fcc419",
          }}
        >
          For Payment
        </span>
      );
    }
    return <span className="appt-badge badge-pending">Pending</span>;
  };

  const getChannelIcon = (channel) => {
    if (channel === "chat")
      return <IconMessageCircle size={16} className="detail-icon" />;
    if (channel === "mobile_call" || channel?.includes("audio"))
      return <IconPhone size={16} className="detail-icon" />;
    if (channel === "in_person")
      return <IconMapPin size={16} className="detail-icon" />;
    return <IconVideo size={16} className="detail-icon" />;
  };

  const getChannelTypeLabel = (channel) => {
    if (channel === "chat") return "Text Chat";
    if (channel === "mobile_call" || channel?.includes("audio"))
      return "Voice Call";
    if (channel === "in_person") return "Clinic Visit";
    return "Video Call";
  };

  const getInitials = (name) => {
    if (!name || name === "TBA" || name === "Unassigned") return "OD";
    const parts = name.replace("Dr. ", "").split(" ");
    return (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--/--/----";
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Master Close
  const handleCloseModal = () => {
    setViewingAppt(null);
    window.history.pushState(null, "", "#/Appointments");
  };

  const pendingPayments = appointments.filter(
    (appt) => appt.status === "for_payment" && appt.specialistId != null,
  );

  return (
    <div className="appt-page-container">
      <div className="appt-page-header">
        <div>
          <h2 className="appt-page-title">My Appointments</h2>
          <p className="appt-page-subtitle">
            Manage your upcoming and pending consultations
          </p>
        </div>

        <button
          className="appt-btn appt-btn-primary"
          onClick={() => {
            window.location.hash = "#/IntakeForm/Video%20Consultation";
          }}
        >
          <IconCalendarEvent size={18} /> Book Appointment
        </button>
      </div>

      <div className="appt-controls-bar">
        <div className="appt-search-wrapper">
          <IconSearch size={18} className="appt-search-icon" />
          <input
            type="text"
            className="appt-search-input"
            placeholder="Search by doctor, complaint, or ticket ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="appt-popover-container" ref={popoverRef}>
          <button
            className="appt-btn appt-btn-outline"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <IconFilter size={18} /> {statusFilter}
          </button>

          {filterOpen && (
            <div className="appt-popover-menu">
              <div className="popover-section-title">Filter by Status</div>
              <div className="popover-radio-group">
                <label>
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === "All"}
                    onChange={() => {
                      setStatusFilter("All");
                      setFilterOpen(false);
                    }}
                  />{" "}
                  All Appointments
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === "Confirmed"}
                    onChange={() => {
                      setStatusFilter("Confirmed");
                      setFilterOpen(false);
                    }}
                  />{" "}
                  Confirmed Only
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === "Pending"}
                    onChange={() => {
                      setStatusFilter("Pending");
                      setFilterOpen(false);
                    }}
                  />{" "}
                  Pending / Triage
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div
          className="appt-empty-state"
          style={{ border: "none", backgroundColor: "transparent" }}
        >
          <IconLoader2
            size={48}
            className="empty-icon"
            style={{ animation: "spin 1s linear infinite", color: "#4aa7ed" }}
          />
          <h3>Loading Appointments...</h3>
          <p>Securely fetching your records.</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="appt-empty-state">
          <IconCalendarOff size={48} className="empty-icon" />
          <h3>No Appointments Found</h3>
          <p>
            {appointments.length === 0
              ? "You don't have any active appointments at the moment."
              : "No appointments match your current search or filter."}
          </p>
          {appointments.length === 0 && (
            <button
              className="appt-btn appt-btn-primary"
              style={{ marginTop: "16px", display: "inline-flex" }}
              onClick={() => {
                window.location.hash = "#/IntakeForm/Video%20Consultation";
              }}
            >
              Book Appointment
            </button>
          )}
        </div>
      ) : (
        <div className="appt-grid">
          {/* Pending Payments Section */}
          {pendingPayments.length > 0 && (
            <div className="w-full col-span-full mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-amber-600 flex items-center gap-2">
                  <IconAlertCircle size={20} />
                  Pending Payments - Action Required
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPayments.map((appt) => (
                  <div
                    key={`pending-${appt.id}`}
                    className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 text-sm">
                          {appt.specialistName
                            ? `Consultation with ${appt.specialistName}`
                            : "Consultation"}
                        </h4>
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          Pending
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        Consultation Date:{" "}
                        {appt.preferredDate
                          ? formatDate(appt.preferredDate)
                          : "TBA"}
                      </p>
                      <div className="flex items-center text-xs text-slate-600 mb-1">
                        <span className="font-medium">Fee:</span>
                        <span className="ml-1 font-bold">
                          ₱
                          {(appt.totalAmount > 0
                            ? appt.totalAmount
                            : 850
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="flex-1 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold py-2 rounded-xl text-sm transition-colors shadow-sm"
                          onClick={() => payment.openPayment(appt)}
                        >
                          View Invoice
                        </button>
                        <button
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-xl text-sm transition-colors shadow-sm"
                          onClick={() => {
                            payment.openPayment(appt);
                            // Auto-trigger the redirect modal after opening
                            setTimeout(() => payment.initiatePayment(), 10);
                          }}
                        >
                          Pay Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredAppointments.map((appt) => {
            const displaySpecialist = appt.specialistName || "TBA";
            const displaySpecialization = appt.specialization || "TBA";
            const displayDate = appt.preferredDate
              ? formatDate(appt.preferredDate)
              : "--/--/----";
            const displayTime = appt.preferredTime || "--:--";
            const displayLocation =
              appt.consultationChannel === "in_person" && appt.city
                ? appt.city
                : "TBA";

            return (
              <div key={appt.id} className="appt-card">
                <div className="appt-card-header">
                  <div className="appt-avatar">
                    {getInitials(displaySpecialist)}
                  </div>
                  <div className="full-width">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div className="appt-header-info">
                        <h4>
                          {displaySpecialist !== "TBA"
                            ? displaySpecialist
                            : "TBA"}
                        </h4>
                        <p
                          className="appt-spec"
                          style={{
                            fontSize: "12px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {appt.ticketNumber} •{" "}
                          <span style={{ textTransform: "capitalize" }}>
                            {displaySpecialization}
                          </span>
                        </p>
                      </div>
                      {getStatusBadge(appt.status)}
                    </div>
                  </div>
                </div>

                <div className="appt-details-stack">
                  <div
                    className="appt-detail-row"
                    style={{ width: "100%", alignItems: "flex-start" }}
                  >
                    <IconStethoscope
                      size={16}
                      className="detail-icon"
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                    <span
                      style={{
                        fontWeight: 500,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        wordBreak: "break-word",
                        minWidth: 0,
                      }}
                    >
                      {appt.chiefComplaint || "General Consultation"}
                    </span>
                  </div>

                  <div className="appt-detail-row">
                    <IconCalendarEvent
                      size={16}
                      className="detail-icon"
                      style={{ flexShrink: 0 }}
                    />
                    <span>{displayDate}</span>
                  </div>

                  <div className="appt-detail-row">
                    <IconClock
                      size={16}
                      className="detail-icon"
                      style={{ flexShrink: 0 }}
                    />
                    <span>{displayTime}</span>
                  </div>

                  {appt.consultationChannel === "in_person" && (
                    <div className="appt-detail-row">
                      <IconMapPin
                        size={16}
                        className="detail-icon"
                        style={{ flexShrink: 0 }}
                      />
                      <span>{displayLocation}</span>
                    </div>
                  )}

                  <div className="appt-detail-row">
                    {getChannelIcon(appt.consultationChannel)}
                    <span style={{ textTransform: "capitalize" }}>
                      {(appt.consultationChannel || "Platform Call").replace(
                        "_",
                        " ",
                      )}
                    </span>
                  </div>
                </div>

                <div className="appt-card-actions">
                  <button
                    className="appt-btn appt-btn-outline full-width"
                    onClick={() => {
                      window.history.pushState(
                        null,
                        "",
                        `#/Appointments/${appt.ticketNumber}`,
                      );
                      setViewingAppt(appt);
                    }}
                  >
                    View Details
                  </button>
                  {appt.status === "for_payment" && (
                    <button
                      className="appt-btn appt-btn-primary full-width"
                      onClick={() => payment.openPayment(appt)}
                    >
                      Pay Now
                    </button>
                  )}
                  {appt.status === "active" &&
                    appt.paymentStatus !== "unpaid" && (
                      <button
                        className="appt-btn appt-btn-primary full-width"
                        onClick={() => {
                          handleCloseModal();
                          setJitsiConfig({ isOpen: true, appt: appt });
                        }}
                      >
                        Join Room
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {viewingAppt && (
        <div className="appt-modal-overlay" onClick={handleCloseModal}>
          <div
            className="appt-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="appt-modal-header">
              <div>
                <h3 className="appt-modal-title">Appointment Details</h3>
                <span className="appt-modal-ticket">
                  Ticket #{viewingAppt.ticketNumber}
                </span>
              </div>
              <button className="appt-modal-close" onClick={handleCloseModal}>
                <IconX size={24} />
              </button>
            </div>

            <div className="appt-modal-body">
              {/* Main Banner */}
              <div className="appt-modal-banner">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <span className="appt-modal-label">Chief Complaint</span>
                  {getStatusBadge(viewingAppt.status)}
                </div>
                <h2 className="appt-modal-complaint">
                  {viewingAppt.chiefComplaint ||
                    viewingAppt.mainConcern ||
                    "General Consultation"}
                </h2>
              </div>

              {/* Provider Info */}
              <div className="appt-modal-doctor">
                <div className="appt-avatar large">
                  {getInitials(viewingAppt.specialistName)}
                </div>
                <div>
                  <p className="appt-modal-label">Assigned Provider</p>
                  <h4 className="appt-modal-doctor-name">
                    {viewingAppt.specialistName || "TBA"}
                  </h4>
                  <p className="appt-modal-doctor-spec">
                    {viewingAppt.specialization || "Pending Triage Assignment"}
                  </p>
                </div>
              </div>

              {/* Basic Logistics Grid */}
              <div className="appt-modal-grid" style={{ marginBottom: "24px" }}>
                <div className="appt-modal-grid-item">
                  <IconCalendarEvent size={18} className="detail-icon" />
                  <div>
                    <span className="appt-modal-label">Date</span>
                    <p className="appt-modal-value">
                      {viewingAppt.preferredDate
                        ? formatDate(viewingAppt.preferredDate)
                        : "TBA"}
                    </p>
                  </div>
                </div>
                <div className="appt-modal-grid-item">
                  <IconClock size={18} className="detail-icon" />
                  <div>
                    <span className="appt-modal-label">Time</span>
                    <p className="appt-modal-value">
                      {viewingAppt.preferredTime || "TBA"}
                    </p>
                  </div>
                </div>
                <div className="appt-modal-grid-item">
                  <IconActivity size={18} className="detail-icon" />
                  <div>
                    <span className="appt-modal-label">Channel</span>
                    <p
                      className="appt-modal-value"
                      style={{ textTransform: "capitalize" }}
                    >
                      {(
                        viewingAppt.consultationChannel || "platform_call"
                      ).replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* CONSULTATION INTAKE DETAILS */}
              <div className="appt-clinical-details">
                <h3 className="clinical-section-title">
                  Clinical Intake Summary
                </h3>

                {/* Timeline & Severity */}
                <div className="clinical-row">
                  <div className="clinical-stat-box">
                    <span className="appt-modal-label">Duration</span>
                    <p className="appt-modal-value">
                      {viewingAppt.durationValue
                        ? `${viewingAppt.durationValue} ${viewingAppt.durationUnit}`
                        : "Not specified"}
                    </p>
                  </div>
                  <div className="clinical-stat-box">
                    <span className="appt-modal-label">Pain/Severity</span>
                    <p className="appt-modal-value">
                      {viewingAppt.severity
                        ? `${viewingAppt.severity} / 10`
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Symptoms */}
                <div className="clinical-section-block">
                  <span className="appt-modal-label">Reported Symptoms</span>
                  <div className="clinical-chip-group">
                    {(() => {
                      let safeSymptoms = [];
                      if (viewingAppt.symptoms) {
                        try {
                          safeSymptoms =
                            typeof viewingAppt.symptoms === "string"
                              ? JSON.parse(viewingAppt.symptoms)
                              : viewingAppt.symptoms;
                        } catch (e) {
                          safeSymptoms = [viewingAppt.symptoms];
                        }
                      }
                      if (
                        Array.isArray(safeSymptoms) &&
                        safeSymptoms.length > 0
                      ) {
                        return safeSymptoms.map((symp, i) => (
                          <span
                            key={`symp-${i}`}
                            className="clinical-chip symp-chip"
                          >
                            {symp}
                          </span>
                        ));
                      }

                      return (
                        !viewingAppt.otherSymptoms && (
                          <span className="text-muted">None reported</span>
                        )
                      );
                    })()}

                    {/* Show other symptoms if present */}
                    {viewingAppt.otherSymptoms && (
                      <span className="clinical-chip symp-chip other-symp">
                        {viewingAppt.otherSymptoms}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pain Locations */}
                <div className="clinical-section-block">
                  <span className="appt-modal-label">
                    Highlighted Pain Areas
                  </span>
                  <div className="clinical-chip-group">
                    {(() => {
                      let safePainAreas = [];
                      if (viewingAppt.painAreas) {
                        try {
                          safePainAreas =
                            typeof viewingAppt.painAreas === "string"
                              ? JSON.parse(viewingAppt.painAreas)
                              : viewingAppt.painAreas;
                        } catch (e) {
                          safePainAreas = [viewingAppt.painAreas];
                        }
                      }

                      const textChips =
                        Array.isArray(safePainAreas) &&
                        safePainAreas.length > 0 ? (
                          safePainAreas.map((area, i) => {
                            let labelText = area;
                            if (typeof area === "object" && area !== null) {
                              const partName =
                                area.label || area.key || "Unknown";
                              const viewName =
                                area.view === "back" ? "Back" : "Front";
                              labelText = `${partName} (${viewName})`;
                            }
                            return (
                              <span
                                key={`pain-${i}`}
                                className="clinical-chip pain-chip"
                              >
                                {labelText}
                              </span>
                            );
                          })
                        ) : (
                          <span
                            className="text-muted"
                            style={{ fontSize: "14px" }}
                          >
                            No specific areas mapped
                          </span>
                        );

                      return (
                        <div style={{ width: "100%" }}>
                          <div
                            className="clinical-chip-group"
                            style={{ marginBottom: "20px" }}
                          >
                            {textChips}
                          </div>
                          {Array.isArray(safePainAreas) &&
                            safePainAreas.length > 0 && (
                              <div className="readonly-pain-map-container">
                                <div className="triage-pain-map-view-toggle centered-toggle">
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

                                <div className="triage-pain-map-picker centered-picker">
                                  <div
                                    className={`triage-pain-map-figure ${painMapView === "back" ? "back" : "front"}`}
                                  >
                                    <div className="body-map-visual"></div>
                                    {PAIN_MAP_AREAS[painMapView].map((area) => {
                                      const isSelected = safePainAreas.some(
                                        (a) =>
                                          (a.key === area.key &&
                                            a.view === painMapView) ||
                                          a.id === `${painMapView}:${area.key}`,
                                      );

                                      return (
                                        <div
                                          key={`${painMapView}-${area.key}`}
                                          className={`triage-body-part ${area.className} ${isSelected ? "selected" : ""}`}
                                          style={{
                                            cursor: "default",
                                            pointerEvents: "none",
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="clinical-section-block">
                  <span className="appt-modal-label">Known Allergies</span>
                  <div className="clinical-chip-group">
                    {(() => {
                      let patientAllergies =
                        viewingAppt.allergies ||
                        viewingAppt.patient?.allergies ||
                        [];
                      if (typeof patientAllergies === "string") {
                        try {
                          patientAllergies = JSON.parse(patientAllergies);
                        } catch (e) {
                          patientAllergies = patientAllergies.split(",");
                        }
                      }
                      if (
                        Array.isArray(patientAllergies) &&
                        patientAllergies.length > 0
                      ) {
                        return patientAllergies.map((allergy, i) => {
                          let allergyText = allergy;
                          if (typeof allergy === "object" && allergy !== null) {
                            allergyText =
                              allergy.label ||
                              allergy.value ||
                              allergy.name ||
                              allergy.text ||
                              "";
                          }
                          const cleanText = String(allergyText).trim();
                          if (!cleanText || cleanText === "[object Object]")
                            return null;

                          return (
                            <span
                              key={`allergy-${i}`}
                              className="clinical-chip allergy-chip"
                            >
                              <IconAlertCircle
                                size={14}
                                style={{
                                  marginRight: "4px",
                                  marginBottom: "-2px",
                                }}
                              />
                              {cleanText}
                            </span>
                          );
                        });
                      }

                      return (
                        <span
                          className="text-muted"
                          style={{ fontSize: "14px" }}
                        >
                          No known allergies reported
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {viewingAppt.additionalDetails && (
                  <div className="clinical-section-block">
                    <span className="appt-modal-label">Additional Notes</span>
                    <div className="clinical-notes-box">
                      {viewingAppt.additionalDetails}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="appt-modal-footer">
              <button
                className="appt-btn appt-btn-outline"
                onClick={handleCloseModal}
              >
                Close
              </button>
              {viewingAppt.status === "active" &&
                viewingAppt.paymentStatus !== "unpaid" && (
                  <button
                    className="appt-btn appt-btn-primary"
                    onClick={() => {
                      handleCloseModal();
                      setJitsiConfig({ isOpen: true, appt: viewingAppt });
                    }}
                  >
                    Join Consultation Room
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Orchestrator Overlay */}
      {payment.ticket && (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-100 to-sky-50 flex items-start justify-center py-10 px-4 overflow-y-auto">
          <button
            className="fixed top-2 right-2 z-[10000] text-xs px-2 py-1 bg-white/80 rounded shadow hover:bg-white text-slate-500 hover:text-slate-700 underline"
            onClick={payment.downloadPaymentLogs}
          >
            Download Debug Log
          </button>
          <div className="relative w-full max-w-md">
            <button
              className="absolute -top-10 right-0 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
              onClick={payment.closePayment}
            >
              <IconX size={24} />
            </button>

            <div className="mt-2">
              {payment.isVerifying && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
                  <p className="text-lg font-medium">Verifying payment...</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Checking your transaction status with the payment gateway.
                  </p>
                </div>
              )}
              {!payment.isVerifying && payment.view === "invoice" && (
                <InvoiceView
                  invoice={payment.invoiceData}
                  onPay={payment.initiatePayment}
                />
              )}
              {!payment.isVerifying && payment.view === "success" && (
                <PaymentSuccess
                  amount={payment.ticket.totalAmount}
                  invoice={`INV-${payment.ticket.ticketNumber}`}
                  paymentDate={new Date().toLocaleString()}
                  documents={[]}
                  onViewInvoice={() => payment.openPayment(payment.ticket)}
                  onBackToHistory={() => {
                    payment.closePayment();
                    window.location.reload();
                  }}
                />
              )}
              {!payment.isVerifying && payment.view === "failure" && (
                <PaymentFailure
                  amount={payment.ticket.totalAmount}
                  invoice={`INV-${payment.ticket.ticketNumber}`}
                  onRetry={payment.initiatePayment}
                  onCancel={() => payment.openPayment(payment.ticket)}
                />
              )}
            </div>

            {!payment.isVerifying && payment.showModal && (
              <RedirectModal
                amount={`₱${payment.ticket.totalAmount}`}
                invoice={`INV-${payment.ticket.ticketNumber}`}
                onCancel={payment.cancelRedirect}
                onComplete={payment.completeRedirect}
              />
            )}
          </div>
        </div>
      )}

      {/* 8x8 Jitsi Video Call Overlay */}
      <JitsiMeetCall
        isOpen={jitsiConfig.isOpen}
        onClose={() => setJitsiConfig({ isOpen: false, appt: null })}
        callType="video"
        ticketId={jitsiConfig.appt?.id}
        patient={{
          name: jitsiConfig.appt?.specialistName || "Specialist",
          id: jitsiConfig.appt?.specialistId || "UnknownSpecialist",
        }}
        currentUser={currentUser}
      />
    </div>
  );
}
