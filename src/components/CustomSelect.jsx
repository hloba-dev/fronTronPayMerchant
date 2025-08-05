import React, { useState, useEffect, useRef } from 'react';
import './CustomSelect.css';

export default function CustomSelect({ options, value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);


  return (
    <div className="custom-select-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`custom-select-trigger ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span>{selectedOption.label}</span>
        <span className={`arrow ${isOpen ? 'open' : ''}`}></span>
      </button>

      {isOpen && (
        <div className="custom-options">
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-option ${option.value === value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 