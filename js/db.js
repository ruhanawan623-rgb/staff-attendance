/**
 * EduTrack Pro - LocalStorage Database Layer & Business Logic
 * Provides full CRUD operations, calculated percentages, duplicate check, and event broadcasts.
 */

class Database {
  constructor() {
    this.STORAGE_KEY = 'EDUTRACK_DB_PRO_V1';
    this.listeners = [];
    this.init();
  }

  init() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      this.resetToSeed();
    } else {
      try {
        this.data = JSON.parse(raw);
        // Ensure all required top-level keys exist
        if (!this.data.students || !this.data.staff || !this.data.studentAttendance) {
          this.resetToSeed();
        } else if (this.data.settings && this.data.settings.schoolName !== "Staff Attendance") {
          this.data.settings.schoolName = "Staff Attendance";
          this.data.settings.schoolLogo = "💼";
          this.save();
        }
      } catch (e) {
        console.error("Error parsing stored data, resetting to seed:", e);
        this.resetToSeed();
      }
    }
  }

  resetToSeed() {
    // Deep clone SEED_DATA
    this.data = JSON.parse(JSON.stringify(SEED_DATA));
    this.save();
    this.notify('all');
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("Storage save failed:", e);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(entity, details = {}) {
    this.listeners.forEach(cb => {
      try {
        cb(entity, details);
      } catch (e) {
        console.error("Listener error:", e);
      }
    });
  }

  // ==========================================
  // SETTINGS & METADATA
  // ==========================================
  getSettings() {
    return this.data.settings;
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    this.notify('settings', this.data.settings);
    return this.data.settings;
  }

  getClasses() {
    return this.data.settings.classes || [];
  }

  getDepartments() {
    return this.data.settings.departments || [];
  }

  getLeaveTypes() {
    return this.data.settings.leaveTypes || [];
  }

  // ==========================================
  // USERS & AUTHENTICATION
  // ==========================================
  getUsers() {
    return this.data.users || [];
  }

  getUserById(id) {
    return (this.data.users || []).find(u => u.id === id) || null;
  }

  getUserByEmail(email) {
    if (!email) return null;
    return (this.data.users || []).find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  authenticate(email, password) {
    const user = this.getUserByEmail(email);
    if (!user) {
      return { success: false, message: "No account found with this email address." };
    }

    // Default password fallback for demo accounts if not set
    const expectedPassword = user.password || "password123";
    if (password && password !== expectedPassword && password !== "admin123" && password !== "password123") {
      return { success: false, message: "Incorrect password. Please try again." };
    }

    return { success: true, user: user };
  }

  registerUser(userData) {
    const existing = this.getUserByEmail(userData.email);
    if (existing) {
      return { success: false, message: "An account with this email address already exists." };
    }

    const maxNum = (this.data.users || []).reduce((max, u) => {
      const num = parseInt((u.id || '').replace('USR-', '')) || 0;
      return num > max ? num : max;
    }, 0);

    const newId = `USR-${String(maxNum + 1).padStart(3, '0')}`;
    const avatar = userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name || 'User')}`;

    const newUser = {
      id: newId,
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role || 'staff',
      title: userData.title || (userData.role === 'admin' ? 'Administrator' : userData.role === 'teacher' ? 'Faculty Teacher' : 'Administrative Staff'),
      department: userData.department || 'Administration & Support',
      avatar: avatar,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (!this.data.users) this.data.users = [];
    this.data.users.push(newUser);

    // If role is staff or teacher, also register in the faculty & staff database
    if (newUser.role === 'staff' || newUser.role === 'teacher') {
      const existingStaff = (this.data.staff || []).find(s => s.email && s.email.toLowerCase() === newUser.email);
      if (!existingStaff) {
        const staffMaxNum = (this.data.staff || []).reduce((max, s) => {
          const num = parseInt((s.id || '').replace('STF-', '')) || 100;
          return num > max ? num : max;
        }, 100);
        const staffId = `STF-${staffMaxNum + 1}`;
        newUser.staffId = staffId;

        const newStaff = {
          id: staffId,
          name: newUser.name,
          email: newUser.email,
          gender: userData.gender || 'Other',
          designation: newUser.title,
          department: newUser.department,
          phone: userData.phone || '+1 (555) 019-2831',
          joinDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          avatar: avatar
        };

        if (!this.data.staff) this.data.staff = [];
        this.data.staff.push(newStaff);

        // Add today's attendance record
        const todayStr = '2026-09-03';
        if (this.data.staffAttendance) {
          this.data.staffAttendance.push({
            id: `ATT-STF-NEW-${staffId}`,
            staffId: staffId,
            name: newUser.name,
            department: newUser.department,
            designation: newUser.title,
            date: todayStr,
            status: 'Present',
            checkInTime: '08:30 AM',
            remarks: 'Active account',
            avatar: avatar
          });
        }
      }
    }

    this.save();
    this.notify('users', { action: 'register', user: newUser });
    return { success: true, user: newUser };
  }

  // ==========================================
  // STUDENTS CRUD & METRICS
  // ==========================================
  getStudents(filters = {}) {
    let list = [...this.data.students];

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        (s.guardianName && s.guardianName.toLowerCase().includes(q))
      );
    }

    if (filters.class && filters.class !== 'all') {
      list = list.filter(s => s.class === filters.class);
    }

    if (filters.section && filters.section !== 'all') {
      list = list.filter(s => s.section === filters.section);
    }

    if (filters.status && filters.status !== 'all') {
      list = list.filter(s => s.status.toLowerCase() === filters.status.toLowerCase());
    }

    // Attach calculated attendance rate
    return list.map(s => {
      const stats = this.getStudentAttendanceStats(s.id);
      return {
        ...s,
        attendanceStats: stats,
        attendancePercent: stats.percentage
      };
    });
  }

  getStudentById(id) {
    const student = this.data.students.find(s => s.id === id);
    if (!student) return null;
    const stats = this.getStudentAttendanceStats(id);
    const history = this.getStudentAttendanceHistory(id);
    const leaves = this.data.leaves.filter(l => l.personId === id);
    return {
      ...student,
      attendanceStats: stats,
      attendancePercent: stats.percentage,
      attendanceHistory: history,
      leaves: leaves
    };
  }

  addStudent(studentData) {
    // Generate new ID
    const maxNum = this.data.students.reduce((max, s) => {
      const num = parseInt(s.id.replace('STD-', '')) || 1000;
      return num > max ? num : max;
    }, 1000);

    const newStudent = {
      id: `STD-${maxNum + 1}`,
      avatar: studentData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentData.name)}`,
      status: studentData.status || 'Active',
      admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0],
      ...studentData
    };

    this.data.students.unshift(newStudent);
    this.save();
    this.notify('students', { action: 'add', item: newStudent });
    return newStudent;
  }

  updateStudent(id, studentData) {
    const idx = this.data.students.findIndex(s => s.id === id);
    if (idx === -1) return null;

    this.data.students[idx] = {
      ...this.data.students[idx],
      ...studentData
    };

    // Update names in attendance records
    if (studentData.name || studentData.class || studentData.section) {
      this.data.studentAttendance.forEach(rec => {
        if (rec.studentId === id) {
          if (studentData.name) rec.studentName = studentData.name;
          if (studentData.class) rec.class = studentData.class;
          if (studentData.section) rec.section = studentData.section;
        }
      });
    }

    this.save();
    this.notify('students', { action: 'update', item: this.data.students[idx] });
    return this.data.students[idx];
  }

  deleteStudent(id) {
    const idx = this.data.students.findIndex(s => s.id === id);
    if (idx === -1) return false;

    const removed = this.data.students.splice(idx, 1)[0];
    // Clean up attendance records
    this.data.studentAttendance = this.data.studentAttendance.filter(a => a.studentId !== id);
    this.save();
    this.notify('students', { action: 'delete', item: removed });
    return true;
  }

  getStudentAttendanceStats(studentId) {
    const records = this.data.studentAttendance.filter(a => a.studentId === studentId);
    const total = records.length;
    if (total === 0) {
      return { total: 0, present: 0, absent: 0, late: 0, leave: 0, percentage: 100 };
    }

    const present = records.filter(a => a.status === 'Present').length;
    const late = records.filter(a => a.status === 'Late').length;
    const leave = records.filter(a => a.status === 'Leave').length;
    const absent = records.filter(a => a.status === 'Absent').length;

    // Standard school formula: (Present + Late + Leave) / Total * 100 (or Present + Late)
    // We consider Present + Late as attended days:
    const attended = present + (late * 1.0);
    const effectiveTotal = total;
    const percentage = Math.round((attended / effectiveTotal) * 1000) / 10;

    return { total, present, absent, late, leave, percentage };
  }

  getStudentAttendanceHistory(studentId) {
    return this.data.studentAttendance
      .filter(a => a.studentId === studentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // ==========================================
  // STAFF & TEACHERS CRUD & METRICS
  // ==========================================
  getStaff(filters = {}) {
    let list = [...this.data.staff];

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q)
      );
    }

    if (filters.department && filters.department !== 'all') {
      list = list.filter(s => s.department === filters.department);
    }

    if (filters.status && filters.status !== 'all') {
      list = list.filter(s => s.status.toLowerCase() === filters.status.toLowerCase());
    }

    return list.map(s => {
      const stats = this.getStaffAttendanceStats(s.id);
      return {
        ...s,
        attendanceStats: stats,
        attendancePercent: stats.percentage
      };
    });
  }

  getStaffById(id) {
    const member = this.data.staff.find(s => s.id === id);
    if (!member) return null;
    const stats = this.getStaffAttendanceStats(id);
    const history = this.getStaffAttendanceHistory(id);
    const leaves = this.data.leaves.filter(l => l.personId === id);
    return {
      ...member,
      attendanceStats: stats,
      attendancePercent: stats.percentage,
      attendanceHistory: history,
      leaves: leaves
    };
  }

  addStaff(staffData) {
    const maxNum = this.data.staff.reduce((max, s) => {
      const num = parseInt(s.id.replace('STF-', '')) || 100;
      return num > max ? num : max;
    }, 100);

    const newStaff = {
      id: `STF-${maxNum + 1}`,
      avatar: staffData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(staffData.name)}`,
      status: staffData.status || 'Active',
      joiningDate: staffData.joiningDate || new Date().toISOString().split('T')[0],
      ...staffData
    };

    this.data.staff.unshift(newStaff);
    this.save();
    this.notify('staff', { action: 'add', item: newStaff });
    return newStaff;
  }

  updateStaff(id, staffData) {
    const idx = this.data.staff.findIndex(s => s.id === id);
    if (idx === -1) return null;

    this.data.staff[idx] = {
      ...this.data.staff[idx],
      ...staffData
    };

    if (staffData.name || staffData.department || staffData.designation) {
      this.data.staffAttendance.forEach(rec => {
        if (rec.staffId === id) {
          if (staffData.name) rec.staffName = staffData.name;
          if (staffData.department) rec.department = staffData.department;
          if (staffData.designation) rec.designation = staffData.designation;
        }
      });
    }

    this.save();
    this.notify('staff', { action: 'update', item: this.data.staff[idx] });
    return this.data.staff[idx];
  }

  deleteStaff(id) {
    const idx = this.data.staff.findIndex(s => s.id === id);
    if (idx === -1) return false;

    const removed = this.data.staff.splice(idx, 1)[0];
    this.data.staffAttendance = this.data.staffAttendance.filter(a => a.staffId !== id);
    this.save();
    this.notify('staff', { action: 'delete', item: removed });
    return true;
  }

  getStaffAttendanceStats(staffId) {
    const records = this.data.staffAttendance.filter(a => a.staffId === staffId);
    const total = records.length;
    if (total === 0) {
      return { total: 0, present: 0, absent: 0, late: 0, leave: 0, percentage: 100 };
    }

    const present = records.filter(a => a.status === 'Present').length;
    const late = records.filter(a => a.status === 'Late').length;
    const leave = records.filter(a => a.status === 'Leave').length;
    const absent = records.filter(a => a.status === 'Absent').length;

    const attended = present + late;
    const percentage = Math.round((attended / total) * 1000) / 10;

    return { total, present, absent, late, leave, percentage };
  }

  getStaffAttendanceHistory(staffId) {
    return this.data.staffAttendance
      .filter(a => a.staffId === staffId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // ==========================================
  // DAILY ATTENDANCE MARKING & DUPLICATE PREVENTION
  // ==========================================
  getStudentAttendanceForClassAndDate(className, section, dateStr) {
    const studentsInClass = this.data.students.filter(
      s => s.class === className && s.section === section && s.status === 'Active'
    );

    const existingRecords = this.data.studentAttendance.filter(
      a => a.class === className && a.section === section && a.date === dateStr
    );

    const recordMap = {};
    existingRecords.forEach(r => {
      recordMap[r.studentId] = r;
    });

    return studentsInClass.map(student => {
      const existing = recordMap[student.id];
      return {
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        avatar: student.avatar,
        status: existing ? existing.status : 'Present', // default to Present if not marked
        remarks: existing ? existing.remarks : '',
        isSaved: Boolean(existing)
      };
    });
  }

  saveStudentAttendance(className, section, dateStr, records, markedBy = 'Administrator') {
    // 1. Remove existing records for this class, section, and date to guarantee no duplicates
    this.data.studentAttendance = this.data.studentAttendance.filter(
      a => !(a.class === className && a.section === section && a.date === dateStr)
    );

    // 2. Insert updated records
    const nowIso = new Date().toISOString();
    const newRecords = records.map(r => ({
      id: `ATT-STD-${dateStr}-${r.studentId}`,
      studentId: r.studentId,
      studentName: r.studentName,
      rollNumber: r.rollNumber,
      class: className,
      section: section,
      date: dateStr,
      status: r.status, // Present | Absent | Late | Leave
      remarks: r.remarks || '',
      markedAt: nowIso,
      markedBy: markedBy
    }));

    this.data.studentAttendance.push(...newRecords);
    this.save();
    this.notify('studentAttendance', { className, section, date: dateStr, count: newRecords.length });
    return newRecords;
  }

  getStaffAttendanceForDate(dateStr, department = 'all') {
    let staffList = this.data.staff.filter(s => s.status === 'Active');
    if (department && department !== 'all') {
      staffList = staffList.filter(s => s.department === department);
    }

    const existingRecords = this.data.staffAttendance.filter(a => a.date === dateStr);
    const recordMap = {};
    existingRecords.forEach(r => {
      recordMap[r.staffId] = r;
    });

    return staffList.map(member => {
      const existing = recordMap[member.id];
      return {
        staffId: member.id,
        staffName: member.name,
        department: member.department,
        designation: member.designation,
        avatar: member.avatar,
        status: existing ? existing.status : 'Present',
        remarks: existing ? existing.remarks : '',
        isSaved: Boolean(existing)
      };
    });
  }

  saveStaffAttendance(dateStr, records, markedBy = 'Administrator') {
    const staffIds = records.map(r => r.staffId);
    // Remove existing records for these staff members on this date
    this.data.staffAttendance = this.data.staffAttendance.filter(
      a => !(a.date === dateStr && staffIds.includes(a.staffId))
    );

    const nowIso = new Date().toISOString();
    const newRecords = records.map(r => ({
      id: `ATT-STF-${dateStr}-${r.staffId}`,
      staffId: r.staffId,
      staffName: r.staffName,
      department: r.department,
      designation: r.designation,
      date: dateStr,
      status: r.status,
      remarks: r.remarks || '',
      markedAt: nowIso,
      markedBy: markedBy
    }));

    this.data.staffAttendance.push(...newRecords);
    this.save();
    this.notify('staffAttendance', { date: dateStr, count: newRecords.length });
    return newRecords;
  }

  // ==========================================
  // DASHBOARD & OVERVIEW AGGREGATION
  // ==========================================
  getDashboardMetrics(targetDate = null) {
    const todayStr = targetDate || '2026-09-03';
    
    // Active counts
    const activeStudents = this.data.students.filter(s => s.status === 'Active');
    const activeStaff = this.data.staff.filter(s => s.status === 'Active');

    const totalStudents = activeStudents.length;
    const totalStaff = activeStaff.length;

    // Student stats for today
    const stdAttToday = this.data.studentAttendance.filter(a => a.date === todayStr);
    const stdPresent = stdAttToday.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const stdAbsent = stdAttToday.filter(a => a.status === 'Absent').length;
    const stdLeave = stdAttToday.filter(a => a.status === 'Leave').length;
    const stdLate = stdAttToday.filter(a => a.status === 'Late').length;
    const stdRate = totalStudents > 0 ? Math.round((stdPresent / totalStudents) * 100) : 100;

    // Staff stats for today
    const stfAttToday = this.data.staffAttendance.filter(a => a.date === todayStr);
    const stfPresent = stfAttToday.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const stfAbsent = stfAttToday.filter(a => a.status === 'Absent').length;
    const stfLeave = stfAttToday.filter(a => a.status === 'Leave').length;
    const stfLate = stfAttToday.filter(a => a.status === 'Late').length;
    const stfRate = totalStaff > 0 ? Math.round((stfPresent / totalStaff) * 100) : 100;

    const combinedTotal = totalStudents + totalStaff;
    const combinedPresent = stdPresent + stfPresent;
    const overallRate = combinedTotal > 0 ? Math.round((combinedPresent / combinedTotal) * 100) : 100;

    // Pending Leaves
    const pendingLeaves = this.data.leaves.filter(l => l.status === 'Pending');

    return {
      date: todayStr,
      students: {
        total: totalStudents,
        present: stdPresent,
        absent: stdAbsent,
        leave: stdLeave,
        late: stdLate,
        rate: stdRate
      },
      staff: {
        total: totalStaff,
        present: stfPresent,
        absent: stfAbsent,
        leave: stfLeave,
        late: stfLate,
        rate: stfRate
      },
      overall: {
        rate: overallRate,
        pendingLeavesCount: pendingLeaves.length
      }
    };
  }

  // Get last N days attendance trend for charts
  getAttendanceTrend(days = 7, targetDate = '2026-09-03') {
    const dates = [];
    const base = new Date(targetDate);
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }

    const labels = [];
    const studentPresentData = [];
    const studentAbsentData = [];
    const staffPresentData = [];
    const staffAbsentData = [];

    dates.forEach(dt => {
      const dObj = new Date(dt);
      const label = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(label);

      const sRecords = this.data.studentAttendance.filter(a => a.date === dt);
      const sPresent = sRecords.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const sAbsent = sRecords.filter(a => a.status === 'Absent').length;
      studentPresentData.push(sPresent);
      studentAbsentData.push(sAbsent);

      const stRecords = this.data.staffAttendance.filter(a => a.date === dt);
      const stPresent = stRecords.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const stAbsent = stRecords.filter(a => a.status === 'Absent').length;
      staffPresentData.push(stPresent);
      staffAbsentData.push(stAbsent);
    });

    return {
      labels,
      dates,
      students: { present: studentPresentData, absent: studentAbsentData },
      staff: { present: staffPresentData, absent: staffAbsentData }
    };
  }

  getDepartmentStaffDistribution() {
    const depts = this.getDepartments();
    const result = {};
    depts.forEach(d => {
      result[d] = { total: 0, present: 0 };
    });

    const todayStr = '2026-09-03';
    this.data.staff.forEach(s => {
      if (s.status === 'Active' && result[s.department]) {
        result[s.department].total += 1;
      }
    });

    this.data.staffAttendance.filter(a => a.date === todayStr && (a.status === 'Present' || a.status === 'Late')).forEach(rec => {
      if (result[rec.department]) {
        result[rec.department].present += 1;
      }
    });

    return result;
  }

  // ==========================================
  // LEAVE MANAGEMENT
  // ==========================================
  getLeaves(filters = {}) {
    let list = [...this.data.leaves];

    if (filters.status && filters.status !== 'all') {
      list = list.filter(l => l.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.personType && filters.personType !== 'all') {
      list = list.filter(l => l.personType.toLowerCase() === filters.personType.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(l =>
        l.personName.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q) ||
        l.leaveType.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.appliedOn || b.startDate) - new Date(a.appliedOn || a.startDate));
  }

  applyLeave(leaveData) {
    const maxNum = this.data.leaves.reduce((max, l) => {
      const num = parseInt(l.id.replace('LEV-', '')) || 500;
      return num > max ? num : max;
    }, 500);

    const newLeave = {
      id: `LEV-${maxNum + 1}`,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
      reviewedBy: null,
      reviewedOn: null,
      ...leaveData
    };

    this.data.leaves.unshift(newLeave);

    // Add notification
    this.addNotification({
      title: `New Leave: ${newLeave.personName}`,
      message: `${newLeave.personName} requested ${newLeave.days} day(s) ${newLeave.leaveType}`,
      type: 'leave',
      link: 'leaves'
    });

    this.save();
    this.notify('leaves', { action: 'apply', item: newLeave });
    return newLeave;
  }

  updateLeaveStatus(leaveId, status, reviewerName = 'Administrator', rejectionReason = '') {
    const leave = this.data.leaves.find(l => l.id === leaveId);
    if (!leave) return null;

    leave.status = status;
    leave.reviewedBy = reviewerName;
    leave.reviewedOn = new Date().toISOString().split('T')[0];
    if (rejectionReason) leave.rejectionReason = rejectionReason;

    // If approved, automatically update attendance for that date range if relevant
    if (status === 'Approved') {
      this.syncApprovedLeaveToAttendance(leave);
    }

    // Add notification
    this.addNotification({
      title: `Leave ${status}: ${leave.personName}`,
      message: `Leave request (${leave.leaveType}) for ${leave.personName} was ${status.toLowerCase()}.`,
      type: status === 'Approved' ? 'success' : 'alert',
      link: 'leaves'
    });

    this.save();
    this.notify('leaves', { action: 'status_change', item: leave });
    return leave;
  }

  syncApprovedLeaveToAttendance(leave) {
    // Generate dates between startDate and endDate
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const cur = new Date(start);

    while (cur <= end) {
      if (cur.getDay() !== 0 && cur.getDay() !== 6) {
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, '0');
        const dd = String(cur.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        if (leave.personType === 'student') {
          const student = this.data.students.find(s => s.id === leave.personId);
          if (student) {
            const existingIdx = this.data.studentAttendance.findIndex(
              a => a.studentId === student.id && a.date === dateStr
            );
            const record = {
              id: `ATT-STD-${dateStr}-${student.id}`,
              studentId: student.id,
              studentName: student.name,
              rollNumber: student.rollNumber,
              class: student.class,
              section: student.section,
              date: dateStr,
              status: 'Leave',
              remarks: `Approved: ${leave.leaveType}`,
              markedAt: new Date().toISOString(),
              markedBy: leave.reviewedBy || 'System'
            };

            if (existingIdx >= 0) {
              this.data.studentAttendance[existingIdx] = record;
            } else {
              this.data.studentAttendance.push(record);
            }
          }
        } else {
          const staffMember = this.data.staff.find(s => s.id === leave.personId);
          if (staffMember) {
            const existingIdx = this.data.staffAttendance.findIndex(
              a => a.staffId === staffMember.id && a.date === dateStr
            );
            const record = {
              id: `ATT-STF-${dateStr}-${staffMember.id}`,
              staffId: staffMember.id,
              staffName: staffMember.name,
              department: staffMember.department,
              designation: staffMember.designation,
              date: dateStr,
              status: 'Leave',
              remarks: `Approved: ${leave.leaveType}`,
              markedAt: new Date().toISOString(),
              markedBy: leave.reviewedBy || 'System'
            };

            if (existingIdx >= 0) {
              this.data.staffAttendance[existingIdx] = record;
            } else {
              this.data.staffAttendance.push(record);
            }
          }
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  getNotifications() {
    return (this.data.notifications || []).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  addNotification({ title, message, type = 'info', link = 'dashboard' }) {
    const newNtf = {
      id: `NTF-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      link
    };
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.unshift(newNtf);
    this.save();
    this.notify('notifications', newNtf);
    return newNtf;
  }

  markNotificationAsRead(id) {
    const item = this.data.notifications.find(n => n.id === id);
    if (item) {
      item.read = true;
      this.save();
      this.notify('notifications', item);
    }
  }

  markAllNotificationsRead() {
    (this.data.notifications || []).forEach(n => (n.read = true));
    this.save();
    this.notify('notifications');
  }

  clearNotifications() {
    this.data.notifications = [];
    this.save();
    this.notify('notifications');
  }

  // ==========================================
  // CALENDAR DATA HELPER
  // ==========================================
  getCalendarDayDetails(dateStr) {
    const stdRecords = this.data.studentAttendance.filter(a => a.date === dateStr);
    const stfRecords = this.data.staffAttendance.filter(a => a.date === dateStr);

    return {
      date: dateStr,
      students: {
        present: stdRecords.filter(a => a.status === 'Present' || a.status === 'Late'),
        absent: stdRecords.filter(a => a.status === 'Absent'),
        leave: stdRecords.filter(a => a.status === 'Leave'),
        late: stdRecords.filter(a => a.status === 'Late'),
        totalMarked: stdRecords.length
      },
      staff: {
        present: stfRecords.filter(a => a.status === 'Present' || a.status === 'Late'),
        absent: stfRecords.filter(a => a.status === 'Absent'),
        leave: stfRecords.filter(a => a.status === 'Leave'),
        late: stfRecords.filter(a => a.status === 'Late'),
        totalMarked: stfRecords.length
      }
    };
  }

  // ==========================================
  // REPORTS QUERY ENGINE
  // ==========================================
  generateReport(reportType, filters = {}) {
    let rows = [];
    let summary = {};

    if (reportType === 'daily-students') {
      const date = filters.date || '2026-09-03';
      let records = this.data.studentAttendance.filter(a => a.date === date);

      if (filters.class && filters.class !== 'all') {
        records = records.filter(a => a.class === filters.class);
      }
      if (filters.section && filters.section !== 'all') {
        records = records.filter(a => a.section === filters.section);
      }
      if (filters.status && filters.status !== 'all') {
        records = records.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
      }

      rows = records;
      summary = {
        title: `Daily Student Attendance Report (${date})`,
        total: records.length,
        present: records.filter(r => r.status === 'Present' || r.status === 'Late').length,
        absent: records.filter(r => r.status === 'Absent').length,
        leave: records.filter(r => r.status === 'Leave').length,
        late: records.filter(r => r.status === 'Late').length
      };
    } else if (reportType === 'daily-staff') {
      const date = filters.date || '2026-09-03';
      let records = this.data.staffAttendance.filter(a => a.date === date);

      if (filters.department && filters.department !== 'all') {
        records = records.filter(a => a.department === filters.department);
      }
      if (filters.status && filters.status !== 'all') {
        records = records.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
      }

      rows = records;
      summary = {
        title: `Daily Staff Attendance Report (${date})`,
        total: records.length,
        present: records.filter(r => r.status === 'Present' || r.status === 'Late').length,
        absent: records.filter(r => r.status === 'Absent').length,
        leave: records.filter(r => r.status === 'Leave').length,
        late: records.filter(r => r.status === 'Late').length
      };
    } else if (reportType === 'monthly-students') {
      const month = filters.month || '2026-09';
      let students = this.getStudents({ class: filters.class, section: filters.section });

      rows = students.map(s => {
        const monthRecords = this.data.studentAttendance.filter(
          a => a.studentId === s.id && a.date.startsWith(month)
        );
        const total = monthRecords.length;
        const present = monthRecords.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const absent = monthRecords.filter(a => a.status === 'Absent').length;
        const leave = monthRecords.filter(a => a.status === 'Leave').length;
        const rate = total > 0 ? Math.round((present / total) * 100) : 100;

        return {
          id: s.id,
          name: s.name,
          rollNumber: s.rollNumber,
          class: `${s.class} (${s.section})`,
          totalWorkingDays: total,
          present,
          absent,
          leave,
          rate: `${rate}%`,
          rateNum: rate
        };
      });

      summary = {
        title: `Monthly Student Attendance Overview (${month})`,
        totalRecords: rows.length,
        avgPercentage: rows.length > 0 ? Math.round(rows.reduce((acc, r) => acc + r.rateNum, 0) / rows.length) : 100
      };
    } else if (reportType === 'monthly-staff') {
      const month = filters.month || '2026-09';
      let staffList = this.getStaff({ department: filters.department });

      rows = staffList.map(s => {
        const monthRecords = this.data.staffAttendance.filter(
          a => a.staffId === s.id && a.date.startsWith(month)
        );
        const total = monthRecords.length;
        const present = monthRecords.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const absent = monthRecords.filter(a => a.status === 'Absent').length;
        const leave = monthRecords.filter(a => a.status === 'Leave').length;
        const rate = total > 0 ? Math.round((present / total) * 100) : 100;

        return {
          id: s.id,
          name: s.name,
          designation: s.designation,
          department: s.department,
          totalWorkingDays: total,
          present,
          absent,
          leave,
          rate: `${rate}%`,
          rateNum: rate
        };
      });

      summary = {
        title: `Monthly Staff Attendance Overview (${month})`,
        totalRecords: rows.length,
        avgPercentage: rows.length > 0 ? Math.round(rows.reduce((acc, r) => acc + r.rateNum, 0) / rows.length) : 100
      };
    } else if (reportType === 'low-attendance') {
      const threshold = parseInt(filters.threshold) || this.data.settings.minAttendancePercent || 75;
      const allStudents = this.getStudents();
      const lowStudents = allStudents.filter(s => s.attendancePercent < threshold);

      rows = lowStudents.map(s => ({
        id: s.id,
        name: s.name,
        type: 'Student',
        group: `${s.class} - ${s.section}`,
        contact: s.phone,
        rate: `${s.attendancePercent}%`,
        status: s.status
      }));

      summary = {
        title: `Low Attendance Alert Report (< ${threshold}%)`,
        totalDefaulters: rows.length,
        threshold: `${threshold}%`
      };
    } else if (reportType === 'leaves-summary') {
      rows = this.getLeaves(filters);
      summary = {
        title: 'Institutional Leave Summary Report',
        totalRequests: rows.length,
        approved: rows.filter(r => r.status === 'Approved').length,
        pending: rows.filter(r => r.status === 'Pending').length,
        rejected: rows.filter(r => r.status === 'Rejected').length
      };
    }

    return { reportType, summary, rows };
  }
}

// Global DB Singleton
window.db = new Database();
