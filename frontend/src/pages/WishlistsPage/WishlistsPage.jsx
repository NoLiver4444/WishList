import { useEffect, useState } from 'react';
import Main from '@/widgets/Main';
import AddCardModal from '@/features/add-card/ui/AddCardModal';
import {
  createWishlist,
  fetchWishlistItems,
  fetchWishlists,
} from '@/entities/wishlist';

const WishlistsPage = () => {
  const [wishlists, setWishlists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const sortOptions = [
    { label: 'по дате добавления', value: 'date_added' },
    { label: 'по названию', value: 'name' },
    { label: 'по количеству желаний', value: 'count_products' },
    { label: 'по дате события', value: 'deadline' },
  ];

  useEffect(() => {
    fetchWishlists()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.wishlists ?? []);
        setWishlists(
          list.map((w) => ({
            id: w.id,
            name: w.name,
            date: w.deadline ?? null,
            counts: w.item_count ?? 0,
            privacy: w.privacy,
            previewImage: null,
          }))
        );
        return list;
      })
      .then((list) => loadPreviews(list))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadPreviews = async (list) => {
    for (const wishlist of list) {
      fetchWishlistItems(wishlist.id)
        .then((data) => {
          const items = Array.isArray(data) ? data : (data.items ?? []);
          const first = items.find((i) => i.product?.image_url);
          if (!first) return;

          setWishlists((prev) =>
            prev.map((w) =>
              w.id === wishlist.id
                ? { ...w, previewImage: first.product.image_url }
                : w
            )
          );
        })
        .catch(() => {});
    }
  };

  const handleAdd = async (formData) => {
    try {
      const created = await createWishlist({
        name: formData.name,
        deadline: formData.date || undefined,
        privacy: formData.private || 'public',
      });
      setWishlists((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.name,
          date: created.deadline ?? null,
          counts: 0,
          privacy: created.privacy,
          previewImage: null,
        },
      ]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Ошибка создания вишлиста:', err);
    }
  };

  const handleDelete = async (id) => {
    setWishlists((prev) => prev.filter((w) => w.id !== id));
  };

  const handleEdit = (item) => {
    console.log('edit', item);
  };

  return (
    <>
      <Main
        title="Мои вишлисты"
        variant="wishlists"
        type="wishlists"
        sortOptions={sortOptions}
        onAddClick={() => setIsModalOpen(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        data={wishlists}
        loading={loading}
      />
      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        type="wishlists"
        title="Создать вишлист"
      />
    </>
  );
};

export default WishlistsPage;
