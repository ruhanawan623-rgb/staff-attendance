/**
 * EduTrack Pro - Core Application Controller
 * Handles routing, session, theming, modal dispatch, toasts, and reactive updates.
 */

class Application {
  constructor() {
    this.currentView = 'dashboard';
    this.currentUser = null;
    this.theme = localStorage.getItem('EDUTRACK_THEME') || 'light';
    this.uiSizeLevels = ['compact', 'normal', 'large', 'xlarge'];
    this.uiSizeLabels = {
      compact: 'Compact (15px)',
      normal: 'Default (16px)',
      large: 'Large (18px)',
      xlarge: 'Extra Large (20px)'
    };
    this.uiSize = localStorage.getItem('EDUTRACK_UI_SIZE') || 'large';
    this.activeModalCallback = null;
    this.init();
  }

  init() {
    // Apply saved theme & UI size
    this.applyTheme(this.theme);
    this.applyUiSize(this.uiSize, false);

    // Set initial user (Admin by default)
    const storedUser = localStorage.getItem('EDUTRACK_CURRENT_USER');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (e) {
        this.currentUser = null;
      }
    }

    if (!this.currentUser || this.currentUser.name === 'Sarah Jenkins' || this.currentUser.name === 'Dr. Eleanor Vance' || (this.currentUser.role === 'admin' && this.currentUser.name !== 'PDCS Admin')) {
      this.currentUser = window.db.data.users[0];
      this.currentUser.name = 'PDCS Admin';
      localStorage.setItem('EDUTRACK_CURRENT_USER', JSON.stringify(this.currentUser));
    }

    this.updateHeaderBranding();
    this.updateHeaderUserProfile();
    this.updateSidebarNavForRole();

    // Start Live Clock
    this.startLiveClock();

    // Subscribe to DB changes for reactive updates
    window.db.subscribe((entity) => {
      this.updateHeaderNotificationBadge();
      if (['dashboard', 'student-attendance', 'staff-attendance', 'leaves', 'notifications'].includes(this.currentView)) {
        // Can re-render if needed
      }
    });

