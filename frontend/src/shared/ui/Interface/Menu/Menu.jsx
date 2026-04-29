/**
 * @file Правое меню шапки (уведомления и аккаунт).
 * @module shared/ui/Interface/Menu
 */

import { memo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown } from 'lucide-react';
import Avatar from '@/shared/ui/User/Avatar/index.js';
import { useClickOutside } from '@/shared/hooks/useClickOutside.jsx';
import {
  NotificationDropdown,
  ProfileDropdown,
} from '@/shared/ui/Interface/Dropdowns/index.js';
import ProfilePopup from '@/shared/ui/User/ProfilePopup/index.js';
import styles from './Menu.module.css';

/**
 * Компонент Menu.
 * Управляет состояниями открытия выпадающих списков уведомлений и профиля.
 * Использует `AnimatePresence` для анимации появления/исчезновения.
 * * @component
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.currentUser - Данные текущего активного пользователя.
 * @param {Array} props.users - Список всех подключенных аккаунтов.
 * @param {Function} props.onSelectUser - Смена активного аккаунта.
 * @param {Function} props.onAddAccount - Добавление нового аккаунта.
 * @param {Function} props.onLogout - Выход из системы.
 * @param {Function} props.onOpenSettings - Открытие настроек.
 * @param {boolean} [props.hasUnread=false] - Флаг наличия непрочитанных уведомлений.
 */
const Menu = ({
  currentUser,
  users,
  onSelectUser,
  onAddAccount,
  onLogout,
  onOpenSettings,
  hasUnread = false,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notificationRef = useRef(null);
  const avatarRef = useRef(null);

  const closeAll = () => {
    setActiveDropdown(null);
    setIsProfileOpen(false);
  };

  useClickOutside(
    notificationRef,
    () => activeDropdown === 'notification' && closeAll()
  );
  useClickOutside(avatarRef, () => activeDropdown === 'avatar' && closeAll());

  return (
    <ul className={styles.menu}>
      <li className={styles.itemContainer} ref={avatarRef}>
        <button
          onClick={() =>
            setActiveDropdown(activeDropdown === 'avatar' ? null : 'avatar')
          }
          className={`${styles.item} ${activeDropdown === 'avatar' ? styles.activeItem : ''}`}
        >
          <Avatar
            classname={styles.avatar}
            src={currentUser?.avatar_url}
            alt={currentUser?.login}
            size={32}
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
              onAddAccount={onAddAccount}
              onOpenSettings={onOpenSettings}
              onLogout={onLogout}
              onOpenFullProfile={() => {
                setActiveDropdown(null);
                setIsProfileOpen(true);
              }}
            />
          )}
        </AnimatePresence>
      </li>

      <li className={styles.itemContainer} ref={notificationRef}>
        <button
          onClick={() =>
            setActiveDropdown(
              activeDropdown === 'notification' ? null : 'notification'
            )
          }
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
          <ProfilePopup user={currentUser} onClose={closeAll} />
        )}
      </AnimatePresence>
    </ul>
  );
};

export default memo(Menu);
