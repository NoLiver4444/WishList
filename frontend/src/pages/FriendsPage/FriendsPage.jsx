/**
 * @file Страница списка друзей.
 * @module pages/FriendsPage
 */

import { memo, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Main from '@/widgets/Main';
import AddCardModal from '@/features/cards/add-card/ui/AddCardModal';
import { useSearch } from '@/shared/hooks/useSearch.js';

/**
 * Компонент FriendsPage.
 * Позволяет искать и добавлять друзей по их ID.
 * * @component
 */
const FriendsPage = () => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('friends')) ?? [];
    } catch {
      return [];
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();

  const location = useLocation();

  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname, setSearchQuery]);

  const sortOptions = [
    { label: 'по имени', value: 'name' },
    { label: 'по дате рождения', value: 'birthday_date' },
  ];

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(items));
  }, [items]);

  const handleAdd = (newItem) => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newItem.login,
        friendId: newItem.id,
        avatarUrl: null,
      },
    ]);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <>
      <Main
        title="Мои друзья"
        variant="friends"
        type="friends"
        sortOptions={sortOptions}
        onAddClick={() => setIsModalOpen(true)}
        onDelete={handleDelete}
        data={filteredItems}
        searchQuery={searchQuery}
      />

      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        type="friends"
        title="Добавить друга"
      />
    </>
  );
};

export default memo(FriendsPage);
