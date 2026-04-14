/* ============================================
   HOWTOHUB — Carousel Component
   Reusable component for displaying carousel posts
   ============================================ */

/**
 * Render a carousel post in the feed or content view
 * @param {Object} post - The content post object
 * @param {HTMLElement} container - Where to mount the carousel
 * @param {Object} options - Override options
 */
function renderCarouselPost(post, container, options = {}) {
  if (!post || !post.media || post.media.length === 0) return;

  const carousel = new CarouselEngine(container, {
    media: post.media,
    direction: post.direction || 'left',
    showDots: options.showDots !== false,
    showArrows: options.showArrows !== false,
    loop: options.loop !== false,
    lazyLoad: options.lazyLoad !== false,
    autoplay: options.autoplay || false,
    interval: options.interval || 4000
  });

  return carousel;
}

/**
 * Create a mini carousel preview for cards in the feed
 */
function renderCarouselCardPreview(post, container) {
  if (!post || !post.media || post.media.length === 0) return;

  container.classList.add('carousel-card-preview');
  container.innerHTML = `
    <div class="carousel-preview-stack">
      ${post.media.slice(0, 3).map((url, i) => `
        <div class="carousel-preview-layer" style="--layer-offset: ${i}">
          <img src="${url}" alt="Preview ${i + 1}" loading="lazy"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23e5e7eb%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-size=%2214%22>${i + 1}</text></svg>'">
        </div>
      `).join('')}
      <div class="carousel-preview-badge">
        <i data-lucide="layers"></i> ${post.media.length}
      </div>
    </div>
  `;
}

/**
 * Initialize all carousel posts on a page
 * Finds elements with data-carousel-post attribute and mounts carousels
 */
function initCarouselPosts() {
  document.querySelectorAll('[data-carousel-post]').forEach(el => {
    const postId = parseInt(el.dataset.carouselPost);
    const post = state.getContentById(postId);
    if (post && post.type === 'carousel') {
      renderCarouselPost(post, el);
    }
  });
}

// Export
if (typeof window !== 'undefined') {
  window.renderCarouselPost = renderCarouselPost;
  window.renderCarouselCardPreview = renderCarouselCardPreview;
  window.initCarouselPosts = initCarouselPosts;
}
