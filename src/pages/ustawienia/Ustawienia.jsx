import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import { faRightFromBracket, faChevronRight, faWorm, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faGithub } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from "@/context/AuthContext.jsx";
import { useTheme } from "@hooks/useTheme.js";
import { useSchedule } from "@/hooks/useSchedule.js";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch.jsx";
import LogoFull from "@/components/Logo/LogoFull.jsx";
import CustomSelect from "@/components/CustomSelect/CustomSelect.jsx";
import MainButton from "@/components/Buttons/MainButton/MainButton.jsx";
import ReactMarkdown from 'react-markdown';
import packageJson from '../../../package.json';
import { 
  PROFILE_KEY, 
  extractCohort, 
  getCohortDetails,
  extractExerciseGroup,
  saveUserProfile,
  defaultWydzialy,
  resolveWydzialForKierunek,
  normalizeWydzialName,
  kierunekDoWydzialu
} from "@/services/scheduleService.js";
import './ustawienia.css';
import defaultBanner from '../landing-page/building.webp';
import wnmBanner from '@/assets/img/wnm.webp';
import wntBanner from '@/assets/img/wnt.jpg';

function Ustawienia() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { 
    allLessons, 
    lastUpdateTime, 
    formattedLastUpdate, 
    autoFetchOnOpen, 
    handleToggleAutoFetch, 
    showTermDates,
    handleToggleShowTermDates,
    isFetching: isFetchingSchedule, 
    fetchLatestSchedule, 
    clearScheduleCache 
  } = useSchedule();
  
  const [cookiesAccepted, setCookiesAccepted] = useState(true);
  const [notificationsAccepted, setNotificationsAccepted] = useState(false);
  
  // Dane profilu studenta (Konto)
  const [wydzial, setWydzial] = useState("");
  const [kierunek, setKierunek] = useState("");
  const [forma, setForma] = useState("");
  const [cohort, setCohort] = useState("");
  const [specjalnosc, setSpecjalnosc] = useState("");
  const [grupa, setGrupa] = useState("");

  const [milestones, setMilestones] = useState([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(true);

  // Funkcje eksperymentalne z localStorage
  const [isExperimentalEnabled, setIsExperimentalEnabled] = useState(() => localStorage.getItem('isExperimentalEnabled') === 'true');
  const [expWeatherWidget, setExpWeatherWidget] = useState(() => localStorage.getItem('expWeatherWidget') === 'true');
  const [expMoreThemes, setExpMoreThemes] = useState(() => localStorage.getItem('expMoreThemes') === 'true');
  const [expNewPanel, setExpNewPanel] = useState(() => localStorage.getItem('expNewPanel') === 'true');

  useEffect(() => { localStorage.setItem('isExperimentalEnabled', isExperimentalEnabled); }, [isExperimentalEnabled]);
  useEffect(() => { localStorage.setItem('expWeatherWidget', expWeatherWidget); }, [expWeatherWidget]);
  useEffect(() => { localStorage.setItem('expMoreThemes', expMoreThemes); }, [expMoreThemes]);
  useEffect(() => { localStorage.setItem('expNewPanel', expNewPanel); }, [expNewPanel]);

  // Odczyt profilu z localStorage na start
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.wydzial) setWydzial(p.wydzial);
        if (p.kierunek) setKierunek(p.kierunek);
        if (p.forma) setForma(p.forma);
        if (p.cohort) setCohort(p.cohort);
        if (p.specjalnosc) setSpecjalnosc(p.specjalnosc);
        if (p.grupa) setGrupa(p.grupa);
      }
    } catch (e) {}
  }, []);

  // W tle pobieramy plan tylko przy pierwszym uruchomieniu, jeśli brak danych
  useEffect(() => {
    if (allLessons.length === 0 && !localStorage.getItem('smart_campus_schedule_last_update')) {
      fetchLatestSchedule();
    }
  }, []);

  const handleManualFetchSchedule = async () => {
    try {
      await fetchLatestSchedule();
    } catch (e) {
      alert("Nie udało się pobrać najnowszego planu. Sprawdź połączenie z internetem.");
    }
  };

  const handleClearScheduleInSettings = () => {
    if (window.confirm("Czy na pewno chcesz usunąć zapisany plan z pamięci przeglądarki?")) {
      clearScheduleCache();
      alert("Pamięć podręczna planu zajęć została wyczyszczona.");
    }
  };

  // Dynamiczne wyliczenie Roku i Semestru
  const cohortInfo = useMemo(() => {
    const c = cohort || extractCohort(grupa);
    return getCohortDetails(c);
  }, [cohort, grupa]);

  const computedRok = cohortInfo.year;
  const computedSemestr = cohortInfo.semester;

  // Wyliczenie grupy ćwiczeniowej (zwraca sam numer/oznaczenie np. "1", "2", "3")
  const computedGrCw = useMemo(() => {
    return extractExerciseGroup(grupa);
  }, [grupa]);

  // Dynamiczne wyliczenie banera uczelni w zależności od wydziału
  const activeBanner = useMemo(() => {
    const w = (wydzial || resolveWydzialForKierunek(kierunek, '') || '').toLowerCase();
    if (w.includes('zdrowi') || w.includes('medyczn') || w.includes('wnm')) {
      return wnmBanner;
    }
    if (w.includes('technicz') || w.includes('mław') || w.includes('wnt')) {
      return wntBanner;
    }
    return defaultBanner;
  }, [wydzial, kierunek]);

  // Zapis do localStorage (z uwzględnieniem późniejszego zapisu w Firebase)
  useEffect(() => {
    if (wydzial || kierunek || forma || grupa) {
      const profile = {
        wydzial,
        kierunek,
        forma,
        cohort,
        specjalnosc,
        grupa,
        rok: computedRok,
        semestr: computedSemestr,
        grupaCwiczeniowa: computedGrCw
      };
      saveUserProfile(profile);
      // NOTE: Po wdrożeniu pełnej synchronizacji z Firebase:
      // if (user?.uid) { await setDoc(doc(db, "users", user.uid), profile, { merge: true }); }
    }
  }, [wydzial, kierunek, forma, cohort, specjalnosc, grupa, computedRok, computedSemestr, computedGrCw]);

  // Pamięć podręczna wyborów dla każdego wydziału (aby przy przełączaniu nie tracić ustawień)
  const [facultyCache, setFacultyCache] = useState(() => {
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

  const handleWydzialChange = (newWydzial) => {
    if (wydzial && (kierunek || forma || grupa)) {
      setFacultyCache(prev => ({
        ...prev,
        [wydzial]: { kierunek, forma, cohort, specjalnosc, grupa }
      }));
    }

    setWydzial(newWydzial);

    const cached = facultyCache[newWydzial];
    if (cached) {
      setKierunek(cached.kierunek || "");
      setForma(cached.forma || "");
      setCohort(cached.cohort || "");
      setSpecjalnosc(cached.specjalnosc || "");
      setGrupa(cached.grupa || "");
    } else {
      const belongs = kierunek && (resolveWydzialForKierunek(kierunek, '') === normalizeWydzialName(newWydzial));
      if (!belongs) {
        setKierunek("");
        setForma("");
        setCohort("");
        setSpecjalnosc("");
        setGrupa("");
      }
    }
  };

  const handleKierunekChange = (newKierunek) => {
    setKierunek(newKierunek);
    setForma("");
    setCohort("");
    setSpecjalnosc("");
    setGrupa("");
  };

  const handleFormaChange = (newForma) => {
    setForma(newForma);
    setCohort("");
    setSpecjalnosc("");
    setGrupa("");
  };

  // Kaskada opcji filtrów
  const availableWydzialy = useMemo(() => {
    if (!allLessons || allLessons.length === 0) return defaultWydzialy;
    const fromData = [...new Set(allLessons.map(l => normalizeWydzialName(l.wydzial) || resolveWydzialForKierunek(l.kierunek)).filter(Boolean))].sort();
    return fromData.length > 0 ? fromData : defaultWydzialy;
  }, [allLessons]);

  const availableKierunki = useMemo(() => {
    if (!wydzial) return [];
    const normW = normalizeWydzialName(wydzial);
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
  }, [allLessons, wydzial]);

  const availableFormy = useMemo(() => {
    if (!wydzial || !kierunek || !allLessons || allLessons.length === 0) return [];
    const normW = normalizeWydzialName(wydzial);
    return [...new Set(
      allLessons
        .filter(l => (normalizeWydzialName(l.wydzial) || resolveWydzialForKierunek(l.kierunek)) === normW && l.kierunek === kierunek)
        .map(l => l.forma)
        .filter(Boolean)
    )].sort();
  }, [allLessons, wydzial, kierunek]);

  const availableCohorts = useMemo(() => {
    if (!wydzial || !kierunek || !forma || !allLessons || allLessons.length === 0) return [];
    const normW = normalizeWydzialName(wydzial);
    const relevant = allLessons.filter(l => 
      (normalizeWydzialName(l.wydzial) || resolveWydzialForKierunek(l.kierunek)) === normW && 
      l.kierunek === kierunek && 
      l.forma === forma
    );
    const set = new Set();
    relevant.forEach(l => {
      const c = extractCohort(l.grupa);
      if (c) set.add(c);
    });
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [allLessons, wydzial, kierunek, forma]);

  const availableSpecialities = useMemo(() => {
    if (!wydzial || !kierunek || !forma || !allLessons || allLessons.length === 0) return [];
    const normW = normalizeWydzialName(wydzial);
    return [...new Set(
      allLessons
        .filter(l => 
          (normalizeWydzialName(l.wydzial) || resolveWydzialForKierunek(l.kierunek)) === normW && 
          l.kierunek === kierunek && 
          l.forma === forma &&
          (!cohort || extractCohort(l.grupa) === cohort)
        )
        .map(l => l.specjalnosc)
        .filter(Boolean)
    )].sort();
  }, [allLessons, wydzial, kierunek, forma, cohort]);

  const availableGroups = useMemo(() => {
    if (!wydzial || !kierunek || !forma || !allLessons || allLessons.length === 0) return [];
    const normW = normalizeWydzialName(wydzial);
    return [...new Set(
      allLessons
        .filter(l => 
          (normalizeWydzialName(l.wydzial) || resolveWydzialForKierunek(l.kierunek)) === normW && 
          l.kierunek === kierunek && 
          l.forma === forma &&
          (!cohort || extractCohort(l.grupa) === cohort) &&
          (!specjalnosc || l.specjalnosc === specjalnosc)
        )
        .map(l => l.grupa)
        .filter(Boolean)
    )].sort();
  }, [allLessons, wydzial, kierunek, forma, cohort, specjalnosc]);

  // Przygotowanie opcji pod CustomSelect
  const wydzialOptions = useMemo(() => availableWydzialy.map(w => ({ value: w, label: w })), [availableWydzialy]);
  const kierunekOptions = useMemo(() => availableKierunki.map(k => ({ value: k, label: k })), [availableKierunki]);
  const formaOptions = useMemo(() => availableFormy.map(f => ({ 
    value: f, 
    label: f === 'stacjonarne' ? 'Stacjonarne' : (f === 'niestacjonarne' ? 'Niestacjonarne' : f) 
  })), [availableFormy]);
  
  const cohortOptions = useMemo(() => [
    { value: "", label: "-- Wszystkie semestry (opcjonalnie) --" },
    ...availableCohorts.map(c => {
      const info = getCohortDetails(c);
      return { value: c, label: info.label };
    })
  ], [availableCohorts]);

  const specjalnoscOptions = useMemo(() => availableSpecialities.map(s => ({ value: s, label: s })), [availableSpecialities]);
  
  const grupaOptions = useMemo(() => availableGroups.map(g => {
    const c = extractCohort(g);
    const info = getCohortDetails(c);
    const extra = info.semester ? ` [Semestr ${info.semester} • Rok ${info.year}]` : '';
    return { value: g, label: `${g}${extra}` };
  }), [availableGroups]);

  const [latestRelease, setLatestRelease] = useState(null);
  const [isLoadingRelease, setIsLoadingRelease] = useState(true);

  // Pobieranie postępów (milestones) i najnowszego wydania z GitHub API
  useEffect(() => {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Milestones
    fetch('https://api.github.com/repos/SmartCampusOrg/SmartCampus/milestones?state=open', { headers })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setMilestones(data);
      })
      .catch(err => console.error("Błąd pobierania postępów z GitHuba:", err))
      .finally(() => setIsLoadingMilestones(false));

    // Latest Release (pobieranie z listy, ponieważ wszystkie to prerelease)
    fetch('https://api.github.com/repos/SmartCampusOrg/SmartCampus/releases', { headers })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) setLatestRelease(data[0]);
      })
      .catch(err => console.error("Błąd pobierania patch notes z GitHuba:", err))
      .finally(() => setIsLoadingRelease(false));
  }, []);

  // Firebase domyślnie pobiera małe zdjęcie z Google (96x96). Podmieniamy ten parametr na wyższą jakość (400x400)
  const highResPhotoUrl = user?.photoURL ? user.photoURL.replace(/=s\d+-c/g, '=s400-c') : null;
  
  // Wartości domyślne do formularza
  const defaultFirstName = user?.displayName?.split(' ')[0] || '';
  const defaultLastName = user?.displayName?.split(' ').slice(1).join(' ') || '';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Po wylogowaniu przenosimy na Landing Page
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
    }
  };

  // Easter Egg
  const handleNameKeyDown = (e, originalValue) => {
    if (e.key === 'Enter') {
      if (e.target.value !== originalValue) {
        alert("Żeby to było takie proste... 😅");
        e.target.value = originalValue; // cofamy zmianę dla lepszego efektu
      }
    }
  };

  return (
    <div className="app ustawienia_container">
      <div className="settings_content">
        <div className="setting_topBar">
          <h1>Ustawienia</h1>
          <button className="mobile_back_button" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={Icons.faArrowLeft} /> Wstecz
          </button>
        </div>
        <div 
          className="profilePictureAndBaner"
          style={{ backgroundImage: `url(${activeBanner})` }}
        >
          <div className="profilePictureWrapper">
            {highResPhotoUrl ? (
              <img
                src={highResPhotoUrl}
                alt="Awatar"
                className='profilePicture'
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || '')}&background=183447&color=fff&size=400`;
                }}
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || '')}&background=183447&color=fff&size=400`}
                alt="Awatar"
                className='profilePicture'
              />
            )}
          </div>
        </div>
        <div className='user_summary'>
          <div className="user_summary_left">
            <h2>{user?.displayName || "Imię Nazwisko"}</h2>
            <div className="user_summary_emailBadge">
              <FontAwesomeIcon icon={faGoogle} />
              <span>{user?.email || "mail@student.edu"}</span>
              <button className="user_summary_logoutBtn" title="Wyloguj" onClick={handleLogout}>
                <FontAwesomeIcon icon={faRightFromBracket} />
              </button>
            </div>
          </div>
          <div className="user_summary_right">
            <div className="user_summary_stat">
              <span className="stat_value">{computedRok || "--"}</span>
              <span className="stat_label">Rok</span>
            </div>
            <div className="user_summary_stat">
              <span className="stat_value">{computedSemestr || "--"}</span>
              <span className="stat_label">Semestr</span>
            </div>
            <div className="user_summary_stat">
              <span className="stat_value">{computedGrCw || "--"}</span>
              <span className="stat_label">Gr. Ćw</span>
            </div>
          </div>
        </div>

        {/* Sekcja formularza "Konto" */}
        <div className="settings_section">
          <h3 className="section_title">Konto</h3>
          <div className="settings_card">
            
            <div className="form_row">
              <div className="input_group">
                <label>Imię</label>
                <input 
                  type="text" 
                  defaultValue={defaultFirstName} 
                  onKeyDown={(e) => handleNameKeyDown(e, defaultFirstName)}
                />
              </div>
              <div className="input_group">
                <label>Nazwisko</label>
                <input 
                  type="text" 
                  defaultValue={defaultLastName}
                  onKeyDown={(e) => handleNameKeyDown(e, defaultLastName)} 
                />
              </div>
            </div>
            
            <div className="form_row">
              <div className="input_group">
                <label>1. Wydział</label>
                <CustomSelect
                  value={wydzial}
                  onChange={handleWydzialChange}
                  options={wydzialOptions}
                  placeholder="Wybierz wydział"
                />
              </div>
              <div className="input_group">
                <label>2. Kierunek</label>
                <CustomSelect
                  value={kierunek}
                  onChange={handleKierunekChange}
                  options={kierunekOptions}
                  disabled={!wydzial}
                  placeholder={wydzial ? "Wybierz kierunek" : "Najpierw wybierz wydział"}
                />
              </div>
            </div>

            <div className="form_row">
              <div className="input_group">
                <label>3. Forma studiów</label>
                <CustomSelect
                  value={forma}
                  onChange={handleFormaChange}
                  options={formaOptions}
                  disabled={!kierunek}
                  placeholder={kierunek ? "Wybierz formę studiów" : "Najpierw wybierz kierunek"}
                />
              </div>
              <div className="input_group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>4. Semestr i Rok</label>
                  <span style={{ fontSize: '11px', color: '#007bff', fontWeight: '600' }}>Opcjonalnie</span>
                </div>
                <CustomSelect
                  value={cohort}
                  onChange={(val) => {
                    setCohort(val);
                    setSpecjalnosc("");
                    setGrupa("");
                  }}
                  options={cohortOptions}
                  disabled={!forma}
                  placeholder={forma ? "Wszystkie semestry" : "Najpierw wybierz formę"}
                />
              </div>
            </div>

            <div className="form_row">
              <div className="input_group">
                <label>5. Specjalność</label>
                <CustomSelect
                  value={specjalnosc}
                  onChange={(val) => {
                    setSpecjalnosc(val);
                    setGrupa("");
                  }}
                  options={specjalnoscOptions}
                  disabled={!forma}
                  placeholder={forma ? "Wybierz specjalność" : "Najpierw wybierz formę"}
                />
              </div>
              <div className="input_group">
                <label>6. Grupa</label>
                <CustomSelect
                  value={grupa}
                  onChange={(val) => setGrupa(val)}
                  options={grupaOptions}
                  disabled={!forma}
                  placeholder={forma ? "Wybierz grupę" : "Najpierw wybierz formę"}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Sekcja Motyw */}
        <div className="settings_section">
          <h3 className="section_title">Wygląd</h3>
          <div className="settings_row">
            <div className="settings_row_info">
              <h4>Motyw aplikacji</h4>
              <p>Wybierz tryb jasny, ciemny lub dostosuj do systemu.</p>
            </div>
            <div className="theme_selector">
              <CustomSelect 
                className="theme_select"
                value={themeMode || 'light'}
                onChange={setThemeMode}
                options={[
                  { value: "light", label: "Jasny" },
                  { value: "dark", label: "Ciemny" },
                  { value: "system", label: "Systemowy" },
                  ...(isExperimentalEnabled && expMoreThemes ? [
                    { value: "frutiger", label: "Frutiger Aero" },
                    { value: "halloween", label: "Halloween" },
                    { value: "autumn", label: "Jesienny" },
                    { value: "christmas", label: "Świąteczny" }
                  ] : [])
                ]}
                placeholder="Wybierz motyw"
              />
            </div>
          </div>
        </div>

        {/* Sekcja Plan zajęć */}
        <div className="settings_section">
          <h3 className="section_title">Plan zajęć</h3>
          <div className="settings_card plan_sync_settings_card">
            <div className="settings_plan_toggle_row">
              <div className="settings_row_info">
                <h4>Pobieraj przy każdym wejściu</h4>
                <p>Wymuszaj pobieranie bazy przy każdym otwarciu (domyślnie: raz dziennie)</p>
              </div>
              <div className="settings_plan_toggle_wrap">
                <ToggleSwitch 
                  id="settingsAutoFetchScheduleToggle"
                  defaultState={autoFetchOnOpen}
                  onToggle={handleToggleAutoFetch}
                />
              </div>
            </div>

            <div className="settings_plan_info_divider" />

            <div className="settings_plan_toggle_row">
              <div className="settings_row_info">
                <h4>Pokaż terminy zjazdów i tygodni</h4>
                <p>Wyświetlaj zakresy dat przy numerach zjazdów i tygodni w planie</p>
              </div>
              <div className="settings_plan_toggle_wrap">
                <ToggleSwitch 
                  id="settingsShowTermDatesToggle"
                  defaultState={showTermDates}
                  onToggle={handleToggleShowTermDates}
                />
              </div>
            </div>
            
            <div className="settings_plan_info_divider" />

            <div className="settings_plan_info_box">
              <div className="settings_plan_info_row">
                <span className="settings_plan_info_label">Ostatnia aktualizacja:</span>
                <span className="settings_plan_info_value">{formattedLastUpdate}</span>
              </div>
              <div className="settings_plan_info_divider" />
              <div className="settings_plan_info_row">
                <span className="settings_plan_info_label">Tryb aktualizacji:</span>
                <span className="settings_plan_info_value">{autoFetchOnOpen ? "Przy każdym wejściu" : "Raz dziennie (domyślny)"}</span>
              </div>
              <div className="settings_plan_info_divider" />
              <div className="settings_plan_info_row">
                <span className="settings_plan_info_label">Zapisane zajęcia w pamięci:</span>
                <span className="settings_plan_info_value">{allLessons.length}</span>
              </div>
            </div>

            <div className="settings_plan_actions">
              <button 
                type="button"
                className="settings_plan_btn_primary"
                onClick={handleManualFetchSchedule}
                disabled={isFetchingSchedule}
              >
                <svg className={`settings_plan_icon ${isFetchingSchedule ? 'spin' : ''}`} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span>{isFetchingSchedule ? "Pobieranie z uczelni..." : "Pobierz najnowszy plan"}</span>
              </button>

              <button 
                type="button"
                className="settings_plan_btn_danger"
                onClick={handleClearScheduleInSettings}
                disabled={isFetchingSchedule}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Usuń z pamięci plan zajęć</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sekcja Prywatność */}
        <div className="settings_section">
          <h3 className="section_title">Prywatność</h3>
          <div className="settings_row">
            <div className="settings_row_info">
              <h4>Zgoda na pliki cookie</h4>
              <p>Używane wyłącznie do działania witryny, nie zbieramy Twoich danych.</p>
            </div>
            <div 
              className={`toggle_switch ${cookiesAccepted ? 'active' : ''}`}
              onClick={() => setCookiesAccepted(!cookiesAccepted)}
            ></div>
          </div>
        </div>

        {/* Sekcja Powiadomienia */}
        <div className="settings_section">
          <h3 className="section_title">Powiadomienia</h3>
          <div className="settings_row">
            <div className="settings_row_info">
              <h4>Zgoda na powiadomienia</h4>
              <p>Aplikacja będzie wysyłać powiadomienia</p>
            </div>
            <div 
              className={`toggle_switch ${notificationsAccepted ? 'active' : ''}`}
              onClick={() => setNotificationsAccepted(!notificationsAccepted)}
            ></div>
          </div>
        </div>

        {/* Sekcja Funkcje eksperymentalne */}
        <div className="settings_section">
          <h3 className="section_title">Funkcje eksperymentalne</h3>
          <div className="settings_row">
            <div className="settings_row_info">
              <h4>Włącz funkcje eksperymentalne</h4>
              <p>Funkcje mogą działać niestabilnie, mogą powodować błędy, w każdej chwili mogą zostać usunięte. Korzystasz na własną odpowiedzialność!</p>
            </div>
            <div 
              className={`toggle_switch ${isExperimentalEnabled ? 'active' : ''}`}
              onClick={() => setIsExperimentalEnabled(!isExperimentalEnabled)}
            ></div>
          </div>
          
          {isExperimentalEnabled && (
            <div className="experimental_features_list" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px', 
              marginTop: '5px', 
              padding: '15px', 
              backgroundColor: 'light-dark(rgba(0,0,0,0.03), rgba(255,255,255,0.05))', 
              borderRadius: '16px' 
            }}>
              <div className="settings_row" style={{ padding: '0', backgroundColor: 'transparent', boxShadow: 'none', minHeight: 'unset' }}>
                <div className="settings_row_info">
                  <h4 style={{ fontSize: '15px' }}>Widget z pogodą</h4>
                  <p style={{ fontSize: '12px' }}>Dodaje aktualną prognozę pogody do pulpitu.</p>
                </div>
                <div 
                  className={`toggle_switch ${expWeatherWidget ? 'active' : ''}`}
                  onClick={() => setExpWeatherWidget(!expWeatherWidget)}
                  style={{ transform: 'scale(0.85)' }}
                ></div>
              </div>
              
              <div className="settings_row" style={{ padding: '0', backgroundColor: 'transparent', boxShadow: 'none', minHeight: 'unset' }}>
                <div className="settings_row_info">
                  <h4 style={{ fontSize: '15px' }}>Więcej motywów</h4>
                  <p style={{ fontSize: '12px' }}>Odblokowuje nowe, nieoficjalne motywy aplikacji.</p>
                </div>
                <div 
                  className={`toggle_switch ${expMoreThemes ? 'active' : ''}`}
                  onClick={() => setExpMoreThemes(!expMoreThemes)}
                  style={{ transform: 'scale(0.85)' }}
                ></div>
              </div>

              <div className="settings_row" style={{ padding: '0', backgroundColor: 'transparent', boxShadow: 'none', minHeight: 'unset', marginTop: '15px' }}>
                <div className="settings_row_info">
                  <h4 style={{ fontSize: '15px' }}>Nowy Panel (V2)</h4>
                  <p style={{ fontSize: '12px' }}>Testowy widok panelu bazujący na nowym designie (Ciemny Motyw).</p>
                </div>
                <div 
                  className={`toggle_switch ${expNewPanel ? 'active' : ''}`}
                  onClick={() => setExpNewPanel(!expNewPanel)}
                  style={{ transform: 'scale(0.85)' }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Sekcja Wersja aplikacji */}
        <div className="settings_section">
          <h3 className="section_title">Wersja aplikacji</h3>
          <div className="settings_row version_row">
            <div className="version_info">
              <LogoFull />
            </div>
            <div className="version_number">{packageJson.version}</div>
          </div>
        </div>

        {/* Sekcja Ostatnia Aktualizacja (Patch Notes) */}
        <div className="settings_section">
          <h3 className="section_title">Ostatnia aktualizacja</h3>
          <div className="settings_card patch_notes_card">
            {isLoadingRelease ? (
              <p style={{ fontSize: '14px', color: '#888' }}>Ładowanie patch notes...</p>
            ) : latestRelease ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', color: 'light-dark(#183447, #ffffff)' }}>{latestRelease.name || latestRelease.tag_name}</h4>
                  <span style={{ fontSize: '12px', color: '#6b8fa3', fontWeight: '500' }}>
                    {new Date(latestRelease.published_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
                <div className="markdown_body" style={{ fontSize: '13px', lineHeight: '1.6', color: 'light-dark(#3a4f61, #cbd3da)' }}>
                  {latestRelease.body ? (
                    <ReactMarkdown>{latestRelease.body}</ReactMarkdown>
                  ) : (
                    'Brak opisu dla tej aktualizacji.'
                  )}
                </div>
              </>
            ) : (
              <p style={{ fontSize: '14px', color: '#888' }}>Brak informacji o aktualizacjach.</p>
            )}
          </div>
        </div>

        {/* Sekcja Historia Zmian */}
        <div className="settings_section">
          <div className="settings_row" style={{ cursor: 'pointer' }} onClick={() => navigate('/ListaZmian', { viewTransition: true })}>
            <div className="settings_row_info">
              <h4>Historia zmian</h4>
              <p>Sprawdź co nowego w aplikacji oraz dowiedz się więcej o planowanych funkcjach</p>
            </div>
            <button className="changelog_button">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>

        {/* Sekcja Postępy prac */}
        <div className="settings_section">
          <div className="progress_card">
            <h4 className="progress_title">Postępy prac</h4>
            
            {isLoadingMilestones ? (
              <div style={{fontSize: '13px', color: 'rgba(255,255,255,0.7)'}}>Ładowanie danych z GitHub...</div>
            ) : milestones.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {milestones.map((m) => {
                  const total = m.open_issues + m.closed_issues;
                  const pct = total === 0 ? 0 : Math.round((m.closed_issues / total) * 100);
                  const dueDateStr = m.due_on
                    ? new Date(m.due_on).toLocaleDateString('pl-PL')
                    : 'Brak terminu';

                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="progress_info">
                        <span>{m.title}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="progress_bar_container">
                        <div className="progress_bar_fill" style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="progress_footer">
                        <span>{m.closed_issues} z {total} zadań</span>
                        <span>Termin: {dueDateStr}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{fontSize: '13px', color: 'rgba(255,255,255,0.7)'}}>Daj nam chwilkę :)</div>
            )}
          </div>
        </div>

        {/* Sekcja Kontakt i linki */}
        <div className="settings_section">
          <h3 className="section_title">Kontakt i linki</h3>
          <div className="settings_row">
            <div className="settings_row_info">
              <h4>Wyślij opinię</h4>
              <p>Zasugeruj zmiany lub zgłoś błąd</p>
            </div>
            <MainButton 
              type="primary" 
              iconLeft={faWorm}
              text="Zgłoś błąd" 
              className="contact_link_btn bug_btn"
              onClick={() => window.open("https://github.com/SmartCampusOrg/SmartCampus/issues/new", "_blank", "noopener,noreferrer")} 
            />
          </div>
          
          <div className="settings_row">
            <div className="settings_row_info">
              <h4>GitHub</h4>
              <p>Oficjalne repozytorium projektu</p>
            </div>
            <MainButton 
              type="github" 
              iconLeft={faGithub} 
              text="GitHub" 
              className="contact_link_btn"
              onClick={() => window.open("https://github.com/SmartCampusOrg/SmartCampus", "_blank", "noopener,noreferrer")} 
            />
          </div>

          <div className="settings_row">
            <div className="settings_row_info">
              <h4>E-mail</h4>
              <p>smartcampuspansim@gmail.com</p>
            </div>
            <MainButton 
              type="primary" 
              iconLeft={faEnvelope} 
              text="Napisz" 
              className="contact_link_btn email_btn"
              onClick={() => window.open("mailto:smartcampuspansim@gmail.com")} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Ustawienia;
