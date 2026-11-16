import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import StartNavBar from '@components/StartNavBar/StartNavBar';
import CustomSelect from '@components/CustomSelect/CustomSelect';
import packageJson from '../../../package.json';
import './ZglosBlad.css';

const REPORT_TYPES = [
  { value: 'bug', label: 'Błąd (Bug)' },
  { value: 'enhancement', label: 'Sugestia / Nowa funkcja' },
  { value: 'ui', label: 'Problem z wyglądem (UI)' },
  { value: 'question', label: 'Pytanie / Inne' },
];

const MODULE_OPTIONS = [
  { value: 'Ogólne / Cała aplikacja', label: 'Ogólne / Cała aplikacja' },
  { value: 'Plan zajęć', label: 'Plan zajęć' },
  { value: 'Panel główny', label: 'Panel główny' },
  { value: 'Mapa kampusu', label: 'Mapa kampusu' },
  { value: 'Aktualności', label: 'Aktualności' },
  { value: 'Ustawienia', label: 'Ustawienia' },
  { value: 'Strona startowa', label: 'Strona startowa' },
  { value: 'Logowanie', label: 'Logowanie' },
];

function getEnvironmentSummary(isLoggedIn) {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return '';

  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator.standalone === true;
  const dpr = window.devicePixelRatio ? ` @${window.devicePixelRatio}x` : '';
  const screenSize = window.screen
    ? `${window.screen.width}×${window.screen.height}${dpr}`
    : 'brak danych';
  const viewport = `${window.innerWidth}×${window.innerHeight}`;
  const inputType =
    navigator.maxTouchPoints > 0 ? `Ekran dotykowy (${navigator.maxTouchPoints} pkt)` : 'Mysz / Desktop';
  const networkStatus = navigator.onLine ? 'Online' : 'Offline';
  const connectionType = navigator.connection?.effectiveType
    ? ` (${navigator.connection.effectiveType})`
    : '';
  const timeZone = Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || 'nieznana';
  const activeTheme =
    document.documentElement?.dataset?.theme ||
    localStorage.getItem('colorScheme') ||
    'light';
  const reduceMotion = document.documentElement?.dataset?.reduceMotion === 'true' ? 'Tak' : 'Nie';
  const reduceTransparency =
    document.documentElement?.dataset?.reduceTransparency === 'true' ? 'Tak' : 'Nie';
  const experimental = localStorage.getItem('isExperimentalEnabled') === 'true' ? 'Tak' : 'Nie';

  return [
    `Tryb uruchomienia: ${isStandalone ? 'Zainstalowana aplikacja PWA (standalone)' : 'Przeglądarka web'}`,
    `Domena: ${window.location.origin}`,
    `Viewport: ${viewport} • Ekran: ${screenSize}`,
    `Sterowanie: ${inputType}`,
    `Sieć: ${networkStatus}${connectionType}`,
    `Język / Strefa: ${navigator.language || 'pl'} • ${timeZone}`,
    `Sesja: ${isLoggedIn ? 'Użytkownik zalogowany' : 'Niezalogowany'}`,
    `Motyw: ${activeTheme} • Bez animacji: ${reduceMotion} • Bez blur/szkła: ${reduceTransparency} • Eksperymentalne: ${experimental}`,
    `User-Agent: ${navigator.userAgent}`,
  ].join('\n');
}

