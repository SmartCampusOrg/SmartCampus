import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import { useSearch } from "./hooks/useSearch.js";
import { SearchResultItem } from "./components/SearchResultItem.jsx";
import './GlobalSearch.css';

export default function GlobalSearch({ isOpen, onClose }) {
  const {
    searchQuery,
    setSearchQuery,
    config,
    filteredSections,
    filteredResults,
    navigableItems,
    selectedIndex,
    ghostRemainder,
    autocompleteText,
    handleInputKeyDown,
    handleResultClick,
    handleClose,
    isDark
  } = useSearch(isOpen, onClose);

  const searchContainerRef = useRef(null);
  const searchDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target) &&
        (!searchDropdownRef.current || !searchDropdownRef.current.contains(event.target))
      ) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <motion.div key="search" ref={searchContainerRef} className="navbar_expandedSearchContainer">
        <motion.div className="navbar_expandedSearchBar"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          <input 
            autoFocus 
            placeholder="Wyszukaj" 
            className="navbar_expandedSearchInput" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          {ghostRemainder && (
            <div className="navbar_ghostTextWrapper">
              <span style={{ opacity: 0, whiteSpace: 'pre' }}>{searchQuery}</span>
              <span className="navbar_ghostText">{ghostRemainder}</span>
              <span className="navbar_ghostTabHint">Tab ⇥</span>
            </div>
          )}
          <div className="navbar_searchShortcutKeys">
            <span>ctrl</span><span>k</span>
          </div>
          <button className="navbar_expandedSearchIconBtn" onClick={handleClose}>
            <FontAwesomeIcon icon={Icons.faXmark} />
          </button>
        </motion.div>
      </motion.div>

      {typeof document !== 'undefined' && createPortal(
        <>
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                key="searchBackdrop"
                initial={{opacity:0}} 
                animate={{opacity:1}} 
                exit={{opacity:0}} 
                className="navbar_searchBackdrop" 
                onClick={handleClose} 
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                key="searchDropdown"
                ref={searchDropdownRef}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.05 }}
                className="navbar_searchResultsWindow"
              >
                <div className="navbar_search_resultsWrapper">
                  {!searchQuery ? (
                    <>
                      {config.map((section, idx) => (
                        <div key={idx} className="navbar_search_section">
                          <div className="navbar_search_sectionTitle">{section.title}</div>
                          {section.type === 'links' ? (
                            <div className="navbar_search_quickActions">
                              {section.items.map(item => {
                                const isActive = navigableItems[selectedIndex]?.id === item.id;
                                return (
                                  <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className={`navbar_search_quickActionBtn ${isActive ? 'navbar_search_quickActionBtn--active' : ''}`} onClick={handleClose}>
                                    <FontAwesomeIcon icon={item.icon} /> {item.title}
                                  </a>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="navbar_search_resultsList">
                              {section.items.map((result) => {
                                const isActive = navigableItems[selectedIndex]?.id === result.id;
                                return (
                                  <SearchResultItem key={result.id} result={result} onClick={handleResultClick} isActive={isActive} isDark={isDark} />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {filteredSections && filteredSections.length > 0 ? (
                        filteredSections.map((section, sIdx) => (
                          <div key={sIdx} className="navbar_search_section">
                            <div className="navbar_search_sectionTitle">{section.title}</div>
                            <div className="navbar_search_resultsList">
                              {section.items.map((result) => {
                                const isActive = navigableItems[selectedIndex]?.id === result.id;
                                return (
                                  <SearchResultItem 
                                    key={result.id} 
                                    result={result} 
                                    onClick={handleResultClick} 
                                    isActive={isActive} 
                                    isDark={isDark} 
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="navbar_search_noResults">Brak wyników</div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
}
