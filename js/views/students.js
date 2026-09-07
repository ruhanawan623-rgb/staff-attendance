/**
 * EduTrack Pro - Student Management View
 * Handles Student List, Filtering, Pagination, Add/Edit/Delete, and Student Profile View.
 */

window.StudentsView = {
  currentPage: 1,
  pageSize: 8,
  filters: {
    search: '',
    class: 'all',
    section: 'all',
    status: 'all'
  },

  render: function(container) {
    const classes = window.db.getClasses();
    const students = window.db.getStudents(this.filters);

    // Pagination slice
    const totalItems = students.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginatedStudents = students.slice(startIndex, startIndex + this.pageSize);

    const html = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Student Management</h1>
          <p>Manage student records, enrollment details, attendance rates, and profiles.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="StudentsView.openAddModal()">
            <i data-lucide="user-plus"></i> Add New Student
          </button>
        </div>
      </div>

      <div class="card">
        <!-- Filter and Search Toolbar -->
        <div class="filter-bar">
          <div class="filter-group">
            <div style="position: relative; width: 240px;">
              <input 
                type="text" 
                class="form-input" 
                placeholder="Search name, ID, roll..." 
                value="${this.filters.search}"
                oninput="StudentsView.handleSearch(this.value)"
                style="padding-left: 2rem;"
              />
              <i data-lucide="search" style="position: absolute; left: 0.65rem; top: 50%; transform: translateY(-50%); width: 15px; color: var(--text-muted);"></i>
            </div>

            <!-- Class Filter -->
            <select class="filter-select" onchange="StudentsView.handleClassFilter(this.value)">
              <option value="all" ${this.filters.class === 'all' ? 'selected' : ''}>All Classes</option>
              ${classes.map(c => `<option value="${c.name}" ${this.filters.class === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>

            <!-- Status Filter -->
            <select class="filter-select" onchange="StudentsView.handleStatusFilter(this.value)">
              <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>All Status</option>
              <option value="active" ${this.filters.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="inactive" ${this.filters.status === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-muted);">
            Showing <strong>${students.length}</strong> enrolled students
          </div>
        </div>

        <!-- Student Data Table -->
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Student Info</th>
                <th>Student ID</th>
                <th>Class & Section</th>
                <th>Roll No</th>
                <th>Guardian</th>
                <th>Contact</th>
                <th>Attendance</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paginatedStudents.length === 0 ? `
                <tr>
                  <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i data-lucide="user-x" style="width: 40px; height: 40px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    <p>No student records match your filters.</p>
                  </td>
                </tr>
              ` : paginatedStudents.map(student => {
                const attRate = student.attendancePercent || 0;
                let rateBadgeClass = 'badge-present';
                if (attRate < 75) rateBadgeClass = 'badge-absent';
                else if (attRate < 85) rateBadgeClass = 'badge-late';

                return `
                  <tr>
                    <td>
                      <div class="table-user-cell">
                        <img src="${student.avatar}" class="table-user-avatar" alt="${student.name}" />
                        <div>
                          <div class="table-user-name">${student.name}</div>
                          <div class="table-user-sub">${student.gender} · Admitted ${student.admissionDate}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style="font-weight: 600; font-family: monospace;">${student.id}</span></td>
                    <td><strong>${student.class}</strong> (${student.section})</td>
                    <td>${student.rollNumber}</td>
                    <td>${student.guardianName || 'N/A'}</td>
                    <td>${student.phone}</td>
                    <td>
                      <span class="badge ${rateBadgeClass}">
                        ${attRate}%
                      </span>
                    </td>
                    <td>
                      <span class="badge ${student.status === 'Active' ? 'badge-active' : 'badge-inactive'}">
                        ${student.status}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 0.35rem;">
                        <button class="btn btn-secondary btn-sm btn-icon-only" title="View Profile" onclick="StudentsView.viewProfile('${student.id}')">
                          <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm btn-icon-only" title="Edit Student" onclick="StudentsView.openEditModal('${student.id}')">
                          <i data-lucide="edit-3"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-icon-only" title="Delete Student" onclick="StudentsView.confirmDelete('${student.id}', '${student.name}')">
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

        <!-- Pagination Bar -->
        <div class="pagination-container">
          <div>
            Showing ${startIndex + 1} to ${Math.min(startIndex + this.pageSize, totalItems)} of ${totalItems} entries
          </div>
          <div class="pagination-controls">
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="StudentsView.changePage(${this.currentPage - 1})">
              <i data-lucide="chevron-left" style="width: 16px;"></i>
            </button>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
              <button class="page-btn ${p === this.currentPage ? 'active' : ''}" onclick="StudentsView.changePage(${p})">
                ${p}
              </button>
            `).join('')}
            <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="StudentsView.changePage(${this.currentPage + 1})">
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

  handleClassFilter: function(val) {
    this.filters.class = val;
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
    const classes = window.db.getClasses();
    const defaultSections = classes[0]?.sections || ["A", "B"];

    const content = `
      <form id="add-student-form" onsubmit="StudentsView.saveNewStudent(event)">
        <div class="form-grid">
          <div>
            <label class="form-label">Full Name *</label>
            <input type="text" name="name" class="form-input" required placeholder="e.g. Liam Alexander" />
          </div>
          <div>
            <label class="form-label">Gender *</label>
            <select name="gender" class="form-select" required>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="form-label">Class *</label>
            <select name="class" id="new-student-class-select" class="form-select" required onchange="StudentsView.updateSectionOptions(this.value, 'new-student-section-select')">
              ${classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Section *</label>
            <select name="section" id="new-student-section-select" class="form-select" required>
              ${defaultSections.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Roll Number *</label>
            <input type="text" name="rollNumber" class="form-input" required placeholder="e.g. 10-09" />
          </div>
          <div>
            <label class="form-label">Guardian / Father Name *</label>
            <input type="text" name="guardianName" class="form-input" required placeholder="e.g. Robert Alexander" />
          </div>
          <div>
            <label class="form-label">Contact Phone *</label>
            <input type="tel" name="phone" class="form-input" required placeholder="e.g. +1 (555) 401-1101" />
          </div>
          <div>
            <label class="form-label">Email Address</label>
            <input type="email" name="email" class="form-input" placeholder="student@school.edu" />
          </div>
          <div>
            <label class="form-label">Date of Birth</label>
            <input type="date" name="dob" class="form-input" value="2009-01-01" />
          </div>
          <div>
            <label class="form-label">Admission Date</label>
            <input type="date" name="admissionDate" class="form-input" value="2026-09-01" />
          </div>
          <div class="form-group-full">
            <label class="form-label">Home Address</label>
            <input type="text" name="address" class="form-input" placeholder="Street, City, State" />
          </div>
        </div>
      </form>
    `;

    window.app.openModal({
      title: "Enroll New Student",
      body: content,
      submitText: "Save Student",
      onSubmit: () => {
        const form = document.getElementById('add-student-form');
        if (form.reportValidity()) {
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          window.db.addStudent(data);
          window.app.closeModal();
          window.app.showToast(`Student ${data.name} enrolled successfully!`, 'success');
          StudentsView.render(document.getElementById('content-view'));
        }
      }
    });
  },

  updateSectionOptions: function(className, targetSelectId) {
    const classes = window.db.getClasses();
    const cObj = classes.find(c => c.name === className);
    const sel = document.getElementById(targetSelectId);
    if (sel && cObj) {
      sel.innerHTML = cObj.sections.map(s => `<option value="${s}">${s}</option>`).join('');
    }
  },

  openEditModal: function(studentId) {
    const student = window.db.getStudentById(studentId);
    if (!student) return;
    const classes = window.db.getClasses();
    const cObj = classes.find(c => c.name === student.class);
    const sections = cObj ? cObj.sections : ["A", "B"];

    const content = `
      <form id="edit-student-form">
        <div class="form-grid">
          <div>
            <label class="form-label">Full Name *</label>
            <input type="text" name="name" class="form-input" required value="${student.name}" />
          </div>
          <div>
            <label class="form-label">Gender *</label>
            <select name="gender" class="form-select" required>
              <option value="Male" ${student.gender === 'Male' ? 'selected' : ''}>Male</option>
              <option value="Female" ${student.gender === 'Female' ? 'selected' : ''}>Female</option>
              <option value="Other" ${student.gender === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div>
            <label class="form-label">Class *</label>
            <select name="class" id="edit-student-class-select" class="form-select" required onchange="StudentsView.updateSectionOptions(this.value, 'edit-student-section-select')">
              ${classes.map(c => `<option value="${c.name}" ${student.class === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Section *</label>
            <select name="section" id="edit-student-section-select" class="form-select" required>
              ${sections.map(s => `<option value="${s}" ${student.section === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Roll Number *</label>
            <input type="text" name="rollNumber" class="form-input" required value="${student.rollNumber}" />
          </div>
          <div>
            <label class="form-label">Status *</label>
            <select name="status" class="form-select" required>
              <option value="Active" ${student.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${student.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
          <div>
            <label class="form-label">Guardian Name *</label>
            <input type="text" name="guardianName" class="form-input" required value="${student.guardianName || ''}" />
          </div>
          <div>
            <label class="form-label">Contact Phone *</label>
            <input type="tel" name="phone" class="form-input" required value="${student.phone}" />
          </div>
          <div class="form-group-full">
            <label class="form-label">Home Address</label>
            <input type="text" name="address" class="form-input" value="${student.address || ''}" />
          </div>
        </div>
      </form>
    `;

    window.app.openModal({
      title: `Edit Student: ${student.name}`,
      body: content,
      submitText: "Update Changes",
      onSubmit: () => {
        const form = document.getElementById('edit-student-form');
        if (form.reportValidity()) {
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          window.db.updateStudent(studentId, data);
          window.app.closeModal();
          window.app.showToast(`Student details updated successfully!`, 'success');
          StudentsView.render(document.getElementById('content-view'));
        }
      }
    });
  },

  confirmDelete: function(id, name) {
    window.app.openModal({
      title: "Confirm Deletion",
      body: `
        <div style="text-align: center; padding: 1rem 0;">
          <div style="font-size: 2.5rem; color: #ef4444; margin-bottom: 1rem;">⚠️</div>
          <p style="font-size: 1rem; font-weight: 600;">Are you sure you want to delete student <strong>${name}</strong> (${id})?</p>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">This will also permanently delete all associated attendance history records.</p>
        </div>
      `,
      submitText: "Delete Record",
      submitBtnClass: "btn-danger",
      onSubmit: () => {
        window.db.deleteStudent(id);
        window.app.closeModal();
        window.app.showToast(`Student ${name} deleted.`, 'info');
        StudentsView.render(document.getElementById('content-view'));
      }
    });
  },

  viewProfile: function(studentId) {
    const s = window.db.getStudentById(studentId);
    if (!s) return;

    const stats = s.attendanceStats;
    const history = s.attendanceHistory.slice(0, 10); // recent 10 records

    const content = `
      <div style="display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <img src="${s.avatar}" style="width: 84px; height: 84px; border-radius: var(--radius-lg); border: 3px solid var(--primary-500); object-fit: cover;" />
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <h2 style="font-size: 1.3rem; font-weight: 800;">${s.name}</h2>
            <span class="badge ${s.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${s.status}</span>
          </div>
          <div style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.2rem;">
            ${s.class} (${s.section}) · Roll No: <strong>${s.rollNumber}</strong> · ID: <strong>${s.id}</strong>
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 0.65rem; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;">
            <span><i data-lucide="user"></i> Guardian: <strong>${s.guardianName}</strong></span>
            <span><i data-lucide="phone"></i> ${s.phone}</span>
            <span><i data-lucide="calendar"></i> Admitted: ${s.admissionDate}</span>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Breakdown -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.5rem;">
        <div style="background-color: var(--bg-app); padding: 0.75rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border-color);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">Attendance Rate</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: ${stats.percentage >= 75 ? '#10b981' : '#ef4444'};">${stats.percentage}%</div>
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
              <tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No attendance records recorded yet.</td></tr>
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
      title: `Student Profile Record`,
      body: content,
      hideSubmit: true
    });
  }
};
