import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import StartNavBar from '@components/StartNavBar/StartNavBar';
import arrowsLeft from '@pages/start/arrows_left.png';
import dots from '@pages/start/dots.png';
import packageJson from '../../../package.json';
import './OProjekcie.css';

const MODULES = [
  {
    icon: Icons.faCalendarDays,
    title: 'Plan zajęć i synchronizacja WU',
    desc: 'Przejrzysty podgląd zajęć w widoku kart, listy i siatki, filtrowanie po kierunku, grupie lub wykładowcy oraz pełna praca offline dzięki lokalnej bazie IndexedDB.',
    badge: 'Dostępny',
  },
  {
    icon: Icons.faBell,
    title: 'Aktualności z 3 wydziałów',
    desc: 'Wszystkie komunikaty z wydziałów PANSIM w Ciechanowie zbierane automatycznie w jednym chronologicznym miejscu, z szybkim filtrowaniem po wydziale.',
    badge: 'Dostępny',
  },
  {
    icon: Icons.faMap,
    title: 'Interaktywna mapa kampusu',
    desc: 'Budynki uczelni w Ciechanowie i filii w Mławie, przystanki komunikacji miejskiej, obrysy obiektów oraz opcjonalne wskazanie Twojej pozycji na mapie.',
    badge: 'Beta',
  },
  {
    icon: Icons.faBookOpen,
    title: 'E-learning i terminarz',
    desc: 'Prywatny kalendarz wydarzeń zsynchronizowany z kontem uczelnianym w chmurze oraz rozwijany moduł materiałów edukacyjnych dla studentów.',
    badge: 'W rozwoju',
  },
];

const TECH_STACK = [
  {
    name: 'React 19 & Vite PWA',
    role: 'Interfejs użytkownika i praca offline',
    desc: 'Szybka aplikacja webowa z możliwością instalacji na telefonie i komputerze oraz pełną obsługą trybu jasnego, ciemnego i redukcji animacji.',
  },
  {
    name: 'Firebase Auth & Firestore',
    role: 'Bezpieczne logowanie i kalendarz',
    desc: 'Uwierzytelnianie wyłącznie dla uczelnianych kont Google PANSIM oraz prywatne przechowywanie wydarzeń użytkownika z regułami dostępu.',
  },
  {
    name: 'Netlify Functions',
    role: 'Bezserwerowe API pośredniczące',
    desc: 'Obsługa jednorazowej synchronizacji planu z Wirtualną Uczelnią (CAS), agregacja aktualności wydziałowych i integracja zgłoszeń GitHub Issues.',
  },
  {
    name: 'Leaflet & OpenStreetMap',
    role: 'Mapy wektorowe i nawigacja',
    desc: 'Lekkie, responsywne mapy kampusów w Ciechanowie i Mławie z podziałem na tryb dzienny i nocny.',
  },
];

