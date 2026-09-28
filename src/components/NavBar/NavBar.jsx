import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import ToggleSwitch from "@components/ToggleSwitch/ToggleSwitch.jsx";
import { useTheme } from '@hooks/useTheme.js';
import { useAuth } from "@/context/AuthContext.jsx";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from '@icons/icons'
import './NavBar.css';
import GlobalSearch from '@features/GlobalSearch/index.jsx';


const NavMountListener = ({ onMount }) => {
  useLayoutEffect(() => {
    onMount();
  });
  return null;
};

function NavBar() {
  const { user, isAuthLoading, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef(null);   // ref do menu
  const buttonRef = useRef(null); // ref do przycisku
  const { theme, toggleTheme } = useTheme(); // Nowy hook motywu
  const isDark = theme === 'dark';
  const location = useLocation();
  const navigate = useNavigate();
  const navRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [activeView, setActiveView] = useState('profile'); // 'profile' lub 'notifications'
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    if (user && showGreeting) {
      const timer = setTimeout(() => {
        setShowGreeting(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, showGreeting]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Odblokowano przewijanie tła podczas otwartego menu zgodnie z prośbą.

  const updateIndicator = () => {
    const activePath = Object.keys(navRefs.current).find(path => location.pathname.toLowerCase().startsWith(path.toLowerCase()));
    const activeElement = activePath ? navRefs.current[activePath] : null;
    
    if (activeElement) {
      setIndicatorStyle(prev => {
        if (prev.left === activeElement.offsetLeft && prev.width === activeElement.offsetWidth && prev.opacity === 1) return prev;
        return {
          left: activeElement.offsetLeft,
          width: activeElement.offsetWidth,
          opacity: 1,
        };
      });
    } else {
      setIndicatorStyle(prev => {
        if (prev.opacity === 0) return prev;
        return { ...prev, opacity: 0 };
      });
    }
  };

  useLayoutEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [location.pathname]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Błąd logowania:", error);
    }
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      navigate("/LandingPage", { replace: true });
      await logout();
    } catch (error) {
      console.error("Błąd wylogowania:", error);
    }
  };

  // Obsługa skrótu klawiszowego Ctrl+K oraz zdarzenia z mobilnego navbara
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    
    const handleOpenSearchMobile = () => {
      setIsSearchOpen(true);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('open-search-mobile', handleOpenSearchMobile);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('open-search-mobile', handleOpenSearchMobile);
    };
  }, []);

  // usunięto stary useLayoutEffect, ponieważ przenieśliśmy logikę do updateIndicator

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setActiveView('profile');
  };

  const trimUsername = (user) =>
    user?.displayName ? user.displayName.split(" ")[0] : "";

  const getEmailPrefix = (user) =>
    user?.email ? user.email.split("@")[0] : "";

  return (
    <section className="navbar_section">

      <div className="navbar_logo">
        <div className="navbar_logo_icon" />
        <div className="navbar_logo_wrapper">
          <div className="navbar_logo_wrapper_topText">Smart</div>
          <div className="navbar_logo_wrapper_bottomText">Campus</div>
        </div>
      </div>

      <div className="navbar_centerGroup">
        <AnimatePresence mode="wait">
            {!isSearchOpen ? (
              <motion.div key="nav" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
              >
                <nav className="navbar_navigationBar">
                  <NavLink
                    ref={el => navRefs.current["/Panel"] = el}
                    to="/Panel"
                    className={({ isActive }) => isActive ? "navbar_button--active" : "navbar_button"}
                  >
                    <div className="navbar_buttonContent">
                      <FontAwesomeIcon icon={Icons.faSolarPanel} className="navbar_buttonContent_icon" />
                      <div className="navbar_buttonContent_text">Panel</div>
                    </div>
                  </NavLink>
                  <NavLink
                    ref={el => navRefs.current["/PlanLekcji"] = el}
                    to="/PlanLekcji"
                    className={({ isActive }) => isActive ? "navbar_button--active" : "navbar_button"}
                  >
                    <div className="navbar_buttonContent">
                      <FontAwesomeIcon icon={Icons.faCalendarDays} className="navbar_buttonContent_icon" />
                      <div className="navbar_buttonContent_text">Plan lekcji</div>
                    </div>
                  </NavLink>
                  <NavLink
                    ref={el => navRefs.current["/MapaKampusu"] = el}
                    to="/MapaKampusu"
                    className={({ isActive }) => isActive ? "navbar_button--active" : "navbar_button"}
                  >
                    <div className="navbar_buttonContent">
                      <FontAwesomeIcon icon={Icons.faMap} className="navbar_buttonContent_icon" />
                      <div className="navbar_buttonContent_text">Mapa Kampusu</div>
                    </div>
                  </NavLink>
                  <NavLink
                    ref={el => navRefs.current["/Elearning"] = el}
                    to="/Elearning"
                    className={({ isActive }) => isActive ? "navbar_button--active" : "navbar_button"}
                  >
                    <div className="navbar_buttonContent">
                      <FontAwesomeIcon icon={Icons.faPhotoFilm} className="navbar_buttonContent_icon" />
                      <div className="navbar_buttonContent_text">E-learning</div>
                    </div>
                  </NavLink>
                  <NavLink
                    ref={el => navRefs.current["/Feed"] = el}
                    to="/Feed"
                    className={({ isActive }) => isActive ? "navbar_button--active" : "navbar_button"}
                  >
                    <div className="navbar_buttonContent">
                      <FontAwesomeIcon icon={Icons.faLaptop} className="navbar_buttonContent_icon" />
                      <div className="navbar_buttonContent_text">Feed</div>
                    </div>
                  </NavLink>
                  <motion.div
                    className="navbar_activeIndicator"
                    initial={false}
                    animate={{
                      left: indicatorStyle.left,
                      width: indicatorStyle.width,
                      opacity: indicatorStyle.opacity,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                    }}
                  />
                  <NavMountListener onMount={updateIndicator} />
                </nav>
                <button className="navbar_searchButton" onClick={() => setIsSearchOpen(true)} title="Szukaj (Ctrl+K)">
                  <FontAwesomeIcon icon={Icons.faMagnifyingGlass} />
                </button>
              </motion.div>
            ) : (
              <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            )}
        </AnimatePresence>
      </div>

      {!user ? (
        <button className="defaultButton" onClick={handleLogin} style={{ opacity: isAuthLoading ? 0 : 1 }}>Zaloguj</button>
      ) : (
        <>
          {isAuthLoading && (
            <div
              className="navbar_userBar"
              style={{ opacity: 0, pointerEvents: 'none' }}
            >
              <div className="navbar_userBar_wrapper">
                <div className="navbar_userBar_name">—</div>
                <div className="navbar_userBar_mail">—</div>
              </div>
              <div className="navbar_userBar_profilePicture" />
            </div>
          )}
          <motion.div
            ref={buttonRef}
            layout
            transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
            className={`navbar_userBar ${isMenuOpen ? "navbar_userBar--onFocus" : ""}`}
            onClick={toggleMenu}
            style={{ display: isAuthLoading ? 'none' : 'flex', overflow: 'hidden', justifyContent: 'center', position: 'relative' }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {!isMenuOpen ? (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, filter: "blur(8px)", scale: 0.7 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1, transition: { duration: 0.15, delay: 0.15 } }}
                  exit={{ opacity: 0, filter: "blur(8px)", scale: 0.1, transition: { duration: 0.4 } }}
                  style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}
                >
                  <div className="navbar_userBar_wrapper" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <AnimatePresence mode="popLayout">
                      {showGreeting ? (
                        <motion.div
                          key="greeting-text"
                          layout
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                          transition={{ duration: 0.3 }}
                          className="navbar_userBar_name"
                        >
                          Witaj,
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                    <motion.div
                      layout
                      key="username-text"
                      transition={{ layout: { type: "spring", stiffness: 400, damping: 30 } }}
                      className={showGreeting ? "navbar_userBar_mail" : "navbar_userBar_name"}
                    >
                      {trimUsername(user)}
                    </motion.div>
                    <AnimatePresence mode="popLayout">
                      {!showGreeting ? (
                        <motion.div
                          key="email-text"
                          layout
                          initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                          className="navbar_userBar_mail"
                        >
                          {getEmailPrefix(user)}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                  <img
                    className="navbar_userBar_profilePicture"
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || '')}&background=183447&color=fff`}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || '')}&background=183447&color=fff`;
                    }}
                    style={{ objectFit: 'cover' }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="close-text"
                  initial={{ opacity: 0, filter: "blur(8px)", scale: 0.7 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1, transition: { duration: 0.15, delay: 0.15 } }}
                  exit={{ opacity: 0, filter: "blur(8px)", scale: 0.7, transition: { duration: 0.15 } }}
                  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 20px', height: '50px', whiteSpace: 'nowrap' }}
                >
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>Zamknij</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {typeof document !== 'undefined' && document.getElementById("dropdown-root") && createPortal(
            <AnimatePresence>
              {isMenuOpen && (
                <>
                {windowWidth <= 1050 && (
                  <motion.div
                    key="menu-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                    onClick={() => setIsMenuOpen(false)}
                  />
                )}
                <motion.div
                  ref={menuRef}
                  layout
                  key="user-menu-dropdown"
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{
                    layout: { type: "spring", stiffness: 500, damping: 40, mass: 1 },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.2 },
                    y: { duration: 0.2 }
                  }}
                  className="navbar_userMenu"
                >
                  <motion.section className="navbar_userMenu_topSection" layout>
                    <div className="navbar_userMenu_topSection_left">

                      <div className="navbar_userMenu_logo">
                        <div className="navbar_userMenu_logo_icon" />
                      <div className="navbar_userMenulogo_wrapper">
                        <div className="navbar_userMenulogo_wrapper_topText">Smart</div>
                        <div className="navbar_userMenulogo_wrapper_bottomText">Campus</div>
                      </div>
                    </div>
                  </div>
                  <div className="navbar_userMenu_topSection_right">
                    <button
                      className={`navbar_userMenu_topSection_button ${activeView === 'notifications' ? 'active' : ''}`}
                      onClick={() => setActiveView(activeView === 'notifications' ? 'profile' : 'notifications')}
                    >
                      <FontAwesomeIcon icon={Icons.faBell} />
                    </button>
                    <Link to="/Ustawienia" onClick={() => setIsMenuOpen(false)}><button className="navbar_userMenu_topSection_button"><FontAwesomeIcon icon={Icons.faGear} /></button></Link>
                    <button className="navbar_userMenu_topSection_button" onClick={handleLogout}><FontAwesomeIcon icon={Icons.faRightFromBracket} /></button>
                  </div>
                </motion.section>
                <AnimatePresence mode="popLayout">
                  {activeView === 'profile' ? (
                    <motion.div
                      key="profile"
                      layout
                      style={{ width: "100%" }}
                      initial={{ opacity: 0, filter: "blur(10px)", y: 5 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      exit={{ opacity: 0, filter: "blur(10px)", y: -5 }}
                      transition={{ duration: 0.15 }}
                    >
                      <section className="navbar_userMenu_userInfoSection">
                        <img
                          className="navbar_userMenu_userInfoSection_profilePicture"
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || '')}&background=183447&color=fff`}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || '')}&background=183447&color=fff`;
                          }}
                          style={{ objectFit: 'cover' }}
                        />
                        <div className="navbar_userMenu_userInfoSection_name">{user.displayName}</div>
                        <div className="navbar_userMenu_userInfoSection_mail">{user.email}</div>
                        <div className="navbar_userMenu_userInfoSection_indexNumber">{getEmailPrefix(user)}</div>
                      </section>
                      <section className="navbar_userMenu_settingsSection">
                        <div className="navbar_userMenu_toogleButton">
                          <div className="navbar_userMenu_toogleButton_title">Ciemny motyw</div>
                          <div className="navbar_userMenu_toogleButton_switch">
                            <ToggleSwitch
                              id="darkMode"
                              defaultState={isDark}
                              onToggle={toggleTheme}
                            />
                          </div>
                        </div>
                        <Link to="/LandingPage" onClick={() => setIsMenuOpen(false)}>
                          <button className="navbar_userMenu_button">Strona startowa Smart Campus</button>
                        </Link>
                        <a href="https://pansim.edu.pl/" target="_blank"><button className="navbar_userMenu_button">Strona Pansim</button></a>
                        <a href="https://moodle.pansim.edu.pl/" target="_blank"><button className="navbar_userMenu_button">Moodle</button></a>

                      </section>
                      <section className="navbar_userMenu_bottomSection">
                        <a href="https://wu.pansim.edu.pl/wu/start?&locale=pl" target="_blank"><button className="navbar_userMenu_bottomSection_WUbutton">Wirtualna Uczelnia</button></a>
                        <button className="navbar_userMenu_bottomSection_Legitymacja"><FontAwesomeIcon icon={Icons.faIdCard} /></button>
                      </section>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="notifications"
                      layout
                      style={{ width: "100%" }}
                      initial={{ opacity: 0, filter: "blur(10px)", y: 5 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      exit={{ opacity: 0, filter: "blur(10px)", y: -5 }}
                      transition={{ duration: 0.15 }}
                    >
                      <section className="navbar_userMenu_notificationsView">
                        <div className="navbar_userMenu_notificationsView_content">
                          <FontAwesomeIcon icon={Icons.faBell} />
                          <p>Brak powiadomień</p>
                          <button onClick={() => setActiveView('profile')}>Wstecz</button>
                        </div>
                      </section>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
                </>
              )}
            </AnimatePresence>,
            document.getElementById("dropdown-root")
          )}
        </>
      )}

    </section>
  );
}

export default NavBar;

