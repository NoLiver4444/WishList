/**
 * @file Компонент аватара пользователя.
 * @module shared/ui/User/Avatar
 */

import { memo } from 'react';
import { UserRound } from 'lucide-react';
import styles from './Avatar.module.css';

/**
 * Компонент Avatar.
 * Если передан URL изображения, отображает его.
 * В противном случае отображает иконку-заглушку.
 * * @component
 * @param {Object} props
 * @param {string} [props.src] - URL изображения аватара.
 * @param {string} [props.alt] - Альтернативный текст.
 * @param {number} [props.size=32] - Размер стороны квадрата в пикселях.
 * @param {string} [props.className] - Дополнительные CSS-классы.
 */
const Avatar = ({ src, alt, size = 32, className }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? 'аватар'}
        className={`${styles.avatar} ${className || ''}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`${styles.placeholder} ${className || ''}`}
      style={{ width: size, height: size }}
    >
      <UserRound size={size * 0.6} />
    </div>
  );
};

export default memo(Avatar);
