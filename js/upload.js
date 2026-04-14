/* ============================================
   HOWTOHUB — Upload / Content Creation Logic
   Dynamic form for 7 content types + real-time preview
   ============================================ */

// --- State ---
let currentType = 'blog';
let currentTemplate = null;
let mediaUrls = [];
let currentDirection = 'left';
let currentTags = [];
let previewDebounceTimer = null;
let audioRecorder = null;
let audioChunks = [];

// --- Content Type Definitions ---
const CONTENT_TYPES = {
  blog: {
    label: 'Blog / Written Content',
    icon: 'file-text',
    fields: ['title', 'coverImage', 'body', 'tags'],
    description: 'Write articles, guides, and tutorials'
  },
  image: {
    label: 'Image Post',
    icon: 'image',
    fields: ['title', 'mediaUrl', 'caption', 'tags'],
    description: 'Share a single image with caption'
  },
  carousel: {
    label: 'Carousel Post',
    icon: 'layers',
    fields: ['title', 'mediaList', 'direction', 'caption', 'tags'],
    description: 'Multiple images/docs with slide direction'
  },
  video: {
    label: 'Video Post',
    icon: 'play-circle',
    fields: ['title', 'mediaUrl', 'caption', 'tags'],
    description: 'Share videos from YouTube or direct links'
  },
  audio: {
    label: 'Audio Content',
    icon: 'headphones',
    fields: ['title', 'mediaUrl', 'audioRecord', 'caption', 'tags'],
    description: 'Share audio content or record a clip'
  },
  document: {
    label: 'Document Post',
    icon: 'file-text',
    fields: ['title', 'mediaList', 'direction', 'caption', 'tags'],
    description: 'Share PDFs, presentations, and documents'
  },
  broadcast: {
    label: 'Broadcast Message',
    icon: 'megaphone',
    fields: ['title', 'body', 'broadcastTarget'],
    description: 'Send a message to your followers'
  }
};

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  if (typeof state !== 'undefined') state.applyTheme();
  renderTypeSelector();
  renderTemplateSelector();
  switchType('blog');
  refreshIcons();
});

// --- Type Selector ---
function renderTypeSelector() {
  const container = document.getElementById('typeSelector');
  if (!container) return;

  container.innerHTML = Object.entries(CONTENT_TYPES).map(([key, type]) => `
    <button class="type-btn ${key === currentType ? 'active' : ''}" data-type="${key}" onclick="switchType('${key}')">
      <i data-lucide="${type.icon}"></i>
      <span>${type.label}</span>
    </button>
  `).join('');
}

// --- Template Selector ---
function renderTemplateSelector() {
  const container = document.getElementById('templateSelector');
  if (!container) return;

  const templates = getAllTemplates();
  container.innerHTML = `
    <button class="template-btn ${!currentTemplate ? 'active' : ''}" onclick="clearTemplate()">
      <i data-lucide="plus"></i>
      <span>Blank</span>
    </button>
    ${templates.map(t => `
      <button class="template-btn ${currentTemplate === t.key ? 'active' : ''}" onclick="selectTemplate('${t.key}')">
        <i data-lucide="${t.icon}"></i>
        <span>${t.name}</span>
      </button>
    `).join('')}
  `;
}

// --- Switch Content Type ---
function switchType(type) {
  currentType = type;
  mediaUrls = [];
  currentDirection = 'left';

  // Update type buttons
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });

  renderFormFields();
  updatePreview();
  refreshIcons();
}

// --- Select Template ---
function selectTemplate(key) {
  const templateData = applyTemplate(key);
  if (!templateData) return;

  currentTemplate = key;

  // Switch type if template specifies one
  if (templateData.type && templateData.type !== currentType) {
    currentType = templateData.type;
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === currentType);
    });
  }

  renderFormFields();

  // Fill in template defaults
  setTimeout(() => {
    const titleInput = document.getElementById('fieldTitle');
    const bodyInput = document.getElementById('fieldBody');
    const captionInput = document.getElementById('fieldCaption');

    if (titleInput && templateData.title) titleInput.value = templateData.title;
    if (bodyInput && templateData.body) bodyInput.value = templateData.body;
    if (captionInput && templateData.body) captionInput.value = templateData.body;
    if (templateData.direction) {
      currentDirection = templateData.direction;
      const dirSelect = document.getElementById('fieldDirection');
      if (dirSelect) dirSelect.value = currentDirection;
    }
    if (templateData.tags) {
      currentTags = [...templateData.tags];
      updateTagDisplay();
    }

    updatePreview();
    refreshIcons();
  }, 50);

  // Update template buttons
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.classList.toggle('active', false);
  });
  const activeBtn = document.querySelector(`.template-btn[onclick="selectTemplate('${key}')"]`);
  if (activeBtn) activeBtn.classList.add('active');
}

