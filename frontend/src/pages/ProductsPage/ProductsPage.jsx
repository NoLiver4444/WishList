import { memo, useEffect, useMemo, useState } from 'react';
import { useSearch } from '@/shared/context/SearchContext';
import { uploadImage } from '@/shared/lib/uploadImage';
import Main from '@/widgets/Main';
import AddCardModal from '@/features/add-card/ui/AddCardModal';
import {
  createProduct,
  deleteProduct,
  fetchMyProducts,
  updateProduct,
} from '@/entities/wishlist/api/wishlistApi';

const ProductsPage = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useSearch();

  const sortOptions = [
    { label: 'по дате добавления', value: 'date_added' },
    { label: 'по названию', value: 'name' },
    { label: 'по цене', value: 'price' },
    { label: 'по дате события', value: 'deadline' },
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

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleAdd = async (formData) => {
    const tempId = crypto.randomUUID();
    const localImage =
      formData.image instanceof File
        ? URL.createObjectURL(formData.image)
        : formData.imageUrl || null;

    setItems((prev) => [
      ...prev,
      {
        id: tempId,
        name: formData.name,
        url: formData.url,
        image: localImage,
        imageUrl: localImage,
        description: formData.description,
        price: formData.price,
        _loading: true,
      },
    ]);
    setIsModalOpen(false);

    try {
      const created = await createProduct(formData);
      setItems((prev) =>
        prev.map((i) =>
          i.id === tempId
            ? {
                id: created.id,
                name: created.title,
                url: created.url,
                image: created.image_url,
                imageUrl: created.image_url,
                description: created.description,
                price: created.price,
              }
            : i
        )
      );
    } catch (err) {
      setItems((prev) => prev.filter((i) => i.id !== tempId));
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

  const handleEdit = (item) => setEditItem(item);

  const handleEditSubmit = async (formData) => {
    const localImage =
      formData.image instanceof File
        ? URL.createObjectURL(formData.image)
        : formData.imageUrl || editItem.imageUrl || null;

    setItems((prev) =>
      prev.map((i) =>
        i.id === editItem.id
          ? {
              ...i,
              name: formData.name,
              url: formData.url,
              image: localImage,
              imageUrl: localImage,
              description: formData.description,
              price: formData.price,
              _loading: formData.image instanceof File,
            }
          : i
      )
    );
    setEditItem(null);

    try {
      let imageUrl = formData.imageUrl || undefined;
      if (formData.image instanceof File) {
        imageUrl = await uploadImage(formData.image);
      }

      const updated = await updateProduct(editItem.id, {
        ...formData,
        imageUrl,
      });

      setItems((prev) =>
        prev.map((i) =>
          i.id === editItem.id
            ? {
                id: updated.id,
                name: updated.title,
                url: updated.url,
                image: updated.image_url,
                imageUrl: updated.image_url,
                description: updated.description,
                price: updated.price,
              }
            : i
        )
      );
    } catch (err) {
      console.error('Ошибка обновления желания:', err);
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
        onEdit={handleEdit}
        data={filteredItems}
        loading={loading}
        searchQuery={searchQuery}
      />

      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
        type="wishes"
        title="Добавить желание"
      />

      <AddCardModal
        isOpen={editItem}
        onClose={() => setEditItem(null)}
        onSubmit={handleEditSubmit}
        type="wishes"
        title="Изменить желание"
        initialValues={
          editItem
            ? {
                name: editItem.name,
                url: editItem.url ?? '',
                imageUrl: editItem.imageUrl ?? '',
                description: editItem.description ?? '',
                price: editItem.price ?? '',
                private: editItem.privacy ?? 'public',
              }
            : null
        }
      />
    </>
  );
};

export default memo(ProductsPage);
