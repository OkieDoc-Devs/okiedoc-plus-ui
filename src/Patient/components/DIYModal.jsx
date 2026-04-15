import React from "react";
import { IconX, IconTools } from "@tabler/icons-react";
import "../css/Patient_Modals.css";

export function DiyModal({ isOpen, onClose, actionName }) {
  if (!isOpen) return null;

  // Prevent clicks inside the modal from closing the overlay
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="patient-modal-overlay" onClick={onClose}>
      <div className="patient-modal-container" onClick={handleModalClick}>
        <div className="patient-modal-header">
          <h3 className="patient-modal-title">Work in Progress</h3>
          <button className="patient-modal-close-btn" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        <div className="patient-modal-body">
          <div className="patient-modal-icon-wrapper">
            <IconTools size={32} />
          </div>
          <div>
            <h4 style={{ marginBottom: "8px", color: "#343a40" }}>
              "{actionName}"
            </h4>
            <p className="text-muted text-sm">
              This feature is currently under construction. Please check back
              later!
            </p>
          </div>
        </div>

        <div className="patient-modal-footer">
          <button
            className="patient-modal-btn modal-btn-primary"
            onClick={onClose}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
