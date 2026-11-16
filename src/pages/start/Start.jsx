import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import { useTheme } from "@hooks/useTheme.js";
import Version from '@components/Version/Version';
import GoogleButton from '@components/Buttons/GoogleButton/GoogleButton';
import ContinueButton from '@components/Buttons/ContinueButton/ContinueButton';
import MainButton from '@components/Buttons/MainButton/MainButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import './Start.css';
import arrowsUp from './arrows_up.png';
import arrowsLeft from './arrows_left.png';
import pansim from './pansim.png';
import building from './building.webp';
import dots from './dots.png';
import logoBackground from './logo.svg';
import lekcja from './lekcja.png';
import building2 from './building2.webp';
import building3 from './building3.webp';
import mapImg from './map.png';
import wnozinsAvatar from '@/assets/img/wnm.webp';
import wntsAvatar from '@/assets/img/wnt.jpg';
import LogoFull from "../../components/Logo/LogoFull";
import StartNavBar from "../../components/StartNavBar/StartNavBar";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const TechIconReact = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="2.1" fill="#61DAFB" />
    <g stroke="#61DAFB" strokeWidth="1.25" fill="none">
      <ellipse rx="10" ry="4.2" cx="12" cy="12" />
      <ellipse rx="10" ry="4.2" cx="12" cy="12" transform="rotate(60 12 12)" />
      <ellipse rx="10" ry="4.2" cx="12" cy="12" transform="rotate(120 12 12)" />
    </g>
  </svg>
);

const TechIconFirebase = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 18.2L7.4 2.8c.1-.7 1-.9 1.4-.3l2.5 4.7 3.5-3c.5-.4 1.3-.1 1.4.5l2.8 13.5-7 3.9-7-3.9z" fill="#FFA000" />
    <path d="M12 22.1l7-3.9-2.8-13.5c-.1-.6-.9-.9-1.4-.5L5 18.2l7 3.9z" fill="#FFCA28" />
    <path d="M5 18.2l6.3-11-2.5-4.7c-.4-.6-1.3-.4-1.4.3L5 18.2z" fill="#F57C00" />
  </svg>
);

const TechIconNetlify = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.2L2.2 12 12 21.8 21.8 12 12 2.2z" fill="#00C7B7" />
    <path d="M12 6.8v10.4M6.8 12h10.4M8.5 8.5l7 7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const TechIconLeaflet = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19.5 3.5C12.2 3.5 5.8 7.8 4.2 15.2c-.4 1.8.2 3.6 1.5 4.8 1.2-1.2 4.3-4.3 4.3-4.3S7 19 6 20c5.8 1.4 12.6-2.5 14-9.8.4-2.2.3-4.6-.5-6.7z" fill="#77B829" />
    <path d="M6.2 19.6c3-4.2 7.5-8.4 13.2-11" stroke="#D1F372" strokeWidth="1.4" strokeLinecap="round" fill="none" />
  </svg>
);

const FEED_SHOWCASE_POSTS = [
  {
    id: "wie-1",
    faculty: "wie",
    facultyName: "Wydział Inżynierii i Ekonomii",
    handle: "@wie.pansim",
    time: "2 godz. temu",
    avatar: building,
    text: "Zapraszamy studentów na otwarte spotkanie Koła Naukowego Informatyki Stosowanej (KNIS) — rozwijamy wspólnie platformę Smart Campus dla całej uczelni PANSIM!"
  },
  {
    id: "wnts-1",
    faculty: "wnts",
    facultyName: "Wydział Nauk Technicznych i Społecznych",
    handle: "@wnts.pansim",
    time: "wczoraj",
    avatar: wntsAvatar,
    text: "Opublikowano najnowsze komunikaty dotyczące organizacji zajęć laboratoryjnych oraz harmonogramu zjazdów dla studiów niestacjonarnych."
  },
  {
    id: "wnozins-1",
    faculty: "wnozins",
    facultyName: "Wydział Nauk o Zdrowiu i Nauk Społecznych",
    handle: "@wnozins.pansim",
    time: "2 dni temu",
    avatar: wnozinsAvatar,
    text: "Wszystkie aktualności wydziałowe, terminy dyżurów oraz informacje o wydarzeniach studenckich czekają teraz w jednym chronologicznym widoku."
  }
];

