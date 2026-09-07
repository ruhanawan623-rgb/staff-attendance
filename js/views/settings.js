/**
 * EduTrack Pro - Admin Settings View
 * Configuration for school details, classes, sections, departments, attendance rules, and database reset.
 */

window.SettingsView = {
  render: function(container) {
    const settings = window.db.getSettings();

    const html = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>System & School Settings</h1>
          <p>Configure institution parameters, academic terms, attendance rules, and class hierarchies.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-danger" onclick="SettingsView.confirmResetData()">
            <i data-lucide="refresh-cw"></i> Reset Demo Database
          </button>
          <button class="btn btn-primary" onclick="SettingsView.saveGeneralSettings()">
            <i data-lucide="save"></i> Save All Settings
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
        
        <!-- Left Column: School Profile & Attendance Rules -->
        <div>
          <!-- School Profile Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Institutional Information</div>
            </div>
            <div style="padding: 1.5rem;">
              <form id="settings-general-form">
                <div class="form-grid">
                  <div>
                    <label class="form-label">School / Academy Name *</label>
                    <input type="text" name="schoolName" class="form-input" required value="${settings.schoolName}" />
                  </div>
                  <div>
                    <label class="form-label">School Motto / Tagline</label>
                    <input type="text" name="schoolMotto" class="form-input" value="${settings.schoolMotto}" />
                  </div>
                  <div>
                    <label class="form-label">Academic Year</label>
                    <input type="text" name="academicYear" class="form-input" value="${settings.academicYear}" />
                  </div>
                  <div>
                    <label class="form-label">Current Academic Term</label>
                    <input type="text" name="currentTerm" class="form-input" value="${settings.currentTerm}" />
                  </div>
                  <div>
                    <label class="form-label">Principal / Dean Name</label>
                    <input type="text" name="principalName" class="form-input" value="${settings.principalName}" />
                  </div>
                  <div>
                    <label class="form-label">Official Contact Email</label>
                    <input type="email" name="email" class="form-input" value="${settings.email}" />
                  </div>
                  <div>
                    <label class="form-label">Contact Phone</label>
                    <input type="tel" name="phone" class="form-input" value="${settings.phone}" />
                  </div>
                  <div>
                    <label class="form-label">Campus Address</label>
                    <input type="text" name="address" class="form-input" value="${settings.address}" />
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Attendance Policy & Threshold Rules -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Attendance Policy Rules</div>
            </div>
            <div style="padding: 1.5rem;">
              <form id="settings-rules-form">
                <div class="form-grid">
                  <div>
                    <label class="form-label">Minimum Required Attendance (%)</label>
                    <input type="number" name="minAttendancePercent" class="form-input" min="50" max="100" value="${settings.minAttendancePercent}" />
                    <span style="font-size: 0.72rem; color: var(--text-muted);">Triggers automated low attendance alerts.</span>
                  </div>
                  <div>
                    <label class="form-label">Late Arrival Tolerance (Minutes)</label>
                    <input type="number" name="lateToleranceMinutes" class="form-input" min="0" max="60" value="${settings.lateToleranceMinutes}" />
                    <span style="font-size: 0.72rem; color: var(--text-muted);">Grace time before marking student as late.</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Right Column: Departments & Class Structure -->
        <div>
          <!-- Departments Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Departments (${settings.departments.length})</div>
              <button class="btn btn-secondary btn-sm" onclick="SettingsView.promptAddDepartment()">+ Add</button>
            </div>
            <div style="padding: 1rem 1.5rem; max-height: 250px; overflow-y: auto;">
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${settings.departments.map((dept, idx) => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; background-color: var(--bg-app); border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.85rem;">
                    <span><strong>${dept}</strong></span>
                    <button class="btn btn-danger btn-sm btn-icon-only" style="width: 26px; height: 26px;" onclick="SettingsView.removeDepartment(${idx})">
                      <i data-lucide="x" style="width: 14px;"></i>
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Classes & Sections Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Class Structures</div>
              <button class="btn btn-secondary btn-sm" onclick="SettingsView.promptAddClass()">+ Add Class</button>
            </div>
            <div style="padding: 1rem 1.5rem; max-height: 280px; overflow-y: auto;">
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${settings.classes.map((cls, idx) => `
                  <div style="padding: 0.75rem; background-color: var(--bg-app); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                      <strong style="font-size: 0.9rem; color: var(--primary-600);">${cls.name}</strong>
                      <button class="btn btn-danger btn-sm btn-icon-only" style="width: 24px; height: 24px;" onclick="SettingsView.removeClass(${idx})">
                        <i data-lucide="trash-2" style="width: 13px;"></i>
                      </button>
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">
                      Sections: ${cls.sections.join(', ')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  },

  saveGeneralSettings: function() {
    const generalForm = document.getElementById('settings-general-form');
    const rulesForm = document.getElementById('settings-rules-form');

    if (generalForm && rulesForm) {
      const gData = Object.fromEntries(new FormData(generalForm).entries());
      const rData = Object.fromEntries(new FormData(rulesForm).entries());

      const updated = {
        ...gData,
        minAttendancePercent: parseInt(rData.minAttendancePercent) || 75,
        lateToleranceMinutes: parseInt(rData.lateToleranceMinutes) || 15
      };

      window.db.updateSettings(updated);
      window.app.showToast("Settings updated successfully!", "success");
      window.app.updateHeaderBranding();
    }
  },

  promptAddDepartment: function() {
    window.app.openModal({
      title: "Add Academic / Support Department",
      body: `
        <div>
          <label class="form-label">Department Title *</label>
          <input type="text" id="new-dept-name" class="form-input" placeholder="e.g. Modern Foreign Languages" />
        </div>
      `,
      submitText: "Add Department",
      onSubmit: () => {
        const name = document.getElementById('new-dept-name').value.trim();
        if (name) {
          const settings = window.db.getSettings();
          if (!settings.departments.includes(name)) {
            settings.departments.push(name);
            window.db.updateSettings({ departments: settings.departments });
            window.app.closeModal();
            window.app.showToast(`Department "${name}" added!`, "success");
            SettingsView.render(document.getElementById('content-view'));
          }
        }
      }
    });
  },

  removeDepartment: function(index) {
    const settings = window.db.getSettings();
    const removed = settings.departments.splice(index, 1);
    window.db.updateSettings({ departments: settings.departments });
    window.app.showToast(`Removed department "${removed}".`, "info");
    this.render(document.getElementById('content-view'));
  },

  promptAddClass: function() {
    window.app.openModal({
      title: "Add New Class & Sections",
      body: `
        <div class="form-grid">
          <div class="form-group-full">
            <label class="form-label">Class Name *</label>
            <input type="text" id="new-class-name" class="form-input" placeholder="e.g. Grade 7" />
          </div>
          <div class="form-group-full">
            <label class="form-label">Sections (Comma-separated) *</label>
            <input type="text" id="new-class-sections" class="form-input" placeholder="e.g. A, B, C" value="A, B" />
          </div>
        </div>
      `,
      submitText: "Save Class",
      onSubmit: () => {
        const name = document.getElementById('new-class-name').value.trim();
        const secStr = document.getElementById('new-class-sections').value.trim();
        if (name && secStr) {
          const sections = secStr.split(',').map(s => s.trim()).filter(Boolean);
          const settings = window.db.getSettings();
          settings.classes.push({ name, sections });
          window.db.updateSettings({ classes: settings.classes });
          window.app.closeModal();
          window.app.showToast(`Class "${name}" configured!`, "success");
          SettingsView.render(document.getElementById('content-view'));
        }
      }
    });
  },

  removeClass: function(index) {
    const settings = window.db.getSettings();
    const removed = settings.classes.splice(index, 1);
    window.db.updateSettings({ classes: settings.classes });
    window.app.showToast(`Removed class "${removed[0]?.name}".`, "info");
    this.render(document.getElementById('content-view'));
  },

  confirmResetData: function() {
    window.app.openModal({
      title: "Reset Database to Fresh Seed",
      body: `
        <div style="text-align: center; padding: 1rem 0;">
          <div style="font-size: 2.5rem; color: #ef4444; margin-bottom: 1rem;">⚠️</div>
          <p style="font-size: 1.05rem; font-weight: 700;">Are you sure you want to reset the database?</p>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">
            This will wipe all modified records and re-seed 35+ realistic students, teachers, historical attendance, and leave records.
          </p>
        </div>
      `,
      submitText: "Confirm Reset",
      submitBtnClass: "btn-danger",
      onSubmit: () => {
        window.db.resetToSeed();
        window.app.closeModal();
        window.app.showToast("Database successfully restored to original seed data!", "success");
        window.app.navigate('dashboard');
      }
    });
  }
};
