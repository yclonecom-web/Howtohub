/* ============================================
   HOWTOHUB — User Authentication System
   Login/Register with localStorage persistence
   ============================================ */

class AuthManager {
  constructor() {
    this.usersKey = 'howtohub_users';
    this.sessionKey = 'howtohub_session';
    this.currentUser = null;
    this._loadSession();
  }

  _loadUsers() {
    try {
      const data = localStorage.getItem(this.usersKey);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  _saveUsers(users) {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  _loadSession() {
    try {
      const session = localStorage.getItem(this.sessionKey);
      if (session) {
        const data = JSON.parse(session);
        this.currentUser = data;
        return true;
      }
    } catch { /* no session */ }
    this.currentUser = null;
    return false;
  }

  _saveSession(user) {
    const sessionData = {
      name: user.name,
      username: user.username,
      initials: user.initials,
      bio: user.bio || '',
      email: user.email || '',
      joinDate: user.joinDate
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    this.currentUser = sessionData;
  }

  _hashPassword(password) {
    // Simple hash for client-side demo — not production-grade
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return 'hth_' + Math.abs(hash).toString(36);
  }

  _generateInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
  }

  register(name, username, email, password) {
    if (!name || !username || !password) {
      return { success: false, error: 'Name, username, and password are required' };
    }
    if (username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const users = this._loadUsers();
    const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      return { success: false, error: 'Username already taken' };
    }

    const emailExists = email && users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return { success: false, error: 'Email already registered' };
    }

    const user = {
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: (email || '').trim().toLowerCase(),
      initials: this._generateInitials(name.trim()),
      bio: '',
      password: this._hashPassword(password),
      joinDate: new Date().toISOString(),
      followers: 0,
      following: 0,
      posts: 0
    };

    users.push(user);
    this._saveUsers(users);
    this._saveSession(user);

    return { success: true, user: this.currentUser };
  }

  login(usernameOrEmail, password) {
    if (!usernameOrEmail || !password) {
      return { success: false, error: 'Username/email and password are required' };
    }

    const users = this._loadUsers();
    const hashed = this._hashPassword(password);
    const input = usernameOrEmail.trim().toLowerCase();

    const user = users.find(u =>
      (u.username === input || u.email === input) && u.password === hashed
    );

    if (!user) {
      return { success: false, error: 'Invalid username/email or password' };
    }

    this._saveSession(user);
    return { success: true, user: this.currentUser };
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
    this.currentUser = null;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getUser() {
    return this.currentUser;
  }

  updateProfile(updates) {
    if (!this.currentUser) return { success: false, error: 'Not logged in' };

    const users = this._loadUsers();
    const idx = users.findIndex(u => u.username === this.currentUser.username);
    if (idx === -1) return { success: false, error: 'User not found' };

    if (updates.name) {
      users[idx].name = updates.name.trim();
      users[idx].initials = this._generateInitials(updates.name.trim());
    }
    if (updates.bio !== undefined) users[idx].bio = updates.bio;
    if (updates.email !== undefined) users[idx].email = updates.email.trim().toLowerCase();

    this._saveUsers(users);
    this._saveSession(users[idx]);

    return { success: true, user: this.currentUser };
  }
}

// Global instance
const auth = new AuthManager();

// Update CURRENT_USER based on auth state
function getActiveUser() {
  if (auth.isLoggedIn()) {
    const u = auth.getUser();
    return {
      name: u.name,
      username: u.username,
      initials: u.initials,
      bio: u.bio || 'Exploring, learning, and creating on HowToHub.',
      followers: 128,
      following: 45,
      posts: 3
    };
  }
  return {
    name: "Guest",
    username: "guest",
    initials: "G",
    bio: "Sign in to start creating content.",
    followers: 0,
    following: 0,
    posts: 0
  };
}

// --- Auth Modal Rendering ---
function renderAuthModal() {
  if (document.getElementById('authModal')) return;

  const modal = document.createElement('div');
  modal.id = 'authModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal auth-modal">
      <div class="modal-header">
        <h2 id="authModalTitle">Sign In</h2>
        <button class="modal-close" onclick="closeAuthModal()"><i data-lucide="x"></i></button>
      </div>
      <div class="modal-body">
        <!-- Login Form -->
        <div id="loginForm">
          <div class="form-group">
            <label for="loginUsername"><i data-lucide="user"></i> Username or Email</label>
            <input type="text" id="loginUsername" placeholder="Enter username or email" autocomplete="username">
          </div>
          <div class="form-group">
            <label for="loginPassword"><i data-lucide="lock"></i> Password</label>
            <input type="password" id="loginPassword" placeholder="Enter password" autocomplete="current-password">
          </div>
          <div class="auth-error" id="loginError" style="display:none"></div>
          <button class="upload-btn upload-btn-primary" style="width:100%;margin-top:12px" onclick="handleLogin()">
            <i data-lucide="log-in"></i> Sign In
          </button>
          <p class="auth-switch">Don't have an account? <a href="#" onclick="showRegisterForm(event)">Create one</a></p>
        </div>

        <!-- Register Form -->
        <div id="registerForm" style="display:none">
          <div class="form-group">
            <label for="regName"><i data-lucide="user"></i> Display Name</label>
            <input type="text" id="regName" placeholder="Your display name" autocomplete="name">
          </div>
          <div class="form-group">
            <label for="regUsername"><i data-lucide="at-sign"></i> Username</label>
            <input type="text" id="regUsername" placeholder="Choose a username" autocomplete="username">
          </div>
          <div class="form-group">
            <label for="regEmail"><i data-lucide="mail"></i> Email <span class="optional-badge">Optional</span></label>
            <input type="email" id="regEmail" placeholder="your@email.com" autocomplete="email">
          </div>
          <div class="form-group">
            <label for="regPassword"><i data-lucide="lock"></i> Password</label>
            <input type="password" id="regPassword" placeholder="At least 6 characters" autocomplete="new-password">
          </div>
          <div class="auth-error" id="registerError" style="display:none"></div>
          <button class="upload-btn upload-btn-primary" style="width:100%;margin-top:12px" onclick="handleRegister()">
            <i data-lucide="user-plus"></i> Create Account
          </button>
          <p class="auth-switch">Already have an account? <a href="#" onclick="showLoginForm(event)">Sign in</a></p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  refreshIcons();
}

function openAuthModal() {
  renderAuthModal();
  document.getElementById('authModal').classList.add('active');
  refreshIcons();
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('active');
}

function showRegisterForm(e) {
  if (e) e.preventDefault();
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
  document.getElementById('authModalTitle').textContent = 'Create Account';
  refreshIcons();
}

function showLoginForm(e) {
  if (e) e.preventDefault();
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('authModalTitle').textContent = 'Sign In';
  refreshIcons();
}

function handleLogin() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  const result = auth.login(username, password);
  if (result.success) {
    closeAuthModal();
    showToast('Welcome back, ' + result.user.name + '!');
    updateAuthUI();
    setTimeout(() => window.location.reload(), 500);
  } else {
    errorEl.textContent = result.error;
    errorEl.style.display = 'block';
  }
}

function handleRegister() {
  const name = document.getElementById('regName').value;
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const errorEl = document.getElementById('registerError');

  const result = auth.register(name, username, email, password);
  if (result.success) {
    closeAuthModal();
    showToast('Account created! Welcome, ' + result.user.name + '!');
    updateAuthUI();
    setTimeout(() => window.location.reload(), 500);
  } else {
    errorEl.textContent = result.error;
    errorEl.style.display = 'block';
  }
}

function handleLogout() {
  auth.logout();
  showToast('Signed out');
  updateAuthUI();
  setTimeout(() => window.location.reload(), 500);
}

function updateAuthUI() {
  const user = getActiveUser();

  // Update nav avatar
  document.querySelectorAll('.nav-avatar').forEach(el => {
    el.textContent = user.initials;
  });

  // Update auth button in nav
  const authBtn = document.getElementById('navAuthBtn');
  if (authBtn) {
    if (auth.isLoggedIn()) {
      authBtn.innerHTML = '<i data-lucide="log-out"></i>';
      authBtn.title = 'Sign out';
      authBtn.onclick = handleLogout;
    } else {
      authBtn.innerHTML = '<i data-lucide="log-in"></i>';
      authBtn.title = 'Sign in';
      authBtn.onclick = openAuthModal;
    }
    refreshIcons();
  }
}

// Enter key support for auth forms
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const modal = document.getElementById('authModal');
    if (modal && modal.classList.contains('active')) {
      const loginForm = document.getElementById('loginForm');
      if (loginForm && loginForm.style.display !== 'none') {
        handleLogin();
      } else {
        handleRegister();
      }
    }
  }
});
