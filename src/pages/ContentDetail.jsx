import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bookmark, Heart, Send } from 'lucide-react';
import MediaRenderer from '../components/MediaRenderer.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatNumber, getTagClass, timeAgo } from '../utils/helpers.js';
import { getSimilarContent } from '../utils/recommendation.js';

export default function ContentDetail() {
  const { id } = useParams();
  const {
    allContent,
    getContentById,
    isLiked,
    isBookmarked,
    toggleLike,
    toggleBookmark,
    getLikeCount,
    getViewCount,
    getComments,
    addComment,
    recordView,
    showToast,
  } = useApp();

  const content = getContentById(id);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (content) recordView(content.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const similar = useMemo(
    () => (content ? getSimilarContent(allContent, content.id, 3) : []),
    [allContent, content],
  );

  if (!content) {
    return (
      <main className="detail empty-state">
        <h2>Content not found</h2>
        <Link to="/" className="btn btn-primary">
          Back to feed
        </Link>
      </main>
    );
  }

  const liked = isLiked(content.id);
  const bookmarked = isBookmarked(content.id);
  const comments = getComments(content.id);

  const onComment = (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    addComment(content.id, text);
    setCommentText('');
    showToast('Comment added');
  };

  return (
    <main className="detail">
      <article className="detail-article">
        <header className="detail-head">
          <div className="post-author">
            <div className="avatar">{content.author?.initials}</div>
            <div>
              <div className="post-author-name">{content.author?.name}</div>
              <div className="post-meta">
                @{content.author?.username} · {timeAgo(content.timestamp || content.date)} ·{' '}
                {formatNumber(getViewCount(content.id))} views
              </div>
            </div>
          </div>
          <h1>{content.title}</h1>
          {(content.tags || []).length > 0 ? (
            <div className="post-tags">
              {content.tags.map((t) => (
                <span key={t} className={`tag ${getTagClass(t)}`}>
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div className="detail-media">
          <MediaRenderer
            type={content.type}
            media={content.media || []}
            direction={content.direction || 'left'}
            cover={{ gradient: content.coverGradient, icon: content.coverIcon }}
            title={content.title}
          />
        </div>

        {content.body ? (
          <div className="detail-body" dangerouslySetInnerHTML={{ __html: content.body }} />
        ) : null}

        <div className="detail-actions">
          <button
            type="button"
            className={`btn btn-ghost ${liked ? 'is-active' : ''}`}
            onClick={() => toggleLike(content.id)}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />{' '}
            {formatNumber(getLikeCount(content.id))}
          </button>
          <button
            type="button"
            className={`btn btn-ghost ${bookmarked ? 'is-active' : ''}`}
            onClick={() => {
              toggleBookmark(content.id);
              showToast(bookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
            }}
          >
            <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />{' '}
            {bookmarked ? 'Saved' : 'Save'}
          </button>
        </div>
      </article>

      <section className="detail-comments">
        <h2>Comments ({comments.length})</h2>
        <form className="comment-form" onSubmit={onComment}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts…"
            aria-label="Add a comment"
          />
          <button type="submit" className="btn btn-primary">
            <Send size={14} /> Post
          </button>
        </form>
        <ul className="comment-list">
          {comments.map((c, i) => (
            <li key={i} className="comment">
              <div className="avatar avatar-sm">{c.initials || c.author?.slice(0, 2).toUpperCase()}</div>
              <div>
                <div>
                  <strong>{c.author}</strong> <small>{c.time}</small>
                </div>
                <p>{c.text}</p>
              </div>
            </li>
          ))}
          {comments.length === 0 ? <p className="empty-state">Be the first to comment.</p> : null}
        </ul>
      </section>

      {similar.length > 0 ? (
        <section className="detail-similar">
          <h2>Similar content</h2>
          <div className="similar-grid">
            {similar.map((c) => (
              <Link key={c.id} to={`/content/${c.id}`} className="similar-card">
                <div
                  className="similar-cover"
                  style={{ background: c.coverGradient }}
                  aria-hidden="true"
                />
                <div>
                  <strong>{c.title}</strong>
                  <small>@{c.author?.username}</small>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
