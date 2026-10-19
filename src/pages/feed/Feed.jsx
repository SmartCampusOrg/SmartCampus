import React from 'react';
import feedPlaceholderImg from '@/assets/img/Mezczyzna_ze_smartfonem_feed.webp';
import './Feed.css';

function Feed() {
  return (
    <div className="campus_placeholder_page">
      <div className="campus_placeholder_content">
        <img 
          src={feedPlaceholderImg} 
          alt="Aktualności w przygotowaniu" 
          className="campus_placeholder_img" 
        />
        <h2 className="campus_placeholder_title">Pracujemy nad tym!</h2>
        <p className="campus_placeholder_desc">
          Sekcja aktualności będzie dostępna już wkrótce. Zaglądaj tu regularnie! 📱
        </p>
      </div>
    </div>
  );
}

export default Feed;
