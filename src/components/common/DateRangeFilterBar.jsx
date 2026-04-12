import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

/** Inputs: no heavy outer border — inset bar + soft rings (matches FilterPills tone). */
const inputClass =
  "w-full min-h-10 rounded-xl border-0 bg-white dark:bg-gray-800 px-3.5 py-2 text-sm text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-200/80 dark:ring-gray-600/70 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-eco-500/35 dark:focus:ring-eco-400/30 sm:min-w-44";

/**
 * Shared date range strip for Analytics / Overview (and similar pages).
 */
function DateRangeFilterBar({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onClear,
}) {
  const hasRange = Boolean(startDate || endDate);

  return (
    <div
      className="rounded-2xl bg-gray-100/95 dark:bg-gray-800/75 p-2 sm:p-2.5 shadow-inner ring-1 ring-inset ring-gray-200/70 dark:ring-gray-700/80"
      role="group"
      aria-label="Filter by date range"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 shrink-0 px-1">
          <Calendar
            className="h-5 w-5 shrink-0 text-eco-600 dark:text-eco-400"
            aria-hidden
          />
          <span className="text-sm font-medium">Date range</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <DatePicker
            selected={startDate}
            onChange={onStartChange}
            placeholderText="Start date"
            className={inputClass}
          />
          <span className="sm:hidden text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-0.5">
            to
          </span>
          <span
            className="hidden sm:flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 px-1 select-none"
            aria-hidden
          >
            to
          </span>
          <DatePicker
            selected={endDate}
            onChange={onEndChange}
            placeholderText="End date"
            className={inputClass}
          />
        </div>
        {hasRange && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 min-h-10 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/95 dark:bg-gray-900/55 hover:bg-white dark:hover:bg-gray-900/90 ring-1 ring-inset ring-gray-200/80 dark:ring-gray-600/70 transition-colors w-full sm:w-auto"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default DateRangeFilterBar;
