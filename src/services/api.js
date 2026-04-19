/* ============================================
   HowToHub — API layer
   CRUD + real-time subscription for user posts
   ============================================ */

import {
  db,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
} from './firebase.js';
import { escapeHtml } from '../utils/helpers.js';

const STORAGE_KEY = 'howtohub_user_content';
const DRAFTS_KEY = 'howtohub_drafts';

// --- localStorage helpers ---
export function loadLocalPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    /* quota exceeded / private mode */
  }
}

export function loadDrafts() {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDraft(data) {
  const drafts = loadDrafts();
  const draft = { ...data, draftId: Date.now(), savedAt: new Date().toISOString() };
  drafts.unshift(draft);
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    /* noop */
  }
  return draft;
}

export function deleteDraft(draftId) {
  const remaining = loadDrafts().filter((d) => d.draftId !== draftId);
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(remaining));
  } catch {
    /* noop */
  }
}

// --- Validation ---
export function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validatePost(data) {
  const errors = [];
  if (!data.title || !data.title.trim()) errors.push('Title is required');

  if (data.type === 'image' && (!data.media || data.media.length === 0))
    errors.push('Image URL is required');
  if (data.type === 'carousel' && (!data.media || data.media.length < 2))
    errors.push('Carousel requires at least 2 media URLs');
  if (data.type === 'video' && (!data.media || data.media.length === 0))
    errors.push('Video URL is required');
  if (data.type === 'audio' && (!data.media || data.media.length === 0))
    errors.push('Audio URL is required');
  if (data.type === 'document' && (!data.media || data.media.length === 0))
    errors.push('Document link is required');
  if (data.type === 'broadcast' && (!data.body || !data.body.trim()))
    errors.push('Broadcast message cannot be empty');

  (data.media || []).forEach((url, i) => {
    if (!isValidUrl(url)) errors.push(`Invalid URL at position ${i + 1}`);
  });
  if (data.coverImage && !isValidUrl(data.coverImage))
    errors.push('Invalid cover image URL');

  return { valid: errors.length === 0, errors };
}

// --- Post builder ---
const ICON_MAP = {
  blog: 'file-text',
  image: 'image',
  carousel: 'layers',
  video: 'play-circle',
  audio: 'headphones',
  document: 'file-text',
  broadcast: 'megaphone',
};

const GRADIENTS = [
  'linear-gradient(135deg, #1E3A8A 0%, #22D3EE 100%)',
  'linear-gradient(135deg, #9D174D 0%, #F9A8D4 100%)',
  'linear-gradient(135deg, #065F46 0%, #6EE7B7 100%)',
  'linear-gradient(135deg, #92400E 0%, #FCD34D 100%)',
  'linear-gradient(135deg, #4338CA 0%, #22D3EE 100%)',
  'linear-gradient(135deg, #7C3AED 0%, #DDD6FE 100%)',
  'linear-gradient(135deg, #991B1B 0%, #FCA5A5 100%)',
  'linear-gradient(135deg, #3730A3 0%, #A5B4FC 100%)',
];

// Escape user text, then convert \n to <br>. Structural HTML tags around the
// content are authored by us; only user-supplied strings are escaped.
function escapeLines(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function formatBody(text, type) {
  if (!text) return '';
  if (type === 'broadcast')
    return `<div class="broadcast-message"><p>${escapeLines(text)}</p></div>`;
  return text
    .split('\n\n')
    .map((para) => {
      if (/^(Step \d+|Part \d+|Tip \d+|Week \d+|Technique \d+)/.test(para)) {
        const [heading, ...rest] = para.split('\n');
        return `<div class="step-block"><div class="step-number">${escapeHtml(heading)}</div><p>${escapeLines(rest.join('\n'))}</p></div>`;
      }
      if (para.startsWith('Pro Tip:') || para.startsWith('Tip:')) {
        const [first, ...rest] = para.split('\n');
        return `<div class="tip-block"><strong>${escapeHtml(first)}</strong> ${escapeLines(rest.join('\n'))}</div>`;
      }
      if (para.startsWith('Warning:') || para.startsWith('Important:')) {
        const [first, ...rest] = para.split('\n');
        return `<div class="warning-block"><strong>${escapeHtml(first)}</strong> ${escapeLines(rest.join('\n'))}</div>`;
      }
      return `<p>${escapeLines(para)}</p>`;
    })
    .join('\n');
}

export function buildPost(data, author) {
  const now = new Date();
  const type = data.type || 'blog';
  return {
    id: Date.now(),
    type,
    title: data.title || 'Untitled Post',
    preview:
      data.preview || (data.body ? data.body.substring(0, 140) : ''),
    body: formatBody(data.body || '', type),
    rawBody: data.body || '',
    media: data.media || [],
    direction: data.direction || 'left',
    coverImage: data.coverImage || '',
    tags: data.tags || [],
    author: {
      name: author?.name || 'You',
      username: author?.username || 'currentuser',
      initials: author?.initials || 'YU',
    },
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0],
    likes: 0,
    comments: [],
    views: 0,
    pinned: false,
    coverGradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
    coverIcon: ICON_MAP[type] || 'file-text',
    broadcastTarget: data.broadcastTarget || 'all',
    selectedUsers: data.selectedUsers || [],
  };
}

// --- Save post (local + optional firestore) ---
export async function savePost(data, author) {
  const post = buildPost(data, author);

  // Save locally first (source of truth — always works offline)
  const existing = loadLocalPosts();
  existing.unshift(post);
  saveLocalPosts(existing);

  // Best-effort Firestore sync
  if (db) {
    try {
      const { id, ...rest } = post;
      await addDoc(collection(db, 'posts'), {
        ...rest,
        localId: id,
        createdAt: serverTimestamp(),
      });
    } catch {
      /* firestore optional — local save already succeeded */
    }
  }

  return post;
}

// --- Real-time subscription ---
// Calls `callback(posts)` whenever the Firestore `posts` collection updates.
// Returns an unsubscribe function. Falls back to a no-op unsubscribe when
// Firestore is unavailable.
export function subscribeToPosts(callback) {
  if (!db) return () => {};
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        const posts = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          posts.push({
            ...data,
            id: data.localId || docSnap.id,
            firestoreId: docSnap.id,
          });
        });
        callback(posts);
      },
      () => {
        /* permission error or offline — ignore, we already show local data */
      },
    );
  } catch {
    return () => {};
  }
}
