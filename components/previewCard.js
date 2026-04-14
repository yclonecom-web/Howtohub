/* ============================================
   HOWTOHUB — Preview Card Component
   Real-time preview for content creation
   ============================================ */

/**
 * Render a live preview card based on current form state
 * @param {Object} data - The current form data
 * @param {HTMLElement} container - The preview container element
 */
function renderPreviewCard(data, container) {
  if (!container) return;

  const type = data.type || 'blog';
  const title = data.title || 'Untitled Post';
  const body = data.body || '';
  const media = data.media || [];
  const direction = data.direction || 'left';
  const coverImage = data.coverImage || '';
  const tags = data.tags || [];
  const author = (typeof CURRENT_USER !== 'undefined') ? CURRENT_USER : { name: 'You', initials: 'YU' };
  const timestamp = 'Just now';

  // Type icon map
  const iconMap = {
    blog: 'file-text',
    image: 'image',
    carousel: 'layers',
    video: 'play-circle',
    audio: 'headphones',
    document: 'file-text',
    broadcast: 'megaphone'
  };

  const typeLabels = {
    blog: 'Blog Post',
    image: 'Image Post',
    carousel: 'Carousel',
    video: 'Video',
    audio: 'Audio',
    document: 'Document',
    broadcast: 'Broadcast'
  };

  let mediaPreview = '';

  switch (type) {
    case 'image':
      if (media[0]) {
        mediaPreview = `<div class="preview-media"><img src="${media[0]}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=\\'preview-media-error\\'><i data-lucide=\\'image-off\\'></i><span>Image failed to load</span></div>'"></div>`;
      }
      break;

    case 'carousel':
      if (media.length > 0) {
        mediaPreview = `<div class="preview-carousel" id="previewCarousel" data-direction="${direction}"></div>`;
      }
      break;

    case 'video':
      if (media[0]) {
        if (media[0].match(/youtube\.com|youtu\.be/i)) {
          const videoId = extractYouTubeId(media[0]);
          if (videoId) {
            mediaPreview = `<div class="preview-media preview-video"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
          }
        } else {
          mediaPreview = `<div class="preview-media preview-video"><video src="${media[0]}" controls preload="metadata"></video></div>`;
        }
      }
      break;

    case 'audio':
      if (media[0]) {
        mediaPreview = `<div class="preview-audio"><i data-lucide="music"></i><audio src="${media[0]}" controls preload="metadata"></audio></div>`;
      }
      break;

    case 'document':
      if (media.length > 0) {
        mediaPreview = `<div class="preview-carousel" id="previewCarousel" data-direction="${direction}"></div>`;
      }
      break;

    case 'broadcast':
      mediaPreview = `<div class="preview-broadcast"><i data-lucide="megaphone"></i></div>`;
      break;

    default:
      if (coverImage) {
        mediaPreview = `<div class="preview-media"><img src="${coverImage}" alt="Cover" onerror="this.parentElement.innerHTML='<div class=\\'preview-media-error\\'><i data-lucide=\\'image-off\\'></i><span>Cover image failed to load</span></div>'"></div>`;
      }
  }

  const preview = body ? (body.length > 200 ? body.substring(0, 200) + '...' : body) : '';

  container.innerHTML = `
    <div class="preview-card">
      <div class="preview-type-badge">
        <i data-lucide="${iconMap[type] || 'file-text'}"></i>
        <span>${typeLabels[type] || 'Post'}</span>
      </div>

      ${mediaPreview || `
        <div class="preview-cover-placeholder">
          <i data-lucide="${iconMap[type] || 'file-text'}"></i>
        </div>
      `}

      ${tags.length > 0 ? `
        <div class="preview-tags">
          ${tags.map(t => `<span class="tag ${getTagClass ? getTagClass(t) : ''}">${t}</span>`).join('')}
        </div>
      ` : ''}

      <h3 class="preview-title">${escapeHtml(title)}</h3>

      ${preview ? `<p class="preview-body">${escapeHtml(preview)}</p>` : ''}

      <div class="preview-author">
        <div class="preview-author-avatar">${author.initials}</div>
        <div class="preview-author-info">
          <span class="preview-author-name">${author.name}</span>
          <span class="preview-author-time">${timestamp}</span>
        </div>
      </div>

      <div class="preview-actions">
        <span class="preview-action"><i data-lucide="heart"></i> 0</span>
        <span class="preview-action"><i data-lucide="message-circle"></i> 0</span>
        <span class="preview-action"><i data-lucide="bookmark"></i> Save</span>
      </div>
    </div>
  `;

  // Mount carousel if needed
  if ((type === 'carousel' || type === 'document') && media.length > 0) {
    const carouselEl = container.querySelector('#previewCarousel');
    if (carouselEl) {
      new CarouselEngine(carouselEl, {
        media: media,
        direction: direction,
        showDots: true,
        showArrows: true,
        loop: true,
        lazyLoad: false
      });
    }
  }

  // Refresh icons
  if (typeof refreshIcons === 'function') {
    refreshIcons();
  }
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

/**
 * Escape HTML to prevent XSS in preview
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export
if (typeof window !== 'undefined') {
  window.renderPreviewCard = renderPreviewCard;
  window.extractYouTubeId = extractYouTubeId;
  window.escapeHtml = escapeHtml;
}
