import { memo } from 'react';
import styles from './CalendarDay.module.css';

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
