import { Link } from 'react-router-dom';
import { useEscClose } from '@/shared/hooks/UseEscClose.jsx'
import styles from '@/entities/ui/Menu/Menu.module.css'

export const BurgerDropdown = ({ onClose }) => {
  useEscClose(onClose)

  return (
    <div className={styles.dropdown}>
      <Link
        to="/settings"
        className={styles.menuLink}
        onClick={onClose}
      >
        Настройки
      </Link>
      <a
        href="https://t.me/AISAAAAUUUU"
        target="_blank"
        className={styles.menuLink}
        onClick={onClose}
      >Помощь
      </a>
      <button className={styles.menuLink}>О проекте</button>
      <hr className={styles.divider} />
      <button className={`${styles.menuLink} ${styles.exit}`}>Выйти</button>
    </div>
  )
}

export const NotificationDropdown = ({ onClose }) => {
  useEscClose(onClose);

  return (
    <div className={styles.dropdown}>
      <p className={styles.dropdownTitle}>Уведомления</p>
      <div className={styles.dropdownContent}>Пока нет новых сообщений</div>
    </div>
  )
}