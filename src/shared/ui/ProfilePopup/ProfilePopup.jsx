import {useRef} from "react";
import {motion} from "framer-motion";
import {X} from 'lucide-react';
import {useClickOutside} from "@/shared/hooks/useClickOutside";
import {useEscClose} from "@/shared/hooks/useEscClose";
import styles from './ProfilePopup.module.css';

const ProfilePopup = ({user, onClose}) => {
  const popupRef = useRef(null);

  useEscClose(onClose);
  useClickOutside([popupRef], onClose);

  return (
    <motion.div
      className={styles.overlay}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.3}}
    >
      <motion.div
        ref={popupRef}
        className={styles.content}
        initial={{scale: 0.9, opacity: 0, y: -100}}
        animate={{scale: 1, opacity: 1, y: 0}}
        exit={{scale: 0.9, opacity: 0, y: 100}}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300
        }}
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
        >
          <X size={32} />
        </button>

        <div className={styles.profileInfo}>
          <img
            src={user.avatarURL}
            alt={user.login}
            className={styles.avatar}
          />
          <h2 className={styles.name}>{user.login}</h2>
          <p className={styles.birthday}>
            Дата рождения: {user.birthday || 'Не указана'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ProfilePopup