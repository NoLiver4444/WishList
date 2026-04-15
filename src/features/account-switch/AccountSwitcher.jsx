import { useState } from 'react';
import Menu from '@/shared/ui/Menu';
import profileAvatar from '@/shared/assets/govishka.png';

const USERS = [
  {
    id: 1,
    name: 'Димасик Твикс',
    login: 'gowish',
    avatarURL: profileAvatar,
    email: 'gowish@gmail.com',
    birthday: '25.07.2006',
  },
  {
    id: 2,
    name: 'Второй Аккаунт',
    login: 'gowish2',
    avatarURL: profileAvatar,
    email: 'gowish2@gmail.com',
    birthday: '11.09.2001',
  },
];

const HAS_UNREAD = true;

const AccountSwitcher = () => {
  const [currentUser, setCurrentUser] = useState(USERS[0]);

  return (
    <Menu
      currentUser={currentUser}
      users={USERS}
      onSelectUser={setCurrentUser}
      hasUnread={HAS_UNREAD}
    />
  );
};

export default AccountSwitcher;
