/* ============================================
   HOWTOHUB — Carousel Engine
   Reusable carousel with directional slides
   ============================================ */

class CarouselEngine {
  /**
   * @param {HTMLElement} container - The carousel container element
   * @param {Object} options
   * @param {string[]} options.media - Array of media URLs
   * @param {string} options.direction - 'left' | 'right' | 'up' | 'down'
   * @param {boolean} options.autoplay - Auto-advance slides
   * @param {number} options.interval - Autoplay interval in ms
   * @param {boolean} options.showDots - Show indicator dots
   * @param {boolean} options.showArrows - Show arrow buttons
   * @param {boolean} options.loop - Loop slides
   * @param {boolean} options.lazyLoad - Lazy load media
   */
  constructor(container, options = {}) {
    this.container = container;
    this.media = options.media || [];
    this.direction = options.direction || 'left';
    this.autoplay = options.autoplay || false;
    this.interval = options.interval || 4000;
    this.showDots = options.showDots !== false;
    this.showArrows = options.showArrows !== false;
    this.loop = options.loop !== false;
    this.lazyLoad = options.lazyLoad !== false;

    this.currentIndex = 0;
    this.isAnimating = false;
    this.autoplayTimer = null;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;

    if (this.media.length > 0) {
      this.render();
      this.bindEvents();
      if (this.autoplay) this.startAutoplay();
    }
  }

  get isHorizontal() {
    return this.direction === 'left' || this.direction === 'right';
  }

  get isReversed() {
    return this.direction === 'right' || this.direction === 'down';
  }

  render() {
    this.container.classList.add('carousel-engine');
    this.container.setAttribute('data-direction', this.direction);

    const trackClass = this.isHorizontal ? 'carousel-track-horizontal' : 'carousel-track-vertical';

    this.container.innerHTML = `
      <div class="carousel-viewport">
        <div class="carousel-track ${trackClass}">
          ${this.media.map((url, i) => this.renderSlide(url, i)).join('')}
        </div>
      </div>
      ${this.showArrows && this.media.length > 1 ? this.renderArrows() : ''}
      ${this.showDots && this.media.length > 1 ? this.renderDots() : ''}
      <div class="carousel-counter">${this.currentIndex + 1} / ${this.media.length}</div>
    `;

    this.track = this.container.querySelector('.carousel-track');
    this.viewport = this.container.querySelector('.carousel-viewport');
    this.updatePosition(false);

    // Lazy load first few slides
    if (this.lazyLoad) {
      this.loadSlide(0);
      if (this.media.length > 1) this.loadSlide(1);
    }
  }

  renderSlide(url, index) {
    const mediaType = this.getMediaType(url);
    const loadAttr = this.lazyLoad && index > 1 ? 'data-src' : 'src';
    const srcAttr = this.lazyLoad && index > 1 ? '' : `src="${url}"`;

    let content = '';
    switch (mediaType) {
      case 'image':
        content = `<img ${srcAttr} ${this.lazyLoad && index > 1 ? `data-src="${url}"` : ''} alt="Slide ${index + 1}" class="carousel-media" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'carousel-error\\'><i data-lucide=\\'image-off\\'></i><span>Failed to load</span></div>'">`;
        break;
      case 'video':
        content = `<video ${srcAttr} ${this.lazyLoad && index > 1 ? `data-src="${url}"` : ''} class="carousel-media" controls preload="metadata"></video>`;
        break;
      case 'audio':
        content = `<div class="carousel-audio-slide"><i data-lucide="music"></i><audio ${srcAttr} ${this.lazyLoad && index > 1 ? `data-src="${url}"` : ''} controls preload="metadata"></audio></div>`;
        break;
      case 'document':
        content = `<div class="carousel-doc-slide"><i data-lucide="file-text"></i><a href="${url}" target="_blank" class="carousel-doc-link">View Document</a></div>`;
        break;
      default:
        content = `<img ${srcAttr} ${this.lazyLoad && index > 1 ? `data-src="${url}"` : ''} alt="Slide ${index + 1}" class="carousel-media" loading="lazy">`;
    }

    return `<div class="carousel-slide" data-index="${index}">${content}</div>`;
  }

  renderArrows() {
    const prevIcon = this.isHorizontal ? 'chevron-left' : 'chevron-up';
    const nextIcon = this.isHorizontal ? 'chevron-right' : 'chevron-down';
    const arrowClass = this.isHorizontal ? 'carousel-arrows-horizontal' : 'carousel-arrows-vertical';

    return `
      <div class="carousel-arrows ${arrowClass}">
        <button class="carousel-arrow carousel-prev" aria-label="Previous slide"><i data-lucide="${prevIcon}"></i></button>
        <button class="carousel-arrow carousel-next" aria-label="Next slide"><i data-lucide="${nextIcon}"></i></button>
      </div>
    `;
  }

  renderDots() {
    const dots = this.media.map((_, i) =>
      `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`
    ).join('');
    return `<div class="carousel-dots">${dots}</div>`;
  }

