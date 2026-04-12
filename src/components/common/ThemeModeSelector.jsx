import React, { useEffect, useRef, useState } from "react";
import { Monitor, Sun, Moon, ChevronDown, Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const OPTIONS = [
  {
    id: "system",
    label: "System",
    hint: "Match device",
    Icon: Monitor,
  },
  { id: "light", label: "Light", hint: null, Icon: Sun },
  { id: "dark", label: "Dark", hint: null, Icon: Moon },
];

/**
 * Compact theme menu: intrinsic-width pill (no stretched `w-full`), brand
 * surfaces from `index.css` @theme (`eco-*`, grays), tight padding on compact.
 */
function ThemeModeSelector({
  className = "",
  variant = "default",
  "aria-label": ariaLabel = "Theme",
}) {
  const { colorMode, setColorMode, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const isCompact = variant === "compact";

  const active = OPTIONS.find((o) => o.id === colorMode) ?? OPTIONS[0];
  const ActiveIcon = active.Icon;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerH = isCompact ? "h-7" : "h-8";
  const triggerPad = isCompact ? "pl-1.5 pr-1.5 gap-1" : "pl-2 pr-2 gap-1.5";
  const triggerText = "text-xs";
  const triggerIcon = isCompact ? 13 : 14;
  const rowIcon = isCompact ? 13 : 14;
  const chevron = isCompact ? 12 : 13;
  const checkSz = isCompact ? 13 : 14;
  const menuMinW = isCompact ? "min-w-36" : "min-w-40";
  const rowPad = isCompact ? "px-1.5 py-1" : "px-2 py-1.5";
  const rowGap = isCompact ? "gap-2" : "gap-2.5";
  const labelClass = isCompact
    ? "text-xs font-medium leading-tight text-gray-800 dark:text-gray-100"
    : "text-sm font-medium leading-tight text-gray-800 dark:text-gray-100";

  const iconMuted = "shrink-0 text-eco-600 dark:text-eco-400";

  return (
    <div
      className={`relative inline-block w-fit max-w-full ${className}`.trim()}
      ref={rootRef}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex w-fit max-w-full min-w-0 items-center ${triggerPad} ${triggerH} rounded-full font-medium text-gray-800 transition-[background,box-shadow,color] dark:text-gray-100 ${triggerText} ${
          open
            ? "bg-eco-50/95 shadow-inner ring-1 ring-inset ring-eco-300/80 dark:bg-gray-700 dark:ring-eco-400/45"
            : "bg-white/90 ring-1 ring-inset ring-eco-200/80 hover:bg-white dark:bg-gray-800 dark:ring-eco-500/35 dark:hover:bg-gray-700"
        } focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-eco-400/40 dark:focus-visible:ring-offset-gray-900`}
      >
        <ActiveIcon
          size={triggerIcon}
          strokeWidth={1.5}
          className={iconMuted}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate text-left leading-none">
          {active.label}
          {colorMode === "system" && (
            <span className="font-normal text-gray-500 dark:text-gray-400">
              {" · "}
              {resolvedTheme === "dark" ? "dark" : "light"}
            </span>
          )}
        </span>
        <ChevronDown
          size={chevron}
          strokeWidth={2}
          className={`shrink-0 text-gray-500 opacity-80 transition-transform duration-200 dark:text-gray-400 ${open ? "-rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute right-0 z-[100] mt-1 ${menuMinW} overflow-hidden rounded-xl border border-gray-200/90 bg-white/95 p-1 shadow-lg shadow-gray-900/10 ring-1 ring-eco-500/10 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95 dark:ring-eco-400/15`}
        >
          {OPTIONS.map(({ id, label, hint, Icon }) => {
            const selected = colorMode === id;
            return (
              <li key={id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    setColorMode(id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start ${rowGap} rounded-lg ${rowPad} text-left transition-colors ${
                    selected
                      ? "bg-eco-50 dark:bg-eco-950/45"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/80"
                  }`}
                >
                  <Icon
                    size={rowIcon}
                    strokeWidth={1.5}
                    className={`mt-0.5 ${iconMuted}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className={`block ${labelClass}`}>{label}</span>
                    {hint && (
                      <span
                        className={`mt-0.5 block leading-snug text-gray-500 dark:text-gray-400 ${isCompact ? "text-[10px]" : "text-[11px]"}`}
                      >
                        {hint}
                      </span>
                    )}
                  </span>
                  {selected ? (
                    <Check
                      size={checkSz}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-eco-600 dark:text-eco-400"
                      aria-hidden
                    />
                  ) : (
                    <span
                      className={`mt-0.5 shrink-0 ${isCompact ? "w-3.5" : "w-4"}`}
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ThemeModeSelector;
