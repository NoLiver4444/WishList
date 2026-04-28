/**
 * @file Панель навигации календаря.
 * @module features/calendar/calendar-navigation
 */

import { memo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './CalendarNavigation.module.css';

const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

/**
 * Компонент переключения месяцев и возврата к текущей дате.
 * @param {Object} props
 * @param {Date} props.currentDate - Текущая отображаемая дата в календаре.
 * @param {Function} props.onPrev - Переход на предыдущий месяц.
 * @param {Function} props.onNext - Переход на следующий месяц.
 * @param {Function} props.onToday - Переход к текущему дню.
 */
const CalendarNavigation = ({ currentDate, onPrev, onNext, onToday }) => {
  const monthName = MONTHS_RU[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <div className={styles.nav}>
      <h2 className={styles.title}>
        {monthName} <span className={styles.year}>{year}</span>
      </h2>
      <div className={styles.controls}>
        <button className={styles.btn} onClick={onToday}>
          Сегодня
        </button>
        <button
          className={styles.btn}
          onClick={onPrev}
          aria-label="Предыдущий месяц"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          className={styles.btn}
          onClick={onNext}
          aria-label="Следующий месяц"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default memo(CalendarNavigation);
