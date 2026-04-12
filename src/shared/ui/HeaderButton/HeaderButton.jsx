import {forwardRef} from 'react';
import {NavLink} from "react-router-dom";
import styles from '@/shared/ui/Navigation/Navigation.module.css';

const HeaderButton = forwardRef(({item}, ref) => {
  const Icon = item.icon;
  return (
    <li ref={ref}>
      <NavLink
        to={item.path}
        className={({isActive}) =>
          `${styles.item} ${isActive ? styles.activeItem : ''}`}
      >
        <Icon
          size={30}
          strokeWidth={2}
          style={{color: "white"}}
        />
      </NavLink>
    </li>
  );
});

export default HeaderButton;