/**
 * EduTrack Pro - Leave Management View
 * Handles Student & Staff Leave Applications, Admin Approvals/Rejections, and auto-sync to Attendance.
 */

window.LeavesView = {
  filters: {
    status: 'all',
    personType: 'all',
    search: ''
  },

  render: function(container) {
    const leaves = window.db.getLeaves(this.filters);

    const html = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Leave Management Hub</h1>
          <p>Review, approve, and track student and faculty leave applications.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="LeavesView.openApplyModal()">
            <i data-lucide="plus-circle"></i> Apply for Leave
          </button>
        </div>
      </div>

      <div class="card">
        <!-- Filter Toolbar -->
        <div class="filter-bar">
          <div class="filter-group">
            <div style="position: relative; width: 220px;">
              <input 
                type="text" 
                class="form-input" 
                placeholder="Search person, ID, reason..." 
                value="${this.filters.search}"
                oninput="LeavesView.handleSearch(this.value)"
                style="padding-left: 2rem;"
              />
              <i data-lucide="search" style="position: absolute; left: 0.65rem; top: 50%; transform: translateY(-50%); width: 15px; color: var(--text-muted);"></i>
            </div>

            <!-- Status Filter -->
            <select class="filter-select" onchange="LeavesView.handleStatusFilter(this.value)">
              <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="pending" ${this.filters.status === 'pending' ? 'selected' : ''}>Pending Only</option>
              <option value="approved" ${this.filters.status === 'approved' ? 'selected' : ''}>Approved</option>
              <option value="rejected" ${this.filters.status === 'rejected' ? 'selected' : ''}>Rejected</option>
            </select>

            <!-- Person Type Filter -->
            <select class="filter-select" onchange="LeavesView.handleTypeFilter(this.value)">
              <option value="all" ${this.filters.personType === 'all' ? 'selected' : ''}>All Roles (Student & Staff)</option>
              <option value="student" ${this.filters.personType === 'student' ? 'selected' : ''}>Students Only</option>
              <option value="staff" ${this.filters.personType === 'staff' ? 'selected' : ''}>Staff Only</option>
            </select>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-muted);">
            Total <strong>${leaves.length}</strong> applications listed
          </div>
        </div>

        <!-- Leaves Table -->
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Category</th>
                <th>Leave Type</th>
                <th>Duration & Dates</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Status</th>
                <th style="text-align: right;">Decision</th>
              </tr>
            </thead>
            <tbody>
              ${leaves.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i data-lucide="calendar" style="width: 40px; height: 40px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    <p>No leave requests found matching the current filters.</p>
                  </td>
                </tr>
              ` : leaves.map(leave => {
                let badgeClass = 'badge-pending';
                if (leave.status === 'Approved') badgeClass = 'badge-present';
                if (leave.status === 'Rejected') badgeClass = 'badge-absent';

                return `
                  <tr>
                    <td>
                      <div><strong>${leave.personName}</strong></div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${leave.contextInfo}</div>
                    </td>
                    <td>
                      <span class="badge ${leave.personType === 'student' ? 'badge-leave' : 'badge-late'}">
                        ${leave.personType.toUpperCase()}
                      </span>
                    </td>
                    <td><strong style="color: var(--primary-600);">${leave.leaveType}</strong></td>
                    <td>
                      <div><strong>${leave.days} Day(s)</strong></div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${leave.startDate} to ${leave.endDate}</div>
                    </td>
                    <td style="max-width: 240px;">
                      <div style="font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${leave.reason}">
                        ${leave.reason}
                      </div>
                      ${leave.rejectionReason ? `<div style="font-size: 0.72rem; color: #ef4444;">Note: ${leave.rejectionReason}</div>` : ''}
                    </td>
                    <td style="font-size: 0.82rem; color: var(--text-muted);">${leave.appliedOn || '-'}</td>
                    <td>
                      <span class="badge ${badgeClass}">
                        ${leave.status}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      ${leave.status === 'Pending' ? `
                        <div style="display: inline-flex; gap: 0.35rem;">
                          <button class="btn btn-success btn-sm btn-icon-only" title="Approve Request" onclick="LeavesView.handleDecision('${leave.id}', 'Approved')">
                            <i data-lucide="check"></i>
                          </button>
                          <button class="btn btn-danger btn-sm btn-icon-only" title="Reject Request" onclick="LeavesView.promptReject('${leave.id}')">
                            <i data-lucide="x"></i>
                          </button>
                        </div>
                      ` : `
                        <span style="font-size: 0.75rem; color: var(--text-muted);">
                          By ${leave.reviewedBy || 'Admin'}
                        </span>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  },

  handleSearch: function(val) {
    this.filters.search = val;
    this.render(document.getElementById('content-view'));
  },

  handleStatusFilter: function(val) {
    this.filters.status = val;
    this.render(document.getElementById('content-view'));
  },

  handleTypeFilter: function(val) {
    this.filters.personType = val;
    this.render(document.getElementById('content-view'));
  },

  handleDecision: function(leaveId, status, rejectionReason = '') {
    window.db.updateLeaveStatus(leaveId, status, window.app.currentUser.name, rejectionReason);
    window.app.showToast(`Leave request has been ${status}!`, status === 'Approved' ? 'success' : 'info');
    this.render(document.getElementById('content-view'));
  },

  promptReject: function(leaveId) {
    window.app.openModal({
      title: "Reject Leave Application",
      body: `
        <div>
          <label class="form-label">Please specify rejection reason:</label>
          <textarea id="rejection-reason-input" class="form-textarea" placeholder="e.g. Test week period, insufficient notice..."></textarea>
        </div>
      `,
      submitText: "Confirm Rejection",
      submitBtnClass: "btn-danger",
      onSubmit: () => {
        const reason = document.getElementById('rejection-reason-input').value.trim();
        LeavesView.handleDecision(leaveId, 'Rejected', reason);
        window.app.closeModal();
      }
    });
  },

  openApplyModal: function() {
    const leaveTypes = window.db.getLeaveTypes();
    const students = window.db.getStudents();
    const staffList = window.db.getStaff();

    const content = `
      <form id="apply-leave-form">
        <div class="form-grid">
          <div>
            <label class="form-label">Applicant Type *</label>
            <select name="personType" id="leave-person-type" class="form-select" required onchange="LeavesView.updateApplicantDropdown(this.value)">
              <option value="student">Student</option>
              <option value="staff">Faculty / Staff</option>
            </select>
          </div>
          <div>
            <label class="form-label">Select Person *</label>
            <select name="personId" id="leave-person-id" class="form-select" required>
              ${students.map(s => `<option value="${s.id}" data-name="${s.name}" data-context="${s.class} - ${s.section}">${s.name} (${s.class}-${s.section})</option>`).join('')}
            </select>
          </div>
          <div class="form-group-full">
            <label class="form-label">Leave Type / Category *</label>
            <select name="leaveType" class="form-select" required>
              ${leaveTypes.map(lt => `<option value="${lt}">${lt}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Start Date *</label>
            <input type="date" name="startDate" id="leave-start-date" class="form-input" required value="2026-09-04" onchange="LeavesView.recalcDays()" />
          </div>
          <div>
            <label class="form-label">End Date *</label>
            <input type="date" name="endDate" id="leave-end-date" class="form-input" required value="2026-09-05" onchange="LeavesView.recalcDays()" />
          </div>
          <div class="form-group-full">
            <label class="form-label">Total Days</label>
            <input type="number" name="days" id="leave-days-count" class="form-input" value="2" min="1" readonly style="background-color: var(--bg-app); font-weight: 700;" />
          </div>
          <div class="form-group-full">
            <label class="form-label">Reason for Absence *</label>
            <textarea name="reason" class="form-textarea" required placeholder="Detailed reason for leave request..."></textarea>
          </div>
        </div>
      </form>
    `;

    window.app.openModal({
      title: "Submit Leave Application",
      body: content,
      submitText: "Submit Application",
      onSubmit: () => {
        const form = document.getElementById('apply-leave-form');
        if (form.reportValidity()) {
          const personSelect = document.getElementById('leave-person-id');
          const selectedOption = personSelect.options[personSelect.selectedIndex];
          const personName = selectedOption.getAttribute('data-name');
          const contextInfo = selectedOption.getAttribute('data-context');

          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          data.personName = personName;
          data.contextInfo = contextInfo;
          data.days = parseInt(data.days) || 1;

          window.db.applyLeave(data);
          window.app.closeModal();
          window.app.showToast(`Leave application submitted successfully!`, 'success');
          LeavesView.render(document.getElementById('content-view'));
        }
      }
    });
  },

  updateApplicantDropdown: function(type) {
    const sel = document.getElementById('leave-person-id');
    if (!sel) return;

    if (type === 'student') {
      const students = window.db.getStudents();
      sel.innerHTML = students.map(s => 
        `<option value="${s.id}" data-name="${s.name}" data-context="${s.class} - ${s.section}">${s.name} (${s.class}-${s.section})</option>`
      ).join('');
    } else {
      const staffList = window.db.getStaff();
      sel.innerHTML = staffList.map(st => 
        `<option value="${st.id}" data-name="${st.name}" data-context="${st.department}">${st.name} (${st.designation})</option>`
      ).join('');
    }
  },

  recalcDays: function() {
    const startVal = document.getElementById('leave-start-date')?.value;
    const endVal = document.getElementById('leave-end-date')?.value;
    const daysInput = document.getElementById('leave-days-count');

    if (startVal && endVal && daysInput) {
      const s = new Date(startVal);
      const e = new Date(endVal);
      const diffTime = Math.max(0, e - s);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      daysInput.value = isNaN(diffDays) ? 1 : diffDays;
    }
  }
};
