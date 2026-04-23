import styles from './WishlistDeadlineChip.module.css';
import { memo } from 'react';

export const WishlistDeadlineChip = memo(({ wishlist }) => {
  return (
    <span className={styles.chip} title={wishlist.title}>
      {wishlist.title}
    </span>
  );
});
