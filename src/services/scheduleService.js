/**
 * Serwis obsługujący plan zajęć, pobieranie danych z API uczelni oraz profil studenta/dydaktyka
 */

export const STORAGE_KEY = 'smart_campus_schedule_data';
export const PROFILE_KEY = 'smart_campus_user_profile';
export const TEACHER_KEY = 'smart_campus_user_teacher';
export const MODE_KEY = 'smart_campus_user_mode';
export const LAST_UPDATE_KEY = 'smart_campus_schedule_last_update';
export const AUTO_FETCH_KEY = 'smart_campus_auto_fetch_every_open';
export const LAST_FETCH_DATE_KEY = 'smart_campus_schedule_last_daily_fetch';
export const SHOW_TERM_DATES_KEY = 'smart_campus_show_term_dates';

// Pomocnik do wyciągania kohorty rocznikowej z nazwy grupy (np. "23/24", "26/27")
export const extractCohort = (gn) => {
  if (!gn) return '';
  const match = gn.match(/(?:20)?(\d{2})\s*[\/_]\s*(?:20)?(\d{2})/);
  return match ? `${match[1]}/${match[2]}` : '';
};

// Dynamiczne obliczanie semestru i roku studiów na podstawie kohorty i daty planu
export const getCohortDetails = (cohortCode, referenceDate = new Date()) => {
  const match = (cohortCode || '').match(/(?:20)?(\d{2})\s*[\/_]\s*(?:20)?(\d{2})/);
  if (!match) return { semester: '', year: '', label: `Rocznik ${cohortCode || ''}` };

  const cohortStartYear = 2000 + parseInt(match[1], 10);
  let d = new Date(referenceDate);
  if (isNaN(d.getTime())) d = new Date();

  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1 - 12

  // Rok akademicki w Polsce zaczyna się 1 października:
  const academicStartYear = month >= 10 ? year : year - 1;

  // Semestr zimowy (X - II), Semestr letni (III - IX)
  const isWinterTerm = (month >= 10 || month <= 2);
  const termOffset = isWinterTerm ? 1 : 2;

  // Dynamiczne wyliczenie roku i semestru
  const yearsStudied = Math.max(1, academicStartYear - cohortStartYear + 1);
  const semester = Math.max(1, (yearsStudied - 1) * 2 + termOffset);
  const studyYear = Math.max(1, Math.ceil(semester / 2));

  return {
    semester: String(semester),
    year: String(studyYear),
    label: `Semestr ${semester} • Rok ${studyYear} (nabór 20${match[1]}/20${match[2]})`
  };
};

// Pomocnik do wyciągania numeru/oznaczenia grupy ćwiczeniowej (np. "1", "2", "3", "1A")
export const extractExerciseGroup = (gn) => {
  if (!gn || typeof gn !== 'string') return '';

  // 1. Odetnij dodatkowe dopiski w nawiasach kwadratowych, np. [Semestr 1 • Rok 1]
  const clean = gn.replace(/\[.*?\]/g, '').trim();
  if (!clean) return '';

  // 2. Wzorzec dla grup ćwiczeniowych / laboratoryjnych / ogólnych:
  // np. "Cwiczenia 2", "Ćwiczenia 1", "ćw 2", "cw. 3", "Grupa 1", "Gr 2", "Lab 3", "Laboratorium 1A", "Gr. 2B"
  const patternMatch = clean.match(/(?:ćwiczeni[a-ząćęłńóśźż]*|cwiczeni[a-z]*|ćw\.?|cw\.?|laboratori[a-z]*|lab\.?|projekt[a-z]*|proj\.?|grup[a-z]*|gr\.?)\s*([0-9]+[a-zA-Z]?)\b/i);
  if (patternMatch) {
    return patternMatch[1];
  }

  // 3. Samodzielna liczba lub liczba z literą na początku ciągu (np. "2 Informatyka", "1A")
  const startNumMatch = clean.match(/^([0-9]+[a-zA-Z]?)\b/);
  if (startNumMatch) {
    return startNumMatch[1];
  }

  // 4. Jeśli w ciągu jest izolowana cyfra/grupa po wycięciu lat i semestrów
  const withoutYearsOrSemesters = clean
    .replace(/(?:20)?\d{2}\s*[\/_]\s*(?:20)?\d{2}[a-z]?/gi, '')
    .replace(/20\d{2}/g, '')
    .replace(/semestr\s*\d+/gi, '')
    .replace(/rok\s*\d+/gi, '')
    .trim();

  const isolatedNum = withoutYearsOrSemesters.match(/\b([1-9][0-9]?[a-zA-Z]?)\b/);
  if (isolatedNum) {
    return isolatedNum[1];
  }

  // 5. Jeśli to wyłącznie wykład
  if (clean.toLowerCase().includes('wyk')) {
    return 'Wykł.';
  }

  return '';
};

