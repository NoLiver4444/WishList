import { useState } from 'react';
import Main from '@/widgets/Main';
import AddCardModal from '@/features/add-card/AddCardModal';

const ProductsPage = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortOptions = [
    { label: 'дате добавления', value: 'date_added' },
    { label: 'названию', value: 'name' },
    { label: 'цене', value: 'price' },
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
        title="Мои желания"
        variant="wishes"
        type="wishes"
        sortOptions={sortOptions}
        onAddClick={() => setIsModalOpen(true)}
        data={items}
      />

      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        type="wishes"
        title="Добавить желание"
      />
    </>
  );
};

export default ProductsPage;
