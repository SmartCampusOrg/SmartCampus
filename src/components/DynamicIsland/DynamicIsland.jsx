import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import { 
  STORAGE_KEY, 
  PROFILE_KEY, 
  TEACHER_KEY, 
  MODE_KEY, 
  getCurrentOrUpcomingLesson,
  cleanTeacherName
} from '@/services/scheduleService.js';
import './DynamicIsland.css';

/**
 * Komponent do automatycznego przesuwania tekstu (marquee), gdy jest za długi.
 * Gdy tekst mieści się w kontenerze, pozostaje w 100% statyczny.
 */
const MarqueeText = ({ text, className, speed = 25 }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  const measure = () => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const textWidth = textRef.current.scrollWidth;
      const diff = textWidth - containerWidth;
      if (diff > 4) {
        setScrollDistance(diff + 8);
      } else {
        setScrollDistance(0);
      }
    }
  };

  useLayoutEffect(() => {
    measure();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
    const t = setTimeout(measure, 150);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [text]);

  const duration = Math.max(4.5, Math.min(12, (scrollDistance / speed) + 3));

  return (
    <div 
      ref={containerRef} 
      className={`dynamic_island_marquee_container ${scrollDistance > 0 ? 'is_overflowing' : ''}`}
      style={{
        '--scroll-dist': `${scrollDistance}px`,
        '--scroll-duration': `${duration}s`
      }}
    >
      <div 
        ref={textRef} 
        className={`dynamic_island_marquee_text ${className || ''} ${scrollDistance > 0 ? 'animate_marquee' : ''}`}
      >
        {text}
      </div>
    </div>
  );
};

const DynamicIsland = () => {
  const navigate = useNavigate();
  const [activeData, setActiveData] = useState(null);

  const checkSchedule = () => {
    try {
      const scheduleRaw = localStorage.getItem(STORAGE_KEY);
      if (!scheduleRaw) {
        setActiveData(null);
        return;
      }
      const allLessons = JSON.parse(scheduleRaw);
      if (!Array.isArray(allLessons) || allLessons.length === 0) {
        setActiveData(null);
        return;
      }

      const profileRaw = localStorage.getItem(PROFILE_KEY);
      const profile = profileRaw ? JSON.parse(profileRaw) : null;
      const mode = localStorage.getItem(MODE_KEY) || 'student';
      const teacher = localStorage.getItem(TEACHER_KEY) || '';

      const match = getCurrentOrUpcomingLesson(allLessons, profile, mode, teacher, 15);
      setActiveData(match);
    } catch (e) {
      console.warn('DynamicIsland schedule check error:', e);
      setActiveData(null);
    }
  };

  useEffect(() => {
    checkSchedule();
    // Sprawdzaj co 20 sekund aktualny stan zajęć
    const interval = setInterval(checkSchedule, 20000);

    // Reaguj na zmiany profilu / planu w innych kartach lub po zapisie
    window.addEventListener('storage', checkSchedule);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkSchedule);
    };
  }, []);

  if (!activeData || !activeData.lesson) {
    return null;
  }

  const { lesson, status, minutesUntilStart } = activeData;

  const handleClick = () => {
    navigate('/PlanZajec');
  };

  // Formatowanie sali i przedmiotu
  const room = lesson.nazwaSali ? ` • ${lesson.nazwaSali}` : '';
  const subjectDisplay = `${lesson.przedmiot || 'Zajęcia'}${room}`;
  const teacherDisplay = cleanTeacherName(lesson.dydaktyk) || 'Zajęcia akademickie';

  const tooltipText = status === 'upcoming' 
    ? `Zajęcia za ${minutesUntilStart} min: ${lesson.przedmiot} (${lesson.godzinaOd || ''} - ${lesson.godzinaDo || ''}) • Kliknij, aby otworzyć plan`
    : `Trwają zajęcia: ${lesson.przedmiot} (${lesson.godzinaOd || ''} - ${lesson.godzinaDo || ''}) • Kliknij, aby otworzyć plan`;

  return (
    <AnimatePresence>
      <motion.div 
        className="navbar_dynamic_island"
        onClick={handleClick}
        title={tooltipText}
        initial={{ opacity: 0, scale: 0.85, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.85, x: -10 }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
      >
        <div className="dynamic_island_icon_section">
          <FontAwesomeIcon icon={Icons.faChalkboardUser} className="dynamic_island_icon" />
        </div>
        <div className="dynamic_island_content_section">
          <MarqueeText 
            text={teacherDisplay} 
            className="dynamic_island_teacher" 
          />
          <MarqueeText 
            text={subjectDisplay} 
            className="dynamic_island_subject" 
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DynamicIsland;
