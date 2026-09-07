/**
 * EduTrack Pro - Attendance Reports & Export View
 * Comprehensive multi-criteria report generation, filtering, summary statistics, and CSV/Print/PDF exports.
 */

window.ReportsView = {
  activeReportType: 'daily-students',
  filters: {
    date: '2026-09-03',
    month: '2026-09',
    class: 'all',
    section: 'all',
    department: 'all',
    status: 'all',
    threshold: 75
  },

  render: function(container) {
    const classes = window.db.getClasses();
    const departments = window.db.getDepartments();
    const reportData = window.db.generateReport(this.activeReportType, this.filters);

    const html = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Attendance Reports & Analytics</h1>
          <p>Generate, review, and export institution-wide student and faculty attendance records.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="ReportsView.exportCSV()">
            <i data-lucide="download"></i> Export CSV
          </button>
          <button class="btn btn-primary" onclick="ReportsView.printReport()">
            <i data-lucide="printer"></i> Print / Save PDF
          </button>
        </div>
      </div>

      <!-- Report Type Tabs -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; overflow-x: auto; padding-bottom: 0.5rem;">
        <button class="btn ${this.activeReportType === 'daily-students' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="ReportsView.setReportType('daily-students')">
          <i data-lucide="calendar"></i> Daily Students
        </button>
        <button class="btn ${this.activeReportType === 'daily-staff' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="ReportsView.setReportType('daily-staff')">
          <i data-lucide="briefcase"></i> Daily Staff
        </button>
        <button class="btn ${this.activeReportType === 'monthly-students' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="ReportsView.setReportType('monthly-students')">
          <i data-lucide="calendar-range"></i> Monthly Students
        </button>
        <button class="btn ${this.activeReportType === 'monthly-staff' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="ReportsView.setReportType('monthly-staff')">
          <i data-lucide="users"></i> Monthly Staff
        </button>
        <button class="btn ${this.activeReportType === 'low-attendance' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="ReportsView.setReportType('low-attendance')">
          <i data-lucide="alert-triangle"></i> Low Attendance (&lt;75%)
        </button>
        <button class="btn ${this.activeReportType === 'leaves-summary' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="ReportsView.setReportType('leaves-summary')">
          <i data-lucide="file-check"></i> Leave Summary
        </button>
      </div>

      <!-- Dynamic Filters Card -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="filter-bar">
          <div class="filter-group">
            
            <!-- Date Filter (For daily reports) -->
            ${['daily-students', 'daily-staff'].includes(this.activeReportType) ? `
              <div>
                <label class="form-label" style="margin-bottom: 2px;">Date</label>
                <input type="date" class="form-input" value="${this.filters.date}" onchange="ReportsView.handleFilterChange('date', this.value)" style="height: 36px;" />
              </div>
            ` : ''}

            <!-- Month Filter (For monthly reports) -->
            ${['monthly-students', 'monthly-staff'].includes(this.activeReportType) ? `
              <div>
                <label class="form-label" style="margin-bottom: 2px;">Month</label>
                <input type="month" class="form-input" value="${this.filters.month}" onchange="ReportsView.handleFilterChange('month', this.value)" style="height: 36px;" />
              </div>
            ` : ''}

            <!-- Class Filter (For student reports) -->
            ${['daily-students', 'monthly-students'].includes(this.activeReportType) ? `
              <div>
                <label class="form-label" style="margin-bottom: 2px;">Class</label>
                <select class="filter-select" onchange="ReportsView.handleFilterChange('class', this.value)">
                  <option value="all" ${this.filters.class === 'all' ? 'selected' : ''}>All Classes</option>
                  ${classes.map(c => `<option value="${c.name}" ${this.filters.class === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
              </div>
            ` : ''}

            <!-- Department Filter (For staff reports) -->
            ${['daily-staff', 'monthly-staff'].includes(this.activeReportType) ? `
              <div>
                <label class="form-label" style="margin-bottom: 2px;">Department</label>
                <select class="filter-select" onchange="ReportsView.handleFilterChange('department', this.value)">
                  <option value="all" ${this.filters.department === 'all' ? 'selected' : ''}>All Departments</option>
                  ${departments.map(d => `<option value="${d}" ${this.filters.department === d ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
              </div>
            ` : ''}

            <!-- Status Filter -->
            ${['daily-students', 'daily-staff'].includes(this.activeReportType) ? `
              <div>
                <label class="form-label" style="margin-bottom: 2px;">Status</label>
                <select class="filter-select" onchange="ReportsView.handleFilterChange('status', this.value)">
                  <option value="all">All Statuses</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
            ` : ''}

            <!-- Threshold for Low Attendance -->
            ${this.activeReportType === 'low-attendance' ? `
              <div>
                <label class="form-label" style="margin-bottom: 2px;">Threshold %</label>
                <input type="number" class="form-input" value="${this.filters.threshold}" min="50" max="95" onchange="ReportsView.handleFilterChange('threshold', this.value)" style="height: 36px; width: 100px;" />
              </div>
            ` : ''}
          </div>

          <div style="font-size: 0.85rem; font-weight: 700; color: var(--primary-600);">
            ${reportData.rows.length} records generated
          </div>
        </div>
      </div>

      <!-- Printable Report Sheet Card -->
      <div class="card" id="printable-report-area">
        
        <!-- Report Printable Header -->
        <div style="padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--primary-600); font-weight: 800; letter-spacing: 0.05em;">${window.db.getSettings().schoolName || 'Staff Attendance'}</div>
            <h2 style="font-size: 1.3rem; font-weight: 800; margin-top: 0.15rem;">${reportData.summary.title}</h2>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
              Generated on: <strong>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
            </div>
          </div>
          
          <!-- Summary Pills -->
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${reportData.summary.present !== undefined ? `
              <span class="badge badge-present">Present: ${reportData.summary.present}</span>
              <span class="badge badge-absent">Absent: ${reportData.summary.absent}</span>
              <span class="badge badge-late">Late: ${reportData.summary.late}</span>
              <span class="badge badge-leave">Leave: ${reportData.summary.leave}</span>
            ` : ''}
            ${reportData.summary.avgPercentage !== undefined ? `
              <span class="badge badge-present" style="font-size: 0.9rem;">Average: ${reportData.summary.avgPercentage}%</span>
            ` : ''}
          </div>
        </div>

        <!-- Rendered Table Based on Report Type -->
        <div class="table-responsive">
          ${this.renderReportTable(this.activeReportType, reportData.rows)}
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  },

  renderReportTable: function(type, rows) {
    if (rows.length === 0) {
      return `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <i data-lucide="file-question" style="width: 40px; height: 40px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
          <p>No attendance records match the selected report parameters.</p>
        </div>
      `;
    }

    if (type === 'daily-students') {
      return `
        <table class="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Class & Section</th>
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><strong>${r.rollNumber}</strong></td>
                <td><strong>${r.studentName}</strong></td>
                <td>${r.class} (${r.section})</td>
                <td>${r.date}</td>
                <td>
                  <span class="badge ${
                    r.status === 'Present' ? 'badge-present' :
                    r.status === 'Absent' ? 'badge-absent' :
                    r.status === 'Late' ? 'badge-late' : 'badge-leave'
                  }">${r.status}</span>
                </td>
                <td>${r.remarks || '-'}</td>
                <td>${r.markedBy}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    if (type === 'daily-staff') {
      return `
        <table class="data-table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Faculty Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><strong>${r.staffId}</strong></td>
                <td><strong>${r.staffName}</strong></td>
                <td>${r.department}</td>
                <td>${r.designation}</td>
                <td>
                  <span class="badge ${
                    r.status === 'Present' ? 'badge-present' :
                    r.status === 'Absent' ? 'badge-absent' :
                    r.status === 'Late' ? 'badge-late' : 'badge-leave'
                  }">${r.status}</span>
                </td>
                <td>${r.remarks || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    if (type === 'monthly-students' || type === 'monthly-staff') {
      return `
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>${type === 'monthly-students' ? 'Class' : 'Department'}</th>
              <th>Total Days</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Leaves</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><strong>${r.id}</strong></td>
                <td><strong>${r.name}</strong></td>
                <td>${r.class || r.department}</td>
                <td>${r.totalWorkingDays}</td>
                <td><span style="color: #10b981; font-weight: 700;">${r.present}</span></td>
                <td><span style="color: #ef4444; font-weight: 700;">${r.absent}</span></td>
                <td><span style="color: #3b82f6; font-weight: 700;">${r.leave}</span></td>
                <td>
                  <span class="badge ${r.rateNum >= 75 ? 'badge-present' : 'badge-absent'}">
                    ${r.rate}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    if (type === 'low-attendance') {
      return `
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Class & Section</th>
              <th>Contact Phone</th>
              <th>Attendance Rate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><strong>${r.id}</strong></td>
                <td><strong>${r.name}</strong></td>
                <td>${r.group}</td>
                <td>${r.contact}</td>
                <td><span class="badge badge-absent" style="font-size: 0.85rem;">${r.rate}</span></td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="StudentsView.viewProfile('${r.id}')">
                    <i data-lucide="eye"></i> Profile
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    if (type === 'leaves-summary') {
      return `
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Person Name</th>
              <th>Role</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><strong>${r.id}</strong></td>
                <td><strong>${r.personName}</strong></td>
                <td>${r.personType.toUpperCase()}</td>
                <td>${r.leaveType}</td>
                <td>${r.startDate} to ${r.endDate}</td>
                <td>${r.days}</td>
                <td>
                  <span class="badge ${
                    r.status === 'Approved' ? 'badge-present' :
                    r.status === 'Pending' ? 'badge-pending' : 'badge-absent'
                  }">${r.status}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    return '';
  },

  setReportType: function(type) {
    this.activeReportType = type;
    this.render(document.getElementById('content-view'));
  },

  handleFilterChange: function(key, val) {
    this.filters[key] = val;
    this.render(document.getElementById('content-view'));
  },

  printReport: function() {
    window.print();
  },

  exportCSV: function() {
    const reportData = window.db.generateReport(this.activeReportType, this.filters);
    if (!reportData.rows || reportData.rows.length === 0) {
      window.app.showToast("No data to export.", "warning");
      return;
    }

    const rows = reportData.rows;
    const headers = Object.keys(rows[0]).filter(k => typeof rows[0][k] !== 'object');
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      const line = headers.map(h => {
        let val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
        if (val.includes(',') || val.includes('\n')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',');
      csvContent += line + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${this.activeReportType}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.app.showToast("CSV report downloaded successfully!", "success");
  }
};
