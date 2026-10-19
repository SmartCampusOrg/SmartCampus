import { useState, useLayoutEffect, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';

function MobileNavBar() {
  const location = useLocation();
  const navRefs = useRef({});
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [blur, setBlur] = useState(0);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const animationTimeoutRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const prevLeftRef = useRef(0);

  const handleVibration = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(30); 
    }
  };

  useEffect(() => {
    setIsInitialRender(false);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    const activeElement = navRefs.current[location.pathname];
    if (activeElement) {
      const newLeft = activeElement.offsetLeft;

      if (!isInitialRender && prevLeftRef.current !== newLeft) {
        setScale({ x: 1.15, y: 1.25 }); // Delikatnie silniejsze skalowanie dla małej pastylki

        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
        }

        animationTimeoutRef.current = setTimeout(() => {
          setScale({ x: 1, y: 1 });
        }, 450);

        blurTimeoutRef.current = setTimeout(() => {
          setBlur(0);
        }, 450);
      }

      prevLeftRef.current = newLeft;

      setUnderlineStyle({
        left: newLeft,
        width: activeElement.offsetWidth,
      });
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, [location.pathname, isInitialRender, windowWidth]);

  return (
    <div className="navbar_navigationMobileBar">
      <NavLink
        ref={el => navRefs.current["/Panel"] = el}
        to="/Panel"
        onClick={handleVibration}
        className={({ isActive }) => isActive ? "navbar_button--active" : "navbar_button"}
      >
        <FontAwesomeIcon icon={Icons.faSolarPanel} className="navbar_buttonContent_icon" />
        <span className="navbar_mobileLabel">Panel</span>
      </NavLink>
      <NavLink
        ref={el => navRefs.current["/PlanZajec"] = el}
        to="/PlanZajec"
        onClick={handleVibration}
        className={({ isActive }) => isActive ? "navbar_button--active" : "navbar_button"}
      >
        <FontAwesomeIcon icon={Icons.faCalendarDays} className="navbar_buttonContent_icon" />
        <span className="navbar_mobileLabel">Plan zajęć</span>
      </NavLink>
      <NavLink
        ref={el => navRefs.current["/MapaKampusu"] = el}
        to="/MapaKampusu"
        onClick={handleVibration}
        className={({ isActive }) => isActive ? "navbar_button--active" : "navbar_button"}
      >
        <FontAwesomeIcon icon={Icons.faMap} className="navbar_buttonContent_icon" />
        <span className="navbar_mobileLabel">Mapa</span>
      </NavLink>
      <NavLink
        ref={el => navRefs.current["/Elearning"] = el}
        to="/Elearning"
        onClick={handleVibration}
        className={({ isActive }) => isActive ? "navbar_button--active" : "navbar_button"}
      >
        <FontAwesomeIcon icon={Icons.faPhotoFilm} className="navbar_buttonContent_icon" />
        <span className="navbar_mobileLabel">E-learning</span>
      </NavLink>
      <NavLink
        ref={el => navRefs.current["/Feed"] = el}
        to="/Feed"
        onClick={handleVibration}
        className={({ isActive }) => isActive ? "navbar_button--active" : "navbar_button"}
      >
        <FontAwesomeIcon icon={Icons.faLaptop} className="navbar_buttonContent_icon" />
        <span className="navbar_mobileLabel">Feed</span>
      </NavLink>

      <div className="navbar_mobileSearchDivider"></div>
      
      <button 
        className="navbar_mobileSearchButton"
        onClick={() => {
          handleVibration();
          window.dispatchEvent(new CustomEvent('open-search-mobile'));
        }}
      >
        <FontAwesomeIcon icon={Icons.faMagnifyingGlass} />
      </button>

      <motion.div
        className="navbar_activeMobileIndicator"
        animate={{
          left: underlineStyle.left,
          width: underlineStyle.width,
          scaleX: scale.x,
          scaleY: scale.y,
          filter: `blur(${blur}px)`,
        }}
        transition={{
          left: isInitialRender ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 40 },
          width: isInitialRender ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 40 },
          scaleX: { type: "spring", stiffness: 200, damping: 20 },
          scaleY: { type: "spring", stiffness: 200, damping: 20 },
          filter: { duration: 0.2 },
        }}
      />
    </div>
  );
}

export default MobileNavBar;
