import {useRef, useState} from 'react';
import {AnimatePresence} from 'framer-motion';
import {Bell, ChevronDown} from 'lucide-react';
import {useClickOutside} from '@/shared/hooks/useClickOutside.jsx';
import {
  NotificationDropdown,
  ProfileDropdown
} from '@/shared/ui/Dropdowns/index.js';
import ProfilePopup from '@/shared/ui/ProfilePopup/index.js';
import styles from './Menu.module.css';

const Menu = ({currentUser, users, onSelectUser, hasUnread = false}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notificationRef = useRef(null);
  const avatarRef = useRef(null);

  const closeAll = () => {
    setActiveDropdown(null);
    setIsProfileOpen(false);
  };

  useClickOutside(notificationRef, () => activeDropdown === 'notification' && closeAll());
  useClickOutside(avatarRef, () => activeDropdown === 'avatar' && closeAll());

  return (
    <ul className={styles.menu}>
      <li
        className={styles.itemContainer}
        ref={avatarRef}
      >
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'avatar' ? null : 'avatar')}
          className={`${styles.item} ${activeDropdown === 'avatar' ? styles.activeItem : ''}`}
        >
          <img
            src={currentUser?.avatarURL}
            alt="Аватар"
            className={styles.avatar}
          />
          <span className={styles.avatarLabel}>{currentUser?.login}</span>
          <ChevronDown
            size={16}
            className={`${styles.chevron} ${activeDropdown === 'avatar' ? styles.chevronOpen : ''}`}
          />
        </button>

        <AnimatePresence>
          {activeDropdown === 'avatar' && (
            <ProfileDropdown
              onClose={closeAll}
              currentUser={currentUser}
              users={users}
              onSelectUser={onSelectUser}
              onOpenFullProfile={() => {
                setActiveDropdown(null);
                setIsProfileOpen(true);
              }}
            />
          )}
        </AnimatePresence>
      </li>

      <li
        className={styles.itemContainer}
        ref={notificationRef}
      >
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'notification' ? null : 'notification')}
          className={`${styles.item} ${activeDropdown === 'notification' ? styles.activeItem : ''}`}
        >
          <Bell size={24} />
          {hasUnread && <span className={styles.badge} />}
        </button>

        <AnimatePresence>
          {activeDropdown === 'notification' && (
            <NotificationDropdown onClose={closeAll} />
          )}
        </AnimatePresence>
      </li>

      <AnimatePresence>
        {isProfileOpen && (
          <ProfilePopup
            user={currentUser}
            onClose={closeAll}
          />
        )}
      </AnimatePresence>
    </ul>
  );
};

export default Menu;