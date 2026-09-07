/**
 * EduTrack Pro - Student Attendance Marker View
 * Interactive daily class attendance marking with duplicate prevention, quick bulk status toggles, and live summary.
 */

window.StudentAttendanceView = {
  selectedClass: 'Grade 10',
  selectedSection: 'A',
  selectedDate: '2026-09-03',
  currentRecords: [],

  render: function(container) {
    const classes = window.db.getClasses();
    const currentClassObj = classes.find(c => c.name === this.selectedClass) || classes[0];
    const sections = currentClassObj ? currentClassObj.sections : ["A", "B"];

    // Fetch records for current class, section, date
    this.currentRecords = window.db.getStudentAttendanceForClassAndDate(
      this.selectedClass,
      this.selectedSection,
      this.selectedDate
    );

    // Calculate live counters
    const total = this.currentRecords.length;
    const presentCount = this.currentRecords.filter(r => r.status === 'Present').length;
    const absentCount = this.currentRecords.filter(r => r.status === 'Absent').length;
    const lateCount = this.currentRecords.filter(r => r.status === 'Late').length;
    const leaveCount = this.currentRecords.filter(r => r.status === 'Leave').length;
    const rate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

    const html = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Student Daily Attendance</h1>
          <p>Mark and update classroom attendance records for <strong>${this.selectedClass} (${this.selectedSection})</strong></p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="StudentAttendanceView.setAllStatus('Present')">
            <i data-lucide="check-check"></i> Mark All Present
          </button>
          <button class="btn btn-secondary" onclick="StudentAttendanceView.setAllStatus('Absent')">
            <i data-lucide="x-circle"></i> Mark All Absent
          </button>
          <button class="btn btn-primary" onclick="StudentAttendanceView.saveAttendance()">
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
                onchange="StudentAttendanceView.handleDateChange(this.value)"
                style="height: 38px; font-weight: 600;"
              />
            </div>

            <!-- Class Picker -->
            <div>
              <label class="form-label" style="margin-bottom: 2px;">Class</label>
              <select class="form-select" onchange="StudentAttendanceView.handleClassChange(this.value)" style="height: 38px; font-weight: 600;">
                ${classes.map(c => `<option value="${c.name}" ${this.selectedClass === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>

            <!-- Section Picker -->
            <div>
              <label class="form-label" style="margin-bottom: 2px;">Section</label>
              <select class="form-select" onchange="StudentAttendanceView.handleSectionChange(this.value)" style="height: 38px; font-weight: 600;">
                ${sections.map(s => `<option value="${s}" ${this.selectedSection === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Quick Summary Counter Pills -->
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <div style="padding: 0.4rem 0.85rem; border-radius: var(--radius-md); background-color: var(--status-present-bg); border: 1px solid var(--status-present-border); font-size: 0.82rem; font-weight: 700; color: var(--status-present-text);">
              Present: <span id="counter-present">${presentCount}</span>
            </div>
            <div style="padding: 0.4rem 0.85rem; border-radius: var(--radius-md); background-color: var(--status-absent-bg); border: 1px solid var(--status-absent-border); font-size: 0.82rem; font-weight: 700; color: var(--status-absent-text);">
              Absent: <span id="counter-absent">${absentCount}</span>
            </div>
            <div style="padding: 0.4rem 0.85rem; border-radius: var(--radius-md); background-color: var(--status-late-bg); border: 1px solid var(--status-late-border); font-size: 0.82rem; font-weight: 700; color: var(--status-late-text);">
              Late: <span id="counter-late">${lateCount}</span>
            </div>
            <div style="padding: 0.4rem 0.85rem; border-radius: var(--radius-md); background-color: var(--status-leave-bg); border: 1px solid var(--status-leave-border); font-size: 0.82rem; font-weight: 700; color: var(--status-leave-text);">
              Leave: <span id="counter-leave">${leaveCount}</span>
            </div>
            <div style="padding: 0.4rem 0.85rem; border-radius: var(--radius-md); background-color: var(--bg-app); border: 1px solid var(--border-color); font-size: 0.82rem; font-weight: 700;">
              Rate: <span id="counter-rate">${rate}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Attendance Marking Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 80px;">Roll No</th>
                <th>Student Info</th>
                <th>Attendance Status</th>
                <th>Notes / Remarks</th>
                <th style="width: 90px; text-align: right;">History</th>
              </tr>
            </thead>
            <tbody>
              ${this.currentRecords.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i data-lucide="user-x" style="width: 40px; height: 40px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    <p>No active students found in ${this.selectedClass} (${this.selectedSection}).</p>
                  </td>
                </tr>
              ` : this.currentRecords.map((record, idx) => `
                <tr id="att-row-${record.studentId}">
                  <td><span style="font-weight: 700; font-size: 0.95rem;">${record.rollNumber}</span></td>
                  <td>
                    <div class="table-user-cell">
                      <img src="${record.avatar}" class="table-user-avatar" alt="${record.studentName}" />
                      <div>
                        <div class="table-user-name">${record.studentName}</div>
                        <div class="table-user-sub">ID: ${record.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="attendance-status-group">
                      <button 
                        type="button" 
                        class="att-status-btn ${record.status === 'Present' ? 'selected-present' : ''}" 
                        onclick="StudentAttendanceView.setStatus(${idx}, 'Present')"
                      >
                        Present
                      </button>
                      <button 
                        type="button" 
                        class="att-status-btn ${record.status === 'Absent' ? 'selected-absent' : ''}" 
                        onclick="StudentAttendanceView.setStatus(${idx}, 'Absent')"
                      >
                        Absent
                      </button>
                      <button 
                        type="button" 
                        class="att-status-btn ${record.status === 'Late' ? 'selected-late' : ''}" 
                        onclick="StudentAttendanceView.setStatus(${idx}, 'Late')"
                      >
                        Late
                      </button>
                      <button 
                        type="button" 
                        class="att-status-btn ${record.status === 'Leave' ? 'selected-leave' : ''}" 
                        onclick="StudentAttendanceView.setStatus(${idx}, 'Leave')"
                      >
                        Leave
                      </button>
                    </div>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      class="form-input" 
                      placeholder="Optional remark (e.g. sick note, bus delay)" 
                      value="${record.remarks || ''}"
                      oninput="StudentAttendanceView.updateRemarks(${idx}, this.value)"
                      style="height: 34px; font-size: 0.82rem;"
                    />
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm btn-icon-only" title="View Profile & Stats" onclick="StudentsView.viewProfile('${record.studentId}')">
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
            Ensure all records are reviewed before finalizing.
          </div>
          <button class="btn btn-primary" onclick="StudentAttendanceView.saveAttendance()">
            <i data-lucide="check"></i> Submit & Save Daily Attendance
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

  handleClassChange: function(val) {
    this.selectedClass = val;
    const classes = window.db.getClasses();
    const cObj = classes.find(c => c.name === val);
    this.selectedSection = cObj && cObj.sections.length > 0 ? cObj.sections[0] : 'A';
    this.render(document.getElementById('content-view'));
  },

  handleSectionChange: function(val) {
    this.selectedSection = val;
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
    window.app.showToast(`All students marked as ${status}`, 'info');
  },

  updateRemarks: function(idx, val) {
    if (this.currentRecords[idx]) {
      this.currentRecords[idx].remarks = val;
    }
  },

  renderRowStatus: function(idx) {
    const record = this.currentRecords[idx];
    const row = document.getElementById(`att-row-${record.studentId}`);
    if (!row) return;

    const btnGroup = row.querySelector('.attendance-status-group');
    if (btnGroup) {
      btnGroup.innerHTML = `
        <button type="button" class="att-status-btn ${record.status === 'Present' ? 'selected-present' : ''}" onclick="StudentAttendanceView.setStatus(${idx}, 'Present')">Present</button>
        <button type="button" class="att-status-btn ${record.status === 'Absent' ? 'selected-absent' : ''}" onclick="StudentAttendanceView.setStatus(${idx}, 'Absent')">Absent</button>
        <button type="button" class="att-status-btn ${record.status === 'Late' ? 'selected-late' : ''}" onclick="StudentAttendanceView.setStatus(${idx}, 'Late')">Late</button>
        <button type="button" class="att-status-btn ${record.status === 'Leave' ? 'selected-leave' : ''}" onclick="StudentAttendanceView.setStatus(${idx}, 'Leave')">Leave</button>
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

    const elP = document.getElementById('counter-present');
    const elA = document.getElementById('counter-absent');
    const elLa = document.getElementById('counter-late');
    const elLe = document.getElementById('counter-leave');
    const elR = document.getElementById('counter-rate');

    if (elP) elP.innerText = present;
    if (elA) elA.innerText = absent;
    if (elLa) elLa.innerText = late;
    if (elLe) elLe.innerText = leave;
    if (elR) elR.innerText = `${rate}%`;
  },

  saveAttendance: function() {
    if (this.currentRecords.length === 0) {
      window.app.showToast("No students to save attendance for.", "warning");
      return;
    }

    window.db.saveStudentAttendance(
      this.selectedClass,
      this.selectedSection,
      this.selectedDate,
      this.currentRecords,
      window.app.currentUser.name
    );

    window.app.showToast(
      `Attendance saved successfully for ${this.selectedClass} (${this.selectedSection}) on ${this.selectedDate}!`,
      "success"
    );
  }
};