function ZglosBlad() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [type, setType] = useState('bug');
  const [moduleName, setModuleName] = useState('Ogólne / Cała aplikacja');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState(user?.email || '');
  const [includeEnv, setIncludeEnv] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fallbackUrl, setFallbackUrl] = useState(null);
  const [createdIssue, setCreatedIssue] = useState(null);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(user ? '/Ustawienia' : '/Start');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFallbackUrl(null);

    if (title.trim().length < 1) {
      setError('Podaj tytuł zgłoszenia.');
      return;
    }

    if (!description.trim()) {
      setError('Podaj opis zgłoszenia.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          moduleName,
          title: title.trim(),
          description: description.trim(),
          contact: contact.trim(),
          appVersion: packageJson.version,
          environment: includeEnv ? getEnvironmentSummary(Boolean(user)) : '',
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        if (data?.fallbackUrl) {
          setFallbackUrl(data.fallbackUrl);
          setError(
            'Automatyczne wysyłanie przez serwer nie jest jeszcze aktywne (brak tokena GitHub). Możesz wysłać to samo zgłoszenie jednym kliknięciem bezpośrednio przez GitHub:'
          );
          return;
        }
        throw new Error(data?.error || 'Nie udało się wysłać zgłoszenia.');
      }

      setCreatedIssue(data.issue);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Wystąpił błąd podczas wysyłania zgłoszenia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedIssue(null);
    setError(null);
    setFallbackUrl(null);
  };

  return (
    <main className="ReportPage ReportPage--public">
      <StartNavBar />

      <div className="ReportPage__container">
        <header className="ReportPage__topMeta">
          <div className="ReportPage__titleGroup">
            <FontAwesomeIcon icon={Icons.faWorm} className="ReportPage__icon" />
            <div>
              <h1>Zgłoś błąd lub sugestię</h1>
              <span className="ReportPage__subtitle">Smart Campus</span>
            </div>
          </div>

          <div className="ReportPage__rightMeta">
            <button
              type="button"
              className="ReportPage__backBtn"
              onClick={handleBack}
            >
              <FontAwesomeIcon icon={Icons.faArrowLeft} /> Wstecz
            </button>
            <div className="ReportPage__updated">
              <span>Wersja aplikacji</span>
              <strong>v{packageJson.version}</strong>
            </div>
          </div>
        </header>

        <section className="ReportPage__intro">
          <p className="ReportPage__lead">Pomóż nam ulepszać Smart Campus.</p>
          <p className="ReportPage__introText">
            Znalazłeś błąd w działaniu aplikacji, problem z interfejsem lub masz pomysł na nową funkcję?
            Wypełnij poniższy formularz — zgłoszenie trafi bezpośrednio jako Issue do naszego repozytorium GitHub.
          </p>
        </section>

        {createdIssue ? (
          <section className="ReportCard ReportCard--success">
            <div className="ReportCard__successBadge">Zgłoszenie utworzone</div>
            <h2>Dziękujemy za zgłoszenie #{createdIssue.number}!</h2>
            <p>
              Twoje zgłoszenie zostało zapisane na GitHubie z etykietą{' '}
              <code>{createdIssue.label}</code>. Możesz śledzić postęp prac pod poniższym linkiem:
            </p>
            <div className="ReportCard__successActions">
              <a
                href={createdIssue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ReportPage__primaryBtn"
              >
                <FontAwesomeIcon icon={Icons.faGithub} /> Zobacz Issue #{createdIssue.number} ↗
              </a>
              <button
                type="button"
                className="ReportPage__secondaryBtn"
                onClick={handleReset}
              >
                Wyślij kolejne zgłoszenie
              </button>
            </div>
          </section>
        ) : (
          <form className="ReportCard" onSubmit={handleSubmit} noValidate>
            <div className="ReportForm__row">
              <div className="ReportForm__field">
                <label>Typ zgłoszenia</label>
                <CustomSelect
                  value={type}
                  onChange={setType}
                  options={REPORT_TYPES}
                  placeholder="Wybierz typ zgłoszenia"
                />
              </div>

              <div className="ReportForm__field">
                <label>Obszar aplikacji</label>
                <CustomSelect
                  value={moduleName}
                  onChange={setModuleName}
                  options={MODULE_OPTIONS}
                  placeholder="Wybierz obszar"
                />
              </div>
            </div>

            <div className="ReportForm__field">
              <label htmlFor="report-title">Tytuł zgłoszenia *</label>
              <input
                id="report-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'enhancement'
                    ? 'Np. Możliwość eksportu planu zajęć do Google Calendar'
                    : 'Np. Błąd ładowania planu zajęć po zmianie kierunku'
                }
                maxLength={160}
                required
              />
            </div>

            <div className="ReportForm__field">
              <label htmlFor="report-desc">Szczegółowy opis *</label>
              <textarea
                id="report-desc"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  type === 'enhancement'
                    ? 'Opisz swój pomysł i w czym mógłby pomóc studentom...'
                    : 'Opisz co się stało, jakie kroki wykonałeś i co powinno było się wydarzyć...'
                }
                required
              />
            </div>

            <div className="ReportForm__field">
              <label htmlFor="report-contact">Kontakt zwrotny (opcjonalnie)</label>
              <input
                id="report-contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Adres e-mail lub nick GitHub, jeśli chcesz otrzymać odpowiedź"
              />
            </div>

            <label className="ReportForm__checkbox">
              <input
                type="checkbox"
                checked={includeEnv}
                onChange={(e) => setIncludeEnv(e.target.checked)}
              />
              <span>
                Dołącz automatycznie dane diagnostyczne (wersja v{packageJson.version}, przeglądarka, system, rozdzielczość ekranu, tryb PWA, motyw, stan sieci oraz aktywne opcje wyglądu)
              </span>
            </label>

            {error && (
              <div className="ReportForm__error" role="alert">
                <p>{error}</p>
                {fallbackUrl && (
                  <a
                    href={fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ReportPage__primaryBtn"
                  >
                    <FontAwesomeIcon icon={Icons.faGithub} /> Otwórz gotowe zgłoszenie na GitHubie ↗
                  </a>
                )}
              </div>
            )}

            <div className="ReportForm__actions">
              <button
                type="submit"
                className="ReportPage__primaryBtn"
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon={Icons.faGithub} />{' '}
                {isSubmitting ? 'Wysyłanie zgłoszenia...' : 'Wyślij zgłoszenie na GitHub'}
              </button>
            </div>
          </form>
        )}

        <footer className="ReportBottomCard">
          <strong>Repozytorium: SmartCampusOrg/SmartCampus</strong>
          <span>Smart Campus • PANSIM w Ciechanowie</span>
          <Link to={user ? '/Ustawienia' : '/Start'} className="ReportBottomCard__backLink">
            {user ? '← Wróć do Ustawień' : '← Wróć na stronę startową'}
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default ZglosBlad;
