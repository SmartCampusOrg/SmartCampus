import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Icons from "@icons/icons";
import StartNavBar from "@components/StartNavBar/StartNavBar";
import arrowsLeft from "@pages/start/arrows_left.png";
import dots from "@pages/start/dots.png";
import "@styles/LegalPages.css";

const LANG_STORAGE_KEY = "smartcampus_legal_lang";

const PRIVACY_TRANSLATIONS = {
  pl: {
    title: "Polityka prywatności",
    subtitle: "Smart Campus",
    updatedLabel: "Ostatnia aktualizacja",
    updatedDate: "16 listopada 2026",
    lead: "Twoje dane, Twoja kontrola!",
    intro:
      "Dbamy o pełną przejrzystość w kwestii danych przetwarzanych w aplikacji Smart Campus. Zbieramy wyłącznie informacje niezbędne do działania platformy akademickiej — bez reklam, bez śledzenia i bez sprzedaży danych. Przeczytaj, jak je chronimy.",
    cta: "Chcę wiedzieć więcej",
    aiNoticeTitle: null,
    aiNoticeBody: null,
    s1Title: "1. Informacje ogólne i Administrator Danych",
    s1P1:
      "Smart Campus („Aplikacja”) jest niekomercyjnym projektem studenckim rozwijanym przez zespół Koła Naukowego Informatyki Stosowanej (KNIS) działającego przy Państwowej Akademii Nauk Stosowanych im. Ignacego Mościckiego w Ciechanowie („PANSIM w Ciechanowie”).",
    s1P2Lead:
      "Podmiotem odpowiedzialnym za przetwarzanie danych w ramach Aplikacji (Administratorem Danych projektu edukacyjnego) jest",
    s1P2Strong:
      "zespół projektowy Smart Campus — Koło Naukowe Informatyki Stosowanej (KNIS) przy Państwowej Akademii Nauk Stosowanych im. Ignacego Mościckiego w Ciechanowie, ul. Gabriela Narutowicza 9, 06-400 Ciechanów (kontakt: smartcampuspansim@gmail.com)",
    s1P3:
      "Administratorem danych osobowych przetwarzanych w centralnych systemach uczelnianych (w szczególności w systemie Wirtualna Uczelnia wu.pansim.edu.pl oraz poczcie uczelnianej w domenach @student.pansim.edu.pl i @pansim.edu.pl) jest Państwowa Akademia Nauk Stosowanych im. Ignacego Mościckiego w Ciechanowie, ul. Gabriela Narutowicza 9, 06-400 Ciechanów.",
    s2Title: "2. Jakie dane zbieramy i przetwarzamy",
    s2Sub1: "Dane konta Google (Firebase Authentication / Google OAuth 2.0)",
    s2Sub1Items: [
      "Uczelniany adres e-mail (@student.pansim.edu.pl lub @pansim.edu.pl) — wykorzystywany do uwierzytelnienia oraz weryfikacji przynależności do społeczności akademickiej PANSIM (w przypadku próby logowania z nieuprawnionej domeny konto sesyjne w Firebase Authentication jest natychmiast automatycznie usuwane)",
      "Imię i nazwisko (displayName) — pobierane z profilu Google wyłącznie w celu personalizacji interfejsu (powitanie na pulpicie oraz prezentacja profilu w pasku nawigacji i Ustawieniach)",
      "Zdjęcie profilowe / awatar (photoURL) — wyświetlane w pasku nawigacji oraz w Ustawieniach konta (w razie braku zdjęcia Aplikacja generuje lokalnie w przeglądarce grafikę SVG z inicjałami bez wysyłania danych na zewnętrzne serwery)",
      "Unikalny identyfikator użytkownika (UID) nadawany przez usługę Firebase Authentication oraz znaczniki czasu utworzenia konta i ostatniego logowania"
    ],
    s2Sub2: "Dane wprowadzone przez użytkownika",
    s2Sub2Items: [
      "Prywatne wydarzenia i notatki w kalendarzu (tytuł, data, godzina, opis szczegółowy, kolor oraz przypisany identyfikator UID) — zapisywane w chmurowej bazie danych Cloud Firestore (kolekcja calendar_events) oraz buforowane lokalnie w pamięci przeglądarki",
      "Preferencje planu zajęć i profilu (wybrany wydział, kierunek, forma studiów, rocznik/semestr, specjalność, grupa lub wybrany wykładowca) oraz ustawienia interfejsu (motyw kolorystyczny, układ widoku, funkcje eksperymentalne) — przechowywane lokalnie na urządzeniu użytkownika (localStorage oraz IndexedDB)",
      "Dane autoryzacyjne podczas jednorazowej synchronizacji z Wirtualną Uczelnią (numer albumu i hasło do systemu CAS wu.pansim.edu.pl) — przekazywane szyfrowanym połączeniem HTTPS wyłącznie do bezserwerowej funkcji pośredniczącej (/api/wu-sync) w celu pobrania aktualnego harmonogramu zajęć"
    ],
    s2Sub3: "Dane techniczne i lokalizacja urządzenia",
    s2Sub3Items: [
      "Adres IP oraz standardowe nagłówki żądania HTTP (typ przeglądarki i systemu operacyjnego) — przetwarzane automatycznie w logach połączeń sieciowych przez dostawców infrastruktury (Google Firebase, Netlify, serwery uczelni PANSIM oraz dostawców map i pogody wymienionych w pkt 6)",
      "Opcjonalna lokalizacja GPS w przeglądarce — przycisk „Zlokalizuj mnie” na interaktywnej mapie kampusu korzysta z natywnego interfejsu Geolocation API przeglądarki wyłącznie na wyraźne żądanie użytkownika i po udzieleniu zgody w przeglądarce; współrzędne geograficzne są przetwarzane wyłącznie lokalnie w pamięci urządzenia w celu zaznaczenia pozycji na mapie i nigdy nie są wysyłane ani zapisywane na serwerach Aplikacji"
    ],
    s2Sub4: "Dane niezbierane",
    s2Sub4Text:
      "Aplikacja nigdy nie zapisuje haseł ani numeru albumu do Wirtualnej Uczelni w bazie danych ani w pamięci przeglądarki. Nie przechowujemy współrzędnych GPS użytkowników na serwerach, nie zbieramy numerów telefonów, prywatnych kontaktów ani jakichkolwiek danych szczególnych kategorii (wrażliwych) w rozumieniu art. 9 RODO.",
    s3Title: "3. Dane użytkowników Google (Google User Data & Limited Use)",
    s3Intro:
      "W związku z wykorzystaniem logowania Google OAuth 2.0 (za pośrednictwem Google Firebase Authentication) informujemy o zasadach przetwarzania danych pozyskiwanych z interfejsów API Google:",
    s3Bullets: [
      "Zakres dostępu (OAuth Scopes): Aplikacja żąda wyłącznie podstawowych, niewrażliwych zakresów uwierzytelniania (openid, email, profile).",
      "Cel wykorzystania: Pozyskane dane (adres e-mail, imię i nazwisko, zdjęcie profilowe) są wykorzystywane wyłącznie do zalogowania użytkownika, weryfikacji przynależności do domeny uczelnianej PANSIM, wyświetlenia informacji profilowych w interfejsie Aplikacji oraz powiązania prywatnych wydarzeń kalendarza w bazie Firestore z kontem użytkownika.",
      "Zakaz przekazywania i komercjalizacji: Dane z konta Google nie są sprzedawane, nie są udostępniane podmiotom trzecim w celach marketingowych, nie służą do wyświetlania reklam ani do profilowania czy trenowania modeli sztucznej inteligencji (AI)."
    ],
    s3LimitedUseLead:
      "Wykorzystywanie przez aplikację Smart Campus informacji otrzymanych z interfejsów API Google oraz ich ewentualne przekazywanie do innych aplikacji odbywa się w pełni zgodnie z dokumentem",
    s3LimitedUseLinkLabel: "Google API Services User Data Policy",
    s3LimitedUseAfter:
      ", w tym z wymogami dotyczącymi ograniczonego wykorzystania (Limited Use requirements).",
    s4Title: "4. Cel, podstawa prawna i dobrowolność podania danych",
    s4Rows: [
      [
        "Uwierzytelnianie konta Google, weryfikacja domeny PANSIM i synchronizacja kalendarza",
        "Art. 6 ust. 1 lit. b RODO (niezbędność do świadczenia usługi)"
      ],
      [
        "Lokalna personalizacja planu zajęć, filtrów i motywu na urządzeniu",
        "Art. 6 ust. 1 lit. b RODO w zw. z art. 399 ust. 3 PKE"
      ],
      [
        "Opcjonalne wskazanie bieżącej pozycji użytkownika na mapie kampusu (lokalnie w przeglądarce)",
        "Art. 6 ust. 1 lit. a RODO (dobrowolna zgoda w przeglądarce)"
      ],
      [
        "Bezpieczeństwo bazy danych Firestore, integralność sesji i ochrona przed nadużyciami",
        "Art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes)"
      ]
    ],
    s4Voluntary:
      "Podanie danych osobowych jest dobrowolne, jednak zalogowanie się uczelnianym kontem Google jest niezbędne do uzyskania dostępu do chronionych modułów Aplikacji oraz zapisywania prywatnych wydarzeń w chmurze. Dane użytkowników nie podlegają zautomatyzowanemu podejmowaniu decyzji ani profilowaniu w rozumieniu art. 22 RODO.",
    s5Title: "5. Okres przechowywania i usuwanie danych",
    s5P1:
      "Dane konta (adres e-mail, imię i nazwisko, awatar, identyfikator UID) oraz prywatne wydarzenia w kolekcji calendar_events w bazie Cloud Firestore są przechowywane przez okres utrzymywania konta w Aplikacji. Dane zapisane lokalnie na urządzeniu (localStorage, sessionStorage, IndexedDB) pozostają w przeglądarce do momentu ich wyczyszczenia przez użytkownika (np. przyciskiem „Usuń z pamięci plan zajęć” w Ustawieniach lub poprzez wyczyszczenie danych witryny w przeglądarce).",
    s5P2:
      "Każdy użytkownik może samodzielnie usuwać swoje wydarzenia z kalendarza bezpośrednio w Aplikacji. W celu całkowitego usunięcia konta z usługi Firebase Authentication oraz wszystkich powiązanych dokumentów w bazie Firestore wystarczy wysłać wiadomość z uczelnianego adresu e-mail na adres smartcampuspansim@gmail.com — dane zostaną trwale usunięte niezwłocznie, nie później niż w ciągu 30 dni od otrzymania zgłoszenia.",
    s6Title: "6. Odbiorcy danych, usługi zewnętrzne i transfer poza EOG",
    s6Lead: "W celu utrzymania i dostarczania funkcji Aplikacji korzystamy z następujących zewnętrznych dostawców infrastruktury i publicznych interfejsów API:",
    s6Items: [
      {
        name: "Google Ireland Limited / Google LLC (Firebase Authentication, Cloud Firestore, Google Fonts)",
        desc: "obsługa bezpiecznego logowania Google OAuth 2.0, przechowywanie prywatnych wydarzeń kalendarza w bazie Firestore oraz pobieranie czcionki interfejsu Space Grotesk."
      },
      {
        name: "Netlify, Inc.",
        desc: "hosting aplikacji webowej (PWA) oraz obsługa bezserwerowych funkcji pośredniczących (/api/wu-sync do jednorazowego pobrania planu zajęć z CAS oraz /api/feed do pobrania aktualności wydziałowych)."
      },
      {
        name: "Państwowa Akademia Nauk Stosowanych im. Ignacego Mościckiego w Ciechanowie (wu.pansim.edu.pl, pansim.edu.pl)",
        desc: "źródło harmonogramów zajęć oraz publicznie dostępnych komunikatów i aktualności wydziałowych."
      },
      {
        name: "GitHub, Inc. (api.github.com, avatars.githubusercontent.com)",
        desc: "pobieranie publicznych informacji o historii wydań (changelog), postępach prac (milestones) oraz listy współtwórców projektu (bez przekazywania danych konta użytkownika)."
      },
      {
        name: "CARTO (basemaps.cartocdn.com) oraz OpenStreetMap",
        desc: "wyświetlanie podkładów mapowych kampusu w Ciechanowie i Mławie (przeglądarka wykonuje standardowe zapytania HTTP o kafelki mapy)."
      },
      {
        name: "Open-Meteo (api.open-meteo.com)",
        desc: "pobieranie aktualnej prognozy pogody dla stałych współrzędnych geograficznych kampusu w Ciechanowie (bez przesyłania lokalizacji ani danych użytkownika)."
      }
    ],
    s6Transfer:
      "Część dostawców infrastruktury (Google LLC, Netlify Inc., GitHub Inc.) posiada siedzibę w Stanach Zjednoczonych. Ewentualny transfer danych poza Europejski Obszar Gospodarczy (EOG) odbywa się zgodnie z rozdziałem V RODO w oparciu o decyzję wykonawczą Komisji Europejskiej dotyczącą Ram Ochrony Danych UE–USA (EU-US Data Privacy Framework) oraz Standardowe Klauzule Umowne UE (SCC).",
    s6Strong: "Aplikacja nie wyświetla reklam i nie sprzedaje danych żadnym podmiotom trzecim.",
    s7Title: "7. Prawa użytkownika",
    s7Lead: "Zgodnie z przepisami RODO (art. 15–21) przysługuje Ci prawo do:",
    s7Items: [
      "dostępu do swoich danych osobowych oraz otrzymania ich kopii (art. 15 RODO)",
      "sprostowania (poprawienia) nieprawidłowych lub niekompletnych danych (art. 16 RODO)",
      "usunięcia danych („prawo do bycia zapomnianym” — art. 17 RODO)",
      "ograniczenia przetwarzania danych (art. 18 RODO)",
      "przenoszenia danych (art. 20 RODO)",
      "wniesienia sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie (art. 21 RODO)",
      "cofnięcia zgody w dowolnym momencie (np. uprawnień lokalizacji w przeglądarce), bez wpływu na zgodność z prawem przetwarzania dokonanego przed jej cofnięciem",
      "wniesienia skargi do organu nadzorczego — Prezesa Urzędu Ochrony Danych Osobowych (UODO, ul. Stawki 2, 00-193 Warszawa, uodo.gov.pl)"
    ],
    s7Contact: "Aby skorzystać ze swoich praw lub zlecić usunięcie konta, skontaktuj się z nami pod adresem:",
    s8Title: "8. Pliki cookies i pamięć lokalna przeglądarki",
    s8BeforeLink:
      "Aplikacja wykorzystuje wyłącznie niezbędne technicznie pliki sesyjne oraz pamięć lokalną przeglądarki (localStorage, sessionStorage, IndexedDB oraz Cache Storage PWA) w celu utrzymania sesji logowania, zapisania wybranego motywu oraz przechowywania planu zajęć offline. Pełny wykaz wszystkich kluczy i czasów ich przechowywania znajduje się na stronie",
    s8LinkLabel: "Informacja o plikach cookie",
    s9Title: "9. Bezpieczeństwo danych",
    s9Text:
      "Wszystkie połączenia pomiędzy przeglądarką użytkownika, funkcjami pośredniczącymi oraz bazą danych są szyfrowane protokołem HTTPS/TLS. Dostęp do dokumentów w bazie Cloud Firestore jest chroniony regułami bezpieczeństwa (Firestore Security Rules), które zezwalają na odczyt, zapis i usuwanie wydarzeń wyłącznie uwierzytelnionemu właścicielowi danych (request.auth.uid == resource.data.userId).",
    s10Title: "10. Zmiany Polityki Prywatności",
    s10Text:
      "O istotnych zmianach w niniejszej Polityce Prywatności poinformujemy poprzez komunikat w Aplikacji lub na stronie startowej projektu. Data „Ostatniej aktualizacji” na górze dokumentu zawsze wskazuje obowiązującą wersję.",
    s11Title: "11. Kontakt",
    s11Org: "KNIS — Koło Naukowe Informatyki Stosowanej",
    s11Uni: "Państwowa Akademia Nauk Stosowanych im. Ignacego Mościckiego w Ciechanowie (Wydział Inżynierii i Ekonomii)",
    s11Addr: "ul. Gabriela Narutowicza 9, 06-400 Ciechanów",
    footerDate: "Ostatnia aktualizacja: 16 listopada 2026",
    footerSub: "Smart Campus • PANSIM w Ciechanowie",
    backLink: "← Wróć na stronę startową"
  },
  en: {
    title: "Privacy Policy",
    subtitle: "Smart Campus",
    updatedLabel: "Last updated",
    updatedDate: "November 16, 2026",
    lead: "Your data, your control!",
    intro:
      "We are committed to full transparency regarding how data is processed within Smart Campus. We only collect information strictly necessary to operate the academic platform — no ads, no cross-site tracking, and no data selling. Read below how we protect your privacy.",
    cta: "Learn more",
    aiNoticeTitle: "AI-translated version:",
    aiNoticeBody:
      "This English translation was generated with the assistance of AI for your convenience. In the event of any discrepancy or ambiguity, the original Polish version prevails.",
    s1Title: "1. General Information and Data Controller",
    s1P1:
      "Smart Campus (the “Application”) is a non-commercial student project developed by the Applied Computer Science Student Research Club (Koło Naukowe Informatyki Stosowanej — KNIS) operating at the Ignacy Mościcki State University of Applied Sciences in Ciechanów (“PANSIM in Ciechanów”).",
    s1P2Lead:
      "The entity responsible for data processing within this educational project (Data Controller for the Application) is the",
    s1P2Strong:
      "Smart Campus Project Team — Applied Computer Science Student Research Club (KNIS) at the Ignacy Mościcki State University of Applied Sciences in Ciechanów, ul. Gabriela Narutowicza 9, 06-400 Ciechanów, Poland (contact: smartcampuspansim@gmail.com)",
    s1P3:
      "The Data Controller for personal data processed within central university systems (specifically the Virtual University system wu.pansim.edu.pl and university email accounts under @student.pansim.edu.pl and @pansim.edu.pl) is the Ignacy Mościcki State University of Applied Sciences in Ciechanów, ul. Gabriela Narutowicza 9, 06-400 Ciechanów, Poland.",
    s2Title: "2. Data We Collect and Process",
    s2Sub1: "Google Account Data (Firebase Authentication / Google OAuth 2.0)",
    s2Sub1Items: [
      "University email address (@student.pansim.edu.pl or @pansim.edu.pl) — used for authentication and verifying membership in the PANSIM academic community (if a sign-in attempt is made from an unauthorized domain, the temporary Firebase Authentication user record is immediately and automatically deleted)",
      "Full name / display name (displayName) — retrieved from your Google profile strictly to personalize the user interface (dashboard greeting and profile header in the navigation bar and Settings)",
      "Profile picture URL (photoURL) — displayed in the navigation bar and account Settings (if unavailable, the Application locally generates an SVG monogram in the browser without sending your name to any external service)",
      "Unique user identifier (UID) assigned by Firebase Authentication along with account creation and last sign-in timestamps"
    ],
    s2Sub2: "User-Provided Data",
    s2Sub2Items: [
      "Personal calendar events and notes (title, date, time slot, description, color, and owner UID) — stored in Google Cloud Firestore (calendar_events collection) and cached locally in browser storage",
      "Class schedule and profile preferences (selected faculty, field of study, study mode, year/semester, specialization, group, or selected lecturer) and interface preferences (color theme, layout view, experimental feature flags) — stored locally on your device (localStorage and IndexedDB)",
      "One-time Virtual University synchronization credentials (student ID number and CAS password for wu.pansim.edu.pl) — transmitted over an encrypted HTTPS connection solely to the serverless proxy function (/api/wu-sync) to fetch your current class schedule"
    ],
    s2Sub3: "Technical Data and Device Location",
    s2Sub3Items: [
      "IP address and standard HTTP request headers (browser type and operating system) — automatically processed in network connection logs by infrastructure providers (Google Firebase, Netlify, PANSIM university servers, and map/weather providers listed in Section 6)",
      "Optional browser GPS location — the “Locate me” button on the interactive campus map uses the browser’s native Geolocation API solely upon explicit user action and browser permission; geographic coordinates are processed exclusively locally in device memory to display your position marker on the map and are never transmitted to or stored on Application servers"
    ],
    s2Sub4: "Data We Do Not Collect",
    s2Sub4Text:
      "The Application never stores your Virtual University password or student ID number in any database or browser storage. We do not store user GPS coordinates on our servers, nor do we collect phone numbers, private contacts, or any special-category (sensitive) personal data under Article 9 of the GDPR.",
    s3Title: "3. Google User Data & Limited Use Compliance",
    s3Intro:
      "Because Smart Campus uses Google OAuth 2.0 sign-in (via Google Firebase Authentication), we explicitly disclose how Google user data is accessed, used, stored, and protected:",
    s3Bullets: [
      "OAuth Scopes Accessed: The Application requests only basic, non-sensitive authentication scopes (openid, email, profile).",
      "How Google User Data Is Used: Your Google email address, display name, and profile picture URL are used exclusively to authenticate your session, verify your eligibility under PANSIM university domains, display your profile inside the Application UI, and associate your private calendar events in Cloud Firestore with your unique UID.",
      "No Data Selling, Advertising, or Third-Party Sharing: Google user data is never sold, never shared with third parties for marketing or advertising purposes, and never used for user profiling or training artificial intelligence (AI) models."
    ],
    s3LimitedUseLead:
      "Smart Campus’s use and transfer to any other app of information received from Google APIs will adhere to the",
    s3LimitedUseLinkLabel: "Google API Services User Data Policy",
    s3LimitedUseAfter:
      ", including the Limited Use requirements.",
    s4Title: "4. Purpose, Legal Basis, and Voluntariness of Data Provision",
    s4Rows: [
      [
        "Google account authentication, PANSIM domain verification, and calendar sync",
        "Art. 6(1)(b) GDPR (performance of a requested service)"
      ],
      [
        "Local personalization of schedules, filters, and color themes on the device",
        "Art. 6(1)(b) GDPR & Art. 399(3) Polish Electronic Communications Law (PKE)"
      ],
      [
        "Optional display of current position on the campus map (locally in the browser)",
        "Art. 6(1)(a) GDPR (voluntary browser geolocation consent)"
      ],
      [
        "Firestore database security, session integrity, and abuse prevention",
        "Art. 6(1)(f) GDPR (legitimate interest)"
      ]
    ],
    s4Voluntary:
      "Providing personal data is voluntary; however, signing in with a PANSIM university Google account is required to access protected modules of the Application and save personal calendar events in the cloud. User data is never subject to automated decision-making or profiling within the meaning of Article 22 of the GDPR.",
    s5Title: "5. Data Retention and Deletion Procedure",
    s5P1:
      "Account data (email address, display name, profile photo URL, UID) and personal calendar events stored in the Cloud Firestore calendar_events collection are retained for as long as you maintain your account in the Application. Data stored locally on your device (localStorage, sessionStorage, IndexedDB) remains in your browser until cleared by you (e.g., via the “Clear schedule cache” button in Settings or through browser site data settings).",
    s5P2:
      "You can delete individual calendar events at any time directly within the Application. To request complete deletion of your Firebase Authentication account and all associated Cloud Firestore records, please send an email from your university address to smartcampuspansim@gmail.com — all account and database records will be permanently erased promptly, and no later than within 30 days of your request.",
    s6Title: "6. Data Recipients, Third-Party Services, and International Transfers",
    s6Lead: "To host and deliver Application features, we rely on the following infrastructure providers and public APIs:",
    s6Items: [
      {
        name: "Google Ireland Limited / Google LLC (Firebase Authentication, Cloud Firestore, Google Fonts)",
        desc: "provides Google OAuth 2.0 authentication, Cloud Firestore database storage for personal calendar events, and delivery of the Space Grotesk web font."
      },
      {
        name: "Netlify, Inc.",
        desc: "hosts the Progressive Web Application (PWA) and executes serverless proxy functions (/api/wu-sync for one-time CAS schedule retrieval and /api/feed for faculty news aggregation)."
      },
      {
        name: "Ignacy Mościcki State University of Applied Sciences in Ciechanów (wu.pansim.edu.pl, pansim.edu.pl)",
        desc: "source of academic timetables and publicly available faculty announcements."
      },
      {
        name: "GitHub, Inc. (api.github.com, avatars.githubusercontent.com)",
        desc: "fetches public release notes (changelog), project milestones, and open-source contributor profiles (no user account data is transmitted)."
      },
      {
        name: "CARTO (basemaps.cartocdn.com) & OpenStreetMap",
        desc: "serves map tiles for the interactive Ciechanów and Mława campus maps (your browser sends standard HTTP tile requests)."
      },
      {
        name: "Open-Meteo (api.open-meteo.com)",
        desc: "provides current weather forecasts for the fixed coordinates of the Ciechanów campus (no user location or account data is transmitted)."
      }
    ],
    s6Transfer:
      "Some infrastructure providers (Google LLC, Netlify Inc., GitHub Inc.) are established in the United States. Any transfer of data outside the European Economic Area (EEA) is carried out in compliance with Chapter V of the GDPR on the basis of the European Commission’s adequacy decision for the EU-US Data Privacy Framework (DPF) and EU Standard Contractual Clauses (SCCs).",
    s6Strong: "The Application displays no advertisements and never sells user data to any third parties.",
    s7Title: "7. Your GDPR Rights",
    s7Lead: "Under Articles 15–21 of the GDPR, you have the right to:",
    s7Items: [
      "access your personal data and obtain a copy of it (Art. 15 GDPR)",
      "rectify inaccurate or incomplete data (Art. 16 GDPR)",
      "erasure of your data (“right to be forgotten” — Art. 17 GDPR)",
      "restrict processing of your data (Art. 18 GDPR)",
      "data portability (Art. 20 GDPR)",
      "object to processing based on legitimate interest (Art. 21 GDPR)",
      "withdraw consent at any time (e.g., browser geolocation permission) without affecting the lawfulness of prior processing",
      "lodge a complaint with the supervisory authority — President of the Personal Data Protection Office in Poland (Prezes UODO, ul. Stawki 2, 00-193 Warsaw, uodo.gov.pl)"
    ],
    s7Contact: "To exercise any of your rights or request account deletion, contact us at:",
    s8Title: "8. Cookies and Local Browser Storage",
    s8BeforeLink:
      "The Application uses strictly necessary session mechanisms and browser storage technologies (localStorage, sessionStorage, IndexedDB, and PWA Cache Storage) to maintain authentication sessions, remember theme preferences, and store offline schedules. A complete list of all storage keys, purposes, and retention periods is available on our",
    s8LinkLabel: "Cookie & Local Storage Policy page",
    s9Title: "9. Data Security",
    s9Text:
      "All network communication between your browser, serverless proxy functions, and cloud databases is encrypted via HTTPS/TLS. Access to Cloud Firestore documents is enforced by strict Firestore Security Rules that permit reading, creating, updating, and deleting calendar events solely by the authenticated document owner (request.auth.uid == resource.data.userId).",
    s10Title: "10. Changes to This Privacy Policy",
    s10Text:
      "Significant updates to this Privacy Policy will be communicated via an in-app notice or on the project Start page. The “Last updated” date at the top of this page always indicates the current effective version.",
    s11Title: "11. Contact",
    s11Org: "KNIS — Applied Computer Science Student Research Club",
    s11Uni: "Ignacy Mościcki State University of Applied Sciences in Ciechanów (Faculty of Engineering and Economics)",
    s11Addr: "ul. Gabriela Narutowicza 9, 06-400 Ciechanów, Poland",
    footerDate: "Last updated: November 16, 2026",
    footerSub: "Smart Campus • PANSIM in Ciechanów",
    backLink: "← Back to Start page"
  }
};

