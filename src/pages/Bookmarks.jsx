import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function Bookmarks() {
  const { getBookmarkedContent } = useApp();
  const all = getBookmarkedContent();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');

  const filtered = useMemo(() => {
    let list = all;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        `${c.title} ${(c.tags || []).join(' ')} ${c.author?.name || ''}`.toLowerCase().includes(q),
      );
    }
    if (sort === 'popular') {
      list = [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sort === 'alpha') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime(),
      );
    }
    return list;
  }, [all, search, sort]);

  return (
    <main className="bookmarks">
      <header className="page-head">
        <h1>Saved content</h1>
        <p>Your bookmarked tutorials, galleries, and broadcasts.</p>
      </header>

      <div className="filter-bar">
        <input
          type="search"
          className="input"
          placeholder="Search saved…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recent">Recently added</option>
          <option value="popular">Most popular</option>
          <option value="alpha">A–Z</option>
        </select>
      </div>

      <section className="feed">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No saved content yet</h3>
            <p>Bookmark posts from the feed and they&rsquo;ll show up here.</p>
            <Link to="/" className="btn btn-primary">
              Browse feed
            </Link>
          </div>
        ) : (
          filtered.map((c) => <PostCard key={c.id} content={c} />)
        )}
      </section>
    </main>
  );
}
