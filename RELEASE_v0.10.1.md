# Smart Campus v0.10.1
![Version](https://img.shields.io/badge/Wersja-v0.10.1-blue) ![Channel](https://img.shields.io/badge/Kanał-beta-orange) ![Data wydania](https://img.shields.io/badge/Data_wydania-19.10.2026-lightgrey)
---

## Co nowego i zoptymalizowanego
- **Ekstremalna optymalizacja wielkości paczki (Code-Splitting)**:
  - Wdrożono zaawansowany podział kodu (`manualChunks`) w konfiguracji Vite, izolując duże biblioteki do osobnych paczek (`vendor-react`, `vendor-firebase`, `vendor-leaflet`, `vendor-icons`, `vendor-framer`).
  - Rozmiar głównego punktu wejścia aplikacji (`index.js`) spadł z **720 kB do 52 kB** (redukcja o ponad 92%), co drastycznie skraca czas pierwszego ładowania (LCP / FCP) na urządzeniach mobilnych.
  - Wyeliminowano ostrzeżenia kompilatora o zbyt dużych chunkach.
- **Nowoczesna baza IndexedDB dla planu zajęć**:
  - Utworzono natywny serwis bazy danych `scheduleDb.js` oparty na IndexedDB do przechowywania harmonogramów i metadanych.
  - Uwolniono restrykcyjny limit 5 MB pamięci `localStorage`, zapobiegając błędom `QuotaExceededError` przy rozbudowanych planach zajęć.
  - Wdrożono całkowicie bezszwową, automatyczną migrację – dotychczas zapisany plan w `localStorage` zostaje przy pierwszym uruchomieniu przeniesiony do IndexedDB bez utraty ustawień użytkownika.
  - Asynchroniczny odczyt i zapis nie blokuje wątku głównego przeglądarki.
- **Konwersja zasobów graficznych do formatu WebP**:
  - Skonwertowano kluczowe ilustracje aplikacji (`no_lessons_relax`, `Mezczyzna_ze_smartfonem_feed`, `Mezczyzna_przy_biurku_e-learning`, `Lupa`) z formatu PNG na nowoczesny format WebP.
  - Zaoszczędzono łącznie **~1.65 MB** transferu przy zachowaniu pełnej jakości wizualnej.
- **Porządki w zależnościach projektu**:
  - Usunięto 4 nieużywane, ciężkie pakiety biblioteki FullCalendar (`@fullcalendar/core`, `@fullcalendar/daygrid`, `@fullcalendar/interaction`, `@fullcalendar/react`), zmniejszając objętość `node_modules` i przyspieszając proces budowania.
  - Usunięto nieużywane importy ikon z zestawu FontAwesome w `icons.js`.
  - Usunięto puste pliki CSS (`OProjekcie.css`, `NaszZespol.css`) oraz zbędny duplikat grafiki o wadze 1.29 MB.

## Naprawione błędy
- **Pobieranie harmonogramu na Netlify (Reverse Proxy & CORS)**:
  - Rozwiązano błąd `SyntaxError: Unexpected token '<', "<!doctype "...` uniemożliwiający pobranie planu na środowisku produkcyjnym Netlify.
  - Wdrożono rewrites proxy w `public/_redirects` oraz `netlify.toml` przekierowujące zapytania `/api/harmonogram/*` bezpośrednio do serwera uczelnianego.
- **Manifest PWA**:
  - Poprawiono ostrzeżenie konsoli dotyczące `share_target`, definiując jawnie `enctype: "application/x-www-form-urlencoded"`.
- **Komponent `Lekcja.jsx`**:
  - Naprawiono błąd niezdefiniowanego komponentu `BookIcon`, zastępując go poprawnie zaimportowaną ikoną `<FontAwesomeIcon icon={faBookOpen} />`.
- **Wydajność `DynamicIsland`**:
  - Wyeliminowano cykliczne odpytywanie i parsowanie JSON z pamięci podręcznej co 20 sekund. DynamicIsland korzysta teraz reaktywnie ze współdzielonego stanu `ScheduleContext`.
- **Nagłówek `index.html`**:
  - Usunięto martwy odnośnik do nieistniejącego pliku `logo_transaprent.png`.

## Znane błędy
- Moduł "Plan zajęć" pozostaje w fazie BETA – w przypadku zmian po stronie zewnętrznego systemu WU PANSIM mogą wystąpić chwilowe trudności w pobieraniu aktualizacji planu.
