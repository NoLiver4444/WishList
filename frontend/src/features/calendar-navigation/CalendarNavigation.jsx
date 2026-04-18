import styles from './CalendarNavigation.module.css';

const MONTHS_RU = [
	'Январь', 'Февраль', 'Март', 'Апрель',
	'Май', 'Июнь', 'Июль', 'Август',
	'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const CalendarNavigation = ({currentDate, onPrev, onNext, onToday}) => {
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
				<button className={styles.btn} onClick={onPrev} aria-label="Предыдущий месяц">
					←
				</button>
				<button className={styles.btn} onClick={onNext} aria-label="Следующий месяц">
					→
				</button>
			</div>
		</div>
	);
};

export default CalendarNavigation;