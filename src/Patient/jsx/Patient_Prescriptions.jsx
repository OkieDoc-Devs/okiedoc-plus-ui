import { useState, useMemo, useEffect, useRef } from "react";
import {
  IconPill,
  IconCalendarEvent,
  IconRefresh,
  IconDownload,
  IconAlertCircle,
  IconUser,
  IconClock,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react";
import "../css/Patient_Prescriptions.css";
import { useModal } from "../contexts/Modals";

const activeMeds = [
  {
    id: 1,
    name: "Lisinopril",
    dose: "10mg • Once daily",
    dr: "Dr. Sarah Johnson",
    since: "Jan 15, 2026",
    rem: 5, // Triggers the warning card!
    total: 30,
    next: "April 5, 2026",
    refillsLeft: 2,
  },
  {
    id: 2,
    name: "Metformin",
    dose: "500mg • Twice daily",
    dr: "Dr. Michael Chen",
    since: "Feb 1, 2026",
    rem: 30,
    total: 90,
    next: "May 1, 2026",
    refillsLeft: 5,
  },
  {
    id: 3,
    name: "Atorvastatin",
    dose: "20mg • Once daily at bedtime",
    dr: "Dr. Michael Chen",
    since: "Jan 1, 2026",
    rem: 15,
    total: 30,
    next: "April 15, 2026",
    refillsLeft: 3,
  },
];

const pastMeds = [
  {
    id: 4,
    name: "Amoxicillin",
    dose: "500mg • Three times daily",
    date: "Feb 10, 2026 - Feb 20, 2026",
  },
  {
    id: 5,
    name: "Ibuprofen",
    dose: "400mg • As needed for pain",
    date: "Jan 5, 2026 - Jan 20, 2026",
  },
];

export default function Patient_Prescriptions() {
  const { openDiyModal } = useModal();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(["Active", "Completed"]);
  const popoverRef = useRef(null);

  const handleDIY = (action) => alert(`DIY: ${action}`);

  // Helper to toggle checkboxes
  const toggleStatus = (status) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic Helper
  const matchesSearch = (item) => {
    const term = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.dose.toLowerCase().includes(term) ||
      (item.dr && item.dr.toLowerCase().includes(term))
    );
  };

  // Apply filters to both arrays
  const filteredActive = useMemo(() => {
    if (!statusFilter.includes("Active")) return [];
    return activeMeds.filter(matchesSearch);
  }, [searchQuery, statusFilter]);

  const filteredPast = useMemo(() => {
    if (!statusFilter.includes("Completed")) return [];
    return pastMeds.filter(matchesSearch);
  }, [searchQuery, statusFilter]);

  return (
    <div className="rx-page-container">
      {/* HEADER */}
      <header className="rx-page-header">
        <h2 className="rx-page-title">Prescriptions</h2>
        <p className="rx-page-subtitle">Manage your medications and refills</p>
      </header>

      {/* REFILL REMINDER BANNER */}
      <div className="rx-banner rx-banner-yellow">
        <div className="rx-banner-content">
          <IconAlertCircle color="#f59f00" size={24} />
          <div>
            <h4>Refill Reminder</h4>
            <p>You have 1 prescription that needs refilling within 5 days</p>
          </div>
        </div>
        <button
          className="rx-btn rx-btn-yellow-outline"
          onClick={() => openDiyModal("Refill Now")}
        >
          Refill Now
        </button>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="rx-controls-bar">
        <div className="rx-search-wrapper">
          <IconSearch size={16} className="rx-search-icon" />
          <input
            type="text"
            className="rx-search-input"
            placeholder="Search active or past medications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="rx-popover-container" ref={popoverRef}>
          <button
            className="rx-btn rx-btn-outline"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <IconFilter size={16} /> Filters
          </button>

          {filterOpen && (
            <div className="rx-popover-menu">
              <div className="rx-popover-title">Status</div>
              <div className="rx-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={statusFilter.includes("Active")}
                    onChange={() => toggleStatus("Active")}
                  />
                  Active
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={statusFilter.includes("Completed")}
                    onChange={() => toggleStatus("Completed")}
                  />
                  Completed (Past)
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredActive.length === 0 && filteredPast.length === 0 && (
        <div className="rx-empty-state">
          <IconPill size={48} className="empty-icon" />
          <h3>No medications found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {/* ACTIVE MEDICATIONS */}
      {filteredActive.length > 0 && (
        <section className="rx-section">
          <h3 className="rx-section-title">Active Medications</h3>
          <div className="rx-cards-stack">
            {filteredActive.map((med) => {
              const progressPercent = (med.rem / med.total) * 100;
              const isLow = med.rem <= 5;

              return (
                <div
                  key={med.id}
                  className={`rx-card ${isLow ? "rx-warning-card" : ""}`}
                >
                  <div className="rx-card-header">
                    <div className="rx-card-title-group">
                      <IconPill color="#4AA7ED" size={20} />
                      <h4>{med.name}</h4>
                    </div>
                    {/* Add a DUE SOON badge if it's low, else Active */}
                    {isLow ? (
                      <span className="rx-badge bg-light-yellow text-yellow">
                        DUE SOON
                      </span>
                    ) : (
                      <span className="rx-badge badge-active">Active</span>
                    )}
                  </div>

                  <p className="rx-card-dose">{med.dose}</p>

                  <div className="rx-card-meta">
                    <span>
                      <IconUser size={16} /> {med.dr}
                    </span>
                    <span>
                      <IconCalendarEvent size={16} /> Since {med.since}
                    </span>
                  </div>

                  {/* Custom Progress Bar */}
                  <div className="rx-progress-container">
                    <div className="rx-progress-labels">
                      <span>Days remaining</span>
                      <span
                        className={`font-medium ${isLow ? "text-orange" : ""}`}
                      >
                        {med.rem} / {med.total} days
                      </span>
                    </div>
                    <div className="rx-progress-track">
                      <div
                        className={`rx-progress-fill ${isLow ? "fill-orange" : "fill-blue"}`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="rx-next-refill-box">
                    <span>
                      <IconClock size={16} /> Next refill
                    </span>
                    <strong>{med.next}</strong>
                  </div>

                  <div className="rx-card-actions">
                    <button
                      className={`rx-btn flex-1 ${isLow ? "rx-btn-yellow" : "rx-btn-primary"}`}
                      onClick={() => openDiyModal(`Refill ${med.name}`)}
                    >
                      <IconRefresh size={16} /> Request Refill (
                      {med.refillsLeft} left)
                    </button>
                    <button
                      className="rx-btn rx-btn-outline icon-only"
                      onClick={() => openDiyModal(`Download ${med.name} info`)}
                    >
                      <IconDownload size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PAST MEDICATIONS */}
      {filteredPast.length > 0 && (
        <section className="rx-section mt-32">
          <h3 className="rx-section-title">Past Medications</h3>
          <div className="rx-cards-stack">
            {filteredPast.map((med) => (
              <div key={med.id} className="rx-card flex-row-between">
                <div className="rx-past-info">
                  <div className="rx-icon-circle bg-gray">
                    <IconPill size={20} />
                  </div>
                  <div>
                    <h5>{med.name}</h5>
                    <p className="rx-card-dose mb-0">{med.dose}</p>
                    <p className="rx-card-date">{med.date}</p>
                  </div>
                </div>
                <span className="rx-badge badge-completed">Completed</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
