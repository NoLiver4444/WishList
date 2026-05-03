/**
 * @file Страница списка друзей.
 * @module pages/FriendsPage
 */

import { memo, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  deleteFriend,
  getFriends,
  getIncomingRequests,
  respondToRequest,
} from '@/entities/api/friendships.api.js';
import Main from '@/widgets/Main';
import AddFriendModal from '@/features/friends/AddFriendModal';
import { useSearch } from '@/shared/hooks/useSearch.js';
import styles from './FriendsPage.module.css';
import Avatar from '@/shared/ui/User/Avatar/Avatar.jsx';

/**
 * Компонент FriendsPage.
 * Позволяет искать и добавлять друзей по их ID.
 * * @component
 */
const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState('friends');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const location = useLocation();

  const tabs = [
    {
      label: 'Друзья',
      counts: `${friends?.length ? ` ${friends?.length}` : 0}`,
      value: 'friends',
    },
    {
      label: 'Заявки',
      counts: `${requests?.length ? ` ${requests?.length}` : 0}`,
      value: 'requests',
    },
  ];

  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname, setSearchQuery]);

  useEffect(() => {
    getFriends()
      .then((data) => setFriends(data ?? []))
      .catch(console.error);
    getIncomingRequests()
      .then((data) => setRequests(data ?? []))
      .catch(console.error);
  }, []);

  const handleRespond = async (id, status) => {
    try {
      await respondToRequest(id, status);
      setRequests((prev) => prev.filter((r) => r.friendship_id !== id));
      if (status === 'accepted') {
        const accepted = requests.find((r) => r.friendship_id === id);
        if (accepted) setFriends((prev) => [...prev, accepted]);
      }
    } catch {
      console.error('Ошибка при ответе на заявку');
    }
  };

  const handleAction = async (action, friendshipId) => {
    try {
      if (action === 'delete') {
        await deleteFriend(friendshipId);
        setFriends((prev) =>
          prev.filter((f) => f.friendship_id !== friendshipId)
        );
      }
    } catch {
      console.error('Ошибка при действии с другом');
    }
  };

  const filteredFriends = useMemo(
    () =>
      friends.filter((f) =>
        f.login.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [friends, searchQuery]
  );

  return (
    <>
      <Main
        title="Мои друзья"
        type="friends"
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        onAddClick={() => setIsModalOpen(true)}
        onDelete={(id) => handleAction('delete', id)}
        onBlock={(id) => handleAction('block', id)}
        data={tab === 'friends' ? filteredFriends : requests}
      >
        {tab === 'requests' && (
          <div className={styles.requests}>
            {requests?.length === 0 && (
              <p className={styles.emptyRequests}>Нет входящих заявок</p>
            )}
            {requests.map((r) => (
              <div key={r.friendship_id} className={styles.requestCard}>
                <div className={styles.userCard}>
                  <Avatar
                    src={r?.avatar_url}
                    alt={r?.login}
                    size={150}
                    className={styles.avatar}
                  />
                  <span className={styles.login}>{r.login}</span>
                </div>
                <button
                  className={styles.accepted}
                  onClick={() => handleRespond(r.friendship_id, 'accepted')}
                >
                  Принять
                </button>

                <button
                  className={styles.declined}
                  onClick={() => handleRespond(r.friendship_id, 'declined')}
                >
                  Отклонить
                </button>
              </div>
            ))}
          </div>
        )}
      </Main>

      <AddFriendModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="friends"
        title="Добавить друга"
      />
    </>
  );
};

export default memo(FriendsPage);
