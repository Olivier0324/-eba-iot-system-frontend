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
 * Minimal theme menu (Vercel / editor-style): soft pill trigger, neutral panel, checkmarks.
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

  const triggerH = isCompact ? "h-8" : "h-9";
  const triggerText = isCompact ? "text-[13px]" : "text-sm";
  const triggerIcon = isCompact ? 15 : 16;
  const rowIcon = isCompact ? 15 : 16;
  const chevron = isCompact ? 14 : 15;

  const iconMuted = "shrink-0 text-zinc-500 dark:text-zinc-400";

  return (
    <div className={`relative ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full min-w-0 items-center gap-2 ${triggerH} rounded-full pl-2.5 pr-2 font-medium text-zinc-700 transition-[background,box-shadow,color] dark:text-zinc-200 ${triggerText} ${
          open
            ? "bg-zinc-200/90 shadow-inner ring-1 ring-zinc-300/80 dark:bg-zinc-700/90 dark:ring-zinc-600/60"
            : "bg-zinc-100/90 hover:bg-zinc-200/80 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/80"
        } focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900`}
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
            <span className="font-normal text-zinc-400 dark:text-zinc-500">
              {" · "}
              {resolvedTheme === "dark" ? "dark" : "light"}
            </span>
          )}
        </span>
        <ChevronDown
          size={chevron}
          strokeWidth={1.75}
          className={`shrink-0 text-zinc-400 opacity-70 transition-transform duration-200 dark:text-zinc-500 ${open ? "-rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-[100] mt-1.5 min-w-[11.5rem] overflow-hidden rounded-xl border border-zinc-200/80 bg-white/95 p-1 shadow-lg shadow-zinc-900/10 ring-1 ring-black/[0.04] backdrop-blur-md dark:border-zinc-700/80 dark:bg-zinc-900/95 dark:ring-white/[0.06]"
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
                  className={`flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors ${
                    selected
                      ? "bg-zinc-100 dark:bg-zinc-800"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon
                    size={rowIcon}
                    strokeWidth={1.5}
                    className={`mt-0.5 ${iconMuted}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-tight text-zinc-800 dark:text-zinc-100">
                      {label}
                    </span>
                    {hint && (
                      <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
                        {hint}
                      </span>
                    )}
                  </span>
                  {selected ? (
                    <Check
                      size={15}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-zinc-600 dark:text-zinc-300"
                      aria-hidden
                    />
                  ) : (
                    <span className="mt-0.5 w-[15px] shrink-0" aria-hidden />
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
