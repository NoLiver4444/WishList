import { useState, useRef } from 'react';
import { Bell, Menu as MenuIcon } from 'lucide-react';
import profile from '@/shared/assets/govishka.png';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
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

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const unreadNotifications = ["xd"];
  const hasUnread = unreadNotifications.length > 0;

  return (
    <ul className={styles.menu}>
      <li className={styles.itemContainer} ref={notificationRef}>
        <button
          className={`${styles.item} ${activeDropdown === 'notification' ? styles.activeItem : ''}`}
          onClick={() => toggleDropdown('notification')}
          data-tooltip={'Уведомления'}
        >
          <Bell size={28} />
          {hasUnread && <span className={styles.badge} />}
        </button>
        {activeDropdown === 'notification' && (
          <div className={styles.dropdown}>
            <p className={styles.dropdownTitle}>Уведомления</p>
            <div className={styles.dropdownContent}>Пока нет новых сообщений</div>
          </div>
        )}
      </li>

      <li className={styles.itemContainer} ref={profileRef}>
        <button
          className={`${styles.item} ${activeDropdown === 'notification' ? styles.activeItem : ''}`}
          data-tooltip={'Профиль'}
        >
          <img
            src={profile}
            alt='Ваш аватар'
            className={styles.avatar}
          /> {/*ДОБАВЬ ССЫЛКУ НА НАСТРОЙКУ ПРОФИЛЯ*/}
        </button>
      </li>

      <li className={styles.itemContainer} ref={burgerRef}>
        <button
          className={`${styles.item} ${activeDropdown === 'burger' ? styles.activeItem : ''}`}
          onClick={() => toggleDropdown('burger')}
          data-tooltip={'Меню'}
        >
          <MenuIcon size={28} />
        </button>
        {activeDropdown === 'burger' && (
          <div className={styles.dropdown}>
            <button className={styles.menuLink}>Настройки</button>
            <a
              href="https://t.me/AISAAAAUUUU"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.menuLink}
              onClick={closeAll}
            >
              Помощь
            </a>
            <button className={styles.menuLink}>О проекте</button>
            <hr className={styles.divider} />
            <button className={`${styles.menuLink} ${styles.exit}`}>Выйти</button>
          </div>
        )}
      </li>
    </ul>
  );
};

export default Menu;