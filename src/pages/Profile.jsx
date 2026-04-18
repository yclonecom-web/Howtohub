import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatNumber } from '../utils/helpers.js';

const TABS = [
  { key: 'posts', label: 'Posts' },
  { key: 'liked', label: 'Liked' },
  { key: 'bookmarks', label: 'Saved' },
];

export default function Profile() {
  const { username } = useParams();
  const { currentUser, setCurrentUser, allContent, users, likes, bookmarks, isFollowing, toggleFollow } =
    useApp();
  const [tab, setTab] = useState('posts');

  const profile = useMemo(() => {
    if (!username || username === currentUser.username) return currentUser;
    return users.find((u) => u.username === username) || currentUser;
  }, [username, users, currentUser]);

  const isMe = !username || username === currentUser.username;

  const posts = useMemo(() => {
    return allContent.filter((c) => c.author?.username === profile.username);
  }, [allContent, profile.username]);

  const likedPosts = useMemo(() => allContent.filter((c) => likes[c.id]), [allContent, likes]);
  const savedPosts = useMemo(() => allContent.filter((c) => bookmarks[c.id]), [allContent, bookmarks]);

  const active = tab === 'liked' ? likedPosts : tab === 'bookmarks' ? savedPosts : posts;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: currentUser.name, bio: currentUser.bio });

  const saveProfile = (e) => {
    e.preventDefault();
    const initials = form.name
      .split(/\s+/)
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'YU';
    setCurrentUser({ ...currentUser, name: form.name, bio: form.bio, initials });
    setEditing(false);
  };

  return (
    <main className="profile">
      <header className="profile-head">
        <div className="avatar avatar-xl">{profile.initials}</div>
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <p className="post-meta">@{profile.username}</p>
          {profile.bio ? <p className="profile-bio">{profile.bio}</p> : null}
          <div className="profile-stats">
            <span>
              <strong>{formatNumber(posts.length || profile.posts)}</strong> posts
            </span>
            <span>
              <strong>{formatNumber(profile.followers)}</strong> followers
            </span>
            <span>
              <strong>{formatNumber(profile.following)}</strong> following
            </span>
          </div>
          <div className="profile-actions">
            {isMe ? (
              <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
                Edit profile
              </button>
            ) : (
              <button
                type="button"
                className={`btn ${isFollowing(profile.username) ? 'btn-ghost' : 'btn-primary'}`}
                onClick={() => toggleFollow(profile.username)}
              >
                {isFollowing(profile.username) ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="tab-bar" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`tab ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="feed">
        {active.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing here yet</h3>
            <p>Content will appear once you create or interact with posts.</p>
          </div>
        ) : (
          active.map((c) => <PostCard key={c.id} content={c} />)
        )}
      </section>

      {editing ? (
        <div className="modal-backdrop" onClick={() => setEditing(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={saveProfile}>
            <h2>Edit profile</h2>
            <label>
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>
            <label>
              Bio
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </label>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
