/*
 * MediaRenderer — the critical component that makes uploaded media actually display.
 *
 * Props:
 *   type      — post type: 'image' | 'video' | 'audio' | 'carousel' | 'document' | 'blog' | 'broadcast'
 *   media     — array of media URLs
 *   direction — carousel direction: 'left' | 'right' | 'up' | 'down'
 *   cover     — optional fallback cover (gradient + icon) when no media
 *
 * Responsibilities:
 *   - Detect content type from URL when `type` is generic
 *   - Render correct element (img / video / audio / iframe)
 *   - YouTube + Vimeo iframe embeds
 *   - Graceful fallback on broken URLs
 *   - Lazy loading for perf
 */
import { useState } from 'react';
import { AlertTriangle, FileText, Play } from 'lucide-react';
import Carousel from './Carousel.jsx';
import {
  extractVimeoId,
  extractYouTubeId,
  getDocumentEmbedUrl,
  getMediaType,
} from '../utils/helpers.js';

function BrokenFallback({ label = 'Media unavailable' }) {
  return (
    <div className="media-fallback" role="img" aria-label={label}>
      <AlertTriangle size={32} />
      <span>{label}</span>
    </div>
  );
}

function ImageRenderer({ src, alt }) {
  const [error, setError] = useState(false);
  if (error) return <BrokenFallback label="Image failed to load" />;
  return (
    <img
      src={src}
      alt={alt || 'Post media'}
      loading="lazy"
      decoding="async"
      className="media-image"
      onError={() => setError(true)}
    />
  );
}

function VideoRenderer({ src }) {
  const [error, setError] = useState(false);
  const youtubeId = extractYouTubeId(src);
  const vimeoId = extractVimeoId(src);

  if (youtubeId) {
    return (
      <div className="media-video-wrap">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  if (vimeoId) {
    return (
      <div className="media-video-wrap">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title="Vimeo video player"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  if (error) return <BrokenFallback label="Video failed to load" />;

  return (
    <div className="media-video-wrap">
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        className="media-video"
        onError={() => setError(true)}
      >
        <track kind="captions" />
      </video>
    </div>
  );
}

function AudioRenderer({ src, title }) {
  const [error, setError] = useState(false);
  if (error) return <BrokenFallback label="Audio failed to load" />;
  return (
    <div className="media-audio-wrap">
      <div className="media-audio-art" aria-hidden="true">
        <Play size={28} />
      </div>
      <div className="media-audio-body">
        {title ? <div className="media-audio-title">{title}</div> : null}
        <audio
          src={src}
          controls
          preload="metadata"
          onError={() => setError(true)}
          className="media-audio-player"
        />
      </div>
    </div>
  );
}

function DocumentRenderer({ src }) {
  const [error, setError] = useState(false);
  const embedUrl = getDocumentEmbedUrl(src);
  if (error) return <BrokenFallback label="Document failed to load" />;
  return (
    <div className="media-doc-wrap">
      <iframe
        src={embedUrl}
        title="Document preview"
        loading="lazy"
        onError={() => setError(true)}
      />
      <a className="media-doc-open" href={src} target="_blank" rel="noreferrer noopener">
        <FileText size={16} /> Open original
      </a>
    </div>
  );
}

function CoverFallback({ gradient, icon }) {
  const style = gradient ? { background: gradient } : undefined;
  return (
    <div className="media-cover" style={style} aria-hidden="true">
      <FileText size={42} />
      {icon ? <span className="sr-only">{icon}</span> : null}
    </div>
  );
}

export default function MediaRenderer({
  type,
  media = [],
  direction = 'left',
  cover,
  title,
}) {
  const list = Array.isArray(media) ? media.filter(Boolean) : [];

  // No media — show cover fallback (used by blog posts with a gradient cover)
  if (list.length === 0) {
    if (cover?.gradient) return <CoverFallback gradient={cover.gradient} icon={cover.icon} />;
    return null;
  }

  // Carousel — multiple items, always use Carousel component
  if (type === 'carousel' || list.length > 1) {
    return <Carousel items={list} direction={direction} title={title} />;
  }

  const url = list[0];
  const resolvedType = type === 'blog' || !type ? getMediaType(url) : type;

  switch (resolvedType) {
    case 'image':
      return <ImageRenderer src={url} alt={title} />;
    case 'video':
      return <VideoRenderer src={url} />;
    case 'audio':
      return <AudioRenderer src={url} title={title} />;
    case 'document':
      return <DocumentRenderer src={url} />;
    default:
      // Unknown type — try image first, fall back gracefully
      return <ImageRenderer src={url} alt={title} />;
  }
}
