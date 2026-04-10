import {Link} from 'react-router-dom';
import {motion} from "framer-motion";
import {useEscClose} from '@/shared/hooks/useEscClose.jsx';
import styles from '@/entities/ui/Menu/Menu.module.css';

export const NotificationDropdown = ({onClose}) => {
  useEscClose(onClose);

  return (
    <motion.div
      className={styles.dropdown}
      initial={{scale: 0.9, opacity: 0, y: -15}}
      animate={{scale: 1, opacity: 1, y: 0}}
      exit={{scale: 0.9, opacity: 0, y: -15}}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 400
      }}
    >
      <p className={styles.dropdownTitle}>Уведомления</p>
      <div className={styles.dropdownContent}>Пока нет новых сообщений</div>
    </motion.div>
  );
};

export const BurgerDropdown = ({onClose}) => {
  useEscClose(onClose);

  return (
    <motion.div
      className={styles.dropdown}
      initial={{scale: 0.9, opacity: 0, y: -15}}
      animate={{scale: 1, opacity: 1, y: 0}}
      exit={{scale: 0.9, opacity: 0, y: -15}}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 400
      }}
    >
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
      >
        Помощь
      </a>
      <button className={styles.menuLink}>О проекте</button>
      <hr className={styles.divider} />
      <button className={`${styles.menuLink} ${styles.exit}`}>Выйти</button>
    </motion.div>
  );
};