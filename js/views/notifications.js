/**
 * EduTrack Pro - Notifications Center View
 * Displays institutional alerts, leave updates, low-attendance warnings, and reminder logs.
 */

window.NotificationsView = {
  render: function(container) {
    const notifications = window.db.getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    const html = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Notification & Alert Center</h1>
          <p>Real-time notifications regarding student absences, faculty leaves, and system notices.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="NotificationsView.markAllRead()">
            <i data-lucide="check-check"></i> Mark All as Read
          </button>
          <button class="btn btn-secondary" onclick="NotificationsView.clearAll()">
            <i data-lucide="trash"></i> Clear All
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title" style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="bell" style="width: 20px; color: var(--primary-600);"></i>
            All Notifications (${notifications.length})
            ${unreadCount > 0 ? `<span class="badge badge-absent">${unreadCount} New</span>` : ''}
          </div>
        </div>

        <div style="padding: 0;">
          ${notifications.length === 0 ? `
            <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
              <i data-lucide="bell-off" style="width: 48px; height: 48px; margin-bottom: 0.75rem; opacity: 0.4;"></i>
              <p style="font-size: 1.05rem; font-weight: 600;">No notifications found</p>
              <p style="font-size: 0.85rem; color: var(--text-light);">You're completely caught up with all campus alerts.</p>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column;">
              ${notifications.map(n => `
                <div 
                  style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: flex-start; gap: 1rem; background-color: ${n.read ? 'transparent' : 'var(--primary-50)'}; transition: background-color var(--transition-fast); cursor: pointer;"
                  onclick="NotificationsView.handleClick('${n.id}', '${n.link || 'dashboard'}')"
                >
                  <div style="width: 40px; height: 40px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background-color: ${
                    n.type === 'alert' ? 'var(--status-absent-bg)' :
                    n.type === 'leave' ? 'var(--status-leave-bg)' :
                    n.type === 'success' ? 'var(--status-present-bg)' : 'var(--bg-app)'
                  }; color: ${
                    n.type === 'alert' ? 'var(--status-absent-text)' :
                    n.type === 'leave' ? 'var(--status-leave-text)' :
                    n.type === 'success' ? 'var(--status-present-text)' : 'var(--primary-600)'
                  };">
                    <i data-lucide="${
                      n.type === 'alert' ? 'alert-circle' :
                      n.type === 'leave' ? 'calendar-clock' :
                      n.type === 'success' ? 'check-circle' : 'info'
                    }"></i>
                  </div>

                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem;">
                      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${n.title}</h4>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.4;">${n.message}</p>
                  </div>

                  ${!n.read ? `
                    <div style="width: 8px; height: 8px; border-radius: var(--radius-full); background-color: var(--primary-600); margin-top: 6px;"></div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  },

  handleClick: function(id, link) {
    window.db.markNotificationAsRead(id);
    window.app.updateHeaderNotificationBadge();
    if (link) {
      window.app.navigate(link);
    } else {
      this.render(document.getElementById('content-view'));
    }
  },

  markAllRead: function() {
    window.db.markAllNotificationsRead();
    window.app.updateHeaderNotificationBadge();
    this.render(document.getElementById('content-view'));
    window.app.showToast("All notifications marked as read.", "info");
  },

  clearAll: function() {
    window.db.clearNotifications();
    window.app.updateHeaderNotificationBadge();
    this.render(document.getElementById('content-view'));
    window.app.showToast("Notifications cleared.", "info");
  }
};
