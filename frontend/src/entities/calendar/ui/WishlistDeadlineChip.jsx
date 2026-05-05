/**
 * @file События в календаре.
 * @module entities/calendar/ui/WishlistDeadlineChip
 */

import { memo } from 'react';
import styles from './WishlistDeadlineChip.module.css';

/**
 * Компонент-индикатор дедлайна вишлиста в календаре.
 * * @component
 * @param {Object} props
 * @param {Object} props.wishlist - Объект вишлиста.
 * @param {string} props.wishlist.name - Название, которое будет отображено в чипе.
 */
export const WishlistDeadlineChip = memo(({ wishlist }) => {
  return (
    <span className={styles.chip} title={wishlist.name}>
      {wishlist.name}
    </span>
  );
});
