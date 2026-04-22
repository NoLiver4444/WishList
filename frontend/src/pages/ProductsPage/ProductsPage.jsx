import { useEffect, useState } from 'react';
import Main from '@/widgets/Main';
import AddCardModal from '@/features/add-card/ui/AddCardModal';
import {
  createProduct,
  deleteProduct,
  fetchMyProducts,
} from '@/entities/wishlist/api/wishlistApi';

const ProductsPage = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const sortOptions = [
    { label: 'по дате добавления', value: 'date_added' },
    { label: 'по названию', value: 'name' },
    { label: 'по цене', value: 'price' },
  ];

  useEffect(() => {
    fetchMyProducts()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.products ?? []);
        setItems(
          list.map((p) => ({
            id: p.id,
            name: p.title,
            url: p.url,
            image: p.image_url,
            imageUrl: p.image_url,
            description: p.description,
            price: p.price,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (formData) => {
    try {
      const created = await createProduct(formData);
      setItems((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.title,
          url: created.url,
          image: created.image_url,
          imageUrl: created.image_url,
          description: created.description,
          price: created.price,
        },
      ]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Ошибка создания желания:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Ошибка удаления желания:', err);
    }
  };

  return (
    <>
      <Main
        title="Мои желания"
        variant="wishes"
        type="wishes"
        sortOptions={sortOptions}
        onAddClick={() => setIsModalOpen(true)}
        onDelete={handleDelete}
        data={items}
        loading={loading}
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
