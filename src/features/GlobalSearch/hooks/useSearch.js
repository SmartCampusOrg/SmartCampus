import { useState, useEffect, useMemo } from "react";
import { getSearchConfig } from "../config/searchConfig.js";
import { fuzzyMatch } from "../utils/fuzzyMatch.js";
import { useNavigate } from "react-router-dom";
import { useTheme } from '@hooks/useTheme.js';
import { useSchedule } from '@/hooks/useSchedule.js';
import { cleanTeacherName, TEACHER_KEY, MODE_KEY } from '@/services/scheduleService.js';
import * as Icons from '@icons/icons';

export function useSearch(isOpen, onClose) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { allLessons } = useSchedule();

  const handleClose = () => {
    setSearchQuery("");
    setSelectedIndex(0);
    onClose();
  };

  const handleResultClick = (result) => {
    if (result.action === "toggleTheme") {
      toggleTheme();
    } else if (result.action === "selectTeacher" || result.teacherName) {
      handleClose();
      try {
        localStorage.setItem(MODE_KEY, "teacher");
        localStorage.setItem(TEACHER_KEY, result.teacherName);
        window.dispatchEvent(new CustomEvent('smart_campus_schedule_sync', {
          detail: { key: TEACHER_KEY, value: result.teacherName }
        }));
      } catch (e) {}
      navigate("/PlanZajec", {
        state: { mode: "teacher", teacher: result.teacherName }
      });
    } else if (result.path || result.url) {
      handleClose();
      if (result.url) {
        window.open(result.url, "_blank");
      } else {
        navigate(result.path);
      }
    }
  };

  const config = useMemo(() => getSearchConfig(isDark), [isDark]);
  const defaultItems = useMemo(() => config.flatMap(section => section.items), [config]);

  // Lista unikalnych wykładowców z bazy planu
  const teacherItems = useMemo(() => {
    if (!allLessons || allLessons.length === 0) return [];
    const unique = [...new Set(allLessons.map(l => cleanTeacherName(l.dydaktyk)).filter(Boolean))];
    unique.sort((a, b) => a.localeCompare(b, 'pl'));

    return unique.map(teacher => ({
      id: `teacher_${teacher}`,
      title: teacher,
      type: "", // Brak podnapisu – kategoria powyżej to już DYDAKTYCY
      icon: Icons.faChalkboardUser,
      action: "selectTeacher",
      teacherName: teacher,
      path: "/PlanZajec",
      keywords: "wykładowca prowadzący nauczyciel dydaktyk dr hab prof mgr inż doktor profesor plan zajęć"
    }));
  }, [allLessons]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const sections = [];

    // 1. Sekcje z configu (Główne Moduły, Szybkie Ustawienia, Szybkie Akcje)
    config.forEach(sec => {
      const matchedItems = sec.items
        .map(item => ({
          ...item,
          match: fuzzyMatch(item.keywords ? `${item.title} ${item.keywords}` : item.title, searchQuery)
        }))
        .filter(item => item.match.isMatch)
        .sort((a, b) => b.match.score - a.match.score);

      if (matchedItems.length > 0) {
        sections.push({
          title: sec.title,
          type: sec.type,
          items: matchedItems,
          maxScore: matchedItems[0].match.score
        });
      }
    });

    // 2. Sekcja Dydaktycy (ograniczona do maksymalnie 3 najbardziej trafnych, jak w Apple Spotlight)
    const matchedTeachers = teacherItems
      .map(teacher => ({
        ...teacher,
        match: fuzzyMatch(teacher.keywords ? `${teacher.title} ${teacher.keywords}` : teacher.title, searchQuery)
      }))
      .filter(teacher => teacher.match.isMatch)
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 3);

    if (matchedTeachers.length > 0) {
      sections.push({
        title: "Dydaktycy",
        type: "teachers",
        items: matchedTeachers,
        maxScore: matchedTeachers[0].match.score
      });
    }

    // 3. Sortowanie sekcji: sekcja z najwyższym dopasowaniem u góry, z priorytetem dla Głównych Modułów
    const sectionPriority = {
      "Główne Moduły": 1,
      "Dydaktycy": 2,
      "Szybkie Ustawienia": 3,
      "Szybkie Akcje": 4
    };

    sections.sort((a, b) => {
      if (b.maxScore !== a.maxScore) {
        return b.maxScore - a.maxScore;
      }
      return (sectionPriority[a.title] || 99) - (sectionPriority[b.title] || 99);
    });

    return sections;
  }, [config, teacherItems, searchQuery]);

  const navigableItems = useMemo(() => {
    if (!searchQuery.trim()) return defaultItems;
    return filteredSections.flatMap(sec => sec.items);
  }, [searchQuery, filteredSections, defaultItems]);

  const filteredResults = navigableItems;

  // Reset index on search change or open
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, isOpen]);

  let ghostRemainder = "";
  let autocompleteText = "";
  // Pokaż podpowiadanie z taba już od 1 znaku
  if (searchQuery.length >= 1 && filteredResults.length > 0) {
    const topMatch = filteredResults[0].title;
    autocompleteText = topMatch;
    
    if (topMatch.toLowerCase().startsWith(searchQuery.toLowerCase())) {
      // Jeśli pasuje od początku, doklej końcówkę (klasyczny ghost text)
      ghostRemainder = topMatch.substring(searchQuery.length);
    } else {
      // Jeśli dopasowanie jest w środku słowa, pokaż to jako sugestię
      ghostRemainder = ` ➔ ${topMatch}`;
    }
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Tab' && autocompleteText) {
      e.preventDefault();
      setSearchQuery(autocompleteText);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (navigableItems.length > 0) {
        setSelectedIndex(prev => (prev + 1) % navigableItems.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (navigableItems.length > 0) {
        setSelectedIndex(prev => (prev - 1 + navigableItems.length) % navigableItems.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (navigableItems.length > 0) {
        handleResultClick(navigableItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  return {
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
  };
}
