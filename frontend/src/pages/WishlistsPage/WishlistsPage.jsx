import { memo, useEffect, useMemo, useState } from 'react';
import Main from '@/widgets/Main';
import AddCardModal from '@/features/add-card/ui/AddCardModal';
import {
  createWishlist,
  deleteWishlist,
  fetchWishlistItems,
  fetchWishlists,
  updateWishlist,
} from '@/entities/wishlist';
import { useSearch } from '@/shared/context/SearchContext.jsx';

const WishlistsPage = () => {
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useSearch();

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
        setItems(
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

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const loadPreviews = async (list) => {
    for (const wishlist of list) {
      fetchWishlistItems(wishlist.id)
        .then((data) => {
          const items = Array.isArray(data) ? data : (data.items ?? []);

          const previews = items
            .map((i) => i.product?.image_url ?? null)
            .slice(0, 9);

          setItems((prev) =>
            prev.map((w) =>
              w.id === wishlist.id
                ? { ...w, counts: items.length, previews }
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
      setItems((prev) => [
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
    try {
      await deleteWishlist(id);
      setItems((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
  };

  const handleEditSubmit = async (formData) => {
    try {
      const updated = await updateWishlist(editItem.id, {
        name: formData.name,
        deadline: formData.date || undefined,
        privacy: formData.private || 'public',
      });
      setItems((prev) =>
        prev.map((w) =>
          w.id === editItem.id
            ? {
                ...w,
                name: updated.name,
                date: updated.deadline ?? null,
                privacy: updated.privacy,
              }
            : w
        )
      );
      setEditItem(null);
    } catch (err) {
      console.error('Ошибка обновления:', err);
    }
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
        data={filteredItems}
        loading={loading}
        searchQuery={searchQuery}
      />

      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        type="wishlists"
        title="Создать вишлист"
      />

      <AddCardModal
        isOpen={editItem}
        onClose={() => setEditItem(null)}
        onSubmit={handleEditSubmit}
        type="wishlists"
        title="Изменить вишлист"
        initialValues={
          editItem
            ? {
                name: editItem.name,
                date: editItem.date
                  ? new Date(editItem.date).toISOString().split('T')[0]
                  : '',
                private: editItem.privacy ?? 'public',
              }
            : null
        }
      />
    </>
  );
};

export default memo(WishlistsPage);
