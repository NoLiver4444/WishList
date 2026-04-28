/**
 * @file Полноэкранный попап профиля пользователя.
 * @module shared/ui/User/ProfilePopup
 */

import { memo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Avatar from '@/shared/ui/User/Avatar/index.js';
import { useClickOutside } from '@/shared/hooks/useClickOutside.jsx';
import { useEscClose } from '@/shared/hooks/useEscClose.jsx';
import styles from './ProfilePopup.module.css';

/**
 * Компонент ProfilePopup.
 * Отображает аватар, логин и дату рождения пользователя.
 * Использует портал для рендеринга поверх всей иерархии приложения.
 * * @component
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.user - Объект данных пользователя.
 * @param {Function} props.onClose - Функция закрытия окна.
 */
const ProfilePopup = ({ user, onClose }) => {
  const popupRef = useRef(null);

  useEscClose(onClose);
  useClickOutside([popupRef], onClose);

  const modalContent = (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        ref={popupRef}
        className={styles.content}
        initial={{ scale: 0.9, opacity: 0, y: -100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 100 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
        }}
      >
        <button className={styles.closeButton} onClick={onClose}>
          <X size={32} />
        </button>

        <div className={styles.profileInfo}>
          <Avatar
            src={user?.avatarURL}
            alt={user?.login}
            size={150}
            className={styles.avatar}
          />
          <h2 className={styles.name}>{user?.login}</h2>
          <p className={styles.birthday}>
            Дата рождения: {user?.birthday || 'Не указана'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

export default memo(ProfilePopup);
