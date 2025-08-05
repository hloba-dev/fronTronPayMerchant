import React from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

export default function Modal({ children, onClose }) {
  // Render the modal into a portal at the end of the document body
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
} 