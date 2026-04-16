/* ============================================
   HOWTOHUB — Global Search System
   ============================================ */

class SearchEngine {
  constructor() {
    this.debounceTimer = null;
  }

  search(query, options = {}) {
    if (!query || query.trim().length < 2) return { content: [], users: [] };

    const q = query.toLowerCase().trim();
    const allContent = state.getAllContent();

    // Search content
    let contentResults = allContent.filter(c => {
      const titleMatch = c.title.toLowerCase().includes(q);
      const previewMatch = c.preview.toLowerCase().includes(q);
      const tagMatch = (c.tags || []).some(t => t.toLowerCase().includes(q));
      const authorMatch = c.author.name.toLowerCase().includes(q);
      return titleMatch || previewMatch || tagMatch || authorMatch;
    });

    // Score and sort results
    contentResults = contentResults.map(c => {
      let score = 0;
      if (c.title.toLowerCase().includes(q)) score += 10;
      if (c.title.toLowerCase().startsWith(q)) score += 5;
      if ((c.tags || []).some(t => t.toLowerCase() === q)) score += 8;
      if (c.preview.toLowerCase().includes(q)) score += 3;
      score += (c.views || 0) / 1000;
      score += (c.likes || 0) / 100;
      return { ...c, _score: score };
    }).sort((a, b) => b._score - a._score);

    // Search users
    let userResults = SAMPLE_USERS.filter(u => {
      return u.name.toLowerCase().includes(q) ||
             u.username.toLowerCase().includes(q) ||
             u.bio.toLowerCase().includes(q);
    });

    // Apply limits
    const maxContent = options.maxContent || 5;
    const maxUsers = options.maxUsers || 3;

    return {
      content: contentResults.slice(0, maxContent),
      users: userResults.slice(0, maxUsers)
    };
  }

  debounceSearch(query, callback, delay = 250) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const results = this.search(query);
      callback(results);
    }, delay);
  }
}

const searchEngine = new SearchEngine();

// --- Render Search Results Dropdown ---
function renderSearchResults(results, container) {
  if (!container) return;

  if (results.content.length === 0 && results.users.length === 0) {
    container.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--text-muted);">
        <div style="font-size: 32px; margin-bottom: 8px;"><i data-lucide="search"></i></div>
        <p>No results found</p>
      </div>
    `;
    container.classList.add('active');
    return;
  }

  let html = '';

  if (results.content.length > 0) {
    html += '<div class="search-result-section">Tutorials & Manuals</div>';
    results.content.forEach(c => {
      html += `
        <div class="search-result-item" onclick="openContent(${c.id})">
          <div class="result-icon" style="background: ${c.coverGradient}; color: #fff;"><i data-lucide="${c.coverIcon}"></i></div>
          <div class="result-info">
            <h4>${highlightMatch(escapeHtml(c.title), document.querySelector('.nav-search input, .bookmarks-search input, .mobile-search-header input')?.value || '')}</h4>
            <p>${escapeHtml(c.author.name)} · ${(c.tags || []).map(t => escapeHtml(t)).join(', ')}</p>
          </div>
        </div>
      `;
    });
  }

  if (results.users.length > 0) {
    html += '<div class="search-result-section">Users</div>';
    results.users.forEach(u => {
      html += `
        <div class="search-result-item" onclick="navigateTo('profile.html?user=${escapeHtml(u.username)}')">
          <div class="result-icon" style="background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; border-radius: 50%; font-size: 14px; font-weight: 700;">${escapeHtml(u.initials)}</div>
          <div class="result-info">
            <h4>${escapeHtml(u.name)}</h4>
            <p>@${escapeHtml(u.username)} · ${formatNumber(u.followers)} followers</p>
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = html;
  container.classList.add('active');
  refreshIcons();
}

function highlightMatch(text, query) {
  if (!query || query.length < 2) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<strong style="color: var(--accent);">$1</strong>');
}

// --- Init Search on Page ---
function initSearch() {
  // Desktop search
  const navSearchInput = document.querySelector('.nav-search input');
  const navSearchResults = document.querySelector('.nav-search .search-results');

  if (navSearchInput && navSearchResults) {
    navSearchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      if (query.length < 2) {
        navSearchResults.classList.remove('active');
        return;
      }
      searchEngine.debounceSearch(query, (results) => {
        renderSearchResults(results, navSearchResults);
      });
    });

    navSearchInput.addEventListener('focus', () => {
      if (navSearchInput.value.length >= 2) {
        const results = searchEngine.search(navSearchInput.value);
        renderSearchResults(results, navSearchResults);
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-search')) {
        navSearchResults.classList.remove('active');
      }
    });
  }

  // Mobile search
  const mobileSearchInput = document.querySelector('.mobile-search-header input');
  const mobileSearchResults = document.getElementById('mobileSearchResults');

  if (mobileSearchInput && mobileSearchResults) {
    mobileSearchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      if (query.length < 2) {
        mobileSearchResults.innerHTML = renderSuggestedContent();
        return;
      }
      searchEngine.debounceSearch(query, (results) => {
        renderSearchResults(results, mobileSearchResults);
        mobileSearchResults.classList.remove('active'); // Use different styling for mobile
      });
    });
  }
}

function renderSuggestedContent() {
  const trending = SAMPLE_CONTENT.sort((a, b) => b.views - a.views).slice(0, 3);
  let html = '<div style="padding: 16px 0;"><h3 style="font-size: 14px; color: var(--text-muted); margin-bottom: 12px;">Trending</h3>';
  trending.forEach(c => {
    html += `
      <div class="search-result-item" onclick="openContent(${c.id})" style="border-bottom: 1px solid var(--border);">
        <div class="result-icon" style="background: ${c.coverGradient}; color: #fff;"><i data-lucide="${c.coverIcon}"></i></div>
        <div class="result-info">
          <h4>${escapeHtml(c.title)}</h4>
          <p>${formatNumber(c.views)} views · ${escapeHtml(c.author.name)}</p>
        </div>
      </div>
    `;
  });
  html += '</div>';
  return html;
}

document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  refreshIcons();
});
