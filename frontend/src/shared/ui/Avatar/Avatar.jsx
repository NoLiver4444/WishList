import { UserRound } from 'lucide-react';
import styles from './Avatar.module.css';

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

export default Avatar;
