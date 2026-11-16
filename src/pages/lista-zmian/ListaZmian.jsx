import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import ReactMarkdown from 'react-markdown';
import StartNavBar from '@components/StartNavBar/StartNavBar';
import arrowsLeft from '@pages/start/arrows_left.png';
import './ListaZmian.css';

const CACHE_KEY = 'smartcampus_releases_cache_v1';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minut

function formatReleaseDate(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Usuwa duplikujący się nagłówek "# Smart Campus vX.Y.Z" z treści Markdown
function cleanMarkdownBody(rawBody, stripTopHeading = false) {
  if (!rawBody) return 'Brak opisu dla tego wydania.';
  let cleaned = rawBody.replace(/\r\n/g, '\n');
  if (stripTopHeading) {
    cleaned = cleaned.replace(/^#\s+Smart Campus[^\n]*\n+/i, '');
  }
  return cleaned.trim();
}

function ListaZmian() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [releases, setReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReleases = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    if (!forceRefresh) {
      try {
        const cachedRaw = sessionStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (Date.now() - cached.timestamp < CACHE_TTL_MS && Array.isArray(cached.data)) {
            setReleases(cached.data);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Ignoruj błędy odczytu sessionStorage
      }
    }

    try {
      const response = await fetch('https://api.github.com/repos/SmartCampusOrg/SmartCampus/releases');
      if (!response.ok) {
        throw new Error(`Błąd serwera GitHub (HTTP ${response.status})`);
      }
      const data = await response.json();
      setReleases(data);
      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data })
        );
      } catch {
        // Ignoruj błędy limitu sessionStorage
      }
    } catch (err) {
      console.error('Błąd pobierania wydań z GitHuba:', err);
      setError('Nie udało się pobrać historii zmian z GitHuba. Sprawdź połączenie lub spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(user ? '/Panel' : '/Start');
    }
  };

  const scrollToTimeline = () => {
    const el = document.getElementById('lista-zmian-os');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const latestReleaseDate = releases[0]?.published_at
    ? formatReleaseDate(releases[0].published_at)
    : 'Ładowanie...';

  return (
    <main className="ChangelogPage ChangelogPage--public">
      <StartNavBar />

      <div className="ChangelogPage__container">
        <header className="ChangelogPage__topMeta">
          <div className="ChangelogPage__titleGroup">
            <FontAwesomeIcon icon={Icons.faClock} className="ChangelogPage__icon" />
            <div>
              <h1>Historia zmian</h1>
              <span className="ChangelogPage__subtitle">Smart Campus</span>
            </div>
          </div>

          <div className="ChangelogPage__rightMeta">
            <button
              type="button"
              className="ChangelogPage__backBtn"
              onClick={handleBack}
            >
              <FontAwesomeIcon icon={Icons.faArrowLeft} /> Wstecz
            </button>
            <div className="ChangelogPage__updated">
              <span>Ostatnie wydanie</span>
              <strong>{latestReleaseDate}</strong>
            </div>
          </div>
        </header>

        <section className="ChangelogPage__intro">
          <p className="ChangelogPage__lead">Wszystkie nowości w jednym miejscu.</p>
          <p className="ChangelogPage__introText">
            Śledź rozwój aplikacji Smart Campus — od najnowszych funkcji po drobne poprawki
            i usprawnienia interfejsu. Najnowsze wydania są otwarte na górze osi czasu, a starsze
            możesz wygodnie rozwinąć poniżej.
          </p>
          <div className="ChangelogPage__ctaRow">
            <button
              type="button"
              className="ChangelogPage__ctaBtn"
              onClick={scrollToTimeline}
            >
              Zobacz wydania
            </button>
            <img
              className="ChangelogPage__arrowsLeft"
              src={arrowsLeft}
              alt=""
              aria-hidden="true"
            />
          </div>
        </section>

        <div id="lista-zmian-os" className="ChangelogPage__timelineWrap">
          {isLoading ? (
            <div className="ChangelogPage__statusBox">
              <div className="ChangelogPage__spinner" />
              <p>Pobieranie historii wydań z repozytorium GitHub...</p>
            </div>
          ) : error ? (
            <div className="ChangelogPage__statusBox">
              <p>{error}</p>
              <button
                type="button"
                className="ChangelogPage__ctaBtn"
                onClick={() => fetchReleases(true)}
              >
                Spróbuj ponownie
              </button>
            </div>
          ) : releases.length === 0 ? (
            <div className="ChangelogPage__statusBox">
              <p>Brak opublikowanych aktualizacji.</p>
            </div>
          ) : (
            <div className="ChangelogTimeline">
              {releases.map((rel, idx) => {
                const isRecent = idx < 2;
                const versionLabel = rel.name || rel.tag_name;
                const dateLabel = formatReleaseDate(rel.published_at);
                const channelLabel = rel.prerelease ? 'Kanał BETA' : 'Wydanie stabilne';

                return (
                  <div
                    key={rel.id}
                    className={`ChangelogTimeline__row ${
                      !isRecent ? 'ChangelogTimeline__row--archive' : ''
                    }`}
                  >
                    <aside className="ChangelogTimeline__meta">
                      <div className="ChangelogTimeline__versionRow">
                        <span className="ChangelogTimeline__tag">{versionLabel}</span>
                        {idx === 0 && (
                          <span className="ChangelogTimeline__latestBadge">Najnowsze</span>
                        )}
                      </div>
                      <time className="ChangelogTimeline__date">{dateLabel}</time>
                      <span className="ChangelogTimeline__channel">{channelLabel}</span>
                    </aside>

                    <div className="ChangelogTimeline__rail" aria-hidden="true">
                      <span
                        className={`ChangelogTimeline__dot ${
                          idx === 0 ? 'ChangelogTimeline__dot--active' : ''
                        }`}
                      />
                    </div>

                    {isRecent ? (
                      <article className="ChangelogTimeline__card">
                        <div className="markdown_body">
                          <ReactMarkdown>{cleanMarkdownBody(rel.body, true)}</ReactMarkdown>
                        </div>
                        {rel.html_url && (
                          <div className="ChangelogTimeline__cardFooter">
                            <a
                              href={rel.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ChangelogTimeline__ghLink"
                            >
                              <FontAwesomeIcon icon={Icons.faGithub} /> Zobacz wydanie na GitHubie ↗
                            </a>
                          </div>
                        )}
                      </article>
                    ) : (
                      <details className="ChangelogTimeline__details">
                        <summary className="ChangelogTimeline__summary">
                          <div className="ChangelogTimeline__summaryLeft">
                            <span className="ChangelogTimeline__summaryTitle">
                              Smart Campus {versionLabel}
                            </span>
                            <span className="ChangelogTimeline__summarySub">
                              {dateLabel} • {channelLabel}
                            </span>
                          </div>
                          <span className="ChangelogTimeline__chevron" aria-hidden="true">
                            <FontAwesomeIcon icon={Icons.faChevronDown} />
                          </span>
                        </summary>

                        <div className="ChangelogTimeline__detailsBody">
                          <div className="markdown_body">
                            <ReactMarkdown>{cleanMarkdownBody(rel.body, true)}</ReactMarkdown>
                          </div>
                          {rel.html_url && (
                            <div className="ChangelogTimeline__cardFooter">
                              <a
                                href={rel.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ChangelogTimeline__ghLink"
                              >
                                <FontAwesomeIcon icon={Icons.faGithub} /> Zobacz wydanie na GitHubie ↗
                              </a>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer className="ChangelogBottomCard">
          <strong>Repozytorium: SmartCampusOrg/SmartCampus</strong>
          <span>Smart Campus • PANSIM w Ciechanowie</span>
          <Link to={user ? '/Panel' : '/Start'} className="ChangelogBottomCard__backLink">
            {user ? '← Wróć do panelu' : '← Wróć na stronę startową'}
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default ListaZmian;
