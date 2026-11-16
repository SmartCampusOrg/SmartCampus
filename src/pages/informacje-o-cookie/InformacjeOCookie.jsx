import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Icons from "@icons/icons";
import StartNavBar from "@components/StartNavBar/StartNavBar";
import arrowsLeft from "@pages/start/arrows_left.png";
import dots from "@pages/start/dots.png";
import "@styles/LegalPages.css";

const LANG_STORAGE_KEY = "smartcampus_legal_lang";

const COOKIE_TRANSLATIONS = {
  pl: {
    title: "Informacja o plikach cookie",
    subtitle: "Smart Campus",
    updatedLabel: "Ostatnia aktualizacja",
    updatedDate: "16 listopada 2026",
    lead: "Przejrzystość przede wszystkim.",
    intro:
      "Stosujemy wyłącznie niezbędne technicznie pliki sesyjne oraz pamięć lokalną przeglądarki (localStorage, sessionStorage, IndexedDB i PWA Cache) potrzebne do działania aplikacji — żadnego śledzenia i żadnych reklam. Poniżej znajdziesz pełny wykaz wszystkich zapisywanych danych.",
    cta: "Chcę wiedzieć więcej",
    aiNoticeTitle: null,
    aiNoticeBody: null,
    s1Title: "1. Czym są pliki cookies i pamięć lokalna przeglądarki?",
    s1Desc:
      "Pliki cookies (ciasteczka) oraz nowoczesne mechanizmy pamięci przeglądarki (Web Storage: localStorage, sessionStorage, baza IndexedDB oraz Cache Storage PWA) to niewielkie porcje danych tekstowych zapisywane bezpośrednio na Twoim urządzeniu. Pozwalają one utrzymać aktywną sesję po zalogowaniu, zapamiętać wybrany motyw i grupę dziekańską oraz korzystać z planu zajęć nawet bez dostępu do internetu.",
    s1CaptionBefore: "Rzeczywisty przykład z kodu Smart Campus — klucz",
    s1CaptionKey: "colorScheme",
    s1CaptionMid: ", wartość",
    s1CaptionVal: "dark",
    s1CaptionAfter:
      " zapisywana lokalnie w pamięci przeglądarki (localStorage), aby aplikacja od razu uruchamiała się w wybranym przez Ciebie motywie.",
    s2Title: "2. Pełny wykaz plików cookie i danych w pamięci przeglądarki",
    s2Strong: "Smart Campus wykorzystuje wyłącznie dane techniczne i funkcjonalne",
    s2After:
      " — bez jakichkolwiek ciasteczek reklamowych, marketingowych czy analitycznych podmiotów trzecich. Poniżej znajduje się kompletna lista wszystkich kluczy używanych przez aplikację:",
    colName: "Nazwa / Klucz",
    colProvider: "Typ i dostawca",
    colPurpose: "Do czego służy (Cel)",
    colLifetime: "Czas przechowywania",
    groups: [
      {
        groupTitle: "A. Uwierzytelnianie i sesja bezpieczeństwa",
        groupBadge: "Sesja konta i autoryzacja",
        rows: [
          {
            name: "firebaseLocalStorageDb (firebase:authUser)",
            provider: "IndexedDB / localStorage • Google Firebase",
            purpose: "Przechowanie tokenów sesji OAuth 2.0 i stanu zalogowanego uczelnianego konta Google",
            lifetime: "Do momentu wylogowania"
          },
          {
            name: "firebase-heartbeat-database",
            provider: "IndexedDB • Google Firebase SDK",
            purpose: "Techniczny znacznik wersji bibliotek klienckich Firebase",
            lifetime: "Trwały (do wyczyszczenia danych witryny)"
          },
          {
            name: "JSESSIONID (po stronie funkcji /api/wu-sync)",
            provider: "Cookie sesyjne • CAS PANSIM",
            purpose: "Jednorazowa weryfikacja biletu CAS podczas pobierania planu z Wirtualnej Uczelni (nie zapisuje się na stałe w przeglądarce)",
            lifetime: "Wyłącznie czas trwania żądania (kilka sekund)"
          }
        ]
      },
      {
        groupTitle: "B. Baza planu zajęć i praca w trybie offline (IndexedDB & PWA)",
        groupBadge: "Działanie bez internetu",
        rows: [
          {
            name: "smart_campus_db (schedules / current_schedule)",
            provider: "IndexedDB • Smart Campus",
            purpose: "Główna lokalna baza przechowująca pobrany harmonogram zajęć uczelni, zapewniająca błyskawiczne filtrowanie i dostęp offline",
            lifetime: "Bezterminowo (do kliknięcia „Usuń z pamięci plan zajęć” w Ustawieniach)"
          },
          {
            name: "workbox-precache-v2",
            provider: "Cache Storage (Service Worker) • Smart Campus PWA",
            purpose: "Pamięć podręczna plików aplikacji (interfejs, style, ikony, grafiki budynków) umożliwiająca instalację PWA i działanie offline",
            lifetime: "Do kolejnej aktualizacji wersji aplikacji"
          }
        ]
      },
      {
        groupTitle: "C. Preferencje użytkownika, plan zajęć i interfejs (localStorage)",
        groupBadge: "Personalizacja i ustawienia",
        rows: [
          {
            name: "colorScheme",
            provider: "localStorage • Smart Campus",
            purpose: "Zapamiętanie wybranego motywu kolorystycznego aplikacji (light, dark, system oraz motywy dodatkowe)",
            lifetime: "Bezterminowo (do zmiany lub wyczyszczenia przeglądarki)"
          },
          {
            name: "smart_campus_reduce_motion, smart_campus_reduce_transparency",
            provider: "localStorage • Smart Campus",
            purpose: "Ustawienia z sekcji „Wygląd i wydajność” wyłączające animacje oraz rozmycie i efekty przezroczystości",
            lifetime: "Bezterminowo (do zmiany w Ustawieniach)"
          },
          {
            name: "smart_campus_user_profile",
            provider: "localStorage • Smart Campus",
            purpose: "Zapisany profil planu studenta: wybrany wydział, kierunek, forma studiów, rocznik/semestr, specjalność i grupa",
            lifetime: "Bezterminowo (do zmiany profilu lub resetu filtrów)"
          },
          {
            name: "smart_campus_user_mode",
            provider: "localStorage • Smart Campus",
            purpose: "Wybrany tryb przeglądania harmonogramu (student lub wykładowca)",
            lifetime: "Bezterminowo"
          },
          {
            name: "smart_campus_user_teacher",
            provider: "localStorage • Smart Campus",
            purpose: "Wybrany prowadzący w trybie przeglądania planu zajęć dydaktyka",
            lifetime: "Bezterminowo (do zmiany lub resetu filtrów)"
          },
          {
            name: "smart_campus_schedule_view",
            provider: "localStorage • Smart Campus",
            purpose: "Preferowany układ prezentacji planu zajęć (widok kart lub widok siatki/osi)",
            lifetime: "Bezterminowo"
          },
          {
            name: "smart_campus_schedule_type_filter",
            provider: "localStorage • Smart Campus",
            purpose: "Ostatnio wybrany filtr rodzaju zajęć (np. wszystkie, wykłady, ćwiczenia, laboratoria)",
            lifetime: "Bezterminowo"
          },
          {
            name: "smart_campus_auto_fetch_every_open",
            provider: "localStorage • Smart Campus",
            purpose: "Ustawienie automatycznego pobierania planu zajęć przy każdym otwarciu aplikacji (true / false)",
            lifetime: "Bezterminowo"
          },
          {
            name: "smart_campus_show_term_dates",
            provider: "localStorage • Smart Campus",
            purpose: "Ustawienie wyświetlania zakresów dat przy numerach zjazdów i tygodni w planie zajęć",
            lifetime: "Bezterminowo"
          },
          {
            name: "smart_campus_schedule_last_update",
            provider: "localStorage • Smart Campus",
            purpose: "Znacznik daty i godziny (ISO) ostatniej pomyślnej aktualizacji planu z serwerem uczelni",
            lifetime: "Do wyczyszczenia pamięci planu zajęć"
          },
          {
            name: "smart_campus_schedule_last_daily_fetch",
            provider: "localStorage • Smart Campus",
            purpose: "Data (RRRR-MM-DD) ostatniego automatycznego dziennego pobrania planu zajęć, zapobiegająca nadmiarowym zapytaniom",
            lifetime: "Aktualizowany raz dziennie"
          },
          {
            name: "smart_campus_calendar_events",
            provider: "localStorage • Smart Campus",
            purpose: "Lokalna kopia podręczna prywatnych wydarzeń kalendarza użytkownika zsynchronizowanych z bazą Cloud Firestore",
            lifetime: "Bezterminowo (synchronizowany z kontem)"
          },
          {
            name: "smart_campus_feed_cache_v1",
            provider: "localStorage • Smart Campus",
            purpose: "Pamięć podręczna ostatnio pobranych aktualności wydziałowych ze stron PANSIM przyspieszająca otwieranie zakładki Aktualności",
            lifetime: "Bezterminowo (nadpisywany przy odświeżeniu aktualności)"
          },
          {
            name: "isExperimentalEnabled, expWeatherWidget, expMoreThemes, expNewPanel",
            provider: "localStorage • Smart Campus",
            purpose: "Flagi włączenia funkcji eksperymentalnych w Ustawieniach (widget pogody, dodatkowe motywy, nowy panel V2)",
            lifetime: "Bezterminowo"
          }
        ]
      },
      {
        groupTitle: "D. Pamięć tymczasowa karty przeglądarki (sessionStorage)",
        groupBadge: "Wygasa po zamknięciu karty",
        rows: [
          {
            name: "smartcampus_legal_lang",
            provider: "sessionStorage • Smart Campus",
            purpose: "Zapamiętanie wybranego języka (pl / en) podczas przeglądania Polityki Prywatności i informacji o plikach cookie",
            lifetime: "Sesja przeglądarki (do zamknięcia karty)"
          },
          {
            name: "smartcampus_releases_cache_v1",
            provider: "sessionStorage • Smart Campus",
            purpose: "Tymczasowy bufor historii wydań (changelog) pobranej z publicznego GitHub API",
            lifetime: "15 minut (lub do zamknięcia karty)"
          },
          {
            name: "smartcampus_github_team_v1",
            provider: "sessionStorage • Smart Campus",
            purpose: "Tymczasowy bufor listy członków zespołu projektowego pobranej z GitHub API na stronie startowej",
            lifetime: "30 minut (lub do zamknięcia karty)"
          }
        ]
      }
    ],
    s3Title: "3. Czego NIE robimy",
    s3Items: [
      ["Nie", " używamy plików cookies reklamowych, behawioralnych ani śledzących (cross-site tracking)"],
      ["Nie", " udostępniamy danych z pamięci przeglądarki podmiotom trzecim w celach marketingowych"],
      ["Nie", " profilujemy studentów ani wykładowców na podstawie historii przeglądania"]
    ],
    s4Title: "4. Usługi zewnętrzne a pliki cookies",
    s4BeforeLink:
      "Podczas korzystania z logowania Google OAuth (Firebase Authentication), podkładów mapowych (CARTO / OpenStreetMap), czcionek (Google Fonts) oraz publicznego API GitHub przeglądarka nawiązuje bezpośrednie połączenia HTTPS z serwerami tych dostawców. Dostawcy ci nie umieszczają w Smart Campus ciasteczek reklamowych, a szczegółowy opis ról poszczególnych podmiotów znajdziesz w dokumencie",
    s4LinkLabel: "Polityka Prywatności",
    s5Title: "5. Zarządzanie plikami cookies i pamięcią lokalną",
    s5Lead:
      "Zapisany plan zajęć możesz w każdej chwili wyczyścić bezpośrednio w aplikacji (Ustawienia → Plan zajęć → „Usuń z pamięci plan zajęć”). Ponadto możesz zarządzać plikami cookies i pamięcią witryn (localStorage / IndexedDB) w ustawieniach swojej przeglądarki:",
    s5Browsers: [
      "Google Chrome (Ustawienia → Prywatność i bezpieczeństwo → Dane witryn)",
      "Mozilla Firefox (Ustawienia → Prywatność i bezpieczeństwo → Ciasteczka i dane witryn)",
      "Microsoft Edge (Ustawienia → Pliki cookie i uprawnienia witryn)",
      "Apple Safari (Ustawienia → Prywatność → Zarządzaj danymi witryn)"
    ],
    s5Warning:
      "Zablokowanie niezbędnych danych sesyjnych lub pamięci lokalnej może uniemożliwić zalogowanie się do aplikacji oraz zapamiętanie wybranej grupy dziekańskiej.",
    s6Title: "6. Podstawa prawna",
    s6Text:
      "Przechowywanie niezbędnych danych technicznych i funkcjonalnych w urządzeniu końcowym użytkownika odbywa się zgodnie z art. 399 ust. 3 ustawy z dnia 12 lipca 2024 r. – Prawo komunikacji elektronicznej (PKE), ponieważ jest konieczne do dostarczenia usługi świadczonej drogą elektroniczną, wyraźnie żądanej przez użytkownika (utrzymanie sesji logowania, zapis wybranego planu zajęć i motywu). Przetwarzanie powiązanych danych osobowych opiera się na art. 6 ust. 1 lit. b oraz lit. f RODO.",
    s7Title: "7. Kontakt",
    s7Org: "KNIS — Koło Naukowe Informatyki Stosowanej",
    s7Uni: "Państwowa Akademia Nauk Stosowanych im. Ignacego Mościckiego w Ciechanowie (Wydział Inżynierii i Ekonomii)",
    s7Addr: "ul. Gabriela Narutowicza 9, 06-400 Ciechanów",
    footerDate: "Ostatnia aktualizacja: 16 listopada 2026",
    footerSub: "Smart Campus • PANSIM w Ciechanowie",
    backLink: "← Wróć na stronę startową"
  },
  en: {
    title: "Cookie & Local Storage Policy",
    subtitle: "Smart Campus",
    updatedLabel: "Last updated",
    updatedDate: "November 16, 2026",
    lead: "Transparency first.",
    intro:
      "We only use strictly necessary session mechanisms and local browser storage (localStorage, sessionStorage, IndexedDB, and PWA Cache) required for the application to function — no tracking, no advertising. Below is the complete inventory of all stored items.",
    cta: "Learn more",
    aiNoticeTitle: "AI-translated version:",
    aiNoticeBody:
      "This English translation was generated with the assistance of AI for your convenience. In the event of any discrepancy or ambiguity, the original Polish version prevails.",
    s1Title: "1. What are cookies and local browser storage?",
    s1Desc:
      "Cookies and modern browser storage mechanisms (Web Storage: localStorage, sessionStorage, IndexedDB database, and PWA Cache Storage) are small pieces of data saved directly on your device. They keep your sign-in session active, remember your chosen color theme and student group, and allow you to browse your class schedule even when offline.",
    s1CaptionBefore: "Real example from the Smart Campus codebase — key",
    s1CaptionKey: "colorScheme",
    s1CaptionMid: ", value",
    s1CaptionVal: "dark",
    s1CaptionAfter:
      " saved locally in browser storage (localStorage) so the application launches immediately in your preferred color theme.",
    s2Title: "2. Complete Inventory of Cookies and Browser Storage Keys",
    s2Strong: "Smart Campus uses exclusively technical and functional storage items",
    s2After:
      " — with zero advertising, marketing, or third-party tracking cookies. Below is the full specification of every key used by the application:",
    colName: "Name / Key",
    colProvider: "Type & Provider",
    colPurpose: "Purpose & Description",
    colLifetime: "Retention / Lifetime",
    groups: [
      {
        groupTitle: "A. Authentication and Security Session",
        groupBadge: "Account session & auth",
        rows: [
          {
            name: "firebaseLocalStorageDb (firebase:authUser)",
            provider: "IndexedDB / localStorage • Google Firebase",
            purpose: "Stores OAuth 2.0 session tokens and the signed-in state of your university Google account",
            lifetime: "Until sign-out"
          },
          {
            name: "firebase-heartbeat-database",
            provider: "IndexedDB • Google Firebase SDK",
            purpose: "Technical version metadata used internally by Firebase client libraries",
            lifetime: "Persistent (until site data is cleared)"
          },
          {
            name: "JSESSIONID (inside /api/wu-sync function)",
            provider: "Transient session cookie • PANSIM CAS",
            purpose: "One-time CAS ticket verification while fetching the timetable from the Virtual University (not persisted in your browser)",
            lifetime: "Single request duration only (a few seconds)"
          }
        ]
      },
      {
        groupTitle: "B. Timetable Database and Offline Mode (IndexedDB & PWA)",
        groupBadge: "Offline functionality",
        rows: [
          {
            name: "smart_campus_db (schedules / current_schedule)",
            provider: "IndexedDB • Smart Campus",
            purpose: "Primary local database storing the parsed university class schedule for instant filtering and offline access",
            lifetime: "Persistent (until cleared via “Clear schedule cache” in Settings)"
          },
          {
            name: "workbox-precache-v2",
            provider: "Cache Storage (Service Worker) • Smart Campus PWA",
            purpose: "Caches core application assets (UI bundles, stylesheets, icons, campus graphics) for PWA installation and offline operation",
            lifetime: "Until the next application version update"
          }
        ]
      },
      {
        groupTitle: "C. User Preferences, Timetable Filters, and Interface (localStorage)",
        groupBadge: "Personalization & settings",
        rows: [
          {
            name: "colorScheme",
            provider: "localStorage • Smart Campus",
            purpose: "Remembers your selected application color theme (light, dark, system, and additional themes)",
            lifetime: "Persistent (until changed or browser data is cleared)"
          },
          {
            name: "smart_campus_reduce_motion, smart_campus_reduce_transparency",
            provider: "localStorage • Smart Campus",
            purpose: "Preferences from “Appearance & Performance” disabling animations as well as blur and transparency effects",
            lifetime: "Persistent (until changed in Settings)"
          },
          {
            name: "smart_campus_user_profile",
            provider: "localStorage • Smart Campus",
            purpose: "Saved student schedule profile: selected faculty, field of study, study mode, year/semester, specialization, and group",
            lifetime: "Persistent (until profile change or filter reset)"
          },
          {
            name: "smart_campus_user_mode",
            provider: "localStorage • Smart Campus",
            purpose: "Selected timetable browsing mode (student or teacher)",
            lifetime: "Persistent"
          },
          {
            name: "smart_campus_user_teacher",
            provider: "localStorage • Smart Campus",
            purpose: "Selected lecturer name when browsing in teacher timetable mode",
            lifetime: "Persistent (until changed or filter reset)"
          },
          {
            name: "smart_campus_schedule_view",
            provider: "localStorage • Smart Campus",
            purpose: "Preferred timetable layout (cards view or grid/timeline view)",
            lifetime: "Persistent"
          },
          {
            name: "smart_campus_schedule_type_filter",
            provider: "localStorage • Smart Campus",
            purpose: "Last selected class type filter (all, lectures, exercises, labs, etc.)",
            lifetime: "Persistent"
          },
          {
            name: "smart_campus_auto_fetch_every_open",
            provider: "localStorage • Smart Campus",
            purpose: "Setting that controls whether the timetable is refreshed on every app launch (true / false)",
            lifetime: "Persistent"
          },
          {
            name: "smart_campus_show_term_dates",
            provider: "localStorage • Smart Campus",
            purpose: "Setting that toggles date ranges next to weekend-session and week numbers in the schedule",
            lifetime: "Persistent"
          },
          {
            name: "smart_campus_schedule_last_update",
            provider: "localStorage • Smart Campus",
            purpose: "ISO timestamp of the last successful timetable synchronization with the university server",
            lifetime: "Until schedule cache is cleared"
          },
          {
            name: "smart_campus_schedule_last_daily_fetch",
            provider: "localStorage • Smart Campus",
            purpose: "Date (YYYY-MM-DD) of the last automatic daily schedule fetch to prevent redundant network requests",
            lifetime: "Updated once per day"
          },
          {
            name: "smart_campus_calendar_events",
            provider: "localStorage • Smart Campus",
            purpose: "Local cache of personal calendar events synchronized with Google Cloud Firestore",
            lifetime: "Persistent (synced with your account)"
          },
          {
            name: "smart_campus_feed_cache_v1",
            provider: "localStorage • Smart Campus",
            purpose: "Local cache of recently fetched PANSIM faculty news for faster loading of the News tab",
            lifetime: "Persistent (overwritten on news refresh)"
          },
          {
            name: "isExperimentalEnabled, expWeatherWidget, expMoreThemes, expNewPanel",
            provider: "localStorage • Smart Campus",
            purpose: "Feature flags for experimental options enabled in Settings (weather widget, extra themes, new V2 dashboard)",
            lifetime: "Persistent"
          }
        ]
      },
      {
        groupTitle: "D. Temporary Browser Tab Storage (sessionStorage)",
        groupBadge: "Expires when tab closes",
        rows: [
          {
            name: "smartcampus_legal_lang",
            provider: "sessionStorage • Smart Campus",
            purpose: "Remembers the selected language (pl / en) while reading the Privacy Policy and Cookie Policy pages",
            lifetime: "Browser session (until tab/window is closed)"
          },
          {
            name: "smartcampus_releases_cache_v1",
            provider: "sessionStorage • Smart Campus",
            purpose: "Temporary cache of release notes (changelog) fetched from the public GitHub API",
            lifetime: "15 minutes (or until tab is closed)"
          },
          {
            name: "smartcampus_github_team_v1",
            provider: "sessionStorage • Smart Campus",
            purpose: "Temporary cache of project team members fetched from the GitHub API on the Start page",
            lifetime: "30 minutes (or until tab is closed)"
          }
        ]
      }
    ],
    s3Title: "3. What We Do NOT Do",
    s3Items: [
      ["We do not", " use advertising, behavioral, or cross-site tracking cookies"],
      ["We do not", " share browser storage data with third parties for marketing purposes"],
      ["We do not", " profile students or lecturers based on browsing history"]
    ],
    s4Title: "4. External Services and Cookies",
    s4BeforeLink:
      "When using Google OAuth sign-in (Firebase Authentication), campus map tiles (CARTO / OpenStreetMap), web fonts (Google Fonts), and the public GitHub API, your browser establishes direct HTTPS connections with those providers. They do not set advertising cookies inside Smart Campus; full details on third-party services are available in our",
    s4LinkLabel: "Privacy Policy",
    s5Title: "5. Managing Cookies and Local Storage",
    s5Lead:
      "You can clear the cached class schedule at any time directly inside the application (Settings → Class Schedule → “Clear schedule cache”). You can also manage or clear cookies and site data (localStorage / IndexedDB) in your web browser settings:",
    s5Browsers: [
      "Google Chrome (Settings → Privacy and security → Site settings / Site data)",
      "Mozilla Firefox (Settings → Privacy & Security → Cookies and Site Data)",
      "Microsoft Edge (Settings → Cookies and site permissions)",
      "Apple Safari (Settings → Privacy → Manage Website Data)"
    ],
    s5Warning:
      "Blocking strictly necessary session storage or local storage may prevent you from signing in to the application or saving your selected student group.",
    s6Title: "6. Legal Basis",
    s6Text:
      "Storing strictly necessary technical and functional data on the user’s terminal device is carried out in accordance with Article 399(3) of the Polish Electronic Communications Law of July 12, 2024 (Prawo komunikacji elektronicznej — PKE), as it is essential to deliver an electronically supplied service explicitly requested by the user (maintaining authentication sessions, storing the selected timetable and color theme). Processing of associated personal data is based on Article 6(1)(b) and Article 6(1)(f) of the GDPR.",
    s7Title: "7. Contact",
    s7Org: "KNIS — Applied Computer Science Student Research Club",
    s7Uni: "Ignacy Mościcki State University of Applied Sciences in Ciechanów (Faculty of Engineering and Economics)",
    s7Addr: "ul. Gabriela Narutowicza 9, 06-400 Ciechanów, Poland",
    footerDate: "Last updated: November 16, 2026",
    footerSub: "Smart Campus • PANSIM in Ciechanów",
    backLink: "← Back to Start page"
  }
};

