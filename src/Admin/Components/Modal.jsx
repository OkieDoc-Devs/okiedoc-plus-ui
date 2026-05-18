import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../AdminLayout.css';

/**
 * A reusable modal component.
 * Upgraded to use createPortal to escape z-index trapping.
 */
const Modal = ({ children, title, onClose, contentStyle }) => {

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const modalContent = (
    <div className='admin-modal-overlay' onClick={onClose}>
      <div className='admin-modal-content' style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div className='admin-modal-header'>
          <h2>{title}</h2>
          <button className='admin-modal-close-icon' onClick={onClose} title="Close">
            &times;
          </button>
        </div>
        <div className='admin-modal-body'>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;