import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getLessonTypeConfig } from './lessonTypesConfig.js';
import './Lekcja.css';

const Lekcja = ({ lesson, status = 'future', progressPercent = 0 }) => {
  if (!lesson) {
    return (
      <div className={`figma_lesson_card card_state_${status}`}>
        <div className="lesson_card_top">
          <div className="lesson_card_info">
            <h4 className="lesson_card_title">Brak zajęć</h4>
            <p className="lesson_card_teacher">—</p>
          </div>
          <span className="lesson_card_badge">
            <BookIcon />
            <span>Wykład</span>
          </span>
        </div>
        <div className="lesson_card_bottom">
          <p className="lesson_card_location">Miejsce • Sala</p>
          <p className="lesson_card_hours">--:-- – --:--</p>
        </div>
      </div>
    );
  }

  const {
    przedmiot = "Nazwa Przedmiotu",
    typPrzedmiotu = "",
    formaZajec = "",
    grupa = "",
    dydaktyk = "Imię Nazwisko",
    nazwaSali = "Sala",
    lokalizacja = "",
    godzinaOd = "--:--",
    godzinaDo = "--:--"
  } = lesson;

  const locationLabel = lokalizacja ? `${lokalizacja} • ${nazwaSali}` : `Kampus • ${nazwaSali}`;
  const typeConfig = getLessonTypeConfig(typPrzedmiotu || formaZajec, przedmiot, grupa);

  return (
    <div className={`figma_lesson_card card_state_${status}`}>
      {/* 2. STAN TRWAJĄCY: Pasek postępu w kafelku (pokazuje ile zajęć minęło) */}
      {status === 'ongoing' && progressPercent > 0 && (
        <div 
          className="lesson_card_progress_fill" 
          style={{ width: `${progressPercent}%` }}
          title={`Zajęcia trwają: minęło ${progressPercent}%`}
        />
      )}

      {/* Górna sekcja: Przedmiot i Prowadzący */}
      <div className="lesson_card_top">
        <h4 className="lesson_card_title" title={przedmiot}>
          {przedmiot}
        </h4>
        <p className="lesson_card_teacher" title={dydaktyk}>
          {dydaktyk}
        </p>
      </div>

      {/* Dolna sekcja: Po lewej Miejsce i Godziny, po prawej Badge typu zajęć */}
      <div className="lesson_card_bottom">
        <div className="lesson_card_bottom_left">
          <p className="lesson_card_location" title={locationLabel}>
            {locationLabel}
          </p>
          <p className="lesson_card_hours">
            {godzinaOd} – {godzinaDo}
          </p>
        </div>
        <span className="lesson_card_badge">
          <FontAwesomeIcon icon={typeConfig.icon} style={{ fontSize: '11px', flexShrink: 0 }} />
          <span>{typeConfig.name}</span>
        </span>
      </div>
    </div>
  );
};

export default Lekcja;