function PolitykaPrywatnosci() {
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

  const t = PRIVACY_TRANSLATIONS[lang] || PRIVACY_TRANSLATIONS.pl;

  const scrollToContent = () => {
    const el = document.getElementById("pp-tresc");
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
            <FontAwesomeIcon icon={Icons.faShieldHalved} className="LegalPage__icon" />
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

        <div className="LegalPage__sections" id="pp-tresc">
          <section className="LegalSection">
            <h2>{t.s1Title}</h2>
            <p>{t.s1P1}</p>
            <p>
              {t.s1P2Lead} <strong>{t.s1P2Strong}</strong>.
            </p>
            <p>{t.s1P3}</p>
          </section>

          <section className="LegalSection">
            <h2>{t.s2Title}</h2>

            <h3>{t.s2Sub1}</h3>
            <ul>
              {t.s2Sub1Items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h3>{t.s2Sub2}</h3>
            <ul>
              {t.s2Sub2Items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h3>{t.s2Sub3}</h3>
            <ul>
              {t.s2Sub3Items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h3>{t.s2Sub4}</h3>
            <p>{t.s2Sub4Text}</p>
          </section>

          <section className="LegalSection">
            <h2>{t.s3Title}</h2>
            <p>{t.s3Intro}</p>
            <ul>
              {t.s3Bullets.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <div className="LegalHighlightBox">
              <p>
                {t.s3LimitedUseLead}{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="LegalSection__link"
                >
                  {t.s3LimitedUseLinkLabel}
                </a>
                {t.s3LimitedUseAfter}
              </p>
            </div>
          </section>

          <section className="LegalSection">
            <h2>{t.s4Title}</h2>
            <div className="LegalPurposeList">
              {t.s4Rows.map(([purpose, basis], i) => (
                <div key={i} className="LegalPurposeRow">
                  <div className="LegalPill LegalPill--light">{purpose}</div>
                  <div className="LegalPill LegalPill--dark">{basis}</div>
                </div>
              ))}
            </div>
            <p>{t.s4Voluntary}</p>
          </section>

          <section className="LegalSection">
            <h2>{t.s5Title}</h2>
            <p>{t.s5P1}</p>
            <p>{t.s5P2}</p>
          </section>

          <section className="LegalSection">
            <h2>{t.s6Title}</h2>
            <p>{t.s6Lead}</p>
            <ul>
              {t.s6Items.map((item, i) => (
                <li key={i}>
                  <strong>{item.name}</strong> — {item.desc}
                </li>
              ))}
            </ul>
            <p>{t.s6Transfer}</p>
            <p>
              <strong>{t.s6Strong}</strong>
            </p>
          </section>

          <section className="LegalSection">
            <h2>{t.s7Title}</h2>
            <p>{t.s7Lead}</p>
            <ul>
              {t.s7Items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>
              {t.s7Contact}{" "}
              <a
                href="mailto:smartcampuspansim@gmail.com"
                className="LegalSection__link"
              >
                smartcampuspansim@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="LegalSection">
            <h2>{t.s8Title}</h2>
            <p>
              {t.s8BeforeLink}{" "}
              <Link to={`/InformacjeOCookie?lang=${lang}`} className="LegalSection__link">
                {t.s8LinkLabel}
              </Link>
              .
            </p>
          </section>

          <section className="LegalSection">
            <h2>{t.s9Title}</h2>
            <p>{t.s9Text}</p>
          </section>

          <section className="LegalSection">
            <h2>{t.s10Title}</h2>
            <p>{t.s10Text}</p>
          </section>

          <section className="LegalSection">
            <h2>{t.s11Title}</h2>
            <div className="LegalContactSection">
              <div className="LegalContactSection__info">
                <p>
                  <strong>{t.s11Org}</strong>
                </p>
                <p>{t.s11Uni}</p>
                <p>{t.s11Addr}</p>
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

export default PolitykaPrywatnosci;