function OProjekcie() {
  const scrollToModules = () => {
    const el = document.getElementById('o-projekcie-moduly');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="AboutPage">
      <StartNavBar />

      <div className="AboutPage__container">
        <header className="AboutPage__topMeta">
          <div className="AboutPage__titleGroup">
            <FontAwesomeIcon icon={Icons.faGraduationCap} className="AboutPage__icon" />
            <div>
              <h1>O projekcie</h1>
              <span className="AboutPage__subtitle">Smart Campus • PANSIM w Ciechanowie</span>
            </div>
          </div>

          <div className="AboutPage__rightMeta">
            <div className="AboutPage__versionPill">
              <span>Aktualna wersja: v{packageJson.version}</span>
            </div>
          </div>
        </header>

        <section className="AboutPage__intro">
          <p className="AboutPage__lead">Jeden ekosystem dla życia akademickiego.</p>
          <p className="AboutPage__introText">
            Smart Campus to otwarty projekt studencki tworzony w Kole Naukowym Informatyki
            Stosowanej (KNIS) dla studentów i dydaktyków Państwowej Akademii Nauk Stosowanych
            im. Ignacego Mościckiego w Ciechanowie. Naszym celem jest zastąpienie rozproszonych
            systemów i trudnych do odczytania tabel jedną szybką, czytelną aplikacją.
          </p>
          <div className="AboutPage__ctaRow">
            <button
              type="button"
              className="AboutPage__ctaBtn"
              onClick={scrollToModules}
            >
              Zobacz funkcje projektu
            </button>
            <img
              className="AboutPage__arrowsLeft"
              src={arrowsLeft}
              alt=""
              aria-hidden="true"
            />
          </div>
        </section>

        {/* Wyróżniona ciemna karta celu projektu */}
        <section className="AboutHeroCard">
          <div className="AboutHeroCard__content">
            <span className="AboutHeroCard__eyebrow">MISJA SMART CAMPUS</span>
            <h2>Koniec z przeklikiwaniem kilku stron uczelnianych każdego dnia</h2>
            <p>
              Zamiast osobno sprawdzać plan w Wirtualnej Uczelni, szukać ogłoszeń na stronach
              trzech wydziałów i sprawdzać adresy budynków — wszystko działa w jednym panelu,
              także jako instalowalna aplikacja PWA na telefonie i komputerze.
            </p>
            <div className="AboutHeroCard__tags">
              <span>Zero reklam</span>
              <span>Bez śledzenia</span>
              <span>Open Source (GitHub)</span>
              <span>Tryb offline (PWA)</span>
            </div>
          </div>

          <div className="AboutHeroCard__aside">
            <img src={dots} alt="" aria-hidden="true" className="AboutHeroCard__dots" />
            <Link to="/Logowanie" className="AboutHeroCard__loginBtn">
              Przejdź do aplikacji →
            </Link>
          </div>
        </section>

        {/* Sekcja głównych modułów */}
        <section id="o-projekcie-moduly" className="AboutSection">
          <div className="AboutSection__header">
            <h2>Główne moduły platformy</h2>
            <p>Narzędzia zaprojektowane pod codzienne potrzeby studentów w Ciechanowie i Mławie.</p>
          </div>

          <div className="AboutModulesGrid">
            {MODULES.map((mod) => (
              <article key={mod.title} className="AboutModuleCard">
                <div className="AboutModuleCard__top">
                  <div className="AboutModuleCard__icon">
                    <FontAwesomeIcon icon={mod.icon} />
                  </div>
                  <span className="AboutModuleCard__badge">{mod.badge}</span>
                </div>
                <h3>{mod.title}</h3>
                <p>{mod.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Osobna sekcja technologii */}
        <section className="AboutSection AboutSection--divided">
          <div className="AboutSection__header">
            <h2>Technologia i architektura</h2>
            <p>Nowoczesny, lekki stos technologiczny rozwijany otwarcie na GitHubie.</p>
          </div>

          <div className="AboutTechGrid">
            {TECH_STACK.map((item) => (
              <article key={item.name} className="AboutTechCard">
                <span className="AboutTechCard__role">{item.role}</span>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Baner nawigacji do powiązanych stron */}
        <section className="AboutLinksBanner">
          <div>
            <h2>Chcesz poznać projekt bliżej?</h2>
            <p>
              Sprawdź najnowsze aktualizacje w historii zmian, poznaj zespół KNIS albo zgłoś
              swój pomysł na nową funkcję.
            </p>
          </div>
          <div className="AboutLinksBanner__actions">
            <Link to="/ListaZmian" className="AboutLinksBanner__primary">
              Historia zmian
            </Link>
            <Link to="/NaszZespol" className="AboutLinksBanner__secondary">
              Nasz zespół
            </Link>
            <Link to="/ZglosBlad" className="AboutLinksBanner__secondary">
              Zgłoś pomysł lub błąd
            </Link>
          </div>
        </section>

        <footer className="AboutBottomCard">
          <strong>KNIS — Koło Naukowe Informatyki Stosowanej</strong>
          <span>Smart Campus • PANSIM w Ciechanowie</span>
          <Link to="/Start" className="AboutBottomCard__backLink">
            ← Wróć na stronę startową
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default OProjekcie;
