import React from 'react';
import elearningPlaceholderImg from '@/assets/img/Mezczyzna_przy_biurku_e-learning.webp';
import './elearning.css';

function Elearning() {
  return (
    <div className="campus_placeholder_page">
      <div className="campus_placeholder_content">
        <img 
          src={elearningPlaceholderImg} 
          alt="E-learning w przygotowaniu" 
          className="campus_placeholder_img" 
        />
        <h2 className="campus_placeholder_title">Pracujemy nad tym!</h2>
        <p className="campus_placeholder_desc">
          Platforma e-learningowa będzie dostępna już wkrótce. Dziękujemy za cierpliwość! 💻
        </p>
      </div>
    </div>
  );
}

export default Elearning;
