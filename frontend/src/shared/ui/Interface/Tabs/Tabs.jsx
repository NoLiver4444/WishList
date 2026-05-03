/**
 * @file Компонент переключения вкладок.
 * Используется для фильтрации контента или навигации внутри разделов.
 * @module shared/ui/Interface/Tabs
 */

import { memo } from 'react';
import styles from './Tabs.module.css';

/**
 * Компонент Tabs.
 * Отображает список кнопок-переключателей с текстовой меткой и числовым счетчиком.
 * @component
 * @param {Object} props - Свойства компонента.
 * @param {Array<{label: string, value: string, counts: number|string}>} props.tabs - Массив объектов вкладок.
 * @param {string} props.activeTab - Значение текущей активной вкладки.
 * @param {Function} props.onTabChange - Коллбэк, вызываемый при смене вкладки.
 */
const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        {tabs.map((tab) => (
          <li>
            <button
              key={tab.value}
              className={`${styles.tab} ${activeTab === tab.value ? styles.activeTab : ''}`}
              onClick={() => onTabChange(tab.value)}
            >
              <div className={styles.label}>{tab.label}</div>
              <div className={styles.count}>{tab.counts}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default memo(Tabs);
