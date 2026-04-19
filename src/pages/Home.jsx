import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Flame, Sparkles } from 'lucide-react';
import PostCard from '../components/PostCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { getRecommendations, getRecommendedUsers, getTrending } from '../utils/recommendation.js';

const FILTERS = ['All', 'Pinned', 'Tech', 'Design', 'DIY', 'Education', 'Cooking', 'Fitness', 'Finance'];

export default function Home() {
  const {
    allContent,
    users,
    likes,
    bookmarks,
    viewHistory,
    toggleFollow,
    isFollowing,
    getPinnedContent,
    following,
  } = useApp();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState('All');
  const search = params.get('q')?.trim().toLowerCase() || '';

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [filter, search]);

  const feed = useMemo(() => {
    let list = allContent;
    if (filter === 'Pinned') {
      list = getPinnedContent();
    } else if (filter !== 'All') {
      list = list.filter((c) => (c.tags || []).includes(filter));
    }
    if (search) {
      list = list.filter((c) => {
        const hay = `${c.title} ${c.preview || ''} ${(c.tags || []).join(' ')} ${c.author?.name || ''}`.toLowerCase();
        return hay.includes(search);
      });
    }
    // Pinned posts first
    return [...list].sort((a, b) => {
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      return bp - ap;
    });
  }, [allContent, filter, search, getPinnedContent]);

  const state = { likes, bookmarks, viewHistory, following };
  const recommendations = useMemo(
    () => getRecommendations(allContent, state, { limit: 4 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allContent, likes, bookmarks, viewHistory, following],
  );
  const trending = useMemo(() => getTrending(allContent, 4), [allContent]);
  const suggestedUsers = useMemo(
    () => getRecommendedUsers(allContent, users, state, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allContent, users, likes, bookmarks, viewHistory, following],
  );

  return (
    <main className="home">
      <section className="home-hero">
        <h1>Discover. Learn. Create.</h1>
        <p>Tutorials, visuals, and real-world how-tos from makers like you.</p>
      </section>

      <div className="filter-bar" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={`chip ${filter === f ? 'is-active' : ''}`}
            onClick={() => {
              setFilter(f);
              if (search) {
                setParams({});
              }
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {search ? (
        <div className="search-banner">
          Showing results for <strong>&ldquo;{search}&rdquo;</strong>
          <button
            type="button"
            className="link-btn"
            onClick={() => setParams({})}
          >
            Clear
          </button>
        </div>
      ) : null}

      <div className="home-layout">
        <section className="feed" aria-label="Content feed">
          {feed.length === 0 ? (
            <div className="empty-state">
              <h3>No content found</h3>
              <p>Try a different filter or upload something new.</p>
              <Link to="/upload" className="btn btn-primary">
                Upload content
              </Link>
            </div>
          ) : (
            feed.map((c) => <PostCard key={c.id} content={c} />)
          )}
        </section>

        <aside className="sidebar" aria-label="Recommended">
          <div className="sidebar-section">
            <h3>
              <Sparkles size={16} /> Recommended for you
            </h3>
            <ul className="sidebar-list">
              {recommendations.map((c) => (
                <li key={c.id}>
                  <Link to={`/content/${c.id}`} className="sidebar-link">
                    <span className="sidebar-dot" style={{ background: c.coverGradient }} />
                    <span>
                      <strong>{c.title}</strong>
                      <small>@{c.author?.username}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>
              <Flame size={16} /> Trending
            </h3>
            <ul className="sidebar-list">
              {trending.map((c) => (
                <li key={c.id}>
                  <Link to={`/content/${c.id}`} className="sidebar-link">
                    <span className="sidebar-dot" style={{ background: c.coverGradient }} />
                    <span>
                      <strong>{c.title}</strong>
                      <small>{(c.views || 0).toLocaleString()} views</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>Suggested creators</h3>
            <ul className="sidebar-list">
              {suggestedUsers.map((u) => (
                <li key={u.username} className="user-row">
                  <div className="avatar avatar-sm">{u.initials}</div>
                  <div className="user-row-body">
                    <strong>{u.name}</strong>
                    <small>@{u.username}</small>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-tiny ${isFollowing(u.username) ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={() => toggleFollow(u.username)}
                  >
                    {isFollowing(u.username) ? 'Following' : 'Follow'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
