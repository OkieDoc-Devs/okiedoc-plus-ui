import React from 'react';
import '../Specialistdashboard/SpecialistDashboard.css';

/**
 * A reusable modal component.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Content to display inside the modal body.
 * @param {string} props.title - The title to display in the modal header.
 * @param {Function} props.onClose - Function to call when the close button is clicked.
 * @param {object} props.contentStyle - Optional style object to apply to the modal content.
 */
const Modal = ({ children, title, onClose, contentStyle }) => {
  return (
    // Modal overlay to cover the background
    <div className='modal'>
      <div className='modal-content' style={contentStyle}>
        <div className='modal-header'>
          <h2>{title}</h2>
          <span className='close-btn' onClick={onClose}>
            &times;
          </span>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