const LEGAL_CONTENT = {
  cookies: {
    title: "Informacje o plikach cookie i pamięci lokalnej",
    paragraphs: [
      "Platforma Smart Campus wykorzystuje pliki cookie oraz pamięć lokalną przeglądarki (localStorage) wyłącznie w celach niezbędnych do prawidłowego działania aplikacji.",
      "Przechowywane dane obejmują: utrzymanie sesji uwierzytelniania Firebase, wybrany motyw kolorystyczny (jasny/ciemny) oraz podręczną kopię planu zajęć, aby aplikacja działała szybko również przy słabszym połączeniu.",
      "Nie wykorzystujemy plików cookie do celów reklamowych ani śledzenia użytkowników na stronach podmiotów trzecich."
    ]
  },
  privacy: {
    title: "Polityka prywatności Smart Campus",
    paragraphs: [
      "Administratorem projektu edukacyjnego Smart Campus jest Koło Naukowe Informatyki Stosowanej (KNIS) działające przy Państwowej Akademii Nauk Stosowanych im. Ignacego Mościckiego w Ciechanowie.",
      "Logowanie odbywa się za pośrednictwem bezpiecznego uwierzytelniania Google / Firebase lub synchronizacji z Wirtualną Uczelnią PANSIM. Hasła do Wirtualnej Uczelni służą wyłącznie do jednorazowego pobrania harmonogramu zajęć i nie są zapisywane w bazie danych.",
      "W sprawach związanych z prywatnością lub usunięciem konta możesz skontaktować się z nami pod adresem: smartcampuspansim@gmail.com."
    ]
  },
  bug: {
    title: "Zgłoś błąd lub sugestię",
    paragraphs: [
      "Znalazłeś błąd na stronie lub masz pomysł na nową funkcję w Smart Campus? Napisz do nas bezpośrednio na adres smartcampuspansim@gmail.com lub utwórz zgłoszenie na naszym profilu GitHub.",
      "W wiadomości warto podać model urządzenia (np. telefon / laptop) oraz przeglądarkę (np. Safari, Chrome), co pozwoli nam szybciej wprowadzić poprawkę."
    ]
  }
};

const TEAM_CACHE_KEY = "smartcampus_github_team_v2";
const TEAM_CACHE_TTL_MS = 30 * 60 * 1000;
const DEFAULT_TEAM_MEMBERS = [
  { login: "Bartlas05", avatarUrl: "https://avatars.githubusercontent.com/u/66913729?s=80&v=4" },
  { login: "MajesXD", avatarUrl: "https://avatars.githubusercontent.com/u/154003181?s=80&v=4" },
  { login: "SmartCampusPANSIM", avatarUrl: "https://avatars.githubusercontent.com/u/207775346?s=80&v=4" }
];

