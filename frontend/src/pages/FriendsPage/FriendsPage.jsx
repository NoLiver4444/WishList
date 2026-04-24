import { memo, useEffect, useState } from 'react';
import Main from '@/widgets/Main';
import AddCardModal from '@/features/add-card/ui/AddCardModal';

const FriendsPage = () => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('friends')) ?? [];
    } catch {
      return [];
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(items));
  }, [items]);

  const sortOptions = [
    { label: 'по имени', value: 'name' },
    { label: 'по дате рождения', value: 'birthday_date' },
  ];

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
        data={items}
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
