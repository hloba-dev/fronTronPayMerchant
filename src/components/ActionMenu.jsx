import React from 'react';
import ReactDOM from 'react-dom';
import './ActionMenu.css';

export default function ActionMenu({ options, onClose, position }) {
  const menuStyle = {
    top: position.top,
    left: position.left,
  };

  const handleOptionClick = (action) => {
    action();
    onClose();
  };
  
  // Create a portal to render the menu at the body level
  return ReactDOM.createPortal(
    <>
      <div className="action-menu-overlay" onClick={onClose}></div>
      <div className="action-menu-modal" style={menuStyle}>
        {options.map((opt, index) => (
          <button
            key={index}
            className="btn btn-secondary"
            onClick={() => handleOptionClick(opt.action)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>,
    document.body
  );
} 