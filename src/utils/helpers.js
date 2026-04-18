/* Generic utility helpers */

export function formatNumber(num) {
  const n = Number(num) || 0;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export function getTagClass(tag) {
  const map = {
    Tech: 'tag-tech',
    DIY: 'tag-diy',
    Education: 'tag-education',
    Design: 'tag-design',
    Cooking: 'tag-cooking',
    Fitness: 'tag-fitness',
    Finance: 'tag-finance',
  };
  return map[tag] || '';
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getMediaType(url) {
  if (!url) return 'unknown';
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/i.test(lower)) return 'image';
  if (/\.(mp4|webm|ogg|mov|avi|m4v)(\?|$)/i.test(lower)) return 'video';
  if (/\.(mp3|wav|aac|flac|m4a)(\?|$)/i.test(lower)) return 'audio';
  if (/\.(pdf|ppt|pptx|doc|docx|xls|xlsx)(\?|$)/i.test(lower)) return 'document';
  if (/youtube\.com|youtu\.be|vimeo\.com/i.test(lower)) return 'video';
  // Default to image for unrecognized URLs (most common share case)
  return 'image';
}

export function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  );
  return m ? m[1] : null;
}

export function extractVimeoId(url) {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Build a Google Docs Viewer URL for previewing office docs (PDFs render natively,
// but PPT/DOC/XLS need the viewer to embed inline).
export function getDocumentEmbedUrl(url) {
  if (!url) return '';
  const lower = url.toLowerCase();
  if (/\.pdf(\?|$)/i.test(lower)) return url; // native embed works
  return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
}

// Debounce helper
export function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
