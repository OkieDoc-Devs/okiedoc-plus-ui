import React from 'react';
import { FaInbox, FaUserSlash, FaClipboardList, FaUserMd } from 'react-icons/fa';
import './EmptyState.css';

const EmptyState = ({ type, message, subMessage, actionLabel, onAction }) => {
  const getIcon = () => {
    switch (type) {
      case 'users': return <FaUserSlash />;
      case 'specialists': return <FaUserMd />;
      case 'tickets': return <FaClipboardList />;
      case 'search': return <FaInbox />;
      default: return <FaInbox />;
    }
  };

  return (
    <div className="empty-state-container">
      <div className="empty-state-icon-wrapper">
        {getIcon()}
      </div>
      <h3 className="empty-state-title">{message || "No Data Found"}</h3>
      <p className="empty-state-subtext">
        {subMessage || "There are no records to display at this time."}
      </p>
      {actionLabel && onAction && (
        <button className="empty-state-action-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;