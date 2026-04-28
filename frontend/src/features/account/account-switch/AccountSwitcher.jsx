/**
 * @file Компонент для переключения между активными аккаунтами.
 * @module features/account/account-switch/AccountSwitcher
 */

import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '@/shared/ui/Interface/Menu/index.js';
import SettingsModal from '@/features/account/settings/index.js';
import { useSessionStore } from '@/entities/session/index.js';

/**
 * Инкапсулирует логику выбора текущего профиля, выхода из системы и открытия настроек.
 * Взаимодействует с `useSessionStore` для управления списком сессий.
 */
const AccountSwitcher = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navigate = useNavigate();
  const accounts = useSessionStore((s) => s.accounts);
  const activeIndex = useSessionStore((s) => s.activeIndex);
  const switchAccount = useSessionStore((s) => s.switchAccount);
  const logout = useSessionStore((s) => s.logout);

  const currentUser = accounts[activeIndex]?.user;

  const users = accounts.map((a, i) => ({
    ...a.user,
    _index: i,
  }));

  const handleSelectUser = (user) => switchAccount(user._index);

  const handleAddAccount = () => navigate('/auth');

  const handleLogout = () => {
    logout();
    if (accounts.length <= 1) navigate('/auth');
  };

  return (
    <>
      <Menu
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
        onAddAccount={handleAddAccount}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasUnread={false}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default memo(AccountSwitcher);
