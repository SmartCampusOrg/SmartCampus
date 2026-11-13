import React, { useState, useEffect, useMemo, useCallback } from 'react';
import wieAvatar from '../landing-page/building.webp';
import wnozinsAvatar from '@/assets/img/wnm.webp';
import wntsAvatar from '@/assets/img/wnt.jpg';
import './Feed.css';

const FEED_CACHE_KEY = 'smart_campus_feed_cache_v1';

const FACULTY_AVATARS = {
  wie: wieAvatar,
  wnozins: wnozinsAvatar,
  wnts: wntsAvatar
};

const FACULTY_FILTERS = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'wie', label: 'WIE' },
  { id: 'wnozins', label: 'WNoZiNS' },
  { id: 'wnts', label: 'WNTS' }
];

function formatRelativeTime(isoDate) {
  if (!isoDate) return '';
  const ts = Date.parse(isoDate);
  if (Number.isNaN(ts)) return '';

  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'przed chwilą';
  if (diffMin < 60) return `${diffMin} min temu`;
  if (diffHours < 24) return `${diffHours} godz. temu`;
  if (diffDays === 1) return 'wczoraj';
  if (diffDays < 7) return `${diffDays} dni temu`;

  const date = new Date(ts);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {})
  });
}

function formatFullDate(isoDate) {
  if (!isoDate) return '';
  const ts = Date.parse(isoDate);
  if (Number.isNaN(ts)) return '';
  return new Date(ts).toLocaleString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function Feed() {
  const [posts, setPosts] = useState(() => {
    try {
      const cached = localStorage.getItem(FEED_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.posts)) return parsed.posts;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [isLoading, setIsLoading] = useState(() => posts.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [brokenImages, setBrokenImages] = useState(() => new Set());

  const loadFeed = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else if (posts.length === 0) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res = await fetch('/api/feed');
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.success || !Array.isArray(data.posts)) {
        throw new Error(data?.error || 'Nie udało się pobrać aktualności z uczelni.');
      }

      setPosts(data.posts);
      try {
        localStorage.setItem(FEED_CACHE_KEY, JSON.stringify({
          fetchedAt: data.fetchedAt,
          posts: data.posts
        }));
      } catch {
        // ignore storage quota errors
      }
    } catch (err) {
      setError(err.message || 'Błąd połączenia z serwerem aktualności.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [posts.length]);

  useEffect(() => {
    loadFeed(false);
  }, []);

  const filteredPosts = useMemo(() => {
    if (selectedFaculty === 'all') return posts;
    return posts.filter(post => post.facultyId === selectedFaculty);
  }, [posts, selectedFaculty]);

  const handleImageError = (postId) => {
    setBrokenImages(prev => {
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
  };

  return (
    <div className="feed_page">
      <div className="feed_container">
        <header className="feed_header">
          <div className="feed_header_texts">
            <h1 className="feed_title">Aktualności</h1>
            <p className="feed_subtitle">Wpisy ze stron wydziałowych PANSIM w porządku chronologicznym</p>
          </div>

          <button
            type="button"
            className="feed_refresh_btn"
            onClick={() => loadFeed(true)}
            disabled={isRefreshing || isLoading}
            aria-label="Odśwież aktualności"
            title="Odśwież aktualności"
          >
            <svg
              className={`feed_refresh_icon ${isRefreshing ? 'spin' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{isRefreshing ? 'Odświeżanie...' : 'Odśwież'}</span>
          </button>
        </header>

        <nav className="feed_filter_bar" aria-label="Filtruj według wydziału">
          {FACULTY_FILTERS.map((filter) => {
            const count = filter.id === 'all'
              ? posts.length
              : posts.filter(p => p.facultyId === filter.id).length;

            return (
              <button
                key={filter.id}
                type="button"
                className={`feed_filter_pill ${selectedFaculty === filter.id ? 'active' : ''}`}
                onClick={() => setSelectedFaculty(filter.id)}
              >
                <span>{filter.label}</span>
                {posts.length > 0 && <span className="feed_filter_count">{count}</span>}
              </button>
            );
          })}
        </nav>

        {error && (
          <div className="feed_error_banner" role="status">
            <span>{error}</span>
            <button type="button" className="feed_error_retry" onClick={() => loadFeed(true)}>
              Spróbuj ponownie
            </button>
          </div>
        )}

        {isLoading && posts.length === 0 ? (
          <div className="feed_timeline" aria-busy="true" aria-label="Ładowanie aktualności">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="feed_post_card feed_skeleton_card">
                <div className="feed_skeleton_avatar" />
                <div className="feed_skeleton_body">
                  <div className="feed_skeleton_line short" />
                  <div className="feed_skeleton_line medium" />
                  <div className="feed_skeleton_line long" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="feed_empty_state">
            <p className="feed_empty_title">Brak aktualności do wyświetlenia</p>
            <p className="feed_empty_desc">
              Spróbuj wybrać inny wydział lub odśwież listę.
            </p>
          </div>
        ) : (
          <div className="feed_timeline">
            {filteredPosts.map((post) => {
              const avatarSrc = FACULTY_AVATARS[post.facultyId] || wieAvatar;
              const showImage = Boolean(post.image) && !brokenImages.has(post.id);

              return (
                <article key={post.id} className="feed_post_card">
                  <div className="feed_post_avatar_col">
                    <img
                      src={avatarSrc}
                      alt={post.facultyName}
                      className="feed_post_avatar"
                      loading="lazy"
                    />
                  </div>

                  <div className="feed_post_body">
                    <div className="feed_post_meta">
                      <span className="feed_post_author">{post.facultyName}</span>
                      <span className="feed_post_handle">{post.facultyHandle}</span>
                      {post.publishedAt && (
                        <>
                          <span className="feed_post_dot" aria-hidden="true">·</span>
                          <time
                            className="feed_post_time"
                            dateTime={post.publishedAt}
                            title={formatFullDate(post.publishedAt)}
                          >
                            {formatRelativeTime(post.publishedAt)}
                          </time>
                        </>
                      )}
                    </div>

                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="feed_post_title_link"
                    >
                      <h2 className="feed_post_title">{post.title}</h2>
                    </a>

                    {post.excerpt && (
                      <p className="feed_post_excerpt">{post.excerpt}</p>
                    )}

                    {showImage && (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="feed_post_media_link"
                      >
                        <img
                          src={post.image}
                          alt={post.title}
                          className="feed_post_media_img"
                          loading="lazy"
                          decoding="async"
                          onError={() => handleImageError(post.id)}
                        />
                      </a>
                    )}

                    <div className="feed_post_footer">
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="feed_post_read_link"
                      >
                        <span>Czytaj na pansim.edu.pl</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;
