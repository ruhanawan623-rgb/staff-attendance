/**
 * EduTrack Pro - Authentication View
 * Full-featured Login & Sign Up System with role selection, demo quick-fill,
 * password visibility toggling, account registration, and session management.
 */

window.AuthView = {
  mode: 'login', // 'login' | 'signup'
  selectedSignUpRole: 'staff', // 'staff' | 'teacher' | 'admin'

  setMode: function(mode) {
    this.mode = mode;
    const container = document.getElementById('auth-shell');
    if (container) {
      this.render(container);
    }
  },

  selectSignUpRole: function(role) {
    this.selectedSignUpRole = role;
    const cards = document.querySelectorAll('.role-radio-card');
    cards.forEach(c => {
      if (c.getAttribute('data-role') === role) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    const titleInput = document.getElementById('signup-title');
    if (titleInput) {
      if (role === 'admin') titleInput.value = 'Department Administrator';
      else if (role === 'teacher') titleInput.value = 'Faculty Instructor';
      else titleInput.value = 'Senior Administrative Staff';
    }
  },

  togglePasswordVisibility: function(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      if (icon) icon.setAttribute('data-lucide', 'eye-off');
    } else {
      input.type = 'password';
      if (icon) icon.setAttribute('data-lucide', 'eye');
    }
    if (window.lucide) window.lucide.createIcons();
  },

  render: function(container) {
    const settings = window.db.getSettings();
    const departments = window.db.getDepartments();

    const html = `
      <div class="login-page-container">
        <div class="login-box">
          <div class="login-logo">${settings.schoolLogo || '💼'}</div>
          <h1 class="login-title">${settings.schoolName}</h1>
          <p class="login-subtitle">Staff Attendance Portal</p>

          <!-- Mode Switcher Tabs (Sign In vs Sign Up) -->
          <div class="auth-mode-tabs">
            <button 
              type="button" 
              class="auth-mode-tab ${this.mode === 'login' ? 'active' : ''}" 
              onclick="AuthView.setMode('login')"
            >
              <i data-lucide="log-in" style="width: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
              Sign In
            </button>
            <button 
              type="button" 
              class="auth-mode-tab ${this.mode === 'signup' ? 'active' : ''}" 
              onclick="AuthView.setMode('signup')"
            >
              <i data-lucide="user-plus" style="width: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i>
              Create Account
            </button>
          </div>

          ${this.mode === 'login' ? this.renderLoginForm() : this.renderSignUpForm(departments)}

          <div style="margin-top: 1.5rem; text-align: center; font-size: 0.78rem; color: var(--text-muted);">
            EduTrack Pro • Enterprise Campus Attendance System
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  },

  // =========================================================================
  // LOGIN FORM
  // =========================================================================
  renderLoginForm: function() {
    return `
      <!-- Demo Quick Role Fill Pills -->
      <div style="text-align: center; margin-bottom: 0.5rem; font-size: 0.76rem; color: var(--text-muted); font-weight: 700; letter-spacing: 0.04em;">
        QUICK DEMO ACCESS:
      </div>
      <div class="demo-pills">
        <button type="button" class="demo-pill active" onclick="AuthView.setDemoRole('admin', event)">
          👑 Administrator
        </button>
        <button type="button" class="demo-pill" onclick="AuthView.setDemoRole('teacher', event)">
          👨‍🏫 Faculty / Teacher
        </button>
        <button type="button" class="demo-pill" onclick="AuthView.setDemoRole('staff', event)">
          💼 Staff Member
        </button>
      </div>

      <form id="login-form" onsubmit="AuthView.handleLogin(event)">
        <!-- Email Input -->
        <div style="margin-bottom: 1.15rem;">
          <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Email or Username</label>
          <div style="position: relative;">
            <input 
              type="email" 
              id="login-email" 
              class="form-input" 
              required 
              value="admin@school.edu"
              placeholder="name@school.edu" 
              style="padding-left: 2.3rem; height: 44px;"
            />
            <i data-lucide="mail" style="position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-muted); pointer-events: none;"></i>
          </div>
        </div>

        <!-- Password Input -->
        <div style="margin-bottom: 1.15rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <label class="form-label" style="margin-bottom: 0; font-size: 0.82rem; font-weight: 600;">Password</label>
            <a href="javascript:void(0)" onclick="window.app.showToast('Demo Password: password123 (or admin123)', 'info')" style="font-size: 0.78rem; color: var(--primary-600); font-weight: 600;">Forgot Password?</a>
          </div>
          <div style="position: relative;">
            <input 
              type="password" 
              id="login-password" 
              class="form-input" 
              required 
              value="password123" 
              placeholder="••••••••" 
              style="padding-left: 2.3rem; padding-right: 2.5rem; height: 44px;"
            />
            <i data-lucide="lock" style="position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-muted); pointer-events: none;"></i>
            <button 
              type="button" 
              class="password-toggle-btn" 
              onclick="AuthView.togglePasswordVisibility('login-password', 'login-pwd-icon')"
              title="Show / Hide Password"
            >
              <i data-lucide="eye" id="login-pwd-icon" style="width: 17px;"></i>
            </button>
          </div>
        </div>

        <!-- Remember Me Checkbox -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.35rem; font-size: 0.85rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text-muted); font-size: 0.82rem;">
            <input type="checkbox" id="login-remember" checked style="accent-color: var(--primary-600);" />
            <span>Keep me signed in on this device</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn btn-primary" style="width: 100%; height: 46px; font-size: 0.95rem; font-weight: 700; border-radius: var(--radius-md);">
          <i data-lucide="log-in" style="width: 18px;"></i> Sign In to Portal
        </button>

        <!-- Switch to Signup Link -->
        <div style="margin-top: 1.25rem; text-align: center; font-size: 0.84rem; color: var(--text-muted);">
          Don't have an account yet? 
          <a href="javascript:void(0)" onclick="AuthView.setMode('signup')" style="color: var(--primary-600); font-weight: 700; margin-left: 4px;">Sign Up Now</a>
        </div>
      </form>
    `;
  },

  // =========================================================================
  // SIGN UP FORM
  // =========================================================================
  renderSignUpForm: function(departments) {
    return `
      <form id="signup-form" onsubmit="AuthView.handleSignUp(event)">
        <!-- Full Name -->
        <div style="margin-bottom: 1rem;">
          <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Full Name</label>
          <div style="position: relative;">
            <input 
              type="text" 
              id="signup-name" 
              class="form-input" 
              required 
              placeholder="e.g. Dr. Arthur Edwards" 
              style="padding-left: 2.3rem; height: 42px;"
            />
            <i data-lucide="user" style="position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-muted); pointer-events: none;"></i>
          </div>
        </div>

        <!-- Email Address -->
        <div style="margin-bottom: 1rem;">
          <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Institutional Email</label>
          <div style="position: relative;">
            <input 
              type="email" 
              id="signup-email" 
              class="form-input" 
              required 
              placeholder="name@school.edu" 
              style="padding-left: 2.3rem; height: 42px;"
            />
            <i data-lucide="mail" style="position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-muted); pointer-events: none;"></i>
          </div>
        </div>

        <!-- Role Selection -->
        <div style="margin-bottom: 1rem;">
          <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Select Account Role</label>
          <div class="role-radio-grid">
            <div 
              class="role-radio-card ${this.selectedSignUpRole === 'staff' ? 'active' : ''}" 
              data-role="staff"
              onclick="AuthView.selectSignUpRole('staff')"
            >
              <i data-lucide="briefcase" style="width: 18px;"></i>
              <span style="font-size: 0.8rem; font-weight: 700;">Staff</span>
            </div>
            <div 
              class="role-radio-card ${this.selectedSignUpRole === 'teacher' ? 'active' : ''}" 
              data-role="teacher"
              onclick="AuthView.selectSignUpRole('teacher')"
            >
              <i data-lucide="graduation-cap" style="width: 18px;"></i>
              <span style="font-size: 0.8rem; font-weight: 700;">Faculty</span>
            </div>
            <div 
              class="role-radio-card ${this.selectedSignUpRole === 'admin' ? 'active' : ''}" 
              data-role="admin"
              onclick="AuthView.selectSignUpRole('admin')"
            >
              <i data-lucide="shield-check" style="width: 18px;"></i>
              <span style="font-size: 0.8rem; font-weight: 700;">Admin</span>
            </div>
          </div>
        </div>

        <!-- Department and Designation Row -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 1rem;">
          <div>
            <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Department</label>
            <select id="signup-department" class="form-select" style="height: 42px; font-size: 0.82rem;">
              ${departments.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Designation / Title</label>
            <input 
              type="text" 
              id="signup-title" 
              class="form-input" 
              required 
              value="Senior Administrative Staff" 
              placeholder="e.g. Lecturer" 
              style="height: 42px; font-size: 0.82rem;"
            />
          </div>
        </div>

        <!-- Password and Confirm Password Row -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 1.15rem;">
          <div>
            <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Password</label>
            <div style="position: relative;">
              <input 
                type="password" 
                id="signup-password" 
                class="form-input" 
                required 
                minlength="6"
                placeholder="Min 6 chars" 
                style="padding-left: 2rem; padding-right: 2.2rem; height: 42px; font-size: 0.82rem;"
              />
              <i data-lucide="lock" style="position: absolute; left: 0.65rem; top: 50%; transform: translateY(-50%); width: 14px; color: var(--text-muted); pointer-events: none;"></i>
              <button 
                type="button" 
                class="password-toggle-btn" 
                onclick="AuthView.togglePasswordVisibility('signup-password', 'signup-pwd-icon')"
                title="Toggle Password"
                style="right: 0.4rem;"
              >
                <i data-lucide="eye" id="signup-pwd-icon" style="width: 15px;"></i>
              </button>
            </div>
          </div>
          <div>
            <label class="form-label" style="font-size: 0.82rem; font-weight: 600;">Confirm Password</label>
            <div style="position: relative;">
              <input 
                type="password" 
                id="signup-confirm-password" 
                class="form-input" 
                required 
                minlength="6"
                placeholder="Repeat password" 
                style="padding-left: 2rem; padding-right: 2.2rem; height: 42px; font-size: 0.82rem;"
              />
              <i data-lucide="check-circle" style="position: absolute; left: 0.65rem; top: 50%; transform: translateY(-50%); width: 14px; color: var(--text-muted); pointer-events: none;"></i>
              <button 
                type="button" 
                class="password-toggle-btn" 
                onclick="AuthView.togglePasswordVisibility('signup-confirm-password', 'signup-cpwd-icon')"
                title="Toggle Password"
                style="right: 0.4rem;"
              >
                <i data-lucide="eye" id="signup-cpwd-icon" style="width: 15px;"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Agreement Terms -->
        <div style="margin-bottom: 1.25rem;">
          <label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; color: var(--text-muted); font-size: 0.78rem; line-height: 1.4;">
            <input type="checkbox" required checked style="accent-color: var(--primary-600); margin-top: 2px;" />
            <span>I agree to institutional attendance compliance & campus data policies.</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn btn-primary" style="width: 100%; height: 46px; font-size: 0.95rem; font-weight: 700; border-radius: var(--radius-md);">
          <i data-lucide="user-plus" style="width: 18px;"></i> Create Account & Sign In
        </button>

        <!-- Switch to Login Link -->
        <div style="margin-top: 1.15rem; text-align: center; font-size: 0.84rem; color: var(--text-muted);">
          Already have an account? 
          <a href="javascript:void(0)" onclick="AuthView.setMode('login')" style="color: var(--primary-600); font-weight: 700; margin-left: 4px;">Sign In Here</a>
        </div>
      </form>
    `;
  },

  setDemoRole: function(role, event) {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const pills = document.querySelectorAll('.demo-pill');
    pills.forEach(p => p.classList.remove('active'));

    const user = window.db.data.users.find(u => u.role === role);
    if (user && emailInput) {
      emailInput.value = user.email;
    }
    if (passwordInput) {
      passwordInput.value = user ? (user.password || 'password123') : 'password123';
    }

    if (event && event.currentTarget) {
      event.currentTarget.classList.add('active');
    }
  },

  handleLogin: function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const result = window.db.authenticate(email, password);
    if (!result.success) {
      window.app.showToast(result.message, "danger");
      return;
    }

    window.app.setCurrentUser(result.user);
    window.app.showToast(`Welcome back, ${result.user.name}!`, "success");
    window.app.navigate('dashboard');
  },

  handleSignUp: function(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const role = this.selectedSignUpRole;
    const department = document.getElementById('signup-department').value;
    const title = document.getElementById('signup-title').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
      window.app.showToast("Passwords do not match! Please check and re-enter.", "danger");
      return;
    }

    if (password.length < 6) {
      window.app.showToast("Password must be at least 6 characters long.", "danger");
      return;
    }

    const result = window.db.registerUser({
      name: name,
      email: email,
      role: role,
      department: department,
      title: title,
      password: password
    });

    if (!result.success) {
      window.app.showToast(result.message, "danger");
      return;
    }

    // Automatically log in the newly registered user
    window.app.setCurrentUser(result.user);
    window.app.showToast(`Account created successfully! Welcome, ${result.user.name}.`, "success");
    window.app.navigate('dashboard');
  }
};
