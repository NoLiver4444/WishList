import { Ellipsis } from 'lucide-react';
import styles from './Card.module.css';

const Card = ({ name, date, counts, children, onMenuClick, type }) => {
  const shouldShowDate = type === 'wishes' || type === 'wishlists';

  const shouldShowCounts = type === 'wishlists';

  return (
    <li className={`${styles.card} ${styles[type]}`}>
      <div className={styles.header}>
        <div className={styles.information}>
          <h5 className={styles.title}>{name}</h5>

          {shouldShowDate && date && <div className={styles.date}>{date}</div>}

          {shouldShowCounts && counts !== undefined && (
            <div className={styles.counts}>{`Подарков: ${counts}`}</div>
          )}
        </div>

        <button onClick={onMenuClick} className={styles.menuButton}>
          <Ellipsis className="icon" size={35} strokeWidth={2} />
        </button>
      </div>

      <div className={styles.cardContent}>{children}</div>
    </li>
  );
};

export default Card;
