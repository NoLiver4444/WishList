/**
 * @file Хук для управления темой оформления (светлая/темная/системная).
 * @module shared/hooks/useTheme
 * @returns {Object} Объект с текущей темой и функцией её изменения.
 * @property {string} theme - Текущая тема ('light', 'dark' или 'system').
 * @property {function(string): void} setTheme - Функция обновления темы.
 */

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'app-theme';

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? 'system'
  );

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }
  }, [theme]);

  return { theme, setTheme };
};
