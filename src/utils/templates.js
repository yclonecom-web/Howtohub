/* Content templates ported from legacy templates.js */

export const CONTENT_TEMPLATES = {
  'step-by-step': {
    name: 'Step-by-Step Guide',
    icon: 'list-ordered',
    description: 'A structured walkthrough with numbered steps',
    defaults: {
      type: 'blog',
      title: '',
      body: `Step 1 — Getting Started\nDescribe what the reader needs to prepare or know before beginning.\n\nStep 2 — Core Process\nExplain the main action or technique in detail.\n\nStep 3 — Finishing Up\nDescribe the final steps and how to verify the result.\n\nPro Tip: Add a helpful tip that saves time or improves the outcome.`,
      tags: ['Education'],
    },
  },
  'quick-tips': {
    name: 'Quick Tips',
    icon: 'zap',
    description: 'Short, actionable tips and tricks',
    defaults: {
      type: 'blog',
      title: '',
      body: `Tip 1: [Your first tip]\nBrief explanation of why this works.\n\nTip 2: [Your second tip]\nBrief explanation of why this works.\n\nTip 3: [Your third tip]\nBrief explanation of why this works.`,
      tags: ['Education'],
    },
  },
  'tutorial-breakdown': {
    name: 'Tutorial Breakdown',
    icon: 'book-open',
    description: 'In-depth tutorial with sections and examples',
    defaults: {
      type: 'blog',
      title: '',
      body: `Introduction\nBriefly explain what this tutorial covers and who it's for.\n\nPrerequisites\nList what the reader needs before starting.\n\nPart 1 — Foundation\nExplain the core concepts and fundamentals.\n\nPart 2 — Implementation\nWalk through the hands-on implementation with examples.\n\nPart 3 — Advanced Techniques\nShare advanced tips and variations.`,
      tags: ['Education'],
    },
  },
  'photo-gallery': {
    name: 'Photo Gallery',
    icon: 'images',
    description: 'Showcase a collection of images',
    defaults: { type: 'carousel', title: '', body: '', direction: 'left', tags: ['Design'] },
  },
  'video-tutorial': {
    name: 'Video Tutorial',
    icon: 'play-circle',
    description: 'Share a video lesson or demo',
    defaults: { type: 'video', title: '', body: '', tags: ['Education'] },
  },
  'podcast-episode': {
    name: 'Podcast / Audio Lesson',
    icon: 'headphones',
    description: 'Share audio content or a podcast episode',
    defaults: { type: 'audio', title: '', body: '', tags: ['Education'] },
  },
  announcement: {
    name: 'Announcement',
    icon: 'megaphone',
    description: 'Send a broadcast message to your audience',
    defaults: { type: 'broadcast', title: '', body: '', tags: [] },
  },
};

export function getAllTemplates() {
  return Object.entries(CONTENT_TEMPLATES).map(([key, t]) => ({ key, ...t }));
}

export function applyTemplate(key) {
  const t = CONTENT_TEMPLATES[key];
  return t ? { ...t.defaults } : null;
}
