import React from 'react';
import LogoFull from '../Logo/LogoFull';
import './LoadingSpinner.css';

const LoadingSpinner = ({ text, transparent = false, showLogo = true }) => {
    return (
        <div className={`LoadingSpinner ${transparent ? 'transparent' : ''}`}>
            <div className="LoadingSpinner_container">
                {showLogo && <LogoFull />}
                <div className="LoadingSpinner_spinner"></div>
                {text && <p className="LoadingSpinner_text">{text}</p>}
            </div>
        </div>
    );
};

export default LoadingSpinner;
