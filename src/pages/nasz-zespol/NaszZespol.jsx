import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import StartNavBar from '@components/StartNavBar/StartNavBar';
import arrowsLeft from '@pages/start/arrows_left.png';
import dots from '@pages/start/dots.png';
import './NaszZespol.css';

const TEAM_PAGE_CACHE_KEY = 'smartcampus_team_page_v2';
const TEAM_CACHE_TTL_MS = 30 * 60 * 1000;

function formatCommitsLabel(count) {
  if (!count || count <= 0) return '';
  if (count === 1) return '1 commit';
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} commity`;
  }
  return `${count} commitów`;
}

const DEFAULT_TEAM_MEMBERS = [
  {
    login: 'Bartlas05',
    avatarUrl: 'https://avatars.githubusercontent.com/u/66913729?s=240&v=4',
    htmlUrl: 'https://github.com/Bartlas05',
    contributions: null,
  },
  {
    login: 'MajesXD',
    avatarUrl: 'https://avatars.githubusercontent.com/u/154003181?s=240&v=4',
    htmlUrl: 'https://github.com/MajesXD',
    contributions: null,
  },
  {
    login: 'SmartCampusPANSIM',
    avatarUrl: 'https://avatars.githubusercontent.com/u/207775346?s=240&v=4',
    htmlUrl: 'https://github.com/SmartCampusPANSIM',
    contributions: null,
  },
];

function NaszZespol() {
  const [members, setMembers] = useState(() => {
    try {
      const raw = sessionStorage.getItem(TEAM_PAGE_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          Date.now() - parsed.timestamp < TEAM_CACHE_TTL_MS &&
          Array.isArray(parsed.data) &&
          parsed.data.length > 0
        ) {
          return parsed.data;
        }
      }
    } catch {
      // Ignoruj błędy odczytu sessionStorage
    }
    return DEFAULT_TEAM_MEMBERS;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadTeam = async () => {
      try {
        const raw = sessionStorage.getItem(TEAM_PAGE_CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            Date.now() - parsed.timestamp < TEAM_CACHE_TTL_MS &&
            Array.isArray(parsed.data) &&
            parsed.data.length > 0
          ) {
            return;
          }
        }
      } catch {
        // Ignoruj błędy sessionStorage
      }

      setIsLoading(true);
      const endpoints = [
        'https://api.github.com/repos/SmartCampusOrg/SmartCampus/contributors?per_page=100',
        'https://api.github.com/repos/SmartCampusOrg/Smart-Campus-DevTools/contributors?per_page=100',
        'https://api.github.com/orgs/SmartCampusOrg/members?per_page=100',
      ];

      const results = await Promise.allSettled(
        endpoints.map((url) =>
          fetch(url).then((res) => (res.ok ? res.json() : []))
        )
      );

      const mergedMap = new Map();
      for (const res of results) {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          for (const item of res.value) {
            if (!item?.login || !item?.avatar_url) continue;
            if (item.type === 'Bot' || item.login.includes('[bot]')) continue;

            const existing = mergedMap.get(item.login);
            const sep = item.avatar_url.includes('?') ? '&' : '?';
            const contribCount =
              typeof item.contributions === 'number' ? item.contributions : 0;

            if (!existing) {
              mergedMap.set(item.login, {
                login: item.login,
                avatarUrl: `${item.avatar_url}${sep}s=240`,
                htmlUrl: item.html_url || `https://github.com/${item.login}`,
                contributions: contribCount > 0 ? contribCount : null,
              });
            } else if (contribCount > 0) {
              existing.contributions = (existing.contributions || 0) + contribCount;
            }
          }
        }
      }

      const sortedList = Array.from(mergedMap.values()).sort((a, b) => {
        if (a.login.toLowerCase() === 'bartlas05') return -1;
        if (b.login.toLowerCase() === 'bartlas05') return 1;
        return (b.contributions || 0) - (a.contributions || 0);
      });

      if (!isCancelled && sortedList.length > 0) {
        setMembers(sortedList);
        try {
          sessionStorage.setItem(
            TEAM_PAGE_CACHE_KEY,
            JSON.stringify({ timestamp: Date.now(), data: sortedList })
          );
        } catch {
          // Ignoruj błędy zapisu
        }
      }

      if (!isCancelled) {
        setIsLoading(false);
      }
    };

    loadTeam();
    return () => {
      isCancelled = true;
    };
  }, []);

  const scrollToMembers = () => {
    const el = document.getElementById('zespol-lista');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="TeamPage">
      <StartNavBar />

      <div className="TeamPage__container">
        <header className="TeamPage__topMeta">
          <div className="TeamPage__titleGroup">
            <FontAwesomeIcon icon={Icons.faUsers} className="TeamPage__icon" />
            <div>
              <h1>Nasz zespół</h1>
              <span className="TeamPage__subtitle">Smart Campus • KNIS</span>
            </div>
          </div>

          <div className="TeamPage__rightMeta">
            <div className="TeamPage__statPill">
              <FontAwesomeIcon icon={Icons.faGithub} />
              <span>{members.length} współtwórców na GitHub</span>
            </div>
          </div>
        </header>

        <section className="TeamPage__intro">
          <p className="TeamPage__lead">Studenci tworzący dla studentów.</p>
          <p className="TeamPage__introText">
            Smart Campus powstaje w ramach Koła Naukowego Informatyki Stosowanej (KNIS) przy
            Państwowej Akademii Nauk Stosowanych im. Ignacego Mościckiego w Ciechanowie.
            Tworzymy otwarte narzędzie, które porządkuje plan zajęć, mapę kampusu i aktualności
            wydziałowe w jednym spójnym miejscu.
          </p>
          <div className="TeamPage__ctaRow">
            <button
              type="button"
              className="TeamPage__ctaBtn"
              onClick={scrollToMembers}
            >
              Poznaj zespół
            </button>
            <img
              className="TeamPage__arrowsLeft"
              src={arrowsLeft}
              alt=""
              aria-hidden="true"
            />
          </div>
        </section>

        {/* Wyróżniona ciemna karta organizacji KNIS */}
        <section className="TeamSpotlightCard">
          <div className="TeamSpotlightCard__content">
            <span className="TeamSpotlightCard__eyebrow">KOŁO NAUKOWE INFORMATYKI STOSOWANEJ</span>
            <h2>Budujemy nowoczesny ekosystem uczelniany jako projekt Open Source</h2>
            <p>
              Każdy commit, projekt interfejsu i poprawka powstaje oddolnie — łącząc praktykę
              programistyczną z realnymi potrzebami studentów PANSIM w Ciechanowie i Mławie.
            </p>
            <div className="TeamSpotlightCard__tags">
              <span>React & PWA</span>
              <span>Firebase & Netlify</span>
              <span>Open Source</span>
            </div>
          </div>

          <div className="TeamSpotlightCard__aside">
            <img src={dots} alt="" aria-hidden="true" className="TeamSpotlightCard__dots" />
            <a
              href="https://github.com/SmartCampusOrg"
              target="_blank"
              rel="noopener noreferrer"
              className="TeamSpotlightCard__ghBtn"
            >
              <FontAwesomeIcon icon={Icons.faGithub} /> Organizacja GitHub ↗
            </a>
          </div>
        </section>

        {/* Siatka kart współtwórców */}
        <section id="zespol-lista" className="TeamMembersSection">
          <div className="TeamMembersSection__header">
            <div>
              <h2>Współtwórcy projektu</h2>
              <p>Lista pobierana automatycznie z organizacji SmartCampusOrg w serwisie GitHub.</p>
            </div>
            {isLoading && (
              <span className="TeamMembersSection__sync">Synchronizacja z GitHub...</span>
            )}
          </div>

          <div className="TeamMembersGrid">
            {members.map((member) => (
              <article key={member.login} className="TeamMemberCard">
                <div className="TeamMemberCard__banner" aria-hidden="true" />
                <div className="TeamMemberCard__avatarWrap">
                  <img
                    src={member.avatarUrl}
                    alt={`Awatar ${member.login}`}
                    className="TeamMemberCard__avatar"
                    loading="lazy"
                  />
                </div>

                <div className="TeamMemberCard__body">
                  <h3>{member.login}</h3>
                  <span className="TeamMemberCard__handle">@{member.login}</span>

                  <div className="TeamMemberCard__badges">
                    <span className="TeamMemberCard__roleBadge">
                      {member.login.toLowerCase() === 'bartlas05'
                        ? 'Project Manager'
                        : member.login === 'SmartCampusPANSIM'
                          ? 'Konto projektu'
                          : 'Współtwórca'}
                    </span>
                    {member.contributions && (
                      <span className="TeamMemberCard__contribBadge">
                        {formatCommitsLabel(member.contributions)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="TeamMemberCard__footer">
                  <a
                    href={member.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="TeamMemberCard__link"
                  >
                    <FontAwesomeIcon icon={Icons.faGithub} /> Profil GitHub ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Osobna sekcja: 3 filary naszej pracy */}
        <section className="TeamPillarsSection">
          <div className="TeamPillarsSection__header">
            <h2>Jak pracujemy</h2>
            <p>Kluczowe zasady, którymi kierujemy się przy rozwijaniu Smart Campus.</p>
          </div>

          <div className="TeamPillars">
            <article className="TeamPillarCard">
              <div className="TeamPillarCard__icon">
                <FontAwesomeIcon icon={Icons.faLaptopCode} />
              </div>
              <h3>Nowoczesny kod</h3>
              <p>
                Rozwijamy aplikację w React 19, Vite PWA oraz bezserwerowych funkcjach Netlify,
                dbając o szybkość i pracę offline.
              </p>
            </article>

            <article className="TeamPillarCard">
              <div className="TeamPillarCard__icon">
                <FontAwesomeIcon icon={Icons.faPalette} />
              </div>
              <h3>Spójny design</h3>
              <p>
                Projektujemy czytelne widoki pod komputery, tablety i smartfony, z dopracowanym
                trybem jasnym, ciemnym i dostępnością.
              </p>
            </article>

            <article className="TeamPillarCard">
              <div className="TeamPillarCard__icon">
                <FontAwesomeIcon icon={Icons.faGraduationCap} />
              </div>
              <h3>Dla społeczności</h3>
              <p>
                Słuchamy uwag studentów — każdy może zgłosić błąd lub zaproponować nową funkcję
                bezpośrednio z poziomu aplikacji.
              </p>
            </article>
          </div>
        </section>

        {/* Zaproszenie do współpracy */}
        <section className="TeamJoinBanner">
          <div>
            <h2>Masz pomysł lub chcesz dołączyć do KNIS?</h2>
            <p>
              Niezależnie od tego, czy kodujesz, projektujesz UI, czy chcesz podzielić się pomysłem
              na usprawnienie Smart Campus — daj nam znać.
            </p>
          </div>
          <div className="TeamJoinBanner__actions">
            <Link to="/ZglosBlad" className="TeamJoinBanner__primary">
              <FontAwesomeIcon icon={Icons.faWorm} /> Zgłoś pomysł lub błąd
            </Link>
            <a
              href="mailto:smartcampuspansim@gmail.com"
              className="TeamJoinBanner__secondary"
            >
              Napisz do nas
            </a>
          </div>
        </section>

        <footer className="TeamBottomCard">
          <strong>KNIS — Koło Naukowe Informatyki Stosowanej</strong>
          <span>Smart Campus • PANSIM w Ciechanowie</span>
          <Link to="/Start" className="TeamBottomCard__backLink">
            ← Wróć na stronę startową
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default NaszZespol;
