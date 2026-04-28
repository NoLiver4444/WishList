/**
 * @file Хук для обработки нажатия клавиши Enter.
 * @param {Function} handleSubmit - Функция обратного вызова.
 * @param {boolean} [isOpen=true] - Флаг активности слушателя.
 */

import { useEffect } from 'react';

export const useEnterPress = (handleSubmit, isOpen = true) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleSubmit?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, isOpen]);
};
