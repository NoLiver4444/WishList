import burgerIconURL from '@/shared/assets/burger-menu.svg'
import notificationIconURL from '@/shared/assets/notification.svg'
import avatarURL from '@/shared/assets/govishka.png'
import styles from './Menu.module.css'

const Menu = () => {
  return (
    <ul className={styles.menu}>
      <li className={styles.item}>
        <img
          src={notificationIconURL}
          alt='Уведомления'
          className={styles.icon}
        />
      </li>
      <li className={styles.item}>
        <img
          src={avatarURL}
          alt='Ваш аватар'
          className={styles.avatar}
        />
      </li>
      <li className={styles.item}>
        <img
          src={burgerIconURL}
          alt='Меню'
          className={styles.icon}
        />
      </li>
    </ul>
  )
}

export default Menu