function InformacjeOCookie() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryLang = searchParams.get("lang");

  const [lang, setLang] = useState(() => {
    if (queryLang === "en" || queryLang === "pl") {
      return queryLang;
    }
    try {
      return sessionStorage.getItem(LANG_STORAGE_KEY) === "en" ? "en" : "pl";
    } catch {
      return "pl";
    }
  });

  useEffect(() => {
    if (queryLang === "en" || queryLang === "pl") {
      setLang(queryLang);
      try {
        sessionStorage.setItem(LANG_STORAGE_KEY, queryLang);
      } catch {
        // Ignore storage errors
      }
    }
  }, [queryLang]);

  const handleLangChange = (nextLang) => {
    setLang(nextLang);
    try {
      sessionStorage.setItem(LANG_STORAGE_KEY, nextLang);
    } catch {
      // Ignore storage errors
    }
    setSearchParams({ lang: nextLang }, { replace: true });
  };

  const t = COOKIE_TRANSLATIONS[lang] || COOKIE_TRANSLATIONS.pl;

  const scrollToContent = () => {
    const el = document.getElementById("cookie-tresc");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="LegalPage" lang={lang}>
      <StartNavBar />

      <div className="LegalPage__container">
        <header className="LegalPage__topMeta">
          <div className="LegalPage__titleGroup">
            <FontAwesomeIcon icon={Icons.faCookieBite} className="LegalPage__icon" />
            <div>
              <h1>{t.title}</h1>
              <span className="LegalPage__subtitle">{t.subtitle}</span>
            </div>
          </div>

          <div className="LegalPage__rightMeta">
            <div className="LegalLangSwitch" role="group" aria-label="Wybór języka / Language switcher">
              <FontAwesomeIcon icon={Icons.faGlobe} className="LegalLangSwitch__icon" />
              <button
                type="button"
                className={lang === "pl" ? "active" : ""}
                onClick={() => handleLangChange("pl")}
              >
                Polski
              </button>
              <button
                type="button"
                className={lang === "en" ? "active" : ""}
                onClick={() => handleLangChange("en")}
              >
                English
              </button>
            </div>

            <div className="LegalPage__updated">
              <span>{t.updatedLabel}</span>
              <strong>{t.updatedDate}</strong>
            </div>
          </div>
        </header>

        {lang === "en" && (
          <div className="LegalAiNotice" role="note">
            <FontAwesomeIcon icon={Icons.faGlobe} className="LegalAiNotice__icon" />
            <div>
              <strong>{t.aiNoticeTitle}</strong> {t.aiNoticeBody}
            </div>
          </div>
        )}

        <section className="LegalPage__intro">
          <p className="LegalPage__lead">{t.lead}</p>
          <p className="LegalPage__introText">{t.intro}</p>
          <div className="LegalPage__ctaRow">
            <button
              type="button"
              className="LegalPage__ctaBtn"
              onClick={scrollToContent}
            >
              {t.cta}
            </button>
            <img
              className="LegalPage__arrowsLeft"
              src={arrowsLeft}
              alt=""
              aria-hidden="true"
            />
          </div>
        </section>

        <div className="LegalPage__sections" id="cookie-tresc">
          <section className="LegalSection">
            <h2>{t.s1Title}</h2>
            <p>{t.s1Desc}</p>
            <div className="LegalCodeBanner">
              <code>localStorage.setItem(&quot;colorScheme&quot;, &quot;dark&quot;);</code>
            </div>
            <p className="LegalCodeCaption">
              {t.s1CaptionBefore} <strong>{t.s1CaptionKey}</strong>
              {t.s1CaptionMid} <strong>{t.s1CaptionVal}</strong>
              {t.s1CaptionAfter}
            </p>
          </section>

          <section className="LegalSection">
            <h2>{t.s2Title}</h2>
            <p>
              <strong>{t.s2Strong}</strong>
              {t.s2After}
            </p>

            <div className="LegalStorageGroups">
              {t.groups.map((group, gIdx) => (
                <div key={gIdx} className="LegalStorageGroup">
                  <div className="LegalStorageGroup__header">
                    <h3>{group.groupTitle}</h3>
                    <span className="LegalStorageGroup__badge">{group.groupBadge}</span>
                  </div>

                  <div className="LegalCookieTable">
                    <div className="LegalCookieTable__head">
                      <span>{t.colName}</span>
                      <span>{t.colProvider}</span>
                      <span>{t.colPurpose}</span>
                      <span>{t.colLifetime}</span>
                    </div>

                    {group.rows.map((row, rIdx) => (
                      <div key={rIdx} className="LegalCookieTable__row">
                        <div className="LegalPill LegalPill--light">
                          <span className="LegalCookieTable__cellLabel">{t.colName}</span>
                          <code className="LegalKeyCode">{row.name}</code>
                        </div>
                        <div className="LegalPill LegalPill--dark">
                          <span className="LegalCookieTable__cellLabel">{t.colProvider}</span>
                          <span>{row.provider}</span>
                        </div>
                        <div className="LegalPill LegalPill--light">
                          <span className="LegalCookieTable__cellLabel">{t.colPurpose}</span>
                          <span>{row.purpose}</span>
                        </div>
                        <div className="LegalPill LegalPill--dark">
                          <span className="LegalCookieTable__cellLabel">{t.colLifetime}</span>
                          <span>{row.lifetime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="LegalSection">
            <h2>{t.s3Title}</h2>
            <ul>
              {t.s3Items.map(([leadWord, rest], idx) => (
                <li key={idx}>
                  <strong>{leadWord}</strong>
                  {rest}
                </li>
              ))}
            </ul>
          </section>

          <section className="LegalSection">
            <h2>{t.s4Title}</h2>
            <p>
              {t.s4BeforeLink}{" "}
              <Link to={`/PolitykaPrywatnosci?lang=${lang}`} className="LegalSection__link">
                {t.s4LinkLabel}
              </Link>
              .
            </p>
          </section>

          <section className="LegalSection">
            <h2>{t.s5Title}</h2>
            <p>{t.s5Lead}</p>
            <ul>
              {t.s5Browsers.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <p>
              <strong>{t.s5Warning}</strong>
            </p>
          </section>

          <section className="LegalSection">
            <h2>{t.s6Title}</h2>
            <p>{t.s6Text}</p>
          </section>

          <section className="LegalSection">
            <h2>{t.s7Title}</h2>
            <div className="LegalContactSection">
              <div className="LegalContactSection__info">
                <p>
                  <strong>{t.s7Org}</strong>
                </p>
                <p>{t.s7Uni}</p>
                <p>{t.s7Addr}</p>
                <p>
                  <a
                    href="mailto:smartcampuspansim@gmail.com"
                    className="LegalSection__link"
                  >
                    smartcampuspansim@gmail.com
                  </a>
                </p>
                <p>
                  <a
                    href="https://github.com/SmartCampusOrg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="LegalSection__link"
                  >
                    github.com/SmartCampusOrg
                  </a>
                </p>
              </div>
              <img
                src={dots}
                alt=""
                aria-hidden="true"
                className="LegalContactSection__dots"
              />
            </div>
          </section>
        </div>

        <footer className="LegalBottomCard">
          <strong>{t.footerDate}</strong>
          <span>{t.footerSub}</span>
          <Link to="/Start" className="LegalBottomCard__backLink">
            {t.backLink}
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default InformacjeOCookie;
