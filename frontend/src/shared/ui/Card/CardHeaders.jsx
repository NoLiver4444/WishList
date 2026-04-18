import styles from './Card.module.css';

export const WishHeader = ({ name, date, dateOptions }) => (
  <div className={styles.information}>
    <h5 className={styles.title}>{name}</h5>
    {date && (
      <span className={styles.date}>
        До {new Date(date).toLocaleDateString('ru-RU', dateOptions)}
      </span>
    )}
  </div>
);

export const WishlistHeader = ({ name, date, counts, dateOptions }) => (
  <div className={styles.information}>
    <h5 className={styles.title}>{name}</h5>
    <div className={styles.meta}>
      {counts !== undefined && (
        <span className={styles.counts}>Желаний: {counts}</span>
      )}
      {date && (
        <span className={styles.date}>
          До {new Date(date).toLocaleDateString('ru-RU', dateOptions)}
        </span>
      )}
    </div>
  </div>
);

export const FriendHeader = ({ name, friendId }) => (
  <div className={styles.information}>
    <h5 className={styles.title}>{name}</h5>
    {friendId && <span className={styles.friendId}>ID: {friendId}</span>}
  </div>
);
