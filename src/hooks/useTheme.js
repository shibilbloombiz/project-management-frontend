import { useEffect } from 'react';

const THEME_KEY = 'theme';

export default function useTheme() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    localStorage.setItem(THEME_KEY, 'light');
  }, []);
}
