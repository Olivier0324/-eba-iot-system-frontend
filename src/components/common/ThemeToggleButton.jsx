import React from "react";
import ThemeModeSelector from "./ThemeModeSelector";

/**
 * Same three-way theme control as Settings (system / light / dark), compact for headers.
 * Used on auth, blog, support, and other pages outside the dashboard shell.
 */
function ThemeToggleButton({ className = "" }) {
  return <ThemeModeSelector variant="compact" className={className} />;
}

export default ThemeToggleButton;
