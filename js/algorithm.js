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
      popularity: 1,
      collaborative: 4
    };
    this._interactionMatrix = null;
    this._matrixVersion = -1;
  }

  // Build a user-content interaction matrix from comment authors and content
  // authors across all content. Each key is a username; each value is a Map of
  // contentId → interaction strength. The current user's row is derived from
  // likes, bookmarks, and view history stored in AppState.
  buildInteractionMatrix() {
    const version = Object.keys(state.likes).length +
                    Object.keys(state.bookmarks).length +
                    Object.keys(state.viewHistory).length;
    if (this._interactionMatrix && this._matrixVersion === version) {
      return this._interactionMatrix;
    }

    const matrix = {}; // username → { contentId → strength }
    const allContent = state.getAllContent();

    allContent.forEach(content => {
      const id = content.id;

      // Content author has a strong implicit interaction with their own post
      const authorName = content.author.username;
      if (!matrix[authorName]) matrix[authorName] = {};
      matrix[authorName][id] = (matrix[authorName][id] || 0) + 3;

      // Comment authors have an interaction with the content they commented on
      (content.comments || []).forEach(comment => {
        const commenter = comment.initials; // use initials as stable key
        if (!matrix[commenter]) matrix[commenter] = {};
        matrix[commenter][id] = (matrix[commenter][id] || 0) + 2;
      });

      // Also include user-added comments stored in state
      (state.comments[id] || []).forEach(comment => {
        const commenter = comment.initials;
        if (!matrix[commenter]) matrix[commenter] = {};
        matrix[commenter][id] = (matrix[commenter][id] || 0) + 2;
      });
    });

    // Build the current user's interaction row from state
    const currentKey = CURRENT_USER.initials;
    if (!matrix[currentKey]) matrix[currentKey] = {};

    allContent.forEach(content => {
      const id = content.id;
      let strength = 0;
      if (state.isLiked(id))      strength += 3;
      if (state.isBookmarked(id))  strength += 2;
      if (state.viewHistory[id])   strength += Math.min(state.viewHistory[id], 3);
      if (strength > 0) {
        matrix[currentKey][id] = (matrix[currentKey][id] || 0) + strength;
      }
    });

    this._interactionMatrix = matrix;
    this._matrixVersion = version;
    return matrix;
  }

  // Compute cosine-similarity between two interaction vectors (objects).
  _cosineSimilarity(vecA, vecB) {
    const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    let dot = 0, magA = 0, magB = 0;
    keys.forEach(k => {
      const a = vecA[k] || 0;
      const b = vecB[k] || 0;
      dot  += a * b;
      magA += a * a;
      magB += b * b;
    });
    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  // Return a collaborative-filtering score for a content item.
  // Finds users whose interaction vectors are similar to the current user,
  // then aggregates their interaction strengths on the target content,
  // weighted by similarity.
  getCollaborativeScore(contentId) {
    const matrix = this.buildInteractionMatrix();
    const currentKey = CURRENT_USER.initials;
    const currentVec = matrix[currentKey];
    if (!currentVec || Object.keys(currentVec).length === 0) return 0;

    let score = 0;
    for (const [user, vec] of Object.entries(matrix)) {
      if (user === currentKey) continue;
      const sim = this._cosineSimilarity(currentVec, vec);
      if (sim <= 0) continue;
      // If this similar user interacted with the target content, contribute
      score += sim * (vec[contentId] || 0);
    }
    return score;
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

    // Collaborative filtering: boost from similar users' interactions
    score += this.getCollaborativeScore(content.id) * this.weights.collaborative;

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

    // Collaborative co-occurrence: find all users who interacted with the
    // source content so we can boost candidates they also interacted with.
    const matrix = this.buildInteractionMatrix();
    const sourceUsers = [];
    for (const [user, vec] of Object.entries(matrix)) {
      if (vec[contentId]) sourceUsers.push(user);
    }

    const sourceTags = new Set(source.tags || []);

    const scored = candidates.map(c => {
      let similarity = 0;

      // Tag overlap
      const targetTags = new Set(c.tags || []);
      const overlap = [...sourceTags].filter(t => targetTags.has(t));
      similarity += overlap.length * 10;

      // Same author bonus
      if (c.author.username === source.author.username) {
        similarity += 5;
      }

      // Collaborative co-occurrence boost
      let coOccurrence = 0;
      sourceUsers.forEach(user => {
        if (matrix[user][c.id]) coOccurrence += 1;
      });
      similarity += coOccurrence * 3;

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
