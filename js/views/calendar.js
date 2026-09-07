/**
 * EduTrack Pro - Interactive Attendance Calendar View
 * Monthly grid showing student & faculty attendance aggregates per day, with interactive day inspector.
 */

window.CalendarView = {
  currentYear: 2026,
  currentMonth: 8, // September (0-indexed: 8 = Sept)

  render: function(container) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    const html = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Institutional Attendance Calendar</h1>
          <p>Monthly visual overview of student and staff attendance patterns and leaves.</p>
        </div>
        <div class="page-actions">
          <div style="display: flex; align-items: center; gap: 0.5rem; background-color: var(--bg-card); padding: 0.25rem 0.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <button class="btn btn-secondary btn-sm btn-icon-only" onclick="CalendarView.prevMonth()">
              <i data-lucide="chevron-left"></i>
            </button>
            <span style="font-weight: 700; font-size: 0.95rem; min-width: 140px; text-align: center;">
              ${monthNames[this.currentMonth]} ${this.currentYear}
            </span>
            <button class="btn btn-secondary btn-sm btn-icon-only" onclick="CalendarView.nextMonth()">
              <i data-lucide="chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="calendar-wrapper">
        <!-- Weekday Headers -->
        <div class="calendar-grid" style="margin-bottom: 0.5rem;">
          <div class="calendar-day-header">Sun</div>
          <div class="calendar-day-header">Mon</div>
          <div class="calendar-day-header">Tue</div>
          <div class="calendar-day-header">Wed</div>
          <div class="calendar-day-header">Thu</div>
          <div class="calendar-day-header">Fri</div>
          <div class="calendar-day-header">Sat</div>
        </div>

        <!-- Days Grid -->
        <div class="calendar-grid">
          ${this.generateCalendarDays(firstDay, totalDaysInMonth)}
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  },

  generateCalendarDays: function(firstDayIndex, totalDays) {
    let cells = '';

    // Empty cells before start of month
    for (let i = 0; i < firstDayIndex; i++) {
      cells += `<div class="calendar-day-cell is-empty"></div>`;
    }

    const todayStr = '2026-09-03';

    for (let day = 1; day <= totalDays; day++) {
      const mm = String(this.currentMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${this.currentYear}-${mm}-${dd}`;
      const dayDate = new Date(this.currentYear, this.currentMonth, day);
      const isWeekend = (dayDate.getDay() === 0 || dayDate.getDay() === 6);
      const isToday = (dateStr === todayStr);

      const dayData = window.db.getCalendarDayDetails(dateStr);
      const hasRecords = (dayData.students.totalMarked > 0 || dayData.staff.totalMarked > 0);

      cells += `
        <div class="calendar-day-cell ${isToday ? 'is-today' : ''}" onclick="CalendarView.inspectDay('${dateStr}')">
          <div class="cal-day-num" style="${isWeekend ? 'color: var(--text-light);' : ''}">
            ${day} ${isToday ? '<span class="badge badge-primary" style="font-size: 0.65rem; padding: 1px 4px;">Today</span>' : ''}
          </div>

          ${isWeekend ? `
            <div style="font-size: 0.7rem; color: var(--text-light); margin-top: auto;">Weekend</div>
          ` : hasRecords ? `
            <div class="cal-status-pills">
              <div class="cal-pill" style="background-color: var(--status-present-bg); color: var(--status-present-text);">
                <span>Present</span>
                <strong>${dayData.students.present.length + dayData.staff.present.length}</strong>
              </div>
              ${(dayData.students.absent.length + dayData.staff.absent.length) > 0 ? `
                <div class="cal-pill" style="background-color: var(--status-absent-bg); color: var(--status-absent-text);">
                  <span>Absent</span>
                  <strong>${dayData.students.absent.length + dayData.staff.absent.length}</strong>
                </div>
              ` : ''}
              ${(dayData.students.leave.length + dayData.staff.leave.length) > 0 ? `
                <div class="cal-pill" style="background-color: var(--status-leave-bg); color: var(--status-leave-text);">
                  <span>Leave</span>
                  <strong>${dayData.students.leave.length + dayData.staff.leave.length}</strong>
                </div>
              ` : ''}
            </div>
          ` : `
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: auto;">No records</div>
          `}
        </div>
      `;
    }

    return cells;
  },

  prevMonth: function() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.render(document.getElementById('content-view'));
  },

  nextMonth: function() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.render(document.getElementById('content-view'));
  },

  inspectDay: function(dateStr) {
    const data = window.db.getCalendarDayDetails(dateStr);

    const content = `
      <div style="margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800;">Attendance Breakdown for ${dateStr}</h3>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="StudentAttendanceView.selectedDate = '${dateStr}'; window.app.navigate('student-attendance'); window.app.closeModal();">
              <i data-lucide="check-square"></i> Mark Students
            </button>
            <button class="btn btn-secondary btn-sm" onclick="StaffAttendanceView.selectedDate = '${dateStr}'; window.app.navigate('staff-attendance'); window.app.closeModal();">
              <i data-lucide="users"></i> Mark Staff
            </button>
          </div>
        </div>

        <!-- Metric summaries -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.25rem;">
          <div style="background-color: var(--status-present-bg); padding: 0.75rem; border-radius: var(--radius-md); text-align: center;">
            <div style="font-size: 0.75rem; color: var(--status-present-text);">Total Present</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--status-present-text);">${data.students.present.length + data.staff.present.length}</div>
          </div>
          <div style="background-color: var(--status-absent-bg); padding: 0.75rem; border-radius: var(--radius-md); text-align: center;">
            <div style="font-size: 0.75rem; color: var(--status-absent-text);">Total Absent</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--status-absent-text);">${data.students.absent.length + data.staff.absent.length}</div>
          </div>
          <div style="background-color: var(--status-leave-bg); padding: 0.75rem; border-radius: var(--radius-md); text-align: center;">
            <div style="font-size: 0.75rem; color: var(--status-leave-text);">Total On Leave</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--status-leave-text);">${data.students.leave.length + data.staff.leave.length}</div>
          </div>
        </div>

        <!-- Student Absentees & Leaves -->
        <div style="margin-bottom: 1.25rem;">
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: #ef4444;">Absent Students (${data.students.absent.length})</h4>
          ${data.students.absent.length === 0 ? `
            <p style="font-size: 0.82rem; color: var(--text-muted);">No absent students on this date.</p>
          ` : `
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
              ${data.students.absent.map(s => `
                <span class="badge badge-absent" style="font-size: 0.8rem; padding: 0.35rem 0.65rem;">
                  ${s.studentName} (${s.class}-${s.section})
                </span>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Staff Absentees & Leaves -->
        <div>
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: #3b82f6;">Staff On Leave (${data.staff.leave.length})</h4>
          ${data.staff.leave.length === 0 ? `
            <p style="font-size: 0.82rem; color: var(--text-muted);">No staff on leave on this date.</p>
          ` : `
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
              ${data.staff.leave.map(st => `
                <span class="badge badge-leave" style="font-size: 0.8rem; padding: 0.35rem 0.65rem;">
                  ${st.staffName} (${st.department}) - ${st.remarks || 'Leave'}
                </span>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    window.app.openModal({
      title: `Day Summary: ${dateStr}`,
      body: content,
      hideSubmit: true
    });
  }
};
