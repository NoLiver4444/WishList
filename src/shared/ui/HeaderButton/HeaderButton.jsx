import {NavLink} from "react-router-dom";
import styles from '@/entities/ui/Navigation/Navigation.module.css';

const HeaderButton = ({item}) => {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.path}
        className={({isActive}) =>
          `${styles.item} ${isActive ? styles.activeItem : ''}`
        }
        data-tooltip={item.label}
      >
        <span
          className={`
            ${styles.icon} ${item.id === 'favorite' ? styles.favorite : ''}
          `}
        >
          <Icon
            size={32}
            strokeWidth={2}
          />
        </span>
      </NavLink>
    </li>
  );
};

export default HeaderButton;