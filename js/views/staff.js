/**
 * EduTrack Pro - Teacher & Staff Management View
 * Handles Staff directory, department filters, Add/Edit/Delete, and Staff Profiles.
 */

window.StaffView = {
  currentPage: 1,
  pageSize: 8,
  filters: {
    search: '',
    department: 'all',
    status: 'all'
  },

  render: function(container) {
    const departments = window.db.getDepartments();
    const staffList = window.db.getStaff(this.filters);

    const totalItems = staffList.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginatedStaff = staffList.slice(startIndex, startIndex + this.pageSize);

    const html = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Faculty & Staff Management</h1>
          <p>Manage teachers, administrators, and campus personnel details and records.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="StaffView.openAddModal()">
            <i data-lucide="user-plus"></i> Add Faculty / Staff
          </button>
        </div>
      </div>

      <div class="card">
        <!-- Filter Toolbar -->
        <div class="filter-bar">
          <div class="filter-group">
            <div style="position: relative; width: 240px;">
              <input 
                type="text" 
                class="form-input" 
                placeholder="Search staff, ID, designation..." 
                value="${this.filters.search}"
                oninput="StaffView.handleSearch(this.value)"
                style="padding-left: 2rem;"
              />
              <i data-lucide="search" style="position: absolute; left: 0.65rem; top: 50%; transform: translateY(-50%); width: 15px; color: var(--text-muted);"></i>
            </div>

            <!-- Department Filter -->
            <select class="filter-select" onchange="StaffView.handleDepartmentFilter(this.value)">
              <option value="all" ${this.filters.department === 'all' ? 'selected' : ''}>All Departments</option>
              ${departments.map(d => `<option value="${d}" ${this.filters.department === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>

            <!-- Status Filter -->
            <select class="filter-select" onchange="StaffView.handleStatusFilter(this.value)">
              <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>All Status</option>
              <option value="active" ${this.filters.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="inactive" ${this.filters.status === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-muted);">
            Showing <strong>${staffList.length}</strong> active faculty members
          </div>
        </div>

        <!-- Staff Data Table -->
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Staff ID</th>
                <th>Designation & Dept</th>
                <th>Contact Phone</th>
                <th>Email</th>
                <th>Joining Date</th>
                <th>Attendance</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paginatedStaff.length === 0 ? `
                <tr>
                  <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i data-lucide="users" style="width: 40px; height: 40px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    <p>No faculty members match your criteria.</p>
                  </td>
                </tr>
              ` : paginatedStaff.map(member => {
                const attRate = member.attendancePercent || 0;
                let rateBadgeClass = 'badge-present';
                if (attRate < 80) rateBadgeClass = 'badge-absent';
                else if (attRate < 90) rateBadgeClass = 'badge-late';

                return `
                  <tr>
                    <td>
                      <div class="table-user-cell">
                        <img src="${member.avatar}" class="table-user-avatar" alt="${member.name}" />
                        <div>
                          <div class="table-user-name">${member.name}</div>
                          <div class="table-user-sub">${member.qualification || 'Certified Faculty'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style="font-weight: 600; font-family: monospace;">${member.id}</span></td>
                    <td>
                      <div><strong>${member.designation}</strong></div>
                      <div style="font-size: 0.76rem; color: var(--primary-600);">${member.department}</div>
                    </td>
                    <td>${member.phone}</td>
                    <td style="font-size: 0.82rem; color: var(--text-muted);">${member.email}</td>
                    <td>${member.joiningDate}</td>
                    <td>
                      <span class="badge ${rateBadgeClass}">
                        ${attRate}%
                      </span>
                    </td>
                    <td>
                      <span class="badge ${member.status === 'Active' ? 'badge-active' : 'badge-inactive'}">
                        ${member.status}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 0.35rem;">
                        <button class="btn btn-secondary btn-sm btn-icon-only" title="View Profile" onclick="StaffView.viewProfile('${member.id}')">
                          <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm btn-icon-only" title="Edit Staff" onclick="StaffView.openEditModal('${member.id}')">
                          <i data-lucide="edit-3"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-icon-only" title="Delete Staff" onclick="StaffView.confirmDelete('${member.id}', '${member.name}')">
                          <i data-lucide="trash-2"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-container">
          <div>
            Showing ${startIndex + 1} to ${Math.min(startIndex + this.pageSize, totalItems)} of ${totalItems} entries
          </div>
          <div class="pagination-controls">
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="StaffView.changePage(${this.currentPage - 1})">
              <i data-lucide="chevron-left" style="width: 16px;"></i>
            </button>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
              <button class="page-btn ${p === this.currentPage ? 'active' : ''}" onclick="StaffView.changePage(${p})">
                ${p}
              </button>
            `).join('')}
            <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="StaffView.changePage(${this.currentPage + 1})">
              <i data-lucide="chevron-right" style="width: 16px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  },

  handleSearch: function(val) {
    this.filters.search = val;
    this.currentPage = 1;
    this.render(document.getElementById('content-view'));
  },

  handleDepartmentFilter: function(val) {
    this.filters.department = val;
    this.currentPage = 1;
    this.render(document.getElementById('content-view'));
  },

  handleStatusFilter: function(val) {
    this.filters.status = val;
    this.currentPage = 1;
    this.render(document.getElementById('content-view'));
  },

  changePage: function(page) {
    this.currentPage = page;
    this.render(document.getElementById('content-view'));
  },

  openAddModal: function() {
    const departments = window.db.getDepartments();

    const content = `
      <form id="add-staff-form">
        <div class="form-grid">
          <div>
            <label class="form-label">Full Name *</label>
            <input type="text" name="name" class="form-input" required placeholder="e.g. Dr. Jane Smith" />
          </div>
          <div>
            <label class="form-label">Gender *</label>
            <select name="gender" class="form-select" required>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="form-label">Designation / Role *</label>
            <input type="text" name="designation" class="form-input" required placeholder="e.g. Physics Teacher" />
          </div>
          <div>
            <label class="form-label">Department *</label>
            <select name="department" class="form-select" required>
              ${departments.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Academic Qualification</label>
            <input type="text" name="qualification" class="form-input" placeholder="e.g. M.Sc, B.Ed" />
          </div>
          <div>
            <label class="form-label">Assigned Class / Duty</label>
            <input type="text" name="assignedClass" class="form-input" placeholder="e.g. Grade 10 - Section A" />
          </div>
          <div>
            <label class="form-label">Contact Phone *</label>
            <input type="tel" name="phone" class="form-input" required placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label class="form-label">Email Address *</label>
            <input type="email" name="email" class="form-input" required placeholder="name@school.edu" />
          </div>
          <div>
            <label class="form-label">Joining Date</label>
            <input type="date" name="joiningDate" class="form-input" value="2026-09-01" />
          </div>
          <div>
            <label class="form-label">Status *</label>
            <select name="status" class="form-select" required>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </form>
    `;

    window.app.openModal({
      title: "Add New Faculty / Staff Member",
      body: content,
      submitText: "Save Staff Record",
      onSubmit: () => {
        const form = document.getElementById('add-staff-form');
        if (form.reportValidity()) {
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          window.db.addStaff(data);
          window.app.closeModal();
          window.app.showToast(`Faculty member ${data.name} created!`, 'success');
          StaffView.render(document.getElementById('content-view'));
        }
      }
    });
  },

  openEditModal: function(staffId) {
    const member = window.db.getStaffById(staffId);
    if (!member) return;
    const departments = window.db.getDepartments();

    const content = `
      <form id="edit-staff-form">
        <div class="form-grid">
          <div>
            <label class="form-label">Full Name *</label>
            <input type="text" name="name" class="form-input" required value="${member.name}" />
          </div>
          <div>
            <label class="form-label">Gender *</label>
            <select name="gender" class="form-select" required>
              <option value="Female" ${member.gender === 'Female' ? 'selected' : ''}>Female</option>
              <option value="Male" ${member.gender === 'Male' ? 'selected' : ''}>Male</option>
              <option value="Other" ${member.gender === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div>
            <label class="form-label">Designation *</label>
            <input type="text" name="designation" class="form-input" required value="${member.designation}" />
          </div>
          <div>
            <label class="form-label">Department *</label>
            <select name="department" class="form-select" required>
              ${departments.map(d => `<option value="${d}" ${member.department === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Academic Qualification</label>
            <input type="text" name="qualification" class="form-input" value="${member.qualification || ''}" />
          </div>
          <div>
            <label class="form-label">Assigned Class / Role</label>
            <input type="text" name="assignedClass" class="form-input" value="${member.assignedClass || ''}" />
          </div>
          <div>
            <label class="form-label">Contact Phone *</label>
            <input type="tel" name="phone" class="form-input" required value="${member.phone}" />
          </div>
          <div>
            <label class="form-label">Email Address *</label>
            <input type="email" name="email" class="form-input" required value="${member.email}" />
          </div>
          <div>
            <label class="form-label">Status *</label>
            <select name="status" class="form-select" required>
              <option value="Active" ${member.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${member.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
        </div>
      </form>
    `;

    window.app.openModal({
      title: `Edit Staff: ${member.name}`,
      body: content,
      submitText: "Update Changes",
      onSubmit: () => {
        const form = document.getElementById('edit-staff-form');
        if (form.reportValidity()) {
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          window.db.updateStaff(staffId, data);
          window.app.closeModal();
          window.app.showToast(`Faculty member details updated!`, 'success');
          StaffView.render(document.getElementById('content-view'));
        }
      }
    });
  },

  confirmDelete: function(id, name) {
    window.app.openModal({
      title: "Confirm Staff Removal",
      body: `
        <div style="text-align: center; padding: 1rem 0;">
          <div style="font-size: 2.5rem; color: #ef4444; margin-bottom: 1rem;">⚠️</div>
          <p style="font-size: 1rem; font-weight: 600;">Are you sure you want to remove <strong>${name}</strong> (${id})?</p>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">Associated attendance history will also be archived.</p>
        </div>
      `,
      submitText: "Remove Staff",
      submitBtnClass: "btn-danger",
      onSubmit: () => {
        window.db.deleteStaff(id);
        window.app.closeModal();
        window.app.showToast(`Staff member removed.`, 'info');
        StaffView.render(document.getElementById('content-view'));
      }
    });
  },

  viewProfile: function(staffId) {
    const member = window.db.getStaffById(staffId);
    if (!member) return;

    const stats = member.attendanceStats;
    const history = member.attendanceHistory.slice(0, 10);

    const content = `
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <img src="${member.avatar}" style="width: 84px; height: 84px; border-radius: var(--radius-lg); border: 3px solid var(--primary-500); object-fit: cover;" />
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <h2 style="font-size: 1.3rem; font-weight: 800;">${member.name}</h2>
            <span class="badge ${member.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${member.status}</span>
          </div>
          <div style="color: var(--primary-600); font-size: 0.95rem; font-weight: 700; margin-top: 0.15rem;">
            ${member.designation} · ${member.department}
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 0.65rem; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
            <span><i data-lucide="award"></i> ${member.qualification || 'Certified Staff'}</span>
            <span><i data-lucide="phone"></i> ${member.phone}</span>
            <span><i data-lucide="mail"></i> ${member.email}</span>
            <span><i data-lucide="calendar"></i> Joined: ${member.joiningDate}</span>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Breakdown -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.5rem;">
        <div style="background-color: var(--bg-app); padding: 0.75rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border-color);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">Attendance Rate</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: ${stats.percentage >= 80 ? '#10b981' : '#ef4444'};">${stats.percentage}%</div>
        </div>
        <div style="background-color: var(--status-present-bg); padding: 0.75rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--status-present-border);">
          <div style="font-size: 0.75rem; color: var(--status-present-text);">Days Present</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--status-present-text);">${stats.present}</div>
        </div>
        <div style="background-color: var(--status-absent-bg); padding: 0.75rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--status-absent-border);">
          <div style="font-size: 0.75rem; color: var(--status-absent-text);">Days Absent</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--status-absent-text);">${stats.absent}</div>
        </div>
        <div style="background-color: var(--status-leave-bg); padding: 0.75rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--status-leave-border);">
          <div style="font-size: 0.75rem; color: var(--status-leave-text);">Leaves & Late</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--status-leave-text);">${stats.leave + stats.late}</div>
        </div>
      </div>

      <!-- Recent Attendance History Table -->
      <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem;">Recent Attendance History</h3>
      <div style="max-height: 220px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
        <table class="data-table" style="font-size: 0.82rem;">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            ${history.length === 0 ? `
              <tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No attendance records found.</td></tr>
            ` : history.map(h => `
              <tr>
                <td><strong>${h.date}</strong></td>
                <td>
                  <span class="badge ${
                    h.status === 'Present' ? 'badge-present' :
                    h.status === 'Absent' ? 'badge-absent' :
                    h.status === 'Late' ? 'badge-late' : 'badge-leave'
                  }">${h.status}</span>
                </td>
                <td>${h.remarks || '-'}</td>
                <td>${h.markedBy}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    window.app.openModal({
      title: `Staff Member Profile`,
      body: content,
      hideSubmit: true
    });
  }
};
