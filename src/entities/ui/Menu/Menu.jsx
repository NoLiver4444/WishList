import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu as MenuIcon } from 'lucide-react';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { BurgerDropdown, NotificationDropdown } from '@/shared/ui/Dropdowns';
import profileAvatar from '@/shared/assets/govishka.png';
import styles from './Menu.module.css';

const Menu = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const burgerRef = useRef(null);

  const closeAll = () => setActiveDropdown(null);

  useClickOutside(notificationRef, () => activeDropdown === 'notification' && closeAll());
  useClickOutside(profileRef, () => activeDropdown === 'profile' && closeAll());
  useClickOutside(burgerRef, () => activeDropdown === 'burger' && closeAll());

  const hasUnread = true;

  return (
    <ul className={styles.menu}>
      <li className={styles.itemContainer} ref={notificationRef}>
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'notification' ? null : 'notification')}
          className={`${styles.item} ${activeDropdown === 'notification' ? styles.activeItem : ''}`}
          data-tooltip="Уведомления"
        >
          <Bell size={28} />
          {hasUnread && <span className={styles.badge} />}
        </button>
        {activeDropdown === 'notification' && <NotificationDropdown />}
      </li>

      <li className={styles.itemContainer} ref={profileRef}>
        <Link
          to={'/profile'}
          className={`${styles.item} ${activeDropdown === 'notification' ? styles.activeItem : ''}`}
          data-tooltip={'Профиль'}
        >
          <img
            src={profileAvatar}
            alt='Ваш аватар'
            className={styles.avatar}
          />
        </Link>
      </li>

      <li className={styles.itemContainer} ref={burgerRef}>
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'burger' ? null : 'burger')}
          className={`${styles.item} ${activeDropdown === 'burger' ? styles.activeItem : ''}`}
          data-tooltip="Меню"
        >
          <MenuIcon size={28} />
        </button>
        {activeDropdown === 'burger' && <BurgerDropdown onClose={closeAll} />}
      </li>
    </ul>
  );
};

export default Menu;