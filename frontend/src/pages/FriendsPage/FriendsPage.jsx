import { memo, useEffect, useMemo, useState } from 'react';
import Main from '@/widgets/Main';
import AddCardModal from '@/features/add-card/ui/AddCardModal';
import { useSearch } from '@/shared/context/SearchContext.jsx';

const FriendsPage = () => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('friends')) ?? [];
    } catch {
      return [];
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { searchQuery } = useSearch();

  const sortOptions = [
    { label: 'по имени', value: 'name' },
    { label: 'по дате рождения', value: 'birthday_date' },
  ];

  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

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
