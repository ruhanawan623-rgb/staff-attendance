/**
 * EduTrack Pro - Staff & Faculty Attendance Marker View
 * Daily staff attendance management with department filter, quick actions, and status tracking.
 */

window.StaffAttendanceView = {
  selectedDepartment: 'all',
  selectedDate: '2026-09-03',
  currentRecords: [],

  render: function(container) {
    const departments = window.db.getDepartments();

    this.currentRecords = window.db.getStaffAttendanceForDate(
      this.selectedDate,
      this.selectedDepartment
    );

    // Live counters
    const total = this.currentRecords.length;
    const presentCount = this.currentRecords.filter(r => r.status === 'Present').length;
    const absentCount = this.currentRecords.filter(r => r.status === 'Absent').length;
    const lateCount = this.currentRecords.filter(r => r.status === 'Late').length;
    const leaveCount = this.currentRecords.filter(r => r.status === 'Leave').length;
    const rate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

    const html = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Faculty & Staff Daily Attendance</h1>
          <p>Record daily campus presence and status for faculty and support staff</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="StaffAttendanceView.setAllStatus('Present')">
            <i data-lucide="check-check"></i> Mark All Present
          </button>
          <button class="btn btn-secondary" onclick="StaffAttendanceView.setAllStatus('Absent')">
            <i data-lucide="x-circle"></i> Mark All Absent
          </button>
          <button class="btn btn-primary" onclick="StaffAttendanceView.saveAttendance()">
            <i data-lucide="save"></i> Save Attendance
          </button>
        </div>
      </div>

      <!-- Controls & Filter Toolbar -->
      <div class="card" style="margin-bottom: 1.25rem;">
        <div style="padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            
            <!-- Date Picker -->
            <div>
              <label class="form-label" style="margin-bottom: 2px;">Attendance Date</label>
              <input 
                type="date" 
                class="form-input" 
                value="${this.selectedDate}" 
                onchange="StaffAttendanceView.handleDateChange(this.value)"
                style="height: 38px; font-weight: 600;"
              />
            </div>

            <!-- Department Picker -->
            <div>
              <label class="form-label" style="margin-bottom: 2px;">Department</label>
              <select class="form-select" onchange="StaffAttendanceView.handleDepartmentChange(this.value)" style="height: 38px; font-weight: 600;">
                <option value="all" ${this.selectedDepartment === 'all' ? 'selected' : ''}>All Departments</option>
                ${departments.map(d => `<option value="${d}" ${this.selectedDepartment === d ? 'selected' : ''}>${d}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Quick Summary Counter Pills -->
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <div style="padding: 0.4rem 0.85rem; border-radius: var(--radius-md); background-color: var(--status-present-bg); border: 1px solid var(--status-present-border); font-size: 0.82rem; font-weight: 700; color: var(--status-present-text);">
              Present: <span id="stf-counter-present">${presentCount}</span>
            </div>
            <div style="padding: 0.4rem 0.85rem; border-radius: var(--radius-md); background-color: var(--status-absent-bg); border: 1px solid var(--status-absent-border); font-size: 0.82rem; font-weight: 700; color: var(--status-absent-text);">
              Absent: <span id="stf-counter-absent">${absentCount}</span>
            </div>
            <div style="padding: 0.4rem 0.85rem; border-radius: var(--radius-md); background-color: var(--status-late-bg); border: 1px solid var(--status-late-border); font-size: 0.82rem; font-weight: 700; color: var(--status-late-text);">
              Late: <span id="stf-counter-late">${lateCount}</span>
            </div>
            <div style="padding: 0.4rem 0.85rem; border-radius: var(--radius-md); background-color: var(--status-leave-bg); border: 1px solid var(--status-leave-border); font-size: 0.82rem; font-weight: 700; color: var(--status-leave-text);">
              Leave: <span id="stf-counter-leave">${leaveCount}</span>
            </div>
            <div style="padding: 0.4rem 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-app); border: 1px solid var(--border-color); font-size: 0.82rem; font-weight: 700;">
              Rate: <span id="stf-counter-rate">${rate}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Staff Attendance Marking Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Faculty & Staff Info</th>
                <th>Department & Role</th>
                <th>Attendance Status</th>
                <th>Notes / Remarks</th>
                <th style="width: 90px; text-align: right;">History</th>
              </tr>
            </thead>
            <tbody>
              ${this.currentRecords.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i data-lucide="users" style="width: 40px; height: 40px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    <p>No faculty members found in the selected department.</p>
                  </td>
                </tr>
              ` : this.currentRecords.map((record, idx) => `
                <tr id="stf-row-${record.staffId}">
                  <td>
                    <div class="table-user-cell">
                      <img src="${record.avatar}" class="table-user-avatar" alt="${record.staffName}" />
                      <div>
                        <div class="table-user-name">${record.staffName}</div>
                        <div class="table-user-sub">ID: ${record.staffId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div><strong>${record.designation}</strong></div>
                    <div style="font-size: 0.78rem; color: var(--primary-600);">${record.department}</div>
                  </td>
                  <td>
                    <div class="attendance-status-group">
                      <button 
                        type="button" 
                        class="att-status-btn ${record.status === 'Present' ? 'selected-present' : ''}" 
                        onclick="StaffAttendanceView.setStatus(${idx}, 'Present')"
                      >
                        Present
                      </button>
                      <button 
                        type="button" 
                        class="att-status-btn ${record.status === 'Absent' ? 'selected-absent' : ''}" 
                        onclick="StaffAttendanceView.setStatus(${idx}, 'Absent')"
                      >
                        Absent
                      </button>
                      <button 
                        type="button" 
                        class="att-status-btn ${record.status === 'Late' ? 'selected-late' : ''}" 
                        onclick="StaffAttendanceView.setStatus(${idx}, 'Late')"
                      >
                        Late
                      </button>
                      <button 
                        type="button" 
                        class="att-status-btn ${record.status === 'Leave' ? 'selected-leave' : ''}" 
                        onclick="StaffAttendanceView.setStatus(${idx}, 'Leave')"
                      >
                        Leave
                      </button>
                    </div>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      class="form-input" 
                      placeholder="Optional remarks (e.g. duty travel, medical)" 
                      value="${record.remarks || ''}"
                      oninput="StaffAttendanceView.updateRemarks(${idx}, this.value)"
                      style="height: 34px; font-size: 0.82rem;"
                    />
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm btn-icon-only" title="View Profile & Stats" onclick="StaffView.viewProfile('${record.staffId}')">
                      <i data-lucide="eye"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="padding: 1.25rem 1.5rem; background-color: var(--bg-table-header); border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 0.85rem; color: var(--text-muted);">
            Ensure faculty attendance matches institutional log records.
          </div>
          <button class="btn btn-primary" onclick="StaffAttendanceView.saveAttendance()">
            <i data-lucide="check"></i> Submit & Save Faculty Attendance
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  },

  handleDateChange: function(val) {
    this.selectedDate = val;
    this.render(document.getElementById('content-view'));
  },

  handleDepartmentChange: function(val) {
    this.selectedDepartment = val;
    this.render(document.getElementById('content-view'));
  },

  setStatus: function(idx, status) {
    if (this.currentRecords[idx]) {
      this.currentRecords[idx].status = status;
      this.updateCounters();
      this.renderRowStatus(idx);
    }
  },

  setAllStatus: function(status) {
    this.currentRecords.forEach(r => (r.status = status));
    this.render(document.getElementById('content-view'));
    window.app.showToast(`All staff marked as ${status}`, 'info');
  },

  updateRemarks: function(idx, val) {
    if (this.currentRecords[idx]) {
      this.currentRecords[idx].remarks = val;
    }
  },

  renderRowStatus: function(idx) {
    const record = this.currentRecords[idx];
    const row = document.getElementById(`stf-row-${record.staffId}`);
    if (!row) return;

    const btnGroup = row.querySelector('.attendance-status-group');
    if (btnGroup) {
      btnGroup.innerHTML = `
        <button type="button" class="att-status-btn ${record.status === 'Present' ? 'selected-present' : ''}" onclick="StaffAttendanceView.setStatus(${idx}, 'Present')">Present</button>
        <button type="button" class="att-status-btn ${record.status === 'Absent' ? 'selected-absent' : ''}" onclick="StaffAttendanceView.setStatus(${idx}, 'Absent')">Absent</button>
        <button type="button" class="att-status-btn ${record.status === 'Late' ? 'selected-late' : ''}" onclick="StaffAttendanceView.setStatus(${idx}, 'Late')">Late</button>
        <button type="button" class="att-status-btn ${record.status === 'Leave' ? 'selected-leave' : ''}" onclick="StaffAttendanceView.setStatus(${idx}, 'Leave')">Leave</button>
      `;
    }
  },

  updateCounters: function() {
    const total = this.currentRecords.length;
    const present = this.currentRecords.filter(r => r.status === 'Present').length;
    const absent = this.currentRecords.filter(r => r.status === 'Absent').length;
    const late = this.currentRecords.filter(r => r.status === 'Late').length;
    const leave = this.currentRecords.filter(r => r.status === 'Leave').length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    const elP = document.getElementById('stf-counter-present');
    const elA = document.getElementById('stf-counter-absent');
    const elLa = document.getElementById('stf-counter-late');
    const elLe = document.getElementById('stf-counter-leave');
    const elR = document.getElementById('stf-counter-rate');

    if (elP) elP.innerText = present;
    if (elA) elA.innerText = absent;
    if (elLa) elLa.innerText = late;
    if (elLe) elLe.innerText = leave;
    if (elR) elR.innerText = `${rate}%`;
  },

  saveAttendance: function() {
    if (this.currentRecords.length === 0) {
      window.app.showToast("No faculty records to save.", "warning");
      return;
    }

    window.db.saveStaffAttendance(
      this.selectedDate,
      this.currentRecords,
      window.app.currentUser.name
    );

    window.app.showToast(
      `Faculty attendance saved successfully for ${this.selectedDate}!`,
      "success"
    );
  }
};
