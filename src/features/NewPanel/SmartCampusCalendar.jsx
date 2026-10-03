import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import './SmartCampusCalendar.css';

const MONTHS = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
const MONTHS_SHORT = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
const WEEKDAYS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Ndz'];

export default function SmartCampusCalendar({ isDark }) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date()); // Represents the month being viewed
  const [selectedDate, setSelectedDate] = useState(new Date()); // Represents the day clicked
  const [events, setEvents] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingEventId, setEditingEventId] = useState(null);
  const [formData, setFormData] = useState({ title: '', time: 'Cały dzień', details: '' });

  useEffect(() => {
    if (!user) {
      setEvents([]);
      return;
    }

    const q = query(
      collection(db, 'calendar_events'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedEvents = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setEvents(loadedEvents);
    });

    return () => unsubscribe();
  }, [user]);

  // Calendar Logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday=0 to Monday=0
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Month navigation locked to October (9) - February (1)
  const isMinMonth = month === 9; // October
  const isMaxMonth = month === 1; // February
  
  const prevMonth = () => {
    if (isMinMonth) return;
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    if (isMaxMonth) return;
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Formatter helper
  const formatDateString = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  
  // Selected date info
  const selectedDateStr = formatDateString(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const selectedEvents = events.filter(e => e.date === selectedDateStr);

  const today = new Date();
  const isToday = (d) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
  const isSelected = (d) => selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === d;

  const openAddModal = () => {
    if (!user) return alert("Zaloguj się, aby dodać wydarzenie.");
    setModalMode('add');
    setFormData({ title: '', time: 'Cały dzień', details: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (e) => {
    setModalMode('edit');
    setEditingEventId(e.id);
    setFormData({ title: e.title, time: e.time || 'Cały dzień', details: e.details || '' });
    setIsModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.title.trim()) return;
    try {
      if (modalMode === 'add') {
        await addDoc(collection(db, 'calendar_events'), {
          title: formData.title,
          date: selectedDateStr,
          time: formData.time,
          details: formData.details,
          userId: user.uid,
          color: '#1A4971'
        });
      } else {
        await deleteDoc(doc(db, 'calendar_events', editingEventId));
        await addDoc(collection(db, 'calendar_events'), {
          title: formData.title,
          date: selectedDateStr,
          time: formData.time,
          details: formData.details,
          userId: user.uid,
          color: '#1A4971'
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async () => {
    if (editingEventId) {
      await deleteDoc(doc(db, 'calendar_events', editingEventId));
      setIsModalOpen(false);
    }
  };

  const prevMonthName = MONTHS[month === 0 ? 11 : month - 1];
  const nextMonthName = MONTHS[month === 11 ? 0 : month + 1];

  // Obliczanie roku akademickiego na podstawie wyświetlanego miesiąca
  const academicYearStart = month <= 1 ? year - 1 : year; // styczeń i luty należą do poprzedniego roku
  const academicYearEnd = academicYearStart + 1;
  const academicYearString = `${academicYearStart}/${String(academicYearEnd).slice(2)}`;

  return (
    <div className={`custom-calendar-container ${isDark ? 'dark' : 'light'}`}>
      
      {/* HEADER */}
      <div className="cal-header">
        <div className="cal-header-left">
          <span className="cal-subtitle">Kalendarz</span>
          <h2 className="cal-title">
            {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()].toLowerCase()} {selectedDate.getFullYear()}
          </h2>
          <span className="cal-subtext">
            Semestr zimowy <span className="cal-academic-year">{academicYearString}</span>
          </span>
        </div>
        <div className="cal-header-right">
          <div className="cal-month-selector">
            <button onClick={prevMonth} className="icon-btn" disabled={isMinMonth} style={{ opacity: isMinMonth ? 0.3 : 1 }}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span>{MONTHS[month]}</span>
            <button onClick={nextMonth} className="icon-btn" disabled={isMaxMonth} style={{ opacity: isMaxMonth ? 0.3 : 1 }}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </div>

      {/* WEEKDAYS */}
      <div className="cal-weekdays">
        {WEEKDAYS.map((wd, i) => {
          // Highlight current day of week if looking at current month
          const isCurrentWeekday = today.getFullYear() === year && today.getMonth() === month && ((today.getDay() === 0 ? 6 : today.getDay() - 1) === i);
          return (
            <div key={wd} className={`cal-weekday ${isCurrentWeekday ? 'active' : ''}`}>{wd}</div>
          );
        })}
      </div>

      {/* GRID */}
      <div className="cal-grid">
        {/* PREV MONTH PILL */}
        {firstDay > 0 && (
          <div 
            className={`cal-month-pill prev ${isMinMonth ? 'disabled' : ''}`} 
            style={{ gridColumn: `1 / span ${firstDay}` }}
            onClick={prevMonth}
          >
            {firstDay <= 2 ? MONTHS_SHORT[month === 0 ? 11 : month - 1] : MONTHS[month === 0 ? 11 : month - 1]}
          </div>
        )}

        {/* DAYS */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const dayStr = formatDateString(year, month, d);
          const hasEvents = events.some(e => e.date === dayStr);
          
          let className = 'cal-day';
          if (isToday(d)) className += ' today';
          else if (isSelected(d)) className += ' selected';

          return (
            <div 
              key={d} 
              className={className}
              onClick={() => setSelectedDate(new Date(year, month, d))}
            >
              <span>{d}</span>
              {hasEvents && <div className="cal-day-dot" />}
            </div>
          );
        })}

        {/* NEXT MONTH PILL */}
        {((firstDay + daysInMonth) % 7 !== 0) && (
          <div 
            className={`cal-month-pill next ${isMaxMonth ? 'disabled' : ''}`}
            style={{ gridColumn: `${((firstDay + daysInMonth) % 7) + 1} / span ${7 - ((firstDay + daysInMonth) % 7)}` }}
            onClick={nextMonth}
          >
            { (7 - ((firstDay + daysInMonth) % 7)) <= 2 ? MONTHS_SHORT[month === 11 ? 0 : month + 1] : MONTHS[month === 11 ? 0 : month + 1] }
          </div>
        )}
      </div>

      {/* EVENTS SECTION */}
      <div className="cal-events-section">
        <div className="cal-events-header">
          <h3>Wydarzenia z dnia</h3>
          <span className="cal-events-badge">{selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}</span>
        </div>

        <div className="cal-events-list">
          {selectedEvents.length === 0 ? (
            <div className="cal-no-events">Brak wydarzeń w tym dniu.</div>
          ) : (
            selectedEvents.map(e => (
              <div key={e.id} className="cal-event-card" onClick={() => openEditModal(e)} style={{cursor: 'pointer'}}>
                <div className="cal-event-accent" />
                <div className="cal-event-content">
                  <div className="cal-event-title">{e.title}</div>
                  <div className="cal-event-details">
                    {e.time} {e.details ? `• ${e.details}` : ''}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <button className="cal-add-btn" onClick={openAddModal}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
          Dodaj wydarzenie
        </button>
      </div>

      {/* APPLE STYLE MODAL */}
      {isModalOpen && (
        <div className="cal-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            <div className="cal-modal-header">
              <h3>{modalMode === 'add' ? 'Nowe wydarzenie' : 'Edytuj wydarzenie'}</h3>
              <span className="cal-modal-date">{selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}</span>
            </div>
            
            <div className="cal-modal-body">
              <div className="cal-input-group">
                <label>Nazwa wydarzenia</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="np. Kolokwium z analizy"
                  autoFocus
                />
              </div>
              <div className="cal-input-group">
                <label>Godzina</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="time" 
                    value={formData.time === 'Cały dzień' ? '' : formData.time} 
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    disabled={formData.time === 'Cały dzień'}
                    style={{ flexGrow: 1 }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0, fontWeight: 500, color: 'var(--color-text)' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: '16px', height: '16px', accentColor: '#1c3647', cursor: 'pointer' }}
                      checked={formData.time === 'Cały dzień'}
                      onChange={(e) => setFormData({...formData, time: e.target.checked ? 'Cały dzień' : '10:00'})}
                    />
                    Cały dzień
                  </label>
                </div>
              </div>
              <div className="cal-input-group">
                <label>Dodatkowe informacje</label>
                <input 
                  type="text" 
                  value={formData.details} 
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  placeholder="np. sala 202A, kolokwium, egzamin..."
                />
              </div>
            </div>

            <div className="cal-modal-footer">
              {modalMode === 'edit' && (
                <button className="cal-btn-delete" onClick={handleDeleteEvent}>Usuń</button>
              )}
              <div style={{ flexGrow: 1 }} />
              <button className="cal-btn-cancel" onClick={() => setIsModalOpen(false)}>Anuluj</button>
              <button className="cal-btn-save" onClick={handleSaveEvent} disabled={!formData.title.trim()}>Zapisz</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
