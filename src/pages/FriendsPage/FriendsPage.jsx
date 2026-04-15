import Main from '@/widgets/Main';
import { useState } from 'react';
import AddCardModal from '@/features/add-card/ui/AddCardModal.jsx';

const FriendsPage = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortOptions = [
    { label: 'дате добавления', value: 'date_added' },
    { label: 'имени', value: 'name' },
    { label: 'дате рождения', value: 'birthday_date' },
  ];

  const handleAdd = (newItem) => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        likes: 0,
        ...newItem,
      },
    ]);
    setIsModalOpen(false);
  };

  return (
    <>
      <Main
        title="Мои друзья"
        variant="friends"
        type="friends"
        sortOptions={sortOptions}
        onAddClick={() => setIsModalOpen(true)}
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

export default FriendsPage;
