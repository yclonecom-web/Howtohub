import { useApp } from '../context/AppContext.jsx';

export default function Settings() {
  const {
    currentUser,
    setCurrentUser,
    theme,
    toggleTheme,
    notifications,
    setNotification,
    privacy,
    setPrivacy,
    showToast,
  } = useApp();

  const exportData = () => {
    const data = {
      user: currentUser,
      likes: JSON.parse(localStorage.getItem('howtohub_likes') || '{}'),
      bookmarks: JSON.parse(localStorage.getItem('howtohub_bookmarks') || '{}'),
      userContent: JSON.parse(localStorage.getItem('howtohub_user_content') || '[]'),
      comments: JSON.parse(localStorage.getItem('howtohub_comments') || '{}'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'howtohub-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported');
  };

  const clearData = () => {
    if (!confirm('Clear all local data? This cannot be undone.')) return;
    [
      'howtohub_likes',
      'howtohub_bookmarks',
      'howtohub_comments',
      'howtohub_pins',
      'howtohub_following',
      'howtohub_views',
      'howtohub_user_content',
      'howtohub_drafts',
    ].forEach((k) => localStorage.removeItem(k));
    showToast('Local data cleared — refresh to reset');
  };

  return (
    <main className="settings">
      <header className="page-head">
        <h1>Settings</h1>
      </header>

      <section className="settings-section">
        <h2>Profile</h2>
        <label>
          Name
          <input
            type="text"
            value={currentUser.name}
            onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
          />
        </label>
        <label>
          Username
          <input
            type="text"
            value={currentUser.username}
            onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
          />
        </label>
        <label>
          Bio
          <textarea
            rows={3}
            value={currentUser.bio}
            onChange={(e) => setCurrentUser({ ...currentUser, bio: e.target.value })}
          />
        </label>
      </section>

      <section className="settings-section">
        <h2>Appearance</h2>
        <div className="settings-row">
          <div>
            <strong>Theme</strong>
            <p>Switch between light and dark mode.</p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={toggleTheme}>
            {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>Notifications</h2>
        {[
          ['email', 'Email updates'],
          ['push', 'Push notifications'],
          ['updates', 'Product announcements'],
        ].map(([key, label]) => (
          <label key={key} className="settings-toggle">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={!!notifications[key]}
              onChange={(e) => setNotification(key, e.target.checked)}
            />
          </label>
        ))}
      </section>

      <section className="settings-section">
        <h2>Privacy</h2>
        {[
          ['profilePublic', 'Make profile public'],
          ['showActivity', 'Show activity to followers'],
        ].map(([key, label]) => (
          <label key={key} className="settings-toggle">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={!!privacy[key]}
              onChange={(e) => setPrivacy(key, e.target.checked)}
            />
          </label>
        ))}
      </section>

      <section className="settings-section">
        <h2>Your data</h2>
        <div className="settings-row">
          <div>
            <strong>Export data</strong>
            <p>Download a JSON copy of your local data.</p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={exportData}>
            Export
          </button>
        </div>
        <div className="settings-row">
          <div>
            <strong>Clear local data</strong>
            <p>Remove likes, bookmarks, drafts, and user posts on this device.</p>
          </div>
          <button type="button" className="btn btn-danger" onClick={clearData}>
            Clear
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>About</h2>
        <p>HowToHub — discover, learn, and create. Version 2.0 (React).</p>
      </section>
    </main>
  );
}
