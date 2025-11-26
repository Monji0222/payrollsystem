
/**
 * User roles
 */
export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  EMPLOYEE: 'employee'
};

/**
 * Employment status options
 */
export const EMPLOYMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  RESIGNED: 'resigned',
  TERMINATED: 'terminated'
};

/**
 * Attendance status options
 */
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
  ON_LEAVE: 'on_leave'
};

/**
 * Leave request status options
 */
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
  CANCELLED: 'cancelled'
};

/**
 * Payroll status options
 */
export const PAYROLL_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  PROCESSED: 'processed',
  CANCELLED: 'cancelled'
};

/**
 * Status badge colors (Tailwind CSS classes)
 */
export const STATUS_COLORS = {
  // Employment status
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  resigned: 'bg-yellow-100 text-yellow-800',
  terminated: 'bg-red-100 text-red-800',
  
  // Leave status
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  
  // Attendance status
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  half_day: 'bg-blue-100 text-blue-800',
  on_leave: 'bg-purple-100 text-purple-800',
  
  // Payroll status
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  processed: 'bg-green-100 text-green-800'
};

/**
 * Common departments
 */
export const DEPARTMENTS = [
  'IT',
  'HR',
  'Finance',
  'Sales',
  'Marketing',
  'Operations',
  'Customer Service',
  'Engineering',
  'Administration'
];

/**
 * Common positions
 */
export const POSITIONS = [
  'Software Engineer',
  'Senior Software Engineer',
  'HR Manager',
  'HR Assistant',
  'Accountant',
  'Sales Manager',
  'Marketing Specialist',
  'Operations Manager',
  'Customer Service Representative',
  'System Administrator',
  'Project Manager',
  'Business Analyst',
  'Quality Assurance Engineer',
  'DevOps Engineer',
  'Data Analyst'
];

/**
 * Pagination options
 */
export const PAGINATION_OPTIONS = [10, 25, 50, 100];

/**
 * Default pagination size
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMMM dd, yyyy',
  SHORT: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy hh:mm a'
};

/**
 * Work schedule
 */
export const WORK_SCHEDULE = {
  START_TIME: '08:00',
  END_TIME: '17:00',
  BREAK_HOURS: 1,
  REGULAR_HOURS: 8,
  DAYS_PER_WEEK: 5
};

/**
 * Toast notification durations (ms)
 */
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000
};

/**
 * API error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please login again.'
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logout successful!',
  CREATE: 'Created successfully!',
  UPDATE: 'Updated successfully!',
  DELETE: 'Deleted successfully!',
  SAVE: 'Saved successfully!'
};

/**
 * Validation rules
 */
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9+\-\s()]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500
};