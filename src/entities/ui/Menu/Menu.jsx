import { useState, useRef } from 'react';
import { AnimatePresence } from "framer-motion";
import { Bell, Menu as MenuIcon } from 'lucide-react';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { NotificationDropdown, BurgerDropdown } from '@/shared/ui/Dropdowns';
import ProfilePopup from "@/shared/ui/ProfilePopup";
import profileAvatar from '@/shared/assets/govishka.png';
import styles from './Menu.module.css';

const Menu = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const burgerRef = useRef(null);

  const closeAll = () => {
    setActiveDropdown(null);
    setIsProfileOpen(false);
  }

  useClickOutside(notificationRef, () => activeDropdown === 'notification' && closeAll());
  useClickOutside(profileRef, () => activeDropdown === 'profile' && closeAll());
  useClickOutside(burgerRef, () => activeDropdown === 'burger' && closeAll());

  const hasUnread = true;

  const userData = {
    login: "Димасик Твикс",
    avatarURL: profileAvatar,
    birthday: "25.07.2006"
  };

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
        <AnimatePresence>
          {activeDropdown === 'notification' && <NotificationDropdown onClose={closeAll} />}
        </AnimatePresence>
      </li>

      <li className={styles.itemContainer} ref={profileRef}>
        <button
          onClick={() => setIsProfileOpen(true)}
          className={styles.item}
          data-tooltip={'Профиль'}
        >
          <img src={profileAvatar} alt='Ваш аватар' className={styles.avatar} />
        </button>
      </li>

      <li className={styles.itemContainer} ref={burgerRef}>
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'burger' ? null : 'burger')}
          className={`${styles.item} ${activeDropdown === 'burger' ? styles.activeItem : ''}`}
          data-tooltip="Меню"
        >
          <MenuIcon size={28} />
        </button>
        <AnimatePresence>
          {activeDropdown === 'burger' && <BurgerDropdown onClose={closeAll} />}
        </AnimatePresence>
      </li>

      <AnimatePresence>
        {isProfileOpen && (
          <ProfilePopup
            user={userData}
            onClose={closeAll}
          />
        )}
      </AnimatePresence>
    </ul>
  );
};

export default Menu;