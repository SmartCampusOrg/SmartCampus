import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@/assets/icons/icons.js';
import './PlanZajec.css';
import Lekcja from "./Lekcja";
import { isLectureLesson, isExerciseOrLabLesson, getLessonTypeConfig } from "./lessonTypesConfig.js";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch.jsx";
import CustomSelect from "@/components/CustomSelect/CustomSelect.jsx";
import noLessonsImg from "@/assets/img/no_lessons_relax.png";
import lupaImg from "@/assets/img/Lupa.png";
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { useSchedule } from '@/hooks/useSchedule.js';
import { 
  STORAGE_KEY, 
  PROFILE_KEY, 
  TEACHER_KEY, 
  MODE_KEY, 
  LAST_UPDATE_KEY,
  AUTO_FETCH_KEY,
  LAST_FETCH_DATE_KEY,
  extractCohort, 
  getCohortDetails, 
  getMondayOfDate, 
  fetchAndCleanSchedule,
  cleanTeacherName,
  deduplicateLessons,
  defaultWydzialy,
  resolveWydzialForKierunek,
  normalizeWydzialName,
  kierunekDoWydzialu
} from "@/services/scheduleService.js";

function PlanZajec() {
  const {
    allLessons,
    lastUpdateTime,
    formattedLastUpdate,
    autoFetchOnOpen,
    handleToggleAutoFetch,
    showTermDates,
    handleToggleShowTermDates,
    isFetching,
    fetchLatestSchedule,
    clearScheduleCache
  } = useSchedule();

  const [isLoadingSchedule, setIsLoadingSchedule] = useState(() => {
    return !allLessons || allLessons.length === 0;
  });
  const [activeMode, setActiveMode] = useState("student"); // "student" | "teacher"
  
  // Widok planu: 'cards' (Domyślny, dzienny z kafelkami) | 'list' (Lista tygodniowa) | 'grid' (Siatka: godziny po lewej, dni na górze)
  const [scheduleView, setScheduleView] = useState(() => {
    try {
      return localStorage.getItem('smart_campus_schedule_view') || 'cards';
    } catch {
      return 'cards';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('smart_campus_schedule_view', scheduleView);
    } catch (e) {}
  }, [scheduleView]);

  // Stan wybranego kafelka w widoku siatki lub listy (do okna ze szczegółami)
  const [selectedGridLesson, setSelectedGridLesson] = useState(null);

  // Szybki filtr typu zajęć: 'all' (Wszystkie) | 'lecture' (Wykłady) | 'exercise' (Ćwiczenia i Lab)
  const [lessonTypeFilter, setLessonTypeFilter] = useState(() => {
    try {
      return localStorage.getItem('smart_campus_schedule_type_filter') || 'all';
    } catch {
      return 'all';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('smart_campus_schedule_type_filter', lessonTypeFilter);
    } catch (e) {}
  }, [lessonTypeFilter]);

  // Uwierzytelnienie dla kalendarza
  const { user } = useAuth();

  // Stan wydarzeń z kalendarza
  const [calendarEvents, setCalendarEvents] = useState(() => {
    try {
      const cached = localStorage.getItem('smart_campus_calendar_events');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  // Modal dodawania / edycji wydarzenia z kalendarza
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventModalMode, setEventModalMode] = useState('add'); // 'add' | 'edit'
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventFormData, setEventFormData] = useState({ title: '', time: 'Cały dzień', details: '' });

  // Subskrypcja wydarzeń z Firestore w czasie rzeczywistym
  useEffect(() => {
    if (!user) {
      return;
    }

    const q = query(
      collection(db, 'calendar_events'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setCalendarEvents(loaded);
      try {
        localStorage.setItem('smart_campus_calendar_events', JSON.stringify(loaded));
      } catch (e) {}
    }, (err) => {
      console.warn("Błąd subskrypcji wydarzeń kalendarza:", err);
    });

    return () => unsubscribe();
  }, [user]);
  
  // Popover zębatki ustawień planu zajęć
  const [isSyncMenuOpen, setIsSyncMenuOpen] = useState(false);
  const syncMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (syncMenuRef.current && !syncMenuRef.current.contains(e.target)) {
        setIsSyncMenuOpen(false);
      }
    };
    if (isSyncMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSyncMenuOpen]);
  
  // Filtry Studenta (Kaskada)
  const [filterWydzial, setFilterWydzial] = useState("");
  const [filterKierunek, setFilterKierunek] = useState("");
  const [filterForma, setFilterForma] = useState("");
  const [filterCohort, setFilterCohort] = useState("");
  const [filterSpecjalnosc, setFilterSpecjalnosc] = useState("");
  const [filterGrupa, setFilterGrupa] = useState("");

  // Filtr Wykładowcy
  const [selectedTeacher, setSelectedTeacher] = useState(() => {
    return localStorage.getItem(TEACHER_KEY) || "";
  });
  const [teacherSearchQuery, setTeacherSearchQuery] = useState(() => {
    return localStorage.getItem(TEACHER_KEY) || "";
  });
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const teacherSearchRef = useRef(null);

  useEffect(() => {
    const handleClickOutsideTeacher = (e) => {
      if (teacherSearchRef.current && !teacherSearchRef.current.contains(e.target)) {
        setIsTeacherDropdownOpen(false);
        if (selectedTeacher) {
          setTeacherSearchQuery(selectedTeacher);
        }
      }
    };
    if (isTeacherDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutsideTeacher);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideTeacher);
    };
  }, [isTeacherDropdownOpen, selectedTeacher]);

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setTeacherSearchQuery(teacher);
    setIsTeacherDropdownOpen(false);
  };

  const handleClearTeacher = (e) => {
    e.stopPropagation();
    setSelectedTeacher("");
    setTeacherSearchQuery("");
    setIsTeacherDropdownOpen(true);
  };

  // Wybrany dzień zajęć
  const [selectedDate, setSelectedDate] = useState("");

  // Stan modalu wyboru grupy / filtrów
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const location = useLocation();

  // 1a. Obsługa bezpośredniego przejścia z wyszukiwarki globalnej do wybranego dydaktyka
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const teacherParam = params.get('dydaktyk') || params.get('teacher');
    const teacherFromState = location.state?.teacher;
    const targetTeacher = teacherFromState || teacherParam;

    if (targetTeacher) {
      setActiveMode('teacher');
      setSelectedTeacher(targetTeacher);
      setTeacherSearchQuery(targetTeacher);
      try {
        localStorage.setItem(MODE_KEY, 'teacher');
        localStorage.setItem(TEACHER_KEY, targetTeacher);
      } catch (e) {}
    } else if (location.state?.mode === 'teacher') {
      setActiveMode('teacher');
    }
  }, [location.state, location.search]);

  // 1. Sprawdzanie i ładowanie planu z localStorage / pobieranie z API
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(MODE_KEY);
      if (savedMode) setActiveMode(savedMode);

      const savedProfile = localStorage.getItem(PROFILE_KEY);
      if (savedProfile) {
        const prof = JSON.parse(savedProfile);
        if (prof.wydzial) setFilterWydzial(prof.wydzial);
        if (prof.kierunek) setFilterKierunek(prof.kierunek);
        if (prof.forma) setFilterForma(prof.forma);
        if (prof.cohort) setFilterCohort(prof.cohort);
        if (prof.specjalnosc) setFilterSpecjalnosc(prof.specjalnosc);
        if (prof.grupa) setFilterGrupa(prof.grupa);
      }

      const savedTeacher = localStorage.getItem(TEACHER_KEY);
      if (savedTeacher) {
        setSelectedTeacher(savedTeacher);
        setTeacherSearchQuery(savedTeacher);
      }
    } catch (e) {
      console.error("Błąd odczytu z localStorage:", e);
    }

    const hasData = allLessons && allLessons.length > 0;
    const now = new Date();
    const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Sprawdzamy datę ostatniej aktualizacji (raz dziennie)
    let lastDailyDate = localStorage.getItem(LAST_FETCH_DATE_KEY);
    if (!lastDailyDate) {
      const savedTime = localStorage.getItem(LAST_UPDATE_KEY);
      if (savedTime) {
        lastDailyDate = savedTime.substring(0, 10);
      }
    }
    const isFirstRunToday = lastDailyDate !== todayDateStr;
    const shouldFetchEveryOpen = localStorage.getItem(AUTO_FETCH_KEY) === 'true';

    // 1. Jeśli brak w localStorage, automatycznie pobieramy z serwera uczelni
    if (!hasData) {
      fetchLatestSchedule().finally(() => {
        setIsLoadingSchedule(false);
      });
    } else {
      setIsLoadingSchedule(false);
      if (isFirstRunToday || shouldFetchEveryOpen) {
        // 2. Automatyczna aktualizacja raz dziennie przy pierwszym uruchomieniu (lub przy każdym wejściu, jeśli włączono w opcjach)
        fetchLatestSchedule();
      }
    }
  }, []);

  // 2. Zapisywanie profilu studenta do localStorage
  useEffect(() => {
    if (filterGrupa) {
      const profile = {
        wydzial: filterWydzial,
        kierunek: filterKierunek,
        forma: filterForma,
        cohort: filterCohort,
        specjalnosc: filterSpecjalnosc,
        grupa: filterGrupa
      };
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      } catch (e) {}
    }
  }, [filterWydzial, filterKierunek, filterForma, filterCohort, filterSpecjalnosc, filterGrupa]);

  // 3. Zapisywanie wybranego nauczyciela i trybu
  useEffect(() => {
    try {
      if (selectedTeacher) localStorage.setItem(TEACHER_KEY, selectedTeacher);
      localStorage.setItem(MODE_KEY, activeMode);
    } catch (e) {}
  }, [selectedTeacher, activeMode]);

  // 4. Pobieranie danych z serwera uczelni
  const fetchAndCleanData = async () => {
    try {
      await fetchLatestSchedule();
    } catch (error) {
      console.error("Błąd podczas pobierania:", error);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const handleClearCache = () => {
    if (window.confirm("Czy na pewno chcesz usunąć zapisany plan z pamięci przeglądarki?")) {
      clearScheduleCache();
      try {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(TEACHER_KEY);
      } catch (e) {}
      setFilterWydzial("");
      setFilterKierunek("");
      setFilterForma("");
      setFilterCohort("");
      setFilterSpecjalnosc("");
      setFilterGrupa("");
      setSelectedTeacher("");
      setSelectedDate("");
      alert("Pamięć podręczna została wyczyszczona.");
    }
  };

  // Referencyjna data do wyliczania semestrów
  const scheduleReferenceDate = useMemo(() => {
    if (selectedDate) return selectedDate;
    return new Date();
  }, [selectedDate]);

  // Pamięć podręczna wyborów filtrów dla każdego wydziału (aby przy przełączaniu nie tracić ustawień)
  const [facultyFilterCache, setFacultyFilterCache] = useState(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.wydzial) {
          return {
            [p.wydzial]: {
              kierunek: p.kierunek || "",
              forma: p.forma || "",
              cohort: p.cohort || "",
              specjalnosc: p.specjalnosc || "",
              grupa: p.grupa || ""
            }
          };
        }
      }
    } catch (e) {}
    return {};
  });

  const handleWydzialChangeInPlan = (newWydzial) => {
    if (filterWydzial && (filterKierunek || filterForma || filterGrupa)) {
      setFacultyFilterCache(prev => ({
        ...prev,
        [filterWydzial]: {
          kierunek: filterKierunek,
          forma: filterForma,
          cohort: filterCohort,
          specjalnosc: filterSpecjalnosc,
          grupa: filterGrupa
        }
      }));
    }

    setFilterWydzial(newWydzial);

    const cached = facultyFilterCache[newWydzial];
    if (cached) {
      setFilterKierunek(cached.kierunek || "");
      setFilterForma(cached.forma || "");
      setFilterCohort(cached.cohort || "");
      setFilterSpecjalnosc(cached.specjalnosc || "");
      setFilterGrupa(cached.grupa || "");
    } else {
      const belongs = filterKierunek && (resolveWydzialForKierunek(filterKierunek, '') === normalizeWydzialName(newWydzial));
      if (!belongs) {
        setFilterKierunek("");
        setFilterForma("");
        setFilterCohort("");
        setFilterSpecjalnosc("");
        setFilterGrupa("");
      }
    }
  };

  // Kaskada filtrów
  const availableWydzialy = useMemo(() => {
    if (!allLessons || allLessons.length === 0) return defaultWydzialy;
    const fromData = [...new Set(allLessons.map(l => normalizeWydzialName(l.wydzial) || resolveWydzialForKierunek(l.kierunek)).filter(Boolean))].sort();
    return fromData.length > 0 ? fromData : defaultWydzialy;
  }, [allLessons]);

  const availableKierunki = useMemo(() => {
    if (!filterWydzial) return [];
    const normW = normalizeWydzialName(filterWydzial);
    const fromLessons = (allLessons && allLessons.length > 0)
      ? allLessons
          .filter(l => (normalizeWydzialName(l.wydzial) || resolveWydzialForKierunek(l.kierunek)) === normW)
          .map(l => l.kierunek)
          .filter(Boolean)
      : [];
    const fallbackKierunki = Object.entries(kierunekDoWydzialu)
      .filter(([_, w]) => normalizeWydzialName(w) === normW)
      .map(([k]) => k);
    return [...new Set([...fromLessons, ...fallbackKierunki])].sort((a, b) => a.localeCompare(b));
  }, [allLessons, filterWydzial]);

  const availableFormy = useMemo(() => {
    if (!filterWydzial || !filterKierunek || !allLessons || allLessons.length === 0) return [];
    const normW = normalizeWydzialName(filterWydzial);
    return [...new Set(
      allLessons
        .filter(l => (normalizeWydzialName(l.wydzial) || resolveWydzialForKierunek(l.kierunek)) === normW && l.kierunek === filterKierunek)
        .map(l => l.forma)
        .filter(Boolean)
    )].sort();
  }, [allLessons, filterWydzial, filterKierunek]);

  const availableCohorts = useMemo(() => {
    if (!filterWydzial || !filterKierunek || !filterForma || !allLessons || allLessons.length === 0) return [];
    const normW = normalizeWydzialName(filterWydzial);
    const relevant = allLessons.filter(l => 
      (normalizeWydzialName(l.wydzial) || resolveWydzialForKierunek(l.kierunek)) === normW && 
      l.kierunek === filterKierunek && 
      l.forma === filterForma
    );
    const set = new Set();
    relevant.forEach(l => {
      const c = extractCohort(l.grupa);
      if (c) set.add(c);
    });
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [allLessons, filterWydzial, filterKierunek, filterForma]);

  const availableSpecialities = useMemo(() => {
    if (!filterWydzial || !filterKierunek || !filterForma || !allLessons || allLessons.length === 0) return [];
    const normW = normalizeWydzialName(filterWydzial);
    return [...new Set(
      allLessons
        .filter(l => 
          (normalizeWydzialName(l.wydzial) || resolveWydzialForKierunek(l.kierunek)) === normW && 
          l.kierunek === filterKierunek && 
          l.forma === filterForma &&
          (!filterCohort || extractCohort(l.grupa) === filterCohort)
        )
        .map(l => l.specjalnosc)
        .filter(Boolean)
    )].sort();
  }, [allLessons, filterWydzial, filterKierunek, filterForma, filterCohort]);

  const availableGroups = useMemo(() => {
    if (!filterWydzial || !filterKierunek || !filterForma || !allLessons || allLessons.length === 0) return [];
    const normW = normalizeWydzialName(filterWydzial);
    return [...new Set(
      allLessons
        .filter(l => 
          (normalizeWydzialName(l.wydzial) || resolveWydzialForKierunek(l.kierunek)) === normW && 
          l.kierunek === filterKierunek && 
          l.forma === filterForma &&
          (!filterCohort || extractCohort(l.grupa) === filterCohort) &&
          (!filterSpecjalnosc || l.specjalnosc === filterSpecjalnosc)
        )
        .map(l => l.grupa)
        .filter(Boolean)
    )].sort();
  }, [allLessons, filterWydzial, filterKierunek, filterForma, filterCohort, filterSpecjalnosc]);

  const availableTeachers = useMemo(() => {
    if (!allLessons || allLessons.length === 0) return [];
    return [...new Set(allLessons.map(l => l.dydaktyk).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [allLessons]);

  const filteredTeachersList = useMemo(() => {
    if (!teacherSearchQuery.trim()) return availableTeachers;
    const q = teacherSearchQuery.toLowerCase();
    return availableTeachers.filter(t => t.toLowerCase().includes(q));
  }, [availableTeachers, teacherSearchQuery]);

  // Filtrowanie zajęć dla wybranego studenta lub wykładowcy
  const filteredLessons = useMemo(() => {
    if (!allLessons || allLessons.length === 0) return [];

    let candidates = [];

    if (activeMode === "teacher") {
      if (!selectedTeacher) return [];
      const target = cleanTeacherName(selectedTeacher).toLowerCase();
      candidates = allLessons.filter(l => cleanTeacherName(l.dydaktyk).toLowerCase() === target);
      return deduplicateLessons(candidates);
    }

    if (!filterGrupa) return [];

    const w = filterWydzial;
    const k = filterKierunek;
    const f = filterForma;
    const s = filterSpecjalnosc;
    const g = filterGrupa;

    const userCohort = filterCohort || extractCohort(g);
    const userSemester = userCohort ? getCohortDetails(userCohort, scheduleReferenceDate)?.semester : '';

    const getGroupSignature = (gn) => {
      if (!gn) return '';
      let str = gn.toLowerCase().replace(/[.,_]/g, ' ').replace(/\s+/g, ' ');
      const stops = [
        'ćwiczeniowa','cwiczeniowa','wykładowa','wykladowa','laboratoryjna','lab',
        'grupa','gr','stopnia','z','l','s','dzienna','zaoczne','stac','nst','ns',
        'stacjonarne','niestacjonarne','informatyka','ekonomia','zarządzanie',
        'rolnictwo','pedagogika','i','ii','iii','iv','v'
      ];
      return str.trim().split(' ').filter(word => word.length > 1 && !stops.includes(word)).join(' ');
    };

    candidates = allLessons.filter(l => {
      const itemWydzial = l.wydzial || resolveWydzialForKierunek(l.kierunek);
      if (itemWydzial !== w || l.kierunek !== k || l.forma !== f) return false;

      const isSpecMatch = !l.specjalnosc || 
                          l.specjalnosc === s || 
                          l.specjalnosc.toLowerCase().includes('ogóln') || 
                          l.specjalnosc.toLowerCase().includes('ogoln');

      // 1. Bezpośrednie dopasowanie grupy ćwiczeniowej/laboratoryjnej studenta
      if (l.grupa === g && (l.specjalnosc === s || isSpecMatch)) return true;

      // 2. Automatyczne dołączanie wspólnych wykładów rocznika
      if (isLectureLesson(l) && isSpecMatch) {
        const itemCohort = extractCohort(l.grupa);
        if (userCohort && itemCohort) {
          if (itemCohort === userCohort) return true;
        } else if (l.semestr && userSemester) {
          if (String(l.semestr) === String(userSemester)) return true;
        } else {
          const lSig = getGroupSignature(l.grupa);
          const tSig = getGroupSignature(g);
          if (!lSig || !tSig || lSig === tSig || tSig.includes(lSig) || lSig.includes(tSig)) {
            return true;
          }
        }
      }

      return false;
    });

    return deduplicateLessons(candidates, g);
  }, [allLessons, activeMode, selectedTeacher, filterWydzial, filterKierunek, filterForma, filterCohort, filterSpecjalnosc, filterGrupa, scheduleReferenceDate]);

  // Dostępne unikalne daty
  const availableDates = useMemo(() => {
    if (!filteredLessons || filteredLessons.length === 0) return [];
    return [...new Set(filteredLessons.map(l => l.dataZajec ? l.dataZajec.substring(0, 10) : "").filter(Boolean))].sort();
  }, [filteredLessons]);

  // Zbiór dat z zajęciami (do kropek pod dniami)
  const datesWithLessonsSet = useMemo(() => {
    return new Set(availableDates);
  }, [availableDates]);

  // Dynamiczne wyliczanie tygodni / zjazdów na podstawie FAKTYCZNYCH zajęć w planie
  const weeksWithLessons = useMemo(() => {
    if (!availableDates || availableDates.length === 0) return [];

    // Mapowanie poniedziałku każdego tygodnia na listę dat zajęć w tym tygodniu
    const weekMap = new Map();
    availableDates.forEach(dateStr => {
      const monDate = getMondayOfDate(dateStr);
      const y = monDate.getFullYear();
      const m = String(monDate.getMonth() + 1).padStart(2, '0');
      const d = String(monDate.getDate()).padStart(2, '0');
      const mondayStr = `${y}-${m}-${d}`;

      if (!weekMap.has(mondayStr)) {
        weekMap.set(mondayStr, []);
      }
      weekMap.get(mondayStr).push(dateStr);
    });

    const sortedMondays = [...weekMap.keys()].sort();

    const isNiestac = (filterForma || '').toLowerCase().includes('niestac') ||
                      (filterGrupa || '').toLowerCase().includes('niestac') ||
                      (filterGrupa || '').toLowerCase().includes(' ns');

    return sortedMondays.map((mondayStr, index) => {
      const lessonDates = weekMap.get(mondayStr).sort();
      const num = index + 1;
      const label = isNiestac ? `Zjazd ${num}` : `Tydzień ${num}`;

      return {
        index,
        num,
        mondayStr,
        label,
        lessonDates
      };
    });
  }, [availableDates, filterForma, filterGrupa]);

  // Aktywny indeks tygodnia / zjazdu
  const currentWeekIndex = useMemo(() => {
    if (weeksWithLessons.length === 0) return 0;
    if (!selectedDate) return 0;

    const monDate = getMondayOfDate(selectedDate);
    const y = monDate.getFullYear();
    const m = String(monDate.getMonth() + 1).padStart(2, '0');
    const d = String(monDate.getDate()).padStart(2, '0');
    const curMondayStr = `${y}-${m}-${d}`;

    const foundIdx = weeksWithLessons.findIndex(w => w.mondayStr === curMondayStr);
    return foundIdx !== -1 ? foundIdx : 0;
  }, [weeksWithLessons, selectedDate]);

  // Domyślny aktywny dzień (ustawiany tylko przy zmianie grupy/filtrów lub pierwszym załadowaniu)
  useEffect(() => {
    if (availableDates.length > 0) {
      const todayStr = new Date().toISOString().substring(0, 10);
      const isDateValid = selectedDate && (
        availableDates.includes(selectedDate) ||
        weeksWithLessons.some(w => {
          const monDate = getMondayOfDate(selectedDate);
          const y = monDate.getFullYear();
          const m = String(monDate.getMonth() + 1).padStart(2, '0');
          const d = String(monDate.getDate()).padStart(2, '0');
          return w.mondayStr === `${y}-${m}-${d}`;
        })
      );

      if (!isDateValid) {
        const closestDate = availableDates.find(d => d >= todayStr) || availableDates[0];
        setSelectedDate(closestDate);
      }
    } else if (!selectedDate) {
      setSelectedDate(new Date().toISOString().substring(0, 10));
    }
  }, [availableDates]);

  // Zajęcia na wybrany dzień
  const lessonsForSelectedDay = useMemo(() => {
    if (!selectedDate || filteredLessons.length === 0) return [];
    const dayLessons = filteredLessons
      .filter(l => l.dataZajec && l.dataZajec.substring(0, 10) === selectedDate)
      .sort((a, b) => (a.godzinaOd || "").localeCompare(b.godzinaOd || ""));
    return deduplicateLessons(dayLessons, filterGrupa);
  }, [filteredLessons, selectedDate, filterGrupa]);

  // Odfiltrowane zajęcia na wybrany dzień według wybranego typu (Wszystkie / Wykłady / Ćwiczenia i Lab)
  const displayedLessons = useMemo(() => {
    if (!lessonsForSelectedDay || lessonsForSelectedDay.length === 0) return [];
    if (lessonTypeFilter === 'lecture') {
      return lessonsForSelectedDay.filter(isLectureLesson);
    }
    if (lessonTypeFilter === 'exercise') {
      return lessonsForSelectedDay.filter(isExerciseOrLabLesson);
    }
    return lessonsForSelectedDay;
  }, [lessonsForSelectedDay, lessonTypeFilter]);

  const lectureCountForDay = useMemo(() => {
    return lessonsForSelectedDay.filter(isLectureLesson).length;
  }, [lessonsForSelectedDay]);

  const exerciseCountForDay = useMemo(() => {
    return lessonsForSelectedDay.filter(isExerciseOrLabLesson).length;
  }, [lessonsForSelectedDay]);

  // Wyznaczanie 3 stanów kafelka: 1. przeszłe (odbyły się), 2. trwające (progres), 3. przyszłe
  const getLessonState = (lesson, dateStr) => {
    if (!lesson || !dateStr || !lesson.godzinaOd || !lesson.godzinaDo) {
      return { status: 'future', progress: 0 };
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 1. Jeśli dzień jest w przeszłości -> zajęcia już się odbyły (wyszarzone)
    if (dateStr < todayStr) {
      return { status: 'past', progress: 0 };
    }

    // 2. Jeśli dzień jest w przyszłości -> zajęcia przyszłe (czysty kafelek)
    if (dateStr > todayStr) {
      return { status: 'future', progress: 0 };
    }

    // 3. Dzisiaj: sprawdzamy godziny rozpoczęcia i zakończenia
    const currentMinutes = today.getHours() * 60 + today.getMinutes();

    const [fromH, fromM] = lesson.godzinaOd.split(':').map(Number);
    const [toH, toM] = lesson.godzinaDo.split(':').map(Number);
    const startMinutes = fromH * 60 + fromM;
    const endMinutes = toH * 60 + toM;

    if (currentMinutes > endMinutes) {
      return { status: 'past', progress: 0 };
    }

    if (currentMinutes < startMinutes) {
      return { status: 'future', progress: 0 };
    }

    // Zajęcia trwają teraz: stan 2 z tłem postępu
    const total = endMinutes - startMinutes;
    const elapsed = currentMinutes - startMinutes;
    const progress = total > 0 ? Math.min(100, Math.max(8, Math.round((elapsed / total) * 100))) : 50;

    return { status: 'ongoing', progress };
  };

  // Etykieta przycisku wyboru grupy w stylu Figma (np. "Informatyka 2022 NS • Gr2")
  const groupPillLabel = useMemo(() => {
    if (activeMode === 'teacher') {
      return selectedTeacher ? `👨‍🏫 ${selectedTeacher}` : 'Wybierz wykładowcę';
    }
    if (!filterGrupa) {
      return 'Wybierz grupę / plan';
    }
    const c = filterCohort || extractCohort(filterGrupa);
    const formaSkrot = filterForma === 'Niestacjonarne' ? 'NS' : (filterForma === 'Stacjonarne' ? 'ST' : '');
    const k = filterKierunek || 'Plan';

    let gClean = filterGrupa;
    if (k && gClean.startsWith(k)) {
      gClean = gClean.replace(k, '').trim();
    }

    return `${k}${c ? ' ' + c : ''}${formaSkrot ? ' ' + formaSkrot : ''} • ${gClean}`;
  }, [activeMode, selectedTeacher, filterGrupa, filterKierunek, filterCohort, filterForma]);

  // Formater nagłówka daty (np. "18 Maj 2026 • Poniedziałek")
  const formattedHeaderDate = useMemo(() => {
    if (!selectedDate) return 'Wybierz dzień';
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return selectedDate;
    const [y, m, d] = parts.map(Number);
    const date = new Date(y, m - 1, d);
    const months = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    const weekdays = [
      'Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'
    ];
    return `${d} ${months[m - 1]} ${y} • ${weekdays[date.getDay()]}`;
  }, [selectedDate]);

  // 7 dni w bieżącym zjeździe / tygodniu
  const currentWeekDays = useMemo(() => {
    let activeMondayStr = weeksWithLessons[currentWeekIndex]?.mondayStr;
    if (!activeMondayStr && selectedDate) {
      const mon = getMondayOfDate(selectedDate);
      const y = mon.getFullYear();
      const m = String(mon.getMonth() + 1).padStart(2, '0');
      const d = String(mon.getDate()).padStart(2, '0');
      activeMondayStr = `${y}-${m}-${d}`;
    }
    
    const monday = getMondayOfDate(activeMondayStr || new Date().toISOString().substring(0, 10));
    const shortNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Ndz'];
    const longNames = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

    return [0, 1, 2, 3, 4, 5, 6].map(offset => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset, 12, 0, 0);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayNum}`;
      return {
        dateStr,
        shortName: shortNames[offset],
        longName: longNames[offset],
        dayNum: d.getDate(),
        fullDate: d
      };
    });
  }, [weeksWithLessons, currentWeekIndex, selectedDate]);

  // Nawigacja strzałkami < i > (przełączanie między zjazdami / tygodniami z zajęciami)
  const handlePrevWeek = () => {
    if (weeksWithLessons.length === 0) return;
    const newIdx = Math.max(0, currentWeekIndex - 1);
    const targetWeek = weeksWithLessons[newIdx];
    if (targetWeek) {
      const nextDate = targetWeek.lessonDates[0] || targetWeek.mondayStr;
      setSelectedDate(nextDate);
    }
  };

  const handleNextWeek = () => {
    if (weeksWithLessons.length === 0) return;
    const newIdx = Math.min(weeksWithLessons.length - 1, currentWeekIndex + 1);
    const targetWeek = weeksWithLessons[newIdx];
    if (targetWeek) {
      const nextDate = targetWeek.lessonDates[0] || targetWeek.mondayStr;
      setSelectedDate(nextDate);
    }
  };

  const handleWeekSelectChange = (newIdx) => {
    const targetWeek = weeksWithLessons[newIdx];
    if (targetWeek) {
      const nextDate = targetWeek.lessonDates[0] || targetWeek.mondayStr;
      setSelectedDate(nextDate);
    }
  };

  const weekOptions = useMemo(() => {
    if (!weeksWithLessons || weeksWithLessons.length === 0) {
      return [{ value: 0, label: "Brak terminów" }];
    }
    return weeksWithLessons.map(week => {
      let label = week.label;
      if (showTermDates) {
        let startStr = week.lessonDates && week.lessonDates.length > 0 ? week.lessonDates[0] : week.mondayStr;
        let endStr = week.lessonDates && week.lessonDates.length > 0 ? week.lessonDates[week.lessonDates.length - 1] : null;
        if (!endStr && week.mondayStr) {
          const mon = getMondayOfDate(week.mondayStr);
          const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
          endStr = `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, '0')}-${String(sun.getDate()).padStart(2, '0')}`;
        }

        const formatShort = (s) => {
          if (!s || s.length < 10) return '';
          return `${s.substring(8, 10)}.${s.substring(5, 7)}`;
        };

        const startFormatted = formatShort(startStr);
        const endFormatted = formatShort(endStr);

        if (startFormatted && endFormatted && startFormatted !== endFormatted) {
          label = `${week.label} • ${startFormatted} – ${endFormatted}`;
        } else if (startFormatted) {
          label = `${week.label} • ${startFormatted}`;
        }
      }
      return {
        value: week.index,
        label
      };
    });
  }, [weeksWithLessons, showTermDates]);

  const todayDateStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const isSelectedToday = selectedDate === todayDateStr;

  const handleToday = () => {
    setSelectedDate(todayDateStr);
  };

  const isSelectedDirectionEmpty = useMemo(() => {
    if (activeMode !== "student" || !filterKierunek) return false;
    const count = allLessons.filter(l => l.kierunek === filterKierunek).length;
    return count === 0;
  }, [allLessons, activeMode, filterKierunek]);

  const isCurrentWeekToday = useMemo(() => {
    return currentWeekDays.some(d => d.dateStr === todayDateStr);
  }, [currentWeekDays, todayDateStr]);

  const formattedWeekSubtitle = useMemo(() => {
    if (currentWeekDays.length === 0) return formattedHeaderDate;
    const firstDay = currentWeekDays[0];
    const lastDay = currentWeekDays[currentWeekDays.length - 1];
    const activeWeek = weeksWithLessons[currentWeekIndex];
    const weekLabel = activeWeek?.label || `Tydzień ${currentWeekIndex + 1}`;
    
    const fD = firstDay.fullDate;
    const lD = lastDay.fullDate;
    const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
    const rangeStr = `${fD.getDate()} ${months[fD.getMonth()]} – ${lD.getDate()} ${months[lD.getMonth()]} ${lD.getFullYear()}`;
    return `${rangeStr} • ${weekLabel}`;
  }, [currentWeekDays, weeksWithLessons, currentWeekIndex, formattedHeaderDate]);

  // Wszystkie zajęcia w bieżącym tygodniu z podziałem na dni (dateStr)
  const currentWeekLessonsByDate = useMemo(() => {
    if (!filteredLessons || filteredLessons.length === 0 || currentWeekDays.length === 0) return {};
    
    const dateMap = {};
    currentWeekDays.forEach(day => {
      dateMap[day.dateStr] = [];
    });

    filteredLessons.forEach(l => {
      if (!l.dataZajec) return;
      const dStr = l.dataZajec.substring(0, 10);
      if (dateMap[dStr]) {
        dateMap[dStr].push(l);
      }
    });

    // Sortowanie i deduplikacja dla każdego dnia
    Object.keys(dateMap).forEach(dStr => {
      dateMap[dStr].sort((a, b) => (a.godzinaOd || "").localeCompare(b.godzinaOd || ""));
      dateMap[dStr] = deduplicateLessons(dateMap[dStr], filterGrupa);
    });

    return dateMap;
  }, [filteredLessons, currentWeekDays, filterGrupa]);

  const totalLessonsInCurrentWeek = useMemo(() => {
    return Object.values(currentWeekLessonsByDate).reduce((acc, lessons) => acc + lessons.length, 0);
  }, [currentWeekLessonsByDate]);

  const lectureCountForWeek = useMemo(() => {
    let count = 0;
    Object.values(currentWeekLessonsByDate).forEach(dayLessons => {
      count += dayLessons.filter(isLectureLesson).length;
    });
    return count;
  }, [currentWeekLessonsByDate]);

  const exerciseCountForWeek = useMemo(() => {
    let count = 0;
    Object.values(currentWeekLessonsByDate).forEach(dayLessons => {
      count += dayLessons.filter(isExerciseOrLabLesson).length;
    });
    return count;
  }, [currentWeekLessonsByDate]);

  const GRID_START_HOUR = 8;
  const GRID_END_HOUR = 21;
  const GRID_HOURS = useMemo(() => {
    return Array.from({ length: GRID_END_HOUR - GRID_START_HOUR + 1 }, (_, i) => GRID_START_HOUR + i);
  }, []);

  const computeDayGridLessons = (lessons) => {
    if (!lessons || lessons.length === 0) return [];
    
    let list = lessons;
    if (lessonTypeFilter === 'lecture') {
      list = lessons.filter(isLectureLesson);
    } else if (lessonTypeFilter === 'exercise') {
      list = lessons.filter(isExerciseOrLabLesson);
    }

    const sorted = list.map(l => {
      const [sh, sm] = (l.godzinaOd || '08:00').split(':').map(Number);
      const [eh, em] = (l.godzinaDo || '09:30').split(':').map(Number);
      return {
        ...l,
        _start: (sh || 8) * 60 + (sm || 0),
        _end: (eh || 9) * 60 + (em || 30)
      };
    }).sort((a, b) => a._start - b._start || b._end - a._end);

    const columns = [];
    const placed = [];

    sorted.forEach(l => {
      let col = -1;
      for (let c = 0; c < columns.length; c++) {
        if (columns[c] <= l._start) {
          columns[c] = l._end;
          col = c;
          break;
        }
      }
      if (col === -1) {
        col = columns.length;
        columns.push(l._end);
      }
      placed.push({ item: l, col });
    });

    const totalCols = Math.max(1, columns.length);
    const totalWindowMinutes = (GRID_END_HOUR - GRID_START_HOUR) * 60; // 780 min

    return placed.map(({ item, col }) => {
      const sMin = Math.max(GRID_START_HOUR * 60, Math.min(GRID_END_HOUR * 60, item._start));
      const eMin = Math.max(sMin + 30, Math.min(GRID_END_HOUR * 60, item._end));
      
      const topPercent = ((sMin - GRID_START_HOUR * 60) / totalWindowMinutes) * 100;
      const rawHeight = ((eMin - sMin) / totalWindowMinutes) * 100;
      const heightPercent = Math.max(3.8, Math.min(100 - topPercent, rawHeight));
      
      const widthPercent = 100 / totalCols;
      const leftPercent = col * widthPercent;

      return {
        lesson: item,
        topPercent,
        heightPercent,
        leftPercent,
        widthPercent: totalCols > 1 ? widthPercent - 0.8 : 100
      };
    });
  };

  const currentGridTimePercent = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes() - (GRID_START_HOUR * 60);
    const totalWindowMinutes = (GRID_END_HOUR - GRID_START_HOUR) * 60;
    if (currentMinutes >= 0 && currentMinutes <= totalWindowMinutes) {
      return (currentMinutes / totalWindowMinutes) * 100;
    }
    return null;
  }, []);

  const formatListDayHeader = (dayObj) => {
    if (!dayObj || !dayObj.fullDate) return '';
    const d = dayObj.fullDate;
    const monthsGenitive = [
      'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
      'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
    ];
    return `${dayObj.longName}, ${d.getDate()} ${monthsGenitive[d.getMonth()]}`;
  };

  const formatLessonDate = (dataZajec) => {
    if (!dataZajec) return '';
    const dateStr = String(dataZajec).substring(0, 10);
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts.map(Number);
    const date = new Date(y, m - 1, d);
    const monthsGenitive = [
      'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
      'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
    ];
    const weekdays = [
      'Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'
    ];
    const weekday = weekdays[date.getDay()];
    return `${weekday ? weekday + ', ' : ''}${d} ${monthsGenitive[m - 1] || ''} ${y}`;
  };

  const eventsForCurrentWeek = useMemo(() => {
    if (!Array.isArray(calendarEvents) || currentWeekDays.length === 0) return [];
    const weekDatesSet = new Set(currentWeekDays.map(d => d.dateStr));
    return calendarEvents
      .filter(e => weekDatesSet.has(e.date))
      .sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || ''));
  }, [calendarEvents, currentWeekDays]);

  // Filtrowanie wydarzeń z kalendarza dla wybranego dnia
  const eventsForSelectedDay = useMemo(() => {
    if (!selectedDate || !Array.isArray(calendarEvents)) return [];
    return calendarEvents.filter(e => e.date === selectedDate);
  }, [calendarEvents, selectedDate]);

  // Sformatowana data do modalu dodawania/edycji
  const formattedModalDate = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return selectedDate;
    const [y, m, d] = parts.map(Number);
    const monthsGenitive = [
      'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
      'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
    ];
    return `${d} ${monthsGenitive[m - 1]} ${y}`;
  }, [selectedDate]);

  const openAddEventModal = () => {
    setEventModalMode('add');
    setEditingEventId(null);
    setEventFormData({ title: '', time: 'Cały dzień', details: '' });
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (evt) => {
    setEventModalMode('edit');
    setEditingEventId(evt.id);
    setEventFormData({
      title: evt.title || '',
      time: evt.time || 'Cały dzień',
      details: evt.details || ''
    });
    setIsEventModalOpen(true);
  };

  const handleSaveCalendarEvent = async () => {
    if (!eventFormData.title.trim()) return;
    try {
      if (user) {
        if (eventModalMode === 'add') {
          await addDoc(collection(db, 'calendar_events'), {
            title: eventFormData.title.trim(),
            date: selectedDate,
            time: eventFormData.time,
            details: eventFormData.details.trim(),
            userId: user.uid,
            color: '#1A4971'
          });
        } else if (editingEventId) {
          await deleteDoc(doc(db, 'calendar_events', editingEventId));
          await addDoc(collection(db, 'calendar_events'), {
            title: eventFormData.title.trim(),
            date: selectedDate,
            time: eventFormData.time,
            details: eventFormData.details.trim(),
            userId: user.uid,
            color: '#1A4971'
          });
        }
      } else {
        // Tryb lokalny bez aktywnego konta Google
        const newEvt = {
          id: editingEventId || ('local_' + Date.now()),
          title: eventFormData.title.trim(),
          date: selectedDate,
          time: eventFormData.time,
          details: eventFormData.details.trim(),
          color: '#1A4971'
        };
        setCalendarEvents(prev => {
          const filtered = prev.filter(e => e.id !== (editingEventId || newEvt.id));
          const updated = [...filtered, newEvt];
          try {
            localStorage.setItem('smart_campus_calendar_events', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
      setIsEventModalOpen(false);
    } catch (err) {
      console.error("Błąd zapisu wydarzenia:", err);
    }
  };

  const handleDeleteCalendarEvent = async () => {
    if (!editingEventId) return;
    try {
      if (user && !editingEventId.startsWith('local_')) {
        await deleteDoc(doc(db, 'calendar_events', editingEventId));
      } else {
        setCalendarEvents(prev => {
          const updated = prev.filter(e => e.id !== editingEventId);
          try {
            localStorage.setItem('smart_campus_calendar_events', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
      setIsEventModalOpen(false);
    } catch (err) {
      console.error("Błąd usuwania wydarzenia:", err);
    }
  };

  if (isLoadingSchedule || isFetching) {
    return (
      <div className="figma_plan_page">
        <LoadingSpinner transparent text="Aktualizowanie planu zajęć..." />
      </div>
    );
  }

  return (
    <div className="figma_plan_page">

      {/* 1. GÓRNY PASEK: TYTUŁ PO LEWEJ, PRZEŁĄCZNIK WIDOKÓW, PRZEŁĄCZNIK STUDENT / DYDAKTYK ORAZ ZĘBATKA PO PRAWEJ */}
      <div className="figma_plan_header">
        <div className="figma_plan_title_block">
          <div className="figma_plan_title_row">
            <h1 className="figma_plan_title">Plan zajęć</h1>
            <span className="figma_beta_badge">BETA</span>
          </div>
          <p className="figma_plan_subtitle">
            {scheduleView === 'cards' ? formattedHeaderDate : formattedWeekSubtitle}
          </p>
          <div className="figma_plan_source_caption">
            <strong>Moduł w fazie rozwoju</strong>
            <span className="figma_source_caption_sep">•</span>
            <span>Plan pobierany z uczelni (nie odpowiadamy za błędy w oficjalnym harmonogramie)</span>
          </div>
        </div>

        {/* PRAWA STRONA: PRZEŁĄCZNIK WIDOKÓW, PRZEŁĄCZNIK TRYBU ORAZ ZĘBATKA SYNCHRONIZACJI */}
        <div className="figma_plan_header_actions">
          {/* PRZEŁĄCZNIK WIDOKÓW (Domyślny: Karty / Dzień, Lista, Siatka) */}
          <div className="plan_view_switcher" role="tablist" aria-label="Wybór widoku planu">
            <button 
              type="button"
              role="tab"
              aria-selected={scheduleView === 'cards'}
              className={`plan_view_btn ${scheduleView === 'cards' ? 'active' : ''}`}
              onClick={() => setScheduleView('cards')}
              title="Widok dzienny w formie kart (domyślny)"
            >
              <FontAwesomeIcon icon={Icons.faCalendarDays} className="plan_view_btn_icon" />
              <span className="plan_view_btn_label">Karty</span>
            </button>
            <button 
              type="button"
              role="tab"
              aria-selected={scheduleView === 'list'}
              className={`plan_view_btn ${scheduleView === 'list' ? 'active' : ''}`}
              onClick={() => setScheduleView('list')}
              title="Widok listy tygodniowej (agenda)"
            >
              <FontAwesomeIcon icon={Icons.faListUl} className="plan_view_btn_icon" />
              <span className="plan_view_btn_label">Lista</span>
            </button>
            <button 
              type="button"
              role="tab"
              aria-selected={scheduleView === 'grid'}
              className={`plan_view_btn ${scheduleView === 'grid' ? 'active' : ''}`}
              onClick={() => setScheduleView('grid')}
              title="Widok siatki: godziny po lewej, dni tygodnia na górze"
            >
              <FontAwesomeIcon icon={Icons.faTableCells} className="plan_view_btn_icon" />
              <span className="plan_view_btn_label">Siatka</span>
            </button>
          </div>

          <div className="plan_mode_toggle">
            <div className={`plan_mode_toggle_bg ${activeMode === 'teacher' ? 'right' : ''}`} />
            <button 
              className={`plan_mode_toggle_btn ${activeMode === 'student' ? 'active' : ''}`}
              onClick={() => setActiveMode('student')}
            >
              Student
            </button>
            <button 
              className={`plan_mode_toggle_btn ${activeMode === 'teacher' ? 'active' : ''}`}
              onClick={() => setActiveMode('teacher')}
            >
              Dydaktyk
            </button>
          </div>

          {/* ZĘBATKA Z ROZWIJANYM OKIENKIEM (BIAŁE Z BLUREM) */}
          <div className="plan_sync_popover_anchor" ref={syncMenuRef}>
            <button 
              className={`plan_sync_gear_btn ${isSyncMenuOpen ? 'active' : ''}`}
              onClick={() => setIsSyncMenuOpen(prev => !prev)}
              title="Zarządzaj bazą i synchronizacją planu zajęć"
            >
              <FontAwesomeIcon 
                icon={Icons.faGear} 
                className={`plan_gear_icon ${isFetching ? 'spin' : ''}`} 
              />
            </button>

            {isSyncMenuOpen && (
              <div className="plan_sync_popover">
                <div className="plan_sync_popover_header">
                  <span className="plan_sync_popover_title">Ustawienia planu zajęć</span>
                  <button 
                    className="plan_sync_close_btn"
                    onClick={() => setIsSyncMenuOpen(false)}
                    aria-label="Zamknij"
                    title="Zamknij"
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="1" y1="1" x2="13" y2="13" />
                      <line x1="13" y1="1" x2="1" y2="13" />
                    </svg>
                  </button>
                </div>

                <div className="plan_sync_toggle_card">
                  <div className="plan_sync_toggle_texts">
                    <span className="plan_sync_toggle_title">Pobieraj przy każdym wejściu</span>
                    <span className="plan_sync_toggle_desc">Wymuszaj pobieranie bazy przy każdym otwarciu (domyślnie: raz dziennie)</span>
                  </div>
                  <div className="plan_sync_toggle_switch_wrap">
                    <ToggleSwitch 
                      id="autoFetchScheduleToggle"
                      defaultState={autoFetchOnOpen}
                      onToggle={handleToggleAutoFetch}
                    />
                  </div>
                </div>

                <div className="plan_sync_toggle_card">
                  <div className="plan_sync_toggle_texts">
                    <span className="plan_sync_toggle_title">Pokaż terminy zjazdów i tygodni</span>
                    <span className="plan_sync_toggle_desc">Wyświetlaj zakresy dat przy numerach zjazdów i tygodni w planie</span>
                  </div>
                  <div className="plan_sync_toggle_switch_wrap">
                    <ToggleSwitch 
                      id="autoShowTermDatesToggle"
                      defaultState={showTermDates}
                      onToggle={handleToggleShowTermDates}
                    />
                  </div>
                </div>

                <div className="plan_sync_info_box">
                  <div className="plan_sync_info_row">
                    <span className="plan_sync_info_label">Ostatnia aktualizacja:</span>
                    <span className="plan_sync_info_value">{formattedLastUpdate}</span>
                  </div>
                  <div className="plan_sync_info_divider" />
                  <div className="plan_sync_info_row">
                    <span className="plan_sync_info_label">Tryb aktualizacji:</span>
                    <span className="plan_sync_info_value">{autoFetchOnOpen ? "Przy każdym wejściu" : "Raz dziennie (domyślny)"}</span>
                  </div>
                  <div className="plan_sync_info_divider" />
                  <div className="plan_sync_info_row">
                    <span className="plan_sync_info_label">Zapisane zajęcia w pamięci:</span>
                    <span className="plan_sync_info_value">{allLessons.length}</span>
                  </div>
                </div>

                <div className="plan_sync_popover_actions">
                  <button 
                    className="plan_sync_popover_btn_primary"
                    onClick={() => {
                      fetchAndCleanData();
                    }}
                    disabled={isFetching}
                  >
                    <svg className={`plan_sync_icon ${isFetching ? 'spin' : ''}`} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                    </svg>
                    <span>{isFetching ? "Pobieranie z uczelni..." : "Pobierz najnowszy plan"}</span>
                  </button>

                  <button 
                    className="plan_sync_popover_btn_danger"
                    onClick={() => {
                      handleClearCache();
                      setIsSyncMenuOpen(false);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Usuń z pamięci plan zajęć</span>
                  </button>
                </div>

                <p className="plan_sync_disclaimer_footnote">
                  Plan zajęć jest zczytywany bezpośrednio z uczelnianego systemu. Nie odpowiadamy za błędy i zmiany w oficjalnym harmonogramie.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. PASEK KONTROLNY: 
          Po lewej: Dropdown Tygodnia + Dni tygodnia
          Po prawej: Pill wyboru grupy */}
      <div className="figma_nav_bar">
        <div className="figma_nav_left_group">
          {/* DROPDOWN TYGODNIA / ZJAZDU (CustomSelect: natywny picker iOS / custom PC & Android) */}
          <CustomSelect 
            className="figma_week_custom_select"
            value={currentWeekIndex}
            onChange={(val) => handleWeekSelectChange(Number(val))}
            options={weekOptions}
            placeholder="Wybierz tydzień"
          />

          {/* NAWIGACJA DNIAMI: < Dni > Dzisiaj */}
          <div className="figma_nav_days_group">
            <button 
              className="figma_nav_arrow_btn" 
              onClick={handlePrevWeek} 
              disabled={currentWeekIndex <= 0}
              title="Poprzedni tydzień"
            >
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                <path d="M6.5 1.5L2 6L6.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* DNI TYGODNIA (POKAZYWANE W WIDOKU KART DZIENNYCH) */}
            {scheduleView === 'cards' && (
              <div className="figma_days_row">
                {currentWeekDays.map(dayObj => {
                  const isSelected = selectedDate === dayObj.dateStr;
                  const hasLessons = datesWithLessonsSet.has(dayObj.dateStr);

                  return (
                    <button
                      key={dayObj.dateStr}
                      className={`figma_day_bubble ${isSelected ? 'active_day' : ''} ${hasLessons ? 'has_lessons' : 'no_lessons'}`}
                      onClick={() => setSelectedDate(dayObj.dateStr)}
                      title={dayObj.dateStr}
                    >
                      <span>{dayObj.shortName}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button 
              className="figma_nav_arrow_btn" 
              onClick={handleNextWeek} 
              disabled={currentWeekIndex >= weeksWithLessons.length - 1}
              title="Następny tydzień"
            >
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                <path d="M1.5 1.5L6 6L1.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {((scheduleView === 'cards' && !isSelectedToday) || (scheduleView !== 'cards' && !isCurrentWeekToday)) && (
              <button 
                className="figma_today_btn"
                onClick={handleToday}
                title="Przejdź do dzisiejszego dnia / tygodnia"
              >
                Dzisiaj
              </button>
            )}
          </div>
        </div>

        {/* PO PRAWEJ: WYBÓR GRUPY (DLA STUDENTA) LUB WYSZUKIWARKA (DLA DYDAKTYKA) */}
        {activeMode === 'student' ? (
          <button 
            className={`figma_group_pill_btn ${isFilterModalOpen ? 'open' : ''}`}
            onClick={() => setIsFilterModalOpen(true)}
            title="Kliknij, aby zmienić kierunek, semestr lub grupę"
          >
            <span>{groupPillLabel}</span>
            <svg className="chevron_icon" width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <div className="figma_teacher_search_wrapper" ref={teacherSearchRef}>
            <div className="figma_teacher_search_bar">
              <svg className="figma_teacher_search_icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <div className="figma_teacher_input_grid">
                <span className="figma_teacher_input_measure" aria-hidden="true">
                  {teacherSearchQuery || "Szukaj"}
                </span>
                <input 
                  type="text" 
                  className="figma_teacher_search_input"
                  placeholder="Szukaj"
                  value={teacherSearchQuery}
                  onChange={(e) => {
                    setTeacherSearchQuery(e.target.value);
                    setIsTeacherDropdownOpen(true);
                  }}
                  onFocus={() => setIsTeacherDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredTeachersList.length > 0) {
                      handleSelectTeacher(filteredTeachersList[0]);
                    } else if (e.key === 'Escape') {
                      setIsTeacherDropdownOpen(false);
                    }
                  }}
                />
              </div>
              {teacherSearchQuery && (
                <button 
                  className="figma_teacher_search_clear_btn"
                  onClick={handleClearTeacher}
                  title="Wyczyść wyszukiwanie"
                  type="button"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="13" y2="13" />
                    <line x1="13" y1="1" x2="1" y2="13" />
                  </svg>
                </button>
              )}
            </div>

            {isTeacherDropdownOpen && (
              <div className="figma_teacher_dropdown">
                {filteredTeachersList.length > 0 ? (
                  filteredTeachersList.slice(0, 50).map((t, idx) => (
                    <button
                      key={idx}
                      className={`figma_teacher_dropdown_item ${selectedTeacher === t ? 'selected' : ''}`}
                      onClick={() => handleSelectTeacher(t)}
                    >
                      <FontAwesomeIcon icon={Icons.faUserGraduate} className="figma_teacher_dropdown_icon" />
                      <span>{t}</span>
                    </button>
                  ))
                ) : (
                  <div className="figma_teacher_dropdown_empty">
                    Nie znaleziono dydaktyka
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. GŁÓWNA SEKCJA PLANU ZAJĘĆ (W ZALEŻNOŚCI OD WYBRANEGO WIDOKU) */}

      {/* 3A. WIDOK KART DZIENNYCH (DOMYŚLNY) */}
      {scheduleView === 'cards' && (
        <div className="figma_schedule_section figma_lessons_section">
          <div className="figma_section_heading_bar">
            <div className="figma_section_heading_left">
              <h2 className="figma_section_title">Harmonogram dnia</h2>
              {displayedLessons.length > 0 && (
                <span className="figma_section_badge">{displayedLessons.length}</span>
              )}
            </div>

            {/* SZYBKIE FILTRY TYPU ZAJĘĆ (Wszystkie / Wykłady / Ćwiczenia i Lab) */}
            {activeMode === 'student' && lessonsForSelectedDay.length > 0 && (
              <div className="figma_lesson_type_filter_pills">
                <button 
                  type="button"
                  className={`figma_type_pill ${lessonTypeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setLessonTypeFilter('all')}
                  title="Pokaż wszystkie zajęcia razem"
                >
                  Wszystkie
                  <span className="figma_type_pill_count">{lessonsForSelectedDay.length}</span>
                </button>
                <button 
                  type="button"
                  className={`figma_type_pill ${lessonTypeFilter === 'lecture' ? 'active' : ''}`}
                  onClick={() => setLessonTypeFilter('lecture')}
                  title="Pokaż tylko wykłady"
                >
                  Wykłady
                  {lectureCountForDay > 0 && (
                    <span className="figma_type_pill_count">{lectureCountForDay}</span>
                  )}
                </button>
                <button 
                  type="button"
                  className={`figma_type_pill ${lessonTypeFilter === 'exercise' ? 'active' : ''}`}
                  onClick={() => setLessonTypeFilter('exercise')}
                  title="Pokaż tylko ćwiczenia, laboratoria i warsztaty"
                >
                  Ćwiczenia i Lab
                  {exerciseCountForDay > 0 && (
                    <span className="figma_type_pill_count">{exerciseCountForDay}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {displayedLessons.length > 0 ? (
            <div className="figma_lessons_grid">
              {displayedLessons.map((lesson, idx) => {
                const { status, progress } = getLessonState(lesson, selectedDate);
                return (
                  <Lekcja 
                    key={`${lesson._NW_randka_id || 'lekcja'}_${lesson.dataZajec || ''}_${lesson.godzinaOd || ''}_${idx}`} 
                    lesson={lesson} 
                    status={status}
                    progressPercent={progress}
                  />
                );
              })}
            </div>
          ) : lessonsForSelectedDay.length > 0 ? (
            <div className="figma_no_lessons_state">
              <h3 className="figma_no_lessons_title">
                {lessonTypeFilter === 'lecture' ? "Brak wykładów w tym dniu" : "Brak ćwiczeń w tym dniu"}
              </h3>
              <p className="figma_no_lessons_desc">
                W tym dniu masz zaplanowane inne zajęcia ({lessonsForSelectedDay.length}).{' '}
                <button 
                  type="button" 
                  className="figma_filter_reset_inline_btn"
                  onClick={() => setLessonTypeFilter('all')}
                >
                  Pokaż wszystkie zajęcia
                </button>
              </p>
            </div>
          ) : (
            <div className="figma_no_lessons_state">
              <img 
                src={activeMode === 'teacher' ? lupaImg : noLessonsImg} 
                alt={activeMode === 'teacher' ? "Szukaj wykładowcy" : "Brak zajęć w tym dniu"} 
                className="figma_no_lessons_img" 
              />
              <h3 className="figma_no_lessons_title">
                {activeMode === 'teacher' && !selectedTeacher 
                  ? "Wybierz dydaktyka" 
                  : "Brak zajęć w tym dniu!"}
              </h3>
              <p className="figma_no_lessons_desc">
                {activeMode === 'teacher' && !selectedTeacher 
                  ? "Wpisz nazwisko w polu wyszukiwania powyżej 🔍" 
                  : "Czas na zasłużony odpoczynek! 🪴"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3B. WIDOK LISTY TYGODNIOWEJ (AGENDA) */}
      {scheduleView === 'list' && (
        <div className="figma_schedule_section figma_schedule_list_section">
          <div className="figma_section_heading_bar">
            <div className="figma_section_heading_left">
              <h2 className="figma_section_title">Harmonogram tygodnia</h2>
              {totalLessonsInCurrentWeek > 0 && (
                <span className="figma_section_badge">{totalLessonsInCurrentWeek}</span>
              )}
            </div>

            {/* SZYBKIE FILTRY TYPU ZAJĘĆ DLA LISTY */}
            {activeMode === 'student' && totalLessonsInCurrentWeek > 0 && (
              <div className="figma_lesson_type_filter_pills">
                <button 
                  type="button"
                  className={`figma_type_pill ${lessonTypeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setLessonTypeFilter('all')}
                  title="Pokaż wszystkie zajęcia razem"
                >
                  Wszystkie
                  <span className="figma_type_pill_count">{totalLessonsInCurrentWeek}</span>
                </button>
                <button 
                  type="button"
                  className={`figma_type_pill ${lessonTypeFilter === 'lecture' ? 'active' : ''}`}
                  onClick={() => setLessonTypeFilter('lecture')}
                  title="Pokaż tylko wykłady"
                >
                  Wykłady
                  {lectureCountForWeek > 0 && (
                    <span className="figma_type_pill_count">{lectureCountForWeek}</span>
                  )}
                </button>
                <button 
                  type="button"
                  className={`figma_type_pill ${lessonTypeFilter === 'exercise' ? 'active' : ''}`}
                  onClick={() => setLessonTypeFilter('exercise')}
                  title="Pokaż tylko ćwiczenia, laboratoria i warsztaty"
                >
                  Ćwiczenia i Lab
                  {exerciseCountForWeek > 0 && (
                    <span className="figma_type_pill_count">{exerciseCountForWeek}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {totalLessonsInCurrentWeek > 0 ? (
            <div className="figma_list_days_container">
              {currentWeekDays.map(dayObj => {
                const dayLessons = currentWeekLessonsByDate[dayObj.dateStr] || [];
                const filteredDayLessons = lessonTypeFilter === 'lecture'
                  ? dayLessons.filter(isLectureLesson)
                  : lessonTypeFilter === 'exercise'
                    ? dayLessons.filter(isExerciseOrLabLesson)
                    : dayLessons;
                const isToday = dayObj.dateStr === todayDateStr;

                if (filteredDayLessons.length === 0 && !isToday) {
                  return null;
                }

                return (
                  <div key={dayObj.dateStr} className={`figma_list_day_card ${isToday ? 'is_today' : ''}`}>
                    <div className="figma_list_day_header">
                      <div className="figma_list_day_title_group">
                        <h3 className="figma_list_day_title">{formatListDayHeader(dayObj)}</h3>
                        {isToday && (
                          <span className="figma_list_today_badge">Dzisiaj</span>
                        )}
                      </div>
                      <span className="figma_list_day_count">
                        {filteredDayLessons.length === 0 
                          ? 'Brak zajęć' 
                          : `${filteredDayLessons.length} ${filteredDayLessons.length === 1 ? 'zajęcia' : (filteredDayLessons.length < 5 ? 'zajęcia' : 'zajęć')}`}
                      </span>
                    </div>

                    {filteredDayLessons.length > 0 ? (
                      <div className="figma_list_items_group">
                        {filteredDayLessons.map((lesson, lIdx) => {
                          const { status, progress } = getLessonState(lesson, dayObj.dateStr);
                          const typeConfig = getLessonTypeConfig(lesson.typPrzedmiotu || lesson.formaZajec, lesson.przedmiot, lesson.grupa);
                          const locationLabel = lesson.lokalizacja ? `${lesson.lokalizacja} • ${lesson.nazwaSali}` : `Kampus • ${lesson.nazwaSali}`;

                          return (
                            <div 
                              key={`${lesson._NW_randka_id || 'l'}_${lIdx}`} 
                              className={`figma_list_item state_${status}`}
                            >
                              {/* Kolumna czasu */}
                              <div className="figma_list_item_time_col">
                                <span className="figma_list_time_start">{lesson.godzinaOd}</span>
                                <span className="figma_list_time_end">{lesson.godzinaDo}</span>
                                {status === 'ongoing' && (
                                  <span className="figma_list_pulse_indicator" title={`Zajęcia trwają (${progress}%)`}>
                                    <span className="figma_pulse_dot" />
                                    <span className="figma_pulse_text">Trwa</span>
                                  </span>
                                )}
                              </div>

                              {/* Główna zawartość */}
                              <div className="figma_list_item_content">
                                <div className="figma_list_item_top">
                                  <h4 className="figma_list_item_title" title={lesson.przedmiot}>
                                    {lesson.przedmiot}
                                  </h4>
                                  <span className="figma_list_item_type_badge">
                                    <FontAwesomeIcon icon={typeConfig.icon} style={{ fontSize: '11px' }} />
                                    <span>{typeConfig.name}</span>
                                  </span>
                                </div>

                                <div className="figma_list_item_meta">
                                  {lesson.dydaktyk && (
                                    <span className="figma_list_meta_chip" title="Wykładowca">
                                      <FontAwesomeIcon icon={Icons.faUserGraduate} className="figma_list_meta_icon" />
                                      <span>{lesson.dydaktyk}</span>
                                    </span>
                                  )}
                                  <span className="figma_list_meta_chip" title="Miejsce i sala">
                                    <FontAwesomeIcon icon={Icons.faMap} className="figma_list_meta_icon" />
                                    <span>{locationLabel}</span>
                                  </span>
                                  {activeMode === 'student' && lesson.grupa && (
                                    <span className="figma_list_meta_chip group_chip" title="Grupa">
                                      <span>{lesson.grupa}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="figma_list_empty_day_placeholder">
                        <span>Dzisiaj brak zaplanowanych zajęć! Odpocznij 🌿</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="figma_no_lessons_state">
              <img 
                src={activeMode === 'teacher' ? lupaImg : noLessonsImg} 
                alt={activeMode === 'teacher' ? "Szukaj wykładowcy" : "Brak zajęć w tym tygodniu"} 
                className="figma_no_lessons_img" 
              />
              <h3 className="figma_no_lessons_title">
                {activeMode === 'teacher' && !selectedTeacher 
                  ? "Wybierz dydaktyka" 
                  : "Brak zajęć w tym tygodniu!"}
              </h3>
              <p className="figma_no_lessons_desc">
                {activeMode === 'teacher' && !selectedTeacher 
                  ? "Wpisz nazwisko w polu wyszukiwania powyżej 🔍" 
                  : "W tym tygodniu nie masz żadnych zaplanowanych zajęć. 🪴"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3C. WIDOK SIATKI TYGODNIOWEJ (GODZINY PO LEWEJ, DNI NA GÓRZE) */}
      {scheduleView === 'grid' && (
        <div className="figma_schedule_section figma_schedule_grid_section">
          <div className="figma_section_heading_bar">
            <div className="figma_section_heading_left">
              <h2 className="figma_section_title">Siatka godzinowa</h2>
              {totalLessonsInCurrentWeek > 0 && (
                <span className="figma_section_badge">{totalLessonsInCurrentWeek}</span>
              )}
            </div>

            {/* SZYBKIE FILTRY TYPU ZAJĘĆ DLA SIATKI */}
            {activeMode === 'student' && totalLessonsInCurrentWeek > 0 && (
              <div className="figma_lesson_type_filter_pills">
                <button 
                  type="button"
                  className={`figma_type_pill ${lessonTypeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setLessonTypeFilter('all')}
                  title="Pokaż wszystkie zajęcia razem"
                >
                  Wszystkie
                  <span className="figma_type_pill_count">{totalLessonsInCurrentWeek}</span>
                </button>
                <button 
                  type="button"
                  className={`figma_type_pill ${lessonTypeFilter === 'lecture' ? 'active' : ''}`}
                  onClick={() => setLessonTypeFilter('lecture')}
                  title="Pokaż tylko wykłady"
                >
                  Wykłady
                  {lectureCountForWeek > 0 && (
                    <span className="figma_type_pill_count">{lectureCountForWeek}</span>
                  )}
                </button>
                <button 
                  type="button"
                  className={`figma_type_pill ${lessonTypeFilter === 'exercise' ? 'active' : ''}`}
                  onClick={() => setLessonTypeFilter('exercise')}
                  title="Pokaż tylko ćwiczenia, laboratoria i warsztaty"
                >
                  Ćwiczenia i Lab
                  {exerciseCountForWeek > 0 && (
                    <span className="figma_type_pill_count">{exerciseCountForWeek}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="figma_timetable_scroll_wrap">
            <div className="figma_timetable_board">
              {/* NAGŁÓWKI: LEWY NAROŻNIK ORAZ 7 KOLUMN DNI TYGODNIA */}
              <div className="figma_timetable_header_row">
                <div className="figma_timetable_corner_cell">
                  <FontAwesomeIcon icon={Icons.faClock} style={{ fontSize: '13px', opacity: 0.7 }} />
                  <span>Godz.</span>
                </div>
                {currentWeekDays.map(dayObj => {
                  const isToday = dayObj.dateStr === todayDateStr;
                  const dayLessons = currentWeekLessonsByDate[dayObj.dateStr] || [];

                  return (
                    <div 
                      key={dayObj.dateStr} 
                      className={`figma_timetable_day_header_cell ${isToday ? 'is_today' : ''}`}
                    >
                      <div className="figma_timetable_day_header_name">{dayObj.longName}</div>
                      <div className="figma_timetable_day_header_sub">
                        <span className="figma_timetable_day_header_date">
                          {String(dayObj.dayNum).padStart(2, '0')}.{String(dayObj.fullDate.getMonth() + 1).padStart(2, '0')}
                        </span>
                        {isToday && <span className="figma_timetable_today_tag">Dzisiaj</span>}
                        {dayLessons.length > 0 && (
                          <span className="figma_timetable_lessons_count_tag">{dayLessons.length}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CIAŁO SIATKI: PO LEWEJ GODZINY, PO PRAWEJ 7 KOLUMN DNI */}
              <div className="figma_timetable_body">
                {/* KOLUMNA GODZIN PO LEWEJ STRONIE (08:00 - 21:00) */}
                <div className="figma_timetable_hours_col">
                  {GRID_HOURS.map(hour => (
                    <div key={hour} className="figma_timetable_hour_slot">
                      <span className="figma_timetable_hour_label">{String(hour).padStart(2, '0')}:00</span>
                    </div>
                  ))}
                </div>

                {/* 7 KOLUMN DLA POSZCZEGÓLNYCH DNI TYGODNIA */}
                <div className="figma_timetable_days_grid">
                  {/* Poziome linie siatki w tle */}
                  <div className="figma_timetable_grid_lines" aria-hidden="true">
                    {GRID_HOURS.map(hour => (
                      <div key={hour} className="figma_timetable_grid_horizontal_line" />
                    ))}
                  </div>

                  {/* Kolumny poszczególnych dni */}
                  {currentWeekDays.map(dayObj => {
                    const isToday = dayObj.dateStr === todayDateStr;
                    const dayLessons = currentWeekLessonsByDate[dayObj.dateStr] || [];
                    const placedLessons = computeDayGridLessons(dayLessons);

                    return (
                      <div 
                        key={dayObj.dateStr} 
                        className={`figma_timetable_day_col ${isToday ? 'is_today' : ''}`}
                      >
                        {/* Wskaźnik bieżącej godziny (czerwona linia "teraz") */}
                        {isToday && currentGridTimePercent !== null && (
                          <div 
                            className="figma_timetable_now_line" 
                            style={{ top: `${currentGridTimePercent}%` }}
                            title={`Aktualny czas: ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`}
                          >
                            <span className="figma_timetable_now_dot" />
                          </div>
                        )}

                        {/* Kafelki zajęć umieszczone precyzyjnie w osi czasu */}
                        {placedLessons.map(({ lesson, topPercent, heightPercent, leftPercent, widthPercent }, pIdx) => {
                          const typeConfig = getLessonTypeConfig(lesson.typPrzedmiotu || lesson.formaZajec, lesson.przedmiot, lesson.grupa);
                          const { status } = getLessonState(lesson, dayObj.dateStr);

                          return (
                            <div
                              key={`${lesson._NW_randka_id || 'gl'}_${pIdx}`}
                              className={`figma_timetable_card card_state_${status}`}
                              style={{
                                top: `${topPercent}%`,
                                height: `${heightPercent}%`,
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`
                              }}
                              onClick={() => setSelectedGridLesson(lesson)}
                              role="button"
                              tabIndex={0}
                              title={`${lesson.przedmiot}\n${typeConfig.name} • ${lesson.godzinaOd}–${lesson.godzinaDo}\n${lesson.nazwaSali || 'Sala'}${lesson.dydaktyk ? ` • ${lesson.dydaktyk}` : ''}`}
                            >
                              <div className="figma_timetable_card_header">
                                <span className="figma_timetable_card_time">{lesson.godzinaOd}–{lesson.godzinaDo}</span>
                                <span className="figma_timetable_card_type_tag">
                                  {typeConfig.code || typeConfig.name}
                                </span>
                              </div>

                              <div className="figma_timetable_card_title" title={lesson.przedmiot}>
                                {lesson.przedmiot}
                              </div>

                              <div className="figma_timetable_card_meta">
                                <span className="figma_timetable_card_room" title={lesson.nazwaSali}>
                                  {lesson.nazwaSali || 'Sala'}
                                </span>
                                {lesson.dydaktyk && (
                                  <span className="figma_timetable_card_teacher" title={lesson.dydaktyk}>
                                    {cleanTeacherName(lesson.dydaktyk)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL SZCZEGÓŁÓW ZAJĘĆ (PO KLIKNIĘCIU W KAFILEK W SIATCE LUB LIŚCIE) */}
      {selectedGridLesson && (
        <div className="plan_event_modal_overlay" onClick={() => setSelectedGridLesson(null)}>
          <div className="plan_event_modal_card lesson_details_modal_card" onClick={e => e.stopPropagation()}>
            <div className="plan_event_modal_header">
              <div className="plan_event_modal_title_group">
                <span className="lesson_details_type_pill">
                  <FontAwesomeIcon icon={getLessonTypeConfig(selectedGridLesson.typPrzedmiotu || selectedGridLesson.formaZajec, selectedGridLesson.przedmiot, selectedGridLesson.grupa).icon} style={{ marginRight: '6px' }} />
                  {getLessonTypeConfig(selectedGridLesson.typPrzedmiotu || selectedGridLesson.formaZajec, selectedGridLesson.przedmiot, selectedGridLesson.grupa).name}
                </span>
                <h3 className="plan_event_modal_title" style={{ marginTop: '8px', fontSize: '18px' }}>
                  {selectedGridLesson.przedmiot}
                </h3>
              </div>
              <button 
                className="plan_event_modal_close_btn" 
                onClick={() => setSelectedGridLesson(null)}
                aria-label="Zamknij"
              >
                <FontAwesomeIcon icon={Icons.faXmark} />
              </button>
            </div>

            <div className="lesson_details_modal_body">
              <div className="lesson_details_row">
                <FontAwesomeIcon icon={Icons.faClock} className="lesson_details_icon" />
                <div className="lesson_details_texts">
                  <span className="lesson_details_label">Godziny:</span>
                  <span className="lesson_details_val">
                    {selectedGridLesson.godzinaOd} – {selectedGridLesson.godzinaDo}
                  </span>
                </div>
              </div>

              {selectedGridLesson.dataZajec && (
                <div className="lesson_details_row">
                  <FontAwesomeIcon icon={Icons.faCalendarDays} className="lesson_details_icon" />
                  <div className="lesson_details_texts">
                    <span className="lesson_details_label">Data zajęć:</span>
                    <span className="lesson_details_val">
                      {formatLessonDate(selectedGridLesson.dataZajec)}
                    </span>
                  </div>
                </div>
              )}

              {selectedGridLesson.dydaktyk && (
                <div className="lesson_details_row">
                  <FontAwesomeIcon icon={Icons.faUserGraduate} className="lesson_details_icon" />
                  <div className="lesson_details_texts">
                    <span className="lesson_details_label">Prowadzący:</span>
                    <span className="lesson_details_val">{cleanTeacherName(selectedGridLesson.dydaktyk)}</span>
                  </div>
                </div>
              )}

              <div className="lesson_details_row">
                <FontAwesomeIcon icon={Icons.faMap} className="lesson_details_icon" />
                <div className="lesson_details_texts">
                  <span className="lesson_details_label">Miejsce i sala:</span>
                  <span className="lesson_details_val">
                    {selectedGridLesson.lokalizacja ? `${selectedGridLesson.lokalizacja} • ${selectedGridLesson.nazwaSali}` : selectedGridLesson.nazwaSali}
                  </span>
                </div>
              </div>

              {selectedGridLesson.grupa && (
                <div className="lesson_details_row">
                  <FontAwesomeIcon icon={Icons.faIdCard} className="lesson_details_icon" />
                  <div className="lesson_details_texts">
                    <span className="lesson_details_label">Grupa zajęciowa:</span>
                    <span className="lesson_details_val">{selectedGridLesson.grupa}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="plan_event_modal_footer">
              <button 
                type="button" 
                className="figma_modal_save_btn"
                onClick={() => setSelectedGridLesson(null)}
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SEKCJA WYDARZEŃ Z KALENDARZA */}
      <div className="figma_calendar_events_section">
        <div className="figma_section_heading_bar">
          <div className="figma_section_heading_left">
            <h2 className="figma_section_title">
              {scheduleView === 'cards' ? "Wydarzenia z kalendarza" : "Wydarzenia w tym tygodniu"}
            </h2>
            {(scheduleView === 'cards' ? eventsForSelectedDay : eventsForCurrentWeek).length > 0 && (
              <span className="figma_section_badge">
                {(scheduleView === 'cards' ? eventsForSelectedDay : eventsForCurrentWeek).length}
              </span>
            )}
          </div>
          {(scheduleView === 'cards' ? eventsForSelectedDay : eventsForCurrentWeek).length > 0 && (
            <button 
              type="button" 
              className="figma_add_event_header_btn"
              onClick={openAddEventModal}
              title="Dodaj wydarzenie do kalendarza"
            >
              <FontAwesomeIcon icon={Icons.faPlus} />
              <span>Dodaj wydarzenie</span>
            </button>
          )}
        </div>

        {(scheduleView === 'cards' ? eventsForSelectedDay : eventsForCurrentWeek).length > 0 ? (
          <div className="figma_events_grid">
            {(scheduleView === 'cards' ? eventsForSelectedDay : eventsForCurrentWeek).map((evt) => (
              <div 
                key={evt.id} 
                className="figma_event_card"
                onClick={() => openEditEventModal(evt)}
                role="button"
                tabIndex={0}
                title="Kliknij, aby wyświetlić szczegóły lub edytować"
              >
                <div className="figma_event_card_top">
                  <div className="figma_event_card_info">
                    <h4 className="figma_event_card_title" title={evt.title}>
                      {evt.title}
                    </h4>
                    {evt.details && (
                      <p className="figma_event_card_details" title={evt.details}>
                        {evt.details}
                      </p>
                    )}
                  </div>
                  <span className="figma_event_card_badge">
                    <FontAwesomeIcon icon={Icons.faClock} />
                    <span>{evt.time || "Cały dzień"}</span>
                  </span>
                </div>

                <div className="figma_event_card_bottom">
                  <span className="figma_event_card_category">
                    <FontAwesomeIcon icon={Icons.faCalendarDays} />
                    <span>{scheduleView === 'cards' ? "Wydarzenie" : (evt.date || "Wydarzenie")}</span>
                  </span>
                  <button 
                    type="button"
                    className="figma_event_card_edit_btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditEventModal(evt);
                    }}
                    title="Edytuj wydarzenie"
                  >
                    Szczegóły
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="figma_no_events_card">
            <div className="figma_no_events_left">
              <div className="figma_no_events_icon_wrap">
                <FontAwesomeIcon icon={Icons.faCalendarDays} className="figma_no_events_icon" />
              </div>
              <div className="figma_no_events_content">
                <h4 className="figma_no_events_title">
                  {scheduleView === 'cards' ? "Brak wydarzeń w tym dniu" : "Brak wydarzeń w tym tygodniu"}
                </h4>
                <p className="figma_no_events_desc">
                  {scheduleView === 'cards' 
                    ? "Nie masz zaplanowanych żadnych wydarzeń w kalendarzu na ten dzień."
                    : "Nie masz zaplanowanych żadnych wydarzeń w kalendarzu na ten tydzień."}
                </p>
              </div>
            </div>
            <button 
              type="button" 
              className="figma_no_events_add_btn"
              onClick={openAddEventModal}
            >
              <FontAwesomeIcon icon={Icons.faPlus} />
              <span>Dodaj wydarzenie</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. MODAL DODAWANIA / EDYCJI WYDARZENIA */}
      {isEventModalOpen && (
        <div className="plan_event_modal_overlay" onClick={() => setIsEventModalOpen(false)}>
          <div className="plan_event_modal_card" onClick={e => e.stopPropagation()}>
            <div className="plan_event_modal_header">
              <div className="plan_event_modal_title_group">
                <h3 className="plan_event_modal_title">
                  {eventModalMode === 'add' ? 'Nowe wydarzenie' : 'Szczegóły wydarzenia'}
                </h3>
                <span className="plan_event_modal_date">{formattedModalDate}</span>
              </div>
              <button 
                type="button"
                className="plan_event_modal_close_btn"
                onClick={() => setIsEventModalOpen(false)}
                title="Zamknij"
              >
                ✕
              </button>
            </div>
            
            <div className="plan_event_modal_body">
              <div className="plan_event_field_group">
                <label className="plan_event_label">Nazwa wydarzenia</label>
                <input 
                  type="text" 
                  className="plan_event_input"
                  value={eventFormData.title} 
                  onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
                  placeholder="np. Kolokwium z analizy, oddanie projektu..."
                  autoFocus
                />
              </div>

              <div className="plan_event_field_group">
                <label className="plan_event_label">Godzina</label>
                <div className="plan_event_time_row">
                  <input 
                    type="time" 
                    className="plan_event_input plan_event_time_input"
                    value={eventFormData.time === 'Cały dzień' ? '' : eventFormData.time} 
                    onChange={(e) => setEventFormData({...eventFormData, time: e.target.value})}
                    disabled={eventFormData.time === 'Cały dzień'}
                  />
                  <label className="plan_event_all_day_label">
                    <input 
                      type="checkbox" 
                      className="plan_event_checkbox"
                      checked={eventFormData.time === 'Cały dzień'}
                      onChange={(e) => setEventFormData({...eventFormData, time: e.target.checked ? 'Cały dzień' : '10:00'})}
                    />
                    <span>Cały dzień</span>
                  </label>
                </div>
              </div>

              <div className="plan_event_field_group">
                <label className="plan_event_label">Dodatkowe informacje (opcjonalnie)</label>
                <input 
                  type="text" 
                  className="plan_event_input"
                  value={eventFormData.details} 
                  onChange={(e) => setEventFormData({...eventFormData, details: e.target.value})}
                  placeholder="np. sala 202A, zagadnienia z wykładu..."
                />
              </div>
            </div>

            <div className="plan_event_modal_footer">
              {eventModalMode === 'edit' && (
                <button 
                  type="button" 
                  className="plan_event_btn_delete" 
                  onClick={handleDeleteCalendarEvent}
                >
                  <FontAwesomeIcon icon={Icons.faTrash} />
                  <span>Usuń</span>
                </button>
              )}
              <div className="plan_event_footer_spacer" />
              <button 
                type="button" 
                className="plan_event_btn_cancel" 
                onClick={() => setIsEventModalOpen(false)}
              >
                Anuluj
              </button>
              <button 
                type="button" 
                className="plan_event_btn_save" 
                onClick={handleSaveCalendarEvent} 
                disabled={!eventFormData.title.trim()}
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL WYBORU PROFILU I KASKADOWYCH FILTRÓW (OTWIERANY Z PILLA) */}
      {isFilterModalOpen && (
        <div className="figma_modal_overlay" onClick={() => setIsFilterModalOpen(false)}>
          <div className="figma_modal_card" onClick={(e) => e.stopPropagation()}>
            <div className="figma_modal_header">
              <h2 className="figma_modal_title">Wybór planu zajęć</h2>
              <button 
                className="figma_modal_close_btn" 
                onClick={() => setIsFilterModalOpen(false)}
                title="Zamknij"
              >
                ✕
              </button>
            </div>

            {/* KASKADOWE FILTRY GRUPY STUDENCKIEJ */}
            <div className="figma_filter_fields_grid">
                {/* 1. WYDZIAŁ */}
                <div className="figma_field_group">
                  <label className="figma_field_label">1. Wydział</label>
                  <select 
                    className="figma_field_select"
                    value={filterWydzial} 
                    onChange={e => handleWydzialChangeInPlan(e.target.value)}
                  >
                    <option value="">-- Wybierz wydział --</option>
                    {availableWydzialy.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>

                {/* 2. KIERUNEK */}
                <div className="figma_field_group">
                  <label className="figma_field_label">2. Kierunek</label>
                  <select 
                    className="figma_field_select"
                    value={filterKierunek} 
                    onChange={e => { 
                      setFilterKierunek(e.target.value); 
                      setFilterForma(""); 
                      setFilterCohort(""); 
                      setFilterSpecjalnosc(""); 
                      setFilterGrupa(""); 
                    }}
                    disabled={!filterWydzial}
                  >
                    <option value="">{filterWydzial ? "-- Wybierz kierunek --" : "-- Najpierw wybierz wydział --"}</option>
                    {availableKierunki.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                {/* 3. FORMA STUDIÓW */}
                <div className="figma_field_group">
                  <label className="figma_field_label">3. Forma studiów</label>
                  <select 
                    className="figma_field_select"
                    value={filterForma} 
                    onChange={e => { 
                      setFilterForma(e.target.value); 
                      setFilterCohort(""); 
                      setFilterSpecjalnosc(""); 
                      setFilterGrupa(""); 
                    }}
                    disabled={!filterKierunek}
                  >
                    <option value="">{filterKierunek ? "-- Wybierz formę --" : "-- Najpierw wybierz kierunek --"}</option>
                    {availableFormy.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* 4. SEMESTR I ROK (OPCJONALNY) */}
                <div className="figma_field_group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="figma_field_label">4. Semestr i Rok</label>
                    <span style={{ fontSize: "11px", color: "#007bff", fontWeight: "600" }}>Opcjonalnie</span>
                  </div>
                  <select 
                    className="figma_field_select"
                    value={filterCohort} 
                    onChange={e => { setFilterCohort(e.target.value); setFilterSpecjalnosc(""); setFilterGrupa(""); }} 
                    disabled={!filterForma}
                  >
                    <option value="">{filterForma ? "-- Wszystkie semestry (opcjonalnie) --" : "-- Najpierw wybierz formę --"}</option>
                    {availableCohorts.map(c => {
                      const info = getCohortDetails(c, scheduleReferenceDate);
                      return <option key={c} value={c}>{info.label}</option>;
                    })}
                  </select>
                </div>

                {/* 5. SPECJALNOŚĆ */}
                <div className="figma_field_group">
                  <label className="figma_field_label">5. Specjalność</label>
                  <select 
                    className="figma_field_select"
                    value={filterSpecjalnosc} 
                    onChange={e => { setFilterSpecjalnosc(e.target.value); setFilterGrupa(""); }} 
                    disabled={!filterForma}
                  >
                    <option value="">{filterForma ? "-- Wybierz specjalność --" : "-- Najpierw wybierz formę --"}</option>
                    {availableSpecialities.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* 6. GRUPA */}
                <div className="figma_field_group">
                  <label className="figma_field_label">6. Grupa</label>
                  <select 
                    className="figma_field_select"
                    value={filterGrupa} 
                    onChange={e => setFilterGrupa(e.target.value)} 
                    disabled={!filterSpecjalnosc}
                  >
                    <option value="">{filterSpecjalnosc ? "-- Wybierz grupę --" : "-- Najpierw wybierz specjalność --"}</option>
                    {availableGroups.map(g => {
                      const c = extractCohort(g);
                      const info = getCohortDetails(c, scheduleReferenceDate);
                      const extra = info.semester ? ` [Semestr ${info.semester} • Rok ${info.year}]` : '';
                      return <option key={g} value={g}>{g}{extra}</option>;
                    })}
                  </select>
                  <span className="figma_field_hint_note">
                    ℹ️ Wykłady ogólne dla Twojego rocznika zostaną automatycznie dołączone do planu.
                  </span>
                </div>

                {isSelectedDirectionEmpty && (
                  <div style={{ padding: "12px 16px", backgroundColor: "#fffbeb", borderRadius: "10px", color: "#b45309", fontSize: "13px" }}>
                    ℹ️ Plan dla kierunku <strong>{filterKierunek}</strong> nie został jeszcze opublikowany przez dziekanat.
                  </div>
                )}
              </div>

            {/* PRZYCISK ZAMKNIĘCIA / ZATWIERDZENIA */}
            <button 
              className="figma_modal_save_btn"
              onClick={() => {
                setActiveMode('student');
                setIsFilterModalOpen(false);
              }}
            >
              Zatwierdź i zobacz plan
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default PlanZajec;