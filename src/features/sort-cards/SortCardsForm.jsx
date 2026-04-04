import styles from './SortCardsForm.module.css'

const SortCardsForm = () => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Сортировать по: </h3>
      <ul className={styles.list}>
        <li className={`${styles.item} ${styles.isActive}`}>
          дате добавления
        </li>
        <li className={styles.item}>
          названию
        </li>
        <li className={styles.item}>
          дате события
        </li>
      </ul>
    </div>
  )
}

export default SortCardsForm