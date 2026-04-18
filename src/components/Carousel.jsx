/*
 * Carousel — actual media carousel with swipe, keyboard nav, arrows, and dots.
 *
 * Props:
 *   items     — array of media URLs (actually rendered, not placeholders)
 *   direction — 'left' | 'right' (horizontal) | 'up' | 'down' (vertical)
 *   title     — for alt text
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { extractVimeoId, extractYouTubeId, getMediaType } from '../utils/helpers.js';

function CarouselSlide({ url, active, title }) {
  const [broken, setBroken] = useState(false);
  const type = getMediaType(url);
  const youtubeId = extractYouTubeId(url);
  const vimeoId = extractVimeoId(url);

  if (broken) {
    return (
      <div className="carousel-slide-fallback">
        <span>Media failed to load</span>
      </div>
    );
  }

  if (type === 'video' && youtubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?rel=0${active ? '' : ''}`}
        title="Video slide"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }
  if (type === 'video' && vimeoId) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId}`}
        title="Video slide"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }
  if (type === 'video') {
    return (
      <video
        src={url}
        controls={active}
        playsInline
        preload="metadata"
        onError={() => setBroken(true)}
      >
        <track kind="captions" />
      </video>
    );
  }
  if (type === 'audio') {
    return (
      <div className="carousel-audio">
        <audio src={url} controls preload="metadata" onError={() => setBroken(true)} />
      </div>
    );
  }
  if (type === 'document') {
    const lower = url.toLowerCase();
    const embed = /\.pdf(\?|$)/i.test(lower)
      ? url
      : `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    return <iframe src={embed} title="Document slide" loading="lazy" />;
  }
  return (
    <img
      src={url}
      alt={title || 'Carousel slide'}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}

export default function Carousel({ items = [], direction = 'left', title }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const touchStart = useRef(null);

  const total = items.length;
  const vertical = direction === 'up' || direction === 'down';
  const reversed = direction === 'right' || direction === 'down';

  const goTo = useCallback(
    (i) => {
      if (total === 0) return;
      const next = ((i % total) + total) % total;
      setIndex(next);
    },
    [total],
  );

  const next = useCallback(() => goTo(reversed ? index - 1 : index + 1), [goTo, index, reversed]);
  const prev = useCallback(() => goTo(reversed ? index + 1 : index - 1), [goTo, index, reversed]);

  // Keyboard navigation when the carousel is focused
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const handler = (e) => {
      if (vertical) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          next();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          prev();
        }
      } else {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          next();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prev();
        }
      }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [next, prev, vertical]);

  // Touch swipe handlers
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    const threshold = 40;
    if (vertical) {
      if (Math.abs(dy) < threshold) return;
      if (dy < 0) next();
      else prev();
    } else {
      if (Math.abs(dx) < threshold) return;
      if (dx < 0) next();
      else prev();
    }
  };

  if (total === 0) return null;

  const offsetStyle = vertical
    ? { transform: `translate3d(0, -${index * 100}%, 0)` }
    : { transform: `translate3d(-${index * 100}%, 0, 0)` };

  return (
    <div
      className={`carousel carousel-${vertical ? 'vertical' : 'horizontal'}`}
      ref={containerRef}
      tabIndex={0}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label={title || 'Media carousel'}
    >
      <div className="carousel-viewport">
        <div className="carousel-track" style={offsetStyle}>
          {items.map((url, i) => (
            <div
              key={i}
              className={`carousel-slide ${i === index ? 'is-active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
              aria-hidden={i !== index}
            >
              <CarouselSlide url={url} active={i === index} title={title} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`carousel-nav carousel-nav-prev ${vertical ? 'is-vertical' : ''}`}
        onClick={prev}
        aria-label="Previous slide"
      >
        {vertical ? <ChevronUp size={22} /> : <ChevronLeft size={22} />}
      </button>
      <button
        type="button"
        className={`carousel-nav carousel-nav-next ${vertical ? 'is-vertical' : ''}`}
        onClick={next}
        aria-label="Next slide"
      >
        {vertical ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
      </button>

      <div className="carousel-dots" role="tablist">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`carousel-dot ${i === index ? 'is-active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-selected={i === index}
            role="tab"
          />
        ))}
      </div>

      <div className="carousel-counter" aria-hidden="true">
        {index + 1} / {total}
      </div>
    </div>
  );
}
