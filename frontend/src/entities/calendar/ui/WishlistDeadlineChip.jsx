/**
 * @file События в календаре.
 * @module entities/calendar/ui/WishlistDeadlineChip
 */

import styles from './WishlistDeadlineChip.module.css';
import { memo } from 'react';

/**
 * Компонент-индикатор дедлайна вишлиста в календаре.
 * * @component
 * @param {Object} props
 * @param {Object} props.wishlist - Объект вишлиста.
 * @param {string} props.wishlist.title - Название, которое будет отображено в чипе.
 */
export const WishlistDeadlineChip = memo(({ wishlist }) => {
  return (
    <span className={styles.chip} title={wishlist.title}>
      {wishlist.title}
    </span>
  );
});