// Pomocnik do bezpiecznego wyznaczenia poniedziałku dla danej daty (YYYY-MM-DD)
// Używamy godziny 12:00:00 (południe), aby wyeliminować problemy ze strefą czasową i zmianą czasu (DST)
export const getMondayOfDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);
  const day = date.getDay(); // 0: Sun, 1: Mon...
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Czyszczenie zbędnych dopisków wydziałowych w nazwiskach wykładowców (np. 'WIE', 'WTS', 'PO')
export const cleanTeacherName = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name
    .replace(/\s+(WIE|WTS|WNTS|WNZ|WNoZ|PO)\s*$/i, '')
    .trim();
};

/**
 * Inteligentna deduplikacja zajęć (usuwa duplikaty wykładów dla wielu grup oraz powtarzające się wpisy)
 * @param {Array} lessons - tablica przefiltrowanych lekcji
 * @param {string} preferredGroup - nazwa grupy użytkownika (do priorytetyzacji właściwego wpisu)
 */
export const deduplicateLessons = (lessons, preferredGroup = '') => {
  if (!lessons || !Array.isArray(lessons) || lessons.length === 0) return [];

  const seenRandkaIds = new Set();
  const seenContentKeys = new Set();
  const result = [];

  // Sortujemy tak, aby:
  // 1. Wpisy przypisane bezpośrednio do wybranej grupy użytkownika miały pierwszeństwo
  // 2. Wpisy zawierające pełniejsze dane (np. wpisany dydaktyk, wpisana sala) miały pierwszeństwo
  const sorted = [...lessons].sort((a, b) => {
    const aIsDirect = preferredGroup && a.grupa === preferredGroup ? 1 : 0;
    const bIsDirect = preferredGroup && b.grupa === preferredGroup ? 1 : 0;
    if (aIsDirect !== bIsDirect) return bIsDirect - aIsDirect;

    const aScore = (a.dydaktyk ? 2 : 0) + (a.nazwaSali ? 1 : 0);
    const bScore = (b.dydaktyk ? 2 : 0) + (b.nazwaSali ? 1 : 0);
    return bScore - aScore;
  });

  for (const lesson of sorted) {
    const randkaId = lesson._NW_randka_id ? String(lesson._NW_randka_id) : '';
    
    // Klucz zawartości: data + czas rozpoczęcia i zakończenia + znormalizowana nazwa przedmiotu
    const date = lesson.dataZajec ? lesson.dataZajec.substring(0, 10) : '';
    const start = (lesson.godzinaOd || '').trim();
    const end = (lesson.godzinaDo || '').trim();
    const subject = (lesson.przedmiot || '').trim().toLowerCase();
    const teacher = cleanTeacherName(lesson.dydaktyk || '').trim().toLowerCase();
    
    const contentKey = `${date}_${start}_${end}_${subject}_${teacher}`;
    const timeSubjectKey = `${date}_${start}_${end}_${subject}`;

    // 1. Sprawdź duplikat po ID randki
    if (randkaId && seenRandkaIds.has(randkaId)) {
      continue;
    }

    // 2. Sprawdź duplikat po zawartości (ten sam przedmiot w tym samym czasie)
    if (seenContentKeys.has(contentKey) || seenContentKeys.has(timeSubjectKey)) {
      continue;
    }

    if (randkaId) seenRandkaIds.add(randkaId);
    seenContentKeys.add(contentKey);
    seenContentKeys.add(timeSubjectKey);
    result.push(lesson);
  }

  // Zwróć posortowane chronologicznie po dacie i godzinie
  return result.sort((a, b) => {
    const dateComp = (a.dataZajec || '').localeCompare(b.dataZajec || '');
    if (dateComp !== 0) return dateComp;
    return (a.godzinaOd || '').localeCompare(b.godzinaOd || '');
  });
};

