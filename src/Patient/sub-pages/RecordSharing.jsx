import React, { useState } from "react";
import {
  IconArrowLeft,
  IconShieldCheck,
  IconUser,
  IconClock,
  IconLockOpen,
  IconLock,
  IconEye,
  IconX,
  IconCheck,
  IconShare,
} from "@tabler/icons-react";
import "../css/RecordSharing.css";

// --- MOCK DATA FOR REAL UX ---
const initialActiveShares = [
  {
    id: 1,
    doctor: "Dr. Maria Santos",
    spec: "Cardiologist",
    reason: "Heart condition follow-up",
    expiresIn: "2 days",
    status: "Active",
  },
  {
    id: 2,
    doctor: "Dr. James Chen",
    spec: "Orthopedic Surgeon",
    reason: "Knee pain assessment",
    expiresIn: "14 days",
    status: "Active",
  },
];

const initialPendingRequests = [
  {
    id: 3,
    doctor: "Dr. Sofia Reyes",
    spec: "Dermatologist",
    reason: "Requested access for skin condition review",
    dateRequested: "Today",
  },
];

export default function RecordSharing({ onGoBack }) {
  const [activeShares, setActiveShares] = useState(initialActiveShares);
  const [pendingRequests, setPendingRequests] = useState(
    initialPendingRequests,
  );

  const handleRevoke = (id) => {
    if (
      window.confirm("Are you sure you want to revoke access for this doctor?")
    ) {
      setActiveShares(activeShares.filter((share) => share.id !== id));
    }
  };

  const handleApprove = (id) => {
    const request = pendingRequests.find((req) => req.id === id);
    if (request) {
      setPendingRequests(pendingRequests.filter((req) => req.id !== id));
      setActiveShares([
        ...activeShares,
        {
          id: request.id,
          doctor: request.doctor,
          spec: request.spec,
          reason: request.reason,
          expiresIn: "30 days",
          status: "Active",
        },
      ]);
    }
  };

  const handleDeny = (id) => {
    if (window.confirm("Deny access request?")) {
      setPendingRequests(pendingRequests.filter((req) => req.id !== id));
    }
  };

  return (
    <div className="mrs-container">
      {/* HEADER & NAV */}
      <div className="mrs-header-nav">
        <button className="mrs-back-btn" onClick={onGoBack}>
          <IconArrowLeft size={18} /> Back to Medical Records
        </button>
      </div>

      <div className="mrs-page-header">
        <div className="mrs-icon-box bg-cyan text-white">
          <IconShare size={28} />
        </div>
        <div className="mrs-title-group">
          <h1 className="mrs-page-title">Medical Records Sharing</h1>
          <p className="mrs-page-subtitle">
            Manage who has access to your sensitive health data
          </p>
        </div>
      </div>

      {/* PRIVACY BANNER */}
      <div className="mrs-banner">
        <IconShieldCheck size={24} className="mrs-banner-icon text-cyan" />
        <div className="mrs-banner-text">
          <h4>Your Privacy is Protected</h4>
          <p>
            All medical records are encrypted and shared securely. You have full
            control over who can access your data and for how long.
          </p>
        </div>
      </div>

      <div className="mrs-actions-row">
        <button className="mrs-btn mrs-btn-primary">
          <IconShare size={18} /> Share Records with New Provider
        </button>
      </div>

      {/* PENDING REQUESTS SECTION */}
      {pendingRequests.length > 0 && (
        <div className="mrs-section">
          <h3 className="mrs-section-title">Pending Access Requests</h3>
          <div className="mrs-grid">
            {pendingRequests.map((req) => (
              <div key={req.id} className="mrs-card mrs-card-pending">
                <div className="mrs-card-header">
                  <div className="mrs-avatar bg-gray text-white">
                    <IconUser size={20} />
                  </div>
                  <div className="mrs-doc-info">
                    <h4>{req.doctor}</h4>
                    <span className="text-muted text-sm">{req.spec}</span>
                  </div>
                </div>
                <div className="mrs-card-body">
                  <p className="mrs-reason">{req.reason}</p>
                  <p className="mrs-meta flex-icon text-muted text-sm">
                    <IconClock size={14} /> Requested {req.dateRequested}
                  </p>
                </div>
                <div className="mrs-card-actions">
                  <button
                    className="mrs-btn mrs-btn-outline-red flex-1"
                    onClick={() => handleDeny(req.id)}
                  >
                    <IconX size={16} /> Deny
                  </button>
                  <button
                    className="mrs-btn mrs-btn-cyan flex-1"
                    onClick={() => handleApprove(req.id)}
                  >
                    <IconCheck size={16} /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE CONSENTS SECTION */}
      <div className="mrs-section">
        <h3 className="mrs-section-title">Active Consents</h3>
        {activeShares.length === 0 ? (
          <div className="mrs-empty-state">
            <IconLock size={40} className="text-muted" />
            <p>You aren't currently sharing records with anyone.</p>
          </div>
        ) : (
          <div className="mrs-grid">
            {activeShares.map((share) => (
              <div key={share.id} className="mrs-card">
                <div className="mrs-card-header">
                  <div className="mrs-avatar bg-cyan text-white">
                    <IconUser size={20} />
                  </div>
                  <div className="mrs-doc-info">
                    <h4>{share.doctor}</h4>
                    <span className="text-muted text-sm">{share.spec}</span>
                  </div>
                </div>
                <div className="mrs-card-body">
                  <p className="mrs-reason">{share.reason}</p>
                  <p className="mrs-meta flex-icon text-orange text-sm">
                    <IconClock size={14} /> Access expires in {share.expiresIn}
                  </p>
                </div>
                <div className="mrs-card-actions">
                  <button
                    className="mrs-btn mrs-btn-outline-red flex-1"
                    onClick={() => handleRevoke(share.id)}
                  >
                    <IconLock size={16} /> Revoke Access
                  </button>
                  <button className="mrs-btn mrs-btn-outline-cyan flex-1">
                    <IconEye size={16} /> View Settings
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER PRIVACY FEATURES (Kept for reassurance) */}
      <div className="mrs-section mt-40">
        <h3 className="mrs-section-title">How your data is protected</h3>
        <div className="mrs-features-grid">
          <div className="mrs-feature-card">
            <div className="mrs-feature-icon bg-light-green text-green">
              <IconShieldCheck size={24} />
            </div>
            <h4>Granular Control</h4>
            <p>Choose exactly which records to share</p>
          </div>
          <div className="mrs-feature-card">
            <div className="mrs-feature-icon bg-light-cyan text-cyan">
              <IconClock size={24} />
            </div>
            <h4>Time-Limited Access</h4>
            <p>Set duration for record access</p>
          </div>
          <div className="mrs-feature-card">
            <div className="mrs-feature-icon bg-light-orange text-orange">
              <IconLockOpen size={24} />
            </div>
            <h4>Revoke Anytime</h4>
            <p>Remove access with one click</p>
          </div>
          <div className="mrs-feature-card">
            <div className="mrs-feature-icon bg-light-cyan text-cyan">
              <IconEye size={24} />
            </div>
            <h4>Audit Trail</h4>
            <p>See who accessed your records</p>
          </div>
        </div>
      </div>
    </div>
  );
}
