/**
 * @file Компонент выбора сортировки карточек.
 * @module features/cards/sort-cards/SortCardsForm
 */

import { memo } from 'react';
import styles from './SortCardsForm.module.css';

/**
 * Рендерит список кнопок для изменения порядка сортировки.
 * @param {Object} props
 * @param {Array<{value: string, label: string}>} options - Массив доступных вариантов сортировки.
 * @param {string} activeSort - Значение текущей активной сортировки.
 * @param {Function} onSortChange - Колбэк при смене сортировки.
 */
const SortCardsForm = ({ options, activeSort, onSortChange }) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Сортировать:</h3>
      <ul className={styles.list}>
        {options.map((option) => (
          <li key={option.value} className={styles.listItem}>
            <button
              type="button"
              className={`${styles.item} ${
                activeSort === option.value ? styles.isActive : ''
              }`}
              onClick={() => onSortChange(option.value)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default memo(SortCardsForm);
