import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './CustomDropdown.css';

export default function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  icon: Icon,
  bordered = false,
  showClear = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to find display label for the current value
  const selectedOption = options.find((opt) => {
    const val = typeof opt === 'object' ? opt.value : opt;
    return val === value;
  });
  
  const displayLabel = selectedOption
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : (value || placeholder);

  return (
    <div 
      className={`custom-select-container ${bordered ? 'custom-select-container--bordered' : ''}`} 
      ref={dropdownRef}
    >
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="custom-select-left">
          {Icon && <Icon size={18} className="custom-select-icon" />}
          <span className="custom-select-value">{displayLabel}</span>
        </div>
        <ChevronDown size={14} className={`custom-select-arrow ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="custom-select-options card-glass">
          {/* Default/Placeholder Option */}
          {showClear && (
            <div
              className={`custom-select-option ${!value ? 'selected' : ''}`}
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
            >
              {placeholder}
            </div>
          )}
          
          {/* Mapped Options */}
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            
            return (
              <div
                key={optVal}
                className={`custom-select-option ${value === optVal ? 'selected' : ''}`}
                onClick={() => {
                  onChange(optVal);
                  setIsOpen(false);
                }}
              >
                {optLabel}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

