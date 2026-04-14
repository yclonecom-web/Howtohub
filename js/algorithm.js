/* ============================================
   HOWTOHUB — Smart Recommendation Algorithm
   ============================================ */

class RecommendationEngine {
  constructor() {
    this.weights = {
      liked: 5,
      viewed: 2,
      bookmarked: 4,
      tagMatch: 3,
      authorMatch: 3,
      recency: 1,
      popularity: 1
    };
  }

  // Build user interest profile from their activity
  getUserProfile() {
    const allContent = state.getAllContent();
    const profile = { tags: {}, authors: {} };

    allContent.forEach(content => {
      const id = content.id;
      let interactionScore = 0;

      if (state.isLiked(id)) interactionScore += this.weights.liked;
      if (state.isBookmarked(id)) interactionScore += this.weights.bookmarked;
      if (state.viewHistory[id]) interactionScore += this.weights.viewed * Math.min(state.viewHistory[id], 3);

      if (interactionScore > 0) {
        // Accumulate tag preferences
        (content.tags || []).forEach(tag => {
          profile.tags[tag] = (profile.tags[tag] || 0) + interactionScore;
        });
        // Accumulate author preferences
        profile.authors[content.author.username] = (profile.authors[content.author.username] || 0) + interactionScore;
      }
    });

    return profile;
  }

  // Score a content item based on user profile
  scoreContent(content, profile) {
    let score = 0;

    // Tag affinity
    (content.tags || []).forEach(tag => {
      if (profile.tags[tag]) {
        score += profile.tags[tag] * this.weights.tagMatch;
      }
    });

    // Author affinity
    if (profile.authors[content.author.username]) {
      score += profile.authors[content.author.username] * this.weights.authorMatch;
    }

    // Popularity (normalized)
    score += Math.log10(content.views + 1) * this.weights.popularity;
    score += Math.log10(content.likes + 1) * this.weights.popularity;

    // Recency bonus
    const daysSince = (Date.now() - new Date(content.date).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 30 - daysSince) * this.weights.recency * 0.1;

    // Penalize already heavily viewed content (diversity)
    if (state.viewHistory[content.id] > 3) {
      score *= 0.5;
    }

    return score;
  }

  // Get recommended content for the user
  getRecommendations(options = {}) {
    const { excludeIds = [], limit = 6, type = null } = options;
    const profile = this.getUserProfile();
    const allContent = state.getAllContent();

    let candidates = allContent.filter(c => !excludeIds.includes(c.id));

    // Filter by type/tag if specified
    if (type) {
      candidates = candidates.filter(c => (c.tags || []).includes(type));
    }

    // Score and sort
    const scored = candidates.map(c => ({
      ...c,
      _recScore: this.scoreContent(c, profile)
    }));

    scored.sort((a, b) => b._recScore - a._recScore);

    return scored.slice(0, limit);
  }

  // Get similar content to a given content ID
  getSimilarContent(contentId, limit = 4) {
    const source = state.getContentById(contentId);
    if (!source) return [];

    const allContent = state.getAllContent();
    const candidates = allContent.filter(c => c.id !== contentId);

    const scored = candidates.map(c => {
      let similarity = 0;

      // Tag overlap
      const sourceTags = new Set(source.tags || []);
      const targetTags = new Set(c.tags || []);
      const overlap = [...sourceTags].filter(t => targetTags.has(t));
      similarity += overlap.length * 10;

      // Same author bonus
      if (c.author.username === source.author.username) {
        similarity += 5;
      }

      // Popularity factor
      similarity += Math.log10(c.views + 1);

      return { ...c, _similarity: similarity };
    });

    scored.sort((a, b) => b._similarity - a._similarity);
    return scored.slice(0, limit);
  }

  // Get recommended users based on content preferences
  getRecommendedUsers(limit = 5) {
    const profile = this.getUserProfile();

    const scored = SAMPLE_USERS.map(user => {
      let score = 0;

      // Check if user has content the person would like
      const userContent = state.getAllContent().filter(c => c.author.username === user.username);
      userContent.forEach(c => {
        (c.tags || []).forEach(tag => {
          if (profile.tags[tag]) score += profile.tags[tag];
        });
        score += Math.log10(c.views + 1);
      });

      // Penalize already followed users
      if (state.isFollowing(user.username)) score *= 0.3;

      // Popularity boost
      score += Math.log10(user.followers + 1) * 0.5;

      return { ...user, _score: score };
    });

    scored.sort((a, b) => b._score - a._score);
    return scored.slice(0, limit);
  }

  // Get trending content (based purely on engagement metrics)
  getTrending(limit = 6) {
    const allContent = state.getAllContent();

    const scored = allContent.map(c => {
      // Combine views, likes, and comments for trending score
      const engagementScore = (c.views || 0) * 0.5 + (c.likes || 0) * 2 + (c.comments?.length || 0) * 3;

      // Recency boost
      const daysSince = (Date.now() - new Date(c.date).getTime()) / (1000 * 60 * 60 * 24);
      const recencyMultiplier = Math.max(0.1, 1 - (daysSince / 60));

      return { ...c, _trendScore: engagementScore * recencyMultiplier };
    });

    scored.sort((a, b) => b._trendScore - a._trendScore);
    return scored.slice(0, limit);
  }
}

const recommendationEngine = new RecommendationEngine();
