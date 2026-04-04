import plusIconURL from '@/shared/assets/plus.svg'
import Maka from '@/shared/assets/Maka.png'
import Shiro from '@/shared/assets/shiro.png'
import Meowmeow from '@/shared/assets/meowmeow.png'
import threeDotsIconURL from '@/shared/assets/three-dots.svg'
import styles from './Card.module.css';

const Card = (props) => {
  const {
    name,
    date,
    counts,
    wishes,
  } = props

  const wishesList =  (wishes.length > 0) ? (
    <ul className={styles.wishesList}>
      <li className={styles.image}>
        <img
          src={Maka}
          alt='Add card'
        />
      </li>
      <li className={styles.image}>
        <img
          src={Shiro}
          alt='Add card'
        />
      </li>
      <li className={styles.image}>
        <img
          src={Meowmeow}
          alt='Add card'
        />
      </li>
    </ul>
  ) : (
    <button className={styles.button}>
      <img
        src={plusIconURL}
        alt='Add card'
        className={styles.icon}
      />
      <div className={styles.text}>Добавить подарок</div>
    </button>
  )

  return (
    <li className={styles.card}>
      <div className={styles.header}>
        <div className={styles.information}>
          <h5 className={styles.title}>{name}</h5>
          <div className={styles.date}>{date}</div>
          <div className={styles.counts}>{`Подарков: ${counts}`}</div>
        </div>
        <img
          src={threeDotsIconURL}
          alt='Add card'
          className={styles.dots}
        />
      </div>
      <div>
        {wishesList}
      </div>
    </li>
  )
}

export default Card