export const wydzialMap = {
  221: "Wydział Inżynierii i Ekonomii",
  222: "Wydział Inżynierii i Ekonomii",
  224: "Wydział Nauk o Zdrowiu i Nauk Społecznych",
  225: "Wydział Nauk Technicznych i Społecznych",
  226: "Przedmioty Ogólnouczelniane"
};

export const defaultWydzialy = [
  "Wydział Inżynierii i Ekonomii",
  "Wydział Nauk o Zdrowiu i Nauk Społecznych",
  "Wydział Nauk Technicznych i Społecznych",
  "Przedmioty Ogólnouczelniane"
];

export const normalizeWydzialName = (name) => {
  if (!name || typeof name !== 'string') return '';
  const lower = name.trim().toLowerCase();
  if (lower.includes('inżynier') || lower.includes('inzynier') || lower.includes('ekonom')) {
    return "Wydział Inżynierii i Ekonomii";
  }
  if (lower.includes('zdrowi') || lower.includes('medyczn') || lower.includes('wnm')) {
    return "Wydział Nauk o Zdrowiu i Nauk Społecznych";
  }
  if (lower.includes('technicz') || lower.includes('mław') || lower.includes('wnt')) {
    return "Wydział Nauk Technicznych i Społecznych";
  }
  if (lower.includes('ogóln') || lower.includes('ogoln')) {
    return "Przedmioty Ogólnouczelniane";
  }
  return name.trim();
};

export const kierunekDoWydzialu = {
  "Informatyka": "Wydział Inżynierii i Ekonomii",
  "Ekonomia": "Wydział Inżynierii i Ekonomii",
  "Zarządzanie": "Wydział Inżynierii i Ekonomii",
  "Rolnictwo": "Wydział Inżynierii i Ekonomii",
  "Inżynieria środowiska": "Wydział Inżynierii i Ekonomii",
  "Mechanika i budowa maszyn": "Wydział Inżynierii i Ekonomii",
  "Fizjoterapia": "Wydział Nauk o Zdrowiu i Nauk Społecznych",
  "Praca socjalna": "Wydział Nauk o Zdrowiu i Nauk Społecznych",
  "Pielęgniarstwo": "Wydział Nauk o Zdrowiu i Nauk Społecznych",
  "Pedagogika przedszkolna i wczesnoszkolna": "Wydział Nauk o Zdrowiu i Nauk Społecznych",
  "Logistyka": "Wydział Nauk Technicznych i Społecznych",
  "Bezpieczeństwo wewnętrzne": "Wydział Nauk Technicznych i Społecznych",
  "Elektronika i telekomunikacja": "Wydział Nauk Technicznych i Społecznych"
};

export const resolveWydzialForKierunek = (kierunek, fallback = 'Wydział Inżynierii i Ekonomii') => {
  if (!kierunek) return fallback;
  if (kierunekDoWydzialu[kierunek]) return kierunekDoWydzialu[kierunek];
  const normalized = kierunek.trim().toLowerCase();
  for (const [k, w] of Object.entries(kierunekDoWydzialu)) {
    if (k.toLowerCase() === normalized || normalized.includes(k.toLowerCase()) || k.toLowerCase().includes(normalized)) {
      return w;
    }
  }
  return fallback;
};

// Bezpieczne pobieranie zapisanego planu z localStorage
export const getScheduleData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => {
      const normalizedWydzial = normalizeWydzialName(item.wydzial);
      const wydzial = (item.kierunek && resolveWydzialForKierunek(item.kierunek, '')) 
        || normalizedWydzial 
        || "Wydział Inżynierii i Ekonomii";
      return {
        ...item,
        wydzial,
        specjalnosc: item.specjalnosc || "",
        dydaktyk: item.dydaktyk ? cleanTeacherName(item.dydaktyk) : ""
      };
    });
  } catch (e) {
    console.error("Błąd odczytu planu z localStorage:", e);
    return [];
  }
};

// Pobieranie profilu użytkownika
export const getUserProfile = () => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

// Zapisywanie profilu użytkownika (przygotowane pod późniejszą synchronizację z Firebase)
export const saveUserProfile = (profile) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("Błąd zapisu profilu do localStorage:", e);
  }
};