function clearTemplate() {
  currentTemplate = null;
  document.querySelectorAll('.template-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.template-btn')?.classList.add('active');
  renderFormFields();
  updatePreview();
  refreshIcons();
}

// --- Render Dynamic Form Fields ---
function renderFormFields() {
  const container = document.getElementById('formFields');
  if (!container) return;

  const type = CONTENT_TYPES[currentType];
  if (!type) return;

  let fieldsHtml = '';

  type.fields.forEach(field => {
    switch (field) {
      case 'title':
        fieldsHtml += `
          <div class="form-group">
            <label for="fieldTitle"><i data-lucide="type"></i> Title</label>
            <input type="text" id="fieldTitle" placeholder="Give your post a title..." maxlength="120" oninput="debouncedPreview()">
            <span class="field-hint">Max 120 characters</span>
          </div>
        `;
        break;

      case 'coverImage':
        fieldsHtml += `
          <div class="form-group">
            <label for="fieldCoverImage"><i data-lucide="image"></i> Cover Image URL</label>
            <input type="url" id="fieldCoverImage" placeholder="https://example.com/cover.jpg" oninput="debouncedPreview()">
            <span class="field-hint">Paste a link to your cover image</span>
          </div>
        `;
        break;

      case 'body':
        fieldsHtml += `
          <div class="form-group">
            <label for="fieldBody"><i data-lucide="align-left"></i> ${currentType === 'broadcast' ? 'Message' : 'Content'}</label>
            <textarea id="fieldBody" rows="${currentType === 'broadcast' ? 4 : 10}" placeholder="${currentType === 'broadcast' ? 'Write your broadcast message...' : 'Write your content here...\n\nUse Step 1 — Title format for steps\nStart with Pro Tip: for tips\nStart with Warning: for warnings'}" oninput="debouncedPreview()"></textarea>
          </div>
        `;
        break;

      case 'caption':
        fieldsHtml += `
          <div class="form-group">
            <label for="fieldCaption"><i data-lucide="message-square"></i> Caption</label>
            <textarea id="fieldCaption" rows="3" placeholder="Add a caption..." oninput="debouncedPreview()"></textarea>
          </div>
        `;
        break;

      case 'mediaUrl':
        const mediaLabel = currentType === 'video' ? 'Video URL' : currentType === 'audio' ? 'Audio URL' : 'Image URL';
        const mediaPlaceholder = currentType === 'video' ? 'https://youtube.com/watch?v=... or direct video link'
          : currentType === 'audio' ? 'https://example.com/audio.mp3'
          : 'https://example.com/image.jpg';
        fieldsHtml += `
          <div class="form-group">
            <label for="fieldMediaUrl"><i data-lucide="link"></i> ${mediaLabel}</label>
            <input type="url" id="fieldMediaUrl" placeholder="${mediaPlaceholder}" oninput="handleSingleMediaInput()">
            <span class="field-hint">Paste a direct link — no file uploads</span>
          </div>
        `;
        break;

      case 'mediaList':
        fieldsHtml += `
          <div class="form-group">
            <label><i data-lucide="link"></i> Media URLs</label>
            <div class="media-list-input">
              <div class="media-url-row">
                <input type="url" id="fieldMediaAdd" placeholder="Paste a URL and press Add..." onkeydown="if(event.key==='Enter'){event.preventDefault();addMediaUrl();}">
                <button type="button" class="btn-add-media" onclick="addMediaUrl()"><i data-lucide="plus"></i> Add</button>
              </div>
              <div class="media-url-list" id="mediaUrlList"></div>
            </div>
            <span class="field-hint">${currentType === 'document' ? 'Add document page links (each becomes a slide)' : 'Add image/document URLs (min 2 for carousel)'}</span>
          </div>
        `;
        break;

      case 'direction':
        fieldsHtml += `
          <div class="form-group">
            <label for="fieldDirection"><i data-lucide="move"></i> Slide Direction</label>
            <div class="direction-selector">
              <button type="button" class="direction-btn ${currentDirection === 'left' ? 'active' : ''}" onclick="setDirection('left')">
                <i data-lucide="arrow-left"></i> Slide Left
              </button>
              <button type="button" class="direction-btn ${currentDirection === 'right' ? 'active' : ''}" onclick="setDirection('right')">
                <i data-lucide="arrow-right"></i> Slide Right
              </button>
              <button type="button" class="direction-btn ${currentDirection === 'up' ? 'active' : ''}" onclick="setDirection('up')">
                <i data-lucide="arrow-up"></i> Slide Up
              </button>
              <button type="button" class="direction-btn ${currentDirection === 'down' ? 'active' : ''}" onclick="setDirection('down')">
                <i data-lucide="arrow-down"></i> Slide Down
              </button>
            </div>
          </div>
        `;
        break;

      case 'tags':
        fieldsHtml += `
          <div class="form-group">
            <label><i data-lucide="tag"></i> Tags</label>
            <div class="tags-input">
              <div class="tags-display" id="tagsDisplay"></div>
              <div class="tags-options">
                ${['Tech', 'Design', 'DIY', 'Education', 'Cooking', 'Fitness', 'Finance'].map(tag => `
                  <button type="button" class="tag-option ${currentTags.includes(tag) ? 'active' : ''}" onclick="toggleTag('${tag}', this)">
                    ${tag}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case 'audioRecord':
        fieldsHtml += `
          <div class="form-group">
            <label><i data-lucide="mic"></i> Record Audio</label>
            <div class="audio-recorder">
              <button type="button" class="record-btn" id="recordBtn" onclick="toggleRecording()">
                <i data-lucide="mic"></i>
                <span id="recordLabel">Start Recording</span>
              </button>
              <div class="recording-indicator" id="recordingIndicator" style="display:none">
                <span class="recording-dot"></span>
                <span id="recordingTime">00:00</span>
              </div>
              <audio id="recordedAudio" controls style="display:none"></audio>
            </div>
            <span class="field-hint">Or paste an audio URL above</span>
          </div>
        `;
        break;

      case 'broadcastTarget':
        fieldsHtml += `
          <div class="form-group">
            <label><i data-lucide="send"></i> Send To</label>
            <div class="broadcast-targets">
              <button type="button" class="broadcast-target-btn active" onclick="setBroadcastTarget('all', this)">
                <i data-lucide="users"></i> All Followers
              </button>
              <button type="button" class="broadcast-target-btn" onclick="setBroadcastTarget('selected', this)">
                <i data-lucide="user-check"></i> Selected Users
              </button>
            </div>
          </div>
        `;
        break;
    }
  });

  container.innerHTML = fieldsHtml;
  updateMediaList();
  updateTagDisplay();
  refreshIcons();
}

