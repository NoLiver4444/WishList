import styles from './WishlistDeadlineChip.module.css';

export const WishlistDeadlineChip = ({ wishlist }) => {
  return (
    <span className={styles.chip} title={wishlist.title}>
      {wishlist.title}
    </span>
  );
};
