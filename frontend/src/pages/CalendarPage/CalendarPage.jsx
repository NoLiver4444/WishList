import { memo } from 'react';
import Main from '@/widgets/Main';
import Calendar from '@/widgets/Calendar';

const CalendarPage = () => {
  return (
    <Main title="Календарь событий" variant="calendar">
      <Calendar />
    </Main>
  );
};

export default memo(CalendarPage);
