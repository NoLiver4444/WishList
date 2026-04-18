import styles from './SortCardsForm.module.css';

const SortCardsForm = ({options, activeSort, onSortChange}) => {
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

export default SortCardsForm;