  bindEvents() {
    // Arrow buttons
    const prevBtn = this.container.querySelector('.carousel-prev');
    const nextBtn = this.container.querySelector('.carousel-next');
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); this.prev(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); this.next(); });

    // Dot navigation
    this.container.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        this.goTo(parseInt(dot.dataset.index));
      });
    });

    // Touch/swipe
    this.viewport.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.viewport.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.viewport.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

    // Keyboard
    this.container.setAttribute('tabindex', '0');
    this.container.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Pause autoplay on hover
    if (this.autoplay) {
      this.container.addEventListener('mouseenter', () => this.stopAutoplay());
      this.container.addEventListener('mouseleave', () => this.startAutoplay());
    }
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  handleTouchMove(e) {
    this.touchEndX = e.touches[0].clientX;
    this.touchEndY = e.touches[0].clientY;

    // Prevent page scroll when swiping in carousel direction
    const diffX = Math.abs(this.touchEndX - this.touchStartX);
    const diffY = Math.abs(this.touchEndY - this.touchStartY);
    if (this.isHorizontal && diffX > diffY) {
      e.preventDefault();
    } else if (!this.isHorizontal && diffY > diffX) {
      e.preventDefault();
    }
  }

  handleTouchEnd() {
    const diffX = this.touchStartX - this.touchEndX;
    const diffY = this.touchStartY - this.touchEndY;
    const threshold = 50;

    if (this.isHorizontal) {
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) this.next();
        else this.prev();
      }
    } else {
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0) this.next();
        else this.prev();
      }
    }
  }

  handleKeydown(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        this.prev();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        this.next();
        break;
    }
  }

  next() {
    if (this.isAnimating) return;
    const nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.media.length) {
      if (this.loop) this.goTo(0);
      return;
    }
    this.goTo(nextIndex);
  }

  prev() {
    if (this.isAnimating) return;
    const prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      if (this.loop) this.goTo(this.media.length - 1);
      return;
    }
    this.goTo(prevIndex);
  }

  goTo(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    if (index < 0 || index >= this.media.length) return;

    this.isAnimating = true;
    this.currentIndex = index;
    this.updatePosition(true);
    this.updateDots();
    this.updateCounter();

    // Lazy load adjacent slides
    if (this.lazyLoad) {
      this.loadSlide(index);
      if (index + 1 < this.media.length) this.loadSlide(index + 1);
      if (index - 1 >= 0) this.loadSlide(index - 1);
    }

    setTimeout(() => { this.isAnimating = false; }, 350);
  }

  updatePosition(animate) {
    if (!this.track) return;
    this.track.style.transition = animate ? 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' : 'none';

    if (this.isHorizontal) {
      const offset = this.isReversed
        ? this.currentIndex * 100
        : -this.currentIndex * 100;
      this.track.style.transform = `translateX(${this.isReversed ? -this.currentIndex * 100 : -this.currentIndex * 100}%)`;
    } else {
      this.track.style.transform = `translateY(${-this.currentIndex * 100}%)`;
    }
  }

  updateDots() {
    this.container.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  }

  updateCounter() {
    const counter = this.container.querySelector('.carousel-counter');
    if (counter) counter.textContent = `${this.currentIndex + 1} / ${this.media.length}`;
  }

  loadSlide(index) {
    const slide = this.container.querySelector(`.carousel-slide[data-index="${index}"]`);
    if (!slide) return;

    const lazyElements = slide.querySelectorAll('[data-src]');
    lazyElements.forEach(el => {
      if (el.dataset.src) {
        el.src = el.dataset.src;
        el.removeAttribute('data-src');
      }
    });
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => this.next(), this.interval);
  }

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  getMediaType(url) {
    if (!url) return 'unknown';
    const lower = url.toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/i.test(lower)) return 'image';
    if (/\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(lower)) return 'video';
    if (/\.(mp3|wav|ogg|aac|flac|m4a)(\?|$)/i.test(lower)) return 'audio';
    if (/\.(pdf|ppt|pptx|doc|docx|xls|xlsx)(\?|$)/i.test(lower)) return 'document';
    if (/youtube\.com|youtu\.be|vimeo\.com/i.test(lower)) return 'video';
    // Default to image for unrecognized URLs
    return 'image';
  }

  destroy() {
    this.stopAutoplay();
    this.container.innerHTML = '';
    this.container.classList.remove('carousel-engine');
  }

  // Update media array and re-render
  update(newMedia, newDirection) {
    this.stopAutoplay();
    this.media = newMedia || this.media;
    this.direction = newDirection || this.direction;
    this.currentIndex = 0;
    if (this.media.length > 0) {
      this.render();
      this.bindEvents();
      if (typeof refreshIcons === 'function') refreshIcons();
      if (this.autoplay) this.startAutoplay();
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.CarouselEngine = CarouselEngine;
}
