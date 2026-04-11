/**
 * Centralized Button Styles for HireFlow
 * Ensures consistency across all components
 */

// Primary button - Main actions (sky-blue)
export const btnPrimary = "bg-sky-600 hover:bg-sky-700 text-white";
export const btnPrimarySm = "px-3 py-1.5 text-sm " + btnPrimary;
export const btnPrimaryMd = "px-4 py-2 text-base " + btnPrimary;
export const btnPrimaryLg = "px-6 py-3 text-lg " + btnPrimary;

// Success/Accept button - Positive actions (green accent)
export const btnSuccess = "bg-green-600 hover:bg-green-700 text-white";
export const btnSuccessSm = "px-3 py-1.5 text-sm " + btnSuccess;
export const btnSuccessMd = "px-4 py-2 text-base " + btnSuccess;
export const btnSuccessLg = "px-6 py-3 text-lg " + btnSuccess;

// Danger/Reject button - Negative actions (red)
export const btnDanger = "bg-red-600 hover:bg-red-700 text-white";
export const btnDangerSm = "px-3 py-1.5 text-sm " + btnDanger;
export const btnDangerMd = "px-4 py-2 text-base " + btnDanger;
export const btnDangerLg = "px-6 py-3 text-lg " + btnDanger;

// Secondary/Ghost button - Less important actions (gray)
export const btnSecondary = "bg-gray-600 hover:bg-gray-700 text-white";
export const btnSecondarySm = "px-3 py-1.5 text-sm " + btnSecondary;
export const btnSecondaryMd = "px-4 py-2 text-base " + btnSecondary;
export const btnSecondaryLg = "px-6 py-3 text-lg " + btnSecondary;

// Outline button - Alternative actions
export const btnOutline =
  "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300";
export const btnOutlineSm = "px-3 py-1.5 text-sm " + btnOutline;
export const btnOutlineMd = "px-4 py-2 text-base " + btnOutline;
export const btnOutlineLg = "px-6 py-3 text-lg " + btnOutline;

// Disabled button state
export const btnDisabled = "bg-gray-400 text-gray-600 cursor-not-allowed";

// Combined button with disabled state
export const btnWithDisabled = (disabled = false) => {
  return disabled ? btnDisabled : btnPrimary;
};

// Utility to add focus and transition states
export const btnBase =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed";

// Complete button classes
export const completeBtnPrimary = btnBase + " " + btnPrimaryMd;
export const completeBtnSuccess = btnBase + " " + btnSuccessMd;
export const completeBtnDanger = btnBase + " " + btnDangerMd;
export const completeBtnSecondary = btnBase + " " + btnSecondaryMd;
export const completeBtnOutline = btnBase + " " + btnOutlineMd;

// Status badge colors
export const statusBadgeColors = {
  APPLIED: "bg-sky-100 text-sky-800",
  SCREENING: "bg-purple-100 text-purple-800",
  INTERVIEW: "bg-yellow-100 text-yellow-800",
  SELECTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  ON_HOLD: "bg-gray-100 text-gray-800",
  WITHDRAWN: "bg-orange-100 text-orange-800",
  OPEN: "bg-green-100 text-green-800",
  CLOSED: "bg-red-100 text-red-800",
};

// Button action groups
export const ActionButtons = {
  primary: completeBtnPrimary,
  success: completeBtnSuccess,
  danger: completeBtnDanger,
  secondary: completeBtnSecondary,
  outline: completeBtnOutline,
};