// --- Media URL Management ---
function addMediaUrl() {
  const input = document.getElementById('fieldMediaAdd');
  if (!input) return;
  const url = input.value.trim();
  if (!url) return;

  if (!contentStore.isValidUrl(url)) {
    showToast('Please enter a valid URL (starting with http:// or https://)');
    return;
  }

  mediaUrls.push(url);
  input.value = '';
  updateMediaList();
  updatePreview();
}

function removeMediaUrl(index) {
  mediaUrls.splice(index, 1);
  updateMediaList();
  updatePreview();
}

function updateMediaList() {
  const list = document.getElementById('mediaUrlList');
  if (!list) return;

  if (mediaUrls.length === 0) {
    list.innerHTML = '<div class="media-empty">No media added yet</div>';
    return;
  }

  list.innerHTML = mediaUrls.map((url, i) => `
    <div class="media-url-item">
      <span class="media-url-index">${i + 1}</span>
      <span class="media-url-text" title="${url}">${url.length > 50 ? url.substring(0, 50) + '...' : url}</span>
      <button type="button" class="media-url-remove" onclick="removeMediaUrl(${i})" title="Remove">
        <i data-lucide="x"></i>
      </button>
    </div>
  `).join('');

  refreshIcons();
}

// --- Single Media Input Handler ---
function handleSingleMediaInput() {
  const input = document.getElementById('fieldMediaUrl');
  if (!input) return;
  const url = input.value.trim();
  mediaUrls = url ? [url] : [];
  debouncedPreview();
}

// --- Direction ---
function setDirection(dir) {
  currentDirection = dir;
  document.querySelectorAll('.direction-btn').forEach(btn => {
    const btnDir = btn.onclick.toString().match(/'(\w+)'/)?.[1];
    btn.classList.toggle('active', btnDir === dir);
  });
  updatePreview();
}

