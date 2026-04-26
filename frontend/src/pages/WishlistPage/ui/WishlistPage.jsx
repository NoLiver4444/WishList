import { memo, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import {
  addItem,
  deleteWishlist,
  fetchWishlist,
  fetchWishlistItems,
  removeItem,
  reserveItem,
} from '@/entities/wishlist/api/wishlistApi.js';
import SelectProductModal from '@/features/add-to-wishlist/ui/SelectProductModal';
import WishlistItem from './WishlistItem';
import styles from './WishlistPage.module.css';

const WishlistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const sortedItems = [...items].sort((a, b) => {
    if (a.is_reserved === b.is_reserved) return 0;
    return a.is_reserved ? -1 : 1;
  });

  useEffect(() => {
    Promise.all([fetchWishlist(id), fetchWishlistItems(id)])
      .then(([wl, its]) => {
        const list = Array.isArray(its) ? its : (its.items ?? []);
        const unique = list.filter(
          (item, index, self) =>
            index === self.findIndex((i) => i.product?.id === item.product?.id)
        );
        setWishlist(wl);
        setItems(unique);
      })
      .catch((err) => {
        setError(err.status === 404 ? 'Вишлист не найден' : 'Ошибка загрузки');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddItem = async (productId) => {
    const already = items.some((i) => i.product?.id === productId);
    if (already) {
      console.warn('Это желание уже в вишлисте');
      return;
    }
    try {
      const created = await addItem(id, { product_id: productId });
      setItems((prev) => [...prev, created]);
    } catch (err) {
      console.error('Ошибка добавления:', err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const handleReserve = async (itemId, isReserved) => {
    try {
      await reserveItem(itemId, isReserved ? 'unreserve' : 'reserve');
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, is_reserved: !isReserved } : i
        )
      );
    } catch (err) {
      console.error('Ошибка резервирования:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить вишлист?')) return;
    try {
      await deleteWishlist(id);
      navigate('/wishlists');
    } catch (err) {
      console.error('Ошибка удаления вишлиста:', err);
    }
  };

  if (loading) return <div className={styles.state}>Загрузка...</div>;
  if (error) return <div className={styles.state}>{error}</div>;
  if (!wishlist) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/wishlists')}>
          <ArrowLeft size={20} />
          Назад
        </button>

        <div className={styles.info}>
          <h1 className={styles.title}>{wishlist.name}</h1>
          {wishlist.deadline && (
            <span className={styles.deadline}>
              До{' '}
              {new Date(wishlist.deadline).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        <button className={styles.deleteButton} onClick={handleDelete}>
          Удалить вишлист
        </button>
      </div>

      <ul className={styles.grid}>
        {sortedItems.map((item) => (
          <WishlistItem
            key={item.id}
            item={item}
            onRemove={handleRemoveItem}
            onReserve={handleReserve}
          />
        ))}

        <li className={styles.addCard} onClick={() => setIsSelectOpen(true)}>
          <Plus size={32} strokeWidth={1.5} />
          <span>Добавить желание</span>
        </li>
      </ul>

      {items.length === 0 && (
        <p className={styles.empty}>В этом вишлисте пока нет желаний</p>
      )}

      <SelectProductModal
        isOpen={isSelectOpen}
        onClose={() => setIsSelectOpen(false)}
        onSelect={handleAddItem}
        existingProductIds={items.map((i) => i.product?.id).filter(Boolean)}
      />
    </div>
  );
};

export default memo(WishlistPage);
