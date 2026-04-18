/* Recommendation engine ported from legacy algorithm.js.
   Pure functions — takes explicit `state` + `allContent` rather than reading globals. */

const WEIGHTS = {
  liked: 5,
  viewed: 2,
  bookmarked: 4,
  tagMatch: 3,
  authorMatch: 3,
  recency: 1,
  popularity: 1,
};

function buildProfile(allContent, state) {
  const profile = { tags: {}, authors: {} };
  allContent.forEach((content) => {
    const id = content.id;
    let score = 0;
    if (state.likes[id]) score += WEIGHTS.liked;
    if (state.bookmarks[id]) score += WEIGHTS.bookmarked;
    if (state.viewHistory[id]) score += WEIGHTS.viewed * Math.min(state.viewHistory[id], 3);
    if (score > 0) {
      (content.tags || []).forEach((tag) => {
        profile.tags[tag] = (profile.tags[tag] || 0) + score;
      });
      if (content.author?.username) {
        profile.authors[content.author.username] =
          (profile.authors[content.author.username] || 0) + score;
      }
    }
  });
  return profile;
}

function scoreContent(content, profile, state) {
  let score = 0;
  (content.tags || []).forEach((tag) => {
    if (profile.tags[tag]) score += profile.tags[tag] * WEIGHTS.tagMatch;
  });
  if (content.author?.username && profile.authors[content.author.username]) {
    score += profile.authors[content.author.username] * WEIGHTS.authorMatch;
  }
  score += Math.log10((content.views || 0) + 1) * WEIGHTS.popularity;
  score += Math.log10((content.likes || 0) + 1) * WEIGHTS.popularity;
  const daysSince =
    (Date.now() - new Date(content.date).getTime()) / (1000 * 60 * 60 * 24);
  if (!Number.isNaN(daysSince)) {
    score += Math.max(0, 30 - daysSince) * WEIGHTS.recency * 0.1;
  }
  if (state.viewHistory[content.id] > 3) score *= 0.5;
  return score;
}

export function getRecommendations(allContent, state, options = {}) {
  const { excludeIds = [], limit = 6, type = null } = options;
  const profile = buildProfile(allContent, state);
  let candidates = allContent.filter((c) => !excludeIds.includes(c.id));
  if (type) candidates = candidates.filter((c) => (c.tags || []).includes(type));
  return candidates
    .map((c) => ({ ...c, _score: scoreContent(c, profile, state) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
}

export function getSimilarContent(allContent, contentId, limit = 4) {
  const source = allContent.find((c) => c.id === contentId);
  if (!source) return [];
  const srcTags = new Set(source.tags || []);
  return allContent
    .filter((c) => c.id !== contentId)
    .map((c) => {
      let sim = 0;
      const tTags = new Set(c.tags || []);
      const overlap = [...srcTags].filter((t) => tTags.has(t));
      sim += overlap.length * 10;
      if (c.author?.username === source.author?.username) sim += 5;
      sim += Math.log10((c.views || 0) + 1);
      return { ...c, _sim: sim };
    })
    .sort((a, b) => b._sim - a._sim)
    .slice(0, limit);
}

export function getRecommendedUsers(allContent, users, state, limit = 5) {
  const profile = buildProfile(allContent, state);
  return users
    .map((user) => {
      let score = 0;
      const userContent = allContent.filter(
        (c) => c.author?.username === user.username,
      );
      userContent.forEach((c) => {
        (c.tags || []).forEach((tag) => {
          if (profile.tags[tag]) score += profile.tags[tag];
        });
        score += Math.log10((c.views || 0) + 1);
      });
      if (state.following[user.username]) score *= 0.3;
      score += Math.log10((user.followers || 0) + 1) * 0.5;
      return { ...user, _score: score };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
}

export function getTrending(allContent, limit = 6) {
  return allContent
    .map((c) => {
      const engagement =
        (c.views || 0) * 0.5 + (c.likes || 0) * 2 + (c.comments?.length || 0) * 3;
      const daysSince =
        (Date.now() - new Date(c.date).getTime()) / (1000 * 60 * 60 * 24);
      const mul = Math.max(0.1, 1 - daysSince / 60);
      return { ...c, _trend: engagement * mul };
    })
    .sort((a, b) => b._trend - a._trend)
    .slice(0, limit);
}
