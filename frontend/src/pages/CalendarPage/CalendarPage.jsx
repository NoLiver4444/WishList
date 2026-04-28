/**
 * @file Страница календаря.
 * @module pages/CalendarPage
 */

import { memo } from 'react';
import Main from '@/widgets/Main';
import Calendar from '@/widgets/Calendar';

/**
 * Компонент CalendarPage.
 * Является оберткой над виджетом Calendar для встраивания в общую структуру страниц.
 * * @component
 */
const CalendarPage = () => {
  return (
    <Main title="Календарь событий" variant="calendar">
      <Calendar />
    </Main>
  );
};

export default memo(CalendarPage);
