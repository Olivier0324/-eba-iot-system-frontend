import React from "react";

/** Shared chrome for segmented filter controls (Alerts, Analytics, Reports, etc.). */
export const filterSegmentedBarClass =
  "inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-gray-100/95 dark:bg-gray-800/95 border border-gray-200/90 dark:border-gray-700/90 shadow-inner";

/**
 * Segmented control style filters — one active pill, consistent light/dark styling.
 * @param {{ value: string, label: string }[]} options
 * @param {string} value — current option value
 * @param {(next: string) => void} onChange
 */
function FilterPills({ options, value, onChange, className = "", ariaLabel }) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`${filterSegmentedBarClass} ${className}`.trim()}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.value)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 min-h-[2.5rem] ${
              selected
                ? "bg-white dark:bg-gray-700 text-eco-800 dark:text-eco-200 shadow-sm ring-1 ring-gray-200/90 dark:ring-gray-600/90"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-700/40"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default FilterPills;
