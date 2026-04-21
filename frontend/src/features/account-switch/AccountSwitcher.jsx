import { useNavigate } from 'react-router-dom';
import Menu from '@/shared/ui/Menu';
import { useSessionStore } from '@/entities/session';

const AccountSwitcher = () => {
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
    <Menu
      currentUser={currentUser}
      users={users}
      onSelectUser={handleSelectUser}
      onAddAccount={handleAddAccount}
      onLogout={handleLogout}
      hasUnread={false}
    />
  );
};

export default AccountSwitcher;
