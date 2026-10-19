import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  STORAGE_KEY, 
  LAST_UPDATE_KEY, 
  AUTO_FETCH_KEY, 
  LAST_FETCH_DATE_KEY, 
  SHOW_TERM_DATES_KEY,
  getScheduleData,
  getScheduleDataAsync,
  clearScheduleData,
  fetchAndCleanSchedule,
  resolveWydzialForKierunek
} from '@/services/scheduleService.js';

const ScheduleContext = createContext(null);

export const ScheduleProvider = ({ children }) => {
  const [allLessons, setAllLessons] = useState(() => getScheduleData());
  const [lastUpdateTime, setLastUpdateTime] = useState(() => {
    return localStorage.getItem(LAST_UPDATE_KEY) || "";
  });
  const [autoFetchOnOpen, setAutoFetchOnOpenState] = useState(() => {
    return localStorage.getItem(AUTO_FETCH_KEY) === 'true';
  });
  const [showTermDates, setShowTermDatesState] = useState(() => {
    return localStorage.getItem(SHOW_TERM_DATES_KEY) === 'true';
  });
  const [isFetching, setIsFetching] = useState(false);

  // Asynchroniczne ładowanie pełnego planu z bazy IndexedDB przy starcie
  useEffect(() => {
    let isMounted = true;
    getScheduleDataAsync().then(lessons => {
      if (isMounted && Array.isArray(lessons) && lessons.length > 0) {
        setAllLessons(lessons);
      }
    }).catch(err => {
      console.warn("Błąd ładowania z IndexedDB:", err);
    });
    return () => { isMounted = false; };
  }, []);

  // Zmiana ustawienia automatycznego pobierania przy każdym wejściu
  const setAutoFetchOnOpen = useCallback((valOrFn) => {
    setAutoFetchOnOpenState(prev => {
      const nextVal = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      try {
        localStorage.setItem(AUTO_FETCH_KEY, String(nextVal));
        window.dispatchEvent(new CustomEvent('smart_campus_schedule_sync', {
          detail: { key: AUTO_FETCH_KEY, value: nextVal }
        }));
      } catch (e) {
        console.warn("Błąd zapisu AUTO_FETCH_KEY:", e);
      }
      return nextVal;
    });
  }, []);

  const handleToggleAutoFetch = useCallback((id, nextVal) => {
    setAutoFetchOnOpen(nextVal);
  }, [setAutoFetchOnOpen]);

  // Zmiana ustawienia wyświetlania terminów zjazdów / tygodni
  const setShowTermDates = useCallback((valOrFn) => {
    setShowTermDatesState(prev => {
      const nextVal = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      try {
        localStorage.setItem(SHOW_TERM_DATES_KEY, String(nextVal));
        window.dispatchEvent(new CustomEvent('smart_campus_schedule_sync', {
          detail: { key: SHOW_TERM_DATES_KEY, value: nextVal }
        }));
      } catch (e) {
        console.warn("Błąd zapisu SHOW_TERM_DATES_KEY:", e);
      }
      return nextVal;
    });
  }, []);

  const handleToggleShowTermDates = useCallback((id, nextVal) => {
    setShowTermDates(nextVal);
  }, [setShowTermDates]);

  // Pobieranie najnowszego planu z serwerów uczelni
  const fetchLatestSchedule = useCallback(async () => {
    setIsFetching(true);
    try {
      const cleanedData = await fetchAndCleanSchedule();
      if (cleanedData && Array.isArray(cleanedData)) {
        const enriched = cleanedData.map(item => ({
          ...item,
          wydzial: item.wydzial || resolveWydzialForKierunek(item.kierunek),
          specjalnosc: item.specjalnosc || ""
        }));
        setAllLessons(enriched);
        const nowIso = new Date().toISOString();
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        try {
          localStorage.setItem(LAST_UPDATE_KEY, nowIso);
          localStorage.setItem(LAST_FETCH_DATE_KEY, todayStr);
        } catch (e) {}
        setLastUpdateTime(nowIso);

        window.dispatchEvent(new CustomEvent('smart_campus_schedule_sync', {
          detail: { key: STORAGE_KEY, count: enriched.length, lastUpdate: nowIso, lessons: enriched }
        }));
        return enriched;
      }
      return enriched;
    } catch (err) {
      console.error("Błąd podczas pobierania planu:", err);
      throw err;
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Czyszczenie pamięci podręcznej planu z IndexedDB i localStorage
  const clearScheduleCache = useCallback(async () => {
    try {
      await clearScheduleData();
    } catch (e) {}
    setAllLessons([]);
    setLastUpdateTime("");
    window.dispatchEvent(new CustomEvent('smart_campus_schedule_sync', {
      detail: { key: 'CLEAR_CACHE' }
    }));
  }, []);

  // Formatowana data ostatniej aktualizacji (np. 18.10, 17:10)
  const formattedLastUpdate = useMemo(() => {
    if (!lastUpdateTime) return "Brak (pamięć wyczyszczona)";
    try {
      const d = new Date(lastUpdateTime);
      if (isNaN(d.getTime())) return "Brak";
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}.${month}, ${hours}:${minutes}`;
    } catch {
      return "Brak";
    }
  }, [lastUpdateTime]);

  // Synchronizacja dwukierunkowa ze zdarzeniami localStorage oraz CustomEvent w obrębie tej samej i innych kart
  useEffect(() => {
    const syncFromStorage = async () => {
      try {
        const autoFetch = localStorage.getItem(AUTO_FETCH_KEY) === 'true';
        setAutoFetchOnOpenState(autoFetch);
        const termDates = localStorage.getItem(SHOW_TERM_DATES_KEY) === 'true';
        setShowTermDatesState(termDates);
        const updateTime = localStorage.getItem(LAST_UPDATE_KEY) || "";
        setLastUpdateTime(updateTime);
        const lessons = await getScheduleDataAsync();
        if (Array.isArray(lessons) && lessons.length > 0) {
          setAllLessons(lessons);
        }
      } catch (e) {}
    };

    const handleCustomSync = (e) => {
      if (e && e.detail) {
        if (e.detail.key === AUTO_FETCH_KEY) {
          setAutoFetchOnOpenState(e.detail.value);
        } else if (e.detail.key === SHOW_TERM_DATES_KEY) {
          setShowTermDatesState(e.detail.value);
        } else if (e.detail.key === 'CLEAR_CACHE') {
          setAllLessons([]);
          setLastUpdateTime("");
        } else if (e.detail.key === STORAGE_KEY) {
          if (e.detail.lastUpdate) setLastUpdateTime(e.detail.lastUpdate);
          if (e.detail.lessons && Array.isArray(e.detail.lessons) && e.detail.lessons.length > 0) {
            setAllLessons(e.detail.lessons);
          } else {
            getScheduleDataAsync().then(lessons => {
              if (lessons) setAllLessons(lessons);
            });
          }
        }
      } else {
        syncFromStorage();
      }
    };

    const handleStorageEvent = (e) => {
      if ([AUTO_FETCH_KEY, SHOW_TERM_DATES_KEY, LAST_UPDATE_KEY, STORAGE_KEY].includes(e.key)) {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('smart_campus_schedule_sync', handleCustomSync);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('smart_campus_schedule_sync', handleCustomSync);
    };
  }, []);

  // Jeśli brak danych w pamięci podręcznej, pobierz cicho w tle przy starcie aplikacji
  useEffect(() => {
    if ((!allLessons || allLessons.length === 0) && !localStorage.getItem(LAST_UPDATE_KEY)) {
      fetchLatestSchedule().catch(() => {});
    }
  }, []);

  const value = useMemo(() => ({
    allLessons,
    setAllLessons,
    lastUpdateTime,
    setLastUpdateTime,
    formattedLastUpdate,
    autoFetchOnOpen,
    setAutoFetchOnOpen,
    handleToggleAutoFetch,
    showTermDates,
    setShowTermDates,
    handleToggleShowTermDates,
    isFetching,
    fetchLatestSchedule,
    clearScheduleCache
  }), [
    allLessons,
    lastUpdateTime,
    formattedLastUpdate,
    autoFetchOnOpen,
    setAutoFetchOnOpen,
    handleToggleAutoFetch,
    showTermDates,
    setShowTermDates,
    handleToggleShowTermDates,
    isFetching,
    fetchLatestSchedule,
    clearScheduleCache
  ]);

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useScheduleContext must be used within a ScheduleProvider');
  }
  return context;
};
