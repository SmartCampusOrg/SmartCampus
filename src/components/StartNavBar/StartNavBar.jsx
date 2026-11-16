import React, { useState, useEffect, useRef } from 'react';
import './StartNavBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import LogoFull from '../Logo/LogoFull';
import MainButton from '../Buttons/MainButton/MainButton';
import { useTheme } from '@hooks/useTheme.js';
import { faMoon, faSun, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function StartNavBar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleLogoClick = (e) => {
    setIsMobileMenuOpen(false);
    if (location.pathname.toLowerCase() === '/start') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAboutClick = (e) => {
    setIsMobileMenuOpen(false);
    const aboutSection = document.getElementById('o-projekcie');
    if (aboutSection) {
      e.preventDefault();
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      e.preventDefault();
      navigate('/Start#o-projekcie');
    }
  };

  const currentPath = location.pathname.toLowerCase();
  const isAboutActive =
    currentPath === '/oprojekcie' ||
    (currentPath === '/start' && location.hash === '#o-projekcie');
  const isChangelogActive = currentPath === '/listazmian';
  const isTeamActive = currentPath === '/naszzespol';

  return (
    <header className="StartNavBar_container" ref={menuRef}>
      <div className="titleBar">
        <Link to="/Start" className="StartNavBar_logoLink" onClick={handleLogoClick} aria-label="Smart Campus – strona główna">
          <LogoFull />
        </Link>
        <div className="titleBar-RightSection">
          <nav className="titleBar-RightSection_linkWrapper" aria-label="Nawigacja główna">
            <Link
              className={`StartNavBar-links ${isAboutActive ? 'StartNavBar-links--active' : ''}`}
              to="/OProjekcie"
            >
              O projekcie
            </Link>
            <Link
              className={`StartNavBar-links ${isChangelogActive ? 'StartNavBar-links--active' : ''}`}
              to="/ListaZmian"
            >
              Lista zmian
            </Link>
            <Link
              className={`StartNavBar-links ${isTeamActive ? 'StartNavBar-links--active' : ''}`}
              to="/NaszZespol"
            >
              Nasz zespół
            </Link>
          </nav>
          <MainButton
            type="github"
            iconLeft={Icons.faGithub}
            iconSize="2xl"
            text="GitHub"
            className="github"
            onClick={() => window.open("https://github.com/SmartCampusOrg", "_blank", "noopener,noreferrer")}
          />
          <MainButton
            className="toogleTheme"
            type="toogleTheme"
            iconLeft={isDark ? faSun : faMoon}
            iconSize="xl"
            onClick={toggleTheme}
          />
          <button
            type="button"
            className="titleBar_mobileMenuToggle"
            aria-label={isMobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faChevronUp : faChevronDown} />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="titleBar_mobileMenu">
          <Link
            to="/OProjekcie"
            className={`titleBar_mobileMenu_link ${isAboutActive ? 'titleBar_mobileMenu_link--active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            O projekcie
          </Link>
          <Link
            to="/ListaZmian"
            className={`titleBar_mobileMenu_link ${isChangelogActive ? 'titleBar_mobileMenu_link--active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Lista zmian
          </Link>
          <Link
            to="/NaszZespol"
            className={`titleBar_mobileMenu_link ${isTeamActive ? 'titleBar_mobileMenu_link--active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Nasz zespół
          </Link>
          <MainButton
            type="github"
            iconLeft={Icons.faGithub}
            iconSize="2xl"
            text="GitHub"
            className="titleBar_mobileMenu_github"
            onClick={() => {
              window.open("https://github.com/SmartCampusOrg", "_blank", "noopener,noreferrer");
              setIsMobileMenuOpen(false);
            }}
          />
        </div>
      )}
    </header>
  );
}
export default StartNavBar;
