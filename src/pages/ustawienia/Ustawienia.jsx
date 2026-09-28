import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import { faRightFromBracket, faChevronRight, faWorm, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faGithub } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from "@/context/AuthContext.jsx";
import { useTheme } from "@hooks/useTheme.js";
import LogoFull from "@/components/Logo/LogoFull.jsx";
import CustomSelect from "@/components/CustomSelect/CustomSelect.jsx";
import MainButton from "@/components/Buttons/MainButton/MainButton.jsx";
import ReactMarkdown from 'react-markdown';
import packageJson from '../../../package.json';
import './ustawienia.css';

function Ustawienia() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  
  const [cookiesAccepted, setCookiesAccepted] = useState(true);
  const [notificationsAccepted, setNotificationsAccepted] = useState(false);
  
  const [wydzial, setWydzial] = useState("");
  const [kierunek, setKierunek] = useState("");
  const [grupa, setGrupa] = useState("");
  const [rok, setRok] = useState("");
  const [semestr, setSemestr] = useState("");

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
        <div className="profilePictureAndBaner">
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
              <span className="stat_value">--</span>
              <span className="stat_label">Rok</span>
            </div>
            <div className="user_summary_stat">
              <span className="stat_value">--</span>
              <span className="stat_label">Semestr</span>
            </div>
            <div className="user_summary_stat">
              <span className="stat_value">--</span>
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
            
            <div className="form_row dropdowns_row">
              <CustomSelect
                className="select_wrapper"
                value={wydzial}
                onChange={setWydzial}
                options={[{ value: "1", label: "Wydział Inżynierii" }, { value: "2", label: "Wydział Zarządzania" }]}
                placeholder="Wydział"
              />
              <CustomSelect
                className="select_wrapper"
                value={kierunek}
                onChange={setKierunek}
                options={[{ value: "1", label: "Informatyka" }, { value: "2", label: "Zarządzanie" }]}
                placeholder="Kierunek"
              />
              <CustomSelect
                className="select_wrapper"
                value={grupa}
                onChange={setGrupa}
                options={[{ value: "1", label: "Grupa 1" }, { value: "2", label: "Grupa 2" }]}
                placeholder="Grupa"
              />
              <CustomSelect
                className="select_wrapper small_select"
                value={rok}
                onChange={setRok}
                options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]}
                placeholder="Rok"
              />
              <CustomSelect
                className="select_wrapper small_select"
                value={semestr}
                onChange={setSemestr}
                options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }, { value: "6", label: "6" }, { value: "7", label: "7" }]}
                placeholder="Semestr"
              />
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
