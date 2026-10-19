import * as Icons from '@icons/icons'

export const getSearchConfig = (isDark) => [
  {
    title: "Szybkie Akcje",
    type: "links",
    items: [
      { id: "quick_1", title: "Moodle", icon: Icons.faGraduationCap, url: "https://moodle.pansim.edu.pl/", type: "Szybka akcja" },
      { id: "quick_2", title: "Wirtualna Uczelnia", icon: Icons.faLaptopCode, url: "https://wu.pansim.edu.pl/wu/start?&locale=pl", type: "Szybka akcja" },
      { id: "quick_3", title: "Strona PANSIM", icon: Icons.faGlobe, url: "https://pansim.edu.pl/", type: "Szybka akcja" },
    ]
  },
  {
    title: "Główne Moduły",
    type: "internal",
    items: [
      { id: "mod_1", title: "Panel Główny", path: "/Panel", icon: Icons.faSolarPanel, type: "Strona Główna" },
      { id: "mod_2", title: "Plan Zajęć", path: "/PlanZajec", icon: Icons.faCalendarDays, type: "Moduł" },
      { id: "mod_3", title: "Mapa Kampusu", path: "/MapaKampusu", icon: Icons.faMap, type: "Moduł" },
      { id: "mod_4", title: "E-learning", path: "/Elearning", icon: Icons.faPhotoFilm, type: "Platforma edukacyjna" },
      { id: "mod_5", title: "Feed", path: "/Feed", icon: Icons.faLaptop, type: "Aktualności" },
      { id: "mod_6", title: "Ustawienia", path: "/Ustawienia", icon: Icons.faGear, type: "Konto i preferencje", keywords: "ustawienia opcje konfiguracja profil" }
    ]
  },
  {
    title: "Szybkie Ustawienia",
    type: "settings",
    items: [
      { 
        id: "set_1", 
        title: "Ciemny motyw",
        path: "", 
        icon: isDark ? Icons.faSun : Icons.faMoon, 
        type: "Ustawienie", 
        action: "toggleTheme", 
        component: "themeSwitch", 
        keywords: "jasny ciemny motyw tryb" 
      }
    ]
  }
];
