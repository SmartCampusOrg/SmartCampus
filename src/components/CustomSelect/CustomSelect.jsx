import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './CustomSelect.css';

const CustomSelect = ({ options = [], value, onChange, placeholder, disabled = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Check if iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Automatycznie zamykaj jeśli komponent stał się nieaktywny
  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false);
    }
  }, [disabled, isOpen]);

  const selectedOption = options.find(opt => String(opt.value) === String(value)) || null;

  if (isIOS) {
    return (
      <div className={`custom_select_wrapper ${className} ${disabled ? 'disabled' : ''}`}>
        <select 
          className="custom_select_native" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <FontAwesomeIcon icon={faChevronDown} className="custom_select_icon" />
      </div>
    );
  }

  return (
    <div className={`custom_select_wrapper ${className} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`} ref={containerRef}>
      <div 
        className={`custom_select_trigger ${disabled ? 'disabled' : ''}`}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <FontAwesomeIcon icon={faChevronDown} className="custom_select_icon" />
      </div>

      {isOpen && !disabled && (
        <div className="custom_select_dropdown">
          {options.length > 0 ? (
            options.map(opt => (
              <div 
                key={opt.value}
                className={`custom_select_option ${opt.value === value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="custom_select_empty_notice">Brak dostępnych opcji</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
