/**
 * @file Хук для дебаунсинга функций.
 * Позволяет откладывать выполнение функции до истечения указанного времени с момента последнего вызова.
 * @module shared/hooks/useDebounce
 */

import { useCallback, useRef } from 'react';

/**
 * Хук useDebounce.
 * Создает версию функции, которая при вызове очищает предыдущий таймер и запускает новый.
 * @function useDebounce
 * @param {Function} fn - Функция, выполнение которой нужно отложить.
 * @param {number} delay - Задержка в миллисекундах.
 * @returns {Function} Дебаунс-версия переданной функции.
 */
export const useDebounce = (fn, delay) => {
  const timer = useRef(null);
  return useCallback(
    (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
};