    // Handle initial navigation
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigate(hash, false);
  }

  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('EDUTRACK_CURRENT_USER', JSON.stringify(user));
    this.updateHeaderUserProfile();
    this.updateSidebarNavForRole();
  }

  navigate(viewName, updateHash = true) {
    // If login or signup view requested
    if (viewName === 'login' || viewName === 'signup') {
      this.currentView = viewName;
      document.getElementById('app-shell').style.display = 'none';
      document.getElementById('auth-shell').style.display = 'block';
      if (window.AuthView) {
        window.AuthView.mode = viewName === 'signup' ? 'signup' : 'login';
        window.AuthView.render(document.getElementById('auth-shell'));
      }
      if (updateHash) window.location.hash = viewName;
      return;
    }

    // Ensure main app shell is visible
    document.getElementById('app-shell').style.display = 'flex';
    document.getElementById('auth-shell').style.display = 'none';

    this.currentView = viewName;
    if (updateHash) window.location.hash = viewName;

    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile sidebar if open
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    // Render corresponding view
    const container = document.getElementById('content-view');
    if (!container) return;

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (viewName) {
      case 'dashboard':
        window.DashboardView.render(container);
        break;
      case 'students':
        window.StudentsView.render(container);
        break;
      case 'staff':
        window.StaffView.render(container);
        break;
      case 'student-attendance':
        window.StudentAttendanceView.render(container);
        break;
      case 'staff-attendance':
        window.StaffAttendanceView.render(container);
        break;
      case 'leaves':
        window.LeavesView.render(container);
        break;
      case 'reports':
        window.ReportsView.render(container);
        break;
      case 'calendar':
        window.CalendarView.render(container);
        break;
      case 'notifications':
        window.NotificationsView.render(container);
        break;
      case 'settings':
        window.SettingsView.render(container);
        break;
      default:
        window.DashboardView.render(container);
    }

    this.updateHeaderNotificationBadge();
    this.updateHeaderUserProfile();
    this.updateSidebarNavForRole();
  }

  refreshCurrentView() {
    this.navigate(this.currentView, false);
  }

  // --- THEME MANAGEMENT ---
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.theme);
    localStorage.setItem('EDUTRACK_THEME', this.theme);
    this.refreshCurrentView();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // --- UI SCALE & FONT SIZING MANAGEMENT ---
  increaseUiSize() {
    const idx = this.uiSizeLevels.indexOf(this.uiSize);
    if (idx < this.uiSizeLevels.length - 1) {
      this.setUiSize(this.uiSizeLevels[idx + 1]);
    } else {
      this.showToast('Already at maximum display size (Extra Large)', 'info');
    }
  }

  decreaseUiSize() {
    const idx = this.uiSizeLevels.indexOf(this.uiSize);
    if (idx > 0) {
      this.setUiSize(this.uiSizeLevels[idx - 1]);
    } else {
      this.showToast('Already at minimum display size (Compact)', 'info');
    }
  }

  cycleUiSize() {
    const idx = this.uiSizeLevels.indexOf(this.uiSize);
    const nextIdx = (idx + 1) % this.uiSizeLevels.length;
    this.setUiSize(this.uiSizeLevels[nextIdx]);
  }

  setUiSize(size) {
    this.uiSize = size;
    localStorage.setItem('EDUTRACK_UI_SIZE', size);
    this.applyUiSize(size, true);
  }

  applyUiSize(size, showFeedback = false) {
    document.documentElement.setAttribute('data-ui-size', size);
    const labelEl = document.getElementById('header-ui-size-label');
    const labelMap = { compact: 'Compact', normal: 'Default', large: 'Large', xlarge: 'Extra' };
    if (labelEl) labelEl.innerText = labelMap[size] || 'Large';
    if (showFeedback) {
      this.showToast(`Display size set to ${this.uiSizeLabels[size]}`, 'info');
    }
  }

  // --- HEADER & LIVE CLOCK ---
  startLiveClock() {
    const updateTime = () => {
      const el = document.getElementById('header-live-time');
      if (el) {
        const now = new Date();
        const datePart = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        el.innerText = `${datePart} · ${timePart}`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  updateHeaderBranding() {
    const settings = window.db.getSettings();
    const logoEl = document.getElementById('brand-logo-icon');
    const titleEl = document.getElementById('brand-title-text');
    const subEl = document.getElementById('brand-sub-text');

    if (logoEl) logoEl.innerText = settings.schoolLogo || '🏫';
    if (titleEl) titleEl.innerText = settings.schoolName;
    if (subEl) subEl.innerText = settings.academicYear;
  }

  updateHeaderUserProfile() {
    if (!this.currentUser) return;

    if (this.currentUser.name === 'Sarah Jenkins' || this.currentUser.name === 'Dr. Eleanor Vance') {
      this.currentUser.name = 'PDCS Admin';
    }

    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    const avatarEl = document.getElementById('header-user-avatar');
    const miniNameEl = document.getElementById('mini-user-name');
    const miniRoleEl = document.getElementById('mini-user-role');
    const miniAvatarEl = document.getElementById('mini-user-avatar');

    if (nameEl) nameEl.innerText = this.currentUser.name;
    if (roleEl) roleEl.innerText = this.currentUser.role;
    if (avatarEl) avatarEl.src = this.currentUser.avatar;

    if (miniNameEl) miniNameEl.innerText = this.currentUser.name;
    if (miniRoleEl) miniRoleEl.innerText = this.currentUser.role;
    if (miniAvatarEl) miniAvatarEl.src = this.currentUser.avatar;

    // Sync quick role selector dropdown
    const roleSelect = document.getElementById('header-role-select');
    if (roleSelect) roleSelect.value = this.currentUser.role;
  }

  updateSidebarNavForRole() {
    const role = this.currentUser?.role || 'admin';
    
    // Hide or show items based on role
    document.querySelectorAll('.nav-item').forEach(item => {
      const view = item.getAttribute('data-view');
      if (role === 'staff') {
        if (['student-attendance', 'staff', 'settings'].includes(view)) {
          item.style.display = 'none';
        } else {
          item.style.display = 'flex';
        }
      } else if (role === 'teacher') {
        if (['staff', 'settings'].includes(view)) {
          item.style.display = 'none';
        } else {
          item.style.display = 'flex';
        }
      } else {
        item.style.display = 'flex'; // Admin has full access
      }
    });
  }

  handleRoleChange(role) {
    const user = window.db.data.users.find(u => u.role === role) || window.db.data.users[0];
    this.setCurrentUser(user);
    this.showToast(`Switched view to ${user.name} (${role.toUpperCase()})`, 'info');
    this.refreshCurrentView();
  }

  // --- NOTIFICATIONS POPOVER ---
  toggleNotificationsPopover() {
    const dropdown = document.getElementById('notifications-dropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('active');

    if (dropdown.classList.contains('active')) {
      const notifications = window.db.getNotifications();
      const listEl = document.getElementById('ntf-dropdown-list');
      if (listEl) {
        listEl.innerHTML = notifications.slice(0, 5).map(n => `
          <div class="ntf-item ${n.read ? '' : 'unread'}" onclick="window.app.navigate('notifications'); window.app.toggleNotificationsPopover();">
            <div>
              <div style="font-size: 0.85rem; font-weight: 700;">${n.title}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${n.message}</div>
            </div>
          </div>
        `).join('');
      }
    }
  }

  updateHeaderNotificationBadge() {
    const unread = window.db.getNotifications().filter(n => !n.read).length;
    const dot = document.getElementById('ntf-badge-dot');
    const navBadge = document.getElementById('sidebar-ntf-badge');

    if (dot) dot.style.display = unread > 0 ? 'block' : 'none';
    if (navBadge) {
      navBadge.innerText = unread;
      navBadge.style.display = unread > 0 ? 'inline-block' : 'none';
    }
  }

  // --- MODAL ENGINE ---
  openModal({ title, body, submitText = 'Confirm', submitBtnClass = 'btn-primary', onSubmit = null, hideSubmit = false }) {
    const overlay = document.getElementById('app-modal-overlay');
    const titleEl = document.getElementById('modal-title-text');
    const bodyEl = document.getElementById('modal-body-content');
    const submitBtn = document.getElementById('modal-submit-btn');

    if (!overlay) return;

    if (titleEl) titleEl.innerText = title;
    if (bodyEl) bodyEl.innerHTML = body;

    if (submitBtn) {
      if (hideSubmit) {
        submitBtn.style.display = 'none';
      } else {
        submitBtn.style.display = 'inline-flex';
        submitBtn.innerText = submitText;
        submitBtn.className = `btn ${submitBtnClass}`;
      }
    }

    this.activeModalCallback = onSubmit;
    overlay.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
  }

  closeModal() {
    const overlay = document.getElementById('app-modal-overlay');
    if (overlay) overlay.classList.remove('active');
    this.activeModalCallback = null;
  }

  handleModalSubmit() {
    if (this.activeModalCallback && typeof this.activeModalCallback === 'function') {
      this.activeModalCallback();
    }
  }

  // --- TOAST ENGINE ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error' || type === 'danger') iconName = 'alert-octagon';
    if (type === 'warning') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span style="font-size: 0.88rem; font-weight: 600;">${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.toggle('mobile-open');
  }

  handleGlobalSearch(query) {
    if (!query.trim()) return;
    // Route to students view with search
    window.StudentsView.filters.search = query;
    this.navigate('students');
  }

  logout() {
    localStorage.removeItem('EDUTRACK_CURRENT_USER');
    this.currentUser = null;
    this.showToast("Logged out successfully.", "info");
    this.navigate('login');
  }
}

// Global Application Instance
window.addEventListener('DOMContentLoaded', () => {
  window.app = new Application();
  window.app.updateHeaderBranding();
  if (window.lucide) window.lucide.createIcons();
});
