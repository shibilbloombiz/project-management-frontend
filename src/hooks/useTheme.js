import { useEffect, useState } from 'react';

const THEME_KEY = 'theme';

export default function useTheme() {
  const getInitialTheme = () => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = () => {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') setTheme(stored);
    };
    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('syncra-theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('syncra-theme-change', handleThemeChange);
    };
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme: () => {
      setTheme((current) => {
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        window.dispatchEvent(new Event('syncra-theme-change'));
        return next;
      });
    },
    setTheme: (nextTheme) => {
      setTheme(nextTheme);
      localStorage.setItem(THEME_KEY, nextTheme);
      window.dispatchEvent(new Event('syncra-theme-change'));
    },
  };
}