// Pobieranie danych z oficjalnego API uczelni i czyszczenie
export const fetchAndCleanSchedule = async () => {
  const ids = [221, 222, 224, 225, 226];

  let allResults = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const acadStart = currentMonth >= 10 ? currentYear : currentYear - 1;
  const dataOd = `${acadStart}-10-01T00:00:00`;
  const dataDo = `${acadStart + 1}-09-30T00:00:00`;

  for (const id of ids) {
    try {
      const url = `/api/harmonogram/zajecia?_dc=${Date.now()}&idGrupa=0&idNauczyciel=0&idJednostkaPanelJednostka=${id}&dataOd=${encodeURIComponent(dataOd)}&dataDo=${encodeURIComponent(dataDo)}&widok=JEDNOSTKA&authUzytkownikId=0&page=1&start=0&limit=100000`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "SUCCESS" && Array.isArray(data.result)) {
        const correctedData = data.result.map(item => {
          const rawWydzial = normalizeWydzialName(item.wydzial);
          const poprawnyWydzial = (item.kierunek && resolveWydzialForKierunek(item.kierunek, '')) 
            || rawWydzial 
            || wydzialMap[id] 
            || "Wydział Inżynierii i Ekonomii";
            
          return {
            ...item,
            wydzial: poprawnyWydzial,
            specjalnosc: item.specjalnosc || ""
          };
        });
        allResults = [...allResults, ...correctedData];
      }
    } catch (err) {
      console.warn(`Błąd pobierania jednostki ${id}:`, err);
    }
  }

  // Standaryzacja i czyszczenie zbędnych sufiksów
  const cleanedData = allResults.map(item => {
    const cleanObj = { ...item };
    if (!cleanObj.forma) {
      const g = (cleanObj.grupa || "").toLowerCase();
      if (g.includes("niestac") || g.includes("zaocz") || g.includes(" ns")) {
        cleanObj.forma = "niestacjonarne";
      } else if (g.includes("stac") || g.includes("dzien")) {
        cleanObj.forma = "stacjonarne";
      }
    }

    if (cleanObj.forma) {
      cleanObj.forma = cleanObj.forma.toLowerCase();
    }

    if (cleanObj.przedmiot && cleanObj.formaZajec) {
      const suffix = `(${cleanObj.formaZajec})`;
      if (cleanObj.przedmiot.endsWith(suffix)) {
        cleanObj.przedmiot = cleanObj.przedmiot.slice(0, -suffix.length).trim();
      }
    }

    if (cleanObj.dydaktyk) {
      cleanObj.dydaktyk = cleanTeacherName(cleanObj.dydaktyk);
    }
    
    return cleanObj;
  });

  // Deduplikacja na poziomie surowej bazy po _NW_randka_id + grupa
  const seenRaw = new Set();
  const deduplicatedCleaned = [];
  for (const item of cleanedData) {
    const rawKey = item._NW_randka_id 
      ? `${item._NW_randka_id}_${item.grupa || ''}`
      : `${item.dataZajec}_${item.godzinaOd}_${item.godzinaDo}_${item.przedmiot}_${item.grupa}_${item.dydaktyk}`;
    if (!seenRaw.has(rawKey)) {
      seenRaw.add(rawKey);
      deduplicatedCleaned.push(item);
    }
  }

  try {
    const compactForStorage = deduplicatedCleaned.map(item => ({
      _NW_randka_id: item._NW_randka_id,
      dataZajec: item.dataZajec,
      godzinaOd: item.godzinaOd,
      godzinaDo: item.godzinaDo,
      przedmiot: item.przedmiot,
      typPrzedmiotu: item.typPrzedmiotu || item.formaZajec,
      formaZajec: item.formaZajec,
      dydaktyk: item.dydaktyk,
      nazwaSali: item.nazwaSali,
      lokalizacja: item.lokalizacja,
      wydzial: normalizeWydzialName(item.wydzial) || resolveWydzialForKierunek(item.kierunek),
      kierunek: item.kierunek,
      specjalnosc: item.specjalnosc || "",
      semestr: item.semestr,
      grupa: item.grupa,
      forma: item.forma,
      rokAkademicki: item.rokAkademicki
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compactForStorage));
    localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
  } catch (storageErr) {
    console.warn("Limit pamięci localStorage:", storageErr);
  }

  return deduplicatedCleaned;
};

