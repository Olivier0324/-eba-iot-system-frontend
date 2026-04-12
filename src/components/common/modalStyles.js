/**
 * Shared Tailwind class strings for dashboard modals and matching form controls
 * (filters, inline selects) so light/dark and focus rings stay consistent.
 */

export const modalPanelClass =
  "rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200";

/** Dimming layer behind modals — Tailwind gray-800 (#1f2937), not pure black, so it matches dark modal panels. */
export const modalBackdropClass =
  "bg-gray-800/70 backdrop-blur-sm";

export const dashboardSelectClass =
  "min-h-10 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-eco-500/80 focus:border-eco-500 dark:focus:ring-offset-0";

export const dashboardInputClass =
  "min-h-10 w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-eco-500/80 focus:border-eco-500";

export const modalCloseButtonClass =
  "rounded-lg p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0";

export const modalPrimaryButtonClass =
  "inline-flex flex-1 items-center justify-center gap-2 min-h-10 px-4 py-2 rounded-xl font-medium text-white bg-eco-600 hover:bg-eco-700 focus:outline-none focus:ring-2 focus:ring-eco-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors";

export const modalSecondaryButtonClass =
  "inline-flex flex-1 items-center justify-center gap-2 min-h-10 px-4 py-2 rounded-xl font-medium border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
