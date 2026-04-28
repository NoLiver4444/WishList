/**
 * @file Хук для закрытия по нажатию клавиши Esc.
 * @param {Function} onClose - Функция закрытия.
 * @param {boolean} [isOpen=true] - Флаг активности слушателя.
 */

import { useEffect } from 'react';

export const useEscClose = (onClose, isOpen = true) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isOpen]);
};
