/**
 * @file Компонент ячейки дня в календаре.
 * @module shared/ui/CalendarCalendarDay
 */

import { memo } from 'react';
import styles from './CalendarDay.module.css';

/**
 * Компонент CalendarDay.
 * Отрисовывает число месяца и контейнер для событий (чипов дедлайнов).
 * * @component
 * @param {Object} props
 * @param {Date} props.date - Объект даты для этой ячейки.
 * @param {boolean} props.isCurrentMonth - Флаг принадлежности к текущему просматриваемому месяцу.
 * @param {boolean} props.isToday - Флаг, указывающий, является ли день сегодняшним.
 * @param {React.ReactNode} props.children - Список событий/чипов внутри дня.
 * @param {Function} props.onClick - Обработчик клика по ячейке.
 */
const CalendarDay = ({ date, isCurrentMonth, isToday, children, onClick }) => {
  return (
    <div
      className={[
        styles.day,
        !isCurrentMonth && styles.otherMonth,
        isToday && styles.today,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      <span className={styles.dayNumber}>{date.getDate()}</span>
      <div className={styles.events}>{children}</div>
    </div>
  );
};

export default memo(CalendarDay);