// --- Tags ---
function toggleTag(tag, btn) {
  const idx = currentTags.indexOf(tag);
  if (idx >= 0) {
    currentTags.splice(idx, 1);
    if (btn) btn.classList.remove('active');
  } else {
    currentTags.push(tag);
    if (btn) btn.classList.add('active');
  }
  updateTagDisplay();
  debouncedPreview();
}

function updateTagDisplay() {
  const display = document.getElementById('tagsDisplay');
  if (!display) return;

  if (currentTags.length === 0) {
    display.innerHTML = '<span class="tags-placeholder">Select tags below</span>';
    return;
  }

  display.innerHTML = currentTags.map(tag =>
    `<span class="tag-chip">${tag} <button type="button" onclick="toggleTag('${tag}')"><i data-lucide="x"></i></button></span>`
  ).join('');

  refreshIcons();
}

// --- Broadcast Target ---
function setBroadcastTarget(target, btn) {
  document.querySelectorAll('.broadcast-target-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// --- Audio Recording ---
let recordingTimer = null;
let recordingSeconds = 0;

async function toggleRecording() {
  const btn = document.getElementById('recordBtn');
  const label = document.getElementById('recordLabel');
  const indicator = document.getElementById('recordingIndicator');
  const audioEl = document.getElementById('recordedAudio');

  if (audioRecorder && audioRecorder.state === 'recording') {
    // Stop recording
    audioRecorder.stop();
    label.textContent = 'Start Recording';
    btn.classList.remove('recording');
    indicator.style.display = 'none';
    clearInterval(recordingTimer);
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioRecorder = new MediaRecorder(stream);
    audioChunks = [];

    audioRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    audioRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(blob);
      audioEl.src = audioUrl;
      audioEl.style.display = 'block';
      stream.getTracks().forEach(track => track.stop());
      showToast('Audio recorded! Note: For publishing, paste an external audio URL.');
    };

    audioRecorder.start();
    label.textContent = 'Stop Recording';
    btn.classList.add('recording');
    indicator.style.display = 'flex';
    recordingSeconds = 0;
    recordingTimer = setInterval(() => {
      recordingSeconds++;
      const mins = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
      const secs = String(recordingSeconds % 60).padStart(2, '0');
      document.getElementById('recordingTime').textContent = `${mins}:${secs}`;
    }, 1000);
  } catch {
    showToast('Microphone access denied or not available');
  }
}

// --- Preview with Debounce ---
function debouncedPreview() {
  clearTimeout(previewDebounceTimer);
  previewDebounceTimer = setTimeout(updatePreview, 300);
}

function updatePreview() {
  const container = document.getElementById('previewContainer');
  if (!container) return;

  const data = getFormData();
  renderPreviewCard(data, container);
}

// --- Gather Form Data ---
function getFormData() {
  return {
    type: currentType,
    title: document.getElementById('fieldTitle')?.value?.trim() || '',
    body: document.getElementById('fieldBody')?.value?.trim() || document.getElementById('fieldCaption')?.value?.trim() || '',
    coverImage: document.getElementById('fieldCoverImage')?.value?.trim() || '',
    media: [...mediaUrls],
    direction: currentDirection,
    tags: [...currentTags],
    preview: (document.getElementById('fieldBody')?.value?.trim() || document.getElementById('fieldCaption')?.value?.trim() || '').substring(0, 120),
    broadcastTarget: document.querySelector('.broadcast-target-btn.active')?.textContent?.trim()?.includes('All') ? 'all' : 'selected'
  };
}

// --- Publish ---
function publishContent() {
  const data = getFormData();

  // Validate
  const validation = contentStore.validate(data);
  if (!validation.valid) {
    showToast(validation.errors[0]);
    return;
  }

  // Save
  const post = contentStore.saveContent(data);

  showToast('Content published successfully!');

  // Redirect to home after short delay
  setTimeout(() => {
    const isInPages = window.location.pathname.includes('/pages/');
    window.location.href = isInPages ? '../index.html' : 'index.html';
  }, 1000);
}

// --- Save Draft ---
function saveDraft() {
  const data = getFormData();
  if (!data.title && !data.body && mediaUrls.length === 0) {
    showToast('Nothing to save as draft');
    return;
  }

  contentStore.saveDraft(data);
  showToast('Draft saved!');
}

// --- Clear Form ---
function clearForm() {
  mediaUrls = [];
  currentTags = [];
  currentDirection = 'left';
  currentTemplate = null;
  renderFormFields();
  updatePreview();
  renderTemplateSelector();
  refreshIcons();
  showToast('Form cleared');
}
