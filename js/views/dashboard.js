/**
 * EduTrack Pro - Staff & Institutional Attendance Dashboard
 * Tailored for Staff Attendance & Campus Operations with multi-view tabs,
 * balanced 4x2 KPI grid, real-time staff presence board, and department analytics.
 */

window.DashboardView = {
  charts: {},
  activeTab: 'staff', // 'staff' | 'students' | 'campus'

  switchTab: function(tabName) {
    this.activeTab = tabName;
    const container = document.getElementById('content-view');
    if (container) {
      this.render(container);
    }
  },

  render: function(container) {
    const metrics = window.db.getDashboardMetrics();
    const trend = window.db.getAttendanceTrend(7);
    const leaves = window.db.getLeaves({ status: 'Pending' });
    const staffAttendanceList = window.db.getStaffAttendanceForDate(metrics.date);
    const deptDist = window.db.getDepartmentStaffDistribution();

    let tabContentHtml = '';
    if (this.activeTab === 'staff') {
      tabContentHtml = this.renderStaffTab(metrics, trend, leaves, staffAttendanceList, deptDist);
    } else if (this.activeTab === 'students') {
      tabContentHtml = this.renderStudentsTab(metrics, trend, leaves);
    } else {
      tabContentHtml = this.renderCampusTab(metrics, trend, leaves, deptDist);
    }

    const html = `
      <!-- Dashboard Top Header Bar -->
      <div class="page-header" style="margin-bottom: 1.25rem;">
        <div class="page-title-group">
          <h1>Faculty & Staff Attendance Dashboard</h1>
          <p>Real-time staff attendance, department analytics & campus shift status for <strong>${metrics.date}</strong></p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.app.navigate('leaves')">
            <i data-lucide="file-clock"></i> Leave Requests (${leaves.length})
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.app.navigate('reports')">
            <i data-lucide="bar-chart-3"></i> Export Reports
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.app.navigate('staff-attendance')">
            <i data-lucide="check-check"></i> Mark Staff Attendance
          </button>
        </div>
      </div>

      <!-- Dashboard View Navigation Tabs -->
      <div class="dashboard-tabs-bar">
        <button 
          class="dashboard-tab-btn ${this.activeTab === 'staff' ? 'active' : ''}" 
          onclick="DashboardView.switchTab('staff')"
        >
          <i data-lucide="briefcase"></i> Faculty & Staff (Primary)
        </button>
        <button 
          class="dashboard-tab-btn ${this.activeTab === 'students' ? 'active' : ''}" 
          onclick="DashboardView.switchTab('students')"
        >
          <i data-lucide="graduation-cap"></i> Student Attendance
        </button>
        <button 
          class="dashboard-tab-btn ${this.activeTab === 'campus' ? 'active' : ''}" 
          onclick="DashboardView.switchTab('campus')"
        >
          <i data-lucide="activity"></i> Unified Campus Summary
        </button>
      </div>

      <!-- Active Tab Body -->
      ${tabContentHtml}
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();

    // Initialize Chart.js based on active tab
    this.initCharts(metrics, trend);
  },

  // =========================================================================
  // 1. STAFF & FACULTY TAB (Primary Default View)
  // =========================================================================
  renderStaffTab: function(metrics, trend, leaves, staffList, deptDist) {
    const staffLeaves = leaves.filter(l => l.personType === 'Staff');
    const departments = Object.keys(deptDist);

    return `
      <!-- 8-Card Balanced Staff KPI Grid (4 Columns x 2 Rows) -->
      <div class="kpi-grid">
        <!-- 1. Total Staff -->
        <div class="kpi-card" onclick="window.app.navigate('staff')" style="cursor: pointer;" title="Click to view Faculty & Staff Directory">
          <div class="kpi-content">
            <span class="kpi-label">Total Faculty & Staff</span>
            <div class="kpi-value">${metrics.staff.total}</div>
            <span class="kpi-subtext">Across ${departments.length} academic departments</span>
          </div>
          <div class="kpi-icon">
            <i data-lucide="briefcase"></i>
          </div>
        </div>

        <!-- 2. Staff Present Today -->
        <div class="kpi-card kpi-present">
          <div class="kpi-content">
            <span class="kpi-label">Staff Present Today</span>
            <div class="kpi-value">${metrics.staff.present}</div>
            <span class="kpi-subtext" style="color: #10b981; font-weight: 700;">
              <strong>${metrics.staff.rate}%</strong> Faculty Attendance Rate
            </span>
          </div>
          <div class="kpi-icon">
            <i data-lucide="user-check"></i>
          </div>
        </div>

        <!-- 3. Staff Absent Today -->
        <div class="kpi-card kpi-absent">
          <div class="kpi-content">
            <span class="kpi-label">Staff Absent</span>
            <div class="kpi-value">${metrics.staff.absent}</div>
            <span class="kpi-subtext" style="color: #ef4444; font-weight: 600;">
              ${metrics.staff.absent === 0 ? 'No unexcused absences' : 'Requires immediate substitute cover'}
            </span>
          </div>
          <div class="kpi-icon">
            <i data-lucide="user-x"></i>
          </div>
        </div>

        <!-- 4. Staff On Leave -->
        <div class="kpi-card kpi-leave">
          <div class="kpi-content">
            <span class="kpi-label">Staff On Approved Leave</span>
            <div class="kpi-value">${metrics.staff.leave}</div>
            <span class="kpi-subtext">Approved leaves on record</span>
          </div>
          <div class="kpi-icon">
            <i data-lucide="calendar"></i>
          </div>
        </div>

        <!-- 5. Late / Shift Punctuality -->
        <div class="kpi-card kpi-late">
          <div class="kpi-content">
            <span class="kpi-label">Late Clock-Ins</span>
            <div class="kpi-value">${metrics.staff.late}</div>
            <span class="kpi-subtext" style="color: #d97706;">
              ${metrics.staff.total > 0 ? Math.round(((metrics.staff.present - metrics.staff.late) / metrics.staff.total) * 100) : 100}% Punctuality Rate
            </span>
          </div>
          <div class="kpi-icon">
            <i data-lucide="clock"></i>
          </div>
        </div>

        <!-- 6. Active Departments Covered -->
        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Departments Covered</span>
            <div class="kpi-value">${departments.filter(d => deptDist[d].present > 0).length} / ${departments.length}</div>
            <span class="kpi-subtext">Active departments staffed</span>
          </div>
          <div class="kpi-icon">
            <i data-lucide="layers"></i>
          </div>
        </div>

        <!-- 7. Student Presence Summary -->
        <div class="kpi-card" onclick="DashboardView.switchTab('students')" style="cursor: pointer;" title="Click to view Student Details">
          <div class="kpi-content">
            <span class="kpi-label">Student Body Rate</span>
            <div class="kpi-value">${metrics.students.rate}%</div>
            <span class="kpi-subtext">${metrics.students.present} of ${metrics.students.total} students present</span>
          </div>
          <div class="kpi-icon">
            <i data-lucide="graduation-cap"></i>
          </div>
        </div>

        <!-- 8. Campus Overall Health -->
        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Institution Readiness</span>
            <div class="kpi-value">${metrics.overall.rate}%</div>
            <span class="kpi-subtext">Combined campus readiness score</span>
          </div>
          <div class="kpi-icon">
            <i data-lucide="activity"></i>
          </div>
        </div>
      </div>

      <!-- Main Operational 2-Column Grid (Main Feed + Right Rail) -->
      <div class="dashboard-layout-grid">
        
        <!-- === LEFT COLUMN: Trends, Department Breakdown & Live Staff Presence === -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- 7-Day Staff Attendance & Punctuality Trend Chart -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-title">7-Day Faculty Attendance & Punctuality Trends</div>
                <div class="chart-subtitle">Daily staff presence vs tardiness and approved leaves</div>
              </div>
              <span class="badge badge-present">Live Feed</span>
            </div>
            <div class="chart-container" style="min-height: 300px;">
              <canvas id="trendChart"></canvas>
            </div>
          </div>

          <!-- Department-Wise Staffing & Attendance Health -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Department Attendance & Staffing Health</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Faculty presence rate broken down by academic departments</div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.app.navigate('reports')">
                <i data-lucide="external-link"></i> Detailed Report
              </button>
            </div>
            <div style="padding: 1.25rem 1.5rem;">
              <div class="dept-progress-grid">
                ${departments.map(d => {
                  const info = deptDist[d];
                  const pct = info.total > 0 ? Math.round((info.present / info.total) * 100) : 0;
                  const barColor = pct >= 90 ? 'linear-gradient(90deg, #10b981, #059669)' : pct >= 70 ? 'linear-gradient(90deg, #3b82f6, #2563eb)' : 'linear-gradient(90deg, #f59e0b, #d97706)';
                  return `
                    <div class="dept-progress-item">
                      <div class="dept-progress-header">
                        <span style="color: var(--text-main);">${d}</span>
                        <span style="color: ${pct >= 90 ? '#10b981' : pct >= 70 ? 'var(--primary-600)' : '#f59e0b'};">${info.present}/${info.total} (${pct}%)</span>
                      </div>
                      <div class="dept-progress-track">
                        <div class="dept-progress-bar" style="width: ${pct}%; background: ${barColor};"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Live Today's Faculty & Staff Attendance Roster -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Today's Staff Presence Roster</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Real-time clock-in status, timestamps and departments for ${metrics.date}</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="window.app.navigate('staff-attendance')">
                <i data-lucide="edit-3"></i> Open Attendance Marker
              </button>
            </div>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Faculty Member</th>
                    <th>Department & Title</th>
                    <th>Status</th>
                    <th>Check-In</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${staffList.slice(0, 6).map(stf => {
                    const statusClass = 
                      stf.status === 'Present' ? 'badge-present' :
                      stf.status === 'Late' ? 'badge-late' :
                      stf.status === 'Leave' ? 'badge-leave' : 'badge-absent';
                    const iconName = 
                      stf.status === 'Present' ? 'check' :
                      stf.status === 'Late' ? 'clock' :
                      stf.status === 'Leave' ? 'calendar' : 'x';

                    return `
                      <tr>
                        <td>
                          <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <img src="${stf.avatar}" class="presence-avatar" alt="${stf.name}" />
                            <div>
                              <div style="font-weight: 700; color: var(--text-main); font-size: 0.88rem;">${stf.name}</div>
                              <div style="font-size: 0.75rem; color: var(--text-muted);">${stf.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style="font-weight: 600; font-size: 0.82rem;">${stf.department}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted);">${stf.designation}</div>
                        </td>
                        <td>
                          <span class="badge ${statusClass}">
                            <i data-lucide="${iconName}" style="width: 12px; height: 12px; margin-right: 3px;"></i>
                            ${stf.status}
                          </span>
                        </td>
                        <td style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">
                          ${stf.status === 'Absent' ? '—' : stf.checkInTime}
                        </td>
                        <td style="font-size: 0.78rem; color: var(--text-light); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          ${stf.remarks || 'Standard Shift'}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            ${staffList.length > 6 ? `
              <div style="padding: 0.85rem 1.5rem; text-align: center; border-top: 1px solid var(--border-color); background-color: var(--bg-app);">
                <a href="javascript:void(0)" onclick="window.app.navigate('staff-attendance')" style="font-size: 0.82rem; font-weight: 700; color: var(--primary-600);">
                  View all ${staffList.length} staff attendance records →
                </a>
              </div>
            ` : ''}
          </div>

        </div>

        <!-- === RIGHT COLUMN: Distribution Chart, Pending Leaves & Quick Shortcuts === -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Staff Distribution Donut Chart -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-title">Staff Status Distribution</div>
                <div class="chart-subtitle">Present, Absent, Leave & Late breakdown</div>
              </div>
            </div>
            <div class="chart-container" style="min-height: 270px;">
              <canvas id="distributionDonutChart"></canvas>
            </div>
          </div>

          <!-- Pending Staff Leave Applications -->
          <div class="card">
            <div class="card-header">
              <div class="card-title" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.98rem;">
                <i data-lucide="file-clock" style="color: #f59e0b; width: 18px;"></i>
                Pending Leave Approvals (${staffLeaves.length})
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.app.navigate('leaves')">View All</button>
            </div>
            <div style="padding: 1rem 1.25rem;">
              ${staffLeaves.length === 0 ? `
                <div style="text-align: center; padding: 1.75rem 1rem; color: var(--text-muted);">
                  <i data-lucide="check-circle" style="width: 34px; height: 34px; color: #10b981; margin-bottom: 0.4rem;"></i>
                  <p style="font-size: 0.85rem;">All faculty leave requests have been reviewed.</p>
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                  ${staffLeaves.map(l => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-app); border: 1px solid var(--border-color);">
                      <div>
                        <div style="font-weight: 700; font-size: 0.88rem;">${l.personName}</div>
                        <div style="font-size: 0.76rem; color: var(--text-muted);">${l.contextInfo} · <span style="color: var(--primary-600); font-weight: 600;">${l.leaveType}</span></div>
                        <div style="font-size: 0.74rem; color: var(--text-light); margin-top: 2px;">${l.startDate} to ${l.endDate} (${l.days} days)</div>
                      </div>
                      <div style="display: flex; gap: 0.35rem;">
                        <button class="btn btn-success btn-sm btn-icon-only" title="Approve" onclick="DashboardView.handleQuickLeave('${l.id}', 'Approved')">
                          <i data-lucide="check"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-icon-only" title="Reject" onclick="DashboardView.handleQuickLeave('${l.id}', 'Rejected')">
                          <i data-lucide="x"></i>
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>

          <!-- Quick Administration Operations Shortcuts -->
          <div class="card">
            <div class="card-header">
              <div class="card-title" style="font-size: 0.98rem;">Quick Operations</div>
            </div>
            <div style="padding: 1.25rem;">
              <div class="quick-action-grid">
                <div class="quick-action-tile" onclick="window.app.navigate('staff-attendance')">
                  <i data-lucide="user-check" style="width: 24px; height: 24px; color: var(--primary-600);"></i>
                  <span>Mark Staff</span>
                </div>
                <div class="quick-action-tile" onclick="window.app.navigate('student-attendance')">
                  <i data-lucide="calendar-check" style="width: 24px; height: 24px; color: #10b981;"></i>
                  <span>Mark Students</span>
                </div>
                <div class="quick-action-tile" onclick="window.app.navigate('calendar')">
                  <i data-lucide="calendar" style="width: 24px; height: 24px; color: #8b5cf6;"></i>
                  <span>Calendar Hub</span>
                </div>
                <div class="quick-action-tile" onclick="window.app.navigate('reports')">
                  <i data-lucide="bar-chart-3" style="width: 24px; height: 24px; color: #f59e0b;"></i>
                  <span>Staff Reports</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;
  },

  // =========================================================================
  // 2. STUDENTS TAB
  // =========================================================================
  renderStudentsTab: function(metrics, trend, leaves) {
    const studentLeaves = leaves.filter(l => l.personType === 'Student');

    return `
      <!-- Student KPI Grid (4 Columns x 2 Rows) -->
      <div class="kpi-grid">
        <div class="kpi-card" onclick="window.app.navigate('students')" style="cursor: pointer;">
          <div class="kpi-content">
            <span class="kpi-label">Total Students Enrolled</span>
            <div class="kpi-value">${metrics.students.total}</div>
            <span class="kpi-subtext">Across Grade 8-12</span>
          </div>
          <div class="kpi-icon"><i data-lucide="users"></i></div>
        </div>

        <div class="kpi-card kpi-present">
          <div class="kpi-content">
            <span class="kpi-label">Students Present Today</span>
            <div class="kpi-value">${metrics.students.present}</div>
            <span class="kpi-subtext" style="color: #10b981; font-weight: 700;">${metrics.students.rate}% Attendance Rate</span>
          </div>
          <div class="kpi-icon"><i data-lucide="check-circle-2"></i></div>
        </div>

        <div class="kpi-card kpi-absent">
          <div class="kpi-content">
            <span class="kpi-label">Students Absent</span>
            <div class="kpi-value">${metrics.students.absent}</div>
            <span class="kpi-subtext" style="color: #ef4444; font-weight: 600;">Requires attention</span>
          </div>
          <div class="kpi-icon"><i data-lucide="user-x"></i></div>
        </div>

        <div class="kpi-card kpi-leave">
          <div class="kpi-content">
            <span class="kpi-label">Students On Leave</span>
            <div class="kpi-value">${metrics.students.leave}</div>
            <span class="kpi-subtext">Authorized leaves</span>
          </div>
          <div class="kpi-icon"><i data-lucide="calendar"></i></div>
        </div>

        <div class="kpi-card kpi-late">
          <div class="kpi-content">
            <span class="kpi-label">Late Arrivals</span>
            <div class="kpi-value">${metrics.students.late}</div>
            <span class="kpi-subtext" style="color: #f59e0b;">Tardy check-ins</span>
          </div>
          <div class="kpi-icon"><i data-lucide="clock"></i></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Classes Monitored</span>
            <div class="kpi-value">5 Classes</div>
            <span class="kpi-subtext">13 Class sections active</span>
          </div>
          <div class="kpi-icon"><i data-lucide="book-open"></i></div>
        </div>

        <div class="kpi-card" onclick="DashboardView.switchTab('staff')" style="cursor: pointer;">
          <div class="kpi-content">
            <span class="kpi-label">Faculty Presence</span>
            <div class="kpi-value">${metrics.staff.rate}%</div>
            <span class="kpi-subtext">${metrics.staff.present}/${metrics.staff.total} faculty on duty</span>
          </div>
          <div class="kpi-icon"><i data-lucide="briefcase"></i></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Campus Rate</span>
            <div class="kpi-value">${metrics.overall.rate}%</div>
            <span class="kpi-subtext">Institution average</span>
          </div>
          <div class="kpi-icon"><i data-lucide="activity"></i></div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="dashboard-layout-grid">
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <div class="chart-title">7-Day Student Attendance Trends</div>
              <div class="chart-subtitle">Daily student presence over time</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.app.navigate('student-attendance')">
              <i data-lucide="check-circle-2"></i> Mark Student Attendance
            </button>
          </div>
          <div class="chart-container" style="min-height: 300px;">
            <canvas id="trendChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <div class="chart-title">Today's Student Distribution</div>
              <div class="chart-subtitle">Present vs Absent vs Leaves</div>
            </div>
          </div>
          <div class="chart-container" style="min-height: 300px;">
            <canvas id="distributionDonutChart"></canvas>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // 3. UNIFIED CAMPUS TAB
  // =========================================================================
  renderCampusTab: function(metrics, trend, leaves, deptDist) {
    const totalPeople = metrics.students.total + metrics.staff.total;
    const totalPresent = metrics.students.present + metrics.staff.present;

    return `
      <!-- Campus Overview KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Total Campus Population</span>
            <div class="kpi-value">${totalPeople}</div>
            <span class="kpi-subtext">${metrics.students.total} Students · ${metrics.staff.total} Faculty & Staff</span>
          </div>
          <div class="kpi-icon"><i data-lucide="school"></i></div>
        </div>

        <div class="kpi-card kpi-present">
          <div class="kpi-content">
            <span class="kpi-label">Total People On Campus</span>
            <div class="kpi-value">${totalPresent}</div>
            <span class="kpi-subtext" style="color: #10b981; font-weight: 700;">${metrics.overall.rate}% Combined Attendance</span>
          </div>
          <div class="kpi-icon"><i data-lucide="check-circle"></i></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Faculty Presence</span>
            <div class="kpi-value">${metrics.staff.rate}%</div>
            <span class="kpi-subtext">${metrics.staff.present} of ${metrics.staff.total} staff on site</span>
          </div>
          <div class="kpi-icon"><i data-lucide="briefcase"></i></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Student Body Rate</span>
            <div class="kpi-value">${metrics.students.rate}%</div>
            <span class="kpi-subtext">${metrics.students.present} of ${metrics.students.total} students present</span>
          </div>
          <div class="kpi-icon"><i data-lucide="graduation-cap"></i></div>
        </div>

        <div class="kpi-card kpi-absent">
          <div class="kpi-content">
            <span class="kpi-label">Total Absentees Today</span>
            <div class="kpi-value">${metrics.students.absent + metrics.staff.absent}</div>
            <span class="kpi-subtext">${metrics.staff.absent} Staff · ${metrics.students.absent} Students</span>
          </div>
          <div class="kpi-icon"><i data-lucide="user-x"></i></div>
        </div>

        <div class="kpi-card kpi-leave">
          <div class="kpi-content">
            <span class="kpi-label">Total On Leave</span>
            <div class="kpi-value">${metrics.students.leave + metrics.staff.leave}</div>
            <span class="kpi-subtext">Approved leaves across campus</span>
          </div>
          <div class="kpi-icon"><i data-lucide="calendar"></i></div>
        </div>

        <div class="kpi-card kpi-late">
          <div class="kpi-content">
            <span class="kpi-label">Total Late Arrivals</span>
            <div class="kpi-value">${metrics.students.late + metrics.staff.late}</div>
            <span class="kpi-subtext">${metrics.staff.late} Staff · ${metrics.students.late} Students</span>
          </div>
          <div class="kpi-icon"><i data-lucide="clock"></i></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-content">
            <span class="kpi-label">Pending Leaves</span>
            <div class="kpi-value">${leaves.length}</div>
            <span class="kpi-subtext">Awaiting administrator approval</span>
          </div>
          <div class="kpi-icon"><i data-lucide="file-clock"></i></div>
        </div>
      </div>

      <!-- Campus Charts -->
      <div class="dashboard-layout-grid">
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <div class="chart-title">7-Day Comparative Attendance Trends</div>
              <div class="chart-subtitle">Faculty presence vs Student attendance comparison</div>
            </div>
            <span class="badge badge-present">Unified</span>
          </div>
          <div class="chart-container" style="min-height: 300px;">
            <canvas id="trendChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <div class="chart-title">Total Campus Distribution</div>
              <div class="chart-subtitle">Combined present, absent, leave and late count</div>
            </div>
          </div>
          <div class="chart-container" style="min-height: 300px;">
            <canvas id="distributionDonutChart"></canvas>
          </div>
        </div>
      </div>
    `;
  },

  handleQuickLeave: function(leaveId, status) {
    window.db.updateLeaveStatus(leaveId, status, window.app.currentUser ? window.app.currentUser.name : 'Administrator');
    window.app.showToast(`Leave request marked as ${status}!`, status === 'Approved' ? 'success' : 'info');
    window.app.refreshCurrentView();
  },

  // =========================================================================
  // Chart.js Setup (Dynamically adapts to activeTab)
  // =========================================================================
  initCharts: function(metrics, trend) {
    // Destroy previous chart instances
    if (this.charts.trend) {
      this.charts.trend.destroy();
      this.charts.trend = null;
    }
    if (this.charts.donut) {
      this.charts.donut.destroy();
      this.charts.donut = null;
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

    // --- 1. Line Trend Chart ---
    const trendCtx = document.getElementById('trendChart')?.getContext('2d');
    if (trendCtx) {
      let datasets = [];

      if (this.activeTab === 'staff') {
        datasets = [
          {
            label: 'Faculty Present',
            data: trend.staff.present,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: '#10b981',
            pointRadius: 5
          },
          {
            label: 'Faculty Absent',
            data: trend.staff.absent,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            fill: false,
            tension: 0.35,
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: '#ef4444',
            pointRadius: 4
          }
        ];
      } else if (this.activeTab === 'students') {
        datasets = [
          {
            label: 'Students Present',
            data: trend.students.present,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: '#3b82f6',
            pointRadius: 5
          },
          {
            label: 'Students Absent',
            data: trend.students.absent,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            fill: false,
            tension: 0.35,
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: '#ef4444',
            pointRadius: 4
          }
        ];
      } else {
        datasets = [
          {
            label: 'Students Present',
            data: trend.students.present,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointBackgroundColor: '#3b82f6',
            pointRadius: 4
          },
          {
            label: 'Faculty Present',
            data: trend.staff.present,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointBackgroundColor: '#10b981',
            pointRadius: 4
          }
        ];
      }

      this.charts.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: trend.labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600', size: 12 } }
            },
            tooltip: {
              padding: 10,
              boxPadding: 4,
              usePointStyle: true
            }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, stepSize: 5, font: { family: 'Plus Jakarta Sans' } },
              beginAtZero: true
            }
          }
        }
      });
    }

    // --- 2. Donut Distribution Chart ---
    const donutCtx = document.getElementById('distributionDonutChart')?.getContext('2d');
    if (donutCtx) {
      let donutData = [];
      let donutLabels = ['Present', 'Absent', 'On Leave', 'Late'];

      if (this.activeTab === 'staff') {
        donutData = [
          metrics.staff.present,
          metrics.staff.absent,
          metrics.staff.leave,
          metrics.staff.late
        ];
      } else if (this.activeTab === 'students') {
        donutData = [
          metrics.students.present,
          metrics.students.absent,
          metrics.students.leave,
          metrics.students.late
        ];
      } else {
        donutData = [
          metrics.students.present + metrics.staff.present,
          metrics.students.absent + metrics.staff.absent,
          metrics.students.leave + metrics.staff.leave,
          metrics.students.late + metrics.staff.late
        ];
      }

      this.charts.donut = new Chart(donutCtx, {
        type: 'doughnut',
        data: {
          labels: donutLabels,
          datasets: [
            {
              data: donutData,
              backgroundColor: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'],
              borderWidth: 0,
              hoverOffset: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, padding: 14, font: { family: 'Plus Jakarta Sans', weight: '600', size: 12 } }
            },
            tooltip: {
              padding: 10,
              boxPadding: 6
            }
          },
          cutout: '68%'
        }
      });
    }
  }
};
