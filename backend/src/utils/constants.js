module.exports = {
  ROLES: {
    ADMIN: 'admin',
    HR: 'hr',
    EMPLOYEE: 'employee'
  },

  EMPLOYMENT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    RESIGNED: 'resigned',
    TERMINATED: 'terminated'
  },

  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    HALF_DAY: 'half_day',
    ON_LEAVE: 'on_leave'
  },

  LEAVE_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    DECLINED: 'declined',
    CANCELLED: 'cancelled'
  },

  PAYROLL_STATUS: {
    DRAFT: 'draft',
    PENDING_APPROVAL: 'pending_approval',
    APPROVED: 'approved',
    PROCESSED: 'processed',
    CANCELLED: 'cancelled'
  },

  WORK_HOURS: {
    START_TIME: '08:00',
    END_TIME: '17:00',
    BREAK_HOURS: 1,
    REGULAR_HOURS: 8
  }
};