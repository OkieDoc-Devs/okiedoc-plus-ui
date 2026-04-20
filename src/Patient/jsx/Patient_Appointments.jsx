import { useState, useMemo, useEffect, useRef } from "react";
import {
  IconPlus,
  IconFilter,
  IconCalendarEvent,
  IconClock,
  IconVideo,
  IconMapPin,
  IconMessage,
  IconPhone,
  IconCheck,
  IconSearch,
  IconSortAscending,
} from "@tabler/icons-react";
import "../css/Patient_Appointments.css";
import { useModal } from "../contexts/Modals";
import { fetchPatientActiveTickets } from "../services/apiService";

const allAppointmentsMock = [];

export default function Appointments_Patient({ setActive }) {
  const { openDiyModal } = useModal();
  const [filterOpen, setFilterOpen] = useState(false);
  const popoverRef = useRef(null);
  const [activeTickets, setActiveTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("dateDesc");
  const [statusFilter, setStatusFilter] = useState([
    "Confirmed",
    "Pending",
    "Completed",
    "Active",
    "Inactive"
  ]);
  const [typeFilter, setTypeFilter] = useState([
    "Chat Consultation",
    "Voice Consultation",
    "Video Consultation",
    "In-Person Consultation",
    "Specialist Services",
  ]);

  // Fetch real tickets from database
  useEffect(() => {
    let mounted = true;
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await fetchPatientActiveTickets();
        if (mounted && response.success) {
          const mappedTickets = response.activeTickets.map(ticket => {
            const channelLabels = {
              chat: "Chat Consultation",
              "Chat Consultation": "Chat Consultation",
              mobile_call: "Voice Consultation",
              "Voice Consultation": "Voice Consultation",
              platform_call: "Video Consultation",
              "Video Consultation": "Video Consultation",
              viber_audio: "Voice Consultation",
              viber_video: "Video Consultation"
            };

            const rawName = ticket.specialistName || "TBA";
            const specialistName = (rawName === "Unassigned" || rawName === "TBA" || !ticket.specialistId) ? "TBA" : rawName;
            
            const rawSpec = ticket.specialization || "TBA";
            const specialization = (rawSpec === "Unassigned" || rawSpec === "TBA" || !ticket.specialistId) ? "TBA" : rawSpec;

            const status = ticket.status ? (ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).toLowerCase()) : "Pending";
            const date = (specialistName === "TBA" || !ticket.preferredDate) ? "--/--/----" : ticket.preferredDate;
            const time = (specialistName === "TBA" || !ticket.preferredTime) ? "--:--" : ticket.preferredTime;
            const location = ticket.city || "TBA";

            return {
              id: `real-${ticket.id}`,
              dr: specialistName,
              spec: specialization,
              status: status,
              date: date,
              time: time,
              type: channelLabels[ticket.consultationChannel] || "Consultation",
              channel: ticket.consultationChannel, // Store raw channel for precise filtering
              initials: specialistName === "TBA" ? "?" : specialistName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
              canJoin: ticket.status === 'active' || ticket.status === 'confirmed',
              location: (location === "" || location === null) ? "TBA" : location
            };
          });
          setActiveTickets(mappedTickets);
        }
      } catch (error) {
        console.error("Failed to fetch active tickets:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTickets();
    return () => { mounted = false; };
  }, []);

  // Combine Mock Data with Real Database Data
  const combinedData = useMemo(() => {
    // Return ONLY activeTickets to remove mock data
    return activeTickets;
  }, [activeTickets]);

  // Helper to toggle arrays for standard HTML checkboxes
  const toggleArrayItem = (array, setArray, item) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
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

  // Dynamic Filtering and Sorting Engine
  const displayData = useMemo(() => {
    return combinedData
      .filter((item) => {
        if (
          searchQuery &&
          !item.dr.toLowerCase().includes(searchQuery.toLowerCase())
        )
          return false;
        
        // Match status filter (case insensitive)
        const currentStatus = item.status.toLowerCase();
        const isStatusMatch = statusFilter.some(s => s.toLowerCase() === currentStatus);
        
        if (!isStatusMatch) return false;

        let itemCategory = "In-Person Consultation";
        // Map consultation channels to categories correctly
        const channel = item.channel || "";
        const type = item.type || "";

        if (channel === 'Chat Consultation' || channel === 'chat') {
          itemCategory = "Chat Consultation";
        } else if (channel === 'Voice Consultation' || channel === 'mobile_call' || channel === 'viber_audio') {
          itemCategory = "Voice Consultation";
        } else if (channel === 'Video Consultation' || channel === 'platform_call' || channel === 'viber_video' || type.includes("Video")) {
          itemCategory = "Video Consultation";
        } else if (type.includes("Specialist") || type.includes("Service")) {
          itemCategory = "Specialist Services";
        } else {
          itemCategory = "In-Person Consultation";
        }

        if (!typeFilter.includes(itemCategory)) return false;

        return true;
      })
      .sort((a, b) => {
        // Custom Sort by Newest First (Created At / ID)
        // Since we want newest first by default and ticket IDs follow creation order:
        const idA = parseInt(a.id.replace('real-', '')) || 0;
        const idB = parseInt(b.id.replace('real-', '')) || 0;

        if (sortOrder === "dateDesc") {
          return idB - idA; // Simple newest first logic
        }
        if (sortOrder === "dateAsc") {
          return idA - idB; 
        }
        if (sortOrder === "alphaAsc") return a.dr.localeCompare(b.dr);
        if (sortOrder === "alphaDesc") return b.dr.localeCompare(a.dr);

        return 0;
      });
  }, [activeTickets, searchQuery, sortOrder, statusFilter, typeFilter]);

  return (
    <div className="appt-page-container">
      {/* HEADER */}
      <header className="appt-page-header">
        <div>
          <h2 className="appt-page-title">Appointments</h2>
          <p className="appt-page-subtitle">
            Manage your healthcare appointments
          </p>
        </div>
        <button
          className="appt-btn appt-btn-primary"
          onClick={() => setActive("Services")}
        >
          <IconPlus size={16} /> Book Appointment
        </button>
      </header>

      {/* SEARCH AND FILTER BAR */}
      <div className="appt-controls-bar">
        <div className="appt-search-wrapper">
          <IconSearch size={16} className="appt-search-icon" />
          <input
            type="text"
            id="appt-search-input"
            name="appt-search"
            className="appt-search-input"
            placeholder="Search by Doctor's name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Custom Filter Popover */}
        <div className="appt-popover-container" ref={popoverRef}>
          <button
            className="appt-btn appt-btn-outline"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <IconFilter size={16} /> Filter & Sort
          </button>

          {filterOpen && (
            <div className="appt-popover-menu">
              <div className="popover-section-title">
                <IconSortAscending size={18} />
                <span>Sort By</span>
              </div>
              <div className="popover-radio-group">
                <label>
                  <input
                    type="radio"
                    name="sort"
                    value="dateDesc"
                    checked={sortOrder === "dateDesc"}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />{" "}
                  Date (Newest First)
                </label>
                <label>
                  <input
                    type="radio"
                    name="sort"
                    value="dateAsc"
                    checked={sortOrder === "dateAsc"}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />{" "}
                  Date (Oldest First)
                </label>
                <label>
                  <input
                    type="radio"
                    name="sort"
                    value="alphaAsc"
                    checked={sortOrder === "alphaAsc"}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />{" "}
                  Doctor Name (A-Z)
                </label>
                <label>
                  <input
                    type="radio"
                    name="sort"
                    value="alphaDesc"
                    checked={sortOrder === "alphaDesc"}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />{" "}
                  Doctor Name (Z-A)
                </label>
              </div>

              <hr className="popover-divider" />

              <div className="popover-section-title">
                <span>Status</span>
              </div>
              <div className="popover-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={statusFilter.includes("Confirmed")}
                    onChange={() =>
                      toggleArrayItem(
                        statusFilter,
                        setStatusFilter,
                        "Confirmed",
                      )
                    }
                  />{" "}
                  Confirmed
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={statusFilter.includes("Pending")}
                    onChange={() =>
                      toggleArrayItem(statusFilter, setStatusFilter, "Pending")
                    }
                  />{" "}
                  Pending
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={statusFilter.includes("Completed")}
                    onChange={() =>
                      toggleArrayItem(
                        statusFilter,
                        setStatusFilter,
                        "Completed",
                      )
                    }
                  />{" "}
                  Completed
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={statusFilter.includes("Active")}
                    onChange={() =>
                      toggleArrayItem(
                        statusFilter,
                        setStatusFilter,
                        "Active",
                      )
                    }
                  />{" "}
                  Active
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={statusFilter.includes("Inactive")}
                    onChange={() =>
                      toggleArrayItem(
                        statusFilter,
                        setStatusFilter,
                        "Inactive",
                      )
                    }
                  />{" "}
                  Inactive
                </label>
              </div>

              <hr className="popover-divider" />

              <div className="popover-section-title">
                <span>Consultation Type</span>
              </div>
              <div className="popover-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={typeFilter.includes("Chat Consultation")}
                    onChange={() =>
                      toggleArrayItem(typeFilter, setTypeFilter, "Chat Consultation")
                    }
                  />{" "}
                  Chat Consultation
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={typeFilter.includes("Voice Consultation")}
                    onChange={() =>
                      toggleArrayItem(typeFilter, setTypeFilter, "Voice Consultation")
                    }
                  />{" "}
                  Voice Consultation
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={typeFilter.includes("Video Consultation")}
                    onChange={() =>
                      toggleArrayItem(typeFilter, setTypeFilter, "Video Consultation")
                    }
                  />{" "}
                  Video Consultation
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={typeFilter.includes("In-Person Consultation")}
                    onChange={() =>
                      toggleArrayItem(typeFilter, setTypeFilter, "In-Person Consultation")
                    }
                  />{" "}
                  In-Person Consultation
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={typeFilter.includes("Specialist Services")}
                    onChange={() =>
                      toggleArrayItem(typeFilter, setTypeFilter, "Specialist Services")
                    }
                  />{" "}
                  Specialist Services
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {displayData.length === 0 && (
        <div className="appt-empty-state">
          <IconCalendarEvent size={48} className="empty-icon" />
          <h3>No appointments found</h3>
          <p>
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      )}

      {/* CARDS GRID */}
      <div className="appt-grid">
        {displayData.map((item) => (
          <div className="appt-card" key={item.id}>
            <div className="appt-card-header">
              <div className="appt-avatar">{item.initials}</div>
              <div className="appt-header-info">
                <h4>{item.dr}</h4>
                <p className="appt-spec">{item.spec}</p>

                {item.status === "Confirmed" && (
                  <span className="appt-badge badge-confirmed">
                    <IconCheck size={10} /> Confirmed
                  </span>
                )}
                {item.status === "Pending" && (
                  <span className="appt-badge badge-pending">Pending</span>
                )}
                {item.status === "Completed" && (
                  <span className="appt-badge badge-completed">Completed</span>
                )}
              </div>
            </div>

            <div className="appt-details-stack">
              <div className="appt-detail-row">
                <IconCalendarEvent size={18} className="detail-icon" />
                <span>{item.date}</span>
              </div>
              <div className="appt-detail-row">
                <IconClock size={18} className="detail-icon" />
                <span>{item.time}</span>
              </div>
              <div className="appt-detail-row">
                {item.type === "Video Consultation" ? (
                  <IconPhone size={18} className="detail-icon" />
                ) : item.type === "Voice Consultation" ? (
                  <IconPhone size={18} className="detail-icon" />
                ) : item.type === "Chat Consultation" ? (
                  <IconMessage size={18} className="detail-icon" />
                ) : (
                  <IconMapPin size={18} className="detail-icon" />
                )}
                <span>{item.type}</span>
              </div>
              {item.location && !["Chat Consultation", "Voice Consultation", "Video Consultation"].includes(item.type) && (
                <div className="appt-detail-row">
                  <IconMapPin size={18} className="detail-icon" />
                  <span>Location: {item.location}</span>
                </div>
              )}
            </div>

            {item.status !== "Completed" && (
              <div className="appt-card-actions">
                {item.canJoin && (
                  <button
                    className="appt-btn appt-btn-primary full-width"
                    onClick={() => openDiyModal("Join Call")}
                  >
                    <IconVideo size={16} /> Join Call
                  </button>
                )}
                <button
                  className="appt-btn appt-btn-outline full-width"
                  onClick={() => openDiyModal("Message")}
                >
                  <IconMessage size={16} /> Message
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
