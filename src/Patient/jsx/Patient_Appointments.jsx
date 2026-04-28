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
} from "@tabler/icons-react";
import { fetchPatientActiveTickets } from "../services/apiService";
import "../css/Patient_Appointments.css";
import { useModal } from "../contexts/Modals";

export default function Patient_Appointments({ setActive, ticketIdParam }) {
  const { openDiyModal } = useModal();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewingAppt, setViewingAppt] = useState(null);

  const popoverRef = useRef(null);

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

  // Linking Effect
  useEffect(() => {
    const syncModalWithURL = () => {
      const hashParts = window.location.hash.split("/");
      const urlTicketId =
        hashParts.length === 3 && hashParts[1] === "Appointments"
          ? hashParts[2]
          : null;

      if (urlTicketId && appointments.length > 0) {
        const foundAppt = appointments.find(
          (a) => a.ticketNumber === urlTicketId,
        );
        if (foundAppt) {
          setViewingAppt(foundAppt);
        }
      } else if (!urlTicketId) {
        setViewingAppt(null);
      }
    };

    syncModalWithURL();

    window.addEventListener("hashchange", syncModalWithURL);

    return () => window.removeEventListener("hashchange", syncModalWithURL);
  }, [appointments]);

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
    window.location.hash = "#/Appointments";
  };

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
                      window.location.hash = `#/Appointments/${appt.ticketNumber}`;
                    }}
                  >
                    View Details
                  </button>
                  {appt.status === "for_payment" && (
                    <button
                      className="appt-btn appt-btn-primary full-width"
                      onClick={() =>
                        openDiyModal(`Paying Ticket #${appt.ticketNumber}`)
                      }
                    >
                      Pay Now
                    </button>
                  )}
                  {["confirmed", "active"].includes(appt.status) && (
                    <button
                      className="appt-btn appt-btn-primary full-width"
                      onClick={() => {
                        handleCloseModal();
                        openDiyModal(
                          `Joining Room for Ticket #${appt.ticketNumber}`,
                        );
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
                  {viewingAppt.chiefComplaint || "General Consultation"}
                </h2>
              </div>

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

              <div className="appt-modal-grid">
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
                    <span className="appt-modal-label">Consultation Type</span>
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
                <div className="appt-modal-grid-item">
                  {getChannelIcon(viewingAppt.consultationChannel)}
                  <div>
                    <span className="appt-modal-label">Channel Type</span>
                    <p className="appt-modal-value">
                      {getChannelTypeLabel(viewingAppt.consultationChannel)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="appt-modal-footer">
              <button
                className="appt-btn appt-btn-outline"
                onClick={handleCloseModal}
              >
                Close
              </button>
              {["confirmed", "active"].includes(viewingAppt.status) && (
                <button
                  className="appt-btn appt-btn-primary"
                  onClick={() => {
                    handleCloseModal();
                    openDiyModal(
                      `Joining Room for Ticket #${viewingAppt.ticketNumber}`,
                    );
                  }}
                >
                  Join Consultation Room
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
