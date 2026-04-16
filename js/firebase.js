/* ============================================
   HOWTOHUB — Firebase Integration
   Link-based storage for content posts
   ============================================ */

/**
 * Content storage manager using localStorage as primary store
 * with Firebase Firestore as optional cloud sync.
 *
 * Content schema:
 * {
 *   id: number (timestamp-based),
 *   type: 'blog' | 'image' | 'carousel' | 'video' | 'audio' | 'document' | 'broadcast',
 *   title: string,
 *   body: string,
 *   media: string[] (array of URLs),
 *   direction: 'left' | 'right' | 'up' | 'down' (for carousel),
 *   coverImage: string (URL),
 *   tags: string[],
 *   author: { name, username, initials },
 *   timestamp: ISO string,
 *   date: 'YYYY-MM-DD',
 *   likes: number,
 *   comments: [],
 *   views: number,
 *   pinned: boolean,
 *   coverGradient: string,
 *   coverIcon: string,
 *   broadcastTarget: 'all' | 'selected' (for broadcast type),
 *   selectedUsers: string[] (for broadcast type)
 * }
 */

class ContentStore {
  constructor() {
    this.storageKey = 'howtohub_user_content';
    this.draftsKey = 'howtohub_drafts';
  }

  /**
   * Save a new content post
   */
  saveContent(contentData) {
    const post = this.buildPost(contentData);

    // Save to localStorage via AppState
    if (typeof state !== 'undefined') {
      state.userContent.unshift(post);
      state._save('howtohub_user_content', state.userContent);
    } else {
      const existing = this._loadLocal();
      existing.unshift(post);
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
    }

    // Attempt Firebase sync (non-blocking)
    this._syncToFirebase(post);

    return post;
  }

  /**
   * Build a complete post object from form data
   */
  buildPost(data) {
    const iconMap = {
      blog: 'file-text',
      image: 'image',
      carousel: 'layers',
      video: 'play-circle',
      audio: 'headphones',
      document: 'file-text',
      broadcast: 'megaphone'
    };

    const gradients = [
      'linear-gradient(135deg, #1E3A8A 0%, #22D3EE 100%)',
      'linear-gradient(135deg, #9D174D 0%, #F9A8D4 100%)',
      'linear-gradient(135deg, #065F46 0%, #6EE7B7 100%)',
      'linear-gradient(135deg, #92400E 0%, #FCD34D 100%)',
      'linear-gradient(135deg, #4338CA 0%, #22D3EE 100%)',
      'linear-gradient(135deg, #7C3AED 0%, #DDD6FE 100%)',
      'linear-gradient(135deg, #991B1B 0%, #FCA5A5 100%)',
      'linear-gradient(135deg, #3730A3 0%, #A5B4FC 100%)'
    ];

    const now = new Date();
    const author = (typeof CURRENT_USER !== 'undefined') ? CURRENT_USER : { name: 'You', username: 'currentuser', initials: 'YU' };

    return {
      id: Date.now(),
      type: data.type || 'blog',
      title: data.title || 'Untitled Post',
      preview: data.preview || data.body?.substring(0, 120) || '',
      body: this.formatBody(data.body || '', data.type),
      media: data.media || [],
      direction: data.direction || 'left',
      coverImage: data.coverImage || '',
      tags: data.tags || [],
      author: { name: author.name, username: author.username, initials: author.initials },
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      likes: 0,
      comments: [],
      views: 0,
      pinned: false,
      coverGradient: gradients[Math.floor(Math.random() * gradients.length)],
      coverIcon: iconMap[data.type] || 'file-text',
      broadcastTarget: data.broadcastTarget || 'all',
      selectedUsers: data.selectedUsers || []
    };
  }

  /**
   * Format body text into HTML
   */
  formatBody(text, type) {
    if (!text) return '';
    // Escape user input before inserting into HTML to prevent XSS
    const safe = typeof escapeHtml === 'function' ? escapeHtml(text) : text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    if (type === 'broadcast') {
      return `<div class="broadcast-message"><p>${safe.replace(/\n/g, '<br>')}</p></div>`;
    }
    // Convert markdown-like formatting to HTML
    return safe.split('\n\n').map(para => {
      if (para.match(/^(Step \d+|Part \d+|Tip \d+|Week \d+|Technique \d+)/)) {
        const [heading, ...rest] = para.split('\n');
        return `<div class="step-block"><div class="step-number">${heading}</div><p>${rest.join('<br>')}</p></div>`;
      }
      if (para.startsWith('Pro Tip:') || para.startsWith('Tip:')) {
        return `<div class="tip-block"><strong>${para.split('\n')[0]}</strong> ${para.split('\n').slice(1).join('<br>')}</div>`;
      }
      if (para.startsWith('Warning:') || para.startsWith('Important:')) {
        return `<div class="warning-block"><strong>${para.split('\n')[0]}</strong> ${para.split('\n').slice(1).join('<br>')}</div>`;
      }
      return `<p>${para.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
  }

  /**
   * Save draft
   */
  saveDraft(data) {
    const drafts = this._loadDrafts();
    const draft = {
      ...data,
      draftId: Date.now(),
      savedAt: new Date().toISOString()
    };
    drafts.unshift(draft);
    localStorage.setItem(this.draftsKey, JSON.stringify(drafts));
    return draft;
  }

  /**
   * Get all drafts
   */
  getDrafts() {
    return this._loadDrafts();
  }

  /**
   * Delete a draft
   */
  deleteDraft(draftId) {
    const drafts = this._loadDrafts().filter(d => d.draftId !== draftId);
    localStorage.setItem(this.draftsKey, JSON.stringify(drafts));
  }

  /**
   * Validate content before saving
   */
  validate(data) {
    const errors = [];

    if (!data.title || !data.title.trim()) {
      errors.push('Title is required');
    }

    if (data.type === 'image' && (!data.media || data.media.length === 0)) {
      errors.push('Image URL is required');
    }

    if (data.type === 'carousel' && (!data.media || data.media.length < 2)) {
      errors.push('Carousel requires at least 2 media URLs');
    }

    if (data.type === 'video' && (!data.media || data.media.length === 0)) {
      errors.push('Video URL is required');
    }

    if (data.type === 'audio' && (!data.media || data.media.length === 0)) {
      errors.push('Audio URL is required');
    }

    if (data.type === 'document' && (!data.media || data.media.length === 0)) {
      errors.push('Document link is required');
    }

    if (data.type === 'broadcast' && (!data.body || !data.body.trim())) {
      errors.push('Broadcast message cannot be empty');
    }

    // Validate URLs
    if (data.media && data.media.length > 0) {
      data.media.forEach((url, i) => {
        if (!this.isValidUrl(url)) {
          errors.push(`Invalid URL at position ${i + 1}: ${url}`);
        }
      });
    }

    if (data.coverImage && !this.isValidUrl(data.coverImage)) {
      errors.push('Invalid cover image URL');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check if a URL is valid
   */
  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // --- Private methods ---

  _loadLocal() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  _loadDrafts() {
    try {
      const data = localStorage.getItem(this.draftsKey);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  _syncToFirebase(post) {
    // Firebase Firestore sync (if available)
    // This is non-blocking and optional
    try {
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        firebase.firestore().collection('posts').add({
          type: post.type,
          title: post.title,
          media: post.media,
          direction: post.direction,
          author: post.author.username,
          timestamp: post.timestamp
        }).catch(() => { /* Firebase sync optional */ });
      }
    } catch { /* Firebase sync optional */ }
  }
}

// Global instance
const contentStore = new ContentStore();

if (typeof window !== 'undefined') {
  window.contentStore = contentStore;
}
