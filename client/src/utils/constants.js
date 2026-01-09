// Application Status Constants
export const APPLICATION_STATUS = {
  APPLIED: "APPLIED",
  SCREENING: "SCREENING",
  INTERVIEW: "INTERVIEW",
  SELECTED: "SELECTED",
  REJECTED: "REJECTED",
  ON_HOLD: "ON_HOLD",
  WITHDRAWN: "WITHDRAWN",
};

// Position Status Constants
export const POSITION_STATUS = {
  OPEN: "OPEN",
  ON_HOLD: "ON_HOLD",
  CLOSED: "CLOSED",
};

// User Roles
export const USER_ROLES = {
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
  RECRUITER: "RECRUITER",
  HR: "HR",
  INTERVIEWER: "INTERVIEWER",
  REVIEWER: "REVIEWER",
  CANDIDATE: "CANDIDATE",
  VIEWER: "VIEWER",
};

// Interview Modes
export const INTERVIEW_MODES = {
  IN_PERSON: "IN_PERSON",
  PHONE: "PHONE",
  ONLINE: "ONLINE",
  HYBRID: "HYBRID",
};

// Round Types
export const ROUND_TYPES = {
  TECHNICAL: "TECHNICAL",
  HR: "HR",
  PANEL: "PANEL",
  MANAGERIAL: "MANAGERIAL",
  BEHAVIORAL: "BEHAVIORAL",
  CODING: "CODING",
  ONLINE_TEST: "ONLINE_TEST",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: "INFO",
  WARNING: "WARNING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
};

// Status Colors
export const STATUS_COLORS = {
  APPLIED: "bg-blue-100 text-blue-800",
  SCREENING: "bg-purple-100 text-purple-800",
  INTERVIEW: "bg-yellow-100 text-yellow-800",
  SELECTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  ON_HOLD: "bg-gray-100 text-gray-800",
  WITHDRAWN: "bg-orange-100 text-orange-800",
  OPEN: "bg-green-100 text-green-800",
  CLOSED: "bg-red-100 text-red-800",
};
