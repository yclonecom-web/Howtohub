import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import MediaRenderer from '../components/MediaRenderer.jsx';
import { useApp } from '../context/AppContext.jsx';
import { savePost, validatePost } from '../services/api.js';
import { CONTENT_TEMPLATES, applyTemplate } from '../utils/templates.js';
import { TAG_OPTIONS } from '../utils/sampleData.js';

const TYPES = [
  { key: 'blog', label: 'Blog post' },
  { key: 'image', label: 'Single image' },
  { key: 'carousel', label: 'Carousel' },
  { key: 'video', label: 'Video' },
  { key: 'audio', label: 'Audio' },
  { key: 'document', label: 'Document' },
  { key: 'broadcast', label: 'Broadcast' },
];

export default function Upload() {
  const navigate = useNavigate();
  const { currentUser, addUserPost, showToast } = useApp();
  const [type, setType] = useState('blog');
  const [template, setTemplate] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mediaUrls, setMediaUrls] = useState(['']);
  const [direction, setDirection] = useState('left');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const cleanedMedia = useMemo(() => mediaUrls.map((u) => u.trim()).filter(Boolean), [mediaUrls]);

  const applyTemplateKey = (key) => {
    setTemplate(key);
    if (!key) return;
    const data = applyTemplate(key);
    if (!data) return;
    setType(data.type || 'blog');
    setTitle(data.title || '');
    setBody(data.body || '');
    setTags(data.tags || []);
    if (data.type === 'carousel') setMediaUrls(['', '']);
    else setMediaUrls(['']);
  };

  const addMediaField = () => setMediaUrls((prev) => [...prev, '']);
  const removeMediaField = (i) =>
    setMediaUrls((prev) => prev.filter((_, idx) => idx !== i));
  const updateMediaField = (i, value) =>
    setMediaUrls((prev) => prev.map((u, idx) => (idx === i ? value : u)));

  const toggleTag = (t) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const data = {
      type,
      title,
      body,
      media: cleanedMedia,
      direction,
      coverImage,
      tags,
    };
    const { valid, errors: errs } = validatePost(data);
    if (!valid) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const post = await savePost(data, currentUser);
      addUserPost(post);
      showToast('Post published!');
      navigate(`/content/${post.id}`);
    } catch {
      setErrors(['Failed to publish. Please try again.']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="upload">
      <div className="upload-inner">
        <header className="upload-head">
          <h1>Create new content</h1>
          <p>Share a tutorial, a visual story, or a broadcast. Paste URLs for media — we render them for real.</p>
        </header>

        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Template (optional)
              <select value={template} onChange={(e) => applyTemplateKey(e.target.value)}>
                <option value="">— Start from scratch —</option>
                {Object.entries(CONTENT_TEMPLATES).map(([key, t]) => (
                  <option key={key} value={key}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Content type
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="form-field">
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your content a clear, descriptive title"
              required
            />
          </label>

          {type !== 'broadcast' ? (
            <label className="form-field">
              Body (optional)
              <textarea
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write steps, tips, or a description. Use 'Step 1 —' to create step blocks."
              />
            </label>
          ) : (
            <label className="form-field">
              Broadcast message
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What do you want to announce?"
                required
              />
            </label>
          )}

          {type !== 'blog' && type !== 'broadcast' ? (
            <fieldset className="form-field">
              <legend>Media URLs {type === 'carousel' ? '(add 2 or more)' : ''}</legend>
              {mediaUrls.map((url, i) => (
                <div key={i} className="media-url-row">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateMediaField(i, e.target.value)}
                    placeholder={
                      type === 'video'
                        ? 'https://youtube.com/watch?v=… or .mp4 URL'
                        : type === 'audio'
                          ? 'https://…/audio.mp3'
                          : type === 'document'
                            ? 'https://…/file.pdf'
                            : 'https://…/image.jpg'
                    }
                  />
                  {mediaUrls.length > 1 ? (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => removeMediaField(i)}
                      aria-label="Remove URL"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
              ))}
              {type === 'carousel' || type === 'image' ? (
                <button type="button" className="btn btn-ghost btn-small" onClick={addMediaField}>
                  <Plus size={14} /> Add another URL
                </button>
              ) : null}
            </fieldset>
          ) : null}

          {type === 'carousel' ? (
            <label className="form-field">
              Carousel direction
              <select value={direction} onChange={(e) => setDirection(e.target.value)}>
                <option value="left">Horizontal — swipe left/right</option>
                <option value="right">Horizontal — reverse</option>
                <option value="up">Vertical — swipe up/down</option>
                <option value="down">Vertical — reverse</option>
              </select>
            </label>
          ) : null}

          {type === 'blog' || type === 'broadcast' ? (
            <label className="form-field">
              Cover image URL (optional)
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://…/cover.jpg"
              />
            </label>
          ) : null}

          <fieldset className="form-field">
            <legend>Tags</legend>
            <div className="tag-picker">
              {TAG_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`chip ${tags.includes(t) ? 'is-active' : ''}`}
                  onClick={() => toggleTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>

          {errors.length > 0 ? (
            <div className="form-errors" role="alert">
              {errors.map((err) => (
                <div key={err}>• {err}</div>
              ))}
            </div>
          ) : null}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </form>

        <section className="upload-preview">
          <h2>Live preview</h2>
          <div className="preview-card">
            <h3>{title || 'Post title'}</h3>
            {cleanedMedia.length > 0 || coverImage ? (
              <MediaRenderer
                type={type}
                media={cleanedMedia.length > 0 ? cleanedMedia : coverImage ? [coverImage] : []}
                direction={direction}
                title={title}
              />
            ) : (
              <div className="preview-placeholder">Add media URLs to see a live preview</div>
            )}
            {body ? <pre className="preview-body">{body}</pre> : null}
            {tags.length > 0 ? (
              <div className="post-tags">
                {tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
