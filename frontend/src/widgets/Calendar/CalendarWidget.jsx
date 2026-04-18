import { useState } from 'react';
import CalendarNavigation from '@/features/calendar-navigation';
import DayDeadlinesModal from '@/features/day-deadlines-modal';
import CalendarDay from '@/shared/ui/CalendarDay';
import {
  getDeadlinesByDate,
  selectWishlists,
  useWishlistStore,
  WishlistDeadlineChip,
} from '@/entities/calendar';
import styles from './CalendarWidget.module.css';

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const buildCalendarDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = (firstDay.getDay() + 6) % 7;
  const endOffset = (7 - lastDay.getDay()) % 7;

  const days = [];

  for (let i = startOffset; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  for (let i = 1; i < endOffset; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

const CalendarWidget = () => {
  const wishlists = useWishlistStore(selectWishlists);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [modal, setModal] = useState(null);

  const today = new Date();

  const isToday = (date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isCurrentMonth = (date) =>
    date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear();

  const handlePrev = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));

  const handleNext = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (date, deadlines) => {
    if (!isCurrentMonth(date)) return;
    setModal({ date, wishlists: deadlines });
  };

  const days = buildCalendarDays(currentDate);

  return (
    <>
      <div className={styles.widget}>
        <CalendarNavigation
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
        />

        <div className={styles.grid}>
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className={styles.dayOfWeek}>
              {day}
            </div>
          ))}

          {days.map((date, i) => {
            const deadlines = getDeadlinesByDate(wishlists, date);
            const MAX_VISIBLE = 3;

            return (
              <CalendarDay
                key={i}
                date={date}
                isCurrentMonth={isCurrentMonth(date)}
                isToday={isToday(date)}
                onClick={() => handleDayClick(date, deadlines)}
              >
                {deadlines.slice(0, MAX_VISIBLE).map((w) => (
                  <WishlistDeadlineChip key={w.id} wishlist={w} />
                ))}
                {deadlines.length > MAX_VISIBLE && (
                  <span className={styles.more}>
                    +{deadlines.length - MAX_VISIBLE} ещё
                  </span>
                )}
              </CalendarDay>
            );
          })}
        </div>
      </div>

      {modal && (
        <DayDeadlinesModal
          date={modal.date}
          wishlists={modal.wishlists}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
};

export default CalendarWidget;
