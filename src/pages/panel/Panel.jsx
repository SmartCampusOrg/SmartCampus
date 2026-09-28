import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import { useAuth } from "@/context/AuthContext.jsx";
import { useTheme } from '@hooks/useTheme.js';
import ToggleSwitch from "@components/ToggleSwitch/ToggleSwitch.jsx";
import WeatherWidget from '@features/WeatherWidget';
import bannerImg from '@icons/../img/pansim_banner.webp';
import './Panel.css';
import NewPanel from '@/features/NewPanel/NewPanel.jsx';

function Panel() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const userName = user?.displayName ? user.displayName.split(" ")[0] : "Student";

  const isExperimentalEnabled = localStorage.getItem('isExperimentalEnabled') === 'true';
  const showWeather = isExperimentalEnabled && localStorage.getItem('expWeatherWidget') === 'true';
  const showNewPanel = isExperimentalEnabled && localStorage.getItem('expNewPanel') === 'true';

  if (showNewPanel) {
    return <NewPanel />;
  }

  return (
    <div className="panel_dashboard">
      
      {/* Banner Section */}
      <div className="panel_banner">
        <img src={bannerImg} alt="Smart Campus" className="panel_banner_image" />
        <div className="panel_banner_overlay">
          <h1 className="panel_banner_title">Witaj, {userName}!</h1>
          <div className="panel_banner_subtitle">Miłego dnia.</div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="panel_grid">
        
        {/* Kolumna 1: Pogoda + Motyw */}
        <div className="panel_widget_column">
          
          {showWeather && (
            <div className="panel_widget">
              <div className="panel_widget_title">
                <FontAwesomeIcon icon={Icons.faCloudSun} style={{ opacity: 0.7 }} /> Pogoda lokalna
              </div>
              <div className="panel_widget_content" style={{ display: 'flex', minHeight: '64px' }}>
                <WeatherWidget />
              </div>
            </div>
          )}

          <div className="panel_widget">
            <div className="panel_widget_title">
              <FontAwesomeIcon icon={Icons.faPalette} style={{ opacity: 0.7 }} /> Wygląd
            </div>
            <div className="panel_widget_content">
              <div style={{ display: 'flex', alignItems: 'center', background: 'light-dark(rgba(255, 255, 255, 0.6), rgba(24, 52, 71, 0.5))', backdropFilter: 'blur(12px)', border: '1px solid light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.1))', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  marginRight: '15px'
                }}>
                  <FontAwesomeIcon icon={theme === 'dark' ? Icons.faMoon : Icons.faSun} style={{ opacity: 0.7, fontSize: '24px', color: 'light-dark(#183447, #D5DEE7)' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600' }}>{theme === 'dark' ? 'Ciemny motyw' : 'Jasny motyw'}</span>
                  <span style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px', textTransform: 'uppercase' }}>Ustawienie</span>
                </div>
                <ToggleSwitch
                  id="panelThemeToggle"
                  defaultState={theme === 'dark'}
                  onToggle={toggleTheme}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Kolumna 2: Szybkie Skróty */}
        <div className="panel_widget">
          <div className="panel_widget_title">
            <FontAwesomeIcon icon={Icons.faLaptopCode} style={{ opacity: 0.7 }} /> Szybki dostęp
          </div>
          <div className="panel_widget_content">
            <Link to="/PlanLekcji" className="panel_shortcutBtn">
              <FontAwesomeIcon icon={Icons.faCalendarDays} className="panel_shortcutBtn_icon" />
              Twój plan zajęć
            </Link>
            <a href="https://moodle.pansim.edu.pl/" target="_blank" rel="noreferrer" className="panel_shortcutBtn">
              <FontAwesomeIcon icon={Icons.faGraduationCap} className="panel_shortcutBtn_icon" />
              Platforma Moodle
            </a>
            <a href="https://wu.pansim.edu.pl/wu/start?&locale=pl" target="_blank" rel="noreferrer" className="panel_shortcutBtn">
              <FontAwesomeIcon icon={Icons.faIdCard} className="panel_shortcutBtn_icon" />
              Wirtualna Uczelnia
            </a>
          </div>
        </div>

        {/* Kolumna 3: Ważne Ogłoszenia */}
        <div className="panel_widget">
          <div className="panel_widget_title">
            <FontAwesomeIcon icon={Icons.faBell} style={{ opacity: 0.7 }} /> Ważne ogłoszenia
          </div>
          <div className="panel_widget_content">
            
            <div className="panel_newsItem">
              <div className="panel_newsItem_title">Wersja Beta</div>
              <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '4px' }}>
                Witaj w nowej, testowej wersji aplikacji Smart Campus. Niektóre funkcje mogą jeszcze ulegać zmianie!
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Panel;
