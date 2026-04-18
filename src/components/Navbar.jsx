import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bookmark, Home, Moon, Search, Settings, Sun, Upload, User } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useState } from 'react';

export default function Navbar() {
  const { theme, toggleTheme } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo" aria-hidden="true">H</span>
          <span className="navbar-title">HowToHub</span>
        </Link>

        <form className="navbar-search" onSubmit={onSearch} role="search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search tutorials, topics, creators…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search content"
          />
        </form>

        <div className="navbar-actions">
          <NavLink to="/" className="nav-icon" aria-label="Home" end>
            <Home size={20} />
          </NavLink>
          <NavLink to="/upload" className="nav-icon nav-icon-primary" aria-label="Upload">
            <Upload size={20} />
          </NavLink>
          <NavLink to="/bookmarks" className="nav-icon" aria-label="Bookmarks">
            <Bookmark size={20} />
          </NavLink>
          <NavLink to="/profile" className="nav-icon" aria-label="Profile">
            <User size={20} />
          </NavLink>
          <NavLink to="/settings" className="nav-icon" aria-label="Settings">
            <Settings size={20} />
          </NavLink>
          <button
            type="button"
            className="nav-icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
