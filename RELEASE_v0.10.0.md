# Smart Campus v0.10.0
![Version](https://img.shields.io/badge/Wersja-v0.10.0-blue) ![Channel](https://img.shields.io/badge/Kanał-beta-orange) ![Data wydania](https://img.shields.io/badge/Data_wydania-19.10.2026-lightgrey)
---

## Co nowego
- **Nowy moduł "Plan zajęć" (v1.0 BETA)**:
  - Zastąpiono statyczny widok planu dynamicznym systemem pobierania i przetwarzania oficjalnego harmonogramu uczelni w czasie rzeczywistym (`scheduleService.js`).
  - Wdrożono 3 elastyczne widoki planu:
    - **Karty** – domyślny, przejrzysty widok dzienny z podziałem na przedmioty, wykładowców, sale i typy zajęć.
    - **Lista** – tygodniowa agenda pozwalająca szybko przejrzeć cały nadchodzący tydzień.
    - **Siatka** – harmonogram tygodniowy z osią czasu po lewej i dniami na górze, ułatwiający orientację w okienkach i blokach zajęć.
  - Wprowadzono interaktywny modal szczegółów w widoku siatki (pełna nazwa przedmiotu, wykładowca, sala oraz precyzyjne godziny).
  - Dodano przełącznik **"Pokaż terminy zjazdów i tygodni"** (w ustawieniach oraz w nagłówku planu) wyświetlający dokładne ramy czasowe (np. `Zjazd 3 • 24.10 – 25.10` / `Tydzień 4 • 20.10 – 24.10`).
  - Zbudowano globalny stan harmonogramu (`ScheduleContext`), pamiętający wybrane filtry, widok oraz obsługujący automatyczną synchronizację po wejściu.
  - Zaimplementowano solidną pastylkę **BETA** w głównym kolorze aplikacji (`#183447` / `#2b3e52`) z mocną typografią oraz czytelną kapsułkę informacyjną o źródle danych.
- **Pełna responsywność mobilna (wsparcie m.in. dla iPhone SE 3 - 375px)**:
  - Zaprojektowano kompaktowy pasek nawigacji 7 dni tygodnia mieszczący się w jednym rzędzie bez łamania wierszy.
  - Skalowany przełącznik widoków (Karty | Lista | Siatka) dopasowany do wąskich ekranów.
  - Dodano mechanizm **Sticky Hours** (zamrożona kolumna godzin) w widoku siatki – godziny zajęć pozostają stale widoczne przy poziomym przewijaniu.
- **Dynamiczne banery wydziałów w Ustawieniach**:
  - Automatyczna zmiana zdjęcia w nagłówku ustawień w zależności od wybranego przez studenta wydziału:
    - Grafika dla Wydziału Nauk o Zdrowiu i Nauk Społecznych (`wnm.webp`),
    - Grafika dla Wydziału Inżynierii i Ekonomii w Mławie (`wnt.jpg`),
    - Główny budynek kampusu w Ciechanowie dla pozostałych kierunków.
- **Usprawnienia wyszukiwarki globalnej**:
  - Zaktualizowano indeksowanie i mechanizm wyszukiwania rozmytego (fuzzy match) w `GlobalSearch`.

## Naprawione błędy
- **Kaskadowe listy wyboru w Ustawieniach i Planie**:
  - Rozwiązano problem, w którym po przełączeniu wydziału i powrocie do pierwotnego wyboru kolejne listy (kierunek, rok, grupa) pozostawały puste. Zaimplementowano odporne dwukierunkowe mapowanie kierunków i wydziałów.
- **Formatowanie i estetyka harmonogramu**:
  - Poprawiono formatowanie czasu i dat w dymku szczegółów siatki (usunięto surowe znaczniki czasu na rzecz naturalnego polskiego formatu daty i godzin).
  - Ujednolicono kolory plakietek typów zajęć w oknie szczegółów z główną kolorystyką kart.
- **Czytelność i design nagłówka planu**:
  - Usunięto sztuczne, pulsujące kropki z badge'a BETA na rzecz jednolitej, minimalistycznej pastylki.
  - Zwiększono kontrast i czytelność informacji o oficjalnym harmonogramie uczelni, eliminując zlewający się z tłem wyblakły szary tekst.
- **Komponent CustomSelect**:
  - Usprawniono zachowanie rozwijanych list – poprawiono zamykanie po kliknięciu na zewnątrz oraz płynne przewijanie na urządzeniach mobilnych.

## Znane błędy
- Moduł "Plan zajęć" znajduje się w fazie intensywnego rozwoju (BETA). Dane są pobierane bezpośrednio z uczelnianych systemów, w związku z czym aplikacja nie odpowiada za ewentualne błędy i nagłe korekty w oficjalnym harmonogramie.
