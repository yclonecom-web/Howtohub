import { Link } from 'react-router-dom';
import { Bookmark, Heart, MessageCircle, Pin } from 'lucide-react';
import MediaRenderer from './MediaRenderer.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatNumber, getTagClass, timeAgo } from '../utils/helpers.js';

export default function PostCard({ content }) {
  const {
    isLiked,
    isBookmarked,
    isPinned,
    toggleLike,
    toggleBookmark,
    togglePin,
    getLikeCount,
    getViewCount,
    getComments,
    showToast,
  } = useApp();

  if (!content) return null;
  const { id, type, title, preview, author, tags = [], direction } = content;

  const liked = isLiked(id);
  const bookmarked = isBookmarked(id);
  const pinned = isPinned(id) || content.pinned;

  return (
    <article className={`post-card post-type-${type || 'blog'}`}>
      <header className="post-card-head">
        <div className="post-author">
          <div className="avatar">{author?.initials || 'YU'}</div>
          <div>
            <div className="post-author-name">{author?.name || 'Unknown'}</div>
            <div className="post-meta">
              @{author?.username || 'user'} · {timeAgo(content.timestamp || content.date)}
            </div>
          </div>
        </div>
        <button
          type="button"
          className={`icon-btn ${pinned ? 'is-active' : ''}`}
          onClick={() => {
            togglePin(id);
            showToast(pinned ? 'Unpinned' : 'Pinned to top');
          }}
          aria-label={pinned ? 'Unpin post' : 'Pin post'}
        >
          <Pin size={16} />
        </button>
      </header>

      <Link to={`/content/${id}`} className="post-card-body" aria-label={`Open ${title}`}>
        <h2 className="post-title">{title}</h2>
        {preview ? <p className="post-preview">{preview}</p> : null}
      </Link>

      <div className="post-media">
        <MediaRenderer
          type={type}
          media={content.media || []}
          direction={direction || 'left'}
          cover={{ gradient: content.coverGradient, icon: content.coverIcon }}
          coverImage={content.coverImage}
          title={title}
        />
      </div>

      {tags.length > 0 ? (
        <div className="post-tags">
          {tags.map((t) => (
            <span key={t} className={`tag ${getTagClass(t)}`}>
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <footer className="post-actions">
        <button
          type="button"
          className={`action-btn ${liked ? 'is-active' : ''}`}
          onClick={() => toggleLike(id)}
          aria-pressed={liked}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>{formatNumber(getLikeCount(id))}</span>
        </button>
        <Link to={`/content/${id}`} className="action-btn" aria-label="View comments">
          <MessageCircle size={16} />
          <span>{formatNumber(getComments(id).length)}</span>
        </Link>
        <button
          type="button"
          className={`action-btn ${bookmarked ? 'is-active' : ''}`}
          onClick={() => {
            toggleBookmark(id);
            showToast(bookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
          }}
          aria-pressed={bookmarked}
        >
          <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
          <span>{bookmarked ? 'Saved' : 'Save'}</span>
        </button>
        <span className="action-btn action-views" aria-label="Views">
          {formatNumber(getViewCount(id))} views
        </span>
      </footer>
    </article>
  );
}
