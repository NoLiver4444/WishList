/**
 * @file Компоненты конкретных выпадающих меню (Уведомления, Профиль).
 * @module shared/ui/Interface/Dropdowns
 */

import { memo, useState } from 'react';
import { Check, LogOut, Plus, Settings } from 'lucide-react';
import Avatar from '@/shared/ui/User/Avatar/index.js';
import { useEscClose } from '@/shared/hooks/useEscClose.jsx';
import DropdownContainer from './DropdownContainer.jsx';
import ThemeSubmenu from '@/features/interface/theme-switch/ThemeSwitcher.jsx';
import styles from '@/shared/ui/Interface/Menu/Menu.module.css';

/**
 * Меню уведомлений.
 * Отображает список актуальных событий или заглушку "Пусто".
 * * @component
 * @param {Object} props
 * @param {Function} props.onClose - Функция закрытия.
 */
export const NotificationDropdown = memo(({ onClose }) => {
  useEscClose(onClose);

  return (
    <DropdownContainer>
      <p className={styles.dropdownTitle}>Уведомления</p>
      <div className={styles.notificationsSubtitle}>
        Пока нет новых сообщений
      </div>
    </DropdownContainer>
  );
});

/**
 * Меню профиля и переключения аккаунтов.
 * Содержит информацию о текущем пользователе, настройки темы,
 * список доступных аккаунтов и кнопки выхода/добавления.
 * * @component
 * @param {Object} props
 * @param {Function} props.onClose - Функция закрытия.
 * @param {Object} props.currentUser - Активный профиль.
 * @param {Array<Object>} props.users - Список всех авторизованных аккаунтов.
 * @param {Function} props.onSelectUser - Смена текущего аккаунта.
 * @param {Function} props.onOpenFullProfile - Переход к детальному просмотру профиля.
 * @param {Function} props.onAddAccount - Логика добавления новой сессии.
 * @param {Function} props.onLogout - Завершение сессии.
 */
export const ProfileDropdown = memo(
  ({
    onClose,
    currentUser,
    users,
    onSelectUser,
    onOpenFullProfile,
    onAddAccount,
    onOpenSettings,
    onLogout,
  }) => {
    useEscClose(onClose);

    const [showThemeSubmenu, setShowThemeSubmenu] = useState(false);

    const handleSelect = (user) => {
      onSelectUser(user);
      onClose();
    };

    return (
      <DropdownContainer>
        <div className={styles.profileData}>
          <Avatar
            src={currentUser?.avatar_url}
            alt={currentUser?.login}
            size={32}
          />
          <span className={styles.profileInfo}>
            <span
              className={styles.profileLogin}
              onClick={onOpenFullProfile}
              style={{ textDecoration: 'none' }}
            >
              {currentUser?.login}
            </span>
            <span className={styles.profileEmail}>{currentUser?.email}</span>
            <span className={styles.viewProfileLabel}>Посмотреть профиль</span>
          </span>
        </div>
        <hr className={styles.divider} />

        <button
          className={styles.menuLink}
          onClick={() => {
            onOpenSettings?.();
            onClose();
          }}
        >
          <Settings size={16} />
          <span>Настройки</span>
        </button>

        <ThemeSubmenu
          isOpen={showThemeSubmenu}
          onMouseEnter={() => setShowThemeSubmenu(true)}
          onMouseLeave={() => setShowThemeSubmenu(false)}
        />
        <hr className={styles.divider} />

        <h3 className={styles.subtitle}>Сменить аккаунт</h3>
        {users?.map((user) => {
          const isSelected = user.id === currentUser?.id;
          return (
            <button
              key={user.id}
              className={styles.menuLink}
              onClick={() => handleSelect(user)}
            >
              {isSelected ? <Check size={16} /> : <div style={{ width: 16 }} />}
              <span className={styles.switchAccount}>
                <Avatar
                  className={styles.switchAccountIcon}
                  src={user?.avatar_url}
                  alt={user?.login}
                  size={32}
                />
                <span className={styles.switchAccountLogin}>{user?.login}</span>
                <span className={styles.switchAccountEmail}>{user?.email}</span>
              </span>
            </button>
          );
        })}
        <hr className={styles.divider} />

        <button
          className={styles.menuLink}
          onClick={() => {
            onAddAccount?.();
            onClose();
          }}
        >
          <Plus size={16} />
          <span>Добавить аккаунт</span>
        </button>
        <hr className={styles.divider} />

        <button
          className={styles.menuLink}
          onClick={() => {
            onLogout?.();
            onClose();
          }}
        >
          <LogOut size={16} />
          <span>Выйти</span>
        </button>
      </DropdownContainer>
    );
  }
);
