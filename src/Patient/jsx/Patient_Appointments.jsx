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

const allAppointmentsMock = [
  {
    id: 1,
    dr: "Dr. Sarah Johnson",
    spec: "Family Medicine",
    status: "Confirmed",
    date: "March 31, 2026",
    time: "2:30 PM",
    type: "Video Consultation",
    initials: "SJ",
    canJoin: true,
  },
  {
    id: 6,
    dr: "Dr. Carlos Torres",
    spec: "Dermatologist",
    status: "Confirmed",
    date: "March 31, 2026",
    time: "10:00 AM",
    type: "Video Consultation",
    initials: "CT",
    canJoin: false,
  },
  {
    id: 2,
    dr: "Dr. Michael Chen",
    spec: "Cardiologist",
    status: "Confirmed",
    date: "April 5, 2026",
    time: "10:00 AM",
    type: "Medical Center - Floor 3",
    initials: "MC",
    canJoin: false,
  },
  {
    id: 3,
    dr: "Dr. Emily Rodriguez",
    spec: "Physical Therapist",
    status: "Pending",
    date: "April 8, 2026",
    time: "3:00 PM",
    type: "PT Clinic - Room 201",
    initials: "ER",
    canJoin: false,
  },
  {
    id: 4,
    dr: "Dr. Sarah Johnson",
    spec: "Family Medicine",
    status: "Completed",
    date: "March 15, 2026",
    time: "2:00 PM",
    type: "Video Consultation",
    initials: "SJ",
    canJoin: false,
  },
  {
    id: 5,
    dr: "Nurse Practitioner James Lee",
    spec: "Follow-up Care",
    status: "Completed",
    date: "March 8, 2026",
    time: "11:30 AM",
    type: "Phone Consultation",
    initials: "JL",
    canJoin: false,
  },
];

export default function Appointments_Patient({ setActive }) {
  const { openDiyModal } = useModal();
  const [filterOpen, setFilterOpen] = useState(false);
  const popoverRef = useRef(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("dateDesc");
  const [statusFilter, setStatusFilter] = useState([
    "Confirmed",
    "Pending",
    "Completed",
  ]);
  const [typeFilter, setTypeFilter] = useState(["Video", "Phone", "In-Person"]);

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
    return allAppointmentsMock
      .filter((item) => {
        if (
          searchQuery &&
          !item.dr.toLowerCase().includes(searchQuery.toLowerCase())
        )
          return false;
        if (!statusFilter.includes(item.status)) return false;

        let itemCategory = "In-Person";
        if (item.type.includes("Video")) itemCategory = "Video";
        else if (item.type.includes("Phone")) itemCategory = "Phone";

        if (!typeFilter.includes(itemCategory)) return false;

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        const dayA = new Date(a.date).getTime();
        const dayB = new Date(b.date).getTime();

        if (sortOrder === "dateDesc") {
          if (dayA === dayB) return dateA.getTime() - dateB.getTime();
          return dateB.getTime() - dateA.getTime();
        }
        if (sortOrder === "dateAsc") {
          if (dayA === dayB) return dateA.getTime() - dateB.getTime();
          return dateA.getTime() - dateB.getTime();
        }
        if (sortOrder === "alphaAsc") return a.dr.localeCompare(b.dr);
        if (sortOrder === "alphaDesc") return b.dr.localeCompare(a.dr);

        return 0;
      });
  }, [searchQuery, sortOrder, statusFilter, typeFilter]);

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
              </div>

              <hr className="popover-divider" />

              <div className="popover-section-title">
                <span>Consultation Type</span>
              </div>
              <div className="popover-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={typeFilter.includes("Video")}
                    onChange={() =>
                      toggleArrayItem(typeFilter, setTypeFilter, "Video")
                    }
                  />{" "}
                  Video Call
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={typeFilter.includes("Phone")}
                    onChange={() =>
                      toggleArrayItem(typeFilter, setTypeFilter, "Phone")
                    }
                  />{" "}
                  Phone Call
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={typeFilter.includes("In-Person")}
                    onChange={() =>
                      toggleArrayItem(typeFilter, setTypeFilter, "In-Person")
                    }
                  />{" "}
                  In-Person Clinic
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
                {item.type.includes("Video") ? (
                  <IconVideo size={18} className="detail-icon" />
                ) : item.type.includes("Phone") ? (
                  <IconPhone size={18} className="detail-icon" />
                ) : (
                  <IconMapPin size={18} className="detail-icon" />
                )}
                <span>{item.type}</span>
              </div>
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
