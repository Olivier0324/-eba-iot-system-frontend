// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check for saved theme preference in localStorage
  const getSavedTheme = () => {
    try {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || 'light'; // Default to light if not set
    } catch {
      return 'light';
    }
  };

  const [theme, setTheme] = useState(getSavedTheme());

  // Tailwind `dark:` variant matches `.dark` on an ancestor (see index.css @custom-variant).
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark", "light");
    if (theme === "dark") {
      root.classList.add("dark");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* private mode etc. */
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
