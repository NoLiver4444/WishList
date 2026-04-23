import { forwardRef, memo } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '@/shared/ui/Navigation/Navigation.module.css';

const HeaderButton = forwardRef(({ item, className }, ref) => {
  const Icon = item.icon;
  return (
    <li ref={ref}>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `${styles.item} ${className} ${isActive ? styles.activeItem : ''}`
        }
      >
        <Icon size={26} strokeWidth={2} className={styles.icon} />
      </NavLink>
    </li>
  );
});

export default memo(HeaderButton);
