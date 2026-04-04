import plusIconURL from '@/shared/assets/plus.svg'
import styles from './AddCard.module.css'

const AddCard = () => {
  return (
    <li className={styles.card}>
      <button className={styles.button}>
        <img
          src={plusIconURL}
          alt='Add card'
          className={styles.icon}
        />
        <div className={styles.text}>Новый вишлист</div>
      </button>
    </li>
  )
}

export default AddCard