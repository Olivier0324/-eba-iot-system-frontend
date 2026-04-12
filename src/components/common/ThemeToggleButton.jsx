import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Reusable control for pages outside the dashboard shell (auth, blog, support).
 * Dashboard keeps its own topbar toggle for consistency with the IoT layout.
 */
function cycleHint(colorMode, resolvedTheme) {
  if (colorMode === "system") {
    return `System theme (${resolvedTheme}). Click for always light.`;
  }
  if (colorMode === "light") {
    return "Always light. Click for always dark.";
  }
  return "Always dark. Click to follow device theme.";
}

function ThemeToggleButton({ className = "" }) {
  const { colorMode, resolvedTheme, toggleTheme } = useTheme();
  const hint = cycleHint(colorMode, resolvedTheme);
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={hint}
      aria-label={hint}
      className={`p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
    >
      {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default ThemeToggleButton;
