import {useEffect, useState} from 'react';

export const typeTheme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'app-theme';

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState(
    () => (localStorage.getItem(STORAGE_KEY) ?? 'system')
  );

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return {theme, setTheme};
};