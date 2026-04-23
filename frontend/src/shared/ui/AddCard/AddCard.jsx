import { memo } from 'react';
import { Plus } from 'lucide-react';
import styles from './AddCard.module.css';

const AddCard = ({ title, onClick, type }) => {
  return (
    <li className={`${styles.card} ${styles[type]}`}>
      <button
        className={styles.button}
        onClick={onClick}
        type="button"
        tabIndex={0}
      >
        <div className={styles.iconWrapper}>
          <Plus size={85} strokeWidth={2.5} className={styles.icon} />
        </div>
        <div className={styles.text}>{title}</div>
      </button>
    </li>
  );
};

export default memo(AddCard);