// Filtrowanie planu pod profil studenta lub wykładowcy
export const filterLessonsForUser = (allLessons, profile, mode = 'student', selectedTeacher = '') => {
  if (!allLessons || allLessons.length === 0) return [];
  if (mode === 'teacher') {
    if (!selectedTeacher) return [];
    const target = cleanTeacherName(selectedTeacher);
    return allLessons.filter(l => cleanTeacherName(l.dydaktyk) === target);
  }
  if (!profile || !profile.grupa) return [];

  const w = profile.wydzial;
  const k = profile.kierunek;
  const f = profile.forma;
  const s = profile.specjalnosc;
  const g = profile.grupa;
  const userCohort = profile.cohort || extractCohort(g);

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

  const candidates = allLessons.filter(l => {
    if (l.wydzial !== w || l.kierunek !== k || l.forma !== f) return false;

    const isSpecMatch = !l.specjalnosc || 
                        l.specjalnosc === s || 
                        l.specjalnosc.toLowerCase().includes('ogóln') || 
                        l.specjalnosc.toLowerCase().includes('ogoln');

    if (l.grupa === g && (l.specjalnosc === s || isSpecMatch)) return true;

    const lType = (l.typPrzedmiotu || l.formaZajec || '').toLowerCase().trim();
    const lGroup = (l.grupa || '').toLowerCase().trim();
    const lPrzedmiot = (l.przedmiot || '').toLowerCase().trim();
    const isLecture = lType === 'w' || lType.includes('wykład') || lType.includes('wyklad') || lType.startsWith('wyk') ||
                      lGroup.includes('wykład') || lGroup.includes('wyklad') || lGroup.includes('wykładow') || lGroup.includes('wykladow') || lGroup === 'w' || lGroup.endsWith(' w') ||
                      lPrzedmiot.includes('(wykład)') || lPrzedmiot.includes('(wyklad)') || lPrzedmiot.includes(' - wykład') || lPrzedmiot.includes(' - wyklad');

    if (isLecture && isSpecMatch) {
      const itemCohort = extractCohort(l.grupa);
      if (userCohort && itemCohort) {
        if (itemCohort === userCohort) return true;
      } else if (l.semestr && userCohort) {
        const cohortInfo = getCohortDetails(userCohort);
        if (String(l.semestr) === String(cohortInfo?.semester)) return true;
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
};

// Sprawdzanie czy trwają teraz lub za 15 minut zaczynają się zajęcia
export const getCurrentOrUpcomingLesson = (allLessons, profile, mode = 'student', selectedTeacher = '', bufferMinutes = 15) => {
  const normalizedLessons = (allLessons || []).map(l => l.dydaktyk ? { ...l, dydaktyk: cleanTeacherName(l.dydaktyk) } : l);
  const userLessons = filterLessonsForUser(normalizedLessons, profile, mode, selectedTeacher);
  if (!userLessons || userLessons.length === 0) return null;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayLessons = userLessons.filter(l => l.dataZajec && l.dataZajec.substring(0, 10) === todayStr);
  if (todayLessons.length === 0) return null;

  // 1. Sprawdź czy trwają teraz zajęcia
  for (const lesson of todayLessons) {
    if (!lesson.godzinaOd || !lesson.godzinaDo) continue;
    const [fromH, fromM] = lesson.godzinaOd.split(':').map(Number);
    const [toH, toM] = lesson.godzinaDo.split(':').map(Number);
    const startM = fromH * 60 + fromM;
    const endM = toH * 60 + toM;

    if (currentMinutes >= startM && currentMinutes <= endM) {
      return {
        lesson,
        status: 'ongoing',
        remainingMinutes: endM - currentMinutes
      };
    }
  }

  // 2. Jeśli nie trwają teraz, sprawdź czy są jakieś nadchodzące w ciągu bufferMinutes (np. 15 min)
  const upcomingCandidates = [];
  for (const lesson of todayLessons) {
    if (!lesson.godzinaOd) continue;
    const [fromH, fromM] = lesson.godzinaOd.split(':').map(Number);
    const startM = fromH * 60 + fromM;

    if (currentMinutes >= startM - bufferMinutes && currentMinutes < startM) {
      upcomingCandidates.push({
        lesson,
        status: 'upcoming',
        minutesUntilStart: startM - currentMinutes,
        startM
      });
    }
  }

  if (upcomingCandidates.length > 0) {
    upcomingCandidates.sort((a, b) => a.startM - b.startM);
    return upcomingCandidates[0];
  }

  return null;
};