const Start = () => {
  const { user, isAuthLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const numbersRef = useRef(null);
  const [numbersVisible, setNumbersVisible] = useState(false);
  const [counts, setCounts] = useState({ users: 0, modules: 0, buildings: 0 });
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const raw = sessionStorage.getItem(TEAM_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < TEAM_CACHE_TTL_MS && Array.isArray(parsed.data) && parsed.data.length > 0) {
          return parsed.data;
        }
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_TEAM_MEMBERS;
  });

  const dialogRef = useRef(null);
  const [activeModalKey, setActiveModalKey] = useState("cookies");
  const [activeFeedFaculty, setActiveFeedFaculty] = useState("all");

  useEffect(() => {
    let isCancelled = false;

    const loadGithubTeam = async () => {
      try {
        const cachedRaw = sessionStorage.getItem(TEAM_CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (Date.now() - cached.timestamp < TEAM_CACHE_TTL_MS && Array.isArray(cached.data) && cached.data.length > 0) {
            return;
          }
        }
      } catch {
        // Ignore storage errors
      }

      const endpoints = [
        "https://api.github.com/orgs/SmartCampusOrg/members?per_page=100",
        "https://api.github.com/repos/SmartCampusOrg/SmartCampus/contributors?per_page=100",
        "https://api.github.com/repos/SmartCampusOrg/Smart-Campus-DevTools/contributors?per_page=100"
      ];

      const results = await Promise.allSettled(
        endpoints.map((url) =>
          fetch(url).then((res) => (res.ok ? res.json() : []))
        )
      );

      const mergedMap = new Map();
      for (const res of results) {
        if (res.status === "fulfilled" && Array.isArray(res.value)) {
          for (const member of res.value) {
            if (!member?.login || !member?.avatar_url) continue;
            if (member.type === "Bot" || member.login.includes("[bot]")) continue;
            if (!mergedMap.has(member.login)) {
              const sep = member.avatar_url.includes("?") ? "&" : "?";
              mergedMap.set(member.login, {
                login: member.login,
                avatarUrl: `${member.avatar_url}${sep}s=80`
              });
            }
          }
        }
      }

      const list = Array.from(mergedMap.values()).sort((a, b) => {
        if (a.login.toLowerCase() === "bartlas05") return -1;
        if (b.login.toLowerCase() === "bartlas05") return 1;
        return 0;
      });
      if (!isCancelled && list.length > 0) {
        setTeamMembers(list);
        try {
          sessionStorage.setItem(
            TEAM_CACHE_KEY,
            JSON.stringify({ timestamp: Date.now(), data: list })
          );
        } catch {
          // Ignore quota errors
        }
      }
    };

    loadGithubTeam();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (location.hash === "#o-projekcie") {
      const el = document.getElementById("o-projekcie");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location.hash]);

  useEffect(() => {
    if (isAuthLoading) return;
    const el = numbersRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setNumbersVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isAuthLoading]);

  useEffect(() => {
    if (!numbersVisible) return;
    const targets = { users: 2, modules: 5, buildings: 2 };

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCounts(targets);
      return;
    }

    const duration = 1100;
    const startTime = performance.now();

    let rafId;
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      setCounts({
        users: Math.round(eased * targets.users),
        modules: Math.round(eased * targets.modules),
        buildings: Math.round(eased * targets.buildings),
      });
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [numbersVisible]);

  // Fallback for browsers without native <dialog closedby="any"> support (e.g. Safari)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (!isDialogContent) {
          dialog.close();
        }
      };

      dialog.addEventListener("click", handleBackdropClick);
      return () => dialog.removeEventListener("click", handleBackdropClick);
    }
  }, [isAuthLoading]);

  const openLegalModal = (key) => {
    setActiveModalKey(key);
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    [document.documentElement, document.body, document.getElementById("root")]
      .filter(Boolean)
      .forEach((el) => {
        if (typeof el.scrollTo === "function") {
          el.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          el.scrollTop = 0;
        }
      });
  };

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  const modalContent = LEGAL_CONTENT[activeModalKey] || LEGAL_CONTENT.cookies;
  const visibleFeedPosts =
    activeFeedFaculty === "all"
      ? FEED_SHOWCASE_POSTS
      : FEED_SHOWCASE_POSTS.filter((p) => p.faculty === activeFeedFaculty);

  return (
    <main className="StartPage">
      <section className="StartPageBanner">
        <StartNavBar />
      </section>

      <section className="StartPageLogin">
        <div className="StartPageLogin__inner">
          <div className="StartPageLogin__content">
            <div className="StartPageLogin__title">
              <img
                className="StartPageLogin__arrowsUp"
                src={arrowsUp}
                alt=""
                aria-hidden="true"
              />
              <h1>
                <span className="StartPageLogin__titleLine">Wejdź na wyższy</span>
                <span className="StartPageLogin__titleLine">
                  <span className="text_fat text_highlight">level</span> studiowania
                </span>
              </h1>
            </div>

            <div className="StartPageLogin__description">
              <p>
                <span className="text_fat text_highlight">Smart Campus</span> to innowacyjna
                platforma usprawniająca życie akademickie ;)
              </p>
            </div>

            <div className="StartPageLogin__login">
              {!user ? (
                <GoogleButton onClick={() => navigate("/Logowanie")} />
              ) : (
                <ContinueButton onClick={() => navigate("/Panel")} />
              )}
              <img
                className="StartPageLogin__arrowsLeft"
                src={arrowsLeft}
                alt=""
                aria-hidden="true"
              />
            </div>

            <div className="StartPageLogin__logoPansim">
              <img src={pansim} alt="Logo PANSIM w Ciechanowie" />
              <span className="text_x" aria-hidden="true">X</span>
              <div className="StartPageLogin__knisText">
                <p>Koło naukowe</p>
                <p>informatyki stosowanej</p>
              </div>
            </div>
          </div>

          <div className="StartPageLogin__campusImage">
            <div className="StartPageLogin__imageFrame">
              <img
                className="StartPageLogin__dots0"
                src={dots}
                alt=""
                aria-hidden="true"
              />
              <img
                className="StartPageLogin__campusImage_img"
                src={building}
                alt="Budynek Państwowej Akademii Nauk Stosowanych im. Ignacego Mościckiego w Ciechanowie"
                fetchPriority="high"
              />
              <img
                className="StartPageLogin__dots1"
                src={dots}
                alt=""
                aria-hidden="true"
              />
              <img
                className="StartPageLogin__dots2"
                src={dots}
                alt=""
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="StartPageInfo" id="o-projekcie">
        <div className="StartPageInfo__container">
          <div className="StartPageInfo__topRow">
            <div className="StartPageInfo__questionSquare">
              <img
                className="logo_background"
                src={logoBackground}
                alt=""
                aria-hidden="true"
              />
              <h2>
                <span className="fat_text">Czym jest?</span>
                <span>Smart Campus</span>
              </h2>
            </div>

            <div className="StartPageInfo__descriptionSquare">
              <img
                className="StartPageLogin__dots3"
                src={dots}
                alt=""
                aria-hidden="true"
              />
              <div className="StartPageInfo__squareText1">
                <h3>Projekt Koła Naukowego Informatyki Stosowanej</h3>
              </div>
              <div className="StartPageInfo__squareText2">
                <p>
                  Smart Campus to platforma, która łączy wszystko, czego potrzebuje
                  student – plan zajęć, mapę kampusu i aktualności – w jednym,
                  intuicyjnym miejscu.
                </p>
              </div>

              <div className="StartPageInfo__descriptionSquare--bottom">
                <div className="StartPageInfo__descriptionSquare--bottomHalf">
                  <p className="StartPageInfo__metaLabel">Zespół Smart Campus</p>
                  <button
                    type="button"
                    className="StartPageInfo__teamAvatars"
                    onClick={() => navigate("/NaszZespol")}
                    title={`Zobacz nasz zespół (${teamMembers.map((m) => m.login).join(", ")})`}
                    aria-label="Zobacz nasz zespół"
                  >
                    {teamMembers.map((member) => (
                      <span
                        key={member.login}
                        className="StartPageInfo__avatar"
                        title={member.login}
                      >
                        <img
                          src={member.avatarUrl}
                          alt={member.login}
                          loading="lazy"
                        />
                      </span>
                    ))}
                  </button>
                </div>

                <div className="StartPageInfo__descriptionSquare--bottomHalf">
                  <p className="StartPageInfo__metaLabel">Technologie</p>
                  <div className="StartPageInfo__techTags">
                    <button
                      type="button"
                      className="StartPageInfo__technologyTag"
                      onClick={() => window.open('https://react.dev/', '_blank', 'noopener,noreferrer')}
                    >
                      <TechIconReact size={16} />
                      <span>React</span>
                    </button>
                    <button
                      type="button"
                      className="StartPageInfo__technologyTag"
                      onClick={() => window.open('https://firebase.google.com/', '_blank', 'noopener,noreferrer')}
                    >
                      <TechIconFirebase size={16} />
                      <span>Firebase</span>
                    </button>
                    <button
                      type="button"
                      className="StartPageInfo__technologyTag"
                      onClick={() => window.open('https://www.netlify.com/', '_blank', 'noopener,noreferrer')}
                    >
                      <TechIconNetlify size={16} />
                      <span>Netlify</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="StartPageInfo__bottomRow">
            <div className="StartPageInfo__planSquare">
              <div className="StartPageInfo__square--wrapper">
                <div className="StartPageInfo__circleIcon">
                  <FontAwesomeIcon icon={Icons.faCalendarDays} color="white" size="lg" />
                </div>
                <h3 className="StartPageInfo__squareText3">Plan zajęć</h3>
                <div className="StartPageInfo__squareText2">
                  <p>
                    Wygodny, dynamiczny plan zajęć oraz czytelny terminarz zjazdów.
                    Od teraz niczego nie przegapisz!
                  </p>
                </div>
                <div className="StartPageInfo__square--img">
                  <img src={lekcja} alt="Podgląd kafelka przedmiotu w planie zajęć" loading="lazy" />
                </div>
              </div>
            </div>

            <div className="StartPageInfo__imageSquare">
              <img src={building2} alt="Kampus PANSIM w Ciechanowie z lotu ptaka" loading="lazy" />
            </div>

            <div className="StartPageInfo__mapSquare">
              <div className="StartPageInfo__square--wrapper">
                <div className="StartPageInfo__circleIcon">
                  <FontAwesomeIcon icon={Icons.faMap} color="white" size="lg" />
                </div>
                <h3 className="StartPageInfo__squareText3">Mapa kampusu</h3>
                <div className="StartPageInfo__squareText2">
                  <p>
                    Łatwa, przejrzysta i wygodna, pomoże Ci poruszać się po kampusie
                    oraz najbliższej okolicy.
                  </p>
                </div>
                <div className="StartPageInfo__square--img">
                  <img src={mapImg} alt="Podgląd interaktywnej mapy kampusu" loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="Sec13Personas">
        <div className="Sec13Personas__container">
          <div className="Sec13Personas__header">
            <span className="SecEyebrow">STWORZONY DLA KAŻDEGO ROCZNIKA</span>
            <h2>Niezależnie od tego, na którym jesteś roku</h2>
          </div>

          <div className="Sec13Personas__grid">
            <div className="Sec13Personas__card">
              <div className="Sec13Personas__icon">
                <FontAwesomeIcon icon={Icons.faUserGraduate} />
              </div>
              <h3>Studenci 1. roku</h3>
              <p>
                Koniec ze stresem w pierwszych tygodniach października. Mapa
                kampusu poprowadzi Cię prosto pod odpowiedni budynek i salę
                wykładową.
              </p>
            </div>

            <div className="Sec13Personas__card">
              <div className="Sec13Personas__icon">
                <FontAwesomeIcon icon={Icons.faClock} />
              </div>
              <h3>Studia stacjonarne i zaoczne</h3>
              <p>
                Niezależnie czy masz zajęcia codziennie, czy w weekendowe
                zjazdy – czytelny terminarz pokaże Ci dokładne godziny i
                prowadzących.
              </p>
            </div>

            <div className="Sec13Personas__card">
              <div className="Sec13Personas__icon">
                <FontAwesomeIcon icon={Icons.faBell} />
              </div>
              <h3>Starości grup i koła naukowe</h3>
              <p>
                Bądź na bieżąco z komunikatami wszystkich 3 wydziałów PANSIM w
                jednym miejscu bez przełączania się między stronami.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="SecFeedDark">
        <div className="SecFeedDark__container">
          <div className="SecFeedDark__left">
            <span className="SecFeedDark__eyebrow">AKTUALNOŚCI WYDZIAŁOWE PANSIM</span>
            <h2>Wszystkie ogłoszenia z 3 wydziałów w jednym miejscu</h2>
            <p>
              Koniec z otwieraniem kilku osobnych stron wydziałowych. Zakładka
              Aktualności w Smart Campus zbiera wiadomości ze wszystkich trzech
              wydziałów uczelni w jednym miejscu, pozwalając błyskawicznie
              filtrować najważniejsze komunikaty.
            </p>
            <div className="SecFeedDark__filters" role="group" aria-label="Filtruj podgląd wydziałów">
              {[
                { id: "all", label: "Wszystkie (3)" },
                { id: "wie", label: "WIE" },
                { id: "wnozins", label: "WNoZiNS" },
                { id: "wnts", label: "WNTS" }
              ].map((fac) => (
                <button
                  key={fac.id}
                  type="button"
                  className={`SecFeedDark__filterBtn ${
                    activeFeedFaculty === fac.id ? "active" : ""
                  }`}
                  onClick={() => setActiveFeedFaculty(fac.id)}
                >
                  {fac.label}
                </button>
              ))}
            </div>
          </div>

          <div className="SecFeedDark__postsCol">
            {visibleFeedPosts.map((post) => (
              <article key={post.id} className="SecFeedDark__card">
                <img
                  src={post.avatar}
                  alt={post.facultyName}
                  className="SecFeedDark__avatar"
                  loading="lazy"
                />
                <div className="SecFeedDark__cardBody">
                  <header className="SecFeedDark__cardHeader">
                    <strong>{post.facultyName}</strong>
                    <span>{post.handle} • {post.time}</span>
                  </header>
                  <p>{post.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="Sec09Mobile">
        <div className="Sec09Mobile__container">
          <div
            className={`Sec09Mobile__devicesStage ${
              theme === "dark" ? "Sec09Mobile__devicesStage--dark" : ""
            }`}
            aria-label="Podgląd skalowania Planu Zajęć Smart Campus na komputerze, tablecie i telefonie"
          >
            {/* PC / Desktop: Pełny NavBar + 3-kolumnowa siatka kart Planu Zajęć */}
            <div className="Sec09Device Sec09Device--pc">
              <div className="Sec09Device__pcScreen">
                <div className="Sec09AppNav">
                  <div className="Sec09AppNav__logo">
                    <span className="Sec09AppNav__logoMark" />
                    <span>Smart Campus</span>
                  </div>
                  <div className="Sec09AppNav__pill">
                    <span>Panel</span>
                    <span className="active">Plan zajęć</span>
                    <span>Mapa</span>
                    <span>E-learning</span>
                    <span>Feed</span>
                  </div>
                  <span className="Sec09AppNav__avatar" />
                </div>

                <div className="Sec09Plan__header">
                  <div className="Sec09Plan__titleRow">
                    <strong>Plan zajęć</strong>
                    <span className="Sec09Plan__beta">BETA</span>
                  </div>
                  <div className="Sec09Plan__toggles">
                    <span className="Sec09Plan__seg">
                      <i className="active">Karty</i>
                      <i>Lista</i>
                      <i>Siatka</i>
                    </span>
                    <span className="Sec09Plan__seg">
                      <i className="active">Student</i>
                      <i>Dydaktyk</i>
                    </span>
                  </div>
                </div>

                <div className="Sec09Plan__daysRow">
                  <span className="Sec09Plan__weekPill">Tydzień 6</span>
                  <div className="Sec09Plan__bubbles">
                    <span>Pn</span>
                    <span>Wt</span>
                    <span className="active">Śr</span>
                    <span>Cz</span>
                    <span>Pt</span>
                  </div>
                  <span className="Sec09Plan__groupPill">INF • Sem 4 ▾</span>
                </div>

                <div className="Sec09Plan__gridPc">
                  <div className="Sec09Card Sec09Card--past">
                    <div className="Sec09Card__top">
                      <strong>Matematyka Dyskretna</strong>
                      <span>dr J. Kowalski</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Kampus • A1</span>
                        <b>08:00 – 09:30</b>
                      </div>
                      <span className="Sec09Card__badge">Wykład</span>
                    </div>
                  </div>

                  <div className="Sec09Card Sec09Card--ongoing">
                    <div className="Sec09Card__top">
                      <strong>Programowanie Webowe</strong>
                      <span>mgr A. Nowak</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Kampus • 204</span>
                        <b>09:45 – 11:15</b>
                      </div>
                      <span className="Sec09Card__badge">Lab</span>
                    </div>
                    <div className="Sec09Card__progressTrack" aria-hidden="true">
                      <div className="Sec09Card__progressBar" style={{ width: "62%" }} />
                    </div>
                  </div>

                  <div className="Sec09Card Sec09Card--future">
                    <div className="Sec09Card__top">
                      <strong>Bazy Danych SQL</strong>
                      <span>dr M. Wiśniewski</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Kampus • 112</span>
                        <b>11:30 – 13:00</b>
                      </div>
                      <span className="Sec09Card__badge">Ćw.</span>
                    </div>
                  </div>

                  <div className="Sec09Card Sec09Card--future Sec09Card--hideSm">
                    <div className="Sec09Card__top">
                      <strong>Systemy Operacyjne</strong>
                      <span>mgr K. Zieliński</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Kampus • 208</span>
                        <b>13:15 – 14:45</b>
                      </div>
                      <span className="Sec09Card__badge">Lab</span>
                    </div>
                  </div>

                  <div className="Sec09Card Sec09Card--future Sec09Card--hideSm">
                    <div className="Sec09Card__top">
                      <strong>Algorytmy i Struktury</strong>
                      <span>dr P. Kamiński</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Kampus • A2</span>
                        <b>15:00 – 16:30</b>
                      </div>
                      <span className="Sec09Card__badge">Wykład</span>
                    </div>
                  </div>

                  <div className="Sec09Card Sec09Card--future Sec09Card--hideSm">
                    <div className="Sec09Card__top">
                      <strong>Język Angielski B2</strong>
                      <span>mgr E. Wójcik</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Kampus • 105</span>
                        <b>16:45 – 18:15</b>
                      </div>
                      <span className="Sec09Card__badge">Ćw.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="Sec09Device__pcBase" aria-hidden="true" />
            </div>

            {/* Tablet: Skrócony NavBar (ikony) + 2-kolumnowy układ kart */}
            <div className="Sec09Device Sec09Device--tablet">
              <div className="Sec09Device__tabletScreen">
                <div className="Sec09AppNav Sec09AppNav--compact">
                  <div className="Sec09AppNav__logo">
                    <span className="Sec09AppNav__logoMark" />
                    <span>Smart Campus</span>
                  </div>
                  <div className="Sec09AppNav__pill Sec09AppNav__pill--icons">
                    <span><FontAwesomeIcon icon={Icons.faSolarPanel} /></span>
                    <span className="active"><FontAwesomeIcon icon={Icons.faCalendarDays} /></span>
                    <span><FontAwesomeIcon icon={Icons.faMap} /></span>
                    <span><FontAwesomeIcon icon={Icons.faLaptop} /></span>
                  </div>
                  <span className="Sec09AppNav__avatar" />
                </div>

                <div className="Sec09Plan__header">
                  <div className="Sec09Plan__titleRow">
                    <strong>Plan zajęć</strong>
                    <span className="Sec09Plan__beta">BETA</span>
                  </div>
                  <span className="Sec09Plan__groupPill">INF • S4</span>
                </div>

                <div className="Sec09Plan__bubbles Sec09Plan__bubbles--sm">
                  <span>Pn</span>
                  <span>Wt</span>
                  <span className="active">Śr</span>
                  <span>Cz</span>
                  <span>Pt</span>
                </div>

                <div className="Sec09Plan__gridTablet">
                  <div className="Sec09Card Sec09Card--ongoing">
                    <div className="Sec09Card__top">
                      <strong>Programowanie Web</strong>
                      <span>mgr A. Nowak</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Sala 204</span>
                        <b>09:45 – 11:15</b>
                      </div>
                      <span className="Sec09Card__badge">Lab</span>
                    </div>
                    <div className="Sec09Card__progressTrack" aria-hidden="true">
                      <div className="Sec09Card__progressBar" style={{ width: "62%" }} />
                    </div>
                  </div>

                  <div className="Sec09Card Sec09Card--future">
                    <div className="Sec09Card__top">
                      <strong>Bazy Danych SQL</strong>
                      <span>dr M. Wiśniewski</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Sala 112</span>
                        <b>11:30 – 13:00</b>
                      </div>
                      <span className="Sec09Card__badge">Ćw.</span>
                    </div>
                  </div>

                  <div className="Sec09Card Sec09Card--future Sec09Card--hideSm">
                    <div className="Sec09Card__top">
                      <strong>Systemy Operacyjne</strong>
                      <span>mgr K. Zieliński</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Sala 208</span>
                        <b>13:15 – 14:45</b>
                      </div>
                      <span className="Sec09Card__badge">Lab</span>
                    </div>
                  </div>

                  <div className="Sec09Card Sec09Card--future Sec09Card--hideSm">
                    <div className="Sec09Card__top">
                      <strong>Algorytmy</strong>
                      <span>dr P. Kamiński</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Sala A2</span>
                        <b>15:00 – 16:30</b>
                      </div>
                      <span className="Sec09Card__badge">Wykład</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Telefon: 1-kolumnowy widok kart + prawdziwy MobileNavBar na dole */}
            <div className="Sec09Device Sec09Device--phone">
              <div className="Sec09Device__phoneNotch" aria-hidden="true" />
              <div className="Sec09Device__phoneScreen">
                <div className="Sec09Plan__header Sec09Plan__header--phone">
                  <div className="Sec09Plan__titleRow">
                    <strong>Plan zajęć</strong>
                    <span className="Sec09Plan__beta">BETA</span>
                  </div>
                </div>

                <div className="Sec09Plan__bubbles Sec09Plan__bubbles--xs">
                  <span>Pn</span>
                  <span>Wt</span>
                  <span className="active">Śr</span>
                  <span>Cz</span>
                  <span>Pt</span>
                </div>

                <div className="Sec09Plan__gridPhone">
                  <div className="Sec09Card Sec09Card--past Sec09Card--hideSm">
                    <div className="Sec09Card__top">
                      <strong>Matematyka</strong>
                      <span>dr J. Kowalski</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Sala A1</span>
                        <b>08:00 – 09:30</b>
                      </div>
                      <span className="Sec09Card__badge">Wykład</span>
                    </div>
                  </div>

                  <div className="Sec09Card Sec09Card--ongoing">
                    <div className="Sec09Card__top">
                      <strong>Programowanie Web</strong>
                      <span>mgr A. Nowak</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Sala 204</span>
                        <b>09:45 – 11:15</b>
                      </div>
                      <span className="Sec09Card__badge">Lab</span>
                    </div>
                    <div className="Sec09Card__progressTrack" aria-hidden="true">
                      <div className="Sec09Card__progressBar" style={{ width: "62%" }} />
                    </div>
                  </div>

                  <div className="Sec09Card Sec09Card--future">
                    <div className="Sec09Card__top">
                      <strong>Bazy Danych SQL</strong>
                      <span>dr M. Wiśniewski</span>
                    </div>
                    <div className="Sec09Card__bottom">
                      <div>
                        <span>Sala 112</span>
                        <b>11:30 – 13:00</b>
                      </div>
                      <span className="Sec09Card__badge">Ćw.</span>
                    </div>
                  </div>
                </div>

                <div className="Sec09MobileDock" aria-hidden="true">
                  <span><FontAwesomeIcon icon={Icons.faSolarPanel} /></span>
                  <span className="active"><FontAwesomeIcon icon={Icons.faCalendarDays} /></span>
                  <span><FontAwesomeIcon icon={Icons.faMap} /></span>
                  <span><FontAwesomeIcon icon={Icons.faPhotoFilm} /></span>
                  <span><FontAwesomeIcon icon={Icons.faLaptop} /></span>
                </div>
              </div>
            </div>
          </div>

          <div className="Sec09Mobile__info">
            <span className="SecEyebrow">MOBILE-FIRST & PWA</span>
            <h2>Zaprojektowano pod każdy ekran</h2>
            <p>
              Niezależnie od tego, czy sprawdzasz salę w biegu na korytarzu,
              przeglądasz tydzień na tablecie, czy planujesz semestr na
              komputerze – interfejs Smart Campus płynnie dopasowuje układ
              Planu zajęć i pozostałych modułów do każdego urządzenia, wspierając
              pełny Tryb Ciemny.
            </p>
            <div className="Sec09Mobile__actions">
              <button
                type="button"
                className="Sec09Mobile__themeBtn"
                onClick={toggleTheme}
              >
                <FontAwesomeIcon icon={theme === "dark" ? Icons.faSun : Icons.faMoon} />
                <span>
                  Przełącz motyw na żywo (Obecnie: {theme === "dark" ? "Ciemny" : "Jasny"})
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="Sec11Knis">
        <div className="Sec11Knis__card">
          <div className="Sec11Knis__left">
            <div className="Sec11Knis__logos">
              <img src={pansim} alt="PANSIM w Ciechanowie" />
              <span>×</span>
              <strong>KNIS PANSIM Ciechanów</strong>
            </div>
            <h2>Tworzymy realne oprogramowanie na uczelni</h2>
            <p>
              Smart Campus powstaje w ramach Koła Naukowego Informatyki
              Stosowanej dla Państwowej Akademii Nauk Stosowanych im. Ignacego
              Mościckiego w Ciechanowie. Chcemy, by studenci PANSIM korzystali z
              narzędzi na poziomie najlepszych światowych uczelni. Chcesz
              dołączyć do zespołu programistów, testerów lub projektantów UI?
            </p>
            <div className="Sec11Knis__btnRow">
              <button
                type="button"
                className="Sec11Knis__btnPrimary"
                onClick={() => navigate("/NaszZespol")}
              >
                Poznaj nasz zespół →
              </button>
              <button
                type="button"
                className="Sec11Knis__btnGhost"
                onClick={() =>
                  window.open(
                    "https://github.com/SmartCampusOrg",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                <FontAwesomeIcon icon={Icons.faGithub} /> Zobacz GitHub Smart Campus
              </button>
            </div>
          </div>

          <div className="Sec11Knis__stackGrid">
            <div className="Sec11Knis__stackItem">
              <TechIconReact size={24} />
              <strong>React 19 + Vite</strong>
              <span>Błyskawiczny interfejs SPA</span>
            </div>
            <div className="Sec11Knis__stackItem">
              <TechIconFirebase size={24} />
              <strong>Firebase Auth & DB</strong>
              <span>Bezpieczna chmura Google</span>
            </div>
            <div className="Sec11Knis__stackItem">
              <TechIconLeaflet size={24} />
              <strong>Leaflet Maps</strong>
              <span>Wektorowa nawigacja</span>
            </div>
            <div className="Sec11Knis__stackItem">
              <TechIconNetlify size={24} />
              <strong>Netlify</strong>
              <span>Hosting aplikacji</span>
            </div>
          </div>
        </div>
      </section>

      <section className="StartPageNumbers" ref={numbersRef}>
        <div className="StartPageNumbers__container">
          <h2 className="StartPageNumbers--title">Smart Campus w liczbach</h2>

          <div className="StartPageNumbers--bottom">
            <div className="StartPageNumbers__block">
              <div className="StartPageNumbers__block--top StartPageNumbers__block--iconCard">
                <FontAwesomeIcon icon={Icons.faUserGroup} />
              </div>
              <div className="StartPageNumbers__block--bottom">
                <div className="StartPageNumbers__blockBottomText1">
                  <p>{counts.users}</p>
                </div>
                <div className="StartPageNumbers__blockBottomText2">
                  <p>Użytkowników platformy</p>
                </div>
              </div>
            </div>

            <div className="StartPageNumbers__block StartPageNumbers__block--center">
              <div className="StartPageNumbers__modulesBlock">
                <div className="StartPageNumbers__blockBottomText1 StartPageNumbers__modulesBlockTextAdjustment">
                  <p>{counts.modules}</p>
                </div>
                <div className="StartPageNumbers__blockBottomText2 StartPageNumbers__modulesBlockTextAdjustment">
                  <p>Smart modułów</p>
                </div>
              </div>
            </div>

            <div className="StartPageNumbers__block">
              <div className="StartPageNumbers__block--top StartPageNumbers__block--photoCard">
                <img src={building3} alt="Budynek kampusu PANSIM w Ciechanowie" loading="lazy" />
              </div>
              <div className="StartPageNumbers__block--bottom">
                <div className="StartPageNumbers__blockBottomText1">
                  <p>{counts.buildings}</p>
                </div>
                <div className="StartPageNumbers__blockBottomText2">
                  <p>Budynki objęte projektem</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="FooterV1">
        <div className="FooterV1__container">
          <div className="FooterV1__openMainRow">
            <div className="FooterV1__openLeft">
              <span className="FooterV3__eyebrow">MASZ POMYSŁ LUB PYTANIE?</span>
              <a
                href="mailto:smartcampuspansim@gmail.com"
                className="FooterV3__bigMail"
              >
                smartcampuspansim@gmail.com
              </a>
              <p className="FooterV1__tagline">
                Nowoczesny ekosystem studencki tworzony przez Koło Naukowe
                Informatyki Stosowanej dla Państwowej Akademii Nauk Stosowanych
                im. Ignacego Mościckiego w Ciechanowie.
              </p>
            </div>

            <div className="FooterV3__rightMeta">
              <div className="FooterV3__logoRow">
                <LogoFull colorReverse="reverse" />
                <span className="beta">BETA</span>
              </div>
              <p className="FooterV3__versionText">
                <Version prefix="Wersja: " /> • Zbudowano w React, Firebase & Netlify
              </p>
              <div className="FooterV3__pillRow">
                <Link to="/ZglosBlad">
                  Zgłoś błąd
                </Link>
                <Link to="/InformacjeOCookie">
                  Pliki cookie
                </Link>
                <Link to="/PolitykaPrywatnosci">
                  Polityka prywatności
                </Link>
              </div>
            </div>
          </div>

          <div className="FooterV1__bottomBar FooterV1__bottomBar--divided">
            <span>© 2025–2026 KNIS PANSIM Ciechanów. Wszelkie prawa zastrzeżone.</span>
            <div className="FooterV1__legalLinks">
              <button
                type="button"
                className="FooterV3__backTop"
                onClick={scrollToTop}
                aria-label="Przewiń na samą górę"
                title="Przewiń na samą górę"
              >
                <FontAwesomeIcon icon={Icons.faArrowUp} />
              </button>
            </div>
          </div>
        </div>
      </footer>

      <dialog
        ref={dialogRef}
        className="StartPageModal"
        closedby="any"
        aria-labelledby="start-modal-title"
      >
        <div className="StartPageModal__inner">
          <div className="StartPageModal__header">
            <h2 id="start-modal-title">{modalContent.title}</h2>
            <form method="dialog">
              <button
                type="submit"
                className="StartPageModal__closeBtn"
                aria-label="Zamknij okno"
              >
                <FontAwesomeIcon icon={Icons.faXmark} />
              </button>
            </form>
          </div>
          <div className="StartPageModal__body">
            {modalContent.paragraphs.map((text, idx) => (
              <p key={idx}>{text}</p>
            ))}
          </div>
          <div className="StartPageModal__footer">
            {activeModalKey === "bug" && (
              <a
                href="mailto:smartcampuspansim@gmail.com?subject=Zg%C5%82oszenie%20b%C5%82%C4%99du%20-%20Smart%20Campus"
                className="StartPageModal__actionLink"
              >
                Napisz wiadomość e-mail
              </a>
            )}
            <form method="dialog">
              <button type="submit" className="StartPageModal__primaryBtn" autoFocus>
                Rozumiem
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </main>
  );
};

export default Start;
